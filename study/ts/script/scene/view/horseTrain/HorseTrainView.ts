const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import ViewBase from '../../ViewBase';
import { G_UserData, G_SceneManager, G_SignalManager } from '../../../init';
import HorseConst from '../../../const/HorseConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';
import HorseTrainUpStarLayer from './HorseTrainUpStarLayer';
import { Path } from '../../../utils/Path';
import PopupChooseHorseEquip from '../../../ui/popup/PopupChooseHorseEquip';
import { Lang } from '../../../lang/Lang';
import { PopupChooseHorseEquipHelper } from '../../../ui/popup/PopupChooseHorseEquipHelper';

@ccclass
export default class HorseTrainView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _panelContent: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _buttonLeft: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _buttonRight: cc.Button = null;

    @property({ type: CommonTopbarBase, visible: true })
    _topbarBase: CommonTopbarBase = null;

    @property({ type: cc.Prefab, visible: true })
    _horseTrainUpStarLayerPrefab: cc.Prefab = null;

    private _rangeType;
    private _isJumpWhenBack;
    private _allHorseIds;

    private _signalHorseStarUpSuccess;
    private _horseCount;
    private _selectedPos;

    private _subLayer: HorseTrainUpStarLayer;

    onCreate() {
        this.setSceneSize();
        let [horseId, rangeType, isJumpWhenBack] = G_SceneManager.getViewArgs();
        G_UserData.getHorse().setCurHorseId(horseId);
        this._rangeType = rangeType || HorseConst.HORSE_RANGE_TYPE_1;
        this._isJumpWhenBack = isJumpWhenBack;
        this._allHorseIds = [];

        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_horse');
        if (this._isJumpWhenBack) {
            this._topbarBase.setCallBackOnBack(handler(this, this._setCallback));
        }
    }

    onEnter() {
        this._signalHorseStarUpSuccess = G_SignalManager.add(SignalConst.EVENT_HORSE_STARUP_SUCCESS, handler(this, this._onHorseStarUpSuccess));
        this._updateHorseIds();
        this._calCurSelectedPos();
        this.updateArrowBtn();
        this._updateView();
    }

    onExit() {
        this._signalHorseStarUpSuccess.remove();
        this._signalHorseStarUpSuccess = null;
    }

    _updateHorseIds() {
        var horseId = G_UserData.getHorse().getCurHorseId();
        if (this._rangeType == HorseConst.HORSE_RANGE_TYPE_1) {
            this._allHorseIds = G_UserData.getHorse().getRangeDataBySort();
        } else if (this._rangeType == HorseConst.HORSE_RANGE_TYPE_2) {
            var unit = G_UserData.getHorse().getUnitDataWithId(horseId);
            var pos = unit.getPos();
            if (pos) {
                this._allHorseIds = G_UserData.getBattleResource().getHorseIdsWithPos(pos);
            }
        }
        this._horseCount = this._allHorseIds.length;
    }

    _calCurSelectedPos() {
        this._selectedPos = 1;
        var horseId = G_UserData.getHorse().getCurHorseId();
        for (let i in this._allHorseIds) {
            var id = this._allHorseIds[i];
            if (id == horseId) {
                this._selectedPos = parseInt(i) + 1;
            }
        }
    }

    _updateView() {
        if (this._subLayer == null) {
            this._subLayer = cc.instantiate(this._horseTrainUpStarLayerPrefab).getComponent(HorseTrainUpStarLayer);
            this._subLayer.init(this);
            this._panelContent.addChild(this._subLayer.node);
        }
        this._subLayer.initInfo();
    }

    _setCallback() {
        G_UserData.getTeamCache().setShowHorseTrainFlag(true);
        G_SceneManager.popSceneByTimes(2);
    }

    updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 1);
        this._buttonRight.node.active = (this._selectedPos < this._horseCount);
    }

    onButtonLeftClicked() {
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        var curHorseId = this._allHorseIds[this._selectedPos - 1];
        G_UserData.getHorse().setCurHorseId(curHorseId);
        this.updateArrowBtn();
        // this._updateView();
        this._subLayer.onButtonLeftRightClicked();
    }

    onButtonRightClicked() {
        if (this._selectedPos >= this._horseCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        var curHorseId = this._allHorseIds[this._selectedPos - 1];
        G_UserData.getHorse().setCurHorseId(curHorseId);
        this.updateArrowBtn();
        // this._updateView();
        this._subLayer.onButtonLeftRightClicked();
    }

    getAllHorseIds() {
        return this._allHorseIds;
    }

    getHorseCount() {
        return this._horseCount;
    }

    setSelectedPos(pos) {
        this._selectedPos = pos;
    }

    getSelectedPos() {
        return this._selectedPos;
    }

    setArrowBtnEnable(enable) {
        this._buttonLeft.node.active = (enable);
        this._buttonRight.node.active = (enable);
        if(enable)
        {
            this.updateArrowBtn();
        }
    }

    _onHorseStarUpSuccess() {
        if (this._rangeType == HorseConst.HORSE_RANGE_TYPE_1) {
            this._updateHorseIds();
            this._calCurSelectedPos();
            this.updateArrowBtn();
            this._subLayer.updatePageView();
        }
    }

    getRangeType() {
        return this._rangeType;
    }

    updateHorseEquipDifPrompt() {
        if (this._subLayer) {
            this._subLayer.updateHorseEquipDifPrompt();
        }
    }

    popupHorseEquipReplace(equipPos) {
        var horseId = G_UserData.getHorse().getCurHorseId();
        var [totalList, noWearList] = G_UserData.getHorseEquipment().getReplaceEquipmentListWithSlot(equipPos, horseId);

        G_SceneManager.openPopup(Path.getCommonPrefab("PopupChooseHorseEquip"), (popup: PopupChooseHorseEquip) => {
            var callBack = function (equipId) {
                G_UserData.getHorseEquipment().c2sEquipWarHorseEquipment(horseId, equipPos, equipId);
            };
            popup.setTitle(Lang.get('horse_equip_wear_title'));
            popup.updateUI(PopupChooseHorseEquipHelper.FROM_TYPE2, callBack, totalList, null, noWearList, equipPos);
            popup.openWithAction();
        });
    }
}