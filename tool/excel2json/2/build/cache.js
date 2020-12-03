const fs =require ('fs');
const path = require('path');
const through = require('through2');
const md5Hex = require('md5-hex');
const PluginError = require('plugin-error');

const PLUGIN_NAME = 'ZM_CACHE';

let options;

let contentsMap = {};

function setOptions(opts){
    if (!opts || !opts.directory) {
        return;
    }
    options = Object.assign({}, options, opts || {});
    // 创建缓存存放目录
    let dir = options.directory;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
}

function has(file){
    if (file.isDirectory() || file.isNull()) {
        return false;
    }

    let contents = contentsMap[file.path] 
    if (!contents) {
        contents = contentsMap[file.path] = fs.readFileSync(file.path);
    }

    const filename = md5Hex(contents);
    let result = fs.readdirSync(options.directory).indexOf(filename) !== -1;
    return result
}

function get() {
    return through.obj((file, enc, cb) => {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

		if (file.isStream()) {
			cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return;
		}

        // if (has(file)) {
            file = getFile(file);
        // }

        cb(null, file);
    })
}

function set() {
    return through.obj((file, enc, cb) => {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

		if (file.isStream()) {
			cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return;
        }
        
        // if (!has(file)) {
        setFile(file);
        // }

        cb(null, file);
    })
}

function getFile(file){
    if (!options.directory) {
        cb(new PluginError(PLUGIN_NAME, 'not set directory'));
        return;
    }

    let contents = contentsMap[file.path];
    if (contents) {
        delete contentsMap[file.path];
    } else {
        contents = fs.readFileSync(file.path);
    }

    const filename = md5Hex(contents);
    const filepath = path.join(options.directory, filename);
    const compressed = fs.readFileSync(filepath);
    if (compressed) {
        file.contents = compressed;
    }
    return file;
}

function setFile(file){
    if (!options.directory) {
        cb(new PluginError(PLUGIN_NAME, 'not set directory'));
        return;
    }
    // 缓存写入硬盘
    let contents = contentsMap[file.path];
    if (contents) {
        delete contentsMap[file.path];
    } else {
        contents = fs.readFileSync(file.path);
    }

    let compressed = file.contents;
    const filename = md5Hex(contents);
    const filepath = path.join(options.directory, filename);
    fs.writeFileSync(filepath, compressed);        
}

module.exports = {
    has: has,
    get: get,
    set: set,
    setOptions: setOptions
}