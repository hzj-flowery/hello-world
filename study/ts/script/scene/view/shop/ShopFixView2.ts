// const {ccclass, property} = cc._decorator;

// import CommonTabGroupHorizon from '../../../ui/component/CommonTabGroupHorizon'

// import CommonFullScreen from '../../../ui/component/CommonFullScreen'
// import { SignalConst } from '../../../const/SignalConst';
// import ViewBase from '../../ViewBase';
// import CommonTabGroupScrollView from '../../../ui/component/CommonTabGroupScrollView';
// import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
// import CommonShopResourceInfo from '../../../ui/component/CommonShopResourceInfo';
// import { G_UserData, G_ConfigLoader, G_GameAgent, G_SignalManager } from '../../../init';
// import { ShopHelper } from './ShopHelper';
// import { handler } from '../../../utils/handler';
// import { ShopConst } from '../../../const/ShopConst';
// import { UserDataHelper } from '../../../utils/data/UserDataHelper';
// import { ConfigNameConst } from '../../../const/ConfigNameConst';
// import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
// import { UIPopupHelper } from '../../../utils/UIPopupHelper';
// var ITEM_COUNT = 4;
// @ccclass
// export default class ShopFixView2 extends ViewBase {

//     @property({
//         type: CommonFullScreen,
//         visible: true
//     })
//     _commonFullScreen: CommonFullScreen = null;

//     @property({
//         type: CommonTabGroupHorizon,
//         visible: true
//     })
//     _tabGroup2: CommonTabGroupHorizon = null;

//     @property(CommonTabGroupScrollView)
//     tabGroup: CommonTabGroupScrollView = null;


//     @property({
//         type: cc.Node,
//         visible: true
//     })
//     _listViewParent: cc.Node = null;

//     @property({
//         type: CommonCustomListViewEx,
//         visible: true
//     })
//     _listViewTab: CommonCustomListViewEx = null;

//     @property(CommonShopResourceInfo)
//     shopRes1: CommonShopResourceInfo = null;

//     @property(CommonShopResourceInfo)
//     shopRes2: CommonShopResourceInfo = null;

//     @property(cc.Prefab)
//     shopViewItemCell: cc.Prefab = null;

//     @property(cc.Prefab)
//     shopViewItemCell2: cc.Prefab = null;

//    private _itemList: any[];
//    private _shopId: number;
//    private _selectItemPos: number;
//    private _selectSubTabIndex: number;
//    private _callBackFunc: any;
//    private _isFirstCreate: boolean;
//    private _scrollViewParam: any;
//    private _subSelectTimes: number;
//    private _enterEventTimes: number;
//    private _mainView:any;
   
//    loadIndex:number = 0;
//    scheduleHandler:any;
//    tabType:number = 0;
//    selectIndex:number = -1;

//    ctor(mainView, shopId, callback) {
//     this._listViewTab = null;
//     this._tabGroup2 = null;
//     this._itemList = [];
//     this._shopId = shopId;
//     this._mainView = mainView;
//     this._selectItemPos = 1;
//     this._selectSubTabIndex = 0;
//     this._callBackFunc = callback || null;
//     this._isFirstCreate = true;
//     this.node.name = "ShopFixView2";
// }
// onCreate() {
//     var tabType = ShopHelper.getTabTypeByTab(this._shopId, 1);
//         if (tabType == 1) {
//           //assert(("ShopFixView onCreate tabType == ShopConst.TABL_TYPE_NEW");
//         }
//         let template;
//         if (tabType == ShopConst.TABL_TYPE_DEFAULT) {
//             template = this.shopViewItemCell;
//         } else {
//             template = this.shopViewItemCell2;
//         }
//         this._scrollViewParam = {
//             template: template,//ShopConst.SHOP_FIX_VIEW_CELL[tabType],
//             updateFunc: handler(this, this._onItemUpdate),
//             selectFunc: handler(this, this._onItemSelected),
//             touchFunc: handler(this, this._onItemTouch)
//         };

//     var shopCfg = G_UserData.getShops().getShopCfgById(this._shopId);

//     this._commonFullScreen.setTitle(shopCfg.shop_name);
//     this._subSelectTimes = 0;
//     this._initTab();
// }
// onEnter() {
//     this._enterEventTimes = 0;
// }
// onExit() {
// }
// _initTab() {
//     var shopId = this._shopId;
//     var param2 = {
//         callback: handler(this, this._onTabSelect2),
//         isVertical: 2,
//         offset: -2,
//         textList: UserDataHelper.getShopSubTab(shopId)
//     };
//     this._tabGroup2.recreateTabs(param2);
//     this._tabGroup2.setTabIndex(1);
// }
// setRedPointByTabIndex(index, redValue) {
//     this._tabGroup2.setRedPointByTabIndex(index, redValue);
// }
// setCallBack(callback) {
//     this._callBackFunc = callback;
// }
// _onTabSelect2(index, sender) {
//     if (this._selectSubTabIndex == index) {
//         return;
//     }
//     var lastIndex = this._selectSubTabIndex;
//     this._selectSubTabIndex = index;
//     if (this._selectSubTabIndex > 0) {
//         var oldTabType = ShopHelper.getTabTypeByTab(this._shopId, lastIndex);
//         var newTabType = ShopHelper.getTabTypeByTab(this._shopId, index);
//         if (oldTabType == newTabType) {
//             this.refreshView();
//         } else {
//             if (this._callBackFunc && typeof(this._callBackFunc) == 'function') {
//                 this._callBackFunc(index, this._shopId);
//             }
//             return;
//         }
//     }
//     if (this._subSelectTimes >= 1) {
//         this.playSubRefreshEffect();
//     }
//     this._subSelectTimes = this._subSelectTimes + 1;
// }
// getSubIndex() {
//     return this._selectSubTabIndex;
// }
// setTabIndex(index) {
//     this._tabGroup2.setTabIndex(index);
// }
// _getSelectItemList() {
//     var selectItemList = this._itemList;
//     return selectItemList;
// }
// _onItemTouch(index, itemPos) {
//     var lineIndex = index;
//         var shopItemData = this._getItemDataByPos(itemPos);
//         if (shopItemData == null) {
//             return;
//         }
//         var fixData = shopItemData.getConfig();
//         var type = fixData['price1_type'];
//         var value = fixData['price1_value'];
//         var size = fixData['price1_size'];
//         var itemId = fixData['value'];
//         if (type == ShopConst.NORMAL_SHOP_SUB_MONEY) {
//             var VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);//require('app.config.vip_pay');
//             var Item = G_ConfigLoader.getConfig(ConfigNameConst.ITEM);//require('app.config.item');

