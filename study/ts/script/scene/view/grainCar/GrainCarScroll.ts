import { MineCraftData } from "../../../data/MineCraftData";
import { G_UserData } from "../../../init";
import { handler } from "../../../utils/handler";
import { table } from "../../../utils/table";
import ViewBase from "../../ViewBase";
import GrainCarBg from "./GrainCarBg";
import { GrainCarDataHelper } from "./GrainCarDataHelper";
import PopupGrainCarAvatar from "./PopupGrainCarAvatar";
import PopupGrainCarRobber from "./PopupGrainCarRobber";


var GESTURE_TOUCH_BEGAN = 1;
var GESTURE_TOUCH_MOVE = 2;
var GESTURE_TOUCH_END = 3;
const { ccclass, property } = cc._decorator;
@ccclass
export default class GrainCarScroll extends ViewBase {
    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _GrainCarBg: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _PopupGrainCarRobber: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _PopupGrainCarAvatar: cc.Prefab = null;





    static BG_WIDTH = 1400;
    static ROBBER_WIDTH = 150;
    static ROBBER_HEIGHT = 150;
    static GUILD_PADDING = 230;
    static LINE_NUM = 3;
    static MAX_AVATAR = 30;
    static MAX_CAR_AVATAR = 6;
    static SCROLL_INVIEW_PADDING = 200;
    static SCROLL_START_POS = cc.v2(100, 400);
    static DEFAULT_COLUMN = 2;

    private _isDirty: boolean;
    private _userCenterX: number;
    private _scrollSize: cc.Size;

    _mineData: any;
    _guildData:Array<any>;
    _userData: any;
    _guildHashData: any;
    _bgList: Array<GrainCarBg>;
    _avatarUnusedPool: Array<PopupGrainCarRobber>;
    _avatarUsedPool: Array<PopupGrainCarRobber>;
    _carUnusedPool: Array<PopupGrainCarAvatar>;
    _carUsedPool: Array<PopupGrainCarAvatar>;
    _windowIndex: number;
    _curGuild;
    _curAtkGuild;
    _bLockCurGuild: boolean;
    _gestureList: Array<number>;
    _scheduleGestureHandler;

