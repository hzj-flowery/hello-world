import { AudioConst } from "../../../const/AudioConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { CrossWorldBossConst } from "../../../const/CrossWorldBossConst";
import { G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_ServerTime, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { HeroSpineNode } from "../../../ui/node/HeroSpineNode";
import { SpineNode } from "../../../ui/node/SpineNode";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import { CrossWorldBossHelperT } from "./CrossWorldBossHelperT";


const {ccclass, property} = cc._decorator;

@ccclass

export default class CrossWorldBossAvatarNode extends ViewBase {
    name: 'CrossWorldBossAvatarNode';
    @property({
        type: cc.Node,
        visible: true
    })
    _bossSpineNode: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeWeekCount: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _bossDizzSpineNode: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldEffectNode: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldIdleEffectNode: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldIdleEffectNode1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProgress: cc.Node = null;
    @property({
        type: cc.Mask,
        visible: true
    })
    _nodeEffect: cc.Mask = null;
    
    
    @property({
        type: cc.Label,
        visible: true
    })
    _weekLeftTime: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _leftTime: cc.Label = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageZhenyin: cc.Sprite = null;

    
    @property({
        type: cc.Label,
        visible: true
    })
    _labelProgress: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _bossClickPanel: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoint1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoint2: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoint3: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoint4: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoint5: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoint6: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoin1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoin2: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoin3: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoin4: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoin5: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _shieldLeftPoin6: cc.Node = null;


    
    
    private _countdownTimer:Function;
    private _attackedTimes:number = 0;
    private _baseId:number = 0;
    private _stateRestTime:number = 0;
    private _isFadeOuting:boolean = false;
    private _curState:number;
    private _totalStamina:number;
    private _idleLoopSoundId:number;
    private _spineBoss:HeroSpineNode;
    private _effectNode:cc.Node;
    onCreate() {
        this._spineBoss = HeroSpineNode.create() as HeroSpineNode;
        this._spineBoss.setScale(0.8);
        this._bossSpineNode.addChild(this._spineBoss.node);
        this._showProgressEffect();
        this._totalStamina = CrossWorldBossHelperT.getParameterValue('stamina_default') * G_UserData.getBase().getOpenServerDayNum();
        this._bossClickPanel.on(cc.Node.EventType.TOUCH_START,this._onBossClick,this);
    }
    onEnter() {
    }
    onExit() {
        this._endStateCountdown();
        if (this._idleLoopSoundId) {
            G_AudioManager.stopSound(this._idleLoopSoundId);
            this._idleLoopSoundId = null;
        }
        this._bossClickPanel.off(cc.Node.EventType.TOUCH_START,this._onBossClick,this);
    }
    updateUI() {
    }
    _onBossClick() {
        var [isOpen] = G_UserData.getCrossWorldBoss().isBossStart();
        if (isOpen == false) {
            G_Prompt.showTip(Lang.get('worldboss_no_open'));
            return;
        }
        if (CrossWorldBossHelperT.checkBossFight() == false) {
            return;
        }
        G_UserData.getCrossWorldBoss().c2sAttackCrossWorldBoss();
    }
    changeZorderByPos() {
        var posX, posY;
        posX = this.node.x;
        posY = this.node.y;
        this._nodeWeekCount.zIndex = (10000 - posY);
    }
    updateBaseId(spineName) {
        var resJson = Path.getSpine(spineName);
        this._spineBoss.setAsset(resJson);
        this._spineBoss.signalLoad.add(()=> {
            this.changeBossState(this._curState);
        });
    }
    playAnimation(name, isLoop) {
        this._spineBoss.setAnimation(name, isLoop);
    }
    playAnimationOnce(name) {
        this._spineBoss.setAnimation(name, false);
        this._spineBoss.signalComplet.addOnce(()=> {
            this._spineBoss.setAnimation('idle', true);
        });
    }
    updateBossStamina() {
    }
    changeBossState(newState) {
        this._nodeWeekCount.active = (false);
        if (this._curState == newState) {
            return;
        }
        var oldState = this._curState;
        this._curState = newState;
        if (this._idleLoopSoundId) {
            G_AudioManager.stopSound(this._idleLoopSoundId);
            this._idleLoopSoundId = null;
        }
        this._endStateCountdown();
        this._bossDizzSpineNode.removeAllChildren();
        if (this._curState == CrossWorldBossConst.BOSS_NORMAL_STATE) {
            this._shieldEffectNode.removeAllChildren();
            this._shieldIdleEffectNode.removeAllChildren();
            this._shieldIdleEffectNode1.removeAllChildren();
            if (oldState == CrossWorldBossConst.BOSS_CHARGE_STATE) {
                this.playBossShieldEffect(CrossWorldBossConst.BOSS_SHIELD_BOOM_EFFECT);
                var bossInfo = CrossWorldBossHelperT.getBossInfo();
                if (bossInfo) {
                    var voicePath = Path.getSkillVoice(bossInfo.voice2);
                    G_AudioManager.playSound(voicePath);
                }
            }
            this.playAnimation('idle', true);
        } else if (this._curState == CrossWorldBossConst.BOSS_CHARGE_STATE) {
            this._startStateCountdown();
            this.playBossShieldIdleEffect();
            this.playAnimation('xuli', true);
            if (oldState == CrossWorldBossConst.BOSS_NORMAL_STATE) {
                var bossInfo = CrossWorldBossHelperT.getBossInfo();
                if (bossInfo) {
                    var voicePath = Path.getSkillVoice(bossInfo.voice1);
                    G_AudioManager.playSound(voicePath);
                }
            }
        } else if (this._curState == CrossWorldBossConst.BOSS_WEAK_STATE) {
            this._shieldIdleEffectNode.removeAllChildren();
            this._shieldIdleEffectNode1.removeAllChildren();
            if (oldState == CrossWorldBossConst.BOSS_CHARGE_STATE) {
                this.playBossShieldEffect(CrossWorldBossConst.BOSS_SHIELD_BREAK_EFFECT);
            }
            this._nodeWeekCount.active = (true);
            this.playAnimation('dizzy', true);
            this.showBossDizzEffect();
        }
    }
    setWeekCountdownLabel(t) {
        this._weekLeftTime.string =  (Lang.get('country_boss_meeting_countdown', { num: t }));
    }
    bossAttackedCallback(isPozhao, attackPosX) {
        if (this._curState == CrossWorldBossConst.BOSS_NORMAL_STATE) {
            this._attackedTimes = this._attackedTimes + 1;
            if (this._attackedTimes >= 2) {
                this.playAnimationOnce('hit');
                this._attackedTimes = 0;
            }
        }
        if (this._curState != CrossWorldBossConst.BOSS_CHARGE_STATE) {
            return;
        }
        if (isPozhao) {
            this.playBossShieldEffect(CrossWorldBossConst.BOSS_SHIELD_POZHAO_ATTACK_EFFECT, attackPosX);
        } else if (attackPosX > 568) {
            this.playBossShieldEffect(CrossWorldBossConst.BOSS_SHIELD_RIGHT_ATTACK_EFFECT);
        } else {
            this.playBossShieldEffect(CrossWorldBossConst.BOSS_SHIELD_LEFT_ATTACK_EFFECT);
        }
    }
    doFadeOutAction() {
        this._isFadeOuting = true;
        this._spineBoss.setAnimation('idle', true);
    }
    _resetFlag() {
    }
    hideBoss() {
        if (this._isFadeOuting) {
            return;
        }
        this.node.active = (false);
    }
    _startStateCountdown() {
        var stateStartTime = G_UserData.getCrossWorldBoss().getState_startTime();
        var stateContinueTime = CrossWorldBossHelperT.getParameterValue('charge_last_time');
        var curTime = G_ServerTime.getTime();
        this._stateRestTime = stateStartTime + stateContinueTime - curTime;
        this._stateRestTime = Math.min(this._stateRestTime, stateContinueTime);
        this._endStateCountdown();
        this._nodeProgress.active = (true);
        if (curTime < stateStartTime + stateContinueTime) {
            this._countdownTimer = handler(this, this._updateCountdown);
            this.schedule(this._countdownTimer, 1);
            this._leftTime.string =  (Lang.get('country_boss_meeting_countdown', { num: this._stateRestTime }));
        } else {
            cc.log('self._nodeProgress:active = (false)');
            this._nodeProgress.active = (false);
        }
    }
    _updateCountdown() {
        this._stateRestTime = this._stateRestTime - 1;
        if (this._stateRestTime <= 0) {
            this._endStateCountdown();
        } else {
            this._leftTime.string =  (Lang.get('country_boss_meeting_countdown', { num: this._stateRestTime }));
        }
    }
    _endStateCountdown() {
        if (this._countdownTimer) {
            this.unschedule(this._countdownTimer);
            this._countdownTimer = null;
        }
        this._nodeProgress.active = (false);
    }
    setBossCampIcon() {
        var bossInfo = CrossWorldBossHelperT.getBossInfo();
        if (bossInfo) {
            var path = Path.getTextSignet('img_cross_boss_camp0' + bossInfo.camp_1);
            UIHelper.loadTexture(this._imageZhenyin,path)
        }
    }
    setBossStamina() {
        var bossStamina = G_UserData.getCrossWorldBoss().getStamina();
        var totalStamina = G_UserData.getCrossWorldBoss().getTotal_stamina();
        var percent = bossStamina / totalStamina;
        percent = Math.min(1, Math.max(percent, 0));
        this._labelProgress.string =  (Math.ceil(percent*100) + '%');
        this._effectNode.y = (-45 + 85 * percent);
    }
    showBossDizzEffect() {
        var spineRipple = SpineNode.create();
        this._bossDizzSpineNode.removeAllChildren();
        this._bossDizzSpineNode.addChild(spineRipple.node);
        spineRipple.setAsset(Path.getFightEffectSpine('sp_03yunxuan'));
        spineRipple.setAnimation('effect', true);
    }
    _showProgressEffect() {
        this._effectNode = new cc.Node();
        var spineRipple = SpineNode.create();
        this._effectNode.addChild(spineRipple.node);
        spineRipple.setAsset(Path.getEffectSpine('tujieshui'));
        spineRipple.setAnimation('purple', true);
        this._effectNode.y = (-45);
        this._nodeEffect.node.addChild(this._effectNode);
    }
    playBossShieldEffect(effectType, attackPosX?) {
        var movingName = '';
        if (effectType == CrossWorldBossConst.BOSS_SHIELD_IDLE_EFFECT) {
            movingName = 'moving_BOSSdun_cj';
        } else if (effectType == CrossWorldBossConst.BOSS_SHIELD_POZHAO_ATTACK_EFFECT) {
            movingName = 'moving_BOSSdun_baodian';
        } else if (effectType == CrossWorldBossConst.BOSS_SHIELD_LEFT_ATTACK_EFFECT) {
            movingName = 'moving_BOSSdun_fantan_1';
            G_AudioManager.playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_FANTAN_SOUND);
        } else if (effectType == CrossWorldBossConst.BOSS_SHIELD_RIGHT_ATTACK_EFFECT) {
            movingName = 'moving_BOSSdun_fantan_2';
            G_AudioManager.playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_FANTAN_SOUND);
        } else if (effectType == CrossWorldBossConst.BOSS_SHIELD_BOOM_EFFECT) {
            movingName = 'moving_BOSSdun_skill';
            G_AudioManager.playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_BOOM_SOUND);
        } else if (effectType == CrossWorldBossConst.BOSS_SHIELD_BREAK_EFFECT) {
            movingName = 'moving_BOSSdun_hit';
            G_AudioManager.playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_BREAK_SOUND);
        }
        function eventFunction(event, frameIndex, movingNode) {
            if (event == 'finish') {
            }
        }
        if (effectType == CrossWorldBossConst.BOSS_SHIELD_BREAK_EFFECT) {
            this._shieldIdleEffectNode.removeAllChildren();
            this._shieldIdleEffectNode1.removeAllChildren();
        }
        if (effectType == CrossWorldBossConst.BOSS_SHIELD_POZHAO_ATTACK_EFFECT) {
            this._playPozhaoAttackedEffect(attackPosX);
        } else {
            this._shieldEffectNode.removeAllChildren();
            G_EffectGfxMgr.createPlayMovingGfx(this._shieldEffectNode, movingName, null, eventFunction, true);
        }
    }
    playBossShieldIdleEffect() {
        this._shieldIdleEffectNode.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._shieldIdleEffectNode, 'moving_BOSSdun_cj', null, null, true);
        this._shieldIdleEffectNode1.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._shieldIdleEffectNode1, 'moving_BOSSdun_cj_di', null, null, true);
        this._idleLoopSoundId = G_AudioManager.playSoundWithIdExt(AudioConst.SOUND_CROSS_SHIELD_IDLE_SOUND, null, true);
    }
    _playPozhaoAttackedEffect(attackPosX) {
        var shuffle = function (list) {
            var length = list.length;
            for (let k in list) {
                var v = list[k];
                var newK = Math.floor(Math.random()*length);
                if(newK==length)newK = length - 1;
                var oldValue = list[k];
                list[k] = list[newK];
                list[newK] = oldValue;
                length = length - 1;
            }
        }.bind(this);
        var indexArray = [
            1,
            2,
            3,
            4,
            5,
            6
        ];
        shuffle(indexArray);
        cc.log(indexArray);
        var num = Math.floor(Math.random()*6);
        num = num==6?5:num;
        var actionArrays = [];
        var movingName = '_shieldLeftPoint';
        if (attackPosX > 568) {
            movingName = '_shieldRightPoint';
        }
        for (var i = 0; i < num; i++) {
            var index = indexArray[i];
            var effectAction = cc.callFunc(()=> {
                G_AudioManager.playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_ATTACKED_SOUND);
                this[movingName + index].removeAllChildren();
                G_EffectGfxMgr.createPlayMovingGfx(this[movingName + index], 'moving_BOSSdun_baodian', null, null, true);
            });
            var delayAction = cc.delayTime(0.5);
            table.insert(actionArrays, effectAction);
            table.insert(actionArrays, delayAction);
        }
        var action = cc.sequence(actionArrays);
        this.node.runAction(action);
    }
}