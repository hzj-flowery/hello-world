import { readdirSync, statSync, readFileSync } from "fs";
import { join, extname, relative, resolve, isAbsolute, basename, dirname } from "path";

let workspace: string
let path2name: {[key: string]: string} = {}
let name2path: {[key: string]: string} = {}

export function readDirectory(dir: string) {
    if (!isAbsolute(dir)) {
        dir = join(workspace, dir);
    }

    let files = readdirSync(dir);
    files.forEach((f) => {
        let path = join(dir, f);
        let info = statSync(path);
        if (info.isDirectory()) {
            readDirectory(path);
        } else if (extname(path) === '.lua') {
            let name = basename(path, '.lua');
            let i = 0;
            let real = name;
            while (name2path[real]) {
                i++;
                real = name + '_' + i;
            }

            path = relative(workspace, path);
            path2name[path] = real;
            name2path[real] = path;
        } else {
            console.warn('unsupported file', f);
        }
    })
}

export function getWorkSpace(): string {
    return workspace;
}

export function initWorkSpace(dir: string) {
    workspace = resolve(dir);
}

export function getFilePath(luaPath: string, modulePath: string): string {
    let names: string[];
    if (luaPath[0] === '.') {
        let start = 1;
        if (luaPath[1] === '.') {
            start = 2;
        }
        let path = luaPath.slice(start);
        let prefix = luaPath.slice(0, start);
        names = path.split('.');
        names.unshift(prefix);
        names.unshift(dirname(modulePath));
        names.unshift(workspace);
    } else {
        names = luaPath.split('.');
        names.unshift(workspace);
    }

    let path = join.apply(null, names) + '.lua';
    return path;
}

export function getName(file: string): string {
    if (isAbsolute(file)) {
        file = relative(workspace, file);
    }
    return path2name[file];
}

export function getModuleName(luaModule: string, modulePath: string): string {
    let path = getFilePath(luaModule, modulePath);
    let name = getName(path);

    return name || luaModule
}

export function getAllFilePathes(): string[] {
    return Object.keys(path2name);
}

export function readFileContent(path: string): string {
    path = resolve(workspace, path);
    return readFileSync(path, 'utf8');
}