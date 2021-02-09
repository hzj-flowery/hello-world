const { ccclass, property } = cc._decorator;

import CommonCountdown from '../../../ui/component/CommonCountdown'

// import CommonChatMiniNode from '../chat/CommonChatMiniNode'

import CommonMainMenu from '../../../ui/component/CommonMainMenu'
import ViewBase from '../../ViewBase';
import { handler } from '../../../utils/handler';
import { G_UserData, G_SignalManager, G_ResolutionManager, G_ServerTime, Colors } from '../../../init';
import { GuildCrossWarHelper } from './GuildCrossWarHelper';
import { GuildCrossWarConst } from '../../../const/GuildCrossWarConst';
import { SignalConst } from '../../../const/SignalConst';
import { CurveHelper } from '../../../utils/CurveHelper';
import { Lang } from '../../../lang/Lang';
import { Util } from '../../../utils/Util';
import GuildWarNoticeNode from '../guildwarbattle/GuildWarNoticeNode';
import GuildCrossWarGuildRank from './GuildCrossWarGuildRank';
import BigImagesNode from '../../../utils/BigImagesNode';
import { Path } from '../../../utils/Path';
import GuildCrossWarAvatar from './GuildCrossWarAvatar';
import GuildCrossWarBosssAvatar from './GuildCrossWarBosssAvatar';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { GuildWarNotice } from '../../../data/GuildWarNotice';

