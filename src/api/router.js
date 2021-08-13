import config from 'config';
import express from 'express';
import queryPlotter from '../services/chiaPlotterApis.js';
import * as models from '../../codegen/src/index.js';

const plotterInstances = config.get('plotterInstances');
const router = express.Router();

router.get('/query', async (req, res) => {
    console.log('Query received by load balancer');
    var progressPromises = [];
    var progressArr = [];
    for (let instance of plotterInstances) {
        progressPromises = progressPromises.concat(queryPlotter(instance.plotterId));
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

router.post('/order', (req, res) => {
    // Mock
    res.status(202).send();
});

export default router;