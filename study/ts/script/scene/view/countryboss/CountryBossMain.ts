import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { CountryBossConst } from "../../../const/CountryBossConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import { Colors, G_ConfigLoader, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonCountdown from "../../../ui/component/CommonCountdown";
import CommonHelpBig from "../../../ui/component/CommonHelpBig";
import CommonMiniChat from "../../../ui/component/CommonMiniChat";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import { unpack } from "../../../utils/GlobleFunc";
import { handler } from "../../../utils/handler";
import { table } from "../../../utils/table";
import UIActionHelper from "../../../utils/UIActionHelper";
import ViewBase from "../../ViewBase";
import CountryBossCityUnitNode from "./CountryBossCityUnitNode";
import { CountryBossHelper } from "./CountryBossHelper";
import CountryBossHeroUnitNode from "./CountryBossHeroUnitNode";
import CountryBossMeetingLayout from "./CountryBossMeetingLayout";
import StageWidget from "./StageWidget";
















const { ccclass, property } = cc._decorator;



@ccclass
export default class CountryBossMain extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _btnRule: CommonHelpBig = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _bossNodeParent: cc.Node = null;

    @property({
        type: CommonCountdown,
        visible: true
    })
    _commonCountDown: CommonCountdown = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _meetingPopParent: cc.Node = null;

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

    @property({ type: cc.Prefab, visible: true })
    countryBossHeroUnitNode: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    countryBossCityUnitNode: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    countryBossMeetingLayout: cc.Prefab = null;

    _awardNode: any;
    _countDownLabel: any;
    _countDownTime: any;
    _rankParentNode: any;
    _isFirstEnter: boolean;
    _curStage: any;
    _signalSyncBoss: any;
    _signalGetAuctionInfo: any;
    _signalRecvFlushData: any;
    _signalEnter: any;
    _signalForeground: any;
    _stageWidget: StageWidget;
    _bossLists: {};
    _meetingPop: any;
    _isStartPlayFirstRankSmall: boolean;
    _isStartPlayFirstRankBig: boolean;
    _showFirstRankTable: any[];
    _showFirstRankIndex: number;


    public static waitEnterMsg(callBack, param) {  
        if (param) {
            var [isNotNeedRequest] = unpack(param);
            if (isNotNeedRequest) {
                callBack();
                return;
            }
        }
        function onMsgCallBack() {
            callBack();
        }
        G_UserData.getCountryBoss().c2sEnterCountryBoss();
        G_UserData.getAuction().c2sGetAllAuctionInfo();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, onMsgCallBack);
        return signal;
    }
    ctor(isNotNeedRequest) {
        this._awardNode = null;
        this._countDownLabel = null;
        this._countDownTime = null;
        this._rankParentNode = null;
        this._isFirstEnter = true;
        this._curStage = null;
    }
    onCreate() {  
        this.setSceneSize();
        this._btnRule.updateUI(FunctionConst.FUNC_COUNTRY_BOSS);
        this._initBoss();
        this._initWidget();
        this._commonChat.setDanmuVisible(false);
    }

    start() {
        this._topbarBase.setImageTitle('txt_sys_com_sanguozhanji');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true);
        this._topbarBase.hideBG();
    }

    onEnter() {
        this._signalSyncBoss = G_SignalManager.add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS, handler(this, this._onEventSyncBoss));
        this._signalGetAuctionInfo = G_SignalManager.add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(this, this._onEventGetAuctionInfo));
        this._signalRecvFlushData = G_SignalManager.add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(this, this._onEventRecvFlushData));
        this._signalEnter = G_SignalManager.add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, handler(this, this._onEventEnter));
        this._signalForeground = G_SignalManager.add(SignalConst.EVENT_MAY_ENTER_FOREGROUND, handler(this, this._onEventForeground));
        this._refreshView();
        CountryBossHelper.popGoAuction();
    }
    onExit() {
        this._signalSyncBoss.remove();
        this._signalSyncBoss = null;
        this._signalGetAuctionInfo.remove();
        this._signalGetAuctionInfo = null;
        this._signalRecvFlushData.remove();
        this._signalRecvFlushData = null;
        this._signalEnter.remove();
        this._signalEnter = null;
        this._signalForeground.remove();
        this._signalForeground = null;
    }
    _initWidget() {
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
        this._stageWidget = StageWidget.newIns(this.node, handler(this, this._onStageChangeCallback))
    }
    _onEventSyncBoss() {
        this._refreshView();
    }
    _initBoss() {
        var GuildBossInfoConfig = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_BOSS_INFO);
        this._bossLists = {};
        for (var i = 0; i < GuildBossInfoConfig.length(); i++) {
            var cfg = GuildBossInfoConfig.indexOf(i);
            var unitNode;
            if (cfg.type == 2) {
                unitNode = cc.instantiate(this.countryBossHeroUnitNode).getComponent(CountryBossHeroUnitNode);
            } else {
                unitNode = cc.instantiate(this.countryBossCityUnitNode).getComponent(CountryBossCityUnitNode);
            }
            unitNode.ctor(cfg);
            unitNode.node.setPosition(cc.v2(cfg.x, cfg.y));
            this._bossNodeParent.addChild(unitNode.node);
            this._bossLists[cfg.id] = unitNode;
        }
    }
    _upadteStage() {
        var curStage = this._stageWidget.updateStage();
        if (curStage == CountryBossConst.STAGE1) {
            this._closeMeeting();
            var [_, endTime] = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE1);
            this._commonCountDown.startCountDown(Lang.get('country_boss_countdown_label1'), endTime);
            this._startShowSmallBossFirstRank();
        } else if (curStage == CountryBossConst.STAGE2) {
            this._stopPlayFirstRank();
            this._showMeeting();
            var [_, endTime] = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE2);
            this._commonCountDown.startCountDown(Lang.get('country_boss_countdown_label2'), endTime);
        } else if (curStage == CountryBossConst.STAGE3) {
            this._startShowBigBossFirstRank();
            this._closeMeeting();
            var [_, endTime] = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE3);
            this._commonCountDown.startCountDown(Lang.get('country_boss_countdown_label3'), endTime);
        } else {
            this._stopPlayFirstRank();
            if (CountryBossHelper.isShowTodayEndOrNextOpen()) {
                this._commonCountDown.setEndLabelString(Lang.get('country_boss_countdown_label6'));
            } else {
                this._commonCountDown.startCountDown(Lang.get('country_boss_countdown_label5'), CountryBossHelper.getNextOpenTime());
            }
            this._closeMeeting();
        }
    }
    _onEventForeground() {
        G_UserData.getCountryBoss().c2sEnterCountryBoss();
    }
    _onStageChangeCallback(curStage) {
        this._refreshView();
        if (curStage == CountryBossConst.STAGE1) {
            G_UserData.getCountryBoss().c2sEnterCountryBoss();
        } else if (curStage == CountryBossConst.STAGE2) {
            G_UserData.getCountryBoss().c2sEnterCountryBoss();
        } else if (curStage == CountryBossConst.STAGE3) {
            G_UserData.getCountryBoss().c2sEnterCountryBoss();
        } else if (curStage == CountryBossConst.NOTOPEN) {
            // var scheduler = require('scheduler');
            // scheduler.performWithDelayGlobal(function () {
            //     G_UserData.getAuction().c2sGetAllAuctionInfo();
            // } 1.2);

            this.schedule(() => {
                G_UserData.getAuction().c2sGetAllAuctionInfo();
            }, 1.2);
        }
    }
    _onEventEnter() {
        this._refreshView();
        CountryBossHelper.popGoFightBigBoss();
    }
    _refreshView() {
        this._upadteStage();
        for (var k in this._bossLists) {
            var v = this._bossLists[k];
            v.updateUI();
        }
    }
    _onEventGetAuctionInfo() {
        CountryBossHelper.popGoAuction();
    }
    _showMeeting() {
        if (this._meetingPop) {
            return;
        }
        if (!CountryBossHelper.anyoneBossUnlock()) {
            return;
        }
        this._meetingPop = cc.instantiate(this.countryBossMeetingLayout).getComponent(CountryBossMeetingLayout);
        this._meetingPopParent.addChild(this._meetingPop.node);
    }
    _closeMeeting() {
        if (this._meetingPop) {
            this._meetingPopParent.removeAllChildren();
            this._meetingPop = null;
        }
    }
    _onEventRecvFlushData() {
        G_UserData.getCountryBoss().c2sEnterCountryBoss();
    }
    _stopPlayFirstRank() {
        for (var k in this._bossLists) {
            var v = this._bossLists[k];
            v.stopPlayFirstRankName();
        }
        this.node.stopAllActions();
        this._isStartPlayFirstRankSmall = false;
        this._isStartPlayFirstRankBig = false;
    }
    _startShowSmallBossFirstRank() {
        if (this._isStartPlayFirstRankSmall) {
            return;
        }
        this.node.stopAllActions();
        this._showFirstRankTable = [];
        var initList = CountryBossHelper.getBossConfigListByType(1);
        for (var k in initList) {
            var v = initList[k];
            this._showFirstRankTable.push(v.id);
            table.insert(this._showFirstRankTable, v.id);
        }
        this._showFirstRankIndex = 1;
        this._isStartPlayFirstRankSmall = true;
        this._nextShowFirstRank();
    }
    _startShowBigBossFirstRank() {
        if (this._isStartPlayFirstRankBig) {
            return;
        }
        this.node.stopAllActions();
        this._showFirstRankTable = [];
        var initList = CountryBossHelper.getBossConfigListByType(2);
        for (var k in initList) {
            var v = initList[k];
            this._showFirstRankTable[v.group] = v.id;
        }
        this._isStartPlayFirstRankBig = true;
        this._showFirstRankIndex = 1;
        this._nextShowFirstRank();
    }
    _nextShowFirstRank(queue?) {
        var maxIndex = this._showFirstRankTable.length;
        var isFind = false;
        for (var i = this._showFirstRankIndex; i <= this._showFirstRankIndex + maxIndex - 1; i++) {
            var index = i;
            if (index > maxIndex) {
                index = index - maxIndex;
            }
            if (!CountryBossHelper.isBossDie(this._showFirstRankTable[index])) {
                this._showFirstRankIndex = index + 1;
                var node = this._bossLists[this._showFirstRankTable[index]];
                if (node) {
                    node.playFirstRankName();
                }
                isFind = true;
                break;
            }
        }
        if (!isFind) {
            this.node.stopAllActions();
            return;
        }
        var action = UIActionHelper.createDelayAction(4, function () {
            this._nextShowFirstRank(queue);
        }.bind(this));
        this.node.runAction(action);
    }
}