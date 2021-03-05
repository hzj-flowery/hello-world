import { FunctionConst } from "../../../const/FunctionConst";
import { ShopConst } from "../../../const/ShopConst";
import { SignalConst } from "../../../const/SignalConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import { G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import CommonDlgBackground from "../../../ui/component/CommonDlgBackground";
import CommonFullScreen from "../../../ui/component/CommonFullScreen";
import CommonListView from "../../../ui/component/CommonListView";
import CommonListViewLineItem from "../../../ui/component/CommonListViewLineItem";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import { clone2 } from "../../../utils/GlobleFunc";
import { handler } from "../../../utils/handler";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { table } from "../../../utils/table";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import ViewBase from "../../ViewBase";
import { ShopHelper } from "../shop/ShopHelper";


const { ccclass, property } = cc._decorator;

@ccclass
export class PetPetShopView extends ViewBase{

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;
 
    @property({
        type: CommonFullScreen,
        visible: true
    })
    _nodeBg: CommonFullScreen = null;
 
    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;
 
     @property({
         type: CommonCustomListViewEx,
         visible: true
     })
     _listView: CommonCustomListViewEx = null;

     @property({
        type: cc.Prefab,
        visible: true
    })
    _ShopViewItemCell: cc.Prefab = null;
    

    name: 'PetPetShopView';
    private _itemList:any;
    private _selectTabIndex:number;
    private _signalUpdateShopGoods:any;
    onCreate() {
        this.setSceneSize();
        this._selectTabIndex = 1;
        this._itemList = {};
        var shopCfg = G_UserData.getShops().getShopCfgById(ShopConst.RED_PET_SHOP);
        var resList = ShopHelper.getResListByShopCfg(shopCfg);
        if (resList.length <= 0) {
            this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        } else {
            var len = 3 - resList.length;
            var resTemp = [];
            for(var j in resList)
            resTemp.push(resList[j]);
            for (var i = 1; i <= len; i++) {
                table.insertValueByPos(resTemp,0, {
                    type: 0,
                    value: 0
                });
            }
            this._topbarBase.updateUIByResList(resTemp);
        }
        this._topbarBase.setImageTitle('txt_sys_qilingshangdian');
        this._nodeBg.setTitle(Lang.get('shop_tab_RedPet'));
        this._initListView();
    }
    _initListView() {
        this._listView.setTemplate(this._ShopViewItemCell);
        this._listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        this._listView.setCustomCallback(handler(this, this._onItemTouch));
    }
    onEnter() {
        this._signalUpdateShopGoods = G_SignalManager.add(SignalConst.EVENT_SHOP_INFO_NTF, handler(this, this._onEventShopUpdate));
        this._updateData();
        this._updateView();
        G_UserData.getShops().c2sGetShopInfo(ShopConst.RED_PET_SHOP);
    }
    onExit() {
        this._signalUpdateShopGoods.remove();
        this._signalUpdateShopGoods = null;
    }
    _updateData() {
        this._itemList = {};
        this._itemList = G_UserData.getShops().getShopGoodsList(ShopConst.RED_PET_SHOP, 1);
    }
    _updateView() {
        var lineCount = Math.ceil(this._itemList.length / 2);
        this._listView.resize(lineCount);
    }
    _onItemUpdate(item, index) {
        var startIndex = index * 2;
        if (this._itemList && this._itemList.length > 0) {
            // var itemLine = [];
            // var itemData1 = this._itemList[startIndex], itemData2 = this._itemList[startIndex + 1];
            // if (itemData1) {
            //     table.insert(itemLine, itemData1);
            // }
            // if (itemData2) {
            //     table.insert(itemLine, itemData2);
            // }
            // item.update(index, itemLine, this._selectTabIndex);
            var startIndex = index * 2;
            var data = [];
            if(this._itemList[startIndex]!=null)
            data.push(this._itemList[startIndex]);
            if(this._itemList[startIndex+1]!=null)
            data.push(this._itemList[startIndex+1]);
            item.updateUI(index,data.length>0?data:null,0);

        }
    }
    _onItemSelected(item, index) {
    }
    _getItemDataByPos(pos) {
        var itemList = this._itemList;
        if (pos > 0 && pos <= itemList.length) {
            return itemList[pos-1];
        }
        return null;
    }
    _onItemTouch(index, itemPos) {
        var lineIndex = index;
        var shopItemData = this._getItemDataByPos(itemPos);
        if (shopItemData == null) {
            return;
        }
        var [success, erroMsg, funcName] = LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, true);
        if (success == false) {
            return;
        }
        UIPopupHelper.popupFixShopBuyItem(shopItemData, FunctionConst.FUNC_RED_PET_SHOP);
    }
    _onEventShopUpdate(eventName, message) {
        if (message.shop_id != ShopConst.RED_PET_SHOP) {
            return;
        }
        this._updateData();
        this._updateView();
    }
}