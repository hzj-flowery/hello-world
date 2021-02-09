import { Lang } from "../lang/Lang";
import { stringUtil } from "./StringUtil";
import { G_ConfigLoader, G_Prompt, Colors, G_UserData } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { UTF8 } from "./UTF8";
import BlackList from "./BlackList";

// import { stringUtil } from "../StringUtil";
// import { Lang } from "../../lang/Lang";
// import { G_Prompt, Colors, G_ConfigLoader } from "../../init";
// import { ConfigNameConst } from "../../const/ConfigNameConst";
// import { UTF8 } from "../UTF8";

export namespace TextHelper {
    export function convertKeyValuePairs(sourceText, kvPairs) {
        if (!sourceText || typeof (kvPairs) != 'object') {
            return '';
        }
        let tempText = sourceText;
        let key = null;
        let value = null;
        for (let i = 0; i < kvPairs.length; i++) {
            let tmp = TextHelper.convertKeyValuePair(tempText, kvPairs[i]);
            tempText = tmp[0], key = tmp[1], value = tmp[2];
            let kValues = kvPairs[i];
        }
        return tempText;

    };
    export function convertKeyValuePair(sourceText, kvPair) {
        if (!sourceText || typeof (kvPair) != 'object') {
            return [''];
        }
        if (!kvPair['key'] || kvPair['value'] == null) {
            return [''];
        }
        let value = kvPair.value;
        // value = stringUtil.gsub(value, '%%', '%%%%');
        let tempText = stringUtil.gsub(sourceText, '#' + (kvPair.key + '#'), value);
        return [
            tempText,
            kvPair.key,
            kvPair.value
        ];
    };
    export function  cutText(text, len?) {
        len = len || 8;
        var textlen = UTF8.utf8len(text);
        var str = UTF8.utf8sub(text, 1, len);
        if (textlen > len) {
            str = str + '..';
        }
        return str;
    };

