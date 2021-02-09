import { BaseData } from "./BaseData";
import LinkedList from "../utils/dataStruct/LinkedList";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ServerTime } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler, ArraySort } from "../utils/handler";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { TenJadeAuctionItemData } from "./TenJadeAuctionItemData";
import { table } from "../utils/table";
import { SignalConst } from "../const/SignalConst";
import { TenJadeAuctionInfoData } from "./TenJadeAuctionInfoData";
import { FunctionConst } from "../const/FunctionConst";
import { Lang } from "../lang/Lang";
import { TenJadeAuctionConst } from "../const/TenJadeAuctionConst";
import { rawget } from "../utils/GlobleFunc";
import { TenJadeAuctionDataHelper } from "../scene/view/tenJadeAuction/TenJadeAuctionDataHelper";
var schema = {};
export class TenJadeAuctionData extends BaseData {
    _auctionInfoQueue: any;
    _itemList: any[];
    _tagItemList: any[];
    _tagNameList: any[];
    _focusMap: {};
    _idItemMap: {};
    _s2cGetCrossAuctionInfoListener: any;
    _s2cGetAllCrossAuctionInfoListener: any;
    _s2cCrossAuctionListener: any;
    _s2cCrossAuctionLogListener: any;
    _s2cCrossAuctionUpdateListener: any;
    _s2cCrossAuctionInfoUpdateListener: any;
    _s2cCrossAuctionAddFocusListener: any;

