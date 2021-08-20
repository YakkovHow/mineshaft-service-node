import config from 'config';
import express from 'express';
import * as plotterApis from '../services/chiaPlotterClient.js';
import * as queues from '../services/orderQueues.js';
import * as models from '../../codegen/src/index.js';

const plotterInstances = config.get('plotterInstances');
const router = express.Router();

const parseStream = async (stream) => {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).catch((rej) => {
        console.log(rej);
    });
};

router.get('/query', async (req, res) => {
    console.log('Query received by load balancer');
    var progressPromises = [];
    var progressArr = [];
    for (let instance of plotterInstances) {
        progressPromises = progressPromises.concat(plotterApis.queryProgress(instance.plotterId));
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
    var reqBody = await parseStream(req);
    console.log(`Received plot order request with body: ${reqBody}`);

    var order = models.OrderPlotsWithPublicKeyRequest.constructFromObject(JSON.parse(reqBody));
    var message = JSON.stringify({
        publicKey: order.publicKey,
        amount: order.amount
    });

    await queues.sendMessageToQueue(message, order.prioritize ? queues.fastPassQN : queues.standardQN, (err) => {
        if (err === null) {
            res.status(200).send();
        } else {
            res.status(500).send(err);
        }
    });
});

export default router;