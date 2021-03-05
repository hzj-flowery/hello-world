const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import InstrumentConst from '../../../const/InstrumentConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import EffectHelper from '../../../effect/EffectHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors, G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrDiff from '../../../ui/component/CommonAttrDiff';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonCostNode from '../../../ui/component/CommonCostNode';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonInstrumentAvatar from '../../../ui/component/CommonInstrumentAvatar';
import CommonInstrumentName from '../../../ui/component/CommonInstrumentName';
import CommonPageViewEx from '../../../ui/component/CommonPageViewEx';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import PopupAlert from '../../../ui/PopupAlert';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { InstrumentDataHelper } from '../../../utils/data/InstrumentDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import { table } from '../../../utils/table';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { MilitaryMasterPlanHelper } from '../militaryMasterPlan/MilitaryMasterPlanHelper';
import { MilitaryMasterPlanView } from '../militaryMasterPlan/MilitaryMasterPlanView';





@ccclass
export default class InstrumentTrainAdvanceLayer extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonInstrumentName,
        visible: true
    })
    _fileNodeName: CommonInstrumentName = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFrom: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTalentDesPos: cc.Node = null;

    @property({
        type: CommonPageViewEx,
        visible: true
    })
    _pageView: CommonPageViewEx = null;

    @property({
        type: CommonInstrumentName,
        visible: true
    })
    _fileNodeName2: CommonInstrumentName = null;

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
    _panelCost: cc.Node = null;

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
        type: cc.Node,
        visible: true
    })
    _panelTip: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMini: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMiniCount: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelLimit: cc.Node = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _fileNodeSliver: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonAdvance: CommonButtonLevel0Highlight = null;

    @property(cc.Prefab)
    commonInstrumentAvatar: cc.Prefab = null;

    @property(cc.Prefab)
    commonCostNode: cc.Prefab = null;

    @property(cc.Prefab)
    popupAlert: cc.Prefab = null;

    private _isGlobalLimit: boolean;
    private _isReachLimit: boolean;

    private _unitData;
    private _maxLevel;
    private _enoughMoney;
    private _curAttrData;
    private _nextAttrData;
    private _recordAttr;
    private _smovingZB;
    private _pageViewSize: cc.Size;
    private _parentView: any;
    private _materialIcons: CommonCostNode[];
    private _materialInfo: any[];
    private _popupCommonInstrument: any;

    private _template: cc.Node;
    private isPlayEffect: boolean = false;

    private MATERIAL_POS = {
        1: [[
            166,
            80
        ]],
        2: [
            [
                50,
                80
            ],
            [
                247,
                80
            ]
        ]
    };

    private _signalInstrumentLevelup: any;

    init(parentView) {
        this._parentView = parentView;
    }

    onCreate() {
        this._initData();
        this._initView();
        //this._buttonAdvance.node.on('touchend',this._onButtonAdvanceClicked);
    }
    onEnter() {
        this._signalInstrumentLevelup = G_SignalManager.add(SignalConst.EVENT_INSTRUMENT_LEVELUP_SUCCESS, handler(this, this._onLevelupSuccess));
        this._updateData();
        this._updateView();
    }
    onExit() {
        this._signalInstrumentLevelup.remove();
        this._signalInstrumentLevelup = null;
    }
    _initData() {
        this._isGlobalLimit = false;
        this._isReachLimit = false;
        this._unitData = null;
        this._maxLevel = 0;
        this._enoughMoney = true;
        this._curAttrData = {};
        this._nextAttrData = {};
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1);
    }
    _initView() {
        this._smovingZB = null;
        this._fileNodeName.setFontSize(20);
        this._fileNodeName2.setFontSize(22);
        this._buttonAdvance.setString(Lang.get('instrument_advance_btn'));
        this._fileNodeDetailTitle.setFontSize(24);
        this._fileNodeDetailTitle.setTitle(Lang.get('instrument_advance_detail_title'));
        this._fileNodeCostTitle.setFontSize(24);
        this._fileNodeCostTitle.setTitle(Lang.get('instrument_advance_cost_title'));
        this._panelLimit.active = (false);
        this._initPageView();
    }
    _initPageView() {
        UIHelper.addPageEvent(this.node, this._pageView, 'InstrumentTrainAdvanceLayer', 'onPageViewEvent');
        this._pageViewSize = this._pageView.node.getContentSize();

        if (!this._template) {
            this._template = this._createPageItemTemplate();
        }
        this._pageView.setTemplate(this._template);
        this._pageView.setCallback(handler(this, this.updatePageItem));
        this._pageView.removeAllPages();
        var instrumentCount = this._parentView.getInstrumentCount();
        this._pageView.resize(instrumentCount);
        if (instrumentCount == 1) {
            this._pageView.enabled = false;
        }
        //this.updatePageView();
    }
    reInitPageView() {
        this._pageView.removeAllChildren();
        var instrumentCount = this._parentView.getInstrumentCount();
        if (instrumentCount == 1) {
            this._pageView.enabled = false;
        }
        this._pageView.resize(instrumentCount);
    }
    updatePageView() {
        this._smovingZB = null;
        //this._pageView.content.setContentSize(instrumentCount*this._pageViewSize.width,this._pageViewSize.height);

        var curPageIndex = this._pageView.getCurrentPageIndex();
        var selectedPos = this._parentView.getSelectedPos();
        if (curPageIndex == selectedPos) {
            return;
        }
        this._pageView.scrollToPage(selectedPos, 0);
        //this._pageView.setCurrentPageIndex(selectedPos);
    }
    updatePageItem(item, i) {
        var allInstrumentIds = this._parentView.getAllInstrumentIds();
        if (i >= allInstrumentIds.length) {
            return;
        }

        var instrumentId = allInstrumentIds[i];
        var unitData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
        if (unitData == null) {
            return;
        }
        var baseId = unitData.getBase_id();
        var limitLevel = unitData.getLimit_level();

        var avatar = item.node.getChildByName('avatar').getComponent(CommonInstrumentAvatar);
        avatar.showShadow(false);
        avatar.updateUI(baseId, limitLevel);
    }
    _createPageItemTemplate() {
        var widget = new cc.Node;
        widget.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
        var avatar = cc.instantiate(this.commonInstrumentAvatar);
        widget.setAnchorPoint(0, 0);
        var size = widget.getContentSize();
        avatar.setPosition(cc.v2(size.width * 0.5, size.height * 0.5));
        avatar.name = 'avatar';
        widget.addChild(avatar);
        widget.addComponent(ListViewCellBase);
        return widget
    }
    _updateData() {
        var curInstrumentId = G_UserData.getInstrument().getCurInstrumentId();
        this._unitData = G_UserData.getInstrument().getInstrumentDataWithId(curInstrumentId);
        var baseId = this._unitData.getBase_id();
        this._isGlobalLimit = false;
        this._maxLevel = this._unitData.getAdvanceMaxLevel();
        this._checkIsReachLimit();
        this._updateAttrData();
    }
    _checkIsReachLimit() {
        this._isReachLimit = false;
        if (this._unitData.isCanLimitBreak()) {
            var level = this._unitData.getLevel();
            var templateId = this._unitData.getLimitTemplateId();
            var limitLevel = this._unitData.getLimit_level();
            var info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel);
            this._isReachLimit = level == info.level;
        }
    }
    _updateAttrData() {
        this._panelLimit.active = (false);
        this._curAttrData = InstrumentDataHelper.getInstrumentAttrInfo(this._unitData);
        if (this._isReachLimit) {
            this._nextAttrData = {};
        } else {
            this._nextAttrData = InstrumentDataHelper.getInstrumentAttrInfo(this._unitData, 1);
            if (this._nextAttrData == null) {
                this._nextAttrData = {};
                this._isGlobalLimit = true;
                this._panelLimit.active = (true);
            }
        }
        this._recordAttr.updateData(this._curAttrData);
        G_UserData.getAttr().recordPower();
    }
    _updateView() {
        this._updateBaseInfo();
        this._updateLevel();
        this._updateAttr();
        this._updateMaterial();
        this._updateCost();
        this.updatePageView();
    }
    _updateBaseInfo() {
        var baseId = this._unitData.getBase_id();
        var level = this._unitData.getLevel();
        var limitLevel = this._unitData.getLimit_level();
        this._fileNodeName.setName(baseId, level, limitLevel);
        this._fileNodeName2.setName(baseId, level, limitLevel);
        this._fileNodeName2.showTextBg(false);
        var heroUnitData = UserDataHelper.getHeroDataWithInstrumentId(this._unitData.getId());
        if (heroUnitData == null) {
            this._textFrom.node.active = (false);
        } else {
            this._textFrom.node.active = (true);
            var baseId = heroUnitData.getBase_id();
            var limitLevel = heroUnitData.getLimit_level();
            var limitRedLevel = heroUnitData.getLimit_rtg();
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
            this._textFrom.string = (Lang.get('instrument_detail_from', { name: heroParam.name }));
        }
        this._nodeTalentDesPos.removeAllChildren();
        var instrumentBaseId = InstrumentDataHelper.getInstrumentBaseIdByCheckAvatar(this._unitData);
        var configInfo = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(instrumentBaseId);//require('app.config.instrument').get(instrumentBaseId);
        var configInfoOrigin = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(this._unitData.getBase_id());
        var templet = this._unitData.getAdvacneTemplateId();
        var limitLevel = this._unitData.getLimit_level();
        var unlockMax = configInfoOrigin.unlock_3;
        if (configInfo.instrument_rank_1 > 0) {
            var curRankInfo = InstrumentDataHelper.getInstrumentRankConfig(configInfoOrigin.instrument_rank_1, limitLevel);
            unlockMax = curRankInfo.level;
        }
        var unlock = configInfo.unlock;
        var unlock1 = configInfo.unlock_1;
        var unlock2 = configInfo.unlock_2;
        var unlock3 = unlockMax;
        var talentInfo = null;
        if (level < unlock) {
            var result = InstrumentDataHelper.findNextInstrumentTalent(level, templet, unlock);
            var nextLevel = result[0], talentName = result[1], talentDes = result[2];
            if (nextLevel) {
                var advanceDes = Lang.get('instrument_advance_txt_break_des', { rank: nextLevel });
                talentInfo = Lang.get('instrument_advance_txt_talent_des', {
                    name: talentName,
                    des: talentDes,
                    advanceDes: advanceDes
                });
            } else {
                var advanceDes = Lang.get('instrument_advance_txt_break_des', { rank: unlock });
                talentInfo = Lang.get('instrument_advance_txt_feature_des', {
                    des: configInfo.description,
                    advanceDes: advanceDes
                });
            }
        } else if (unlock1 > 0 && level < unlock1) {
            var [nextLevel, talentName, talentDes] = InstrumentDataHelper.findNextInstrumentTalent(level, templet, unlock1);
            if (nextLevel) {
                var advanceDes = Lang.get('instrument_advance_txt_break_des', { rank: nextLevel });
                talentInfo = Lang.get('instrument_advance_txt_talent_des', {
                    name: talentName,
                    des: talentDes,
                    advanceDes: advanceDes
                });
            } else {
                var advanceDes = Lang.get('instrument_advance_txt_break_des', { rank: unlock1 });
                talentInfo = Lang.get('instrument_advance_txt_feature_des', {
                    des: configInfo.description_1,
                    advanceDes: advanceDes
                });
            }
        } else if (unlock2 > 0 && level < unlock2) {
            var isShow = false;
            if (this._unitData.isCanLimitBreak()) {
                if (this._unitData.getLimit_level() > 0 && this._unitData.getConfig().color == 5) {
                    isShow = true;
                } else if (this._unitData.getConfig().color == 6) {
                    isShow = true;
                }
            } else {
                isShow = true;
            }
            if (isShow) {
                var result = InstrumentDataHelper.findNextInstrumentTalent(level, templet, unlock2);
                var nextLevel = result[0], talentName = result[1], talentDes = result[2];
                if (nextLevel) {
                    var advanceDes = Lang.get('instrument_advance_txt_break_des', { rank: nextLevel });
                    talentInfo = Lang.get('instrument_advance_txt_talent_des', {
                        name: talentName,
                        des: talentDes,
                        advanceDes: advanceDes
                    });
                } else {
                    var advanceDes = Lang.get('instrument_advance_txt_break_des', { rank: unlock2 });
                    talentInfo = Lang.get('instrument_advance_txt_feature_des', {
                        des: configInfo.description_2,
                        advanceDes: advanceDes
                    });
                }
            }
        } else if (unlock3 > 0 && level < unlock3) {
            var isShow = false;
            if (this._unitData.isCanLimitBreak()) {
                if (this._unitData.getLimit_level() > 0) {
                    isShow = true;
                }
            } else {
                isShow = true;
            }
            if (isShow) {
                var [nextLevel, talentName, talentDes] = UserDataHelper.findNextInstrumentTalent(level, templet, unlock3);
                if (nextLevel) {
                    var advanceDes = Lang.get('instrument_advance_txt_break_des', { rank: nextLevel });
                    talentInfo = Lang.get('instrument_advance_txt_talent_des', {
                        name: talentName,
                        des: talentDes,
                        advanceDes: advanceDes
                    });
                } else {
                    var advanceDes = Lang.get('instrument_advance_txt_break_des', { rank: unlock3 });
                    talentInfo = Lang.get('instrument_advance_txt_feature_des', {
                        des: configInfo.description_3,
                        advanceDes: advanceDes
                    });
                }
            }
        }
        if (talentInfo) {
            var node = RichTextExtend.createWithContent(talentInfo);
            node.node.setAnchorPoint(cc.v2(0.5, 0));
            //richText.ignoreContentAdaptWithSize(false);
            node.node.setContentSize(cc.size(500, 0));
            //node.formatText();
            this._nodeTalentDesPos.addChild(node.node);
        }
    }
    _updateLevel() {
        var level = this._unitData.getLevel();
        var maxLevel = this._maxLevel;
        this._textOldLevel1.string = (level);
        this._textOldLevel2.string = ('/' + maxLevel);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        (this._textOldLevel1 as any)._updateRenderData(true);
        var size1 = this._textOldLevel1.node.getContentSize();
        this._textOldLevel2.node.setPosition(cc.v2(posX + size1.width, posY));
        var newDes = Lang.get('equipment_refine_level2', {
            level: level + 1,
            maxLevel: maxLevel
        });
        if (this._isGlobalLimit || this._isReachLimit) {
            newDes = Lang.get('equipment_refine_max_level');
        }
        this._textNewLevel.string = (newDes);
    }
    _updateAttr() {
        var desInfo = TextHelper.getAttrInfoBySort(this._curAttrData);
        for (var i = 1; i <= 4; i++) {
            var info = desInfo[i - 1];
            if (info) {
                var key = info.id;
                var curValue = this._curAttrData[key];
                var nextValue = this._nextAttrData[key];
                this['_fileNodeAttr' + i].updateInfo(key, curValue, nextValue, 4);
                this['_fileNodeAttr' + i].node.active = (true);
            } else {
                this['_fileNodeAttr' + i].node.active = (false);
            }
        }
    }
    _updateMaterial() {
        if (this._isReachLimit || this._isGlobalLimit) {
            this._fileNodeCostTitle.node.active = (false);
            this._panelTip.active = (false);
        } else {
            this._fileNodeCostTitle.node.active = (true);
            this._panelTip.active = (true);
        }
        this._materialIcons = [];
        this._materialInfo = [];
        this._panelMaterial.removeAllChildren();
        this._buttonAdvance.setString(Lang.get('instrument_advance_btn'));
        if (this._isReachLimit) {
            var sp = null;
            var limitLevel = this._unitData.getLimit_level();
            if (limitLevel >= this._unitData.getMaxLimitLevel() || !this._unitData.getLimitFuncOpened()) {
                sp = UIHelper.newSprite(Path.getTextTeam('txt_train_breakthroughtop'))
                this._buttonAdvance.setEnabled(false);
            } else {
                sp = UIHelper.newSprite(Path.getTextTeam('img_team_shenbing'));
                this._buttonAdvance.setString(Lang.get('instrument_limit_btn'));
                this._buttonAdvance.setEnabled(true);
            }
            var size = this._panelMaterial.getContentSize();
            sp.node.setPosition(cc.v2(size.width / 2, size.height / 2));
            this._panelMaterial.addChild(sp.node);
            //this._panelLimit.active = (true);
            return;
        }
        if (this._isGlobalLimit) {
            var sp1 = UIHelper.newSprite(Path.getTextTeam('txt_train_breakthroughtop'));//cc.Sprite.create(Path.getText('txt_train_breakthroughtop'));
            var size = this._panelMaterial.getContentSize();
            sp1.node.setPosition(cc.v2(size.width / 2, size.height / 2));
            this._panelMaterial.addChild(sp1.node);
            //this._panelLimit.active = (true);
            return;
        }
        //this._panelLimit.active = (false);
        this._materialInfo = InstrumentDataHelper.getInstrumentAdvanceMaterial(this._unitData);
        var len = this._materialInfo.length;
        for (var i = 0; i < this._materialInfo.length; i++) {
            var info = this._materialInfo[i];
            var node = cc.instantiate(this.commonCostNode);//CSHelper.loadResourceNode(Path.getCSB('CommonCostNode', 'common'));
            var component = node.getComponent(CommonCostNode);
            component.updateView(info);
            var pos = cc.v2(this.MATERIAL_POS[len][i][0], this.MATERIAL_POS[len][i][1]);
            node.setPosition(pos);
            this._panelMaterial.addChild(node);
            this._materialIcons.push(component);
        }
        var baseId = this._unitData.getBase_id();
        var result = InstrumentDataHelper.getCommonInstrumentIdAndCount(baseId);
        var commonId = result[0], commonCount = result[1];
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, commonId);
        var count = G_UserData.getItems().getItemNum(commonId);
        var color = count >= commonCount && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_RED;
        UIHelper.loadTexture(this._imageMini, param.res_mini);
        this._textMiniCount.string = (count);
        this._textMiniCount.node.color = (color);
    }
    _updateCost() {
        if (this._isGlobalLimit) {
            this._fileNodeSliver.node.active = (false);
            this._buttonAdvance.setEnabled(false);
            return;
        }
        if (this._isReachLimit) {
            this._fileNodeSliver.node.active = (false);
            return;
        }
        var moneyInfo = InstrumentDataHelper.getInstrumentAdvanceMoney(this._unitData);
        this._fileNodeSliver.updateUI(moneyInfo.type, moneyInfo.value, moneyInfo.size);
        this._fileNodeSliver.setTextColor(Colors.BRIGHT_BG_TWO);
        this._fileNodeSliver.node.active = (true);
        this._enoughMoney = LogicCheckHelper['enoughMoney'](moneyInfo.size);
        this._buttonAdvance.setEnabled(true);
    }
    _onLevelupSuccess() {
        this._playEffect();
        this._updateData();
        this._updateBaseInfo();
        this._updateMaterial();
        this._updateCost();

        

        var instrumentId = G_UserData.getInstrument().getCurInstrumentId();
        var unitData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
        if(MilitaryMasterPlanHelper.isOpen(MilitaryMasterPlanHelper.Type_Instrument,unitData.getLevel()))
        {
            this.scheduleOnce(()=>{
                //达到开启条件
                G_SceneManager.showDialog("prefab/militaryMasterPlan/MilitaryMasterPlanView",function(pop:MilitaryMasterPlanView){
                    pop.setInitData(MilitaryMasterPlanHelper.Type_Instrument);
                    pop.openWithAction();
                });
            },1)
            
        }
    }
    eventFunction(event) {
        var count2Index = {
            1: [1],
            2: [
                2,
                3
            ]
        };
        if (event == 'play') {
            for (var i = 0; i < this._materialInfo.length; i++) {
                var info = this._materialInfo[i];
                var param = TypeConvertHelper.convert(info.type, info.value);
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
                if (i >= this._materialIcons.length) {
                    return;
                }
                var worldPos = this._materialIcons[i].node.convertToWorldSpaceAR(cc.v2(0, 0));
                var pos = (this.node as cc.Node).convertToNodeSpaceAR(worldPos);
                sp.node.setPosition(pos);
                this.node.addChild(sp.node);
                var index = count2Index[this._materialInfo.length][i];
                sp.node.name = 'smoving' + index;
                this.playEffect1(sp.node, index);
            }
            if (this._smovingZB && this._parentView.getRangeType() != InstrumentConst.INSTRUMENT_RANGE_TYPE_1) {
                this._smovingZB.reset();
            }
            var avatar = this._pageView.getCurentItem();
            if (avatar) {
                var node = avatar.node.getChildByName('avatar');
                this._smovingZB = G_EffectGfxMgr.applySingleGfx(node, 'smoving_shenbingjinjie_zhuangbei', null, null, null);
            }
        } else if (event == 'next') {
            this._setButtonEnable(true);
        } else if (event == 'finish') {
            this.isPlayEffect = false;
            this._playPrompt();
        }
    }
    playEffect1(node, index) {
        let finishCallback = function () {
            node.runAction(cc.destroySelf());
        }
        G_EffectGfxMgr.applySingleGfx(node, 'smoving_shenbingjinjie_lizi' + index, finishCallback, null, null);
    }
    _playEffect() {
        function effectFunction(effect) {
            return new cc.Node();
        }

        if (!this.isPlayEffect) {
            var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_shenbingjinjie', effectFunction, handler(this, this.eventFunction), false);
            var offsetX = UIConst.EFFECT_OFFSET_X;
            effect.node.setPosition(cc.v2(G_ResolutionManager.getDesignWidth() * 0.5 + offsetX, G_ResolutionManager.getDesignHeight() * 0.5));
            this.isPlayEffect = true;
        } else {
            this.eventFunction('next');
        }

        G_AudioManager.playSoundWithId(AudioConst.SOUND_INSTRUMENT_ADVANCE);
    }
    onButtonAdvanceClicked() {
        if (this._isReachLimit) {
            var [isOpen, des] = LogicCheckHelper['funcIsOpened'](FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2);
            if (!isOpen) {
                G_Prompt.showTip(des);
                return;
            }
            this._parentView.onClickTabIcon(InstrumentConst.INSTRUMENT_TRAIN_LIMIT);
            return;
        }
        this._popupCommonInstrument = null;
        var [isCan, limitLevel] = this._unitData.isCanAdvanced();
        if (isCan == false) {
            G_Prompt.showTip(Lang.get('instrument_advance_level_tip', { level: limitLevel }));
            return;
        }
        var reach = this._checkMaterial();
        if (reach == false) {
            return;
        }
        if (this._checkOtherCondition() == false) {
            return;
        }
        if (this._popupCommonInstrument) {
            this._popupCommonInstrument.openWithAction();
            return;
        }
        this._doAdvance();
    }
    _checkMaterial() {
        var isUseCommonInstrument = false;
        for (var i = 0; i < this._materialIcons.length; i++) {
            var icon = this._materialIcons[i];
            if (!icon.isReachCondition()) {
                var info = this._materialInfo[i];
                var param = TypeConvertHelper.convert(info.type, info.value);
                if (info.type == TypeConvertHelper.TYPE_INSTRUMENT) {
                    var myCount = icon.getMyCount();
                    var needCount = icon.getNeedCount();
                    var diffCount = needCount - myCount;
                    var enough = this._checkCommonInstrument(param.name, diffCount);
                    if (!enough) {
                        return false;
                    }
                } else {
                    G_Prompt.showTip(Lang.get('instrument_advance_condition_no_enough', { name: param.name }));
                    return false;
                }
            }
        }
        return true;
    }
    _checkCommonInstrument(name, count) {
        var result = InstrumentDataHelper.getCommonInstrumentIdAndCount(this._unitData.getBase_id());
        var commonId = result[0], commonCount = result[1];
        var myCount = G_UserData.getItems().getItemNum(commonId);
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, commonId);
        var needCount = count * commonCount;
        if (myCount < needCount) {
            G_Prompt.showTip(Lang.get('instrument_advance_condition_no_enough', { name: name }));
            return false;
        }
        let callback = function () {
            this._doAdvance();
        }.bind(this);
        var node = cc.instantiate(this.popupAlert);
        var popup = node.getComponent(PopupAlert);
        popup.init(Lang.get('common_cost_tip_title'), '', callback);
        // var popup;// = new (require('PopupAlert'))(Lang.get('common_cost_tip_title'), '', callback);
        var des1 = Lang.get('instrument_advance_check_common_1', {
            name: name,
            count: needCount,
            costName: param.name
        });
        var des2 = Lang.get('instrument_advance_check_common_2');
        var des3 = Lang.get('instrument_advance_check_common_3', {
            name: param.name,
            count: myCount
        });
        var content = [];
        content.push(des1);
        content.push(des2);
        content.push(des3);
        popup.addRichTextList(content);
        this._popupCommonInstrument = popup;
        return true;
    }
    _checkOtherCondition() {
        if (!this._enoughMoney) {
            G_Prompt.showTip(Lang.get('instrument_advance_condition_no_money'));
            return false;
        }
        if (this._unitData.getLevel() >= this._maxLevel) {
            G_Prompt.showTip(Lang.get('instrument_advance_level_limit_tip'));
            return false;
        }
        return true;
    }
    _doAdvance() {
        var instrumentId = this._unitData.getId();
        G_UserData.getInstrument().c2sInstrumentUpLevel(instrumentId);
        this._setButtonEnable(false);
    }
    _setButtonEnable(enable) {
        this._buttonAdvance.setEnabled(enable && !this._isGlobalLimit && !this._isReachLimit);
        this._pageView.enabled = (enable);
        if (this._parentView && this._parentView.setArrowBtnEnable) {
            this._parentView.setArrowBtnEnable(enable);
        }
    }
    updateInfo() {
        this._parentView.setArrowBtnVisible(true);
        this._updateData();
        this._updateView();
    }
    onPageViewEvent(sender, event, customEventData) {//pageView, eventType, customEventData
        if (event == cc.PageView.EventType.PAGE_TURNING && sender == this._pageView) {
            var targetPos = this._pageView.getCurrentPageIndex();
            var selectedPos = this._parentView.getSelectedPos();
            if (targetPos != selectedPos) {
                this._parentView.setSelectedPos(targetPos);
                var allInstrumentIds = this._parentView.getAllInstrumentIds();
                var curInstrumentId = allInstrumentIds[targetPos];
                G_UserData.getInstrument().setCurInstrumentId(curInstrumentId);
                this._parentView.updateArrowBtn();
                this._parentView.updateTabIcons()
                this._updateData();
                this._updateView();
            }
        }
    }
    _playPrompt() {
        var summary = [];
        var param = {
            content: Lang.get('summary_instrument_advance_success'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
        };
        table.insert(summary, param);
        var content1 = Lang.get('summary_instrument_advance_level', { value: 1 });
        var dstPosition = this._convertToWorldSpace(this._textOldLevel1.node);
        dstPosition.x -= this.node.width / 2;
        dstPosition.y -= this.node.height / 2;
        var param1 = {
            content: content1,
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
            dstPosition: dstPosition,
            finishCallback: function () {
                if (this._textOldLevel1 && this._updateLevel) {
                    this._textOldLevel1.string = (this._unitData.getLevel()).toString();
                    this._updateLevel();
                }
                if (this._onPromptFinish) {
                    this._onPromptFinish();
                }
            }.bind(this)
        };
        table.insert(summary, param1);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN);
    }
    onFinishCallback(params: any[]) {
        var [i, attrId] = params;
        if (this['_fileNodeAttr' + i]) {
            if (!this._curAttrData[attrId]) {
                return;
            }
            var [tmp, curValue] = TextHelper.getAttrBasicText(attrId, this._curAttrData[attrId]);
            var labelComp = (this['_fileNodeAttr' + i].node as cc.Node).getChildByName('TextCurValue').getComponent(cc.Label);
            labelComp.string = curValue.toString();
            this['_fileNodeAttr' + i].updateInfo(attrId, this._curAttrData[attrId], this._nextAttrData[attrId], 4);
        }

    }
    _addBaseAttrPromptSummary(summary) {
        var attr = this._recordAttr.getAttr();
        var desInfo = TextHelper.getAttrInfoBySort(attr);
        for (let i = 1; i <= desInfo.length; i++) {
            var info = desInfo[i - 1];
            var attrId = info.id;
            var diffValue = this._recordAttr.getDiffValue(attrId);
            var dstPosition = cc.v2(0, 0);
            if (this['_fileNodeAttr' + i]) {
                dstPosition = UIHelper.convertSpaceFromNodeToNode(this['_fileNodeAttr' + i].node, this.node);
                dstPosition.x -= this.node.width / 2;
                dstPosition.y -= this.node.height / 2;
            }
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: dstPosition,
                    finishCallback: handler(this, this.onFinishCallback, i, attrId)
                };
                table.insert(summary, param);
            }
        }
        return summary;
    }
    _onPromptFinish() {
    }
    _convertToWorldSpace(node: cc.Node) {
        var worldPos = node.convertToWorldSpaceAR(cc.v2(0, 0));
        return this.node.convertToNodeSpaceAR(worldPos);
    }
}
