import { ConfigNameConst } from "../const/ConfigNameConst";
import ParameterIDConst from "../const/ParameterIDConst";
import LabelOutlineExtend from "../extends/LabelOutlineExtend";
import { RichTextExtend } from "../extends/RichTextExtend";
import { Colors, G_ConfigLoader, G_ResolutionManager } from "../init";
import { Lang } from "../lang/Lang";
import CommonDetailTitleWithBg from "../ui/component/CommonDetailTitleWithBg";
import CommonIconTemplate from "../ui/component/CommonIconTemplate";
import { Color } from "./Color";
import { Path } from "./Path";
import { TypeConvertHelper } from "./TypeConvertHelper";

export default class UIHelper {
    public static loadTexture(sprite: cc.Sprite, spriteFramePath: string, size?: cc.Size) {
        if (sprite == null) {
            return;
        }
        var res = cc.resources.get(spriteFramePath, cc.SpriteFrame);
        if (res) {
            if (sprite.node && sprite.isValid) {
                sprite.spriteFrame = res;
                if (size) {
                    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                    sprite.node.setContentSize(size);
                }
            }
        }
        else {
            cc.resources.load(spriteFramePath, cc.SpriteFrame, function (err, res: any) {
                if (err) {
                    return;
                }
                if (res) {
                    if (sprite.node && sprite.isValid) {
                        sprite.spriteFrame = res;
                        size && sprite.node.setContentSize(size);
                    }
                }
            });
        }
    }

    public static loadTextureFromAtlas(sprite: cc.Sprite, spriteFramePath: string, size?: cc.Size) {
        if (sprite == null) {
            return;
        }
        var index = spriteFramePath.lastIndexOf('/');
        var atlasPath = spriteFramePath.substr(0, index);
        var framePath = spriteFramePath.substr(index + 1);
        cc.resources.load(atlasPath, cc.SpriteAtlas, function (err, res: cc.SpriteAtlas) {
            if (err) {
                return;
            }
            if (res) {
                if (sprite.node && sprite.node.isValid) {
                    sprite.spriteFrame = res.getSpriteFrame(framePath);
                    size && sprite.node.setContentSize(size);
                }
            }
        })
    }

    public static loadTextureAutoSize(sprite: cc.Sprite, spriteFramePath: string, callBack?) {
        if (sprite == null) {
            return;
        }
        cc.resources.load(spriteFramePath, cc.SpriteFrame, function (err, res: cc.SpriteFrame) {
            if (err) {
                return;
            }
            if (res) {
                if (sprite.node && sprite.node.isValid) {
                    sprite.spriteFrame = res;
                    sprite.node.setContentSize(res.getOriginalSize());
                    if (callBack) {
                        callBack(sprite);
                    }
                }
            }
        })
    }

    public static newSprite(spritePath: string, size?: cc.Size): cc.Sprite {
        let sprite: cc.Sprite = new cc.Node().addComponent(cc.Sprite);
        this.loadTexture(sprite, spritePath, size);
        return sprite;
    }

    public static newRichText(str?, color?, fontSize?) {
        var txtNode: cc.Node = new cc.Node();
        var txt = txtNode.addComponent(cc.RichText);
        if (color) {
            txtNode.color = color;
        }
        if (fontSize) {
            txt.fontSize = fontSize;
        }
        if (str) {
            txt.string = str;
        }
        return txtNode;
    }

    public static enableOutline(label: cc.Label, color: cc.Color, width?: number): cc.LabelOutline {
        let labelOutline: cc.LabelOutline = label.node.getComponent(LabelOutlineExtend) || label.node.addComponent(LabelOutlineExtend);
        labelOutline.color = color || cc.Color.WHITE;
        labelOutline.width = width || 1;
        if (!labelOutline.enabled) {
            labelOutline.enabled = true;
        }
        return labelOutline;
    }

    public static disableOutline(label: cc.Label) {
        let labelOutline: cc.LabelOutline = label.node.getComponent(LabelOutlineExtend);
        if (labelOutline) {
            labelOutline.enabled = false;
        }
    }

    public static updateTextOutline(label: cc.Label, params) {
        if (params.icon_color_outline_show) {
            UIHelper.enableOutline(label, params.icon_color_outline, 2)
        } else {
            UIHelper.disableOutline(label)
        }
    }

