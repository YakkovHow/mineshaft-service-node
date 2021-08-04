const express = require('express');
const pem = require("pem");
const fs = require('fs');
const https = require('https');
const spingRouter = require('./src/routes/sping');
const plotterRouter = require('./src/routes/plotter');
const app = express()
const port = 16384

const p12 = fs.readFileSync('/home/mineshaft/tls/msf_keystore.p12');

app.use('/internal', spingRouter);
app.use('/internal', plotterRouter);

pem.readPkcs12(p12, { p12Password: 'msfkeystore' }, (err, res) => {
    if (err !== null) {
        console.log(err);
    }
    https.createServer({
        ...res,
        ca: res.ca[0],
        requestCert: true,
        rejectUnauthorized: true
    }, app)
    .listen(port, () => {
        console.log('MineshaftService started')
    });
});