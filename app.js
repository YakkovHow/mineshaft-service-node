const express = require('express');
const fs = require('fs');
const https = require('https');
const pingRouter = require('./src/routes/ping');
const plottingRouter = require('./src/routes/plotting');
const app = express()
const port = 16384

var certificate = fs.readFileSync('resource/mssCA.crt');
var opts = { 
    key: fs.readFileSync('resource/mss_private.key'),
    cert: certificate,
    passphrase: 'msspassword',
    requestCert: true,
    rejectUnauthorized: true,
    ca: [ certificate ]
};

app.use('/internal', pingRouter);
app.use('/internal', plottingRouter);

https.createServer(opts, app).listen(port, () => {
    console.log('MineshaftService started')
})