var v8 = require('v8');
var fs = require('fs');
const vm = require('vm')

//从文件中读取字节码
byte_code = fs.readFileSync(__dirname+"/test.jsb");

//运行
var l = byte_code.slice(8, 12).reduce(function (sum, number, power) { return sum += number * Math.pow(256, power);});
var dummyCode =" ".repeat(l);
script = new vm.Script(dummyCode, {cachedData: byte_code});
script.runInThisContext();