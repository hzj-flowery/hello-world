const path = require('path');
const images = require('images');
const through = require('through2');
const PluginError = require('plugin-error');

function minScale(size) {
    return Math.pow(2, Math.ceil(Math.log2(size / 2048)));
}

function getScaledSize(size, s) {
    return Math.ceil(size = size / s);
}


function resize(scale, bundle) {
    return through.obj((file, enc, cb) => {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        let ext = path.extname(file.relative).substr(1);
        let url, uuid;
        if (bundle) {
            let basename = path.basename(file.relative, ext);
            uuid = basename.split('.')[0]
            url = bundle.getAssetUrl(uuid);
        } else {
            url = file.relative;
        }

        if (url.indexOf('spine') > -1 || url.indexOf('fight/effect/') > -1) {
            // console.log('spine image:', uuid, url);
            cb(null, file);
            return
        }

        let obj = images(file.contents)
        let {
            width,
            height
        } = obj.size();

        if (width <= 2048 && height <= 2048) {
            cb(null, file);
            return
        }

        console.log(width, height, file.relative);
        let minWidthScale = minScale(width);
        let minHeightScale = minScale(height);

        scale = Math.max(scale, minWidthScale, minHeightScale);
        width = getScaledSize(width, scale);
        height = getScaledSize(height, scale);

        file.contents = obj.resize(width, height).encode(ext)

        if (bundle) {
            let meta = bundle.getAssetMeta(uuid);
            if (meta.__type__ != 'cc.Texture2D') {
                cb(new PluginError('resize', 'meta type is not texture2d:' + meta.content.type))
                return;
            }

            meta.content = meta.content + `,${scale}`;
        }
        cb(null, file);
    }, (cb) => {
        bundle && bundle.flush();
        cb();
    })
}

module.exports = resize;

if (require.main == module) {
    const gulp_image = require('gulp-image');
    let project = process.argv[2]
    let out = process.argv[3];

    const gulp = require('gulp')
    gulp.src(path.join(project, '**/*.@(png|jpg)'))
        .pipe(resize(2))
        .pipe(gulp_image())
        .pipe(gulp.dest(out))
}