const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { HeroConst } from '../../../const/HeroConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_ConfigLoader, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonTabIcon from '../../../ui/component/CommonTabIcon';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { Path } from '../../../utils/Path';
import ViewBase from '../../ViewBase';
import HeroGoldHelper from '../heroGoldTrain/HeroGoldHelper';
import HeroTrainAwakeLayer from './HeroTrainAwakeLayer';
import HeroTrainBreakLayer from './HeroTrainBreakLayer';
import HeroTrainLimitLayer from './HeroTrainLimitLayer';
import HeroTrainUpgradeLayer from './HeroTrainUpgradeLayer';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';





@ccclass
export default class HeroTrainView extends ViewBase {

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

    protected preloadResList = [
        {path:Path.getPrefab("HeroTrainUpgradeLayer","heroTrain"),type:cc.Prefab},
        {path:Path.getPrefab("HeroTrainLimitLayer","heroTrain"),type:cc.Prefab},
        {path:Path.getPrefab("HeroTrainAwakeLayer","heroTrain"),type:cc.Prefab},
        {path:Path.getPrefab("HeroLimitDetailAttrNode","heroTrain"),type:cc.Prefab},
        {path:Path.getPrefab("HeroTrainBreakLayer","heroTrain"),type:cc.Prefab},
        {path:Path.getPrefab("HeroLimitCostPanel","heroTrain"),type:cc.Prefab},
        {path:Path.getPrefab("HeroLimitDetailTalentNode","heroTrain"),type:cc.Prefab},
        {path:Path.getPrefab("BreakResultTalentDesNode","hero"),type:cc.Prefab},
        {path:Path.getPrefab("TreasureTrainLimitBg","treasure"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonMaterialIcon"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonHeroAvatar"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonHeroIcon"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonDetailTitleWithBg"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonCostNode"),type:cc.Prefab}
    ]

    private _subLayers: Array<any>;
    private _isJumpWhenBack: boolean;
    private _signalHeroRankUp;
    private _rangeType: number;
    private _allHeroIds: Array<number>;//下标从0走
    private _heroCount: number;
    private _selectedPos: number;//下标从1走
    private _selectTabIndex: number;

    private static _enterInitData: Array<any>;


    private _heroTrainUpgradeLayer: any;
    private _heroTrainLimitLayer: any;
    private _heroTrainAwakeLayer: any;
    private _heroTrainBreakLayer: any;
    _signalHeroLimitUpWithHero: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;

    public static waitEnterMsg(callBack: any, params: Array<any>): void {
        HeroTrainView._enterInitData = params;
        callBack();
    }

    onLoad(): void {

        G_UserData.getHero().setCurHeroId(HeroTrainView._enterInitData[0]);
        this._selectTabIndex = HeroTrainView._enterInitData[1] || HeroConst.HERO_TRAIN_UPGRADE;
        this._rangeType = HeroTrainView._enterInitData[2] || HeroConst.HERO_RANGE_TYPE_1;
        this._isJumpWhenBack = HeroTrainView._enterInitData[3] //当点返回时，是否要跳过上一个场景
        this._heroTrainUpgradeLayer = cc.resources.get(Path.getPrefab("HeroTrainUpgradeLayer","heroTrain"));
        this._heroTrainLimitLayer = cc.resources.get(Path.getPrefab("HeroTrainLimitLayer","heroTrain"));
        this._heroTrainAwakeLayer = cc.resources.get(Path.getPrefab("HeroTrainAwakeLayer","heroTrain"));
        this._heroTrainBreakLayer = cc.resources.get(Path.getPrefab("HeroTrainBreakLayer","heroTrain"));
        super.onLoad();
    }

    onCreate() {
        this.setSceneSize();
        this._subLayers = [];
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_wujiang');
        if (this._isJumpWhenBack) {
            this._topbarBase.setCallBackOnBack(handler(this, this._setCallback));
        }
        this._initTab();
    }
    onEnter() {
        this._signalHeroRankUp = G_SignalManager.add(SignalConst.EVENT_HERO_RANKUP, handler(this, this._heroRankUpSuccess));
        this._signalHeroLimitUpWithHero = G_SignalManager.add(SignalConst.EVENT_HERO_LIMIT_LV_PUT_RES_WITH_HERO, handler(this, this._heroRankUpSuccess));
        this._updateHeroIds();
        this._calCurSelectedPos();
        this.updateArrowBtn();
        this.updateTabIcons();
        this._updateView();
        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'HeroTrainView');
        }, 0);
    }
    onExit() {
        G_UserData.getTeamCache().setShowHeroTrainFlag(true);
        this._signalHeroRankUp.remove();
        this._signalHeroRankUp = null;
        this._signalHeroLimitUpWithHero.remove();
        this._signalHeroLimitUpWithHero = null;
    }
    _updateHeroIds() {
        var allHeroIds = {};
        if (this._rangeType == HeroConst.HERO_RANGE_TYPE_1) {
            allHeroIds = G_UserData.getHero().getRangeDataBySort();
        } else if (this._rangeType == HeroConst.HERO_RANGE_TYPE_2) {
            allHeroIds = G_UserData.getTeam().getHeroIdsInBattle();
        }
        this._allHeroIds = this._filterHero(allHeroIds);
        this._heroCount = this._allHeroIds.length;
    }
    _filterHero(allHeroIds) {
        var filters = [];
        for (var index = 0; index < allHeroIds.length; index++) {
            var heroId = allHeroIds[index];
            var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
            if (!HeroGoldHelper.isPureHeroGold(unitData)) {
                filters.push(heroId);
            }
        }
        return filters;
    }
    _calCurSelectedPos() {
        this._selectedPos = 1;
        var heroId = G_UserData.getHero().getCurHeroId();
        for (var i = 0; i < this._allHeroIds.length; i++) {
            var id = this._allHeroIds[i];
            if (id == heroId) {
                this._selectedPos = i + 1;
            }
        }
    }
    _initTab() {
        for (var i = 1; i <= 4; i++) {
            (this['_nodeTabIcon' + i] as CommonTabIcon).setCallback(handler(this, this._onClickTabIcon));
        }
    }
    _onClickTabIcon(index) {
        if (index == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index;
        this._updateTabIconSelectedState();
        this._updateView();
    }
    _updateTabIconSelectedState() {
        for (var i = 1; i <= 4; i++) {
            this['_nodeTabIcon' + i].setSelected(i == this._selectTabIndex);
        }
    }
    updateTabIcons() {
        this._doLayoutTabIcons();
        this._updateTabIconSelectedState();
        this._updateRedPoint();
    }
    _updateView() {
        var layer = this._subLayers[this._selectTabIndex];
        if (layer == null) {
            var p = HeroConst.HERO_TRAIN_LIMIT;
            if (this._selectTabIndex == HeroConst.HERO_TRAIN_UPGRADE) {
                layer = (cc.instantiate(this._heroTrainUpgradeLayer) as cc.Node).getComponent(HeroTrainUpgradeLayer) as HeroTrainUpgradeLayer;
                layer.setInitData(this);
            } else if (this._selectTabIndex == HeroConst.HERO_TRAIN_LIMIT) {
                layer = (cc.instantiate(this._heroTrainLimitLayer) as cc.Node).getComponent(HeroTrainLimitLayer) as HeroTrainLimitLayer;
                layer.setInitData(this);
            }
            else if (this._selectTabIndex == HeroConst.HERO_TRAIN_AWAKE) {
                layer = (cc.instantiate(this._heroTrainAwakeLayer) as cc.Node).getComponent(HeroTrainAwakeLayer) as HeroTrainAwakeLayer;
                layer.setInitData(this);
            }
            else if (this._selectTabIndex == HeroConst.HERO_TRAIN_BREAK) {
                layer = (cc.instantiate(this._heroTrainBreakLayer) as cc.Node).getComponent(HeroTrainBreakLayer) as HeroTrainBreakLayer;
                layer.setInitData(this);
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
        this.updateArrowBtn();

    }
    _setCallback() {
        G_SceneManager.popSceneByTimes(2);
    }
    checkRedPoint(index) {
        var heroId = G_UserData.getHero().getCurHeroId();
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var reach = RedPointHelper.isModuleReach(FunctionConst['FUNC_HERO_TRAIN_TYPE' + index], heroUnitData);
        (this['_nodeTabIcon' + index] as CommonTabIcon).showRedPoint(reach);
    }
    _updateRedPoint() {
        for (var i = 1; i <= 4; i++) {
            this.checkRedPoint(i);
        }
    }
    updateArrowBtn() {
        if (this._selectTabIndex == HeroConst.HERO_TRAIN_LIMIT) {
            this.setArrowBtnVisible(false);
        }
        else {
            this._buttonLeft.node.active = this._selectedPos > 1;
            this._buttonRight.node.active = this._selectedPos < this._heroCount;
        }
    }
    setArrowBtnVisible(visible) {
        this._buttonLeft.node.active = visible;
        this._buttonRight.node.active = visible;
    }
    onButtonLeftClicked() {
        if (this._selectedPos <= 1) {
            this.updateArrowBtn();
            return;
        }
        this._selectedPos = this._selectedPos - 1;
        var curHeroId = this._allHeroIds[this._selectedPos - 1];
        G_UserData.getHero().setCurHeroId(curHeroId);
        this.updateArrowBtn();
        this._updateView();
        this.updateTabIcons();
    }
    onButtonRightClicked() {
        if (this._selectedPos >= this._heroCount) {
            this.updateArrowBtn();
            return;
        }
        this._selectedPos = this._selectedPos + 1;
        var curHeroId = this._allHeroIds[this._selectedPos - 1];
        G_UserData.getHero().setCurHeroId(curHeroId);
        this.updateArrowBtn();
        this._updateView();
        this.updateTabIcons();
    }
    getAllHeroIds() {
        return this._allHeroIds;
    }
    getHeroCount() {
        return this._heroCount;
    }
    setSelectedPos(pos) {
        this._selectedPos = pos;
    }
    getSelectedPos() {
        return this._selectedPos;
    }
    setArrowBtnEnable(enable) {
        this._buttonLeft.interactable = enable;
        this._buttonRight.interactable = enable;
    }
    _heroRankUpSuccess() {
        if (this._rangeType == HeroConst.HERO_RANGE_TYPE_1) {
            this._updateHeroIds();
            this._calCurSelectedPos();
             if (this._selectTabIndex != HeroConst.HERO_TRAIN_LIMIT) {
                this.updateArrowBtn();
            }
            var layer = this._subLayers[this._selectTabIndex];
            if (layer && layer.updatePageView) {
                layer.updatePageView();
            }
        }
    }
    _doLayoutTabIcons() {
        var dynamicTabs: Array<any> = [];
        var dynamicRopes: Array<any> = [];
        var showCount = 2;
        for (var i = 1; i <= 4; i++) {
            var txt = Lang.get('hero_train_tab_icon_' + i);
            var isOpen = FunctionCheck.funcIsOpened(FunctionConst['FUNC_HERO_TRAIN_TYPE' + i])[0];
            var curHeroId = G_UserData.getHero().getCurHeroId();
            var curHeroData = G_UserData.getHero().getUnitDataWithId(curHeroId);
            if (i == 2) {
                var canBreak = curHeroData.isCanBreak();
                isOpen = isOpen && canBreak;
            }
            if (i == 3) {
                var canAwake = curHeroData.isCanAwake();
                isOpen = isOpen && canAwake;
                this._nodeTabIcon3.node.active = isOpen;
                this._imageRope3.node.active = isOpen;
                if (isOpen) {
                    showCount = showCount + 1;
                    var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_HERO_TRAIN_TYPE3);
                  //assert((funcLevelInfo, 'Invalid function_level can not find funcId ' + FunctionConst.FUNC_HERO_TRAIN_TYPE3);
                    dynamicTabs.push({
                        tab: this._nodeTabIcon3,
                        displayOpenLevel: funcLevelInfo.level,
                        openLevel: funcLevelInfo.level
                    });
                    dynamicRopes.push({
                        rope: this._imageRope3,
                        displayOpenLevel: funcLevelInfo.level,
                        openLevel: funcLevelInfo.level
                    });
                }
            }
            if (i == 4) {
                var [canLimit, limitType] = curHeroData.isCanLimitBreak();
                isOpen = isOpen && canLimit;
                var funcLimitType = FunctionConst.FUNC_HERO_TRAIN_TYPE4;
                var funcLimitType2 = funcLimitType;
                if (limitType == HeroConst.HERO_LIMIT_TYPE_GOLD) {
                    funcLimitType = FunctionConst.FUNC_HERO_TRAIN_TYPE4_RED;
                }
                var limitIsOpen = LogicCheckHelper.funcIsOpened(funcLimitType)[0];
                isOpen = isOpen && limitIsOpen;
                this._nodeTabIcon4.node.active = isOpen;
                this._imageRope4.node.active = isOpen;
                if (isOpen) {
                    showCount = showCount + 1;
                    var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(funcLimitType);
                    var funcLevelInfo2 = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(funcLimitType2);
                  //assert((funcLevelInfo, 'Invalid function_level can not find funcId ' + FunctionConst.FUNC_HERO_TRAIN_TYPE4);
                    dynamicTabs.push({
                        tab: this._nodeTabIcon4,
                        displayOpenLevel: funcLevelInfo2.level,
                        openLevel: funcLevelInfo.level
                    });
                    var funcLevelInfo2 = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(funcLimitType2);
                    dynamicRopes.push({
                        rope: this._imageRope4,
                        displayOpenLevel: funcLevelInfo2.level,
                        openLevel: funcLevelInfo.level
                    });
                }
            }
            this['_nodeTabIcon' + i].updateUI(txt, isOpen, i);
        }
        dynamicTabs.sort(function (a, b) {
            return a.displayOpenLevel - b.displayOpenLevel;
        });
        dynamicRopes.sort(function (a, b) {
            return a.displayOpenLevel - b.displayOpenLevel;
        });
        if (dynamicTabs[0]) {
            dynamicTabs[0].tab.node.y = 208;
        }
        if (dynamicTabs[1]) {
            dynamicTabs[1].tab.node.y = 62;
        }
        if (showCount == 2) {
            this._imageRopeTail.node.y = 296;
        }
        else if (showCount == 3) {
            this._imageRopeTail.node.y = (150);
        }
        else if (showCount == 4) {
            this._imageRopeTail.node.y = 4;
        }
    }



}