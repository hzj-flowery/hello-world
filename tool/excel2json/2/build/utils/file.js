const path = require('path');
const fs = require('fs');

let project;
let out;
let settingsName;
let codeName;
function setProject(p) {
    project = p;
    getSettingFile()
}

function getSettingFile() {
    if (settingsName) {
        return settingsName;
    }

    let dir = path.join(project, 'src')
    let files = fs.readdirSync(dir);
    for (let i = 0; i < files.length; i++) {
        let file = files[i]
        if (/settings.(\w+.)?js/.test(file)) {
            settingsName = path.join(dir, file);
            return file;
        }
    }
}

function getCodeFile(bundle, remote) {
    if (remote) {
        return path.join(out, 'src', 'scripts', bundle, 'index.js')
    } else {
        return path.join(out, 'assets', bundle, 'index.js');
    }
}


function getProject() {
    return project;
}

function setOut(o) {
    out = o
}

function getOut() {
    return out;
}

function getImportFile(name) {
    let dir = name.substr(0, 2);
    return path.join(project, 'res', 'import', dir, name);
}

function getConfigFile() {
    return path.join(out, 'src', 'config.js');
}

function ensureDir(dir) {
    let exist = fs.existsSync(dir)
    if (!exist) {
        fs.mkdirSync(dir, {recursive: true})
    }
}


module.exports = {
    setProject: setProject,
    getProject: getProject,
    setOut: setOut,
    getOut: getOut,
    getImportFile: getImportFile,
    getSettingFile: getSettingFile,
    getCodeFile: getCodeFile,
    getConfigFile: getConfigFile,
    ensureDir: ensureDir,
}