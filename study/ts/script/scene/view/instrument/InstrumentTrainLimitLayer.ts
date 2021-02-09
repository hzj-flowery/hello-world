const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import InstrumentConst from '../../../const/InstrumentConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import EffectHelper from '../../../effect/EffectHelper';
import { G_AudioManager, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonInstrumentAvatar from '../../../ui/component/CommonInstrumentAvatar';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import PopupBase from '../../../ui/PopupBase';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { InstrumentDataHelper } from '../../../utils/data/InstrumentDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { table } from '../../../utils/table';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import InstrumentLimitCostNode from './InstrumentLimitCostNode';
import InstrumentLimitCostPanel from './InstrumentLimitCostPanel';
import PopupInstrumentLimitDetail from './PopupInstrumentLimitDetail';
import { Path } from '../../../utils/Path';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';





var ZORDER_COMMON = 0;
var ZORDER_MID = 1;
var ZORDER_MOVE = 2;

@ccclass
export default class InstrumentTrainLimitLayer extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgBg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _buttonHelp: CommonHelpBig = null;

    @property({
        type: InstrumentLimitCostNode,
        visible: true
    })
    _costNode1: InstrumentLimitCostNode = null;

    @property({
        type: InstrumentLimitCostNode,
        visible: true
    })
    _costNode2: InstrumentLimitCostNode = null;

    @property({
        type: CommonInstrumentAvatar,
        visible: true
    })
    _nodeInstrument: CommonInstrumentAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNameMaxLevel: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBgMoving: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePopup: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonBreak: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _nodeSilver: CommonResourceInfo = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonDetail: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHetiMoving: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFire: cc.Node = null;

    @property(cc.Prefab)
    InstrumentLimitCostPanel: cc.Prefab = null;

    @property(cc.Prefab)
    InstrumentLimitCostNode: cc.Prefab = null;

    _parentView: any;
    _signalInstrumentLimitLvPutRes: any;
    _signalInstrumentLimit: any;
    _costMaterials: any[];
    _materialMaxSize: { [x: number]: number; };
    _silverCost: number;
    _materialFakeCount: number;
    _materialFakeCostCount: number;
    _materialFakeCurSize: number;
    _recordAttr: any;
    _popupPanel: InstrumentLimitCostPanel;
    _instrumentUnitData: any;
    _popupPanelSignal: any;


    ctor(parentView) {
        this._parentView = parentView;
        UIHelper.addEventListener(this.node, this._buttonBreak._button, 'InstrumentTrainLimitLayer', '_onButtonBreak');
        UIHelper.addEventListener(this.node, this._buttonDetail, 'InstrumentTrainLimitLayer', '_onButtonDetail');
    }
    onCreate() {
        this.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelDesign.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._initData();
        this._initView();
    }
    onEnter() {
        this._signalInstrumentLimitLvPutRes = G_SignalManager.add(SignalConst.EVENT_INSTRUMENT_LIMIT_LV_PUT_RES, handler(this, this._onInstrumentLimitLvPutRes));
        this._signalInstrumentLimit = G_SignalManager.add(SignalConst.EVENT_INSTRUMENT_LIMIT_SUCCESS, handler(this, this._onInstrumentLimitSuccess));
        this._updateData();
        this._updateView();
    }
    onExit() {
        this._signalInstrumentLimitLvPutRes.remove();
        this._signalInstrumentLimitLvPutRes = null;
        this._signalInstrumentLimit.remove();
        this._signalInstrumentLimit = null;
    }
    updateInfo() {
        this._parentView.setArrowBtnVisible(false);
        this._updateData();
        this._updateView();
        this._playFire(true);
    }
    _initData() {
        this._costMaterials = [];
        this._materialMaxSize = {
            [InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1]: 0,
            [InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2]: 0
        };
        this._silverCost = 0;
        this._materialFakeCount = 0;
        this._materialFakeCostCount = 0;
        this._materialFakeCurSize = 0;
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2);
    }
    _initView() {
        this._popupPanel = null;
        this._buttonHelp.updateUI(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2);
        this._buttonBreak.setString(Lang.get('instrument_limit_break_btn'));
        this._nodeInstrument.node.zIndex = (ZORDER_MID);
        this._nodeInstrument.showShadow(false);
        for (var key = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1; key <= InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2; key++) {
            // this['_cost' + key] = cc.instantiate(this.InstrumentLimitCostNode).getComponent(InstrumentLimitCostNode);
            // this['_cost' + key].ctor(this['_costNode' + key], key, handler(this, this._onClickCostAdd));
            this['_costNode' + key].ctor(key, handler(this, this._onClickCostAdd));
        }
        this._nodeSilver.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD);
        this._nodeSilver.setTextColorToDTypeColor();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeBgMoving, 'moving_tujie_huohua', null, null, false);
    }
    _updateData() {
        var instrumentId = G_UserData.getInstrument().getCurInstrumentId();
        this._instrumentUnitData = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
        var limitLevel = this._instrumentUnitData.getLimit_level();
        var templateId = this._instrumentUnitData.getLimitTemplateId();
        var info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel);
        for (var i = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1; i <= InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2; i++) {
            this._materialMaxSize[i] = info['size_' + i];
        }
        this._silverCost = info.cost_silver;
        var curAttrData = InstrumentDataHelper.getInstrumentAttrInfo(this._instrumentUnitData);
        this._recordAttr.updateData(curAttrData);
        G_UserData.getAttr().recordPower();
    }
    _updateView() {
        this._updateBaseInfo();
        this._updateAllCost();
        this._updateBtnAndSilverState();
    }
    _updateBaseInfo() {
        var name = this._instrumentUnitData.getConfig().name;
        var baseId = this._instrumentUnitData.getBase_id();
        var limitLevel = this._instrumentUnitData.getLimit_level();
        var nameStr = Lang.get('instrument_limit_name', { name: name });
        var templateId = this._instrumentUnitData.getLimitTemplateId();
        var rankConfig = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel);
        var opened = this._instrumentUnitData.getLimitFuncOpened();
        this._textName.string = (nameStr);

        if (limitLevel >= this._instrumentUnitData.getMaxLimitLevel() || !opened) {
            this._imageTitle.node.active = (false);
            this._textNameMaxLevel.node.active = (true);
            this._textNameMaxLevel.string = (name);
            var instrumentParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, null, null, limitLevel);
            this._textNameMaxLevel.node.color = (instrumentParam.icon_color);
            UIHelper.updateTextOutline(this._textNameMaxLevel, instrumentParam);
            if (rankConfig.cost_size == 6 || rankConfig.cost_size == 7) {
                UIHelper.loadTexture(this._imgBg, Path.getLimitImgBg('img_bg_limit02'));
                UIHelper.loadTexture(this._imageTitle, Path.getTextLimit('txt_limit_06g'));
            } else {
                UIHelper.loadTexture(this._imgBg, Path.getLimitImgBg('img_limit_bg01'));
                UIHelper.loadTexture(this._imageTitle, Path.getTextLimit('txt_limit_06b'));
            }
        } else {
            this._imageTitle.node.active = (true);
            this._textNameMaxLevel.node.active = (false);
            var maxLevel = rankConfig.level_max;
            this._textLevel.string = (maxLevel);
            for (var key = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1; key != InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2; key++) {
                this['_costNode' + key].setStyle(rankConfig.cost_size);
            }
            var instrumentParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, null, null, limitLevel + 1);
            this._textName.node.color = (instrumentParam.icon_color);
            UIHelper.updateTextOutline(this._textName, instrumentParam);
            if (rankConfig.cost_size == 6 || rankConfig.cost_size == 7) {
                UIHelper.loadTexture(this._imgBg, Path.getLimitImgBg('img_bg_limit02'));
                UIHelper.loadTexture(this._imageTitle, Path.getTextLimit('txt_limit_06g'));
            } else {
                UIHelper.loadTexture(this._imgBg, Path.getLimitImgBg('img_limit_bg01'));
                UIHelper.loadTexture(this._imageTitle, Path.getTextLimit('txt_limit_06b'));
            }
        }
        this._updateInstrumentIcon();
    }

    _updateInstrumentIcon() {
        var baseId = this._instrumentUnitData.getBase_id();
        var limitLevel = this._instrumentUnitData.getLimit_level();
        var myLevel = G_UserData.getBase().getLevel();
        var templateId = this._instrumentUnitData.getLimitTemplateId();
        if (templateId == InstrumentConst.LIMIT_TEMPLATE_ORANGE) {
            var [_, _, functionLevel1] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2);
            var [_, _, functionLevel2] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2_RED);
            var showLevel1 = functionLevel1.show_level;
            var showLevel2 = functionLevel2.show_level;
            if (myLevel >= showLevel1 && myLevel < showLevel2) {
                this._nodeInstrument.updateUI(baseId, InstrumentConst.LIMIT_ICON_ORANGE_LEVEL_1);
            } else if (myLevel >= showLevel2) {
                if (limitLevel > 0) {
                    this._nodeInstrument.updateUI(baseId, InstrumentConst.LIMIT_ICON_ORANGE_LEVEL_2);
                } else {
                    this._nodeInstrument.updateUI(baseId, InstrumentConst.LIMIT_ICON_ORANGE_LEVEL_1);
                }
            }
        } else {
            this._nodeInstrument.updateUI(baseId, InstrumentConst.LIMIT_ICON_RED_LEVEL_1);
        }
    }

    _updateAllCost() {
        for (var key = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1; key <= InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2; key++) {
            this._updateSingeCost(key);
        }
        this._updateSilverCost();
    }
    _updateSingeCost(costKey) {
        var templateId = this._instrumentUnitData.getLimitTemplateId();
        var limitLevel = this._instrumentUnitData.getLimit_level();
        var curCount = this._instrumentUnitData.getLimitCostCountWithKey(costKey);
        this['_costNode' + costKey].updateUI(templateId, limitLevel, curCount, this._instrumentUnitData);
        var [isShow] = InstrumentDataHelper.isPromptInstrumentLimitWithCostKey(this._instrumentUnitData, costKey);
        this['_costNode' + costKey].showRedPoint(isShow);
        (this['_costNode' + costKey].node as cc.Node).zIndex = (ZORDER_COMMON);
    }
    _updateSilverCost() {
        var strSilver = TextHelper.getAmountText1(this._silverCost);
        this._nodeSilver.setCount(strSilver, null, true);
    }
    _updateBtnAndSilverState() {
        if (this._instrumentUnitData.getLimit_level() >= this._instrumentUnitData.getMaxLimitLevel()) {
            this._buttonBreak.setVisible(false);
            this._nodeSilver.setVisible(false);
            return;
        }
        var isAllFull = true;
        for (var key = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1; key <= InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2; key++) {
            var isFull = this._checkIsMaterialFull(key);
            isAllFull = isAllFull && isFull;
        }
        var limitLevel = this._instrumentUnitData.getLimit_level();
        var templateId = this._instrumentUnitData.getLimitTemplateId();
        var info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel);
        var isEnough = false;
        var haveCoin = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, 2);
        isEnough = haveCoin >= info.cost_silver;
        if (isEnough) {
            this._nodeSilver.setTextColorToDTypeColor();
        } else {
            this._nodeSilver.setCountColorRed(true);
        }
        this._buttonBreak.showRedPoint(isAllFull && isEnough);
        this._buttonBreak.setVisible(isAllFull);
        this._nodeSilver.setVisible(isAllFull);
    }
    _playFire(isPlay) {
        this._nodeFire.removeAllChildren();
        var effectName = isPlay && 'effect_tujietiaozi_1' || 'effect_tujietiaozi_2';
        var isLevelMax = this._instrumentUnitData.getLevel() >= this._instrumentUnitData.getAdvanceMaxLevel();
        var limitLevel = this._instrumentUnitData.getLimit_level();
        if (limitLevel == this._instrumentUnitData.getMaxLimitLevel() || !this._instrumentUnitData.getLimitFuncOpened()) {   //--进阶等级满了，功能还没开放
            G_EffectGfxMgr.createPlayGfx(this._nodeFire, effectName);
        }
    }
    _onClickCostAdd(costKey) {
        var open = false;
        var comment = null;
        open = this._instrumentUnitData.getLimitFuncRealOpened(), comment = null;
        if (!open) {
            G_Prompt.showTip(comment);
            return false;
        }
        var [isReach, needLevel] = this._checkRankLevel();
        if (isReach == false) {
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, this._instrumentUnitData.getBase_id());
            var name = param.name;
            var level = needLevel;
            G_Prompt.showTip(Lang.get('instrument_limit_level_condition', {
                name: name,
                level: level
            }));
            return;
        }
        var limitLevel = this._instrumentUnitData.getLimit_level();
        var templateId = this._instrumentUnitData.getLimitTemplateId();
        this._openPopupPanel(costKey, limitLevel, templateId);
    }
    _openPopupPanel(costKey, limitLevel, templateId) {
        if (this._popupPanel != null) {
            return;
        }
        this._popupPanel = cc.instantiate(this.InstrumentLimitCostPanel).getComponent(InstrumentLimitCostPanel);
        this._popupPanel.ctor(costKey, handler(this, this._onClickCostPanelItem), handler(this, this._onClickCostPanelStep), handler(this, this._onClickCostPanelStart), handler(this, this._onClickCostPanelStop), templateId, limitLevel, this['_costNode' + costKey]);
        this._popupPanelSignal = this._popupPanel.signal.add(handler(this, this._onPopupPanelClose));
        this._nodePopup.addChild(this._popupPanel.node);
        this._popupPanel.updateUI();
    }
    _onPopupPanelClose(event) {
        if (event == 'close') {
            this._popupPanel = null;
            if (this._popupPanelSignal) {
                this._popupPanelSignal.remove();
                this._popupPanelSignal = null;
            }
        }
    }
    _onClickCostPanelItem(costKey, materials) {
        if (this._checkIsMaterialFull(costKey) == true) {
            return;
        }
        this._doPutRes(costKey, materials);
    }
    _onClickCostPanelStep(costKey, itemId, itemValue, costCountEveryTime) {
        if (this._materialFakeCount <= 0) {
            return false;
        }
        if (this._materialFakeCurSize >= this._materialMaxSize[costKey]) {
            G_Prompt.showTip(Lang.get('instrument_limit_material_full'));
            return [
                false,
                null,
                true
            ];
        }
        var realCostCount = Math.min(this._materialFakeCount, costCountEveryTime);
        this._materialFakeCount = this._materialFakeCount - realCostCount;
        this._materialFakeCostCount = this._materialFakeCostCount + realCostCount;
        var costSizeEveryTime = realCostCount;
        this._materialFakeCurSize = this._materialFakeCurSize + costSizeEveryTime;
        if (this._popupPanel) {
            var emitter = this._createEmitter(costKey);
            var startNode = this._popupPanel.findNodeWithItemId(itemId);
            var endNode = this['_costNode' + costKey].node;
            this._playEmitterEffect(emitter, startNode.node, endNode, costKey, this._materialFakeCurSize);
            startNode.setCount(this._materialFakeCount);
        }
        return [
            true,
            realCostCount
        ];
    }
    _onClickCostPanelStart(costKey, itemId, count) {
        this._materialFakeCount = count;
        this._materialFakeCostCount = 0;
        this._materialFakeCurSize = this._instrumentUnitData.getLimitCostCountWithKey(costKey);
    }
    _onClickCostPanelStop() {
    }
    _onButtonDetail() {
        var data = this._instrumentUnitData;
        PopupBase.loadCommonPrefab('PopupInstrumentLimitDetail', (popup: PopupInstrumentLimitDetail) => {
            popup.ctor(data);
            popup.openWithAction();
        });
    }
    _onButtonBreak() {
        var [isOk, func] = LogicCheckHelper.enoughMoney(this._silverCost);
        if (isOk == false) {
            func();
            return;
        }
        this._doLvUp();
    }
    _checkRankLevel() {
        var templateId = this._instrumentUnitData.getLimitTemplateId();
        var curLevel = this._instrumentUnitData.getLevel();
        var limitLevel = this._instrumentUnitData.getLimit_level();
        var [isReach, needLevel] = InstrumentDataHelper.isReachInstrumentLimitRank(templateId, limitLevel, curLevel);
        return [
            isReach,
            needLevel
        ];
    }
    _checkIsMaterialFull(costKey) {
        var curSize = this._instrumentUnitData.getLimitCostCountWithKey(costKey);
        var maxSize = this._materialMaxSize[costKey];
        if (curSize >= maxSize) {
            return true;
        } else {
            return false;
        }
    }
    _doPutRes(costKey, materials) {
        var instrumentId = this._instrumentUnitData.getId();
        var pos = costKey;
        var subItems = materials;
        G_UserData.getInstrument().c2sInstrumentLimitLvPutRes(instrumentId, pos, subItems);
        this._costMaterials = materials;
    }
    _doLvUp() {
        var instrumentId = this._instrumentUnitData.getId();
        G_UserData.getInstrument().c2sInstrumentUpLimitLevel(instrumentId);
    }
    _onInstrumentLimitLvPutRes(eventName, costKey) {
        this._updateData();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(2);
        }
        if (this._popupPanel == null) {
            this._updateSingeCost(costKey);
            this._updateBtnAndSilverState();
            return;
        }
        if (this._materialFakeCostCount && this._materialFakeCostCount > 0) {
            this._materialFakeCostCount = null;
            this._updateSingeCost(costKey);
        } else {
            var curCount = this._instrumentUnitData.getLimitCostCountWithKey(costKey);
            for (let i in this._costMaterials) {
                var material = this._costMaterials[i];
                var itemId = material.id;
                var emitter = this._createEmitter(costKey);
                var startNode = this._popupPanel.findNodeWithItemId(itemId);
                var endNode = this['_costNode' + costKey].node;
                this._playEmitterEffect(emitter, startNode.node, endNode, costKey, curCount);
            }
        }
        this._updateBtnAndSilverState();
        if (this._checkIsMaterialFull(costKey) == true) {
            this._popupPanel.close();
        }
    }
    _onInstrumentLimitSuccess() {
        this._updateData();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_TUPO);
        this._playLvUpEffect();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(2);
        }
    }
    _createEmitter(costKey) {
        var names = {
            [InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1]: 'tujiepurple',
            [InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2]: 'tujieorange'
        };

        // 创建一个节点
        var emitter = new cc.Node();
        var particleSystem = emitter.addComponent(cc.ParticleSystem);
        if (emitter) {
            EffectHelper.loadEffectRes('particle/' + (names[costKey]), cc.ParticleAsset, function (res) {
                if (res) {
                    particleSystem.file = res;
                    particleSystem.resetSystem();
                }
            }.bind(this))
        }
        return emitter;
    }
    _playEmitterEffect(emitter, startNode, endNode, costKey, curCount) {
        function getRandomPos(startPos, endPos) {
            var pos11 = cc.v2(startPos.x + (endPos.x - startPos.x) * 1 / 2, startPos.y + (endPos.y - startPos.y) * 3 / 4);
            var pos12 = cc.v2(startPos.x + (endPos.x - startPos.x) * 1 / 4, startPos.y + (endPos.y - startPos.y) * 1 / 2);
            var pos21 = cc.v2(startPos.x + (endPos.x - startPos.x) * 3 / 4, startPos.y + (endPos.y - startPos.y) * 1 / 2);
            var pos22 = cc.v2(startPos.x + (endPos.x - startPos.x) * 1 / 2, startPos.y + (endPos.y - startPos.y) * 1 / 4);
            var tbPos = {
                1: [
                    pos11,
                    pos12
                ],
                2: [
                    pos21,
                    pos22
                ]
            };
            var index = Util.getRandomInt(1, 2);
            return [
                tbPos[index][0],
                tbPos[index][1]
            ];
        }
        var startPos = UIHelper.convertSpaceFromNodeToNode(startNode, this.node);
        emitter.setPosition(startPos);
        this.node.addChild(emitter);
        var endPos = UIHelper.convertSpaceFromNodeToNode(endNode, this.node);
        var [pointPos1, pointPos2] = getRandomPos(startPos, endPos);
        var bezier = [
            pointPos1,
            pointPos2,
            endPos
        ];
        var action1 = cc.bezierTo(0.7, bezier);
        action1.easing(cc.easeSineIn());
        //var action2 = cc.easeSineIn();
        var templateId = this._instrumentUnitData.getLimitTemplateId();
        var limitLevel = this._instrumentUnitData.getLimit_level();
        var costNode = this['_costNode' + costKey];
        emitter.runAction(cc.sequence(action1, cc.callFunc(function () {
            costNode.playRippleMoveEffect(templateId, limitLevel, curCount);
        }, this), cc.destroySelf()));
    }
    _playLvUpEffect() {
        function effectFunction(effect) {
            return new cc.Node;
        }
        let eventFunction = function (event) {
            if (event == 'faguang') {
            } else if (event == 'finish') {
                this._updateView();
                this._playFire(true);
                var delay = cc.delayTime(0.5);
                var sequence = cc.sequence(delay, cc.callFunc(function () {
                    this._playPrompt();
                }, this));
                this.node.runAction(sequence);
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeHetiMoving, 'moving_tujieheti', effectFunction, eventFunction, true);
        for (var key = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1; key <= InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2; key++) {
            (this['_costNode' + key].node as cc.Node).zIndex = (ZORDER_MOVE);
            this['_costNode' + key].playSMoving();
        }
    }
    _playPrompt() {
        var summary = [];
        var content = Lang.get('summary_instrument_limit_break_success');
        var param = { content: content };
        table.insert(summary, param);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary();
    }
    _addBaseAttrPromptSummary(summary) {
        var attr = this._recordAttr.getAttr();
        var desInfo = TextHelper.getAttrInfoBySort(attr);
        for (let i in desInfo) {
            var info = desInfo[i];
            var attrId = info.id;
            var diffValue = this._recordAttr.getDiffValue(attrId);
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_ATTR }
                };
                table.insert(summary, param);
            }
        }
        return summary;
    }

}
