const { ccclass, property } = cc._decorator;

import { Lang } from '../../../lang/Lang';
import { G_UserData, G_SignalManager } from '../../../init';
import GroupsInfoNode from './GroupsInfoNode';
import PopupBase from '../../../ui/PopupBase';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';

@ccclass
export default class PopupGroupsView extends PopupBase {

    @property({ type: CommonNormalLargePop, visible: true })
    _popBase: CommonNormalLargePop = null;

    @property({ type: cc.Node, visible: true })
    _panelRoot: cc.Node = null;

    @property({ type: GroupsInfoNode, visible: true })
    _infoView: GroupsInfoNode = null;

    private _signalMyGroupUpdate;

    public onCreate() {
        this._popBase.addCloseEventListener(handler(this, this._onCloseClick));
        this._popBase.setCloseVisible(true);
        this._popBase.setTitle(Lang.get('groups_member_title'));
    }

    public onEnter() {
        this._signalMyGroupUpdate = G_SignalManager.add(SignalConst.EVENT_GROUP_MY_GROUP_INFO_UPDATE, handler(this, this._onMyGroupUpdate));
        this._refreshView();
    }

    public onExit() {
        this._signalMyGroupUpdate.remove();
        this._signalMyGroupUpdate = null;
    }

    private _refreshView() {
        var chooseView = this._getInfoView();
        chooseView.updateInfo();
    }

    private _getInfoView() {
        return this._infoView;
    }

    private _onCloseClick() {
        this.close();
    }
    private _onMyGroupUpdate() {
        this._refreshView();
    }
}