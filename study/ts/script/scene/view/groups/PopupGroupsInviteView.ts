const { ccclass, property } = cc._decorator;

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import ListView from '../recovery/ListView';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import CommonTabGroupHorizon from '../../../ui/component/CommonTabGroupHorizon';
import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { GroupsConst } from '../../../const/GroupsConst';
import PopupBase from '../../../ui/PopupBase';
import PopupGroupsInviteCell from './PopupGroupsInviteCell';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { HeroConst } from '../../../const/HeroConst';

@ccclass
export default class PopupGroupsInviteView extends PopupBase {

    @property({ type: CommonNormalLargePop, visible: true })
    _panelBg: CommonNormalLargePop = null;

    @property({ type: cc.Label, visible: true })
    _textMid: cc.Label = null;

    @property({ type: CommonTabGroupHorizon, visible: true })
    _tabGroup: CommonTabGroupHorizon = null;

    @property({ type: ListView, visible: true })
    _listView: ListView = null;

    @property({ type: cc.Prefab, visible: true })
    _groupsInviteCellPrefab: cc.Prefab = null;

    private _selectTabIndex;
    private _myGroupData;
    private _listDatas: any[];
    private _friendList: any[];
    private _guildMemberList: any[];
    private _maxLevel;
    private _minLevel;

    private _signalKickOut;
    private _signalInviteJoinGuild;
    private _signalGetFriendList;
    private _signalGetGuildMemberList;
    private _signalInviteTimeOut;
    private _signalMyGroupUpdate;
    private _signalRejectInvite;
    private _signalAcceptInvite;
    private _signalJoinSuccess;
    private _signalMemberReachFull;

    public onCreate() {
        this.setClickOtherClose(true);
        this._selectTabIndex = -1;
        this._myGroupData = null;
        this._listDatas = [];
        this._friendList = [];
        this._guildMemberList = [];
        this._maxLevel = 0;
        this._minLevel = 0;
        this._panelBg.setTitle(Lang.get('groups_title_invite_friend'));
        this._panelBg.addCloseEventListener(handler(this, this._onCloseClick));
        this._panelBg.setCloseVisible(true);
        this._initTab();
        this._listView.setTemplate(this._groupsInviteCellPrefab);
        this._listView.setCallback(handler(this, this._onItemUpdate));
    }

