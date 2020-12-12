import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { getAllFilePathes, getName, initWorkSpace, readDirectory } from './cocostree/FileSystem';
import { Module } from './cocostree/Module';

initWorkSpace('../luaCode/src');

readDirectory('.');
function writeJsFile(path: any, name: any, code: any) {
    let dir = dirname(path);
    let base = name + '.js'

    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    writeFileSync(join(dir, base), code);
}

function toJs() {
    let modules = getAllFilePathes();
    modules = modules.filter((m: any): boolean => {
        if (m.startsWith('cocos')
            || m.startsWith('app/lang')
            || m.startsWith('yoka/pbc')) {
            return false;
        }

        return true;
    })
    var failCnt = 0;

    modules.forEach((m) => {
        try {
            let module = new Module(m);
            let code = module.toJsAst();
            let name = getName(m);
            let path = resolve('./output', m);
            writeJsFile(path, name, code);
        } catch (error) {
            failCnt++;
            console.log('failed-----', m);
        }
    })
    console.log('total  failed count ------', failCnt);

}

function componentProperty() {
    let modules = getAllFilePathes();
    modules = modules.filter((m: any): boolean => {
        if (m.startsWith('app\\ui\\component')) {
            return true;
        }

        return false;
    })

    let map: any = {}
    modules.forEach((m) => {
        try {
            let module = new Module(m);
            let moduleMap = module.getSeekNode();
            map[m] = moduleMap;
        } catch (error) {
            
        }
        writeFileSync('./output/property.json', JSON.stringify(map))
    })
}
toJs();
//componentProperty();