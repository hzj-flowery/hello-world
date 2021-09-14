var fs = require('fs');
var OBJ = require('webgl-obj-loader');

onmessage = function (e) {
  if (e.data.msg == 'start') {
    start();
  } else if (e.data.msg == 'end') {
    console.log("收到结束的消息");
  }
}
var meshPath = './res/models/windmill/windmill.obj';
var opt = { encoding: 'utf8' };

var start = function (params) {
  fs.readFile(meshPath, opt, function (err, data){
    if (err) return console.error(err);
    console.log("加载成功啦");
    var mesh = new OBJ.Mesh(data);
    postMessage({ mesh: mesh }, [mesh]);
  });
}
 

 
