import PopupBase from "../../../ui/PopupBase";
import { G_SceneManager, G_UserData, G_SignalManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import UIHelper from "../../../utils/UIHelper";
import HomelandPrayHandbookCell from "./HomelandPrayHandbookCell";
import { handler } from "../../../utils/handler";
import CommonListView from "../../../ui/component/CommonListView";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupHomelandPrayHandbook extends PopupBase {

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    handbookCell: cc.Prefab = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;
    _datas: any[];

    static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            if (G_SceneManager.getRunningScene().getName() == 'homeland') {
                callBack();
            }
        }
        G_UserData.getHandBook().c2sGetResPhoto();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_GET_RES_PHOTO_SUCCESS, onMsgCallBack);
        return signal;
    }
    onCreate() {
        UIHelper.addEventListener(this.node, this._buttonClose, 'PopupHomelandPrayHandbook', '_onButtonClose');
        this._listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        this._listView.setCustomCallback(handler(this, this._onItemTouch));
        this._listView.setTemplate(this.handbookCell);
    }
    onEnter() {
        this._updateList();
    }
    onExit() {
    }
    _updateList() {
        this._datas = G_UserData.getHandBook().getHomelandBuffInfos();
        var count = Math.ceil(this._datas.length / 4);
        this._listView.resize(count);
    }
    _onItemUpdate(item, index, type) {
        var startIndex = index * 4;
        var endIndex = startIndex + 4;
        var itemLine = [];
        if (this._datas.length > 0) {
            for (var i = startIndex; i < endIndex && i < this._datas.length; i++) {
                var itemData = this._datas[i];
                itemLine.push(itemData);
            }
        }
        item.updateUI(itemLine);
    }

    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
    }
    _onButtonClose() {
        this.close();
    }
}