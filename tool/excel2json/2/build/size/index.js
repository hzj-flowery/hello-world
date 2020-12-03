const gulp = require('gulp');
const path = require('path');
const size = require('./size')


let project = process.argv[2];
let exts = process.argv.slice(3)

gulp.src(path.join(project, `**/*.@(${exts.join('|')})`))
    .pipe(size())
    .on('data', () => {})
