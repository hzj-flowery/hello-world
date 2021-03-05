const { ccclass, property } = cc._decorator;

// import CommonChatMiniNode from '../chat/CommonChatMiniNode'

import { AuctionConst } from '../../../const/AuctionConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TimeConst } from '../../../const/TimeConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_ConfigLoader, G_ResolutionManager, G_SceneManager, G_ServerTime, G_ServiceManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { GuildDungeonDataHelper } from '../../../utils/data/GuildDungeonDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import ResourceLoader, { ResourceData } from '../../../utils/resource/ResourceLoader';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import { GuildUIHelper } from '../guild/GuildUIHelper';
import { WorldBossHelper } from '../worldBoss/WorldBossHelper';
import GuildDungeonMonsterNode from './GuildDungeonMonsterNode';
import GuildDungeonRankLayer from './GuildDungeonRankLayer';
import PopupGuildDungeonRecord from './PopupGuildDungeonRecord';



@ccclass
export default class GuildDungeonView extends ViewBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollBG: cc.ScrollView = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeReward: cc.Node = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _commonHelp: CommonHelpBig = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _commonMenu: CommonMainMenu = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRemainCount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _commonListViewItem: CommonListViewLineItem = null;

    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;


    public static readonly Z_ORDER_SEA = 1;
    public static readonly Z_ORDER_SKY = 2;
    public static readonly Z_ORDER_DOCK = 3;
    public static readonly Z_ORDER_BOAT = 10;
    public static readonly Z_ORDER_PRE_SCENE = 100;
    public static readonly DST_SCALE = 1;
    public static readonly SKY_AND_DOCK_HEIGHR_SCALE = 1.133121;
    public static readonly SCALE_VALUE_PER_PIXEL = 0.1 / 250;
    public static readonly X_POS_SCALE_VALUE_PER_PIXEL = 0.1 / 250;
    public static readonly Y_POS_SCALE_VALUE_PER_PIXEL = 0.1 / 300;
    public static readonly DISTANCE_BOAT_TO_SKY = 400;
    public static readonly DISTANCE_SKY_AND_DOCK_HEIGHR = 438 * GuildDungeonView.SKY_AND_DOCK_HEIGHR_SCALE;
    public static readonly FIRST_ENTER_BOTTOM_BOAT_TO_SCREEN_DISTANCE = 200;
    public static readonly IMG_SEA_HEIGHT = 1280;
    public static readonly MAP_WIDTH = 1800;
    public static readonly MAP_MIN_HEIGHT = 840;

    _isCreate: any;
    _refreshHandler: void;
    _cityNodes: any[];
    _scrollHeight: number;
    _signalCommonZeroNotice;
    _signalGetAuctionInfo;
    _signalGuildDungeonRecordSyn;
    _signalGuildDungeonMonsterGet;
    _signalGuildGetUserGuild;
    _signalGuildKickNotice;
    _maxY: number;
    _nodeSea: cc.Node;
    _guildDungeonRankNode: GuildDungeonRankLayer;

    public static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            var data: Array<ResourceData> = [
                { path: "prefab/guildDungeon/GuildDungeonRankLayer", type: cc.Prefab },
                { path: "prefab/guildDungeon/GuildDungeonMemberNode", type: cc.Prefab },
                { path: "prefab/guildDungeon/GuildDungeonEnemyNode", type: cc.Prefab },
                { path: "prefab/guildDungeon/GuildDungeonPlaybackNode", type: cc.Prefab },
                { path: "prefab/guildDungeon/GuildDungeonPlaybackItemNode", type: cc.Prefab },
                { path: "prefab/guildDungeon/GuildDungeonMonsterNode", type: cc.Prefab },
                { path: "prefab/guildDungeon/GuildDungeonRankItem", type: cc.Prefab },
                { path: "prefab/guildDungeon/PopupGuildDungeonMonsterDetail", type: cc.Prefab },
                { path: "prefab/guildDungeon/GuildDungeonEnemyItemNode", type: cc.Prefab },
                { path: "prefab/guildDungeon/GuildDungeonMemberItemNode", type: cc.Prefab },
                { path: "prefab/team/PopupEmbattle", type: cc.Prefab },
            ];

            ResourceLoader.loadResArrayWithType(data, (err, data) => {
                callBack();
            });
        }
        var msgReg = G_SignalManager.addOnce(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, onMsgCallBack);
        G_UserData.getGuildDungeon().c2sGetGuildDungeonRecord();
        return msgReg;
    }

    onCreate() {
        this._cityNodes = [];
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_GUILD);
        this._topbarBase.setImageTitle('txt_sys_com_juntuanfuben');
        // cc.bind(this._commonChat, 'CommonMiniChat');
        this._commonMenu.updateUI(FunctionConst.FUNC_GUILD_DUNGEON_RECORD);
        this._commonMenu.addClickEventListenerEx(handler(this, this._onClickRecord));
        this._commonHelp.updateLangName('HELP_GUILD_DUNGEON');
        // this._scrollBG.setScrollBarEnabled(false);
        // this._scrollBG.addEventListener(handler(this, this._scrollEventCallback));
        this._commonChat.getPanelDanmu().active = false;

        let res = cc.resources.get("prefab/guildDungeon/GuildDungeonRankLayer");
        let node1 = cc.instantiate(res) as cc.Node;
        this._guildDungeonRankNode = node1.getComponent(GuildDungeonRankLayer) as GuildDungeonRankLayer;
        this.node.addChild(this._guildDungeonRankNode.node);
    }
    onEnter() {
        this._signalCommonZeroNotice = G_SignalManager.add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(this, this._onEventCommonZeroNotice));
        this._signalGetAuctionInfo = G_SignalManager.add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(this, this._onEventGetAuctionInfo));
        this._signalGuildDungeonRecordSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, handler(this, this._onEventGuildDungeonRecordSyn));
        this._signalGuildDungeonMonsterGet = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(this, this._onEventGuildDungeonMonsterGet));
        this._signalGuildGetUserGuild = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_USER_GUILD, handler(this, this._onEventGuildGetUserGuild));
        this._signalGuildKickNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_KICK_NOTICE, handler(this, this._onEventGuildKickNotice));
        G_UserData.getGuildDungeon().setSynRecordData(true);
        if (!G_UserData.getGuild().isInGuild()) {
            G_SceneManager.popScene();
            return;
        }
        if (G_UserData.getGuildDungeon().isExpired() == true) {
            G_UserData.getGuildDungeon().pullData();
        }
        this._updateView();
        this._updateMapView(null);
        var endTimeToday = GuildDungeonDataHelper.isGuildDungenoInAttackTime()[2] as number;
        var endTime = endTimeToday + G_ServerTime.secondsFromZero(null, null);
        if (endTime > G_ServerTime.getTime()) {
            G_ServiceManager.registerOneAlarmClock('GuildDungeonView_Aution', endTime, function () {
                G_UserData.getGuildDungeon().c2sGetGuildDungeonRecord();
                G_UserData.getAuction().c2sGetAllAuctionInfo();
            });
        }
        this._checkShowDlg();
        this._startTimer();
        G_UserData.getAuction().c2sGetAllAuctionInfo();
        if (this._isCreate) {
            this._isCreate = false;
        } else {
            G_UserData.getGuildDungeon().c2sGetGuildDungeonRecord();
        }
    }
    onExit() {
        this._signalCommonZeroNotice.remove();
        this._signalCommonZeroNotice = null;
        this._signalGetAuctionInfo.remove();
        this._signalGetAuctionInfo = null;
        this._signalGuildDungeonRecordSyn.remove();
        this._signalGuildDungeonRecordSyn = null;
        this._signalGuildDungeonMonsterGet.remove();
        this._signalGuildDungeonMonsterGet = null;
        this._signalGuildGetUserGuild.remove();
        this._signalGuildGetUserGuild = null;
        this._signalGuildKickNotice.remove();
        this._signalGuildKickNotice = null;
        G_UserData.getGuildDungeon().setSynRecordData(false);
        G_ServiceManager.DeleteOneAlarmClock('GuildDungeonView_Aution');
        this._endTimer();
    }
    _onEventGuildKickNotice(event, uid) {
        if (uid == G_UserData.getBase().getId()) {
            GuildUIHelper.noticeBeKickGuild();
        }
    }
    _onEventCommonZeroNotice(eventName, hour) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        G_UserData.getGuildDungeon().pullData();
    }
    _onEventGetAuctionInfo(id, message) {
        this._checkShowDlg();
    }
    _onEventGuildDungeonRecordSyn(event) {
        this._updateView();
        this._updateMapView();
        this._checkShowDlg();
    }
    _onEventGuildDungeonMonsterGet(event) {
        this._updateView();
        this._updateMapView(true);
    }
    _onEventGuildGetUserGuild(event) {
        this._refreshRemainCount();
    }

    updateRewardInfo(rewards?) {
        let reward = rewards || WorldBossHelper.getPreviewRewards();
        this._commonListViewItem.updateUI(reward);
        this._commonListViewItem.setMaxItemSize(5)
        this._commonListViewItem.setListViewSize(410, 100)
        this._commonListViewItem.setItemsMargin(2);
    }

    _startTimer() {
        this.schedule(this._onRefreshTick, 1);
    }
    _endTimer() {
        this.unschedule(this._onRefreshTick);
        this.unschedule(this.addCityNode);
    }
    _onRefreshTick(dt) {
        this._refreshRemainCount();
    }
    _onClickRecord() {
        G_SceneManager.openPopup("prefab/guildDungeon/PopupGuildDungeonRecord", (popup: PopupGuildDungeonRecord) => {
            popup.openWithAction();
        });
    }
    _refreshRemainCount() {
        var res = GuildDungeonDataHelper.isGuildDungenoInAttackTime();
        var inAttackTime = res[0];
        var startTime = res[1] as number;
        var endTime = res[2] as number;
        if (!inAttackTime) {
            var time = G_ServerTime.secondsFromZero(null, null) + startTime;
            if (time < G_ServerTime.getTime()) {
                time = time + TimeConst.SECONDS_ONE_DAY-14*60*60;
            }
            var txt = G_ServerTime.getLeftSecondsString(time, '00:00:00');
            this._textTimeTitle.string = (Lang.get('guilddungeon_open_downtime'));
            this._textTime.string = (txt);
        } else {
            var txt = G_ServerTime.getLeftSecondsString(G_ServerTime.secondsFromZero(null, null) + endTime, '00:00:00');
            this._textTimeTitle.string = (Lang.get('guilddungeon_close_downtime'));
            this._textTime.string = (txt);
        }
        this._textRemainCount.node.active = (true);
        this._textCountTitle.node.active = (true);
        var count = GuildDungeonDataHelper.getGuildDungenoFightCount();
        this._textRemainCount.string = (count + "");
    }
    _createMapView() {
        var innerContainer = this._scrollBG.content;
        var oldContainerPosY = innerContainer.y;
        innerContainer.removeAllChildren();
        this._cityNodes = [];
        var GuildStageAtkReward = G_ConfigLoader.getConfig('guild_stage_atk_reward');
        var maxY = 0;
        var minY = 0;
        var monsterList = UserDataHelper.getGuildDungeonMonsterList();
        for (var k in monsterList) {
            var v = monsterList[k];
            var config = GuildStageAtkReward.get(v.rank);
            // assert(config, 'guild_stage_atk_reward cannot find id ' + tostring(v.rank));

            // let res = cc.resources.get("prefab/guildDungeon/GuildDungeonMonsterNode");
            // let node1 = cc.instantiate(res) as cc.Node;
            // var icon = node1.getComponent(GuildDungeonMonsterNode) as GuildDungeonMonsterNode;
            // innerContainer.addChild(icon.node, GuildDungeonView.Z_ORDER_BOAT);
            // icon.updateUI(v);
            // this._cityNodes.push(icon);
            maxY = Math.max(maxY, config.y_position);
            minY = (minY == 0) ? config.y_position : Math.min(minY, config.y_position);
        }
        var nodeSea = new cc.Node();
        nodeSea.x = GuildDungeonView.MAP_WIDTH / 2;
        nodeSea.y = 0;
        this._maxY = maxY;
        var scrollHeight = maxY - minY + GuildDungeonView.FIRST_ENTER_BOTTOM_BOAT_TO_SCREEN_DISTANCE + GuildDungeonView.DISTANCE_BOAT_TO_SKY;
        // logWarn(' ----------------  ' + maxY);
        scrollHeight = Math.max(scrollHeight, Math.max(GuildDungeonView.MAP_MIN_HEIGHT, G_ResolutionManager.getDesignHeight()));
        // logWarn(' ----------------  ' + scrollHeight);
        this._scrollHeight = scrollHeight;

        this.recordIndex = monsterList.length - 1;
        this.count = 0;
        this.schedule(this.addCityNode, 0.1);

        var seaY = scrollHeight - GuildDungeonView.DISTANCE_SKY_AND_DOCK_HEIGHR;
        var seaImageNum = Math.ceil(seaY / GuildDungeonView.IMG_SEA_HEIGHT);
        for (var i = 1; i <= seaImageNum; i += 1) {
            var imageParam = {
                texture: Path.getGuildDungeonJPG('sea'),
                adaptWithSize: true
            };
            var newMap = UIHelper.createImage(imageParam);
            newMap.x = 0;
            newMap.y = (i - 0.5) * GuildDungeonView.IMG_SEA_HEIGHT;
            newMap.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.RAW;
            nodeSea.addChild(newMap, GuildDungeonView.Z_ORDER_SEA);
        }

        var imageParam = {
            texture: Path.getGuildDungeonJPG('sea_bg_2'),
            adaptWithSize: true
        };
        var newMap = UIHelper.createImage(imageParam);
        newMap.x = 0;
        newMap.y = scrollHeight - 355 / 2;
        newMap.setScale(GuildDungeonView.SKY_AND_DOCK_HEIGHR_SCALE);
        nodeSea.addChild(newMap, GuildDungeonView.Z_ORDER_SKY);

        var imageParam = {
            texture: Path.getGuildDungeonJPG('sea_bg'),
            adaptWithSize: true
        };
        var newMap = UIHelper.createImage(imageParam);
        newMap.x = 0;
        newMap.y = scrollHeight - 400 / 2;
        newMap.setScale(GuildDungeonView.SKY_AND_DOCK_HEIGHR_SCALE);
        nodeSea.addChild(newMap, GuildDungeonView.Z_ORDER_DOCK);
        innerContainer.addChild(nodeSea, GuildDungeonView.Z_ORDER_SEA);
        this._nodeSea = nodeSea;

        var imageParam = {
            texture: Path.getGuildDungeonJPG('sea_pre'),
            adaptWithSize: true
        };
        var newMap = UIHelper.createImage(imageParam);
        newMap.x = GuildDungeonView.MAP_WIDTH / 2;
        newMap.y = 312 / 2;
        innerContainer.addChild(newMap, GuildDungeonView.Z_ORDER_PRE_SCENE);
        var size = cc.size(GuildDungeonView.MAP_WIDTH, scrollHeight * GuildDungeonView.DST_SCALE);
        this._scrollBG.content.setContentSize(size);
        var currContainerPosY = 0;
        if (oldContainerPosY != 0) {
            var maxScrollDis = size.height - G_ResolutionManager.getDesignHeight();
            currContainerPosY = Math.max(oldContainerPosY, -maxScrollDis);
            currContainerPosY = Math.min(currContainerPosY, 0);
        } else {
        }
        this._scrollBG.content.y = (currContainerPosY);
        // this._updatePerspective();
    }

    private recordIndex = 0;
    private count = 0;
    private addCityNode() {
        this.count = 0;
        var innerContainer = this._scrollBG.content;
        var monsterList = UserDataHelper.getGuildDungeonMonsterList();
        var GuildStageAtkReward = G_ConfigLoader.getConfig('guild_stage_atk_reward');
        for (var k = this.recordIndex; k >= 0; k--) {
            var v = monsterList[monsterList.length - 1 - k];
            var config = GuildStageAtkReward.get(v.rank);
            // assert(config, 'guild_stage_atk_reward cannot find id ' + tostring(v.rank));

            let res = cc.resources.get("prefab/guildDungeon/GuildDungeonMonsterNode");
            let node1 = cc.instantiate(res) as cc.Node;
            var icon = node1.getComponent(GuildDungeonMonsterNode) as GuildDungeonMonsterNode;
            innerContainer.addChild(icon.node, GuildDungeonView.Z_ORDER_BOAT);
            icon.updateUI(v);
            this._cityNodes.push(icon);

            var config = icon.getConfig();
            icon.node.x = config.x_position;
            icon.node.y = (this._scrollHeight - GuildDungeonView.DISTANCE_BOAT_TO_SKY + config.y_position - this._maxY);
            // icon1.node.setPosition(config.x_position, );

            this.count++;
            this.recordIndex--;
            if (this.count > 1) {
                break;
            }
        }

        if (this.recordIndex < 0) {
            this.unschedule(this.addCityNode);
        }
    }


    _refreshMapView() {
        for (var k in this._cityNodes) {
            var v = this._cityNodes[k];
            v.refreshUI();
        }
    }
    scrollEventCallback(sender, eventType) {
        if (eventType == 12) {
            // this._updatePerspective();
        }
    }
    _updatePerspective() {
        var innerSize = this._scrollBG.content.getContentSize();
        var currScrollDis = -this._scrollBG.content.y;
        var maxScrollDis = innerSize.height - G_ResolutionManager.getDesignHeight();
        var mapScale = 1 + (GuildDungeonView.DST_SCALE - 1) * currScrollDis / maxScrollDis;
        this._nodeSea.setScale(mapScale);
        for (var k in this._cityNodes) {
            var v = this._cityNodes[k];
            var config = v.getConfig();
            var posY = v.y;
            var distance = (this._scrollHeight - GuildDungeonView.DISTANCE_BOAT_TO_SKY + config.y_position - this._maxY) * mapScale;
            if (distance - currScrollDis < 1200 && distance - currScrollDis > -170) {
                var scaleValue = 1 - (distance - currScrollDis) * GuildDungeonView.SCALE_VALUE_PER_PIXEL;
                var xPosScaleValue = 1 - (distance - currScrollDis) * GuildDungeonView.X_POS_SCALE_VALUE_PER_PIXEL;
                var yPosScaleValue = 1 - (distance - currScrollDis) * GuildDungeonView.Y_POS_SCALE_VALUE_PER_PIXEL;
                var newW = xPosScaleValue * GuildDungeonView.MAP_WIDTH;
                var x = config.x_position / GuildDungeonView.MAP_WIDTH * newW + (GuildDungeonView.MAP_WIDTH - newW) / 2;
                var y = currScrollDis + (distance - currScrollDis) * yPosScaleValue;
                if (y - currScrollDis < 820 && y - currScrollDis > -170) {
                    v.node.setScale(scaleValue);
                    var a :cc.Node;
                    v.node.x = (x);
                    v.node.y = (y);
                    v.node.active = (true);
                } else {
                    // logWarn('___' + tostring(distance));
                    v.node.active = (false);
                }
            } else {
                v.node.active = (false);
            }
        }
        // logWarn('GuildDungeonView ' + (currScrollDis + ('  ' + (maxScrollDis + ('  ' + mapScale)))));
    }
    _checkShowDlg() {
        // logWarn('GuildDungeonView:_showGuildDlg show !!!!!!!!!!! start');
        var isAuctionWorldEnd = G_UserData.getAuction().isAuctionShow(AuctionConst.AC_TYPE_GUILD_DUNGEON_ID);
        if (isAuctionWorldEnd == false) {
            // logWarn('GuildDungeonView:_showGuildDlg  isAuctionShow = false ');
            return;
        }
        if (GuildDungeonDataHelper.guildDungeonNeedShopAutionDlg() == true) {
            var isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                this._showGuildDlg();
            }
        } else {
            // logWarn('GuildDungeonView:_showGuildDlg guildDungeonNeedShopAutionDlg false');
        }
    }
    _showGuildDlg() {
        var rankData = G_UserData.getGuildDungeon().getMyGuildRankData();
        var atkCount = rankData.getNum();
        var guildRank = rankData.getRank();
        var point = rankData.getPoint();
        if (atkCount == null || atkCount <= 0) {
            // logWarn('GuildDungeonView:_showGuildDlg atkCount is nil');
            return;
        }
        var guildPrestige = GuildDungeonDataHelper.getGuildDungenoGetPrestige();
        var personDlg = Lang.get('guilddungeon_reward_finish_show2', {
            point: point,
            guildRank: guildRank,
            guildExp: guildPrestige
        });
        function onBtnGo() {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION);
        }

        G_SceneManager.openPopup("prefab/common/PopupSystemAlert", (popup: PopupSystemAlert) => {
            popup.setup(Lang.get('worldboss_popup_title1'), personDlg, onBtnGo);
            popup.setCheckBoxVisible(false);
            popup.showGoButton(Lang.get('worldboss_go_btn2'));
            popup.setCloseVisible(true);
            popup.openWithAction();
        });
    }
    _updateView() {
        this.updateRewardInfo(GuildDungeonDataHelper.getGuildDungeonPreviewRewards());
        this._refreshRemainCount();
    }
    _updateMapView(isCreate?) {
        if (isCreate || this._cityNodes.length <= 0) {
            this._createMapView();
        } else {
            this._refreshMapView();
        }
    }

}