    ctor(mineData) {
        this._initMember(mineData);
        this.node.name = ('GrainCarScroll');
    }
    onCreate() {
        this._initAvatarPool();
        this._initScrollView();
    }
    onEnter() {
        this._updateData();
        this._resetAvatarPool();
        this._initAvatarLayout();
        var totalWidth = this._getTotalWidth();
        this._scrollView.content.setContentSize(cc.size(totalWidth, this._scrollSize.height));
        this._refreshAvatarPos();
        this._findMe();
    }
    _testTimer() {
        this.updateLayout();
    }
    onExit() {
        this._resetAvatarPool();
        this._stopGestureTimer();
    }
    onShowFinish() {
    }
    _initMember(mineData) {
        this._mineData = mineData;
        this._bgList = [];
        this._avatarUnusedPool = [];
        this._avatarUsedPool = [];
        this._carUnusedPool = [];
        this._carUsedPool = [];
        this._windowIndex = 1;
        this._isDirty = false;
        this._curGuild = null;
        this._curAtkGuild = null;
        this._bLockCurGuild = false;
        this._gestureList = [];
    }
    _updateData() {
        this._avatarUsedPool = [];
        this._carUsedPool = [];
        this._mineData = G_UserData.getMineCraftData().getMineDataById(this._mineData.getId());
        this._guildData = [];
        this._guildData = GrainCarDataHelper.getUserListDividByGuildWithMineId(this._mineData.getId());
        this._guildData = GrainCarDataHelper.sortGuild(this._guildData);
        this._userData = {};
        this._guildHashData = {};
        for (let iGuild in this._guildData) {
            var guild = this._guildData[iGuild];
            for (let iUser in guild.data) {
                var user = guild.data[iUser];
                this._userData['k' + user.id] = user;
            }
        }
        for (let iGuild in this._guildData) {
            var guild = this._guildData[iGuild];
            this._guildHashData['k' + guild.id] = guild;
        }
    }
    scroll2Guild(guildId) {
        for (let iGuild in this._guildData) {
            var guild = this._guildData[iGuild];
            if (guild.id == guildId) {
                var windowWidth = this._scrollSize.width;
                if (this._scrollView.content.getContentSize().width == windowWidth) {
                    this._scrollView.scrollToPercentHorizontal(0, 0.5, true);
                } else {
                    var percent = 100 * (guild.pos.x - windowWidth / 2) / (this._scrollView.content.getContentSize().width - windowWidth);
                    this._scrollView.scrollToPercentHorizontal(percent, 0.5, true);
                }
            }
        }
    }
    updateCar(carUnit) {
        for (let iGuild in this._guildData) {
            var guild = this._guildData[iGuild];
            if (guild.id == carUnit.getGuild_id()) {
                guild.isDirty = true;
            }
        }
        this._refreshAvatarPos();
    }
    updateLayout() {
        if (this._isTouched()) {
            this._isDirty = true;
        } else {
            this._resetAvatarPool();
            this._updateData();
            this._initAvatarLayout();
            this._userCenterX = this._getUserCenterX();
            this._bLockCurGuild = true;
            var totalWidth = this._getTotalWidth();
            this._scrollView.content.setContentSize(cc.size(totalWidth, this._scrollSize.height));
            this._findFocusedGuild();
        }
    }
    setDataDirty() {
        this._isDirty = true;
    }
    setAtkFocusedGuild(guildId) {
        for (let iGuild in this._guildData) {
            var guild = this._guildData[iGuild];
            if (guildId == guild.id) {
                this._curAtkGuild = guild;
                return;
            }
        }
    }
    //初始化滑动组件
    _initScrollView() {
        this._scrollSize = this._scrollView.node.getContentSize();
        var totalWidth = 1000;
        this._scrollView.content.setContentSize(cc.size(totalWidth, this._scrollSize.height));
        var sE = new cc.Component.EventHandler();
        sE.component = "GrainCarScroll";
        sE.handler = "_onTouchScroll";
        sE.target = this.node;
        this._scrollView.scrollEvents = [];
        this._scrollView.scrollEvents.push(sE);
        this._scrollView.horizontalScrollBar.node.active = false;
        this._scrollView.node.on(cc.Node.EventType.TOUCH_START, this._moveLayerTouch, this);
        for (var i = 1; i <= 3; i++) {
            var grainCarBg = cc.instantiate(this._GrainCarBg).getComponent(GrainCarBg)
            this._bgList[i-1] = grainCarBg;
            this._scrollView.content.addChild(grainCarBg.node);
            grainCarBg.node.setPosition(cc.v2(this._scrollSize.width / 2 + GrainCarScroll.BG_WIDTH * (i - 1), this._scrollSize.height / 2));
        }
    }
    //
    _initAvatarPool() {
        for (var i = 1; i <= GrainCarScroll.MAX_AVATAR; i++) {
            var popupGrainCarRobber = cc.instantiate(this._PopupGrainCarRobber).getComponent(PopupGrainCarRobber)
            popupGrainCarRobber.ctor(this._mineData);
            this._scrollView.content.addChild(popupGrainCarRobber.node, 100);
            popupGrainCarRobber.node.active = (false);
            this._addAvatarPool(popupGrainCarRobber);
        }
        for (var i = 1; i <= GrainCarScroll.MAX_CAR_AVATAR; i++) {
            var popupGrainCarAvatar = cc.instantiate(this._PopupGrainCarAvatar).getComponent(PopupGrainCarAvatar)
            popupGrainCarAvatar.ctor(this._mineData);
            this._scrollView.content.addChild(popupGrainCarAvatar.node, 100);
            popupGrainCarAvatar.node.active = (false);
            this._addCarAvatarPool(popupGrainCarAvatar);
        }
    }
    //重置角色包含普通角色和车角色
    _resetAvatarPool() {
        for (let key in this._avatarUsedPool) {
            let avatar = this._avatarUsedPool[key];
            if (avatar.node.active) {
                this._removeAvatarFromUsedPool(key);
            }
        }
        for (let key in this._carUsedPool) {
            let avatar = this._carUsedPool[key];
            if (avatar.node.active) {
                this._removeCarAvatarFromUsedPool(key);
            }
        }
    }
    _initAvatarLayout() {
        var innerWidth = 0;
        var startPos = GrainCarScroll.SCROLL_START_POS;
        for (let i in this._guildData) {
            var guild = this._guildData[i];
            var curIndex = 0;
            if (guild.isMine) {
                startPos = this._initMyLayout(guild);
            } else {
                startPos = this._initEnemyLayout(guild, startPos);
            }
        }
    }
    _initMyLayout(guild) {
        var userCount = guild.data.length;
        var haveCar = guild.haveCar;
        var columnUser = Math.floor(userCount / GrainCarScroll.LINE_NUM);
        columnUser = Math.max(columnUser, GrainCarScroll.DEFAULT_COLUMN);
        var modUser = userCount % GrainCarScroll.LINE_NUM;
        var myStartPos = cc.v2(GrainCarScroll.SCROLL_START_POS.x + columnUser * GrainCarScroll.ROBBER_WIDTH, GrainCarScroll.SCROLL_START_POS.y);
        var nextStartPos = GrainCarScroll.SCROLL_START_POS;
        if (userCount == 0) {
            nextStartPos = cc.v2(myStartPos.x + GrainCarScroll.GUILD_PADDING, 400);
            guild.endOffset = nextStartPos.x - GrainCarScroll.GUILD_PADDING / 2;
            guild.startOffset = GrainCarScroll.SCROLL_START_POS.x;
        }
        if (haveCar) {
            var carOffsetX = GrainCarScroll.ROBBER_WIDTH * 1.5;
            if (userCount == 0) {
                carOffsetX = GrainCarScroll.GUILD_PADDING / 2;
            }
            guild.pos = cc.v2(myStartPos.x - carOffsetX, myStartPos.y - GrainCarScroll.ROBBER_HEIGHT);
        }
        var curIndex = 0;
        for (let iUser in guild.data) {
            var user = guild.data[iUser];
            if (parseInt(iUser) == 1) {
                guild.startOffset = GrainCarScroll.SCROLL_START_POS.x;
            }
            if (haveCar && parseInt(iUser) == 5) {
                curIndex = curIndex + 1;
            } else if (haveCar && parseInt(iUser) == 7) {
                curIndex = curIndex + 1;
            }
            var columnUser = Math.floor(curIndex / GrainCarScroll.LINE_NUM);
            var modUser = curIndex % GrainCarScroll.LINE_NUM;
            user.pos = cc.v2(myStartPos.x - columnUser * GrainCarScroll.ROBBER_WIDTH, myStartPos.y - modUser * GrainCarScroll.ROBBER_HEIGHT);
            this._userData['k' + user.id].pos = user.pos;
            curIndex = curIndex + 1;
            if (iUser == guild.data.length) {
                nextStartPos = cc.v2(myStartPos.x + GrainCarScroll.GUILD_PADDING, 400);
                guild.endOffset = nextStartPos.x - GrainCarScroll.GUILD_PADDING / 2;
            }
        }
        return nextStartPos;
    }
    _initEnemyLayout(guild, startPos) {
        var userCount = guild.data.length;
        var nextStartPos = startPos;
        var haveCar = guild.haveCar;
        if (userCount == 0) {
            nextStartPos = cc.v2(startPos.x + 1 * GrainCarScroll.ROBBER_WIDTH + GrainCarScroll.GUILD_PADDING, 400);
            guild.endOffset = nextStartPos.x - GrainCarScroll.GUILD_PADDING / 2;
            guild.startOffset = startPos.x;
        }
        var curIndex = 0;
        if (haveCar) {
            var carOffsetX = GrainCarScroll.ROBBER_WIDTH * 1.5;
            if (userCount == 0) {
                carOffsetX = GrainCarScroll.GUILD_PADDING / 2;
            }
            guild.pos = cc.v2(startPos.x + carOffsetX, startPos.y - GrainCarScroll.ROBBER_HEIGHT);
        }
        for (let iUser in guild.data) {
            var user = guild.data[iUser];
            if (parseInt(iUser) == 1) {
                guild.startOffset = startPos.x;
            }
            if (haveCar && parseInt(iUser) == 5) {
                curIndex = curIndex + 1;
            } else if (haveCar && parseInt(iUser) == 7) {
                curIndex = curIndex + 1;
            }
            var columnUser = Math.floor(curIndex / GrainCarScroll.LINE_NUM);
            var modUser = curIndex % GrainCarScroll.LINE_NUM;
            user.pos = cc.v2(startPos.x + columnUser * GrainCarScroll.ROBBER_WIDTH, startPos.y - modUser * GrainCarScroll.ROBBER_HEIGHT);
            this._userData['k' + user.id].pos = user.pos;
            curIndex = curIndex + 1;
            if (iUser == guild.data.length) {
                if (haveCar) {
                    columnUser = Math.max(columnUser, 2);
                }
                nextStartPos = cc.v2(startPos.x + columnUser * GrainCarScroll.ROBBER_WIDTH + GrainCarScroll.GUILD_PADDING, 400);
                guild.endOffset = nextStartPos.x - GrainCarScroll.GUILD_PADDING / 2;
            }
        }
        return nextStartPos;
    }
    _getTotalWidth() {
        var lastGuild = this._guildData[this._guildData.length];
        if (!lastGuild) {
            return GrainCarScroll.GUILD_PADDING;
        }
        var width = lastGuild.endOffset + GrainCarScroll.GUILD_PADDING;
        return Math.max(width, this._scrollSize.width);
    }
    _findMe() {
        if (this._guildData.length == 0) {
            return;
        }
        var firstGuildId = this._guildData[0].id;
        if (GrainCarDataHelper.isMyGuild(firstGuildId)) {
            var windowWidth = this._scrollSize.width;
            var pos = this._guildData[0].endOffset;
            if (this._scrollView.content.getContentSize().width == windowWidth) {
                this._scrollView.scrollToPercentHorizontal(0, 0.5, true);
            } else {
                var percent = 100 * (pos - windowWidth / 2) / (this._scrollView.content.getContentSize().width - windowWidth);
                this._scrollView.scrollToPercentHorizontal(percent, 0.5, true);
            }
        }
    }
    _findFocusedGuild() {
        var windowWidth = this._scrollSize.width;
        if (this._scrollView.content.getContentSize().width <= windowWidth) {
            this._scrollView.content.setPosition(cc.v2(-1, 0));
        } else {
            var scrollX = this._userCenterX - windowWidth / 2;
            if (scrollX < 0) {
                scrollX = -1;
            } else if (scrollX > this._scrollView.content.getContentSize().width - windowWidth) {
                scrollX = this._scrollView.content.getContentSize().width - windowWidth;
            }
            this._scrollView.content.setPosition(cc.v2(-scrollX, 0));
        }
    }
    _getUserCenterX() {
        if (this._curAtkGuild) {
            for (let iGuild in this._guildData) {
                var guild = this._guildData[iGuild];
                if (this._curAtkGuild.id == guild.id) {
                    return guild.pos.x;
                }
            }
        }
        var guild = this._curGuild;
        if (guild.data.length == 0) {
            return guild.startOffset;
        }
        var minDistance = this._scrollView.content.getContentSize().width;
        var posX = 0;
        for (let iUser in guild.data) {
            var user = guild.data[iUser];
            if (this._isInView(user.pos.x)) {
                var distance = this._distance2Center(user.pos.x);
                if (distance < minDistance) {
                    minDistance = distance;
                    posX = user.pos.x;
                }
            }
        }
        return posX;
    }
    _resetAtkGuild() {
        if (this._curAtkGuild && this._curAtkGuild.haveCar && this._isTouched()) {
            if (!this._isInView(this._curAtkGuild.pos.x) || this._curAtkGuild.car.getStamina() <= 0) {
                this._curAtkGuild = null;
            }
        }
    }
    _refreshAvatarPos() {
        this._refreshAvatarOutView();
        this._refreshAvatarInView();
        this._refreshCarAvatarOutView();
        this._refreshCarAvatarInView();
    }
    _refreshAvatarOutView() {
        for (let key in this._avatarUsedPool) {
            var avatar = this._avatarUsedPool[key];
            var user = this._userData[key];
            if (this._isInView(avatar.node.x)) {
                avatar.node.setPosition(user.pos);
            } else {
                this._removeAvatarFromUsedPool(key);
                user.avatar = null;
            }
        }
    }
    _refreshCarAvatarOutView() {
        for (let key in this._carUsedPool) {
            var carAvatar = this._carUsedPool[key];
            var guild = this._guildHashData[key];
            if (this._isInView(carAvatar.node.x)) {
                carAvatar.node.setPosition(guild.pos);
            } else {
                this._removeCarAvatarFromUsedPool(key);
                guild.avatar = null;
            }
        }
    }
    _refreshAvatarInView() {
        var refreshAvatarWithGuild = function (guild) {
            for (let iUser in guild.data) {
                var user = guild.data[iUser];
                if (this._isInView(user.pos.x) && user.avatar == null) {
                    var avatar = this._getAvatarUnused();
                    avatar.updateAvatar(user.mineUser);
                    user.avatar = avatar;
                    avatar.node.setPosition(user.pos);
                    if (guild.isMine) {
                        avatar.faceRight();
                    } else {
                        avatar.faceLeft();
                    }
                    var key = 'k' + user.id;
                    this._addAvatarUsedPool(key, avatar);
                } else if (this._isInView(user.pos.x) && user.isDirty) {
                    user.avatar.updateAvatar(user.mineUser);
                    if (guild.isMine) {
                        user.avatar.faceRight();
                    } else {
                        user.avatar.faceLeft();
                    }
                }
            }
        }.bind(this);
        var minDistance = this._scrollView.content.getContentSize().width;
        for (let iGuild in this._guildData) {
            var guild = this._guildData[iGuild];
            if (this._isInView(guild.startOffset) || this._isInView(guild.endOffset) || this._guildIsInView(guild)) {
                refreshAvatarWithGuild(guild);
                var distance = this._guild2Center(guild);
                if (distance < minDistance && !this._bLockCurGuild) {
                    this._curGuild = guild;
                    minDistance = distance;
                }
            }
        }
    }
    _refreshCarAvatarInView() {
        var refreshCarAvatarWithGuild =function (guild) {
            if (this._isInView(guild.pos.x) && guild.avatar == null) {
                var avatar:PopupGrainCarAvatar = this._getCarAvatarUnused();
                avatar.updateUI(guild.car);
                guild.avatar = avatar;
                avatar.node.setPosition(guild.pos);
                if (guild.isMine) {
                    avatar.faceRight();
                } else {
                    avatar.faceLeft();
                }
                var key = 'k' + guild.id;
                this._addCarAvatarUsedPool(key, avatar);
            } else if (this._isInView(guild.pos.x) && guild.isDirty) {
                guild.isDirty = false;
                guild.avatar.updateUI(guild.car);
                if (guild.isMine) {
                    guild.avatar.faceRight();
                } else {
                    guild.avatar.faceLeft();
                }
            }
        }.bind(this);
        for (let iGuild in this._guildData) {
            var guild = this._guildData[iGuild];
            if (this._isInView(guild.pos.x) && guild.haveCar) {
                refreshCarAvatarWithGuild(guild);
            }
        }
    }
    _guild2Center(guild) {
        var start2Center = this._distance2Center(guild.startOffset);
        var end2Center = this._distance2Center(guild.endOffset - GrainCarScroll.GUILD_PADDING / 2);
        if (guild.isMine) {
            end2Center = this._distance2Center(guild.endOffset);
        }
        return Math.min(start2Center, end2Center);
    }
    _guildIsInView(guild) {
        var scorllPos = this._scrollView.content.getPosition();
        var windowX = Math.abs(scorllPos.x);
        var centerX = windowX + this._scrollSize.width / 2;
        return centerX > guild.startOffset && centerX < guild.endOffset;
    }
    _isInView(offsetX) {
        var scorllPos = this._scrollView.content.getPosition();
        var windowX = Math.abs(scorllPos.x);
        return offsetX > windowX - GrainCarScroll.SCROLL_INVIEW_PADDING && offsetX < windowX + this._scrollView.node.getContentSize().width + GrainCarScroll.SCROLL_INVIEW_PADDING;
    }
    _distance2Center(offsetX) {
        var scorllPos = this._scrollView.content.getPosition();
        var windowX = Math.abs(scorllPos.x);
        var centerX = windowX + this._scrollSize.width / 2;
        return Math.abs(offsetX - centerX);
    }
    //添加角色到池子中
    _addAvatarPool(avatar: PopupGrainCarRobber) {
        avatar.node.active = (false);
        table.insert(this._avatarUnusedPool, avatar);
    }
    //获取没有被使用的角色
    _getAvatarUnused() {
        var lastIndex = this._avatarUnusedPool.length;
        var avatar = this._avatarUnusedPool[lastIndex-1];
        this._avatarUnusedPool.splice(lastIndex-1)
        avatar.node.active = (true);
        return avatar;
    }
    //添加角色到使用的池子中
    _addAvatarUsedPool(key, avatar:PopupGrainCarRobber) {
        this._avatarUsedPool[key] = avatar;
    }
    //从使用的池子中移除角色
    _removeAvatarFromUsedPool(key) {
        this._addAvatarPool(this._avatarUsedPool[key]);
        this._avatarUsedPool.splice(key,1);
    }
    //添加车角色
    _addCarAvatarPool(carAvatar:PopupGrainCarAvatar) {
        carAvatar.node.active = (false);
        table.insert(this._carUnusedPool, carAvatar);
    }
    //获取没有被使用的车角色
    _getCarAvatarUnused():PopupGrainCarAvatar {
        var lastIndex = this._carUnusedPool.length;
        var avatar = this._carUnusedPool[lastIndex-1];
        this._carUnusedPool.splice(lastIndex-1,1)
        avatar.node.active = (true);
        return avatar;
    }
    //添加车角色到使用的池子中
    _addCarAvatarUsedPool(key, avatar:PopupGrainCarAvatar) {
        this._carUsedPool[key] = avatar;
    }//从使用的车角色池子中移除车角色
    _removeCarAvatarFromUsedPool(key) {
        this._addCarAvatarPool(this._carUsedPool[key]);
        this._carUsedPool.splice(key,1);
    }
    _refreshBg() {
        var pos = this._scrollView.content.getPosition();
        var windowIndex = Math.ceil(Math.abs(pos.x) / GrainCarScroll.BG_WIDTH);
        if (windowIndex != this._windowIndex) {
            this._windowIndex = windowIndex;
            this._bgList[0].node.setPosition(cc.v2(this._scrollSize.width / 2 + GrainCarScroll.BG_WIDTH * (windowIndex - 2), this._scrollSize.height / 2));
            this._bgList[1].node.setPosition(cc.v2(this._scrollSize.width / 2 + GrainCarScroll.BG_WIDTH * (windowIndex - 1), this._scrollSize.height / 2));
            this._bgList[2].node.setPosition(cc.v2(this._scrollSize.width / 2 + GrainCarScroll.BG_WIDTH * windowIndex, this._scrollSize.height / 2));
        }
    }
    _addGesture(gesture) {
        if (gesture == GESTURE_TOUCH_BEGAN) {
            if (this._gestureList.length == 0) {
                this._gestureList[0] = GESTURE_TOUCH_BEGAN;
            }
        } else if (gesture == GESTURE_TOUCH_MOVE) {
            if (this._gestureList[0] == GESTURE_TOUCH_BEGAN && !this._gestureList[1]) {
                this._gestureList[1] = GESTURE_TOUCH_MOVE;
            }
        } else if (gesture == GESTURE_TOUCH_END) {
            if (this._gestureList[0] == GESTURE_TOUCH_BEGAN && this._gestureList[1] == GESTURE_TOUCH_MOVE) {
                this._gestureList[2] = GESTURE_TOUCH_END;
            }
        }
    }
    _isTouched() {
        return this._gestureList.length > 0;
    }
    _resetGesture() {
        this._gestureList = [];
    }
    _stopGestureTimer() {
        if (this._scheduleGestureHandler != null) {
            this.unschedule(this._scheduleGestureHandler);
            this._scheduleGestureHandler = null;
        }
    }
    _onButtonClose() {
        this.node.removeFromParent();
    }
    _moveLayerTouch(sender, event) {
        if (event == 9) {
            this._refreshAvatarPos();
            this._refreshBg();
            this._bLockCurGuild = false;
        } else if (event == 10) {
            if (this._isTouched()) {
                this._resetGesture();
                if (this._isDirty) {
                    this._isDirty = false;
                    this.updateLayout();
                }
            }
        }
    }
    _onTouchScroll(sender, state) {
        if (state == cc.ScrollView.EventType.SCROLL_BEGAN) {
            this._addGesture(GESTURE_TOUCH_BEGAN);
            this._stopGestureTimer();
        } else if (state == cc.ScrollView.EventType.SCROLLING) {
            this._addGesture(GESTURE_TOUCH_MOVE);
            this._resetAtkGuild();
        } else if (state == cc.ScrollView.EventType.SCROLL_ENDED) {
            this._addGesture(GESTURE_TOUCH_END);
            this._stopGestureTimer();
            this._scheduleGestureHandler = handler(this, this._gestureTimer)
            this.scheduleOnce(this._scheduleGestureHandler, 1);
        }
    }
    _gestureTimer() {
        if (this._isTouched()) {
            this._resetGesture();
            if (this._isDirty) {
                this._isDirty = false;
                this.updateLayout();
            }
        }
    }
};