var fs = require('fs'); //引入fs模块

/**
 * 主要处理下载任务
 */
exports.handleAPI = function (res,req,realPath) {
    res.writeHead(200, {
        'content-type': 'text/plain'
    });
    res.write('你好 ');
    res.end();
}
/**
 * 监听下载文件的变化
 */
exports.handleListenDownloadFile = function(req,res) {
    var postData = ""; 
    // 数据块接收中
    req.addListener("data", function (postDataChunk) {
        postData += postDataChunk;
    });
    // 数据接收完毕，执行回调函数
    req.addListener("end", function () {
        fs.writeFile("temp.json",postData,function (error) {
          if (error) {
            console.log('写入失败')
          } else {
            console.log('写入成功了')
          }
        })
    });
}