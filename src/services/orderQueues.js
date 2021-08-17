import RedisSMQ from 'rsmq';
import config from 'config';

export const rsmq = new RedisSMQ(config.get('redisMessageQueue'));

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

export const standardQueueName = 'standard-queue';
export const fastPassQueueName = 'fast-pass-queue';

export const createQueues = () => {
    // create a queue for standard orders
    rsmq.createQueue({ qname: standardQueueName }, (err) => {
        queueCreationLogging(err, standardQueueName);
    });

    // create a queue for prioritized orders (fast-pass queue)
    rsmq.createQueue({ qname: fastPassQueueName }, (err) => {
        queueCreationLogging(err, fastPassQueueName);
    });
};