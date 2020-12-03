const through = require('through2');

module.exports = function() {
    let total = 0;
    return through.obj((file, enc, cb) => {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

		if (file.isStream()) {
			cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return;
		}


        let length = file.contents.length;
        let lenArr = [];
        let mod = 1 << 8;
        for (let i = 0; i < 4; i++) {
            lenArr[i] = length % mod;
            length = Math.floor(length / mod);
        }


        let head = Buffer.from(lenArr);
        let content = Buffer.concat([head, file.contents]);

        file.contents = content;
        cb(null, file);
    })
}