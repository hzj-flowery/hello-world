import CommonEquipName from "../../../ui/component/CommonEquipName";
import CommonEquipIcon from "../../../ui/component/CommonEquipIcon";
import { handler } from "../../../utils/handler";
import { G_UserData, G_Prompt, G_SceneManager } from "../../../init";
import { FunctionConst } from "../../../const/FunctionConst";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import UIActionHelper from "../../../utils/UIActionHelper";
import { Path } from "../../../utils/Path";
import CommonUI from "../../../ui/component/CommonUI";
import EquipConst from "../../../const/EquipConst";
import CommonEquipName3 from "../../../ui/component/CommonEquipName3";
import { EquipDataHelper } from "../../../utils/data/EquipDataHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import { Lang } from "../../../lang/Lang";
import PopupChooseEquip2 from "../../../ui/popup/PopupChooseEquip2";
import { PopupChooseEquipHelper } from "../../../ui/popup/PopupChooseEquipHelper";

var SKETCH_RES = {
    1: 'img_frame_icon01',
    2: 'img_frame_icon04',
    3: 'img_frame_icon02',
    4: 'img_frame_icon03'
};
const { ccclass, property } = cc._decorator;

@ccclass
export default class TeamEquipIcon extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSketch: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _spriteAdd: cc.Sprite = null;

    @property({
        type: CommonEquipName3,
        visible: true
    })
    _fileNodeName: CommonEquipName3 = null;

    @property({
        type: CommonEquipIcon,
        visible: true
    })
    _fileNodeCommon: CommonEquipIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPoint: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectDown: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectUp: cc.Node = null;

    private _pos: number;
    private _slot: any;
    private _equipId: number;
    private _totalList: Array<any>;
    private _noWearList: Array<any>;
    private _isOnlyShow: boolean;
    private _effect1: any;
    private _effect2: any;
    private _onlyShowCallback: any;

    onLoad() {
        this._pos = null;
        this._slot = null;
        this._equipId = null;
        this._totalList = [];
        this._noWearList = [];
        this._effect1 = null;
        this._effect2 = null;
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, handler(this, this._onPanelTouch));
    }
    _initUI() {
        this._imageSketch.node.active = (false);
        this._spriteAdd.node.active = (false);
        this._fileNodeCommon.node.active = (false);
        this._fileNodeName.node.active = (false);
        this._imageRedPoint.node.active = (false);
        this._imageArrow.node.active = (false);
    }
    updateIcon(pos, slot) {
        this._isOnlyShow = false;
        this._pos = pos;
        this._slot = slot;
        this._equipId = G_UserData.getBattleResource().getResourceId(pos, 1, slot);
        this._initUI();
        if (this._equipId) {
            var equipData = G_UserData.getEquipment().getEquipmentDataWithId(this._equipId);
            var equipBaseId = equipData.getBase_id();
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.updateUI(equipBaseId);
            this._fileNodeCommon.setLevel(equipData.getLevel());
            this._fileNodeCommon.setRlevel(equipData.getR_level());
            //var FunctionCheck = require('FunctionCheck');
            if (FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)[0]) {
                var convertHeroBaseId = EquipDataHelper.getHeroBaseIdWithEquipId(this._equipId)[1];
                this._fileNodeCommon.updateJadeSlot(equipData.getJadeSysIds(), convertHeroBaseId);
            }
            this._fileNodeName.node.active = (true);
            this._fileNodeName.setName(equipBaseId);
        } else {
            this._imageSketch.addComponent(CommonUI).loadTexture(Path.getUICommonFrame(SKETCH_RES[slot]));
            this._imageSketch.node.active = (true);
            var ret = G_UserData.getEquipment().getReplaceEquipmentListWithSlot(pos, slot);
            this._totalList = ret[0]
            this._noWearList = ret[1];
            var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP)[0];
            if (this._noWearList.length > 0 && isOpen) {
                this._spriteAdd.node.active = (true);
                UIActionHelper.playBlinkEffect(this._spriteAdd.node);
            }
        }
    }
    _onPanelTouch() {
        if (this._isOnlyShow) {
            this._onlyShowTouchCallback();
        } else {
            this._normalTouchCallback();
        }
    }
    _onlyShowTouchCallback() {
        if (this._onlyShowCallback) {
            this._onlyShowCallback();
        }
    }
    _normalTouchCallback() {
        var ret = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP);
        var isOpen = ret[0];
        var des = ret[1];
        var info = ret[2];
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        if (this._equipId) {
            G_SceneManager.showScene('equipmentDetail', this._equipId, EquipConst.EQUIP_RANGE_TYPE_2);
        } else {
            if (this._noWearList.length == 0) {
                UIPopupHelper.popupItemGuider(function (popupItemGuider: PopupItemGuider) {
                    popupItemGuider.updateUI(TypeConvertHelper.TYPE_EQUIPMENT, DataConst['SHORTCUT_EQUIP_ID_' + this._slot]);
                    popupItemGuider.setTitle(Lang.get('way_type_get'));
                }.bind(this))
            } else {
                PopupChooseEquip2.getIns(PopupChooseEquip2, (popup: PopupChooseEquip2) => {
                    popup.openWithAction();
                    var callBack = handler(this, this._onChooseEquip);
                    popup.setTitle(Lang.get('equipment_wear_title'));
                    popup.updateUI(PopupChooseEquipHelper.FROM_TYPE1, callBack, this._totalList, null, null, this._noWearList, this._pos);
                })
            }
        }
    }
    _onChooseEquip(equipId) {
        G_UserData.getEquipment().c2sAddFightEquipment(this._pos, this._slot, equipId);
    }
    showRedPoint(visible) {
        this._imageRedPoint.node.active = (visible);
    }
    showUpArrow(visible) {
        this._imageArrow.node.active = (visible);
        if (visible) {
            UIActionHelper.playFloatEffect(this._imageArrow.node);
        }
    }
    onlyShow(slot, data, isShow, heroBaseId) {
        this._isOnlyShow = true;
        this._initUI();
        if (data) {
            var baseId = data.getBase_id();
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.updateUI(baseId);
            this._fileNodeCommon.setLevel(data.getLevel());
            this._fileNodeCommon.setRlevel(data.getR_level());
            if (isShow) {
                this._fileNodeCommon.updateJadeSlot(data.getUserDetailJades() || {}, heroBaseId);
                this.setOnlyShowCallback(function () {
                    if (data.getConfig().suit_id > 0) {
                        UIPopupHelper.popupUserJadeDes(this,data);
                    }
                }.bind(this));
            } else {
                this.setOnlyShowCallback(null);
            }
            this._fileNodeName.node.active = (true);
            this._fileNodeName.setName(baseId);
        } else {
            this._imageSketch.addComponent(CommonUI).loadTexture(Path.getUICommonFrame(SKETCH_RES[slot]));
            this._imageSketch.node.active = (true);
        }
    }
    setOnlyShowCallback(callback) {
        this._onlyShowCallback = callback;
    }
    showEffect() {
        this._clearEffect();
        this._fileNodeCommon.showIconEffect();
    }
    _clearEffect() {
        this._fileNodeCommon.removeLightEffect();
    }
    setNameWidth(width) {
        this._fileNodeName.setNameWidth(width);
    }
}