const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import { G_UserData, G_SignalManager, G_SceneManager, G_Prompt, G_ServerTime, G_EffectGfxMgr, G_ConfigManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { handler } from '../../../utils/handler';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import { SeasonSportHelper } from './SeasonSportHelper';
import { Lang } from '../../../lang/Lang';
import PopupSeasonRewardsTip from './PopupSeasonRewardsTip';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import PopupSeasonTip from './PopupSeasonTip';
import PopupSuspendTimeView from './PopupSuspendTimeView';
import { SpineNode } from '../../../ui/node/SpineNode';
import MatchSuccessPlayerInfoPanel from './MatchSuccessPlayerInfoPanel';
import PopupAlert from '../../../ui/PopupAlert';
import PopupBattleReportView from './PopupBattleReportView';
import ViewBase from '../../ViewBase';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';

@ccclass
export default class SeasonSportView extends ViewBase {

    @property({ type: CommonTopbarBase, visible: true })
    _topBar: CommonTopbarBase = null;

    @property({ type: cc.Label, visible: true })
    _textSeasonTime: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageGanTanHao: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textRemaining: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textPeriodCountDown: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageWaitBack: cc.Sprite = null;

    @property({ type: cc.Button, visible: true })
    _cancelMatch: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _imageWaiting: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textWaiting: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _panelCenter: cc.Node = null;

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

    @property({ type: cc.Node, visible: true })
    _panelNewer: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageDivision: cc.Sprite = null;

    @property({ type: cc.Button, visible: true })
    _commonTip: cc.Button = null;

    @property({ type: cc.Node, visible: true })
    _panelBottom: cc.Node = null;

    @property({ type: CommonMiniChat, visible: true })
    _commonChat: CommonMiniChat = null;

    @property({ type: cc.Button, visible: true })
    _btnRank: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _btnReport: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _commonHelp: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _btnSeasonShop: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _btnSeasonRewards: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _btnSilkConfig: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _btnSeasonAwards: cc.Button = null;

    @property({ type: cc.Button, visible: true })
    _btnMatch: cc.Button = null;

    @property({ type: cc.Sprite, visible: true })
    _imageMatchSuccess: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _centerNode: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _centerContainer: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    _matchSuccessPlayerInfoPanelPrefab: cc.Prefab = null;

    @property({ type: cc.Sprite, visible: true })
    _imgShop: cc.Sprite = null;

    // private _effectSpineHuiZhnagNode: SpineNode;
    private _effectSpineHuiZhnagNode: cc.Sprite;
    private _popupAlert: PopupAlert;
    private _popupSeasonRewardsTip: PopupSeasonRewardsTip;
    private _popupSuspendTimeView;
    private _popupOfflineView;
    private _isWaiting = false;
    private _suspendTime = 0;
    private _interval = 1;
    private _curStar;
    private _seasonEndTime;

    private _signalEnterSignal;
    private _signalMatchimg;
    private _signalMatchSuccess;
    private _signalMatchTimeOut;
    private _signalCancelMatchs;
    private _signalGetSeasonRewards;
    private _signalUpdateRedPoints;
    private _signalListnerSeasonStart;
    private _signalListnerSeasonEnd;
    private _signalCancelWhileSeeRP;

    private enterSceneTimes = 0;

    public static waitEnterMsg(callBack) {
        function onMsgCallBack(id, message) {
            callBack();
        }
        G_UserData.getSeasonSport().c2sFightsEntrance();
        var signal = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, onMsgCallBack);
        return signal;
    }

    public preloadRes(callBack: Function, params) {
        // this.addPreloadSceneRes(2002);
        super.preloadRes(callBack, params);
    }

    public onCreate() {
        this.setSceneSize();
        // this.updateSceneId(2002);
        this._topBar.setImageTitle('txt_sys_com_wangzhezhizhan');
        this._topBar.updateUI(TopBarStyleConst.STYLE_SEASONSPORT);
        this._topBar.setCallBackOnBack(handler(this, this._onReturnBack));
        this._imageHighest.node.active = false;
        this._initDanView();
        this._createHuiZhangSpine();

        this._imgShop.node.active = G_ConfigManager.checkCanRecharge();

        this._commonChat.setDanmuVisible(false);
    }

    private _initNewerView() {
        var curStage = G_UserData.getSeasonSport().getSeason_Stage();
        UIHelper.loadTexture(this._imageDivision, Path.getTextSignet(SeasonSportConst.SEASON_STAGE_TIP[curStage - 1]));
    }

    private _initWaitingView(bVisible) {
        this._imageWaitBack.node.active = bVisible;
        this._imageWaiting.node.active = bVisible;
        this._textWaiting.node.active = bVisible;
        this._cancelMatch.node.active = bVisible;
        this._imageMatchSuccess.node.active = false;
        this._imageMatchSuccess.node.opacity = (230);
        this._panelCenter.active = true;
        this._panelBottom.active = true;
        this._btnMatch.node.active = (!bVisible);
    }

    private _initDanView() {
        for (var index = 1; index <= 5; index++) {
            this['_imageStar' + index].node.active = false;
        }
    }

    private _closeRewardsTip() {
        this._popupSeasonRewardsTip = null;
    }

    public gotoSeasonAwards(snnder) {
        if (this._popupSeasonRewardsTip != null) {
            this._popupSeasonRewardsTip.closeView();
            this._popupSeasonRewardsTip = null;
            return;
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupSeasonRewardsTip", "seasonSport"), (popup: PopupSeasonRewardsTip) => {
            this._popupSeasonRewardsTip = popup;
            this._popupSeasonRewardsTip.init(handler(this, this._closeRewardsTip));
            this._popupSeasonRewardsTip.open();
        });
    }

    public gotoSeasonRank(sender) {
        G_SceneManager.openPopup(Path.getPrefab("PopupSeasonRankView", "seasonSport"));
        // G_SceneManager.showDialog('app.scene.view.seasonSport.PopupSeasonRankView');
    }

    public gotoSeasonReport(sender) {
        G_SceneManager.openPopup(Path.getPrefab("PopupOwnFightReportView", "seasonSport"));
        // G_SceneManager.showDialog('app.scene.view.seasonSport.PopupOwnFightReportView');
    }

    public gotoDesc(sender) {
        UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_SEASONSOPRT);
    }

    public gotoTip(sender) {
        G_SceneManager.openPopup(Path.getPrefab("PopupSeasonTip", "seasonSport"), (popup: PopupSeasonTip) => {
            popup.init(cc.v2(280, 135));
            popup.open();
        });
    }

    public gotoSeasonShop(sender) {
        if (G_UserData.getSeasonSport().getMatchSuccess()) {
            return;
        }
        if (this._imageWaitBack.node.active) {
            this._interval = 0;
            G_UserData.getSeasonSport().c2sFightsCancel();
        }
        G_UserData.getSeasonSport().setMatchSuccess(false);
        G_SceneManager.showScene('seasonShop');
    }

    public gotoSeasonRewards(sender) {
        G_SceneManager.openPopup(Path.getPrefab("PopupSeasonDailyRewards", "seasonSport"));
        // G_SceneManager.showDialog('app.scene.view.seasonSport.PopupSeasonDailyRewards');
    }

    public gotoSilkConfig(sender) {
        G_SceneManager.openPopup(Path.getPrefab("PopupSeasonSilk", "seasonSilk"));
        // G_SceneManager.showDialog('app.scene.view.seasonSilk.PopupSeasonSilk');
    }

    public gotoMatch(sender) {
      //  if (!G_UserData.getBase().isIs_white_list()) {
            var [bWaiting, time] = SeasonSportHelper.getWaitingTime();
            if (bWaiting) {
                var strTips = Lang.get('season_notstart_waiting') + "\n" + time;
                G_Prompt.showTip(strTips);
                return;
            }
       // }
        if (this._isWaiting) {
            G_Prompt.showTip(Lang.get('season_match_waiting'));
            return;
        }
        this._suspendTime = G_UserData.getSeasonSport().getSuspendTime();
        if (G_ServerTime.getLeftSeconds(this._suspendTime) > 0) {
            G_SceneManager.openPopup(Path.getPrefab("PopupSuspendTimeView", "seasonSport"), (popupSuspendTimeView: PopupSuspendTimeView) => {
                var dropStar = G_UserData.getSeasonSport().getOwnCDOutAndDropStar();
                if (dropStar > 0) {
                    var strTitle = Lang.get('season_suspend_title');
                    var strContent = Lang.get('season_suspend_contentdrop', { num: dropStar });
                    var strContentEnd = Lang.get('season_suspend_contentdropsecond');
                    var strButton = Lang.get('season_suspend_back');
                    popupSuspendTimeView.setCustomText(strTitle, strContent, strButton, strContentEnd, 0);
                } else {
                    var strTitle = Lang.get('season_suspend_title');
                    var strContent = Lang.get('season_suspend_content');
                    var strButton = Lang.get('season_suspend_back');
                    popupSuspendTimeView.setCustomText(strTitle, strContent, strButton, null, 0);
                }
                popupSuspendTimeView.open();
            });
            return;
        }
        G_UserData.getSeasonSport().setOwnCDOutAndDropStar(0);
        G_UserData.getSeasonSport().c2sFightsInitiate();
    }

    public gotoCancelMatch(sender) {
        if (G_UserData.getSeasonSport().getMatchSuccess()) {
            return;
        }
        G_UserData.getSeasonSport().c2sFightsCancel();
    }

    public onEnter() {
        this._signalEnterSignal = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, handler(this, this._onEventEnterSeasonSuccess));
        this._signalMatchimg = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_MATCHING, handler(this, this._onEventMatchimg));
        this._signalMatchSuccess = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_FIGHT_MATCH, handler(this, this._onEventMatchSuccess));
        this._signalMatchTimeOut = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_MATCH_TIMEOUT, handler(this, this._onEventMatchTimeOut));
        this._signalCancelMatchs = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_CANCEL_MATCH, handler(this, this._onEventCancelMatch));
        this._signalGetSeasonRewards = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_AWARDS, handler(this, this._onEventGetSeasonRewards));
        this._signalUpdateRedPoints = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventUpdateRedPoint));
        this._signalListnerSeasonStart = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_START, handler(this, this._onEventListnerSeasonStart));
        this._signalListnerSeasonEnd = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_END, handler(this, this._onEventListnerSeasonEnd));
        this._signalCancelWhileSeeRP = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_CANCEL_MATCHWHILEREPORT, handler(this, this._onEventCancelMatchWhileSeeRP));
        this._updateSeasonView();
        this._updateOtherCDOut();
    }

    public onExit() {
        this._signalEnterSignal.remove();
        this._signalMatchimg.remove();
        this._signalMatchSuccess.remove();
        this._signalMatchTimeOut.remove();
        this._signalCancelMatchs.remove();
        this._signalUpdateRedPoints.remove();
        this._signalGetSeasonRewards.remove();
        this._signalListnerSeasonStart.remove();
        this._signalListnerSeasonEnd.remove();
        this._signalCancelWhileSeeRP.remove();
        this._signalEnterSignal = null;
        this._signalMatchimg = null;
        this._signalMatchSuccess = null;
        this._signalMatchTimeOut = null;
        this._signalCancelMatchs = null;
        this._signalUpdateRedPoints = null;
        this._signalGetSeasonRewards = null;
        this._signalListnerSeasonStart = null;
        this._signalListnerSeasonEnd = null;
        this._isWaiting = false;
        this._signalCancelWhileSeeRP = null;
    }

    private _onReturnBack() {
        if (G_UserData.getSeasonSport().getMatchSuccess()) {
            return;
        }
        if (this._imageWaitBack.node.active) {
            this._interval = 0;
            G_UserData.getSeasonSport().c2sFightsCancel();
        }
        G_UserData.getSeasonSport().setMatchSuccess(false);
        G_SceneManager.popScene();
    }

    private _onEventListnerSeasonStart() {
        G_UserData.getSeasonSport().c2sFightsEntrance();
    }

    private _onEventListnerSeasonEnd() {
        G_UserData.getSeasonSport().c2sFightsEntrance();
    }

    private _onEventUpdateRedPoint() {
        this._updateRedPoint();
    }

    private _updateRedPoint() {
        var redImg = this._btnSeasonRewards.node.getChildByName('RedPoint');
        if (!redImg) {
            redImg = UIHelper.createImage({ texture: Path.getUICommon('img_redpoint') });
            redImg.name = ('RedPoint');
            redImg.setPosition(75 / 2, 80 / 2);
            this._btnSeasonRewards.node.addChild(redImg);
        }
        redImg.active = (G_UserData.getRedPoint().isSeasonDailyReward());
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

    private _playHuiZhangSpine() {
        var bUpgrade = false;
        var dan = parseInt(SeasonSportHelper.getDanInfoByStar(this._curStar).rank_1);
        if (this._curStar > 1) {
            var beforeStar = this._curStar - 1;
            var beforeDan = parseInt(SeasonSportHelper.getDanInfoByStar(beforeStar).rank_1);
            var bUp = dan - beforeDan == 1 || false;
            if (G_UserData.getSeasonSport().getTimeOutCD() > 0) {
                if (bUp) {
                    bUpgrade = G_UserData.getSeasonSport().getTimeOutCD() == 2 || false;
                }
            }
        }
        var idle1 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][1 - 1];
        var idle2 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][2 - 1];
        this._effectSpineHuiZhnagNode.node.active = true;
        if (bUpgrade == false) {
            this._updateStarUI();
            this._effectSpineHuiZhnagNode.node.active = true;
            // this._effectSpineHuiZhnagNode.setAnimation(idle2, true);
            UIHelper.loadTexture(this._effectSpineHuiZhnagNode, Path.getSeasonSportUI(idle1));
        } else {
            // this._effectSpineHuiZhnagNode.setAnimation(idle1, false);
            // this._effectSpineHuiZhnagNode.signalComplet.addOnce(function () {
            //     this._effectSpineHuiZhnagNode.setAnimation(idle2, true);
            //     this._updateStarUI();
            // });
            UIHelper.loadTexture(this._effectSpineHuiZhnagNode, Path.getSeasonSportUI(idle1));
            this._updateStarUI();
        }
    }

    private _palyMatchedAnimation(rootNode?) {
        this._imageMatchSuccess.node.active = true;
        this._panelCenter.active = false;
        this._panelBottom.active = false;
        function effectFunction(effect): cc.Node {
            if (effect == 'wanjia1') {
                var node1: MatchSuccessPlayerInfoPanel = cc.instantiate(this._matchSuccessPlayerInfoPanelPrefab).getComponent(MatchSuccessPlayerInfoPanel);
                node1.updateUI(1);
                return node1.node;
            } else if (effect == 'wanjia2') {
                var node2: MatchSuccessPlayerInfoPanel = cc.instantiate(this._matchSuccessPlayerInfoPanelPrefab).getComponent(MatchSuccessPlayerInfoPanel);
                node2.updateUI(2);
                return node2.node;
            }
        }
        function eventFunction(event) {
            if (event == 'finish') {
                this._imageMatchSuccess.node.active = false;
                this._panelCenter.active = true;
                this._panelBottom.active = true;
                G_UserData.getSeasonSport().setMatchSuccess(false);
                G_SceneManager.showScene('seasonCompetitive');
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._centerNode, 'moving_wuchabieduijue', effectFunction.bind(this), eventFunction.bind(this), false);
    }

    private _updateOtherCDOut() {
        function callBackClose() {
            this._popupSuspendTimeView = null;
            G_UserData.getSeasonSport().setOtherCDOut(false);
        }
        function callBackOffline() {
            this._popupOfflineView = null;
            G_UserData.getSeasonSport().setSquadOffline(false);
        }
        if (G_UserData.getSeasonSport().getOtherCDOut() && this._popupSuspendTimeView == null) {
            G_SceneManager.openPopup(Path.getPrefab("PopupSuspendTimeView", "seasonSport"), (popupSuspendTimeView: PopupSuspendTimeView) => {
                this._popupSuspendTimeView = popupSuspendTimeView;
                var strTitle = Lang.get('season_suspend_other_title');
                var strContent = Lang.get('season_suspend_other_content');
                var strButton = Lang.get('season_suspend_other_back');
                this._popupSuspendTimeView.setCustomText(strTitle, strContent, strButton, null, 30);
                this._popupSuspendTimeView.setCloseCallBack(callBackClose);
                this._popupSuspendTimeView.open();
            });

        } else if (G_UserData.getSeasonSport().isSquadOffline() && this._popupOfflineView == null) {
            G_SceneManager.openPopup(Path.getPrefab("PopupSuspendTimeView", "seasonSport"), (popupOfflineView: PopupSuspendTimeView) => {
                this._popupOfflineView = popupOfflineView;
                var strTitle = Lang.get('season_suspend_offline_title');
                var strContent = Lang.get('season_suspend_offline_content');
                var strButton = Lang.get('season_suspend_other_back');
                this._popupOfflineView.setCustomText(strTitle, strContent, strButton, null, 30);
                this._popupOfflineView.setCloseCallBack(callBackOffline);
                this._popupOfflineView.open();
            });
        }
    }

    private _updateSeasonView() {
        var bCancel = G_UserData.getSeasonSport().getCancelMatch();
        this._initWaitingView(!bCancel);
        this._initNewerView();
        this._suspendTime = G_UserData.getSeasonSport().getSuspendTime();
        this._seasonEndTime = G_UserData.getSeasonSport().getSeasonEndTime();
        var saesonLastDays = Math.floor(G_ServerTime.getLeftSeconds(this._seasonEndTime) / SeasonSportConst.SEASON_COUNTDOWN);
        var curSeason = G_UserData.getSeasonSport().getCurSeason();
        var dateStr = Lang.get('season_nexttime', { num: curSeason }) + saesonLastDays;
        this._textSeasonTime.string = dateStr;
        this._updateRedPoint();
        this._updateReport();
        this._curStar = G_UserData.getSeasonSport().getCurSeason_Star();
        this._playHuiZhangSpine();
    }

    private _onEventEnterSeasonSuccess(id, message) {
        this._updateSeasonView();
    }

    private _onEventMatchimg(id, message) {
        this._initWaitingView(true);
        this._interval = 1;
        this._isWaiting = true;
        G_UserData.getSeasonSport().setCancelMatch(false);
    }

    private _onEventMatchTimeOut(id, message) {
        this._interval = 1;
        this._isWaiting = false;
        this._initWaitingView(false);
        function callbackOK() {
            G_UserData.getSeasonSport().c2sFightsInitiate();
        }
        function callbackClose() {
            this._popupAlert = null;
        }
        var content = Lang.get('season_matchout_content');
        var title = Lang.get('season_matchout_title');
        if (this._popupAlert != null) {
            return;
        }
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupAlert"), (popup: PopupAlert) => {
            this._popupAlert = popup;
            this._popupAlert.init(title, content, callbackOK);
            this._popupAlert.setCloseCallBack(callbackClose);
            this._popupAlert.openWithAction();
        });
    }

    private _onEventMatchSuccess(id, message) {
        this._isWaiting = false;
        this._interval = 1;
        this._initWaitingView(false);
        G_UserData.getSeasonSport().setTimeOutCD(0);
        G_UserData.getSeasonSport().setCancelMatch(true);
        this._centerNode.removeAllChildren();
        this._palyMatchedAnimation();
    }

    private _onEventCancelMatch(id, message) {
        this._interval = 1;
        this._isWaiting = false;
        this._initWaitingView(false);
    }

    private _onEventCancelMatchWhileSeeRP() {
        if (this._imageWaitBack.node.active) {
            this._interval = 0;
            G_UserData.getSeasonSport().c2sFightsCancel();
            G_UserData.getSeasonSport().setMatchSuccess(false);
        }
    }

    private _onEventGetSeasonRewards() {
        G_SceneManager.openPopup(Path.getPrefab("PopupBattleReportView", "seasonSport"), (popup: PopupBattleReportView) => {
            popup.init(false, true, true);
            popup.open();
        });
    }

    private _updateReport() {
        if (G_UserData.getSeasonSport().isReceivedRewards()) {
            G_SceneManager.openPopup(Path.getPrefab("PopupBattleReportView", "seasonSport"), (popup: PopupBattleReportView) => {
                popup.init(true, false, true);
                popup.open();
            });
        } else if (G_UserData.getSeasonSport().getTimeOutCD() > 0) {
            if (this.enterSceneTimes == 1) {     //原因: 从选人界面弹出弹出 这个场景会先pop出,然后再进入战斗场景, 所以要在战斗场景出来才暂时结果
                var bWin = G_UserData.getSeasonSport().getTimeOutCD() == 2 || false;
                G_SceneManager.openPopup(Path.getPrefab("PopupBattleReportView", "seasonSport"), (popup: PopupBattleReportView) => {
                    popup.init(bWin, true, false);
                    popup.open();
                });
                G_UserData.getSeasonSport().setTimeOutCD(0);
                this.enterSceneTimes = 0;
            }else {
                this.enterSceneTimes++;
            }
        }
    }

    private _updateStarUI() {
        var dan = SeasonSportHelper.getDanInfoByStar(this._curStar);
        var star_max = parseInt(dan.star_max);
        var curstar = parseInt(dan.star2);
        this._initDanView();
        if (parseInt(this._curStar) > SeasonSportConst.POSITION_HEIGHEST_KINGSTAR) {
            this._imageHighest.node.active = true;
            this._textHighest.string = curstar.toString();
            UIHelper.loadTexture(this._imageStarNum, Path.getSeasonStar(dan.name_pic));
            UIHelper.loadTexture(this._imageDanName, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[parseInt(dan.rank_1) - 1]));
            return;
        }
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
        UIHelper.loadTexture(this._imageStarNum, Path.getSeasonStar(dan.name_pic));
        UIHelper.loadTexture(this._imageDanName, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[parseInt(dan.rank_1) - 1]));
    }

    public update(dt) {
        if (this._imageWaitBack.node.active) {
            this._textWaiting.string = G_ServerTime.secCountToString(this._interval);
            this._interval = this._interval + dt;
        }
        if (SeasonSportConst.SEASON_COUNTDOWN > G_ServerTime.getLeftSeconds(this._seasonEndTime)) {
            var curSeason = G_UserData.getSeasonSport().getCurSeason();
            var dateStr = Lang.get('season_lasttime', { num: curSeason }) + G_ServerTime.getLeftSecondsString(this._seasonEndTime, '00：00：00');
            this._textSeasonTime.string = dateStr;
        }
        var [bWaiting, time] = SeasonSportHelper.getWaitingTime();
        this._textRemaining.string = bWaiting && Lang.get('season_peroid_start') || Lang.get('season_peroid_remain');
        if (bWaiting) {
            if (time != null) {
                this._textPeriodCountDown.string = time.toString();
                var remainingPosX = this._textPeriodCountDown.node.x - this._textPeriodCountDown.node.getContentSize().width - SeasonSportConst.POSITION_PLAYERNAME_OFFSETX / 4;
                this._textRemaining.node.x = remainingPosX;
                var ganTanHaoPosX = this._textRemaining.node.x - this._textRemaining.node.getContentSize().width;
                this._imageGanTanHao.node.x = ganTanHaoPosX;
            }
        } else {
            if (time != null && time > 0) {
                this._textPeriodCountDown.string = G_ServerTime.getLeftSecondsString(time as number, '00\uFF1A00\uFF1A00');
                var remainingPosX = this._textPeriodCountDown.node.x - this._textPeriodCountDown.node.getContentSize().width - SeasonSportConst.POSITION_PLAYERNAME_OFFSETX / 4;
                this._textRemaining.node.x = remainingPosX;
                var ganTanHaoPosX = this._textRemaining.node.x - this._textRemaining.node.getContentSize().width;
                this._imageGanTanHao.node.x = ganTanHaoPosX;
            }
        }
    }
}