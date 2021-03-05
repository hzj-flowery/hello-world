const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import { handler } from '../../../utils/handler';
import { CountryBossHelper } from './CountryBossHelper';
import { G_UserData, G_Prompt, G_SceneManager, Colors } from '../../../init';
import { CountryBossConst } from '../../../const/CountryBossConst';
import { Lang } from '../../../lang/Lang';
import { RichTextExtend } from '../../../extends/RichTextExtend';

@ccclass
export default class CountryBossHeroUnitNode extends cc.Component {
    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvatar: CommonHeroAvatar = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageHpBg: cc.Sprite = null;
    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _hpBar: cc.ProgressBar = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _isDie: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _infoBg: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _infoText: cc.Label = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _nameBg: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageName: cc.Sprite = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSword: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _rankTopNode: cc.Node = null;
    _cfg: any;
    _isUnLock: any;
    _isPlaying: boolean;
    _isPlayFirstRankName: any;

    ctor(cfg) {
        this._cfg = cfg;
        this._isUnLock = null;
        this._isPlaying = false;
        
        this.onCreate();
    }
    onCreate() {
        this._heroAvatar.init();
        this._heroAvatar.updateUI(this._cfg.hero_id);
        this._heroAvatar.scheduleOnce( ()=>{
            this._heroAvatar._playAnim("idle", true);
        }, 2)
        this._heroAvatar.setTouchEnabled(true);
        this._heroAvatar.setCallBack(handler(this, this._onBtnGo));
        CountryBossHelper.createSwordEft(this._nodeSword);
        this.stopPlayFirstRankName();
        this._nameBg.node.active = (false);
        if (this._cfg.x > 0) {
            this._heroAvatar.node.scaleX *= -1;
        }
         this.updateUI();
    }
    updateUI() {
        var data = G_UserData.getCountryBoss().getBossDataById(this._cfg.id);
        if (!data) {
            return;
        }
        [this._isUnLock] = CountryBossHelper.getLockString(this._cfg);
        var isBossDie = data.isBossDie();
        var curStage = CountryBossHelper.getStage();
        if (this._isUnLock && curStage != CountryBossConst.NOTOPEN && !isBossDie) {
            this._heroAvatar.cancelShader();
            this._playStyle();
        } else {
            this._heroAvatar.applyShader('gray');
            this._stopPlayStyle();
        }
        this._nodeSword.active = (false);
        this._isDie.node.active = (false);
        this._imageHpBg.node.active = (false);
        if (curStage == CountryBossConst.STAGE3) {
            var final_vote = G_UserData.getCountryBoss().getFinal_vote();
            if (final_vote && final_vote == this._cfg.id) {
                this._nodeSword.active = (true);
            }
            if (isBossDie) {
                this._isDie.node.active = (true);
                this.stopPlayFirstRankName();
            } else {
                if (this._isUnLock) {
                    this._imageHpBg.node.active = (true);
                    var progress = data.getNow_hp()  / data.getMax_hp();
                    if (progress >= 1) {
                        progress = 1;
                    }
                    this._hpBar.progress = (progress );
                }
            }
        } else if (curStage == CountryBossConst.STAGE1) {
            if (this._isUnLock == true) {                 //&& oldIsUnLock == false
                this._heroAvatar.playAnimationOnce('style');
            }
        }
        if (this._isPlayFirstRankName) {
            var firstRank = data.getRankFirst();
            if (firstRank) {
                var rankStr = firstRank.getGuild_name();
                this.setRankTopNodeRichString(rankStr);
            }
        }
    }
    _createDelayAction(dt, callback) {
        var delayAction = cc.delayTime(dt);
        var callFuncAction = cc.callFunc(callback);
        var seqAction = cc.sequence(delayAction, callFuncAction);
        return seqAction;
    }
    _stopPlayStyle() {
        if (this._isPlaying) {
            this._heroAvatar.setAction('idle', true);
        }
        this.node.stopAllActions();
    }
    _playStyle() {
        if (this._isPlaying) {
            return;
        }
        this._isPlaying = true;
        this._heroAvatar.playEffectOnce('style');
        this._heroAvatar.addSpineLoadHandler(function () {
            this._heroAvatar.setAction('idle', true);
            this._isPlaying = false;
        }.bind(this));
        this.node.stopAllActions();
        var action = this._createDelayAction(Math.randInt(10, 15), function () {
            this._playStyle();
        }.bind(this));
        this.node.runAction(action);
    }
    onEnter() {
    }
    onDisable() {
        this._heroAvatar.cancelShader();
    }
    _onBtnGo() {
        var curStage = CountryBossHelper.getStage();
        if (curStage == CountryBossConst.NOTOPEN) {
            G_Prompt.showTip(Lang.get('country_boss_open_tip'));
            return;
        }
        var [isUnlock, lockStr] = CountryBossHelper.getLockString(this._cfg);
        if (!isUnlock) {
            G_Prompt.showTip(lockStr);
            return;
        }
        if (CountryBossHelper.getStage() != CountryBossConst.STAGE3) {
            G_Prompt.showTip(Lang.get('country_boss_not_stage3_tip', { name: this._cfg.name }));
            return;
        }
        var final_vote = G_UserData.getCountryBoss().getFinal_vote();
        if (final_vote != this._cfg.id) {
            G_Prompt.showTip(Lang.get('country_boss_not_final_boss_tip'));
            return;
        }
        G_SceneManager.showScene('countrybossbigboss', this._cfg.id);
    }
    playFirstRankName() {
        var data = G_UserData.getCountryBoss().getBossDataById(this._cfg.id);
        if (!data) {
            return false;
        }
        if (data.isBossDie()) {
            return false;
        }
        var firstRank = data.getRankFirst();
        if (!firstRank) {
            return false;
        }
        var rankStr = firstRank.getGuild_name();
        this.stopPlayFirstRankName();
        this.setRankTopNodeRichString(rankStr);
        this._isPlayFirstRankName = true;
        this._rankTopNode.opacity = (0);
        this._rankTopNode.active = (true);
        this._rankTopNode.setScale(0.1);
        var fadeIn = cc.fadeIn(0.2);
        var scaleToAction1 = cc.scaleTo(0.2, 1.2);
        var appearAction = cc.spawn(fadeIn, scaleToAction1);
        var scaleToAction2 = cc.scaleTo(0.1, 1);
        var delay = cc.delayTime(3);
        var fadeOut = cc.fadeOut(0.5);
        var scaleToAction3 = cc.scaleTo(0.5, 1);
        var disappearAction = cc.spawn(fadeOut, scaleToAction3);
        var callfuncAction = cc.callFunc(function () {
            this.stopPlayFirstRankName();
        }.bind(this));
        var seq = cc.sequence(appearAction, scaleToAction2, delay, disappearAction, callfuncAction);
        this._rankTopNode.runAction(seq);
        return true;
    }
    stopPlayFirstRankName() {
        if (this._isPlayFirstRankName == true || this._isPlayFirstRankName == null) {
            this._isPlayFirstRankName = false;
            this._rankTopNode.stopAllActions();
            this._rankTopNode.active = (false);
            this._rankTopNode.opacity = (255);
            this._rankTopNode.setScale(1);
        }
    }
    setRankTopNodeRichString(name) {
        this._rankTopNode.removeAllChildren();
        var richText = RichTextExtend.createRichTextByFormatString(Lang.get('country_boss_first_rank_rich', { name: name }), {
            defaultColor: Colors.DARK_BG_ONE,
            defaultSize: 20,
            other: { [2]: { outlineColor: Colors.DARK_BG_OUTLINE } }
        });
        this._rankTopNode.addChild(richText.node);
    }
}