const {ccclass, property} = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonTabIcon from '../../../ui/component/CommonTabIcon'
import { G_UserData, G_SignalManager, G_SceneManager, G_ConfigLoader, G_ResolutionManager } from '../../../init';
import InstrumentConst from '../../../const/InstrumentConst';
import ViewBase from '../../ViewBase';
import { handler } from '../../../utils/handler';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { SignalConst } from '../../../const/SignalConst';
import { Lang } from '../../../lang/Lang';
import { FunctionConst } from '../../../const/FunctionConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { assert } from '../../../utils/GlobleFunc';
import { RedPointHelper } from '../../../data/RedPointHelper';
import CommonTabGroupHorizonClassify3 from '../../../ui/component/CommonTabGroupHorizonClassify3';
import InstrumentTrainAdvanceLayer from './InstrumentTrainAdvanceLayer';
import UIHelper from '../../../utils/UIHelper';
import InstrumentTrainLimitLayer from './InstrumentTrainLimitLayer';

@ccclass
export default class InstrumentTrainView extends ViewBase {

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
    _imageRope1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRope2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRopeTail: cc.Sprite = null;

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
    instrumentTrainAdvanceLayer:cc.Prefab = null;

    @property(cc.Prefab)
    InstrumentTrainLimitLayer:cc.Prefab = null;


    private _selectTabIndex:number;
    private _rangeType:number;
    private _isJumpWhenBack:boolean;
    private _allInstrumentIds:any[];
    private _subLayers:any;
    private _signalInstrumentLevelup:any;
    private _instrumentCount:number;
    private _selectedPos:number;

