const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { HeroConst } from '../../../const/HeroConst';
import { SignalConst } from '../../../const/SignalConst';
import UIConst from '../../../const/UIConst';
import { AttrRecordUnitData } from '../../../data/AttrRecordUnitData';
import { HeroUnitData } from '../../../data/HeroUnitData';
import EffectHelper from '../../../effect/EffectHelper';
import { G_AudioManager, G_EffectGfxMgr, G_HeroVoiceManager, G_Prompt, G_SceneManager, G_SignalManager, G_UserData, Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonGogok from '../../../ui/component/CommonGogok';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import HeroLimitCostNode from './HeroLimitCostNode';
import HeroLimitCostPanel from './HeroLimitCostPanel';
import HeroTrainView from './HeroTrainView';
import PopupLimitDetail from './PopupLimitDetail';






var ZORDER_COMMON = 0
var ZORDER_MID = 1
var ZORDER_MOVE = 2
var LIMIT_UI_TYPE_4 = 1;
var LIMIT_UI_TYPE_6 = 2;
var TYPE_6_OFFSET = cc.v2(34, 46);

@ccclass
export default class HeroTrainLimitLayer extends ViewBase {

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
        type: HeroLimitCostNode,
        visible: true
    })
    _costNode1: HeroLimitCostNode = null;

    @property({
        type: HeroLimitCostNode,
        visible: true
    })
    _costNode2: HeroLimitCostNode = null;

    @property({
        type: HeroLimitCostNode,
        visible: true
    })
    _costNode3: HeroLimitCostNode = null;

    @property({
        type: HeroLimitCostNode,
        visible: true
    })
    _costNode4: HeroLimitCostNode = null;
    @property({type: HeroLimitCostNode,visible: true})
    _costNode2_1: HeroLimitCostNode = null;
    @property({type: HeroLimitCostNode,visible: true})
    _costNode2_2: HeroLimitCostNode = null;
    @property({type: HeroLimitCostNode,visible: true})
    _costNode2_3: HeroLimitCostNode = null;
    @property({type: HeroLimitCostNode,visible: true})
    _costNode2_4: HeroLimitCostNode = null;
    @property({type: HeroLimitCostNode,visible: true})
    _costNode2_5: HeroLimitCostNode = null;
    @property({type: HeroLimitCostNode,visible: true})
    _costNode2_6: HeroLimitCostNode = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _nodeHero: CommonHeroAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgBg: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgNameBg: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgLockTip: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCon: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: CommonGogok,
        visible: true
    })
    _nodeGogok: CommonGogok = null;

    @property({ type: cc.Node, visible: true })
    _nodeGoldLock: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _costNode1_con: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _costNode2_con: cc.Node = null;

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

    private _signalHeroLimitLvPutRes;
    private _signalHeroLimitLvUpSuccess;
    private _costMaterials;
    private _materialMaxSize;
    private _silverCost;
    private _materialFakeCount: number;
    private _materialFakeCostCount: number;
    private _materialFakeCurSize: number;
    private _popupPanelSignal;
    private _parentView: HeroTrainView;
    private _heroUnitData: HeroUnitData;
    private _heroId: number;
    private _popupPanel: HeroLimitCostPanel;
    private _recordAttr: AttrRecordUnitData;

    private _heroLimitCostPanel: any;
    _limitUIType: number;
    _limitDataType: number;
    _consumeHero: {};
    _sceneId: any;
    _attackEffect: any;
    _moveNodeList: any[];

    setInitData(parentView: HeroTrainView): void {
        this._parentView = parentView;
        this._nodeHero.init();
    }
    onCreate() {
        this.setSceneSize();
        this._heroLimitCostPanel = cc.resources.get(Path.getPrefab("HeroLimitCostPanel", "heroTrain"));
        this._initData();
        this._initView();
    }
    onEnter() {
        this._signalHeroLimitLvPutRes = G_SignalManager.add(SignalConst.EVENT_HERO_LIMIT_LV_PUT_RES, handler(this, this._onHeroLimitLvPutRes));
        this._signalHeroLimitLvUpSuccess = G_SignalManager.add(SignalConst.EVENT_HERO_LIMIT_LV_UP_SUCCESS, handler(this, this._onHeroLimitLvUpSuccess));
    }
    onExit() {
        this._signalHeroLimitLvPutRes.remove();
        this._signalHeroLimitLvPutRes = null;
        this._signalHeroLimitLvUpSuccess.remove();
        this._signalHeroLimitLvUpSuccess = null;
        this._stopPlayAttackEffect();
    }
    initInfo() {
        this._parentView.setArrowBtnVisible(false);
        this._updateData();
        this._updateView();
        this._playFire(true);
    }
    _initData() {
        this._costMaterials = {};
        this._materialMaxSize = {
            [HeroConst.HERO_LIMIT_COST_KEY_1]: 0,
            [HeroConst.HERO_LIMIT_COST_KEY_2]: 0,
            [HeroConst.HERO_LIMIT_COST_KEY_3]: 0,
            [HeroConst.HERO_LIMIT_COST_KEY_4]: 0,
            [HeroConst.HERO_LIMIT_COST_KEY_5]: 0,
            [HeroConst.HERO_LIMIT_COST_KEY_6]: 0
        };
        this._silverCost = 0;
        this._materialFakeCount = null;
        this._materialFakeCostCount = null;
        this._materialFakeCurSize = 0;

        this._limitUIType = LIMIT_UI_TYPE_4;
        this._limitDataType = HeroConst.HERO_LIMIT_TYPE_RED;
        this._consumeHero = {};
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_HERO_TRAIN_TYPE4);
    }

    _initOrgPos() {
        var list = [
            this._nodeHero.node,
            this._nodeGogok.node,
            this._textName.node,
            this._nodeBgMoving,
            this._nodePopup,
            this._imageTitle.node,
            this._buttonBreak.node,
            this._nodeSilver.node,
            this._nodeHetiMoving,
            this._nodeFire,
            this._nodeGoldLock
        ];

        this._moveNodeList = list;
        for (var _ in list) {
            var node = list[_];
            node['_orgPos'] = node.getPosition();
        }
    }
    _initView() {
        this._popupPanel = null;
        this._buttonHelp.updateUI(FunctionConst.FUNC_HERO_TRAIN_TYPE4);
        this._buttonBreak._text.string = (Lang.get('hero_limit_break_btn'));
        this._nodeHero.setScale(1.4);
        this._nodeHero.node.zIndex = ZORDER_MID;
        this._imgNameBg.node.active = false;
        this._initOrgPos();

        for (var key = HeroConst.HERO_LIMIT_COST_KEY_1; key <= HeroConst.HERO_LIMIT_COST_KEY_4; key++) {
            this['_cost' + key] = (this['_costNode' + key] as HeroLimitCostNode);
            this['_cost' + key].setInitData(key, handler(this, this._onClickCostAdd), 1);
        }
        for (var key = HeroConst.HERO_LIMIT_COST_KEY_1; key <= HeroConst.HERO_LIMIT_COST_KEY_6; key++) {
            this['_cost2_' + key] = (this['_costNode2_' + key] as HeroLimitCostNode);
            this['_cost2_' + key].setInitData(key, handler(this, this._onClickCostAdd), 2);
        }

        this._nodeGoldLock.active = (false);
        this._costNode1_con.active = (true);
        this._costNode2_con.active = (false);

        this._nodeSilver.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD);
        this._nodeSilver.setTextColorToDTypeColor();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeBgMoving, 'moving_tujie_huohua', null, null, false);
        this._playAttackEffect();
    }

    _updateData() {
        this._heroId = G_UserData.getHero().getCurHeroId();
        this._heroUnitData = G_UserData.getHero().getUnitDataWithId(this._heroId);
        this._limitDataType = HeroDataHelper.getLimitDataType(this._heroUnitData);
        if (this._limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
            this._buttonHelp.updateUI(FunctionConst.FUNC_HERO_TRAIN_TYPE4);
        } else {
            this._buttonHelp.updateUI(FunctionConst.FUNC_HERO_TRAIN_TYPE4_RED);
        }
        var [lv, type] = this.getLimitLvAndType();
        var info = HeroDataHelper.getHeroLimitCostConfig(lv, type);
        var configKey = HeroDataHelper.getLimitCostConfigKey(5);
        if (info[configKey.size] && info[configKey.size] > 0) {
            this._limitUIType = LIMIT_UI_TYPE_6;
        } else {
            this._limitUIType = LIMIT_UI_TYPE_4;
        }
        for (var i = HeroConst.HERO_LIMIT_COST_KEY_1; i <= HeroConst.HERO_LIMIT_COST_KEY_6; i++) {
            this._materialMaxSize[i] = info[HeroDataHelper.getLimitCostConfigKey(i).size];
        }
        this._silverCost = info.break_size;
        var curAttrData = HeroDataHelper.getLimitAttr(this._heroUnitData);
        this._recordAttr.updateData(curAttrData);
        G_UserData.getAttr().recordPower();
    }
    //更新UI
    _updateView() {
        this._updateBaseInfo();
        this._updateAllCost();
        this._updateBtnAndSilverState();
    }

    _fitUI() {
        if (this._limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
            if (this._sceneId) {
                this.clearScene();
                this._sceneId = null;
                this._imgBg.node.active = (true);
                for (var _ in this._moveNodeList) {
                    var node = this._moveNodeList[_];
                    node.setPosition(node._orgPos);
                }
            }
            if (this._limitDataType == HeroConst.HERO_LIMIT_TYPE_RED && this._heroUnitData.getLimit_level() >= HeroConst.HERO_LIMIT_RED_MAX_LEVEL) {
                this._textName.node.x = (-25);
            }
            if (this._attackEffect) {
                this._attackEffect.active = (false);
            }
        }
        if (this._limitDataType == HeroConst.HERO_LIMIT_TYPE_GOLD) {
            if (!this._sceneId) {
                this.updateSceneId(2011);
                this._sceneId = 2011;
                this._imgBg.node.active = (false);
                for (var _ in this._moveNodeList) {
                    var node = this._moveNodeList[_];
                    node.x = (node._orgPos.x + TYPE_6_OFFSET.x);
                }
                this._nodeHero.node.y = (this._nodeHero.node['_orgPos'].y - TYPE_6_OFFSET.y);
            }
            if (this._limitDataType == HeroConst.HERO_LIMIT_TYPE_GOLD && this._heroUnitData.getLimit_rtg() >= HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL) {
                this._textName.node.x = (-25 + TYPE_6_OFFSET.x);
            }
            if (this._attackEffect) {
                this._attackEffect.active = (true);
            }
        }
    }
    _playAttackEffect() {
        var eventFunction = function (event) {
            if (event == 'finish') {
                this._attackEffect = null;
                var interval = 6;
                this._attackEffScheduler = this.scheduleOnce(this.scheduleFunc, interval);
            }
        }.bind(this);
        this._attackEffect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeCon, 'moving_hongshengjinchangjing', null, eventFunction, true).node;
        this._attackEffect.active = (this._limitDataType == HeroConst.HERO_LIMIT_TYPE_GOLD);
        this._attackEffect.zIndex = (-1);
    }

    scheduleFunc() {
        this._playAttackEffect();
    }

    _stopPlayAttackEffect() {
        this.unschedule(this.scheduleFunc);
    }

    _updateBaseInfo() {
        this._fitUI();
        var name = this._heroUnitData.getConfig().name;
        var baseId = this._heroUnitData.getBase_id();
        var limitLevel = this._heroUnitData.getLimit_level();
        var limitRedLevel = this._heroUnitData.getLimit_rtg();
        var nameStr = Lang.get('hero_limit_name', { name: name });
        this._costNode1_con.active = (this._limitUIType == LIMIT_UI_TYPE_4);
        this._costNode2_con.active = (this._limitUIType == LIMIT_UI_TYPE_6);

        var isTop = true;
        var lv = 0;
        if (this._limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
            this._nodeGogok.resetSize(3);
            UIHelper.loadTexture(this._imageTitle, Path.getTextLimit('txt_limit_06'));
            var txtColor = Colors.getColor(6);
            this._textName.node.color = (txtColor);
            UIHelper.disableOutline(this._textName);
            UIHelper.loadTexture(this._imgLockTip, Path.getTextLimit('txt_limit_05'));
            isTop = limitLevel >= HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
            lv = limitLevel;
        } else {
            this._nodeGogok.resetSize(4);
            UIHelper.loadTexture(this._imageTitle, Path.getTextLimit('txt_limit_06i'));
            var txtColor = Colors.getColor(7);
            var txtColorOutline = Colors.getColorOutline(7);
            this._textName.node.color = (txtColor);
            UIHelper.enableOutline(this._textName, txtColorOutline, 2);
            UIHelper.loadTexture(this._imgLockTip, Path.getTextLimit('txt_limit_05b'));
            isTop = limitRedLevel >= HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL;
            lv = limitRedLevel;
        }
        this._textName.string = nameStr;

        this._nodeGogok.setCount(lv);
        if (this._limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
            this._nodeHero.updateUI(baseId, null, null, 3, null, null);
        } else {
            this._nodeHero.updateUI(baseId, null, null, 3, null, null, 4);
        }
        if (isTop) {
            this._imageTitle.node.active = (false);
            this._nodeGoldLock.active = (false);
        } else {
            this._imageTitle.node.active = (true);
        }
    }

    _updateAllCost() {
        var endIndex = this.getLimitBallNum();
        for (var key = HeroConst.HERO_LIMIT_COST_KEY_1; key <= endIndex; key++) {
            this._updateSingeCost(key);
        }
        this._updateSilverCost();
    }
    _updateSingeCost(costKey) {
        var [costName, costNodeName] = this.getCostNodeName();
        var curCount = this._heroUnitData.getLimitCostCountWithKey(costKey, this._limitDataType);
        var [lv, type] = this.getLimitLvAndType();
        this[costName + costKey].updateUI(lv, curCount, type);
        if (type && type != 0) {
            this[costName + costKey].enableTextOutline(true);
        } else {
            this[costName + costKey].enableTextOutline(false);
        }
        var isShow = HeroDataHelper.isPromptHeroLimitWithCostKey(this._heroUnitData, costKey);
        this[costName + costKey].showRedPoint(isShow);
        this[costNodeName + costKey].node.zIndex = (ZORDER_COMMON);
    }

    _updateSilverCost() {
        var strSilver = TextHelper.getAmountText1(this._silverCost);
        this._nodeSilver.setCount(strSilver, null, true);
    }
    _updateBtnAndSilverState() {
        if (this._limitDataType == HeroConst.HERO_LIMIT_TYPE_RED && this._heroUnitData.getLimit_level() >= HeroConst.HERO_LIMIT_RED_MAX_LEVEL || this._limitDataType != HeroConst.HERO_LIMIT_TYPE_RED && this._heroUnitData.getLimit_rtg() >= HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL) {
            this._buttonBreak.node.active = false;
            this._nodeSilver.node.active = false;
            return;
        }
        var isAllFull = true;
        for (var key = HeroConst.HERO_LIMIT_COST_KEY_1; key <= HeroConst.HERO_LIMIT_COST_KEY_6; key++) {
            var isFull = this._checkIsMaterialFull(key);
            isAllFull = isAllFull && isFull;
        }
        this._buttonBreak.node.active = isAllFull;
        this._nodeSilver.node.active = isAllFull;
    }
    //播放火焰
    _playFire(isPlay) {
        this._nodeFire.removeAllChildren();
        var effectName = isPlay && 'effect_tujietiaozi_1' || 'effect_tujietiaozi_2';
        var limitLevel = this._heroUnitData.getLimit_level();
        var limitRedLevel = this._heroUnitData.getLimit_rtg();
        var redTop = this._limitDataType == HeroConst.HERO_LIMIT_TYPE_RED && limitLevel == HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
        var goldTop = this._limitDataType != HeroConst.HERO_LIMIT_TYPE_RED && limitRedLevel == HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL;
        if (redTop || goldTop) {
            G_EffectGfxMgr.createPlayGfx(this._nodeFire, effectName, null)
        }
    }

    _onClickCostAdd(costKey) {

        var ret = this._checkRankLevel();
        var isReach = ret[0];
        var needRank = ret[1];
        if (isReach == false) {
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, this._heroUnitData.getBase_id());
            var name = param.name;
            var rank = needRank;
            var [lv, type] = this.getLimitLvAndType();
            G_Prompt.showTip(Lang.get('hero_limit_level_condition', {
                name: name,
                rank: rank,
                level: lv + 1
            }));
            return;
        }
        this._openPopupPanel(costKey);
    }

    getCostNodeName() {
        var costName = '';
        var costNodeName = '';
        if (this._limitUIType == LIMIT_UI_TYPE_4) {
            costName = '_cost';
            costNodeName = '_costNode';
        } else {
            costName = '_cost2_';
            costNodeName = '_costNode2_';
        }
        return [
            costName,
            costNodeName
        ];
    }

    _openPopupPanel(costKey) {
        if (this._popupPanel != null) {
            return;
        }
        var [_, costNodeName] = this.getCostNodeName();
        var [lv, type] = this.getLimitLvAndType();

        var node = cc.instantiate(this._heroLimitCostPanel) as cc.Node;
        this._popupPanel = node.getComponent(HeroLimitCostPanel) as HeroLimitCostPanel;
        this._popupPanel.setInitData(costKey, handler(this, this._onClickCostPanelItem), handler(this, this._onClickCostPanelStep), handler(this, this._onClickCostPanelStart), handler(this, this._onClickCostPanelStop), lv, (this[costNodeName + costKey] as HeroLimitCostNode).node,
            {
                baseId: this._heroUnitData.getBase_id(),
                limitRed: type
            })
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
        var uidList = [];
        if (costKey == HeroConst.HERO_LIMIT_COST_KEY_1 || costKey == HeroConst.HERO_LIMIT_COST_KEY_2 || costKey == HeroConst.HERO_LIMIT_COST_KEY_6) {
            var id = materials[0].id;
            var num = materials[0].num;
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, id);
            var itemValue = Math.max(1, param.cfg.item_value);
            var count = 0;
            var cur = 0;
            var curCount = this._heroUnitData.getLimitCostCountWithKey(costKey, this._limitDataType);
            var [lv, type] = this.getLimitLvAndType();
            var info = HeroDataHelper.getHeroLimitCostConfig(lv, type);
            var configKey = HeroDataHelper.getLimitCostConfigKey(costKey);
            var size = info[configKey.size] || 0;
            var reminder = size - curCount;
            for (var j = 1; j <= num; j++) {
                cur = cur + itemValue;
                count = count + 1;
                if (cur >= reminder) {
                    break;
                }
            }
            materials[0].num = count;
        }
        if (costKey == HeroConst.HERO_LIMIT_COST_KEY_5) {
            var id = materials[0].id;
            var num = materials[0].num;
            var unitDataList = G_UserData.getHero().getSameCardCountWithBaseId(id);
            this._consumeHero[id] = this._consumeHero[id] || {};
            var count = 0;
            for (var i in unitDataList) {
                var v = unitDataList[i];
                var uid = v.getId();
                if (!this._consumeHero[id][uid]) {
                    this._consumeHero[id][uid] = true;
                    uidList.push(uid);
                    count = count + 1;
                    if (count >= num) {
                        break;
                    }
                }
            }
        }
        this._doPutRes(costKey, materials, uidList);
    }
    _onClickCostPanelStep(costKey, itemId, itemValue, costCountEveryTime): Array<any> {
        if (this._materialFakeCount <= 0) {
            return [false, null]
        }
        if (this._materialFakeCurSize >= this._materialMaxSize[costKey]) {
            G_Prompt.showTip(Lang.get('hero_limit_material_full'));
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
        if (costKey == HeroConst.HERO_LIMIT_COST_KEY_1) {
            costSizeEveryTime = itemValue * realCostCount;
        }
        this._materialFakeCurSize = this._materialFakeCurSize + costSizeEveryTime;
        if (this._popupPanel) {
            var emitter = this._createEmitter(costKey);
            var startNode = this._popupPanel.findNodeWithItemId(itemId);
            var [_, costNodeName] = this.getCostNodeName();
            var endNode = this[costNodeName + costKey] as HeroLimitCostNode;
            this._playEmitterEffect(emitter, startNode.node, endNode.node, costKey, this._materialFakeCurSize);
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
        this._consumeHero = {};
        this._materialFakeCurSize = this._heroUnitData.getLimitCostCountWithKey(costKey, this._limitDataType);
    }
    _onClickCostPanelStop() {
    }
    private onButtonDetail() {
        G_SceneManager.openPopup(Path.getPrefab("PopupLimitDetail", "heroTrain"), function (popup: PopupLimitDetail) {
            popup.setInitData(this._heroUnitData);
            popup.openWithAction();
        }.bind(this));
    }
    private onButtonBreak() {
        var ret = UserCheck.enoughMoney(this._silverCost);
        var isOk = ret[0];
        var func = ret[1] as Function;
        if (isOk == false) {
            func();
            return;
        }
        this._doLvUp();
    }
    _checkRankLevel(): Array<boolean> {
        var [isReach, needRank] = HeroDataHelper.isReachLimitRank(this._heroUnitData);
        return [
            isReach,
            needRank
        ];
    }
    _checkIsMaterialFull(costKey): boolean {
        var curSize = this._heroUnitData.getLimitCostCountWithKey(costKey, this._limitDataType);
        var maxSize = this._materialMaxSize[costKey];
        if (curSize >= maxSize) {
            return true;
        } else {
            return false;
        }
    }
    _doPutRes(costKey, materials, costHeroIds) {
        var heroId = this._heroUnitData.getId();
        var pos = costKey;
        var subItems = materials;
        var op = 0;
        if (this._limitDataType != HeroConst.HERO_LIMIT_TYPE_RED) {
            op = 1;
        }
        G_UserData.getHero().c2sHeroLimitLvPutRes(heroId, pos, subItems, op, costHeroIds);
        this._costMaterials = materials;
    }
    _doLvUp() {
        var heroId = this._heroUnitData.getId();
        var op = 0;
        if (this._limitDataType != HeroConst.HERO_LIMIT_TYPE_RED) {
            op = 1;
        }
        G_UserData.getHero().c2sHeroLimitLvUp(heroId, op);
    }
    _onHeroLimitLvPutRes(eventName, costKey) {
        this._updateData();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(4);
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
            var curCount = this._heroUnitData.getLimitCostCountWithKey(costKey, this._limitDataType);
            for (var i in this._costMaterials) {
                var material = this._costMaterials[i];
                var itemId = material.id;
                var emitter = this._createEmitter(costKey);
                var startNode = this._popupPanel.findNodeWithItemId(itemId);
                var [_, costNodeName] = this.getCostNodeName();
                var endNode = this[costNodeName + costKey] as HeroLimitCostNode;
                this._playEmitterEffect(emitter, startNode.node, endNode.node, costKey, curCount);
            }
        }
        this._updateBtnAndSilverState();
        if (this._checkIsMaterialFull(costKey) == true) {
            this._popupPanel.close();
        }
    }
    _onHeroLimitLvUpSuccess() {
        this._updateData();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_TUPO);
        this._playLvUpEffect();
        if (this._parentView && this._parentView.checkRedPoint) {
            this._parentView.checkRedPoint(4);
        }
    }
    _createEmitter(costKey): cc.Node {
        var names = {
            [HeroConst.HERO_LIMIT_COST_KEY_1]: 'tujiegreen',
            [HeroConst.HERO_LIMIT_COST_KEY_2]: 'tujieblue',
            [HeroConst.HERO_LIMIT_COST_KEY_3]: 'tujiepurple',
            [HeroConst.HERO_LIMIT_COST_KEY_4]: 'tujieorange',
            [HeroConst.HERO_LIMIT_COST_KEY_5]: 'tujiepurple',
            [HeroConst.HERO_LIMIT_COST_KEY_6]: 'tujieorange'
        };
        var emitter = (new cc.Node()).addComponent(cc.ParticleSystem) as cc.ParticleSystem;
        EffectHelper.loadEffectRes('particle/' + (names[costKey] + '.plist'), cc.ParticleAsset, function (res: any) {
            emitter.file = res;
            emitter.resetSystem();
        }.bind(this));
        return emitter.node;
    }
    _playEmitterEffect(emitter: cc.Node, startNode: cc.Node, endNode: cc.Node, costKey, curCount) {
        var getRandomPos = function (startPos, endPos) {
            var pos11 = new cc.Vec2(startPos.x + (endPos.x - startPos.x) * 1 / 2, startPos.y + (endPos.y - startPos.y) * 3 / 4);
            var pos12 = new cc.Vec2(startPos.x + (endPos.x - startPos.x) * 1 / 4, startPos.y + (endPos.y - startPos.y) * 1 / 2);
            var pos21 = new cc.Vec2(startPos.x + (endPos.x - startPos.x) * 3 / 4, startPos.y + (endPos.y - startPos.y) * 1 / 2);
            var pos22 = new cc.Vec2(startPos.x + (endPos.x - startPos.x) * 1 / 2, startPos.y + (endPos.y - startPos.y) * 1 / 4);
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
            var index = 1;
            if (Math.randInt() > 0.5)
                index = 2;
            return [
                tbPos[index][0],
                tbPos[index][1]
            ];
        }
        var startPos = UIHelper.convertSpaceFromNodeToNode(startNode, this.node);
        emitter.setPosition(startPos);
        this.node.addChild(emitter);
        var [costName] = this.getCostNodeName();
        var endPos = UIHelper.convertSpaceFromNodeToNode(endNode, this.node);
        var [pointPos1, pointPos2] = getRandomPos(startPos, endPos);
        var bezier = [
            pointPos1,
            pointPos2,
            endPos
        ];
        var action1 = cc.bezierTo(0.7, bezier);
        action1.easing(cc.easeSineIn());
        var action2 = action1.easing(cc.easeSineIn());
        emitter.runAction(cc.sequence(action2, cc.callFunc(function () {
            var [lv, type] = this.getLimitLvAndType();
            this[costName + costKey].playRippleMoveEffect(lv, curCount, type);
        }.bind(this)), cc.destroySelf()));
    }

    getLimitLvAndType() {
        if (this._limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
            return [
                this._heroUnitData.getLimit_level(),
                this._limitDataType
            ];
        } else {
            return [
                this._heroUnitData.getLimit_rtg(),
                this._limitDataType
            ];
        }
    }
    getLimitBallNum() {
        if (this._limitUIType == LIMIT_UI_TYPE_4) {
            return HeroConst.HERO_LIMIT_COST_KEY_4;
        } else {
            return HeroConst.HERO_LIMIT_COST_KEY_6;
        }
    }
    _playLvUpEffect() {
        var effectFunction = function (effect): cc.Node {
            return new cc.Node();
        }
        var eventFunction = function (event) {
            if (event == 'faguang') {
            } else if (event == 'finish') {
                this._updateView();
                this._playHeroAnimation();
                this._playFire(true);
                var delay = cc.delayTime(0.5);
                var sequence = cc.sequence(delay, cc.callFunc(function () {
                    this._playPrompt();
                }.bind(this)));
                this.node.runAction(sequence);
            }
        }.bind(this)
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeHetiMoving, 'moving_tujieheti', effectFunction, eventFunction, true);
        var endIndex = this.getLimitBallNum();
        var [costName, costNodeName] = this.getCostNodeName();
        for (var key = HeroConst.HERO_LIMIT_COST_KEY_1; key <= endIndex; key++) {
            this[costNodeName + key].node.zIndex = (ZORDER_MOVE);
            this[costName + key].playSMoving();
        }
    }
    //播放英雄的动画
    _playHeroAnimation() {
        var heroBaseId = this._heroUnitData.getBase_id();
        var limitLevel = this._heroUnitData.getLimit_level();
        var limitRedLevel = this._heroUnitData.getLimit_rtg();
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel, limitRedLevel);
        var actionName = param.res_cfg.show_action;
        if (actionName != '') {
            this._nodeHero.playAnimationOnce(actionName);
        }
        G_HeroVoiceManager.playVoiceWithHeroId(heroBaseId, true);
    }
    //播放提示
    _playPrompt() {
        var summary: Array<any> = [];
        var content = Lang.get('summary_hero_limit_break_success');
        var param = { content: content };
        summary.push(param);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary();
    }
    _addBaseAttrPromptSummary(summary: Array<any>) {
        var attr = this._recordAttr.getAttr();
        var desInfo = TextHelper.getAttrInfoBySort(attr);
        for (var i in desInfo) {
            var info = desInfo[i];
            var attrId = info.id;
            var diffValue = this._recordAttr.getDiffValue(attrId);
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: new cc.Vec2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_ATTR }
                };
                summary.push(param);
            }
        }
        return summary;
    }

}