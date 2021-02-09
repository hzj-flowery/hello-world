import CommonTreasureName from "../../../ui/component/CommonTreasureName";
import CommonTreasureIcon from "../../../ui/component/CommonTreasureIcon";
import { G_UserData, G_SceneManager } from "../../../init";
import UIActionHelper from "../../../utils/UIActionHelper";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { FunctionConst } from "../../../const/FunctionConst";
import { Lang } from "../../../lang/Lang";
import TreasureConst from "../../../const/TreasureConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import CommonUI from "../../../ui/component/CommonUI";
import { Path } from "../../../utils/Path";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import PopupChooseTreasure2 from "../../../ui/popup/PopupChooseTreasure2";
import { PopupChooseTreasureHelper } from "../../../ui/popup/PopupChooseTreasureHelper";
import { handler } from "../../../utils/handler";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";


var SKETCH_RES = {
    1: 'img_frame_icon05',
    2: 'img_frame_icon06'
};

const { ccclass, property } = cc._decorator;

@ccclass
export default class TeamTreasureIcon extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOpenLevel: cc.Label = null;

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
        type: CommonTreasureName,
        visible: true
    })
    _fileNodeName: CommonTreasureName = null;

    @property({
        type: CommonTreasureIcon,
        visible: true
    })
    _fileNodeCommon: CommonTreasureIcon = null;

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



    private _formatName: string;
    private _isOpen: boolean = false;
    private _pos: number;
    private _treasureId: number;
    private _slot: any;
    private _totalList: any;
    private _noWearList: any;
    _isOnlyShow: boolean;
    _onlyShowCallback: Function;

    public setInitData(formatName): void {
        this._formatName = formatName;
    }
    onEnable() {
        // this._isOpen = false;
        // this._pos = null;
        // this._slot = null;
        // this._treasureId = null;
        // this._totalList = null;
        // this._noWearList = null;
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, this._onPanelTouch, this);
    }
    _initUI() {
        this._imageLock.node.active = (false);
        this._imageSketch.node.active = (false);
        this._spriteAdd.node.active = (false);
        this._fileNodeCommon.node.active = (false);
        this._fileNodeName.node.active = (false);
        this._imageRedPoint.node.active = (false);
        this._imageArrow.node.active = (false);
    }
    updateIcon(pos, slot) {
        this._isOnlyShow = false;
        this._initUI();
        var ret = FunctionCheck.funcIsOpened(FunctionConst.FUNC_TREASURE);
        var isOpen = ret[0];
        var des = ret[1];
        var info = ret[2];
        this._isOpen = isOpen;
        if (!isOpen) {
            this._imageLock.node.active = (true);
            this._textOpenLevel.string = (Lang.get('treasure_txt_open', { level: info.level }));
            return;
        }
        this._pos = pos;
        this._slot = slot;
        this._treasureId = G_UserData.getBattleResource().getResourceId(pos, 2, slot);
        if (this._treasureId) {
            var data = G_UserData.getTreasure().getTreasureDataWithId(this._treasureId);
            var baseId = data.getBase_id();
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.updateUI(baseId);
            this._fileNodeCommon.setLevel(data.getLevel());
            this._fileNodeCommon.setRlevel(data.getRefine_level());
            this._fileNodeName.node.active = (true);
            this._fileNodeName.setName(baseId, null, this._formatName);
            if (FunctionCheck.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3)[0]) {
                var [_, convertHeroBaseId] = UserDataHelper.getHeroBaseIdWithTreasureId(this._treasureId);
                this._fileNodeCommon.updateJadeSlot(data.getJadeSysIds(), convertHeroBaseId);
            }
        } else {
            this._imageSketch.addComponent(CommonUI).loadTexture(Path.getUICommonFrame(SKETCH_RES[slot]));
            this._imageSketch.node.active = (true);
            var ret = G_UserData.getTreasure().getReplaceTreasureListWithSlot(this._pos, this._slot);
            this._totalList = ret[0];
            this._noWearList = ret[1];
            if (this._noWearList.length > 0) {
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
    _normalTouchCallback() {
        if (!this._isOpen) {
            return;
        }
        if (this._treasureId) {
            G_SceneManager.showScene('treasureDetail', this._treasureId, TreasureConst.TREASURE_RANGE_TYPE_2);
        } else {
            if (this._noWearList.length == 0) {
                UIPopupHelper.popupItemGuider(function (popupItemGuider: PopupItemGuider) {
                    popupItemGuider.updateUI(TypeConvertHelper.TYPE_TREASURE, DataConst['SHORTCUT_TREASURE_ID_' + this._slot]);
                    popupItemGuider.setTitle(Lang.get('way_type_get'));
                }.bind(this))
            } else {
                PopupChooseTreasure2.loadCommonPrefab("PopupChooseTreasure2", (popup: PopupChooseTreasure2) => {
                    var callBack = handler(this, this._onChooseTreasure);
                    popup.setTitle(Lang.get('treasure_wear_title'));
                    popup.updateUI(PopupChooseTreasureHelper.FROM_TYPE1, callBack, this._totalList, null, null, this._noWearList, this._pos);
                    popup.openWithAction();
                })
            }
        }
    }
    _onlyShowTouchCallback() {
        if (this._onlyShowCallback) {
            this._onlyShowCallback();
        }
    }
    _onChooseTreasure(treasureId) {
        G_UserData.getTreasure().c2sEquipTreasure(this._pos, this._slot, treasureId);
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
        //this._panelTouch.interactable = (false);
        if (data) {
            var baseId = data.getBase_id();
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.updateUI(baseId);
            this._fileNodeCommon.setLevel(data.getLevel());
            this._fileNodeCommon.setRlevel(data.getRefine_level());
            this._fileNodeName.node.active = (true);
            this._fileNodeName.setName(baseId);
            if (isShow) {
                this._fileNodeCommon.updateJadeSlot(data.getUserDetailJades() || {}, heroBaseId);
                this.setOnlyShowCallback(function () {
                    UIPopupHelper.popupUserJadeDes(this, data);
                });
            } else {
                this.setOnlyShowCallback(null);
            }
        } else {
            this._imageSketch.addComponent(CommonUI).loadTexture(Path.getUICommonFrame(SKETCH_RES[slot]));
            this._imageSketch.node.active = (true);
        }
    }
    setOnlyShowCallback(callback) {
        this._onlyShowCallback = callback;
    }
}