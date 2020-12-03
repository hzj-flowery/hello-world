const path = require('path');
const fs = require('fs');
const os = require('os');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin')
const pngquant = require('imagemin-pngquant')
const del = require('del');
const zip = require('gulp-zip');
const {exec} = require('child_process');
const filter = require('gulp-filter');
const gulpIf = require('gulp-if');
const lazypipe = require('lazypipe');
const minicli = require('miniprogram-ci');

const config = require('./config');

const cache = require('./cache');
const Bundle = require('./utils/assets');
const fileUtils = require('./utils/file');
const resize = require('./resize')
const sliceCode = require('./slice_code');
const lengthHead = require('./lengthhead');
const { ensureDir } = require('./utils/file');
const remoteCmd = require('./remote-cmd');

const RemoteDir = 'zm-104 sftp (118.25.54.105)/root/data/www/game/mingjiangzhuan/test/remote'

const imageExts = ["png", "jpg", "jpeg"];

const DEST_MAIN = 'resources'

function imageTask(bundle, scale) {
    let dir = bundle.getBundleDir();
    let srcs = [
        path.join(dir, `**/*.@(${imageExts.join('|')})`),
    ]

    let filterImages = filter(f => {
        return config.filterImages.indexOf(path.basename(f.path).split('.')[0]) < 0
    }, {restore: true})

    cache.setOptions({
        directory: path.join(os.homedir(), config.cacheTag, 'image', config.gameName)
    })

    let compress = lazypipe().pipe(() => {
            return imagemin([
            pngquant({ speed: 1, quality: [0, 0.2], dithering: false }),
            imagemin.mozjpeg({ quality: 75, progressive: false }),
            imagemin.gifsicle(),
            imagemin.svgo(),
        ], {verbose: true})
    }).pipe(cache.set)

    return new Promise((resolve, reject) => {
        gulp.src(srcs, { base: dir })
            .pipe(resize(scale, bundle))
            .pipe(filterImages)
            .pipe(gulpIf((f) => {
                return cache.has(f)
            }, cache.get(), compress()))
            .pipe(filterImages.restore)
            .pipe(gulp.dest(dir))
            .on('data', () => {

            })
            .on('end', () => {
                console.log(bundle.name, 'complete');
                resolve();
            })
            .on('error', reject)
    })
}

function writeGameJson(packagesCnt) {
    let filePath = path.join(fileUtils.getOut(), 'game.json');
    let json = fs.readFileSync(filePath, 'utf8');
    json = JSON.parse(json);
    json.networkTimeout = {
        "request": 5000,
        "connectSocket": 5000,
        "uploadFile": 5000,
        "downloadFile": 10000
    }
    json.subpackages = [];

    for (let i = 0; i < packagesCnt; i++) {
        json.subpackages.push({
            "name": `${i}`,
            "root": `subpackages/${i}/`
        });
    }

    json.workers = "workers";

    fs.writeFileSync(filePath, JSON.stringify(json));
}

function copyToSource(project, out) {
    return new Promise((resolve, reject) => {
        gulp.src(path.join(project, '**/*'))
            .pipe(gulp.dest(out, { overwrite: false }))
            .on('finish', resolve)
            .on('error', reject)
    })
}

function writeSubpackage(dir, code) {
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'game.js'), code)
}

function sliceCodeToSubpackages(src, output) {
    let codes = sliceCode(src);
    let subpackageDir = path.join(output, 'subpackages')
    ensureDir(subpackageDir);

    let subpackagesCnt = codes.length - 1;

    for (let i = 0; i < subpackagesCnt; i++) {
        let dir = path.join(subpackageDir, ''+i);
        writeSubpackage(dir, codes[i])
    }

    fs.writeFileSync(src, codes[codes.length - 1])

    return subpackagesCnt;
}

function getSettingPath(dir) {
    return path.join(dir, 'src', 'settings.js');
}

function parseSettings(file) {
    let a;
    let content = fs.readFileSync(file, 'utf-8');
    let str =  'a = ' + content.substr(content.indexOf('{'))
    eval(str);
    return a;
}

function modifySetting(out) {
    let proSettings = parseSettings(getSettingPath(out));

    proSettings.hasResourcesBundle = false;

    let outSettins = 'window._CCSettings=' + JSON.stringify(proSettings)
    fs.writeFileSync(getSettingPath(out), outSettins, {encoding: 'utf-8'});
}

