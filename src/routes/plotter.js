const express = require('express');
const https = require('https');
const fs  = require('fs');
const router = express.Router();

router.post('/order', (req, res) => {
    // Mock
    res.status(202).send();
})

router.get('/query', (req, resp) => {
    console.log("Query received by load balancer")
    var options = {
        hostname: '192.168.1.68',
        port: 8443,
        path: '/query',
        method: 'GET',
        key: fs.readFileSync('/home/mineshaft/tls/mss_private.key'),
        cert: fs.readFileSync('/home/mineshaft/tls/mss.crt'),
        ca: fs.readFileSync('/home/mineshaft/tls/rootCA.crt'),
        passphrase: 'msspassword',
        rejectUnauthorized: false
    };

    https.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            resp.json(JSON.parse(chunk));
        });
    }).end()
})

router.post('/query-callback', (req, res) => {
    // Mock
    res.status(202).send();
})

module.exports = router;