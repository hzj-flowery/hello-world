
const PORT = 3000; //访问端口号8888  //端口号最好为6000以上
var http = require('http'); //引入http模块
var querystring = require('querystring')
var fs = require('fs'); //引入fs模块
var url = require('url');//引入url模块
var path = require('path');//引入path模块
var handleRes = require('./action_res').handleRes
var handleAPI = require('./action_api').handleAPI
var handleCloseServer = require('./action_close').handleCloseServer
var handleChat = require('./action_chat').handleChat
var handleListenDownloadFile = require('./action_download').handleListenDownloadFile

var analysisURL = require('./action').analysisURL;

function runCopyRes(){
//   var child = require('child_process');
//   child.exec('ls', function(err, sto) {
//     console.log(sto);//sto才是真正的输出，要不要打印到控制台，由你自己啊
//   })
//   const execFile = child.execFile;
  
//   execFile(path.join(process.cwd() + "/", "center/copyRes.sh"),[],null,function (err, stdout, stderr) {
//     // callback(err, stdout, stderr);
//     console.log(err)
// })
}

//拷贝资源
// runCopyRes();

// req : 从浏览器带来的请求信息
// res : 从服务器返回给浏览器的信息
var server = http.createServer(function (req, res) {
  // console.log(req);
  var pathname = url.parse(req.url).pathname;;
  //客户端输入的url，例如如果输入localhost:8888/index.html，那么这里的url == /index.html
  //url.parse()方法将一个URL字符串转换成对象并返回，通过pathname来访问此url的地址。
  var realPath = path.join(process.cwd() + "/", pathname);
  //完整的url路径
  console.log(realPath);
  var ext = path.extname(realPath);
  ext = ext ? ext.slice(1) : 'unknown';
  
  var result = analysisURL(req.url) 

  handleListenDownloadFile(req,res)

  switch(result)
  {
    case "res":handleRes(res,realPath);break;
    case "api":handleAPI(res,req,realPath);break;
    case "chat":handleChat(res,req,realPath);break;
    case "close":handleCloseServer(res,req,server);break;
    case "copyTitle_bt":
      console.log("copyTitle_bt---------");
      const shell = require('shelljs');
      const util = require('util');
      const child_process = require('child_process')
      // 调用util.promisify方法，返回一个promise,如const { stdout, stderr } = await exec('rm -rf build')
      const exec = util.promisify(child_process.exec);
      const appPath = path.join(__dirname, 'app');
      const runClean = async function () {
      // cwd指定子进程的当前工作目录 这里的rm -rf build为删除指定目录下的一个文件夹
         await exec(`rm -rf d:\\Users\\pc\\Desktop\\share\\layertitle\\bt\\build`, { cwd: appPath });
      }
      runClean();
      break;
    case "copyTitle_ly":
      console.log("copyTitle_ly---------");
      break;
  }
});
server.listen(PORT); //监听端口
console.log('服务成功开启')

