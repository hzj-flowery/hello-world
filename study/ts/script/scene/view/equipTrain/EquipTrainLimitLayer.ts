const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { LimitCostConst } from '../../../const/LimitCostConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import EffectHelper from '../../../effect/EffectHelper';
import { Colors, G_AudioManager, G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonEquipAvatar from '../../../ui/component/CommonEquipAvatar';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import EquipLimitCostNode from './EquipLimitCostNode';
import EquipLimitCostPanel from './EquipLimitCostPanel';
import { EquipTrainHelper } from './EquipTrainHelper';
import PopupEquipLimitDetail from './PopupEquipLimitDetail';





var ZORDER_COMMON = 0;
var ZORDER_MID = 1;
var ZORDER_MOVE = 2;

@ccclass
export default class EquipTrainLimitLayer extends ViewBase {


    private static BG_RES = {
        [1001]: 'img_limit_bg01',
        [2001]: 'img_bg_limit02',
        [3001]: 'img_bg_limit02'
    };
    private static NODE_POS_Y_3_4 = {
        [1001]: -130,
        [2001]: -130.5,
        [3001]: -130.5
    };
    private static NODE_FRONT_IMG = {
        [1001] : {
            [2] : "img_limit_gold_hero02a",
            [3] : "img_limit_gold_hero05a",
            [4] : "img_limit_gold_hero06a"
        },
        [2001] : {
            [2] : "img_limit_gold_hero02a",
            [3] : "img_limit_gold_hero05a",
            [4] : "img_limit_gold_hero06a"
        },
        [3001] : {
            [2] : "img_limit_gold_hero02a",
            [3] : "img_limit_gold_hero05a",
            [4] : "img_limit_gold_hero06a"
        }
    };
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

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
        type: EquipLimitCostNode,
        visible: true
    })
    _costNode2: EquipLimitCostNode = null;

    @property({
        type: EquipLimitCostNode,
        visible: true
    })
    _costNode3: EquipLimitCostNode = null;

    @property({
        type: EquipLimitCostNode,
        visible: true
    })
    _costNode4: EquipLimitCostNode = null;

    @property({
        type: CommonEquipAvatar,
        visible: true
    })
    _equipAvatar: CommonEquipAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitleBg: cc.Sprite = null;

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
    @property({
        type: cc.Prefab,
        visible: true
    })
    _equipLimitCostPanel: cc.Prefab = null;
    _parentView: any;
    _lastEquipid: number;
    _lastSliverNums: number;
    _lastRefinelevel: number;
    _recordAttr: any;
    _signalEventEquipLimitUpPutRes;
    _unitData: any;
    _suit_id: number;
    _popupPanel: any;
    _materialFakeCostCount;
    _costMaterials: any;
    _costInfo: {};
    _materialFakeCount: number;
    _materialFakeCurSize: any;
    _popupPanelSignal: any;
    _cost3: any;
    _cost4: any;

    _isPlay

    constructor() {
        super();
        this._lastEquipid = 0;
        this._lastSliverNums = 0;
        this._lastRefinelevel = 0;
    }
    onCreate() {
        this.setSceneSize(null, false);
        this._updateData();
        this._initUI();
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_LIMIT_UP_TYPE);
        this._buttonBreak.addClickEventListenerEx(handler(this, this._onButtonBreak));
    }
    onEnter() {
        this._signalEventEquipLimitUpPutRes = G_SignalManager.add(SignalConst.EVENT_EQUIP_LIMIT_UP_PUT_RES, handler(this, this._onEventEquipLimitUpPutRes));
    }
    onExit() {
        this._signalEventEquipLimitUpPutRes.remove();
        this._signalEventEquipLimitUpPutRes = null;
    }
    _onEventEquipLimitUpPutRes(id, costKey) {
        this._updateData();
        if (costKey != LimitCostConst.BREAK_LIMIT_UP) {
            this._putResEffect(costKey);
            this._updateNodeSliver();
        } else {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_TUPO);
            this._playLvUpEffect();
            this._unitData.setChange(0);
        }
    }
    _playLvUpEffect() {
        function effectFunction(effect) {
            return new cc.Node();
        }
        let eventFunction = function(event) {
            if (event == 'faguang') {
            } else if (event == 'finish') {
                this._updateView();
                this._playFire(true);
                var delay = cc.delayTime(0.5);
                var sequence = cc.sequence(delay, cc.callFunc(function () {
                    this._playPrompt();
                    this._updateCost();
                }.bind(this)));
                this.node.runAction(sequence);
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeHetiMoving, 'moving_tujieheti', effectFunction, eventFunction, true);
        for (let key = LimitCostConst.LIMIT_COST_KEY_2; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
            this['_cost' + key].playSMoving();
        }
    }
    _playFire(isPlay) {
        this._nodeFire.active = (true);
        this._nodeFire.removeAllChildren();
        var effectName = isPlay && 'effect_tujietiaozi_1' || 'effect_tujietiaozi_2';
        if (this._suit_id == LimitCostConst.MAX_SUIT_ID) {
            G_EffectGfxMgr.createPlayGfx(this._nodeFire, effectName);
        }
    }
    _playPrompt() {
        var summary = [];
        var content = Lang.get('summary_equip_limit_break_success');
        var param = { content: content };
        summary.push(param);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary();
    }
    _addBaseAttrPromptSummary(summary) {
        var attr = this._recordAttr.getAttr();
        var desInfo = TextHelper.getAttrInfoBySort(attr);
        for (var i in desInfo) {
            var info = desInfo[i];
            var attrId = info.id;
            var diffValue = this._recordAttr.getDiffValue(attrId);
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_ATTR }
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _putResEffect(costKey) {
        if (this._popupPanel == null) {
            this._updateCost();
            return;
        }
        if (this._materialFakeCostCount && this._materialFakeCostCount > 0) {
            this._materialFakeCostCount = null;
            this._updateCost();
        } else {
            var curCount = this._unitData.getMaterials()[costKey-1];
            for (var i in this._costMaterials) {
                var material = this._costMaterials[i];
                var itemId = material.id;
                var emitter = this._createEmitter(costKey);
                var startNode = this._popupPanel.findNodeWithItemId(itemId);
                var endNode = this['_costNode' + costKey];
                this['_cost' + costKey].lock();
                this._playEmitterEffect(emitter, startNode, endNode, costKey, curCount);
            }
        }
        this._popupPanel.updateUI();
        if (this._checkIsMaterialFull(costKey) == true) {
            this._popupPanel.close();
        }
    }
    _updateData() {
        var equipid = G_UserData.getEquipment().getCurEquipId();
        this._unitData = G_UserData.getEquipment().getEquipmentDataWithId(equipid);
        this._suit_id = this._unitData.getConfig().suit_id;
        this._costInfo = EquipTrainHelper.getLimitUpCostInfo();
    }
    _initUI() {
        this._initCostIcon();
        this._buttonHelp.updateLangName('equipment_limit_up_help_txt');
        this._buttonBreak.setString(Lang.get('equip_limit_break_btn'));
        this._nodeSilver.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD);
        this._nodeSilver.setTextColorToDTypeColor();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeBgMoving, 'moving_tujie_huohua', null, null, false);
    }
    _updateText() {
        var equipBaseId = this._unitData.getBase_id();
        var titleRes = EquipTrainHelper.getLimitUpTitleRes(equipBaseId);
        UIHelper.loadTexture(this._imageTitle, titleRes);
        this._imageTitle.node.active = (titleRes != '');
        var config: any = {};
        if (this._suit_id == LimitCostConst.MAX_SUIT_ID) {
            config = this._unitData.getConfig();
            this._textName.node.setAnchorPoint(cc.v2(0.5, 0.5));
            this._textName.node.x = (0);
            this._imageTitleBg.node.setScale(0.6);
            this._imageTitleBg.node.y = (235);
        } else {
            var after_id = this._unitData.getConfig().potential_after;
            config = EquipTrainHelper.getConfigByBaseId(after_id);
            this._textName.node.setAnchorPoint(cc.v2(0, 0.5));
            this._textName.node.x = (56.06);
            this._imageTitleBg.node.setScale(1);
            this._imageTitleBg.node.y = (210);
        }
        this._textName.string = (config.name);
        this._textName.node.color = (Colors.getColor(config.color));
        var params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, config.id);
        UIHelper.updateTextOutline(this._textName, params);
    }
    _updateNodeSliver() {
        if (this._suit_id == LimitCostConst.MAX_SUIT_ID) {
            this._nodeSilver.node.active = (false);
            this._buttonBreak.node.active = (false);
            return;
        }
        var isAllFull = EquipTrainHelper.equipLimitUpIsAllFull();
        this._nodeSilver.node.active = (isAllFull);
        this._buttonBreak.node.active = (isAllFull);
        var isEnough = false;
        if (isAllFull) {
            var silver = EquipTrainHelper.getLimitUpCoinCost();
            var strSilver = TextHelper.getAmountText3(silver);
            this._nodeSilver.setCount(strSilver, null, true);
            this._nodeSilver.node.active = (silver > 0);
            var haveCoin = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, 2);
            isEnough = haveCoin >= silver;
            if (isEnough) {
                this._nodeSilver.setTextColorToDTypeColor();
            } else {
                this._nodeSilver.setCountColorRed(true);
            }
        }
        this._buttonBreak.showRedPoint(isAllFull && isEnough);
    }
    _updateItem() {
        var equipBaseId = this._unitData.getBase_id();
        var config = this._unitData.getConfig();
        if (config.potential_after > 0) {
            equipBaseId = config.potential_after;
        }
        this._equipAvatar.updateUI(equipBaseId);
        this._equipAvatar.setShadowPosY(-20);
    }
    _openPopupPanel(costKey, limitLevel) {
        if (this._popupPanel != null) {
            return;
        }
        this._popupPanel = (cc.instantiate(this._equipLimitCostPanel)).getComponent(EquipLimitCostPanel);
        this._popupPanel.setInitData(costKey, handler(this, this._onClickCostPanelItem), handler(this, this._onClickCostPanelStep), handler(this, this._onClickCostPanelStart), handler(this, this._onClickCostPanelStop), limitLevel, this['_costNode' + costKey].node);
        this._popupPanelSignal = this._popupPanel.signal.add(handler(this, this._onPopupPanelClose));
        this._nodePopup.addChild(this._popupPanel.node);
        this._popupPanel.updateUI();
    }
    _checkIsMaterialFull(costKey) {
        var materials = this._unitData.getMaterials();
        var curSize = materials[costKey-1];
        var maxSize = this._costInfo['size_' + costKey];
        if (curSize >= maxSize) {
            return true;
        } else {
            return false;
        }
    }
    _doPutRes(costKey, materials) {
        var pos = costKey;
        var subItem = materials[0];
        if (costKey == LimitCostConst.LIMIT_COST_KEY_2) {
            var equipid = EquipTrainHelper.getCostEquipId(subItem.id);
            subItem = {
                id: equipid,
                num: subItem.num
            };
        }
        G_UserData.getEquipment().c2sEquipmentLimitCost(this._unitData.getId(), pos, subItem);
        this._costMaterials = materials;
    }
    _createEmitter(costKey) {
        var names = {
            [LimitCostConst.LIMIT_COST_KEY_2]: 'tujieblue',
            [LimitCostConst.LIMIT_COST_KEY_3]: 'tujiepurple',
            [LimitCostConst.LIMIT_COST_KEY_4]: 'tujieorange'
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
                [1]: [
                    pos11,
                    pos12
                ],
                [2]: [
                    pos21,
                    pos22
                ]
            };
            var index = Math.random() < 0.5 ? 1 : 2;
            return [
                tbPos[index][0],
                tbPos[index][1]
            ];
        }
        var startPos = UIHelper.convertSpaceFromNodeToNode(startNode.node, this.node);
        emitter.setPosition(startPos);
        this.node.addChild(emitter);
        var endPos = UIHelper.convertSpaceFromNodeToNode(endNode.node, this.node);
        var [pointPos1, pointPos2] = getRandomPos(startPos, endPos);
        var bezier = [
            pointPos1,
            pointPos2,
            endPos
        ];
        var action1 = cc.bezierTo(0.7, bezier);
        var action2 = action1.easing(cc.easeSineIn());
        emitter.runAction(cc.sequence(action2, cc.callFunc(function () {
            var limitLevel = this._unitData.getLevel();
            this['_cost' + costKey].playRippleMoveEffect(limitLevel, curCount);
        }.bind(this)), cc.destroySelf()));
    }
    _onClickCostPanelItem(costKey, materials) {
        if (this._checkIsMaterialFull(costKey) == true) {
            return;
        }
        this._doPutRes(costKey, materials);
    }
    _onClickCostPanelStep(costKey, itemId, itemValue, costCountEveryTime) {
        if (this._materialFakeCount <= 0) {
            return [false];
        }
        if (this._materialFakeCurSize >= this._costInfo['size_' + costKey]) {
            G_Prompt.showTip(Lang.get('limit_material_full'));
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
            var endNode = this['_costNode' + costKey];
            this._playEmitterEffect(emitter, startNode, endNode, costKey, this._materialFakeCurSize);
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
        var materials = this._unitData.getMaterials();
        this._materialFakeCurSize = materials[costKey-1];
    }
    _onClickCostPanelStop() {
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
    onButtonDetail() {
        var unitData = this._unitData;
        if (this._unitData.getConfig().suit_id == LimitCostConst.MAX_SUIT_ID) {
            unitData = EquipTrainHelper.copyEquipData(this._unitData);
            unitData.setBase_id(this._unitData.getBase_id() - 100);
            unitData.setConfig(EquipTrainHelper.getConfigByBaseId(unitData.getBase_id()));
        }
        PopupEquipLimitDetail.getIns(PopupEquipLimitDetail, (p: PopupEquipLimitDetail) => {
            p.ctor(unitData);
            p.openWithAction();
        })
    }
    _onButtonBreak() {
        var Silver = EquipTrainHelper.getLimitUpCoinCost();
        var haveCoin = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, 2);
        if (haveCoin < Silver) {
            G_Prompt.showTip(Lang.get('equip_limit_up_sliver_not_enough'));
            return;
        }
        var materials = [{
            id: 0,
            num: 0
        }];
        this._doPutRes(LimitCostConst.BREAK_LIMIT_UP, materials);
    }
    _initCostIcon() {
        for (var key = LimitCostConst.LIMIT_COST_KEY_2; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
            this['_cost' + key] = this['_costNode' + key];
            this['_costNode' + key].setInitData(key, handler(this, this._onClickCostAdd));
        }
    }
    _onClickCostAdd(costKey) {
        var limitLevel = this._unitData.getLevel();
        this._openPopupPanel(costKey, limitLevel);
    }
    _updateView() {
        this._updateText();
        this._updateItem();
        this._updateNodeSliver();
        var bgres = Path.getLimitImgBg(EquipTrainLimitLayer.BG_RES[this._suit_id]);
        if (bgres) {
            UIHelper.loadTexture(this._imageBg, bgres);
        }
        var posy = EquipTrainLimitLayer.NODE_POS_Y_3_4[this._suit_id];
        if (posy) {
            this._cost3.node.y = (posy);
            this._cost4.node.y = (posy);
        }
        var resIds = EquipTrainLimitLayer.NODE_FRONT_IMG[this._suit_id];
        if (resIds) {
            for (var key = LimitCostConst.LIMIT_COST_KEY_2; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
                this['_cost' + key].setImageFront(resIds[key]);
            }
        }
    }
    _updateCost() {
        var limitLevel = this._unitData.getLevel();
        var curCounts = this._unitData.getMaterials();
        for (var key = LimitCostConst.LIMIT_COST_KEY_2; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
            this['_costNode' + key].node.zIndex = (ZORDER_COMMON);
            if (this._suit_id == LimitCostConst.MAX_SUIT_ID) {
                this['_costNode' + key].node.active = (false);
            } else {
                this['_cost' + key].updateUI(limitLevel, curCounts[key -1]);
                var [show] = EquipTrainHelper.isHaveLimitUpCostMaterials(key);
                this['_cost' + key].showRedPoint(show);
                this['_cost' + key].changeImageName();
            }
        }
    }
    updateInfo() {
        this._updateData();
        this._updateView();
        this._updateCost();
        if (this._suit_id == LimitCostConst.MAX_SUIT_ID) {
            this._playFire(true);
        } else {
            this._nodeFire.active = (false);
        }
        this._popupTipsText();
        if (this._popupPanel) {
            this._popupPanel.close();
        }
    }
    _popupTipsText() {
        if (this._suit_id == LimitCostConst.MAX_SUIT_ID) {
            return;
        }
        if (this._unitData.getChange() == 0) {
            return;
        } else if (this._unitData.getChange() == 1) {
            var isAllFull = EquipTrainHelper.equipLimitUpIsAllFull();
            if (isAllFull) {
                G_Prompt.showTip(Lang.get('equip_limit_up_tips_2'));
            }
        } else if (this._unitData.getChange() == 2) {
            G_Prompt.showTip(Lang.get('equip_limit_up_tips_1'));
        } else if (this._unitData.getChange() == 3) {
            G_Prompt.showTip(Lang.get('equip_limit_up_tips_1'));
        }
        this._unitData.setChange(0);
    }

}