import PopupBase from "../../../ui/PopupBase";
import UIHelper from "../../../utils/UIHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { GachaGoldenHeroConst } from "../../../const/GachaGoldenHeroConst";
import { G_AudioManager, G_EffectGfxMgr, G_UserData, G_ConfigLoader } from "../../../init";
import { AudioConst } from "../../../const/AudioConst";
import GoldHeroAvatar from "../gachaGoldHero/GoldHeroAvatar";
import { ConfigNameConst } from "../../../const/ConfigNameConst";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GoldHeroShow extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resource: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceTouch: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property(cc.Prefab)
    goldHeroAvatar:cc.Prefab = null;

    @property(cc.Prefab)
    commonContinueNode:cc.Prefab = null;
    
    _heroId: any;
    _callback: any;
    _campPos: number;

    public static path:string = 'gachaDrawGoldHero/GoldHeroShow';

    ctor(heroId, callback) {
        this._heroId = heroId;
        this._callback = callback;
        this._campPos = 1;
        UIHelper.addClickEventListenerEx(this._resourceTouch, handler(this,this._onCloseView));
    }
    onCreate() {
        this._getCampIndex();
        this._playZhaomu();
    }
    onEnter() {
        this._createContinueNode();
    }
    onExit() {
    }
    _playZhaomu() {
        var heroResConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES);
        var configInfo = heroResConfig.get(this._heroId);
        let effectFunction = function (effect):cc.Node {
            if (effect == 'mingzi') {
                var node = new cc.Node();
                var mingzi = node.addComponent(cc.Sprite);
                UIHelper.loadTexture(mingzi, Path.getGoldHeroTxt(configInfo.gold_hero_show));
                return mingzi.node;
            } else if (effect == 'shuoming') {
                var node = new cc.Node();
                var shuoming = node.addComponent(cc.Sprite);
                UIHelper.loadTexture(shuoming, Path.getGoldHeroTxt(configInfo.gold_hero_show + 'b'));
                return shuoming.node;
            } else if (effect == 'dipan') {
                var node = new cc.Node();
                var shuoming = node.addComponent(cc.Sprite);
                UIHelper.loadTexture(shuoming, Path.getGoldHero(GachaGoldenHeroConst.DRAW_HERO_DIPAN[this._campPos-1]));
                return shuoming.node;
            } else if (effect == 'juese') {
                return this._createHero();
            }
        }.bind(this);
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        this._nodeEffect.removeAllChildren();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_GACHA_EFCGOLDEN_HERO);
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_jinjiangzhaomu_zhengjiang', effectFunction, eventFunction, false);
    }
    _onCloseView() {
        if (this._callback) {
            this._callback();
        }
        this.close();
    }
    _createHero():cc.Node {
        var avatar = cc.instantiate(this.goldHeroAvatar).getComponent(GoldHeroAvatar);
        avatar.updateUI(this._heroId, null, true);
        avatar.setScale(0.8);
        avatar.setNameVisible(false);
        avatar.playAnimationEfcOnce('coming');
        //G_HeroVoiceManager.playVoiceWithHeroId(this._heroId, true);
        return avatar.node;
    }
    _createContinueNode() {
        var continueNode = cc.instantiate(this.commonContinueNode);
        this.node.addChild(continueNode);
        continueNode.setPosition(cc.v2(0, -250));
    }
    _getCampIndex() {
        var heroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        var configInfo = heroConfig.get(this._heroId);
        this._campPos = configInfo.country;
    }
}
