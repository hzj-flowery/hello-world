const {ccclass, property} = cc._decorator;

import CommonHelpBig from '../../../ui/component/CommonHelpBig'

import CommonStoryAvatar from '../../../ui/component/CommonStoryAvatar'

import HeroGoldLevelNode from './HeroGoldLevelNode'

import HeroGoldMidNode from './HeroGoldMidNode'

import HeroGoldCostNode from './HeroGoldCostNode'
import CommonLimitBaseView from './CommonLimitBaseView';
import { HeroUnitData } from '../../../data/HeroUnitData';
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_UserData, G_Prompt, G_EffectGfxMgr, G_AudioManager, G_SceneManager} from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { LimitCostConst } from '../../../const/LimitCostConst';
import { FunctionConst } from '../../../const/FunctionConst';
import UIConst from '../../../const/UIConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { table } from '../../../utils/table';
import HeroGoldHelper from './HeroGoldHelper';
import { Lang } from '../../../lang/Lang';
import { HeroConst } from '../../../const/HeroConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { AudioConst } from '../../../const/AudioConst';
import { Path } from '../../../utils/Path';
import PopupHeroGoldTrainDetail from './PopupHeroGoldTrainDetail';
import { TextHelper } from '../../../utils/TextHelper';

var NORNAL_WIDTH = 420;
var MAX_WIDTH = 600;

@ccclass
export default class HeroGoldTrainLayer extends CommonLimitBaseView {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelDesign: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeRes: cc.Node = null;

   @property({
       type: HeroGoldCostNode,
       visible: true
   })
   _costNode2: HeroGoldCostNode = null;

   @property({
       type: HeroGoldCostNode,
       visible: true
   })
   _costNode3: HeroGoldCostNode = null;

   @property({
       type: HeroGoldCostNode,
       visible: true
   })
   _costNode4: HeroGoldCostNode = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _maskBg: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeBgEffect: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect1: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeResDetail: cc.Node = null;

   @property({
       type: HeroGoldCostNode,
       visible: true
   })
   _costDetail2: HeroGoldCostNode = null;

   @property({
       type: HeroGoldCostNode,
       visible: true
   })
   _costDetail3: HeroGoldCostNode = null;

   @property({
       type: HeroGoldCostNode,
       visible: true
   })
   _costDetail4: HeroGoldCostNode = null;

   @property({
       type: HeroGoldMidNode,
       visible: true
   })
   _costNode1: HeroGoldMidNode = null;

   @property({
       type: HeroGoldLevelNode,
       visible: true
   })
   _levelNode: HeroGoldLevelNode = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeBgMoving: cc.Node = null;


   @property({
       type: cc.Sprite,
       visible: true
   })
   _nodeSilver: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textSilver: cc.Label = null;

   @property({
       type: CommonStoryAvatar,
       visible: true
   })
   _heroAvatar: CommonStoryAvatar = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonDetail: cc.Button = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeFire: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeTalent: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeOffset: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTalent: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeDes: cc.Node = null;

   @property({
       type: CommonHelpBig,
       visible: true
   })
   _buttonHelp: CommonHelpBig = null;
   
   private _heroUnitData:HeroUnitData;
   private _parentView:any;
   private _signalEventHeroGoldPutRes:any;
   private _curCostKey:any;


