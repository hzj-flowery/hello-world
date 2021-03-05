const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import MasterConst from '../../../const/MasterConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import EffectHelper from '../../../effect/EffectHelper';
import { G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrDiff from '../../../ui/component/CommonAttrDiff';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonEquipAvatar from '../../../ui/component/CommonEquipAvatar';
import CommonMaterialIcon from '../../../ui/component/CommonMaterialIcon';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { EquipDataHelper } from '../../../utils/data/EquipDataHelper';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import PopupMasterLevelup from '../equipment/PopupMasterLevelup';
import { EquipMasterHelper } from '../equipTrain/EquipMasterHelper';
import { EquipTrainHelper } from '../equipTrain/EquipTrainHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';





@ccclass
export default class EquipTrainRefineLayer extends ViewBase {

    ITEM2INDEX = {
        [DataConst.ITEM_REFINE_STONE_1]: 1,
        [DataConst.ITEM_REFINE_STONE_2]: 2,
        [DataConst.ITEM_REFINE_STONE_3]: 3,
        [DataConst.ITEM_REFINE_STONE_4]: 4
    }

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

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
        type: cc.Node,
        visible: true
    })
    _pageView: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRefineLevel: cc.Label = null;

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
    _textName2: cc.Label = null;

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
        type: cc.Node,
        visible: true
    })
    _panelCost: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _fileNodeCostTitle: CommonDetailTitleWithBg = null;

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
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonRefineOne: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonRefineFive: CommonButtonLevel1Normal = null;

    @property({
        type: CommonEquipAvatar,
        visible: true
    })
    _equipAvatar: CommonEquipAvatar = null;

    _signalEquipRefineSuccess;
    _isLimit: boolean;
    _isGlobalLimit: boolean;
    _limitLevel: number;
    _limitExp: number;
    _newMasterLevel: number;
    _successData: any;
    _beforeMasterInfo: any;
    _ratio: number;
    _curMasterInfo: any;
    _equipData: any;
    _canClick: boolean;
    _diffLevel: number;
    _diffExp: number;
    _materialFakeCount: any;
    _materialFakeCostCount: number;
    _fakeCurTotalExp: number;
    _fakeLevel: number;
    _fakeCurAttrData: {};
    _fakeNextAttrData: {};
    _recordAttr: any;
    _parentView: any;
    _curAttrInfo: any;
    _nextAttrInfo: any;

    onCreate() {
        this.setSceneSize(null, false);
        this._buttonRefineOne.addClickEventListenerEx(handler(this, this._onButtonRefineOneClicked));
        this._buttonRefineFive.addClickEventListenerEx(handler(this, this._onButtonRefineFiveClicked));
        this._initData();
    }
    onEnter() {
        this._initView();
        this._signalEquipRefineSuccess = G_SignalManager.add(SignalConst.EVENT_EQUIP_REFINE_SUCCESS, handler(this, this._equipRefineSuccess));
        this._updateData();
        this._updateView();
    }
    onExit() {
        this._signalEquipRefineSuccess.remove();
        this._signalEquipRefineSuccess = null;
    }
    _initData() {
        this._isLimit = false;
        this._isGlobalLimit = false;
        this._limitLevel = 0;
        this._limitExp = 0;
        this._newMasterLevel = 0;
        this._successData = null;
        this._ratio = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.MAX_EQUIPMENT_REFINE_LEVEL).content / 1000;
        this._beforeMasterInfo = null;
        this._curMasterInfo = null;
        this._equipData = null;
        this._canClick = true;
        this._diffLevel = 0;
        this._diffExp = 0;
        this._materialFakeCount = null;
        this._materialFakeCostCount = 0;
        this._fakeCurTotalExp = 0;
        this._fakeLevel = 0;
        this._fakeCurAttrData = {};
        this._fakeNextAttrData = {};
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2);
    }
    _initView() {
        this._fileNodeDetailTitle.setFontSize(24);
        this._fileNodeDetailTitle.setTitle(Lang.get('equipment_refine_detail_title'));
        this._fileNodeCostTitle.setFontSize(24);
        this._fileNodeCostTitle.setTitle(Lang.get('equipment_refine_cost_title'));
        this._buttonRefineOne.setString(Lang.get('equipment_refine_btn_one'));
        this._buttonRefineFive.setString(Lang.get('equipment_refine_btn_five'));
        var isFunctionOpen = FunctionCheck.funcIsShow(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2);
        this._buttonRefineOne.node.active = (isFunctionOpen);
        this._buttonRefineFive.node.active = (isFunctionOpen);
        this._parentView.setArrowBtnEnable(true);
        //    this._pageView.setEnabled(true);
        this._labelCount.node.active = (false);
        this._initPageView();
        for (var i = 1; i <= 4; i++) {
            var itemId = DataConst['ITEM_REFINE_STONE_' + i];
            this['_fileNodeMaterial' + i].updateUI(itemId, handler(this,this._onClickMaterialIcon), handler(this, this._onStepClickMaterialIcon));
            this['_fileNodeMaterial' + i].setStartCallback(handler(this, this._onStartCallback));
            this['_fileNodeMaterial' + i].setStopCallback(handler(this, this._onStopCallback));
        }
    }
    _createPageItem(width, height, i) {
        // var allEquipIds = this._parentView.getAllEquipIds();
        // var equipId = allEquipIds[i];
        // var unitData = G_UserData.getEquipment().getEquipmentDataWithId(equipId);
        // var equipBaseId = unitData.getBase_id();
        // var widget = ccui.Widget.create();
        // widget.setContentSize(width, height);
        // var avatar = CSHelper.loadResourceNode(Path.getCSB('CommonEquipAvatar', 'common'));
        // avatar.showShadow(false);
        // avatar.updateUI(equipBaseId);
        // var size = widget.getContentSize();
        // avatar.setPosition(cc.v2(size.width * 0.54, size.height / 2));
        // widget.addChild(avatar);
        // return [
        //     widget,
        //     avatar
        // ];
    }
    _initPageView() {
        // this._pageItems = {};
        // this._pageView.setScrollDuration(0.3);
        // this._pageView.addEventListener(handler(this, this._onPageViewEvent));
        // this._pageView.removeAllPages();
        // var viewSize = this._pageView.getContentSize();
        // var equipCount = this._parentView.getEquipCount();
        // for (var i = 0; i < equipCount; i++) {
        //     var widget = this._createPageItem(viewSize.width, viewSize.height, i), avatar;
        //     this._pageView.addPage(widget);
        //     this._pageItems[i] = {
        //         widget: widget,
        //         avatar: avatar
        //     };
        // }
        //  this._updatePageView();
    }
    _updatePageView() {
        // var selectedPos = this._parentView.getSelectedPos();
        // this._pageView.setCurrentPageIndex(selectedPos - 1);
        this._equipAvatar.updateUI(this._equipData.getBase_id());
    }
    //_onPageViewEvent(sender, event) {
    // if (event == ccui.PageViewEventType.turning && sender == this._pageView) {
    //     var targetPos = this._pageView.getCurrentPageIndex() + 1;
    //     var selectedPos = this._parentView.getSelectedPos();
    //     if (targetPos != selectedPos) {
    //         this._parentView.setSelectedPos(targetPos);
    //         var allEquipIds = this._parentView.getAllEquipIds();
    //         var curEquipId = allEquipIds[targetPos];
    //         G_UserData.getEquipment().setCurEquipId(curEquipId);
    //         this._parentView.updateArrowBtn();
    //         this._parentView.changeUpdate();
    //         this.updateInfo();
    //     }
    // }
    //}
    updateInfo() {
        this._updateData();
        this._updatePageView();
        this._updateView();
        this._updateItemAvatar();
    }
    _updateItemAvatar() {
        // var selectedPos = this._parentView.getSelectedPos();
        // this._pageItems[selectedPos].avatar.updateUI(this._equipData.getBase_id());
    }
    _updateData() {
        var curEquipId = G_UserData.getEquipment().getCurEquipId();
        this._equipData = G_UserData.getEquipment().getEquipmentDataWithId(curEquipId);
        var curLevel = this._equipData.getR_level();
        this._limitLevel = Math.floor(G_UserData.getBase().getLevel() * this._ratio);
        this._isLimit = curLevel >= this._limitLevel;
        this._updateAttrData();
        G_UserData.getAttr().recordPower();
    }
    _updateAttrData() {
        this._isGlobalLimit = false;
        this._curAttrInfo = EquipDataHelper.getEquipRefineAttr(this._equipData);
        this._nextAttrInfo = EquipDataHelper.getEquipRefineAttr(this._equipData, 1);
        if (this._nextAttrInfo == null) {
            this._isGlobalLimit = true;
            this._nextAttrInfo = {};
        }
        this._recordAttr.updateData(this._curAttrInfo);
    }
    _updateView() {
        if (this._equipData == null) {
            return;
        }
        this._updateBaseInfo();
        this._updateLoading();
        this._updateLevel();
        this._updateAttr();
        this._updateCost();
    }
    _updateBaseInfo() {
        var equipBaseId = this._equipData.getBase_id();
        var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId);
        var equipName = equipParam.name;
        var rLevel = this._equipData.getR_level();
        if (rLevel > 0) {
            equipName = equipName + ('+' + rLevel);
        }
        this._textName.string = (equipName);
        this._textName.node.color = (equipParam.icon_color);
        UIHelper.enableOutline(this._textName, equipParam.icon_color_outline, 2);
        this._textName2.string = (equipName);
        this._textName2.node.color = (equipParam.icon_color);
        UIHelper.updateTextOutline(this._textName2, equipParam);
        var heroUnitData = UserDataHelper.getHeroDataWithEquipId(this._equipData.getId());
        if (heroUnitData == null) {
            this._textFrom.node.active = (false);
        } else {
            this._textFrom.node.active = (true);
            var baseId = heroUnitData.getBase_id();
            var limitLevel = heroUnitData.getLimit_level();
            var limitRedLevel = heroUnitData.getLimit_rtg();
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
            this._textFrom.string = (Lang.get('treasure_detail_from', { name: heroParam.name }));
        }
        this._textPotential.string = (Lang.get('equipment_detail_txt_potential', { value: equipParam.potential }));
        this._textPotential.node.color = (equipParam.icon_color);
        UIHelper.enableOutline(this._textPotential, equipParam.icon_color_outline, 2);
    }
    _updateLoading(withAni?) {
        var config = this._equipData.getConfig();
        var level = this._equipData.getR_level();
        var templet = config.refine_templet;
        this._textRefineLevel.string = (Lang.get('equipment_refine_level', { level: level }));
        var curExp = this._equipData.getR_exp();
        var curTotalExp = EquipDataHelper.getCurRefineLevelExp(templet, level);
        var percent = curExp / curTotalExp;
        this._loadingBarExp.progress = (percent);
        if (withAni) {
            var lastValue = parseFloat(this._textExpPercent1.string);
            if (curExp != lastValue) {
                //   this._textExpPercent2.doScaleAnimation();
            }
            //  this._textExpPercent1.updateTxtValue(curExp)
            this._textExpPercent1.string = (curExp);
        } else {
            this._textExpPercent1.string = (curExp);
        }
        this._textExpPercent2.string = ('/' + curTotalExp);
    }
    _updateLevel() {
        var curLevel = this._equipData.getR_level();
        this._textOldLevel1.string = (curLevel);
        this._textOldLevel2.string = ('/' + this._limitLevel);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        UIHelper.updateLabelSize(this._textOldLevel1);
        var size1 = this._textOldLevel1.node.getContentSize();
        this._textOldLevel2.node.setPosition(cc.v2(posX + size1.width, posY));
        var newDes = Lang.get('equipment_refine_level2', {
            level: curLevel + 1,
            maxLevel: this._limitLevel
        });
        if (this._isGlobalLimit) {
            newDes = Lang.get('equipment_refine_max_level');
        }
        this._textNewLevel.string = (newDes);
    }
    _updateAttr() {
        var curDesInfo = TextHelper.getAttrInfoBySort(this._curAttrInfo);
        var nextDesInfo = TextHelper.getAttrInfoBySort(this._nextAttrInfo);
        for (var i in curDesInfo) {
            var info = curDesInfo[i];
            var nextInfo = nextDesInfo[i] || {};
            var idx = parseFloat(i) + 1;
            this['_fileNodeAttr' + idx].updateInfo(info.id, info.value, nextInfo.value, 4);
        }
    }
    _updateCost() {
        for (var i = 1; i <= 4; i++) {
            this['_fileNodeMaterial' + i].updateCount();
        }
    }
    _onStartCallback(itemId, count) {
        this._materialFakeCount = count;
        this._materialFakeCostCount = 0;
        var fakeCurExp = this._equipData.getR_exp();
        this._fakeLevel = this._equipData.getR_level();
        var templet = this._equipData.getConfig().refine_templet;
        this._fakeCurTotalExp = EquipDataHelper.getEquipTotalExp(templet, fakeCurExp, this._fakeLevel);
        this._fakeCurAttrData = this._curAttrInfo;
        this._fakeNextAttrData = this._nextAttrInfo;
    }
    _onStopCallback() {
        this._labelCount.node.active = (false);
    }
    _onStepClickMaterialIcon(itemId, itemValue) {
        if (this._materialFakeCount <= 0) {
            return [false];
        }
        if (this._fakeLevel >= this._limitLevel) {
            G_Prompt.showTip(Lang.get('equipment_refine_limit_tip'));
            return [false];
        }
        this._materialFakeCount = this._materialFakeCount - 1;
        this._materialFakeCostCount = this._materialFakeCostCount + 1;
        this._fakeCurTotalExp = this._fakeCurTotalExp + itemValue;
        this._fakeUpdateView(itemId);
        this._fakePlayEffect(itemId);
        return [true];
    }
    _fakeUpdateView(itemId) {
        this._labelCount.string = ('+' + this._materialFakeCostCount);
        this._labelCount.node.active = (this._materialFakeCostCount > 1);
        var config = this._equipData.getConfig();
        var templet = config.refine_templet;
        this._fakeLevel = EquipDataHelper.getCanReachRefineLevelWithExp(this._fakeCurTotalExp, templet);
        this._textRefineLevel.string = (Lang.get('equipment_refine_level', { level: this._fakeLevel }));
        var curTotalExp = EquipDataHelper.getCurRefineLevelExp(templet, this._fakeLevel);
        var curExp = EquipDataHelper.getEquipCurExp(templet, this._fakeCurTotalExp, this._fakeLevel);
        var percent = curExp / curTotalExp;
        this._loadingBarExp.progress = (percent);
        //todo
        //  this._textExpPercent1.updateTxtValue(curExp);
        this._textExpPercent1.string = curExp.toString();
        this._textExpPercent2.string = ('/' + curTotalExp);
        // this._textExpPercent2.doScaleAnimation();
        this._textOldLevel1.string = (this._fakeLevel).toString();
        this._textOldLevel2.string = ('/' + this._limitLevel);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        UIHelper.updateLabelSize(this._textOldLevel1);
        var size1 = this._textOldLevel1.node.getContentSize();
        this._textOldLevel2.node.setPosition(cc.v2(posX + size1.width, posY));
        var newDes = Lang.get('equipment_refine_level2', {
            level: this._fakeLevel + 1,
            maxLevel: this._limitLevel
        });
        if (this._isGlobalLimit) {
            newDes = Lang.get('equipment_refine_max_level');
        }
        this._textNewLevel.string = (newDes);
        this._fakeCurAttrData = EquipDataHelper.getEquipRefineAttrWithConfig(config, this._fakeLevel);
        this._fakeNextAttrData = EquipDataHelper.getEquipRefineAttrWithConfig(config, this._fakeLevel + 1);
        if (this._fakeNextAttrData == null) {
            this._fakeNextAttrData = {};
        }
        var curDesInfo = TextHelper.getAttrInfoBySort(this._fakeCurAttrData);
        var nextDesInfo = TextHelper.getAttrInfoBySort(this._fakeNextAttrData);
        for (var i in curDesInfo) {
            var info = curDesInfo[i];
            let j = parseFloat(i) + 1
            var nextInfo = nextDesInfo[i] || {};
            this['_fileNodeAttr' + j].updateInfo(info.id, info.value, nextInfo.value, 4);
        }
        var index = this.ITEM2INDEX[itemId];
        this['_fileNodeMaterial' + index].setCount(this._materialFakeCount);
    }
    _fakePlayEffect(itemId) {
        this._playSingleEffect(itemId, true);
    }
    _onClickMaterialIcon(materials) {
        if (!this._canClick) {
            return;
        }
        if (this._isLimit) {
            G_Prompt.showTip(Lang.get('equipment_refine_limit_tip'));
            return;
        }
        this._saveBeforeMasterInfo();
        var equipId = this._equipData.getId();
        G_UserData.getEquipment().c2sRefineEquipment(equipId, 1, materials);
        this._canClick = false;
        this._parentView.setArrowBtnEnable(false);
        //this._pageView.setEnabled(false);
    }
    _getMaterialsWithLevel(level) {
        var templet = this._equipData.getConfig().refine_templet;
        var curLevel = this._equipData.getR_level();
        var targetLevel = Math.min(curLevel + level, this._limitLevel);
        var curExp = EquipDataHelper.getEquipTotalExp(templet, this._equipData.getR_exp(), curLevel);
        var targetExp = EquipDataHelper.getEquipNeedExpWithLevel(templet, targetLevel);
        var materials = [];
        for (var i = 1; i <= 4; i++) {
            var num = 0;
            var count = this['_fileNodeMaterial' + i].getCount();
            var itemId = this['_fileNodeMaterial' + i].getItemId();
            var itemValue = this['_fileNodeMaterial' + i].getItemValue();
            for (var j = 1; j <= count; j++) {
                curExp = curExp + itemValue;
                num = num + 1;
                if (curExp >= targetExp) {
                    materials.push({
                        id: itemId,
                        num: num
                    });
                    return materials;
                }
            }
            if (num > 0) {
                materials.push({
                    id: itemId,
                    num: num
                });
            }
        }
        return materials;
    }
    _onButtonRefineOneClicked() {
        if (EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2) == false) {
            return;
        }
        if (!this._canClick) {
            return;
        }
        if (this._isLimit) {
            G_Prompt.showTip(Lang.get('equipment_refine_limit_tip'));
            return;
        }
        var materials = this._getMaterialsWithLevel(1);
        if (materials.length == 0) {
            UIPopupHelper.popupItemGuiderByType(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_REFINE_STONE_1);
            return;
        }
        this._saveBeforeMasterInfo();
        var equipId = this._equipData.getId();
        G_UserData.getEquipment().c2sRefineEquipment(equipId, 1, materials);
        this._canClick = false;
        this._setClickEnabled(false);
    }
    _onButtonRefineFiveClicked() {
        if (EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2) == false) {
            return;
        }
        if (!this._canClick) {
            return;
        }
        if (this._isLimit) {
            G_Prompt.showTip(Lang.get('equipment_refine_limit_tip'));
            return;
        }
        var materials = this._getMaterialsWithLevel(2);
        if (materials.length == 0) {
            UIPopupHelper.popupItemGuiderByType(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_REFINE_STONE_1);
            return;
        }
        this._saveBeforeMasterInfo();
        var equipId = this._equipData.getId();
        G_UserData.getEquipment().c2sRefineEquipment(equipId, 1, materials);
        this._canClick = false;
        this._setClickEnabled(false);
    }
    _setClickEnabled(enable) {
        this._buttonRefineOne.setEnabled(enable);
        this._buttonRefineFive.setEnabled(enable);
        if (this._parentView && this._parentView.setArrowBtnEnable) {
            this._parentView.setArrowBtnEnable(enable);
        }
        //   this._pageView.setEnabled(enable);
    }
    _equipRefineSuccess(eventName, data) {
        this._canClick = true;
        this._successData = data;
        this._recordDiffExp();
        this._recordDiffLevel();
        this._updateData();
        this._updateBaseInfo();
        this._updateLoading(true);
        this._updateCost();
        this._saveCurMasterInfo();
        var param = this._checkMasterLevelDiff();
        if (this._materialFakeCount == 0) {
            this._materialFakeCount = null;
            this._playFinishEffect();
            if (param) {
                PopupMasterLevelup.getIns(PopupMasterLevelup, (p) => {
                    p.ctor(this, param.beforeMasterInfo, param.curMasterInfo, MasterConst.MASTER_TYPE_2);
                    p.openWithAction();
                });
            } else {
                this._playRefineSuccessPrompt();
            }
            this._setClickEnabled(true);
            return;
        }
        var subItem = data.subItem;
        for (var i in subItem) {
            var item = subItem[i];
            if (i == '0') {
                this._playSingleEffect(item.id, true, true, param);
            } else {
                this._playSingleEffect(item.id);
            }
        }
    }
    onExitPopupMasterLevelup() {
        this._playRefineSuccessPrompt();
    }
    _playRefineSuccessPrompt() {
        this._setClickEnabled(true);
        var data = this._successData;
        if (!data) {
            return;
        }
        var rLevel = data.rLevel;
        var rExp = data.rExp;
        var subItem = data.subItem;
        var summary = [];
        if (this._newMasterLevel && this._newMasterLevel > 0) {
            var param = {
                content: Lang.get('summary_equip_refine_master_reach', { level: this._newMasterLevel }),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
            };
            summary.push(param);
        }
        if (this._diffLevel == 0) {
            var param1 = {
                content: Lang.get('summary_equip_exp_add', { value: this._diffExp }),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this._textExpPercent1.node, G_SceneManager.getRunningSceneRootNode())
            };
            summary.push(param1);
        } else {
            var param = {
                content: Lang.get('summary_equip_refine_success'),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
            };
            summary.push(param);
            var param2 = {
                content: Lang.get('summary_equip_refine_level', { value: this._diffLevel }),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
                dstPosition: UIHelper.convertSpaceFromNodeToNode(this._textOldLevel1.node, G_SceneManager.getRunningSceneRootNode()),
                finishCallback: function () {
                    if (this._textOldLevel1) {
                        // to do 
                        //     this._textOldLevel1.updateTxtValue(rLevel);
                        this._textOldLevel1.string = rLevel;
                        this._updateLevel();
                    }
                }.bind(this)
            };
            summary.push(param2);
        }
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN);
    }
    _addBaseAttrPromptSummary(summary) {
        var attr = this._recordAttr.getAttr();
        var desInfo = TextHelper.getAttrInfoBySort(attr);
        for (var i in desInfo) {
            var info = desInfo[i];
            var attrId = info.id;
            var diffValue = this._recordAttr.getDiffValue(attrId);
            let j = parseFloat(i) + 1;
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: UIHelper.convertSpaceFromNodeToNode(this['_fileNodeAttr' + j].node, G_SceneManager.getRunningSceneRootNode()),
                    finishCallback: function () {
                        var attrValue = this._curAttrInfo[attrId];
                        if (attrValue) {
                            var curValue = TextHelper.getAttrBasicText(attrId, attrValue)[1];
                            //to do
                            // this['_fileNodeAttr' + j].getSubNodeByName('TextCurValue').updateTxtValue(curValue); 
                            this['_fileNodeAttr' + j]._textCurValue.string = (curValue);
                            this['_fileNodeAttr' + j].updateInfo(attrId, attrValue, this._nextAttrInfo[attrId], 4);
                        }
                    }.bind(this)
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _saveBeforeMasterInfo() {
        var pos = this._equipData.getPos();
        this._beforeMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_2);
    }
    _saveCurMasterInfo() {
        var pos = this._equipData.getPos();
        this._curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_2);
    }
    _checkMasterLevelDiff() {
        var curLevel = this._curMasterInfo.masterInfo.curMasterLevel;
        var beforeLevel = this._beforeMasterInfo && this._beforeMasterInfo.masterInfo.curMasterLevel || 0;
        if (curLevel > beforeLevel) {
            this._newMasterLevel = curLevel;
            var param = {
                curLevel: curLevel,
                beforeMasterInfo: this._beforeMasterInfo,
                curMasterInfo: this._curMasterInfo
            };
            return param;
        }
        this._newMasterLevel = null;
        return null;
    }
    _recordDiffLevel() {
        var curLevel = this._equipData.getR_level();
        this._diffLevel = this._successData.rLevel - curLevel;
    }
    _recordDiffExp() {
        var curExp = this._equipData.getR_exp();
        this._diffExp = this._successData.rExp - curExp;
    }
    _playSingleEffect(itemId, isPlayFinishEffect?, isPlayPrompt?, masterParam?) {
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
        var index = this.ITEM2INDEX[itemId];
        var startPos = UIHelper.convertSpaceFromNodeToNode(this['_fileNodeMaterial' + index].node, this.node);
        sp.node.setPosition(startPos);
        this.node.addChild(sp.node);
        var posIndex = this._parentView.getSelectedPos();
        var endPos = UIHelper.convertSpaceFromNodeToNode(this._equipAvatar.node, this.node);
        var pointPos1 = cc.v2(startPos.x, startPos.y + 200);
        var pointPos2 = cc.v2((startPos.x + endPos.x) / 2, startPos.y + 100);
        var bezier = [
            pointPos1,
            pointPos2,
            endPos
        ];
        var action1 = cc.bezierTo(0.7, bezier);
        sp.node.runAction(cc.sequence(action1.easing(cc.easeSineIn()), cc.callFunc(() => {
            if (isPlayFinishEffect) {
                this._playFinishEffect();
            }
            if (isPlayPrompt) {
                if (masterParam) {
                    PopupMasterLevelup.getIns(PopupMasterLevelup, (p) => {
                        p.ctor(this, masterParam.beforeMasterInfo, masterParam.curMasterInfo, MasterConst.MASTER_TYPE_2);
                        p.openWithAction();
                    });
                } else {
                    this._playRefineSuccessPrompt();
                }
                this._setClickEnabled(true);
            }
        }), cc.destroySelf()));
    }
    _playFinishEffect(isPlayPrompt?) {
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_equipjinglian', null, eventFunction, true);
        var offsetX = UIConst.EFFECT_OFFSET_X;
        effect.node.setPosition(cc.v2(G_ResolutionManager.getDesignWidth() * 0.5 + offsetX, G_ResolutionManager.getDesignHeight() * 0.5));
    }

}