async function main() {
    let method = process.argv[2];
    let isUpload = false;
    let isPreview = false;
    if (method === 'preview') {
        isPreview = true;
    } else if (method === 'upload') {
        isUpload = true;
    } else {
        console.warn('unkown process', method);
        return;
    }

    let project = path.resolve(process.argv[3]);
    fileUtils.setProject(project);

    let out = path.resolve(process.argv[4]);
    fileUtils.setOut(out);

    let sftpPwd = process.argv[5];
    let miniKeyPath = process.argv[6];
    let version = "";
    let imagePath = "";
    if (isPreview) {
        imagePath = process.argv[7];
    } else if (isUpload) {
        version = process.argv[7];
    }


    if (fs.existsSync(out)) {
        await del(out, { force: true });
        fs.mkdirSync(out);
    }

    await copyToSource(project, out);

    let subpackagesCnt = sliceCodeToSubpackages(fileUtils.getCodeFile(DEST_MAIN, true), out)
    writeGameJson(subpackagesCnt)

    modifySetting(out);

    let outSettings = parseSettings(getSettingPath(out));
    let bundleNames = Object.keys(outSettings.bundleVers);
    let remoteBundles = outSettings.remoteBundles;
    console.log(bundleNames);
    let promises = [];
    let bundles = [];
    for (let i = 0; i < bundleNames.length; i++) {
        let name = bundleNames[i];
        let bundle = new Bundle(name, outSettings.bundleVers[name], out, remoteBundles && remoteBundles.indexOf(name) > -1);
        bundles.push(bundle);
        promises.push(imageTask(bundle, 2));
    }

    await Promise.all(promises);

    await addLengthHead(path.join(out, 'remote'));

    if (sftpPwd) {
        const name = 'res.zip';
        let zip = path.join(out, name);
        await zipRes(bundles, zip);

        for (let i = 0; i < remoteBundles.length; i++) {
            await del(path.join(out, 'remote', remoteBundles[i]), {force: true});
        }

        let r = await uploadFile(RemoteDir, zip, sftpPwd);
        console.log(r);
        await unzipRemote(name, config.remotePath);
        await del(zip, {force: true});
    }

    if (isUpload && version && miniKeyPath) {
        await uploadProj(out, config.appid, version, miniKeyPath);
    } else if (isPreview && imagePath) {
        await previewProj(out, config.appid, imagePath, miniKeyPath);
    }
}

function zipRes(bundles, out) {
    let srcs = bundles.filter((b) => {
        return b.remote
    }).map((b) => {
        return path.join(b.getBundleDir(), '**/*')
    });

    console.log(srcs)

    return new Promise((resolve, reject) => {
        let name = path.basename(out);
        let dir = path.dirname(out);
        gulp.src(srcs, {base: path.join(fileUtils.getOut(), 'remote')})
            .pipe(zip(name))
            .pipe(gulp.dest(dir))
            .on('end', resolve)
            .on('error', reject)
    })
}

function addLengthHead(dir) {
    return new Promise((resolve, reject) => {
        let src = path.join(dir, '**/*.bin')
        gulp.src(src)
            .pipe(lengthHead())
            .pipe(gulp.dest(dir))
            .on('end', resolve)
            .on('error', reject)
    })
}

function uploadFile(remote, file, password) {
    return new Promise((resolve, reject) => {
        console.log('upload file ...')
        exec(path.join(__dirname, '../upload.sh') + " " + password + " '" + remote + "' '" + file + "'", (err, stdout, stderr) => {
            if (err) {
                reject(err)        
                return
            }

            let out = ""
            if (stderr) {
                out = out + stderr + "\n"
            }

            out += stdout
            resolve(out)
        })
    })
}

function unzipRemote(name, cwd) {
    console.log('unzip ' + name)
    return remoteCmd("unzip -n " + name, {cwd: cwd})
}

function uploadProj(projectPath, appid, version, privateKeyPath) {
    var robot = version == '1.0.1' ? 2 : 1;
    const project = new minicli.Project({
        appid,
        privateKeyPath,
        projectPath,
        type: 'miniGame',
    })

    return minicli.upload({
        project,
        version,
        robot,
    })
}

function previewProj(projectPath, appid, imagePath, privateKeyPath) {
    const project = new minicli.Project({
        appid,
        privateKeyPath,
        projectPath,
        type: 'miniGame',
    })

    return minicli.preview({
        project,
        qrcodeFormat: "image",
        qrcodeOutputDest: imagePath
    })
}

main();