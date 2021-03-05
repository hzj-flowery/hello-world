import ParseRichTextStringHelp from "../utils/ParseRichTextStringHelp";
import { Path } from "../utils/Path";
import LabelOutlineExtend from "./LabelOutlineExtend";

export namespace RichTextExtend {
    function toColorHexStr(color): string {
        if (color instanceof cc.Color) {
            return color.toHEX('#rrggbb');
        } else if (typeof color == 'string') {
            let result: RegExpExecArray;
            if (color.charAt(0) == '#') {
                return color;
            } else if (result = /rgba\((\d+), (\d+), (\d+), \d+\)/.exec(color)) {
                return `#${Number(result[1]).toString(16)}${(Number(result[2]).toString(16))}${Number(result[3]).toString(16)}`
            }
            else if (color.indexOf("0x") >= 0) {
                return color.replace("0x", "#");
            }
            else {
                color = Number(color);
                if (!color && color !== 0) {
                    console.warn('unknown color', color);
                    return '';
                }

            }
        }

        if (typeof color == "number") {
            let hex = Number(color).toString(16);
            while (hex.length < 6) {
                hex = '0' + hex;
            }
            hex = '#' + hex;
            return hex;
        }
    }

    // export function toColor3B(num) {
    //     if (!num) {
    //         return cc.color(0, 0, 0);
    //     }
    //     var hex = 16;
    //     function _hexConvert(raw, bit) {
    //         return Math.floor(raw / Math.pow(hex, bit - 1)) % hex;
    //     }
    //     return cc.color(_hexConvert(num, 6) * hex + _hexConvert(num, 5), _hexConvert(num, 4) * hex + _hexConvert(num, 3), _hexConvert(num, 2) * hex + _hexConvert(num, 1));
    // }

    // export function toColor4B(num) {
    //     var color = toColor3B(num);
    //     return cc.color(color.getR(), color.getG(), color.getB(), 255);
    // };

    // export function colorToNumber(color) {
    //     if (typeof (color) == 'object') {
    //         var num = 0;
    //         if (color.getR()) {
    //             num = num + color.getR() * 65536;
    //         }
    //         if (color.getG()) {
    //             num = num + color.getG() * 256;
    //         }
    //         if (color.getB()) {
    //             num = num + color.getB();
    //         }
    //         return num;
    //     } else {
    //         return parseInt(color);
    //     }
    // }

    export function createWithContent(content) {
        var node: cc.Node = new cc.Node();
        var richText = node.addComponent(cc.RichText);
        if (typeof (content) != 'object') {
            setRichTextWithJson(richText, content);
        }
        else {
            setRichText(richText, content);
        }
        return richText;
    }

    export function udpateWithContent(richText, content) {
        if (typeof (content) != 'object') {
            setRichTextWithJson(richText, content);
        }
        else {
            setRichText(richText, content);
        }
        return richText;
    }

    export function setRichTextWithJson(richText, jsonContent) {
        //console.log(jsonContent);
        var content = JSON.parse(jsonContent);
        setRichText(richText, content);
    }

    export function createRichTextByFormatString(formatStr, params?) {
        var contents = ParseRichTextStringHelp.parse(formatStr, params);
        var node: cc.Node = new cc.Node();
        var richText = node.addComponent(cc.RichText);
        richText.maxWidth = 1000;
        if (richText) {
            setRichText(richText, contents);
        }
        return richText;
    }

    export function setRichTextByFormatString(richText: cc.RichText, formatStr, params?) {
        var contents = ParseRichTextStringHelp.parse(formatStr, params);
        if (richText) {
            setRichText(richText, contents);
        }
    }

    export function createRichTextByFormatString2(formatStr, defaultColor, defaultSize) {
        return createRichTextByFormatString(formatStr, {
            defaultColor: defaultColor,
            defaultSize: defaultSize
        });
    }

