import pem from 'pem';

const getCerts = async (p12, password) => {
    return new Promise((resolve, reject) => {
        pem.readPkcs12(p12, { p12Password: password }, (err, certs) => {
            if (err) return reject(err);
            var cafile = certs.ca[0];
            certs.ca = cafile;
            resolve(certs);
        });
    });
}

export default getCerts;