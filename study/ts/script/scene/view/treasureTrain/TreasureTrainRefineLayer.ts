const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import MasterConst from '../../../const/MasterConst';
import { SignalConst } from '../../../const/SignalConst';
import TreasureConst from '../../../const/TreasureConst';
import UIConst from '../../../const/UIConst';
import EffectHelper from '../../../effect/EffectHelper';
import { Colors, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrDiff from '../../../ui/component/CommonAttrDiff';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonCostNode from '../../../ui/component/CommonCostNode';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonPageViewEx from '../../../ui/component/CommonPageViewEx';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import CommonTreasureAvatar from '../../../ui/component/CommonTreasureAvatar';
import CommonTreasureName from '../../../ui/component/CommonTreasureName';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import PopupBase from '../../../ui/PopupBase';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import PopupMasterLevelup from '../equipment/PopupMasterLevelup';
import { EquipMasterHelper } from '../equipTrain/EquipMasterHelper';
import TreasureTrainView from './TreasureTrainView';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { TreasureDataHelper } from '../../../utils/data/TreasureDataHelper';

var MATERIAL_POS = {
    1: [[
        166,
        56
    ]],
    2: [
        [
            57,
            56
        ],
        [
            247,
            56
        ]
    ]
};

@ccclass
export default class TreasureTrainRefineLayer extends ViewBase {

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
        type: CommonPageViewEx,
        visible: true
    })
    _pageView: CommonPageViewEx = null;

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
        type: CommonAttrDiff,
        visible: true
    })
    _fileNodeAttr3: CommonAttrDiff = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _fileNodeCostTitle: CommonDetailTitleWithBg = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelMaterial: cc.Node = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _fileNodeSliver: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonRefine: CommonButtonLevel0Highlight = null;

    @property(cc.Prefab)
    commonTreasureAvatar: cc.Prefab = null;

    @property(cc.Prefab)
    commonCostNode: cc.Prefab = null;


    _signalTreasureRefine;

    _isLimit;
    _isGlobalLimit;

    _unitData;
    _sameCardNum;
    _curAttrData;
    _nextAttrData;

    _newMasterLevel;
    _recordAttr;

    _maxLevel;

    _parentView: TreasureTrainView;

    _pageItems: any[];

    _smovingZB;

    _beforeMasterInfo;

    _moneyInfo;

    _materialIcons: any[];
    _materialInfo: any[];

    private _pageViewSize: cc.Size;
    isPlayEffect: boolean = false;

    selectItem: cc.Node;
    private _isLimitTop: boolean;
    private _isBtnEnable: boolean;
    private _canLimit: boolean;

    ctor(parentView) {
        this._parentView = parentView;
        UIHelper.addEventListener(this.node, this._buttonRefine._button, 'TreasureTrainRefineLayer', '_onButtonRefineClicked');
    }
    onCreate() {
        this._initData();
        this._initView();
    }
    onEnter() {
        this._signalTreasureRefine = G_SignalManager.add(SignalConst.EVENT_TREASURE_REFINE_SUCCESS, handler(this, this._onRefineSuccess));
    }
    onExit() {
        this._signalTreasureRefine.remove();
        this._signalTreasureRefine = null;
    }
    updateInfo() {
        this._parentView.setArrowBtnVisible(true);
        this._updateData();
        this.updatePageView();
        this._updateView();
        this._parentView.updateArrowBtn();
    }
    _initData() {
        this._isLimit = false;
        this._isLimitTop = false;
        this._isGlobalLimit = false;
        this._isBtnEnable = false;
        this._unitData = null;
        this._sameCardNum = 0;
        this._curAttrData = {};
        this._nextAttrData = {};
        this._newMasterLevel = 0;
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2);
    }
    _initView() {
        this._fileNodeName.setFontSize(20);
        this._fileNodeName2.setFontSize(22);
        this._fileNodeName2.showTextBg(false);
        this._buttonRefine.setString(Lang.get('treasure_refine_btn'));
        this._fileNodeDetailTitle.setFontSize(24);
        this._fileNodeDetailTitle.setTitle(Lang.get('treasure_refine_detail_title'));
        this._fileNodeCostTitle.setFontSize(24);
        this._fileNodeCostTitle.setTitle(Lang.get('treasure_refine_cost_title'));
        this._initPageView();
    }
    _updateData() {
        var curTreasureId = G_UserData.getTreasure().getCurTreasureId();
        this._unitData = G_UserData.getTreasure().getTreasureDataWithId(curTreasureId);
        this._isGlobalLimit = false;
        this._maxLevel = this._unitData.getMaxRefineLevel();
        if (this._unitData.isCanLimitBreak() && FunctionCheck.funcIsShow(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4) && this._unitData.getLimit_cost() < TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL) {
            this._canLimit = true;
        } else {
            this._canLimit = false;
        }
        this._isLimitTop = this._unitData.getLimit_cost() >= TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL;
        var level = this._unitData.getRefine_level();
        this._isLimit = level >= this._maxLevel;
        this._updateAttrData();
        if (!this._isGlobalLimit || !this._isLimitTop && this._canLimit) {
            this._isBtnEnable = true;
        } else {
            this._isBtnEnable = false;
        }
    }
    _updateAttrData() {
        this._curAttrData = UserDataHelper.getTreasureRefineAttr(this._unitData);
        this._nextAttrData = UserDataHelper.getTreasureRefineAttr(this._unitData, 1);
        if (this._nextAttrData == null) {
            this._nextAttrData = {};
            this._isGlobalLimit = true;
        }
        this._recordAttr.updateData(this._curAttrData);
        G_UserData.getAttr().recordPower();
    }
    _createPageItem(i): any[] {
        var allTreasureIds = this._parentView.getAllTreasureIds();
        var treasureId = allTreasureIds[i - 1];
        var unitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        var baseId = unitData.getBase_id();
        var widget = new cc.Node();
        widget.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
        var avatar = cc.instantiate(this.commonTreasureAvatar).getComponent(CommonTreasureAvatar);
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
    _createPageItemTemplate() {
        var widget = new cc.Node();
        widget.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
        var avatar = cc.instantiate(this.commonTreasureAvatar).getComponent(CommonTreasureAvatar);
        avatar.node.name = 'avatar';
        widget.setAnchorPoint(0, 0);
        var size = widget.getContentSize();
        avatar.node.setPosition(cc.v2(size.width * 0.5, size.height * 0.5));
        widget.addChild(avatar.node);
        widget.addComponent(ListViewCellBase);
        return widget;
    }
    updatePageitem(item, index) {
        var allTreasureIds = this._parentView.getAllTreasureIds();
        var treasureId = allTreasureIds[index];
        var unitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        var baseId = unitData.getBase_id();
        var avatar = item.node.getChildByName('avatar').getComponent(CommonTreasureAvatar);
        avatar.showShadow(false);
        avatar.updateUI(baseId);
        var selectedPos = this._parentView.getSelectedPos();
        if (selectedPos == index + 1) {
            this.selectItem = avatar.node;
        }
    }
    _initPageView() {
        this._pageItems = [];
        //this._pageView.setSwallowTouches(false);
        //this._pageView.setScrollDuration(0.3);
        this._pageView.bounceDuration = 0.3;
        //this._pageView.addEventListener(handler(this, this._onPageViewEvent));
        //UIHelper.addPageEvent(this.node, this._pageView, 'TreasureTrainRefineLayer', '_onPageViewEvent');
        this._pageViewSize = this._pageView.node.getContentSize();
        this._smovingZB = null;
        this._pageView.removeAllPages();
        for (let i = 0; i < this._pageItems.length; i++) {
            var item = this._pageItems[i];
            item.widget = null;
            item.avatar = null;
        }
        this._pageItems = [];
        var treasureCount = this._parentView.getTreasureCount();
        this._pageView.content.setContentSize(treasureCount * this._pageViewSize.width, this._pageViewSize.height);
        // for (var i = 1; i<=treasureCount; i++) {
        //     var [widget, avatar] = this._createPageItem(i);
        //     this._pageView.addPage((widget as cc.Node));
        //     this._pageItems.push({
        //         widget: widget,
        //         avatar: avatar.node
        //     }); 
        // }
        let template = this._createPageItemTemplate();
        this._pageView.setTemplate(template);
        this._pageView.setCallback(handler(this, this.updatePageitem), handler(this, this._onPageViewEvent));
        this._pageView.resize(treasureCount, false);
        //this.updatePageView();
    }
    reInitPageView() {
        //this._pageView.removeAllPages();
        var treasureCount = this._parentView.getTreasureCount();
        if (treasureCount == 1) {
            this._pageView.enabled = false;
        }
        this._pageView.resize(treasureCount);
    }
    updatePageView() {
        //var curPageIndex = this._pageView.getCurrentPageIndex() + 1;
        var selectedPos = this._parentView.getSelectedPos();
        // if(curPageIndex == selectedPos){
        //     return;
        // }
        this._pageView.scrollToPage(selectedPos - 1, 0);
    }
    _onPageViewEvent(sender, event) {
        if (event == cc.PageView.EventType.PAGE_TURNING && sender == this._pageView) {
            var targetPos = this._pageView.getCurrentPageIndex() + 1;
            var selectedPos = this._parentView.getSelectedPos();
            if (targetPos != selectedPos) {
                this._parentView.setSelectedPos(targetPos);
                var allTreasureIds = this._parentView.getAllTreasureIds();
                var curTreasureId = allTreasureIds[targetPos - 1];
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
        this._updateLevel();
        this._updateAttr();
        this._updateMaterial();
        this._updateCost();
    }
    _updateBaseInfo() {
        var baseId = this._unitData.getBase_id() as number;
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, baseId);
        var rLevel = this._unitData.getRefine_level();
        this._fileNodeName.setName(baseId, rLevel);
        this._fileNodeName2.setName(baseId, rLevel);
        var heroUnitData = TreasureDataHelper.getHeroDataWithTreasureId(this._unitData.getId());
        if (heroUnitData == null) {
            this._textFrom.node.active = (false);
        } else {
            var baseId = heroUnitData.getBase_id();
            var limitLevel = heroUnitData.getLimit_level();
            var limitRedLevel = heroUnitData.getLimit_rtg();
            this._textFrom.node.active = (true);
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
            this._textFrom.string = (Lang.get('treasure_detail_from', { name: heroParam.name }));
        }
        this._textPotential.string = (Lang.get('treasure_detail_txt_potential', { value: param.potential }));
        this._textPotential.node.color = (param.icon_color);
        UIHelper.enableOutline(this._textPotential, param.icon_color_outline, 2);
    }
    _updateLevel() {
        var level = this._unitData.getRefine_level();
        this._textOldLevel1.string = (level);
        this._textOldLevel2.string = ('/' + this._maxLevel);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        var size1 = this._textOldLevel1.node.getContentSize();
        this._textOldLevel2.node.setPosition(cc.v2(posX + size1.width, posY));
        var newDes = Lang.get('equipment_refine_level2', {
            level: level + 1,
            maxLevel: this._maxLevel
        });
        if (this._isGlobalLimit) {
            newDes = Lang.get('equipment_refine_max_level');
        }
        this._textNewLevel.string = (newDes);
    }
    _updateAttr() {
        var curDesInfo = TextHelper.getAttrInfoBySort(this._curAttrData);
        var nextDesInfo = TextHelper.getAttrInfoBySort(this._nextAttrData);
        for (var i = 1; i <= 3; i++) {
            var curInfo = curDesInfo[i - 1];
            var nextInfo = nextDesInfo[i - 1] || {};
            if (curInfo) {
                this['_fileNodeAttr' + i].updateInfo(curInfo.id, curInfo.value, nextInfo.value, 4);
                this['_fileNodeAttr' + i].node.active = (true);
            } else {
                this['_fileNodeAttr' + i].node.active = (false);
            }
        }
    }
    _updateMaterial() {
        this._sameCardNum = 0;
        this._fileNodeCostTitle.node.active = (!this._isGlobalLimit);
        this._panelMaterial.removeAllChildren();
        this._materialIcons = [];
        this._materialInfo = [];
        if (this._isGlobalLimit) {
            var sp;
            if (this._canLimit) {
                sp = UIHelper.newSprite(Path.getTextTeam('img_team_treasure_refine'));
            } else {
                sp = UIHelper.newSprite(Path.getText('txt_train_breakthroughtop'));
            }
            var size = this._panelMaterial.getContentSize();
            sp.node.setPosition(cc.v2(size.width / 2, size.height / 2));
            this._panelMaterial.addChild(sp.node);
            return;
        }
        this._materialInfo = UserDataHelper.getTreasureRefineMaterial(this._unitData);
        var len = this._materialInfo.length;
        for (var i = 0; i < this._materialInfo.length; i++) {
            var info = this._materialInfo[i];
            var node = cc.instantiate(this.commonCostNode).getComponent(CommonCostNode);
            node.updateView(info);
            var pos = cc.v2(MATERIAL_POS[len][i][0], MATERIAL_POS[len][i][1]);
            node.node.setPosition(pos);
            this._panelMaterial.addChild(node.node);
            this._materialIcons.push(node);
            if (info.type == TypeConvertHelper.TYPE_TREASURE) {
                this._sameCardNum = this._sameCardNum + node.getNeedCount();
            }
        }
    }
    _updateCost() {
        if (this._isGlobalLimit) {
            this._fileNodeSliver.node.active = (false);
            if (!this._isLimitTop) {
                this._buttonRefine.setString(Lang.get('treasure_limit_break_btn'));
                this._buttonRefine.setEnabled(this._canLimit);
            } else {
                this._buttonRefine.setString(Lang.get('treasure_refine_btn'));
                this._buttonRefine.setEnabled(false);
            }
        } else {
            this._buttonRefine.setString(Lang.get('treasure_refine_btn'));
            this._fileNodeSliver.node.active = (true);
            this._buttonRefine.setEnabled(true);
            this._moneyInfo = UserDataHelper.getTreasureRefineMoney(this._unitData);
            this._fileNodeSliver.updateUI(this._moneyInfo.type, this._moneyInfo.value, this._moneyInfo.size);
            this._fileNodeSliver.setTextColor(Colors.BRIGHT_BG_TWO);
        }
    }
    _setButtonEnable(enable) {
        this._buttonRefine.setEnabled(enable);
    }
    _setChangePageEnable(enable) {
        this._pageView.enabled = (enable);
        if (this._parentView && this._parentView.setArrowBtnEnable) {
            this._parentView.setArrowBtnEnable(enable);
        }
    }
    _onButtonRefineClicked() {
        if (this._isGlobalLimit && !this._isLimitTop) {
            if (this._canLimit) {
                this._parentView._onClickTabIcon(TreasureConst.TREASURE_TRAIN_LIMIT);
            }
            return;
        } else if (this._isLimit) {
            G_Prompt.showTip(Lang.get('treasure_refine_level_limit_tip'));
            return;
        }
        for (var i = 0; i < this._materialIcons.length; i++) {
            var icon = this._materialIcons[i];
            var isReachCondition = icon.isReachCondition();
            if (!isReachCondition) {
                var info = this._materialInfo[i];
                var param = TypeConvertHelper.convert(info.type, info.value);
                G_Prompt.showTip(Lang.get('treasure_refine_condition_no_enough', { name: param.name }));
                return;
            }
        }
        var enoughMoney = LogicCheckHelper.enoughMoney(this._moneyInfo.size);
        if (!enoughMoney) {
            var param = TypeConvertHelper.convert(this._moneyInfo.type, this._moneyInfo.value);
            G_Prompt.showTip(Lang.get('treasure_refine_condition_no_enough', { name: param.name }));
            return;
        }
        this._saveBeforeMasterInfo();
        var treasureId = this._unitData.getId();
        var materials = [];
        var sameCards: any[] = G_UserData.getTreasure().getSameCardsWithBaseId(this._unitData.getSameCardId());
        var count = 0;
        for (var k = 0; k < sameCards.length; k++) {
            var card = sameCards[k];
            if (count >= this._sameCardNum) {
                break;
            }
            materials.push(card.getId());
            count = count + 1;
        }
        G_UserData.getTreasure().c2sRefineTreasure(treasureId, materials);
        this._setButtonEnable(false);
        this._setChangePageEnable(false);
    }
    _onRefineSuccess() {
        this._updateData();
        this._playEffect();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(TreasureConst.TREASURE_TRAIN_REFINE);
        }
    }
    _playEffect() {
        var count2Index = {
            1: [1],
            2: [
                2,
                3
            ]
        };
        function effectFunction(effect) {
            return new cc.Node();
        }
        var eventFunction = function (event) {
            if (event == 'start') {
                for (let i = 0; i < this._materialInfo.length; i++) {
                    let info = this._materialInfo[i];
                    let param = TypeConvertHelper.convert(info.type, info.value);
                    let color = param.cfg.color;
                    let sp = UIHelper.newSprite(Path.getBackgroundEffect('img_photosphere' + color));
                    let emitter = new cc.Node();
                    let particleSystem = emitter.addComponent(cc.ParticleSystem);
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
                    let worldPos = this._materialIcons[i].node.convertToWorldSpaceAR(cc.v2(0, 0));
                    let pos = this.node.convertToNodeSpaceAR(worldPos);
                    sp.node.setPosition(pos);
                    this.node.addChild(sp.node);
                    let index = count2Index[this._materialInfo.length][i];

                    G_EffectGfxMgr.applySingleGfx(sp.node, 'smoving_baowujinglian_lizi' + index, function () {
                        sp.node.runAction(cc.destroySelf());
                    }, null, null);
                }
                if (this._smovingZB && this._parentView.getRangeType() != TreasureConst.TREASURE_RANGE_TYPE_1) {
                    this._smovingZB.reset();
                }
                //var selectedPos = this._parentView.getSelectedPos();
                var avatar = this.selectItem;
                if (avatar) {
                    this._smovingZB = G_EffectGfxMgr.applySingleGfx(avatar, 'smoving_baowujinglian_zhuangbei', null, null, null);
                }
            } else if (event == 'next') {
                this._updateBaseInfo();
                this._updateMaterial();
                this._updateCost();
                this._setButtonEnable(this._isBtnEnable);
                this._setChangePageEnable(true);
                this._newMasterLevel = this._checkIsReachNewMasterLevel();
                if (!this._newMasterLevel) {
                    this._playPrompt();
                }
            } else if (event == 'finish') {
                this._onEffectFinish();
            }
        }.bind(this);
        if (!this.isPlayEffect) {
            var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_baowujinglian', effectFunction, eventFunction, false);
            var offsetX = UIConst.EFFECT_OFFSET_X;
            effect.node.setPosition(cc.v2(G_ResolutionManager.getDesignWidth() * 0.5 + offsetX, G_ResolutionManager.getDesignHeight() * 0.5));
            this.isPlayEffect = true;
        } else {
            eventFunction('next');
        }

    }
    _onEffectFinish() {
        this.isPlayEffect = false;
    }
    _saveBeforeMasterInfo() {
        var pos = this._unitData.getPos();
        this._beforeMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_4);
    }
    _checkIsReachNewMasterLevel() {
        var pos = this._unitData.getPos();
        var curMasterInfo = EquipMasterHelper.getCurMasterInfo(pos, MasterConst.MASTER_TYPE_4);
        var beforeLevel = this._beforeMasterInfo.masterInfo.curMasterLevel;
        var curLevel = curMasterInfo.masterInfo.curMasterLevel;
        if (curLevel > beforeLevel) {
            var parent = this;
            PopupBase.loadCommonPrefab('PopupMasterLevelup', (popup: PopupMasterLevelup) => {
                popup.ctor(parent, parent._beforeMasterInfo, curMasterInfo, MasterConst.MASTER_TYPE_4);
                popup.openWithAction();
            });
            // var popup = new (require('PopupMasterLevelup'))(this, this._beforeMasterInfo, curMasterInfo, MasterConst.MASTER_TYPE_4);
            // popup.openWithAction();
            return curLevel;
        }
        return false;
    }
    onExitPopupMasterLevelup() {
        this._playPrompt();
    }
    _playPrompt() {
        var summary = [];
        var param = {
            content: Lang.get('summary_treasure_refine_success'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
        };
        summary.push(param);
        if (this._newMasterLevel && this._newMasterLevel > 0) {
            var param = {
                content: Lang.get('summary_treasure_refine_master_reach', { level: this._newMasterLevel }),
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
            };
            summary.push(param);
        }
        var content1 = Lang.get('summary_treasure_refine_level', { value: 1 });
        var param1 = {
            content: content1,
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
            dstPosition: this._convertToWorldSpace(this._textOldLevel1.node),
            finishCallback: function () {
                if (this._textOldLevel1 && this._updateLevel) {
                    this._textOldLevel1.string = (this._unitData.getRefine_level()).toString();
                    this._updateLevel();
                }
                if (this._onPromptFinish) {
                    this._onPromptFinish();
                }
            }.bind(this)
        };
        summary.push(param1);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN);
    }
    onFinishCallback(params) {
        var [i, attrId] = params;
        var attrValue = this._curAttrData[attrId];
        if (attrValue) {
            //var _ = TextHelper.getAttrBasicText(attrId, attrValue), curValue;
            //this['_fileNodeAttr' + i].getSubNodeByName('TextCurValue').updateTxtValue(curValue);
            this['_fileNodeAttr' + i].updateInfo(attrId, attrValue, this._nextAttrData[attrId], 4);
        }
    }
    _addBaseAttrPromptSummary(summary: any[]) {
        var attr = this._recordAttr.getAttr();
        var desInfo: any[] = TextHelper.getAttrInfoBySort(attr);
        for (var i = 1; i <= desInfo.length; i++) {
            var info = desInfo[i - 1];
            var attrId = info.id;
            var diffValue = this._recordAttr.getDiffValue(attrId);
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: UIHelper.convertSpaceFromNodeToNode(this['_fileNodeAttr' + i].node, this.node),
                    finishCallback: handler(this, this.onFinishCallback, i, attrId)
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _onPromptFinish() {
        this._setButtonEnable(this._isBtnEnable);
        this._setChangePageEnable(true);
    }
    _convertToWorldSpace(node) {
        var worldPos = node.convertToWorldSpaceAR(cc.v2(0, 0));
        return this.node.convertToNodeSpaceAR(worldPos);
    }

}
