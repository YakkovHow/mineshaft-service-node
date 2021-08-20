import config from 'config';
import cron from 'node-cron';
import * as queues from './orderQueues.js';

const pipeConfig = config.get('redisMessageQueue');
const defaultErrorMsg = 'Unexpected error during pipe fulfilling process.';
const expectedSize = pipeConfig.expectedPipeSize;
const cronPattern = pipeConfig.pipeCheckCronPattern;

const sendFromOrderQueueToPipe = async (message) => {
    var item = JSON.stringify({ publicKey: message.publicKey });
    console.log(`Putting ${message.amount} plot orders into pipe`);

    for (let i = 0; i < message.amount; i++) {
        queues.sendMessageToQueue(
            item, queues.mssToPlottersPipeQN, (err) => {
                if (err !== null) console.log(defaultErrorMsg);
            }
        );
    }
};

const fulfillPipe = async (checkFPQ) => {
    var pipeAttr = await queues.rsmq.getQueueAttributesAsync({ qname: queues.mssToPlottersPipeQN });
    if (pipeAttr.msgs >= expectedSize) {
        console.log(`Fulfilling pipe completed. Current pipe size: ${pipeAttr.msgs}`);
        return;
    }

    var nextOrder = null;
    if (checkFPQ) {
        nextOrder = await queues.popMessageFromQueue(queues.fastPassQN, (err) => {
            if (err !== null) console.log(defaultErrorMsg);
        });
        if (!nextOrder.id) {
            await fulfillPipe(false);
            return;
        }
    } else {
        nextOrder = await queues.popMessageFromQueue(queues.standardQN, (err) => {
            if (err !== null) console.log(defaultErrorMsg);
        });
        if (!nextOrder.id) {
            console.log(`No more orders in queue. Skipping fulfilling. Current pipe size: ${pipeAttr.msgs}`);
            return;
        }
    }
    await sendFromOrderQueueToPipe(JSON.parse(nextOrder.message));
    await fulfillPipe(checkFPQ);
};

export const init = () => {
    // Check pipe per 5 minutes
    cron.schedule(cronPattern, () => {
        fulfillPipe(true);
    });
};