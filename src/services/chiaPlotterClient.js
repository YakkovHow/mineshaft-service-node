import https from 'https';
import fs from 'fs';
import config from 'config';
import * as p12 from '../utils/pkcs12.js';
import * as consts from '../utils/consts.js';

const plotterConfig = config.get('plotter');
const plotterCerts = (async () => {
    return await p12.getCerts(
        fs.readFileSync(plotterConfig.p12KeyStorePath),
        plotterConfig.p12Password
    );
})();

const callPlotterWithIdAndPath = async (plotterId, path, operation) => {
    var certs = await plotterCerts;
    var options = {
        ...plotterConfig,
        ...certs,
        path: path,
        hostname: consts.plotterIps.get(plotterId)
    };
    return new Promise((resolve, reject) => {
        https.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                resolve(JSON.parse(chunk));
            });
        }).on('error', (err) => {
            console.error(`Failed to ${operation} from plotter with id: ${plotterId}`);
            reject(err);
        }).end();
    }).catch((rej) => {
        console.log(rej);
    });
};

export const queryProgress = async (plotterId) => {
    return callPlotterWithIdAndPath(plotterId, plotterConfig.queryProgressPath, 'queryProgress');
};