   setInitData(parentView) {
    this._parentView = parentView;
}
onCreate() {
    super.onCreate();
    this.setSceneSize(null,true);
    this._initUI();
    this.setLvUpCallback(handler(this, this._lvUpCallBack));
    this._buttonDetail.node.on(cc.Node.EventType.TOUCH_END,this._onButtonDetailClicked,this)
}
onEnter() {
    this._signalEventHeroGoldPutRes = G_SignalManager.add(SignalConst.EVENT_GOLD_HERO_RESOURCE_SUCCESS, handler(this, this._onEventHeroGoldRankUpPutRes));
    this._updateData();
    this._updateCost();
    this._updateView();
    this._updateNodeSliver();
    this._checkCostNodeRedPoint();
    this._costNode1.updateNode(this._heroUnitData);
}
onExit() {
    this._signalEventHeroGoldPutRes.remove();
    this._signalEventHeroGoldPutRes = null;
}
_lvUpCallBack() {
    this._updateView();
    this._updateCost();
    for (var key = LimitCostConst.LIMIT_COST_KEY_2; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
        this['_costDetail' + key].clearEffect();
    }
    this._costNode1.updateNode(this._heroUnitData);
    G_UserData.getAttr().recordPowerWithKey(FunctionConst.FUNC_TEAM);
    G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_GOLD, -5);
}
_updateData() {
    var heroId = G_UserData.getHero().getCurHeroId();
    this._heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
}
_initUI() {

    for (var costKey = LimitCostConst.LIMIT_COST_KEY_2; costKey <= LimitCostConst.LIMIT_COST_KEY_4; costKey++) {
       (this['_costDetail' + costKey] as HeroGoldCostNode).setInitData(costKey,handler(this, this._onClickCostAdd));
       (this['_costNode' + costKey] as HeroGoldCostNode).setExtraInitData(costKey,handler(this, this._onClickCostAdd));
    }
    this._costNode1.setInitData(handler(this, this._onButtonBreakClicked));
    this._buttonHelp.updateLangName('gold_hero_rank_up_help_txt');
    this._heroAvatar.node.scale = (1);
    G_EffectGfxMgr.createPlayMovingGfx(this._nodeBgEffect, 'moving_jinjiangyangcheng_beijing', null, null);
    G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect1, 'moving_jinjiangyangcheng_dabagua', null, null);
    G_EffectGfxMgr.createPlayMovingGfx(this._nodeBgMoving, 'moving_tujie_huohua', null, null, false);
}
_checkIsMaterialFull(costKey) {
    var curCount = this._heroUnitData.getGoldResValue(costKey);
    return curCount >= this._materialMaxSize[costKey];
}
_doPutRes(costKey, materials) {
    var heroId = this._heroUnitData.getId();
    this._curCostKey = costKey;
    var [heroIds, items] = this._getHeroIdsAndItems(costKey, materials);
    G_UserData.getHero().c2sGoldHeroResource(heroId, costKey, heroIds, items);
    this._costMaterials = materials;
}
_getHeroIdsAndItems(costKey, materials) {
    var heroIds = [];
    var items = [];
    var item:any  = {};
    item.type = TypeConvertHelper.TYPE_ITEM;
    item.value = materials[0].id;
    item.size = materials[0].num;
    table.insert(items, item);
    return [
        heroIds,
        items
    ];
}
_updateView() {
    this._levelNode.setCount(this._heroUnitData.getRank_lv());
    var baseId = this._heroUnitData.getBase_id();
    var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId);
    var goldLevel = this._heroUnitData.getRank_lv();
    var name = heroParam.name;
    if (goldLevel > 0) {
        if (HeroGoldHelper.isPureHeroGold(this._heroUnitData)) {
            name = name + (' ' + (Lang.get('goldenhero_train_text') + goldLevel));
        } else {
            name = name + ('+' + goldLevel);
        }
    }
    if (goldLevel == HeroConst.HERO_GOLD_MAX_RANK) {
        this._switchUI(false);
        this._heroAvatar.node.active = (true);
        this._playFire(true);
        var base_id = this._heroUnitData.getBase_id();
        this._heroAvatar.updateUI(base_id, this._heroUnitData.getLimit_level());
    } else {
        this._switchUI(true);
        this._heroAvatar.node.active = (false);
        this._nodeFire.active = (false);
        this._updateTalentDes();
    }
}
_updateTalentDes() {
    var limitLevel = this._heroUnitData.getLimit_level();
    var limitRedLevel = this._heroUnitData.getLimit_rtg()
    var talentLevel = this._heroUnitData.getRank_lv();
    if (talentLevel < HeroConst.HERO_GOLD_MAX_RANK) {
        talentLevel = talentLevel + 1;
    }
    var config = UserDataHelper.getHeroRankConfig(this._heroUnitData.getBase_id(), talentLevel, limitLevel, limitRedLevel);
    var talentName = config.talent_name;
    var talentDes:string = config.talent_description;
    var breakDes:string = Lang.get('hero_gold_txt_break_des', { rank: talentLevel });
    var talentInfo = Lang.get('hero_break_txt_talent_des', {
        name: talentName,
        des: talentDes,
        breakDes: breakDes
    });
    var label:cc.RichText = RichTextExtend.createWithContent(talentInfo);
    label.node.setAnchorPoint(cc.v2(0, 1));
    label.maxWidth = MAX_WIDTH;
    var slen = (talentDes.length+breakDes.length)*label.fontSize;
    if(slen>MAX_WIDTH) slen = MAX_WIDTH;
    var offsetX = slen - NORNAL_WIDTH;
    offsetX = offsetX > 0? offsetX * 0.5:0;
    this._nodeOffset.x = (-offsetX);
    this._nodeDes.removeAllChildren();
    this._nodeDes.addChild(label.node);
    if (config && config.talent_target == 0) {
        this._imageTalent.node.active = (true);
    } else {
        this._imageTalent.node.active = (false);
    }
}
_playFire(isPlay) {
    this._nodeFire.active = (true);
    this._nodeFire.removeAllChildren();
    var effectName = 'effect_jinjiangyangcheng_huoyan';
    var effect = G_EffectGfxMgr.createPlayGfx(this._nodeFire,effectName)
    effect.play();
}
_switchUI(visible) {
    this._nodeTalent.active = (visible);
    this._nodeRes.active = (visible);
    this._nodeResDetail.active = (visible);
    this._levelNode.node.active = (visible);
    this._maskBg.node.active = (visible);
    this._nodeEffect1.active = (visible);
    this._costNode1.node.active = (visible);
}
_updateNodeSliver() {
    if (this._heroUnitData.getRank_lv() == HeroConst.HERO_GOLD_MAX_RANK) {
        this._nodeSilver.node.active = (false);
        return;
    }
    var isCan = HeroGoldHelper.heroGoldCanRankUp(this._heroUnitData);
    this._nodeSilver.node.active = (isCan);
    if (isCan) {
        var silver = HeroGoldHelper.heroGoldTrainCostInfo(this._heroUnitData)[0]['break_size'];
        var strSilver = TextHelper.getAmountText3(silver);
        this._textSilver.string = (strSilver);
    }
}
_onButtonBreakClicked() {
    var isCan = HeroGoldHelper.heroGoldCanRankUp(this._heroUnitData);
    if (isCan) {
        this._curCostKey = LimitCostConst.BREAK_LIMIT_UP;
        G_UserData.getHero().c2sGoldHeroRankUp(this._heroUnitData.getId());
    }
}
_onButtonDetailClicked() {
    G_SceneManager.openPopup(Path.getPrefab("PopupHeroGoldTrainDetail","heroGoldTrain"),function(pop:PopupHeroGoldTrainDetail){
       pop.setInitData(this._heroUnitData);
       pop.openWithAction();
    }.bind(this));
}
_onEventHeroGoldRankUpPutRes(id) {
    this._updateData();
    var costKey = this._curCostKey;
    if (costKey != LimitCostConst.BREAK_LIMIT_UP) {
        this._putResEffect(costKey);
        this._updateNodeSliver();
        this._costNode1.updateNode(this._heroUnitData);
    } else {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_TUPO);
        this._playLvUpEffect();
        this._updateNodeSliver();
    }
    this._checkCostNodeRedPoint();
}
_checkCostNodeRedPoint() {
    var rank_lv = this._heroUnitData.getRank_lv();
    for (var key = LimitCostConst.LIMIT_COST_KEY_2; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
        var curCount = this._heroUnitData.getGoldResValue(key);
        this['_costDetail' + key].checkRedPoint(rank_lv, curCount);
    }
}
_getCostSizeEveryTime(costKey, itemValue, realCostCount, costCountEveryTime) {
    if (costKey == LimitCostConst.LIMIT_COST_KEY_2) {
        return itemValue * realCostCount;
    } else {
        return realCostCount;
    }
}
_getFakeCurSize(costKey) {
    var heroId = G_UserData.getHero().getCurHeroId();
    var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
    return heroUnitData.getGoldResValue(costKey);
}
_getMaterialMaxSize() {
    var materialMaxSize = {};
    for (var key = LimitCostConst.LIMIT_COST_KEY_2; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
        var heroId = G_UserData.getHero().getCurHeroId();
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var costInfo = HeroGoldHelper.heroGoldTrainCostInfo(heroUnitData)[0];
        materialMaxSize[key] = costInfo['size_' + key];
    }
    return materialMaxSize;
}
_playCostNodeSMoving() {
}
_getLimitLevel() {
    return this._heroUnitData.getRank_lv();
}
_updateCost() {
    var rank_lv = this._heroUnitData.getRank_lv();
    for (var key = LimitCostConst.LIMIT_COST_KEY_2; key <= LimitCostConst.LIMIT_COST_KEY_4; key++) {
        var curCount = this._heroUnitData.getGoldResValue(key);
        this['_costDetail' + key].updateUI(rank_lv, curCount);
        this['_costNode' + key].updateUI(rank_lv, curCount);
        var [isFull, isCanFull] = HeroGoldHelper.isHaveCanFullMaterialsByKey(key, this._heroUnitData);
        this['_costDetail' + key].showRedPoint(isCanFull && !isFull);
    }
}

}