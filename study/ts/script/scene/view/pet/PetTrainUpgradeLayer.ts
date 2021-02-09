const { ccclass, property } = cc._decorator;

import AttributeConst from '../../../const/AttributeConst';
import { AudioConst } from '../../../const/AudioConst';
import { DataConst } from '../../../const/DataConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import { PetUnitData } from '../../../data/PetUnitData';
import EffectHelper from '../../../effect/EffectHelper';
import { Colors, G_AudioManager, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrDiff from '../../../ui/component/CommonAttrDiff';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonHeroName from '../../../ui/component/CommonHeroName';
import CommonMaterialIcon from '../../../ui/component/CommonMaterialIcon';
import CommonPowerPrompt from '../../../ui/component/CommonPowerPrompt';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { clone } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';





var RECORD_ATTR_LIST = [
    [
        AttributeConst.ATK_FINAL,
        '_fileNodeAttr1'
    ],
    [
        AttributeConst.HP_FINAL,
        '_fileNodeAttr2'
    ],
    [
        AttributeConst.PD_FINAL,
        '_fileNodeAttr3'
    ],
    [
        AttributeConst.MD_FINAL,
        '_fileNodeAttr4'
    ],
    [
        AttributeConst.CRIT,
        null
    ],
    [
        AttributeConst.NO_CRIT,
        null
    ],
    [
        AttributeConst.HIT,
        null
    ],
    [
        AttributeConst.NO_HIT,
        null
    ],
    [
        AttributeConst.HURT,
        null
    ],
    [
        AttributeConst.HURT_RED,
        null
    ]
];
var ITEM_ID_2_MATERICAL_INDEX = {
    [DataConst['ITEM_PET_LEVELUP_MATERIAL_1']]: 1,
    [DataConst['ITEM_PET_LEVELUP_MATERIAL_2']]: 2,
    [DataConst['ITEM_PET_LEVELUP_MATERIAL_3']]: 3,
    [DataConst['ITEM_PET_LEVELUP_MATERIAL_4']]: 4
};
@ccclass
export default class PetTrainUpgradeLayer extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeHeroName: CommonHeroName = null;

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

    @property({
        type: cc.Label,
        visible: true
    })
    _textIsBless: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBless: cc.Sprite = null;

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
        type: cc.Node,
        visible: true
    })
    _pageView: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _avatar: CommonHeroAvatar = null;

    _parentView: any;
    _signalPetLevelUp: any;
    _limitLevel: number;
    _limitExp: number;
    _lastTotalPower: number;
    _diffPower: number;
    _lastAttrData: {};
    _diffAttrData: {};
    _lastExp: number;
    _lastLevel: number;
    _curAttrData: {};
    _nextAttrData: {};
    _materialFakeCount: any;
    _materialFakeCostCount: any;
    _fakeCurExp: number;
    _fakeLevel: number;
    _fakeCurAttrData: {};
    _fakeNextAttrData: {};
    _costMaterials: any[];
    _isPageViewMoving: boolean;
    _petUnitData: PetUnitData;
    _diffLevel: number;
    _diffExp: number;
    _pageViewSize: cc.Size;


    ctor(parentView) {
        this.node.name = "PetTrainUpgradeLayer";
        this._parentView = parentView;
        this._buttonUpgradeOne.addClickEventListenerEx(handler(this, this._onButtonUpgradeOneClicked));
        this._buttonUpgradeFive.addClickEventListenerEx(handler(this, this._onButtonUpgradeFiveClicked));
    }
    onCreate() {
        this._initData();
        this._initView();
        this.setSceneSize(null, false);
    }
    onEnter() {
        this._signalPetLevelUp = G_SignalManager.add(SignalConst.EVENT_PET_LEVEL_UP_SUCCESS, handler(this, this._onPetLevelUpSuccess));
    }

    onExit() {
        this._signalPetLevelUp.remove();
        this._signalPetLevelUp = null;
        this._clearTextSummary();
    }

    initInfo() {
        this._updateData();
        this._updateView();
        this._updatePageItem();
        var selectedPos = this._parentView.getSelectedPos();
        //     this._pageView.setCurrentPageIndex(selectedPos - 1);
    }
    _initData() {
        this._limitLevel = 0;
        this._limitExp = 0;
        this._lastTotalPower = 0;
        this._diffPower = 0;
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
        this._costMaterials = [];
        this._isPageViewMoving = false;
    }
    _initView() {
        this._fileNodeDetailTitle.setFontSize(24);
        this._fileNodeDetailTitle2.setFontSize(24);
        this._fileNodeDetailTitle.setTitle(Lang.get('pet_upgrade_detail_title'));
        this._fileNodeDetailTitle2.setTitle(Lang.get('pet_upgrade_detail_title2'));
        this._buttonUpgradeOne.setString(Lang.get('pet_upgrade_btn_upgrade_1'));
        this._buttonUpgradeFive.setString(Lang.get('pet_upgrade_btn_upgrade_5'));
        this._labelCount.node.active = (false);
        this._initPageView();
        for (var i = 1; i <= 4; i++) {
            var itemId = DataConst['ITEM_PET_LEVELUP_MATERIAL_' + i];
            this['_fileNodeMaterial' + i].updateUI(itemId, handler(this, this._onClickMaterialIcon), handler(this, this._onStepClickMaterialIcon));
            this['_fileNodeMaterial' + i].setStartCallback(handler(this, this._onStartCallback));
            this['_fileNodeMaterial' + i].setStopCallback(handler(this, this._onStopCallback));
        }
    }
    _updateData() {
        this._limitLevel = G_UserData.getBase().getLevel();
        var curPetId = G_UserData.getPet().getCurPetId();
        this._petUnitData = G_UserData.getPet().getUnitDataWithId(curPetId);
        var petConfig = this._petUnitData.getConfig();
        var templet = this._petUnitData.getLvUpCost();
        var realQuality = UserDataHelper.getPetUpgradeQuality(this._petUnitData);
        this._limitExp = UserDataHelper.getPetNeedExpWithLevel(G_UserData.getBase().getLevel(), realQuality);
        this._updateAttrData();
        this._recordAddedLevel();
        this._recordAddedExp();
        this._recordTotalPower();
    }
    _updateAttrData() {
        var config = this._petUnitData.getConfig();
        var curLevel = this._petUnitData.getLevel();
        this._curAttrData = UserDataHelper.getPetBasicAttrWithLevel(config, curLevel);
        this._nextAttrData = UserDataHelper.getPetBasicAttrWithLevel(config, curLevel + 1);
        this._recordBaseAttr();
    }
    _createPageItem() {
        // var widget = new ccui.Widget();
        // widget.setSwallowTouches(false);
        // widget.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
        // return widget;
    }
    _updatePageItem() {
        // var allPetIds = this._parentView.getAllPetIds();
        // var index = this._parentView.getSelectedPos();
        // for (var i = index - 1; i <= index + 1; i++) {
        //     var item = this._pageItems[i];
        //     if (item && item.widget) {
        //         var widget = item.widget;
        //         var count = widget.getChildrenCount();
        //         if (count == 0) {
        //             var petId = allPetIds[i];
        //             var unitData = G_UserData.getPet().getUnitDataWithId(petId);
        //             var petBaseId = unitData.getBase_id();
        //             var avatar = CSHelper.loadResourceNode(Path.getCSB('CommonHeroAvatar', 'common'));
        //             avatar.setConvertType(TypeConvertHelper.TYPE_PET);
        //             avatar.updateUI(petBaseId);
        //             avatar.setScale(1);
        //             avatar.setShadowScale(2.7);
        //             avatar.setPosition(cc.v2(this._pageViewSize.width * 0.57, 190));
        //             avatar.playAnimationLoopIdle();
        //             widget.addChild(avatar);
        //             this._pageItems[i].avatar = avatar;
        //         }
        //         if (this._pageItems[i].avatar) {
        //             var petId = allPetIds[i];
        //             var unitData = G_UserData.getPet().getUnitDataWithId(petId);
        //             var petBaseId = unitData.getBase_id();
        //             this._pageItems[i].avatar.updateUI(petBaseId);
        //         }
        //     }
        // }
        // this._updatePageItemVisible();
        var unitData = G_UserData.getPet().getUnitDataWithId(G_UserData.getPet().getCurPetId());
        this._avatar.updateUI(unitData.getBase_id());
        this._avatar.playAnimationLoopIdle();
    }
    _initPageView() {
        // this._pageItems = {};
        // this._pageView.setSwallowTouches(false);
        // this._pageView.setScrollDuration(0.3);
        // this._pageView.addEventListener(handler(this, this._onPageViewEvent));
        // this._pageView.addTouchEventListener(handler(this, this._onPageTouch));
        this._pageViewSize = this._pageView.getContentSize();
        // this._pageView.removeAllPages();
        // var petCount = this._parentView.getPetCount();
        // for (var i = 1; i <= petCount; i++) {
        //     var widget = this._createPageItem();
        //     this._pageView.addPage(widget);
        //     this._pageItems[i] = { widget: widget };
        // }
        this._avatar.init();
        this._avatar.setConvertType(TypeConvertHelper.TYPE_PET);
        this._avatar.setScale(1);
        this._avatar.setShadowScale(2.7);
        this._avatar.node.setPosition(cc.v2(this._pageViewSize.width * 0.07, 190 - this._pageViewSize.height * 0.5));
    }
    _onPageViewEvent(sender, event) {
        // if (event == ccui.PageViewEventType.turning && sender == this._pageView) {
        //     var targetPos = this._pageView.getCurrentPageIndex() + 1;
        //     var selectedPos = this._parentView.getSelectedPos();
        //     if (targetPos != selectedPos) {
        //         this._parentView.setSelectedPos(targetPos);
        //         var allPetIds = this._parentView.getAllPetIds();
        //         var curPetId = allPetIds[targetPos];
        //         G_UserData.getPet().setCurPetId(curPetId);
        //         this._parentView.updateArrowBtn();
        //         this._updateData();
        //         this._updateView();
        //         this._updatePageItem();
        //         this._parentView.updateRedPoint();
        //         this._parentView.updateTabVisible();
        //     }
        // }
    }
    _onPageTouch(sender, state) {
        // if (state == ccui.TouchEventType.began) {
        //     this._isPageViewMoving = true;
        //     this._updatePageItemVisible();
        // } else if (state == ccui.TouchEventType.ended || state == ccui.TouchEventType.canceled) {
        //     this._isPageViewMoving = false;
        // }
    }
    _updatePageItemVisible() {
        // var curIndex = this._parentView.getSelectedPos();
        // for (i in this._pageItems) {
        //     var item = this._pageItems[i];
        //     if (i == curIndex) {
        //         item.widget.node.active = (true);
        //     } else {
        //         item.widget.node.active = (this._isPageViewMoving);
        //     }
        // }
    }
    _updateView() {
        this._updateBaseInfo();
        this._updateLoadingBar();
        this._updateLevel();
        this._updateAttr();
        this._updateCost();
    }
    _updateBaseInfo() {
        var petBaseId = this._petUnitData.getBase_id();
        this._fileNodeHeroName.setConvertType(TypeConvertHelper.TYPE_PET);
        this._fileNodeHeroName2.setConvertType(TypeConvertHelper.TYPE_PET);
        this._fileNodeHeroName.setName(petBaseId, 0);
        this._fileNodeHeroName2.setName(petBaseId, 0);
        this.setButtonEnable(true);
        var strDesc = UserDataHelper.getPetStateStr(this._petUnitData);
        if (strDesc) {
            this._textIsBless.string = (strDesc);
            this._textIsBless.node.active = (true);
        } else {
            this._textIsBless.node.active = (false);
        }
    }
    _updateLoadingBar(withAni?) {
        var level = this._petUnitData.getLevel();
        this._textLevel.string = (Lang.get('hero_upgrade_txt_level', { level: level }));
        var petConfig = this._petUnitData.getConfig();
        var realQuality = UserDataHelper.getPetUpgradeQuality(this._petUnitData);
        var needCurExp = UserDataHelper.getPetLevelUpExp(level, realQuality);
        var nowExp = this._petUnitData.getExp() - UserDataHelper.getPetNeedExpWithLevel(level, realQuality);
        var percent = nowExp / needCurExp;
        this._loadingBarExp.progress = (percent);
        if (withAni) {
            var lastValue = parseFloat(this._textExpPercent1.string);
            if (nowExp != lastValue) {
                // to do
                // this._textExpPercent2.doScaleAnimation();
            }
            //  this._textExpPercent1.updateTxtValue(nowExp);
            this._textExpPercent1.string = nowExp.toString();
        } else {
            this._textExpPercent1.string = (nowExp).toString();
        }
        this._textExpPercent2.string = ('/' + needCurExp);
    }
    _updateLevel() {
        var level = this._petUnitData.getLevel();
        this._textOldLevel1.string = (level).toString();
        UIHelper.updateLabelSize(this._textNewLevel);
        this._textOldLevel2.string = ('/' + this._limitLevel);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        this.scheduleOnce(()=>{
            var size1 = this._textOldLevel1.node.getContentSize();
            this._textOldLevel2.node.setPosition(cc.v2(posX + size1.width+2, posY));
            this._textNewLevel.string = (level + 1 + ('/' + this._limitLevel));
            //this._textNewLevel.node.active = level >= this._limitLevel;
        })
       
    }
    _updateAttr() {
        this._fileNodeAttr1.updateInfo(AttributeConst.ATK_FINAL, this._curAttrData[AttributeConst.ATK_FINAL], this._nextAttrData[AttributeConst.ATK_FINAL], 4);
        this._fileNodeAttr2.updateInfo(AttributeConst.HP_FINAL, this._curAttrData[AttributeConst.HP_FINAL], this._nextAttrData[AttributeConst.HP_FINAL], 4);
        this._fileNodeAttr3.updateInfo(AttributeConst.PD_FINAL, this._curAttrData[AttributeConst.PD_FINAL], this._nextAttrData[AttributeConst.PD_FINAL], 4);
        this._fileNodeAttr4.updateInfo(AttributeConst.MD_FINAL, this._curAttrData[AttributeConst.MD_FINAL], this._nextAttrData[AttributeConst.MD_FINAL], 4);
    }
    _updateCost() {
        this._panelLeader.active = (false);
        this._panelMaterial.active = (true);
        this._panelButton.active = (true);
        for (var i = 1; i <= 4; i++) {
            this['_fileNodeMaterial' + i].updateCount();
        }
    }
    _onStartCallback(itemId, count) {
        this._materialFakeCount = count;
        this._materialFakeCostCount = 0;
        this._fakeCurExp = this._petUnitData.getExp();
        this._fakeLevel = this._petUnitData.getLevel();
        this._fakeCurAttrData = this._curAttrData;
        this._fakeNextAttrData = this._nextAttrData;
    }
    _onStopCallback() {
        this._labelCount.node.active = (false);
    }
    _onStepClickMaterialIcon(itemId, itemValue) {
        if (this._materialFakeCount <= 0) {
            return false;
        }
        if (this._fakeCurExp >= this._limitExp) {
            return false;
        }
        this._materialFakeCount = this._materialFakeCount - 1;
        this._materialFakeCostCount = this._materialFakeCostCount + 1;
        this._fakeCurExp = this._fakeCurExp + itemValue;
        this._fakeUpdateView(itemId);
        this._fakePlayEffect(itemId);
        return [true];
    }
    _fakeUpdateView(itemId) {
        var petConfig = this._petUnitData.getConfig();
        var realQuality = UserDataHelper.getPetUpgradeQuality(this._petUnitData);
        this._fakeLevel = UserDataHelper.getPetCanReachLevelWithExp(this._fakeCurExp, realQuality);
        this._textLevel.string = (Lang.get('hero_upgrade_txt_level', { level: this._fakeLevel }));
        this._labelCount.string = ('+' + this._materialFakeCostCount);
        this._labelCount.node.active = (this._materialFakeCostCount > 1);
        var needCurExp = UserDataHelper.getPetLevelUpExp(this._fakeLevel, realQuality);
        var nowExp = this._fakeCurExp - UserDataHelper.getPetNeedExpWithLevel(this._fakeLevel, realQuality);
        var percent = nowExp / needCurExp;
        this._loadingBarExp.progress = (percent);
        //todo
        // this._textExpPercent1.updateTxtValue(nowExp);
        this._textExpPercent1.string = nowExp.toString();
        this._textExpPercent2.string = ('/' + needCurExp);
        // this._textExpPercent2.doScaleAnimation();
        this._textOldLevel1.string = (this._fakeLevel).toString();
        UIHelper.updateLabelSize(this._textNewLevel);
        this._textOldLevel2.string = ('/' + this._limitLevel);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        var size1 = this._textOldLevel1.node.getContentSize();
        this._textOldLevel2.node.setPosition(cc.v2(posX + size1.width, posY));
        this._textNewLevel.string = (this._fakeLevel + 1 + ('/' + this._limitLevel));
        this._textNewLevel.node.active = this._fakeLevel >= this._limitLevel;
        this._fakeCurAttrData = UserDataHelper.getPetBasicAttrWithLevel(petConfig, this._fakeLevel);
        this._fakeNextAttrData = UserDataHelper.getPetBasicAttrWithLevel(petConfig, this._fakeLevel + 1);
        this._fileNodeAttr1.updateInfo(AttributeConst.ATK_FINAL, this._fakeCurAttrData[AttributeConst.ATK_FINAL], this._fakeNextAttrData[AttributeConst.ATK_FINAL], 4);
        this._fileNodeAttr2.updateInfo(AttributeConst.HP_FINAL, this._fakeCurAttrData[AttributeConst.HP_FINAL], this._fakeNextAttrData[AttributeConst.HP_FINAL], 4);
        this._fileNodeAttr3.updateInfo(AttributeConst.PD_FINAL, this._fakeCurAttrData[AttributeConst.PD_FINAL], this._fakeNextAttrData[AttributeConst.PD_FINAL], 4);
        this._fileNodeAttr4.updateInfo(AttributeConst.MD_FINAL, this._fakeCurAttrData[AttributeConst.MD_FINAL], this._fakeNextAttrData[AttributeConst.MD_FINAL], 4);
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
        this._doUpgrade(materials);
    }
    _checkLimitLevel() {
        var level = this._petUnitData.getLevel();
        if (level >= this._limitLevel) {
            G_Prompt.showTip(Lang.get('pet_upgrade_level_limit_tip'));
            return false;
        }
        return true;
    }
    _getUpgradeMaterials(level) {
        var realQuality = UserDataHelper.getPetUpgradeQuality(this._petUnitData);
        var curLevel = this._petUnitData.getLevel();
        var targetLevel = Math.min(curLevel + level, this._limitLevel);
        var curExp = clone(this._petUnitData.getExp());
        var targetExp = UserDataHelper.getPetNeedExpWithLevel(targetLevel, realQuality);
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
    _onButtonUpgradeOneClicked() {
        if (this._checkLimitLevel() == false) {
            return;
        }
        var materials = this._getUpgradeMaterials(1);
        this._doUpgrade(materials);
        this.setButtonEnable(false);
    }
    _onButtonUpgradeFiveClicked() {
        if (this._checkLimitLevel() == false) {
            return;
        }
        var materials = this._getUpgradeMaterials(5);
        this._doUpgrade(materials);
        this.setButtonEnable(false);
    }
    _doUpgrade(materials) {
        if (materials.length == 0) {
            UIPopupHelper.popupItemGuiderByType(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_PET_LEVELUP_MATERIAL_3);
            return;
        }
        var petId = this._petUnitData.getId();
        G_UserData.getPet().c2sPetLevelUp(petId, materials);
        this._costMaterials = materials;
    }
    setButtonEnable(enable) {
        this._buttonUpgradeOne.setEnabled(enable);
        this._buttonUpgradeFive.setEnabled(enable);
        //    this._pageView.setEnabled(enable);
        if (this._parentView && this._parentView.setArrowBtnEnable) {
            this._parentView.setArrowBtnEnable(enable);
        }
    }
    _onPetLevelUpSuccess() {
        this._updateData();
        this._updateCost();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.updateTabVisible();
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
        for (var i in this._costMaterials) {
            var material = this._costMaterials[i];
            var itemId = material.id;
            if (parseFloat(i) == this._costMaterials.length - 1) {
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
        // 创建一个节点
        var emitter = new cc.Node();
        var particleSystem = emitter.addComponent(cc.ParticleSystem);

        //   var emitter = cc.ParticleSystemQuad.create('particle/particle_touch.plist');
        if (emitter) {
            //  emitter.setPosition(cc.v2(sp.getContentSize().width / 2, sp.getContentSize().height / 2));
            sp.node.addChild(emitter);
            EffectHelper.loadEffectRes('particle/particle_touch.plist', cc.ParticleAsset, function (res) {
                if (res) {
                    particleSystem.file = res;
                    particleSystem.resetSystem();
                }
            }.bind(this))
        }
        var index = ITEM_ID_2_MATERICAL_INDEX[itemId];
        var startPos = UIHelper.convertSpaceFromNodeToNode(this['_fileNodeMaterial' + index].node, this.node);
        sp.node.setPosition(startPos);
        this.node.addChild(sp.node);
        var curSelectedPos = this._parentView.getSelectedPos();
        //   var curAvatar = this._pageItems[curSelectedPos].avatar;
        var endPos = UIHelper.convertSpaceFromNodeToNode(this._avatar.node, this.node, cc.v2(0, this._avatar.node.height / 2));
        var pointPos1 = cc.v2(startPos.x, startPos.y + 200);
        var pointPos2 = cc.v2((startPos.x + endPos.x) / 2, startPos.y + 100);
        var bezier = [
            pointPos1,
            pointPos2,
            endPos
        ];
        var action1 = cc.bezierTo(0.7, bezier);
        //  var action2 = new cc.EaseSineIn(action1);
        sp.node.runAction(cc.sequence(action1.easing(cc.easeSineIn()), cc.callFunc(() => {
            if (isPlayFinishEffect) {
                this._playExplodeEffect();
            }
            if (isPlayPrompt) {
                this._playPrompt();
                this.setButtonEnable(true);
            }
        }), cc.destroySelf()));
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HERO_LV);
    }
    _playExplodeEffect() {
        var effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffect, 'effect_wujianglevelup_baozha', null, true);
        var effect2 = G_EffectGfxMgr.createPlayGfx(this._nodeEffect, 'effect_wujianglevelup_light', null, true);
    }
    _recordTotalPower() {
        var totalPower = G_UserData.getBase().getPower();
        this._diffPower = totalPower - this._lastTotalPower;
        this._lastTotalPower = totalPower;
    }
    _recordAddedLevel() {
        var level = this._petUnitData.getLevel();
        this._diffLevel = level - this._lastLevel;
        this._lastLevel = level;
    }
    _recordAddedExp() {
        var level = this._petUnitData.getLevel();
        var petConfig = this._petUnitData.getConfig();
        var templet = this._petUnitData.getLvUpCost();
        var realQuality = UserDataHelper.getPetUpgradeQuality(this._petUnitData);
        var nowExp = this._petUnitData.getExp() - UserDataHelper.getPetNeedExpWithLevel(level, realQuality);
        this._diffExp = nowExp - this._lastExp;
        this._lastExp = nowExp;
    }
    _recordBaseAttr() {
        var diffAttrData = {};
        for (var i in RECORD_ATTR_LIST) {
            var one = RECORD_ATTR_LIST[i];
            var id = one[0];
            var lastValue = this._lastAttrData[id] || 0;
            var curValue = this._curAttrData[id] || 0;
            var diffValue = curValue - lastValue;
            diffAttrData[id] = diffValue;
        }
        this._diffAttrData = diffAttrData;
        this._lastAttrData = this._curAttrData;
    }
    _playPrompt() {
        var summary = [];
        if (this._diffLevel == 0) {
            var content = Lang.get('summary_pet_exp_add', { value: this._diffExp });
            var param = {
                content: content,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this._textExpPercent1.node, G_SceneManager.getRunningSceneRootNode()),
                finishCallback: function () {
                    this._updateLoadingBar(true);
                }.bind(this)
            };
            summary.push(param);
        } else {
            var content1 = Lang.get('summary_pet_levelup');
            var param1 = {
                content: content1,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this._textOldLevel1.node, G_SceneManager.getRunningSceneRootNode()),
                finishCallback: function () {
                    if (this._textOldLevel1 && this._updateLevel) {
                        this._updateLoadingBar(true);
                        //this._textOldLevel1.updateTxtValue(this._petUnitData.getLevel());
                        this._textOldLevel1.string = this._petUnitData.getLevel().toString();
                        this._updateLevel();
                        this._onSummaryFinish();
                    }
                }.bind(this)
            };
            summary.push(param1);
            var canBreakMax = UserDataHelper.getPetBreakMaxLevel(this._petUnitData);
            if (this._petUnitData.getStar() < canBreakMax) {
                var petBaseId = this._petUnitData.getBase_id();
                var petParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, petBaseId);
                var desNode = this._parentView._nodeTabIcon2.node;
                var content2 = Lang.get('summary_pet_can_break', {
                    name: petParam.name,
                    color: Colors.colorToNumber(petParam.icon_color),
                    outlineColor: Colors.colorToNumber(petParam.icon_color_outline),
                    value: canBreakMax
                });
                var param2 = {
                    content: content2,
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
                    dstPosition: UIHelper.convertSpaceFromNodeToNode(desNode, G_SceneManager.getRunningSceneRootNode())
                };
                summary.push(param2);
            }
            this._addBaseAttrPromptSummary(summary);
        }
        G_Prompt.showSummary(summary);
        //todo
        cc.resources.load('prefab/common/CommonPowerPrompt', () => {
            var prompt: CommonPowerPrompt = Util.getNode('prefab/common/CommonPowerPrompt', CommonPowerPrompt);
            var totalPower = G_UserData.getBase().getPower();
            prompt.updateUI(totalPower, this._diffPower);
            prompt.play(UIConst.SUMMARY_OFFSET_X_TRAIN, 0);
        });
        //  G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN, 0);
        // var totalPower = G_UserData.getBase().getPower();
        // var node = CSHelper.loadResourceNode(Path.getCSB('CommonPowerPrompt', 'common'));
        // node.updateUI(totalPower, this._diffPower);
        // node.play(UIConst.SUMMARY_OFFSET_X_TRAIN, 0);
    }
    _addBaseAttrPromptSummary(summary) {
        for (var i in RECORD_ATTR_LIST) {
            var one = RECORD_ATTR_LIST[i];
            var attrId = one[0];
            var dstNodeName = one[1];
            var diffValue = this._diffAttrData[attrId];
            if (diffValue != 0) {
                var absValue = Math.abs(diffValue);
                var [attrName, attrValue] = TextHelper.getAttrBasicText(attrId, absValue);
                var color = diffValue >= 0 && Colors.colorToNumber(Colors.getColor(2)) || Colors.colorToNumber(Colors.getColor(6));
                var outlineColor = diffValue >= 0 && Colors.colorToNumber(Colors.getColorOutline(2)) || Colors.colorToNumber(Colors.getColorOutline(6));
                attrValue = diffValue >= 0 && ' + ' + attrValue || ' - ' + attrValue;
                var param = {
                    content: Lang.get('summary_attr_change', {
                        attr: attrName + attrValue,
                        color: color,
                        outlineColor: outlineColor
                    }),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: dstNodeName ? UIHelper.convertSpaceFromNodeToNode(this[dstNodeName].node, G_SceneManager.getRunningSceneRootNode()) : null,
                    finishCallback: function () {
                        if (dstNodeName && this[dstNodeName] && attrId) {
                            //  this[dstNodeName].getSubNodeByName('TextCurValue').updateTxtValue(this._curAttrData[attrId]);
                            this[dstNodeName]._textCurValue.string = this._curAttrData[attrId].toString();
                            this[dstNodeName].updateInfo(attrId, this._curAttrData[attrId], this._nextAttrData[attrId], 4);
                        }
                    }.bind(this)
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _onSummaryFinish() {
        this.node.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'PetTrainUpgradeLayer');
        })));
    }
    _clearTextSummary() {
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.clearTextSummary();
    }
    // _convertToWorldSpace(node, pos) {
    //     var pos = pos || cc.v2(0, 0);
    //     var worldPos = node.convertToWorldSpace(pos);
    //     return this.convertToNodeSpace(worldPos);
    // }
}