    export function getHeroJobText(job) {
        let key;
        if (job == 1) {
            key = 'common_knight_job_master';
        } else if (job == 2) {
            key = 'common_knight_job_def';
        } else if (job == 3) {
            key = 'common_knight_job_atk';
        } else if (job == 4) {
            key = 'common_knight_job_sup';
        }
        console.assert(key, 'Invalid knight job: ' + (job));
        return Lang.get(key);
    };
    export function getStringTable(str) {
        console.assert(typeof (str) == 'string', 'Invalid str: ' + (str));
        let list = [];
        let len = stringUtil.len(str);
        let i = 1;
        while (i <= len) {
            let c = stringUtil.byte(str, i - 1);
            let shift = 1;
            if (c > 0 && c <= 127) {
                shift = 1;
            } else if (c >= 192 && c <= 223) {
                shift = 2;
            } else if (c >= 224 && c <= 239) {
                shift = 3;
            } else if (c >= 240 && c <= 247) {
                shift = 4;
            }
            let char = stringUtil.sub(str, i, i + shift - 1);
            i = i + shift;
            list.push(char);
        }
        return list;
    };
    export function getAmountText(amount) {
        console.assert(typeof (amount) == 'number', 'Invalid amount: ' + (amount));
        if (amount >= 1000000) {
            return Lang.get('lang_common_format_amount_unit_wan', { amount: Math.floor(amount / 10000) });
        } else {
            return (amount);
        }
    };
    export function getAmountText1(amount, text?) {
        console.assert(typeof (amount) == 'number', 'Invalid amount: ' + (amount));
        if (amount >= 10000) {
            return Lang.get(text || 'lang_common_format_amount_unit_wan', { amount: Math.floor(amount / 10000) });
        } else {
            return (amount);
        }
    };
    export function getAmountText2(amount, unitType?) {
        console.assert(typeof (amount) == 'number', 'Invalid amount: ' + (amount));
        let template = 'lang_common_format_amount_unit_wan';
        if (unitType && unitType == 1) {
            template = 'lang_common_format_amount_unit_w';
        }
        if (amount >= 100000) {
            return Lang.get(template, { amount: Math.floor(amount / 10000) });
        } else {
            return (amount);
        }
    };
    export function getAmountText3(amount, unitType?) {
        console.assert(typeof (amount) == 'number', 'Invalid amount: ' + (amount));
        let template = 'lang_common_format_amount_unit_wan';
        if (unitType && unitType == 1) {
            template = 'lang_common_format_amount_unit_w';
        }
        if (amount >= 1000000) {
            return Lang.get(template, { amount: Math.floor(amount / 10000) });
        } else {
            return (amount);
        }
    };
    export function getAttrText(info, split) {
        split = split || '\u3001';
        let desInfo = TextHelper.getAttrInfoBySort(info);
        let des = '';
        for (let i = 0; i < desInfo.length; i++) {
            let v = desInfo[i];
            let arr = TextHelper.getAttrBasicText(v.id, v.value);
            let name = arr[0], value = arr[1];
            des = des + (name + ('+' + value));
            if (i != desInfo.length) {
                des = des + split;
            }
        }
        return des;
    };
    export function getAttrInfoBySort(info) {
        let desInfo = [];
        for (let k in info) {
            let value = info[k];
            desInfo.push({
                id: k,
                value: value
            });
        }
        function sortFun(a, b) {
            let infoA = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(a.id);
            let infoB = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(b.id);
            console.assert(infoA && infoB, 'attribute config can not find Aid = %d, Bid = %d');
            let orderA = infoA.order;
            let orderB = infoB.order;
            return orderA - orderB;
        }
        desInfo.sort(sortFun);
        return desInfo;
    };
    export function getAttrBasicPlusText(id, value) {
        return TextHelper.getAttrBasicText(id, value);
    };
    export function getAttrBasicText(id, value) {
        let attrConfig = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(id);
        console.assert(attrConfig, 'attribute can not find id = ' + id);
        let name = attrConfig.cn_name;
        let type = attrConfig.type;
        if (type == 2) {
            value = value / 10 + '%';
        }
        if (type == 3) {
            value = '+' + (value / 10 + '%');
        }
        return [
            name,
            value
        ];
    };
    export function isNameLegal(txt, min, max) {
        let minCount = min || 0;
        let maxCount = max || 10000;
        let tipWord;
        txt = stringUtil.trim(txt);
        if (txt == '') {
            tipWord = Lang.get('txt_check_error_empty');
        } else if (stringUtil.utf8len(txt) < minCount) {
            tipWord = Lang.get('txt_check_error_too_short', { count: minCount });
        } else if (stringUtil.utf8len(txt) > maxCount) {
            tipWord = Lang.get('txt_check_error_too_long', { count: maxCount });
        } else if (TextHelper.checkHasSpecial(txt)) {
            tipWord = Lang.get('txt_check_error_symbol_word');
        } else if (BlackList.isMatchText(txt)) {
            tipWord = Lang.get('txt_check_error_black_word');
        }
        if (tipWord) {
            G_Prompt.showTip(tipWord);
            return false;
        } else {
            return true;
        }
    };
    export function checkHasSpecial(txt) {
        let illegalNameRune = [];
        illegalNameRune[0] = 0;
        illegalNameRune[1] = 9;
        illegalNameRune[2] = 95;
        illegalNameRune[3] = 32;
        illegalNameRune[4] = 34;
        illegalNameRune[5] = 96;
        illegalNameRune[6] = 26;
        illegalNameRune[7] = 10;
        illegalNameRune[8] = 13;
        illegalNameRune[9] = 39;
        illegalNameRune[10] = 37;
        illegalNameRune[11] = 92;
        illegalNameRune[12] = 44;
        illegalNameRune[13] = 124;
        let len = stringUtil.len(txt);
        for (let i = 0; i < len; i++) {
            let ascciValue = stringUtil.byte(txt, i);
            for (let j = 0; j < illegalNameRune.length; j++) {
                if (illegalNameRune[j] == ascciValue) {
                    return true;
                }
            }
            if (ascciValue >= 118784 && ascciValue <= 128895 || ascciValue >= 8448 && ascciValue <= 9983) {
                return true;
            }
        }
        let findValue = stringUtil.find(txt, '\u3000');
        return findValue != -1;
    };
    export function getNoticePairColor(key, noticePairs) {
        let value = TextHelper.getNoticePairValue(key, noticePairs);
        if (value == null) {
            return null;
        }
        let retTable: any = {};
        retTable.value = value.value;
        retTable.key = value.key;
        let keyType = value['key_type'] || 0;
        let keyValue = value['key_value'] || 0;
        if (keyType > 0 || keyValue > 0) {
            retTable.keyValue = keyValue;
            retTable.keyType = keyType;
            let [color, outlineColor] = Colors.getColorsByServerColorData(keyType, keyValue);
            retTable.color = color;
            retTable.outlineColor = outlineColor;
            return retTable;
        }
        return retTable;
    };
    export function getNoticePairValue(key, noticePairs) {
        for (let i in noticePairs) {
            let value = noticePairs[i];
            if (value.key == key) {
                return value;
            }
        }
        return null;
    };
    export function parseNoticePairs(contentText, noticePairs) {
        let content = contentText;
        let contents = [];
        let lastIndex = 0;
        while (true) {
            let headIndex = stringUtil.find(content, '#', lastIndex);
            let tailIndex ;
            if (headIndex != -1) {
                tailIndex = stringUtil.find(content, '#', headIndex + 1);
            } else {
                contents.push({
                    content: stringUtil.sub(content, lastIndex+1),
                    isKeyWord: false
                });
                break;
            }
            if (headIndex > lastIndex) {
                contents.push({
                    content: stringUtil.sub(content, lastIndex+1, headIndex),
                    isKeyWord: false
                });
            }
            if (headIndex != -1 && tailIndex != -1) {
                if (tailIndex > headIndex + 1) {
                    let key =  stringUtil.sub(content, headIndex + 2, tailIndex);
                    let tempTable = TextHelper.getNoticePairColor(key, noticePairs);
                    if (tempTable) {
                        contents[contents.length] = {
                            content: tempTable.value,
                            isKeyWord: true,
                            color: tempTable.color,
                            outlineColor: tempTable.outlineColor
                        };
                    }
                }
                lastIndex = tailIndex + 1;
            } else {
                // if (headIndex + 1 < stringUtil.len(dialogueContent)) {
                //     contents[contents.length + 1] = {
                //         content: stringUtil.sub(content, headIndex + 1),
                //         isKeyWord: false
                //     };
                // }
                break;
            }
        }
        return contents;
    };
    export function parseConfigText(text) {
        if(!text){
            return;
        }
        let content: string = text;
        let contents = [];
        let lastIndex = -1;
        while (true) {
            let headIndex = stringUtil.find(content, '#', lastIndex + 1);
            let tailIndex = -1;
            if (headIndex >= 0) {
                tailIndex = stringUtil.find(content, '#', headIndex + 1);
            } else {
                if (lastIndex < text.length - 1) {
                    contents[contents.length] = {
                        content: stringUtil.sub(content, lastIndex + 1),
                        isKeyWord: false
                    };
                }
                break;
            }
            if (headIndex > lastIndex) {
                contents[contents.length] = {
                    content: /* stringUtil.sub(content, lastIndex, headIndex) */content.slice(lastIndex + 1, headIndex),
                    isKeyWord: false
                };
            }
            if (headIndex >= 0 && tailIndex >= 0) {
                if (tailIndex > headIndex + 1) {
                    contents[contents.length] = {
                        content: /* stringUtil.sub(content, headIndex + 1, tailIndex + 1) */content.slice(headIndex + 1, tailIndex),
                        isKeyWord: true
                    };
                }
                lastIndex = tailIndex;
            } else {
                // if (headIndex + 1 < stringUtil.len(dialogueContent)) {
                //     contents[contents.length + 1] = {
                //         content: stringUtil.sub(content, headIndex + 1),
                //         isKeyWord: false
                //     };
                // }
                break;
            }
        }
        return contents;
    };
    export function expandTextByLen(txt, len) {
        let tempLen = UTF8.utf8len(txt);
        if (tempLen >= len) {
            return txt;
        }
        let result = '';
        let dis = len - tempLen;
        if (tempLen == 2) {
            let w1 = UTF8.utf8sub(txt, 1, 1);
            let w2 = UTF8.utf8sub(txt, 2, 2);
            let fillTxt = '';
            for (let i = 0; i < dis; i++) {
                fillTxt = fillTxt + '\u3000';
            }
            result = ('%s' + (fillTxt + '%s')).format(w1, w2);
            let l = result.length;
        } else if (tempLen == 3) {
            let w1 = UTF8.utf8sub(txt, 1, 1);
            let w2 = UTF8.utf8sub(txt, 2, 2);
            let w3 = UTF8.utf8sub(txt, 3, 3);
            result = '%s %s  %s'.format(w1, w2, w3);
        }
        return result;
    };
    export function splitStringToNumberArr(txt) {
        let numStrArr = stringUtil.split(txt, '|');
        let numArr = [];
        for (let k in numStrArr) {
            let v = numStrArr[k];
            let number = parseFloat(v);
            console.assert(number != NaN, 'can\'t convert to number array:' + (txt));
            numArr.push(number);
        }
        return numArr;
    };
    export function stringStartsWith(str, pattern) {
        let s = stringUtil.find(str, pattern);
        return s != null && s == 0;
    };
    export function stringGetSuffixIndex(str, pattern) {
        let indexStr = stringUtil.gsub(str, pattern, '');
        return parseFloat(indexStr);
    };
    export function byteAlignment(txt, len, extendLen) {
        var tempLen = UTF8.utf8len(txt);
        if (tempLen != len) {
            return txt;
        }
        if ((extendLen - len) % (len - 1) != 0) {
            return txt;
        }
        var result = '';
        var internerNum = (extendLen - len) / (len - 1);
        var internerSpace = '';
        for (var i = 1; i <= internerNum; i++) {
            internerSpace = internerSpace + ' ';
        }
        for (var i = 1; i <= len - 1; i++) {
            var w = UTF8.utf8sub(txt, i, i);
            result = '%s%s%s'.format(result, w, internerSpace);
        }
        var w = UTF8.utf8sub(txt, len, len);
        result = '%s%s'.format(result, w);
        return result;
    };
};