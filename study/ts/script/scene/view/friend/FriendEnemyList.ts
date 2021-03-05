const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import ViewBase from '../../ViewBase';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import { G_SceneManager, G_UserData } from '../../../init';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { Util } from '../../../utils/Util';
import { EnemyHelper } from './EnemyHelper';
import { handler } from '../../../utils/handler';
import PopupEnemyLog from './PopupEnemyLog';

@ccclass
export default class FriendEnemyList extends ViewBase {

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
    _btnPopLog: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _num: cc.Label = null;

    @property(cc.Prefab)
    FriendEnemyListViewCell:cc.Prefab = null;


    _enemysData: any[] = [];


    ctor() {
        UIHelper.addEventListener(this.node, this._btnPopLog._button, 'FriendEnemyList', '_onBtnPopLog');
    }
    onCreate() {
        this.ctor();
        this._initListView();
        this._btnPopLog.setString(Lang.get('lang_friend_enemy_btn_log'));
    }
    onEnter() {
    }
    onExit() {
    }
    _onBtnPopLog() {
        PopupEnemyLog.popupEnemyLog();
    }
    _initListView() {
        this._listView.setTemplate(this.FriendEnemyListViewCell);
        this._listView.setCallback(handler(this, this._onListViewItemUpdate), handler(this, this._onListViewItemSelected));
        this._listView.setCustomCallback(handler(this, this._onListViewItemTouch));
    }
    updateView() {
        this._enemysData = G_UserData.getEnemy().getEnemysData();
        this._listView.resize(this._enemysData.length);
        this._num.string = (Util.format('%s/%s', G_UserData.getEnemy().getCount(), EnemyHelper.getDayMaxRevengeNum()));
    }
    _onListViewItemUpdate(item, index) {
        var data = this._enemysData[index];
        item.updateUI(data, index + 1);
    }
    _onListViewItemSelected(item, index) {
    }
    _onListViewItemTouch(index, params) {
    }

}
