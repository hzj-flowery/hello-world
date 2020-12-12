function readOnly(t) {
    var proxy = {};
    var mt = {
        __index: t,
        __newindex: function (t, k, v) {
            error('attempt to update a read-only table', 2);
        }
    };
    setmetatable(proxy, mt);
    return proxy;
}
logWarn = logWarn || print;
logDebug = logDebug || print;
logError = logError || print;
logNewT = logNewT || print;
require('yoka.extends.init');
json = require('cjson');
timer = require('timer');
md5 = require('md5');
pbc = require('yoka.pbc.pbc');
ssocket = require('ssocket');
base64 = require('base64');