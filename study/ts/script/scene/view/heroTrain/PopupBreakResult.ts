const { ccclass, property } = cc._decorator;

import AttributeConst from '../../../const/AttributeConst';
import { SignalConst } from '../../../const/SignalConst';
import { HeroUnitData } from '../../../data/HeroUnitData';
import { Colors, G_EffectGfxMgr, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAttrDiff from '../../../ui/component/CommonAttrDiff';
import CommonContinueNode from '../../../ui/component/CommonContinueNode';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import PopupBase from '../../../ui/PopupBase';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { Path } from '../../../utils/Path';
import BreakResultTalentDesNode from '../hero/BreakResultTalentDesNode';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';


@ccclass
export default class PopupBreakResult extends PopupBase {

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
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    private _canContinue: boolean;
    private _heroUnitData: HeroUnitData;
    private _heroId: number;
    private _talentName: string;
    private _talentDes: string;
    private _parentView;

    protected preloadResList = [
        {path:Path.getPrefab("BreakResultTalentDesNode","hero"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonHeroAvatar"),type:cc.Prefab}
    ];
    public setInitData(pv, heroId): void {
        this._parentView = pv;
        this._heroId = heroId;

    }
    onCreate() {
        for (var i = 1; i <= 4; i++) {
            this['_fileNodeAttr' + i].setNameColor(Colors.LIST_TEXT);
            this['_fileNodeAttr' + i].setCurValueColor(Colors.DARK_BG_ONE);
            this['_fileNodeAttr' + i].setNextValueColor(Colors.DARK_BG_ONE);
            this['_fileNodeAttr' + i].showDiffValue(false);
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
    onShowFinish(...vars) {
    }
    onExit() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'PopupBreakResult:_createRoleEffect');
        this._panelTouch.off(cc.Node.EventType.TOUCH_END,this._onClickTouch,this);
        if(this._closeCB)this._closeCB();
        this._closeCB = null;
    }
    private _closeCB:Function;
    public setCloseCallBack(cb:Function):void{
        this._closeCB = cb;
    }
    _onClickTouch() {
        if (this._canContinue) {
            this.close();
        }
    }
    _updateInfo() {
        this._heroUnitData = G_UserData.getHero().getUnitDataWithId(this._heroId);
        var [heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(this._heroUnitData);
        var rankLevel = this._heroUnitData.getRank_lv();
        var limitLevel = avatarLimitLevel || this._heroUnitData.getLimit_level();
        var limitRedLevel = arLimitLevel || this._heroUnitData.getLimit_rtg();
        var heroRankConfig = UserDataHelper.getHeroRankConfig(heroBaseId, rankLevel, limitLevel, limitRedLevel);
        if (heroRankConfig) {
            this._talentName = heroRankConfig.talent_name + '\uFF1A';
            this._talentDes = heroRankConfig.talent_description;
        } else {
            this._talentName = Lang.get('hero_break_txt_all_unlock');
            this._talentDes = '';
        }
        this._textOldLevel.string = (Lang.get('hero_break_result_level', { level: rankLevel - 1 }));
        var strRankLevel = Lang.get('hero_break_result_level', { level: rankLevel });
        this._textNewLevel.string = (strRankLevel);
        var curBreakAttr = HeroDataHelper.getBreakAttr(this._heroUnitData, -1);
        var nextBreakAttr = HeroDataHelper.getBreakAttr(this._heroUnitData);
        this._fileNodeAttr1.updateInfo(AttributeConst.ATK, curBreakAttr[AttributeConst.ATK], nextBreakAttr[AttributeConst.ATK], 3);
        this._fileNodeAttr2.updateInfo(AttributeConst.HP, curBreakAttr[AttributeConst.HP], nextBreakAttr[AttributeConst.HP], 3);
        this._fileNodeAttr3.updateInfo(AttributeConst.PD, curBreakAttr[AttributeConst.PD], nextBreakAttr[AttributeConst.PD], 3);
        this._fileNodeAttr4.updateInfo(AttributeConst.MD, curBreakAttr[AttributeConst.MD], nextBreakAttr[AttributeConst.MD], 3);
        for (var i = 1; i <= 4; i++) {
            this['_fileNodeAttr' + i].setNextValueColor(Colors.DARK_BG_ONE);
        }
        this._textDiffValue1.string = (nextBreakAttr[AttributeConst.ATK] - curBreakAttr[AttributeConst.ATK]).toString();
        this._textDiffValue2.string = (nextBreakAttr[AttributeConst.HP] - curBreakAttr[AttributeConst.HP]).toString();
        this._textDiffValue3.string = (nextBreakAttr[AttributeConst.PD] - curBreakAttr[AttributeConst.PD]).toString();
        this._textDiffValue4.string = (nextBreakAttr[AttributeConst.MD] - curBreakAttr[AttributeConst.MD]).toString();
    }
    _playCurHeroVoice() {
        var baseId = AvatarDataHelper.getShowHeroBaseIdByCheck(this._heroUnitData)[0];
        // G_HeroVoiceManager.playVoiceWithHeroId(baseId, true);
    }
    _initEffect() {
        this._nodeContinue.node.active = (false);
        this._nodeTxt1.active = (false);
        this._nodeTxt3.active = (false);
        for (var i = 1; i <= 4; i++) {
            (this['_fileNodeAttr' + i] as CommonAttrDiff).node.active = (false);
        }
    }
    _playEffect() {
        var effectFunction = function (effect) {
            if (effect == 'moving_wujiangbreak_jiesuo') {
                var desNode = (cc.instantiate(cc.resources.get(Path.getPrefab("BreakResultTalentDesNode","hero"))) as cc.Node).getComponent(BreakResultTalentDesNode) as BreakResultTalentDesNode;
                var textTalentName = desNode.TextTalentName;
                var textTalentDes:cc.Label = desNode.TextTalentDes;
                var imageButtomLine = desNode.ImageButtomLine;
                textTalentName.string = (this._talentName);
                textTalentName["_updateRenderData"](true);
                var nameSize = textTalentName.node.getContentSize();
                var namePosX = textTalentName.node.x;
                textTalentDes.node.width = 290-nameSize.width;
                textTalentDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
                textTalentDes.string = (this._talentDes);
                textTalentDes["_updateRenderData"](true)
                textTalentDes.node.x = (namePosX + nameSize.width + 5);
                var desSize = textTalentDes.node.getContentSize();
                var posLineY = textTalentDes.node.y - desSize.height - 5;
                posLineY = Math.min(posLineY, 0);
                imageButtomLine.node.y = (posLineY);
                return desNode.node;
            }
            if (effect == 'moving_wujiangbreak_txt_1') {
            }
            if (effect == 'moving_wujiangbreak_role') {
                var node = this._createRoleEffect();
                return node;
            }
            return new cc.Node();
        }.bind(this)
        var eventFunction = function (event: string) {
            var stc = event.indexOf("play_txt2_");
            var edc = stc + ("play_txt2_").length;
            if (stc>=0) {
                var index = event.substring(edc);
                (this['_fileNodeAttr' + index] as CommonAttrDiff).node.active = (true);
                (this['_fileNodeAttr' + index] as CommonAttrDiff).showArrow(false);
                G_EffectGfxMgr.applySingleGfx((this['_fileNodeAttr' + index] as CommonAttrDiff).node, 'smoving_wujiangbreak_txt_2', null, null, null);
            }
            else if (event == "play_txt1") {
                this._nodeTxt1.active = (true)
                G_EffectGfxMgr.applySingleGfx(this._nodeTxt1, "smoving_wujiangbreak_txt_1", null, null, null)
            }
            else if (event == "play_jiantou") {

            }
            else if (event == "play_txt3") {
                this._nodeTxt3.active = (true)
                G_EffectGfxMgr.applySingleGfx(this._nodeTxt3, "smoving_wujiangbreak_txt_3", null, null, null)
            }

            else if (event == 'finish') {
                this._canContinue = true;
                this._nodeContinue.node.active = (true);
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN, 'PopupBreakResult');
            }
        }.bind(this)
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_wujiangbreak', effectFunction, eventFunction, false);
        effect.node.setPosition(new cc.Vec2(0, 0));
    }
    _createRoleEffect() {
        var effectFunction = function (effect) {
            if (effect == 'levelup_role') {
                var heroSpine = (cc.instantiate(cc.resources.get(Path.getCommonPrefab("CommonHeroAvatar"))) as cc.Node).getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                var [heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(this._heroUnitData);
                var limitLevel = avatarLimitLevel || this._heroUnitData.getLimit_level();
                var limitRedLevel = arLimitLevel || this._heroUnitData.getLimit_rtg();
                heroSpine.init();
                heroSpine.updateUI(heroBaseId, null, null, limitLevel, null, null, limitRedLevel);
                heroSpine.showShadow(false);
                heroSpine.scheduleOnce(function(){
                    if(heroSpine)
                    heroSpine._playAnim("idle",true);
                },1)
                return heroSpine.node;
            }
            return new cc.Node();
        }.bind(this)
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var node = new cc.Node();
        var effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_wujiangbreak_role', effectFunction, eventFunction, false);
        return node;
    }



}