    public static loadBtnTexture(btn: cc.Button, normalImg, selectImg?, disableImg?) {
        if (btn == null) {
            return;
        }
        cc.resources.load(normalImg, cc.SpriteFrame, function (err, res: any) {
            if (res && btn.isValid) {
                btn.normalSprite = res;
                btn.getComponent(cc.Sprite).spriteFrame = res;
            }
        })
        if (selectImg) {
            cc.resources.load(selectImg, cc.SpriteFrame, function (err, res: any) {
                if (res && btn.isValid) {
                    btn.pressedSprite = res;
                }
            })
        }
        if (disableImg) {
            cc.resources.load(disableImg, cc.SpriteFrame, function (err, res: any) {
                if (res && btn.isValid) {
                    btn.disabledSprite = res;
                }
            })
        }
    }
    public static loadBtnTextureFromAtlas(btn: cc.Button, normalImg, selectImg?, disableImg?) {
        if (btn == null) {
            return;
        }
        var index = normalImg.lastIndexOf('/');
        var atlasNormal = normalImg.substr(0, index);
        var frameNormal = normalImg.substr(index + 1);
        cc.resources.load(atlasNormal, cc.SpriteAtlas, function (err, res: cc.SpriteAtlas) {
            if (res) {
                var spriteFrame = res.getSpriteFrame(frameNormal);
                btn.normalSprite = spriteFrame;
                var sprite = btn.getComponent(cc.Sprite);
                if (sprite) {
                    sprite.spriteFrame = spriteFrame;
                }
                //btn.node.setContentSize(spriteFrame.getOriginalSize());
            }
        })
        if (selectImg) {
            var index = selectImg.lastIndexOf('/');
            var atlas = selectImg.substr(0, index);
            var frame = selectImg.substr(index + 1);
            cc.resources.load(atlas, cc.SpriteAtlas, function (err, res: cc.SpriteAtlas) {
                if (res) {
                    var spriteFrame = res.getSpriteFrame(frame);
                    btn.pressedSprite = spriteFrame;
                }
            })
        }
        if (disableImg) {
            var index = disableImg.lastIndexOf('/');
            var atlas = disableImg.substr(0, index);
            var frame = disableImg.substr(index + 1);
            cc.resources.load(disableImg, cc.SpriteAtlas, function (err, res: cc.SpriteAtlas) {
                if (res) {
                    var spriteFrame = res.getSpriteFrame(frame);
                    btn.disabledSprite = spriteFrame;
                }
            })
        }
    }

    public static updateNodeInfo = function (node, params) {
        console.assert(node, params, ('Invalid node: %s param: %s' as any));
        if (params.contentSize) {
            node.setContentSize(params.contentSize);
        }
        if (params.name) {
            node.name = (params.name);
        }
        if (params.anchorPoint) {
            node.setAnchorPoint(params.anchorPoint);
        }
        if (params.position) {
            node.setPosition(params.position.x, params.position.y);
        }
        //  node.setCascadeOpacityEnabled(true);
    }

    public static createRichItems = function (paramsTable, adaptSize) {
        var rangSize = new cc.Size(0, 0);
        var node = new cc.Node();
        for (var i in paramsTable) {
            var value = paramsTable[i];
            var widget = null;
            if (value.type == 'label') {
                widget = UIHelper.createLabel(value);
                widget.getComponent(cc.Label)["_updateRenderData"](true);
            } else if (value.type == 'image') {
                widget = UIHelper.createImage(value);
                widget.getComponent(cc.Sprite).SizeMode = cc.Sprite.SizeMode.RAW;
            }
            if (widget == null) {
                //assert((false, 'params must set type name !!!');
            }

            if (value.anchorPoint) {
                widget.setAnchorPoint(value.anchorPoint);
            } else {
                widget.setAnchorPoint(new cc.Vec2(0, 0));
            }
            node.addChild(widget);
            widget.x = (rangSize.width);
            var widgetSize = value.size || widget.getContentSize();
            var widgetWidth = widgetSize.width;
            if (value.scale) {
                widget.setScale(value.scale);
                widgetWidth = widgetSize.width * value.scale;
            }
            rangSize.width = rangSize.width + widgetWidth;
            rangSize.height = Math.max(widgetSize.height, rangSize.height);

        }
        if (adaptSize == null) {
            node.setContentSize(rangSize);
        }
        return node;
    };

