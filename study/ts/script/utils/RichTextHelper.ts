import { G_ConfigLoader, Colors } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { ChatConst } from "../const/ChatConst";
import { Path } from "./Path";
import { PopupHonorTitleHelper } from "../scene/view/playerDetail/PopupHonorTitleHelper";
import HonorTitleConst from "../const/HonorTitleConst";
import { TextHelper } from "./TextHelper";
import { HonorTitleItemData } from "../data/HonorTitleItemData";

export namespace RichTextHelper {
    export const IMG_SIZE = 38;

    function emotionIdValid(emotionId: number) {
        emotionId = Number(emotionId);
        if (!emotionId || emotionId <= 0 || emotionId > ChatConst.MAX_FACE_NUM) {
            return false;
        }

        return true;
    }

    export function parse2SubTitle(strInput: string) {
        let subtitle = [];
        let result: RegExpExecArray;
        let reg = /#\d+#/g;
        let start = 0;
        while (result = reg.exec(strInput)) {
            let content = result[0];
            let emotionId = Number(content.substring(1, content.length - 1))
            if (!emotionIdValid(emotionId)) {
                continue;
            }
            if (start < result.index) {
                subtitle.push({
                    type: 'msg',
                    content: strInput.substring(start, result.index)
                })
            }

            subtitle.push({
                type: 'image',
                content: content
            })

            start = result.index + content.length;
        }

        if (start < strInput.length) {
            subtitle.push({
                type: 'msg',
                content: strInput.substr(start)
            })
        }
        return subtitle;
    };
    export function parse2SubTitleExtend(strInput: string, ignoreImg?: boolean, msgType?: number) {
        let subtitle = [];
        let start = 0;
        let reg = /#[^#]+#/g
        let colorReg = /0x[a-fA-F0-9]{6}/
        let result: RegExpExecArray;
        while (result = reg.exec(strInput)) {
            if (start < result.index) {
                subtitle.push({
                    type: 'msg',
                    content: strInput.substring(start, result.index)
                })
            }
            let content = result[0];
            let colorR: RegExpExecArray;
            let emotionId: number = parseInt(content.substring(1, content.length - 1));
            if (msgType === ChatConst.MSG_TYPE_EVENT && (colorR = colorReg.exec(content))) {
                let color = colorR[0];
                subtitle.push({
                    type: 'msg',
                    content: content.substring(colorR.index + color.length),
                    color: Number(color)
                })
            } else if (!ignoreImg && emotionIdValid(emotionId)) {
                subtitle.push({
                    type: 'image',
                    content: content
                })
            } else {
                subtitle.push({
                    type: 'replace',
                    content: content
                })
            }

            start = result.index + content.length;
        }

        if (start < strInput.length) {
            subtitle.push({
                type: 'msg',
                content: strInput.substr(start)
            })
        }
        return subtitle;
    };
    export function getNoticeType(id) {
        if (typeof id != 'number') {
            return 0;
        }
        let PaoMaDeng = G_ConfigLoader.getConfig(ConfigNameConst.PAOMADENG);
        let cfg = PaoMaDeng.get(id);
        if (cfg) {
            return cfg.type;
        } else {
            return 0;
        }
    };
    export function fillSubTitleUseReplaceTextColor(subtitles, nameColorData, noticeId, splitTitle?) {
        if (!nameColorData) {
            return subtitles;
        }
        let noticeType = getNoticeType(noticeId);
        splitTitle = splitTitle || {
            type: 'msg',
            content: '\u3001'
        };
        let count = 0;
        let newSubtitles = [];
        for (let k1 in subtitles) {
            let v = subtitles[k1];
            if (v.type == 'replace') {
                let nameColorList = nameColorData[count];
                if (nameColorList) {
                    for (let k = 0; k < nameColorList.length; k++) {
                        let nameColor = nameColorList[k];
                        if (k != 0) {
                            if (noticeType == 1) {
                                if (Number(k) % 2 == 0 && Number(k) != nameColorList.length - 1) {
                                    newSubtitles.push(splitTitle);
                                }
                            } else {
                                newSubtitles.push(splitTitle);
                            }
                        }
                        let title: any;
                        if (typeof nameColor[1] == 'string' && nameColor[1] == 'title') {
                            title = {
                                type: 'image_title',
                                content: nameColor[0]
                            };
                        } else {
                            title = {
                                type: 'msg',
                                content: nameColor[0],
                                color: nameColor[1],
                                outlineColor: nameColor[2]
                            };
                            if (title.color && title.color.b == 0 && title.color.g == 222 && title.color.r == 255) {
                                title.outlineColor = {
                                    r: 150,
                                    g: 67,
                                    b: 0
                                };
                                title.outlineSize = 1;
                                title.content = ' ' + (title.content + ' ');
                            }
                            if(typeof title.color == 'object'){
                                title.color = Colors.colorToHexStr(title.color);
                            }
                            if (title.outlineColor) {
                                title.outlineColor = Colors.colorToHexStr(new cc.Color(title.outlineColor.r, title.outlineColor.g, title.outlineColor.b));
                            }
                        }
                        newSubtitles.push(title);
                    }
                } else {
                    let title = {
                        type: 'msg',
                        content: ''
                    };
                    newSubtitles.push(title);
                }
                count = count + 1;
            } else {
                newSubtitles.push(v);
            }
        }
        return newSubtitles;
    };
    export function fillSubTitleUseColor(subtitles, nameColorData) {
        if (!nameColorData) {
            return subtitles;
        }
        let newSubtitles = [];
        for (let k in subtitles) {
            let v = subtitles[k];
            if (v.type == 'replace') {
                let title = {
                    type: 'msg',
                    content: nameColorData[0] || v.content,
                    color: nameColorData[1],
                    outlineColor: nameColorData[2]
                };
                newSubtitles.push(title);
            } else {
                newSubtitles.push(v);
            }
        }
        return newSubtitles;
    };
    export function getSubTitles(strInput, maxLength) {
        let subtitleArr = parse2SubTitle(strInput);
        let newSubtitleArr = [];
        let isCut = false;
        let currLength = 0;
        for (let i = 0; i < subtitleArr.length; i++) {
            let subtitle = subtitleArr[i];
            if (subtitle.type == 'image') {
                currLength = currLength + 3;
            } else if (subtitle.type == 'msg') {
                currLength = currLength + subtitle.content.length;
            }
            if (currLength <= maxLength) {
                newSubtitleArr.push(subtitle);
            } else {
                if (subtitle.type == 'image') {
                } else if (subtitle.type == 'msg') {
                    let cutLength = Math.abs(maxLength - currLength);
                    let utfLength = subtitle.content.length;
                    if (cutLength < utfLength) {
                        subtitle.content = subtitle.content.substring(0, utfLength - cutLength);
                        newSubtitleArr.push(subtitle);
                    }
                }
                isCut = true;
                break;
            }
        }
        return [
            newSubtitleArr,
            isCut
        ];
    };
    export function getSubText(strInput, maxLength) {
        let [subtitleArr] = getSubTitles(strInput, maxLength);
        let newStr = '';
        subtitleArr = subtitleArr as any[];
        for (let i = 0; i < subtitleArr.length; i++) {
            let subtitle = subtitleArr[i];
            if (subtitle.type == 'image') {
                newStr = newStr + subtitle.content;
            } else if (subtitle.type == 'msg') {
                newStr = newStr + subtitle.content;
            }
        }
        cc.warn(newStr);
        return newStr;
    };
    export function convertSubTitleToRichMsgArr(fontParam, subtitle, configParam?) {
        let textColor = fontParam.textColor;
        let fontSize = fontParam.fontSize;
        let outlineColor = fontParam.outlineColor;
        let outlineSize = fontParam.outlineSize || (outlineColor && 2 || null);
        let richTextSubtitle = [];
        for (let i = 0; i < subtitle.length; i++) {
            let newSubtitle: any = {};
            if (subtitle[i].type == 'image') {
                let faceId = subtitle[i].content.substring(1, subtitle[i].content.length - 1);
                newSubtitle.type = 'image';
                newSubtitle.filePath = Path.getChatFaceMiniRes(Number(faceId));
                newSubtitle.color = 16777215;
                newSubtitle.opacity = 255;
                if (configParam && configParam.faceWidth && configParam.faceHeight) {
                    newSubtitle.width = configParam.faceWidth;
                    newSubtitle.height = configParam.faceHeight;
                } else {
                    newSubtitle.width = 32;
                    newSubtitle.height = 32;
                }
                richTextSubtitle[richTextSubtitle.length] = newSubtitle;
            } else if (subtitle[i].type == 'msg' || subtitle[i].type == 'replace') {
                newSubtitle.type = 'text';
                newSubtitle.msg = subtitle[i].content;
                newSubtitle.msg = newSubtitle.msg.replace(/#/g, '');
                newSubtitle.color = subtitle[i].color || textColor;
                newSubtitle.opacity = 255;
                newSubtitle.outlineColor = subtitle[i].outlineColor;
                newSubtitle.outlineSize = subtitle[i].outlineColor && 2 || null;
                newSubtitle.fontSize = fontSize;
                if (!newSubtitle.outlineColor) {
                    newSubtitle.outlineColor = outlineColor;
                    newSubtitle.outlineSize = outlineSize;
                }
                richTextSubtitle[richTextSubtitle.length] = newSubtitle;
            } else if (subtitle[i].type == 'image_title') {
                newSubtitle.type = 'image';
                newSubtitle.filePath = Path.getChatFaceMiniRes(subtitle[i].content);
                let size = PopupHonorTitleHelper.getTitleSizeByImageId(subtitle[i].content);
                let scale = HonorTitleConst.TITLE_CONFIG['ChatMiniMsgItemCell'][1] as number;
                newSubtitle.width = size.width * scale;
                newSubtitle.height = size.height * scale;
                newSubtitle.opacity = 255;
                richTextSubtitle[richTextSubtitle.length] = newSubtitle;
            }
        }
        return richTextSubtitle;
    };
    export function parse2RichMsgArr(obj, configParam?) {
        let strInput = obj.strInput;
        let type = obj.msgType;
        let subtitle = parse2SubTitleExtend(strInput, null, type);
        let richTextSubtitle = convertSubTitleToRichMsgArr(obj, subtitle, configParam);
        return richTextSubtitle;
    };
    export function parse2MiniRichMsgArr(obj, maxLength) {
        maxLength = maxLength || 9;
        let [subTitleArr, isCut]: any = getSubTitles(obj.strInput, maxLength);
        if (isCut) {
            subTitleArr[subTitleArr.length] = {
                type: 'msg',
                content: '...'
            };
        }
        let richTextSubtitle = convertSubTitleToRichMsgArr(obj, subTitleArr);
        return richTextSubtitle;
    };
    export function convertServerNoticePairs(noticePairs, convertFunc) {
        function convertServerData(noticePairs) {
            let list = [];
            for (let i in noticePairs) {
                let value = noticePairs[i];
                let data = {
                    key: value.key,
                    value: value.value,
                    key_type: value.key_type,
                    key_value: value.key_value,
                };
                if (convertFunc) {
                    data = convertFunc(data);
                }
                list.push(data);
            }
            return list;
        }
        return convertServerData(noticePairs);
    };
    export function convertRichTextByNoticePairs(contentText, noticePairs, fontSize, defalutColor, outlineColor?, outlineSize?) {
        let textTable = TextHelper.parseNoticePairs(contentText, noticePairs);
        fontSize = fontSize || 22;
        defalutColor = defalutColor || Colors.DARK_BG_ONE;
        let richContents = [];
        for (let i in textTable) {
            let value = textTable[i];
            let tempColor = defalutColor;
            if (value.color != null) {
                tempColor = value.color;
            }
            let tempColorOutline = null;
            if (value.outlineColor) {
                tempColorOutline = value.outlineColor;
            }
            let content = {
                type: 'text',
                msg: value.content,
                color: tempColor,
                outlineColor: tempColorOutline,
                outlineSize: 2,
                fontSize: fontSize,
                opacity: 255
            };
            if (outlineColor) {
                content.outlineColor = outlineColor;
            }
            if (outlineSize) {
                content.outlineSize = outlineSize;
            }
            richContents.push(content);
        }
        return richContents;
    };
    export function getRichMsgListForHashText(text, highlightColor, defalutColor, defaultFontSize) {
        let subTitles = parse2SubTitleExtend(text, true);
        subTitles = fillSubTitleUseColor(subTitles, [
            null,
            highlightColor,
            null
        ]);
        let richElementList = convertSubTitleToRichMsgArr({
            textColor: defalutColor,
            fontSize: defaultFontSize
        }, subTitles);
        return richElementList;
    };
};