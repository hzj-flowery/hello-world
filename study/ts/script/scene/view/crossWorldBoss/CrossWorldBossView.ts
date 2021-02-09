import { AuctionConst } from "../../../const/AuctionConst";
import { AudioConst } from "../../../const/AudioConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { CrossWorldBossConst } from "../../../const/CrossWorldBossConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { HomelandConst } from "../../../const/HomelandConst";
import { SignalConst } from "../../../const/SignalConst";
import { ReportParser } from "../../../fight/report/ReportParser";
import { G_AudioManager, G_BulletScreenManager, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SceneManager, G_ServerTime, G_SignalManager, G_StorageManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonHeroCountry2 from "../../../ui/component/CommonHeroCountry2";
import CommonMiniChat from "../../../ui/component/CommonMiniChat";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import PopupSystemAlert from "../../../ui/PopupSystemAlert";
import { BattleDataHelper } from "../../../utils/data/BattleDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import ViewBase from "../../ViewBase";
import CommonChatMiniNode from "../chat/CommonChatMiniNode";
import HomelandBuffIcon from "../homeland/HomelandBuffIcon";
import CrossWorldBossAvatarNode from "./CrossWorldBossAvatarNode";
import { CrossWorldBossHelperT } from "./CrossWorldBossHelperT";
import CrossWorldBossPlayerAvatarNode from "./CrossWorldBossPlayerAvatarNode";


const { ccclass, property } = cc._decorator;

@ccclass
export default class CrossWorldBossView extends ViewBase {
    name: 'CrossWorldBossView';
    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeLeft: cc.Node = null;

    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _imgHelpBtn: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _commonBtnRight: cc.Button = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _commonBtnLeft: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _leftBtnDes: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _rightBtnDes: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _rightBtnContent: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textBtnRight: cc.Label = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _leftBtnContent: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textBtnLeft: cc.Label = null;



    @property({
        type: cc.Node,
        visible: true
    })
    _panelAvatar: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nextTips: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _campInfo: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _pozhaoEffectNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _notBeginCountdown: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nightChangeEffect: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _dayChangeEffect: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _sceneIdleEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelChargeStar: cc.Node = null;



    @property({
        type: cc.Label,
        visible: true
    })
    _textOverTime: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeDesc: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBossName: cc.Label = null;

    @property({
        type: HomelandBuffIcon,
        visible: true
    })
    _homelandBuff: HomelandBuffIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMy: cc.Sprite = null;
    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBarTime: cc.ProgressBar = null;


    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePoZhao: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDayBg1: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDayBg2: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDayBg3: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNightBg1: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNightBg2: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNightBg3: cc.Sprite = null;

    @property({
        type: CommonHeroCountry2,
        visible: true
    })
    _bossHead: CommonHeroCountry2 = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProcess: cc.Node = null;



    @property({
        type: cc.Prefab,
        visible: true
    })
    _CrossWorldBossAvatarNode: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _CrossWorldBossRankNode: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _CrossWorldBossPlayerAvatarNode: cc.Prefab = null;



    private _playerAvatars: Map<number, CrossWorldBossPlayerAvatarNode> = new Map<number, CrossWorldBossPlayerAvatarNode>();
    private _curBossId = 0;
    private _curUiState = 0;
    private _curBossState = CrossWorldBossConst.BOSS_NORMAL_STATE;
    private _curActivityState = CrossWorldBossConst.ACTIVITY_STATE_NULL;
    private _curBgmId = 0;
    private _chargeTipsImg: Array<cc.Sprite>;
    private _chargeTime = 0;
    private _chargeIndex = 0;
    private _addTime: number;
    private _isBossOpen: boolean;

    private _signalEnterBossInfo: any;
    private _signalAttackBoss: any;
    private _signalBulletNotice: any;
    private _signalGetGrabPoint: any;
    private _signalStateChange: any;
    private _signalGetAuctionInfo: any;
    private _signalUpdateBossInfo: any;
    private _signalHomelandBuffEmpty: any;
    private _chargeTimePoint: Array<any>;
    private _chargeLastTime: number;
    private _chargeTimes: number;
    private _weekTime: any;
    private _bossAvatar: CrossWorldBossAvatarNode;
    private weekCountDownHandler: Function;
    private _refreshHandler: Function;
    private _loadingBarHandler: Function;
    private _preChargeTime: Array<string>;
    private _danmuPanel: cc.Node;
    private _loadingBarPercent: number;
    private _loadingBarDeltal: number;
    static waitEnterMsg(callBack) {
        let onMsgCallBack = function (id, message) {
            cc.log(message);
            callBack();
        }
        G_UserData.getCrossWorldBoss().c2sEnterCrossWorldBoss();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_CROSS_WORLDBOSS_GET_INFO, onMsgCallBack);
        return signal;
    }
    onCreate() {
        this.setSceneSize();
        let listen1 = new cc.Component.EventHandler();
        listen1.component = "CrossWorldBossView";
        listen1.target = this.node;
        listen1.handler = "_onBtnLeft";
        this._commonBtnLeft.clickEvents = [];
        this._commonBtnLeft.clickEvents.push(listen1);
        let listen2 = new cc.Component.EventHandler();
        listen2.component = "CrossWorldBossView";
        listen2.target = this.node;
        listen2.handler = "_onBtnRight";
        this._commonBtnRight.clickEvents = [];
        this._commonBtnRight.clickEvents.push(listen2);

        this._panelAvatar.on(cc.Node.EventType.TOUCH_END, this._onAvatarPanelClick, this);

        this._topbarBase.setItemListVisible(false);
        this._nodeLeft.removeAllChildren();
        this._nodeLeft.addChild(cc.instantiate(this._CrossWorldBossRankNode));
        var offset = G_ResolutionManager.getBangOffset();
        // if (offset && offset > 0) {
        //     this._nodeLeft.x = (2);
        // }
        this._danmuPanel = this._commonChat.getPanelDanmu();
        this._danmuPanel.on(cc.Node.EventType.TOUCH_START, this._onBtnDanmu, this);
        G_BulletScreenManager.setBulletScreenOpen(9, true);
        G_BulletScreenManager.setBulletScreenOpen(8, true);
        G_UserData.getBulletScreen().setBulletScreenOpen(9, true);
        G_UserData.getBulletScreen().setBulletScreenOpen(8, true);
        this._updateBulletScreenBtn(9);
        if (!CrossWorldBossHelperT.checkIsTodayOver()) {
            var userId = G_UserData.getBase().getId();
            var data = G_StorageManager.load('crossbossdata' + userId) || {};
            var currTime = G_ServerTime.getTime();

            data['day'] = new Date(currTime).getDay();
            G_StorageManager.save('crossbossdata' + userId, data);
        }
        let eveHandler = new cc.Component.EventHandler();
        eveHandler.component = "CrossWorldBossView";
        eveHandler.handler = "_onHelpBtn";
        eveHandler.target = this.node;
        this._imgHelpBtn.clickEvents = [];
        this._imgHelpBtn.clickEvents.push(eveHandler);
    }
    onEnter() {
        this._signalEnterBossInfo = G_SignalManager.add(SignalConst.EVENT_CROSS_WORLDBOSS_GET_INFO, handler(this, this._onEventGetInfo));
        this._signalAttackBoss = G_SignalManager.add(SignalConst.EVENT_CROSS_WORLDBOSS_ATTACK_BOSS, handler(this, this._onEventAttackWorldBoss));
        this._signalBulletNotice = G_SignalManager.add(SignalConst.EVENT_BULLET_SCREEN_POST, handler(this, this._onEventBulletNotice));
        this._signalGetGrabPoint = G_SignalManager.add(SignalConst.EVENT_CROSS_WORLDBOSS_GET_GRAB_POINT, handler(this, this._onEventGrabCrossWorldBossPoint));
        this._signalStateChange = G_SignalManager.add(SignalConst.EVENT_CROSS_WORLDBOSS_STATE_CHANGE, handler(this, this._onEventBossStateChange));
        this._signalGetAuctionInfo = G_SignalManager.add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(this, this._onEventGetAuctionInfo));
        this._signalUpdateBossInfo = G_SignalManager.add(SignalConst.EVENT_CROSS_WORLDBOSS_UPDATE_BOSS, handler(this, this._onEventGetInfo));
        this._signalHomelandBuffEmpty = G_SignalManager.add(SignalConst.EVENT_HOME_LAND_BUFF_EMPTY, handler(this, this._onEventHomelandBuffEmpty));
        var oldIsBossOpen = this._isBossOpen;
        [this._isBossOpen] = G_UserData.getCrossWorldBoss().isBossStart();
        if (this._isBossOpen == false && oldIsBossOpen == true) {
            G_UserData.getCrossWorldBoss().c2sEnterCrossWorldBoss();
            G_UserData.getAuction().c2sGetAllAuctionInfo();
        }
        if (this._isBossOpen == true) {
            var userId = G_UserData.getBase().getId();
            var data = G_StorageManager.load('crossbossdata' + userId) || {};
            data['showNotice'] = '0';
            G_StorageManager.save('crossbossdata' + userId, data);
        }
        this._preChargeTime = CrossWorldBossHelperT.getParameterStr('charge_start_time').split('|');
        this._initChargeTimeInfo();
        this._initWeekBossState();
        this._initAvatarPanel();
        this._initDayAndNight();
        this._initCampPanel();
        this._startRefreshHandler();
        this._checkShowDlg();
        this._onRefreshTick();
        this._homelandBuff.updateOneBuffById(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_24);
    }
    onExit() {
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_WORLDBOSS_EXIT,{})
        this._signalAttackBoss.remove();
        this._signalAttackBoss = null;
        this._signalBulletNotice.remove();
        this._signalBulletNotice = null;
        this._signalGetGrabPoint.remove();
        this._signalGetGrabPoint = null;
        this._signalStateChange.remove();
        this._signalStateChange = null;
        this._signalGetAuctionInfo.remove();
        this._signalGetAuctionInfo = null;
        this._signalEnterBossInfo.remove();
        this._signalEnterBossInfo = null;
        this._signalUpdateBossInfo.remove();
        this._signalUpdateBossInfo = null;
        this._signalHomelandBuffEmpty.remove();
        this._signalHomelandBuffEmpty = null;
        this._endRefreshHandler();
        this._endLoadingBarAction();
        this._endWeekCountDown();
        var runningScene = G_SceneManager.getTopScene();
        if (runningScene && runningScene.getName() != 'fight') {
            cc.log('G_BulletScreenManager:clearBulletLayer()');
            G_BulletScreenManager.clearBulletLayer();
        }
        this._panelAvatar.removeAllChildren();
        this._playerAvatars.clear();
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_GUILD_BOSS_EXIT,{});
    }
    _onEventHomelandBuffEmpty() {
        this._homelandBuff.updateOneBuffById(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_24);
    }
    _onHelpBtn() {
        UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_CROSS_WORLD_BOSS);
    }
    _onBtnDanmu() {
        cc.log('CrossWorldBossView:_onBtnDanmu');
        var bulletOpen = G_UserData.getBulletScreen().isBulletScreenOpen(9);
        G_UserData.getBulletScreen().setBulletScreenOpen(9, !bulletOpen);
        G_UserData.getBulletScreen().setBulletScreenOpen(8, !bulletOpen);
        this._updateBulletScreenBtn(9);
    }
    _updateBulletScreenBtn(bulletType) {
        this._danmuPanel.getChildByName('Node_1').active = (false);
        this._danmuPanel.getChildByName('Node_2').active = (false);
        var bulletOpen = G_UserData.getBulletScreen().isBulletScreenOpen(bulletType);
        if (bulletOpen == true) {
            this._danmuPanel.getChildByName('Node_1').active = (true);
            G_BulletScreenManager.showBulletLayer();
        } else {
            this._danmuPanel.getChildByName('Node_2').active = (true);
            G_BulletScreenManager.hideBulletLayer();
        }
    }
    _initCampPanel() {
        var selfCamp = G_UserData.getCrossWorldBoss().getSelf_camp();
        if (selfCamp && selfCamp != 0) {
            this._nextTips.active = (false);
            this._campInfo.active = (true);
            var myCampIconPath = CrossWorldBossHelperT.getCampIconPathById(selfCamp);
            UIHelper.loadTexture(this._imageMy, myCampIconPath);
            var bossId = G_UserData.getCrossWorldBoss().getBoss_id();
            var bossInfo = CrossWorldBossHelperT.getBossConfigInfo(bossId);
            if (bossInfo) {
                var pozhaoCamp = CrossWorldBossHelperT.getPozhaoCampByBossId(bossInfo.id);
                var pozhaoCampIconPath = CrossWorldBossHelperT.getCampIconPathById(pozhaoCamp);
                UIHelper.loadTexture(this._imagePoZhao, pozhaoCampIconPath);
            }
        } else {
            this._nextTips.active = (true);
            this._campInfo.active = (false);
        }
    }
    _updateBossAvatar() {
        if (this._bossAvatar) {
            this._bossAvatar.setBossStamina();
        }
    }
    _onEventGetInfo(id, message) {
        this._updateBossAvatar();
        this._checkShowDlg();
    }
    _onEventGetAuctionInfo(id, message) {
        this._checkShowDlg();
    }
    _checkShowDlg() {
        cc.log('CrossWorldBossView:_checkShowDlg show !!!!!!!!!!! start');
        var isAuctionWorldEnd = G_UserData.getAuction().isAuctionShow(AuctionConst.AC_TYPE_CROSS_WORLD_BOSS);
        if (isAuctionWorldEnd == false) {
            cc.log('CrossWorldBossView:_showGuildDlg  isAuctionWorldEnd = false ');
        }
        if (G_UserData.getCrossWorldBoss().needShopPromptDlg() == true) {
            cc.log('CrossWorldBossView:_checkShowDlg show !!!!!!!!!!! enter');
            var isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                this._showGuildDlg();
            } else {
                this._showPersonalDlg();
            }
        }
    }
    _showPersonalDlg() {
        cc.log('CrossWorldBossView:_showGuildDlg !!!!!!!!!!!');
        var personalRank = G_UserData.getCrossWorldBoss().getEndNoticeValue('rank');
        var personDlg = Lang.get('crossworldboss_reward_finish_show1', { rank: personalRank });
        function onBtnGo() {
            G_SceneManager.showScene('auction');
        }
        G_BulletScreenManager.clearBulletLayer();
        UIPopupHelper.popupSystemAlert(Lang.get('worldboss_popup_title1'), personDlg, onBtnGo, null, function (pop: PopupSystemAlert) {
            pop.setCheckBoxVisible(false);
            pop.showGoButton(Lang.get('worldboss_go_btn2'));
            pop.setCloseVisible(true);
        })
    }
    _showGuildDlg() {
        var guildCount = G_UserData.getCrossWorldBoss().getEndNoticeValue('number');
        if (guildCount == null) {
            cc.log('CrossWorldBossView:_showGuildDlg guildCount is nil');
            return;
        }
        cc.log('CrossWorldBossView:_showGuildDlg !!!!!!!!!!!');
        var guildPoint = G_UserData.getCrossWorldBoss().getEndNoticeValue('integral');
        var guildRank = G_UserData.getCrossWorldBoss().getEndNoticeValue('rank');
        var guildPrestige = G_UserData.getCrossWorldBoss().getEndNoticeValue('prestige');
        var personDlg = Lang.get('crossworldboss_reward_finish_show2', {
            point: guildPoint,
            count: guildCount,
            guildRank: guildRank,
            guildExp: guildPrestige
        });
        function onBtnGo() {
            G_SceneManager.showScene('auction');
        }
        G_BulletScreenManager.clearBulletLayer();
        UIPopupHelper.popupSystemAlert(Lang.get('worldboss_popup_title1'), personDlg, onBtnGo, null, function (pop: PopupSystemAlert) {
            pop.setCheckBoxVisible(false);
            pop.showGoButton(Lang.get('worldboss_go_btn2'));
            pop.setCloseVisible(true);
        })

    }
    _onEventBulletNotice(id, message) {
        cc.log(message);
        if (message == null) {
            return;
        }
        var user = message['user'] || {};
        var userData: any = {};
        userData.userId = user.user_id || 0;
        if (userData.userId == 0 || userData.userId == G_UserData.getBase().getId()) {
            return;
        }
        var avatar = this._playerAvatars.get(userData.userId);
        if (avatar) {
            if (avatar.isAttacking() == false) {
                avatar.doAttack(null, this._bossAvatar, message.color);
            }
        }
    }
    _onEventBossStateChange() {
        cc.log('_onEventBossStateChange');
        var newState = G_UserData.getCrossWorldBoss().getState();
        cc.log('newState ' + newState);
        var oldBossState = this._curBossState;
        this._curBossState = newState;
        if (newState == CrossWorldBossConst.BOSS_NORMAL_STATE) {
            this._changeToNormalState(oldBossState);
            G_AudioManager.playMusicWithId(AudioConst.SOUND_CROSS_NORMAL_STATE_BG);
            this._curBgmId = AudioConst.SOUND_CROSS_NORMAL_STATE_BG;
            this._setLoadingBarTimeAdd();
        } else if (newState == CrossWorldBossConst.BOSS_CHARGE_STATE) {
            this._chargeIndex = this._chargeIndex + 1;
            this._changeToChargeState();
            G_AudioManager.playMusicWithId(AudioConst.SOUND_CROSS_CHARGE_STATE_BG);
            this._chargeTime = 0;
            this._curBgmId = AudioConst.SOUND_CROSS_CHARGE_STATE_BG;
        } else if (newState == CrossWorldBossConst.BOSS_WEAK_STATE) {
            this._playPozhaoSuccEffect();
            G_AudioManager.playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_BREAK_SUCC);
            this._changeToWeekState();
            G_AudioManager.playMusicWithId(AudioConst.SOUND_CROSS_NORMAL_STATE_BG);
            this._curBgmId = AudioConst.SOUND_CROSS_NORMAL_STATE_BG;
            this._setLoadingBarTimeAdd();
        }
        this._bossAvatar.changeBossState(newState);
    }
    _changeToNormalState(oldBossState?) {
        cc.log('_changeToNormalState');
        this._changeToDay();
        if (oldBossState == CrossWorldBossConst.BOSS_CHARGE_STATE) {
            cc.log('破招失败');
            this._pozhaoFailedAction();
            G_AudioManager.playSoundWithId(AudioConst.SOUND_CROSS_SHIELD_BREAK_FAILED);
        } else {
            this._gotoNormalAttackPos();
        }
    }
    _playPozhaoSuccEffect() {
        this._pozhaoEffectNode.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._pozhaoEffectNode, 'moving_pofang_pozhao', null, null, true);
    }
    _changeToChargeState() {
        cc.log('_changeToChargeState');
        this._changeToNight();
        this._gotoSuperAttackPos();
    }
    _changeToWeekState() {
        cc.log('_changeToWeekState');
        this._changeToDay();
        this._beginWeekCountDown();
    }
    _initWeekBossState() {
        if (this._curBossState == CrossWorldBossConst.BOSS_WEAK_STATE) {
            var stateStartTime = G_UserData.getCrossWorldBoss().getState_startTime();
            var curTime = G_ServerTime.getTime();
            var stateContinueTime = CrossWorldBossHelperT.getParameterValue('weak_last_time');
            this._weekTime = stateStartTime + stateContinueTime - curTime;
            this._weekTime = Math.min(this._weekTime, stateContinueTime);
            if (this._weekTime <= 0) {
                G_UserData.getCrossWorldBoss().setState(CrossWorldBossConst.BOSS_NORMAL_STATE);
            }
        }
    }
    _beginWeekCountDown() {
        var stateStartTime = G_UserData.getCrossWorldBoss().getState_startTime();
        var curTime = G_ServerTime.getTime();
        var stateContinueTime = CrossWorldBossHelperT.getParameterValue('weak_last_time');
        this._weekTime = stateStartTime + stateContinueTime - curTime;
        this._weekTime = Math.min(this._weekTime, stateContinueTime);
        this._bossAvatar.setWeekCountdownLabel(this._weekTime);
        this._endWeekCountDown();
        if (this.weekCountDownHandler != null) {
            return;
        }
        if (this._weekTime > 0) {
            this.weekCountDownHandler = handler(this, this._weekCountDown);
            this.schedule(this.weekCountDownHandler, 1);
        }
    }
    _weekCountDown() {
        this._bossAvatar.setWeekCountdownLabel(this._weekTime);
        if (this._weekTime == 0) {
            this._endWeekCountDown();
            this._changeToNormalState();
            this._bossAvatar.changeBossState(CrossWorldBossConst.BOSS_NORMAL_STATE);
            G_UserData.getCrossWorldBoss().setState(CrossWorldBossConst.BOSS_NORMAL_STATE);
            return;
        }
        this._weekTime = this._weekTime - 1;
    }
    _endWeekCountDown() {
        if (this.weekCountDownHandler != null) {
            this.unschedule(this.weekCountDownHandler);
            this.weekCountDownHandler = null;
        }
    }
    _onEventGrabCrossWorldBossPoint(id, message) {
        var reportId = message['report'];
        let enterFightView = function (message) {
            var battleReport = G_UserData.getFightReport().getReport();
            var reportData = ReportParser.parse(battleReport);
            var curState = G_UserData.getCrossWorldBoss().getState();
            var battleData = BattleDataHelper.parseCrossWorldBossPoint(message, curState == CrossWorldBossConst.BOSS_CHARGE_STATE);
            G_SceneManager.showScene('fight', reportData, battleData);
            G_UserData.getCrossWorldBoss().c2sEnterCrossWorldBoss();
        }
        G_SceneManager.registerGetReport(reportId, function () {
            enterFightView(message);
        });
    }
    _onEventAttackWorldBoss(id, message) {
        var battleReport = message['report'];
        if (battleReport == null) {
            cc.log('battleReport == nil');
            var roleAvatar = this._playerAvatars.get(G_UserData.getBase().getId());
            if (roleAvatar) {
                roleAvatar.doAttack(null, this._bossAvatar);
            } else {
                cc.log('roleAvatar is nil');
            }
            G_UserData.getCrossWorldBoss().c2sEnterCrossWorldBoss();
            return;
        }
        cc.log('battleReport ~= nil');
        let onFinish = function () {
            cc.log('onFinish');
            var reportData = ReportParser.parse(battleReport);
            var curState = G_UserData.getCrossWorldBoss().getState();
            var battleData = BattleDataHelper.parseCrossWorldBossFight(message, curState == CrossWorldBossConst.BOSS_CHARGE_STATE);
            G_SceneManager.showScene('fight', reportData, battleData);
            G_UserData.getCrossWorldBoss().c2sEnterCrossWorldBoss();
        }.bind(this);
        var roleAvatar = this._playerAvatars.get(G_UserData.getBase().getId());
        if (roleAvatar) {
            roleAvatar.doAttack(onFinish, null, null, true);
        } else {
            cc.log('roleAvatar is nil');
        }
    }
    _initDayAndNight() {
        var bossState = G_UserData.getCrossWorldBoss().getState();
        this._imageDayBg1.node.stopAllActions();
        this._imageDayBg2.node.stopAllActions();
        this._imageDayBg3.node.stopAllActions();
        this._imageNightBg1.node.stopAllActions();
        this._imageNightBg2.node.stopAllActions();
        this._imageNightBg3.node.stopAllActions();
        if (bossState == CrossWorldBossConst.BOSS_NORMAL_STATE || bossState == CrossWorldBossConst.BOSS_WEAK_STATE) {
            this._curUiState = CrossWorldBossConst.CROSS_BOSS_UI_DAY;
            this._imageDayBg1.node.opacity = (255);
            this._imageDayBg2.node.opacity = (255);
            this._imageDayBg3.node.opacity = (255);
            this._imageNightBg1.node.opacity = (0); this.node.opacity
            this._imageNightBg2.node.opacity = (0);
            this._imageNightBg3.node.opacity = (0);
            if (this._isBossOpen && this._curBgmId != AudioConst.SOUND_CROSS_NORMAL_STATE_BG) {
                G_AudioManager.playMusicWithId(AudioConst.SOUND_CROSS_NORMAL_STATE_BG);
                this._curBgmId = AudioConst.SOUND_CROSS_NORMAL_STATE_BG;
            }
        } else {
            this._curUiState = CrossWorldBossConst.CROSS_BOSS_UI_NIGHT;
            this._imageDayBg1.node.opacity = (0);
            this._imageDayBg2.node.opacity = (0);
            this._imageDayBg3.node.opacity = (0);
            this._imageNightBg1.node.opacity = (255);
            this._imageNightBg2.node.opacity = (255);
            this._imageNightBg3.node.opacity = (255);
            if (this._isBossOpen && this._curBgmId != AudioConst.SOUND_CROSS_CHARGE_STATE_BG) {
                G_AudioManager.playMusicWithId(AudioConst.SOUND_CROSS_CHARGE_STATE_BG);
                this._curBgmId = AudioConst.SOUND_CROSS_CHARGE_STATE_BG;
            }
        }
        this._nightChangeEffect.removeAllChildren();
        this._dayChangeEffect.removeAllChildren();
        this._playSceneIdleEffect();
    }
    _changeToNight() {
        if (this._curUiState == CrossWorldBossConst.CROSS_BOSS_UI_NIGHT) {
            return;
        }
        this._curUiState = CrossWorldBossConst.CROSS_BOSS_UI_NIGHT;
        this._imageDayBg1.node.opacity = (255);
        this._imageDayBg2.node.opacity = (255);
        this._imageDayBg3.node.opacity = (255);
        this._imageNightBg1.node.opacity = (0);
        this._imageNightBg2.node.opacity = (0);
        this._imageNightBg3.node.opacity = (0);
        this._imageDayBg1.node.runAction(cc.fadeOut(1));
        this._imageDayBg2.node.runAction(cc.fadeOut(1));
        this._imageDayBg3.node.runAction(cc.fadeOut(1));
        this._imageNightBg1.node.runAction(cc.fadeIn(1));
        this._imageNightBg2.node.runAction(cc.fadeIn(1));
        this._imageNightBg3.node.runAction(cc.fadeIn(1));
        this._playChangeToNightEffect();
    }
    _changeToDay() {
        if (this._curUiState == CrossWorldBossConst.CROSS_BOSS_UI_DAY) {
            return;
        }
        this._curUiState = CrossWorldBossConst.CROSS_BOSS_UI_DAY;
        this._imageDayBg1.node.opacity = (0);
        this._imageDayBg2.node.opacity = (0);
        this._imageDayBg3.node.opacity = (0);
        this._imageNightBg1.node.opacity = (255);
        this._imageNightBg2.node.opacity = (255);
        this._imageNightBg3.node.opacity = (255);
        this._imageDayBg1.node.runAction(cc.fadeIn(1));
        this._imageDayBg2.node.runAction(cc.fadeIn(1));
        this._imageDayBg3.node.runAction(cc.fadeIn(1));
        this._imageNightBg1.node.runAction(cc.fadeOut(1));
        this._imageNightBg2.node.runAction(cc.fadeOut(1));
        this._imageNightBg3.node.runAction(cc.fadeOut(1));
        this._playChangeToDayEffect();
    }
    _playSceneIdleEffect() {
        function eventFunction(event, frameIndex, movingNode) {
            if (event == 'finish') {
            }
        }
        this._sceneIdleEffect.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._sceneIdleEffect, 'moving_kuafuboss_changjing', null, null, true);
    }
    _playChangeToDayEffect() {
        this._nightChangeEffect.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._nightChangeEffect, 'moving_kuafuboss_yunleng2', null, null, true);
        this._dayChangeEffect.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._dayChangeEffect, 'moving_kuafuboss_yunnuan1', null, null, true);
    }
    _playChangeToNightEffect() {
        this._dayChangeEffect.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._dayChangeEffect, 'moving_kuafuboss_yunnuan2', null, null, true);
        this._nightChangeEffect.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._nightChangeEffect, 'moving_kuafuboss_yunleng1', null, null, true);
    }
    _initAvatarPanel() {
        this._panelAvatar.removeAllChildren();
        this._initBossNode();
        this._initPlayerAvatars();
    }
    _initBossNode() {
        var bossId = CrossWorldBossHelperT.getBossHeroId();

        var bossInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(bossId);
        this._bossAvatar = cc.instantiate(this._CrossWorldBossAvatarNode).getComponent(CrossWorldBossAvatarNode);
        this._panelAvatar.addChild(this._bossAvatar.node);
        if (bossInfo == null) {
            return;
        }
        this._bossHead.updateHero(0, bossId);
        this._textBossName.string = (bossInfo.name);
        var bossPos: any = G_UserData.getCrossWorldBoss().getBossPos();
        this._bossAvatar.node.setPosition(0,-20);
        this._bossAvatar.changeZorderByPos();
        this._bossAvatar.setBossCampIcon();
        this._bossAvatar.setBossStamina();
        var bossState = G_UserData.getCrossWorldBoss().getState();
        cc.log('bossState ' + bossState);
        var bossConfigInfo = CrossWorldBossHelperT.getBossInfo();
        this._bossAvatar.updateBaseId(bossConfigInfo.spine);
        this._curBossState = bossState;
        this._bossAvatar.changeBossState(bossState);
        if (bossState == CrossWorldBossConst.BOSS_WEAK_STATE) {
            this._beginWeekCountDown();
        }
    }
    _initPlayerAvatars() {
        var normalPosArray = G_UserData.getCrossWorldBoss().getNormalPos();
        var pozhenPosArray = G_UserData.getCrossWorldBoss().getPozhenPos();
        var pozhenPosNum = pozhenPosArray.length;
        var bossState = G_UserData.getCrossWorldBoss().getState();
        var usersInfo = G_UserData.getCrossWorldBoss().getUsers();
        var bossId = G_UserData.getCrossWorldBoss().getBoss_id();
        if (bossId == null || bossId == 0) {
            return;
        }
        var bossInfo = CrossWorldBossHelperT.getBossConfigInfo(bossId);
        var pozhaoCamp = CrossWorldBossHelperT.getPozhaoCampByBossId(bossInfo.id);
        for (let k in usersInfo) {
            var v = usersInfo[k];
            if ((parseInt(k)+1) > normalPosArray.length) {
                return;
            }
            var avatar = cc.instantiate(this._CrossWorldBossPlayerAvatarNode).getComponent(CrossWorldBossPlayerAvatarNode);
            this._panelAvatar.addChild(avatar.node);
            if (bossState != CrossWorldBossConst.BOSS_NORMAL_STATE && (parseInt(k) + 1) <= pozhenPosNum && pozhaoCamp == v.camp) {
                avatar.setPos(pozhenPosArray[k][0]);
                avatar.setIdlePos(normalPosArray[k][0]);
                avatar.setPozhenPos(pozhenPosArray[k][0]);
                avatar.setHitdownIndex(pozhenPosArray[k][1]);
            } else {
                avatar.setPos(normalPosArray[k][0]);
                avatar.setIdlePos(normalPosArray[k][0]);
                avatar.setPozhenPos(null);
                avatar.setHitdownIndex(normalPosArray[k][1]);
            }
            avatar.setIsPozhaoCamp(pozhaoCamp == v.camp);
            avatar.updatePlayerInfo(v);
            avatar.node.name = ('avatar' + k);
            this._playerAvatars.set(v.userId, avatar);
            
        }
    }
    _updatePlayerAvatars() {
        var normalPosArray = G_UserData.getCrossWorldBoss().getNormalPos();
        var pozhenPosArray = G_UserData.getCrossWorldBoss().getPozhenPos();
        var pozhenPosNum = pozhenPosArray.length;
        var bossState = G_UserData.getCrossWorldBoss().getState();
        var usersInfo = G_UserData.getCrossWorldBoss().getUsers();
        for (let k in usersInfo) {
            var v = usersInfo[k];
            var avatar = this._playerAvatars.get(v.userId);
            if (avatar == null) {
                avatar = cc.instantiate(this._CrossWorldBossPlayerAvatarNode).getComponent(CrossWorldBossPlayerAvatarNode)
                this._playerAvatars.set(v.userId, avatar);
                this._panelAvatar.addChild(avatar.node);
                avatar.updatePlayerInfo(v);
                avatar.node.name = ('avatar' + k);
            }
            if (bossState != CrossWorldBossConst.BOSS_NORMAL_STATE && (parseInt(k) + 1) <= pozhenPosNum) {
                avatar.setPos(pozhenPosArray[k]);
                avatar.setIdlePos(normalPosArray[k]);
                avatar.setPozhenPos(pozhenPosArray[k]);
            } else {
                avatar.setPos(normalPosArray[k]);
                avatar.setIdlePos(normalPosArray[k]);
                avatar.setPozhenPos(null);
            }
        }
    }
    _onBtnRight() {
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
    _startRefreshHandler() {
        this._endRefreshHandler();
        if (this._refreshHandler != null) {
            return;
        }
        this._refreshHandler = handler(this, this._onRefreshTick);
        this.schedule(this._refreshHandler, 1);
    }
    _endRefreshHandler() {
        if (this._refreshHandler != null) {
            this.unschedule(this._refreshHandler);
            this._refreshHandler = null;
        }
    }
    _isInChargeTime(currTime, startTime) {
        for (let k in this._preChargeTime) {
            var v = this._preChargeTime[k];
            if (currTime - startTime == parseInt(v) - 10) {
                return true;
            }
        }
        return false;
    }
    _initChargeTimeInfo() {
        this._chargeTimePoint = [];
        var chargeTimePointCfg = CrossWorldBossHelperT.getParameterStr('charge_start_time');
        var chargeTimePointArray = chargeTimePointCfg.split('|');
        var startTime = G_UserData.getCrossWorldBoss().getStart_time();
        var endTime = G_UserData.getCrossWorldBoss().getEnd_time();
        var currTime = G_ServerTime.getTime();
        this._chargeLastTime = CrossWorldBossHelperT.getParameterValue('charge_last_time');
        this._chargeTimes = this._chargeTimePoint.length;
        this._panelChargeStar.removeAllChildren();
        this._chargeTipsImg = [];
        for (let k in chargeTimePointArray) {
            var v = chargeTimePointArray[k];
            let pos = parseInt(k) + 1;
            table.insert(this._chargeTimePoint, parseInt(v));
            var percent = (parseInt(v) + (pos - 1) * this._chargeTimes) / (endTime - startTime);
            var xPos = (1 - percent) * 435;
            let uiImage = new cc.Node().addComponent(cc.Sprite);
            UIHelper.loadTexture(uiImage, Path.getCrossBossImage('icon_cross_boss_mark'));
            uiImage.node.setPosition(xPos, 0);
            uiImage.node.setAnchorPoint(cc.v2(0.5, 0.5));
            table.insert(this._chargeTipsImg, uiImage);
            this._panelChargeStar.addChild(uiImage.node);
        }
        var pastTime = currTime - startTime;
        this._chargeIndex = 0;
        var [isStart] = G_UserData.getCrossWorldBoss().isBossStart();
        for (let k = 0; k <= this._chargeTimePoint.length; k++) {
            let v = this._chargeTimePoint[k];
            if (pastTime >= v) {
                this._chargeIndex = k;
            }
        }
        for (let k = 0; k < this._chargeTipsImg.length; k++) {
            let v = this._chargeTipsImg[k];
            v.node.active = (isStart);
            if (this._chargeIndex >= k && this._curBossState != CrossWorldBossConst.BOSS_CHARGE_STATE || this._chargeIndex > k && this._curBossState == CrossWorldBossConst.BOSS_CHARGE_STATE) {
                v.node.color = (cc.color(100, 100, 100));
            } else {
                v.node.color = (cc.color(255, 255, 255));
            }
        }
        if (this._curBossState == CrossWorldBossConst.BOSS_CHARGE_STATE) {
            this._chargeTime = pastTime - this._chargeTimePoint[this._chargeIndex];
        } else {
            this._chargeTime = 0;
        }
        this._setLoadingBarTimeAdd();
    }
    _setLoadingBarTimeAdd() {
        var currTime = G_ServerTime.getTime();
        var startTime = G_UserData.getCrossWorldBoss().getStart_time();
        var endTime = G_UserData.getCrossWorldBoss().getEnd_time();
        var pastTime = currTime - startTime;
        var chargeDeltal = 0;
        var toNextChargeTime = 0;
        if (this._chargeIndex == 0) {
        }
        else if (this._chargeIndex == this._chargeTimePoint.length) {
            toNextChargeTime = endTime - currTime;
        } else {
            chargeDeltal = this._chargeTimePoint[this._chargeIndex + 1] - this._chargeTimePoint[this._chargeIndex];
            toNextChargeTime = chargeDeltal - (pastTime - this._chargeTimePoint[this._chargeIndex]);
        }
        this._addTime = 0;
        if (toNextChargeTime > 0) {
            this._addTime = this._chargeTime / toNextChargeTime;
        }
    }
    _updateTimeLoadingBar() {
        var currTime = G_ServerTime.getTime();
        var startTime = G_UserData.getCrossWorldBoss().getStart_time();
        var endTime = G_UserData.getCrossWorldBoss().getEnd_time();
        var totalTime = endTime - startTime;
        var leftTime = endTime - currTime;
        for (let k = 0; k < this._chargeTipsImg.length; k++) {
            var v = this._chargeTipsImg[k];
            if (this._chargeIndex >= k && this._curBossState != CrossWorldBossConst.BOSS_CHARGE_STATE || this._chargeIndex > k && this._curBossState == CrossWorldBossConst.BOSS_CHARGE_STATE) {
                v.node.color = (cc.color(100, 100, 100));
            } else {
                v.node.color = (cc.color(255, 255, 255));
            }
        }
        if (this._curBossState != CrossWorldBossConst.BOSS_CHARGE_STATE) {
            this._chargeTime = Math.max(0, this._chargeTime - this._addTime);
            var percent = (leftTime + this._chargeTime) / totalTime;
            this._loadingBarTime.progress = (percent);
        } else if (this._chargeTimePoint[this._chargeIndex]) {
            this._chargeTime = this._chargeTime + 1;
            var percent = (totalTime - this._chargeTimePoint[this._chargeIndex]) / totalTime;
            this._loadingBarTime.progress = (percent);
        } else {
        }
    }
    _playChargeTipsImgAction() {
        if (!this._chargeTipsImg) {
            return;
        }
        for (let k in this._chargeTipsImg) {
            var v = this._chargeTipsImg[k];
            v.node.active = (true);
            v.node.opacity = (0);
            v.node.runAction(cc.fadeIn(1));
        }
    }
    _onRefreshTick() {
        this._updateButton();
        var [isBossOpen] = G_UserData.getCrossWorldBoss().isBossStart();
        var currTime = G_ServerTime.getTime();
        var startTime = G_UserData.getCrossWorldBoss().getStart_time();
        var endTime = G_UserData.getCrossWorldBoss().getEnd_time();
        if (isBossOpen) {
            this._danmuPanel.active = (true);
            this._curActivityState = CrossWorldBossConst.ACTIVITY_STATE_BEGIN;
            this._nodeProcess.active = (true);
            this._textTimeDesc.string = (Lang.get('worldboss_close_time_desc'));
            this._bossAvatar.node.active = (true);
            var [endString, percent] = CrossWorldBossHelperT.getEndTime();
            this._textOverTime.string = '' + (endString);
            this._notBeginCountdown.active = (false);
            if (this._isBossOpen != isBossOpen) {
                G_SignalManager.dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE);
                G_UserData.getCrossWorldBoss().c2sEnterCrossWorldBoss();
                this._isBossOpen = isBossOpen;
                G_AudioManager.playMusicWithId(AudioConst.SOUND_CROSS_NORMAL_STATE_BG);
                this._curBgmId = AudioConst.SOUND_CROSS_NORMAL_STATE_BG;
                var userId = G_UserData.getBase().getId();
                var data = G_StorageManager.load('crossbossdata' + userId) || {};
                data['showNotice'] = '0';
                G_StorageManager.save('crossbossdata' + userId, data);
                this._playChargeTipsImgAction();
            }
            this._updateTimeLoadingBar();
            if (this._isInChargeTime(currTime, startTime)) {
                G_AudioManager.playSoundWithId(AudioConst.SOUND_CROSS_PRE_CHARGE_SOUND);
            }
        } else {
            if (this._isBossOpen != isBossOpen) {
                this._isBossOpen = isBossOpen;
                this.scheduleOnce(function () {
                    G_UserData.getCrossWorldBoss().c2sEnterCrossWorldBoss();
                    G_UserData.getAuction().c2sGetAllAuctionInfo();
                }, 1);
                G_AudioManager.openMainMusic(true);
                this._bossAvatar.doFadeOutAction();
            }
            var startString = CrossWorldBossHelperT.getOpenTime();
            this._textTimeDesc.string = (Lang.get('worldboss_open_time_desc'));
            this._textOverTime.string = (startString);
            this._notBeginCountdown.active = (false);
            this._bossAvatar.hideBoss();
            if (startTime > currTime) {
                if (startTime - currTime > 5) {
                    if (this._curActivityState == CrossWorldBossConst.ACTIVITY_STATE_NULL) {
                        this._startRandomMove();
                    }
                    this._loadingBarTime.progress = (0);
                    var bossId = G_UserData.getCrossWorldBoss().getBoss_id();
                    if (bossId == null || bossId == 0 || startTime - currTime > 86400) {
                        this._nodeProcess.active = (false);
                    } else {
                        this._nodeProcess.active = (true);
                    }
                    this._curActivityState = CrossWorldBossConst.ACTIVITY_STATE_RANDOM_MOVE;
                } else if (this._curActivityState == CrossWorldBossConst.ACTIVITY_STATE_RANDOM_MOVE) {
                    this._curActivityState = CrossWorldBossConst.ACTIVITY_STATE_PREPARE;
                    this._backToIdlePos();
                    this._nodeProcess.active = (true);
                    this._startLoadingBarAction();
                    this._bossAvatar.node.active = (true);
                    this._bossAvatar.playAnimationOnce('coming');
                } else {
                    this._curActivityState = CrossWorldBossConst.ACTIVITY_STATE_PREPARE;
                    this._nodeProcess.active = (true);
                    this._bossAvatar.node.active = (true);
                }
            } else if (currTime > endTime) {
                this._curActivityState = CrossWorldBossConst.ACTIVITY_STATE_END;
                this._textTimeDesc.node.active = (false);
                this._textOverTime.node.active = (false);
                for (let k in this._chargeTipsImg) {
                    var v = this._chargeTipsImg[k];
                    v.node.active = (false);
                }
                this._loadingBarTime.progress = (0);
                this._nodeProcess.active = (false);
            } else {
                this._nodeProcess.active = (false);
            }
        }
    }
    _startLoadingBarAction() {
        this._endLoadingBarAction();
        if (this._loadingBarHandler != null) {
            return;
        }
        this._loadingBarPercent = 0;
        this._loadingBarDeltal = 1 / 30 / 4;
        this._loadingBarTime.progress = (0);
        this._loadingBarHandler = handler(this, this._updateLoadingBarAction);
        this.schedule(this._loadingBarHandler, 1 / 30);
    }
    _updateLoadingBarAction() {
        if (this._loadingBarPercent >= 1) {
            this._loadingBarTime.progress = (1);
            this._endLoadingBarAction();
            return;
        }
        this._loadingBarPercent = this._loadingBarPercent + this._loadingBarDeltal;
        this._loadingBarTime.progress = (this._loadingBarPercent);
    }
    _endLoadingBarAction() {

        if (this._loadingBarHandler != null) {
            this.unschedule(this._loadingBarHandler);
            this._loadingBarHandler = null;
        }
    }
    _updateButton() {
        var [isBossOpen] = G_UserData.getCrossWorldBoss().isBossStart();
        var [bossBtnName, rightVisible] = CrossWorldBossHelperT.getBossFightBtnName();
        this._commonBtnRight.node.active = (false);
        this._commonBtnLeft.node.active = (false);
        this._leftBtnDes.active = (false);
        this._rightBtnDes.active = (false);
        this._rightBtnContent.active = (rightVisible && isBossOpen);
        if (isBossOpen == true) {
            this._textBtnRight.string = (bossBtnName) + '';
            this._commonBtnRight.node.active = (true);
            this._rightBtnDes.active = (true);
        }
        var [userBtnName, leftVisible] = CrossWorldBossHelperT.getUserFightBtnName();
        this._leftBtnContent.active = (leftVisible && isBossOpen);
        if (isBossOpen == true) {
            this._textBtnLeft.string = (userBtnName) + '';
            this._commonBtnLeft.node.active = (true);
            this._leftBtnDes.active = (true);
        }
    }
    _onBtnLeft() {
        if (CrossWorldBossHelperT.checkUserFight() == false) {
            return;
        }
        var [isOpen] = G_UserData.getCrossWorldBoss().isBossStart();
        if (isOpen == true) {
            G_SceneManager.showDialog('prefab/crossWorldBoss/PopupCrossWorldBossRob');
        }
    }
    _onAvatarPanelClick(sender: cc.Touch, state) {
        if (this._curActivityState == CrossWorldBossConst.ACTIVITY_STATE_RANDOM_MOVE) {
            var moveOffsetX = sender.getLocation().x;
            var moveOffsetY = sender.getLocation().y;
            var xBoundary = CrossWorldBossHelperT.getParameterStr('x_boundary').split('|');
            var loweryBoundaryX = parseInt(xBoundary[0]);
            var upperyBoundaryX = parseInt(xBoundary[1]);
            var curMaxY = G_UserData.getCrossWorldBoss().getMaxYByX(Math.ceil(moveOffsetX));
            var localPos = this._panelAvatar.convertToNodeSpace(cc.v2(moveOffsetX, moveOffsetY));
            var localX = localPos.x;
            var localY = localPos.y;
            if (localX >= loweryBoundaryX && localX <= upperyBoundaryX && localY >= 0 && localY <= curMaxY) {
                var roleAvatar = this._playerAvatars.get(G_UserData.getBase().getId());
                if (roleAvatar) {
                    var posX = roleAvatar.node.x;
                    let posY = roleAvatar.node.y;
                    var t = Math.sqrt(Math.pow(localX - posX, 2) + Math.pow(localY - posY, 2)) / 300;
                    roleAvatar.moveToPos(localX, localY, t, function () {
                        roleAvatar.setIdleAction();
                    });
                }
            }
        }
    }
    _backToIdlePos(t?) {
        this._playerAvatars.forEach(function (v, k) {
            if (v) {
                v.backToIdlePos(t);
            }
        })
    }
    _gotoSuperAttackPos() {
        var superAttackPosArray = G_UserData.getCrossWorldBoss().getPozhenPos();
        var index = 0;
        this._playerAvatars.forEach(function (v, k) {
            var avatar = v;
            if (superAttackPosArray[index] && avatar && avatar.getIsPozhaoCamp()) {
                avatar.moveToSuperAttackPos(superAttackPosArray[index][0]);
                avatar.setHitdownIndex(superAttackPosArray[index][1]);
                index = index + 1;
            }
        })

    }
    _gotoNormalAttackPos() {
        this._playerAvatars.forEach(function (v, k) {
            var avatar = v;
            if (avatar.getPozhenPos()) {
                avatar.backToIdlePos();
            }
        })
    }
    _pozhaoFailedAction() {
        this._playerAvatars.forEach(function (v, k) {
            var avatar = v;
            if (avatar) {
                avatar.liedownAndGotoIdlepos();
            }
        })
    }
    _startRandomMove() {
        var param: any = {};
        var xBoundary = CrossWorldBossHelperT.getParameterStr('x_boundary').split('|');
        param.loweryBoundaryX = parseInt(xBoundary[0]);
        param.upperyBoundaryX = parseInt(xBoundary[1]);
        var yBoundary = CrossWorldBossHelperT.getParameterStr('y_boundary').split('|');
        param.loweryBoundaryY = parseInt(yBoundary[0]);
        param.upperyBoundaryY = parseInt(yBoundary[1]);
        var xMoveDis = CrossWorldBossHelperT.getParameterStr('walk_x_boundary').split('|');
        param.lowerMoveDisX = parseInt(xMoveDis[0]);
        param.upperMoveDisX = parseInt(xMoveDis[1]);
        var yMoveDis = CrossWorldBossHelperT.getParameterStr('walk_y_boundary').split('|');
        param.lowerMoveDisY = parseInt(yMoveDis[0]);
        param.upperMoveDisY = parseInt(yMoveDis[1]);
        var moveTime = CrossWorldBossHelperT.getParameterStr('walk_speed').split('|');
        param.lowerTime = parseInt(moveTime[0]);
        param.upperTime = parseInt(moveTime[1]);
        var pauseTime = CrossWorldBossHelperT.getParameterStr('walk_pause').split('|');
        param.lowerPauseTime = parseInt(pauseTime[0]);
        param.upperPauseTime = parseInt(pauseTime[1]);
        var userId = G_UserData.getBase().getId();
        this._playerAvatars.forEach(function (v, k) {
            if (k != userId) {
                v.beginRandowMove(param);
            }
        })
    }
}