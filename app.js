const express = require('express');
const pem = require("pem");
const fs = require('fs');
const https = require('https');
const pingRouter = require('./src/routes/ping');
const plottingRouter = require('./src/routes/plotting');
const app = express()
const port = 16384

const p12 = fs.readFileSync("/home/mineshaft/tls/mss_keystore.p12");

app.use('/internal', pingRouter);
app.use('/internal', plottingRouter);

pem.readPkcs12(p12, { p12Password: "msskeystore" }, (err, res) => {
    if (err !== null) {
        console.log(err);
    }
    https.createServer({
        ...res,
        passphrase: 'msspassword',
        requestCert: true,
        rejectUnauthorized: true
    }, app)
    .listen(port, () => {
        console.log('MineshaftService started')
    })
});