import ViewBase from "../../ViewBase";
import { GuildCrossWarConst } from "../../../const/GuildCrossWarConst";
import { G_ServerTime, G_UserData, G_EffectGfxMgr } from "../../../init";
import { handler } from "../../../utils/handler";
import { GuildCrossWarHelper } from "./GuildCrossWarHelper";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { CurveHelper } from "../../../utils/CurveHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildCrossWarAvatar extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePlatform: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRole: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRebornEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatar: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageProc: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _monsterBlood3: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _monsterBlood2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _monsterBlood1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _percentText: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _bloodNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _touchPanel: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _avatarName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _avatarGuild: cc.Label = null;
    _commonHeroAvatar: any;
    _panelbk: any;
    _swordEffect: any;
    _swordEfcPanel: any;
    _swordPanel: any;
    _unitId: any;
    _touchCallback: any;
    _curPointId: number;
    _moving: boolean;
    _userData: any;
    _monsterBlood: any;
    _avatarTitle: any;
    _cameraFollow: any;
    _lastPathCallBack: any;
    _movePathList: any;


    ctor(unitId, touchCallback) {
        this._commonHeroAvatar = null;
        this._panelbk = null;
        this._swordEffect = null;
        this._swordEfcPanel = null;
        this._swordPanel = null;
        this._unitId = unitId;
        this._touchCallback = touchCallback;
        this._curPointId = 0;
        this._moving = false;
    }
    onCreate() {
        this._updateUnitData();
        this._createSwordEffect();
        this._initSwallowTouches();
        this.node.active = (true);
        this._touchPanel.active = (false);
        this._swordPanel.addClickEventListenerEx(handler(this, this.onAttackHero));
    }
    onEnter() {
    }
    onExit() {
    }
    _initSwallowTouches() {
        // this._nodeRole.setSwallowTouches(false);
        // this._swordEfcPanel.setSwallowTouches(false);
        // this._imageProc.setSwallowTouches(false);
        // this._monsterBlood.setSwallowTouches(false);
        // this._avatarTitle.setSwallowTouches(false);
        // this._avatarName.setSwallowTouches(false);
        // this._avatarGuild.setSwallowTouches(false);
    }
    _createSwordEffect() {
        // var EffectGfxNode = require('EffetGfxNode');
        function effectFunction(effect) {
        }
        this._swordEffect = G_EffectGfxMgr.createPlayMovingGfx(this._swordEfcPanel, 'moving_shuangjian', null, null, false);
        this._swordEffect.node.setPosition(0, 0);
        this._swordEffect.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this._swordEffect.node.active = (false);
        this._swordPanel.setVisible(false);
    }
    onClickHero() {
        // print('GuildCrossWarAvatar:onClickHero');
        this._updateUnitData();
        if (this._userData == null || this._userData.getCurPointHole() == null) {
            return;
        }
        if (this._userData.getCurrState() != GuildCrossWarConst.UNIT_STATE_IDLE) {
            return;
        }
        if (this._touchCallback) {
            var posX = this.node.getPosition().x;
            var posY = this.node.getPosition().y;
            this._touchCallback(this._userData.getCurPointHole(), posX, posY);
        }
    }
    onAttackHero() {
        G_UserData.getGuildCrossWar().c2sBrawlGuildsFight(this._userData.getUid());
    }
    playRebornAction(callback, updateCallback) {
        var curTime = G_ServerTime.getTime();
        var time = this._userData.getRevive_time();
        var leftTime = Math.max(0.01, time - curTime);
        var seq = cc.sequence(cc.callFunc(function () {
            this._commonHeroAvatar.setAction('dizzy', false);
        }), cc.delayTime(1), cc.fadeOut(0.2), cc.callFunc(function () {
            this._synPosition();
            if (callback) {
                callback();
            }
        }), cc.delayTime(2), cc.callFunc(handler(this, this._playAvatarBornEffect)), cc.fadeIn(0.1), cc.callFunc(function () {
            this._commonHeroAvatar.setAction('idle', true);
            this._userData.setHp(this._userData.getMax_hp());
            this.updateAvatarHp();
            if (updateCallback) {
                updateCallback();
            }
        }));
        this._nodeRole.stopAllActions();
        this._nodeRole.runAction(seq);
    }
    getCurState() {
        return this._userData.getCurrState();
    }
    setAvatarModelVisible(visible) {
        visible = visible == null && false;
    }
    showSword(bVisible) {
        if (!this._swordEffect) {
            this._createSwordEffect();
        }
        this._swordPanel.node.active = (bVisible);
        this._swordEffect.node.active = (bVisible);
    }
    _playAvatarBornEffect() {
        function effectFunction(effect) {
            // var EffectGfxNode = require('EffectGfxNode');
            // if (effect == 'effect_zm_boom') {
            //     var subEffect = new EffectGfxNode('effect_zm_boom');
            //     subEffect.play();
            //     return subEffect;
            // }
        }
        function eventFunction(event) {
            if (event == 'finish') {
            } else if (event == 'hero') {
            }
        }
        // G_EffectGfxMgr.createPlayMovingGfx(this._nodeRebornEffect, 'moving_wuchabiebuzhen_wujiang', effectFunction, eventFunction, false);
    }
    playAttackAction(attackBack) {
        var bExistBoss = this._isExistBossUnit(), bossUnit;
        if (!bExistBoss) {
            return;
        }
        // var bossCfg = bossUnit.getConfig();
        // var targetPos = GuildCrossWarHelper.getWarMapGridCenter(bossCfg.boss_place);
        // var startPos = this._userData.getCurrPointKeyPos();
        // var distance = cc.pGetDistance(cc.v2(startPos.x, startPos.y), cc.v2(targetPos.x, targetPos.y));
        // var moveTime = distance / GuildCrossWarConst.AVATAR_MOVING_RATE;
        // var newTargetPos = cc.pGoldenPoint(startPos, targetPos, GuildCrossWarConst.BOSS_AVATAR_DISTANCE);
        // var coolingTime = parseInt(GuildCrossWarHelper.getParameterContent(ParameterIDConst.GUILDCROSS_ATTACK_COOLINGTIME));
        // coolingTime = coolingTime - 0.5;
        // function rotateCallback(oldPos, newPos) {
        //     var avatarNode = this._commonHeroAvatar;
        //     if (avatarNode) {
        //         if (Math.floor(Math.abs(newPos.x - oldPos.x)) <= 1) {
        //             avatarNode.turnBack(newPos.x < newPos.x);
        //         } else {
        //             avatarNode.turnBack(newPos.x < oldPos.x);
        //         }
        //         this._commonHeroAvatar.setAction('run', true);
        //     }
        // }
        // this._moving = true;
        // this._nodeRebornEffect.removeAllChildren();
        // this._nodeRole.stopAllActions();
        // var action = cc.spawn(cc.callFunc(function () {
        //     rotateCallback(startPos, newTargetPos);
        // }), cc.sequence(cc.moveBy(moveTime, newTargetPos.sub(startPos)), cc.callFunc(function () {
        //     this._commonHeroAvatar.setAction('skill1', false);
        // }), cc.delayTime(0.5), cc.callFunc(function () {
        //     if (attackBack) {
        //         attackBack();
        //     }
        // }), cc.fadeOut(0.2), cc.moveBy(0.1, startPos.sub(newTargetPos)), cc.delayTime(0.3), cc.callFunc(handler(this, this._playAvatarBornEffect)), cc.callFunc(function () {
        //     this._moving = false;
        //     this._commonHeroAvatar.setAction('idle', true);
        // }), cc.fadeIn(0.1)));
        // this._nodeRole.runAction(action);
    }
    checkMoving() {
        return this._moving;
    }
    setMoving(isMoving) {
        this._moving = isMoving;
    }
    isAvatarModelVisible() {
        return this.isVisible();
    }
    isVisible() {
        throw new Error("Method not implemented.");
    }
    getCurPointId() {
        return this._curPointId;
    }
    _synPosition() {
        this._updateUnitData();
        var selfPosX = this.getPosition(), selfPosY;
        var gridId = GuildCrossWarHelper.getGridIdByPosition(selfPosX, selfPosY);
        if ((gridId == this._userData.getCurPointHole().pos)) {
            return;
        }
        var currPos = this._userData.getCurrPointKeyPos();
        if (currPos) {
            this.setPosition(currPos);
        }
    }
    getPosition() {
        throw new Error("Method not implemented.");
    }
    setPosition(currPos: any) {
        throw new Error("Method not implemented.");
    }
    updateUI(action) {
        this._updateAvatar();
        this._updateBaseUI();
        this.updateAvatarHp();
        this._updatePosition(action);
    }
    isSelf() {
        return this._userData.isSelf();
    }
    isSelfGuild() {
        return this._userData.isSelfGuild();
    }
    getUserId() {
        return this._userData.getUid();
    }
    getCurGrid() {
        return this._userData.getCurGrid();
    }
    _updatePosition(actionType) {
        if (!this._isExistAvatar() || !this.node.active) {
            return;
        }
        var currPos = this._userData.getCurrPointKeyPos();
        if (currPos) {
            this.setPosition(currPos);
        }
    }
    _isExistBossUnit() {
        if (!this._isExistAvatar()) {
            return [
                false,
                null
            ];
        }
        this._curPointId = this._userData.getCurPointId();
        var bossUnit = G_UserData.getGuildCrossWar().getBossUnitById(this._curPointId);
        if (bossUnit == null) {
            return [
                false,
                null
            ];
        }
        return [
            true,
            bossUnit
        ];
    }
    _isExistAvatar() {
        if (this._userData == null || typeof (this._userData) != 'object') {
            return false;
        }
        return true;
    }
    _updateAvatar() {
        if (!this._isExistAvatar() || !this.node.active) {
            return;
        }
        var unitId = this._unitId;
        if (unitId) {
            this._updateUnitData();
            var [baseId, userTable] = UserDataHelper.convertAvatarId(this._userData);
            this._commonHeroAvatar.updateAvatar(userTable);
        }
    }
    _updateBaseUI() {
        if (!this._isExistAvatar() || !this.node.active) {
            return;
        }
        this._updateTitle();
        this._avatarName.string = (this._userData.getName());
        this._avatarGuild.string = (this._userData.getGuild_name());
        var guildColor = GuildCrossWarHelper.getPlayerColor(this._userData.getUid());
        this._avatarGuild.node.color = (guildColor);
        this._avatarName.node.color = (guildColor);
    }
    updateAvatarHp() {
        this._updateUnitData();
        var percent = (100 * this._userData.getHp() / this._userData.getMax_hp()).toFixed(2);
        if (this._userData.getHp() > 0) {
            this._percentText.string = (this._userData.getHp());
        } else {
            this._percentText.string = (' ');
        }
        this._monsterBlood.setPercent(parseFloat(percent));
    }
    _updateTitle() {
        var resource = GuildCrossWarHelper.getGameTile(this._userData.getTitle());
        if (resource == null) {
            this._avatarTitle.setVisible(false);
        } else {
            this._avatarTitle.setVisible(true);
            this._avatarTitle.loadTexture(resource);
        }
    }
    _updateUnitData() {
        if (this._unitId) {
            var unitData = G_UserData.getGuildCrossWar().getUnitById(this._unitId);
            this._userData = unitData;
        }
    }
    _getAllPath() {
        var selfPosX = this.getPosition(), selfPosY;
        var finalPath = this._userData.getMovingPath(selfPosX, selfPosY);
        if (typeof (finalPath) == 'number') {
            return {};
        }
        // var path = clone(finalPath);
        // return path;
    }
    moving(cameraFollow, callback) {
        this._moving = true;
        this._userData.setReachEdge(false);
        this._userData.setMoving(true);
        this._cameraFollow = cameraFollow || null;
        this._lastPathCallBack = callback || null;
        this._commonHeroAvatar.setAction('run', true);
        this._doMoveAvatar();
    }
    _doMoveAvatar() {
        this._updateUnitData();
        var selfPosX = this.getPosition(), selfPosY;
        var finalPath = this._userData.getMovingPath(selfPosX, selfPosY);
        var cameraPath = this._userData.getCameraPath();
        if (typeof (finalPath) == 'number') {
            return;
        }
        var curveLine = {};
        this._movePathList = finalPath;
        if (this._cameraFollow) {
            this._cameraFollow(cameraPath);
        }
        this._loopMoveAvatar();
    }
    _loopMoveAvatar() {
        if (this._movePathList && this._movePathList.length > 0) {
            var path = this._movePathList[1];
            this._moveAvatar(path);
            // table.remove(this._movePathList, 1);
        } else {
            this._commonHeroAvatar.setAction('idle', true);
            this._userData.setReachEdge(true);
            this._userData.setMoving(false);
            this._moving = false;
            if (this._lastPathCallBack) {
                this._lastPathCallBack();
            }
            if (GuildCrossWarHelper.isOriPoint(this._userData.getCurPointId())) {
                this._userData.setHp(this._userData.getMax_hp());
                this.updateAvatarHp();
            }
        }
    }
    _moveAvatar(path) {
        var curveConfigList = path.curLine;
        var totalTime = path.totalTime * 1000;
        var endTime = G_ServerTime.getMSTime() + path.totalTime * 1000;
        function movingEnd() {
            this._loopMoveAvatar();
        }
        function rotateCallback(angle, oldPos, newPos) {
            var avatarNode = this._commonHeroAvatar;
            if (avatarNode) {
                if (Math.floor(Math.abs(newPos.x - oldPos.x)) <= 1) {
                    avatarNode.turnBack(newPos.x < newPos.x);
                } else {
                    avatarNode.turnBack(newPos.x < oldPos.x);
                }
            }
            var posY = this.getPositionY();
            this.setLocalZOrder(GuildCrossWarConst.UNIT_ZORDER - posY);
        }
        function moveCallback(newPos, oldPos) {
            this.setPosition(newPos);
        }
        CurveHelper.doCurveMove(this, movingEnd, rotateCallback, moveCallback, curveConfigList, totalTime, endTime);
    }
    isStateVisible() {
        var serverState = this._userData.getCurrState();
        if (serverState == GuildCrossWarConst.UNIT_STATE_MOVING) {
            return true;
        }
        if (serverState == GuildCrossWarConst.UNIT_STATE_IDLE) {
            return true;
        }
        return false;
    }
    synServerPos() {
        if (!this.node.active) {
            return;
        }
        this._synPosition();
        this._commonHeroAvatar.setAction('idle', true);
    }

}