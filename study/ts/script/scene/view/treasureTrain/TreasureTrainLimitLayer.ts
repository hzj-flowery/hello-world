const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import TreasureConst from '../../../const/TreasureConst';
import UIConst from '../../../const/UIConst';
import { AttrRecordUnitData } from '../../../data/AttrRecordUnitData';
import EffectHelper from '../../../effect/EffectHelper';
import { G_AudioManager, G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData, Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import CommonTreasureAvatar from '../../../ui/component/CommonTreasureAvatar';
import PopupBase from '../../../ui/PopupBase';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { TreasureDataHelper } from '../../../utils/data/TreasureDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { table } from '../../../utils/table';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import PopupTreasureLimitDetail from '../treasure/PopupTreasureLimitDetail';
import TreasureLimitCostNode from '../treasure/TreasureLimitCostNode';
import TreasureLimitCostPanel from '../treasure/TreasureLimitCostPanel';
import { TreasureTrainHelper } from './TreasureTrainHelper';
import { Path } from '../../../utils/Path';
import { TreasureUnitData } from '../../../data/TreasureUnitData';




var ZORDER_COMMON = 0;
var ZORDER_MID = 1;
var ZORDER_MOVE = 2;

@ccclass
export default class TreasureTrainLimitLayer extends ViewBase {

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
        type: TreasureLimitCostNode,
        visible: true
    })
    _costNode1: TreasureLimitCostNode = null;

    @property({
        type: TreasureLimitCostNode,
        visible: true
    })
    _costNode2: TreasureLimitCostNode = null;

    @property({
        type: TreasureLimitCostNode,
        visible: true
    })
    _costNode3: TreasureLimitCostNode = null;

    @property({
        type: TreasureLimitCostNode,
        visible: true
    })
    _costNode4: TreasureLimitCostNode = null;

    @property({
        type: CommonTreasureAvatar,
        visible: true
    })
    _nodeTreasure: CommonTreasureAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNameTop: cc.Label = null;

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
    _textLevel1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel2: cc.Label = null;

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
    costPanel: cc.Prefab = null;

    _parentView: any;
    _signalTreasureLimitLvPutRes: any;
    _signalTreasureLimitSuccess: any;
    _costMaterials: any;
    _materialMaxSize: { [x: number]: number; };
    _silverCost: number;
    _materialFakeCount: any;
    _materialFakeCostCount: any;
    _materialFakeCurSize: number;
    _recordAttr: AttrRecordUnitData;
    _popupPanel: TreasureLimitCostPanel;
    _treasureUnitData: TreasureUnitData;
    _popupPanelSignal: any;
    private _imgBg: cc.Sprite;

    ctor(parentView) {
        this._parentView = parentView;
        UIHelper.addEventListener(this.node, this._buttonBreak._button, 'TreasureTrainLimitLayer', '_onButtonBreak');
        UIHelper.addEventListener(this.node, this._buttonDetail, 'TreasureTrainLimitLayer', '_onButtonDetail');
    }
    onCreate() {
        this._initData();
        this._initView();
    }
    onEnter() {
        this._signalTreasureLimitLvPutRes = G_SignalManager.add(SignalConst.EVENT_TREASURE_LIMIT_LV_PUT_RES, handler(this, this._onTreasureLimitLvPutRes));
        this._signalTreasureLimitSuccess = G_SignalManager.add(SignalConst.EVENT_TREASURE_LIMIT_SUCCESS, handler(this, this._onTreasureLimitSuccess));
        this._updateData();
        this._updateView();
    }
    onExit() {
        this._signalTreasureLimitLvPutRes.remove();
        this._signalTreasureLimitLvPutRes = null;
        this._signalTreasureLimitSuccess.remove();
        this._signalTreasureLimitSuccess = null;
    }
    updateInfo() {
        this._parentView.setArrowBtnVisible(false);
        this._updateData();
        this._updateView();
        this._playFire(true);
    }
    _initData() {
        this._costMaterials = {};
        this._materialMaxSize = {
            [TreasureConst.TREASURE_LIMIT_COST_KEY_1]: 0,
            [TreasureConst.TREASURE_LIMIT_COST_KEY_2]: 0,
            [TreasureConst.TREASURE_LIMIT_COST_KEY_3]: 0,
            [TreasureConst.TREASURE_LIMIT_COST_KEY_4]: 0
        };
        this._silverCost = 0;
        this._materialFakeCount = null;
        this._materialFakeCostCount = null;
        this._materialFakeCurSize = 0;
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4);
    }
    _initView() {
        this._popupPanel = null;
        this._imgBg = UIHelper.seekNodeByName(this.node, 'Image_181').getComponent(cc.Sprite);
        this._buttonHelp.updateUI(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4);
        this._buttonBreak.setString(Lang.get('treasure_limit_break_btn'));
        this._nodeTreasure.node.zIndex = (ZORDER_MID);
        this._nodeTreasure.showShadow(false);
        for (var key = TreasureConst.TREASURE_LIMIT_COST_KEY_1; key <= TreasureConst.TREASURE_LIMIT_COST_KEY_4; key++) {
            (this['_costNode' + key] as TreasureLimitCostNode).ctor(key, handler(this, this._onClickCostAdd));
        }
        this._nodeSilver.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD);
        this._nodeSilver.setTextColorToDTypeColor();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeBgMoving, 'moving_tujie_huohua', null, null, false);
    }
    _updateData() {
        var treasureId = G_UserData.getTreasure().getCurTreasureId();
        this._treasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
        var limitLevel = this._treasureUnitData.getLimit_cost();
        var info = TreasureDataHelper.getLimitCostConfig(limitLevel);
        for (var i = TreasureConst.TREASURE_LIMIT_COST_KEY_1; i <= TreasureConst.TREASURE_LIMIT_COST_KEY_4; i++) {
            if (i == TreasureConst.TREASURE_LIMIT_COST_KEY_1) {
                this._materialMaxSize[i] = info.exp;
            } else {
                this._materialMaxSize[i] = info['size_' + i];
            }
        }
        this._silverCost = info.break_size;
        var curAttrData = TreasureDataHelper.getTreasureAttrInfo(this._treasureUnitData);
        this._recordAttr.updateData(curAttrData);
        G_UserData.getAttr().recordPower();
    }
    _updateView() {
        this._updateBaseInfo();
        this._updateAllCost();
        this._updateBtnAndSilverState();
    }
    _updateBaseInfo() {
        var limitUpId = this._treasureUnitData.getConfig().limit_up_id;
        var name = this._treasureUnitData.getConfig().name;
        var color = this._treasureUnitData.getConfig().color;
        var showNext = limitUpId > 0 && !this._treasureUnitData.isLimitShowTop();
        if (showNext) {
            name = TreasureDataHelper.getTreasureConfig(limitUpId).name;
            color = TreasureDataHelper.getTreasureConfig(limitUpId).color;
        }
        var baseId = this._treasureUnitData.getBase_id();
        var limitLevel = this._treasureUnitData.getLimit_cost();
        var nameStr = Lang.get('treasure_limit_name', { name: name });
        var changeBg = limitLevel == TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL || limitLevel == TreasureConst.TREASURE_LIMIT_RED_LEVEL && !this._treasureUnitData.isLimitShowTop();
        var bgres, imgres;
        if (changeBg) {
            bgres = Path.getLimitImgBg('img_bg_limit02');
            imgres = Path.getTextLimit('txt_limit_06h');
        } else {
            bgres = Path.getLimitImgBg('img_limit_bg01');
            imgres = Path.getTextLimit('txt_limit_06c');
        }
        if (bgres) {
            UIHelper.loadTexture(this._imgBg, bgres);
        }
        if (imgres) {
            UIHelper.loadTexture(this._imageTitle, imgres);
        }
        var showTop = limitLevel == TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL || limitLevel == TreasureConst.TREASURE_LIMIT_RED_LEVEL && this._treasureUnitData.isLimitShowTop();
        this._textNameTop.node.active = (showTop);
        var txtColor = Colors.getColor(color);
        var txtColorOutline = Colors.getColorOutline(color);
        this._textName.string = (nameStr);
        this._textName.node.color = (txtColor);
        this._textNameTop.string = (nameStr);
        this._textNameTop.node.color = (txtColor);
        if (color == 7) {
            UIHelper.enableOutline(this._textName, txtColorOutline, 2);
            UIHelper.enableOutline(this._textNameTop, txtColorOutline, 2);
        } else {
            UIHelper.disableOutline(this._textName);
            UIHelper.disableOutline(this._textNameTop);
        }
        this._textLevel1.string = (this._treasureUnitData.getAddStrLevelByNextLimit()).toString();
        this._textLevel2.string = (this._treasureUnitData.getAddRefineLevelByNextLimit()).toString();
        if (showNext) {
            this._nodeTreasure.updateUI(limitUpId);
        } else {
            this._nodeTreasure.updateUI(baseId);
        }
        if (this._treasureUnitData.isLimitShowTop()) {
            this._imageTitle.node.active = (false);
        } else {
            this._imageTitle.node.active = (true);
        }
    }
    _updateAllCost() {
        for (var key = TreasureConst.TREASURE_LIMIT_COST_KEY_1; key <= TreasureConst.TREASURE_LIMIT_COST_KEY_4; key++) {
            this._updateSingeCost(key);
        }
        this._updateSilverCost();
    }
    _updateSingeCost(costKey) {
        var limitLevel = this._treasureUnitData.getLimit_cost();
        var curCount = this._treasureUnitData.getLimitCostCountWithKey(costKey);
        this['_costNode' + costKey].updateUI(limitLevel, curCount, this._treasureUnitData.isLimitShowTop());
        var isShowAll = TreasureDataHelper.isPromptTreasureLimit(this._treasureUnitData);
        var isShow = isShowAll && TreasureDataHelper.isPromptTreasureLimitWithCostKey(this._treasureUnitData, costKey);
        this['_costNode' + costKey].showRedPoint(isShow);
        this['_costNode' + costKey].node.zIndex = (ZORDER_COMMON);
    }
    _updateSilverCost() {
        var strSilver = TextHelper.getAmountText1(this._silverCost);
        this._nodeSilver.setCount(strSilver, null, true);
    }
    _updateBtnAndSilverState() {
        if (this._treasureUnitData.getLimit_cost() >= TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL) {
            this._buttonBreak.setVisible(false);
            this._nodeSilver.setVisible(false);
            return;
        }
        var isAllFull = true;
        for (var key = TreasureConst.TREASURE_LIMIT_COST_KEY_1; key <= TreasureConst.TREASURE_LIMIT_COST_KEY_4; key++) {
            var isFull = this._checkIsMaterialFull(key);
            isAllFull = isAllFull && isFull;
        }
        this._buttonBreak.setVisible(isAllFull);
        this._nodeSilver.setVisible(isAllFull);
    }
    _playFire(isPlay) {
        this._nodeFire.removeAllChildren();
        var effectName = isPlay && 'effect_tujietiaozi_1' || 'effect_tujietiaozi_2';
        var limitLevel = this._treasureUnitData.getLimit_cost();
        if (limitLevel == TreasureConst.TREASURE_LIMIT_RED_LEVEL && this._treasureUnitData.isLimitShowTop()) {
            G_EffectGfxMgr.createPlayGfx(this._nodeFire, effectName);
        }
    }
    _onClickCostAdd(costKey) {
        if (TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4) == false) {
            return;
        }
        var [isReach, needLevel] = this._checkRankLevel();
        if (isReach == false) {
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, this._treasureUnitData.getBase_id());
            var name = param.name;
            var level = needLevel;
            G_Prompt.showTip(Lang.get('treasure_limit_level_condition', {
                name: name,
                level: level
            }));
            return;
        }
        var limitLevel = this._treasureUnitData.getLimit_cost();
        var lv = TreasureDataHelper.getLimitOpenLv(limitLevel);
        var gameUserLevel = G_UserData.getBase().getLevel();
        if (gameUserLevel < lv) {
            G_Prompt.showTip(Lang.get('treasure_limit_level'));
            return;
        }
        var limitLevel = this._treasureUnitData.getLimit_cost();
        this._openPopupPanel(costKey, limitLevel);
    }
    _openPopupPanel(costKey, limitLevel) {
        if (this._popupPanel != null) {
            return;
        }
        this._popupPanel = cc.instantiate(this.costPanel).getComponent(TreasureLimitCostPanel);
        this._popupPanel.ctor(costKey, handler(this, this._onClickCostPanelItem),
            handler(this, this._onClickCostPanelStep), handler(this, this._onClickCostPanelStart),
            handler(this, this._onClickCostPanelStop), limitLevel, this['_costNode' + costKey].node
        );
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
            G_Prompt.showTip(Lang.get('treasure_limit_material_full'));
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
        if (costKey == TreasureConst.TREASURE_LIMIT_COST_KEY_1) {
            costSizeEveryTime = itemValue * realCostCount;
        }
        this._materialFakeCurSize = this._materialFakeCurSize + costSizeEveryTime;
        if (this._popupPanel) {
            var emitter = this._createEmitter(costKey);
            var startNode = this._popupPanel.findNodeWithItemId(itemId);
            var endNode = this['_costNode' + costKey];
            this._playEmitterEffect(emitter, startNode.node, endNode.node, costKey, this._materialFakeCurSize);
            (startNode as any).setCount(this._materialFakeCount);
        }
        return [
            true,
            realCostCount
        ];
    }
    _onClickCostPanelStart(costKey, itemId, count) {
        this._materialFakeCount = count;
        this._materialFakeCostCount = 0;
        this._materialFakeCurSize = this._treasureUnitData.getLimitCostCountWithKey(costKey);
    }
    _onClickCostPanelStop() {
    }
    _onButtonDetail() {
        PopupBase.loadCommonPrefab('PopupTreasureLimitDetail', (popup: PopupTreasureLimitDetail) => {
            popup.ctor(this._treasureUnitData);
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
        var curLevel = this._treasureUnitData.getRefine_level();
        var limitLevel = this._treasureUnitData.getLimit_cost();
        var [isReach, needLevel] = TreasureDataHelper.isReachTreasureLimitRank(limitLevel, curLevel);
        return [
            isReach,
            needLevel
        ];
    }
    _checkIsMaterialFull(costKey) {
        var curSize = this._treasureUnitData.getLimitCostCountWithKey(costKey);
        var maxSize = this._materialMaxSize[costKey];
        if (curSize >= maxSize) {
            return true;
        } else {
            return false;
        }
    }
    _doPutRes(costKey, materials) {
        var treasureId = this._treasureUnitData.getId();
        var idx = costKey;
        var subItems = materials[0];
        G_UserData.getTreasure().c2sTreasureLimitCost(treasureId, idx, subItems);
        this._costMaterials = subItems;
    }
    _doLvUp() {
        var treasureId = this._treasureUnitData.getId();
        G_UserData.getTreasure().c2sTreasureLimitCost(treasureId);
        this._buttonBreak.setEnabled(false);
    }
    _onTreasureLimitLvPutRes(eventName, costKey) {
        this._updateData();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(TreasureConst.TREASURE_TRAIN_LIMIT);
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
            var curCount = this._treasureUnitData.getLimitCostCountWithKey(costKey);
            var itemId = this._costMaterials.id;
            var emitter = this._createEmitter(costKey);
            var startNode = this._popupPanel.findNodeWithItemId(itemId);
            var endNode = this['_costNode' + costKey];
            this._playEmitterEffect(emitter, startNode.node, endNode.node, costKey, curCount);
        }
        this._updateBtnAndSilverState();
        if (this._checkIsMaterialFull(costKey) == true) {
            this._popupPanel.close();
        }
    }
    _onTreasureLimitSuccess() {
        this._updateData();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_TUPO);
        this._playLvUpEffect();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(TreasureConst.TREASURE_TRAIN_LIMIT);
        }
    }
    _createEmitter(costKey) {
        var names = {
            [TreasureConst.TREASURE_LIMIT_COST_KEY_1]: 'tujiegreen',
            [TreasureConst.TREASURE_LIMIT_COST_KEY_2]: 'tujieblue',
            [TreasureConst.TREASURE_LIMIT_COST_KEY_3]: 'tujiepurple',
            [TreasureConst.TREASURE_LIMIT_COST_KEY_4]: 'tujieorange'
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
        emitter.runAction(cc.sequence(action1, cc.callFunc(function () {
            var limitLevel = this._treasureUnitData.getLimit_cost();
            this['_costNode' + costKey].playRippleMoveEffect(limitLevel, curCount);
        }, this), cc.destroySelf()));
    }
    _playLvUpEffect() {
        function effectFunction(effect) {
            return new cc.Node();
        }
        let eventFunction = function (event) {
            if (event == 'faguang') {
            } else if (event == 'finish') {
                this._buttonBreak.setEnabled(true);
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
        for (var key = TreasureConst.TREASURE_LIMIT_COST_KEY_1; key <= TreasureConst.TREASURE_LIMIT_COST_KEY_4; key++) {
            this['_costNode' + key].node.zIndex = (ZORDER_MOVE);
            this['_costNode' + key].playSMoving();
        }
    }
    _playPrompt() {
        var summary = [];
        var content = Lang.get('summary_treasure_limit_break_success');
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
