import { BullectScreenConst } from "../../../const/BullectScreenConst";
import { CountryBossConst } from "../../../const/CountryBossConst";
import { SignalConst } from "../../../const/SignalConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import { ReportParser } from "../../../fight/report/ReportParser";
import { Colors, G_Prompt, G_SceneManager, G_SignalManager, G_UserData, G_BulletScreenManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonCountdown from "../../../ui/component/CommonCountdown";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import { BattleDataHelper } from "../../../utils/data/BattleDataHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { unpack } from "../../../utils/GlobleFunc";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import AwardNode from "../countryboss/AwardNode";
import BloodNode from "../countryboss/BloodNode";
import { CountryBossHelper } from "../countryboss/CountryBossHelper";
import FightBtn from "../countryboss/FightBtn";
import PopupCountryBossIntercept from "../countryboss/PopupCountryBossIntercept";
import RankNode from "../countryboss/RankNode";
import StageWidget from "../countryboss/StageWidget";
import AvatarPostion from "./AvatarPostion";
import CommonMiniChat from "../../../ui/component/CommonMiniChat";














const { ccclass, property } = cc._decorator;


@ccclass
export default class CountryBossBigBossView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatarParent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBlood: cc.Node = null;

    @property({
        type: CommonCountdown,
        visible: true
    })
    _commonCountDown: CommonCountdown = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _rankParentNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeReward: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnFight: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _fightTextImage: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _fightCountdownBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _fightCountdown: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnIntercept: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _InterceptTextImage: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _InterceptCountdownBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _InterceptCountdown: cc.Label = null;

    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;
    @property({ type: cc.Prefab, visible: true })
    bloodNode: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    rankNode: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    awardNode: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    avatarPostion: cc.Prefab = null;

    _fightCd: any;
    _interceptCd: any;
    _bossId: any;
    _isNeedRequestEnter: any;
    _battleBackgroundId: any;
    _danmuPanel: any;
    _signalFightBoss: any;
    _signalInterceptList: any;
    _signalSyncBossUser: any;
    _signalSyncBoss: any;
    _signalUserList: any;
    _signalBulletNotice: any;
    _signalGetAuctionInfo: any;
    _signalRecvFlushData: any;
    _signalEnter: any;
    _signalForeground: any;
    _isBulletOpen: any;
    _bloodWidget: any;
    _rankWidget: any;
    _awardWidget: any;
    _fightWidget: any;
    _interceptWidget: any;
    _avatarPosition: AvatarPostion;
    _stageWidget: any;


    waitEnterMsg(callBack, param) {
        function onMsgCallBack() {
            callBack();
        }
        if (param) {
            var [bossId, isNeedRequestEnter] = unpack(param);
            if (isNeedRequestEnter) {
                G_UserData.getCountryBoss().c2sEnterCountryBoss();
                G_UserData.getAuction().c2sGetAllAuctionInfo();
                var signal = G_SignalManager.add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, onMsgCallBack);
                return signal;
            } else {
                callBack();
            }
        } else {
            callBack();
        }
    }
    ctor(bossId, isNeedRequestEnter) {
        this._fightCd = CountryBossHelper.getStage3AttackCd();
        this._interceptCd = CountryBossHelper.getStage3InterceptCd();
        this._bossId = bossId;
        this._isNeedRequestEnter = isNeedRequestEnter;
        var cfg = CountryBossHelper.getBossConfigById(this._bossId);
        this._battleBackgroundId = cfg.battle_scene;
        UIHelper.addEventListener(this.node, this._btnFight, 'CountryBossBigBossView', '_onBtnFight');
        UIHelper.addEventListener(this.node, this._btnIntercept, 'CountryBossBigBossView', '_onBtnIntercept');
        this.setSceneSize();
        this.updateSceneId(this._battleBackgroundId);
    }
    onCreate() {
        var params = G_SceneManager.getViewArgs('countrybossbigboss')
        this.ctor(params[0], params[1]);
        this._makeBackGroundBottom();
        this._initWidget();
        this._initAvatar();
 
        this._danmuPanel = this._commonChat.getPanelDanmu();
        UIHelper.addClickEventListenerEx(this._danmuPanel, handler(this, this._onBtnDanmu));
        this._danmuPanel.active = (true);
        G_BulletScreenManager.setBulletScreenOpen(BullectScreenConst.COUNTRY_BOSS_TYPE, true);
        this._updateBulletScreenBtn(BullectScreenConst.COUNTRY_BOSS_TYPE);
        if (this._isNeedRequestEnter) {
            this._topbarBase.setCallBackOnBack(function () {
                G_SceneManager.popScene();
                G_SceneManager.showScene('countryboss', true);
            });
        }
    }

    start() {
        this._topbarBase.setImageTitle('txt_sys_com_sanguozhanji');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true);
        this._topbarBase.hideBG();
    }

    onEnter() {
        this._signalFightBoss = G_SignalManager.add(SignalConst.EVENT_ATTACK_COUNTRY_BOSS_SUCCESS, handler(this, this._onEventBattle));
        this._signalInterceptList = G_SignalManager.add(SignalConst.EVENT_INTERCEPT_COUNTRY_BOSS_LIST_SUCCESS, handler(this, this._onEventInteceptList));
        this._signalSyncBossUser = G_SignalManager.add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_USER_SUCCESS, handler(this, this._onEventSyncIntercept));
        this._signalSyncBoss = G_SignalManager.add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS, handler(this, this._onEventSyncBoss));
        this._signalUserList = G_SignalManager.add(SignalConst.EVENT_GET_MAX_COUNTRY_BOSS_LIST_SUCCESS, handler(this, this._onEventGetAttackUserList));
        this._signalBulletNotice = G_SignalManager.add(SignalConst.EVENT_BULLET_SCREEN_POST, handler(this, this._onEventBulletNotice));
        this._signalGetAuctionInfo = G_SignalManager.add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(this, this._onEventGetAuctionInfo));
        this._signalRecvFlushData = G_SignalManager.add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(this, this._onEventRecvFlushData));
        this._signalEnter = G_SignalManager.add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, handler(this, this._onEventEnter));
        this._signalForeground = G_SignalManager.add(SignalConst.EVENT_MAY_ENTER_FOREGROUND, handler(this, this._onEventForeground));
        if (this._isBulletOpen) {
            G_BulletScreenManager.setBulletScreenOpen(BullectScreenConst.COUNTRY_BOSS_TYPE, true);
        }
        this._refreshView();
        CountryBossHelper.popGoAuction();
    }
    onExit() {
        this._signalFightBoss.remove();
        this._signalFightBoss = null;
        this._signalInterceptList.remove();
        this._signalInterceptList = null;
        this._signalSyncBossUser.remove();
        this._signalSyncBossUser = null;
        this._signalSyncBoss.remove();
        this._signalSyncBoss = null;
        this._signalUserList.remove();
        this._signalUserList = null;
        this._signalBulletNotice.remove();
        this._signalBulletNotice = null;
        this._signalGetAuctionInfo.remove();
        this._signalGetAuctionInfo = null;
        this._signalRecvFlushData.remove();
        this._signalRecvFlushData = null;
        this._signalEnter.remove();
        this._signalEnter = null;
        this._signalForeground.remove();
        this._signalForeground = null;
       var runningScene = G_SceneManager.getTopScene();
        if (this.nextSceneName != 'fight' ) {  ///runningScene && runningScene.getName() != 'fight'
            G_BulletScreenManager.clearBulletLayer();
        }
    }
    _initWidget() {
        this._bloodWidget = cc.instantiate(this.bloodNode).getComponent(BloodNode);
        this._bloodWidget.ctor(this._bossId);
        this._nodeBlood.addChild(this._bloodWidget.node);

        this._rankWidget = cc.instantiate(this.rankNode).getComponent(RankNode);
        this._rankWidget.ctor(this._bossId);
        this._rankParentNode.addChild(this._rankWidget.node);

        this._awardWidget = cc.instantiate(this.awardNode).getComponent(AwardNode);
        this._awardWidget.ctor(this._bossId);
        this._nodeReward.addChild(this._awardWidget.node);

        this._fightWidget = FightBtn.newIns(this._fightTextImage, this._fightCountdown, function () {
            return this._fightCd + G_UserData.getCountryBoss().getChallenge_boss_time2();
        }.bind(this), this._fightCountdownBg);

        this._interceptWidget = FightBtn.newIns(this._InterceptTextImage, this._InterceptCountdown, function () {
            return this._interceptCd + G_UserData.getCountryBoss().getChallenge_boss_user();
        }.bind(this), this._InterceptCountdownBg);


        this._avatarPosition = cc.instantiate(this.avatarPostion).getComponent(AvatarPostion);
        this._avatarPosition.ctor(this._nodeAvatarParent);

        this._stageWidget = StageWidget.newIns(this.node, handler(this, this._onStageChangeCallback));
        this._commonCountDown.setCountdownLableParam({
            color: Colors.DARK_BG_THREE,
            outlineColor: Colors.BRIGHT_BG_OUT_LINE_TWO
        });
        this._commonCountDown.setEndLabelParam({
            color: Colors.DARK_BG_THREE,
            outlineColor: Colors.BRIGHT_BG_OUT_LINE_TWO
        });
        this._commonCountDown.setCountdownTimeParam({
            color: Colors.BRIGHT_BG_RED,
            outlineColor: Colors.BRIGHT_BG_OUT_LINE_TWO
        });
    }
    _onBtnFight() {
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
        if (!this._fightWidget.canFight()) {
            G_Prompt.showTip(Lang.get('country_boss_fight_cd'));
            return;
        }
        G_UserData.getCountryBoss().c2sAttackCountryBoss(this._bossId);
    }
    _onBtnIntercept() {
        var bossData = G_UserData.getCountryBoss().getBossDataById(this._bossId);
        if (!bossData) {
            return;
        }
        if (bossData.isBossDie()) {
            G_Prompt.showTip(CountryBossHelper.getKillTip(this._bossId));
            return;
        }
        if (!this._interceptWidget.canFight()) {
            G_Prompt.showTip(Lang.get('country_boss_intercept_cd'));
            return;
        }
        G_UserData.getCountryBoss().c2sInterceptCountryBossList(this._bossId);
    }
    _onEventBattle(event, message) {
        if (message == null) {
            return;
        }
        var battleReport = message['report'];
        if (battleReport == null) {
            return;
        }
        var reportData = ReportParser.parse(battleReport);
        var battleData = BattleDataHelper.parseCountryBoss(message, this._battleBackgroundId);
        this.nextSceneName = 'fight';
        G_SceneManager.showScene('fight', reportData, battleData);
    }
    _onEventSyncIntercept() {
        this._fightWidget.update();
    }
    _onEventSyncBoss() {
        this._refreshView();
    }
    _onEventEnter() {
        this._refreshView();
    }
    _refreshView() {
        this._fightWidget.update();
        this._interceptWidget.update();
        this._bloodWidget.updateUI();
        this._rankWidget.updateUI();
        this._avatarPosition.updateBossState();
        this._upadteStage();
        this._checkBossDieStopBullet();
    }
    _checkBossDieStopBullet() {
        if (CountryBossHelper.isBossDie(this._bossId)) {
            G_BulletScreenManager.clearBulletLayer();
        }
    }
    _onEventInteceptList() {
        PopupCountryBossIntercept.getIns(PopupCountryBossIntercept, (p: PopupCountryBossIntercept) => {
            p.ctor(this._bossId);
            p.openWithAction();
        })
    }
    _upadteStage() {
        var curStage = this._stageWidget.updateStage();
        if (curStage == CountryBossConst.STAGE3) {
            var [_, endTime] = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE3);
            this._commonCountDown.startCountDown(Lang.get('country_boss_countdown_label3'), endTime);
            this._btnFight.node.active = (true);
            this._btnIntercept.node.active = (true);
        } else {
            this._btnFight.node.active = (false);
            this._btnIntercept.node.active = (false);
            this._commonCountDown.setEndLabelString(Lang.get('country_boss_countdown_label4'));
        }
    }
    _initAvatar() {
        this._avatarPosition.addBoss(this._bossId);
        G_UserData.getCountryBoss().c2sGetMaxCountryBossList(this._bossId);
    }
    _onEventGetAttackUserList(id, userList) {
        if (!userList) {
            return;
        }
        for (var k in userList) {
            var v = userList[k];
            this._avatarPosition.addUserAvatar(v);
        }
    }
    _updateBulletScreenBtn(bulletType) {
        this._danmuPanel.getChildByName('Node_1').active = (false);
        this._danmuPanel.getChildByName('Node_2').active = (false);
        var bulletOpen = G_UserData.getBulletScreen().isBulletScreenOpen(bulletType);
        if (bulletOpen == true) {
               this._danmuPanel.getChildByName('Node_1').active = (true);
           G_BulletScreenManager.showBulletLayer();
            this._isBulletOpen = true;
        } else {
               this._danmuPanel.getChildByName('Node_2').active = (true);
          G_BulletScreenManager.hideBulletLayer();
            this._isBulletOpen = false;
        }
    }
    _onBtnDanmu() {
        var bulletOpen = G_UserData.getBulletScreen().isBulletScreenOpen(BullectScreenConst.COUNTRY_BOSS_TYPE);
        G_UserData.getBulletScreen().setBulletScreenOpen(BullectScreenConst.COUNTRY_BOSS_TYPE, !bulletOpen);
        this._updateBulletScreenBtn(BullectScreenConst.COUNTRY_BOSS_TYPE);
    }
    _onEventBulletNotice(id, message) {
        var user = message['user'] || {};
        var userData: any = {};
        userData.userId = user.user_id || 0;
        userData.name = user.name;
        userData.officialLevel = user.officer_level;
        var [covertId, param] = UserDataHelper.convertAvatarId(user);
        userData.baseId = covertId;
        userData.limitLevel = param.limitLevel;
        if (userData.userId == 0) {
            return;
        }
        if (userData.userId == G_UserData.getBase().getId()) {
            return;
        }
        this._avatarPosition.pushAttack(userData);
    }
    _onStageChangeCallback(curStage) {
        this._refreshView();
        if (curStage == CountryBossConst.NOTOPEN) {
           G_BulletScreenManager.clearBulletLayer();
            this.schedule(function () {
                G_UserData.getAuction().c2sGetAllAuctionInfo();
            }, 1.2)
        }
    }
    _onEventGetAuctionInfo() {
        CountryBossHelper.popGoAuction();
    }
    _onEventRecvFlushData() {
        G_UserData.getCountryBoss().c2sEnterCountryBoss();
    }
    _onEventForeground() {
        G_UserData.getCountryBoss().c2sEnterCountryBoss();
    }
}