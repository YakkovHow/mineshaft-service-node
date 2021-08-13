import config from 'config';
import express from 'express';
import fs from 'fs';
import https from 'https';
import spingRouter from './src/api/sping.js';
import plotterRouter from './src/api/router.js';
import getCerts from './src/utils/pkcs12.js'

const app = express()
const serverConfig = config.get('server');

(async () => {
    app.use(serverConfig.root, spingRouter);
    app.use(serverConfig.root, plotterRouter);

    var certs = await getCerts(
        fs.readFileSync(serverConfig.p12KeyStorePath), 
        serverConfig.p12Password
    );
    https.createServer({
        ...certs,
        ...serverConfig
    }, app).listen(serverConfig.port, () => {
        console.log('MineshaftService started')
    });
})();