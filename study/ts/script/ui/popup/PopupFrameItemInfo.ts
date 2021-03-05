import PopupBase from "../PopupBase";
import CommonButtonLevel0Highlight from "../component/CommonButtonLevel0Highlight";
import CommonHeadFrame from "../component/CommonHeadFrame";
import CommonNormalMiniPop from "../component/CommonNormalMiniPop";
import { handler } from "../../utils/handler";
import { Lang } from "../../lang/Lang";
import { assert } from "../../utils/GlobleFunc";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;
@ccclass

export default class PopupFrameItemInfo extends PopupBase {

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnOk: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _itemName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _itemDesc: cc.Label = null;

    @property({
        type: CommonHeadFrame,
        visible: true
    })
    _itemIcon: CommonHeadFrame = null;

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMiniPop = null;
    private _title: string;
    private _callback: any;
    private _itemId: number;
    private _useNum: number;

    setInitData(title, callback) {
        this._title = title || Lang.get('common_title_item_info');
        this._callback = callback;
        this._itemId = null;
        this._useNum = 1;
    }
    onCreate() {
        this._btnOk.setString(Lang.get('common_btn_sure'));
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._commonNodeBk.setTitle(this._title);
        this._commonNodeBk.hideCloseBtn();
        this._btnOk.addClickEventListenerEx(handler(this, this.onBtnOk))
    }
    updateUI(itemId) {
      //assert((itemId, 'PopupFrameItemInfo\'s itemId can\'t be empty!!!');
        this._itemIcon.setTouchEnabled(false);
        this._itemIcon.updateUI(itemId, 0.9);
        var itemParams = this._itemIcon.getItemParams();
        this._itemName.string = (itemParams.name);
        this._itemName.node.color = (itemParams.icon_color);
        if (itemParams.cfg.color == 7) {
            UIHelper.enableOutline(this._itemName, itemParams.icon_color_outline, 2);
        }
        this._itemDesc.string = (itemParams.cfg.des);
        this._itemId = itemId;
    }
    _onInit() {
    }
    onEnter() {
    }
    onExit() {
    }
    onBtnOk() {
        var isBreak = null;
        if (this._callback) {
            isBreak = this._callback(this._itemId);
        }
        if (!isBreak) {
            this.close();
        }
    }
    onBtnCancel() {
        this.close();
    }
}