    init(InstrumentId, trainType, rangeType, isJumpWhenBack){
        G_UserData.getInstrument().setCurInstrumentId(InstrumentId);
        this._selectTabIndex = trainType || InstrumentConst.INSTRUMENT_TRAIN_ADVANCE;
        this._rangeType = rangeType || InstrumentConst.INSTRUMENT_RANGE_TYPE_1;
        this._isJumpWhenBack = isJumpWhenBack;
        this._allInstrumentIds = [];

        UIHelper.addEventListener(this.node,this._buttonLeft, 'InstrumentTrainView', '_onButtonLeftClicked');
        UIHelper.addEventListener(this.node,this._buttonRight, 'InstrumentTrainView', '_onButtonRightClicked');
    }
    onCreate() {
        this.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        this.node.setPosition(-this.node.width / 2, -this.node.height / 2);

        var params = G_SceneManager.getViewArgs("instrumentTrain");
        this.init(params[0],params[1],params[2],params[3]);

        this._subLayers = {};
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_shenbing');
        if (this._isJumpWhenBack) {
            this._topbarBase.setCallBackOnBack(handler(this, this._setCallback));
        }
        this._initTab();
    }
    onEnter() {
        this._signalInstrumentLevelup = G_SignalManager.add(SignalConst.EVENT_INSTRUMENT_LEVELUP_SUCCESS, handler(this, this._onLevelupSuccess));
        this._updateInstrumentIds();
        this._calCurSelectedPos();
        this.updateArrowBtn();
        this._updateTabIcons();
        this._updateView();
    }
    onExit() {
        this._signalInstrumentLevelup.remove();
        this._signalInstrumentLevelup = null;
    }
    _initTab() {
        for (var i = 1; i<=2; i++) {
            var txt = Lang.get('instrument_train_tab_icon_' + i);
            var isOpen = LogicCheckHelper['funcIsOpened'](FunctionConst['FUNC_TREASURE_TRAIN_TYPE' + i])[0];
            this['_nodeTabIcon' + i].updateUI(txt, isOpen, i);
            this['_nodeTabIcon' + i].setCallback(handler(this, this.onClickTabIcon));
        }
    }
    onClickTabIcon(index) {
        if (index == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index;
        this._updateTabIcons();
        this._updateView();
    }
    _setCallback() {
        G_UserData.getTeamCache().setShowInstrumentTrainFlag(true);
        G_SceneManager.popSceneByTimes(2);
    }
    _onLevelupSuccess() {
        if (this._rangeType == InstrumentConst.INSTRUMENT_RANGE_TYPE_1) {
            this._updateInstrumentIds();
            this._calCurSelectedPos();
            this.updateArrowBtn();
            var layer = this._subLayers[this._selectTabIndex-1];
            layer.reInitPageView();
            layer.updatePageView();
        }
    }
    _onButtonLeftClicked() {
        if (this._selectedPos <= 0) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        var curInstrumentId = this._allInstrumentIds[this._selectedPos];
        G_UserData.getInstrument().setCurInstrumentId(curInstrumentId);
        this.updateArrowBtn();
        this._updateView();
        this._updateTabIcons();
    }
    _onButtonRightClicked() {
        if (this._selectedPos >= this._instrumentCount-1) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        var curInstrumentId = this._allInstrumentIds[this._selectedPos];
        G_UserData.getInstrument().setCurInstrumentId(curInstrumentId);
        this.updateArrowBtn();
        this._updateView();
        this._updateTabIcons();
    }
    _updateInstrumentIds() {
        var instrumentId = G_UserData.getInstrument().getCurInstrumentId();
        if (this._rangeType == InstrumentConst.INSTRUMENT_RANGE_TYPE_1) {
            this._allInstrumentIds = G_UserData.getInstrument().getRangeDataBySort();
        } else if (this._rangeType == InstrumentConst.INSTRUMENT_RANGE_TYPE_2) {
            var unit = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
            var pos = unit.getPos();
            if (pos) {
                this._allInstrumentIds = G_UserData.getBattleResource().getInstrumentIdsWithPos(pos);
            }
        }
        this._instrumentCount = this._allInstrumentIds.length;
    }
    _calCurSelectedPos() {
        this._selectedPos = 0;
        var instrumentId = G_UserData.getInstrument().getCurInstrumentId();
        for (var i = 0; i<this._allInstrumentIds.length;i++) {
            var id = this._allInstrumentIds[i];
            if (id == instrumentId) {
                this._selectedPos = i;
            }
        }
    }
    updateArrowBtn() {
        this._buttonLeft.node.active = (this._selectedPos > 0);
        this._buttonRight.node.active = (this._selectedPos < this._instrumentCount-1);
    }
    _updateTabIcons() {
        this._doLayoutTabIcons();
        this._updateTabIconSelectedState();
        this._updateRedPoint();
    }
    _doLayoutTabIcons() {
        var dynamicTabs = [];
        var showCount = 1;
        for (var i = 1; i<=2; i++) {
            var txt = Lang.get('instrument_train_tab_icon_' + i);
            var isOpen = LogicCheckHelper['funcIsShow'](FunctionConst['FUNC_INSTRUMENT_TRAIN_TYPE' + i]);
            var curInstrumentId = G_UserData.getInstrument().getCurInstrumentId();
            var curUnitData = G_UserData.getInstrument().getInstrumentDataWithId(curInstrumentId);
            if (i == 2) {
                var canLimit = curUnitData.isCanLimitBreak();
                var isShow = curUnitData.getLimitFuncShow()
                isOpen = isShow && canLimit;
                this._nodeTabIcon2.node.active = (isOpen);
                this._imageRope2.node.active = (isOpen);
                if (isOpen) {
                    showCount = showCount + 1;
                    //var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2);
                    //assert(funcLevelInfo, 'Invalid function_level can not find funcId ' + FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2);
                    // dynamicTabs.push({
                    //     tab: this._nodeTabIcon2,
                    //     openLevel: funcLevelInfo.level
                    // });
                }
            }
            this['_nodeTabIcon' + i].updateUI(txt, isOpen, i);
        }
        if (showCount == 1) {
            this._imageRopeTail.node.y = (424);
        } else if (showCount == 2) {
            this._imageRopeTail.node.y = (292);
        }
    }
    _updateTabIconSelectedState() {
        for (var i = 1; i<=2; i++) {
            this['_nodeTabIcon' + i].setSelected(i == this._selectTabIndex);
        }
    }
    _updateRedPoint() {
        for (var i = 1; i <= 2; i++) {
            this.checkRedPoint(i);
        }
    }
    checkRedPoint(index) {
        var instrumentId = G_UserData.getInstrument().getCurInstrumentId();
        var unitData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
        var reach = RedPointHelper.isModuleReach(FunctionConst['FUNC_INSTRUMENT_TRAIN_TYPE' + index], unitData);
        this['_nodeTabIcon' + index].showRedPoint(reach);
    }
    _updateView() {
        var layer = this._subLayers[this._selectTabIndex-1];
        if (layer == null) {
            if (this._selectTabIndex == InstrumentConst.INSTRUMENT_TRAIN_ADVANCE) {
                var node = cc.instantiate(this.instrumentTrainAdvanceLayer);
                layer = (node as cc.Node).getComponent(InstrumentTrainAdvanceLayer);
                layer.init(this);
            } else if (this._selectTabIndex == InstrumentConst.INSTRUMENT_TRAIN_LIMIT) {
                layer = cc.instantiate(this.InstrumentTrainLimitLayer).getComponent(InstrumentTrainLimitLayer);
                layer.ctor(this);
            }
            if (layer) {
                this._panelContent.addChild(layer.node);
                this._subLayers[this._selectTabIndex-1] = layer;
            }
        }
        for (let k in this._subLayers) {
            var subLayer = this._subLayers[k];
            subLayer.node.active = (false);
        }
        layer.node.active = (true);
        layer.updateInfo();
    }
    getAllInstrumentIds() {
        return this._allInstrumentIds;
    }
    getInstrumentCount() {
        return this._instrumentCount;
    }
    setSelectedPos(pos) {
        this._selectedPos = pos;
    }
    getSelectedPos() {
        return this._selectedPos;
    }
    getRangeType() {
        return this._rangeType;
    }
    setArrowBtnEnable(enable) {
        this._buttonLeft.node.active = (enable);
        this._buttonRight.node.active = (enable);
    }
    setArrowBtnVisible(visible) {
        this._buttonLeft.node.opacity = (this._selectedPos > 0 && visible) ? 255 : 0;
        this._buttonRight.node.opacity = (this._selectedPos < this._instrumentCount-1 && visible) ? 255 : 0;
    }
}
