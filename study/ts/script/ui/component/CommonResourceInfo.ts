import { Color } from "../../utils/Color";

import { Path } from "../../utils/Path";

import { handler } from "../../utils/handler";

import { Lang } from "../../lang/Lang";

import { G_Prompt, Colors, G_EffectGfxMgr } from "../../init";
import { Util } from "../../utils/Util";
import { UIPopupHelper } from "../../utils/UIPopupHelper";
import PopupItemGuider from "../PopupItemGuider";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { UserCheck } from "../../utils/logic/UserCheck";
import CommonUI from "./CommonUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonResourceInfo extends cc.Component {

    private static SPACE_WIDTH = 5;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_max: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_touch: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _button_add: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_ResName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_Crit: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_Crit: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_level: cc.Label = null;

    _itemParams: any;
    _addCall;

    private _isInit: boolean = false;
    onLoad() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;
        this._panel_touch.active = (false);
        this._button_add.node.active = (false);
        this._text_max.node.active = (false);
        this._text_ResName.node.active = (false);
        this._text_Crit.node.active = (false);
        this._image_Crit.node.active = (false);
        this._text_level.node.active = (false);
    }

    updateUI(type, value?, size?) {
        type = type || TypeConvertHelper.TYPE_RESOURCE;
        var itemParams = TypeConvertHelper.convert(type, value);
        this._itemParams = itemParams;
        if (itemParams['res_mini']) {
            this._image.node.addComponent(CommonUI).loadTexture(itemParams.res_mini);
        }
        if (size != null) {
            this.setCount(size);
        }
    }
    updateCrit(index, size) {
        var posX = this._text.node.x + this._text.node.getContentSize().width + CommonResourceInfo.SPACE_WIDTH;
        this._text_Crit.node.x = (posX);
        this._text_Crit.node.active = (true);
        var stringCrit = '+' + (size);
        this._text_Crit.string = (stringCrit);
        UIHelper.updateLabelSize(this._text_Crit);
        this._text_Crit.node.color = (Color.getColor(index));
        var imageCritPos = posX + this._text_Crit.node.getContentSize().width + CommonResourceInfo.SPACE_WIDTH;
        var pic = Path.getTextSignet('txt_baoji0' + index);
        this._image_Crit.node.addComponent(CommonUI).loadTexture(pic);
        this._image_Crit.node.x = (imageCritPos);
        this._image_Crit.node.active = (true);
    }
    setCritVisible(trueOrFalse) {
        this._image_Crit.node.active = (trueOrFalse);
        this._text_Crit.node.active = (trueOrFalse);
    }
    showResName(needShow, name?) {
        needShow = needShow || false;
        if (needShow) {
            name = name || this._itemParams.name + ' : ';
            this._text_ResName.node.active = (needShow);
            this._text_ResName.string = (name);
        }
    }
    getResName() {
        return this._itemParams.name;
    }
    setCount(count, max?, customColor?) {
        if (count != null) {
            this._text.string = ('' + count);
            Util.updatelabelRenderData(this._text);
        }
        if (max != null && max >= 0) {
            var posX = this._text.node.x + this._text.node.getContentSize().width;
            this._text_max.string = (' / ' + max);
            Util.updatelabelRenderData(this._text_max);

            this._text_max.node.active = (true);
            this._text_max.node.x = (posX);
            this._text_level.node.active = (false);
        }
        if (!customColor) {
            this.setTextColorToATypeColor();
        }
    }
    setAddButtonCall(addCall) {
        this._addCall = addCall;
    }
    showImageAdd(needShow, showBuyDialog?) {
        if (needShow == null) {
            needShow = false;
        }
        if (needShow) {
            var callback = showBuyDialog && handler(this, this._onBuyAndUseRes) || handler(this, this._onShowResWay);
            var posX = this._text_max.node.x + this._text_max.node.getContentSize().width + 20;
            this._button_add.node.active = true;
            this._button_add.node.x = (posX);

            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
            clickEventHandler.component = "CommonResourceInfo";// 这个是代码文件名
            clickEventHandler.handler = showBuyDialog ? '_onBuyAndUseRes' : '_onShowResWay';
            this._button_add.clickEvents = [];
            this._button_add.clickEvents.push(clickEventHandler);
            this._panel_touch.active = (true);
            // var btn = this._panel_touch.getComponent(cc.Button);
            // btn.clickEvents = [];
            // btn.clickEvents.push(clickEventHandler);
        } else {
            this._button_add.node.active = false;
            this._panel_touch.active = false;
        }
    }
    _onShowResWay(sender) {
        UIPopupHelper.popupItemGuider((popupItemGuider: PopupItemGuider) => {
            popupItemGuider.setTitle(Lang.get('way_type_get'));
            popupItemGuider.updateUI(this._itemParams.item_type, this._itemParams.cfg.id);
        });
    }
    _onBuyAndUseRes(sender) {
        if (this._addCall) {
            this._addCall();
            return;
        }
        var info = UserCheck.resCheck(this._itemParams.cfg.id, -1, true);
        var success = info[0];
        if (!info[1]) {
            G_Prompt.showTip(Lang.get('common_not_develop'));
        }
    }
    setCountColorRed(needRed) {
        if (needRed == null) {
            needRed = false;
        }
        if (needRed) {
            this._text.node.color = (Colors.uiColors.RED);
        } else {
            this._text.node.color = (Colors.BRIGHT_BG_ONE);
        }
    }
    setCountColorBeige() {
        this._text.node.color = (Colors.uiColors.BEIGE);
    }
    setMaxColorBeige() {
        this._text_max.node.color = (Colors.uiColors.BEIGE);
    }
    setCountUnknown() {
        this._text.string = ('???');
    }
    setTextColor(c3b) {
        this._text.node.color = (c3b);
        this._text_ResName.node.color = (c3b);
    }
    setTextOutLine(c3b) {
        UIHelper.enableOutline(this._text, c3b, 2);
        // this._text.enableOutline(c3b, 2);
    }
    setTextColorToATypeColor(enoughMaxCount?) {
        this._text_ResName.node.color = (Colors.BRIGHT_BG_TWO);
        if (enoughMaxCount == null) {
            this._text.node.color = (Colors.BRIGHT_BG_ONE);
            this._text_max.node.color = (Colors.BRIGHT_BG_ONE);
        } else {
            this._text.node.color = (enoughMaxCount && Colors.BRIGHT_BG_GREEN || Colors.uiColors.RED);
            this._text_max.node.color = (enoughMaxCount && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_ONE);
        }
    }
    setTextColorToDTypeColor(enoughMaxCount?) {
        this._text_ResName.node.color = (Colors.DARK_BG_TWO);
        if (enoughMaxCount == null) {
            this._text.node.color = (Colors.DARK_BG_ONE);
            this._text_max.node.color = (Colors.DARK_BG_ONE);
        } else {
            this._text.node.color = (enoughMaxCount && Colors.DARK_BG_GREEN || Colors.DARK_BG_RED);
            this._text_max.node.color = (enoughMaxCount && Colors.DARK_BG_GREEN || Colors.DARK_BG_ONE);
        }
    }
    setTextColorToDRevisionTypeColor(enoughMaxCount) {
        this._text_ResName.node.color = (Colors.DARK_BG_THREE);
        if (enoughMaxCount == null) {
            this._text.node.color = (Colors.DARK_BG_THREE);
            this._text_max.node.color = (Colors.DARK_BG_THREE);
        } else {
            this._text.node.color = (enoughMaxCount && Colors.DARK_BG_GREEN || Colors.DARK_BG_RED);
            this._text_max.node.color = (enoughMaxCount && Colors.DARK_BG_GREEN || Colors.DARK_BG_THREE);
        }
    }
    setTextColorToGAndBTypeColor() {
        this._text.node.color = (Colors.CLASS_WHITE);
        UIHelper.enableOutline(this._text, Colors.CLASS_WHITE_OUTLINE, 2);
        // this._text.enableOutline(Colors.CLASS_WHITE_OUTLINE, 2);
    }
    getResSize() {
        var imageSize = this._image.node.getContentSize();
        var textSize = this._text.node.getContentSize();
        var size = cc.size(textSize.width + imageSize.width, Math.max(imageSize.height, textSize.height));
        return size;
    }
    setTextResNameHighLight() {
        if (this._text_ResName) {
            this._text_ResName.node.color = (Colors.BRIGHT_BG_RED);
        }
        if (this._text) {
            this._text.node.color = (Colors.BRIGHT_BG_RED);
        }
    }
    setTextResNameNormal() {
        if (this._text_ResName) {
            this._text_ResName.node.color = (Colors.BRIGHT_BG_TWO);
        }
        if (this._text) {
            this._text.node.color = (Colors.BRIGHT_BG_ONE);
        }
    }
    playCritAction(action) {
        this._image_Crit.node.active = (true);
        G_EffectGfxMgr.applySingleGfx(this._image_Crit.node, action, null, null, null);
    }
    setCritImageVisible(v) {
        this._image_Crit.node.active = (v);
    }
    setTextColorToATypeGreen() {
        this._text.node.color = (Colors.getATypeGreen());
    }
    getContentWidth() {
        return this._text.node.x + this._text.node.getContentSize().width;
    }
    setImageResScale(scale) {
        this._image.node.setScale(scale);
    }
    setResNameColor(color) {
        this._text_ResName.node.color = (color);
    }
    setTextCountSize(fontSize) {
        this._text.fontSize = (fontSize);
    }
    setResNameFontSize(fontSize) {
        this._text_ResName.fontSize = (fontSize);
    }
    setPlusNum(plusNum) {
        if (plusNum != null && plusNum > 1) {
            var posX = this._text.node.x + this._text.node.getContentSize().width;
            this._text_level.string = ('+' + plusNum);
            this._text_level.node.active = (true);
            this._text_level.node.x = (posX);
            this._text_max.node.active = (false);
            this._text.node.active = (false);
        }
    }

    setVisible(v) {
        this.node.active = v;
    }

}