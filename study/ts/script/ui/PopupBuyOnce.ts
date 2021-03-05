import PopupBase from "./PopupBase";
import { Lang } from "../lang/Lang";
import CommonButtonLevel0Highlight from "./component/CommonButtonLevel0Highlight";
import CommonButtonLevel0Normal from "./component/CommonButtonLevel0Normal";
import UIHelper from "../utils/UIHelper";
import CommonNormalSmallPop from "./component/CommonNormalSmallPop";
import CommonNormalMiniPop from "./component/CommonNormalMiniPop";
import CommonResourceInfo from "./component/CommonResourceInfo";
import { assert } from "../utils/GlobleFunc";
import CommonIconTemplate from "./component/CommonIconTemplate";
import CommonCheckBoxAnymoreHint from "./component/CommonCheckBoxAnymoreHint";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupBuyOnce extends PopupBase {

    @property({
        type:CommonButtonLevel0Highlight,
        visible:true
    })
    _btnOk:CommonButtonLevel0Highlight = null;

    @property({
        type:CommonButtonLevel0Normal,
        visible:true
    })
    _btnCancel:CommonButtonLevel0Normal = null;

    @property({
        type:CommonNormalMiniPop,
        visible:true
    })
    _popupBG:CommonNormalMiniPop = null;

    @property({
        type:CommonResourceInfo,
        visible:true
    })
    _costResInfo1:CommonResourceInfo = null;

    @property({
        type:CommonIconTemplate,
        visible:true
    })
    _itemIcon:CommonIconTemplate = null;

    @property({
        type:cc.Label,
        visible:true
    })
    _itemName:cc.Label = null;

    @property({
        type:CommonCheckBoxAnymoreHint,
        visible:true
    })
    _commonCheckBoxAnymoreHint:CommonCheckBoxAnymoreHint = null;

    _title: any;
    _callback: any;
    _buyItemId: any;

    ctor(title, callback) {
        this._title = title || Lang.get('common_title_buy_confirm');
        this._callback = callback;
        this._buyItemId = null;

        UIHelper.addEventListener(this.node, this._btnOk._button, 'PopupBuyOnce', 'onBtnOk');
        UIHelper.addEventListener(this.node, this._btnCancel._button, 'PopupBuyOnce', 'onBtnCancel');
    }
    onCreate() {
        this._btnOk.setString(Lang.get('common_btn_sure'));
        this._btnCancel.setString(Lang.get('common_btn_cancel'));
        this._popupBG.setTitle(this._title);
        this._popupBG.hideCloseBtn();
    }
    setCostInfo(costType, costValue, costSize) {
        this._costResInfo1.updateUI(costType, costValue, costSize);
        this._costResInfo1.setTextColorToATypeColor();
    }
    updateUI(itemType, itemValue, itemNum) {
      //assert((itemValue, 'PopupBuyOnce\'s itemId can\'t be empty!!!');
        this._itemIcon.unInitUI();
        this._itemIcon.initUI(itemType, itemValue, itemNum);
        this._itemIcon.setImageTemplateVisible(true);
        var itemParams = this._itemIcon.getItemParams();
        this._itemName.string = (itemParams.name);
        this._itemName.node.color = (itemParams.icon_color);
        this._buyItemId = itemValue;
    }
    _onInit() {
    }
    onEnter() {
    }
    onExit() {
    }
    onBtnOk() {
        var isBreak;
        if (this._callback) {
            isBreak = this._callback(this._buyItemId);
        }
        if (!isBreak) {
            this.close();
        }
    }
    onBtnCancel() {
        this.close();
    }
    setModuleName(moduleDataName) {
        this._commonCheckBoxAnymoreHint.setModuleName(moduleDataName);
    }
}

