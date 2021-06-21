exports.handleCloseServer = function (res,req,server) {
    res.writeHead(200, {
        'content-type': 'text/plain'
    });
    res.write('关闭服务器成功');
    res.end();
    server.close()
}