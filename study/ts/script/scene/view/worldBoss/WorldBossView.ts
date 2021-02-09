const { ccclass, property } = cc._decorator;

import { AuctionConst } from '../../../const/AuctionConst';
import { AudioConst } from '../../../const/AudioConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { ReportParser } from '../../../fight/report/ReportParser';
import SceneView from '../../../fight/scene/SceneView';
import { G_AudioManager, G_BulletScreenManager, G_ConfigLoader, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { LangTemplate } from '../../../lang/LangTemplate';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import WorldBossAvatar from './WorldBossAvatar';
import { WorldBossHelper } from './WorldBossHelper';
import WorldBossRankNode from './WorldBossRankNode';



@ccclass
export default class WorldBossView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodebk: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBoss: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePeoples: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeReward: cc.Node = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _commonListViewItem: CommonListViewLineItem = null;


    @property({
        type: cc.Node,
        visible: true
    })
    _nodeLeft: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _commonBtnLeft: cc.Button = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _commonBtnFast: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBtnLeft: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFastCount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFastMoney: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _commonBtnRight: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBtnRight: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProcess: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBossName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBarBk: cc.Sprite = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBarTime: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeDesc: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOverTime: cc.Label = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _commonHelp: CommonHelpBig = null;

    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTips: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBossOpenTime: cc.Label = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;


    public static SCENE_ID = 1;
    public static MOVE_TO_BOSS_OFFSET = 60;
    public static MAX_BUBBLE_WIDTH = 200;
    public static START_PRE_AVATAR_INDEX = 200;
    public static MOVE_TIME = 0.5;
    _signalEnterBossInfo: any;
    _signalGetAuctionInfo: any;
    _signalAttackWorldBoss: any;
    _signalFastWorldBoss: any;
    _signalGetGrabPoint: any;
    _signalBulletNotice: any;
    _signalBossHit: any;
    _signalUpdateWorldBossRank: any;
    _isBossOpen: boolean;
    _nodeAvatar:cc.Node;
    _nodeAvatarBoss: cc.Node;
    _sceneView: SceneView;
    _danmuPanel: cc.Node;
    _avatarList: any[];
    _heroId: any;

    public static waitEnterMsg(callBack) {
        var onMsgCallBack = function () {
            var data: Array<string> = [];
            data.push("prefab/worldBoss/WorldBossAvatar");
            data.push("prefab/worldBoss/PopupWorldBossRob");
            data.push("prefab/worldBoss/PopupWorldBossRobCell");
            data.push("prefab/worldBoss/WorldBossRankCell");
            data.push("prefab/worldBoss/WorldBossRankNode");

            cc.resources.load(data, (err, data) => {
                callBack();
            });
        }.bind(this);
        G_UserData.getWorldBoss().c2sEnterWorldBoss();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_WORLDBOSS_GET_INFO, onMsgCallBack);
        return signal;
    }
    initData() {
        this._isBossOpen = false;
        this._nodeAvatar = null;
        this._nodeAvatarBoss = null;
        this.node.name = ('WorldBossView');
    }
    _onWolrdBossClickBack() {
        G_SceneManager.popScene();
    }
    onCreate() {
        this.initData();
        //not compelte

        this._danmuPanel = this._commonChat.getPanelDanmu();
        UIHelper.addClickEventListenerEx(this._danmuPanel, handler(this, this._onBtnDanmu));
        this._updateBulletScreenBtn(1);
        G_BulletScreenManager.setBulletScreenOpen(1, true);

        this._topbarBase.setImageTitle('txt_sys_com_juntuanboss');
        this._topbarBase.hideBG();
        this._topbarBase.setCallBackOnBack(handler(this, this._onWolrdBossClickBack));
        this._topbarBase.updateUIByResList([
            {
                type: 0,
                value: 0
            },
            {
                type: 0,
                value: 0
            },
            {
                type: 0,
                value: 0
            },
            {
                type: 0,
                value: 0
            }
        ]);
        this._commonHelp.updateUI(FunctionConst.FUNC_WORLD_BOSS);
        this._textBossOpenTime.string = (Lang.get('worldboss_open_time'));
        this._nodeLeft.removeAllChildren();
        
        this._commonBtnFast.setString(Lang.get("worldboss_fast"))

        var resource = cc.resources.get("prefab/worldBoss/WorldBossRankNode");
        var node1 = cc.instantiate(resource) as cc.Node;
        node1.name = "WorldBossRankNode";
        this._nodeLeft.addChild(node1);

        // this._worldBossRewardNode = new WorldBossRewardPreviewNode(this._nodeReward);

        this._sceneView = new cc.Node("_view").addComponent(SceneView) as SceneView;
        this._sceneView.init();
        this._nodebk.setAnchorPoint(0.5, 0.5);
        // this._nodebk.setIgnoreAnchorPointForPosition(false);
        this._nodebk.addChild(this._sceneView.node);
        this._sceneView.node.setPosition(0, 0);
        this._sceneView.resetScene(WorldBossView.SCENE_ID);

        // cc.bind(this._commonChat, 'CommonMiniChat');
    }
    _updateButton() {
        var isBossOpen = G_UserData.getWorldBoss().isBossStart()[0];
        this._textBossOpenTime.node.active = (false);
        var bossBtnName = WorldBossHelper.getBossFightBtnName();
        this._commonBtnRight.node.active = (false);
        this._commonBtnLeft.node.active = (false);
        this._commonBtnFast.node.active = false;
        if (isBossOpen == true) {
            this._textBtnRight.string = bossBtnName[0];
            this._commonBtnRight.node.active = (true);
        }
        var userBtnName = WorldBossHelper.getUserFightBtnName()[0];
        if (isBossOpen == true) {
            this._textBtnLeft.string = (userBtnName);
            this._commonBtnLeft.node.active = (true);
        } 
    }
    _updateWorldBossRankNode() {
        var bossRank = this._nodeLeft.getChildByName('WorldBossRankNode');
        if (bossRank == null) {
            return;
        }
        bossRank.getComponent(WorldBossRankNode).updateUI();
    }
    _checkShowDlg() {
        //logWarn('WorldBossView:_checkShowDlg show !!!!!!!!!!! start');
        var isAuctionWorldEnd = G_UserData.getAuction().isAuctionShow(AuctionConst.AC_TYPE_GUILD_ID);
        if (isAuctionWorldEnd == false) {
            //logWarn('WorldBossView:_showGuildDlg  isAuctionWorldEnd = false ');
            return;
        }
        if (G_UserData.getWorldBoss().needShopPromptDlg() == true) {
            //logWarn('WorldBossView:_checkShowDlg show !!!!!!!!!!! enter');
            var isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                this._showGuildDlg();
            }
        }
    }
    onEnter() {
        
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_WORLDBOSS);
        this._signalEnterBossInfo = G_SignalManager.add(SignalConst.EVENT_WORLDBOSS_GET_INFO, handler(this, this._onEventEnterBossInfo));
        this._signalGetAuctionInfo = G_SignalManager.add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(this, this._onEventGetAuctionInfo));
        this._signalAttackWorldBoss = G_SignalManager.add(SignalConst.EVENT_WORLDBOSS_ATTACK_BOSS, handler(this, this._onEventAttackWorldBoss));
        this._signalFastWorldBoss = G_SignalManager.add(SignalConst.EVENT_WORLDBOSS_FAST_BOSS, this._onEventFastWorldBoss.bind(this));
        this._signalGetGrabPoint = G_SignalManager.add(SignalConst.EVENT_WORLDBOSS_GET_GRAB_POINT, handler(this, this._onEventGrabWorldBossPoint));
        this._signalBulletNotice = G_SignalManager.add(SignalConst.EVENT_BULLET_SCREEN_POST, handler(this, this._onEventBulletNotice));
        this._signalBossHit = G_SignalManager.add(SignalConst.EVENT_BULLET_BOSS_HIT, handler(this, this._onEventBossHit));
        this._signalUpdateWorldBossRank = G_SignalManager.add(SignalConst.EVENT_WORLDBOSS_UPDATE_RANK, handler(this, this._onEventUpdateWorldBossRank));
        G_UserData.getAuction().c2sGetAllAuctionInfo();
        this._updatePeopleAvatar();
        this._isBossOpen = G_UserData.getWorldBoss().isBossStart()[0];
        this._onRefreshTick();
        this._updateBossAvatar();
        this._startRefreshHandler();
        this._updateWorldBossRankNode();
        this._checkShowDlg();
        // this._worldBossRewardNode.updateInfo();
        this.updateRewardInfo();
        this._heroId = 0;

        this._commonBtnFast.addTouchEventListenerEx(handler(this,this.onBtnFast),false);
    }

    updateRewardInfo(rewards?) {
        let reward = rewards || WorldBossHelper.getPreviewRewards();
        this._commonListViewItem.updateUI(reward);
        this._commonListViewItem.setMaxItemSize(5)
        this._commonListViewItem.setListViewSize(410, 100)
        this._commonListViewItem.setItemsMargin(2);
    }

    onExit() {
        if (this.nextSceneName != 'fight') {
            //logWarn('G_BulletScreenManager:clearBulletLayer()');
            G_BulletScreenManager.clearBulletLayer();
        }
        this._endRefreshHandler();
        this._signalEnterBossInfo.remove();
        this._signalEnterBossInfo = null;
        this._signalGetGrabPoint.remove();
        this._signalGetGrabPoint = null;
        this._signalAttackWorldBoss.remove();
        this._signalAttackWorldBoss = null;
        this._signalFastWorldBoss.remove();
        this._signalFastWorldBoss = null;
        this._signalGetAuctionInfo.remove();
        this._signalGetAuctionInfo = null;
        this._signalBulletNotice.remove();
        this._signalBulletNotice = null;
        this._signalBossHit.remove();
        this._signalBossHit = null;
        this._signalUpdateWorldBossRank.remove();
        this._signalUpdateWorldBossRank = null;
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_GUILD_BOSS_EXIT,{});
    }
    _onBtnDanmu() {
        //logWarn('WorldBossView:_onBtnDanmu');
        var bulletOpen = G_UserData.getBulletScreen().isBulletScreenOpen(1);
        G_UserData.getBulletScreen().setBulletScreenOpen(1, !bulletOpen);
        this._updateBulletScreenBtn(1);
    }
    _updateBulletScreenBtn(bulletType) {
        var node1 = this._danmuPanel.getChildByName('Node_1');
        node1.active = (false);
        var node2 = this._danmuPanel.getChildByName('Node_2');
        node2.active = (false);
        var bulletOpen = G_UserData.getBulletScreen().isBulletScreenOpen(bulletType);
        if (bulletOpen == true) {
            node1.active = (true);
            G_BulletScreenManager.showBulletLayer();

            /////do test弹幕测试
            {
                // var message:any = {};
                // message.content = [];
                // var bulletNotice:any = {};
                // bulletNotice.color = 1;
                // bulletNotice.param = 0;
                // bulletNotice.sn_type = 1;
                // var simpleUser:any = {};
                // simpleUser.avatar_base_id = 0;
                // simpleUser.leader = 1;
                // simpleUser.level = 95;
                // simpleUser.name = 'rooney1';
                // simpleUser.officer_level = 0;
                // simpleUser.title = 0;
                // simpleUser.user_id = 30001000033;
                // bulletNotice.user = simpleUser;
                // bulletNotice.content = [];
                // var noticePair1 = {key:'name',value:'rooney1'};
                // bulletNotice.content.push(noticePair1);
                // var noticePair2 = {key:'number',value:'7583'};
                // bulletNotice.content.push(noticePair2);
                // message.content.push(bulletNotice);
                // G_SignalManager.dispatch(SignalConst.EVENT_BULLET_SCREEN_NOTICE, message);
            }
            
        } else {
            node2.active = (true);
            G_BulletScreenManager.hideBulletLayer();
        }
    }
    onBtnLeft() {
        if (WorldBossHelper.checkUserFight() == false) {
            return;
        }
        var isOpen = G_UserData.getWorldBoss().isBossStart()[0];
        if (isOpen == true) {
            G_SceneManager.showDialog("prefab/worldBoss/PopupWorldBossRob");
        }
    }
    onBtnRight() {
        var isOpen = G_UserData.getWorldBoss().isBossStart()[0];
        if (isOpen == false) {
            G_Prompt.showTip(Lang.get('worldboss_no_open'));
            return;
        }
        if (WorldBossHelper.checkBossFight() == false) {
            return;
        }
        G_UserData.getWorldBoss().c2sAttackWorldBoss();
    }
    onBtnFast(){
        G_UserData.getWorldBoss().c2sFastWorldBoss();
    }
    _onRequestTick() {
        var [isBossOpen] = G_UserData.getWorldBoss().isBossStart();
        if (isBossOpen) {
            G_UserData.getWorldBoss().c2sUpdateWorldBossRank();
        }
    }
    _onRefreshTick() {
        this._updateButton();
        var isBossOpen = G_UserData.getWorldBoss().isBossStart()[0];
        this._imageTips.node.active = false;
        if (isBossOpen) {
            this._danmuPanel.active = (true);
            this._textTimeDesc.string = (Lang.get('worldboss_close_time_desc'));
            var [endString, percent] = WorldBossHelper.getEndTime();
            this._textOverTime.string = (endString);
            this._loadingBarTime.node.active = (true);
            this._loadingBarTime.progress = (percent / 100);
            this._imageBarBk.node.active = (true);
            if (this._isBossOpen != isBossOpen) {
                G_SignalManager.dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE);
                G_UserData.getWorldBoss().c2sEnterWorldBoss();
                this._isBossOpen = isBossOpen;
            }
        }
        else {
            if (this._isBossOpen != isBossOpen) {
                this._isBossOpen = isBossOpen;
                G_BulletScreenManager.clearBulletLayer();
                G_UserData.getWorldBoss().c2sEnterWorldBoss();
                G_UserData.getAuction().c2sGetAllAuctionInfo();
            }
            //this._danmuPanel.active = (false);
            this._textTimeDesc.string = (Lang.get('worldboss_open_time_desc'));
            var startString = WorldBossHelper.getOpenTime();
            this._textOverTime.string = (startString);
            this._loadingBarTime.progress = 1;
        }
    }
    _startRefreshHandler() {
        this._endRefreshHandler();
        this.schedule(this._onRefreshTick, 1);
        var interVal = WorldBossHelper.getParameterValue('boss_update_time');
        this.schedule(this._onRequestTick, interVal);
    }
    _endRefreshHandler() {
        this.unschedule(this._onRefreshTick);
        this.unschedule(this._onRequestTick);
    }
    _onEventGetAuctionInfo(id, message) {
        this._checkShowDlg();
    }
    _onEventEnterBossInfo(id, message) {
        this._updateBossAvatar();
        this._updateWorldBossRankNode();
        // this._worldBossRewardNode.updateInfo();
        this.updateRewardInfo();
        this._checkShowDlg();
    }
    _onEventAttackWorldBoss(id, message) {
        if (message == null) {
            return;
        }
        var battleReport = message["report"];
        if (battleReport == null) {
            return;
        }
        var onFinish = function () {
            var reportData = ReportParser.parse(battleReport);
            var battleData = BattleDataHelper.parseWorldBossFight(message);
            this.nextSceneName = 'fight';
            G_SceneManager.showScene('fight', reportData, battleData);
            G_UserData.getWorldBoss().c2sEnterWorldBoss();
        }.bind(this);
        this._playMovingEffect(onFinish);
    }
    _onEventFastWorldBoss(id, message) {
        if (message == null) {
            return;
        }
        var battleReport = message["report"];
        if (battleReport == null) {
            return;
        }
        var onFinish = function () {
            var reportData = ReportParser.parse(battleReport);
            var battleData = BattleDataHelper.parseWorldBossFight(message);
            this.nextSceneName = 'fight';
            G_SceneManager.showScene('fight', reportData, battleData);
            G_UserData.getWorldBoss().c2sEnterWorldBoss();
        }.bind(this);
        this._playMovingEffect(onFinish);
    }
    _onEventGrabWorldBossPoint(id, message) {
        if (message == null) {
            return;
        }
        var reportId = message["report"];
        var enterFightView = function (message) {
            var battleReport = G_UserData.getFightReport().getReport();
            var reportData = ReportParser.parse(battleReport);
            var battleData = BattleDataHelper.parseWorldBossPoint(message);
            this.nextSceneName = 'fight';
            G_SceneManager.showScene('fight', reportData, battleData);
        }.bind(this);
        G_SceneManager.registerGetReport(reportId, function () {
            enterFightView(message);
        }.bind(this));
        G_UserData.getWorldBoss().c2sEnterWorldBoss();
    }
    _showGuildDlg() {
        var guildCount = G_UserData.getWorldBoss().getEndNoticeValue('number');
        if (!guildCount) {
            //logWarn('WorldBossView:_showGuildDlg guildCount is nil');
            return;
        }
        //logWarn('WorldBossView:_showGuildDlg !!!!!!!!!!!');
        var guildPoint = G_UserData.getWorldBoss().getEndNoticeValue('integral');
        var guildTimes = G_UserData.getWorldBoss().getEndNoticeValue('times');
        var guildRank = G_UserData.getWorldBoss().getEndNoticeValue('rank');
        var guildPrestige = G_UserData.getWorldBoss().getEndNoticeValue('prestige');
        var personDlg = Lang.get('worldboss_reward_finish_show2', {
            point: guildPoint,
            count: guildCount,
            guildRank: guildRank,
            guildExp: guildPrestige
        });
        var onBtnGo = function () {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION);
        }.bind(this);

        G_SceneManager.openPopup('prefab/common/PopupSystemAlert', (popup: PopupSystemAlert) => {
            popup.setup(Lang.get('worldboss_popup_title1'), personDlg, onBtnGo);
            popup.setCheckBoxVisible(false);
            popup.showGoButton(Lang.get('worldboss_go_btn2'));
            popup.setCloseVisible(true);
            popup.openWithAction();
        })
    }
    _updatePeopleAvatar() {
        // crashPrint('WorldBossView:_updatePeopleAvatar begin');
        var avatarList = G_UserData.getWorldBoss().getUsers();
        if (this._nodeAvatar) {
            this._nodeAvatar.removeAllChildren();
        } else {
            this._nodeAvatar = new cc.Node();
            this._sceneView.addEntityActor(this._nodeAvatar);
        }
        this._avatarList = [];
        var BossPeopleXY = G_ConfigLoader.getConfig('boss_people_xy');

        for (var i in avatarList) {
            var value = avatarList[i];

            var res = cc.resources.get("prefab/worldBoss/WorldBossAvatar");
            var node1 = cc.instantiate(res) as cc.Node;
            var avatarNode = node1.getComponent(WorldBossAvatar);
            this._avatarList.push(node1);
            this._nodeAvatar.addChild(node1);
            node1.name = ('avatar' + (parseInt(i) + 1));

            var configPos = BossPeopleXY.get(parseInt(i) + 1);
            node1.x = configPos.x;
            node1.y = configPos.y;
            node1.zIndex = (10000 - node1.y);
            avatarNode.updatePlayerInfo(value);

        }
        this._createPreAvatar();
        // crashPrint('WorldBossView:_updatePeopleAvatar end');
    }
    _createPreAvatar() {
        var boss_people_xy = G_ConfigLoader.getConfig('boss_people_xy');
        var maxCount = WorldBossView.START_PRE_AVATAR_INDEX + 5;
        var createHeroAvatar = function (index) {
            var configPos = boss_people_xy.get(index);
            // assert(configPos, 'can not find boss_people_xy by id : ' + index);

            var res = cc.resources.get("prefab/worldBoss/WorldBossAvatar");
            var node1 = cc.instantiate(res) as cc.Node;
            var avatarNode = node1.getComponent(WorldBossAvatar);
            avatarNode.node.name = ('avatar' + index);
            avatarNode.node.setPosition(cc.v2(configPos.x, configPos.y));
            avatarNode.node.active = (false);
            return node1;
        }.bind(this);
        for (var i = WorldBossView.START_PRE_AVATAR_INDEX; i <= maxCount; i++) {
            var avatar = createHeroAvatar(i);
            avatar.zIndex = (10000 - avatar.y);
            this._nodeAvatar.addChild(avatar);
        }
    }
    _playMovingEffect(callBack) {
        //logWarn('WorldBossView:_playMovingEffect');
        var avatarNode: any = this._nodeAvatar.getChildByName('avatar1');
        if (avatarNode == null) {
            return;
        }
        avatarNode.getComponent(WorldBossAvatar).playMovingEffect(callBack);
    }
    _updateBossAvatar() {
        var bossInfo = WorldBossHelper.getBossInfo();
        if (this._heroId == bossInfo.id) {
            return;
        }
        if (this._nodeAvatarBoss) {
            this._nodeAvatarBoss.removeAllChildren();
        } else {
            this._nodeAvatarBoss = new cc.Node();
            this._sceneView.addEntityActor(this._nodeAvatarBoss);
        }
        this._textBossName.string = (bossInfo.name);
        var worldBossPos = WorldBossHelper.getBossPosition();
        this._heroId = bossInfo.id;

        var res = cc.resources.get("prefab/worldBoss/WorldBossAvatar");
        var node1 = cc.instantiate(res) as cc.Node;
        node1.name = "WorldBossAvatar";
        var avatarNode = node1.getComponent(WorldBossAvatar);
        this._nodeAvatarBoss.addChild(avatarNode.node);
        avatarNode.turnBack();
        avatarNode.setCallBack(handler(this, this.onBtnRight));
        avatarNode.node.setPosition(worldBossPos);
        avatarNode.node.name = ('boss');
        avatarNode.updateBaseId(bossInfo.hero_id);
        avatarNode.setBossName(bossInfo.name);
    }
    _onEventBulletNotice(id, message) {
        var user = message[user] || {};
        var userData: any = {};
        userData.userId = user.user_id || 0;
        userData.name = user.name;
        userData.officialLevel = user.officer_level;
        userData.baseId = user.leader;
        userData.titleId = user.title || 0;
        var [converId, playerInfo] = UserDataHelper.convertAvatarId(user);
        userData.playerInfo = playerInfo;
        if (userData.userId == 0) {
            return;
        }
        if (userData.userId == G_UserData.getBase().getId()) {
            return;
        }
        var findAvatarById = function (userId) {
            for (var i in this._avatarList) {
                var avatar = this._avatarList[i];
                if (avatar.getUserId() == userId) {
                    return avatar;
                }
            }
            return null;
        }.bind(this);
        var avatar = findAvatarById(userData.userId);
        if (avatar) {
            if (avatar.isPlaying() == false) {
                avatar.playGoAttack();
            }
        } else {
            var tryPlayAttack = function (index, userData) {
                var avatarNode = this._nodeAvatar.getChildByName('avatar' + index);
                if (avatarNode == null) {
                    return;
                }
                if (avatarNode.isPlaying() == true) {
                    //logWarn('avatarNode is isPlaying index: ' + index);
                    return false;
                }
                // dump(userData);
                //logWarn('avatarNode is updatePlayerInfo index: ' + index);
                avatarNode.updatePlayerInfo(userData);
                avatarNode.playImmAttack();
                return true;
            }
            for (var i = WorldBossView.START_PRE_AVATAR_INDEX; i <= WorldBossView.START_PRE_AVATAR_INDEX + 5; i += 1) {
                if (tryPlayAttack(i, userData) == true) {
                    break;
                }
            }
        }
    }
    _onEventBossHit() {
        var bossNode = this._nodeAvatarBoss.getChildByName('boss');
        if (bossNode == null) {
            return;
        }
        bossNode.getChildByName("WorldBossAvatar").getComponent(WorldBossAvatar).playHitAction();
    }
    _onEventUpdateWorldBossRank() {
        this._updateWorldBossRankNode();
    }

}