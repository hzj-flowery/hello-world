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


        console.log(file.contents.length)
        total += file.contents.length;
        cb(null, file);
    }, (cb) => {
        console.log('total size:', total);
        cb();
    })
}