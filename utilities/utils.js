const request = require('superagent');

let utils = {};

utils.apir = function (data) {
    return new Promise((resolve, reject) => {
        var req = request
        data.method = data.method.toLowerCase();

        req = req[data.method](data.host + data.endpoint);
        req = data.query ? req.query(data.query) : req
        req = data.auth ? req.auth(data.auth.username, data.auth.password) : req;
        req = data.requestBody ? req.send(data.requestBody) : req;
        req = data.filePath ? req.attach(data.filePath) : req;
        req = data.headers ? req.set(data.headers) : req;
        req.end((error, res) => {
            resolve(res);
        });
    });
}

module.exports = utils