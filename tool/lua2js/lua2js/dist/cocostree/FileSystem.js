"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var workspace;
var path2name = {};
var name2path = {};
function readDirectory(dir) {
    if (!path_1.isAbsolute(dir)) {
        dir = path_1.join(workspace, dir);
    }
    var files = fs_1.readdirSync(dir);
    files.forEach(function (f) {
        var path = path_1.join(dir, f);
        var info = fs_1.statSync(path);
        if (info.isDirectory()) {
            readDirectory(path);
        }
        else if (path_1.extname(path) === '.lua') {
            var name_1 = path_1.basename(path, '.lua');
            var i = 0;
            var real = name_1;
            while (name2path[real]) {
                i++;
                real = name_1 + '_' + i;
            }
            path = path_1.relative(workspace, path);
            path2name[path] = real;
            name2path[real] = path;
        }
        else {
            console.warn('unsupported file', f);
        }
    });
}
exports.readDirectory = readDirectory;
function getWorkSpace() {
    return workspace;
}
exports.getWorkSpace = getWorkSpace;
function initWorkSpace(dir) {
    workspace = path_1.resolve(dir);
}
exports.initWorkSpace = initWorkSpace;
function getFilePath(luaPath, modulePath) {
    var names;
    if (luaPath[0] === '.') {
        var start = 1;
        if (luaPath[1] === '.') {
            start = 2;
        }
        var path_2 = luaPath.slice(start);
        var prefix = luaPath.slice(0, start);
        names = path_2.split('.');
        names.unshift(prefix);
        names.unshift(path_1.dirname(modulePath));
        names.unshift(workspace);
    }
    else {
        names = luaPath.split('.');
        names.unshift(workspace);
    }
    var path = path_1.join.apply(null, names) + '.lua';
    return path;
}
exports.getFilePath = getFilePath;
function getName(file) {
    if (path_1.isAbsolute(file)) {
        file = path_1.relative(workspace, file);
    }
    return path2name[file];
}
exports.getName = getName;
function getModuleName(luaModule, modulePath) {
    var path = getFilePath(luaModule, modulePath);
    var name = getName(path);
    return name || luaModule;
}
exports.getModuleName = getModuleName;
function getAllFilePathes() {
    return Object.keys(path2name);
}
exports.getAllFilePathes = getAllFilePathes;
function readFileContent(path) {
    path = path_1.resolve(workspace, path);
    return fs_1.readFileSync(path, 'utf8');
}
exports.readFileContent = readFileContent;
//# sourceMappingURL=FileSystem.js.map