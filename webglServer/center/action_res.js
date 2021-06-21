var mine = require('./mine').types;
var fs = require('fs'); //引入fs模块
var path = require('path');//引入path模块
/**
 * 
 * @param {*} res 
 * @param {*} realPath 资源路径
 */
exports.handleRes = function (res, realPath) {
    fs.readFile(realPath, function (err, data) {
        if (err) {
            //未找到文件
            res.writeHead(404, {
                'content-type': 'text/plain'
            });
            res.write('404,页面不在');
            res.end();
        } else {
            var ext = path.extname(realPath);
            ext = ext ? ext.slice(1) : 'unknown';

            var contentType = mine[ext] || "text/plain";
            //成功读取文件
            res.writeHead(200, {
                'Content-Type': contentType
            });
            res.write(data, "binary");
            res.end();
        }
    })
}