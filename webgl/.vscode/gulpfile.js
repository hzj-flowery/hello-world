//引用插件模块
let gulp = require("gulp");
let browserify = require("browserify");
let source = require("vinyl-source-stream");
let header = require('gulp-header');
let tsify = require("tsify");

var workSpaceDir = "../";


//使用browserify，转换ts到js，并输出到bin/js目录
gulp.task("compile", function () {
	
	return browserify({
		basedir: workSpaceDir,
		//是否开启调试，开启后会生成jsmap，方便调试ts源码，但会影响编译速度
		debug: true,
		entries: ['src/Main.ts'],
		cache: {},
		packageCache: {}
	})
		//使用tsify插件编译ts
		.plugin(tsify)
		.bundle()
		//使用source把输出文件命名为bundle.js
		.pipe(source('bundle.js'))
		//给头文件加上这些代码可以实现继承
		.pipe(header(`var __extends = (this && this.__extends) || (function () {
			var extendStatics = function (d, b) {
				extendStatics = Object.setPrototypeOf ||
					({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
					function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
				return extendStatics(d, b);
			};
			return function (d, b) {
				extendStatics(d, b);
				function __() { this.constructor = d; }
				d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
			};
		})();\n`))
		//把bundle.js复制到bin/js目录
		.pipe(gulp.dest(workSpaceDir + "/bin/js"));
});

gulp.task("default",gulp.series('compile'))
