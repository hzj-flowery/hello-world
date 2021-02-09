const { ccclass, property } = cc._decorator;

import CommonFullScreen from '../../../ui/component/CommonFullScreen'
import { GroupsDataHelper } from '../../../utils/data/GroupsDataHelper';
import { handler } from '../../../utils/handler';
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import ListView from '../recovery/ListView';
import CommonTabGroupScrollVertical from '../../../ui/component/CommonTabGroupScrollVertical';
import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import ViewBase from '../../ViewBase';
import { Lang } from '../../../lang/Lang';
import { GroupsViewHelper } from './GroupsViewHelper';
import GroupsFixViewCell from './GroupsFixViewCell';

@ccclass
export default class GroupsListView extends ViewBase {

    @property({ type: CommonFullScreen, visible: true })
    _commonFullScreen: CommonFullScreen = null;
    // @property({ type: CommonTabGroupScrollVertical, visible: true })
    // _tabGroup: CommonTabGroupScrollVertical = null;
    @property({ type: ListView, visible: true })
    _listView: ListView = null;
    @property({ type: cc.Label, visible: true })
    _textEmpty: cc.Label = null;
    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnJoin: CommonButtonLevel0Normal = null;
    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnCreate: CommonButtonLevel0Highlight = null;
    @property({ type: cc.Prefab, visible: true })
    _groupsFixViewCellPrefab: cc.Prefab = null;

    private _curGroupType;
    private _listDatas: any[];
    private _groupInfos: any[];
    private _curTabIndex;

    private _signalListGet;
    private _signalListUpdate;
    private _signalApplyJoinSuccess;
    private _signalRejectMyApply;
    private _signalApplyJoinTimeOut;
    private _signalDataReset;

    public init(groupType) {
        this._curGroupType = groupType;
    }

    public onCreate() {
        this._listDatas = [];
        var infos = GroupsDataHelper.getGroupInfos();
        this._groupInfos = [];
        var tabNameList = [];
        this._curTabIndex = 0;
        for (let i in infos) {
            var info = infos[i];
            this._groupInfos.push(info.configInfo);
            tabNameList.push(info.name);
            if (info.configInfo.id == this._curGroupType) {
                this._curTabIndex = i;
            }
        }
        var param = {
            rootNode: null,
            containerStyle: 2,
            callback: handler(this, this._onTabSelect),
            textList: tabNameList
        };
        // this._tabGroup.recreateTabs(param);
        this._listView.setTemplate(this._groupsFixViewCellPrefab);
        this._listView.setCallback(handler(this, this._onItemUpdate));
        this._commonFullScreen.setTitle(Lang.get('groups_team_title'));
        this._btnCreate.setString(Lang.get('groups_btn_create'));
        this._btnJoin.setString(Lang.get('groups_btn_join'));
    }

    public onEnter() {
        this._signalListGet = G_SignalManager.add(SignalConst.EVENT_GROUP_LIST_GET, handler(this, this._onGroupListGet));
        this._signalListUpdate = G_SignalManager.add(SignalConst.EVENT_GROUP_LIST_UPDATE, handler(this, this._onGroupListUpdate));
        this._signalApplyJoinSuccess = G_SignalManager.add(SignalConst.EVENT_GROUP_APPLY_JOIN_SUCCESS, handler(this, this._onApplyJoinSuccess));
        this._signalRejectMyApply = G_SignalManager.add(SignalConst.EVENT_GROUP_REJECT_MY_APPLY, handler(this, this._onRejectMyApply));
        this._signalApplyJoinTimeOut = G_SignalManager.add(SignalConst.EVENT_GROUP_APPLY_JOIN_TIME_OUT, handler(this, this._onApplyJoinTimeOut));
        this._signalDataReset = G_SignalManager.add(SignalConst.EVENT_GROUP_DATA_RESET, handler(this, this._onDataReset));
        // this._tabGroup.setTabIndex(this._curTabIndex);
    }

    public onExit() {
        this._signalListGet.remove();
        this._signalListGet = null;
        this._signalListUpdate.remove();
        this._signalListUpdate = null;
        this._signalApplyJoinSuccess.remove();
        this._signalApplyJoinSuccess = null;
        this._signalRejectMyApply.remove();
        this._signalRejectMyApply = null;
        this._signalApplyJoinTimeOut.remove();
        this._signalApplyJoinTimeOut = null;
        this._signalDataReset.remove();
        this._signalDataReset = null;
    }

    private _onTabSelect(index, sender) {
        if (this._curTabIndex == index) {
            return;
        }
        this._curTabIndex = index;
        var groupType = this._groupInfos[this._curTabIndex].id;
        this._curGroupType = groupType;
        this._updateList();
    }

    public refreshView() {
        this._updateList();
    }

    private _updateList() {
        this._updateListData();
        if (this._listDatas.length == 0) {
            this._listView.node.active = false;
            this._textEmpty.node.active = true;
        } else {
            this._listView.node.active = true;
            this._textEmpty.node.active = false;
            // this._listView.clearAll();
            this._listView.resize(this._listDatas.length);
        }
    }

    private _updateListData() {
        var unitData = G_UserData.getGroups().getGroupsUnitData(this._curGroupType);
        if (unitData == null) {
            G_UserData.getGroups().c2sGetTeamsList(this._curGroupType);
        }
        this._listDatas = unitData && unitData.getDataList() || [];
    }

    private _onItemUpdate(node: cc.Node, index) {
        let item: GroupsFixViewCell = node.getComponent(GroupsFixViewCell);
        var itemData = this._listDatas[index];
        if (itemData) {
            item.setCustomCallback(handler(this, this._onItemTouch))
            item.updateUI(index, itemData);
        }
    }

    private _onItemSelected(item, index) {
    }

    private _onItemTouch(index, t) {
        var memberData = this._listDatas[index];
        var groupId = memberData.getTeam_id();
        var groupType = memberData.getTeam_type();
        var [isOk, func] = GroupsViewHelper.checkIsCanApplyJoin(groupType);
        if (isOk == false) {
            if (func) {
                func();
            }
            return;
        }
        G_UserData.getGroups().c2sApplyTeam(groupType, groupId);
    }

    private _onGroupListGet(event, teamType) {
        if (this._curGroupType != teamType) {
            return;
        }
        this._updateList();
    }

    private _onGroupListUpdate(event, teamType) {
        if (this._curGroupType != teamType) {
            return;
        }
        this._updateList();
    }

    private _onApplyJoinSuccess(event, teamType) {
        if (this._curGroupType != teamType) {
            return;
        }
        this._updateList();
    }

    private _onRejectMyApply(event) {
        this._updateList();
    }

    private _onApplyJoinTimeOut(event, teamType, teamId) {
        if (this._curGroupType != teamType) {
            return;
        }
        this._updateList();
    }

    private _onDataReset() {
        G_UserData.getGroups().c2sGetTeamsList(this._curGroupType);
    }

    public onBtnCreate() {
        var groupType = this._curGroupType;
        var [isOk, func] = GroupsViewHelper.checkIsCanCreate(groupType);
        if (isOk == false) {
            if (func) {
                func();
            }
            return;
        }
        G_UserData.getGroups().c2sCreateTeam(groupType);
    }

    public onBtnJoin() {
        var groupType = this._curGroupType;
        var [isOk, func] = GroupsViewHelper.checkIsCanApplyJoin(groupType);
        if (isOk == false) {
            if (func) {
                func();
            }
            return;
        }
        var memberId = 0;
        G_UserData.getGroups().c2sApplyTeam(groupType, memberId);
    }
}