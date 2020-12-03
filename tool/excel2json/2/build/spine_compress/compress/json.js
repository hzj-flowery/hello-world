const gulp = require('gulp');
const concat = require('../gulp-concat-spine');
const rename = require('gulp-rename');

const {formatSrc} = require('./utils');

async function minifyJson(dir, dest) {
    let src = await formatSrc(dir, ['json', 'atlas']);
    return gulpCompress(src, dest);
}

function gulpCompress(src, dest) {
    return new Promise((resolve, reject) => {
        gulp.src(src)
            .pipe(concat())
            .pipe(rename({
                extname: '.bin'
            }))
            .pipe(gulp.dest(dest))
            .on('data', ()=> {

            })
            .on('end', resolve)
            .on('error', reject)
    })
}

module.exports = {
    minifyJson: minifyJson
}