exports.handleChat = function (res,req,realPath) {
    res.writeHead(200, {
        'content-type': 'text/plain'
    });
    res.write('你好 ');
    res.end();
}