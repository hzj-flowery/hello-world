const fs = require('fs')
var data = {
  "name": "self",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "bin": {
    "self": "Kernel.js"
  },
  "scripts": {
    "test": "dev"
  },
  "keywords": [
    "123456"
  ],
  "author": "hzj",
  "license": "ISC",
  "dependencies": {
    "@types/jquery": "^3.5.1",
    "browserify": "^16.5.2",
    "gulp": "^4.0.2",
    "gulp-header": "^2.0.9",
    "tsify": "^5.0.1",
    "typescript": "^3.9.7",
    "vinyl-source-stream": "^2.0.0",
    "yargs": "^15.4.1"
  },
  "devDependencies": {
    "tern": "^0.24.3"
  }
}
var letJsonData = JSON.stringify(data);

var buf = new ArrayBuffer(letJsonData.length*4);
var float32Arr = new Float32Array(buf);
var codeArr = []; 
for(let j = 0;j<letJsonData.length;j++)
{
  codeArr.push(letJsonData.charCodeAt(j));
}
codeArr.forEach((val,i)=>{
  float32Arr[i] = val;
})
fs.writeFileSync('../bin/res/test/data.bin', Buffer.from(buf)); // data.bin
console.log("文件生成成功!");

var str = 
'console.log("zhangman")'
eval(str)