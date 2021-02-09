const { ccclass, property } = cc._decorator;

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import { Lang } from '../../../lang/Lang';
import ListView from '../recovery/ListView';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import PopupPlayerHonorTitleCell from './PopupPlayerHonorTitleCell';

@ccclass
export default class PopupPlayerHonorTitle extends PopupBase {

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _titleBG: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _line2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _line2_0: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _titleName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _titleChapter: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _titleChapter_0: cc.Label = null;

    @property({
        type: ListView,
        visible: true
    })
    _listViewItem: ListView = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _honorTitleItemCellPrefab: cc.Prefab = null;

    private _tabIndex;
    private _title;
    private _itemList: any[];

    private _signalUpdateTitleInfo;

    public onCreate() {
        this.setClickOtherClose(true);
        this._tabIndex = 0;
        this._title = Lang.get('honor_title_title');

        this._listViewItem.setTemplate(this._honorTitleItemCellPrefab);
        this._listViewItem.setCallback(handler(this, this._onItemUpdate));
        this._commonNodeBk.setTitle(this._title);
        this._commonNodeBk.addCloseEventListener(handler(this, this._onBtnCancel));
    }

    public onEnter() {
        this._signalUpdateTitleInfo = G_SignalManager.add(SignalConst.EVENT_UPDATE_TITLE_INFO, handler(this, this._onEventUpdateTitleInfo));
        this.refreshView();
    }

    public onExit() {
        this._signalUpdateTitleInfo.remove();
        this._signalUpdateTitleInfo = null;
    }

    public _onEventUpdateTitleInfo(eventName, message) {
        this.refreshView();
    }

    public _onItemUpdate(node: cc.Node, index) {
        let item: PopupPlayerHonorTitleCell = node.getComponent(PopupPlayerHonorTitleCell);
        if (this._itemList && this._itemList.length > 0) {
            var data = this._itemList[index];
            if (data) {
                item.updateUI(index, data);
            }
        }
    }

    public _onItemSelected(item) {
    }

    public _onItemTouch(index) {
    }

    public _onBtnCancel() {
        this.close();
    }

    public refreshView() {
        this._itemList = [];
        var titleData = G_UserData.getTitles();
        var itemList = titleData.getHonorTitleList();
        this._itemList = itemList;
        this._listViewItem.resize(this._itemList.length);
    }
}