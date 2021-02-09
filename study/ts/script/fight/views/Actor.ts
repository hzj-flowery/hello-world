import EffectGfxSingle from "../../effect/EffectGfxSingle";
import { Colors, G_EffectGfxMgr, G_ConfigLoader, G_AudioManager } from "../../init";
import { HeroSpineNode } from "../../ui/node/HeroSpineNode";
import { SpineNode } from "../../ui/node/SpineNode";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import { FightConfig } from "../FightConfig";
import { FightResourceManager } from "../FightResourceManager";
import EffectActor from "./EffectActor";
import { FightSignalManager } from "../FightSignalManager";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { assert } from "../../utils/GlobleFunc";
import { FightSignalConst } from "../FightSignConst";
import CommonStoryAvatar from "../../ui/component/CommonStoryAvatar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Actor extends cc.Component {

    private _root: cc.Node;
    private _backLayer: cc.Node;
    private _bodyLayer: cc.Node;
    private _infoRoot: cc.Node;
    private _buffLayer: cc.Node;
    private _frontLayer: cc.Node;

    private _heroSpineNode: HeroSpineNode;
    private _animationEffectBack: SpineNode;
    private _animationEffectFore: SpineNode;

    private _labelCount: { [key: number]: cc.Label };
    private _camp: number;
    private _moving: EffectGfxSingle;
    private _buffEffect;
    private _chatBubble: cc.Node;
    private _chatText: cc.Label;
    private _talkIcon: cc.Node;
    private _effectIdle2: EffectActor;
    private _nowColor: string;
    private _towards;

    public init(name: number, camp: number) {

        this._root = new cc.Node("_root");
        this.node.addChild(this._root);
        this._backLayer = new cc.Node("_backLayer");
        this._root.addChild(this._backLayer);
        this._bodyLayer = new cc.Node("_bodyLayer");
        this._root.addChild(this._bodyLayer);

        this._heroSpineNode = HeroSpineNode.create();
        this._heroSpineNode.node.name = name.toString();
        this._heroSpineNode.setData(FightResourceManager.instance.getHeroSpineData(name.toString()));
        this._bodyLayer.addChild(this._heroSpineNode.node);

        this._animationEffectBack = HeroSpineNode.create();
        this._animationEffectBack.node.name = name + '_back_effect';
        this._animationEffectBack.setData(FightResourceManager.instance.getHeroSpineData(name + '_back_effect'));
        this._bodyLayer.addChild(this._animationEffectBack.node);

        this._animationEffectFore = HeroSpineNode.create();
        this._animationEffectFore.node.name = name + '_fore_effect';
        this._animationEffectFore.setData(FightResourceManager.instance.getHeroSpineData(name + '_fore_effect'));
        this._bodyLayer.addChild(this._animationEffectFore.node);

        this._infoRoot = new cc.Node("_infoRoot");
        this.node.addChild(this._infoRoot);
        this._buffLayer = new cc.Node("_buffLayer");
        this._infoRoot.addChild(this._buffLayer);
        this._frontLayer = new cc.Node("_frontLayer");
        this._root.addChild(this._frontLayer);

        this._labelCount = {};
        this._camp = camp;
        this._moving = null;

        this._buffEffect = {};
        this._chatBubble = null;
        this._chatText = null;
        this._talkIcon = null;
        this._effectIdle2 = null;
        this._nowColor = '';
    }

    public setAction(name: string, loop: boolean) {
        this.setAnimation(this._heroSpineNode, name, loop, true);
        if (name.indexOf('skill') > -1 || name.indexOf('win') > -1 ||
            name.indexOf('open') > -1 || name.indexOf('coming') > -1) {
            if (this._animationEffectFore && this._animationEffectFore.isAnimationExist(name)) {
                this.setAnimation(this._animationEffectFore, name, loop, true);
            }
            if (this._animationEffectBack && this._animationEffectBack.isAnimationExist(name)) {
                this.setAnimation(this._animationEffectBack, name, loop, true);
            }
        } else {
            if (this._animationEffectFore) {
                this._animationEffectFore.resetSkeletonPose();
            }
            if (this._animationEffectBack) {
                this._animationEffectBack.resetSkeletonPose();
            }
        }
    }

    public stopEffect() {
        if (this._animationEffectFore) {
            this._animationEffectFore.resetSkeletonPose();
        }
        if (this._animationEffectBack) {
            this._animationEffectBack.resetSkeletonPose();
        }
    }

    public showIdle2Effect(isShow) {
        if (this._effectIdle2) {
            this._effectIdle2.death();
            this._effectIdle2 = null;
        }
        if (isShow) {
            this._effectIdle2 = new cc.Node("_effectIdle2").addComponent(EffectActor);
            this._effectIdle2.init('idle2_effect');
            this._buffLayer.addChild(this._effectIdle2.node);
            this._effectIdle2.setAction('effect', true);
        }
    }

    public setTowards(towards: number) {
        this._towards = towards == FightConfig.campLeft && 1 || -1;
        this._root.scaleX = this._towards;
    }

    public death() {
        var action1 = cc.fadeOut(0.2);
        var action2 = cc.destroySelf();
        var action = cc.sequence(action1, action2);
        this.node.runAction(action);
    }

    public updateHP(value, max) {
    }

    public doOnceBuff(res, pos?) {
        var effect = new cc.Node("onceBuff").addComponent(EffectActor);
        effect.init(res);
        this._buffLayer.addChild(effect.node);
        effect.node.setScale(2.5);
        effect.setOnceAction('effect');
    }

    public doOnceEffect(res) {
        var effect = new cc.Node("onceEffect").addComponent(EffectActor);
        effect.init(res);
        effect.node.setScale(2 * this._camp);
        this._buffLayer.addChild(effect.node);
        effect.node.y = 0;
        effect.setOnceAction('effect');
    }

    public removeBuff(pos) {
        if (this._buffEffect[pos]) {
            var effect = this._buffEffect[pos].buffEffect;
            effect.death();
            effect = null;
            var color = this._buffEffect[pos].buffColor;
            if (color) {
                // TODO:
                // console.error("[Actor] removeBuff");
                // var ShaderHalper = require('ShaderHelper');
                // ShaderHalper.filterNode(this._animation, '', true);
                this._nowColor = '';
            }
            if (this._labelCount[pos]) {
                this._labelCount[pos].node.destroy();
                this._labelCount[pos] = null;
            }
            this._buffEffect[pos] = null;
        }
    }

    public setColorVisible(s) {
        // console.error("[Actor] setColorVisible");
        if (this._nowColor == '') {
            return;
        }
        if (s) {
            if (this._nowColor != '') {
                // TODO:
                // var ShaderHalper = require('ShaderHelper');
                // ShaderHalper.filterNode(this._animation, this._nowColor);
            } else {
                // TODO:
                // var ShaderHalper = require('ShaderHelper');
                // ShaderHalper.filterNode(this._animation, '', true);
            }
        } else {
            // TODO:
            // var ShaderHalper = require('ShaderHelper');
            // ShaderHalper.filterNode(this._animation, '', true);
        }
    }

    public showBuff(res, pos, color, action) {
        if (this._buffEffect[pos]) {
            this.removeBuff(pos);
        }
        var effect = new cc.Node("onceEffect").addComponent(EffectActor);
        effect.init(res);
        this._buffLayer.addChild(effect.node);
        effect.setAction('effect', true);
        effect.node.setScale(2);
        effect.node.scaleX = this._camp * 2;
        var eftColor = null;
        if (color != '') {
            // TODO:
            // var ShaderHalper = require('ShaderHelper');
            // ShaderHalper.filterNode(this._animation, color);
            eftColor = color;
        }
        var show: any = {};
        show.buffEffect = effect;
        show.buffColor = eftColor;
        this._buffEffect[pos] = show;
        if (action != '') {
            this.setAction(action, true);
        }
        this._nowColor = color;
    }

    public showBuffCount(count, colorType, pos) {
        if (count <= 1) {
            if (this._labelCount[pos]) {
                this._labelCount[pos].node.destroy();
                this._labelCount[pos] = null;
            }
            return;
        }
        if (!this._labelCount[pos]) {
            this._labelCount[pos] = UIHelper.createLabel({ fontSize: 20 }).getComponent(cc.Label);
            this._labelCount[pos].string = "x2";
            this._labelCount[pos].fontSize = 20;
            this._buffLayer.addChild(this._labelCount[pos].node, 1);
            this._labelCount[pos].node.setPosition(this._camp * 80, 195);
        }
        this._labelCount[pos].string = ('x' + count);
        var buffColor = Colors.getBuffCountColor(colorType);
        this._labelCount[pos].node.color = buffColor.color;
        UIHelper.enableOutline(this._labelCount[pos], buffColor.outline, 2)
    }

    public isAnimationExist(name) {
        return this._heroSpineNode.isAnimationExist(name);
    }

    public setActionWithCallback(name, callback) {
        this.setAnimationWithCallback(this._heroSpineNode, name, false, callback);
    }

    public showSkill(imageId) {
        function effectFunction(effect) {
            if (effect == 'tiaozi_wenzi') {
                var image = Path.getSkillShow(imageId);
                var sprite = UIHelper.newSprite(image);
                return sprite.node;
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._frontLayer, 'moving_tiaozi_jineng', effectFunction, null, true);
        effect.node.y = 175;
        if (this._towards == -1) {
            effect.node.scaleX = this._towards;
        }
    }

    public talk(face, content) {
        if (!this._chatBubble) {
            this._createChatBubble();
        }
        this._chatBubble.active = (true);
        this._chatBubble.setScale(this._towards * 0.46, 0.46);
        var action1 = cc.scaleTo(7 / 30, this._towards * 1.05, 1.05);
        var action2 = cc.scaleTo(1 / 10, this._towards * 1, 1);
        var action = cc.sequence(action1, action2);
        this._chatBubble.runAction(action);
        this._chatText.string = (content);
        if (this._talkIcon) {
            this._talkIcon.destroy();
            this._talkIcon = null;
        }
        if (face != 0) {
            this._talkIcon = UIHelper.newSprite(Path.getChatFaceRes(face)).node;
            this._chatBubble.addChild(this._talkIcon);
            this._talkIcon.setPosition(25, 100);
            if (this._towards == -1) {
                this._talkIcon.x = (225);
            }
        }
    }

    public stopTalk() {
        if (this._chatBubble) {
            this._chatBubble.active = (false);
        }
    }

    public _createChatBubble() {
        this._chatBubble = UIHelper.newSprite(Path.getChatFormRes('03')).node;
        this._chatBubble.name = "_chatBubble";
        this._chatBubble.setAnchorPoint(0, 0);
        var parentNode = this.node.getParent().getParent();
        parentNode.addChild(this._chatBubble, FightConfig.UNIT_TALK_Z_ORDER);
        var positionX = this.node.x;
        var positionY = this.node.y;
        this._chatBubble.setPosition(positionX + 30, positionY + 60);
        this._chatBubble.scaleX = this._towards;
        this._chatText = UIHelper.createLabel({ fontSize: 20 }).getComponent(cc.Label);
        this._chatText.node.name = "_chatText";
        this._chatText.string = "";
        this._chatText.node.setAnchorPoint(0, 0.5);
        this._chatText.node.setPosition(40, 48);
        this._chatText.node.color = Colors.getTypeAColor();
        this._chatBubble.addChild(this._chatText.node);
        if (this._towards == -1) {
            this._chatText.node.scaleX = (-1);
            this._chatText.node.x = (225);
            this._chatBubble.x = (positionX - 30);
        }
        this._chatText.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        this._chatText.node.width = (195);
    }

    public showBuffLayer(s) {
        this._buffLayer.active = (s);
    }

    public playCombineDuang(callback) {
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._frontLayer, 'moving_hejitiaozi_duang', null, null, true);
        effect.node.y = (175);
        if (this._towards == -1) {
            effect.node.scaleX = (this._towards);
        }
    }

    public playFade(isIn, istransparent?) {
        if (isIn) {
            if (this._chatBubble) {
                this._chatBubble.active = (false);
            }
            if (istransparent) {
                this.node.opacity = (100);
                return;
            }
            var action = cc.fadeIn(0.5);
            this.node.runAction(action);
        } else {
            var action = cc.fadeOut(0.5);
            this.node.runAction(action);
        }
    }

    public playEffect(spine, action) {
        var effect = new cc.Node("onceEffect").addComponent(EffectActor);
        effect.init(spine);
        this._buffLayer.addChild(effect.node);
        effect.setAction(action);
    }

    public doMoving(moving) {
        if (!this._moving) {
            this._moving = G_EffectGfxMgr.applySingleGfx(this._root, moving);
        }
    }

    public stopMoving() {
        if (this._moving) {
            this._moving.stop();
            this._root.setPosition(0, 0);
        }
        this._moving = null;
    }

    private setAnimation(spineNode: SpineNode, name: string, loop: boolean, reset: boolean) {
        if ((spineNode.getAnimationName() == 'idle' || spineNode.getAnimationName() == 'dizzy') && name == spineNode.getAnimationName()) {
            return;
        }
        var loopAction = loop;
        if (name == 'idle' || name == 'dizzy') {
            loopAction = true;
        }
        return spineNode.setAnimation(name, loopAction, reset);
    }

    private setAnimationWithCallback(spineNode: SpineNode, name: string, reset: boolean, callback: Function) {
        spineNode.setAnimation(name, false, reset);
        spineNode.signalComplet.addOnce(function () {
            callback();
        });
    }
    playHistoryShowAnim(hisHeroId, skillId, stageId) {
        // var CSHelper = require('CSHelper');
        var HistoricalHero = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO);
        var HeroSkillPlay = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_PLAY);
        var HeroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES);
        var fightSignalManager = FightSignalManager.getFightSignalManager();
        var heroData = HistoricalHero.get(hisHeroId);
        assert(heroData, 'wrong history hero id ' + hisHeroId);
        var heroResData = HeroRes.get(heroData.res_id);
        assert(heroResData, 'wrong history hero res id ' + heroData.res_id);
        var anim = FightConfig.getHistoryAnimShow(heroData.color);

        function effectFunction(effect) {
            if (effect == 'weizi') {
                var skillShow = HeroSkillPlay.get(skillId);
                assert(skillShow, 'wrong skill show id = ' + skillId);
                var image = Path.getSkillShow(skillShow.txt);
                var sprite = UIHelper.newSprite(image);
                return sprite.node;
            } else if (effect == 'lihui') {
                var commonStoryAvatar: cc.Prefab = cc.resources.get(Path.getCommonPrefab("CommonStoryAvatar"));
                var avatar = cc.instantiate(commonStoryAvatar).getComponent(CommonStoryAvatar);
                var resId = heroData.res_id;
                avatar.updateUIByResId(resId);
                return avatar.node;
            } else if (effect == 'texiao') {
                var spineNode = SpineNode.create();
                spineNode.setAsset(Path.getFightEffectSpine(heroResData.hero_show_effect));
                spineNode.setAnimation('effect');
                return spineNode.node;
            }
        }
        function eventFunction(event) {
            if (event == 'skill') {
                fightSignalManager.dispatchSignal(FightSignalConst.SIGNAL_HISTORY_BUFF, stageId);
            } else if (event == 'finish') {
                fightSignalManager.dispatchSignal(FightSignalConst.SIGNAL_HISTORY_SHOW_END, stageId);
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._frontLayer, anim, effectFunction, eventFunction, true);
        if (heroData.color == 5) {
            var voiceRes = Path.getHeroVoice(heroResData.voice);
            G_AudioManager.playSound(voiceRes);
        }
    }
}