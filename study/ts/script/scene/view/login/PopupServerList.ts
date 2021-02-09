const { ccclass, property } = cc._decorator;

import ServerListTabGroupNode from './ServerListTabGroupNode'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { G_WaitingMask, G_ConfigManager, G_RoleListManager } from '../../../init';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { ServerListDataHelper } from './ServerListDataHelper';
import { ExploreConst } from '../../../const/ExploreConst';

@ccclass
export default class PopupServerList extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _popupBG: CommonNormalLargePop = null;

    @property({
        type: ServerListTabGroupNode,
        visible: true
    })
    _tabGroup: ServerListTabGroupNode = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _popupServerListCellPrefab: cc.Prefab = null;

    private _callback;
    private _currSelectIndex;
    private _pageDataList;
    private _list;
    private _count;
    public static waitEnterMsg(callBack, param) {
        function onMsgCallBack() {
            G_WaitingMask.showWaiting(false);
            callBack();
        }
        if (!CC_DEBUG && G_RoleListManager.isCheckUpdate() && G_RoleListManager.getList().length == 0) {
            G_RoleListManager.signal.addOnce(onMsgCallBack);
            G_RoleListManager.checkUpdateList();
            G_WaitingMask.showWaiting(true);
        } else {
            onMsgCallBack();
        }
    }
    init(callback) {
        this._callback = callback;
        this._currSelectIndex = null;
        this._pageDataList = {};
    }
    onCreate() {
        this._listView.setTemplate(this._popupServerListCellPrefab);
        this._listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        this._listView.setCustomCallback(handler(this, this._onItemTouch));
        this._popupBG.setTitle(Lang.get('server_list_title'));
        this._popupBG.addCloseEventListener(() => {
            this.closeWithAction();
        });
        var pageDataList = [];
        var titles = [];
        if (!G_ConfigManager.isServerListReIndex()) {
            [pageDataList, titles] = ServerListDataHelper.getServerDataList();
        } else {
            [pageDataList, titles] = ServerListDataHelper.getServerDataListForGroup();
        }
        this._pageDataList = pageDataList;
        var CUSTOM_COLOR = [
            [cc.color(215, 239, 255)],
            [cc.color(255, 249, 235)],
            [cc.color(255, 249, 235)]
        ];
        this._tabGroup.setCustomColor(CUSTOM_COLOR);
        var param = {
            containerStyle: 2,
            callback: handler(this, this._onTabSelect),
            brightTabItemCallback: handler(this, this._brightTabItem),
            textList: titles,
            rootNode:this._tabGroup._scrollViewTab
        };
        this._tabGroup.recreateTabs(param);
        this._tabGroup.setTabIndex(0);
    }
    onEnter() {
    }
    onExit() {
    }
    _brightTabItem(tabItem, bright) {
        var textWidget: cc.Node = tabItem.textWidget;
        var normalImage: cc.Node = tabItem.normalImage;
        var downImage: cc.Node = tabItem.downImage;
        normalImage.active = (!bright);
        downImage.active = (bright);
        textWidget.color = (bright && ExploreConst.TAB_LIGHT_COLOR || ExploreConst.TAB_NORMAL_COLOR);
    }
    _onTabSelect(index, sender) {
        if (this._currSelectIndex == index) {
            return;
        }
        this._currSelectIndex = index;
        this._list = this._pageDataList[index];
        this._count = Math.ceil(this._list.length / 2);
        this._listView.removeAllChildren();
        this._listView.resize(this._count);
    }
    _onItemUpdate(item, index) {
        index = index * 2;
        item.updateUI(this._list[index], this._list[index + 1]);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
        var index = index * 2 + t;
        if (this._callback) {
            this._callback(this._list[index - 1].server);
        }
        this.closeWithAction();
    }
}