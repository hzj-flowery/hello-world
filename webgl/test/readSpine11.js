let fs = require("fs")

var jsDir = "./";
var tsDir = "../../src/core/renderer/base/spine/source/";
var js_code = fs.readFileSync(jsDir+"spine.js").toString();

//var jsout = js_code.replace(/var\s*(.*.)\s?=\s?\(function\s?\((.*.)?\)\s?\{/gm,"export class $1")

let existClassName = new Array();
		let createInit = function (){
		//([a-zA-Z\{\}]*)
		//
		let reg = /spine\.([a-zA-Z]*)\s?=\s?([a-zA-Z\{\}]*)/gm
		var result;
		var ret = "export namespace sySpine{ \n";
		let importData = "\n";
		while ((result = reg.exec(js_code)) != null) {
			if(existClassName.indexOf(result[1])<0)
			{
				ret = ret + "export var "+result[1]+":" + result[1]+";\n";
			    importData = importData + "import { "+result[1]+" } from "+'"./'+result[1]+'"'+"\n";
			    existClassName.push(result[1]);
			}
		}
		ret = ret +"} \n";
		fs.writeFileSync(tsDir+"init.ts",importData+ret);
}
createInit();

//console.log(existClassName);


//替换构造函数
let handleConstructor = function(className,str){
	//注意：(.*.) 这个可以匹配任何值 但不包含空值
	//有参数
	let targetHasParam = "function\\s?"+className+"\\s?\\((.*.)\\)\\s?\\{";
	//没有参数
	let targetNoParam = "function\\s?"+className+"\\s?\\(\\)\\s?\\{";
	let reqHasParam = eval('/'+targetHasParam+'/gm');
	let reqNoHasParam = eval('/'+targetNoParam+'/gm');
	let replaceContent =  str.replace(reqHasParam,"constructor\($1\){");
	replaceContent =  replaceContent.replace(reqNoHasParam,"constructor\(\){");
	return replaceContent;
}
//处理继承
let handleExtends = function(str){
	let replaceContent =  str.replace(/__extends\((.*.)\);/gm,"");
	//_super.call() -->super
	replaceContent =  replaceContent.replace(/var\s?_this\s?=\s?_super.call\s?\(\s?this\s?,(.*.)\)\s?\|\|\s?this;/gm,"super($1);\n var _this = this;\n");
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
	let replaceContent =  str.replace(req,"public static $2 = $3;\n");
	return replaceContent
}
//处理静态函数
let handleStaticFunction = function(className,str){
	//标准的正则表达式 ^\s*(?!var)\s?(.*.)\.(?!prototype)(.*.)\s?=\s?function\s\((.*.)\)\s\{
    //(?!字符串) 表示不包含某个字符串
	//开头使用^ 表示从行首开始匹配
	let target = "^\\s*(?!var)\\s?"+className+"\\.(?!prototype)(.*.)\\s?=\\s?function\\s\\((.*.)\\)\\s\\{"
	let req = eval('/'+target+'/gm');
	let replaceContent =  str.replace(req,"public static $1\($2\)\{");
	return replaceContent
}
//处理一个类结束以后 删除掉return语句
let handleEndReturn = function(className,str){
	//标准的正则表达式 \s?return\s?(.*.)
	//此处需要注意 ^\s? 这样的使用错误 应该是 ^\s*
	let target = "\\s?return\\s?"+className+"\s?;";
	let req = eval('/'+target+'/gm');
	let replaceContent =  str.replace(req,"");
	return replaceContent
}
//声明本地变量
let handleLocalVariant = function(className,str){
	let localVariant = [];
	let mapVariant = {};
	let reg = /^\s*this\.([a-zA-Z0-9]*)\s?=\s?(.*.)\s?;/gm;
	while ((result = reg.exec(str)) != null) {
		let variantName = result[1];
		let variantValue = result[2];
		localVariant.indexOf(variantName)<0?(localVariant.push(variantName),mapVariant[variantName]=""+variantValue):null;
	}
	let retData = "";
	for(let key in mapVariant)
	{
		let valueType = "any";
		let value = mapVariant[key];
		if(value.match(/new\s?Array/))
		{
			valueType = "Array<any>";
		}
		else if(value=="true"||value=="false")
		{
			valueType = "boolean";
		}
		else if(value.match(/-?[0-9]+\.?[0-9]*/))
		{
			if(!value.match(/[a-zA-Z]/))
			{
				valueType = "number";
			}
			else
			{
				valueType = "any";
			}
		}
		else 
		{
			valueType = "any";
		}
		
		retData = retData +"public "+ key+":"+valueType+";\n";
		
	}
	return retData;
}
//处理当前字符串中是否使用到一些类
let handleSomeLocalImportClass = function(className,str){
	let localExist = [];
	let importUsedData = "";
	existClassName.forEach(function(item){
            let req = eval("/\s*"+"spine\."+item+"\s*/gm");
			let req2 = eval("/\s*"+item+"\s*/gm");
			if(className!=item&&localExist.indexOf(item)<0&&(str.match(req)||str.match(req2)))
			{
				//存在使用这个类
				localExist.push(item);
				
				//删掉不合法的使用
				//spine.Skin--->Skin
				//spine.TwoColorTimeline--->TwoColorTimeline
				let reqNew = eval("/"+"spine\."+item+"/gm");
				console.log(className,reqNew);
				str = str.replace(reqNew,item);
			}
        });
	localExist.forEach(function(item){
		importUsedData = importUsedData+"import { "+item+" } from "+'"./'+item+'"'+"\n";
	});
	return [importUsedData,str];
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
	centerContent = handleStaticFunction(className,centerContent);
	centerContent = handleEndReturn(className,centerContent);
	let localVariant =  handleLocalVariant(className,centerContent);
	let importExtendsData = "";
	let importUsedData = "";
	[importUsedData,centerContent] = handleSomeLocalImportClass(className,centerContent);
	let classHead = "";//类头
	let classFoot = "}\n";//类尾
	if(result[5]&&result[5]!="")
	{
		let extendsClass = result[5].split('.');
		if(extendsClass.length>1)
			extendsClass = extendsClass[1];
		else
			extendsClass = extendsClass[0];
		
		//存在继承
		classHead = "export class "+className+ " extends "+extendsClass+"{\n";
		importExtendsData = "import { "+extendsClass+" } from "+'"./'+extendsClass+'"'+"\n";
	}
    else
	{
		classHead = "export class "+className+"{\n";
	}
	//将字节码写入文件
    fs.writeFileSync(tsDir+className+".ts",importExtendsData+importUsedData+classHead+localVariant+centerContent+classFoot);
}

}
createFile();