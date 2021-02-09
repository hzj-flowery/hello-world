import CommonHorseEquipIcon from "../../../ui/component/CommonHorseEquipIcon";
import { handler } from "../../../utils/handler";
import { G_UserData, G_SceneManager } from "../../../init";
import UIActionHelper from "../../../utils/UIActionHelper";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import PopupHorseEquipInfo from "../../../ui/popup/PopupHorseEquipInfo";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { Lang } from "../../../lang/Lang";
import { DataConst } from "../../../const/DataConst";
import PopupChooseHorseEquip from "../../../ui/popup/PopupChooseHorseEquip";
import { PopupChooseHorseEquipHelper } from "../../../ui/popup/PopupChooseHorseEquipHelper";
import PopupHorseEquipDetail from "../horseEquipDetail/PopupHorseEquipDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TeamHorseEquipIcon extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _equipName: cc.Label = null;
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
        type: CommonHorseEquipIcon,
        visible: true
    })
    _fileNodeCommon: CommonHorseEquipIcon = null;
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

    private _horseId;
    private _equipPos;
    private _totalList;
    private _noWearList;
    private _horseEquipInfo

    init(horseId, equipPos) {
        this._horseId = horseId;
        this._equipPos = equipPos;
        this._totalList = [];
        this._noWearList = [];

        this._panelTouch.on(cc.Node.EventType.TOUCH_END, handler(this, this._onPanelTouch));
    }

    _initUI() {
        this._imageSketch.node.active = (false);
        this._spriteAdd.node.active = (false);
        this._fileNodeCommon.node.active = (false);
        this._imageRedPoint.node.active = (false);
        this._imageArrow.node.active = (false);
        this._equipName.node.active = (false);
    }

    updateIcon() {
        this._horseEquipInfo = G_UserData.getHorseEquipment().getEquipedEquipinfoWithHorseIdAndSlot(this._horseId, this._equipPos);
        this._initUI();
        if (this._horseEquipInfo) {
            var equipBaseId = this._horseEquipInfo.getBase_id();
            this._fileNodeCommon.node.active = (true);
            this._fileNodeCommon.updateUI(equipBaseId);
            this._equipName.node.active = (true);
            this._equipName.string = (this._horseEquipInfo.name || "");
        } else {
            let SKETCH_RES = {
                [1]: "img_horse07",
                [2]: "img_horse08",
                [3]: "img_horse09",
            }
            UIHelper.loadTexture(this._imageSketch, Path.getHorseImg(SKETCH_RES[this._equipPos]));
            this._imageSketch.node.active = (true);
            [this._totalList, this._noWearList] = G_UserData.getHorseEquipment().getReplaceEquipmentListWithSlot(this._equipPos);
            if (this._noWearList.length > 0) {
                this._spriteAdd.node.active = (true);
                UIActionHelper.playBlinkEffect(this._spriteAdd.node);
            }
        }
        this._showRedPoint();
    }

    _onPanelTouch() {
        if (this._horseEquipInfo) {
            let callback = (backType) => {
                if (backType) {
                    if (backType == 'change') {
                        var scene = G_SceneManager.getTopScene();
                        var view = scene.getSceneView();
                        var viewName = view.getName();
                        if (viewName == 'HorseDetailView' || viewName == 'HorseTrainView') {
                            view.popupHorseEquipReplace(this._equipPos);
                        }
                    } else if (backType == 'put_off') {
                        G_UserData.getHorseEquipment().c2sEquipWarHorseEquipment(this._horseId, this._equipPos, 0);
                    }
                }
            }
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupHorseEquipInfo"), (popupHorseEquipInfo: PopupHorseEquipInfo) => {
                popupHorseEquipInfo.init(callback);
                popupHorseEquipInfo.updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP, this._horseEquipInfo.getBase_id());
                popupHorseEquipInfo.openWithAction();
            });
        } else {
            if (this._noWearList.length == 0) {
                G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemGuider"), (popup: PopupItemGuider) => {
                    popup.setTitle(Lang.get('way_type_get'));
                    popup.updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP, DataConst['SHORTCUT_HORSE_EQUIP_ID_' + this._equipPos]);
                    popup.openWithAction();
                });
            } else {
                G_SceneManager.openPopup(Path.getCommonPrefab("PopupChooseHorseEquip"), (popup: PopupChooseHorseEquip) => {
                    var callBack = handler(this, this._onChooseEquip);
                    popup.setTitle(Lang.get('horse_equip_wear_title'));
                    popup.updateUI(PopupChooseHorseEquipHelper.FROM_TYPE1, callBack, this._totalList, null, this._noWearList, this._equipPos);
                    popup.openWithAction();
                });
            }
        }
    }

    _onChooseEquip(equipId) {
        G_UserData.getHorseEquipment().c2sEquipWarHorseEquipment(this._horseId, this._equipPos, equipId);
    }

    _showRedPoint() {
        if (!this._fileNodeCommon.node.active) {
            var hasFree = G_UserData.getHorseEquipment().isHaveFreeHorseEquip(this._equipPos);
            this._imageRedPoint.node.active = (hasFree);
        } else {
            var hasBetter = G_UserData.getHorseEquipment().isHaveBetterHorseEquip(this._horseEquipInfo.getBase_id());
            this._imageRedPoint.node.active = (hasBetter);
        }
    }

    showUpArrow(visible) {
        this._imageArrow.node.active = (visible);
        if (visible) {
            UIActionHelper.playFloatEffect(this._imageArrow.node);
        }
    }
}