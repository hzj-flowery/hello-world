const http = require('http')
const querystring = require('querystring')
const crypto = require('crypto');

const token = "M91^7P@o3T0C@0Z^N0Mr@wC53R$1u&qB"
const signMethod = 'sha1';
const HOST = "zmddzapi.rzcdz2.com"
const PORT = 80;
const PATH = "/api/remote/cmd"

module.exports = function (cmd, options) {
    return new Promise((resolve, reject) => {

        let command = Buffer.from(JSON.stringify({ cmd: cmd, options: options })).toString('base64');

        let timestamp = Date.now();

        let contents = querystring.stringify({
            timestamp: timestamp,
            content: command,
            sign: crypto.createHmac(signMethod, token).update(command + timestamp).digest('hex')
        });

        let request = http.request({
            protocol: "http:",
            host: HOST,
            port: PORT,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': contents.length
            },
            path: PATH
        }, (res) => {
            let data = "";
            res.setEncoding('utf8');
            res.on('data', function (d) {
                data += d;
            });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(data);
                } else {
                    resolve(data);
                }
            })
        })

        request.write(contents);
        request.end();
    })

}
