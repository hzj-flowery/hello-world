import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";

import { assert } from "../../../utils/GlobleFunc";

import { Path } from "../../../utils/Path";

import { CountryBossHelper } from "../countryboss/CountryBossHelper";

import { handler } from "../../../utils/handler";

import { G_UserData, G_Prompt, G_ServerTime } from "../../../init";

import { CountryBossConst } from "../../../const/CountryBossConst";

import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;



@ccclass
export default class CountryBossBigBossAvatar extends cc.Component {
    public static IDLE_STATE = 1
    public staticATTACK_STATE = 2
    public static DIE_STATE = 3

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRole: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonHeroAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _isDie: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _topNodeInfo: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBossName: cc.Label = null;
    _bossId: any;
    _state: number;
    _isLeft: boolean;
    static ATTACK_STATE: any;
    _actionConfig: any;
    _bossDieCallback: any;

    ctor(bossId) {
        this._bossId = bossId;
        this._state = CountryBossBigBossAvatar.IDLE_STATE;
        this._isLeft = false;
        var configs = {
            [9]: {
                attackName: 'style',
                hitDelayTime: 1,
                flyDelayTime: 1.5,
                isAttackAll: true
            },
            [10]: {
                attackName: 'style',
                hitDelayTime: 1.2,
                flyDelayTime: 2.5,
                isAttackAll: true
            },
            [11]: {
                attackName: 'style',
                hitDelayTime: 1.3,
                flyDelayTime: 1.8,
                stopAttackDelay: 2.2,
                isAttackAll: false
            },
            [12]: {
                attackName: 'style',
                hitDelayTime: 0.3,
                flyDelayTime: 2.4,
                stopAttackDelay: 3,
                isAttackAll: false
            }
        };
        this._actionConfig = configs[this._bossId];

        this.onCreate();
    }
    onCreate() {
        var cfg = CountryBossHelper.getBossConfigById(this._bossId);
        this._textBossName.string = (cfg.name);
        this._commonHeroAvatar.init();
        this._commonHeroAvatar.updateUI(cfg.hero_id);
        this._commonHeroAvatar.setCallBack(handler(this, this._onBtnGo));
        this._commonHeroAvatar.setTouchEnabled(true);
        this._commonHeroAvatar.scheduleOnce(function(){
            this._commonHeroAvatar._playAnim("idle",true);
        }.bind(this),2)
        var isDie = this.isBossDie();
        this.updateState();
        if (isDie) {
            this._state = CountryBossBigBossAvatar.DIE_STATE;
        } else {
            this._state = CountryBossBigBossAvatar.IDLE_STATE;
        }
    }
    playerAttack() {
        if (this._state == CountryBossBigBossAvatar.IDLE_STATE) {
            this._state = CountryBossBigBossAvatar.ATTACK_STATE;
            this._commonHeroAvatar.playEffectOnce(this._actionConfig.attackName);
            this._commonHeroAvatar.showShadow(false);
            if (this._actionConfig.stopAttackDelay) {
                var seqAction = this._createDelayAction(this._actionConfig.stopAttackDelay, function () {
                    this._returnToNormal();
                }.bind(this));
                this.node.runAction(seqAction);
            } else {
                this._commonHeroAvatar.addSpineLoadHandler(function () {
                    this._returnToNormal();
                }.bind(this));
            }
        }
    }
    _returnToNormal() {
        if (!this._commonHeroAvatar) {
            return;
        }
        this._commonHeroAvatar.setAction('idle', true);
        this._state = CountryBossBigBossAvatar.IDLE_STATE;
        this._commonHeroAvatar.showShadow(true);
    }
    _createDelayAction(dt, callback) {
        var delayAction = cc.delayTime(dt);
        var callFuncAction = cc.callFunc(callback);
        var seqAction = cc.sequence(delayAction, callFuncAction);
        return seqAction;
    }
    isIdle() {
        return this._state == CountryBossBigBossAvatar.IDLE_STATE;
    }
    isAttackAll() {
        return this._actionConfig.isAttackAll;
    }
    getHitDelayTime() {
        return this._actionConfig.hitDelayTime;
    }
    getFlyDelayTime() {
        return this._actionConfig.flyDelayTime;
    }
    turnBack(trueOrFalse) {
        if (trueOrFalse == false) {
            this._isLeft = false;
        } else {
            this._isLeft = true;
        }
        this._commonHeroAvatar.turnBack(trueOrFalse);
    }
    isLeft() {
        return this._isLeft;
    }
    onEnter() {
    }
    onExit() {
    }
    isBossDie() {
        return CountryBossHelper.isBossDie(this._bossId);
    }
    _playDieCallBack() {
        this.updateState();
        if (this._bossDieCallback) {
            this._bossDieCallback();
        }
    }
    setPlayBossDieCallback(callback) {
        this._bossDieCallback = callback;
    }
    updateState() {
        this._isDie.node.active = (this.isBossDie());
    }
    playBossDie() {
        if (this._state != CountryBossBigBossAvatar.IDLE_STATE) {
            return;
        }
        this._state = CountryBossBigBossAvatar.DIE_STATE;
        this._playDieCallBack();
    }
    _onBtnGo() {
        var bossData = G_UserData.getCountryBoss().getBossDataById(this._bossId);
        if (!bossData) {
            return;
        }
        if (bossData.isBossDie()) {
            G_Prompt.showTip(CountryBossHelper.getKillTip(this._bossId));
            return;
        }
        if (CountryBossHelper.getStage() != CountryBossConst.STAGE3) {
            G_Prompt.showTip(Lang.get('country_boss_fight_time_end'));
            return;
        }
        var cdTime = CountryBossHelper.getStage3AttackCd();
        var canFightTime = cdTime + G_UserData.getCountryBoss().getChallenge_boss_time2();
        var curTime = G_ServerTime.getTime();
        if (curTime < canFightTime) {
            G_Prompt.showTip(Lang.get('country_boss_fight_cd'));
            return;
        }
        G_UserData.getCountryBoss().c2sAttackCountryBoss(this._bossId);
    }

}