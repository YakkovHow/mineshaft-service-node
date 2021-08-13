import https from 'https';
import fs from 'fs';
import config from 'config';
import getCerts from '../utils/pkcs12.js';

const plotterConfig = config.get('plotter');
const plotterCerts = (async() => {
    return await getCerts(
        fs.readFileSync(plotterConfig.p12KeyStorePath),
        plotterConfig.p12Password
    );
})();
const plotterIps = (() => {
    var ipMap = new Map();
    var plotterInstances = config.get('plotterInstances');
    for (let instance of plotterInstances) {
        ipMap.set(instance.plotterId, instance.plotterIp);
    }
    return ipMap;
})();

const queryPlotter = async function(plotterId) {
    var certs = await plotterCerts;
    var options = {
        ...plotterConfig,
        ...certs,
        hostname: plotterIps.get(plotterId)
    }
    return new Promise((resolve, reject) => {
        https.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                resolve(JSON.parse(chunk));
            });
        }).end();
    });
}

export default queryPlotter;