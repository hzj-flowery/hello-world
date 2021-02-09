const {ccclass, property} = cc._decorator;

import CommonTabGroupHorizon from '../../../ui/component/CommonTabGroupHorizon'

import CommonFullScreen from '../../../ui/component/CommonFullScreen'

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import ViewBase from '../../ViewBase';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { table } from '../../../utils/table';
import { MessageErrorConst } from '../../../const/MessageErrorConst';
import { G_UserData, G_SignalManager } from '../../../init';
import { handler } from '../../../utils/handler';
import { ShopActiveDataHelper } from '../../../utils/data/ShopActiveDataHelper';
import { ShopHelper } from '../shop/ShopHelper';
import { SignalConst } from '../../../const/SignalConst';
import { Lang } from '../../../lang/Lang';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { ShopConst } from '../../../const/ShopConst';

@ccclass
export default class GachaGoldShopView extends ViewBase {

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;

    @property({
        type: CommonTabGroupHorizon,
        visible: true
    })
    _tabGroup: CommonTabGroupHorizon = null;

    @property({
        type:CommonCustomListViewEx,
        visible:true
    })
    _listView:CommonCustomListViewEx = null;

    @property(cc.Prefab)
    goldHeroShopItemCell:cc.Prefab = null;

    
    _itemList: any;
    _selectTabIndex: any;
    _shopId: any;
    _shopData: any;
    _signalUpdateShopGoods: any;
    _goodIds: any[];


    onCreate() {
        this.setSceneSize();
        this._selectTabIndex = 1;
        this._goodIds = [];
        this._topbarBase.setImageTitle('txt_sys_com_jinjiangshangdian');
        this._commonFullScreen.setTitle(Lang.get('gacha_goldenhero_shop_title'));
        this._initTopBarRes();
        this._initTabNode();
        this._initListView();
    }
    onEnter() {
        this._signalUpdateShopGoods = G_SignalManager.add(SignalConst.EVENT_SHOP_INFO_NTF, handler(this, this._onEventUpdateShopGoods));
        this._updateData();
        G_UserData.getShops().c2sGetShopInfo(ShopConst.ALL_SERVER_GOLDHERO_SHOP);
    }
    onExit() {
        this._signalUpdateShopGoods.remove();
        this._signalUpdateShopGoods = null;
    }
    _initTopBarRes() {
        this._shopData = G_UserData.getShops().getShopCfgById(ShopConst.ALL_SERVER_GOLDHERO_SHOP);
        this._shopId = this._shopData.shop_id;
        var resList = ShopHelper.getResListByShopCfg(this._shopData);
        if (resList.length <= 0) {
            this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        } else {
            var len = 3 - resList.length;
            var resTemp = [];

            for (var i = 1; i<=len; i++) {
                table.insert(resTemp, {
                    type: 0,
                    value: 0
                });
            }
            for(var i=0; i<resList.length; i++){
                resTemp.push(resList[i]);
            }
            this._topbarBase.updateUIByResList(resTemp);
        }
    }
    _initTabNode() {
        var tabNameList = ShopActiveDataHelper.getShopSubTab(ShopConst.ALL_SERVER_GOLDHERO_SHOP);
        var param = {
            isVertical: 2,
            callback: handler(this, this._onTabSelect),
            textList: tabNameList
        };
        this._tabGroup.recreateTabs(param);
    }
    _onTabSelect(index, sender) {
        this._selectTabIndex = index+1;
        this._updateData();
    }
    _initListView() {
        this._listView.setTemplate(this.goldHeroShopItemCell);
        this._listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        this._listView.setCustomCallback(handler(this, this._onItemTouch));
    }
    private _curOffset:cc.Vec2 = cc.v2(0,0);
    //更新数据
    _updateData() {
        this._itemList = [];
        this._itemList = G_UserData.getShops().getShopGoodsList(this._shopId, this._selectTabIndex);
        this._updateView();
        this._listView.scrollToOffset(this._curOffset);
    }
    _updateView() {
        var lineCount = Math.ceil(this._itemList.length / 2);
        this._listView.clearAll();
        this._listView.resize(lineCount);
    }
    _onEventUpdateShopGoods(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if ((message['shop_id']) != ShopConst.ALL_SERVER_GOLDHERO_SHOP) {
            return;
        }
        this._updateData();
    }
    _onItemUpdate(item, index) {
        var startIndex = index * 2;
        if (this._itemList && this._itemList.length > 0) {
            var itemLine = [];
            var itemData1 = this._itemList[startIndex], itemData2 = this._itemList[startIndex + 1];
            if (itemData1) {
                table.insert(itemLine, itemData1);
            }
            if (itemData2) {
                table.insert(itemLine, itemData2);
            }
            item.updateUI(index, itemLine, this._selectTabIndex);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, itemPos) {
        var lineIndex = index;
        this._curOffset = this._listView.getScrollOffset();
        var shopItemData = this._getItemDataByPos(itemPos);
        if (shopItemData == null) {
            return;
        }
        var [success, erroMsg, funcName] = LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, true);
        if (success == false) {
            return;
        }
        UIPopupHelper.popupFixShopBuyItem(shopItemData, FunctionConst.FUNC_GACHA_GOLDENHERO_SHOP);
    }
    _getItemDataByPos(pos) {
        var itemList = this._itemList;
        if (pos > 0 && pos <= itemList.length) {
            return itemList[pos-1];
        }
        return null;
    }    

}
