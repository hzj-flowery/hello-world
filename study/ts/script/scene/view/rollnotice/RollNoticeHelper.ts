import { RollNoticeConst } from "../../../const/RollNoticeConst";
import { Colors } from "../../../init";
import { RichTextHelper } from "../../../utils/RichTextHelper";
import { table } from "../../../utils/table";
import { Color } from "../../../utils/Color";

export default class RollNoticeHelper {

    static valueFuncs = {
        [RollNoticeConst.NOTICE_COLOR_COLOR]: function (params) {
            if (params.value2 == null) {
                return [
                    null,
                    null
                ];
            }
            return [params.value2];
        },
        [RollNoticeConst.NOTICE_COLOR_USER]: function (params) {
            if (params.value2 == null) {
                return [
                    null,
                    null
                ];
            }
            return [
                Colors.getOfficialColor(params.value2),
                Colors.getOfficialColorOutlineEx(params.value2)
            ];
        },
        [RollNoticeConst.NOTICE_COLOR_HERO]: function (params) {
            if (params.value2 == null) {
                return [
                    null,
                    null
                ];
            }
            return [
                Colors.getColor(params.value2),
                null
            ];
        },
        [RollNoticeConst.NOTICE_COLOR_EQUIPMENT]: function (params) {
            if (params.value2 == null) {
                return [
                    null,
                    null
                ];
            }
            return [
                Colors.getColor(params.value2),
                null
            ];
        },
        [RollNoticeConst.NOTICE_IMG]: function (params) {
            if (params.value1 == null) {
                return null;
            }
            return ['title'];
        }
    };
    static splitServerRollMsg(msg: string) {
        var list = msg.split(',') || [];
        var values = {};
        for (var i = 1; i <= list.length; i++) {
            if (list[i - 1]) {
                values[i - 1] = [];
                var subMsg = list[i - 1];
                var nameList = subMsg.split('#') || [];
                for (let k in nameList) {
                    var nameStr = nameList[k];
                    var subList = nameStr.split('|') || [];
                    table.insert(values[i-1], subList);
                }
            }
        }
        return values;
    };
    static decodeColors = function (values) {
        var newValues = {};
        for (let k in values) {
            var v = values[k];
            for (let k1 in v) {
                var v1 = v[k1];
                if (v1.length > 0) {
                    newValues[k] = newValues[k] || [];
                    if (v1[1] && parseInt(v1[1])) {
                        var [retValue1, retValue2] = RollNoticeHelper.valueFuncs[parseInt(v1[1])]({
                            value1: parseInt(v1[1]),
                            value2: parseInt(v1[2])
                        });
                        table.insert(newValues[k], [
                            v1[0],
                            retValue1,
                            retValue2
                        ]);
                    } else {
                        table.insert(newValues[k], [v1[0]]);
                    }
                }
            }
        }
        return newValues;
    };
    static makeRichMsgFromServerRollMsg = function (rollMsg, colorParam) {
        var values = RollNoticeHelper.splitServerRollMsg(rollMsg.param);
        values = RollNoticeHelper.decodeColors(values);
        var subTitles = RichTextHelper.parse2SubTitleExtend(rollMsg.msg);
        subTitles = RichTextHelper.fillSubTitleUseReplaceTextColor(subTitles, values, rollMsg.noticeId);
        var richElementList = RichTextHelper.convertSubTitleToRichMsgArr(colorParam || {
            textColor: Colors.colorToHexStr(Colors.PAOMADENG),
            outlineColor: Colors.colorToHexStr(Colors.PAOMADENG_OUTLINE),
            outlineSize: 2,
            fontSize: 20
        }, subTitles);
        var richStr = JSON.stringify(richElementList);//json.encode(richElementList);
        return [
            richStr,
            richElementList
        ];
    };

}
