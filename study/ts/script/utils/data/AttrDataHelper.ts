import AttributeConst from "../../const/AttributeConst";
import { Colors, G_ConfigLoader } from "../../init";
import { Lang } from "../../lang/Lang";
import { TextHelper } from "../TextHelper";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { formula } from "../../config/formula";

//属性数据帮助类
export namespace AttrDataHelper {
    export function formatAttr(info, attrType, attrValue) {
        console.assert(typeof (info) == 'object', 'AttrDataHelper.appendAttr info have to be table');

        if (attrType > 0) {
            if (info[attrType] == null) {
                info[attrType] = 0;
            }
            info[attrType] = info[attrType] + attrValue;
        }
    };
    export function fromatAttrEx(info, attrType, attrValue) {
        console.assert(typeof (info) == 'object', 'AttrDataHelper.appendAttr info have to be table');
        if (attrType > 0) {
            if (info[attrType] == null) {
                info[attrType] = 0;
            }
            info[attrType] = attrValue;
        }
    };
    export function replaceAttr(tarAttr, srcAttr) {
        for (let type in srcAttr) {
            let value = srcAttr[type];
            AttrDataHelper.fromatAttrEx(tarAttr, type, value);
        }
    };
    export function getBoutContentActive (attrId, value) {
        var [attrName, attrValue] = TextHelper.getAttrBasicText(attrId, value);
        attrValue = '+' + attrValue;
        var content = Lang.get('bout_attr_active', { attr: attrName + attrValue });
        return content;
    };
    export function appendAttr(tarAttr, srcAttr) {
        for (let type in srcAttr) {
            let value = srcAttr[type];
            AttrDataHelper.formatAttr(tarAttr, type, value);
        }
    };
    export function createRecordUnitData(id, attr) {
        return {
            id: id,
            attr: attr
        };
    };
    export function getPromptContent(attrId, value) {
        let absValue = Math.abs(value);
        let arr =  TextHelper.getAttrBasicText(attrId, absValue);
        let attrName = arr[0], attrValue = arr[1];
        let color = value >= 0 ? Colors.colorToNumber(Colors.getColor(2)) : Colors.colorToNumber(Colors.getColor(6));
        let outlineColor = value >= 0 ? Colors.colorToNumber(Colors.getColorOutline(2)) : Colors.colorToNumber(Colors.getColorOutline(6));
        attrValue = value >= 0 ? ' + ' + attrValue : ' - ' + attrValue;
        let content = Lang.get('summary_attr_change', {
            attr: attrName + attrValue,
            color: color,
            outlineColor: outlineColor
        });
        return content;
    };
    export function getPowerFormulaResult(attrInfo):number {
        let map = {};
        let AttrCfg = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE);
        let length = AttrCfg.length();
        for (let i = 0; i < length; i++) {
            let info = AttrCfg.indexOf(i);
            let enName:string = info.en_name;
            let upperEnName = enName.toLocaleUpperCase();
            // let key = '#' + (upperEnName + '#');
            let value =  parseInt(attrInfo[info.id]) || 0;
            if (info.type == 2) {
                value = value / 1000;
            }
            map[upperEnName] = value;
        }
        // let fcg = G_ConfigLoader.getConfig(ConfigNameConst.FORMULA);
        //添加保护 此处的值为空
        // let formula:string = fcg.get(3).formula||"";
        // for (let k in map) {
        //     let v = map[k];
        //     formula = formula.replace(k, v);
        // }

        return formula.getFunc(2)(map);
    };
    // export function calPower(formula) {
    //     return Math.floor(eval(formula));
    // };
    export function getPower(attrInfo) {
        return Math.floor(AttrDataHelper.getPowerFormulaResult(attrInfo));
    };

    export function processDefAndAddition(attr) {
        AttrDataHelper.processDef(attr);
        AttrDataHelper.processAddition(attr);
        AttrDataHelper.processSpecial(attr);
    };
    export function processDef(attr) {
        for (let k in attr) {
            let v = attr[k];
            let defList = AttributeConst.DEF_MAPPING[k];
            if (defList) {
                let defValue = attr[k];
                for (let i in defList) {
                    let defId = defList[i];
                    if (attr[defId] == null) {
                        attr[defId] = 0;
                    }
                    attr[defId] = attr[defId] + defValue;
                }
            }
        }
    };
    export function processAddition(attr) {
        for (let k in attr) {
            let v = attr[k];
            let attrPerId = AttributeConst.MAPPING[k];
            if (attrPerId) {
                let attrPerValue = attr[attrPerId];
                if (attrPerValue) {
                    attr[k] = Math.floor(attr[k] * (1 + attrPerValue / 1000));
                }
            }
        }
    };
    export function processSpecial(attr) {
        let tempAttr: any = {};
        for (let t in attr) {
            tempAttr[t] = attr[t];
        }
        for (let k in tempAttr) {
            let v = tempAttr[k];
            let attrId = AttributeConst.SPECIAL_MAPPING[k];
            if (attrId) {
                if (attr[attrId] == null) {
                    attr[attrId] = 0;
                }
                attr[attrId] = attr[attrId] + v;
            }
        }
    }
    export function isSpecialAttrId(attrId) {
        for (let k in AttributeConst.SPECIAL_MAPPING) {
            let v = AttributeConst.SPECIAL_MAPPING[k];
            if (k == attrId) {
                return true;
            }
        }
        return false;
    };
}