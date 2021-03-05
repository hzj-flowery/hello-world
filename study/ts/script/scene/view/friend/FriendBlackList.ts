import ViewBase from "../../ViewBase";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import { handler } from "../../../utils/handler";
import { FriendConst } from "../../../const/FriendConst";
import { G_UserData } from "../../../init";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FriendBlackList extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRoot: cc.Sprite = null;

    @property(cc.Prefab)
    FriendListViewCell:cc.Prefab = null;

    
    _data: any;


    onCreate() {
        this._initListView();
    }
    onEnter() {
    }
    onExit() {
    }
    _initListView() {
        this._listView.setTemplate(this.FriendListViewCell);
        this._listView.setCallback(handler(this, this._onListViewItemUpdate), handler(this, this._onListViewItemSelected));
        this._listView.setCustomCallback(handler(this, this._onListViewItemTouch));
    }
    _onListViewItemUpdate(item, index) {
        if (this._data) {
            var itemData = this._data[index];
            item.updateUI(itemData, FriendConst.FRIEND_BLACK, index + 1);
        }
    }
    _onListViewItemSelected(item, index) {
    }
    _onListViewItemTouch(index, data) {
        if (data) {
            G_UserData.getFriend().c2sDelFriend(data.getId(), FriendConst.FRIEND_DEL_BLACK_TYPE);
        }
    }
    updateView(data) {
        this._data = data;
        if (!this._data) {
            this._listView.resize(0);
        } else {
            this._listView.resize(this._data.length);
        }
    }

}
