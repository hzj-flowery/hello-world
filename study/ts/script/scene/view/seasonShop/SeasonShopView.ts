const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground'
import { G_UserData, G_SignalManager, G_SceneManager, G_GameAgent, G_ConfigLoader, G_ConfigManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import ViewBase from '../../ViewBase';
import { Lang } from '../../../lang/Lang';
import { ShopHelper } from '../shop/ShopHelper';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { clone } from '../../../utils/GlobleFunc';
import ListView from '../recovery/ListView';
import { handler } from '../../../utils/handler';
import { MessageErrorConst } from '../../../const/MessageErrorConst';
import SeasonShopCell from './SeasonShopCell';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { ShopConst } from '../../../const/ShopConst';

@ccclass
export default class SeasonShopView extends ViewBase {

    @property({ type: CommonDlgBackground, visible: true })
    _commonBackground: CommonDlgBackground = null;

    @property({ type: cc.Label, visible: true })
    _textTitle: cc.Label = null;

    @property({ type: ListView, visible: true })
    _listView: ListView = null;

    @property({ type: cc.Sprite, visible: true })
    _pendant: cc.Sprite = null;

    @property({ type: CommonTopbarBase, visible: true })
    _topbarBase: CommonTopbarBase = null;

    @property({ type: cc.Prefab, visible: true })
    _seasonShopCellPrefab: cc.Prefab = null;

    public static waitEnterMsg(callBack) {
        function onMsgCallBack(id, message) {
            callBack();
        }
        G_UserData.getSeasonSport().c2sFightsEntrance();
        var signal = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, onMsgCallBack);
        return signal;
    }

    private _selectTabIndex;
    private _goodIds;
    private _shopData;
    private _shopId;
    private _itemList: any[];

    private _signalUpdateShopGoods;
    private _signalListnerSeasonEnd;

    public onCreate() {
        this.setSceneSize();
        this._selectTabIndex = 1;
        this._goodIds = {};
        G_ConfigManager.checkCanRecharge() && this._topbarBase.setImageTitle('txt_sys_fight_shangdian');
        this._textTitle.string =  G_ConfigManager.checkCanRecharge() ? Lang.get('season_shop_title') : "道具兑换";
        this._initTopBarRes();
        this._initListView();
    }

    private _initTopBarRes() {
        this._shopData = G_UserData.getShops().getShopCfgById(ShopConst.SEASOON_SHOP);
        this._shopId = this._shopData.shop_id;
        var resList = ShopHelper.getResListByShopCfg(this._shopData);
        if (resList.length <= 0) {
            this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        } else {
            var len = 3 - resList.length;
            var resTemp = [];
            for (let i = 0; i < resList.length; i++) {
                resTemp.push(resList[i]);
            }
            for (let i = 0; i < len; i++) {
                resTemp.unshift({
                    type: 0,
                    value: 0
                })
            }
            this._topbarBase.updateUIByResList(resTemp);
        }
    }

    private _initListView() {
        this._listView.setTemplate(this._seasonShopCellPrefab);
        this._listView.setCallback(handler(this, this._onItemUpdate));
    }

    public onEnter() {
        this._signalUpdateShopGoods = G_SignalManager.add(SignalConst.EVENT_SHOP_INFO_NTF, handler(this, this._onEventUpdateShopGoods));
        this._signalListnerSeasonEnd = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_END, handler(this, this._onEventListnerSeasonEnd));
        this._updateData();
        this._updateView();
        G_UserData.getShops().c2sGetShopInfo(ShopConst.SEASOON_SHOP);
    }

    public onExit() {
        this._signalUpdateShopGoods.remove();
        this._signalListnerSeasonEnd.remove();
        this._signalUpdateShopGoods = null;
        this._signalListnerSeasonEnd = null;
    }

    private _onEventListnerSeasonEnd() {
        G_SceneManager.popScene();
        G_UserData.getSeasonSport().c2sFightsEntrance();
    }

    private _updateData() {
        this._itemList = [];
        this._itemList = G_UserData.getShops().getShopGoodsList(this._shopId, 1);
    }

    private _updateView() {
        // var lineCount = Math.ceil(this._itemList.length / 2);
        var lineCount = Math.ceil(this._itemList.length);
        this._listView.clearAll();
        this._listView.resize(lineCount);
    }

    private _onEventUpdateShopGoods(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.shop_id != ShopConst.SEASOON_SHOP) {
            return;
        }
        this._updateData();
        this._updateView();
    }

    private _onItemUpdate(node: cc.Node, index) {
        let item: SeasonShopCell = node.getComponent(SeasonShopCell);
        item.setCustomCallback(handler(this, this._onItemTouch));
        if (this._itemList && this._itemList.length > 0) {
            item.updateUI(index, this._itemList[index]);
        }
    }

    private _onItemSelected(item, index) {
    }

    private _onItemTouch(index) {
        var shopItemData =this._itemList[index];
        if (shopItemData == null) {
            return;
        }
        var fixData = shopItemData.getConfig();
        var type = fixData['price1_type'];
        var value = fixData['price1_value'];
        var size = fixData['price1_size'];
        var itemId = fixData['value'];
        if (type == ShopConst.NORMAL_SHOP_SUB_MONEY) {
            var VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
            var Item = G_ConfigLoader.getConfig(ConfigNameConst.ITEM);
            var payCfg = VipPay.get(value);
            var itemCfg = Item.get(itemId);
            G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, itemCfg.name, itemCfg.name);
            return;
        }
        var success = LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, true)[0];
        if (success == false) {
            return;
        }
        UIPopupHelper.popupFixShopBuyItem(shopItemData);
    }

    private _getItemDataByPos(pos) {
        var itemList = this._itemList;
        if (pos > 0 && pos <= itemList.length) {
            return itemList[pos];
        }
        return null;
    }
}