    export function setRichText(richText: cc.RichText, content: any[] | any) {

        if (!content || typeof content != 'object') {
            return;
        }

        let xml = '';
        let fontSize = 0;
        if (content instanceof Array) {
            cc.resources.load(Path.getCommonFont(), cc.Font, (err, resource) => {
                if (richText.isValid) {
                    richText.font = resource;
                }
            })

            for (let i = 0; i < content.length; i++) {
                let _content = content[i];
                console.assert(_content.type, "The richtext type could not be nil !")

                if (_content.opacity && _content.opacity != 255) {
                    console.warn('richtext unsupport change opacity!');
                }

                if (_content.fontSize && _content.fontSize > fontSize) {
                    fontSize = _content.fontSize;
                }

                let subXml = createRichTextString(richText, _content);
                xml += subXml;
            }
        } else if (content.type) {
            let fontName = content.fontName || Path.getCommonFont();
            cc.resources.load(fontName, cc.Font, (err, resource) => {
                if (richText.isValid) {
                    richText.font = resource;
                }
            });

            xml = createRichTextString(richText, content);

        }

        fontSize = fontSize || 26;
        richText.node.opacity = 255;
        richText.fontSize = fontSize;
        richText.lineHeight = fontSize;
        richText.string = xml;
        richText.scheduleOnce(() => {
            setRichTextMaterial(richText);
        }, 0);
    }

    function createRichTextString(richText: cc.RichText, content) {

        let fontSize = content.fontSize || 26;
        let color = toColorHexStr(content.color);

        let subXml: string;
        if (content.type == 'text') {
            subXml = `<size=${fontSize}><color=${color}>${content.msg}</color></size>`;
            if (content.outlineColor) {
                let outlineColor = toColorHexStr(content.outlineColor);
                subXml = `<outline color=${outlineColor} width=${content.outlineSize}>${subXml}</outline>`
            }
        } else if (content.type == 'image') {
            let { atlas, name } = getAtlas(content.filePath);
            cc.resources.load(atlas, cc.SpriteAtlas, (err, resource) => {
                if (richText.isValid) {
                    richText.imageAtlas = resource;
                }
            })

            subXml = `<img src='${name}' `;
            if (content.width) {
                subXml += ' width=' + content.width;
            }
            if (content.height) {
                subXml += ' height=' + content.height;
            }
            subXml += ' />';
        } else if (content.type == 'custom') {
            cc.warn('unsupport richtext custom!');
        } else {
            cc.warn('Unknown richtext type: ', String(content.type));
        }

        return subXml || "";
    }

    function getAtlas(path: string) {
        let i = path.lastIndexOf('/');
        let atlas = path.substring(0, i);
        let name = path.substring(i + 1);

        i = name.lastIndexOf('.');
        if (i > -1) {
            name = name.substring(0, i);
        }

        return {
            atlas: atlas,
            name: name
        }
    }

    function setRichTextMaterial(richText: cc.RichText) {
        for (let i = 0; i < richText.node.childrenCount; i++) {
            let label = richText.node.children[i].getComponent(cc.Label);
            if (label == null) {
                continue;
            }
            let labelMaterial: cc.Material = cc.resources.get(Path.getMaterial("bm-2d-label"), cc.Material);
            if (labelMaterial != null) {
                label.setMaterial(0, labelMaterial);
                setRichTextOutline(label);
                continue;
            }
            cc.resources.load(Path.getMaterial("bm-2d-label"), cc.Material, function (err, res: cc.Material) {
                if (!err && res && label != null && label.node != null && label.node.isValid) {
                    label.setMaterial(0, res);
                    setRichTextOutline(label);
                }
            });
        }
    }

    function setRichTextOutline(label: cc.Label) {
        if (label == null) {
            return;
        }
        let ccOutline = label.node.getComponent(cc.LabelOutline);
        if (ccOutline == null) {
            return;
        }
        let outline = label.node.addComponent(LabelOutlineExtend);
        outline.color = ccOutline.color;
        ccOutline.destroy();
    }
}