const { ccclass, property } = cc._decorator;

// import CommonChatMiniNode from '../chat/CommonChatMiniNode'

import { AudioConst } from '../../../const/AudioConst';
import { BullectScreenConst } from '../../../const/BullectScreenConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { GuildWarConst } from '../../../const/GuildWarConst';
import { SignalConst } from '../../../const/SignalConst';
import { Colors, G_AudioManager, G_BulletScreenManager, G_EffectGfxMgr, G_SceneManager, G_ServerTime, G_ServiceManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { EffectGfxType } from '../../../manager/EffectGfxManager';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { GuildWarDataHelper } from '../../../utils/data/GuildWarDataHelper';
import { handler } from '../../../utils/handler';
import { GuildWarCheck } from '../../../utils/logic/GuildWarCheck';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import GuildWarAuctionHelper from '../guildwar/GuildWarAuctionHelper';
import GuildWarBattleMapNode from './GuildWarBattleMapNode';
import GuildWarCountdownNode from './GuildWarCountdownNode';
import GuildWarEnemyListNode from './GuildWarEnemyListNode';
import GuildWarNoticeNode from './GuildWarNoticeNode';
import GuildWarRebornCDNode from './GuildWarRebornCDNode';
import GuildWarTaskListNode from './GuildWarTaskListNode';
import PopupGuildWarRecord from './PopupGuildWarRecord';


@ccclass
export default class GuildWarBattleView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMapParent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _slider: cc.Node = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnMyPos: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnBattleLog: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnMagnifier: CommonMainMenu = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnChangeCity: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_Left_Top: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _ndoeTargetListParent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCountdownParent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectParent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEnemyListParent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _tipsParentNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCdTime: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _img_bg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCdTitle: cc.Label = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRebornCDParent: cc.Node = null;

    @property({
        type: GuildWarBattleMapNode,
        visible: true
    })
    _mapNode: GuildWarBattleMapNode = null;

    _cityId: any;
    _isCameraFar: boolean;
    _showMoveCdEffect: boolean;
    _showAttackCdEffect: boolean;
    _rebornCDNode: any;
    _guildWarNotice: any;
    _guildWarAuctionHelper: GuildWarAuctionHelper;
    _taskListNode: any;
    _signalGuildWarBattleInfoGet: any;
    _signalGuildWarBattleInfoSyn: any;
    _signalGuildWarBattleMoveCamera: any;
    _signalLoginSuccess: any;
    _signalGuildWarAttackNotice: any;
    _signalGuildWarBattleGoCampNotice: any;
    _isBulletOpen: boolean = true;

    protected preloadEffectList = [
        {
            type: EffectGfxType.MovingGfx,
            name: "moving_juntuanzhan_jiantou"
        }
    ];
    _danmuPanel: cc.Node;

    public static waitEnterMsg(callBack) {
        var data: Array<string> = [];
        data.push("prefab/guildwarbattle/GuildWarEnemyListNode");
        data.push("prefab/guildwarbattle/GuildWarTaskListNode");
        data.push("prefab/guildwarbattle/GuildWarNoticeNode");
        data.push("prefab/guildwarbattle/GuildWarBattleMapNode");
        data.push("prefab/guildwarbattle/GuildWarRebornCDNode");
        data.push("prefab/guildwarbattle/GuildWarCountdownNode");
        data.push("prefab/guildwarbattle/GuildWarUserHpNode");
        data.push("prefab/guildwarbattle/GuildWarMoveSignNode");
        data.push("prefab/guildwarbattle/GuildWarPointWheelNode");
        data.push("prefab/guildwarbattle/GuildWarPointNode");
        data.push("prefab/guildwarbattle/GuildWarBuildingNode");
        data.push("prefab/guildwarbattle/GuildWarBuildingHpNode");
        data.push("prefab/guildwarbattle/GuildWarRunAvatorNode");
        data.push("prefab/guildwarbattle/GuildWarPointNameNode");
        data.push("prefab/guildwarbattle/GuildWarPopulationNode");
        data.push("prefab/guildwarbattle/GuildWarTaskNode");
        data.push("prefab/guildwarbattle/GuildWarRecordItemCell");
        data.push("prefab/guildwarbattle/GuildWarEnemyItemCell");
        data.push("prefab/guildwarbattle/GuildWarAvatarItem");
        data.push("prefab/guildwarbattle/GuildWarHurtRankNode");

        data.push("prefab/common/CommonSimpleHeroAvatar");

        var imgArr: Array<string> = [];
        imgArr.push("ui3/background/guildwar_bg_1_1")
        imgArr.push("ui3/background/guildwar_bg_1_2")
        imgArr.push("ui3/background/guildwar_bg_1_3")
        imgArr.push("ui3/background/guildwar_bg_1_4")
        imgArr.push("ui3/background/guildwar_bg_2_1")
        imgArr.push("ui3/background/guildwar_bg_2_2")
        imgArr.push("ui3/background/guildwar_bg_2_3")
        imgArr.push("ui3/background/guildwar_bg_2_4")
        imgArr.push("ui3/background/guildwar_bg_3_1")
        imgArr.push("ui3/background/guildwar_bg_3_2")
        imgArr.push("ui3/background/guildwar_bg_3_3")
        imgArr.push("ui3/background/guildwar_bg_3_4")
        imgArr.push("ui3/background/guildwar_bg_3_5")
        imgArr.push("ui3/background/guildwar_bg_3_6")
        imgArr.push("ui3/background/guildwar_bg_3_7")
        imgArr.push("ui3/background/guildwar_bg_3_8")

        cc.resources.load(imgArr, cc.SpriteFrame, () => {
            cc.resources.load(data, cc.Prefab, handler(this, (error, res) => {
                callBack();
            }));
        });
    }

    initData(cityId) {
        this._cityId = cityId;
        this._guildWarAuctionHelper = null;
        this._guildWarNotice = null;
        this._isCameraFar = false;
        this._showMoveCdEffect = false;
        this._showAttackCdEffect = false;
    }
    onCreate() {
        let cityId = G_SceneManager.getViewArgs("guildwarbattle")[0];
        this.initData(cityId);
        this.node.name = ('GuildWarBattleView');
        this._topbarBase.hideBG();
        this._topbarBase.setItemListVisible(false);
        this._btnBattleLog.updateUI(FunctionConst.FUNC_GUILD_DUNGEON_RECORD);
        this._btnBattleLog.addClickEventListenerEx(handler(this, this._onClickLog));
        this._btnMagnifier.updateUI(FunctionConst.FUNC_GUILD_WAR_MAP_BIG);
        this._btnMagnifier.addClickEventListenerEx(handler(this, this._onClickMagnifier));
        this._refreshCityName();
        this._btnMyPos.updateUI(FunctionConst.FUNC_MINE_POS);
        var guildWarEnemyListNode = Util.getNode("prefab/guildwarbattle/GuildWarEnemyListNode", GuildWarEnemyListNode) as GuildWarEnemyListNode;
        guildWarEnemyListNode.initData(this._cityId);
        this._nodeEnemyListParent.addChild(guildWarEnemyListNode.node);


        var taskListNode = Util.getNode("prefab/guildwarbattle/GuildWarTaskListNode", GuildWarTaskListNode) as GuildWarTaskListNode;
        taskListNode.initData(this._cityId);
        this._nodeEnemyListParent.addChild(taskListNode.node);
        this._taskListNode = taskListNode;

        this._guildWarNotice = Util.getNode("prefab/guildwarbattle/GuildWarNoticeNode", GuildWarNoticeNode) as GuildWarNoticeNode;
        this._guildWarNotice.initData(1);
        this._nodeEnemyListParent.addChild(this._guildWarNotice.node);

        this._mapNode.initData(this._cityId);

        var rebornCDNode = Util.getNode("prefab/guildwarbattle/GuildWarRebornCDNode", GuildWarRebornCDNode) as GuildWarRebornCDNode;
        this._rebornCDNode = rebornCDNode;
        this._nodeRebornCDParent.addChild(rebornCDNode.node);
        this._guildWarAuctionHelper = new GuildWarAuctionHelper(this._cityId);

        this._danmuPanel = this._commonChat.getPanelDanmu();
        UIHelper.addClickEventListenerEx(this._danmuPanel, handler(this, this._onBtnDanmu));
        G_BulletScreenManager.setBulletScreenOpen(BullectScreenConst.GUILD_WAR_TYPE, true);
        this._updateBulletScreenBtn(BullectScreenConst.GUILD_WAR_TYPE);
    }

    update() {
        let a = this._danmuPanel;
    }

    onEnter() {
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_GUILD_WAR_BATTLE);
        this._signalGuildWarBattleInfoGet = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET, handler(this, this._onEventGuildWarBattleInfoGet));
        this._signalGuildWarBattleInfoSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN, handler(this, this._onEventGuildWarBattleInfoSyn));
        this._signalGuildWarBattleMoveCamera = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_MOVE_CAMERA, handler(this, this._onEventGuildWarBattleMoveCamera));
        this._signalLoginSuccess = G_SignalManager.add(SignalConst.EVENT_LOGIN_SUCCESS, handler(this, this._onEventLoginSuccess));
        this._signalGuildWarAttackNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE, handler(this, this._onEventGuildWarAttackNotice));
        this._signalGuildWarBattleGoCampNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_GO_CAMP_NOTICE, handler(this, this._onEventGuildWarBattleGoCampNotice));
        this._startTimer();
        this._guildWarAuctionHelper.onEnter();
        this._refreshTimeView();
        this._refreshCdTimeView();
        if (this._isBulletOpen) {
            G_BulletScreenManager.setBulletScreenOpen(BullectScreenConst.GUILD_WAR_TYPE, true);
        }
        this._checkCountDown();
        this._startFinishTimer();
        this._rebornCDNode.updateVisible(this._cityId);
        this._refreshChangeCityBtn();

        this._restoreMapScaleState();

        this._danmuPanel.active = (true);
    }
    onExit() {
        this._endTimer();
        this._removeCountDown();
        this._endFinishTimer();
        this._signalGuildWarBattleInfoSyn.remove();
        this._signalGuildWarBattleInfoSyn = null;
        this._signalGuildWarBattleInfoGet.remove();
        this._signalGuildWarBattleInfoGet = null;
        this._signalGuildWarBattleMoveCamera.remove();
        this._signalGuildWarBattleMoveCamera = null;
        this._signalLoginSuccess.remove();
        this._signalLoginSuccess = null;
        this._signalGuildWarAttackNotice.remove();
        this._signalGuildWarAttackNotice = null;
        this._signalGuildWarBattleGoCampNotice.remove();
        this._signalGuildWarBattleGoCampNotice = null;
        this._guildWarAuctionHelper.onExit();
        var runningScene = G_SceneManager.getTopScene();
        if (runningScene && runningScene.getName() != 'fight') {
            G_BulletScreenManager.clearBulletLayer();
        }
    }
    _onEventGuildWarBattleInfoGet(event, cityId) {
        this._cityId = cityId;
        this._nodeMapParent.removeAllChildren();

        var mapNode = Util.getNode("prefab/guildwarbattle/GuildWarBattleMapNode", GuildWarBattleMapNode) as GuildWarBattleMapNode;
        mapNode.initData(cityId);
        this._nodeMapParent.addChild(mapNode.node);

        this._mapNode = mapNode;
        this._guildWarNotice.clear();
        this._restoreMapScaleState();
        this._guildWarAuctionHelper.setCityId(this._cityId);
        this._refreshCityName();
        this._refreshChangeCityBtn();
    }
    _onEventGuildWarBattleInfoSyn(event) {
    }
    _onEventGuildWarBattleMoveCamera(event, moving) {
        this._btnMagnifier.setEnabled(!moving);
    }
    _onEventLoginSuccess() {
        G_UserData.getGuildWar().c2sGetGuildWarWorld();
        var status = GuildWarDataHelper.getGuildWarStatus();
        if (status == GuildWarConst.STATUS_CLOSE) {
            G_SceneManager.popScene();
            return;
        }
        var nextCityId = this._cityId;
        G_UserData.getGuildWar().c2sEnterGuildWar(nextCityId);
    }
    _onEventGuildWarAttackNotice(event, cityId, unit) {
        if (cityId != this._cityId) {
            return;
        }
        this._guildWarNotice.showMsg(unit);
    }
    _onEventGuildWarBattleGoCampNotice(event, userData) {
        if (userData && userData.isSelf()) {
            var callback = function () {
                this._rebornCDNode.startCD();
            }.bind(this);
            callback();
        }
    }
    _startTimer() {
        this.schedule(this._onRefreshTick, 0.2);
    }
    _endTimer() {
        this.unschedule(this._onRefreshTick);
    }
    _startFinishTimer() {
        var timeRegion = GuildWarDataHelper.getGuildWarTimeRegion();
        var endTime = timeRegion.endTime;
        if (endTime > G_ServerTime.getTime()) {
            G_ServiceManager.registerOneAlarmClock('GuildWarAuctionHelper_Aution', endTime, function () {
                G_BulletScreenManager.clearBulletLayer();
                this._mapNode.finishBattle();
            }.bind(this));
        }
    }
    _endFinishTimer() {
        G_ServiceManager.DeleteOneAlarmClock('GuildWarAuctionHelper_Aution');
    }
    onMyPosClick() {
        this._mapNode.gotoMyPosition();
    }
    onChangeCityClick(sender) {
        // var pointId = sender.getTag();
        var pointId = GuildWarDataHelper.getExitPoint(this._cityId);
        var success = GuildWarCheck.guildWarCanExit(this._cityId, null);
        if (success) {
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_CHANGE_CITY, pointId);
        }
    }
    _onRefreshTick(dt) {
        this._refreshTimeView();
        this._refreshCdTimeView();
        var finishCall = function () {
            this._mapNode.gotoCamp();
        }.bind(this);
        this._rebornCDNode.refreshCdTimeView(this._cityId, finishCall);
    }
    _refreshTimeView() {
        var timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion();
        var curTime = G_ServerTime.getTime();
        if (curTime >= timeData.startTime && curTime < timeData.time1) {
            var txt = G_ServerTime.getLeftSecondsString(timeData.time1, '00:00:00');
            this._textTimeTitle.string = (Lang.get('guildwar_prepare_downtime'));
            this._textTime.string = (txt);
            this._textTimeTitle.node.x = (-40);
        } else if (curTime >= timeData.time1 && curTime < timeData.endTime) {
            var txt = G_ServerTime.getLeftSecondsString(timeData.endTime, '00:00:00');
            this._textTimeTitle.string = (Lang.get('guildwar_close_downtime'));
            this._textTime.string = (txt);
            this._textTimeTitle.node.x = (-40);
            this._guildWarAuctionHelper.checkShowDlg();
        } else {
            this._textTimeTitle.string = (Lang.get('guildwar_activity_finish'));
            this._textTime.string = ('');
            this._textTimeTitle.node.x = (0);
        }
    }
    _refreshCityName() {
        var config = GuildWarDataHelper.getGuildWarCityConfig(this._cityId);
        this._topbarBase.setTitle(config.name, 40, Colors.DARK_BG_THREE, Colors.DARK_BG_OUTLINE);
    }
    _onBtnDanmu() {
        var bulletOpen = G_UserData.getBulletScreen().isBulletScreenOpen(BullectScreenConst.GUILD_WAR_TYPE);
        G_UserData.getBulletScreen().setBulletScreenOpen(BullectScreenConst.GUILD_WAR_TYPE, !bulletOpen);
        this._updateBulletScreenBtn(BullectScreenConst.GUILD_WAR_TYPE);
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
            this._isBulletOpen = true;
        } else {
            node2.active = (true);
            G_BulletScreenManager.hideBulletLayer();
            this._isBulletOpen = false;
        }
    }
    _checkCountDown() {
        this._nodeCountdownParent.removeAllChildren();
        var timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion();
        var curTime = G_ServerTime.getTime();
        if (curTime >= timeData.startTime && curTime < timeData.time1) {
            var node = Util.getNode("prefab/guildwarbattle/GuildWarCountdownNode", GuildWarCountdownNode) as GuildWarCountdownNode;
            this._nodeCountdownParent.addChild(node.node);
            node.startCountdown(timeData.time1);
        }
    }
    _removeCountDown() {
        this._nodeCountdownParent.removeAllChildren();
    }
    _onClickLog(sender) {
        G_SceneManager.openPopup("prefab/guildwarbattle/PopupGuildWarRecord", (popup: PopupGuildWarRecord) => {
            popup.node.name = ('PopupGuildWarRecord');
            popup.openWithAction();
        });
    }
    _onClickMagnifier(sender) {
        this._isCameraFar = !this._isCameraFar;
        if (this._isCameraFar) {
            this._mapNode.doScaleAnim(0);
        } else {
            this._mapNode.doScaleAnim(100);
        }
        this._btnMagnifier.updateUI(this._isCameraFar && FunctionConst.FUNC_GUILD_WAR_MAP_BIG || FunctionConst.FUNC_GUILD_WAR_MAP_SMALL);
    }
    _restoreMapScaleState() {
        this._btnMagnifier.setEnabled(true);
        this._mapNode.doScale(0);
    }
    _refreshCdTimeView() {
        var guildWarUser = G_UserData.getGuildWar().getMyWarUser(this._cityId);
        var challengeTime = guildWarUser.getChallenge_time();
        var challengeCd = guildWarUser.getChallenge_cd();
        var maxCd = GuildWarDataHelper.getGuildWarTotalAtkCD();
        var curTime = G_ServerTime.getTime();
        if (curTime <= challengeTime + challengeCd) {
            var second = challengeTime + challengeCd - curTime;
            this._textCdTitle.node.active = (true);
            this._textCdTime.node.active = (true);
            this._textCdTime.string = (Lang.get('guildwar_move_cd', { value: second }));
            if (challengeCd >= maxCd) {
                this._textCdTime.node.color = (Colors.BRIGHT_BG_RED);
            } else {
                this._textCdTime.node.color = (Colors.BRIGHT_BG_GREEN);
            }
            this._showAttackCdEffect = true;
        } else {
            this._textCdTitle.node.active = (true);
            this._textCdTime.node.active = (true);
            this._textCdTime.node.color = (Colors.BRIGHT_BG_GREEN);
            this._textCdTime.string = (Lang.get('guildwar_move_cd', { value: 0 }));
            if (this._showAttackCdEffect) {
                this._showAttackCdEffect = false;
                this._showCDFinishEffect(Lang.get('guildwar_attack_cd_finish_hint'));
            }
        }
        var moveTime = guildWarUser.getMove_time();
        var moveCD = GuildWarDataHelper.getGuildWarMoveCD();
        if (curTime <= moveTime + moveCD) {
            this._showMoveCdEffect = true;
        } else {
            if (this._showMoveCdEffect) {
                this._showMoveCdEffect = false;
                this._showCDFinishEffect(Lang.get('guildwar_move_cd_finish_hint'));
            }
        }
    }
    _showCDFinishEffect(content) {
        function effectFunction(effect) {
            if (effect == 'gongke_txt') {
                var fontColor = Colors.getSmallMineGuild();
                var params = {
                    text: content,
                    fontName: Path.getFontW8(),
                    fontSize: 40,
                    color: fontColor,
                };
                var label = UIHelper.createLabel(params);
                UIHelper.enableOutline(label.getComponent(cc.Label), new cc.Color(255, 120, 0), 2);
                return label;
            }
        }
        function eventFunction(event) {
            if (event == 'finish') {
                // this._img_bg.node.active = false;
            }
        }
        // this._img_bg.node.active = true;
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffectParent, 'moving_gongkexiaocheng', effectFunction.bind(this), eventFunction.bind(this), true);
    }
    _refreshChangeCityBtn() {
        var pointId = GuildWarDataHelper.getExitPoint(this._cityId);
        if (pointId) {
            // this._btnChangeCity.setTag(pointId);
            this._btnChangeCity.node.active = (true);
        } else {
            this._btnChangeCity.node.active = (false);
        }
    }

}