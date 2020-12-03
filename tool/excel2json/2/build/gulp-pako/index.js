const {extname} = require('path');
const through2 = require('through2');
const colors = require('ansi-colors');
const fancyLog = require('fancy-log');
const filesize = require('filesize');

const pako = require('pako');

module.exports = () => {
    return through2.obj((file, enc, callback) => {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new Error('gulp-pako: Streaming is not supported'));
        }

        const extension = extname(file.path).toLowerCase();

        // if (extension !== '.json') {
        //     fancyLog('gulp-pako: Skipping unsupported file ' + colors.blue(file.relative));
        //     return callback(null, file);
        // }

        const buffer = Buffer.from(pako.deflate(file.contents).buffer);
        const before = file.contents.length;
        const after = buffer.length;

        const diff = before - after;
        const diffPercent = Math.round(10000 * (diff / before)) / 100;

        if (diff <= 0) {
            fancyLog(
                colors.green('- ') + file.relative + colors.gray(' ->') +
                colors.gray(' Cannot improve upon ') + colors.cyan(filesize(before))
            );
        } else {
            file.contents = buffer;

            fancyLog(
                colors.green('✔ ') + file.relative + colors.gray(' ->') +
                colors.gray(' before=') + colors.yellow(filesize(before)) +
                colors.gray(' after=') + colors.cyan(filesize(after)) +
                colors.gray(' reduced=') + colors.green(filesize(diff) + '(' + diffPercent + '%)')
            );
        }

        callback(null, file);
    });
}