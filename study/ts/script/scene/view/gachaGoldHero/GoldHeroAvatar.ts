const {ccclass, property} = cc._decorator;

import CommonGoldenHeroName from '../../../ui/component/CommonGoldenHeroName'

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import UIHelper from '../../../utils/UIHelper';
import { handler } from '../../../utils/handler';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { GachaGoldenHeroConst } from '../../../const/GachaGoldenHeroConst';
import { G_EffectGfxMgr } from '../../../init';

@ccclass
export default class GoldHeroAvatar extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBackEffect: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _avatar: CommonHeroAvatar = null;

    @property({
        type: CommonGoldenHeroName,
        visible: true
    })
    _heroName: CommonGoldenHeroName = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFrontEffect: cc.Node = null;


    _callback: any;
    _heroId: any;
    _hasInit:boolean = false;


    ctor(callback) {
        this._heroId = null;
        this._callback = callback;
        this._init();
    }
    onCreate() {
        this._init();
    }
    onEnter() {
    }
    onExit() {
    }
    _init() {
        if(this._hasInit){
            return;
        }
        this._hasInit = true;
        this._nodeEffect.active = (false);
        UIHelper.addClickEventListenerEx(this._panelTouch, handler(this, this._clickAvatar));
        this._avatar.init();
    }
    _clickAvatar() {
        if (this._callback) {
            this._callback(this._heroId);
        }
    }
    updateUI(heroId, limitLevel, isAni) {
        this._avatar.updateUI(heroId, '', false, limitLevel, null, isAni);
        this._heroId = heroId;
        this._updateCountry();
    }
    _updateCountry() {
        var heroData = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, this._heroId);
        this._heroName.setName(heroData.name);
        this._heroName.setCountryFlag(heroData.country_text);
        this._playCountryEffect(heroData.country);
        var scaleValue = 1;
        if (heroData.name.length > 6) {
            scaleValue = 1 + (heroData.name.length - 6) / 10;
        }
        this._heroName.setCountryScaleY(scaleValue);
    }
    _playCountryEffect(country) {
        var effectName = '';
        var movingName = '';
        if (country == 1) {
            effectName = 'effect_jinjiangzhaomu_dianjiang_qingseshuxian';
            movingName = 'moving_jinjiangzhaomu_down_jiaodiqingse';
        } else if (country == 2) {
            effectName = 'effect_jinjiangzhaomu_dianjiang_chengseshuxian';
            movingName = 'moving_jinjiangzhaomu_jiaodichengse';
        } else if (country == 3) {
            effectName = 'effect_jinjiangzhaomu_dianjiang_lvseshuxian';
            movingName = 'moving_jinjiangzhaomu_jiaodilvse';
        } else if (country == 4) {
            effectName = 'effect_jinjiangzhaomu_dianjiang_ziseshuxian';
            movingName = 'moving_jinjiangzhaomu_jiaodizise';
        }
        this._nodeFrontEffect.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(this._nodeFrontEffect, effectName, null, true);
        function effectFunction(effect) {
        }
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        this._nodeBackEffect.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeBackEffect, movingName,null, eventFunction, false);
    }
    showAvatarEffect(bShow) {
        this._avatar.showAvatarEffect(true);
    }
    setScale(scale) {
        this._avatar.setScale(scale);
    }
    getHeroId() {
        return this._heroId;
    }
    playAnimationLoopIdle(callBack, posIndex) {
        this._avatar.setAniTimeScale(1);
        this._avatar.playAnimationLoopIdle(callBack, posIndex);
    }
    playAnimationOnce(name) {
        this._avatar.setAniTimeScale(1);
        this._avatar.playAnimationOnce(name);
    }
    playAnimationEfcOnce(name) {
        this._avatar.setAniTimeScale(1);
        this._avatar.playAnimationEfcOnce(name);
    }
    playAnimationNormal() {
        this._avatar.setAniTimeScale(1);
        this._avatar.setAction('idle', true);
    }
    setOpacity(opacity) {
        return this._avatar.node.opacity = (opacity);
    }
    getSpine() {
        return this._avatar;
    }
    turnBack(bTrue) {
        this._avatar.turnBack(bTrue);
    }
    setAligement(iType) {
        if (GachaGoldenHeroConst.FLAG_ALIGNMENT_LEFT == iType) {
            this._heroName.node.x = 45-125;
        } else if (GachaGoldenHeroConst.FLAG_ALIGNMENT_RIGHT == iType) {
            this._heroName.node.x = (205)-125;
        }
    }
    setNameVisible(isVisible) {
        this._heroName.node.active = (isVisible);
    }
    setNamePositionY(alignType) {
        if (alignType == 2) {
            this._heroName.node.y = (130);
        } else if (alignType == 1) {
            this._heroName.node.y = (50);
        }
    }
    setFlagScaleY(value) {
        this._heroName.setCountryScaleY(value);
    }
}
