const { ccclass, property } = cc._decorator;

import AttributeConst from '../../../const/AttributeConst';
import { AudioConst } from '../../../const/AudioConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import { AttrRecordUnitData } from '../../../data/AttrRecordUnitData';
import { HeroUnitData } from '../../../data/HeroUnitData';
import EffectHelper from '../../../effect/EffectHelper';
import LabelExtend from '../../../extends/LabelExtend';
import { Colors, G_AudioManager, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrDiff from '../../../ui/component/CommonAttrDiff';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonHeroCountry from '../../../ui/component/CommonHeroCountry';
import CommonHeroName from '../../../ui/component/CommonHeroName';
import CommonMaterialIcon from '../../../ui/component/CommonMaterialIcon';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import HeroTrainView from './HeroTrainView';









var ITEM_ID_2_MATERICAL_INDEX = {
    [DataConst['ITEM_HERO_LEVELUP_MATERIAL_1']]: 1,
    [DataConst['ITEM_HERO_LEVELUP_MATERIAL_2']]: 2,
    [DataConst['ITEM_HERO_LEVELUP_MATERIAL_3']]: 3,
    [DataConst['ITEM_HERO_LEVELUP_MATERIAL_4']]: 4
};

@ccclass
export default class HeroTrainUpgradeLayer extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName2: CommonHeroName = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _fileNodeDetailTitle: CommonDetailTitleWithBg = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOldLevel1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOldLevel2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNewLevel: cc.Label = null;

    @property({
        type: CommonAttrDiff,
        visible: true
    })
    _fileNodeAttr1: CommonAttrDiff = null;

    @property({
        type: CommonAttrDiff,
        visible: true
    })
    _fileNodeAttr2: CommonAttrDiff = null;

    @property({
        type: CommonAttrDiff,
        visible: true
    })
    _fileNodeAttr3: CommonAttrDiff = null;

    @property({
        type: CommonAttrDiff,
        visible: true
    })
    _fileNodeAttr4: CommonAttrDiff = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelMaterial: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _fileNodeDetailTitle2: CommonDetailTitleWithBg = null;

    @property({
        type: CommonMaterialIcon,
        visible: true
    })
    _fileNodeMaterial1: CommonMaterialIcon = null;

    @property({
        type: CommonMaterialIcon,
        visible: true
    })
    _fileNodeMaterial2: CommonMaterialIcon = null;

    @property({
        type: CommonMaterialIcon,
        visible: true
    })
    _fileNodeMaterial3: CommonMaterialIcon = null;

    @property({
        type: CommonMaterialIcon,
        visible: true
    })
    _fileNodeMaterial4: CommonMaterialIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelButton: cc.Node = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonUpgradeOne: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonUpgradeFive: CommonButtonLevel1Normal = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelLeader: cc.Node = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName: CommonHeroName = null;

    @property({
        type: CommonHeroCountry,
        visible: true
    })
    _fileNodeCountry: CommonHeroCountry = null;

    @property({
        type: cc.PageView,
        visible: true
    })
    _pageView: cc.PageView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel: cc.Label = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBarExp: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textExpPercent1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textExpPercent2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelCount: cc.Label = null;


    private _heroUnitData: HeroUnitData;
    private _signalHeroLevelUp;
    private _parentView: HeroTrainView;
    private _diffLevel: number;
    private _diffExp: number;

    private _commonHeroAvatar: any;
    //下标从0走
    private _pageItems: Array<any> = [];

    public setInitData(paV: HeroTrainView): void {
        this._parentView = paV;
        this._commonHeroAvatar = cc.resources.get(Path.getCommonPrefab("CommonHeroAvatar"))
        this.node.name = "HeroTrainUpgradeLayer";
    }
    onCreate() {
        this.setSceneSize();
        for(var j =1;j<=4;j++)
        this["_fileNodeAttr"+j]._textCurValue.addComponent(LabelExtend);
        this._initData();
        var leadName = (this._panelLeader.getChildByName("Text_40") as cc.Node).getComponent(cc.Label) as cc.Label;
        UIHelper.enableOutline(leadName,new cc.Color(133,74,27));
        UIHelper.enableOutline(this._textExpPercent2,new cc.Color(0,0,0),1);
    }
    onEnter() {
        this._signalHeroLevelUp = G_SignalManager.add(SignalConst.EVENT_HERO_LEVELUP, handler(this, this._onHeroLevelUpSuccess));
        this._pageView.enabled = false;
        this._initView();
    }
    onExit() {
        this._signalHeroLevelUp.remove();
        this._signalHeroLevelUp = null;
        this._clearTextSummary();
        if (this._nodeEffect.children && this._nodeEffect.children.length > 0)
            this._nodeEffect.removeAllChildren();
    }
    initInfo() {
        this._parentView.setArrowBtnVisible(true);
        this._updateData();
        this._updateView();
        this._updatePageItem();
        var selectedPos = this._parentView.getSelectedPos();
        this._pageView.scrollToPage(selectedPos-1,0);
        // var pages = this._pageView.getPages();
        // for(var j =0;j<pages.length;j++)
        // {
        //     if(j==selectedPos)
        //     pages[j].children[0].scale = 1.4;
        //     else
        //     pages[j].children[0].scale = 0.5;
        // }

    }

    private _limitLevel: number;
    private _limitExp: number;
    private _lastTotalPower;
    private _lastAttrData: any;
    private _diffAttrData;
    private _lastExp: number;
    private _lastLevel: number;
    private _curAttrData;
    private _nextAttrData;
    private _materialFakeCount: number;
    private _materialFakeCostCount: number;
    private _fakeCurExp: number;
    private _fakeLevel: number;
    private _fakeCurAttrData;
    private _fakeNextAttrData;
    private _pageViewSize;
    private _costMaterials;
    private _isLeader: boolean;
    private _recordAttr: AttrRecordUnitData;
    _initData() {
        this._limitLevel = 0;
        this._limitExp = 0;
        this._lastTotalPower = 0;
        this._lastAttrData = {};
        this._diffAttrData = {};
        this._lastExp = 0;
        this._lastLevel = 0;
        this._curAttrData = {};
        this._nextAttrData = {};
        this._materialFakeCount = null;
        this._materialFakeCostCount = null;
        this._fakeCurExp = 0;
        this._fakeLevel = 0;
        this._fakeCurAttrData = {};
        this._fakeNextAttrData = {};
        this._costMaterials = {};
        this._isLeader = false;
        this._pageItems = [];
        this._pageViewSize = this._pageView.node.getChildByName("view").getContentSize();
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_HERO_TRAIN_TYPE1);
    }
    _initView() {
        this._fileNodeDetailTitle.setFontSize(24);
        this._fileNodeDetailTitle2.setFontSize(24);
        this._fileNodeDetailTitle.setTitle(Lang.get('hero_upgrade_detail_title'));
        this._fileNodeDetailTitle2.setTitle(Lang.get('hero_upgrade_detail_title2'));
        this._buttonUpgradeOne._text.string = (Lang.get('hero_upgrade_btn_upgrade_1'));
        this._buttonUpgradeFive._text.string = (Lang.get('hero_upgrade_btn_upgrade_5'));
        this._labelCount.node.active = false;
        this._initPageView();
        for (var i = 1; i <= 4; i++) {
            var itemId = DataConst['ITEM_HERO_LEVELUP_MATERIAL_' + i];
            this['_fileNodeMaterial' + i].updateUI(itemId, handler(this, this._onClickMaterialIcon), handler(this, this._onStepClickMaterialIcon));
            this['_fileNodeMaterial' + i].setStartCallback(handler(this, this._onStartCallback));
            this['_fileNodeMaterial' + i].setStopCallback(handler(this, this._onStopCallback));
        }
    }
    _updateData() {
        this._limitLevel = G_UserData.getBase().getLevel();
        var curHeroId = G_UserData.getHero().getCurHeroId();
        this._heroUnitData = G_UserData.getHero().getUnitDataWithId(curHeroId);
        var heroConfig = this._heroUnitData.getConfig();
        this._isLeader = heroConfig.type == 1;
        var templet = heroConfig.lvup_cost;
        this._limitExp = HeroDataHelper.getHeroNeedExpWithLevel(templet, this._limitLevel);
        this._updateAttrData();
        this._recordAddedLevel();
        this._recordAddedExp();
        G_UserData.getAttr().recordPower();
    }
    _updateAttrData() {
        var config = this._heroUnitData.getConfig();
        var curLevel = this._heroUnitData.getLevel();
        this._curAttrData = HeroDataHelper.getBasicAttrWithLevel(config, curLevel);
        this._nextAttrData = HeroDataHelper.getBasicAttrWithLevel(config, curLevel + 1);
        this._recordAttr.updateData(this._curAttrData);
    }
    _createPageItem(pos: number = 0) {
        var node = new cc.Node();
        node.setContentSize(this._pageViewSize.width, this._pageViewSize.height)
        node.setAnchorPoint(0.5, 0.5);
        return node;
    }
    _updatePageItem() {
        var allHeroIds = this._parentView.getAllHeroIds();
        var index = this._parentView.getSelectedPos() - 1;
        console.log("传入的位置------",index);
        for (var i = index-1; i <=index+1; i++) {
            if (i >= 0 && i < allHeroIds.length) {
                if (this._pageItems[i] == null) {
                    var widget = this._createPageItem(i);
                    this._pageView.addPage(widget);
                    this._pageItems[i] = { widget: widget };
                }
                if (this._pageItems[i].avatar == null) {
                    var node1 = cc.instantiate(this._commonHeroAvatar);
                    var avatar = node1.getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                    avatar.init();
                    this._pageItems[i].widget.addChild(avatar.node);
                    this._pageItems[i].avatar = avatar;
                    avatar.setScale(1.4);
                    avatar.node.setPosition(0,-192/1.5);
                }
                var heroId = allHeroIds[i];
                var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                var [heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData);
                var limitLevel = avatarLimitLevel || unitData.getLimit_level();
                var limitRedLevel = arLimitLevel || unitData.getLimit_rtg();
                this._pageItems[i].avatar.updateUI(heroBaseId, null, null, limitLevel, null, null, limitRedLevel);
            }
        }
        this._pageView.scrollToPage(index,0);
    }
    _initPageView() {

        if (this._pageItems && this._pageItems.length == 0) {
            this._pageItems = [];
            // this._pageView.setSwallowTouches(false);
            // this._pageView.setScrollDuration(0.3);
            // var cmpE = new cc.PageView.EventHandler();
            // cmpE.component = "HeroTrainUpgradeLayer";
            // cmpE.handler = "onPageViewEvent";
            // cmpE.target = this.node;
            // this._pageView.pageEvents.push(cmpE);

            this._pageViewSize = this._pageView.node.getContentSize();
            this._pageView.removeAllPages();
            var heroCount = this._parentView.getHeroCount();
            for (var i = 0; i < heroCount; i++) {
                var widget = this._createPageItem(i);
                this._pageView.addPage(widget);
                this._pageItems[i] = { widget: widget };
            }
        }
    }
    onPageViewEvent(sender, event) {
        if (event == cc.PageView.EventType.PAGE_TURNING && sender == this._pageView) {
            var targetPos = this._pageView.getCurrentPageIndex() + 1;
            var selectedPos = this._parentView.getSelectedPos();
            if (targetPos != selectedPos) {
                this._parentView.setSelectedPos(targetPos);
                var allHeroIds = this._parentView.getAllHeroIds();
                var curHeroId = allHeroIds[targetPos-1];
                G_UserData.getHero().setCurHeroId(curHeroId);
                this._parentView.updateArrowBtn();
                this._updateData();
                this._updateView();
                this._updatePageItem();
                this._parentView.updateTabIcons();
            }
        }
    }
    _updateView() {
        this._updateBaseInfo();
        this._updateLoadingBar();
        this._updateLevel();
        this._updateAttr();
        this._updateCost();
    }
    _updateBaseInfo() {
        var heroBaseId = this._heroUnitData.getBase_id();
        var rankLevel = this._heroUnitData.getRank_lv();
        var limitLevel = this._heroUnitData.getLimit_level();
        var limitRedLevel = this._heroUnitData.getLimit_rtg();
        this._fileNodeCountry.updateUI(heroBaseId);
        this._fileNodeHeroName.setName(heroBaseId, rankLevel, limitLevel, null, limitRedLevel);
        this._fileNodeHeroName2.setName(heroBaseId, rankLevel, limitLevel, null, limitRedLevel);
        this.setButtonEnable(true);
    }
    _updateLoadingBar(withAni?) {
        var level = this._heroUnitData.getLevel();
        this._textLevel.string = (Lang.get('hero_upgrade_txt_level', { level: level }));
        var heroConfig = this._heroUnitData.getConfig();
        var templet = heroConfig.lvup_cost;
        var needCurExp = HeroDataHelper.getHeroLevelUpExp(level, templet);
        var nowExp = this._heroUnitData.getExp() - HeroDataHelper.getHeroNeedExpWithLevel(templet, level);
        if (this._isLeader) {
            nowExp = G_UserData.getBase().getExp();
            needCurExp = HeroDataHelper.getUserLevelUpExp();
        }
        var percent = nowExp / needCurExp;
        this._loadingBarExp.progress = (percent);
        this._textExpPercent1.node.active = false;
        this._textExpPercent2.node.setAnchorPoint(0.5,0.5);
        if (withAni) {
            var lastValue = parseInt(this._textExpPercent1.string);
            if (nowExp != lastValue) {
                this._textExpPercent2.node.runAction(cc.sequence(cc.scaleTo(0.5, 1.5), cc.scaleTo(0.5, 1)));
            }
            this._textExpPercent1.string = (nowExp).toString();
        } else {
            this._textExpPercent1.string = (nowExp).toString();
        }
        this._textExpPercent2.string = (nowExp)+('/' + needCurExp);
    }
    _updateLevel() {
        var level = this._heroUnitData.getLevel();
        this._textOldLevel1.string = String(level);
        this._textOldLevel2.string = ('/' + this._limitLevel);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        var size1 = this._textOldLevel1.node.getContentSize();
        // this._textOldLevel2.node.setPosition(new cc.Vec2(posX + size1.width, posY));
        this._textNewLevel.string = (level + 1 + ('/' + this._limitLevel));
    }
    _updateAttr() {
        this._fileNodeAttr1.updateInfo(AttributeConst.ATK, this._curAttrData[AttributeConst.ATK], this._nextAttrData[AttributeConst.ATK], 4);
        this._fileNodeAttr2.updateInfo(AttributeConst.HP, this._curAttrData[AttributeConst.HP], this._nextAttrData[AttributeConst.HP], 4);
        this._fileNodeAttr3.updateInfo(AttributeConst.PD, this._curAttrData[AttributeConst.PD], this._nextAttrData[AttributeConst.PD], 4);
        this._fileNodeAttr4.updateInfo(AttributeConst.MD, this._curAttrData[AttributeConst.MD], this._nextAttrData[AttributeConst.MD], 4);
       
    }
    _updateCost() {
        if (this._isLeader) {
            this._panelMaterial.active = false;
            this._panelButton.active = false;
            this._panelLeader.active = true;
        } else {
            this._panelLeader.active = false;
            this._panelMaterial.active = true;
            this._panelButton.active = true;
            for (var i = 1; i <= 4; i++) {
                this['_fileNodeMaterial' + i].updateCount();
            }
        }
    }
    _onStartCallback(itemId, count) {
        this._materialFakeCount = count;
        this._materialFakeCostCount = 0;
        this._fakeCurExp = this._heroUnitData.getExp();
        this._fakeLevel = this._heroUnitData.getLevel();
        this._fakeCurAttrData = this._curAttrData;
        this._fakeNextAttrData = this._nextAttrData;
    }
    _onStopCallback() {
        this._labelCount.node.active = (false);
    }
    _onStepClickMaterialIcon(itemId, itemValue) {
        if (this._materialFakeCount <= 0) {
            return [false];
        }
        if (this._fakeCurExp >= this._limitExp) {
            return [false];
        }
        this._materialFakeCount = this._materialFakeCount - 1;
        this._materialFakeCostCount = this._materialFakeCostCount + 1;
        this._fakeCurExp = this._fakeCurExp + itemValue;
        this._fakeUpdateView(itemId);
        this._fakePlayEffect(itemId);
        return [true];
    }
    _fakeUpdateView(itemId) {
        var heroConfig = this._heroUnitData.getConfig();
        var templet = heroConfig.lvup_cost;
        this._fakeLevel = HeroDataHelper.getCanReachLevelWithExp(this._fakeCurExp, templet);
        this._textLevel.string = (Lang.get('hero_upgrade_txt_level', { level: this._fakeLevel }));
        this._labelCount.string = ('+' + this._materialFakeCostCount);
        this._labelCount.node.active = (this._materialFakeCostCount > 1);
        var needCurExp = HeroDataHelper.getHeroLevelUpExp(this._fakeLevel, templet);
        var nowExp = this._fakeCurExp - HeroDataHelper.getHeroNeedExpWithLevel(templet, this._fakeLevel);
        var percent = nowExp / needCurExp;
        this._loadingBarExp.progress = (percent);
        this._textExpPercent1.string = "";
        this._textExpPercent2.string = (nowExp+'/' + needCurExp);
        this._textExpPercent2.node.runAction(cc.sequence(cc.scaleTo(0.5, 1.5), cc.scaleTo(0.5, 1)));
        
        this._textOldLevel1.string = (this._fakeLevel).toString();
        this._textOldLevel2.string = ('/' + this._limitLevel);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        var size1 = this._textOldLevel1.node.getContentSize();
        this._textOldLevel2.node.setPosition(new cc.Vec2(posX, posY));
        this._textNewLevel.string = (this._fakeLevel + 1 + ('/' + this._limitLevel));
        this._fakeCurAttrData = HeroDataHelper.getBasicAttrWithLevel(heroConfig, this._fakeLevel);
        this._fakeNextAttrData = HeroDataHelper.getBasicAttrWithLevel(heroConfig, this._fakeLevel + 1);
        this._fileNodeAttr1.updateInfo(AttributeConst.ATK, this._fakeCurAttrData[AttributeConst.ATK], this._fakeNextAttrData[AttributeConst.ATK], 4);
        this._fileNodeAttr2.updateInfo(AttributeConst.HP, this._fakeCurAttrData[AttributeConst.HP], this._fakeNextAttrData[AttributeConst.HP], 4);
        this._fileNodeAttr3.updateInfo(AttributeConst.PD, this._fakeCurAttrData[AttributeConst.PD], this._fakeNextAttrData[AttributeConst.PD], 4);
        this._fileNodeAttr4.updateInfo(AttributeConst.MD, this._fakeCurAttrData[AttributeConst.MD], this._fakeNextAttrData[AttributeConst.MD], 4);
        var index = ITEM_ID_2_MATERICAL_INDEX[itemId];
        this['_fileNodeMaterial' + index].setCount(this._materialFakeCount);
    }
    _fakePlayEffect(itemId) {
        this._playSingleBallEffect(itemId, true);
    }
    _onClickMaterialIcon(materials) {
        if (this._checkLimitLevel() == false) {
            return;
        }
        if (this._checkMaterials(materials) == false) {
            return;
        }
        this._doUpgrade(materials);
    }
    _checkLimitLevel() {
        var level = this._heroUnitData.getLevel();
        if (level >= this._limitLevel) {
            G_Prompt.showTip(Lang.get('hero_upgrade_level_limit_tip'));
            return false;
        }
        return true;
    }
    _getUpgradeMaterials(level) {
        var templet = this._heroUnitData.getConfig().lvup_cost;
        var curLevel = this._heroUnitData.getLevel();
        var targetLevel = Math.min(curLevel + level, this._limitLevel);
        var curExp = this._heroUnitData.getExp();
        var targetExp = HeroDataHelper.getHeroNeedExpWithLevel(templet, targetLevel);
        var materials = [];
        var reach = false;
        for (var i = 1; i <= 4; i++) {
            var itemId = this['_fileNodeMaterial' + i].getItemId();
            var expValue = this['_fileNodeMaterial' + i].getItemValue();
            var count = this['_fileNodeMaterial' + i].getCount();
            var item = {
                id: itemId,
                num: 0
            };
            for (var j = 1; j <= count; j++) {
                curExp = curExp + expValue;
                item.num = item.num + 1;
                if (curExp >= targetExp) {
                    reach = true;
                    break;
                }
            }
            if (item.num > 0) {
                materials.push(item);
            }
            if (reach) {
                break;
            }
        }
        return materials;
    }
    private onButtonUpgradeOneClicked() {
        if (this._checkLimitLevel() == false) {
            return;
        }
        var materials = this._getUpgradeMaterials(1);
        if (this._checkMaterials(materials) == false) {
            return;
        }
        this._doUpgrade(materials);
        this.setButtonEnable(false);
    }
    public onButtonUpgradeFiveClicked() {
        if (this._checkLimitLevel() == false) {
            return;
        }
        var materials = this._getUpgradeMaterials(5);
        if (this._checkMaterials(materials) == false) {
            return;
        }
        this._doUpgrade(materials);
        this.setButtonEnable(false);
    }
    _checkMaterials(materials) {
        if (materials.length == 0) {
            UIPopupHelper.popupItemGuider(function(popup:PopupItemGuider){
                popup.updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HERO_LEVELUP_MATERIAL_3);
            }.bind(this))
            return false;
        } else {
            return true;
        }
    }
    _doUpgrade(materials) {
        var heroId = this._heroUnitData.getId();
        G_UserData.getHero().c2sHeroLevelUp(heroId, materials);
        this._costMaterials = materials;
    }
    setButtonEnable(enable) {
        this._buttonUpgradeOne.setEnabled(enable);
        this._buttonUpgradeFive.setEnabled(enable);
        //this._pageView.setEnabled(enable);
        if (this._parentView && this._parentView.setArrowBtnEnable) {
            this._parentView.setArrowBtnEnable(enable);
        }
    }
    _onHeroLevelUpSuccess() {
        this._updateData();
        this._updateCost();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(1);
            this._parentView.checkRedPoint(2);
            this._parentView.checkRedPoint(3);
        }
        if (this._materialFakeCount == 0) {
            this._materialFakeCount = null;
            this._playExplodeEffect();
            this._playPrompt();
            this.setButtonEnable(true);
            return;
        }
        for (var i = 0; i < this._costMaterials.length; i++) {
            var material = this._costMaterials[i];
            var itemId = material.id;
            if (i == this._costMaterials.length-1) {
                this._playSingleBallEffect(itemId, true, true);
            } else {
                this._playSingleBallEffect(itemId); 
            }
        }
    }
    _playSingleBallEffect(itemId, isPlayFinishEffect?, isPlayPrompt?) {
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId);
        var color = param.cfg.color;
        var sp = UIHelper.newSprite(Path.getBackgroundEffect('img_photosphere' + color));
        sp.sizeMode = cc.Sprite.SizeMode.RAW;
        var emitter = new cc.Node();
        var particleSystem = emitter.addComponent(cc.ParticleSystem) as cc.ParticleSystem;
        sp.node.addChild(emitter);
        emitter.setPosition(new cc.Vec2(sp.node.getContentSize().width / 2, sp.node.getContentSize().height / 2));
        EffectHelper.loadEffectRes('particle/particle_touch.plist',cc.ParticleAsset,function(res){
            if (res) {
                particleSystem.file = res;
                particleSystem.resetSystem();
            }
        }.bind(this))
        var index = ITEM_ID_2_MATERICAL_INDEX[itemId];
        var startPos = UIHelper.convertSpaceFromNodeToNode(this['_fileNodeMaterial' + index].node, this.node);
        sp.node.setPosition(startPos);
        this.node.addChild(sp.node);
        var curSelectedPos = this._parentView.getSelectedPos();
        var curAvatar = this._pageItems[curSelectedPos - 1].avatar;
        var endPos = UIHelper.convertSpaceFromNodeToNode(curAvatar.node, this.node, new cc.Vec2(0, curAvatar.getHeight() / 2));
        var pointPos1 = new cc.Vec2(startPos.x, startPos.y + 200);
        var pointPos2 = new cc.Vec2((startPos.x + endPos.x) / 2, startPos.y + 100);
        var bezier = [
            pointPos1,
            pointPos2,
            endPos
        ];
        var action1 = cc.bezierTo(0.7, bezier);
        var action2 = action1.easing(cc.easeSineIn());
        sp.node.runAction(cc.sequence(action2, cc.callFunc(function () {
            if (isPlayFinishEffect) {
                this._playExplodeEffect();
            }
            if (isPlayPrompt) {
                this._playPrompt();
                this.setButtonEnable(true);
            }
        }.bind(this)), cc.destroySelf()));
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HERO_LV);
    }
    _playExplodeEffect() { 
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect,"effect_wujianglevelup_baozha",null,true);
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect,"effect_wujianglevelup_light",null,true);
    }
    _recordAddedLevel() {
        var level = this._heroUnitData.getLevel();
        this._diffLevel = level - this._lastLevel;
        this._lastLevel = level;
    }
    _recordAddedExp() {
        var level = this._heroUnitData.getLevel();
        var heroConfig = this._heroUnitData.getConfig();
        var templet = heroConfig.lvup_cost;
        var nowExp = this._heroUnitData.getExp() - HeroDataHelper.getHeroNeedExpWithLevel(templet, level);
        if (this._isLeader) {
            nowExp = G_UserData.getBase().getExp();
        }
        this._diffExp = nowExp - this._lastExp;
        this._lastExp = nowExp;
    }
    _playPrompt() {
        var summary = [];
        if (this._diffLevel == 0) {
            var content = Lang.get('summary_hero_exp_add', { value: this._diffExp });
            var param = {
                content: content,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this._textExpPercent1.node, this.node),
                finishCallback:function() {
                    this._updateLoadingBar(true);
                }.bind(this)
            };
            summary.push(param);
        } else {
            var content1 = Lang.get('summary_hero_levelup');
            var param1 = {
                content: content1,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this._textOldLevel1.node, this.node),
                finishCallback: function () {
                    if (this._textOldLevel1 && this._updateLevel) {
                        this._updateLoadingBar(true);
                        this._textOldLevel1.string = (this._heroUnitData.getLevel());
                        this._updateLevel();
                        this._onSummaryFinish();
                    }
                }.bind(this)
            };
            summary.push(param1);
            var rankMax = HeroDataHelper.getHeroBreakMaxLevel(this._heroUnitData);
            if (this._heroUnitData.getRank_lv() < rankMax) {
                var heroBaseId = this._heroUnitData.getBase_id();
                var limitLevel = this._heroUnitData.getLimit_level();
                var limitRedLevel = this._heroUnitData.getLimit_rtg();
                var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
                var desNode = this._parentView._nodeTabIcon2;
                var content2 = Lang.get('summary_hero_can_break', {
                    name: heroParam.name,
                    color: Colors.colorToNumber(heroParam.icon_color),
                    outlineColor: Colors.colorToNumber(heroParam.icon_color_outline),
                    value: rankMax
                });
                var param2 = {
                    content: content2,
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
                    dstPosition: UIHelper.convertSpaceFromNodeToNode(desNode.node, this.node)
                };
                summary.push(param2);
            }
            this._addBaseAttrPromptSummary(summary);
        }
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN);
    }
    _addBaseAttrPromptSummary(summary: Array<any>) {
        var attr = this._recordAttr.getAttr();
        var desInfo = TextHelper.getAttrInfoBySort(attr);
        var node = this.node;

        var pAttrId:Array<number> = [];
        var start:number = 0;
        for (let i = 0; i < desInfo.length; i++) {
            var info = desInfo[i];
            var attrId = info.id;
            var diffValue = this._recordAttr.getDiffValue(attrId);
            let fileAttr = '_fileNodeAttr' + (i + 1);
            if (diffValue != 0) {
                pAttrId.push(attrId);
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: new cc.Vec2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: UIHelper.convertSpaceFromNodeToNode(this[fileAttr].node, node),
                    finishCallback: function () {
                        var attrId = pAttrId[start];
                        start++;
                        var ret = TextHelper.getAttrBasicText(attrId, this._curAttrData[attrId]);
                        var _ = ret[0]
                        var curValue = ret[1];
                        this[fileAttr]._textCurValue.getComponent(LabelExtend).updateTxtValue(curValue);
                        // this[fileAttr]._textCurValue.string = curValue;
                        this[fileAttr].updateInfo(attrId, this._curAttrData[attrId], this._nextAttrData[attrId], 4);
                    }.bind(this)
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _onSummaryFinish() {
        this.node.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP,"HeroTrainUpgradeLayer");
        })));
    }
    _clearTextSummary() {
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.clearTextSummary();
    }

}
