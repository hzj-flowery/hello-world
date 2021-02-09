const { ccclass, property } = cc._decorator;

// import CommonChatMiniNode from '../chat/CommonChatMiniNode'

import { FunctionConst } from '../../../const/FunctionConst';
import { GuildConst } from '../../../const/GuildConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { Colors, G_ConfigLoader, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonGuildFlag from '../../../ui/component/CommonGuildFlag';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { GuildDungeonDataHelper } from '../../../utils/data/GuildDungeonDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import ResourceLoader, { ResourceData } from '../../../utils/resource/ResourceLoader';
import ViewBase from '../../ViewBase';
import GuildCityNode from './GuildCityNode';
import GuildMainSceneBg from './GuildMainSceneBg';
import { GuildUIHelper } from './GuildUIHelper';
import PopupGuildContribution from './PopupGuildContribution';
import PopupGuildFlagSetting from './PopupGuildFlagSetting';
import PopupGuildHall from './PopupGuildHall';


@ccclass
export default class GuildMainView extends ViewBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollBG: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelFlagTouch: cc.Node = null;

    @property({
        type: CommonGuildFlag,
        visible: true
    })
    _commonGuildFlag: CommonGuildFlag = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuidLevel: cc.Label = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBarProgress: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textProgress: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuidName: cc.Label = null;

    @property({
        type: GuildMainSceneBg,
        visible: true
    })
    _backimg: GuildMainSceneBg = null;


    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    
    _cityNodes: any[];
    _touchFlag: any;
    _openBuildId: any;
    _scene: any;
    _signalRedPointUpdate: any;
    _signalGuildBaseInfoUpdate: any;
    _signalGuildKickNotice: any;
    _signalCommonZeroNotice: any;
    _signalDismissSuccess: any;
    _signalGuildDungeonMonsterGet: any;


    public static readonly ZORDER_CITY = 2000;
    public static readonly MAP_RES = [
        {
            path: 'ui3/stage/guild_sky.jpg',
            x: 0,
            y: 480,
            anchorPoint: cc.v2(0.5, 1),
            layer: 1
        },
        {
            path: 'ui3/stage/guild_farground.png',
            layer: 3
        },
        {
            path: 'juntuan_back',
            layer: 3
        },
        {
            path: 'ui3/stage/guild_mountain.png',
            x: -852,
            y: 40,
            anchorPoint: cc.v2(0, 0.5),
            layer: 5
        },
        {
            path: 'juntuan_back2',
            layer: 7
        },
        {
            path: 'ui3/stage/guild_midground.png',
            layer: 7,
            main: true
        },
        {
            path: 'juntuan_middle',
            layer: 7
        },
        {
            path: 'juntuan_front',
            layer: 9
        }
    ];
    public static readonly MAP_LAYER_DATA = {
        [1]: { differ: 300 },
        [3]: { differ: 200 },
        [5]: { differ: 100 },
        [7]: { differ: 0 },
        [9]: { differ: 0 }
    };
    public static readonly MAP_LAYER_CITY = 8;
    private static build_id;

    public static waitEnterMsg(callBack,param) {
        function onMsgCallBack() {
            var data: Array<ResourceData> = [
                {path: "prefab/guild/PopupGuildHall", type: cc.Prefab},
                {path: "prefab/guild/PopupGuildFlagSetting", type: cc.Prefab},
                {path: "prefab/guild/PopupGuildContribution", type: cc.Prefab},
                {path: "prefab/guild/GuildCityNode", type: cc.Prefab},
                {path: "prefab/guild/PopupGuildFlagSetting", type: cc.Prefab},
                {path: "prefab/guild/GuildFlagColorItemCell", type: cc.Prefab},
                {path: "prefab/guild/GuildContributionItemCell", type: cc.Prefab},
                {path: "prefab/guild/GuildRequestHelpCell", type: cc.Prefab},
                {path: "prefab/common/PopupChooseHero", type: cc.Prefab},
                {path: "prefab/guild/GuildRequestHelpNode", type: cc.Prefab},
                {path: "prefab/guildHelp/GuildHelpList", type: cc.Prefab},
                {path: "prefab/guildHelp/GuildHelpListCell", type: cc.Prefab},
                {path: "prefab/common/CommonHeroAvatar", type: cc.Prefab},
                {path: "ui3/stage/guild_sky", type: cc.SpriteFrame},
                {path: "ui3/stage/guild_farground", type: cc.SpriteFrame},
                {path: "ui3/stage/guild_mountain", type: cc.SpriteFrame},
                {path: "ui3/stage/guild_midground", type: cc.SpriteFrame},
            ];

            ResourceLoader.loadResArrayWithType(data, (err, data) => {
                callBack();
            });
        }
        GuildMainView.build_id = param[0];
        var msgReg = G_SignalManager.addOnce(SignalConst.EVENT_GUILD_QUERY_MALL, onMsgCallBack);
        G_UserData.getGuild().c2sQueryGuildMall();
        return msgReg;
    }
    initData(buildId?) {
        this._cityNodes = [];
        this._touchFlag = null;
        this._openBuildId = buildId;
        this._panelFlagTouch = null;
        this._scene = null;
    }

    onCreate() {
        this.initData(GuildMainView.build_id);
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_GUILD);
        this._createMapView();
    }

    onEnter() {
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalGuildBaseInfoUpdate = G_SignalManager.add(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE, handler(this, this._onEventGuildBaseInfoUpdate));
        this._signalGuildKickNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_KICK_NOTICE, handler(this, this._onEventGuildKickNotice));
        this._signalCommonZeroNotice = G_SignalManager.add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(this, this._onEventCommonZeroNotice));
        this._signalDismissSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_DISMISS_SUCCESS, handler(this, this._dismissSuccess));
        this._signalGuildDungeonMonsterGet = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(this, this._onEventGuildDungeonMonsterGet));
        if (!G_UserData.getGuild().isInGuild()) {
            G_SceneManager.popScene();
            return;
        }
        this._updateInfo();
        this._refreshCityView();
        this._refreshCityRedPoint();
        if (this._openBuildId) {
            this.openBuild(this._openBuildId);
            this._openBuildId = null;
        }
        G_UserData.getGuild().c2sGetGuildBase();
        if (G_UserData.getGuild().isExpired() == true) {
            G_UserData.getGuild().pullData();
        }
    }
    onExit() {
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalGuildBaseInfoUpdate.remove();
        this._signalGuildBaseInfoUpdate = null;
        this._signalGuildKickNotice.remove();
        this._signalGuildKickNotice = null;
        this._signalCommonZeroNotice.remove();
        this._signalCommonZeroNotice = null;
        this._signalDismissSuccess.remove();
        this._signalDismissSuccess = null;
        this._signalGuildDungeonMonsterGet.remove();
        this._signalGuildDungeonMonsterGet = null;
    }
    _onEventCommonZeroNotice(event, hour) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        G_UserData.getGuild().pullData();
    }
    _onEventGuildDungeonMonsterGet(event) {
        if (!GuildDungeonDataHelper.hasGuildDungeonMonsterData()) {
            var stageOpenNum = UserDataHelper.getParameter(ParameterIDConst.GUILD_STAGE_OPENNUM);
            G_Prompt.showTip(Lang.get('guilddungeon_not_open_as_member_num', { value: stageOpenNum }));
        } else {
            G_SceneManager.showScene('guildDungeon');
        }
    }
    _updateInfo() {
        var myGuild = G_UserData.getGuild().getMyGuild();
        // assert(myGuild, 'G_UserData:getGuild():getMyGuild() = nil');
        var name = myGuild.getName();
        var level = G_UserData.getGuild().getMyGuildLevel();
        var exp = G_UserData.getGuild().getMyGuildExp();
        var needExp = UserDataHelper.getGuildLevelUpNeedExp(level);
        var names = UserDataHelper.getGuildLeaderNames();
        this._textGuidName.string = (name);
        this._textGuidLevel.string = (Lang.get('guild_maincity_level', { level: level }));
        this._loadingBarProgress.progress = (exp / needExp);
        this._textProgress.string = (exp + ('/' + needExp));
        this._topbarBase.setTitle(name, 40, Colors.DARK_BG_THREE, Colors.DARK_BG_OUTLINE);
        this._updateFlagColor();
    }
    _updateFlagColor() {
        var myGuild = G_UserData.getGuild().getMyGuild();
        // assert(myGuild, 'G_UserData:getGuild():getMyGuild() = nil');
        var name = myGuild.getName();
        var icon = myGuild.getIcon();
        this._commonGuildFlag.updateUI(icon, name);
    }
    openBuild(buildId) {
        if (!LogicCheckHelper.checkGuildModuleIsOpen(buildId)) {
            return;
        }
        if (buildId == GuildConst.CITY_HALL_ID) {
            this.onButtonHallClicked();
        } else if (buildId == GuildConst.CITY_HELP_ID) {
            this.onButtonHelpClicked();
        } else if (buildId == GuildConst.CITY_SHOP_ID) {
            this.onButtonShopClicked();
        } else if (buildId == GuildConst.CITY_BOSS_ID) {
            this.onButtonBossClicked();
        } else if (buildId == GuildConst.CITY_CONTRIBUTION_ID) {
            this.onButtonContribution();
        } else if (buildId == GuildConst.CITY_DUNGEON_ID) {
            this.onButtonDungeon();
        } else if (buildId == GuildConst.CITY_GUILD_WAR_ID) {
            this.onButtonGuildWar();
        } else {
            G_Prompt.showTip(Lang.get('common_tip_function_not_open'));
        }
    }
    onButtonHallClicked() {
        var resource = cc.resources.get("prefab/guild/PopupGuildHall");
        var node1 = cc.instantiate(resource) as cc.Node;
        let cell = node1.getComponent(PopupGuildHall);
        cell.setAllowHide(false);
        cell.openWithAction();
    }
    onButtonHelpClicked() {
        G_SceneManager.showScene('guildHelp', true);
    }
    onButtonShopClicked() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_GUILD_SHOP);
    }
    onButtonBossClicked() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_WORLD_BOSS);
    }
    onButtonContribution(sender?) {
        var resource = cc.resources.get("prefab/guild/PopupGuildContribution");
        var node1 = cc.instantiate(resource) as cc.Node;
        let cell = node1.getComponent(PopupGuildContribution);
        cell.openWithAction();
    }
    onButtonDungeon(sender?) {
        G_UserData.getGuildDungeon().c2sGetGuildDungeon();
    }
    onButtonGuildWar(sender?) {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_GUILD_WAR);
    }
    onClickGuildFlag(sender?) {
        var userMemberData = G_UserData.getGuild().getMyMemberData();
        var myPosition = userMemberData.getPosition();
        var showFlag = UserDataHelper.isHaveJurisdiction(myPosition, GuildConst.GUILD_JURISDICTION_14);
        if (!showFlag) {
            return;
        }

        var resource = cc.resources.get("prefab/guild/PopupGuildFlagSetting");
        var node1 = cc.instantiate(resource) as cc.Node;
        let cell = node1.getComponent(PopupGuildFlagSetting);
        cell.openWithAction();

    }
    _refreshCityRedPoint() {
        for (var k in this._cityNodes) {
            var v = this._cityNodes[k];
            var hasRedPoint = false;
            var cityData = v.getCityData();
            if (cityData.id == GuildConst.CITY_HALL_ID) {
                hasRedPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'hallRP');
            } else if (cityData.id == GuildConst.CITY_HELP_ID) {
                hasRedPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'helpRP');
            } else if (cityData.id == GuildConst.CITY_CONTRIBUTION_ID) {
                hasRedPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'contributionRP');
            } else if (cityData.id == GuildConst.CITY_DUNGEON_ID) {
                hasRedPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP, 'dungeonRP');
            }
            v.refreshRedPoint(hasRedPoint);
        }
    }
    _refreshCityView() {
        for (var k in this._cityNodes) {
            var v = this._cityNodes[k];
            v.refreshCityView();
        }
    }
    _onEventGuildBaseInfoUpdate(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._updateInfo();
        this._refreshCityView();
    }
    _onEventRedPointUpdate(event, funcId, param) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        if (!funcId || funcId == FunctionConst.FUNC_ARMY_GROUP) {
            this._refreshCityRedPoint();
        }
    }
    _onEventGuildKickNotice(event, uid) {
        if (uid == G_UserData.getBase().getId()) {
            GuildUIHelper.noticeBeKickGuild();
        }
    }
    _createMapView() {
        var innerContainer = this._scrollBG.content;

        // this._backimg.setSceneSize(cc.size(1704, 960));
        this._backimg.updateSceneByRes(GuildMainView.MAP_RES, GuildMainView.MAP_LAYER_DATA);
        this._scene = this._backimg;
        // this._scrollBG.node.x = -cc.winSize.width * 0.5;
        // this._scrollBG.node.y = cc.winSize.height * -0.5;

        var cityRootNode = new cc.Node();
        var ccPoint = cc.v2(-1704 * 0.5, -960 * 0.5);
        cityRootNode.setPosition(ccPoint);
        this._scene.getEffectLayer(GuildMainView.MAP_LAYER_CITY).addChild(cityRootNode);
        var GuildBuildPostion = G_ConfigLoader.getConfig('guild_build_postion');
        for (var i = 0; i < GuildBuildPostion.length(); i += 1) {
            var config = GuildBuildPostion.indexOf(i);

            var resource = cc.resources.get("prefab/guild/GuildCityNode");
            var node1 = cc.instantiate(resource) as cc.Node;
            var icon = node1.getComponent(GuildCityNode);
            icon.initData(config, handler(this, this._onCityClick));
            cityRootNode.addChild(icon.node, Math.ceil(GuildMainView.ZORDER_CITY - config.postion_y));
            this._cityNodes.push(icon);
        }
        // this._scrollBG.content.width = 1740;
        // this._moveToMapPos(829, 504);
    }

    _moveToMapPos(x, y) {
        var scrollX = -(x - Math.min(1136, cc.winSize.width) * 0.5);
        var scrollY = -(y - Math.min(640, cc.winSize.height) * 0.5);
        var innerContainer = this._scrollBG.content;
        innerContainer.setPosition(scrollX, scrollY);
        this._scene.onMoveEvent(scrollX);
    }
    _moveLayerTouch() {
        var innerContainer = this._scrollBG.content;
        var posX = innerContainer.x;
        this._scene.onMoveEvent(posX);
    }
    _onCityClick(sender, cityData) {
        // if (this._touchFlag) {
        //     return;
        // }
        // this._touchFlag = true;
        this.openBuild(cityData.id);
    }
    _onScrollViewTouchCallBack(sender, state) {
        // // logWarn(state + '..._onScrollViewTouchCallBack');
        // if (state == cc.TouchEventType.ended || state == ccui.TouchEventType.canceled) {
        //     this._touchFlag = false;
        // }
    }
    _dismissSuccess() {
        G_Prompt.showTip(Lang.get('guild_tip_dismiss_success'));
        G_SceneManager.backToMain();
    }

}