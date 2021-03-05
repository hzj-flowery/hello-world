const { ccclass, property } = cc._decorator;

import CommonEmptyTipNode from '../../../ui/component/CommonEmptyTipNode'
import CommonListView from '../../../ui/component/CommonListView';
import { PrioritySignal } from '../../../utils/event/PrioritySignal';
import { G_SignalManager, G_UserData, G_SceneManager, G_ResolutionManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import HomelandGuildListCell from './HomelandGuildListCell';
import { Lang } from '../../../lang/Lang';
import ViewBase from '../../ViewBase';

@ccclass
export default class HomelandGuildList extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTab: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonFold: cc.Button = null;

    @property({
        type: CommonEmptyTipNode,
        visible: true
    })
    _imageNoTimes: CommonEmptyTipNode = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    homelandGuildListCell: cc.Prefab = null;
    
    _friendId: any;
    signal: any;
    _signalVisitFriendHome: import("f:/mingjiangzhuan/main/assets/script/utils/event/Slot").Slot;
    _dataList;

    ctor(friendId) {
        this._friendId = friendId;
    }
    onCreate() {
        this.signal = new PrioritySignal('string');
        var sceneSize = G_ResolutionManager.getDesignCCSize();
        this.node.setPosition(-sceneSize.width / 2, -sceneSize.height / 2);
    }
    onEnter() {
        this._signalVisitFriendHome = G_SignalManager.add(SignalConst.EVENT_VISIT_FRIEND_HOME_SUCCESS, handler(this, this._onEventVisitFriendHome));
        this._initListView();
    }
    onExit() {
        this._signalVisitFriendHome.remove();
        this._signalVisitFriendHome = null;
    }
    onButtonFold() {
        this._closeWindow();
    }
    _initListView() {
        this._dataList = G_UserData.getHomeland().getGuildMemberList();
        this._listView.init(this.homelandGuildListCell, handler(this, this._onListViewItemUpdate), handler(this, this._onListViewItemTouch));
        this._listView.setData(this._dataList.length);
        if (this._dataList.length == 0) {
            this._imageNoTimes.node.active = (true);
            this._imageNoTimes.setButtonGetVisible(false);
            this._imageNoTimes.setTipsString(Lang.get('mine_user_no_guild'));
        } else {
            this._imageNoTimes.node.active = (false);
        }
    }
    _onListViewItemUpdate(item, index, type) {
        var data = this._dataList[index];
        if (data) {
            item.updateItem(index, [data, this._friendId]);
        } else {
            item.updateItem(index, null)
        }
    }
    _onListViewItemSelected(item, index) {
    }
    _onListViewItemTouch(index, userId) {
        if (userId && userId > 0) {
            if (userId == G_UserData.getBase().getId()) {
                G_SceneManager.replaceScene('homeland');
                return;
            }
            if (this._friendId != userId) {
                G_UserData.getHomeland().c2sVisitFriendHome(userId);
                this._friendId = userId;
            }
        }
    }
    _closeWindow() {
        var posX = -this._panelDesign.getContentSize().width - this._buttonFold.node.x;
        var callAction = cc.callFunc(function () {
            this.signal.dispatch('close');
            this.node.removeFromParent();
        }.bind(this));
        var action = cc.moveBy(0.3, cc.v2(posX, 0));
        var runningAction = cc.sequence(action, callAction);
        this.node.runAction(runningAction);
    }
    _onEventVisitFriendHome(id, message) {
        G_SceneManager.replaceScene('homelandFriend', this._friendId);
    }
}