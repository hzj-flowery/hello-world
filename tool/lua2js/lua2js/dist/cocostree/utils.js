"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toJs;
function getConvertResult(parser) {
    if (!parser) {
        var node = {
            "type": "Literal",
            "value": null,
            "raw": "null"
        };
        return node;
    }
    var result = customConvert(parser);
    if (result) {
        return result;
    }
    toJs = toJs || require('./lua2js').toJs;
    return toJs[parser.type](parser);
}
exports.getConvertResult = getConvertResult;
var custom;
function customConvert(parser) {
    custom = custom || require('./customLua2js').custom2js;
    for (var i = 0; i < custom.length; i++) {
        var c = custom[i];
        if (c.test(parser)) {
            return c.convert(parser);
        }
    }
}
//# sourceMappingURL=utils.js.map