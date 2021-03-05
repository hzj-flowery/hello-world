const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { FunctionConst } from '../../../const/FunctionConst';
import HorseConst from '../../../const/HorseConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors, G_AudioManager, G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrDiff from '../../../ui/component/CommonAttrDiff';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonCostNode from '../../../ui/component/CommonCostNode';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import CommonHeroStar from '../../../ui/component/CommonHeroStar';
import CommonHorseAvatar from '../../../ui/component/CommonHorseAvatar';
import CommonHorseName from '../../../ui/component/CommonHorseName';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { HorseDataHelper } from '../../../utils/data/HorseDataHelper';
import { clone } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import HorseDetailEquipNode from '../horseDetail/HorseDetailEquipNode';
import HorseTrainView from './HorseTrainView';






@ccclass
export default class HorseTrainUpStarLayer extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;

    @property({ type: CommonHorseName, visible: true })
    _fileNodeName: CommonHorseName = null;

    @property({ type: CommonHeroStar, visible: true })
    _nodeStar: CommonHeroStar = null;

    @property({ type: cc.Label, visible: true })
    _textFrom: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeTalentDesPos: cc.Node = null;

    @property({ type: cc.PageView, visible: true })
    _pageView: cc.PageView = null;

    @property({ type: cc.Node, visible: true })
    _nodeEquip: cc.Node = null;

    @property({ type: CommonHorseName, visible: true })
    _fileNodeName2: CommonHorseName = null;

    @property({ type: CommonDetailTitleWithBg, visible: true })
    _fileNodeDetailTitle: CommonDetailTitleWithBg = null;

    @property({ type: cc.Label, visible: true })
    _textOldLevel1: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textOldLevel2: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textNewLevel: cc.Label = null;

    @property({ type: CommonAttrDiff, visible: true })
    _fileNodeAttr1: CommonAttrDiff = null;

    @property({ type: CommonAttrDiff, visible: true })
    _fileNodeAttr2: CommonAttrDiff = null;

    @property({ type: CommonAttrDiff, visible: true })
    _fileNodeAttr3: CommonAttrDiff = null;

    @property({ type: CommonAttrDiff, visible: true })
    _fileNodeAttr4: CommonAttrDiff = null;

    @property({ type: CommonAttrDiff, visible: true })
    _fileNodeAttr5: CommonAttrDiff = null;

    @property({ type: CommonAttrDiff, visible: true })
    _fileNodeAttr6: CommonAttrDiff = null;

    @property({ type: cc.Node, visible: true })
    _panelCost: cc.Node = null;

    @property({ type: CommonDetailTitleWithBg, visible: true })
    _fileNodeCostTitle: CommonDetailTitleWithBg = null;

    @property({ type: cc.Node, visible: true })
    _panelMaterial: cc.Node = null;

    @property({ type: CommonResourceInfo, visible: true })
    _fileNodeSliver: CommonResourceInfo = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _buttonUpStar: CommonButtonLevel0Highlight = null;

    @property({ type: cc.Prefab, visible: true })
    _commonHorseAvatarPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _horseDetailEquipNodePrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _commonCostNodePrefab: cc.Prefab = null;

    private _lastAttr;
    private _difAttr;
    private _canUpdateAttr;
    private _parentView: HorseTrainView;

    private _signalHorseStarUpSuccess;
    private _singleHorseEquipAddSuccess;

    private _isLimit;
    private _isGlobalLimit;
    private _unitData;
    private _maxStar;
    private _enoughMoney;
    private _curAttrData;
    private _nextAttrData;
    private _recordAttr;
    private _smovingZB;
    private _pageViewSize;
    private _pageItems: any[];
    private _horseEquipItem: HorseDetailEquipNode;
    private _materialIcons: CommonCostNode[];
    private _materialInfo: any[];

    init(parentView: HorseTrainView) {
        this._lastAttr = {};
        this._difAttr = {};
        this._canUpdateAttr = true;
        this._parentView = parentView;
        this._buttonUpStar.addClickEventListenerEx(handler(this, this._onButtonUpStarClicked));
    }

    onCreate() {
        this.setSceneSize();
        this._initData();
        this._initView();
    }

    onEnter() {
        this._signalHorseStarUpSuccess = G_SignalManager.add(SignalConst.EVENT_HORSE_STARUP_SUCCESS, handler(this, this._onHorseStarUpSuccess));
        this._singleHorseEquipAddSuccess = G_SignalManager.add(SignalConst.EVENT_HORSE_EQUIP_ADD_SUCCESS, handler(this, this._horseEquipAddSuccess));
        this._updatePageItem();
        this._updateData();
        this._updateView();
    }

    onExit() {
        this._signalHorseStarUpSuccess.remove();
        this._signalHorseStarUpSuccess = null;
        this._singleHorseEquipAddSuccess.remove();
        this._singleHorseEquipAddSuccess = null;
        this._saveLastAttr();
    }

    initInfo() {
        this._initData();
        this._initView();
        this._updatePageItem();
        this._updateData();
        this._updateView();
        var selectedPos = this._parentView.getSelectedPos();
        this._pageView.setCurrentPageIndex(selectedPos - 1);
        // this._pageView.scrollToPage(selectedPos - 1, 0);
    }

    onButtonLeftRightClicked() {
        this._updatePageItem();
        this._updateData();
        this._updateView();
        this._initEquipItem();
        var selectedPos = this._parentView.getSelectedPos();
        this._pageView.setCurrentPageIndex(selectedPos - 1);
    }

    _initData() {
        this._isLimit = false;
        this._isGlobalLimit = false;
        this._unitData = null;
        this._maxStar = HorseConst.HORSE_STAR_MAX;
        this._enoughMoney = true;
        this._curAttrData = {};
        this._nextAttrData = {};
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_HORSE_TRAIN);
    }

    _initView() {
        this._smovingZB = null;
        this._fileNodeName.setFontSize(20);
        this._fileNodeName2.setFontSize(22);
        this._buttonUpStar.setString(Lang.get('horse_btn_advance'));
        this._fileNodeDetailTitle.setFontSize(24);
        this._fileNodeDetailTitle.setTitle(Lang.get('horse_advance_detail_title'));
        this._fileNodeCostTitle.setFontSize(24);
        this._fileNodeCostTitle.setTitle(Lang.get('horse_advance_cost_title'));
        this._initPageView();
    }

    _updateData() {
        var curHorseId = G_UserData.getHorse().getCurHorseId();
        this._unitData = G_UserData.getHorse().getUnitDataWithId(curHorseId);
        var baseId = this._unitData.getBase_id();
        var info = HorseDataHelper.getHorseConfig(baseId);
        this._isGlobalLimit = false;
        this._updateAttrData();
    }

    _updateAttrData() {
        this._curAttrData = HorseDataHelper.getHorseAttrInfo(this._unitData);
        this._nextAttrData = HorseDataHelper.getHorseAttrInfo(this._unitData, 1);
        if (this._nextAttrData == null) {
            this._nextAttrData = {};
            this._isGlobalLimit = true;
        }
        this._recordAttr.updateData(this._curAttrData);
        G_UserData.getAttr().recordPower();
    }

    _createPageItem() {
        var widget = new cc.Node();;
        widget.setContentSize(this._pageViewSize.width, this._pageViewSize.height);
        return widget;
    }

    _updatePageItem() {
        var allHorseIds = this._parentView.getAllHorseIds();
        var index = this._parentView.getSelectedPos();
        for (var i = index - 1; i <= index + 1; i++) {
            if (i >= 1 && i <= allHorseIds.length) {
                if (this._pageItems[i - 1] == null) {
                    var widget = this._createPageItem();
                    this._pageView.addPage(widget);
                    this._pageItems[i - 1] = { widget: widget };
                }
                if (this._pageItems[i - 1].avatar == null) {
                    var avatar = cc.instantiate(this._commonHorseAvatarPrefab).getComponent(CommonHorseAvatar);
                    avatar.node.setPosition(80, -150);
                    this._pageItems[i - 1].widget.addChild(avatar.node);
                    this._pageItems[i - 1].avatar = avatar;
                }
                var horseId = allHorseIds[i - 1];
                var unitData = G_UserData.getHorse().getUnitDataWithId(horseId);
                var baseId = unitData.getBase_id();
                this._pageItems[i - 1].avatar.updateUI(baseId);
            }
        }
    }

    _initPageView() {
        this._pageItems = [];
        this._pageViewSize = this._pageView.node.getContentSize();
        this._pageView.removeAllPages();
        var horseCount = this._parentView.getHorseCount();
        this._pageView.content.setContentSize(this._pageViewSize.width * horseCount, this._pageViewSize.height);
        for (var i = 1; i <= horseCount; i++) {
            var widget = this._createPageItem();
            this._pageView.addPage(widget);
            this._pageItems[i - 1] = { widget: widget };
        }
        var selectedPos = this._parentView.getSelectedPos();
        // this._pageView.setCurrentPageIndex(selectedPos - 1);
        this._pageView.scrollToPage(selectedPos - 1, 0);
        this._initEquipItem();
    }

    _initEquipItem() {
        if (this._horseEquipItem) {
            this._horseEquipItem.node.removeFromParent();
        }
        this._horseEquipItem = cc.instantiate(this._horseDetailEquipNodePrefab).getComponent(HorseDetailEquipNode);
        this._nodeEquip.addChild(this._horseEquipItem.node);
    }

    updatePageView() {
        this._smovingZB = null;
        // this._initPageView();
        this._updatePageItem();
    }

    onPageViewEvent(pageView, eventType, customEventData) {
        if (eventType == cc.PageView.EventType.PAGE_TURNING && pageView == this._pageView) {
            var targetPos = this._pageView.getCurrentPageIndex() + 1;
            var selectedPos = this._parentView.getSelectedPos();
            if (targetPos != selectedPos) {
                this._parentView.setSelectedPos(targetPos);
                var allHorseIds = this._parentView.getAllHorseIds();
                var curHorseId = allHorseIds[targetPos - 1];
                G_UserData.getHorse().setCurHorseId(curHorseId);
                this._parentView.updateArrowBtn();
                this._updatePageItem();
                this._updateData();
                this._updateView();
                this._initEquipItem();
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
        var baseId = this._unitData.getBase_id();
        var curStar = this._unitData.getStar();
        var nextStar = curStar + 1;
        this._fileNodeName.setName(baseId, curStar);
        var nameStar = nextStar > HorseConst.HORSE_STAR_MAX && curStar || nextStar;
        this._fileNodeName2.setName(baseId, nameStar);
        var heroUnitData = HorseDataHelper.getHeroDataWithHorseId(this._unitData.getId());
        if (heroUnitData == null) {
            this._textFrom.node.active = (false);
        } else {
            this._textFrom.node.active = (true);
            var heroBaseId = heroUnitData.getBase_id();
            var limitLevel = heroUnitData.getLimit_level();
            var limitRedLevel = heroUnitData.getLimit_rtg();
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel, limitRedLevel);
            this._textFrom.string = (Lang.get('horse_detail_from', { name: heroParam.name }));
        }
        this._nodeStar.setCount(this._unitData.getStar(), HorseConst.HORSE_STAR_MAX);
        this._nodeTalentDesPos.removeAllChildren();
        var talentInfo = null;
        if (nextStar <= HorseConst.HORSE_STAR_MAX) {
            var configInfo = HorseDataHelper.getHorseStarConfig(baseId, nextStar);
            var advanceDes = Lang.get('horse_detail_skill_unlock_des', { star: nextStar });
            talentInfo = Lang.get('horse_advance_txt_skill_des', {
                des: configInfo.skill,
                advanceDes: advanceDes
            });
        }
        if (talentInfo) {
            var richText = RichTextExtend.createWithContent(talentInfo);
            richText.node.setAnchorPoint(0.5, 0.5);
            // richText.formatText();
            richText.maxWidth = 500;
            richText.horizontalAlign = cc.macro.TextAlignment.CENTER;
            this._nodeTalentDesPos.addChild(richText.node);
        }
    }

    _updateLevel() {
        var star = this._unitData.getStar();
        var maxStar = this._maxStar;
        this._isLimit = star >= maxStar;
        this._textOldLevel1.string = (star);
        this._textOldLevel2.string = ('/' + maxStar);
        var posX = this._textOldLevel1.node.x;
        var posY = this._textOldLevel1.node.y;
        var size1 = this._textOldLevel1.node.getContentSize();
        this._textOldLevel2.node.setPosition(cc.v2(posX + size1.width, posY));
        var newDes = Lang.get('horse_star_level', {
            star: star + 1,
            maxStar: maxStar
        });
        if (this._isGlobalLimit) {
            newDes = Lang.get('horse_star_max_level');
        }
        this._textNewLevel.string = (newDes);
    }

    _updateAttr() {
        if (!this._canUpdateAttr) {
            return;
        }
        var desInfo = TextHelper.getAttrInfoBySort(this._curAttrData);
        for (var i = 1; i <= 6; i++) {
            var info = desInfo[i - 1];
            if (info) {
                var key = info.id;
                var curValue = this._curAttrData[key];
                var nextValue = this._nextAttrData[key];
                this['_fileNodeAttr' + i].updateInfo(key, curValue, nextValue, 4);
                this['_fileNodeAttr' + i].setVisible(true);
            } else {
                this['_fileNodeAttr' + i].setVisible(false);
            }
        }
    }

    _updateMaterial() {
        this._fileNodeCostTitle.node.active = (!this._isGlobalLimit);
        this._materialIcons = [];
        this._panelMaterial.removeAllChildren();
        if (this._isGlobalLimit) {
            var sp = UIHelper.newSprite(Path.getText('txt_train_breakthroughtop'));
            var size = this._panelMaterial.getContentSize();
            sp.node.setPosition(size.width / 2, size.height / 2);
            this._panelMaterial.addChild(sp.node);
            return;
        }
        this._materialInfo = HorseDataHelper.getHorseUpStarMaterial(this._unitData);
        var len = this._materialInfo.length;
        var MATERIAL_POS = {
            1: [[
                166,
                50
            ]]
        };
        for (let i in this._materialInfo) {
            var info = this._materialInfo[i];
            var node = cc.instantiate(this._commonCostNodePrefab).getComponent(CommonCostNode);
            node.updateView(info, this._unitData.getId());
            var pos = cc.v2(MATERIAL_POS[len][i][1 - 1], MATERIAL_POS[len][i][2 - 1]);
            node.node.setPosition(pos);
            this._panelMaterial.addChild(node.node);
            this._materialIcons.push(node);
        }
    }

    _updateCost() {
        if (this._isGlobalLimit) {
            this._fileNodeSliver.setVisible(false);
            this._buttonUpStar.setEnabled(false);
            return;
        }
        var moneyInfo = HorseDataHelper.getHorseUpStarMoney(this._unitData);
        this._fileNodeSliver.updateUI(moneyInfo.type, moneyInfo.value, moneyInfo.size);
        this._fileNodeSliver.setTextColor(Colors.BRIGHT_BG_TWO);
        this._fileNodeSliver.setVisible(true);
        this._enoughMoney = LogicCheckHelper.enoughMoney(moneyInfo.size)[0];
        this._buttonUpStar.setEnabled(true);
    }

    _setButtonEnable(enable) {
        this._buttonUpStar.setEnabled(enable && !this._isGlobalLimit);
        // this._pageView.node.active = (enable);
        if (this._parentView && this._parentView.setArrowBtnEnable) {
            this._parentView.setArrowBtnEnable(enable);
        }
    }

    _checkMaterial() {
        for (let i in this._materialIcons) {
            var icon = this._materialIcons[i];
            if (!icon.isReachCondition()) {
                var info = this._materialInfo[i];
                var param = TypeConvertHelper.convert(info.type, info.value);
                G_Prompt.showTip(Lang.get('horse_advance_condition_no_enough', { name: param.name }));
                return false;
            }
        }
        return true;
    }

    _checkOtherCondition() {
        if (!this._enoughMoney) {
            G_Prompt.showTip(Lang.get('horse_advance_condition_no_money'));
            return false;
        }
        if (this._unitData.getStar() >= this._maxStar) {
            G_Prompt.showTip(Lang.get('horse_advance_level_limit_tip'));
            return false;
        }
        return true;
    }

    _doAdvance() {
        var horseId = this._unitData.getId();
        G_UserData.getHorse().c2sWarHorseUpgrade(horseId);
        this._setButtonEnable(false);
    }

    _onButtonUpStarClicked() {
        var reach = this._checkMaterial();
        if (reach == false) {
            return;
        }
        if (this._checkOtherCondition() == false) {
            return;
        }
        this._doAdvance();
    }

    _onHorseStarUpSuccess() {
        this._playEffect();
        this._updateData();
        this._updateBaseInfo();
        // this._updateMaterial();
        this._updateCost();
    }

    _playEffect() {
        var count2Index = {
            1: [1],
            2: [
                2,
                3
            ]
        };
        let effectFunction = (effect) => {
            return new cc.Node();
        }
        let eventFunction = (event) => {
            if (event == 'play') {
                for (let i in this._materialInfo) {
                    var info = this._materialInfo[i];
                    var param = TypeConvertHelper.convert(info.type, info.value);
                    var color = param.cfg.color;
                    var sp = UIHelper.newSprite(Path.getBackgroundEffect('img_photosphere' + color));
                    var emitter = new cc.Node().addComponent(cc.ParticleSystem);
                    if (emitter) {
                        emitter.node.setPosition(cc.v2(0, 0));
                        sp.node.addChild(emitter.node);
                        emitter.resetSystem();
                        cc.resources.load('particle/particle_touch', cc.ParticleAsset, (err, res) => {
                            if (res && emitter.node && emitter.node.isValid) {
                                emitter.file = res;
                            }
                        })
                    }
                    var worldPos = this._materialIcons[i].node.convertToWorldSpaceAR(cc.v2(0, 0));
                    var pos = this.node.convertToNodeSpaceAR(worldPos);
                    sp.node.setPosition(pos);
                    this.node.addChild(sp.node);
                    var index = count2Index[this._materialInfo.length][i];
                    let finishCallback = () => {
                        sp.node.runAction(cc.destroySelf());
                    }
                    G_EffectGfxMgr.applySingleGfx(sp.node, 'smoving_shenbingjinjie_lizi' + index, finishCallback, null, null);
                }
                if (this._smovingZB && this._parentView.getRangeType() != HorseConst.HORSE_RANGE_TYPE_1) {
                    this._smovingZB.reset();
                }
                var selectedPos = this._parentView.getSelectedPos();
                var avatar = this._pageItems[selectedPos - 1].avatar;
                this._smovingZB = G_EffectGfxMgr.applySingleGfx(avatar.node, 'smoving_shenbingjinjie_zhuangbei', null, null, null);
                this._updateMaterial();
            } else if (event == 'next') {
                this._setButtonEnable(true);
            } else if (event == 'finish') {
                this._playPrompt();
                var selectedPos = this._parentView.getSelectedPos();
                this._pageItems[selectedPos - 1].avatar.resetAnimation();
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_shenbingjinjie', effectFunction.bind(this), eventFunction.bind(this), false);
        var offsetX = UIConst.EFFECT_OFFSET_X;
        // effect.node.setPosition(G_ResolutionManager.getDesignWidth() * 0.5 + offsetX, G_ResolutionManager.getDesignHeight() * 0.5);
        effect.node.setPosition(offsetX, 0);
        G_AudioManager.playSoundWithId(AudioConst.SOUND_INSTRUMENT_ADVANCE);
    }

    _playPrompt() {
        var summary = [];
        var param = {
            content: Lang.get('summary_horse_upstar_success'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN }
        };
        summary.push(param);
        var content1 = Lang.get('summary_horse_upstar_level', { value: 1 });
        var param1 = {
            content: content1,
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN },
            dstPosition: this._convertToWorldSpace(this._textOldLevel1.node),
            finishCallback: () => {
                if (this._textOldLevel1 && this._updateLevel) {
                    this._textOldLevel1.string = (this._unitData.getStar());
                    this._updateLevel();
                }
                if (this._onPromptFinish) {
                    this._onPromptFinish();
                }
            }
        };
        summary.push(param1);
        this._executeSummaryPrompt(summary);
    }

    _addBaseAttrPromptSummary(summary: any[], difAttr) {
        let attr = this._recordAttr.getAttr();
        let desInfo = TextHelper.getAttrInfoBySort(attr);
        for (let i in desInfo) {
            let info = desInfo[i];
            let index = parseInt(i) + 1;
            let attrId = info.id;
            let diffValue = null;
            if (difAttr) {
                diffValue = difAttr[attrId];
            } else {
                diffValue = this._recordAttr.getDiffValue(attrId);
            }
            if (diffValue != 0) {
                let param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TRAIN + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: this['_fileNodeAttr' + index] && UIHelper.convertSpaceFromNodeToNode(this['_fileNodeAttr' + index].node, this.node) || null,
                    finishCallback: () => {
                        if (this['_fileNodeAttr' + index]) {
                            let [_, curValue] = TextHelper.getAttrBasicText(attrId, this._curAttrData[attrId]);
                            this['_fileNodeAttr' + index].node.getChildByName('TextCurValue').getComponent(cc.Label).string = (curValue);
                            this['_fileNodeAttr' + index].updateInfo(attrId, this._curAttrData[attrId], this._nextAttrData[attrId], 4);
                        }
                    }
                };
                summary.push(param);
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

    _horseEquipAddSuccess(event, equipPos) {
        this._horseEquipItem.updateHorseEquip(equipPos);
        this._updateData();
        if (!this._unitData.isInBattle()) {
            this._updateAttr();
            return;
        }
        var summary = [];
        this._executeSummaryPrompt(summary);
    }

    updateHorseEquipDifPrompt() {
        if (!this._unitData.isInBattle()) {
            return;
        }
        this._canUpdateAttr = false;
        this._updateData();
        this._makeAttrDif();
        var actions = [];
        actions[0] = cc.delayTime(0.2);
        actions[1] = cc.callFunc(() => {
            this._canUpdateAttr = true;
            var summary = [];
            this._executeSummaryPrompt(summary, this._difAttr);
        });
        this.node.runAction(cc.sequence(actions));
    }

    _executeSummaryPrompt(summary, difAttr?) {
        this._addBaseAttrPromptSummary(summary, difAttr);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TRAIN);
    }

    _saveLastAttr() {
        this._lastAttr = clone(this._recordAttr.getAttr());
    }

    _makeAttrDif() {
        this._difAttr = {};
        var curAttr = this._recordAttr.getAttr();
        for (let k in this._lastAttr) {
            var v = this._lastAttr[k];
            var curValue = curAttr[k];
            var dif = curValue - v;
            this._difAttr[k] = dif;
        }
    }
}