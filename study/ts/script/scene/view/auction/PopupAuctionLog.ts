const { ccclass, property } = cc._decorator;

import { Lang } from '../../../lang/Lang';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import CommonListView from '../../../ui/component/CommonListView';
import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';


@ccclass
export default class PopupAuctionLog extends PopupBase {
    public static path = 'auction/PopupAuctionLog';
    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonBk: CommonNormalMidPop = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _titleBG: cc.Sprite = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _imageNoTimes: CommonEmptyListNode = null;
    @property(cc.Prefab)
    popupAuctionLogCell: cc.Prefab = null;
    _title: any;
    _dataList: any;

    ctor(title) {
        this._title = title || Lang.get('auction_log_title1');
        this._isClickOtherClose = true;
        this.init();
    }
    init() {
        this._initListView();
        this._commonBk.setTitle(this._title);
        this._commonBk.addCloseEventListener(handler(this, this.onBtnCancel));
    }
    updateUI(dataList) {
        this._dataList = dataList;
        if (dataList && dataList.length > 0) {
            this._imageNoTimes.node.active = (false);
        } else {
            this._imageNoTimes.node.active = (true);
        }
        this._listView.setData(this._dataList.length);
    }
    onEnter() {
    }
    onExit() {
    }
    onBtnCancel() {
        this.close();
    }
    _initListView() {
        this._listView.init(this.popupAuctionLogCell, handler(this, this._onListViewItemUpdate), handler(this, this._onListViewItemTouch));
    }
    _onListViewItemUpdate(item, index) {
        var data = this._dataList[index];
        item.updateItem(index, data);
    }
    _onListViewItemSelected(item, index) {
    }
    _onListViewItemTouch(item, index) {
    }

}