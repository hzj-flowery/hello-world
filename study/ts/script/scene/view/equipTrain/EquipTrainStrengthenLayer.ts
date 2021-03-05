const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal'

import CommonAttrDiff from '../../../ui/component/CommonAttrDiff'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import { G_SignalManager, G_UserData, Colors, G_Prompt, G_ResolutionManager, G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import MasterConst from '../../../const/MasterConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { EquipmentData } from '../../../data/EquipmentData';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { EquipDataHelper } from '../../../utils/data/EquipDataHelper';
import UIHelper from '../../../utils/UIHelper';
import { DataConst } from '../../../const/DataConst';
import { EquipTrainHelper } from '../equipTrain/EquipTrainHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { TextHelper } from '../../../utils/TextHelper';
import { EquipMasterHelper } from '../equipTrain/EquipMasterHelper';
import CommonEquipAvatar from '../../../ui/component/CommonEquipAvatar';
import EffectGfxNode from '../../../effect/EffectGfxNode';
import UIConst from '../../../const/UIConst';
import ViewBase from '../../ViewBase';
import { AudioConst } from '../../../const/AudioConst';
import PopupMasterLevelup from '../equipment/PopupMasterLevelup';

@ccclass
export default class EquipTrainStrengthenLayer extends ViewBase {

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
    _fileNodeAttr: CommonAttrDiff = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _buttonStrengFive: CommonButtonLevel1Normal = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonStreng: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCostTitle: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _fileNodeSliver: CommonResourceInfo = null;

    @property({
        type: CommonEquipAvatar,
        visible: true
    })
    _equipAvatar: CommonEquipAvatar = null;

    _signalEquipUpgradeSuccess: any;
    _isLimit: boolean;
    _isGlobalLimit: boolean;
    _newMasterLevel: number;
    _successData: any;
    _ratio: number;
    _beforeMasterInfo: any;
    _equipData: any;
    _curAttrInfo: {};
    _nextAttrInfo: any;
    _diffLevel: number;
    _pageItems: {};
    _parentView: any;
    _costValue: any;


    onCreate() {
        this.setSceneSize(null, false);
        this.node.name = "EquipTrainStrengthenLayer";
        //this._initData();
        this._initView();
        this._buttonStrengFive.addClickEventListenerEx(handler(this, this._onButtonStrengFiveClicked));
        this._buttonStreng.addClickEventListenerEx(handler(this, this._onButtonStrengClicked));
    }
    onEnter() {
        this._signalEquipUpgradeSuccess = G_SignalManager.add(SignalConst.EVENT_EQUIP_UPGRADE_SUCCESS, handler(this, this._equipUpgradeSuccess));
       // this._updateData();
      //  this._updateView();
    }
    onExit() {
        this._signalEquipUpgradeSuccess.remove();
        this._signalEquipUpgradeSuccess = null;
    }
    _initData() {
        this._isLimit = false;
        this._isGlobalLimit = false;
        this._newMasterLevel = 0;
        this._successData = null;
        this._ratio = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.MAX_EQUIPMENT_LEVEL).content / 1000;
        this._beforeMasterInfo = null;
        this._equipData = null;
        this._curAttrInfo = {};
        this._nextAttrInfo = null;
        this._diffLevel = 0;
        this._pageItems = {};
    }
    _initView() {
        this._fileNodeDetailTitle.setFontSize(24);
        this._fileNodeDetailTitle.setTitle(Lang.get('equipment_strengthen_detail_title'));
        this._buttonStrengFive.setString(Lang.get('equipment_strengthen_btn_five'));
        this._buttonStreng.setString(Lang.get('equipment_strengthen_btn'));
        this._parentView._buttonLeft.enable = (true);
        this._parentView._buttonRight.enable = (true);
        this._initPageView();
    }
    updateInfo() {
        this._initData();
        this._updateData();
        this._updatePageView();
        this._updateView();
        this._updateItemAvatar();
    }
    _updateItemAvatar() {
        //  var selectedPos = this._parentView.getSelectedPos();
        //  this._pageItems[selectedPos].avatar.updateUI(this._equipData.getBase_id());
        this._equipAvatar.updateUI(this._equipData.getBase_id());
    }
    _updateData() {
        var curEquipId = G_UserData.getEquipment().getCurEquipId();
        if (curEquipId == null) {
            this._equipData = null;
            return;
        }
        this._equipData = G_UserData.getEquipment().getEquipmentDataWithId(curEquipId);
        var curLevel = this._equipData.getLevel();
        var maxLevel = Math.ceil(G_UserData.getBase().getLevel() * this._ratio);
        this._isLimit = curLevel >= maxLevel;
        this._updateAttrData();
        G_UserData.getAttr().recordPower();
    }
    _updateAttrData() {
        this._curAttrInfo = EquipDataHelper.getEquipStrengthenAttr(this._equipData);
        this._nextAttrInfo = EquipDataHelper.getEquipStrengthenAttr(this._equipData, 1);
        if (this._nextAttrInfo == null) {
            this._nextAttrInfo = {};
            this._isGlobalLimit = true;
        }
    }
    _createPageItem(width, height, i) {
        // var allEquipIds = this._parentView.getAllEquipIds();
        // var equipId = allEquipIds[i];
        // var unitData: any = {}; //G_UserData.getEquipment().getEquipmentDataWithId(equipId);
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
        // this._pageView.setScrollDuration(0.3);
        // this._pageView.addEventListener(handler(this, this._onPageViewEvent));
        // this._pageView.addTouchEventListener(handler(this, this._onPageTouch));
        // this._pageView.removeAllPages();
        // this._pageItems = {};
        // var viewSize = this._pageView.getContentSize();
        // var equipCount = this._parentView.getEquipCount();
        // for (var i = 1; equipCount; null) {
        //     var item = this._createPageItem(viewSize.width, viewSize.height, i), avatar;
        //     // this._pageView.addPage(item);
        //     this._pageItems[i] = {
        //         item: item,
        //         avatar: avatar
        //     };
        // }
        // this._updatePageView();
    }
    _updatePageView() {
        var selectedPos = this._parentView.getSelectedPos();
        // this._pageView.setCurrentPageIndex(selectedPos - 1);
    }
    _onPageTouch(sender, state) {
        // if (state == ccui.TouchEventType.began) {
        //     return true;
        // } else if (state == ccui.TouchEventType.moved) {
        // } else if (state == ccui.TouchEventType.ended || state == ccui.TouchEventType.canceled) {
        // }
    }
    _onPageViewEvent(sender, event) {
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
    }
    _updateView() {
        if (this._equipData == null) {
            return;
        }
        this._updateBaseInfo();
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
            this._textFrom.node.active = false;
        } else {
            this._textFrom.node.active = true;
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
    _updateLevel() {
        var curLevel = this._equipData.getLevel();
        var maxLevel = Math.ceil(G_UserData.getBase().getLevel() * this._ratio);
        this._textOldLevel1.string = (curLevel);
        this._textOldLevel2.string = ('/' + maxLevel);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        UIHelper.updateLabelSize(this._textOldLevel1);
        var size1 = this._textOldLevel1.node.getContentSize();
        this._textOldLevel2.node.setPosition(cc.v2(posX + size1.width, posY));
        var newDes = Lang.get('equipment_strengthen_level', {
            level: curLevel + 1,
            maxLevel: maxLevel
        });
        if (this._isGlobalLimit) {
            newDes = Lang.get('equipment_strengthen_max_level');
        }
        this._textNewLevel.string = (newDes);
    }
    _updateAttr() {
        for (var k in this._curAttrInfo) {
            var value = this._curAttrInfo[k];
            var nextValue = this._nextAttrInfo[k];
            this._fileNodeAttr.updateInfo(k, value, nextValue, 4);
        }
    }
    _updateCost() {
        if (this._isLimit) {
            this._textCostTitle.node.active = false;
            this._fileNodeSliver.node.active = false;
        } else {
            this._textCostTitle.node.active = true;
            this._fileNodeSliver.node.active = true;
            this._costValue = EquipDataHelper.getLevelupCostValue(this._equipData);
            this._fileNodeSliver.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, this._costValue);
            this._fileNodeSliver.setTextColor(Colors.BRIGHT_BG_TWO);
        }
    }
    _onButtonStrengFiveClicked() {
        if (this._checkStrengthenCondition() == false) {
            return;
        }
        if (EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_STRENGTHEN_FIVE) == false) {
            return;
        }
        this._saveBeforeMasterInfo();
        var curEquipId = G_UserData.getEquipment().getCurEquipId();
        G_UserData.getEquipment().c2sUpgradeEquipment(curEquipId, 5);
        this._setButtonEnable(false);
    }
    _onButtonStrengClicked() {
        if (this._checkStrengthenCondition() == false) {
            return;
        }
        this._saveBeforeMasterInfo();
        var curEquipId = G_UserData.getEquipment().getCurEquipId();
        G_UserData.getEquipment().c2sUpgradeEquipment(curEquipId, 1);
        this._setButtonEnable(false);
    }
    _setButtonEnable(enable) {
        this._buttonStreng.setEnabled(enable);
        this._buttonStrengFive.setEnabled(enable);
        this._parentView.setArrowBtnEnable(enable);
        //   this._pageView.setEnabled(enable);
    }
    _checkStrengthenCondition() {
        if (this._isLimit) {
            G_Prompt.showTip(Lang.get('equipment_strengthen_limit_tip'));
            return false;
        }
        var arr = UserCheck.enoughMoney(this._costValue);
        var isOk = arr[0];
        if (!isOk) {
            var func = arr[1] as Function;
            func();
            return false;
        }
        return true;
    }
    _equipUpgradeSuccess(eventName, data) {
        this._successData = data;
        this._recordDiffLevel();
        this._updateData();
        this._playEffect();
    }
    _playEffect() {
        function eventFunction(event) {
            if (event == 'play') {
                var index = this._parentView.getSelectedPos();
                if (this._pageItems[index] && this._pageItems[index].avatar) {
                    var node = this._pageItems[index].avatar;
                    G_EffectGfxMgr.applySingleGfx(node, 'smoving_zhuangbei', null, null, null);
                }
            } else if (event == 'next') {
                this._newMasterLevel = this._checkIsReachNewMasterLevel();
                if (!this._newMasterLevel) {
                    this._playStrSuccessPrompt();
                }
                this._setButtonEnable(true);
            } else if (event == 'finish') {
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_equipqianghua', null, eventFunction.bind(this), false);
        var offsetX = UIConst.EFFECT_OFFSET_X;
        effect.node.setPosition(cc.v2(G_ResolutionManager.getDesignWidth() * 0.5 + offsetX, G_ResolutionManager.getDesignHeight() * 0.5));
        G_AudioManager.playSoundWithId(AudioConst.SOUND_EQUIP_STRENGTHEN);
    }
    _saveBeforeMasterInfo() {
        var pos = this._equipData.getPos();
        this._beforeMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_1);
    }
    _checkIsReachNewMasterLevel() {
        var pos = this._equipData.getPos();
        var curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_1);
        if (this._beforeMasterInfo) {
            var beforeLevel = this._beforeMasterInfo.masterInfo.curMasterLevel;
            var curLevel = curMasterInfo.masterInfo.curMasterLevel;
            if (curLevel > beforeLevel) {
                PopupMasterLevelup.getIns(PopupMasterLevelup, (p) => {
                    p.ctor(this, this._beforeMasterInfo, curMasterInfo, MasterConst.MASTER_TYPE_1);
                    p.openWithAction();
                });
                return curLevel;
            }
        }
        return false;
    }
    onExitPopupMasterLevelup() {
        this._playStrSuccessPrompt();
    }
    _playStrSuccessPrompt() {
        this._updateCost();
        var data = this._successData;
        var times = data.times;
        var critTimes = data.critTimes;
        var breakReason = data.breakReason;
        var level = data.level;
        var crits = data.crits;
        var saveMoney = data.saveMoney;
        var critInfo = {};
        for (var i in crits) {
            var multiple = crits[i];
            if (multiple > 1) {
                if (critInfo[multiple] == null) {
                    critInfo[multiple] = 0;
                }
                critInfo[multiple] = critInfo[multiple] + 1;
            }
        }
        var summary = [];
        var param1 = {
            content: Lang.get('summary_equip_str_success_tip6'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
        };
        summary.push(param1);
        if (this._newMasterLevel && this._newMasterLevel > 0) {
            var param = {
                content: Lang.get('summary_equip_str_master_reach', { level: this._newMasterLevel }),
                startPosition: [UIConst.SUMMARY_OFFSET_X_TRAIN]
            };
            summary.push(param);
        }
        var param3 = {
            content: Lang.get('summary_equip_str_success_tip3', { value: this._diffLevel }),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
            dstPosition: UIHelper.convertSpaceFromNodeToNode(this._textOldLevel1.node, G_SceneManager.getRunningSceneRootNode()),
            finishCallback: function () {
                if (this._textOldLevel1 && this._updateLevel) {
                    // to do
                    //   this._textOldLevel1.updateTxtValue(this._equipData.getLevel());
                    this._textOldLevel1.string = this._equipData.getLevel();
                    this._updateLevel();
                }
            }.bind(this)
        };
        summary.push(param3);
        if (critTimes > 0) {
            for (multiple in critInfo) {
                var count = critInfo[multiple];
                var param4 = {
                    content: Lang.get('summary_equip_str_success_tip2', {
                        multiple: multiple,
                        count: count
                    }),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
                };
                summary.push(param4);
            }
        }
        if (saveMoney > 0) {
            var param5 = {
                content: Lang.get('summary_equip_str_success_tip5', { value: saveMoney }),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
            };
            summary.push(param5);
        }
        var curLevel = this._equipData.getLevel();
        var attrDiff = EquipDataHelper.getEquipStrengthenAttrDiff(this._equipData, curLevel - this._diffLevel, curLevel);
        var attrName = '';
        var attrValue = 0;
        for (var k in attrDiff) {
            var value = attrDiff[k];
            var arr = TextHelper.getAttrBasicText(k, value);
            attrName = arr[0], attrValue = arr[1];
            break;
        }
        var param6 = {
            content: Lang.get('summary_equip_str_success_tip4', {
                attrName: attrName,
                attrValue: attrValue
            }),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
            dstPosition: UIHelper.convertSpaceFromNodeToNode(this._fileNodeAttr.node, G_SceneManager.getRunningSceneRootNode()),
            finishCallback: function () {
                if (this._equipData) {
                    for (k in this._curAttrInfo) {
                        var value = this._curAttrInfo[k];
                        if (this._fileNodeAttr) {
                            var text = this._fileNodeAttr._textCurValue
                            //  text.updateTxtValue(value);
                            text.string = value;
                            this._updateAttr();
                        }
                    }
                    this._onSummaryFinish();
                }
            }.bind(this)
        };
        summary.push(param6);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN);
    }
    _recordDiffLevel() {
        var curLevel = this._equipData.getLevel();
        this._diffLevel = this._successData.level - curLevel;
    }
    _onSummaryFinish() {
        this.node.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.callFunc(function () {
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "EquipTrainStrengthenLayer");
            }.bind(this))
        )
        );
    }
}