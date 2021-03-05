const { ccclass, property } = cc._decorator;

import CommonFullScreen from '../../../ui/component/CommonFullScreen'
import { Lang } from '../../../lang/Lang';
import ViewBase from '../../ViewBase';
import { G_UserData } from '../../../init';
import GroupsInfoNode from './GroupsInfoNode';

@ccclass
export default class GroupsInfoView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;

    @property({ type: CommonFullScreen, visible: true })
    _popBase: CommonFullScreen = null;

    @property({ type: cc.Node, visible: true })
    _panelRoot: cc.Node = null;

    @property({ type: GroupsInfoNode, visible: true })
    _infoView: GroupsInfoNode = null;


    public onCreate() {
        this._popBase.setTitle(Lang.get('groups_member_title'));
    }

    public onEnter() {
        if (this._checkIsInGroup() == false) {
            return;
        }
        this.refreshView();
    }

    public onExit() {
    }

    private _checkIsInGroup() {
        var myGroupData = G_UserData.getGroups().getMyGroupData();
        if (myGroupData) {
            return true;
        } else {
            return false;
        }
    }

    public refreshView() {
        var chooseView = this._getInfoView();
        chooseView.updateInfo();
    }

    private _getInfoView() {
        return this._infoView;
    }
}