const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonTabIcon from '../../../ui/component/CommonTabIcon'
import { G_UserData, G_SignalManager, G_SceneManager } from '../../../init';
import PetConst from '../../../const/PetConst';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';
import { Lang } from '../../../lang/Lang';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import PetTrainUpgradeLayer from './PetTrainUpgradeLayer';
import PetTrainStarLayer from './PetTrainStarLayer';
import PetTrainLimitLayer from './PetTrainLimitLayer';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { PetTrainHelper } from '../petTrain/PetTrainHelper';
import ViewBase from '../../ViewBase';

var TAIL_POS_NORMAL = 295;
var TAIL_POS_LIMIT = 135;

@ccclass
export default class PetTrainView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image3: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTail: cc.Sprite = null;

    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon1: CommonTabIcon = null;

    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon2: CommonTabIcon = null;

    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon3: CommonTabIcon = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonLeft: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonRight: cc.Button = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property(cc.Prefab)
    petTrainUpgradeLayer: cc.Prefab = null;
    @property(cc.Prefab)
    petTrainStarLayer: cc.Prefab = null;
    @property(cc.Prefab)
    petTrainLimitLayer: cc.Prefab = null;

    _selectTabIndex: any;
    _rangeType: any;
    _isJumpWhenBack: any;
    _subLayers: {};
    _signalHeroRankUp;
    _signalPetLimitUpSuccess;
    _allPetIds: any;
    _petCount: any;
    _selectedPos: number;


    ctor(petId, trainType, rangeType, isJumpWhenBack) {
        G_UserData.getPet().setCurPetId(petId);
        this._selectTabIndex = trainType || PetConst.PET_TRAIN_UPGRADE;
        this._rangeType = rangeType || PetConst.PET_RANGE_TYPE_1;
        this._isJumpWhenBack = isJumpWhenBack;
    }

    start() {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_shenshou');
    }
    onCreate() {
        this.setSceneSize();
        var params = G_SceneManager.getViewArgs('petTrain');
        this.ctor(params[0], params[1], params[2], params[3]);
        this._subLayers = {};
        if (this._isJumpWhenBack) {
            this._topbarBase.setCallBackOnBack(handler(this, this._setCallback));
        }
        this._initTab();
    }
    onEnter() {
        this._signalHeroRankUp = G_SignalManager.add(SignalConst.EVENT_PET_STAR_UP_SUCCESS, handler(this, this._petStarUpSuccess));
        this._signalPetLimitUpSuccess = G_SignalManager.add(SignalConst.EVENT_PET_LIMITUP_SUCCESS, handler(this, this._petLimitUpSuccess));
        this._updatePetIds();
        this._calCurSelectedPos();
        this.updateArrowBtn();
        this.updateTabVisible();
        this._updateView();
        this.updateRedPoint();
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PetTrainView");
    }
    onExit() {
        this._signalHeroRankUp.remove();
        this._signalHeroRankUp = null;
        this._signalPetLimitUpSuccess.remove();
        this._signalPetLimitUpSuccess = null;
    }
    _updatePetIds() {
        if (this._rangeType == PetConst.PET_RANGE_TYPE_1) {
            this._allPetIds = G_UserData.getPet().getRangeDataBySort();
        } else if (this._rangeType == PetConst.PET_RANGE_TYPE_2) {
            this._allPetIds = G_UserData.getTeam().getPetIdsInBattle();
        } else if (this._rangeType == PetConst.PET_RANGE_TYPE_3) {
            this._allPetIds = G_UserData.getTeam().getPetIdsInHelp();
        }
        this._petCount = this._allPetIds.length;
    }
    _calCurSelectedPos() {
        this._selectedPos = 1;
        var heroId = G_UserData.getPet().getCurPetId();
        for (var i in this._allPetIds) {
            var id = this._allPetIds[i];
            if (id == heroId) {
                this._selectedPos = parseFloat(i) + 1;
            }
        }
    }
    _initTab() {
        var curHeroId = G_UserData.getPet().getCurPetId();
        var curPetData = G_UserData.getPet().getUnitDataWithId(curHeroId);
        for (var i = 1; i <= PetConst.MAX_TRAIN_TAB; i++) {
            var txt = Lang.get('pet_train_tab_icon_' + i);
            var [isOpen] = LogicCheckHelper.funcIsOpened(FunctionConst['FUNC_PET_TRAIN_TYPE' + i]);
            if (i == 2) {
                var canBreak = curPetData.isCanBreak();
                isOpen = isOpen && canBreak;
            }
            if (i == 3) {
                var canShowLimitBtn = PetTrainHelper.canShowLimitBtn(curPetData);
                isOpen = isOpen && canShowLimitBtn;
            }
            this['_nodeTabIcon' + i].updateUI(txt, isOpen, i);
            this['_nodeTabIcon' + i].setCallback(handler(this, this._onClickTabIcon));
        }
    }
    _onClickTabIcon(index) {
        if (index == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index;
        this.updateArrowBtn();
        this.updateTabVisible();
        this._updateView();
    }
    _updateTabIcons() {
        var tabSize = PetTrainHelper.getCurTabSize();
        for (var i = 1; i <= tabSize; i++) {
            this['_nodeTabIcon' + i].setSelected(i == this._selectTabIndex);
        }
    }
    updateTabVisible() {
        var tabSize = PetTrainHelper.getCurTabSize();
        this._nodeTabIcon3.node.active = (tabSize == 3);
        this._image3.node.active = (tabSize == 3);
        this._imageTail.node.y = (tabSize == 3 ? TAIL_POS_LIMIT : TAIL_POS_NORMAL);
        var curHeroId = G_UserData.getPet().getCurPetId();
        var curPetData = G_UserData.getPet().getUnitDataWithId(curHeroId);
        for (var i = 1; i <= tabSize; i++) {
            var txt = Lang.get('pet_train_tab_icon_' + i);
            var [isOpen] = LogicCheckHelper.funcIsOpened(FunctionConst['FUNC_PET_TRAIN_TYPE' + i]);
            if (i == 2) {
                var canBreak = curPetData.isCanBreak();
                isOpen = isOpen && canBreak;
            }
            if (i == 3) {
                var canShowLimitBtn = PetTrainHelper.canShowLimitBtn(curPetData);
                isOpen = isOpen && canShowLimitBtn;
            }
            this['_nodeTabIcon' + i].updateUI(txt, isOpen, i);
        }
        this._updateTabIcons();
    }
    _updateView() {
        var layer = this._subLayers[this._selectTabIndex];
        if (layer == null) {
            if (this._selectTabIndex == PetConst.PET_TRAIN_UPGRADE) {
                layer = cc.instantiate(this.petTrainUpgradeLayer).getComponent(PetTrainUpgradeLayer);
                layer.ctor(this);
            } else if (this._selectTabIndex == PetConst.PET_TRAIN_STAR) {
                layer = cc.instantiate(this.petTrainStarLayer).getComponent(PetTrainStarLayer);
                layer.ctor(this);
            } else if (this._selectTabIndex == PetConst.PET_TRAIN_LIMIT) {
                layer = cc.instantiate(this.petTrainLimitLayer).getComponent(PetTrainLimitLayer);
                layer.ctor(this);
            }
            if (layer) {
                this._panelContent.addChild(layer.node);
                this._subLayers[this._selectTabIndex] = layer;
            }
        }
        for (var k in this._subLayers) {
            var subLayer = this._subLayers[k];
            subLayer.node.active = (false);
        }
        layer.node.active = (true);
        layer.initInfo();
    }
    _setCallback() {
        G_UserData.getTeamCache().setShowHeroTrainFlag(true);
        G_SceneManager.popSceneByTimes(2);
    }
    checkRedPoint(index) {
        var petId = G_UserData.getPet().getCurPetId();
        var petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
        var reach = RedPointHelper.isModuleReach(FunctionConst['FUNC_PET_TRAIN_TYPE' + index], petUnitData);
        this['_nodeTabIcon' + index].showRedPoint(reach);
    }
    updateRedPoint() {
        for (var i = 1; i <= 3; i++) {
            this.checkRedPoint(i);
        }
    }
    _setArrowVisible(visible) {
        this._buttonLeft.node.active = (visible);
        this._buttonRight.node.active = (visible);
    }
    updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 1);
        this._buttonRight.node.active = (this._selectedPos < this._petCount);
        if (this._selectTabIndex == PetConst.PET_TRAIN_LIMIT) {
            this._setArrowVisible(false);
        }
    }
    onButtonLeftClicked() {
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        var curHeroId = this._allPetIds[this._selectedPos - 1];
        G_UserData.getPet().setCurPetId(curHeroId);
        this.updateTabVisible();
        this.updateArrowBtn();
        this._updateView();
        this.updateRedPoint();
    }
    onButtonRightClicked() {
        if (this._selectedPos >= this._petCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        var curHeroId = this._allPetIds[this._selectedPos - 1];
        G_UserData.getPet().setCurPetId(curHeroId);
        this.updateTabVisible();
        this.updateArrowBtn();
        this._updateView();
        this.updateRedPoint();
    }
    getAllPetIds() {
        return this._allPetIds;
    }
    getPetCount() {
        return this._petCount;
    }
    setSelectedPos(pos) {
        this._selectedPos = pos;
    }
    getSelectedPos() {
        return this._selectedPos;
    }
    setArrowBtnEnable(enable) {
        this._buttonLeft.interactable = (enable);
        this._buttonRight.interactable = (enable);
    }
    _petStarUpSuccess() {
        if (this._rangeType == PetConst.PET_RANGE_TYPE_1) {
            this._updatePetIds();
            this._calCurSelectedPos();
            this.updateArrowBtn();
            this.updateTabVisible();
            var layer = this._subLayers[this._selectTabIndex];
            if (layer) {
                if (layer.updatePageView) {
                    layer.updatePageView();
                }
            }
        }
    }
    _petLimitUpSuccess() {
        this._updatePetIds();
        this._calCurSelectedPos();
        this.updateRedPoint();
    }
}