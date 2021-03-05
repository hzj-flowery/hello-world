import ViewBase from "../../ViewBase";
import { GuildWarConst } from "../../../const/GuildWarConst";
import { GuildWarDataHelper } from "../../../utils/data/GuildWarDataHelper";
import { handler } from "../../../utils/handler";
import { SignalConst } from "../../../const/SignalConst";
import { G_SignalManager, G_ServiceManager, G_UserData, G_SceneManager, G_ResolutionManager, G_ServerTime, G_EffectGfxMgr } from "../../../init";
import UIActionHelper from "../../../utils/UIActionHelper";
import { Util } from "../../../utils/Util";
import GuildWarMoveSignNode from "./GuildWarMoveSignNode";
import GuildWarPointWheelNode from "./GuildWarPointWheelNode";
import GuildWarRunAvatorNode from "./GuildWarRunAvatorNode";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import GuildWarPointNode from "./GuildWarPointNode";
import { GuildWarCheck } from "../../../utils/logic/GuildWarCheck";
import GuildWarBuildingNode from "./GuildWarBuildingNode";
import GuildWarBuildingHpNode from "./GuildWarBuildingHpNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarBattleMapNode extends ViewBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _bgParentNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _pointAndAvatarParentNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _hpParentNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _pointParentNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _moveSignParentNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _wheelParentNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _exitParentNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _tipsParentNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _campEffectParentNode: cc.Node = null;

    public static readonly MAX_WHEEL_NODE_NUM = 6;
    public static readonly GRID_WIDTH = 60;
    public static readonly GRID_HEIGHT = 60;
    public static readonly MAX_SCALE = 1;
    public static readonly MIN_SCALE = 0.75;
    public static readonly CAMERA_SPEED = 2200;

    public static readonly WAR_BG_1 = new cc.Size(900, 975);
    public static readonly WAR_BG_2 = new cc.Size(1170, 1200);
    public static readonly WAR_BG_3 = new cc.Size(1386, 877);

    _cityId: any;
    _pointNodeList: any[];
    _hpPointNodeList: any[];
    _moveSignNodeList: any[];
    _hpNodeList: any[];
    _campEffectNodeList: any[];
    _avatarNodeMap: any[];
    _avatarNum: number;
    _recycledAvatarNodeList: any[];
    _moveSignDataList: any[];
    _pointSlotMap: any[];
    _currSelectPointId: any;
    _guildWarExitNode: any;
    _guildWarWheelNode: any;
    _mapSize: cc.Size;
    _mapMinScale: number;
    _isLockCamera: boolean;
    _touchFlag: any;
    _totalAvatarNum: number;
    _buildList: any[];
    _signalGuildWarBattleInfoSyn: any;
    _signalGuildWarBattleInfoGet: any;
    _signalGuildWarBattleChangeCity: any;
    _signalGuildWarBattleAvatarStateChange: any;
    _signalGuildWarBattleGoCampNotice: any;
    _signalGuildWarAttackNotice: any;
    _signalGuildWarDoAttack: any;
    _signalGuildWarPointChange: any;
    _signalGuildWarBuildingChange: any;
    _signalGuildWarUserChange: any;
    initData(cityId) {
        this._cityId = cityId;
        this._pointNodeList = [];
        this._hpPointNodeList = [];
        this._moveSignNodeList = [];
        this._hpNodeList = [];
        this._campEffectNodeList = [];
        this._avatarNodeMap = [];
        this._avatarNum = 0;
        this._recycledAvatarNodeList = [];
        this._moveSignDataList = [];
        this._pointSlotMap = [];
        this._currSelectPointId = null;
        this._guildWarExitNode = null;
        this._guildWarWheelNode = null;
        this._mapSize = cc.size(0, 0);
        this._mapMinScale = 0;
        this._isLockCamera = false;
        this._touchFlag = null;
        this._totalAvatarNum = GuildWarConst.MAP_MAX_AVATAR_NUM;
        this._buildList = [];
    }
    onCreate() {
        this._pointSlotMap = GuildWarDataHelper.makePointSlotMap(this._cityId);
        this._buildList = GuildWarDataHelper.getGuildWarBuildingList(this._cityId);
        this._scrollView.node.setContentSize(G_ResolutionManager.getDesignWidth(), G_ResolutionManager.getDesignHeight());
        this._createBg();
        this._createPointNodes();
        this._createCampEffectNodes();
        this._createMoveSignNodes();
        this._createHpPointNodes();
        this._createAvatarNodeList();
        this._createExitNodes();
        this._createWheelNode();
    }

    onEnter() {
        this._signalGuildWarBattleInfoSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN, handler(this, this._onEventGuildWarBattleInfoSyn));
        this._signalGuildWarBattleInfoGet = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET, handler(this, this._onEventGuildWarBattleInfoGet));
        this._signalGuildWarBattleChangeCity = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_CHANGE_CITY, handler(this, this._onEventGuildWarBattleChangeCity));
        this._signalGuildWarBattleAvatarStateChange = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_AVATAR_STATE_CHANGE, handler(this, this._onEventGuildWarBattleAvatarStateChange));
        this._signalGuildWarBattleGoCampNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_GO_CAMP_NOTICE, handler(this, this._onEventGuildWarBattleGoCampNotice));
        this._signalGuildWarAttackNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE, handler(this, this._onEventGuildWarAttackNotice));
        this._signalGuildWarDoAttack = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_DO_ATTACK, handler(this, this._onEventGuildWarDoAttack));
        this._signalGuildWarPointChange = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_POINT_CHANGE, handler(this, this._onEventGuildWarPointChange));
        this._signalGuildWarBuildingChange = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BUILDING_CHANGE, handler(this, this._onEventGuildWarBattleBuildingChange));
        this._signalGuildWarUserChange = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_USER_CHANGE, handler(this, this._onEventGuildWarUserChange));
        this._refreshPointNodes();
        this._refreshMoveSignNodes();
        this._refreshHpPointNodes();
        this._refreshAvatarNodes();
        this.gotoMyPosition(false);
        this._startTimer();
    }
    onExit() {
        this._signalGuildWarBattleInfoSyn.remove();
        this._signalGuildWarBattleInfoSyn = null;
        this._signalGuildWarBattleInfoGet.remove();
        this._signalGuildWarBattleInfoGet = null;
        this._signalGuildWarBattleChangeCity.remove();
        this._signalGuildWarBattleChangeCity = null;
        this._signalGuildWarBattleAvatarStateChange.remove();
        this._signalGuildWarBattleAvatarStateChange = null;
        this._signalGuildWarBattleGoCampNotice.remove();
        this._signalGuildWarBattleGoCampNotice = null;
        this._signalGuildWarAttackNotice.remove();
        this._signalGuildWarAttackNotice = null;
        this._signalGuildWarDoAttack.remove();
        this._signalGuildWarDoAttack = null;
        this._signalGuildWarPointChange.remove();
        this._signalGuildWarPointChange = null;
        this._signalGuildWarBuildingChange.remove();
        this._signalGuildWarBuildingChange = null;
        this._signalGuildWarUserChange.remove();
        this._signalGuildWarUserChange = null;
        this._endTimer();
        G_ServiceManager.DeleteOneAlarmClock('GuildWarCampEffectRemove');
    }
    _onEventGuildWarBattleInfoSyn(event) {
    }
    _onEventGuildWarBattleInfoGet(event) {
    }
    _onEventGuildWarBattleChangeCity(event, pointId) {
        var exitCityId = GuildWarDataHelper.getGuildWarExitCityId(this._cityId);
        if (exitCityId) {
            G_UserData.getGuildWar().c2sEnterGuildWar(exitCityId);
        }
    }
    _onEventGuildWarBattleAvatarStateChange(event, userData, newState, oldState, node) {
        if (userData && userData.isSelf()) {
            var showWheel = newState == GuildWarRunAvatorNode.STAND_STATE || newState == GuildWarRunAvatorNode.ATTACK_STATE;
            this._visibleWheelNode(showWheel);
        }
        if (oldState == GuildWarRunAvatorNode.RUN_STATE && newState == GuildWarRunAvatorNode.STAND_STATE) {
            if (userData && userData.isSelf()) {
                this._refreshMoveSignNodes();
                this._refreshWheelNode();
            }
        }
        if (newState == GuildWarRunAvatorNode.RELEASE_STATE) {
            this._recycledAvatarNodeList.push(node);
            this._avatarNum = this._avatarNum - 1;
            this._avatarNodeMap[userData.getUser_id()] = null;
        }
    }
    _onEventGuildWarBattleGoCampNotice(event, userData) {
        if (userData && userData.isSelf()) {
            var popup: any = G_SceneManager.getRunningScene().getPopupByName('PopupGuildWarPointDetail');
            if (popup) {
                popup.active = (false);
                var action = cc.callFunc(function () {
                    popup.close();
                });
                popup.runAction(cc.sequence(cc.delayTime(0.001), action));
            }
            this.gotoCamp();
        }
    }
    _onEventGuildWarAttackNotice(event, cityId, unit) {
    }
    _onEventGuildWarDoAttack(event) {
        var roleAvatar = this._getMyAvatar();
        if (roleAvatar) {
            roleAvatar.doAttack();
        }
    }
    _onEventGuildWarUserChange(event, cityId, changedUserMap) {
        this._refreshAvatarNodes(changedUserMap);
        var userId = G_UserData.getBase().getId();
        if (changedUserMap[userId]) {
            this._refreshMoveSignNodes();
            this._refreshWheelNode();
        }
    }
    _onEventGuildWarPointChange(event, cityId, changedPointMap, changedUserMap) {
        this._refreshPointNodes(changedPointMap);
    }
    _onEventGuildWarBattleBuildingChange(event) {
        this._refreshHpPointNodes();
        this._refreshMoveSignNodes();
        this._refreshBuildingPointNodes();
    }
    _startTimer() {
        this.schedule(this._onRefreshTick, Math.max(Math.ceil(GuildWarConst.CREATE_ROLE_CD / 1000), 1));
    }
    _endTimer() {
        this.unschedule(this._onRefreshTick);
    }
    printPointSlot() {
        for (var k in this._pointSlotMap) {
            var v = this._pointSlotMap[k];
            for (var k1 in v) {
                var v1 = v[k1];
                for (var k2 in v1) {
                    var v2 = v1[k2];
                }
            }
        }
    }
    retainPointSlot(pointId, faceIndex) {
        var slots = this._pointSlotMap[pointId][faceIndex];
        if (!slots) {
            return null;
        }
        var index = null;
        for (var k in slots) {
            var v = slots[k];
            if (v) {
                index = k;
                slots[k] = false;
                break;
            }
        }
        return index;
    }
    releasePointSlot(pointId, faceIndex, index) {
        var slots = this._pointSlotMap[pointId][faceIndex];
        if (slots[index] == false) {
            slots[index] = true;
        }
    }
    retainAvatar() {
        if (this._totalAvatarNum <= 0) {
            return false;
        }
        this._totalAvatarNum = this._totalAvatarNum - 1;
        return true;
    }
    releaseAvatar() {
        this._totalAvatarNum = this._totalAvatarNum + 1;
    }
    getZOrder(x, y) {
        var size = this._scrollView.content.getContentSize();
        var verticalGridNo = Math.ceil((size.height - y) / GuildWarBattleMapNode.GRID_HEIGHT);
        return Math.max(verticalGridNo, 0);
    }
    _createBg() {
        var cityConfig = GuildWarDataHelper.getGuildWarCityConfig(this._cityId);
        var sceneId = cityConfig.scene;
        var sceneConfig = GuildWarDataHelper.getGuildWarBgConfig(sceneId);
        var imgNum = sceneConfig.infeed_num * sceneConfig.endwise_num;
        var name = sceneConfig.pic_name;
        var x = 0, y = 0;
        var mapSize = cc.size(0, 0);
        let bgnum = parseInt(name[name.length - 1])
        var size: cc.Size;
        if (bgnum == 1) {
            size = GuildWarBattleMapNode.WAR_BG_1;
        }
        else if (bgnum == 2) {
            size = GuildWarBattleMapNode.WAR_BG_2;
        }
        else if (bgnum == 3) {
            size = GuildWarBattleMapNode.WAR_BG_3;
        }
        for (var i = 1; i <= imgNum; i += 1) {
            var imgName = name + "_" + i;
            var sprite = (new cc.Node()).addComponent(cc.Sprite) as cc.Sprite;
            UIHelper.loadTexture(sprite, Path.getBackground(imgName));
            
            sprite.node.setAnchorPoint(cc.v2(0, 0));
            
            if(imgNum==sceneConfig.infeed_num*2)
            {
                if(i<=sceneConfig.infeed_num)
                {
                    y = size.height;
                }
                else
                {
                    y = 0;
                }

            }
            sprite.node.setPosition(x, y);
            x = x + size.width;
            if (i % sceneConfig.infeed_num == 0) {
                mapSize.width = Math.max(mapSize.width, x);
                mapSize.height = mapSize.height + size.height;
                x = 0;
                y = y-size.height;
            }
            
           
            this._bgParentNode.addChild(sprite.node);
        }
        var designSize = G_ResolutionManager.getDesignSize();
        this._scrollView.content.setContentSize(mapSize);
        this._mapSize = mapSize;
        var scaleX = designSize[0] / mapSize.width;
        var scaleY = designSize[1] / mapSize.height;
        this._mapMinScale = Math.min(scaleX, scaleY);
        this._bgParentNode.setPosition(0, -mapSize.height);
    }
    _createCampEffectNodes() {
        var timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion();
        var curTime = G_ServerTime.getTime();
        if (curTime >= timeData.startTime && curTime < timeData.time1) {
            var pointList = GuildWarDataHelper.getGuildWarCampList(this._cityId);
            // logWarn('GuildWarBattleMapNode -------------- createCampEffectNodes');
            for (var k in pointList) {
                var v = pointList[k];
                var subEffect = G_EffectGfxMgr.createPlayMovingGfx(this._campEffectParentNode, 'moving_juntuanzhan_chengchiguang', null, null, false);
                subEffect.name = ('EffectGfxNode');
                let res = v.click_point.split("|");
                subEffect.node.setPosition(res[0], res[1]);
                subEffect.node.active = (true);
                subEffect.node.setScale(0.7);
                this._campEffectNodeList[v.point_id] = subEffect.node;
            }
            G_ServiceManager.registerOneAlarmClock('GuildWarCampEffectRemove', timeData.time1, function () {
                this._showCampEffectNodes(false);
            }.bind(this));
        }
    }
    _showCampEffectNodes(show) {
        for (var k in this._campEffectNodeList) {
            var v = this._campEffectNodeList[k];
            v.active = (show);
        }
    }
    _createPointNodes() {
        var pointList = GuildWarDataHelper.getGuildWarSeekPointList(this._cityId);
        for (var k in pointList) {
            var v = pointList[k];
            var guildWarPointNode = Util.getNode("prefab/guildwarbattle/GuildWarPointNode", GuildWarPointNode) as GuildWarPointNode;
            guildWarPointNode.initData(this._cityId, v);
            guildWarPointNode.setOnPointClickListener(handler(this, this._onPointClick));
            this._pointParentNode.addChild(guildWarPointNode.node);
            this._pointNodeList[guildWarPointNode.getPointId()] = guildWarPointNode;
        }
    }
    _onPointClick(cityId, pointId) {
        this._touchFlag = true;
        var success = GuildWarCheck.guildWarCanAttackPoint(cityId, pointId, false, true)[0];
        if (success) {
            G_UserData.getGuildWar().c2sGuildWarBattleWatch(pointId);
        }
    }
    _refreshPointNodes(changedPointMap?) {
        if (changedPointMap) {
            for (var k in changedPointMap) {
                var v = changedPointMap[k];
                var node = this._pointNodeList[k];
                if (node) {
                    node.updateInfo();
                }
            }
        } else {
            for (k in this._pointNodeList) {
                var v = this._pointNodeList[k];
                v.updateInfo();
            }
        }
    }
    _refreshBuildingPointNodes() {
        for (var k in this._buildList) {
            var v = this._buildList[k];
            var node = this._pointNodeList[v];
            if (node) {
                node.updateInfo();
            }
        }
    }
    _createHpPointNodes() {
        var pointList = GuildWarDataHelper.getGuildWarBuildingConfigListByCityId(this._cityId);
        for (var k in pointList) {
            var v = pointList[k];
            var node = Util.getNode("prefab/guildwarbattle/GuildWarBuildingNode", GuildWarBuildingNode) as GuildWarBuildingNode;
            node.initData(this, this._cityId, v);
            this._pointAndAvatarParentNode.addChild(node.node);
            this._hpPointNodeList.push(node);

            var hpNode = Util.getNode("prefab/guildwarbattle/GuildWarBuildingHpNode", GuildWarBuildingHpNode) as GuildWarBuildingHpNode;
            hpNode.initData(this._cityId, v);
            this._hpParentNode.addChild(hpNode.node);
            this._hpNodeList.push(hpNode);
        }
    }
    _refreshHpPointNodes() {
        for (var k in this._hpPointNodeList) {
            var v = this._hpPointNodeList[k];
            v.syn();
        }
        for (var k in this._hpNodeList) {
            var v = this._hpNodeList[k];
            v.syn();
        }
    }
    _createAvatarNodeList() {
        var userList = G_UserData.getGuildWar().getShowWarUserList(this._cityId, null, GuildWarConst.INIT_CREATE_ROLE_NUM);
        for (var k in userList) {
            var v = userList[k];
            this._createAvatarNode(v, null);
        }
    }
    _createAvatarNode(v, isTest) {
        var node1 = Util.getNode("prefab/guildwarbattle/GuildWarRunAvatorNode", GuildWarRunAvatorNode) as GuildWarRunAvatorNode;
        node1.ctor(this, this, this, v, isTest);
        this._pointAndAvatarParentNode.addChild(node1.node);
        var userId = v.getUser_id();
        this._avatarNodeMap[userId] = node1;
        this._avatarNum = this._avatarNum + 1;
        return node1;
    }
    finishBattle() {
        var guildId = G_UserData.getGuildWar().getBattleDefenderGuildId(this._cityId);
        for (var k in this._avatarNodeMap) {
            var v = this._avatarNodeMap[k];
            if (!v.isInRelease()) {
                v.doFinish(guildId);
            }
        }
    }
    _refreshAvatarNodes(changedUserMap?) {
        if (changedUserMap) {
            for (var k in changedUserMap) {
                var v1 = changedUserMap[k];
                var v = this._avatarNodeMap[k];
                if (v && !v.isInRelease()) {
                    var guildWarUser = v.getGuildWarUser();
                    var nowGuildWarUser = G_UserData.getGuildWar().getWarUserById(guildWarUser.getCity_id(), guildWarUser.getUser_id());
                    v.syn(nowGuildWarUser);
                }
            }
        } else {
            for (var k in this._avatarNodeMap) {
                var v = this._avatarNodeMap[k];
                if (!v.isInRelease() && !v._isTest) {
                    var guildWarUser = v.getGuildWarUser();
                    var nowGuildWarUser = G_UserData.getGuildWar().getWarUserById(guildWarUser.getCity_id(), guildWarUser.getUser_id());
                    v.syn(nowGuildWarUser);
                }
            }
        }
        this._checkAddAvatarNodes();
    }
    _onRefreshTick(dt) {
        var createNum = this._checkAddAvatarNodes();
        if (!createNum || createNum <= 0) {
            this._endTimer();
        }
    }
    _popReleaseAvatarNode() {
        for (var k in this._recycledAvatarNodeList) {
            var v = this._recycledAvatarNodeList[k];
            if (v.isInRelease() && v.isShowAvatar()) {
                this._recycledAvatarNodeList.splice(parseInt(k), 1);
                return v;
            }
        }
        for (k in this._recycledAvatarNodeList) {
            var v = this._recycledAvatarNodeList[k];
            if (v.isInRelease()) {
                this._recycledAvatarNodeList.splice(parseInt(k), 1);
                return v;
            }
        }
        return null;
    }
    _checkAddAvatarNodes() {
        var nowActiveNum = this._avatarNum;
        if (nowActiveNum < GuildWarConst.MAP_MAX_ROLE_NUM) {
            var addUserList = G_UserData.getGuildWar().getShowWarUserList(this._cityId, this._avatarNodeMap, Math.min(GuildWarConst.ONCE_CREATE_ROLE_NUM, GuildWarConst.MAP_MAX_ROLE_NUM - nowActiveNum));
            this._addAvatarNodes(addUserList);
            return addUserList.length;
        }
    }
    _addAvatarNodes(addUserList) {
        var needCreate = false;
        var num = addUserList.length;
        for (var k in addUserList) {
            var v = addUserList[k];
            var avatarNode = null;
            if (!needCreate) {
                avatarNode = this._popReleaseAvatarNode();
            }
            if (!avatarNode) {
                needCreate = true;
                avatarNode = this._createAvatarNode(v, null);
            } else {
                var userId = v.getUser_id();
                this._avatarNum = this._avatarNum + 1;
                this._avatarNodeMap[userId] = avatarNode;
                avatarNode.use(v);
            }
        }
    }
    _refreshMoveSignNodes() {
        var warUser = G_UserData.getGuildWar().getMyWarUser(this._cityId);
        var currPointId = warUser.getStartPoint();
        var movePointList = GuildWarDataHelper.findShowMoveSignPointList(this._cityId, currPointId);
        this._moveSignDataList = movePointList;
        for (var k in this._moveSignNodeList) {
            var v = this._moveSignNodeList[k];
            var data = movePointList[k];
            if (data) {
                v.node.active = (true);
                v.updateInfo(data);
            } else {
                v.node.active = (false);
            }
        }
    }
    _createMoveSignNodes() {
        for (var i = 1; i <= GuildWarBattleMapNode.MAX_WHEEL_NODE_NUM; i += 1) {
            var node1 = Util.getNode("prefab/guildwarbattle/GuildWarMoveSignNode", GuildWarMoveSignNode) as GuildWarMoveSignNode;
            this._moveSignParentNode.addChild(node1.node);
            this._moveSignNodeList.push(node1);
            node1.node.active = (false);
        }
    }
    _createExitNodes() {
    }
    _createWheelNode() {
        var node1 = Util.getNode("prefab/guildwarbattle/GuildWarPointWheelNode", GuildWarPointWheelNode) as GuildWarPointWheelNode;
        node1.setCloseListener(handler(this, this.clearWheelPos));
        this._wheelParentNode.addChild(node1.node);
        this._guildWarWheelNode = node1;
        node1.node.active = (false);
    }
    _setWheelPos(cityId, pointId) {
        if (pointId == this._currSelectPointId) {
            return;
        }
        this._currSelectPointId = pointId;
        this._guildWarWheelNode.node.active = (true);
        this._guildWarWheelNode.updateInfo({
            cityId: cityId,
            pointId: pointId
        });
    }
    clearWheelPos() {
        if (this._currSelectPointId) {
            this._currSelectPointId = null;
            this._guildWarWheelNode.node.active = (false);
        }
    }
    _refreshWheelNode() {
        if (this._guildWarWheelNode.node.active) {
            this._guildWarWheelNode.refreshView();
        }
    }
    _visibleWheelNode(show) {
        this._moveSignParentNode.active = (show);
        this._wheelParentNode.active = (show);
        if (!show) {
            this.clearWheelPos();
        }
    }
    _getMyAvatar() {
        var userId = G_UserData.getBase().getId();
        return this._avatarNodeMap[userId];
    }
    gotoMyPosition(useCamera?) {
        if (this._isLockCamera) {
            return;
        }
        var avatar = this._getMyAvatar();
        if (avatar) {
            var x = avatar.node.x;
            var y = avatar.node.y;
            var innerContainer = this._scrollView.content;
            // let old_x = innerContainer.x + G_ResolutionManager.getDesignWidth() * 0.5;
            // let old_y = innerContainer.y - G_ResolutionManager.getDesignHeight() * 0.5;
            var currScale = innerContainer.scale;
            var size = innerContainer.getContentSize();
            let new_y = size.height - y * currScale + G_ResolutionManager.getDesignHeight() * 0.5;
            let new_x = G_ResolutionManager.getDesignWidth() * 0.5 - x * currScale;

            if (new_x > 0) {
                new_x = 0;
            }
            else if (new_x < - size.width + G_ResolutionManager.getDesignWidth()) {
                new_x = - size.width + G_ResolutionManager.getDesignWidth()
            }

            if (new_y <= G_ResolutionManager.getDesignHeight()) {
                new_y = G_ResolutionManager.getDesignHeight();
            }
            else if (new_y >= size.height) {
                new_y = size.height;
            }

            // var scrollX = -(x * currScale - G_ResolutionManager.getDesignWidth() * 0.5);
            // var scrollY = -(y * currScale - G_ResolutionManager.getDesignHeight() * 0.5);
            // scrollX = Math.max(Math.min(scrollX, 0), -(size.width - G_ResolutionManager.getDesignWidth()));
            // scrollY = Math.max(Math.min(scrollY, 0), -(size.height - G_ResolutionManager.getDesignHeight()));
            if (useCamera == null) {
                useCamera = true;
            }
            if (useCamera) {
                this._cameraMoveToPos(new_x, new_y);
            } else {
                innerContainer.setPosition(new_x, new_y);
            }
        }
    }
    gotoCamp() {
        this.gotoMyPosition(true);
    }
    doScaleAnim(ePercent) {
        var innerContainer = this._scrollView.content;
        var startTime = G_ServerTime.getMSTime();
        var duration = 400;
        var sPercent = this.getCurrScalePercent();
        sPercent = Math.min(100, Math.max(0, sPercent));
        var action = UIActionHelper.createUpdateAction(function () {
            var time = G_ServerTime.getMSTime();
            var t = time - startTime;
            if (t >= duration) {
                t = duration;
                innerContainer.stopAllActions();
                this._cameraLock(false);
            }
            var percent = (ePercent - sPercent) * t / duration + sPercent;
            this.doScale(percent);
        }.bind(this), 0.01);
        innerContainer.stopAllActions();
        innerContainer.runAction(action);
        this._cameraLock(true);
    }
    getCurrScalePercent() {
        var innerContainer = this._scrollView.content;
        var scaleDiff = GuildWarBattleMapNode.MAX_SCALE - Math.max(this._mapMinScale, GuildWarBattleMapNode.MIN_SCALE);
        var currScale = innerContainer.scale;
        var percent = (currScale - Math.max(this._mapMinScale, GuildWarBattleMapNode.MIN_SCALE)) * 100 / scaleDiff;
        return percent;
    }
    doScale(percent) {
        var scaleDiff = GuildWarBattleMapNode.MAX_SCALE - Math.max(this._mapMinScale, GuildWarBattleMapNode.MIN_SCALE);
        var scale = Math.max(this._mapMinScale, GuildWarBattleMapNode.MIN_SCALE) + scaleDiff * percent / 100;
        var innerContainer = this._scrollView.content;
        var oldX = innerContainer.x;
        var oldY = innerContainer.y;
        var currScale = innerContainer.scale;
        var centerX = (-oldX + G_ResolutionManager.getDesignWidth() * 0.5) / currScale;
        var centerY = (-oldY + G_ResolutionManager.getDesignHeight() * 0.5) / currScale;
        var focus = cc.v2(centerX, centerY);
        var worldPos = innerContainer.convertToWorldSpaceAR(focus);
        innerContainer.setScale(scale);
        innerContainer.setContentSize(cc.size(this._mapSize.width * scale, this._mapSize.height * scale));
        var newWorldPos = innerContainer.convertToWorldSpaceAR(focus);
        var scrollX = oldX + worldPos.x - newWorldPos.x;
        var scrollY = oldY + worldPos.y - newWorldPos.y;
        var size = innerContainer.getContentSize();
        scrollX = Math.max(Math.min(scrollX, 0), -(size.width - G_ResolutionManager.getDesignWidth()));
        scrollY = Math.max(Math.min(scrollY, 0), -(size.height - G_ResolutionManager.getDesignHeight()));
        innerContainer.setPosition(scrollX, scrollY);

        this.initNodePositon();
    }

    initNodePositon() {
        var innerContainer = this._scrollView.content;

        let scale = Math.max(this._mapMinScale, GuildWarBattleMapNode.MIN_SCALE);
        let height = -innerContainer.height / scale;
        this._pointAndAvatarParentNode.setPosition(0, height);
        this._hpParentNode.setPosition(0, height);
        this._pointParentNode.setPosition(0, height);
        this._moveSignParentNode.setPosition(0, height);
        this._wheelParentNode.setPosition(0, height);
        this._exitParentNode.setPosition(0, height);
        this._tipsParentNode.setPosition(0, height);
        this._campEffectParentNode.setPosition(0, height);
    }

    _cameraMoveToPos(x, y) {
        if (this._isLockCamera) {
            return;
        }
        var innerContainer = this._scrollView.content;
        innerContainer.stopAllActions();
        var startX = innerContainer.x;
        var startY = innerContainer.y;
        var dstX = x;
        var dstY = y;
        var distance = Math.sqrt((startX - dstX) * (startX - dstX) + (startY - dstY) * (startY - dstY));
        var time = distance / GuildWarBattleMapNode.CAMERA_SPEED;
        var moveAction = cc.moveTo(time, cc.v2(dstX, dstY));
        var callFuncAction = cc.callFunc(function () {
            this._cameraLock(false);
        }.bind(this));
        var action = cc.sequence(moveAction, callFuncAction);
        innerContainer.runAction(action);
        this._cameraLock(true);
    }
    _cameraLock(lock) {
        if (lock) {
            this._scrollView.vertical = false;
            this._scrollView.horizontal = false;
            this._isLockCamera = true;
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_MOVE_CAMERA, true);
        } else {
            this._isLockCamera = false;
            this._scrollView.vertical = true;
            this._scrollView.horizontal = true;
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_MOVE_CAMERA, false);
        }
    }

}