"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var FileSystem_1 = require("./cocostree/FileSystem");
var Module_1 = require("./cocostree/Module");
FileSystem_1.initWorkSpace('../luaCode/src');
FileSystem_1.readDirectory('.');
function writeJsFile(path, name, code) {
    var dir = path_1.dirname(path);
    var base = name + '.js';
    if (!fs_1.existsSync(dir)) {
        fs_1.mkdirSync(dir, { recursive: true });
    }
    fs_1.writeFileSync(path_1.join(dir, base), code);
}
function toJs() {
    var modules = FileSystem_1.getAllFilePathes();
    modules = modules.filter(function (m) {
        console.log("m---------", m);
        if (m.startsWith('cocos')
            || m.startsWith('app/lang')
            || m.startsWith('yoka/pbc')) {
            return false;
        }
        return true;
    });
    var failCnt = 0;
    modules.forEach(function (m) {
        try {
            var module_1 = new Module_1.Module(m);
            var code = module_1.toJsAst();
            var name_1 = FileSystem_1.getName(m);
            var path = path_1.resolve('./output', m);
            writeJsFile(path, name_1, code);
        }
        catch (error) {
            failCnt++;
            console.log('failed-----', m);
        }
    });
    console.log('total  failed count ------', failCnt);
}
function componentProperty() {
    var modules = FileSystem_1.getAllFilePathes();
    modules = modules.filter(function (m) {
        if (m.startsWith('app\\ui\\component')) {
            return true;
        }
        return false;
    });
    var map = {};
    modules.forEach(function (m) {
        try {
            var module_2 = new Module_1.Module(m);
            var moduleMap = module_2.getSeekNode();
            map[m] = moduleMap;
        }
        catch (error) {
        }
        fs_1.writeFileSync('./output/property.json', JSON.stringify(map));
    });
}
toJs();
//componentProperty();
//# sourceMappingURL=index.js.map