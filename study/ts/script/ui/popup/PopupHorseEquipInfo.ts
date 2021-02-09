import PopupBase from "../PopupBase";
import CommonNormalMiniPop from "../component/CommonNormalMiniPop";
import CommonButtonLevel0Normal from "../component/CommonButtonLevel0Normal";
import CommonIconTemplateWithBg from "../component/CommonIconTemplateWithBg";
import CommonButtonLevel0Highlight from "../component/CommonButtonLevel0Highlight";
import { Lang } from "../../lang/Lang";
import { handler } from "../../utils/handler";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupHorseEquipInfo extends PopupBase {

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMiniPop = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnChange: CommonButtonLevel0Normal = null;

    @property({
        type: CommonIconTemplateWithBg,
        visible: true
    })
    _itemIcon: CommonIconTemplateWithBg = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _itemDesc: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _itemName: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _itemEffect1: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _itemEffect2: cc.Label = null;
    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnPutOff: CommonButtonLevel0Highlight = null;

    private _title;
    private _callback;

    init(callback) {
        this._title = Lang.get('common_title_exchange_horse_equip');
        this._callback = callback;
        this._btnChange.addClickEventListenerEx(handler(this, this.onBtnChange));
        this._btnPutOff.addClickEventListenerEx(handler(this, this.onBtnPutOff));
    }
    onCreate() {
        this._btnChange.setString(Lang.get('common_btn_change'));
        this._btnPutOff.setString(Lang.get('common_btn_put_off'));
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._commonNodeBk.setTitle(this._title);
    }
    updateUI(itemType, itemId) {
        this._itemIcon.unInitUI();
        this._itemIcon.initUI(itemType, itemId);
        this._itemIcon.setTouchEnabled(false);
        this._itemIcon.setImageTemplateVisible(true);
        var itemParams = this._itemIcon.getItemParams();
        this._itemName.string = (itemParams.name);
        this._itemName.node.color = (itemParams.icon_color);
        UIHelper.enableOutline(this._itemName,itemParams.icon_color_outline, 2);
        this._itemDesc.string = (itemParams.cfg.description);
        this._itemEffect1.string = (itemParams.effect_1);
        this._itemEffect2.string = (itemParams.effect_2);
    }
    _onInit() {
    }
    onEnter() {
    }
    onExit() {
    }
    onBtnChange() {
        if (this._callback) {
            this._callback('change');
        }
        this.close();
    }
    onBtnCancel() {
        this.close();
    }
    onBtnPutOff() {
        if (this._callback) {
            this._callback('put_off');
        }
        this.close();
    }
}