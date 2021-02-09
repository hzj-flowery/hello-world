const {ccclass, property} = cc._decorator;

import { HeroUnitData } from '../../../data/HeroUnitData';
import { Colors, G_EffectGfxMgr, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrDiff from '../../../ui/component/CommonAttrDiff';
import CommonContinueNode from '../../../ui/component/CommonContinueNode';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonHeroStar from '../../../ui/component/CommonHeroStar';
import PopupBase from '../../../ui/PopupBase';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import BreakResultTalentDesNode from '../hero/BreakResultTalentDesNode';



@ccclass
export default class PopupAwakeResult extends PopupBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect: cc.Node = null;

   @property({
       type: CommonContinueNode,
       visible: true
   })
   _nodeContinue: CommonContinueNode = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeTxt1: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textNewLevel: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textOldLevel: cc.Label = null;

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
   _nodeTxt3: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDiffValue1: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDiffValue2: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDiffValue3: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDiffValue4: cc.Label = null;

   @property({
       type: CommonHeroStar,
       visible: true
   })
   _commonStar: CommonHeroStar = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch: cc.Node = null;

   protected preloadResList = [
       {path:Path.getPrefab("CommonHeroAvatar","common"),type:cc.Prefab},
       {path:Path.getPrefab("BreakResultTalentDesNode","hero"),type:cc.Prefab}
   ]
   private _canContinue:boolean;
   private _heroId:number;
   private _talentDes:string;
   private _heroUnitData:HeroUnitData;

   private _parentView;
    public setInitData(pv,heroId):void{
        this._parentView = pv;
        this._heroId = heroId;

    }

   onCreate() {
    this._isClickOtherClose = true;
    for (var i = 1;i<=4;i++) {
        (this['_fileNodeAttr' + i] as CommonAttrDiff).setNameColor(Colors.LIST_TEXT);
        (this['_fileNodeAttr' + i] as CommonAttrDiff).setCurValueColor(Colors.DARK_BG_ONE);
        (this['_fileNodeAttr' + i] as CommonAttrDiff).setNextValueColor(Colors.DARK_BG_ONE);
        (this['_fileNodeAttr' + i] as CommonAttrDiff).showDiffValue(false);
    }
    this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onClickTouch,this);
}
onEnter() {
    this._canContinue = false;
    this._updateInfo();
    this._initEffect();
    this._playEffect();
    this._playCurHeroVoice();
}
onExit() {
}
_onClickTouch() {
    if (this._canContinue) {
        this.close();
    }
}
_updateInfo() {
    this._heroUnitData = G_UserData.getHero().getUnitDataWithId(this._heroId);
    var heroBaseId = AvatarDataHelper.getShowHeroBaseIdByCheck(this._heroUnitData)[0];
    var awakeCost = HeroDataHelper.getHeroConfig(heroBaseId).awaken_cost;
    var awakeLevel = this._heroUnitData.getAwaken_level();
    var heroAwakenConfig = HeroDataHelper.getHeroAwakenConfig(awakeLevel, awakeCost);
    if (heroAwakenConfig) {
        this._talentDes = heroAwakenConfig.talent_description;
    } else {
        this._talentDes = Lang.get('hero_break_txt_all_unlock');
    }
    var ret = HeroDataHelper.convertAwakeLevel(awakeLevel - 1);
    var star1 = ret[0];
    var level1 = ret[1];
    var ret1 = HeroDataHelper.convertAwakeLevel(awakeLevel);
    var star2 = ret1[0];
    var level2 = ret1[1];
    this._textOldLevel.string = (Lang.get('hero_awake_star_level', {
        star: star1,
        level: level1
    }));
    this._textNewLevel.string = (Lang.get('hero_awake_star_level', {
        star: star2,
        level: level2
    }));
    this._commonStar.setStarOrMoonForPlay(star1);
    var curAttr = HeroDataHelper.getAwakeAttr(this._heroUnitData, -1);
    var nextAttr = HeroDataHelper.getAwakeAttr(this._heroUnitData);
    var curDesInfo = TextHelper.getAttrInfoBySort(curAttr);
    var nextDesInfo = TextHelper.getAttrInfoBySort(nextAttr);
    for (var i = 1;i<=4;i++) {
        var curInfo = curDesInfo[i -1];
        var nextInfo = nextDesInfo[i -1] || {};
        if (curInfo) {
            (this['_fileNodeAttr' + i] as CommonAttrDiff).updateInfo(curInfo.id, curInfo.value, nextInfo.value, 4);
            this['_textDiffValue' + i].string = (nextInfo.value - curInfo.value);
            (this['_fileNodeAttr' + i] as CommonAttrDiff).node.active = (true);
            (this['_textDiffValue' + i]as cc.Label).node.active = (true);
        } else {
            (this['_fileNodeAttr' + i] as CommonAttrDiff).node.active = (false);
            (this['_textDiffValue' + i] as cc.Label).node.active = (false);
        }
        (this['_fileNodeAttr' + i] as CommonAttrDiff).setNextValueColor(Colors.DARK_BG_ONE);
    }
}
_playCurHeroVoice() {
    var baseId = AvatarDataHelper.getShowHeroBaseIdByCheck(this._heroUnitData)[0];
    // G_HeroVoiceManager.playVoiceWithHeroId(baseId, true);
}
_initEffect() {
    this._nodeContinue.node.active = (false);
    this._nodeTxt1.active = (false);
    this._nodeTxt3.active = (false);
    for (var i = 1;i<=4; i++) {
        (this['_fileNodeAttr' + i] as CommonAttrDiff).node.active = (false);
    }
}
_playEffect() {
    var effectFunction = function (effect):cc.Node {
        if (effect == 'moving_wujiangbreak_jiesuo') {
            var desNode = (cc.instantiate(cc.resources.get(Path.getPrefab("BreakResultTalentDesNode","hero"))) as cc.Node).getComponent(BreakResultTalentDesNode) as BreakResultTalentDesNode;
            var textTalentName = desNode.TextTalentName;
            var textTalentDes:cc.Label = desNode.TextTalentDes;
            var imageButtomLine = desNode.ImageButtomLine;
            textTalentName.string = ('');
            textTalentName["_updateRenderData"](true);
            var nameSize = textTalentName.node.getContentSize();
            var namePosX = textTalentName.node.x;
            textTalentDes.node.width = 290-nameSize.width;
            textTalentDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            textTalentDes.string = (this._talentDes);
            textTalentDes["_updateRenderData"](true);
            textTalentDes.node.x = (namePosX + nameSize.width + 5);
            var desSize = textTalentDes.node.getContentSize();
            var posLineY = textTalentDes.node.y - desSize.height - 5;
            posLineY = Math.min(posLineY, 0);
            imageButtomLine.node.y = (posLineY);
            return desNode.node;
        };
        if (effect == 'moving_wujiangbreak_txt_1') {
        }
        if (effect == 'moving_jueseshengxing_role') {
            var node = this._createRoleEffect();
            return node;
        }
        return new cc.Node();
    }.bind(this);
    var eventFunction = function (event:string) {
        var stc = event.indexOf("play_txt2_");
        var edc = stc+("play_txt2_").length;
        if (stc>=0) {
            var index = event.substring(edc);
            (this['_fileNodeAttr' + index] as CommonAttrDiff).node.active = (true);
            (this['_fileNodeAttr' + index] as CommonAttrDiff).showArrow(false);
            G_EffectGfxMgr.applySingleGfx(this['_fileNodeAttr' + index].node, 'smoving_wujiangbreak_txt_2', null, null, null);
        }
        else if (event == 'play_txt1') {
            this._nodeTxt1.active = (true);
            G_EffectGfxMgr.applySingleGfx(this._nodeTxt1, 'smoving_wujiangbreak_txt_1', null, null, null);
        } else if (event == 'star') {
            var awakeLevel = this._heroUnitData.getAwaken_level();
            var star = UserDataHelper.convertAwakeLevel(awakeLevel)[0];
            this._commonStar.playStarOrMoon(star);
        } else if (event == 'play_txt3') {
            this._nodeTxt3.active = (true);
            G_EffectGfxMgr.applySingleGfx(this._nodeTxt3, 'smoving_wujiangbreak_txt_3', null, null, null);
        }  
        else if (event == 'finish') {
            this._canContinue = true;
            this._nodeContinue.node.active = (true);
        }
    }.bind(this);
    var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_jueseshengxing', effectFunction, eventFunction, false);
    effect.node.setPosition(new cc.Vec2(0, 0));
}
_createRoleEffect() {
    var effectFunction = function (effect):cc.Node {
        if (effect == 'levelup_role') {
            var heroSpine = (cc.instantiate(cc.resources.get(Path.getPrefab("CommonHeroAvatar","common"))) as cc.Node).getComponent(CommonHeroAvatar) as CommonHeroAvatar;
            heroSpine.init();
            var [heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(this._heroUnitData);
            var limitLevel = avatarLimitLevel || this._heroUnitData.getLimit_level();
            var limitRedLevel = arLimitLevel || this._heroUnitData.getLimit_rtg();
            heroSpine.updateUI(heroBaseId, null, null, limitLevel, null, null, limitRedLevel);
            heroSpine.showShadow(false);
            heroSpine.scheduleOnce(function(){
                if(heroSpine)
                heroSpine._playAnim("idle",true);
            },1)
            return heroSpine.node;
        }
        return new cc.Node();
    }.bind(this);
    var eventFunction = function (event) {
        if (event == 'finish') {
        }
    }
    var node = new cc.Node();
    var effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_jueseshengxing_role', effectFunction, eventFunction, false);
    return node;
}

}