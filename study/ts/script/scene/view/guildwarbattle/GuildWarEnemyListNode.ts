import ViewBase from "../../ViewBase";
import { G_SignalManager, G_UserData, G_ServerTime, Colors } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import GuildWarRunAvatorNode from "./GuildWarRunAvatorNode";
import { GuildWarDataHelper } from "../../../utils/data/GuildWarDataHelper";
import { GuildWarConst } from "../../../const/GuildWarConst";
import { GuildWarCheck } from "../../../utils/logic/GuildWarCheck";
import { Lang } from "../../../lang/Lang";
import { Util } from "../../../utils/Util";
import GuildWarEnemyItemCell from "./GuildWarEnemyItemCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarEnemyListNode extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrowBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeContent: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelList: cc.Node = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCdTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPointName: cc.Label = null;

    public static readonly REFRESH_CD = 3;
    _cityId: any;
    _pointId: any;
    _listData: any[];
    _reportInfo: any;
    _isFold: boolean;
    _lastRefreshTime: number;
    _roleInPoint: boolean;
    _pointChanged: boolean;
    _buildConfig: any;
    _signalGuildWarBattleInfoSyn: any;
    _signalGuildWarReportNotice: any;
    _signalGuildWarBattleInfoGet: any;
    _signalGuildWarBattleAvatarStateChange: any;
    _signalGuildWarBattleGoCampNotice: any;
    _signalGuildWarPointChange: any;
    _signalGuildWarUserChange: any;
    _signalGuildWarBuildingChange: any;
    _size1: cc.Size;
    _size2: cc.Size;
    initData(cityId) {
        this._cityId = cityId;
        this._pointId = null;
        this._listData = [];
        this._reportInfo = null;
        this._isFold = false;
        this._lastRefreshTime = 0;
        this._roleInPoint = false;
        this._pointChanged = false;
        this._buildConfig = null;
    }

    onCreate() {
        // var GuildWarEnemyItemCell = require('GuildWarEnemyItemCell');
        // cc.bind(this._listView, 'CommonScrollView2');
        // this._listView.setTemplate(GuildWarEnemyItemCell);
        // this._listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        // this._listView.setCustomCallback(handler(this, this._onItemTouch));
        // this._listView.setRemoveChildren(false);
        this._listView.content.removeAllChildren();
        this._listView.content.height = 340;
    }
    onEnter() {
        this._startTimer();
        this._signalGuildWarBattleInfoSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN, handler(this, this._onEventGuildWarBattleInfoSyn));
        this._signalGuildWarReportNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_REPORT_NOTICE, handler(this, this._onEventGuildWarReportNotice));
        this._signalGuildWarBattleInfoGet = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET, handler(this, this._onEventGuildWarBattleInfoGet));
        this._signalGuildWarBattleAvatarStateChange = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_AVATAR_STATE_CHANGE, handler(this, this._onEventGuildWarBattleAvatarStateChange));
        this._signalGuildWarBattleGoCampNotice = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BATTLE_GO_CAMP_NOTICE, handler(this, this._onEventGuildWarBattleGoCampNotice));
        this._signalGuildWarPointChange = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_POINT_CHANGE, handler(this, this._onEventGuildWarPointChange));
        this._signalGuildWarUserChange = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_USER_CHANGE, handler(this, this._onEventGuildWarUserChange));
        this._signalGuildWarBuildingChange = G_SignalManager.add(SignalConst.EVENT_GUILD_WAR_BUILDING_CHANGE, handler(this, this._onEventGuildWarBattleBuildingChange));
        this._saveHeight();
        this._refreshData();
        this._refreshView();
        this._checkWindowState(null);
        this._refreshTimeView();
    }
    onExit() {
        this._endTimer();
        if (this._signalGuildWarBattleInfoSyn) {
            this._signalGuildWarBattleInfoSyn.remove();
            this._signalGuildWarBattleInfoSyn = null;
        }
        if (this._signalGuildWarReportNotice) {
            this._signalGuildWarReportNotice.remove();
            this._signalGuildWarReportNotice = null;
        }
        if (this._signalGuildWarBattleInfoGet) {
            this._signalGuildWarBattleInfoGet.remove();
            this._signalGuildWarBattleInfoGet = null;
        }
        if (this._signalGuildWarBattleAvatarStateChange) {
            this._signalGuildWarBattleAvatarStateChange.remove();
            this._signalGuildWarBattleAvatarStateChange = null;
        }
        if (this._signalGuildWarBattleGoCampNotice) {
            this._signalGuildWarBattleGoCampNotice.remove();
            this._signalGuildWarBattleGoCampNotice = null;
        }
        if (this._signalGuildWarPointChange) {
            this._signalGuildWarPointChange.remove();
            this._signalGuildWarPointChange = null;
        }
        if (this._signalGuildWarUserChange) {
            this._signalGuildWarUserChange.remove();
            this._signalGuildWarUserChange = null;
        }
        if (this._signalGuildWarBuildingChange) {
            this._signalGuildWarBuildingChange.remove();
            this._signalGuildWarBuildingChange = null;
        }
    }
    _onEventGuildWarBattleInfoGet(event, cityId) {
        this._cityId = cityId;
        this._refreshData();
        this._refreshView();
    }
    _onEventGuildWarBattleInfoSyn(event) {
    }
    _onEventGuildWarReportNotice(event, message) {
        var isWin = message["is_win"];
        var userId = message["user_id"];
    }
    _onEventGuildWarBattleAvatarStateChange(event, userData, newState, oldState) {
        if (userData && userData.isSelf()) {
            var show = newState == GuildWarRunAvatorNode.STAND_STATE || newState == GuildWarRunAvatorNode.ATTACK_STATE;
            this._roleInPoint = show;
            this._pointChanged = true;
            if (this._isCanRefreshList()) {
                this._updateList();
            }
            if (!show) {
                this._hide(true);
            } else if (show && oldState == GuildWarRunAvatorNode.RUN_STATE) {
                if (this._isCamp()) {
                    this._hide(true);
                } else {
                    this._show();
                }
            }
        }
    }
    _onEventGuildWarBattleGoCampNotice(event, userData) {
        if (userData && userData.isSelf()) {
            this._hide(true);
        }
    }
    _onEventGuildWarUserChange(event, cityId, changedUserMap) {
        var userId = G_UserData.getBase().getId();
        if (changedUserMap[userId]) {
            this._refreshData();
            this._refreshView();
        }
    }
    _onEventGuildWarPointChange(event, cityId, changedPointMap, changedUserMap) {
        if (this._cityId == cityId && this._pointId && changedPointMap[this._pointId]) {
            this._pointChanged = true;
            if (this._isCanRefreshList()) {
                this._updateList();
            }
        }
    }
    _onEventGuildWarBattleBuildingChange(event, cityId, changedBuildingMap) {
        if (this._cityId == cityId && this._pointId && changedBuildingMap[this._pointId]) {
            this._pointChanged = true;
            if (this._isCanRefreshList()) {
                this._updateList();
            }
        }
    }
    _startTimer() {
        this.schedule(this._onRefreshTick, 0.2);
    }
    _endTimer() {
        this.unschedule(this._onRefreshTick);
    }
    _isCamp() {
        var config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(this._cityId, this._pointId);
        if (config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK || config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER) {
            return true;
        }
        return false;
    }
    _updateList() {
        var time = G_ServerTime.getTime();
        this._lastRefreshTime = time;
        this._pointChanged = false;
        this._buildConfig = null;
        if (!this._roleInPoint) {
            this._listData = [];
        } else if (this._isCamp()) {
            this._listData = [];
        } else {
            this._listData = G_UserData.getGuildWar().getOtherGuildWarUserList(this._cityId, this._pointId, null);
            var need = GuildWarDataHelper.isNeedAttackBuild(this._cityId, this._pointId);
            if (need) {
                this._buildConfig = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(this._cityId, this._pointId);
            }
        }
        var size = this._listData.length + (this._buildConfig ? 1 : 0);
        this._listView.content.removeAllChildren();
        this._listView.content.height = 340;
        let perIndex = 0;
        if (this._buildConfig) {
            let cell = Util.getNode("prefab/guildwarbattle/GuildWarEnemyItemCell", GuildWarEnemyItemCell) as GuildWarEnemyItemCell; //92
            this._listView.content.addChild(cell.node);
            cell.updateBuildingUI(this._cityId, this._buildConfig);
            cell.setIdx(0);
            cell.setCustomCallback(handler(this, this._onItemTouch));
            cell.node.x = 0;
            cell.node.y = -92;
            perIndex = 1;
            this._listView.content.height = Math.abs(cell.node.y);
        }
        for (let i = 0; i < this._listData.length; i++) {
            let cell = Util.getNode("prefab/guildwarbattle/GuildWarEnemyItemCell", GuildWarEnemyItemCell) as GuildWarEnemyItemCell;
            this._listView.content.addChild(cell.node);
            cell.updateUI(this._listData[i]);
            cell.setIdx(i + 1);
            cell.setCustomCallback(handler(this, this._onItemTouch));
            cell.node.x = 0;
            cell.node.y = -92 * (i + 1 + perIndex);
            // if (Math.abs(cell.node.y) > 340) {
            // }
            this._listView.content.height = Math.abs(cell.node.y);
        }
        this._listView.scrollToTop();
        // if (size > 0 && this._roleInPoint && this._isFold == true) {
        //     this._setWindowState(false);
        // }
        if (size == 0) {
            this._nodeContent.active = (false);
            return;
        } else if (size == 1) {
            this._panelList.setContentSize(cc.size(277, 92));
            // this._listView.node.y = (92);
            // this._listView.setTouchEnabled(false);
            this._listView.vertical = false;
            this._listView.horizontal = false;
            this._imageBg.node.setContentSize(cc.size(277, 391 - 66 - 92 - 92));
        } else if (size == 2) {
            this._panelList.setContentSize(cc.size(277, 184));
            // this._listView.node.y = (184);
            // this._listView.setTouchEnabled(false);
            this._listView.vertical = false;
            this._listView.horizontal = false;
            this._imageBg.node.setContentSize(cc.size(277, 391 - 66 - 92));
        } else if (size == 3) {
            this._panelList.setContentSize(cc.size(277, 276));
            // this._listView.node.y = (276);
            // this._listView.setTouchEnabled(false);
            this._listView.vertical = false;
            this._listView.horizontal = false;
            this._imageBg.node.setContentSize(cc.size(277, 391 - 66));
        } else if (size >= 4) {
            this._panelList.setContentSize(cc.size(277, 340));
            // this._listView.node.y = (340);
            // this._listView.setTouchEnabled(true);
            this._listView.vertical = true;
            this._listView.horizontal = false;
            this._imageBg.node.setContentSize(cc.size(277, 391));
        }
        this._listView.content.y = 0;
        this._nodeContent.active = (true);
    }
    _onItemUpdate(item, index) {
        if (this._buildConfig) {
            if (index == 0) {
                item.updateBuildingUI(this._cityId, this._buildConfig);
                return;
            }
            index = index - 1;
        }
        if (this._listData[index + 1]) {
            item.updateUI(this._listData[index + 1]);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, warUserData) {
        if (index == 0 && this._buildConfig) {
            var success = GuildWarCheck.guildWarCanAttackPoint(this._cityId, this._buildConfig.point_id, false, true);
            if (success[0]) {
                G_UserData.getGuildWar().c2sGuildWarBattleWatch(this._buildConfig.point_id);
            }
            return;
        }
        var nowGuildWarUser = G_UserData.getGuildWar().getWarUserById(warUserData.getCity_id(), warUserData.getUser_id());
        if (!nowGuildWarUser) {
            return;
        }
        var success = GuildWarCheck.guildWarCanAttackUser(this._cityId, nowGuildWarUser, true);
        if (success[0]) {
            var myGuildWarUser = G_UserData.getGuildWar().getMyWarUser(this._cityId);
            var userId = warUserData.getUser_id();
            G_UserData.getGuildWar().c2sGuildWarBattleUser(userId);
        }
    }
    _refreshData() {
        var guildWarUser = G_UserData.getGuildWar().getMyWarUser(this._cityId);
        var pointId = guildWarUser.getCurrPoint();
        var nowPointId = guildWarUser.getNow_point();
        this._roleInPoint = pointId != 0;
        this._pointId = nowPointId;
        this._pointChanged = false;
    }
    _refreshView() {
        this._updateList();
        this._refreshName();
    }
    _closeWindow(fold) {
    }
    _onButtonArrow(sender) {
        this._isFold = !this._isFold;
        this._closeWindow(this._isFold);
    }
    _hide(showAnim) {
        if (showAnim) {
            if (!this._isFold) {
                this._isFold = true;
                this._closeWindow(this._isFold);
            }
        } else {
            this._setWindowState(true);
        }
    }
    _show() {
        if (this._listData.length > 0) {
            this._setWindowState(false);
        }
    }
    update() {
        if (this._listView && this._listView.content) {
            if (this._listView.content.y != 0) {
                this._listView.content.y = 0;
            }
        }
    }
    _setWindowState(isClose) {
    }
    _checkWindowState(isFold) {
        var guildWarUser = G_UserData.getGuildWar().getMyWarUser(this._cityId);
        var pointId = guildWarUser.getCurrPoint();
        if (pointId != 0 && !this._isCamp()) {
            this._setWindowState(false);
        } else {
            this._setWindowState(true);
        }
    }
    _onRefreshTick(dt) {
        this._refreshTimeView();
    }
    _refreshTimeView() {
        var guildWarUser = G_UserData.getGuildWar().getMyWarUser(this._cityId);
        var challengeTime = guildWarUser.getChallenge_time();
        var challengeCd = guildWarUser.getChallenge_cd();
        var maxCd = GuildWarDataHelper.getGuildWarTotalAtkCD();
        var curTime = G_ServerTime.getTime();
        if (curTime <= challengeTime + challengeCd) {
            var second = challengeTime + challengeCd - curTime;
            this._textCdTitle.node.active = (true);
            this._textTime.node.active = (true);
            this._textTime.string = (Lang.get('guildwar_move_cd', { value: second }));
            if (challengeCd >= maxCd) {
                this._textTime.node.color = (Colors.BRIGHT_BG_RED);
            } else {
                this._textTime.node.color = (Colors.BRIGHT_BG_GREEN);
            }
        } else {
            this._textCdTitle.node.active = (true);
            this._textTime.node.active = (true);
            this._textTime.node.color = (Colors.BRIGHT_BG_GREEN);
            this._textTime.string = (Lang.get('guildwar_move_cd', { value: 0 }));
        }
    }
    _refreshName() {
        var config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(this._cityId, this._pointId);
        this._textPointName.string = (config.name);
    }
    _findIndexById(userId) {
        if (!this._listData) {
            return null;
        }
        for (var k in this._listData) {
            var v = this._listData[k];
            if (v.getUser_id() == userId) {
                return k;
            }
        }
        return null;
    }
    _checkListUpdate() {
        if (this._isCanRefreshList()) {
            this._updateList();
        }
    }
    _isCanRefreshList() {
        if (!this._roleInPoint || !this._pointChanged) {
            return false;
        }
        return true;
    }
    _saveHeight() {
        this._size1 = this._imageBg.node.getContentSize();
        this._size2 = this._listView.node.getContentSize();
    }

}