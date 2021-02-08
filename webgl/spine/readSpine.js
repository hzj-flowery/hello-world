let fs = require("fs")

var js_code = fs.readFileSync(__dirname+"/spine.js").toString();

//var jsout = js_code.replace(/var\s*(.*.)\s?=\s?\(function\s?\((.*.)?\)\s?\{/gm,"export class $1")


let createInit = function (){
let reg = /spine.([a-zA-Z]*)\s?=\s?([a-zA-Z]*);/gm
var result;
var ret = "export namespace sySpine{ \n";
let importData = "\n";
while ((result = reg.exec(js_code)) != null) {
	ret = ret + "export var "+result[1]+":" + result[1]+";\n";
	importData = importData + "import { "+result[1]+" } from "+'"./'+result[1]+'"'+"\n";
}
ret = ret +"} \n";
//将字节码写入文件
fs.writeFileSync(__dirname+"/out/init.ts",importData+ret);
}
createInit();

//替换构造函数
let handleConstructor = function(className,str){
	let target = "function\\s?"+className+"\\s?\\((.*.)\\)\\s?\\{";
	let req = eval('/'+target+'/gm')
	let replaceContent =  str.replace(req,"constructor\($1\){");
	return replaceContent;
}
//处理继承
let handleExtends = function(str){
	let replaceContent =  str.replace(/__extends\((.*.)\);/gm,"");
	return replaceContent;
}
//处理原型函数
let handlePrototype = function(className,str){
	let target = className+"\\.prototype\\.(\\S*)\\s?=\\s?function\\s\\(";
	let req = eval('/'+target+'/gm');
	let replaceContent =  str.replace(req,"public $1\(");
	return replaceContent
}
//处理静态变量
let handleStaticVariant = function(className,str){
	let target = "^([\\s]*)"+className+"\\.(\\S*)\\s?=\\s(.*.);\\s?";
	let req = eval('/'+target+'/gm');
	console.log(req);
	let replaceContent =  str.replace(req,"public static $2 = $3;\n");
	return replaceContent
}
//处理静态函数
let handleStaticFunction = function(className,str){
	let target = className+".(\\S*)\\s?=\\s?function\\s\\(";
	let req = eval('/'+target+'/gm');
	let replaceContent =  str.replace(req,"public $1\(");
	return replaceContent
}
let createFile = function(){
	let reg = /var\s*(\S*)\s?=\s?\(function\s?\((.*.)?\)\s?\{\s?((.|\n|\r)*?)\}\s?\((.*.)?\)\);/gm
var result;
while ((result = reg.exec(js_code)) != null) {
    //console.log("结果是：" + result[0] + "");
	//console.log("$1是：" + result[1] + "");
	//console.log("$2是：" + result[2] + "");
	
	let className = result[1];
	let centerContent = handleConstructor(className,result[3]);
	centerContent = handleExtends(centerContent);
	centerContent = handlePrototype(className,centerContent);
	centerContent = handleStaticVariant(className,centerContent);
	let content = "";
	if(result[5]&&result[5]!="")
	   content = "export class "+className+ " extends "+result[5]+"{\n"+centerContent+"}";
    else
	   content = "export class "+className+ "{\n"+centerContent+"}";
	//将字节码写入文件
fs.writeFileSync(__dirname+"/out/spine/"+className+".ts",content);
}

}
createFile();