@ccclass
export default class GuildCrossWarBattleMapNode extends ViewBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageObserve: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _observeNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _observePanel: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _tipsParentNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _centerNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _guildRankNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _enemyNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _miniNode: cc.Node = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnReport: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnSpire: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnSupport: CommonMainMenu = null;

    //    @property({
    //        type: CommonChatMiniNode,
    //        visible: true
    //    })
    //    _commonChat: CommonChatMiniNode = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _warringBack: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _warringNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRebornCD: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSpire: cc.Sprite = null;

    @property({
        type: CommonCountdown,
        visible: true
    })
    _commonCountDown: CommonCountdown = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelChamp: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_9_0: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_9: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _scrollChamp: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _txtGuildName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _txtServerId: cc.Label = null;
    _fightNotice: any;
    _guildRank: any;
    _avatarUserMap: any;
    _avatarBossMap: any;
    _occupiedNode: any;

    public static readonly CAMERA_SPEED = 2200;
    public static readonly USER_KEY = 'userId_';
    public static readonly BOSS_KEY = 'bossId_';
    _movingpathList: any[];
    _signalEnter;
    _signalSelfMove;
    _signalUpdateUser;
    _signalUpdatePoint;
    _signalFight;
    _signalFightNotice;
    _signalFightSelfDie;
    _signalFightOtherDie;

    onCreate() {
        this.node.name = "GuildCrossWarBattleMapNode";
        this._createMap();
        this._registerListenerTouchScroll();
        this._panelTouch.active = (false);
        this._fightNotice = Util.getNode("prefab/guildCrossWar/GuildWarNoticeNode", GuildWarNoticeNode) as GuildWarNoticeNode;
        this._fightNotice.initData(2);
        this._tipsParentNode.addChild(this._fightNotice.node);
        this._guildRank = Util.getNode("prefab/guildCrossWar/GuildCrossWarGuildRank", GuildCrossWarGuildRank) as GuildCrossWarGuildRank;
        this._guildRankNode.addChild(this._guildRank.node);
        this.makeClickRect();
    }
    _registerListenerTouchScroll() {
        // var listener = new cc.EventListenerTouchOneByOne();
        // listener.setSwallowTouches(false);
        // listener.registerScriptHandler(handler(this, this._onTouchBeganEvent), cc.Handler.EVENT_TOUCH_BEGAN);
        // listener.registerScriptHandler(handler(this, this._onTouchMoveEvent), cc.Handler.EVENT_TOUCH_MOVED);
        // listener.registerScriptHandler(handler(this, this._onTouchEndEvent), cc.Handler.EVENT_TOUCH_ENDED);
        // cc.Director.getInstance().getEventDispatcher().addEventListenerWithSceneGraphPriority(listener, this._scrollView);

        this._scrollView.content.on(cc.Node.EventType.TOUCH_START, this._onTouchBeganEvent, this, false);
        this._scrollView.content.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMoveEvent, this, false);
        this._scrollView.content.on(cc.Node.EventType.TOUCH_END, this._onTouchEndEvent, this, false);

    }
    _onTouchBeganEvent(touch, event) {
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit == null) {
            return;
        }
        function isExistObstruct(grid) {
            var userList = GuildCrossWarHelper.getHoleUserList(grid) || {};
            for (var k in userList) {
                var v = userList[k];
                var userAvatar = this._getUserAvatar(v);
                if (userAvatar != null && !userAvatar.isSelfGuild()) {
                    return true;
                }
            }
            return false;
        }
        var innerContainer = this._scrollView.content;
        var endPos = innerContainer.convertToNodeSpace(touch.getLocation());
        var gridX = Math.ceil(endPos.x / GuildCrossWarConst.GRID_SIZE);
        var gridY = Math.ceil(endPos.y / GuildCrossWarConst.GRID_SIZE);
        var grid = GuildCrossWarHelper.getWarMapCfgByGrid(gridX, gridY);
        if (selfUnit.checkCanMoving(grid)) {
            if (isExistObstruct(grid.id)) {
                return;
            }
            var needTime = selfUnit.getNeedTime(grid.id);
            G_UserData.getGuildCrossWar().c2sBrawlGuildsMove({
                key_point_id: grid.point_y,
                pos: grid.id
            }, needTime);
        }
    }
    _onTouchMoveEvent(touch, event) {
        // print('GuildCrossWarBattleMapNode:_onTouchMoveEvent');
    }
    _onTouchEndEvent(touch, event) {
        // print('GuildCrossWarBattleMapNode:_onTouchEndEvent');
    }
    onEnter() {
        this._signalEnter = G_SignalManager.add(SignalConst.EVENT_GUILDCROSS_WAR_ENTRY, handler(this, this._onEventEnter));
        this._signalSelfMove = G_SignalManager.add(SignalConst.EVENT_GUILDCROSS_WAR_SELFMOVE, handler(this, this._onEventSelfMove));
        this._signalUpdateUser = G_SignalManager.add(SignalConst.EVENT_GUILDCROSS_WAR_UPDATEPLAYER, handler(this, this._onEventUpdateUser));
        this._signalUpdatePoint = G_SignalManager.add(SignalConst.EVENT_GUILDCROSS_WAR_UPDATEPOINT, handler(this, this._onEventUpdatePoint));
        this._signalFight = G_SignalManager.add(SignalConst.EVENT_GUILDCROSS_WAR_FIGHT, handler(this, this._onEventFight));
        this._signalFightNotice = G_SignalManager.add(SignalConst.EVENT_GUILDCROSS_WAR_OTHER_SEE_BOSSS, handler(this, this._onEventFightNotice));
        this._signalFightSelfDie = G_SignalManager.add(SignalConst.EVENT_GUILDCROSS_WAR_SELFDIE, handler(this, this._onEventFightSelfDie));
        this._signalFightOtherDie = G_SignalManager.add(SignalConst.EVENT_GUILDCROSS_WAR_OTHERDIE, handler(this, this._onEventFightOtherDie));
        this._releaseMap();
        this._updateUserList();
        this._updateBossList();
        this._updatePossession();
        this._gotoPointCenter(true);
    }
    onExit() {
        this.unscheduleAllCallbacks();
        this._signalEnter.remove();
        this._signalEnter = null;
        this._signalSelfMove.remove();
        this._signalSelfMove = null;
        this._signalUpdateUser.remove();
        this._signalUpdateUser = null;
        this._signalUpdatePoint.remove();
        this._signalUpdatePoint = null;
        this._signalFight.remove();
        this._signalFight = null;
        this._signalFightNotice.remove();
        this._signalFightNotice = null;
        this._signalFightSelfDie.remove();
        this._signalFightSelfDie = null;
        this._signalFightOtherDie.remove();
        this._signalFightOtherDie = null;
    }
    _createMap() {
        var spriteMap = new BigImagesNode();
        spriteMap.setUp(Path.getStageGuildCross('guild_cross_stage'));
        var spriteSize = spriteMap.node.getContentSize();
        spriteMap.node.setAnchorPoint(cc.v2(0, 0));
        spriteMap.node.setPosition(cc.v2(0, 0));
        this._scrollView.content.addChild(spriteMap.node);
        this._scrollView.content.setContentSize(spriteSize);
        this._scrollView.node.setContentSize(G_ResolutionManager.getDesignCCSize());
    }
    _releaseMap() {
        for (var key in this._avatarUserMap) {
            var value = this._avatarUserMap[key];
            this._releaseUserAvatar(key);
        }
        for (var key in this._avatarBossMap) {
            var value = this._avatarBossMap[key];
            this._releaseBossAvatar(key);
        }
    }
    _releaseUserAvatar(userId) {
        var avatarUser = this._avatarUserMap[userId];
        if (avatarUser) {
            avatarUser.removeFromParent();
            this._avatarUserMap[userId] = null;
        }
    }
    _releaseBossAvatar(pointId) {
        var avatarBoss = this._avatarBossMap[pointId];
        if (avatarBoss) {
            avatarBoss.removeFromParent();
            this._avatarBossMap[pointId] = null;
        }
    }
    _isFlip(posX, posY) {
        var bOffsetX = false, bOffsetY = false;
        var [curX, curY] = this._cameraPosConvert(posX, posY);
        var innerContainer = this._scrollView.content;
        var cameraX = innerContainer.getPosition().x;
        var cameraY = innerContainer.getPosition().y;
        var designWidth = G_ResolutionManager.getDesignWidth() / 2 - 300;
        var designHeight = G_ResolutionManager.getDesignHeight() / 2 - 190;
        if (cameraY - curY > designHeight) {
            if (cameraX - curX > designWidth) {
                bOffsetX = true, bOffsetY = true;
            } else {
                bOffsetX = false, bOffsetY = true;
            }
        } else if (cameraX - curX > designWidth) {
            bOffsetX = true, bOffsetY = false;
        }
        return [
            bOffsetX,
            bOffsetY
        ];
    }
    _getMidOffset(posX, posY) {
        var [curX, curY] = this._cameraPosConvert(posX, posY);
        var innerContainer = this._scrollView.content;
        var cameraX = innerContainer.getPosition(), cameraY;
        return cc.v2(cameraX, cameraY).sub(cc.v2(curX, curY));
    }
    _touchAvatar(pointHole, postionX, postionY) {
    }
    _createUserAvatar(userId, actionType) {
        var avatar = Util.getNode("prefab/guildCrossWar/GuildCrossWarAvatar", GuildCrossWarAvatar) as GuildCrossWarAvatar;
        avatar.ctor(userId, handler(this, this._touchAvatar));
        avatar.updateUI(null);
        avatar.name = (GuildCrossWarBattleMapNode.USER_KEY + userId);
        this._scrollView.content.addChild(avatar.node, 10000);
        this._avatarUserMap[userId] = avatar;
        return avatar;
    }
    _createBossAvatar(pointId) {
        var avatar = Util.getNode("prefab/guildCrossWar/GuildCrossWarBosssAvatar", GuildCrossWarBosssAvatar) as GuildCrossWarBosssAvatar;
        avatar.initData(pointId);
        avatar.updateUI();
        avatar.name = (GuildCrossWarBattleMapNode.BOSS_KEY + pointId);
        this._scrollView.content.addChild(avatar.node, 10000);
        this._avatarBossMap[pointId] = avatar;
        return avatar;
    }
    getCameraPos(): any {
        var innerContainer = this._scrollView.content;
        return [
            cc.v2(innerContainer.getPosition()),
            this._scrollView.content.getContentSize()
        ];
    }
    getUserList() {
        var selfGuilNumber = {};
        for (var k in this._avatarUserMap) {
            var v = this._avatarUserMap[k];
            if (this._avatarUserMap[k] && this._avatarUserMap[k].isSelfGuild()) {
                if (!this._avatarUserMap[k].isSelf()) {
                    if (!selfGuilNumber[k]) {
                        selfGuilNumber[k] = {};
                    }
                    selfGuilNumber[k] = this._avatarUserMap[k];
                }
            }
        }
        return selfGuilNumber;
    }
    _moveCameraAction(path) {
        var curveConfigList = path.curLine;
        var totalTime = path.totalTime * 1000;
        var endTime = G_ServerTime.getMSTime() + path.totalTime * 1000;
        var movingEnd = function () {
            this._loopFollowing();
        }.bind(this)
        var moveCallback = function (newPos, oldPos) {
            var scrollX = this._cameraPosConvert(newPos.x, newPos.y), scrollY;
            scrollX = Math.floor(scrollX), scrollY = Math.floor(scrollY);
            var innerContainer = this._scrollView.getInnerContainer();
            innerContainer.setPosition(scrollX, scrollY);
        }.bind(this)
        // CurveHelper.doCurveMove(this._centerNode, movingEnd, null, moveCallback, curveConfigList, totalTime, endTime);
    }
    _gotoPointCenter(isFirstEnter) {
        isFirstEnter = isFirstEnter || false;
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit == null) {
            return;
        }
        var pointHole = selfUnit.getCurPointHole();
        if (pointHole == null) {
            return;
        }
        var hoelCenter = GuildCrossWarHelper.getWarMapGridCenter(pointHole.pos);
        var [scrollX, scrollY] = this._cameraPosConvert(hoelCenter.x, hoelCenter.y);
        if (isFirstEnter) {
            var innerContainer = this._scrollView.content;
            innerContainer.stopAllActions();
            innerContainer.setPosition(scrollX, scrollY);
        } else {
            this._cameraMoveToPos(scrollX, scrollY);
        }
    }
    _updateAvatarInTheCamera() {
        var [cameraPos, cameraSize] = this.getCameraPos();
        var unitList = G_UserData.getGuildCrossWar().getUserMap();
        var maxViewSize = 30;
        for (var i in unitList) {
            var value = unitList[i];
            var unitAvatar = this._getUserAvatar(value.getUid());
            if (unitAvatar) {
                unitAvatar.setAvatarModelVisible(false);
                if (unitAvatar.isStateVisible()) {
                    var teamPos = cc.v2(unitAvatar.getPosition());
                    var cameraRect = cc.rect(-cameraPos.x, -cameraPos.y, cameraSize.width, cameraSize.height);
                    if (cameraRect.contains(teamPos) && maxViewSize > 0) {
                        unitAvatar.setAvatarModelVisible(true);
                        maxViewSize = maxViewSize - 1;
                    }
                }
            }
        }
    }
    _getOwnAvatar() {
        var mySelfId = G_UserData.getGuildCrossWar().getSelfUserId();
        if (mySelfId && mySelfId > 0) {
            return this._avatarUserMap[mySelfId];
        }
        return null;
    }
    _getUserAvatar(userId) {
        if (userId && userId > 0) {
            return this._avatarUserMap[userId];
        }
        return null;
    }
    _getBossvatar(pointId) {
        if (pointId && pointId > 0) {
            return this._avatarBossMap[pointId];
        }
        return null;
    }
    _setBossvatar(pointId) {
        if (pointId == null || pointId <= 0) {
            return;
        }
        var bossAvatar = this._getBossvatar(pointId);
        if (bossAvatar != null) {
            this._avatarBossMap[pointId] = null;
        }
    }
    getSelfPosition() {
        var userAvatar = this._getOwnAvatar();
        if (userAvatar == null) {
            return;
        }
        return userAvatar.getPosition();
    }
    _checkCreateBossAvatar(id) {
        var bossAvatar = this._getBossvatar(id);
        if (bossAvatar == null) {
            bossAvatar = this._createBossAvatar(id);
        }
        return bossAvatar;
    }
    _checkCreateUserAvatar(userId, action) {
        var userAvatar = this._getUserAvatar(userId);
        if (userAvatar == null) {
            userAvatar = this._createUserAvatar(userId, action);
        }
        return userAvatar;
    }
    _updateUserList() {
        var selfPointHole = {};
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit) {
            selfPointHole = selfUnit.getCurPointHole();
        }
        var innerContainer = this._scrollView.content;
        var userList = G_UserData.getGuildCrossWar().getUserMap();
        for (var k in userList) {
            var value = userList[k];
            var userAvatar = this._checkCreateUserAvatar(value.getUid(), null);
            if (!userAvatar.isSelf()) {
                var bVisible = !userAvatar.isSelfGuild() && GuildCrossWarHelper.checkCanMovedPoint(selfPointHole, GuildCrossWarHelper.getWarMapCfg(userAvatar.getCurGrid()));
                userAvatar.synServerPos();
                userAvatar.showSword(bVisible);
            }
        }
    }
    _updateCurPointList(userList) {
        if (typeof (userList) != 'object') {
            return;
        }
        for (var k in userList) {
            var value = userList[k];
            for (var i in value) {
                var v = value[i];
                var userAvatar = this._checkCreateUserAvatar(v, null);
                if (!userAvatar.isSelf() && userAvatar.getCurState() != GuildCrossWarConst.UNIT_STATE_MOVING) {
                    userAvatar.synServerPos();
                }
            }
        }
    }
    _updateBossList() {
        var bossList = G_UserData.getGuildCrossWar().getBossMap();
        for (var k in bossList) {
            var v = bossList[k];
            var bossState = v.getCurState()[0];
            if (bossState != GuildCrossWarConst.BOSS_STATE_DEATH) {
                var bossAvatar = this._checkCreateBossAvatar(v.getId());
                bossAvatar.updateUI();
            } else {
                this._setBossvatar(v.getId());
            }
        }
    }
    _updatePossession() {
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit == null) {
            return;
        }
        var occupied = '';
        var warCfg = GuildCrossWarHelper.getWarCfg(selfUnit.getCurPointId());
        if (warCfg != null) {
            occupied = warCfg.point_name + Lang.get('guild_cross_war_possession');
        }
        var guildName = Lang.get('guild_cross_war_noguild');
        var pointUnit = G_UserData.getGuildCrossWar().getPointDataById(selfUnit.getCurPointId());
        if (pointUnit != null && pointUnit.getGuild_name() != '') {
            guildName = pointUnit.getGuild_name();
        }
        this._occupiedNode.removeAllChildren();
        var richText = RichTextExtend.createRichTextByFormatString(Lang.get('guild_cross_war_occupied', {
            city: occupied,
            name: guildName
        }), {
            defaultColor: Colors.DARK_BG_THREE,
            defaultSize: 22,
            other: { [1]: { fontSize: 22 } }
        });
        this._occupiedNode.addChild(richText.node);
    }
    _cameraMoveToPos(targetX, targetY) {
        var innerContainer = this._scrollView.content;
        innerContainer.stopAllActions();
        var startX = innerContainer.getPosition().x;
        var startY = innerContainer.getPosition().y;
        var dstX = targetX, dstY = targetY;
        var distance = cc.pGetDistance(cc.v2(startX, startY), cc.v2(dstX, dstY));
        var time = distance / GuildCrossWarBattleMapNode.CAMERA_SPEED;
        var moveAction = cc.moveTo(time, cc.v2(dstX, dstY));
        var callFuncAction = cc.callFunc(function () {
        });
        var action = cc.sequence(moveAction, callFuncAction);
        innerContainer.runAction(action);
    }
    _cameraPosConvert(startX, startY) {
        var x = startX, y = startY;
        var innerContainer = this._scrollView.content;
        var currScale = innerContainer.scale;
        var size = innerContainer.getContentSize();
        var scrollX = -(x * currScale - G_ResolutionManager.getDesignWidth() * 0.5);
        var scrollY = -(y * currScale - G_ResolutionManager.getDesignHeight() * 0.5);
        scrollX = Math.max(Math.min(scrollX, 0), -(size.width - G_ResolutionManager.getDesignWidth()));
        scrollY = Math.max(Math.min(scrollY, 0), -(size.height - G_ResolutionManager.getDesignHeight()));
        return [
            scrollX,
            scrollY
        ];
    }
    _onEventEnter() {
        this._fightNotice.clear();
        this._updateUserList();
        this._updateBossList();
        this._gotoPointCenter(true);
    }
    _updateCurPoint(pointId?) {
        // print('GuildCrossWarBattleMapNode:_updateCurPoint 111');
        this._updateUserList();
    }
    _onEventSelfMove(id, needTime) {
        var selfAvatar = this._getOwnAvatar();
        if (selfAvatar == null) {
            return;
        }
        selfAvatar.moving(handler(this, this._cameraFollow), handler(this, this._updateCurPoint));
    }
    _cameraFollow(allPath) {
        this._movingpathList = [];
        this._movingpathList = allPath;
        this._loopFollowing();
    }
    _loopFollowing() {
        if (this._movingpathList && this._movingpathList.length > 0) {
            var path = this._movingpathList[0];
            this._moveCameraAction(path);
            this._movingpathList.shift();
        }
    }
    _onEventUpdateUser(id, message) {
        // print('GuildCrossWarBattleMapNode:_onEventUpdateUser 111');
        var uid = message.player.uid;
        if (message.action == GuildCrossWarConst.UPDATE_ACTION_0) {
            var userAvatar = this._checkCreateUserAvatar(uid, GuildCrossWarConst.UPDATE_ACTION_0);
            userAvatar.moving(null, handler(this, this._updateCurPoint));
        } else if (message.action == GuildCrossWarConst.UPDATE_ACTION_1) {
            var userAvatar = this._checkCreateUserAvatar(uid, GuildCrossWarConst.UPDATE_ACTION_1);
            userAvatar.playRebornAction(null, handler(this, this._updateCurPoint));
        } else if (message.action == GuildCrossWarConst.UPDATE_ACTION_2) {
            var userAvatar = this._checkCreateUserAvatar(uid, null);
            userAvatar.updateAvatarHp();
        } else if (message.action == GuildCrossWarConst.UPDATE_ACTION_3) {
            this._updateCurPoint();
        }
    }
    _onEventUpdatePoint() {
        this._updatePossession();
    }
    _onEventFight(id, message) {
        var selfAvatar = this._getOwnAvatar();
        if (selfAvatar == null) {
            return;
        }
        if (!message.fight_type) {
            selfAvatar.playAttackAction(function () {
                var bossAvatar = this._getBossvatar(selfAvatar.getCurPointId());
                if (bossAvatar != null) {
                    bossAvatar.updateUI();
                }
            });
        } else {
            // print('GuildCrossWarBattleMapNode:_onEventFight 111');
            if (message.battle_result == null) {
                return;
            }
            // print('GuildCrossWarBattleMapNode:_onEventFight 222');
            var type = 0;
            if (message.is_attacker) {
                type = message.battle_result + 1;
            } else {
                type = message.battle_result + 7;
            }
            this._createTipUnit(type, message);
        }
    }
    _createTipUnit(typeValue, message) {
        // print('GuildCrossWarBattleMapNode:_createTipUnit 111');
        var unit = Util.getNode("prefab/guildCrossWar/GuildWarNotice", GuildWarNotice) as GuildWarNotice;
        unit.setValue('name', message.target_name || 'XXXXXXXXX');
        unit.setValue('selfhp', message.own_hp || '00');
        unit.setValue('otherhp', message.target_hp || '01');
        unit.setId(typeValue);
        this._fightNotice.showMsg(unit);
        // print('GuildCrossWarBattleMapNode:_createTipUnit 222');
        var selfAvatar = this._getOwnAvatar();
        // dump(typeValue);
        if (typeValue != 8 && selfAvatar != null) {
            // print('GuildCrossWarBattleMapNode:_createTipUnit 333');
            selfAvatar.updateAvatarHp();
        }
    }
    _onEventFightSelfDie(id, message) {
        // print('GuildCrossWarBattleMapNode:_onEventFightSelfDie 111');
        var type = message.is_attacker && 2 || 8;
        this._createTipUnit(type, message);
        var userUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (userUnit == null) {
            return;
        }
        // print('GuildCrossWarBattleMapNode:_onEventFightSelfDie 222');
        var selfAvatar = this._checkCreateUserAvatar(G_UserData.getGuildCrossWar().getSelfUserId(), null);
        selfAvatar.playRebornAction(handler(this, this._gotoPointCenter), handler(this, this._updateCurPoint));
    }
    _onEventFightOtherDie(id, message) {
        var type = message.is_attacker && 1 || 7;
        this._createTipUnit(type, message);
    }
    _onEventFightNotice(id, message) {
        if (message.uid == null) {
            return;
        }
        var userAvatar = this._getUserAvatar(message.uid);
        if (userAvatar == null) {
            return;
        }
        userAvatar.playAttackAction(function () {
            var bossAvatar = this._getBossvatar(message.key_point_id);
            if (bossAvatar != null) {
                bossAvatar.updateUI();
            }
        });
    }
    makeClickRect() {
        var retList = G_UserData.getGuildCrossWar().getWarHoleList();
        for (var i in retList) {
            var value = retList[i];
            var color = new cc.Color(255, 0, 0, 60);
            if (value.isMove == 1) {
                if (value.point != 0) {
                    color = new cc.Color(255, 144, 238, 144);
                } else {
                    color = new cc.Color(0, 144, 238, 144);
                }
            } else {
            }
            // var clickRectWidget = new cc.LayerColor(color, value.clickRect.width, value.clickRect.height);
            // clickRectWidget.setPosition(cc.v2(value.clickRect.x, value.clickRect.y));
            // this._scrollView.addChild(clickRectWidget);
        }
    }

}