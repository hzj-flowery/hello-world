import { G_SignalManager, G_ResolutionManager, G_EffectGfxMgr, G_UserData } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import BigImagesNode from "../../../utils/BigImagesNode";
import { Path } from "../../../utils/Path";
import ViewBase from "../../ViewBase";
import QinTombTeamAvatar from "./QinTombTeamAvatar";
import QinTombMonsterAvatar from "./QinTombMonsterAvatar";
import { QinTombHelper } from "./QinTombHelper";
import { QinTombConst } from "../../../const/QinTombConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QinTombBattleMapNode extends ViewBase {

    @property({ type: cc.ScrollView, visible: true })
    _scrollView: cc.ScrollView = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    _qinTombTeamAvatarPrefab: cc.Prefab = null;

    @property({ type: cc.Prefab, visible: true })
    _qinTombMonsterAvatarPrefab: cc.Prefab = null;

    private static MAX_WHEEL_NODE_NUM = 6
    private static GRID_WIDTH = 60
    private static GRID_HEIGHT = 60
    private static MAX_SCALE = 1
    private static MIN_SCALE = 0.7
    private static CAMERA_SPEED = 2200
    private static TEAM_KEY = "team"
    private static MONSTER_KEY = "monster"


    private _cityId;
    private _avatarTeamMap: { [key: number]: QinTombTeamAvatar };
    private _avatarMonsterMap: { [key: number]: QinTombMonsterAvatar };
    private _cameraKey;
    private _isLockCamera;
    private _moveSignNodeList: { [key: string]: cc.Node }

    private _signalUpdateGrave;
    private _signalDeleteGrave;
    private _signalGraveSyncAttackPlayer;
    private _signalQinTeamAvatarStateChange;
    private _signalQinSelfTeamMoveEnd;
    private _signalEnterGraveScene;

    public init(cityId) {
        this._cityId = cityId;
    }

    public onCreate() {
        this._avatarTeamMap = {};
        this._avatarMonsterMap = {};
        this._createMap();
        this._createMoveSignNodes();
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, handler(this, this._onScrollViewTouchCallBack));
        (this._panelTouch as any)._touchListener.setSwallowTouches(false);
        this._scrollView.enabled = false;
    }

    public onEnter() {
        this._signalUpdateGrave = G_SignalManager.add(SignalConst.EVENT_UPDATE_GRAVE, handler(this, this._onEventUpdateGrave));
        this._signalDeleteGrave = G_SignalManager.add(SignalConst.EVENT_DELETE_GRAVE, handler(this, this._onEventDeleteGrave));
        this._signalGraveSyncAttackPlayer = G_SignalManager.add(SignalConst.EVENT_GRAVE_SYNC_ATTCK_PLAYER, handler(this, this._onEventGraveSyncAttackPlayer));
        this._signalQinTeamAvatarStateChange = G_SignalManager.add(SignalConst.EVENT_GRAVE_TEAM_AVATAR_STATE_CHANGE, handler(this, this._onEventQinTeamAvatarStateChange));
        this._signalQinSelfTeamMoveEnd = G_SignalManager.add(SignalConst.EVENT_GRAVE_SELF_TEAM_MOVE_END, handler(this, this._onEventQinSelfTeamMoveEnd));
        this._signalEnterGraveScene = G_SignalManager.add(SignalConst.EVENT_GRAVE_ENTER_SCENE, handler(this, this._onEventEnterGraveScene));
        this._updateTeamList();
        this._updateMonsterList();
        this._refreshMoveSignNodes();
        this.updateUI();
    }

    private _onEventEnterGraveScene() {
        for (let key in this._avatarTeamMap) {
            var value = this._avatarTeamMap[key];
            this._releaseAvatar(key);
        }
        this._avatarTeamMap = {};
        this._updateTeamList();
        this._updateMonsterList();
        this._cameraKey = null;
        this.updateUI();
    }

    public onExit() {
        this._signalUpdateGrave.remove();
        this._signalUpdateGrave = null;
        this._signalDeleteGrave.remove();
        this._signalDeleteGrave = null;
        this._signalGraveSyncAttackPlayer.remove();
        this._signalGraveSyncAttackPlayer = null;
        this._signalQinTeamAvatarStateChange.remove();
        this._signalQinTeamAvatarStateChange = null;
        this._signalQinSelfTeamMoveEnd.remove();
        this._signalQinSelfTeamMoveEnd = null;
        this._signalEnterGraveScene.remove();
        this._signalEnterGraveScene = null;
    }

    private _createMap() {
        var spriteMap = new cc.Node().addComponent(BigImagesNode)
        spriteMap.setUp(Path.getStageBG('qin_bk_stage'));
        var spriteSize = spriteMap.node.getContentSize();
        spriteMap.node.setAnchorPoint(0, 0);
        spriteMap.node.setPosition(0, 0);
        this._scrollView.node.setPosition(-G_ResolutionManager.getDesignWidth() / 2, -G_ResolutionManager.getDesignHeight() / 2);
        this._scrollView.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._scrollView.content.addChild(spriteMap.node);
        this._scrollView.content.setContentSize(spriteSize);
        var effectNode = new cc.Node();
        effectNode.name = ('effectNode');
        effectNode.setPosition(2100, 1206);
        this._scrollView.content.addChild(effectNode);
        G_EffectGfxMgr.createPlayMovingGfx(effectNode, 'moving_xianqinhuangling_mapeffect', null, null, false);
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
    }

    private _createTeamAvatar(teamId) {
        var avatar = cc.instantiate(this._qinTombTeamAvatarPrefab).getComponent(QinTombTeamAvatar);
        avatar.init(teamId, this._scrollView);
        avatar.updateUI();
        avatar.node.name = (QinTombBattleMapNode.TEAM_KEY + teamId);
        this._scrollView.content.addChild(avatar.node);
        this._avatarTeamMap[teamId] = avatar;
        return avatar;
    }

    public makeClickRect() {
        var retList = G_UserData.getQinTomb().getPointRectList();
        for (let i in retList) {
            var value = retList[i];
            var clickRectWidget = new cc.Node();
            clickRectWidget.color = cc.color(255, 0, 0);
            clickRectWidget.opacity = 60;
            clickRectWidget.setContentSize(value.width, value.height);
            clickRectWidget.setPosition(value.x, value.y);
            this._scrollView.content.addChild(clickRectWidget);
        }
    }

    private _createMonsterAvatar(monsterPoint): QinTombMonsterAvatar {
        var avatar = cc.instantiate(this._qinTombMonsterAvatarPrefab).getComponent(QinTombMonsterAvatar);
        avatar.init(monsterPoint, this._scrollView);
        avatar.updateUI();
        avatar.node.name = (QinTombBattleMapNode.MONSTER_KEY + monsterPoint);
        return avatar;
    }

    private _onScrollViewTouchCallBack(sender: cc.Touch, state) {
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            var endPos = this._scrollView.content.convertToNodeSpaceAR(sender.getLocation());
            var clickPoint = G_UserData.getQinTomb().findPointKey(endPos);
            var selfTeam = G_UserData.getQinTomb().getSelfTeam();
            if (QinTombHelper.checkTeamLeaveBattle(selfTeam, clickPoint)) {
                return;
            }
            if (QinTombHelper.checkTeamCanMoving(selfTeam, clickPoint)) {
                QinTombHelper.movingTeam(selfTeam.getTeamId(), clickPoint);
            }
        }
    }

    private _releaseAvatar(teamId) {
        var avatarTeam = this._avatarTeamMap[teamId];
        if (avatarTeam) {
            avatarTeam.releaseSelf();
            delete this._avatarTeamMap[teamId]
        }
    }

    public getTeamAvatar(teamId): QinTombTeamAvatar {
        if (teamId && teamId > 0) {
            var teamAvatar = this._avatarTeamMap[teamId];
            return teamAvatar;
        }
        return null;
    }

    public getMonsterAvatar(point): QinTombMonsterAvatar {
        var monsterAvatar = this._avatarMonsterMap[point];
        if (monsterAvatar == null) {
            monsterAvatar = this._createMonsterAvatar(point);
            this._scrollView.content.addChild(monsterAvatar.node);
            this._avatarMonsterMap[point] = monsterAvatar;
        }
        return monsterAvatar;
    }

    private _updateMonsterList() {
        var monsterList = G_UserData.getQinTomb().getMonsterList();
        for (let i in monsterList) {
            var value = monsterList[i];
            var monster = this.getMonsterAvatar(value.getPoint_id());
            if (monster) {
                monster.synServerInfo();
            }
        }
    }

    public updateUI(monsterKey?) {
        this._updateMonsterHp(monsterKey);
        this._updateAvatarInTheCamera();
        var selfTeam = G_UserData.getQinTomb().getSelfTeam();
        if (selfTeam == null) {
            return;
        }
        if (selfTeam.getCurrState() != QinTombConst.TEAM_STATE_DEATH) {
            if (this._isInMonsterPoint() == false) {
                this.gotoMyPosition(false);
            }
        }
    }

    private _updateMonsterHp(monsterKey) {
        if (monsterKey == null) {
            return;
        }
        var monsterList = G_UserData.getQinTomb().getMonsterList();
        for (let i in monsterList) {
            var value = monsterList[i];
            var monster = this.getMonsterAvatar(value.getPoint_id());
            if (monster) {
                if (value.getPoint_id() == monsterKey) {
                    monster.updateHp();
                    monster.setMonsterVisible(true);
                }
                else{
                    monster.setMonsterVisible(false);
                }
            }
        }
    }

    private _updateAvatarInTheCamera() {
        var [cameraPos, cameraSize] = this.getCameraPos();
        var teamList = G_UserData.getQinTomb().getTeamListEx();
        var maxViewSize = 30;
        for (let i in teamList) {
            var value = teamList[i];
            var teamAvatar = this.getTeamAvatar(value.getTeamId());
            if (teamAvatar) {
                if (teamAvatar.isStateVisible()) {
                    var teamPos = cc.v2(teamAvatar.node.getPosition());
                    var cameraRect = cc.rect(-cameraPos.x, -cameraPos.y, cameraSize.width, cameraSize.height);
                    if (cameraRect.contains(teamPos) && maxViewSize > 0) {
                        teamAvatar.setAvatarModelVisible(true);
                        maxViewSize = maxViewSize - 1;
                    }
                }
                else{
                    teamAvatar.setAvatarModelVisible(false);
                }
            }
        }
    }

    public getMonsterInTheCamera(cameraPos, cameraSize) {
        var monsterList = G_UserData.getQinTomb().getMonsterList();
        for (let i in monsterList) {
            var value = monsterList[i];
            var monster = this.getMonsterAvatar(value.getPoint_id());
            if (monster) {
                var monsterPos = cc.v2(monster.node.getPosition());
                var cameraRect = cc.rect(-cameraPos.x, -cameraPos.y, cameraSize.width, cameraSize.height);
                if (cameraRect.contains(monsterPos)) {
                    return value.getPoint_id();
                }
            }
        }
        return null;
    }

    private _updateTeamList() {
        var teamList = G_UserData.getQinTomb().getTeamList();
        for (let i in teamList) {
            var value = teamList[i];
            var teamAvatar = this.getTeamAvatar(value.getTeamId());
            if (teamAvatar == null) {
                teamAvatar = this._createTeamAvatar(value.getTeamId());
            }
            if (teamAvatar) {
                teamAvatar.synServerInfo();
            }
        }
    }

    private _getMyAvatar() {
        var myTeamId = G_UserData.getQinTomb().getSelfTeamId();
        return this._avatarTeamMap[myTeamId];
    }

    private _cameraLock(lock) {
        if (lock) {
            this._isLockCamera = true;
        } else {
            this._isLockCamera = false;
        }
    }

    private _cameraMoveToPos(x, y) {
        if (this._isLockCamera) {
            return;
        }
        this._scrollView.content.stopAllActions();
        var dstX = x, dstY = y;
        var distance = cc.pGetDistance(this._scrollView.content.getPosition(), cc.v2(dstX, dstY));
        var time = distance / QinTombBattleMapNode.CAMERA_SPEED;
        var moveAction = cc.moveTo(time, cc.v2(dstX, dstY));
        var callFuncAction = cc.callFunc(function () {
            this._cameraLock(false);
        }.bind(this));
        var action = cc.sequence(moveAction, callFuncAction);
        this._scrollView.content.runAction(action);
        this._cameraLock(true);
    }

    public getSelfTeamPos() {
        var selfTeam = G_UserData.getQinTomb().getSelfTeamId();
        var teamAvatar = this.getTeamAvatar(selfTeam);
        if (teamAvatar) {
            return teamAvatar.node.getPosition();
        }
        return null;
    }

    public getCameraPos(): [cc.Vec2, cc.Size] {
        return [
            cc.v2(this._scrollView.content.getPosition()),
            this._scrollView.node.getContentSize()
        ];
    }

    private _isInMonsterPoint() {
        var selfTeam = G_UserData.getQinTomb().getSelfTeam();
        if (selfTeam == null) {
            return;
        }
        var cameraKey = selfTeam.getCameraKey();
        if (cameraKey && cameraKey > 0) {
            var position = QinTombHelper.getMidPoint(cameraKey + 100)[0];
            var cameraPos = this.getCameraPos()[0];
            var [scrollX, scrollY] = this._cameraPosConvert(position.x, position.y);
            if (cameraPos.x != scrollX && cameraPos.y != scrollY) {
                this._cameraMoveToPos(scrollX, scrollY);
            }
            this._cameraKey = cameraKey;
            return true;
        } else {
            if (this._cameraKey && this._cameraKey > 0) {
                var cameraPos = this.getCameraPos()[0];
                var avatar = this._getMyAvatar();
                // var avatarX = avatar.getPosition(), avatarY;
                this.gotoMyPosition(true);
                this._cameraKey = null;
                return true;
            }
        }
        return false;
    }

    private _cameraPosConvert(startX, startY) {
        var x = startX, y = startY;
        var currScale = this._scrollView.content.scale;
        var size = this._scrollView.content.getContentSize();
        var scrollX = -(x * currScale - G_ResolutionManager.getDesignWidth() * 0.5);
        var scrollY = -(y * currScale - G_ResolutionManager.getDesignHeight() * 0.5);
        // var scrollX = -(x * currScale);
        // var scrollY = -(y * currScale);
        scrollX = Math.max(Math.min(scrollX, 0), -(size.width - G_ResolutionManager.getDesignWidth()));
        scrollY = Math.max(Math.min(scrollY, 0), -(size.height - G_ResolutionManager.getDesignHeight()));
        return [
            scrollX,
            scrollY
        ];
    }

    public gotoMyPosition(useCamera) {
        if (this._isLockCamera) {
            return;
        }
        var avatar = this._getMyAvatar();
        if (avatar) {
            var myTeam = G_UserData;
            var [scrollX, scrollY] = this._cameraPosConvert(avatar.node.x, avatar.node.y);
            if (useCamera == null) {
                useCamera = true;
            }
            if (useCamera) {
                this._cameraMoveToPos(scrollX, scrollY);
            } else {
                var cameraPosX = Math.floor(scrollX), cameraPosY = Math.floor(scrollY);
                this._scrollView.content.setPosition(cameraPosX, cameraPosY);
            }
        }
    }

    private _hideSignNodes() {
        if (this._moveSignNodeList) {
            for (let key in this._moveSignNodeList) {
                var node = this._moveSignNodeList[key];
                node.active = (false);
            }
        }
    }

    private _refreshMoveSignNodes() {
        var selfTeam = G_UserData.getQinTomb().getSelfTeam();
        if (selfTeam == null) {
            return;
        }
        var currKey = selfTeam.getCurrPointKey();
        if (currKey == null) {
            return;
        }
        for (let key in this._moveSignNodeList) {
            var node = this._moveSignNodeList[key];
            node.active = (false);
        }
        var pointList = QinTombHelper.getMoveSignKey(currKey);
        for (let i = 0; i < pointList.length; i++) {
            var pointCfg = pointList[i];
            var effectNode = this._moveSignNodeList['k' + pointCfg.point_id];
            if (effectNode) {
                effectNode.active = (true);
            }
        }
    }

    private _createMoveSignNodes() {
        this._moveSignNodeList = {};
        var pointList = QinTombHelper.getMoveSignKeyList();
        for (let i = 0; i < pointList.length; i++) {
            var effectNode = G_EffectGfxMgr.createPlayMovingGfx(this._scrollView.content, 'moving_xianqinhuangling_jiantou', null, null, false).node;
            effectNode.active = (false);
            var pointCfg = pointList[i];
            var midPoint = QinTombHelper.getMidPoint(pointCfg.point_id)[0];
            effectNode.setPosition(midPoint);
            effectNode.name = ('jiantou' + pointCfg.point_id);
            this._moveSignNodeList['k' + pointCfg.point_id] = effectNode;
        }
    }

    private _onEventGuildWarBattleGoCampNotice(event, userData) {
        if (userData && userData.isSelf()) {
            this.gotoMyPosition(true);
        }
    }

    private _onEventDeleteGrave(id, teamId) {
        if (teamId && teamId > 0) {
            this._releaseAvatar(teamId);
        }
    }

    private _syncTeamServerInfo(teamId) {
        if (teamId && teamId > 0) {
            var teamData = G_UserData.getQinTomb().getTeamById(teamId);
            if (teamData == null) {
                return;
            }
            var teamAvatar = this.getTeamAvatar(teamId);
            if (teamAvatar == null) {
                teamAvatar = this._createTeamAvatar(teamId);
            }
            if (teamAvatar) {
                teamAvatar.updateUI();
                teamAvatar.synServerInfo();
            }
        }
    }

    private _onEventGraveSyncAttackPlayer(id, syncTable) {
        if (syncTable.oldTeamId > 0) {
            this._syncTeamServerInfo(syncTable.oldTeamId);
        }
        if (syncTable.oldBattleId > 0) {
            this._syncTeamServerInfo(syncTable.oldBattleId);
        }
        if (syncTable.newTeamId > 0) {
            this._syncTeamServerInfo(syncTable.newTeamId);
        }
        if (syncTable.newBattleId > 0) {
            this._syncTeamServerInfo(syncTable.newBattleId);
        }
    }

    private _onEventUpdateGrave(id, teamId, monsterId) {
        if (teamId && teamId > 0) {
            this._syncTeamServerInfo(teamId);
        }
        if (monsterId && monsterId > 0) {
            var monsterAvatar = this.getMonsterAvatar(monsterId);
            if (monsterAvatar) {
                monsterAvatar.updateUI();
                monsterAvatar.synServerInfo();
            }
        }
    }

    private _onEventQinTeamAvatarStateChange(event, userData, newState, oldState, node) {
        if (oldState == QinTombTeamAvatar.RUN_STATE && newState == QinTombTeamAvatar.STAND_STATE) {
            if (userData && userData.isSelf()) {
                this._refreshMoveSignNodes();
            }
        } else {
            if (userData && userData.isSelf()) {
                this._hideSignNodes();
            }
        }
    }

    private _onEventQinSelfTeamMoveEnd(event, id) {
        var cacheKey = G_UserData.getQinTomb().getCacheNextKey();
        if (cacheKey) {
            var selfTeam = G_UserData.getQinTomb().getSelfTeam();
            if (QinTombHelper.checkTeamCanMoving(selfTeam, cacheKey)) {
                QinTombHelper.movingTeam(selfTeam.getTeamId(), cacheKey);
            }
            G_UserData.getQinTomb().clearCacheNextKey();
        }
    }
}