import RedisSMQ from 'rsmq';
import config from 'config';

export const rsmq = new RedisSMQ({
    ...config.get('redisMessageQueue'),
    password: process.env.REDIS_DEFAULT_PASSWORD
});

const queueCreationLogging = (err, queueName) => {
    if (err) {
        // if the error is `queueExists` we can keep going as it tells us that the queue is already there
        if (err.name !== "queueExists") {
            console.error(err);
            return;
        } else {
            console.log(`Rsmq named '${queueName}' already exists... resuming...`);
        }
    } else {
        console.log(`Created rsmq named '${queueName}'`);
    }
}

export const standardQN = 'standard-queue';
export const fastPassQN = 'fast-pass-queue';
export const mssToPlottersPipeQN = 'mss-to-plotter-pipe';

export const createQueues = async () => {
    // create a queue for standard orders
    rsmq.createQueue({ qname: standardQN }, (err) => {
        queueCreationLogging(err, standardQN);
    });

    // create a queue for prioritized orders (fast-pass queue)
    rsmq.createQueue({ qname: fastPassQN }, (err) => {
        queueCreationLogging(err, fastPassQN);
    });

    // create a queue for the cached orders that about to be processed
    rsmq.createQueue({ qname: mssToPlottersPipeQN }, (err) => {
        queueCreationLogging(err, mssToPlottersPipeQN);
    });
};

export const sendMessageToQueue = async (message, queueName, callback) => {
    return new Promise((resolve, reject) => {
        rsmq.sendMessage({
            qname: queueName,
            message: message
        }, (err, resp) => {
            if (err === null) {
                console.log(`Successfully sent message ${message} to queue: ${queueName}`);
                resolve(resp);
            } else {
                console.error(`Failed to send message: ${message} to queue: ${queueName}, details: ${err}`);
                reject(err);
            }
            callback(err);
        });
    }).catch((rej) => {
        console.error(`Failed to receive message from queue: ${queueName}, details: ${rej}`);
    });
};

export const popMessageFromQueue = async (queueName, callback) => {
    return new Promise((resolve, reject) => {
        rsmq.popMessage({ qname: queueName }, (err, resp) => {
            if (err === null) {
                if (resp.id) {
                    console.log(`Successfully received message with id: ${resp.id} from queue: ${queueName}`);
                } else {
                    console.log(`Order queue ${queueName} is empty`);
                }
                resolve(resp);
            } else {
                reject(err);
            }
            callback(err);
        });
    }).catch((rej) => {
        console.error(`Failed to receive message from queue: ${queueName}, details: ${rej}`);
    });
};