//             var payCfg = VipPay.get(value);
//             var itemCfg = Item.get(itemId);
//             G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, itemCfg.name, itemCfg.name);
//             return;
//         }
//         var [success, erroMsg, funcName] = LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, true);
//         if (success == false) {
//             return;
//         }
//         this.selectIndex = index;
//         UIPopupHelper.popupFixShopBuyItem(shopItemData);
// }
// _onItemSelected(item, index) {
// }
// _onItemUpdate(item, index) {
//     var startIndex = index * ITEM_COUNT;
//     // logWarn('ShopFixView2:_onItemUpdate  startIndex :: ' + (startIndex + ('       index :: ' + index)));
//     var itemList = this._getSelectItemList();
//     if (this._itemList && this._itemList.length > 0) {
//         var itemLine = [];
//         var itemData1 = this._itemList[startIndex + 1], itemData2 = this._itemList[startIndex + 2], itemData3 = this._itemList[startIndex + 3], itemData4 = this._itemList[startIndex + 4];
//         if (itemData1) {
//             itemLine.push(itemData1);
//         }
//         if (itemData2) {
//             itemLine.push(itemData2);
//         }
//         if (itemData3) {
//             itemLine.push(itemData3);
//         }
//         if (itemData4) {
//             itemLine.push(itemData4);
//         }
//         item.update(index, itemLine, this._selectSubTabIndex);
//     }
// }
// refreshView(needAnimation?) {
//     this._itemList = [];
//     var shopMgr = G_UserData.getShops();
//     var shopId = this._shopId;
//     var subIndex = ShopHelper.convertSubIndexToSubId(shopId, this._selectSubTabIndex);
//     var itemList = shopMgr.getShopGoodsList(shopId, subIndex);
//     this._itemList = itemList;
//     var lineCount = Math.ceil(itemList.length / ITEM_COUNT);
//     if (lineCount > 0) {
//         this._tabListView.updateListView(this._selectSubTabIndex, lineCount);
//     }
// }
// findCellItem(cellRow, cellCol) {
//     var listView = this._tabListView.getListView(this._selectSubTabIndex);
//     var ShopViewItemCell2 = listView.getSubNodeByName('ShopViewItemCell2' + cellRow);
//     var shopItemCell = listView.getSubNodeByName('_itemInfo' + cellCol);
//     return shopItemCell;
// }
// _getItemDataByPos(pos) {
//     var itemList = this._itemList;
//     if (pos > 0 && pos <= itemList.length) {
//         return itemList[pos];
//     }
//     return null;
// }
// _updateShopRes() {
//     var shopCfg = G_UserData.getShops().getShopCfgById(this._shopId);
//     var size1 = UserDataHelper.getNumByTypeAndValue(shopCfg.price1_type, shopCfg.price1_value);
//     this.shopRes1.node.active = (false);
//     if (shopCfg.price1_type > 0) {
//         this.shopRes1.updateUI(shopCfg.price1_type, shopCfg.price1_value, size1);
//         this.shopRes1.node.active = (true);
//     }
//     if (shopCfg.price2_type > 0 && shopCfg.price2_value > 0) {
//         var size2 = UserDataHelper.getNumByTypeAndValue(shopCfg.price2_type, shopCfg.price2_value);
//         this.shopRes2.updateUI(shopCfg.price2_type, shopCfg.price2_value, size2);
//         this.shopRes2.node.active = (true);
//     } else {
//         this.shopRes2.node.active = (false);
//     }
// }
// playSubRefreshEffect() {
//     var listView = this._tabListView.getListView(this._selectSubTabIndex);
//     if (listView) {
//         var postEvent = function () {
//             G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'playSubRefreshEffect');
//         }
//         listView.playEnterEffect(postEvent);
//     }
// }
// playEnterEffect() {
//     var listView = this._tabListView.getListView(this._selectSubTabIndex);
//     if (listView) {
//         var postEvent = function () {
//             if (this._enterEventTimes == 0) {
//                 G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'playEnterEffect');
//                 this._enterEventTimes = this._enterEventTimes + 1;
//             }
//         }
//         listView.playEnterEffect(postEvent);
//     }
// }
// setListViewParentVisible(trueOrFalse) {
//     this._listViewParent.active = (trueOrFalse);
// }
// getAndResetPlayRefeshEffectTag() {
//     return false;
// }


// }