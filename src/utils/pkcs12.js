import pem from 'pem';

export const getCerts = async (keyStore, password) => {
    return new Promise((resolve, reject) => {
        pem.readPkcs12(keyStore, { p12Password: password }, (err, certs) => {
            if (err) return reject(err);
            var cafile = certs.ca[0];
            certs.ca = cafile;
            resolve(certs);
        });
    }).catch((rej) => {
        console.log(rej);
    });
};