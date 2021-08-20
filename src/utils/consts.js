import config from 'config';

export const plotterIps = (() => {
    var ipMap = new Map();
    var plotterInstances = config.get('plotterInstances');
    for (let instance of plotterInstances) {
        ipMap.set(instance.plotterId, instance.plotterIp);
    }
    return ipMap;
})();