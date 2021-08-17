import config from 'config';
import express from 'express';
import * as plotterApis from '../services/chiaPlotterApis.js';
import * as queues from '../services/orderQueues.js';
import * as models from '../../codegen/src/index.js';

const plotterInstances = config.get('plotterInstances');
const router = express.Router();

const parseBody = async (stream) => {
    let buffers = [];
    for await (let chunk of stream) {
        buffers.push(chunk);
    }
    return Buffer.concat(buffers).toString();
};

router.get('/query', async (req, res) => {
    console.log('Query received by load balancer');
    var progressPromises = [];
    var progressArr = [];
    for (let instance of plotterInstances) {
        progressPromises = progressPromises.concat(plotterApis.queryPlotter(instance.plotterId));
    }
    for (let promise of progressPromises) {
        progressArr = progressArr.concat(await promise);
    }
    res.json(models.QueryPlottingProgressResponse.constructFromObject({
        allProgress: progressArr
    }));
});

router.post('/query-callback', (req, res) => {
    // Mock
    res.status(202).send();
});

router.post('/order', async (req, res) => {
    var reqBody = await parseBody(req);
    console.log(`Received plot order request with body: ${reqBody}`);

    var order = models.OrderPlotsWithPublicKeyRequest.constructFromObject(JSON.parse(reqBody));
    var message = JSON.stringify({
        publicKey: order.publicKey,
        amount: order.amount
    });

    queues.rsmq.sendMessage({
        qname: queues.standardQueueName,
        message: message
    }, (err) => {
        if (err === null) {
            console.log(`Successfully sent message ${message} to queue: ${queues.standardQueueName}`)
            res.status(202).send();   
            return;
        }
        var errMsg = `Failed to send message: ${order} to queue: ${queues.standardQueueName}, details: ${err}`;
        console.error(errMsg);
        res.status(500).send(errMsg);
    });
});

router.post('/prioritized-order', (req, res) => {
    // Mock
    res.status(202).send();
});

export default router;