const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import ViewBase from '../../ViewBase';
import UIHelper from '../../../utils/UIHelper';
import { G_ConfigLoader, G_Prompt, G_UserData } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { Lang } from '../../../lang/Lang';
import { UserCheck } from '../../../utils/logic/UserCheck';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { handler } from '../../../utils/handler';
import { FriendConst } from '../../../const/FriendConst';
import { DataConst } from '../../../const/DataConst';
import { Util } from '../../../utils/Util';

@ccclass
export default class FriendEnergyList extends ViewBase {

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

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnGetAll: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _num: cc.Label = null;

    @property(cc.Prefab)
    FriendListViewCell:cc.Prefab = null;

    
    _maxNum: number;
    _data: any[] = [];
    _curNum: number;

    onCreate() {
        UIHelper.addEventListener(this.node, this._btnGetAll._button, 'FriendEnergyList', '_onBtnGetAll');
        this._initListView();
        this._btnGetAll.setString(Lang.get('lang_friend_btn_one_key_get'));
        var Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);//require('app.config.parameter');
        this._maxNum = parseInt(Parameter.get(128).content) || 0;
    }
    onEnter() {
    }
    onExit() {
    }
    _onBtnGetAll() {
        if (this._data && this._data.length > 0) {
            if (this._curNum >= this._maxNum) {
                G_Prompt.showTip(Lang.get('lang_friend_today_get_energy_full'));
                return;
            }
            if (UserCheck.isResReachMaxLimit(DataConst.RES_SPIRIT)) {
                G_Prompt.showTip(Lang.get('lang_friend_energy_full_tip'));
                return;
            }
            G_UserData.getFriend().c2sGetFriendPresent(0);
        } else {
            G_Prompt.showTip(Lang.get('lang_friend_empty_energy_tip'));
        }
    }
    _initListView() {
        //var FriendListViewCell = require('FriendListViewCell');
        this._listView.setTemplate(this.FriendListViewCell);
        this._listView.setCallback(handler(this, this._onListViewItemUpdate), handler(this, this._onListViewItemSelected));
        this._listView.setCustomCallback(handler(this, this._onListViewItemTouch));
    }
    _onListViewItemUpdate(item, index) {
        if (this._data) {
            var itemData = this._data[index];
            item.updateUI(itemData, FriendConst.FRIEND_ENERGY, index + 1);
        }
    }
    _onListViewItemSelected(item, index) {
    }
    _onListViewItemTouch(index, data) {
        if (UserCheck.isResReachMaxLimit(DataConst.RES_SPIRIT)) {
            G_Prompt.showTip(Lang.get('lang_friend_energy_full_tip'));
            return;
        }
        if (this._curNum >= this._maxNum) {
            G_Prompt.showTip(Lang.get('lang_friend_today_get_energy_full'));
            return;
        }
        if (data) {
            G_UserData.getFriend().c2sGetFriendPresent(data.getId());
        }
    }
    updateView(data, num) {
        if (!data) {
            data = {};
        }
        this._data = data;
        this._curNum = num;
        this._listView.resize(data.length);
        this._num.string = (Util.format('%s/%s', num || 0, this._maxNum));
    }

}
