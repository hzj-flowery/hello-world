const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const copyFileAsync = promisify(fs.copyFile);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

const JSON_EXT = '.json';

let project = process.argv[2];
if (!project) {
    console.error('please set project directory!');
    return;
}

project = path.resolve(process.cwd(), project);
let resourcesDir = process.argv[3];
if (!resourcesDir) {
    console.error('please set resources directory!');
    return;
}
resourcesDir = path.resolve(process.cwd(), resourcesDir);

let out = process.argv[4] || 'dist';
out = path.resolve(process.cwd(), out);

let files = fs.readdirSync(project).filter((f) => {
    return path.extname(f) == JSON_EXT;
});

files.forEach(async (f) => {
    let file = path.join(project, f);
    let content = await readFileAsync(file, 'utf8');
    let resources = JSON.parse(content).filter((v) => {
        return !!v;
    });

    let dir = path.join(out, path.basename(f, JSON_EXT));
    resources.forEach(async (res) => {
        let url;
        switch (res.type) {
            case 'cc.AudioClip':
                url = res.path + '.mp3';
                break;
            case 'cc.BufferAsset':
                url = res.path + '.bin';
                break;
            case 'cc.Prefab':
                url = res.path + '.prefab';
                break;
            case 'cc.JsonAsset':
                url = res.path + '.json';
                break;
            case 'cc.SpriteAtlas':
                url = [
                    res.path + '.png',
                    res.path + '.plist'
                ];
                break;
            case 'cc.LabelAtlas':
                url = res.path + '.labelatlas';
                break;
            case 'cc.ParticleAsset':
                url = res.path + '.plist';
                break;
            case 'cc.BitmapFont':
                url = res.path + '.fnt';
                break;
            case 'cc.Texture2D':
            case 'cc.SpriteFrame':
                let png = path.join(resourcesDir, res.path + '.png');
                let jpg = path.join(resourcesDir, res.path + '.jpg');
                if (fs.existsSync(png)) {
                    url = res.path + '.png'
                } else if (fs.existsSync(jpg)) {
                    url = res.path + '.jpg'
                }
                break;
            default:
                console.error('unknown type:', res.type);
                break;
        }

        if (!url) {
            console.error('unknown url:', res.path);
            return;
        }
        if (Array.isArray(url)) {
            url.forEach(async (u) => {
                let dest = path.join(dir, u);
                await mkdirAsync(path.dirname(dest), { recursive: true });
                await copyFileAsync(path.join(resourcesDir, u), dest);
            })
        } else {
            let dest = path.join(dir, url);
            await mkdirAsync(path.dirname(dest), { recursive: true });
            await copyFileAsync(path.join(resourcesDir, url), dest);
        }
    });
})