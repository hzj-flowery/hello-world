const { ccclass, property } = cc._decorator;

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import ListView from '../recovery/ListView';
import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import PopupGroupsApplyCell from './PopupGroupsApplyCell';

@ccclass
export default class PopupGroupsApplyView extends PopupBase {

    @property({ type: CommonNormalLargePop, visible: true })
    _panelBg: CommonNormalLargePop = null;
    @property({ type: ListView, visible: true })
    _listView: ListView = null;
    @property({ type: cc.Prefab, visible: true })
    _groupsApplyCellPrefab: cc.Prefab = null;

    private _listDatas: any[];
    private _signalApplyListUpdate;
    private _signalApplyTimeOut;
    private _signalMyGroupApproveChange;
    private _signalMemberReachFull;

    public onCreate() {
        this._listDatas = [];
        this._panelBg.setTitle(Lang.get('groups_title_apply_list'));
        this._panelBg.addCloseEventListener(handler(this, this._onCloseClick));
        this._panelBg.setCloseVisible(true);
        this._listView.setTemplate(this._groupsApplyCellPrefab);
        this._listView.setCallback(handler(this, this._onItemUpdate));
    }

    public onEnter() {
        this._signalApplyListUpdate = G_SignalManager.add(SignalConst.EVENT_GROUP_APPLY_LIST_UPDATE, handler(this, this._onApplyListUpdate));
        this._signalApplyTimeOut = G_SignalManager.add(SignalConst.EVENT_GROUP_APPLY_TIME_OUT, handler(this, this._onApplyTimeOut));
        this._signalMyGroupApproveChange = G_SignalManager.add(SignalConst.EVENT_GROUP_APPROVE_APPLY_SUCCESS, handler(this, this._onMyGroupApproveChange));
        this._signalMemberReachFull = G_SignalManager.add(SignalConst.EVENT_GROUP_MEMBER_REACH_FULL, handler(this, this._onMemberReachFull));
        this._updateData();
        this._updateList();
    }

    public onExit() {
        this._signalApplyListUpdate.remove();
        this._signalApplyListUpdate = null;
        this._signalApplyTimeOut.remove();
        this._signalApplyTimeOut = null;
        this._signalMyGroupApproveChange.remove();
        this._signalMyGroupApproveChange = null;
        this._signalMemberReachFull.remove();
        this._signalMemberReachFull = null;
    }

    private _updateList() {
        this._listView.clearAll();
        this._listView.resize(this._listDatas.length);
    }

    private _updateData() {
        this._listDatas = [];
        var myGroupData = G_UserData.getGroups().getMyGroupData();
        if (myGroupData) {
            var applyList = myGroupData.getApplyList();
            for (let k in applyList) {
                var data = applyList[k];
                this._listDatas.push(data);
            }
        }
    }

    private _onItemUpdate(node: cc.Node, index) {
        let item = node.getComponent(PopupGroupsApplyCell);
        var itemData = this._listDatas[index];
        if (itemData) {
            item.setCustomCallback(handler(this, this._onItemTouch));
            item.updateUI(index, itemData);
        }
    }

    private _onItemSelected(item, index) {
    }

    private _onItemTouch(index, t, isAccept) {
        var itemData = this._listDatas[index];
        if (itemData) {
            var userId = itemData.getUser_id();
            G_UserData.getGroups().getMyGroupData().c2sApproveTeam(userId, isAccept);
        }
    }

    private _onCloseClick() {
        this.close();
    }

    private _onApplyListUpdate(event) {
        this._updateData();
        this._updateList();
    }

    private _onApplyTimeOut(event, userId) {
        this._updateData();
        this._updateList();
    }

    private _onMyGroupApproveChange(event, userId, op) {
        this._updateData();
        this._updateList();
    }

    private _onMemberReachFull() {
        this.close();
    }
}