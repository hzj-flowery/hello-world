'use strict';
const path = require('path');
const through = require('through2');
const md5Hex = require('md5-hex');
const { openStdin } = require('process');

let md5AssetsMap = {};

const assetsDirs = ['import', 'raw-assets'];

const plugin = (options) => {
	const uuids = options && options.uuids || [];
	const uuidsMap = options && options.uuidsMap || {};
	if (options && options.md5AssetsMap) {
		md5AssetsMap = options.md5AssetsMap;
	}

	return through.obj((file, encoding, callback) => {
		if (file.isNull()) {
			callback(null, file);
			return;
		}

		if (file.isStream()) {
			callback(new PluginError('gulp-version', 'Streaming not supported'));
			return;
		}

		let md5Array;
		let dir = file.relative.split(path.sep)[0];
		if (assetsDirs.indexOf(dir) > -1) {
			if (!md5AssetsMap[dir]) {
				md5AssetsMap[dir] = [];
			}

			md5Array = md5AssetsMap[dir];
		} else {
			callback(null, file);
			return;
		}

		let md5 = md5Hex(file.contents).substr(0, 5);

		let uuid = file.basename.split('.')[0];
		let enUuid = uuidsMap[uuid];
		if (enUuid) {
			let index = uuids.indexOf(enUuid);
			if (index > -1) {
				md5Array.push(index, md5);
			} else {
				md5Array.push(enUuid, md5);
			}
		} else {
			if (uuid.length > 9) {
				console.log('unknown uuid:', uuid);
				callback(null, file);
				return;
			}

			md5Array.push(uuid, md5);
		}

		file.path = path.join(file.dirname, `${uuid}.${md5}${file.extname}`)

		callback(null, file);
	}, function (callback) {
		callback();
	});
};

module.exports = plugin;