    public static createLabels = function (paramsTable) {
        var rangSize = new cc.Size(0, 0)
        var node = new cc.Node();
        for (var i in paramsTable) {
            var value = paramsTable[i];
            var label = UIHelper.createLabel(value);
            UIHelper.updateLabelSize(label.getComponent(cc.Label));
            label.setAnchorPoint(value.anchorPoint || new cc.Vec2(0, 0));
            label.x = (rangSize.width);
            var labelSize = label.getContentSize();
            rangSize.width = rangSize.width + labelSize.width;
            rangSize.height = labelSize.height;
            node.addChild(label);
        }
        node.x = -rangSize.width / 2;
        node.setContentSize(rangSize);
        let node2 = new cc.Node();
        node2.addChild(node);
        return node2;
    };

    public static createLabel = function (params?, builtinMaterial = false) {
        params = params || {};
        var fontSize = params.fontSize || 22;
        var fontPath = params.fontName || Path.getCommonFont();
        // var lineHeight = params.lineHeight || Path.getCommonFontLineHeight();
        var lineHeight = params.lineHeight || fontSize;
        var text = params.text || '';
        var uiText = new cc.Node();
        var label: cc.Label = uiText.addComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = lineHeight;
        if (params.color != null) {
            uiText.color = (params.color);
        }
        if (params.outlineColor != null) {
            UIHelper.enableOutline(label, params.outlineColor, params.outlineSize || 2);
        }
        UIHelper.updateNodeInfo(uiText, params);

        UIHelper.setLabelFont(label, fontPath);

        if (builtinMaterial) {
            return uiText;
        }
        UIHelper.setLabelMaterial(label);
        return uiText;
    }

    public static setLabelFont(label: cc.Label, fontPath?: string) {
        fontPath = fontPath || Path.getCommonFont();
        let font = cc.resources.get(fontPath, cc.Font);
        if (font != null) {
            label.font = font;
            return;
        }
        cc.resources.load(fontPath, cc.Font, function (err, res: cc.Font) {
            if (!err && res && label != null && label.node != null && label.node.isValid) {
                label.font = res;
            }
        })
    }

    public static setLabelMaterial(label: cc.Label) {
        if (label == null) {
            return;
        }
        let labelMaterial: cc.Material = cc.resources.get(Path.getMaterial("bm-2d-label"), cc.Material);
        if (labelMaterial != null) {
            label.setMaterial(0, labelMaterial);
            return;
        }
        cc.resources.load(Path.getMaterial("bm-2d-label"), cc.Material, function (err, res: cc.Material) {
            if (!err && res && label != null && label.node != null && label.node.isValid) {
                label.setMaterial(0, res);
            }
        });
    }

    public static updateLabel(lable: cc.Label, param: any) {
        if (lable == null) {
            return;
        }
        if (param.visible != null) {
            lable.node.active = param.visible;
        }
        if (param.text != null) {
            lable.string = param.text;
        }
        if (param.color != null) {
            lable.node.color = param.color;
        }
        if (param.outlineColor != null) {
            UIHelper.enableOutline(lable, param.outlineColor, 2);
        }
    }

    public static createTwoLabel(params1, params2) {
        var node = new cc.Node();
        var label1 = this.createLabel(params1);
        label1.setAnchorPoint(cc.v2(0, 0));
        var label2 = this.createLabel(params2);
        label2.setAnchorPoint(cc.v2(0, 0));
        node.addChild(label1);
        label1.getComponent(cc.Label)['_updateRenderData'](true);
        label2.x = label1.width;
        node.addChild(label2);
        label2.getComponent(cc.Label)['_updateRenderData'](true);
        node.setContentSize(label1.width + label2.width, label1.height);
        return node;
    }

    public static createWithTTF = function (text: string, ttfPath: string, fontSize: number): cc.Label {
        let label: cc.Label = UIHelper.createLabel({ text: text, fontSize: fontSize }).getComponent(cc.Label);
        return label;
    }

    public static createWithCharMap = function (path: string) {
        let label: cc.Label = UIHelper.createLabel({}, true).getComponent(cc.Label);
        cc.resources.load(path, cc.LabelAtlas, function (err, res: cc.LabelAtlas) {
            if (!err && res) {
                label.font = res;
            }
        })
        return label;
    }

    public static setFontName(label: cc.Label, path: string) {
        cc.resources.load(path, cc.BitmapFont, function (err, res: any) {
            if (!err && res && label != null && label.node.isValid) {
                label.font = res;
            }
        })
    }

    public static createPanel = function (params) {
        var panel = new cc.Node();
        panel.addComponent(cc.Layout);
        UIHelper.updateNodeInfo(panel, params);
        return panel;
    }

