const { ccclass, property } = cc._decorator;

import CommonNormalMiniPop from './component/CommonNormalMiniPop'
import CommonButtonSwitchLevel0 from './component/CommonButtonSwitchLevel0';
import CommonJadeIcon from './component/CommonJadeIcon';
import { Lang } from '../lang/Lang';
import { handler } from '../utils/handler';
import { Colors, G_Prompt } from '../init';
import { EquipJadeHelper } from '../scene/view/equipmentJade/EquipJadeHelper';
import PopupBase from './PopupBase';

@ccclass
export default class PopupChangeJade extends PopupBase {

    public static path = 'common/PopupChangeJade';

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMiniPop = null;
    @property({
        type: CommonButtonSwitchLevel0,
        visible: true
    })
    _btnChange: CommonButtonSwitchLevel0 = null;
    @property({
        type: CommonButtonSwitchLevel0,
        visible: true
    })
    _btnUnload: CommonButtonSwitchLevel0 = null;

    @property({
        type: CommonJadeIcon,
        visible: true
    })
    _itemIcon: CommonJadeIcon = null;
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
    _title: any;
    _callback: any;
    _slot: any;
    _jadeUnitData: any;
    _equipUnitData: any;
    _isRed: any;

    ctor(title, slot, jadeUnitData, equipUnitData, isRed, callback,type) {
        this._title = title || Lang.get('common_title_item_info');
        this._callback = callback;
        this._slot = slot;
        this._jadeUnitData = jadeUnitData;
        this._equipUnitData = equipUnitData;
        this._isRed = isRed;
        this._isClickOtherClose = true;
    }
    onCreate() {
        this._btnChange.setString(Lang.get('equipment_choose_jade_cell_btn4'));
        this._btnChange.switchToHightLight();
        this._btnChange.showRedPoint(this._isRed);
        this._btnUnload.setString(Lang.get('equipment_choose_jade_cell_btn3'));
        this._btnUnload.switchToNormal();
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._commonNodeBk.setTitle(this._title);
        this._commonNodeBk.hideCloseBtn();
        this._btnChange.addClickEventListenerEx(handler(this, this.onBtnChange));
        this._btnUnload.addClickEventListenerEx(handler(this, this.onBtnUnload));
    }
    _onInit() {
    }
    onEnter() {
        var config = this._jadeUnitData.getConfig();
        this._itemIcon.updateUI(config.id);
        this._itemIcon.setTouchEnabled(false);
        this._itemName.string = (config.name);
        this._itemName.node.color = (Colors.getColor(config.color));
        this._itemDesc.string = (config.description);
    }
    onExit() {
    }
    onBtnChange() {
        var list = EquipJadeHelper.getEquipJadeListByWear(this._slot, this._jadeUnitData, this._equipUnitData, false);
        if (list.length > 0) {
            EquipJadeHelper.popupChooseJadeStone(this._slot, this._jadeUnitData, this._equipUnitData, this._callback, true);
        } else {
            G_Prompt.showTip(Lang.get('equipment_choose_jade_tips'));
        }
        this.close();
    }
    onBtnUnload() {
        if (this._callback) {
            this._callback(this._slot, 0);
        }
        this.close();
    }
    onBtnCancel() {
        this.close();
    }

}