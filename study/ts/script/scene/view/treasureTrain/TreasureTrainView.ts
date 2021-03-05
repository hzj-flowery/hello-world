const {ccclass, property} = cc._decorator;

import { G_UserData, G_SceneManager, G_ConfigLoader, G_WaitingMask, G_SignalManager, G_ResolutionManager } from '../../../init';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import CommonTabIcon from '../../../ui/component/CommonTabIcon'
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { Lang } from '../../../lang/Lang';
import { TreasureTrainHelper } from './TreasureTrainHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import TreasureConst from '../../../const/TreasureConst';
import { handler } from '../../../utils/handler';
import { assert } from '../../../utils/GlobleFunc';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import ResourceLoader from '../../../utils/resource/ResourceLoader';
import { SignalConst } from '../../../const/SignalConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import UIHelper from '../../../utils/UIHelper';
import TreasureTrainStrengthenLayer from './TreasureTrainStrengthenLayer';
import ViewBase from '../../ViewBase';
import TreasureTrainRefineLayer from './TreasureTrainRefineLayer';
import TreasureTrainLimitLayer from './TreasureTrainLimitLayer';
import TreasureTrainJadeLayer from './TreasureTrainJadeLayer';


var JADE_ARROW_X_OFFSET = 220;
var JADE_ARROW_X_SCALE = 195;
@ccclass
export default class TreasureTrainView extends ViewBase {

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
    _imageRope3: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRope4: cc.Sprite = null;

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
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon3: CommonTabIcon = null;

    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon4: CommonTabIcon = null;

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
    strengthenLayer:cc.Prefab = null;

    @property(cc.Prefab)
    refineLayer:cc.Prefab = null;

    @property(cc.Prefab)
    JadeLayer:cc.Prefab = null;

    @property(cc.Prefab)
    limitLayer:cc.Prefab = null;

    _treasureId;
    _trainType;
    _rangeType;

    _selectTabIndex;
    _isJumpWhenBack;
    _allTreasureIds:any[];

    _selectedPos:number;
    _treasureCount;
    _signalTreasureRefine;
    _pageViewEnable:boolean = true;

    _subLayers:any = {};
    _leftArrowPosX: any;
    _rightArrowPosX: any;

