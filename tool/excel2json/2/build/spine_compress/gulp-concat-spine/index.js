const through = require('through2-concurrent');
const path = require('path');
const atlasParser= require('./atlasParser');
const pako = require('pako')
const fancyLog = require('fancy-log');
const colors = require('ansi-colors');
const filesize = require('filesize');

let atlasMap = {};
let jsonMap = {};

function preprocessJson(json) {
    let content = json.toString('utf-8');
    return Buffer.from(JSON.stringify(JSON.parse(content)), 'utf-8')
}

/**
 * 
 * @param {Buffer} atlas 
 * @param {Buffer} json 
 */

function concat(atlas, json) {

    let compressedJson = Buffer.from(pako.deflate(preprocessJson(json)));

    let images = atlasParser(atlas);

    let compressedAtlas = Buffer.from(pako.deflate(atlas));

    //image count
    let imageLength = 4;
    images.forEach(e => {
        imageLength = imageLength + 4 + e.length;
    });

    //head + (image atlas json) position and length + ...
    let imagePos = 6 + 8 * 3;
    let atlasPos = imagePos + imageLength;
    let jsonPos = atlasPos + compressedAtlas.length;
    let totalLength = jsonPos + compressedJson.length;

    let buffer = Buffer.alloc(totalLength);

    let offset = writeHeader(totalLength, buffer);
    offset = writeIndex(offset, buffer, imagePos, imageLength);
    offset = writeIndex(offset, buffer, atlasPos, compressedAtlas.length);
    offset = writeIndex(offset, buffer, jsonPos, compressedJson.length);

    console.assert(offset === imagePos, `imagepos error ${offset} ${imagePos}`)
    buffer.writeUInt32BE(images.length, offset);
    offset += 4;

    let image
    for (let i = 0; i < images.length; i++) {
        image = images[i];
        buffer.writeUInt32BE(image.length, offset);
        offset += 4;
        image.copy(buffer, offset);
        offset += image.length;
    }

    console.assert(offset === atlasPos, `imagepos error ${offset} ${atlasPos}`)
    compressedAtlas.copy(buffer, offset);
    offset += compressedAtlas.length;

    console.assert(offset === jsonPos, `imagepos error ${offset} ${jsonPos}`)
    compressedJson.copy(buffer, offset);

    return buffer;
}

function writeHeader(length, buffer) {
    let offset = 0;
    buffer.writeUInt8('0xbe', offset);
    offset++;

    buffer.writeUInt32BE(length, offset);
    offset += 4;

    buffer.writeUInt8('0xed', offset);
    offset++;

    return offset;
}

function writeIndex(offset, view, pos, len) {
    view.writeUInt32BE(pos, offset);
    offset += 4;

    view.writeUInt32BE(len, offset);
    offset += 4;

    return offset;
}

module.exports = () => {
    return through.obj((file, env, callback) => {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new Error('gulp-concat-spine: Streaming is not supported'));
        }

        let ext = path.extname(file.relative);
        let basename = path.basename(file.relative, ext);
        let buffer, atlas, json;
        if (ext === '.json') {
            atlas = atlasMap[basename];
            json = file.contents;
            if (atlas) {
                buffer = concat(atlas, json);
            } else {
                jsonMap[basename] = json;
                return callback();
            }
        } else if (ext === '.atlas') {
            json = jsonMap[basename];
            atlas = file.contents;
            if (json) {
                buffer = concat(file.contents, json);
            } else {
                atlasMap[basename] = atlas;
                return callback();
            }
        } else {
            fancyLog('gulp-concat-spine: Skipping unsupported file ' + colors.blue(file.relative));
            return callback(null, file);
        }

        file.contents = buffer;
        const before = atlas.length + json.length;
        const after = buffer.length;

        const diff = before - after;
        const diffPercent = Math.round(10000 * (diff / before)) / 100;

        fancyLog(
            colors.green('✔ ') + basename + colors.gray(' ->') +
            colors.gray(' before=') + colors.yellow(filesize(before)) +
            colors.gray(' after=') + colors.cyan(filesize(after)) +
            colors.gray(' reduced=') + colors.green(filesize(diff) + '(' + diffPercent + '%)')
        );

        callback(null, file);
    })
}