    private _initTab() {
        var textNames = [];
        textNames.push(Lang.get('groups_title_guild_member'));
        textNames.push(Lang.get('groups_title_online_friend'));
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: -2,
            textList: textNames
        };
        this._tabGroup.recreateTabs(param);
    }

    public onEnter() {
        this._signalKickOut = G_SignalManager.add(SignalConst.EVENT_GROUP_KICK_OUT, handler(this, this._onKickOut));
        this._signalInviteJoinGuild = G_SignalManager.add(SignalConst.EVENT_GROUP_INVITE_JOIN_GROUP_SUCCEED, handler(this, this._onInviteJoinGroup));
        this._signalGetFriendList = G_SignalManager.add(SignalConst.EVENT_GET_FRIEND_LIST_SUCCESS, handler(this, this._onGetFriendList));
        this._signalGetGuildMemberList = G_SignalManager.add(SignalConst.EVENT_GUILD_QUERY_MALL, handler(this, this._onGetGuildMemberList));
        this._signalInviteTimeOut = G_SignalManager.add(SignalConst.EVENT_GROUP_INVITE_TIME_OUT, handler(this, this._onInviteTimeOut));
        this._signalMyGroupUpdate = G_SignalManager.add(SignalConst.EVENT_GROUP_MY_GROUP_INFO_UPDATE, handler(this, this._onMyGroupUpdate));
        this._signalRejectInvite = G_SignalManager.add(SignalConst.EVENT_GROUP_REJECT_INVITE, handler(this, this._onRejectInvite));
        this._signalAcceptInvite = G_SignalManager.add(SignalConst.EVENT_GROUP_ACCEPT_INVITE, handler(this, this._onAcceptInvite));
        this._signalJoinSuccess = G_SignalManager.add(SignalConst.EVENT_GROUP_JOIN_SUCCESS, handler(this, this._onJoinSuccess));
        this._signalMemberReachFull = G_SignalManager.add(SignalConst.EVENT_GROUP_MEMBER_REACH_FULL, handler(this, this._onMemberReachFull));
        this._tabGroup.setTabIndex(GroupsConst.TAB_INVITE_TYPE_1 - 1);
    }

    public onExit() {
        this._signalKickOut.remove();
        this._signalKickOut = null;
        this._signalInviteJoinGuild.remove();
        this._signalInviteJoinGuild = null;
        this._signalGetFriendList.remove();
        this._signalGetFriendList = null;
        this._signalGetGuildMemberList.remove();
        this._signalGetGuildMemberList = null;
        this._signalInviteTimeOut.remove();
        this._signalInviteTimeOut = null;
        this._signalMyGroupUpdate.remove();
        this._signalMyGroupUpdate = null;
        this._signalRejectInvite.remove();
        this._signalRejectInvite = null;
        this._signalAcceptInvite.remove();
        this._signalAcceptInvite = null;
        this._signalJoinSuccess.remove();
        this._signalJoinSuccess = null;
        this._signalMemberReachFull.remove();
        this._signalMemberReachFull = null;
    }

    private _onTabSelect(index, sender) {
        if (this._selectTabIndex == index) {
            return;
        }
        this._selectTabIndex = index;
        this._requestInviteListData();
        this._updateData();
        this._updateView();
    }

    private _requestInviteListData() {
        if ((this._selectTabIndex + 1) == GroupsConst.TAB_INVITE_TYPE_1) {
            if (G_UserData.getGuild().isInGuild()) {
                G_UserData.getGuild().c2sQueryGuildMall();
            }
        } else if ((this._selectTabIndex + 1) == GroupsConst.TAB_INVITE_TYPE_2) {
            G_UserData.getFriend().c2sGetFriendList();
        }
    }

    private _updateData() {
        this._myGroupData = G_UserData.getGroups().getMyGroupData();
        if (this._myGroupData) {
            this._maxLevel = this._myGroupData.getGroupData().getMax_level();
            this._minLevel = this._myGroupData.getGroupData().getMin_level();
        }
        if ((this._selectTabIndex + 1) == GroupsConst.TAB_INVITE_TYPE_1) {
            var tempList: any[] = [];
            for (let i = 0; i < this._guildMemberList.length; i++) {
                tempList.push(this._guildMemberList[i]);
            }
            this._guildMemberList = this._filterData(tempList);
            this._listDatas = this._guildMemberList;
        } else if ((this._selectTabIndex + 1) == GroupsConst.TAB_INVITE_TYPE_2) {
            var tempList: any[] = [];
            for (let i = 0; i < this._friendList.length; i++) {
                tempList.push(this._friendList[i]);
            }
            this._friendList = this._filterData(tempList);
            this._listDatas = this._friendList;
        }
    }

    private _updateView() {
        this._listView.clearAll();
        this._listView.resize(this._listDatas.length);
        if (this._listDatas.length == 0) {
            this._textMid.node.active = (true);
            if ((this._selectTabIndex + 1) == GroupsConst.TAB_INVITE_TYPE_1) {
                this._textMid.string = (Lang.get('groups_invite_guild_empty'));
            } else if ((this._selectTabIndex + 1) == GroupsConst.TAB_INVITE_TYPE_2) {
                this._textMid.string = (Lang.get('groups_invite_friend_empty'));
            }
        } else {
            this._textMid.node.active = (false);
        }
    }

    private _onKickOut(event) {
        this.close();
    }

    private _onInviteJoinGroup(event) {
        this._updateData();
        this._updateView();
    }

    private _onInviteTimeOut() {
        this._updateData();
        this._updateView();
    }

    private _onMyGroupUpdate() {
        this._updateData();
        this._updateView();
    }

    private _onRejectInvite() {
        this._updateData();
        this._updateView();
    }

    private _onAcceptInvite() {
        this._updateData();
        this._updateView();
    }

    private _onJoinSuccess() {
        this._updateData();
        this._updateView();
    }

    private _onMemberReachFull() {
        this.close();
    }

    private _onItemUpdate(node: cc.Node, index) {
        let item: PopupGroupsInviteCell = node.getComponent(PopupGroupsInviteCell);
        var itemData = this._listDatas[index];
        if (itemData) {
            item.setCustomCallback(handler(this, this._onItemTouch));
            item.updateUI(index, itemData);
        }
    }

    private _onItemSelected(item, index) {
    }

    private _onItemTouch(index, userId) {
        if (this._myGroupData) {
            this._myGroupData.c2sInviteJoinTeam(userId);
        }
    }

    private _onCloseClick() {
        this.close();
    }

    private _onGetFriendList(event, datas) {
        this._friendList = [];
        if (datas) {
            var friendList = datas.friendList || [];
            for (let i in friendList) {
                var unitData = friendList[i];
                if (unitData.getOnline() == 0) {
                    var limitLevel = 0;
                    var playerShowInfo = unitData.getPlayerShowInfo();
                    var avatarBaseId = playerShowInfo.avatarBaseId;
                    if (avatarBaseId > 0) {
                        var limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit;
                        if (limit == 1) {
                            limitLevel = HeroConst.HERO_LIMIT_MAX_LEVEL;
                        }
                    }
                    var cellData = {
                        covertId: unitData.getCovertId(),
                        limitLevel: limitLevel,
                        userId: unitData.getId(),
                        guildName: unitData.getGuild_name(),
                        playerName: unitData.getName(),
                        officerLevel: unitData.getOffice_level(),
                        level: unitData.getLevel(),
                        power: unitData.getPower(),
                        maxLv: this._maxLevel,
                        minLv: this._minLevel,
                        head_frame_id: unitData.getHead_frame_id()
                    };
                    this._friendList.push(cellData);
                }
            }
        }
        this._updateData();
        if ((this._selectTabIndex + 1) == GroupsConst.TAB_INVITE_TYPE_2) {
            this._updateView();
        }
    }

    private _onGetGuildMemberList(event) {
        var datas = G_UserData.getGuild().getGuildMemberList();
        this._guildMemberList = [];
        for (let i in datas) {
            var unitData = datas[i];
            if (unitData.isOnline()) {
                var limitLevel = 0;
                var playerInfo = unitData.getPlayer_info();
                var avatarBaseId = playerInfo.avatarBaseId;
                if (avatarBaseId > 0) {
                    var limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit;
                    if (limit == 1) {
                        limitLevel = HeroConst.HERO_LIMIT_MAX_LEVEL;
                    }
                }
                var cellData = {
                    covertId: playerInfo.covertId,
                    limitLevel: limitLevel,
                    userId: unitData.getUid(),
                    guildName: G_UserData.getGuild().getMyGuild().getName(),
                    playerName: unitData.getName(),
                    officerLevel: unitData.getOfficer_level(),
                    level: unitData.getLevel(),
                    power: unitData.getPower(),
                    maxLv: this._maxLevel,
                    minLv: this._minLevel,
                    head_frame_id: unitData.getHead_frame_id()
                };
                this._guildMemberList.push(cellData);
            }
        }
        this._updateData();
        if ((this._selectTabIndex + 1) == GroupsConst.TAB_INVITE_TYPE_1) {
            this._updateView();
        }
    }

    private _filterData(cellDatas) {
        var sortFunc = function (a, b) {
            return a.power - b.power;
        };
        var result = [];
        if (this._myGroupData) {
            for (let i in cellDatas) {
                var cellData = cellDatas[i];
                var userId = cellData.userId;
                if (!this._myGroupData.isExistUser(userId)) {
                    result.push(cellData);
                }
            }
        }
        result.sort(sortFunc);
        return result;
    }
}