    ctor(treasureId, trainType, rangeType, isJumpWhenBack) {
        G_UserData.getTreasure().setCurTreasureId(treasureId);
        this._selectTabIndex = trainType || TreasureConst.TREASURE_TRAIN_STRENGTHEN;
        this._rangeType = rangeType || TreasureConst.TREASURE_RANGE_TYPE_1;
        this._isJumpWhenBack = isJumpWhenBack;
        this._allTreasureIds = [];

        UIHelper.addEventListener(this.node, this._buttonLeft, 'TreasureTrainView', '_onButtonLeftClicked');
        UIHelper.addEventListener(this.node, this._buttonRight, 'TreasureTrainView', '_onButtonRightClicked');
    }
    onCreate() {
        this.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        this.node.setPosition(-this.node.width / 2, -this.node.height / 2);
        var params = G_SceneManager.getViewArgs();
        this.ctor(params[0],params[1],params[2],params[3]);
        this._subLayers = {};
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_baowu');
        if (this._isJumpWhenBack) {
            this._topbarBase.setCallBackOnBack(handler(this, this._setCallback));
        }
        this._leftArrowPosX = this._buttonLeft.node.x;
        this._rightArrowPosX = this._buttonRight.node.x;
        this._initTab();
    }
    onEnter() {
        this._signalTreasureRefine = G_SignalManager.add(SignalConst.EVENT_TREASURE_REFINE_SUCCESS, handler(this, this._onRefineSuccess));
        this._updateTreasureIds();
        this._calCurSelectedPos();
        this.updateArrowBtn();
        this.updateTabIcons();
        this._updateView();
        this.onLoadFinish();

    }
    onExit() {
        this._signalTreasureRefine.remove();
        this._signalTreasureRefine = null;
    }
    _updateTreasureIds() {
        var treasureId = G_UserData.getTreasure().getCurTreasureId();
        if (this._rangeType == TreasureConst.TREASURE_RANGE_TYPE_1) {
            this._allTreasureIds = G_UserData.getTreasure().getRangeDataBySort();
        } else if (this._rangeType == TreasureConst.TREASURE_RANGE_TYPE_2) {
            var unit = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
            var pos = unit.getPos();
            if (pos) {
                this._allTreasureIds = G_UserData.getBattleResource().getTreasureIdsWithPos(pos);
            }
        }
        this._treasureCount = this._allTreasureIds.length;
    }
    _calCurSelectedPos() {
        var treasureId = G_UserData.getTreasure().getCurTreasureId();
        this._selectedPos = 1;
        for (var i=0; i<this._allTreasureIds.length; i++) {
            var id = this._allTreasureIds[i];
            if (id == treasureId) {
                this._selectedPos = i+1;
            }
        }
    }
    _initTab() {
        for (var i = 1; i<=4; i++) {
            var txt = Lang.get('treasure_train_tab_icon_' + i);
            var isOpen = LogicCheckHelper.funcIsOpened(FunctionConst['FUNC_TREASURE_TRAIN_TYPE' + i])[0];
            this['_nodeTabIcon' + i].updateUI(txt, isOpen, i);
            this['_nodeTabIcon' + i].setCallback(handler(this, this._onClickTabIcon));
        }
    }
    _onClickTabIcon(index) {
        if (index == this._selectTabIndex) {
            return;
        }
        if(index > 4){
            return;
        }
        this._selectTabIndex = index;
        this.updateTabIcons();
        this._updateView();
        this.updateArrowBtn()
    }
    updateTabIcons() {
        this._doLayoutTabIcons();
        this._updateTabIconSelectedState();
        this._updateRedPoint();
    }
    _updateTabIconSelectedState() {
        for (var i = 1; i<=4; i++) {
            this['_nodeTabIcon' + i].setSelected(i == this._selectTabIndex);
        }
    }
    onLoadFinish(){
        this.scheduleOnce(()=>{
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
        },0);
    }
    _updateView() {
        var layer = this._subLayers[this._selectTabIndex];
        if (layer == null) {
            if (this._selectTabIndex == TreasureConst.TREASURE_TRAIN_STRENGTHEN) {
                layer = cc.instantiate(this.strengthenLayer).getComponent(TreasureTrainStrengthenLayer);
                (layer as TreasureTrainStrengthenLayer).ctor(this);
            } else if (this._selectTabIndex == TreasureConst.TREASURE_TRAIN_REFINE) {
                //layer = new TreasureTrainRefineLayer(this);
                layer = cc.instantiate(this.refineLayer).getComponent(TreasureTrainRefineLayer);
                (layer as TreasureTrainRefineLayer).ctor(this);
            }else if (this._selectTabIndex == TreasureConst.TREASURE_TRAIN_JADE) {
                //layer = new TreasureTrainRefineLayer(this);
                layer = cc.instantiate(this.JadeLayer).getComponent(TreasureTrainJadeLayer);
                //(layer as TreasureTrainJadeLayer).ctor(this);
            } else if (this._selectTabIndex == TreasureConst.TREASURE_TRAIN_LIMIT) {
                //layer = new TreasureTrainLimitLayer(this);
                layer = cc.instantiate(this.limitLayer).getComponent(TreasureTrainLimitLayer);
                (layer as TreasureTrainLimitLayer).ctor(this);
            }
            if (layer) {
                this._panelContent.addChild(layer.node);
                this._subLayers[this._selectTabIndex] = layer;
            }
        }
        for (let k in this._subLayers) {
            var subLayer = this._subLayers[k];
            subLayer.node.active = (false);
        }
        layer.node.active = (true);
        layer.updateInfo();
    }
    _setCallback() {
        G_UserData.getTeamCache().setShowTreasureTrainFlag(true);
        G_SceneManager.popSceneByTimes(2);
    }
    checkRedPoint(index) {
        var treasureId = G_UserData.getTreasure().getCurTreasureId();
        var unitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        var reach = RedPointHelper.isModuleReach(FunctionConst['FUNC_TREASURE_TRAIN_TYPE' + index], unitData);
        this['_nodeTabIcon' + index].showRedPoint(reach);
    }
    _updateRedPoint() {
        for (var i = 1; i<=4; i++) {
            this.checkRedPoint(i);
        }
    }
    updateArrowBtn() {
        var isShow = this._selectedPos > 1;
        var isShow2 = this._selectedPos < this._treasureCount;
        if (this._selectTabIndex == TreasureConst.TREASURE_TRAIN_LIMIT) {
            isShow = false;
            isShow2 = false;
        }
        this._buttonLeft.node.active = (isShow);
        this._buttonRight.node.active = (isShow2);
        if (this._selectTabIndex == TreasureConst.TREASURE_TRAIN_JADE) {
            this._buttonLeft.node.x =(this._leftArrowPosX + JADE_ARROW_X_OFFSET - JADE_ARROW_X_SCALE);
            this._buttonRight.node.x =(this._rightArrowPosX + JADE_ARROW_X_OFFSET + JADE_ARROW_X_SCALE);
        } else {
            this._buttonLeft.node.x =(this._leftArrowPosX);
            this._buttonRight.node.x =(this._rightArrowPosX);
        }
    }
    setArrowBtnVisible(visible) {
        this._buttonLeft.node.opacity = (visible) ? 255 : 0;
        this._buttonRight.node.opacity = (visible) ? 255 : 0;
    }
    _onButtonLeftClicked() {
        if(!this._pageViewEnable){
            return;
        }
        if (this._selectedPos <= 1) {
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        var curTreasureId = this._allTreasureIds[this._selectedPos-1];
        G_UserData.getTreasure().setCurTreasureId(curTreasureId);
        this.updateArrowBtn();
        this._updateView();
        this.updateTabIcons();
    }
    _onButtonRightClicked() {
        if(!this._pageViewEnable){
            return;
        }
        if (this._selectedPos >= this._treasureCount) {
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        var curTreasureId = this._allTreasureIds[this._selectedPos-1];
        G_UserData.getTreasure().setCurTreasureId(curTreasureId);
        this.updateArrowBtn();
        this._updateView();
        this.updateTabIcons();
    }
    getAllTreasureIds() {
        return this._allTreasureIds;
    }
    getTreasureCount() {
        return this._treasureCount;
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
    }
    _onRefineSuccess() {
        if (this._rangeType == TreasureConst.TREASURE_RANGE_TYPE_1) {
            this._updateTreasureIds();
            this._calCurSelectedPos();
            this.updateArrowBtn();
            var layer = this._subLayers[this._selectTabIndex];
            if (layer) {
                layer.reInitPageView();
                layer.updatePageView();
            }
        }
    }
    getRangeType() {
        return this._rangeType;
    }
    _doLayoutTabIcons() {
        var dynamicTabs = [];
        var showCount = 1;
        for (var i = 1; i<=4; i++) {
            var txt = Lang.get('treasure_train_tab_icon_' + i);
            var isOpen = LogicCheckHelper.funcIsShow(FunctionConst['FUNC_TREASURE_TRAIN_TYPE' + i]);
            var curTreasureId = G_UserData.getTreasure().getCurTreasureId();
            var curUnitData = G_UserData.getTreasure().getTreasureDataWithId(curTreasureId);
            if (i == 2) {
                this._nodeTabIcon2.node.active = (isOpen);
                this._imageRope2.node.active = (isOpen);
                if (isOpen) {
                    showCount = showCount + 1;
                    var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2);
                  //assert((funcLevelInfo, 'Invalid function_level can not find funcId ' + FunctionConst.FUNC_TREASURE_TRAIN_TYPE2);
                    dynamicTabs.push({
                        tab: this._nodeTabIcon2,
                        openLevel: funcLevelInfo.level
                    });
                }
            }
            if (i == 3) {
                if(!curUnitData.isCanLimitBreak){
                    console.log("_doLayoutTabIcons");
                }
                var canLimit = curUnitData.isCanLimitBreak();
                isOpen = isOpen && canLimit;
                this._nodeTabIcon3.node.active = (isOpen);
                this._imageRope3.node.active = (isOpen);
                if (isOpen) {
                    showCount = showCount + 1;
                    var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3);
                  //assert((funcLevelInfo, 'Invalid function_level can not find funcId ' + FunctionConst.FUNC_TREASURE_TRAIN_TYPE3);
                    dynamicTabs.push({
                        tab: this._nodeTabIcon3,
                        openLevel: funcLevelInfo.level
                    });
                }
            }
            if (i == 4) {
                if(!curUnitData.isCanLimitBreak){
                    console.log("_doLayoutTabIcons");
                }
                var canLimit = curUnitData.isCanLimitBreak();
                isOpen = isOpen && canLimit;
                this._nodeTabIcon4.node.active = (isOpen);
                this._imageRope4.node.active = (isOpen);
                if (isOpen) {
                    showCount = showCount + 1;
                    var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4);
                  //assert((funcLevelInfo, 'Invalid function_level can not find funcId ' + FunctionConst.FUNC_TREASURE_TRAIN_TYPE3);
                    dynamicTabs.push({
                        tab: this._nodeTabIcon4,
                        openLevel: funcLevelInfo.level
                    });
                }
            }
            this['_nodeTabIcon' + i].updateUI(txt, isOpen, i);
        }
        if (showCount == 1) {
            this._imageRopeTail.node.y = (430);
        } else if (showCount == 2) {
            this._imageRopeTail.node.y = (292);
        } else if (showCount == 3) {
            this._imageRopeTail.node.y = (140);
        }else if (showCount == 4) {
            this._imageRopeTail.node.y = (-10);
        }
    }
    setPageViewEnable(enable){
        this._pageViewEnable = enable;
    }
}
