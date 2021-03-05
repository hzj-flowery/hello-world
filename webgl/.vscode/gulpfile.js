//引用插件模块
let gulp = require("gulp");
let browserify = require("browserify");
let source = require("vinyl-source-stream");
let tsify = require("tsify");
var workSpaceDir = "../";


//使用browserify，转换ts到js，并输出到bin/js目录
gulp.task("compile", function () {

	return browserify({
		basedir: workSpaceDir,
		//是否开启调试，开启后会生成jsmap，方便调试ts源码，但会影响编译速度
		debug: true,
		entries: ['./src/Main.ts'],
		cache: {},
		packageCache: {}
	})
		//使用tsify插件编译ts
		.plugin(tsify)
		.bundle()
		//使用source把输出文件命名为bundle.js
		.pipe(source('bundle.js'))
		//把bundle.js复制到bin/js目录
		.pipe(gulp.dest(workSpaceDir + "/bin/js"));
});

gulp.task("glsl", done =>  {
	var tokenString = require('glsl-tokenizer/string')
	var tokenStream = require('glsl-tokenizer/stream')
	var glsl = require('glslify')
	var fs = require('fs')

	var descope = require('glsl-token-descope')
	var stringify = require('glsl-token-string')

	// Synchronously:
	// var tokens = tokenString(fs.readFileSync(workSpaceDir + 'bin/res/glsl/vs.glsl'));
	// //给shader代码中的所有变量名加一个前缀
    // console.log(stringify(descope(tokens, function (name) {
	// 	return "a_" + name;
	// })))
	
	//shader代码中可能存在模块调用，将用到的模块合并进来
	var sourceCode = glsl.file(workSpaceDir + 'bin/res/glsl/input.glsl');
	console.log("合并后的代码---",sourceCode);
    done();

	// Streaming API:
	// fs.createReadStream(workSpaceDir+'bin/glsl/vs.glsl')
	// 	.pipe(tokenStream())
	// 	.on('data', function (token) {
	// 		console.log(token.data, token.position, token.type)
	// 	})
})

gulp.task("default", gulp.series('compile','glsl'))