    public static createImage(params) {
        var uiImage = new cc.Node();
        UIHelper.updateNodeInfo(uiImage, params);
        var sprite = uiImage.addComponent(cc.Sprite);
        if (!params.adaptWithSize) {
            //  uiImage.ignoreContentAdaptWithSize(true);
        }
        if (params.texture) {
            UIHelper.loadTexture(sprite, params.texture);
        }
        if (params.name) {
            uiImage.name = (params.name);
        }
        if (params.scale) {
            uiImage.setScale(params.scale);
        }
        if (params.rotation) {
            uiImage.setRotation(params.rotation);
        }
        return uiImage;
    }

    public static createImageEx(params) {
        var uiImage = new cc.Node();
        UIHelper.updateNodeInfo(uiImage, params);
        var sprite = uiImage.addComponent(cc.Sprite);
        if (!params.adaptWithSize) {
            //  uiImage.ignoreContentAdaptWithSize(true);
        }
        if (params.texture) {
            UIHelper.loadTextureAutoSize(sprite, params.texture, params.callBack);
        }
        if (params.name) {
            uiImage.name = (params.name);
        }
        return uiImage;
    }


    public static createBaseIcon(type) {
        var rootNode = new cc.Node();
        //   rootNode.setCascadeOpacityEnabled(true);
        if (type == TypeConvertHelper.TYPE_EQUIPMENT || type == TypeConvertHelper.TYPE_PET) {
            var nodeEffectDown = new cc.Node('NodeEffectDown');
            rootNode.addChild(nodeEffectDown);
        }
        var imageBkParam = {
            contentSize: cc.size(98, 98),
            anchorPoint: cc.v2(0.5, 0.5),
            position: cc.v2(0, 0),
            name: 'ImageBg',
            texture: TypeConvertHelper.getTypeClass(type) != null ? '' : Path.getUICommonFrame('img_frame_bg01')
        };
        var imageBg = UIHelper.createImage(imageBkParam);
        rootNode.addChild(imageBg);
        if (type == TypeConvertHelper.TYPE_SILKBAG) {
            var imageMidParam = {
                contentSize: cc.size(82, 82),
                anchorPoint: cc.v2(0.5, 0.5),
                position: cc.v2(0, 0),
                name: 'ImageMidBg'
            };
            var imageMidBg = UIHelper.createImage(imageMidParam);
            rootNode.addChild(imageMidBg);
        }
        var res = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DEFAULT_ICON).content;
        var imageIconParam = {
            contentSize: cc.size(50, 50),
            anchorPoint: cc.v2(0.5, 0.5),
            position: cc.v2(0, 0),
            name: 'ImageIcon',
            texture: TypeConvertHelper.getTypeClass(type) != null ? '' : Path.getDefaultIcon(res)
        };
        //console.log("------------",imageIconParam.texture,imageBkParam.texture,type);
        var imageIcon = UIHelper.createImage(imageIconParam);
        rootNode.addChild(imageIcon);
        if (type == TypeConvertHelper.TYPE_EQUIPMENT || type == TypeConvertHelper.TYPE_PET || type == TypeConvertHelper.TYPE_HORSE || type == TypeConvertHelper.TYPE_SILKBAG) {
            var nodeEffectUp = new cc.Node('NodeEffectUp');
            rootNode.addChild(nodeEffectUp);
        }
        if (type == TypeConvertHelper.TYPE_EQUIPMENT || type == TypeConvertHelper.TYPE_TREASURE) {
            var NodeJadeSlot = new cc.Node('NodeJadeSlot');
            NodeJadeSlot.setPosition(-1, -44);
            rootNode.addChild(NodeJadeSlot);
        }
        if (type == TypeConvertHelper.TYPE_HORSE) {
            var imageEquipBriefParam = {
                anchorPoint: cc.v2(0.5, 0.5),
                position: cc.v2(0, -44),
                name: 'ImageEquipBrief',
                texture: Path.getHorseImg('img_horse01')
            };
            var imageEquipBrief = UIHelper.createImage(imageEquipBriefParam);
            imageEquipBrief.active = (false);
            rootNode.addChild(imageEquipBrief);
            for (var i = 1; i <= 3; i++) {
                var imgBriefParam = {
                    anchorPoint: cc.v2(0.5, 0.5),
                    position: cc.v2(12 + 21 * (i - 1) - 32, 11.8 - 12),
                    name: 'imgBrief_' + i,
                    texture: Path.getHorseImg('img_horse04')
                };
                var imgBrief = UIHelper.createImage(imgBriefParam);
                imgBrief.active = (false);
                imageEquipBrief.addChild(imgBrief);
            }
        }
        if (type == TypeConvertHelper.TYPE_HEAD_FRAME) {
            var redPointIconParam = {
                contentSize: cc.size(26, 26),
                anchorPoint: cc.v2(0.5, 0.5),
                position: cc.v2(38, 38),
                name: 'RedPoint',
                texture: Path.getRedPointImage()
            };
            var redPointImg = UIHelper.createImage(redPointIconParam);
            rootNode.addChild(redPointImg);
        }
        var imageDoubleParam = {
            contentSize: cc.size(98, 98),
            anchorPoint: cc.v2(0.5, 0.5),
            position: cc.v2(-22.28, 33.54),
            name: 'ImageDoubleTips',
            texture: Path.getTextSignet('txt_com_double01'),
            rotation: 5
        };
        var ImageDoubleTips = UIHelper.createImage(imageDoubleParam);
        ImageDoubleTips.active = (false);
        rootNode.addChild(ImageDoubleTips);
        if (type == TypeConvertHelper.TYPE_PET) {
            var starRoot = new cc.Node();
            starRoot.name = ('starRoot');
            starRoot.setPosition(cc.v2(-42, -47));
            starRoot.setScale(0.6);
            rootNode.addChild(starRoot);
            for (var i = 1; i <= 5; i++) {
                var imgStarParam = {
                    anchorPoint: cc.v2(0, 0),
                    position: cc.v2(0 + 26 * (i - 1), 0),
                    name: 'ImageStar' + i,
                    texture: Path.getCommonImage('img_lit_stars02')
                };
                var starImg = UIHelper.createImage(imgStarParam);
                starImg.active = (false);
                starRoot.addChild(starImg);
            }
        }
        return rootNode;
    }

    //创建图标(需要先load资源)
    static createIconTemplate(cellValue, scale) {
        if (cellValue == null) {
            return null;
        }
        scale = scale || 1;
        var widget = new cc.Node();

        var resource = cc.resources.get("prefab/common/CommonIconTemplate");
        widget = cc.instantiate(resource) as cc.Node;
        let uiNode = widget.getComponent(CommonIconTemplate);
        uiNode.initUI(cellValue.type, cellValue.value, cellValue.size);
        uiNode.node.setScale(scale);
        uiNode.setTouchEnabled(true);
        var panelSize = uiNode.getPanelSize();
        if (cellValue.type == TypeConvertHelper.TYPE_TITLE) {
            uiNode.node.setScale(0.8);
            panelSize.width = panelSize.width * 0.9;
            panelSize.height = panelSize.height * 0.9;
        } else {
            panelSize.width = panelSize.width * scale;
            panelSize.height = panelSize.height * scale;
        }
        widget.setContentSize(panelSize);
        widget.setAnchorPoint(cc.v2(0, 0));
        uiNode.node.x = (panelSize.width * 0.5);
        uiNode.node.y = (panelSize.height * 0.5);
        return [
            widget,
            uiNode
        ];
    }

    static createMultiAutoCenterRichText(formatStr, defaultColor, fontSize, YGap, alignment, widthLimit?) {
        return UIHelper.createMultiAutoCenterRichTextByParam(formatStr, {
            defaultColor: defaultColor,
            defaultSize: fontSize
        }, YGap, alignment, widthLimit, null);
    }

    static createMultiAutoCenterRichTextByParam(formatStr, param, YGap, alignment, widthLimit, split) {
        if (!YGap) {
            YGap = 5;
        }
        var defaultColor = param.defaultColor;
        var fontSize = param.defaultSize;
        if (!fontSize) {
            fontSize = 22;
        }
        if (!defaultColor) {
            defaultColor = Colors.BRIGHT_BG_ONE;
        }
        if (!alignment) {
            alignment = 2;
        }
        var formatStrArr = formatStr.split(split || '|');
        var parentNode = new cc.Node();
        parentNode.addComponent(cc.Widget);
        var widgets = [];
        var maxWidth = 0;
        var totalHeight = 0;
        var heights = [];
        var widths = [];
        for (var k in formatStrArr) {
            var v = formatStrArr[k];
            //console.log(v);
            var curWidth, curHeight;
            if (v == '') {
                widgets.push({ type: 'empty' });
                curWidth = widthLimit;
                curHeight = fontSize;
            } else {
                var richtext = RichTextExtend.createRichTextByFormatString(v, param);
                if (widthLimit && widthLimit > 0) {
                    // richtext.setVerticalSpace(YGap);
                    // richtext.ignoreContentAdaptWithSize(false);
                    //richtext.node.setContentSize(widthLimit, 0);
                    richtext.node.setAnchorPoint(0, 1);
                    richtext.node.width = widthLimit;
                    richtext.maxWidth = widthLimit;
                    richtext.lineHeight = fontSize + 4;
                    // richtext.formatText();
                } else {
                    // richtext.formatText();
                }
                parentNode.addChild(richtext.node);
                var widgetSize = richtext.node.getContentSize();
                curWidth = widgetSize.width;
                curHeight = widgetSize.height;
                widgets.push({
                    type: 'richText',
                    node: richtext.node
                });
            }
            if (curWidth > maxWidth) {
                maxWidth = curWidth;
            }
            totalHeight = totalHeight + curHeight;
            heights.push(curHeight);
            widths.push(curWidth);
        }
        if (heights.length >= 2) {
            totalHeight = totalHeight + (heights.length - 1) * YGap;
        }
        parentNode.setContentSize(maxWidth, totalHeight);
        parentNode.setAnchorPoint(0, 0);
        var curHeight2 = totalHeight;
        if (alignment == 1) {
            for (k in widgets) {
                var v = widgets[k];
                if (v.type == 'richText') {
                    v.node.setAnchorPoint(0, 1);
                    v.node.setPosition(0, curHeight2);
                }
                curHeight2 = curHeight2 - heights[k] - YGap;
            }
        } else if (alignment == 2) {
            for (k in widgets) {
                var v = widgets[k];
                if (v.type == 'richText') {
                    v.node.setAnchorPoint(0, 1);
                    v.node.setPosition((maxWidth - widths[k]) / 2, curHeight2);
                }
                curHeight2 = curHeight2 - heights[k] - YGap;
            }
        } else {
            for (k in widgets) {
                var v = widgets[k];
                if (v.type == 'richText') {
                    v.node.setAnchorPoint(1, 1);
                    v.node.setPosition(maxWidth, curHeight2);
                }
                curHeight2 = curHeight2 - heights[k] - YGap;
            }
        }
        return parentNode;
    }
    public static insertCurstomListContent(originNode: cc.Node, addNode: cc.Node, dir: number = 1): void {
        var originSize: cc.Size = originNode.getContentSize();
        addNode.setAnchorPoint(0, 0);
        var pos = cc.v2(addNode.x, originSize.height * dir);
        originNode.setContentSize(originSize.width, originSize.height + addNode.getContentSize().height);
        originNode.addChild(addNode);
        addNode.setPosition(pos);
        // console.log("-------", pos);
    }
    /**
     * 
     * @param originNode 
     * @param addNode 
     * @param pos 位置从0走
     */
    public static insertCurstomListContentByPos(originNode: cc.Node, addNode: cc.Node, pos: number = 0): void {
        var childs = originNode.children;
        var dajustPos = function (originNode: cc.Node, addNode: cc.Node) {
            var originSize: cc.Size = originNode.getContentSize();
            addNode.setAnchorPoint(0, 0);
            var pos = cc.v2(addNode.x, originSize.height);
            originNode.setContentSize(originSize.width, originSize.height + addNode.getContentSize().height);
            addNode.setPosition(pos);
        }
        var opSize = originNode.getContentSize();
        originNode.setContentSize(opSize.width, 0);
        for (var j = 0; j < childs.length; j++) {
            if (j != pos) {
                dajustPos(originNode, childs[j]);
            }
            else if (j == pos) {
                dajustPos(originNode, addNode);
                dajustPos(originNode, childs[j]);
            }
        }
    }

    public static updateCurstomListSize2(): void {

    }
    public static updateCurstomListSize(originNode: cc.Node, addNode: cc.Node): void {
        originNode.addChild(addNode);
        var originSize: cc.Size = originNode.getContentSize();
        addNode.setAnchorPoint(0, 0);
        var pos = cc.v2(addNode.x, originSize.height);
        originNode.setContentSize(originSize.width, originSize.height + addNode.getContentSize().height);
        addNode.setPosition(pos);
    }

    public static updateTextOfficialOutline(text: cc.Node, officialLevel) {
        var isShow = Colors.isOfficialColorOutlineShow(officialLevel);
        if (isShow) {
            var colorOutline = Colors.getOfficialColorOutline(officialLevel);
            UIHelper.enableOutline(text.getComponent(cc.Label), colorOutline, 2);
        } else {
            text.removeComponent(LabelOutlineExtend);
        }
    }

    public static convertSpaceFromNodeToNode(srcNode: cc.Node, tarNode: cc.Node, pos?: cc.Vec2): cc.Vec2 {
        var pos = pos || new cc.Vec2(0, 0);
        var worldPos = srcNode.convertToWorldSpaceAR(pos);
        var p = new cc.Vec2(0, 0)
        tarNode.convertToNodeSpaceAR(worldPos, p);
        return p;
    };

    /**
     * 
     * @param data 
     * string or array
     * param:[
     * msg
     * fontSize
     * color
     * filePath
     * ]
     */
    public static getRichTextContent(data: any): string {

        if (typeof (data) == "string" && (data.indexOf("}") >= 0 || data.indexOf("[") >= 0)) {
            data = JSON.parse(data);
        }
        else if (typeof (data) == "string") {
            return data;
        }
        var p = "";
        var str = "";
        for (var j = 0; j < data.length; j++) {
            var color = data[j].color;
            var img = data[j]["filePath"];
            var imgP = "";
            if (img && img != "") {
                imgP = "<img src=" + img + ">";
            }
            if (typeof (color) != "string") {
                if (data[j].color instanceof cc.Color)
                    color = Colors.colorToHexStr(data[j].color);
                else if (typeof (color) == "number") {
                    var c = Color.toColor4B(color);
                    //color = "#" + (data[j].color as number).toString(16);
                    color = Color.colorToHexStr(c);
                }
            }
            else {
                var origin = (data[j].color as string)
                var temp = origin.replace("0x", "#");
                color = temp;
            }
            if (imgP != "") {
                "<color=" + color + ">" + imgP + "<size=" + data[j].fontSize + ">" + data[j].msg + "</size>" + "</img>" + "</color>";
            }
            else {
                str = "<color=" + color + ">" + "<size=" + data[j].fontSize + ">" + data[j].msg + "</size>" + "</color>";
            }
            p = p + str;
        }
        return p;
    }

    // --根据百分比设置node位置
    // --相对于node父节点，cc.v2(0.5,0.5)-- 代表正中间
    // --anchorPoint可选
    public static setPosByPercent(node: cc.Node, percent: cc.Vec2, anchorPoint?: cc.Vec2) {
        if (!node || !percent) {
            return
        }
        var parent = node.getParent()
        if (!parent) {
            return
        }
        var containerSize = parent.getContentSize()
        var xPos = containerSize.width * percent.x;
        var yPos = containerSize.height * percent.y;
        node.setPosition(xPos, yPos)
        if (anchorPoint) {
            node.setAnchorPoint(anchorPoint)
        }
    }
    public static addEventListener(target: cc.Node, node: any, className: string, funcName: string, param?) {
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = target; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = className;// 这个是代码文件名
        clickEventHandler.handler = funcName;
        clickEventHandler.customEventData = param;
        node.clickEvents = [];
        node.clickEvents.push(clickEventHandler);
    }

    public static addEventListenerToNode(target: cc.Node, node: cc.Node, className: string, funcName: string, param?) {
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = target; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = className;// 这个是代码文件名
        clickEventHandler.handler = funcName;
        clickEventHandler.customEventData = param;
        var btn = node.getComponent(cc.Button) || node.addComponent(cc.Button);
        btn.clickEvents = [];
        btn.clickEvents.push(clickEventHandler);
    }
    public static addPageEvent(target: cc.Node, node: cc.PageView, className: string, funcName: string, param?) {
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = target; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = className;// 这个是代码文件名
        clickEventHandler.handler = funcName;
        clickEventHandler.customEventData = param;
        node.pageEvents.push(clickEventHandler);
    }
    public static addCheckEvent(target: cc.Node, node: cc.Toggle, className: string, funcName: string, param?) {
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = target; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = className;// 这个是代码文件名
        clickEventHandler.handler = funcName;
        clickEventHandler.customEventData = param;
        node.checkEvents.push(clickEventHandler);
    }
    public static addScrollViewEvent(target: cc.Node, node: cc.ScrollView, className: string, funcName: string, param?) {
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = target; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = className;// 这个是代码文件名
        clickEventHandler.handler = funcName;
        clickEventHandler.customEventData = param;
        node.scrollEvents.push(clickEventHandler);
    }
    public static fromatHHMMSS(diff_timestamp) {
        var sec = diff_timestamp >= 0 && diff_timestamp || 0;
        var h = Math.floor(sec / 3600);
        var m = Math.floor((sec - h * 3600) / 60);
        var s = Math.floor(sec - h * 3600 - m * 60);
        var timeStr = '';
        if (h < 10) {
            timeStr += '0';
        }
        timeStr += h;
        timeStr += ':';
        if (m < 10) {
            timeStr += '0'
        }
        timeStr += m;
        timeStr += ':';
        if (s < 10) {
            timeStr += '0';
        }
        timeStr += s;
        return timeStr;
        //return Util.format('%02d:%02d:%02d', h, m, s);//String.format('%02d:%02d:%02d', h, m, s);
    }
    public static createDetailTitleWithBg(titleText: string, detailTitleWithBg: cc.Prefab) {
        var title = cc.instantiate(detailTitleWithBg).getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get(titleText));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 50);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, 30);
        widget.addChild(title.node);
        return widget;
    }
    public static createDetailDes(desNode: cc.Node, desText: string, color?: cc.Color) {
        color = color || Colors.BRIGHT_BG_TWO;
        var textDesNode = cc.instantiate(desNode);
        var textDes = textDesNode.getChildByName("textDes");
        textDes.color = color;
        var textLabel = textDes.getComponent(cc.Label);
        textLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        textLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        textLabel.enableWrapText = true;
        textLabel.string = desText;
        (textLabel as any)._updateRenderData(true);
        var height = textLabel.node.height;//Math.ceil(desText.length / 17+1)*26;;
        textDesNode.height = height;
        return textDesNode;
    }
    public static createDetailDesEx(desNode: cc.Node, desText: string, color?: cc.Color) {
        var color = Colors.BRIGHT_BG_TWO;
        var textDesNode = cc.instantiate(desNode);
        var textDes = textDesNode.getChildByName("textDes");
        textDes.color = color;
        var textLabel = textDes.getComponent(cc.Label);
        textLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        textLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        textLabel.enableWrapText = true;
        textLabel.string = desText;
        (textLabel as any)._updateRenderData(true);
        var height = textLabel.node.height;
        textLabel.node.y = 15;
        textDesNode.height = height + 20;
        return textDesNode;
    }

    public static updateLabelSize(label: cc.Label) {
        if (label['_updateRenderData']) label['_updateRenderData'](true);
    }

    public static setSwallowTouches(node: cc.Node, b: boolean = false) {
        if ((node as any)._touchListener != null) {
            (node as any)._touchListener.setSwallowTouches(b);
        }
    }

    public static setNodeTouchEnabled(node: cc.Node, v) {
        var btn = node.getComponent(cc.Button);
        if (btn) {
            btn.enabled = v;
        }
    }
    public static seekNodeByName(root: cc.Node, childName: string): cc.Node {
        return root.getChildByName(childName);
    }
    public static addClickEventListenerEx(root: cc.Node, callBack) {
        //root.on('touchend', callBack, null, true);
        root.on('touchend', function (event: cc.Event.EventTouch) {
            var moveOffsetX = Math.abs(event.getLocation().x - event.getPreviousLocation().x);
            var moveOffsetY = Math.abs(event.getLocation().y - event.getPreviousLocation().y);
            if (moveOffsetX < 20 && moveOffsetY < 20) {
                callBack && callBack(event);
            }
        }, null, true);
    }

    public static createLayerColor(color: cc.Color) {
        let node = new cc.Node("layerColor");
        let width: number = G_ResolutionManager.getDesignWidth() + 300; // 长宽各加300，避免出现黑框未全部遮住的情况
        let height: number = G_ResolutionManager.getDesignHeight() + 300;
        node.setContentSize(width, height);
        node.addComponent(cc.BlockInputEvents);
        let g: cc.Graphics = node.addComponent(cc.Graphics);
        g.lineWidth = 1;
        g.fillColor = color;
        g.fillRect(-width / 2, -height / 2, width + 100, height);
        return node;
    }

    public static updateTextOfficialOutlineForceShow(text, officialLevel) {
        var colorOutline = Colors.getOfficialColorOutline(officialLevel);
        UIHelper.enableOutline(text, colorOutline, 2);
    }
}