    constructor(properties?) {
        super(properties);
        this._auctionInfoQueue = new LinkedList();
        this._itemList = [];
        this._tagItemList = [];
        this._tagNameList = [];
        this._focusMap = {};
        this._idItemMap = {};
        this._s2cGetCrossAuctionInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCrossAuctionInfo, handler(this, this._s2cGetCrosssAuctionInfo));
        this._s2cGetAllCrossAuctionInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetAllCrossAuctionInfo, handler(this, this._s2cGetAllCrosssAuctionInfo));
        this._s2cCrossAuctionListener = G_NetworkManager.add(MessageIDConst.ID_S2C_CrossAuction, handler(this, this._s2cCrossAuction));
        this._s2cCrossAuctionLogListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCrossAuctionLog, handler(this, this._s2cCrossAuctionLog));
        this._s2cCrossAuctionUpdateListener = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateCrossAuctionItem, handler(this, this._s2cCrossAuctionUpdate));
        this._s2cCrossAuctionInfoUpdateListener = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateCrossAuction, handler(this, this._s2cCrossAuctionInfoUpdate));
        this._s2cCrossAuctionAddFocusListener = G_NetworkManager.add(MessageIDConst.ID_S2C_CrossAuctionAddFocusRsp, handler(this, this._s2cCrossAuctionAddFocus));
    }
    clear() {
        this._s2cGetCrossAuctionInfoListener.remove();
        this._s2cGetCrossAuctionInfoListener = null;
        this._s2cGetAllCrossAuctionInfoListener.remove();
        this._s2cGetAllCrossAuctionInfoListener = null;
        this._s2cCrossAuctionListener.remove();
        this._s2cCrossAuctionListener = null;
        this._s2cCrossAuctionLogListener.remove();
        this._s2cCrossAuctionLogListener = null;
        this._s2cCrossAuctionUpdateListener.remove();
        this._s2cCrossAuctionUpdateListener = null;
        this._s2cCrossAuctionInfoUpdateListener.remove();
        this._s2cCrossAuctionInfoUpdateListener = null;
        this._s2cCrossAuctionAddFocusListener.remove();
        this._s2cCrossAuctionAddFocusListener = null;
    }
    reset() {
    }
    c2sGetCrossAuctionInfo(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCrossAuctionInfo, { auction_id: id });
    }
    _s2cGetCrosssAuctionInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.first) {
            this._tagNameList = [];
            this._itemList = [];
        }
        var actionItemList = rawget(message, 'auction_items') || {};
        for (var i in actionItemList) {
            var v = actionItemList[i];
            var itemData = new TenJadeAuctionItemData();
            itemData.initData(v);
            table.insert(this._itemList, itemData);
            this._idItemMap['k' + itemData.getId()] = itemData;
        }
        if (message.last) {
            var focusList = rawget(message, 'focus_info') || {};
            var curAucionId = this.getCurAuctionInfo().getAuction_id();
            this._focusMap = {};
            for (i in focusList) {
                var v = focusList[i];
                if (v.auction_id == curAucionId) {
                    this._focusMap[v.item_id] = 1;
                }
                var itemData = this.getItemDataWithItemId(v.item_id);
                itemData.setFocused(1);
            }
            this._createItemList();
            G_SignalManager.dispatch(SignalConst.EVENT_CROSS_AUCTION_GET_INFO, message);
        }
    }
    c2sGetAllCrossAuctionInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetAllCrossAuctionInfo, {});
    }
    _s2cGetAllCrosssAuctionInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var auctionList = [];
        var list = rawget(message, 'cross_auction') || {};
        for (var i in list) {
            var v = list[i];
            var auctionInfo = new TenJadeAuctionInfoData();
            auctionInfo.initData(v);
            table.insert(auctionList, auctionInfo);
        }
        this._sort(auctionList);
    }
    c2sCrossAuction(auction_id, config_id, price, item_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CrossAuction, {
            auction_id: auction_id,
            config_id: config_id,
            price: price,
            item_id: item_id
        });
    }
    _s2cCrossAuction(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_AUCTION_ADD_PRICE);
    }
    c2sGetCrossAuctionLog(auction_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCrossAuctioLog, { auction_id: auction_id });
    }
    _s2cCrossAuctionLog(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
    }
    _s2cCrossAuctionUpdate(id, message) {
        if (this._tagItemList.length == 0) {
            return;
        }
        var itemIds = [];
        var failedItems = [];
        var existDelete = false;
        var myId = G_UserData.getBase().getId();
        var items = rawget(message, 'items');
        for (var _ in items) {
            var item = items[_];
            table.insert(itemIds, item.item_id);
            var itemData = this.getItemDataWithItemId(item.item_id);
            if (item.delete == true) {
                existDelete = true;
                itemData.setDelete(1);
            } else if (itemData.getNow_buyer() == myId && item.now_buyer != myId) {
                table.insert(failedItems, itemData.getItem());
            }
            itemData.setNow_price(item.now_price);
            itemData.setNow_buyer(item.now_buyer);
            itemData.setEnd_time(item.end_time);
            itemData.setAdd_price(item.add_price);
        }
        for (var i = this._itemList.length - 1; i >= 0; i += -1) {
            if (this._itemList[i].getDelete() == 1) {
                var item = this._itemList[i];
                var itemId = item.getId();
                this._idItemMap['k' + itemId] = null;
                this._focusMap[itemId] = null;
                this._deleteTagItemList(item);
                table.remove(this._itemList, i);
            }
        }
        TenJadeAuctionDataHelper.showAuctionFailedTips(failedItems);
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_AUCTION_UPDATE_ITEM, itemIds, existDelete);
    }
    _s2cCrossAuctionInfoUpdate(id, message) {
        var exist = false;
        function cond(data) {
            if (data && data.getAuction_id() == message.auction_id) {
                exist = true;
                return true;
            } else {
                return false;
            }
        }
        function proc(auctionInfo) {
            auctionInfo.setEnd_time(message.end_time);
            auctionInfo.setOpen_state(message.open_state);
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION);
        }
        this._auctionInfoQueue.filter(cond, proc);
        if (!exist) {
            this._insertAuctionInfo(message);
        }
        if (message.open_state == 0) {
            this._deleteAuctionInfo(message);
        }
    }
    c2sCrossAuctionAddFocus(auction_id, item_id, focus_state) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CrossAuctionAddFocusReq, {
            auction_id: auction_id,
            item_id: item_id,
            focus_state: focus_state
        });
    }
    _s2cCrossAuctionAddFocus(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var focusInfo = rawget(message, 'focus_info');
        var state = message.focus_state;
        var itemId = focusInfo.item_id;
        var data = this.getItemDataWithItemId(itemId);
        data.setFocused(state);
        var curAucionId = this.getCurAuctionInfo().getAuction_id();
        if (curAucionId == focusInfo.auction_id) {
            this._focusMap[itemId] = state == 1 && 1 || null;
            this._updateFocusList();
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_AUCTION_ADD_FOCUS, itemId, state);
    }
    c2sCrossAuctionLeave(auction_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CrossAuctionLeave, { auction_id: auction_id });
    }
    _sort(list) {
        var sortFunc = function (a, b) {
            return a.getStart_time() < b.getStart_time();
        };
        table.sort(list, sortFunc);
        for (var i = 0; i < list.length; i++) {
            var node = LinkedList.node(list[i]);
            this._auctionInfoQueue.addAtTail(node);
        }
    }
    _createItemList() {
        var itemList = this._itemList;
        var tagMap = {};
        var tagList = [{
            id: 0,
            name: Lang.get('ten_jade_auction_tag_name_all'),
            list: []
        }];
        for (var i = 0; i < itemList.length; i++) {
            var data = itemList[i];
            var tagId = data.getTag_id();
            if (!tagMap[tagId]) {
                table.insert(tagList, {
                    id: tagId,
                    name: TenJadeAuctionConst.TAG_NAME[tagId],
                    list: []
                });
                tagMap[tagId] = tagList.length;
            }
            var index = tagMap[tagId];
            table.insert(tagList[index -1].list, {
                unitData: data,
                viewData: []
            });
            table.insert(tagList[0].list, {
                unitData: data,
                viewData: []
            });
        }
        table.insert(tagList, {
            id: 9999999,
            name: Lang.get('ten_jade_auction_tag_name_focus'),
            list: []
        });
        for (var itemId in this._focusMap) {
            var _ = this._focusMap[itemId];
            var data = this.getItemDataWithItemId(itemId);
            table.insert(tagList[tagList.length -1].list, {
                unitData: data,
                viewData: []
            });
        }
        var sortFunc = function (a, b) {
            return a.id < b.id;
        };
        table.sort(tagList, sortFunc);
        for (var i = 0; i < tagList.length; i++) {
            table.insert(this._tagNameList, tagList[i].name);
        }
        this._tagItemList = tagList;
    }
    _deleteTagItemList(item) {
        var tagId = item.getTag_id();
        var count = this._tagItemList.length;
        function removeAtList(curList) {
            for (var i = curList.length - 1; i >= 0; i += -1) {
                var itemInList = curList[i].unitData;
                if (itemInList.getId() == item.getId()) {
                    table.remove(curList, i);
                    break;
                }
            }
        }
        var allList = this._tagItemList[0].list;
        var focusList = this._tagItemList[count -1].list;
        removeAtList(allList);
        removeAtList(focusList);
        for (var _ in this._tagItemList) {
            var tagInfo = this._tagItemList[_];
            if (tagInfo.id == tagId) {
                removeAtList(tagInfo.list);
            }
        }
    }
    _updateFocusList() {
        var count = this._tagItemList.length;
        this._tagItemList[count -1].list = [];
        for (var itemId in this._focusMap) {
            var _ = this._focusMap[itemId];
            var data = this.getItemDataWithItemId(itemId);
            table.insert(this._tagItemList[count-1].list, {
                unitData: data,
                viewData: {}
            });
        }
    }
    _insertAuctionInfo(message) {
        var auctionInfo = new TenJadeAuctionInfoData();
        auctionInfo.initData(message);
        var node = LinkedList.node(auctionInfo);
        var head = this._auctionInfoQueue.getFirst();
        if (!head) {
            this._auctionInfoQueue.addAtTail(node);
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION);
        }
    }
    _deleteAuctionInfo(message) {
        var head = this._auctionInfoQueue.getFirst();
        if (!head) {
            return;
        }
        var p = head;
        while (p) {
            if (p.data.getAuction_id() == message.auction_id) {
                this._auctionInfoQueue.remove(p);
            }
            p = p.next;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_TEN_JADE_AUCTION);
    }
    getCurAuctionInfo() {
        var firstNode = this._auctionInfoQueue.getFirst();
        var curTime = G_ServerTime.getTime();
        while (firstNode) {
            var auctionInfo = firstNode.data;
            if (auctionInfo.isEnd()) {
                this._auctionInfoQueue.remove(firstNode);
                firstNode = this._auctionInfoQueue.getFirst();
            } else {
                break;
            }
        }
        if (firstNode) {
            return firstNode.data;
        }
        return null;
    }
    getCurAuctionStartTime() {
        var auctionInfo = this.getCurAuctionInfo();
        return auctionInfo.getStart_time();
    }
    getCurAuctionEndTime() {
        var auctionInfo = this.getCurAuctionInfo();
        return auctionInfo.getEnd_time();
    }
    requestCurAuctionItem() {
        var auctionInfo = this.getCurAuctionInfo();
        if (auctionInfo) {
            this.c2sGetCrossAuctionInfo(auctionInfo.getAuction_id());
        }
    }
    hasAuction() {
        return this._auctionInfoQueue.count() > 0;
    }
    getTagItemList() {
        return this._tagItemList;
    }
    getTagNameList() {
        return this._tagNameList;
    }
    getItemDataWithItemId(itemId) {
        return this._idItemMap['k' + itemId];
    }
}