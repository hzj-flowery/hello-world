import { G_ConfigLoader, G_ConfigManager } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { assert } from "./GlobleFunc";
import { UTF8 } from "./UTF8";
import { stringUtil } from "./StringUtil";

export default class BlackList{
    public static isMatchText = function (text) {
        //--not complete
        var BlackUnits = G_ConfigLoader.getConfig(ConfigNameConst.BLACK_UNITS);
        if (text == null || typeof(text) != 'string') {
          //assert(('传入值为空或非string类型');
            return false;
        }
        var len = UTF8.utf8len(text);
        for (var i = 1; i<=len; i++) {
            var tmp = UTF8.utf8sub(text, i, i);
            var _t = BlackUnits.getBlackData(tmp);
            if (_t && _t.length > 0) {
                for (let i in _t) {
                    var v = _t[i];
                    if((text as string).indexOf(v) >= 0){
                        return true;
                    }
                }
            }
        }
        var blackList = G_ConfigManager.getBlackList();
        if (blackList && blackList != '') {
            blackList = stringUtil.gsub(blackList, '[\n%s\r]', '');
            var matches = stringUtil.split(blackList, ',');
            for (let i in matches) {
                let v = matches[i];
                if((text as string).indexOf(v) >= 0){
                    return true;
                }
            }
        }
        return false;
    };
    public static filterBlack = function (text) {
        var BlackUnits = G_ConfigLoader.getConfig(ConfigNameConst.BLACK_UNITS);
        if (text == null || typeof(text) != 'string') {
          //assert(('传入值为空或非string类型');
            return text;
        }
        var len = UTF8.utf8len(text);
        for (var i = 1; i<=len; i++) {
            var tmp = UTF8.utf8sub(text, i, i);
            var _t = BlackUnits.getBlackData(tmp);
            if (_t && _t.length > 0) {
                for (var k=1; k<=_t.length; k++) {
                    var v = _t[k-1];
                    var tmpText = text as string;
                    if (tmpText.indexOf(v) >= 0) {
                        var len = UTF8.utf8len(v);
                        var replace = '';
                        for (var j = 1; j<=len; j++) {
                            replace = replace + '*';
                        }
                        text = stringUtil.gsub(text, v, replace);
                    }
                }
            }
        }
        var blackList = G_ConfigManager.getBlackList();
        if (blackList && blackList != '') {
            blackList = stringUtil.gsub(blackList, '[\n%s\r]', '');
            var matches = stringUtil.split(blackList, ',');
            for (let i in matches) {
                let v = matches[i];
                text = stringUtil.gsub(text, v, '*');
            }
        }
        return text;
    };
}
