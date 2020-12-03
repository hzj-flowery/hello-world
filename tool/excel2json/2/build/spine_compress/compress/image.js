const gulp = require('gulp');
const image = require('gulp-image');
// const fs = require('fs');
// const path = require('path');

const {formatSrc} = require('./utils');

const imageExts = ['png', 'jpg', 'jpeg'];

async function minifyImage(dir, dest) {

    let src = await formatSrc(dir, imageExts);
    return new Promise((resolve, reject) => {
        gulp.src(src)
            .pipe(image())
            .pipe(gulp.dest(dest))
            .on('data', ()=> {

            })
            .on('end', resolve)
            .on('error', reject)
    })
}

async function copyImage(dir, dest) {
    let src = await formatSrc(dir, imageExts);
    return new Promise((resolve, reject) => {
        gulp.src(src)
            .pipe(gulp.dest(dest))
            .on('data', ()=> {

            })
            .on('end', resolve)
            .on('error', reject)
    })
}

module.exports = {
    minifyImage: minifyImage,
    copyImage: copyImage
}