import { Colors } from "../init"
import { assert } from "./GlobleFunc";
import { TypeConvertHelper } from "./TypeConvertHelper";

export default class ParseRichTextStringHelp {
    // static _DEFAULT_COLOR = Colors.BRIGHT_BG_ONE
    static _DEFAULT_FONTSIZE = 20;
    //其他配置(自定义添加一些配置属性 )
    static get _CONFIG() {
        if (!this._config) this.initConfig();
        return this._config;
    }

    private static _config;
    private static initConfig() {
        this._config = {
            'c0': {},
            'c1': { color: Colors.COLOR_QUALITY[0] },
            'c2': { color: Colors.COLOR_QUALITY[1] },
            'c3': { color: Colors.COLOR_QUALITY[2] },
            'c4': { color: Colors.COLOR_QUALITY[3] },
            'c5': { color: Colors.COLOR_QUALITY[4] },
            'c6': { color: Colors.COLOR_QUALITY[5] },
            'c7': {
                color: Colors.COLOR_QUALITY[0],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[0]
            },
            'c8': {
                color: Colors.COLOR_QUALITY[1],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[1]
            },
            'c9': {
                color: Colors.COLOR_QUALITY[2],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[2]
            },
            'c10': {
                color: Colors.COLOR_QUALITY[3],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[3]
            },
            'c11': {
                color: Colors.COLOR_QUALITY[4],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[4]
            },
            'c12': {
                color: Colors.COLOR_QUALITY[5],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[5]
            },
            'c101': { color: Colors.BRIGHT_BG_ONE },
            'c102': { color: Colors.BRIGHT_BG_TWO },
            'c103': { color: Colors.BRIGHT_BG_GREEN },
            'c104': { color: Colors.BRIGHT_BG_RED },
            'c105': { color: Colors.DARK_BG_ONE },
            'c106': { color: Colors.DARK_BG_TWO },
            'c107': { color: Colors.DARK_BG_GREEN },
            'c108': { color: Colors.DARK_BG_RED },
            'c109': { color: Colors.DARK_BG_THREE },
            'c110': { color: Colors.OBVIOUS_GREEN },
            'c111': { color: Colors.OBVIOUS_YELLOW },
            'c120': { color: Colors.SYSTEM_TARGET_RED },
            'c121': { color: Colors.CLASS_WHITE },
            'c122': { color: Colors.GOLDENHERO_ACTIVITY_END_NORMAL },
            'c151': { outlineColor: Colors.DARK_BG_OUTLINE },
            'c201': { color: Colors.SELL_TIPS_COLOR_NORMAL },
            'c202': { color: Colors.SELL_TIPS_COLOR_HIGHLIGHT },
            'c901': { color: Colors.ReportParseColor[0] },
            'c902': { color: Colors.ReportParseColor[1] },
            'c903': { color: Colors.ReportParseColor[2] },
            'c904': { color: Colors.ReportParseColor[3] },
            'resmini': {}
        }
    }

    static _createTextData(str, color, fontSize, outlineColor = null, outlineSize = 0) {
        var single: any = {};
        single.type = 'text';
        single.msg = str;
        single.color = color;
        single.fontSize = fontSize;
        single.outlineColor = outlineColor;
        single.outlineSize = outlineSize;
        return single;
    }
    static _createImage(filePath, width, height, color, opacity) {
        if (filePath) {
            var single: any = {};
            single.type = 'image';
            single.filePath = filePath;
            single.width = width;
            single.height = height;
            single.color = color;
            single.opacity = opacity;
            return single;
        }
    }
    //颜色
    static _parseColor(key, msg, otherConfig, defaultColor, defaultSize) {
        var configColor = ParseRichTextStringHelp._CONFIG[key];
      //assert((configColor != null, 'can not find ParseRichTextStringHelp._CONFIG key = ' + (key || null));
        var color = otherConfig.color || (configColor.color || defaultColor);
        var fontSize = otherConfig.fontSize || (configColor.fontSize || defaultSize);
        var outlineColor = configColor.outlineColor || otherConfig.outlineColor;
        var outlineSize = configColor.outlineSize || (otherConfig.outlineSize || 2);
        return ParseRichTextStringHelp._createTextData(msg, color, fontSize, outlineColor, outlineSize);
    }
    //资源类小图标
    static _parseResmini(key, value, otherConfig, defaultSize) {
        var configResmini = ParseRichTextStringHelp._CONFIG[key];
      //assert((configResmini != null, 'can not find ParseRichTextStringHelp._CONFIG key = ' + (key || null));
        value = parseInt(value);
        var itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, value);
        // assert(itemParams != null, string.format('can not find vaule = %s', value));
        var filePath = otherConfig.filePath || (configResmini.filePath || itemParams.res_mini);
        var width = otherConfig.width || configResmini.width || defaultSize;
        var height = otherConfig.height || configResmini.height || defaultSize;
        var color = otherConfig.color || configResmini.color;
        var opacity = otherConfig.opacity || configResmini.opacity;
        return ParseRichTextStringHelp._createImage(filePath, width, height, color, opacity);
    }
    static parse(formatStr: string, params) {
        if (!params) {
            params = {};
        }
        let defaultColor = params.defaultColor || Colors.BRIGHT_BG_ONE;
        let defaultSize = params.defaultSize || 20;
        let richTextConfigs = [];
        let formatReg = /(.*?)\$([a-zA-Z]*?)(\d*?)_(.*?)\$/g;
        let result: RegExpExecArray;

        
        let start = 0;
        let curMatchIndex = 0;
        while (result = formatReg.exec(formatStr)) {
            let normalText = result[1];
            let key = result[2];
            let keyID = result[3];
            let value = result[4];
            if (normalText && normalText != '') {
                var single = ParseRichTextStringHelp._createTextData(normalText, defaultColor, defaultSize, null);
                richTextConfigs.push(single);
            }
            if (typeof (key) == "string" && typeof keyID == "string") {
                var otherConfig = {};
                if (params.other && params.other[curMatchIndex]) {
                    otherConfig = params.other[curMatchIndex];
                }
                var single;
                if (key == 'c' && value && value != '') {
                    single = ParseRichTextStringHelp._parseColor(key + keyID, value, otherConfig, defaultColor, defaultSize);
                } else if (key == 'resmini') {
                    single = ParseRichTextStringHelp._parseResmini(key + keyID, value, otherConfig, defaultSize);
                }
                if (single) {
                    richTextConfigs.push(single);
                }
            }
            curMatchIndex = curMatchIndex + 1;
            start = start + result[0].length;
        }
        if (start < formatStr.length) {
            var single = ParseRichTextStringHelp._createTextData(formatStr.substr(start), defaultColor, defaultSize);
            richTextConfigs.push(single);
        }
        return richTextConfigs;
    }
}