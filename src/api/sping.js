import express from 'express';

const router = express.Router();

router.get('/sping', (req, res) => {
    res.send('Message received by node load balancer');
});

export default router;