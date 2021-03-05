const { ccclass, property } = cc._decorator;

import { DataConst } from "../../../const/DataConst";
import { FunctionConst } from '../../../const/FunctionConst';
import MasterConst from '../../../const/MasterConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import { AttrRecordUnitData } from '../../../data/AttrRecordUnitData';
import EffectHelper from '../../../effect/EffectHelper';
import { G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrDiff from '../../../ui/component/CommonAttrDiff';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonMaterialIcon from '../../../ui/component/CommonMaterialIcon';
import CommonTreasureAvatar from '../../../ui/component/CommonTreasureAvatar';
import CommonTreasureName from '../../../ui/component/CommonTreasureName';
import PopupBase from '../../../ui/PopupBase';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { clone } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import PopupMasterLevelup from '../equipment/PopupMasterLevelup';
import { EquipMasterHelper } from '../equipTrain/EquipMasterHelper';
import TreasureTrainView from './TreasureTrainView';

var ITEM_ID_2_MATERICAL_INDEX = {
    71: 1,
    72: 2,
    73: 3,
    74: 4
};

@ccclass
export default class TreasureTrainStrengthenLayer extends ViewBase {

    @property({
        type: CommonTreasureName,
        visible: true
    })
    _fileNodeName: CommonTreasureName = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFrom: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPotential: cc.Label = null;

    @property({
        type: cc.PageView,
        visible: true
    })
    _pageView: cc.PageView = null;

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

    @property({
        type: CommonTreasureName,
        visible: true
    })
    _fileNodeName2: CommonTreasureName = null;

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
    _buttonStrengthenOne: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonStrengthenFive: CommonButtonLevel1Normal = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _treasureAvatar: cc.Prefab = null;

    @property(cc.Node)
    maskPanel:cc.Node = null;

    _parentView: TreasureTrainView;

    _signalTreasureUpgrade;

    _isLimit; // 是否达到上限
    _isGlobalLimit; // 是否达到开放等级上限

    _beforeMasterInfo; // 保存强化之前的强化大师信息
    _curMasterInfo;
    _curAttrData: {}; // 当前属性
    _nextAttrData: {}; // 下一级属性

    _lastExp; // 记录宝物强化经验
    _diffExp; // 记录宝物强化经验差值
    _lastLevel; // 记录宝物强化等级
    _diffLevel; // 记录宝物强化等级差值
    _newMasterLevel; // 新强化大师等级

    _limitLevel; // 等级限制
    _limitExp; // 限制经验
    _materialFakeCount; // 材料假个数
    _materialFakeCostCount; // 材料假的消耗个数
    _fakeCurExp; // 假的当前经验
    _fakeLevel; // 假的等级
    _fakeCurAttrData: {}; // 假的当前属性
    _fakeNextAttrData: {}; // 假的下一等级数据

    _costMaterials;
    _recordAttr: AttrRecordUnitData;

    _unitData;
    _pageItems;

    _smovingZB;
    _waitEffectNum:number = 0;

    isPlayEffect:boolean = false;
    
    

    ctor(parentView) {
        this._parentView = parentView;
        UIHelper.addEventListener(this.node, this._buttonStrengthenOne._button, 'TreasureTrainStrengthenLayer', '_onButtonStrengthenOneClicked');
        UIHelper.addEventListener(this.node, this._buttonStrengthenFive._button, 'TreasureTrainStrengthenLayer', '_onButtonStrengthenFiveClicked');
        this.node.name = ('TreasureTrainStrengthenLayer');
    }
    onCreate() {
        this._initData();
        this._initView();
    }
    onEnter() {
        this._waitEffectNum = 0;
        this._signalTreasureUpgrade = G_SignalManager.add(SignalConst.EVENT_TREASURE_UPGRADE_SUCCESS, handler(this, this._onTreasureUpgradeSuccess));
        if(this.maskPanel){
            this.maskPanel.active = false;
        }
    }
    onExit() {
        this._signalTreasureUpgrade.remove();
        this._signalTreasureUpgrade = null;
    }
    updateInfo() {
        this._parentView.setArrowBtnVisible(true);
        this._updateData();
        this._updatePageView();
        this._updateView();
        this._parentView.updateArrowBtn();
    }
    _initData() {
        this._isLimit = false;
        this._isGlobalLimit = false;
        this._beforeMasterInfo = null;
        this._curMasterInfo = null;
        this._curAttrData = {};
        this._nextAttrData = {};
        this._lastExp = 0;
        this._diffExp = 0;
        this._lastLevel = 0;
        this._diffLevel = 0;
        this._newMasterLevel = 0;
        this._limitLevel = 0;
        this._limitExp = 0;
        this._materialFakeCount = null;
        this._materialFakeCostCount = 0;
        this._fakeCurExp = 0;
        this._fakeLevel = 0;
        this._fakeCurAttrData = {};
        this._fakeNextAttrData = {};
        this._costMaterials = {};
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1);
    }
    _initView() {
        this._fileNodeName.setFontSize(20);
        this._fileNodeName2.setFontSize(22);
        this._fileNodeName2.showTextBg(false);
        this._fileNodeDetailTitle.setFontSize(24);
        this._fileNodeDetailTitle.setTitle(Lang.get('treasure_strengthen_detail_title'));
        this._fileNodeDetailTitle2.setFontSize(24);
        this._fileNodeDetailTitle2.setTitle(Lang.get('treasure_strengthen_detail_title2'));
        this._buttonStrengthenOne.setString(Lang.get('treasure_strengthen_btn_strengthen_1'));
        this._buttonStrengthenFive.setString(Lang.get('treasure_strengthen_btn_strengthen_5'));
        this._labelCount.node.active = (false);
        this._initPageView();
        for (var i = 1; i<=4; i++) {
            var itemId = DataConst['ITEM_TREASURE_LEVELUP_MATERIAL_' + i];
            this['_fileNodeMaterial' + i].updateUI(itemId, handler(this, this._onClickMaterialIcon), handler(this, this._onStepClickMaterialIcon));
            this['_fileNodeMaterial' + i].setStartCallback(handler(this, this._onStartCallback));
            this['_fileNodeMaterial' + i].setStopCallback(handler(this, this._onStopCallback));
        }
    }
    _updateData() {
        var curTreasureId = G_UserData.getTreasure().getCurTreasureId();
        this._unitData = G_UserData.getTreasure().getTreasureDataWithId(curTreasureId);
        this._limitLevel = this._unitData.getMaxStrLevel();
        var level = this._unitData.getLevel();
        this._isLimit = level >= this._limitLevel;
        var templet = this._unitData.getConfig().levelup_templet;
        this._limitExp = UserDataHelper.getTreasureNeedExpWithLevel(templet, this._limitLevel);
        this._updateAttrData();
        this._recordAddedExp();
        this._recordAddedLevel();
        G_UserData.getAttr().recordPower();
    }
    _updateAttrData() {
        this._isGlobalLimit = false;
        this._curAttrData = UserDataHelper.getTreasureStrengthenAttr(this._unitData);
        this._nextAttrData = UserDataHelper.getTreasureStrengthenAttr(this._unitData, 1);
        if (this._nextAttrData == null) {
            this._nextAttrData = {};
            this._isGlobalLimit = true;
        }
        this._recordAttr.updateData(this._curAttrData);
    }
    _createPageItem(width, height, i):any[] {
        var allTreasureIds = this._parentView.getAllTreasureIds();
        var treasureId = allTreasureIds[i-1];
        var unitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        var baseId = unitData.getBase_id();
        var widget = new cc.Node();
        //widget.setSwallowTouches(false);
        widget.setContentSize(width, height);
        var avatar = cc.instantiate(this._treasureAvatar).getComponent(CommonTreasureAvatar);
        avatar.showShadow(false);
        avatar.updateUI(baseId);
        var size = widget.getContentSize();
        //avatar.node.setPosition(cc.v2(size.width * 0.54, size.height / 2));
        widget.addChild(avatar.node);
        return [
            widget,
            avatar
        ];
    }
    _initPageView() {
        this._pageItems = [];
        //this._pageView.setSwallowTouches(false);
        //this._pageView.setScrollDuration(0.3);
        UIHelper.addPageEvent(this.node, this._pageView, 'TreasureTrainStrengthenLayer', '_onPageViewEvent');
        this._pageView.removeAllPages();
        var viewSize = this._pageView.node.getContentSize();
        var treasureCount = this._parentView.getTreasureCount();
        this._pageView.content.setContentSize(treasureCount*viewSize.width,viewSize.height);
        for (var i = 1; i<=treasureCount; i++) {
            var [widget, avatar] = this._createPageItem(viewSize.width, viewSize.height, i);
            this._pageView.addPage(widget);
            this._pageItems.push({
                widget: widget,
                avatar: avatar.node
            });
        }
        //this._updatePageView();
        // var selectedPos = this._parentView.getSelectedPos();
        // this._pageView.scrollToPage(selectedPos - 1, 0);
    }
    _updatePageView() {
        var selectedPos = this._parentView.getSelectedPos();
        this._pageView.scrollToPage(selectedPos - 1,0);
    }
    _onPageViewEvent(sender, event) {
        if (event == cc.PageView.EventType.PAGE_TURNING && sender == this._pageView) {
            var targetPos = this._pageView.getCurrentPageIndex() + 1;
            var selectedPos = this._parentView.getSelectedPos();
            if (targetPos != selectedPos) {
                this._parentView.setSelectedPos(targetPos);
                var allTreasureIds = this._parentView.getAllTreasureIds();
                var curTreasureId = allTreasureIds[targetPos-1];
                G_UserData.getTreasure().setCurTreasureId(curTreasureId);
                this._parentView.updateArrowBtn();
                this._updateData();
                this._updateView();
                this._parentView.updateTabIcons();
            }
        }
    }
    _updateView() {
        this._updateBaseInfo();
        this._updateLoading();
        this._updateLevel();
        this._updateAttr();
        this._updateCost();
    }
    _updateBaseInfo() {
        var baseId = this._unitData.getBase_id();
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, baseId);
        var rLevel = this._unitData.getRefine_level();
        this._fileNodeName.setName(baseId, rLevel);
        this._fileNodeName2.setName(baseId, rLevel);
        var heroBaseId = UserDataHelper.getHeroBaseIdWithTreasureId(this._unitData.getId())[0];
        if (heroBaseId == null) {
            this._textFrom.node.active = (false);
        } else {
            this._textFrom.node.active = (true);
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
            this._textFrom.string = (Lang.get('treasure_detail_from', { name: heroParam.name }));
        }
        this._textPotential.string = (Lang.get('treasure_detail_txt_potential', { value: param.potential }));
        this._textPotential.node.color = (param.icon_color);
        UIHelper.enableOutline(this._textPotential, param.icon_color_outline, 2);
        this._setButtonEnable(true);
    }
    _updateLoading(withAni?) {
        var level = this._unitData.getLevel();
        this._textLevel.string = (Lang.get('hero_upgrade_txt_level', { level: level }));
        var treasureConfig = this._unitData.getConfig();
        var templet = treasureConfig.levelup_templet;
        var needCurExp = UserDataHelper.getTreasureLevelUpExp(level, templet);
        var nowExp = this._unitData.getExp() - UserDataHelper.getTreasureNeedExpWithLevel(templet, level);
        var percent = nowExp / needCurExp;
        this._loadingBarExp.progress = (percent);
        if (withAni) {
            var lastValue = parseInt(this._textExpPercent1.string);
            if (nowExp != lastValue) {
                //this._textExpPercent2.doScaleAnimation();
            }
            //this._textExpPercent1.updateTxtValue(nowExp);
            this._textExpPercent1.string = ''+nowExp;
        } else {
            this._textExpPercent1.string = ''+(nowExp);
        }
        this._textExpPercent2.string = ('/' + needCurExp);
    }
    _updateLevel() {
        var level = this._unitData.getLevel();
        this._textOldLevel1.string = (level);
        this._textOldLevel2.string = ('/' + this._limitLevel);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        var size1 = this._textOldLevel1.node.getContentSize();
        this._textOldLevel2.node.setPosition(cc.v2(posX + size1.width, posY));
        var newDes = Lang.get(level + 1 + ('/' + this._limitLevel));
        if (this._isGlobalLimit) {
            newDes = Lang.get('equipment_strengthen_max_level');
        }
        this._textNewLevel.string = (newDes);
    }
    _updateAttr() {
        var curDesInfo = TextHelper.getAttrInfoBySort(this._curAttrData);
        var nextDesInfo = TextHelper.getAttrInfoBySort(this._nextAttrData);
        for (var i = 1; i<=2; i++) {
            var curInfo = curDesInfo[i-1];
            var nextInfo = nextDesInfo[i-1] || {};
            if (curInfo) {
                this['_fileNodeAttr' + i].updateInfo(curInfo.id, curInfo.value, nextInfo.value, 4);
                this['_fileNodeAttr' + i].node.active = (true);
            } else {
                this['_fileNodeAttr' + i].node.active = (false);
            }
        }
    }
    _updateCost() {
        for (var i = 1; i<=4; i++) {
            this['_fileNodeMaterial' + i].updateCount();
        }
    }
    _onStartCallback(itemId, count) {
        this._materialFakeCount = count;
        this._materialFakeCostCount = 0;
        this._fakeCurExp = this._unitData.getExp();
        this._fakeLevel = this._unitData.getLevel();
        this._fakeCurAttrData = this._curAttrData;
        this._fakeNextAttrData = this._nextAttrData;
    }
    _onStopCallback() {
        this._labelCount.node.active = (false);
    }
    _onStepClickMaterialIcon(itemId, itemValue) {
        if (this._materialFakeCount == null || this._materialFakeCount <= 0) {
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
        var config = this._unitData.getConfig();
        var templet = config.levelup_templet;
        this._fakeLevel = UserDataHelper.getCanReachTreasureLevelWithExp(this._fakeCurExp, templet);
        this._textLevel.string = (Lang.get('hero_upgrade_txt_level', { level: this._fakeLevel }));
        this._labelCount.string = ('+' + this._materialFakeCostCount);
        this._labelCount.node.active = (this._materialFakeCostCount > 1);
        var needCurExp = UserDataHelper.getTreasureLevelUpExp(this._fakeLevel, templet);
        var nowExp = this._fakeCurExp - UserDataHelper.getTreasureNeedExpWithLevel(templet, this._fakeLevel);
        var percent = nowExp / needCurExp * 100;
        this._loadingBarExp.progress = (percent);
        //this._textExpPercent1.updateTxtValue(nowExp);
        this._textExpPercent1.string = nowExp.toString();
        this._textExpPercent2.string = ('/' + needCurExp);
        //this._textExpPercent2.doScaleAnimation();
        this._textOldLevel1.string = (this._fakeLevel);
        this._textOldLevel2.string = ('/' + this._limitLevel);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        var size1 = this._textOldLevel1.node.getContentSize();
        this._textOldLevel2.node.setPosition(cc.v2(posX + size1.width, posY));
        var newDes = Lang.get(this._fakeLevel + 1 + ('/' + this._limitLevel));
        if (this._isGlobalLimit) {
            newDes = Lang.get('equipment_strengthen_max_level');
        }
        this._textNewLevel.string = (newDes);
        this._fakeCurAttrData = UserDataHelper.getTreasureStrAttrWithConfigAndLevel(config, this._fakeLevel);
        this._fakeNextAttrData = UserDataHelper.getTreasureStrAttrWithConfigAndLevel(config, this._fakeLevel + 1) || {};
        var curDesInfo = TextHelper.getAttrInfoBySort(this._fakeCurAttrData);
        var nextDesInfo = TextHelper.getAttrInfoBySort(this._fakeNextAttrData);
        for (var i = 1; i<=2; i++) {
            var curInfo = curDesInfo[i-1];
            var nextInfo = nextDesInfo[i-1] || {};
            if (curInfo) {
                this['_fileNodeAttr' + i].updateInfo(curInfo.id, curInfo.value, nextInfo.value, 4);
                this['_fileNodeAttr' + i].node.active = (true);
            } else {
                this['_fileNodeAttr' + i].node.active = (false);
            }
        }
        var index = ITEM_ID_2_MATERICAL_INDEX[itemId];
        this['_fileNodeMaterial' + index].setCount(this._materialFakeCount);
    }
    _fakePlayEffect(itemId) {
        var item = {
            id: itemId,
            num: 1
        };
        var materials = [];
        materials.push(item);
        this._playEffect(materials, true);
    }
    _onClickMaterialIcon(materials) {
        if (this._checkLimitLevel() == false) {
            return;
        }
        this._doStrengthen(materials);
    }
    _checkLimitLevel() {
        var level = this._unitData.getLevel();
        if (level >= this._limitLevel) {
            G_Prompt.showTip(Lang.get('treasure_strengthen_level_limit_tip'));
            return false;
        }
        return true;
    }
    _getUpgradeMaterials(level):any[] {
        var templet = this._unitData.getConfig().levelup_templet;
        var curLevel = this._unitData.getLevel();
        var targetLevel = Math.min(curLevel + level, this._limitLevel);
        var curExp = clone(this._unitData.getExp());
        var targetExp = UserDataHelper.getTreasureNeedExpWithLevel(templet, targetLevel);
        var materials = [];
        var reach = false;
        for (var i = 1; i<=4; i++) {
            var itemId = this['_fileNodeMaterial' + i].getItemId();
            var expValue = this['_fileNodeMaterial' + i].getItemValue();
            var count = this['_fileNodeMaterial' + i].getCount();
            var item = {
                id: itemId,
                num: 0
            };
            for (var j = 1; i<=count; i++) {
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
    _onButtonStrengthenOneClicked() {
        if (this._checkLimitLevel() == false) {
            return;
        }
        var materials = this._getUpgradeMaterials(1);
        if(this._doStrengthen(materials)){
            this._setButtonEnable(false);
        }
    }
    _onButtonStrengthenFiveClicked() {
        if (this._checkLimitLevel() == false) {
            return;
        }
        var materials = this._getUpgradeMaterials(5);
        if(this._doStrengthen(materials)){
            this._setButtonEnable(false);
        }
    }
    _doStrengthen(materials) {
        if (materials.length == 0) {
            UIPopupHelper.popupItemGuider(function (popup:PopupItemGuider) {
                popup.updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_1);
            });
            return false;
        }
        var treasureId = this._unitData.getId();
        G_UserData.getTreasure().c2sUpgradeTreasure(treasureId, materials);
        this._costMaterials = materials;
        this._saveBeforeMasterInfo();
        return true;
    }
    _setButtonEnable(enable) {
        this._buttonStrengthenOne.setEnabled(enable);
        this._buttonStrengthenFive.setEnabled(enable);
        this._pageView.node.active = (enable);
        if (this._parentView && this._parentView.setArrowBtnEnable) {
            this._parentView.setArrowBtnEnable(enable);
        }
    }
    _onTreasureUpgradeSuccess() {
        this._updateData();
        this._updateLoading(true);
        this._updateCost();
        this._saveCurMasterInfo();

        //////test
        this._updateView();
        //////


        if (this._materialFakeCount == 0) {
            this._materialFakeCount = null;
            this._playEffect(null, true, true, true);
            return;
        }
        this._playEffect(this._costMaterials, true, true, true);
    }
    _playEffect(costMaterials, isPlayEvent, isNextEvent?, isFinishEvent?) {
        
        function effectFunction(effect) {
            return new cc.Node();
        }
        var eventFunction = function(event) {
            if (event == 'start') {
                for (let i in costMaterials) {
                    var item = costMaterials[i];
                    var itemId = item.id;
                    var index = ITEM_ID_2_MATERICAL_INDEX[itemId];
                    var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId);
                    var color = param.cfg.color;
                    var sp = UIHelper.newSprite(Path.getBackgroundEffect('img_photosphere' + color));
                    var emitter = new cc.Node();
                    var particleSystem = emitter.addComponent(cc.ParticleSystem);
                    if (emitter) {
                        EffectHelper.loadEffectRes('particle/particle_touch', cc.ParticleAsset, function (res) {
                            if (res) {
                                particleSystem.file = res;
                                particleSystem.resetSystem();
                            }
                        }.bind(this));
                        emitter.setPosition(cc.v2(sp.node.getContentSize().width / 2, sp.node.getContentSize().height / 2));
                        sp.node.addChild(emitter);
                    }
                    var worldPos = this['_fileNodeMaterial' + index].node.convertToWorldSpaceAR(cc.v2(0, 0));
                    var pos = this.node.convertToNodeSpaceAR(worldPos);
                    sp.node.setPosition(pos);
                    this.node.addChild(sp.node);
                    var finishCallback = function(){
                        sp.node.runAction(cc.destroySelf());
                    }
                    G_EffectGfxMgr.applySingleGfx(sp.node, 'smoving_baowuqianghua_lizi' + index, finishCallback, null, null);
                }
            } else if (event == 'play') {
                if (isPlayEvent) {
                    if (this._smovingZB) {
                        this._smovingZB.reset();
                    }
                    var selectedPos = this._parentView.getSelectedPos();
                    var avatar = this._pageItems[selectedPos-1].avatar;
                    this._smovingZB = G_EffectGfxMgr.applySingleGfx(avatar, 'smoving_zhuangbei', null, null, null);
                }
            } else if (event == 'next') {
                if (isNextEvent) {
                    this._setButtonEnable(true);
                    this._newMasterLevel = this._checkIsReachNewMasterLevel();
                    if (!this._newMasterLevel) {
                        this._playPrompt();
                    }
                }
            } else if (event == 'finish') {
                if (isFinishEvent) {
                    this._onEffectFinish();
                }
            }
        }.bind(this);
        if(!this.isPlayEffect){
            var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_baowuqianghua', effectFunction, eventFunction, false);
            var offsetX = UIConst.EFFECT_OFFSET_X;
            effect.node.setPosition(cc.v2(G_ResolutionManager.getDesignWidth() * 0.5 + offsetX, G_ResolutionManager.getDesignHeight() * 0.5));
            this.isPlayEffect = true;
        }else{
            eventFunction('next');
        }

    }
    _playSingleBallEffect() {
    }
    _onEffectFinish() {
        this.isPlayEffect = false;
    }
    _saveBeforeMasterInfo() {
        var pos = this._unitData.getPos();
        this._beforeMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_3);
    }
    _saveCurMasterInfo() {
        var pos = this._unitData.getPos();
        this._curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_3);
    }
    _checkIsReachNewMasterLevel() {
        var beforeLevel = this._beforeMasterInfo.masterInfo.curMasterLevel;
        var curLevel = this._curMasterInfo.masterInfo.curMasterLevel;
        if (curLevel > beforeLevel) {
            PopupBase.loadCommonPrefab('PopupMasterLevelup', function(popup:PopupMasterLevelup){
                popup.ctor(this, this._beforeMasterInfo, this._curMasterInfo, MasterConst.MASTER_TYPE_3);
                popup.openWithAction();
            }.bind(this));
            return curLevel;
        }
        return false;
    }
    _recordAddedLevel() {
        var level = this._unitData.getLevel();
        this._diffLevel = level - this._lastLevel;
        this._lastLevel = level;
    }
    _recordAddedExp() {
        var level = this._unitData.getLevel();
        var treasureConfig = this._unitData.getConfig();
        var templet = treasureConfig.levelup_templet;
        var nowExp = this._unitData.getExp() - UserDataHelper.getTreasureNeedExpWithLevel(templet, level);
        this._diffExp = nowExp - this._lastExp;
        this._lastExp = nowExp;
    }
    _recordBaseAttr() {
        // var diffAttr = [];
        // for (let k in this._curAttrData) {
        //     var value = this._curAttrData[k];
        //     var lastValue = this._lastAttr[k] || 0;
        //     diffAttr[k] = value - lastValue;
        // }
        //this._diffAttr = diffAttr;
        //this._lastAttr = this._curAttrData;
    }
    onExitPopupMasterLevelup() {
        this._playPrompt();
    }
    _playPrompt() {
        this._setButtonEnable(true);
        this.setMaskPanelEnable(true);
        var summary = [];
        var content = Lang.get('summary_treasure_str_success');
        var param = {
            content: content,
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
        };
        summary.push(param);
        if (this._diffLevel == 0) {
            var content = Lang.get('summary_treasure_str_success_exp', { value: this._diffExp });
            var param1 = {
                content: content,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this._textExpPercent1.node, this.node),
                finishCallback: function() {
                    if (this._onPromptFinish) {
                        this._onPromptFinish();
                    }
                }.bind(this)
            };
            summary.push(param1);
        } else {
            if (this._newMasterLevel && this._newMasterLevel > 0) {
                var param = {
                    content: Lang.get('summary_treasure_str_master_reach', { level: this._newMasterLevel }),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
                };
                summary.push(param);
            }
            var content1 = Lang.get('summary_treasure_str_success_level', { value: this._diffLevel });
            var dstPosition = UIHelper.convertSpaceFromNodeToNode(this._textOldLevel1.node, this.node);
            dstPosition.x -= this.node.width / 2;
            dstPosition.y -= this.node.height / 2;
            var param2 = {
                content: content1,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
                dstPosition: dstPosition,
                finishCallback: function() {
                    if (this._textOldLevel1 && this._updateLevel) {
                        this._textOldLevel1.string = (this._unitData.getLevel()).toString();
                        this._updateLevel();
                    }
                    if (this._onPromptFinish) {
                        this._onPromptFinish();
                    }
                }.bind(this)
            };
            summary.push(param2);
            this._addBaseAttrPromptSummary(summary);
        }
        this._waitEffectNum += summary.length;
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN);
    }
    onFinishCallback(params) {
        var [i,attrId] = params;
        if(!this._curAttrData[attrId]){
            return;
        }
        var [_tmp, curValue] = TextHelper.getAttrBasicText(attrId, this._curAttrData[attrId]);
        var labelNode = (this['_fileNodeAttr' + i].node as cc.Node).getChildByName('TextCurValue');
        labelNode.getComponent(cc.Label).string = curValue.toString();

        this['_fileNodeAttr' + i].updateInfo(attrId, this._curAttrData[attrId], this._nextAttrData[attrId], 4);
        this.waitEffectFinish();
    }
    _addBaseAttrPromptSummary(summary:any[]) {
        var attr = this._recordAttr.getAttr();
        var desInfo = TextHelper.getAttrInfoBySort(attr);
        for (let i=1; i<=desInfo.length; i++) {
            var info = desInfo[i-1];
            var attrId = info.id;
            var diffValue = this._recordAttr.getDiffValue(attrId);
            var dstPosition = UIHelper.convertSpaceFromNodeToNode(this['_fileNodeAttr' + i].node, this.node);
            dstPosition.x -= this.node.width / 2;
            dstPosition.y -= this.node.height / 2;
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: dstPosition,
                    finishCallback: handler(this, this.onFinishCallback, i, attrId)
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _onPromptFinish() {
        this.waitEffectFinish();
        
        this.node.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
        }, this)));
    }
    waitEffectFinish(){
        if(this._waitEffectNum > 0){
            this._waitEffectNum--;
            if(this._waitEffectNum <= 0){
                this.setMaskPanelEnable(false);
            }
        }
    }
    setMaskPanelEnable(enable){
        // if(this.maskPanel){
        //     this.maskPanel.active = enable;
        // }
        // if(this._parentView && this._parentView.setPageViewEnable){
        //     this._parentView.setPageViewEnable(!enable);
        // }
    }
}
