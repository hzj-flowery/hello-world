import { Colors, G_EffectGfxMgr } from "../../init";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { ComponentIconHelper } from "./ComponentIconHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class CommonIconBase extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _doubleTips: cc.Sprite = null;

    _type = null;
    _target = null;
    _itemParams = null;
    _textItemCount = null;
    _labelItemName: cc.Label = null;
    _callback = null;
    _iconDark = false;

    _panelItemContent;
    _labelItemNameBgImage;
    _imageItemCollect;
    _imageMask;
    _imageSelect;

    _hasLoad: boolean = false;

    needLoadIconBg:boolean = true;

    onLoad() {
        if (this._hasLoad) return;
        this._hasLoad = true;
        this._imageBg = this._imageBg || this.node.getChildByName('ImageBg').getComponent(cc.Sprite);
        this._imageIcon = this._imageIcon || this.node.getChildByName('ImageIcon').getComponent(cc.Sprite);
        this._doubleTips = this._doubleTips || (this.node.getChildByName('ImageDoubleTips') ? this.node.getChildByName('ImageDoubleTips').getComponent(cc.Sprite) : null);
        this._imageIcon.sizeMode = cc.Sprite.SizeMode.RAW;

        if (this._panelItemContent == null) {
            var panelItemContent = ComponentIconHelper.buildItemContentPanel();
            this.node.addChild(panelItemContent);
            this._panelItemContent = panelItemContent;

            var button = this._panelItemContent.addComponent(cc.Button);
            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
            clickEventHandler.component = "CommonIconBase";// 这个是代码文件名
            clickEventHandler.handler = "_onTouchCallBack";
            button.clickEvents.push(clickEventHandler);

            this.node.on('touchstart', function (params) {
            });
            (this.node as any)._touchListener.setSwallowTouches(false);
        }
    }

    getPanelSize() {
        if (this._panelItemContent) {
            return this._panelItemContent.getContentSize();
        }
        return cc.size(0, 0);
    }
    loadColorBg(res, opacity = 255) {
        if (this.needLoadIconBg) {
            this._imageBg.node.active = (true);
            this._imageBg.node.opacity = opacity;
            UIHelper.loadTexture(this._imageBg, res);
        }
    }
    loadIcon(res) {
        this._imageIcon.node.active = (true);
        UIHelper.loadTexture(this._imageIcon, res);
    }
    appendUI(node:cc.Node, zOrder?: number) {
        console.assert(this._panelItemContent,'Invalid appendUI %s', (this._panelItemContent));
        if (zOrder) {
            this._panelItemContent.addChild(node, zOrder);
        } else {
            this._panelItemContent.addChild(node);
        }
    }
    getType() {
        return this._type || 0;
    }

    updateUI(value, size?, rank?, limitLevel?, limitRedLevel?) {
        if (this.getType() > 0) {
            var itemParams = TypeConvertHelper.convert(this.getType(), value, null, null, limitLevel, limitRedLevel);
            itemParams.size = size;
            if (itemParams.icon_bg != null) {
                this.loadColorBg(itemParams.icon_bg);
            }
            if (itemParams.icon != null) {
                this.loadIcon(itemParams.icon);
            }
            if (itemParams.size) {
                this.setCount(itemParams.size);
            }
            this._itemParams = itemParams;
            return itemParams;
        }
        return null;
    }
    getItemParams() {
        return this._itemParams;
    }

    setCount(size) {
        if (this._textItemCount == null) {
            var params = {
                name: '_textItemCount',
                text: 'x' + '0',
                fontSize: 18,
                color: Colors.WHITE_DEFAULT,
                outlineColor: Colors.DEFAULT_OUTLINE_COLOR
            };
            ComponentIconHelper._setPostion(params, 'rightBottom');
            var uiWidget = UIHelper.createLabel(params);
            this.appendUI(uiWidget);
            this._textItemCount = uiWidget;
        }
        var color = size > 0 && Colors.WHITE_DEFAULT || Colors.uiColors.RED;
        this._textItemCount.getComponent(cc.Label).string = ('' + size);
        this._textItemCount.color = (color);
        this._textItemCount.active = (size > 1);
    }
    showCount(needShow = false) {
        if (this._textItemCount != null) {
            this._textItemCount.active = (needShow);
        }
    }
    showName(needShow, fixWidth?) {
        if (this._itemParams && needShow) {
            this.setName(this._itemParams.name);
            this._labelItemName.node.color = (this._itemParams.icon_color);
            UIHelper.updateTextOutline(this._labelItemName, this._itemParams);
            if (fixWidth && fixWidth > 0) {
                this._labelItemName.node.width = fixWidth;
                this._labelItemName.getComponent(cc.Label).horizontalAlign = cc.Label.HorizontalAlign.CENTER;
                // this._labelItemName.overflow = cc.Label.Overflow.CLAMP;
            }
        }
        else {
            if (this._labelItemName) {
                this._labelItemName.node.active = false;
            }
        }
    }
    setName(name) {
        if (this._labelItemName == null) {
            var params = {
                name: '_labelItemName',
                text: name,
                fontSize: 18,
                color: Colors.WHITE_DEFAULT
            };
            ComponentIconHelper._setPostion(params, 'midEnd');
            var uiWidget = UIHelper.createLabel(params).getComponent(cc.Label);
            this.appendUI(uiWidget.node);
            this._labelItemName = uiWidget;
        }
        
        this._labelItemName.horizontalAlign = cc.Label.HorizontalAlign.CENTER;

        if (name && name != '') {
            this._labelItemName.node.active = true;
            this._labelItemName.string = (name);
        } else {
            this._labelItemName.node.active = false;
        }
    }
    addBgImageForName(bgPath, fixWidth, heightAdjustParam = 8) {
        if (this._labelItemName == null) {
            return;
        }
        this.removeBgImageForName();
        if (this._labelItemNameBgImage == null) {
            var params:any = {
                name: '_labelItemNameBgImage',
                texture: bgPath || Path.getUICommon('img_com_board01_large_list01a')
            };
            ComponentIconHelper._setPostion(params, 'midEnd');
            params.callBack = function(sp:cc.Sprite){
                (this._labelItemName as any)._updateRenderData(true);
                var size = this._labelItemName.node.getContentSize();
                var width = size.width;
                if (fixWidth) {
                    width = fixWidth;
                }
                sp.type = cc.Sprite.Type.SLICED;

                let spriteFrame = sp.spriteFrame;
                spriteFrame.insetBottom = 4;
                spriteFrame.insetLeft = 4;
                spriteFrame.insetRight = 4;
                spriteFrame.insetTop = 4;

                var heightAdjust = heightAdjustParam;
                sp.node.setContentSize(cc.size(width, size.height + heightAdjust));
                this._labelItemName.node.y = (sp.node.y - Math.ceil(heightAdjust / 2));
            }.bind(this);
            var uiWidget = UIHelper.createImageEx(params);
            // uiWidget.setScale9Enabled(true);
            // uiWidget.setCapInsets(cc.rect(4, 4, 4, 4));  
            // var render = this._labelItemName.getVirtualRenderer();
            // var size = render.getContentSize();


            this.appendUI(uiWidget, -1);
            this._labelItemNameBgImage = uiWidget;
        }
    }
    removeBgImageForName(bgPath?) {
        if (this._labelItemNameBgImage != null) {
            this._labelItemNameBgImage.destroy();
            this._labelItemNameBgImage = null;
        }
    }

    showDoubleTips(isShow) {
        if (this._doubleTips) {
            this._doubleTips.node.active = isShow;
        }
    }
    setNameFontSize(fontSize) {
        if (this._labelItemName) {
            this._labelItemName.getComponent(cc.Label).fontSize = (fontSize);
        }
    }
    setNameOverflow(overflow) {
        if (this._labelItemName) {
            this._labelItemName.getComponent(cc.Label).overflow = overflow;
            this._labelItemName.getComponent(cc.Label).lineHeight = (this._labelItemName.getComponent(cc.Label).fontSize + 2);
            this._labelItemName.getComponent(cc.Label)["_updateRenderData"](true);
        }
    }
    showCollect(needShow) {
        if (needShow == null) {
            needShow = false;
        }
        if (this._imageItemCollect == null) {
            var params = {
                name: '_imageItemCollect',
                texture: Path.getUIText('signet/img_iconcover'),
                adaptWithSize: true
            };
            ComponentIconHelper._setPostion(params, 'midTop');
            var uiWidget = UIHelper.createImage(params);
            this.appendUI(uiWidget);
            this._imageItemCollect = uiWidget;
        }
        this._imageItemCollect.active = needShow;
    }
    setIconMask(needMask) {
        if (needMask == null) {
            needMask = false;
        }
        if (this._imageMask == null) {
            var params = {
                name: '_imageMask',
                texture: Path.getUICommon('img_iconcover'),
                adaptWithSize: true
            };
            ComponentIconHelper._setPostion(params, 'midcenter');
            var uiWidget = UIHelper.createImage(params);
            this.appendUI(uiWidget);
            this._imageMask = uiWidget;
        }
        this._imageMask.active = needMask;
    }
    setIconSelect(showSelect) {
        if (showSelect == null) {
            showSelect = false;
        }
        if (this._imageSelect == null) {
            var params = {
                name: '_imageSelect',
                texture: Path.getUICommon('img_com_check05b'),
                adaptWithSize: true
            };
            ComponentIconHelper._setPostion(params, 'selectIcon');
            var uiWidget = UIHelper.createImage(params);
            this.appendUI(uiWidget);
            uiWidget.setScale(1.2);
            this._imageSelect = uiWidget;
        }
        this._imageSelect.active = showSelect;
    }
    isIconDark() {
        return this._iconDark;
    }
    setIconDark(needDark) {
        if (needDark == true) {
            //  UIHelper.applyGrayFilter(this._target);.
            if (this._labelItemName) {
                this._labelItemName.node.color = (new cc.Color(77, 77, 77));
            }
        } else {
            // UIHelper.removeFilter(this._target);
            if (this._labelItemName) {
                this._labelItemName.node.color = (this._itemParams.icon_color);
            }
        }
        this._iconDark = needDark;
    }
    _onTouchCallBack(event, customEventData) {
        if (this._callback) {
            this._callback(this._panelItemContent, this._itemParams);
        }
        if (this._itemParams) {
            console.debug('CommonIconBase:_onTouchCallBack : ' + this._itemParams.name);
        }
    }
    setCallBack(callback) {
        this.setTouchEnabled(true);
        if (callback) {
            this._callback = callback;
        }
    }
    setTouchEnabled(enabled = false) {
        this._panelItemContent.getComponent(cc.Button).enabled = (enabled);
        //  this._panelItemContent.setSwallowTouches(false);
    }
    setSwallowTouchesEnabled(enabled) {
        // if (enabled == null) {
        //     enabled = false;
        // }
        //   this._panelItemContent.setSwallowTouches(enabled);
    }
    setIconVisible(visible = false) {
        this._imageIcon.node.active = visible;
    }
    refreshToEmpty(useUnknow?) {
        this.setIconVisible(false);
        this.loadColorBg(Path.getUICommon('img_frame_bg01'), 25);
    }
    showLightEffect(scale?, effectName?) {
        var node: cc.Node = G_EffectGfxMgr.createPlayGfx(this._panelItemContent, effectName || 'effect_icon_guangquan').node;
        node.name = 'flash_effect';
        node.setScale(scale != null ? scale : 1);
        //   var lightEffect = new EffectGfxNode();
        // lightEffect.load();
        // lightEffect.setAnchorPoint(0, 0);
        // lightEffect.play();
        // lightEffect.setName('flash_effect');
        // lightEffect.setScale(scale || 1);
        // this._panelItemContent.addChild(lightEffect);
        // lightEffect.setPosition();
    }
    removeLightEffect() {
        // console.log("removeLightEffect");
        if (this._panelItemContent) {
            let effect = this._panelItemContent.getChildByName('flash_effect');
            effect && effect.destroy();
        }
    }
    showIconEffect(scale, effectName) {
    }
    isClickFrame() {
    }
    hideBg() {
        this._imageBg.node.active = false;
    }
}