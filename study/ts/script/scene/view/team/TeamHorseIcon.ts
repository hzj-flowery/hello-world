import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import CommonHorseIcon from "../../../ui/component/CommonHorseIcon";
import CommonHeroStar from "../../../ui/component/CommonHeroStar";
import { G_UserData, G_Prompt, G_SceneManager } from "../../../init";
import { FunctionConst } from "../../../const/FunctionConst";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import HorseConst from "../../../const/HorseConst";
import { DataConst } from "../../../const/DataConst";
import { Lang } from "../../../lang/Lang";
import UIActionHelper from "../../../utils/UIActionHelper";
import { HorseDataHelper } from "../../../utils/data/HorseDataHelper";
import { HorseEquipmentData } from "../../../data/HorseEquipmentData";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { Path } from "../../../utils/Path";
import PopupChooseHorse from "../../../ui/popup/PopupChooseHorse";
import { handler } from "../../../utils/handler";
import { PopupChooseHorseHelper } from "../../../ui/popup/PopupChooseHorseHelper";

var POSX_STAR = {
    1: 45,
    2: 37,
    3: 29
};

const { ccclass, property } = cc._decorator;
@ccclass
export default class TeamHorseIcon extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _spriteAdd: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNameBg: cc.Sprite = null;

    @property({
        type: CommonHorseIcon,
        visible: true
    })
    _fileNodeCommon: CommonHorseIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPoint: cc.Sprite = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _fileNodeStar: CommonHeroStar = null;

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

    private _horseId: number;
    private _pos: number;
    private _totalList: any;
    private _noWearList: any;

    onLoad() {
        this._pos = null;
        this._horseId = null;
        this._totalList = {};
        this._noWearList = {};
        //this._panelTouch.interactable = true;
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, this._onPanelTouch, this);
    }
    _initUI() {
        this._spriteAdd.node.active = (false);
        this._fileNodeCommon.node.active = (false);
        this._textName.node.active = (false);
        this._imageNameBg.node.active = (false);
        this._imageRedPoint.node.active = (false);
        this._fileNodeStar.node.active = (false);
        this._imageArrow.node.active = (false);
    }
    updateIcon(pos) {
        this._pos = pos;
        this._horseId = G_UserData.getBattleResource().getResourceId(pos, HorseConst.FLAG, 1);
        this._initUI();
        if (this._horseId) {
            var horseData = G_UserData.getHorse().getUnitDataWithId(this._horseId);
            var horseBaseId = horseData.getBase_id();
            var star = horseData.getStar();
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, horseBaseId);
            this._fileNodeCommon.node.active = (true);
            this._textName.node.active = (true);
            this._imageNameBg.node.active = (true);
            this._fileNodeCommon.updateUI(horseBaseId);
            this._fileNodeStar.setCountEx(star);
            var posX = POSX_STAR[star];
            if (posX) {
                this._fileNodeStar.node.x = (posX);
            }
            var name = HorseDataHelper.getHorseName(horseBaseId, star);
            this._textName.string = (name);
            this._textName.node.color = (param.icon_color);
            this._fileNodeCommon.setEquipBriefVisible(true);
            this._fileNodeCommon.updateEquipBriefBg(horseData.getConfig().color);
            var equipList = G_UserData.getHorseEquipment().getEquipedEquipListWithHorseId(this._horseId);
            var stateList = [
                0,
                0,
                0
            ];
            for (var k in equipList) {
                var equipData = equipList[k];
                var config = equipData.getConfig();
                stateList[config.type - 1] = config.color;
            }
            this._fileNodeCommon.updateEquipBriefIcon(stateList);
        } else {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(this._pos);
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
            var ret = G_UserData.getHorse().getReplaceHorseListWithSlot(pos, heroBaseId);
            this._totalList = ret[0];
            this._noWearList = ret[1];
            var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HORSE)[0];
            if (this._noWearList.length > 0 && isOpen) {
                this._spriteAdd.node.active = (true);
                UIActionHelper.playBlinkEffect(this._spriteAdd.node);
            }
        }
    }
    _onPanelTouch() {
        var ret = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HORSE);
        var isOpen = ret[0];
        var des = ret[1];
        var info = ret[2];
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        if (this._horseId) {
            G_SceneManager.showScene('horseDetail', this._horseId, HorseConst.HORSE_RANGE_TYPE_2);
        } else {
            if (this._noWearList.length == 0) {
                UIPopupHelper.popupItemGuider(function (popupItemGuider: PopupItemGuider) {
                    popupItemGuider.updateUI(TypeConvertHelper.TYPE_HORSE, DataConst.SHORTCUT_HORSE_ID);
                    popupItemGuider.setTitle(Lang.get('way_type_get'));
                }.bind(this))
            } else {
                G_SceneManager.openPopup(Path.getCommonPrefab("PopupChooseHorse"), function (popup: PopupChooseHorse) {
                    var callBack = handler(this, this._onChooseHorse);
                    popup.setTitle(Lang.get('horse_wear_title'));
                    popup.updateUI(PopupChooseHorseHelper.FROM_TYPE1, callBack, this._totalList);
                    popup.openWithAction();
                }.bind(this));
            }
        }
    }
    _onChooseHorse(horseId) {
        G_UserData.getHorse().c2sWarHorseFit(this._pos, horseId);
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
    onlyShow(data, horseEquipList) {
        this._initUI();
        // this._panelTouch.interactable = (false);
        if (data) {
            var baseId = data.getBase_id();
            var star = data.getStar();
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, baseId);
            this._fileNodeCommon.node.active = (true);
            this._textName.node.active = (true);
            this._imageNameBg.node.active = (true);
            this._fileNodeCommon.updateUI(baseId);
            this._fileNodeStar.setCountEx(star);
            var posX = POSX_STAR[star];
            if (posX) {
                this._fileNodeStar.node.x = (posX);
            }
            var name = HorseDataHelper.getHorseName(baseId, star);
            this._textName.string = (name);
            this._textName.node.color = (param.icon_color);
            UIHelper.enableOutline(this._textName, param.icon_color_outline, 2)
            var horseEquipData = data.getEquip();
            this._fileNodeCommon.setEquipBriefVisible(true);
            this._fileNodeCommon.updateEquipBriefBg(data.getConfig().color);
            if (horseEquipList) {
                var stateList = [
                    0,
                    0,
                    0
                ];
                for (var index in horseEquipData) {
                    var equipId = horseEquipData[index];
                    if (equipId != 0) {
                        var equipData = horseEquipList['k_' + equipId];
                        var config = equipData.getConfig();
                        stateList[index] = config.color;
                    }
                }
                this._fileNodeCommon.updateEquipBriefIcon(stateList);
            }
        }
    }
}