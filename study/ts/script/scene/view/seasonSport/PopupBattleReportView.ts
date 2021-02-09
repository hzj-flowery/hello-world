const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_SignalManager, G_EffectGfxMgr, G_AudioManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import { SpineNode } from '../../../ui/node/SpineNode';
import { Path } from '../../../utils/Path';
import { SeasonSportHelper } from './SeasonSportHelper';
import { Lang } from '../../../lang/Lang';
import UIHelper from '../../../utils/UIHelper';
import { AudioConst } from '../../../const/AudioConst';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';

@ccclass
export default class PopupBattleReportView extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelSpineUI: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _effectSpine: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar1: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar2: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar3: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar4: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar5: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageHighest: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textHighest: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStarNum: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageDanName: cc.Sprite = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _reportOk: CommonButtonLevel0Highlight = null;

    @property({ type: cc.Sprite, visible: true })
    _imageInHerit: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textInherit: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageWin: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageLose: cc.Sprite = null;

    private _isWin;
    private _isGotSeasonRewards;
    private _isInherits;
    private _intervalTime;
    private _isPlayRewardsEffect;
    private _isPlayAnimation;
    private _waitingtimePlayAni;
    private _isUpdateImageStarBackOpacity;
    private _updateState;
    private _curStar;
    private _isInitStarOver;
    private _popupGetRewards;
    // private _effectSpineHuiZhnagNode: SpineNode;
    private _effectSpineHuiZhnagNode: cc.Sprite;
    private _getSeasonRewardsCallBack;

    private _getSeasonRewards;

    public init(isWin, isGotSeasonRewards, isInherits) {
        this._isWin = isWin;
        this._isGotSeasonRewards = isGotSeasonRewards;
        this._isInherits = isInherits;
        this._intervalTime = 0;
        this._isPlayRewardsEffect = false;
        this._isPlayAnimation = false;
        this._waitingtimePlayAni = 0;
        this._isUpdateImageStarBackOpacity = false;
        this._updateState = 0;
        this._curStar = 0;
        this._isInitStarOver = false;
        this._popupGetRewards = null;

        this._reportOk.addClickEventListenerEx(handler(this, this._onReportOk));
    }

    public onCreate() {
        if (G_UserData.getSeasonSport().isReceivedRewards()) {
            this._curStar = G_UserData.getSeasonSport().getLastSeason_Star();
        } else {
            this._curStar = G_UserData.getSeasonSport().getCurSeason_Star();
        }
        if (this._curStar < 1) {
            this._curStar = 1;
        }
        this._imageStarNum.node.active = false;
        this._imageDanName.node.active = false;
        this._initView(this._isInherits);
        this._initDanStarView();
        this._createHuiZhangSpine();
    }

    public onEnter() {
        this._getSeasonRewards = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_REWARDS, handler(this, this._onGetSeasonRewards));
        if (parseInt(this._curStar) > SeasonSportConst.POSITION_HEIGHEST_KINGSTAR) {
            this._initDanStarView();
            this._playHuiZhangSpine(handler(this, this._updateKingStar));
        } else {
            this._imageHighest.node.active = false;
            if (this._isInherits) {
                this._playHuiZhangSpine(handler(this, this._updateNormalStarUI));
            } else {
                this._playHuiZhangSpine(handler(this, this._initStarUI));
            }
        }
        this.schedule(handler(this, this._update), 0.5);
    }

    public onExit() {
        this._getSeasonRewards.remove();
        this._getSeasonRewards = null;
        this.unschedule(handler(this, this._update));
    }

    private _initDanStarView() {
        for (var index = 1; index <= 5; index++) {
            this['_imageStar' + index].node.active = false;
        }
    }

    private _createHuiZhangSpine() {
        // this._effectSpineHuiZhnagNode = new SpineNode(1);
        // this._effectSpineHuiZhnagNode.setAsset(Path.getSpine('huizhang'));
        // this._effectSpineHuiZhnagNode.node.active = false;
        // this._effectSpine.addChild(this._effectSpineHuiZhnagNode.node);
        this._effectSpineHuiZhnagNode = new cc.Node().addComponent(cc.Sprite);
        // this._effectSpineHuiZhnagNode.setAsset(Path.getSpine('huizhang'));
        this._effectSpineHuiZhnagNode.node.active = false;
        this._effectSpine.addChild(this._effectSpineHuiZhnagNode.node);
    }

    private _playHuiZhangSpine(callback) {
        var state = 0;
        var dan = parseInt(SeasonSportHelper.getDanInfoByStar(this._curStar).rank_1);
        if (this._curStar > 1) {
            let beforeStar = this._isWin && this._curStar - 1 || this._curStar + 1;
            let beforeDan = parseInt(SeasonSportHelper.getDanInfoByStar(beforeStar).rank_1);
            let bUp = dan - beforeDan == 1 || false;
            let bDown = dan - beforeDan == -1 || false;
            if (this._isInherits == false) {
                if (bUp) {
                    state = 1;
                } else if (bDown) {
                    state = 2;
                }
            }
        }
        var idle2 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][2 - 1];
        this._effectSpineHuiZhnagNode.node.active = true;
        if (state == 1) {
            let beforeStar = this._curStar - 1;
            let beforeDan = parseInt(SeasonSportHelper.getDanInfoByStar(beforeStar).rank_1);
            idle2 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[beforeDan][2 - 1];
        } else if (state == 2) {
            let beforeStar = this._curStar + 1;
            let beforeDan = parseInt(SeasonSportHelper.getDanInfoByStar(beforeStar).rank_1);
            idle2 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[beforeDan][2 - 1];
        }
        this._effectSpineHuiZhnagNode.node.active = true;
        // this._effectSpineHuiZhnagNode.setAnimation(idle2, true);
        UIHelper.loadTexture(this._effectSpineHuiZhnagNode, Path.getSeasonSportUI(SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][0]));
        if (callback) {
            callback();
        }
    }

    private _playDemotionHuizhang(bCrossDemotion, finishCallBack) {
        var dan = parseInt(SeasonSportHelper.getDanInfoByStar(this._curStar).rank_1);
        var demotionDan = parseInt(SeasonSportHelper.getDanInfoByStar(this._curStar + 1).rank_1);
        var idle1 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][1 - 1];
        var idle2 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][2 - 1];
        var idle3 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[demotionDan][3 - 1];
        var crossIdle = bCrossDemotion && idle3 || idle1;
        this._effectSpineHuiZhnagNode.node.active = true;
        // this._effectSpineHuiZhnagNode.setAnimation(crossIdle, false);
        // this._effectSpineHuiZhnagNode.signalComplet.addOnce(() => {
        //     this._effectSpineHuiZhnagNode.setAnimation(idle2, true);
        //     if (finishCallBack) {
        //         finishCallBack();
        //     }
        // });
        UIHelper.loadTexture(this._effectSpineHuiZhnagNode,Path.getSeasonSportUI(SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][0]));
        if (finishCallBack) {
            finishCallBack();
        }
    }

    private _palyDropAnimation(rootNode: cc.Node) {
        G_EffectGfxMgr.createPlayMovingGfx(rootNode, 'moving_huizhangxingxiaoshi', null, null, false);
    }

    private _palyRelegationAnimation(rootNode: cc.Node, bInit) {
        function eventFunction(event) {
            if (event == 'finish') {
                this._isInitStarOver = bInit;
            }
        }
        var movingFlash = this._isWin && 'moving_huizhangxiaoxingxing' || 'moving_huizhangxingxiaoshi';
        G_EffectGfxMgr.createPlayMovingGfx(rootNode, movingFlash, null, eventFunction.bind(this), false);
    }

    public setGotSeasonRewardsCloseCallBack(callback) {
        this._getSeasonRewardsCallBack = callback;
    }

    private _initView(bInHerit) {
        if (bInHerit == false) {
            this._imageWin.node.active = (this._isWin);
            this._imageLose.node.active = (!this._isWin);
            this._imageInHerit.node.active = false;
            this._reportOk.setString(Lang.get('season_report_ok'));
        } else {
            this._imageWin.node.active = false;
            this._imageLose.node.active = false;
            this._imageInHerit.node.active = true;
            if (this._isGotSeasonRewards) {
                this._reportOk.setString(Lang.get('season_report_continue'));
                this._textInherit.string = Lang.get('season_lastrewards_got');
            } else {
                this._reportOk.setString(Lang.get('season_daily_buy'));
                this._textInherit.string = Lang.get('season_lastrewards_toget');
            }
        }
    }

    private _updateKingStar() {
        var dan = SeasonSportHelper.getDanInfoByStar(this._curStar);
        var curstar = parseInt(dan.star2);
        this._imageHighest.node.active = true;
        this._textHighest.string = curstar.toString();
        this._imageStarNum.node.active = true;
        this._imageDanName.node.active = true;
        UIHelper.loadTexture(this._imageStarNum, Path.getSeasonStar(dan.name_pic));
        UIHelper.loadTexture(this._imageDanName, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[parseInt(dan.rank_1) - 1]));
    }

    private _updateNormalStarUI() {
        var dan = SeasonSportHelper.getDanInfoByStar(this._curStar);
        var star_max = parseInt(dan.star_max);
        var curstar = parseInt(dan.star2);
        star_max = star_max > SeasonSportConst.SEASON_STAR_WANGZHE_MAX && SeasonSportConst.SEASON_STAR_WANGZHE_MAX || star_max;
        for (var index = 1; index <= star_max; index++) {
            var slot = star_max == SeasonSportConst.SEASON_STAR_MAX && index + 1 || index;
            this['_imageStar' + slot].node.active = true;
            if (index <= curstar) {
                UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[1 - 1]));
            } else {
                UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2 - 1]));
            }
        }
        this._imageStarNum.node.active = true;
        this._imageDanName.node.active = true;
        UIHelper.loadTexture(this._imageStarNum, Path.getSeasonStar(dan.name_pic));
        UIHelper.loadTexture(this._imageDanName, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[parseInt(dan.rank_1) - 1]));
    }

    private _initStarUI() {
        var beforeStar = this._isWin == true && this._curStar - 1 || this._curStar + 1;
        var dan = SeasonSportHelper.getDanInfoByStar(beforeStar);
        var star_max = parseInt(dan.star_max);
        var curstar = parseInt(dan.star2);
        var beforeState = 0;
        this._isInitStarOver = true;
        if (curstar == (star_max - 1) && this._isWin) {
            beforeState = 1;
            this._isInitStarOver = false;
        } else if (curstar == 0 && this._isWin == false) {
            beforeState = 2;
            this._isInitStarOver = true;
        }
        var oriStar = G_UserData.getSeasonSport().getCurSeason_Star();
        star_max = star_max > SeasonSportConst.SEASON_STAR_WANGZHE_MAX && SeasonSportConst.SEASON_STAR_WANGZHE_MAX || star_max;
        for (var index = 1; index <= star_max; index++) {
            var slot = star_max == SeasonSportConst.SEASON_STAR_MAX && index + 1 || index;
            this['_imageStar' + slot].node.active = true;
            this['_imageStar' + slot].node.removeAllChildren();
            if (beforeState == 2) {
                UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2 - 1]));
            } else {
                if (index <= curstar) {
                    if (beforeState == 0) {
                        if (oriStar == 0) {
                            UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2 - 1]));
                        } else {
                            UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[1 - 1]));
                        }
                    }
                } else {
                    if (beforeState == 1) {
                        if (index == star_max) {
                            UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2 - 1]));
                            G_AudioManager.playSoundWithId(AudioConst.SOUND_SEASON_STAR_RISE);
                            this._palyRelegationAnimation(this['_imageStar' + slot].node, true);
                        }
                    } else {
                        UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2 - 1]));
                    }
                }
            }
        }
        this._imageStarNum.node.active = true;
        this._imageDanName.node.active = true;
        UIHelper.loadTexture(this._imageStarNum, Path.getSeasonStar(dan.name_pic));
        UIHelper.loadTexture(this._imageDanName, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[parseInt(dan.rank_1) - 1]));
    }

    private _updateBeforeStarUI() {
        var beforeStar = this._isWin == true && (this._curStar - 1) || (this._curStar + 1);
        var dan = SeasonSportHelper.getDanInfoByStar(beforeStar);
        var star_max = parseInt(dan.star_max);
        var curstar = parseInt(dan.star2);
        this._initDanStarView();
        if (curstar == (star_max - 1) && this._isWin) {
            star_max = star_max > SeasonSportConst.SEASON_STAR_WANGZHE_MAX && SeasonSportConst.SEASON_STAR_WANGZHE_MAX || star_max;
            for (var index = 1; index <= star_max; index++) {
                var slot = star_max == SeasonSportConst.SEASON_STAR_MAX && index + 1 || index;
                this['_imageStar' + slot].node.active = false;
            }
            this._isUpdateImageStarBackOpacity = true;
            this._updateState = 3;
        } else if (curstar == 0 && this._isWin == false) {
            this._isUpdateImageStarBackOpacity = true;
            this._updateState = 4;
        } else {
            var state = this._isWin && 1 || 2;
            this._updateStarUI(state);
        }
    }

    private _updateStarUI(state) {
        console.log("_updateStarUI");
        var dan = SeasonSportHelper.getDanInfoByStar(this._curStar);
        var star_max = parseInt(dan.star_max);
        var curstar = parseInt(dan.star2);
        let updateBaseInfo = (dan) => {
            this._imageStarNum.node.active = true;
            this._imageDanName.node.active = true;
            UIHelper.loadTexture(this._imageStarNum, Path.getSeasonStar(dan.name_pic));
            UIHelper.loadTexture(this._imageDanName, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[parseInt(dan.rank_1) - 1]));
        }
        star_max = star_max > SeasonSportConst.SEASON_STAR_WANGZHE_MAX && SeasonSportConst.SEASON_STAR_WANGZHE_MAX || star_max;
        if (state == 4) {
            let crossDemotion = () => {
                for (var index = 1; index <= star_max; index++) {
                    var slot = star_max == SeasonSportConst.SEASON_STAR_MAX && index + 1 || index;
                    this['_imageStar' + slot].node.active = true;
                    this['_imageStar' + slot].node.removeAllChildren();
                    if (index == star_max) {
                        UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2 - 1]));
                        G_AudioManager.playSoundWithId(AudioConst.SOUND_SEASON_STAR_DROP);
                        this._palyDropAnimation(this['_imageStar' + slot].node);
                    } else {
                        UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[1 - 1]));
                    }
                }
                updateBaseInfo(dan);
            }
            G_AudioManager.playSoundWithId(AudioConst.SOUND_SEASON_DOWNGRADE);
            this._playDemotionHuizhang(true, crossDemotion.bind(this));
        } else if (state == 3) {
            let crossUpgrade = () => {
                for (var index = 1; index <= star_max; index++) {
                    var slot = star_max == SeasonSportConst.SEASON_STAR_MAX && index + 1 || index;
                    this['_imageStar' + slot].node.active = true;
                    this['_imageStar' + slot].node.removeAllChildren();
                    if (index <= curstar) {
                        UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[1 - 1]));
                    } else {
                        UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2 - 1]));
                    }
                }
                updateBaseInfo(dan);
            }
            G_AudioManager.playSoundWithId(AudioConst.SOUND_SEASON_UPGRADE);
            this._playDemotionHuizhang(false, crossUpgrade.bind(this));
        } else {
            for (var index = 1; index <= star_max; index++) {
                var slot = star_max == SeasonSportConst.SEASON_STAR_MAX && index + 1 || index;
                this['_imageStar' + slot].node.active = true;
                this['_imageStar' + slot].node.removeAllChildren();
                if (index <= curstar) {
                    if (index == curstar) {
                        if (state == 1) {
                            UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2 - 1]));
                            G_AudioManager.playSoundWithId(AudioConst.SOUND_SEASON_STAR_RISE);
                            this._palyRelegationAnimation(this['_imageStar' + slot].node, false);
                        } else if (state == 2) {
                            UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[1 - 1]));
                        }
                    }
                } else {
                    if (state == 2 && index == curstar + 1) {
                        var oriStar = G_UserData.getSeasonSport().getCurSeason_Star();
                        UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2 - 1]));
                        if (oriStar != 0) {
                            G_AudioManager.playSoundWithId(AudioConst.SOUND_SEASON_STAR_DROP);
                            this._palyRelegationAnimation(this['_imageStar' + slot].node, false);
                        }
                    } else {
                        UIHelper.loadTexture(this['_imageStar' + slot], Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2 - 1]));
                    }
                }
            }
            updateBaseInfo(dan);
        }
    }

    private _onReportOk() {
        if (!this._isGotSeasonRewards) {
            G_UserData.getSeasonSport().c2sFightsBonus(3, 0);
            return;
        }
        G_UserData.getSeasonSport().c2sFightsEntrance();
        this.close();
    }

    private _onGetSeasonRewards(id, message) {
        if (message.bonus_type != 3) {
            return;
        }
        let finishCallBack = () => {
            this._intervalTime = 0;
            this._popupGetRewards = null;
            this._isPlayRewardsEffect = true;
        }
        if (this._popupGetRewards != null) {
            return;
        }
        this._reportOk.node.active = false;
        PopupGetRewards.showRewards(message.awards, finishCallBack);
    }

    private _updateFadeIn() {
        var callAction = cc.callFunc(() => {
            this._updateStarUI(this._updateState);
        });
        var action = cc.fadeIn(0.5);
        var runningAction = cc.sequence(cc.delayTime(0.05), action, callAction);
        this._panelSpineUI.opacity = (0);
        this._panelSpineUI.runAction(runningAction);
    }

    private _update(dt) {
        if (this._isPlayAnimation == false && this._isInitStarOver) {
            if (this._waitingtimePlayAni > 0.2) {
                this._isPlayAnimation = true;
                this._isInitStarOver = false;
                this._waitingtimePlayAni = 0;
                this._updateBeforeStarUI();
            }
            this._waitingtimePlayAni = this._waitingtimePlayAni + dt;
        }
        if (this._isUpdateImageStarBackOpacity == true) {
            this._isUpdateImageStarBackOpacity = false;
            this._updateFadeIn();
        }
        if (this._isPlayRewardsEffect) {
            if (this._intervalTime > 0.1) {
                this._isPlayRewardsEffect = false;
                G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_AWARDS);
                this.scheduleOnce(() => {
                    this.close();
                }, 0);
                return;
            }
            this._intervalTime = this._intervalTime + dt;
        }
    }
}