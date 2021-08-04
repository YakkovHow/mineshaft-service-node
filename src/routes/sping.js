var express = require('express');
var router = express.Router();

router.get('/sping', (req, res) => {
    res.send('Message received by node load balancer');
})

module.exports = router;