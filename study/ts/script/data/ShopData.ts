import { BaseData } from "./BaseData";
import { G_NetworkManager, G_ConfigLoader, G_UserData, G_SignalManager, G_ConfigManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { Slot } from "../utils/event/Slot";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { ShopItemData } from "./ShopItemData";
import { ShopCheck } from "../utils/logic/ShopCheck";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { ArraySort } from "../utils/handler";
import { ShopConst } from "../const/ShopConst";







function isFixShop(shopId) {
    let ShopInfo = G_ConfigLoader.getConfig(ConfigNameConst.SHOP);
    let shopData = ShopInfo.get(shopId);
    if (shopData.shop_type == 0) {
        return true;
    }
    if (shopData.shop_type == 1) {
        return false;
    }
    return false;
}
export class ShopData extends BaseData {
    _shopList;
    _recvGetShopData: Slot;
    _recBuyShopGoods: Slot;
    _popBuyOnceShow: boolean;
    _shopInfoList: any[];

    private  _hasInit:boolean = false;
    constructor(properties?) {
        super(properties);
        this._shopList = {};
        this._recvGetShopData = G_NetworkManager.add(MessageIDConst.ID_S2C_GetShopInfo, this._s2cGetShopInfo.bind(this));
        this._recBuyShopGoods = G_NetworkManager.add(MessageIDConst.ID_S2C_BuyShopGoods, this._s2cBuyShopGoods.bind(this));
      //  this._initShopList();
        this._popBuyOnceShow = true;
    }

    public c2sBuyShopGoods(goodId, shopId, buyCount, buyType?) {
        if (this.isExpired() == true) {
            this.c2sGetShopInfo(shopId);
            return;
        }
        let buyItem = {
            goods_id: goodId,
            shop_id: shopId,
            buy_count: buyCount || 1,
            buy_type: buyType || 0
        };
        G_NetworkManager.send(MessageIDConst.ID_C2S_BuyShopGoods, buyItem);
    }
    public c2sGetShopInfo(shopId) {
        let message = { shop_id: shopId };
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetShopInfo, message);
    }
    public c2sShopRefresh(shopId, refreshType) {
        if (this.isExpired() == true) {
            this.c2sGetShopInfo(shopId);
            return;
        }
        let message = {
            shop_id: shopId,
            refresh_type: refreshType || 1
        };
        G_NetworkManager.send(MessageIDConst.ID_C2S_ShopRefresh, message);
    }
        //------性能优化   避免构造每个ShopInfo都来取indexOf
    ShopFixs = []
    public _initFixShop(shopId) {
        this._shopList[shopId] = {};
        this._shopList[shopId].fixGoods = {};
        let ShopFix = G_ConfigLoader.getConfig(ConfigNameConst.SHOP_FIX);
        for (let i = 0; i < ShopFix.length(); i++) {
            let fixData =this.ShopFixs[i];
            if(!fixData) {
                fixData = ShopFix.indexOf(i);
                this.ShopFixs[i] = fixData;
            }
            
            if (fixData.shop_id == shopId) {
                let baseData = new ShopItemData();
                let tempTable = {
                    goods_id: fixData.id,
                    buy_count: 0,
                    goods_no: 0
                };
                baseData.initData(shopId, tempTable);
                baseData.setBuyCount(0);
                baseData.setIsHaveBuy(false);
                baseData.setIsCanBuy(false);
                this._shopList[shopId].fixGoods['k_' + fixData.id] = baseData;
            }
        }
    }
    public _updateRandomShop(shopId, randomShop) {
        this._shopList[shopId] = {};
        this._shopList[shopId].randomGoods = this._shopList[shopId].randomGoods || {};
        for (let i in randomShop.goods) {
            let value = randomShop.goods[i];
            let baseData = new ShopItemData();
            baseData.initData(shopId, value);
            let goodsNo = baseData.getGoodNo();
            this._shopList[shopId].randomGoods['k_' + goodsNo] = baseData;
        }
        this._shopList[shopId].bornTime = randomShop.born_time;
        this._shopList[shopId].todayManualCount = randomShop.today_manual_count;
        this._shopList[shopId].freeCntTime = randomShop.free_cnt_time;
        this._shopList[shopId].freeCnt = randomShop.free_cnt;
    }
    public _updateFixShop(shopId, fixShop) {
        function checkBanType(baseData) {
            let numBanType = baseData.getConfig().num_ban_type;
            let buyCount = baseData.getBuyCount();
            if (numBanType == 1) {
                if (buyCount >= 1) {
                    return true;
                }
                return false;
            }
            return false;
        }
        function checkBuyCondition(baseData, elitePassCount, explorePassCount) {
            let config = baseData.getConfig();

            let [r] = ShopCheck.shopEnoughLimit(config.limit_type, config.limit_value, elitePassCount, explorePassCount);
            if (!r) {
                return false;
            }
            return true;
        }

        for (let i in fixShop.goods) {
            let value = fixShop.goods[i];
            let baseData = new ShopItemData();
            baseData.initData(shopId, value);
            let isHaveBuy = checkBanType(baseData);
            let goodsId = baseData.getGoodId();
            baseData.setIsHaveBuy(isHaveBuy);
            this._shopList[shopId].fixGoods['k_' + goodsId] = baseData;
        }
         //elitePassCount?, explorePassCount?  性能优化，外层如果有for循环的, 先在外层计算然后传进来
        var elitePassCount = G_UserData.getChapter().getElitePassCount();
        var explorePassCount = G_UserData.getExplore().getExplorePassCount();

        if(this._shopList[shopId].fixGoods) {
            for (let i in this._shopList[shopId].fixGoods) {
                let value = this._shopList[shopId].fixGoods[i];
                let isCanBuy = checkBuyCondition(value, elitePassCount, explorePassCount);
                value.setIsCanBuy(isCanBuy);
            }
        }
    }
    public _updateActiveShop(shopId, activeShop) {
        G_UserData.getShopActive().updateShopList(activeShop.goods);
    }
    public _s2cBuyShopGoods(id, message) {
        G_SignalManager.dispatch(SignalConst.EVENT_BUY_ITEM, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_SHOP_SCENE);
    }
    public _s2cGetShopInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (!this._hasInit) {
            this._hasInit = true;
            this._initShopList();
        }
        let shopId = message.shop_id;
        if (shopId == null) {
            return;
        }
        this.resetTime();
        let fixShop = message['fixed_shop'];
        let randomShop = message['random_shop'];
        let activeShop = message['active_shop'];
        if (fixShop) {
            this._updateFixShop(shopId, fixShop);
        }
        if (randomShop) {
            this._updateRandomShop(shopId, randomShop);
        }
        if (activeShop) {
            this._updateActiveShop(shopId, activeShop);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SHOP_INFO_NTF, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_SHOP_SCENE);
        G_SignalManager.dispatch(SignalConst.EVENT_SHOP_NEW_REMIND_UPDATE);
    }
    public clear() {
        this._recvGetShopData.remove();
        this._recvGetShopData = null;
        this._recBuyShopGoods.remove();
        this._recBuyShopGoods = null;
    }
    public reset() {
        this._shopList = {};
    }
    public getShopGoodsById(shopId, goodsId) {
        if (this._shopList == null) {
            return null;
        }
        if (isFixShop(shopId)) {
            return this._shopList[shopId].fixGoods['k_' + goodsId];
        }
        return this._shopList[shopId].randomGoods['k_' + goodsId];
    }
    public getShopGoodsList(shopId, subId?) {
        if (this._shopList == null) {
            return [];
        }
        if (isFixShop(shopId)) {
            return this._getFixShopGoods(shopId, subId);
        }
        return this._getRandomShopGoods(shopId);
    }
    public getFixShopGoodsByResId(shopId, type, value) {
        if (!this.isShopOpened(shopId)) {
            return null;
        }
        if (this._shopList == null || !this._shopList[shopId]) {
            return null;
        }
        let fixGoods = this._shopList[shopId].fixGoods;
        if (!fixGoods) {
            return null;
        }
        for (let k in fixGoods) {
            let v = fixGoods[k];
            let config = v.getConfig();
            if (config.type == type && config.value == value) {
                return v;
            }
        }
        return false;
    }
    public isRandomShopFreeMax(shopId) {
        let shopInfo = this.getRandomShopInfo(shopId);
        if (shopInfo) {
            let isFull = shopInfo.freeCnt == shopInfo.freeCntTotal;
            return isFull;
        }
        return false;
    }
    public getRandomShopInfo(shopId) {
        if (this._shopList == null) {
            return null;
        }
        if (isFixShop(shopId)) {
            return null;
        }
        let randomShop = this._shopList[shopId];
        if (randomShop == null) {
            return null;
        }

        let randomShopCfg = this.getShopCfgById(shopId);
        let shopInfo: any = {
            bornTime: randomShop.bornTime,
            todayManualCount: randomShop.todayManualCount || 0,
            freeCntTime: randomShop.freeCntTime,
            freeCnt: randomShop.freeCnt,
            freeCntTotal: randomShopCfg.free_times_max,
            costType: randomShopCfg.type,
            costValue: randomShopCfg.value,
            costSize: randomShopCfg.size,
            refreshCntTotal: UserDataHelper.getVipValueByType(randomShopCfg.refresh_vip_type),
            goodList: this.getShopGoodsList(shopId),
            cfg: randomShopCfg
        };
        shopInfo.surplusTimes = 0;
        shopInfo.surplusTimes = shopInfo.refreshCntTotal - shopInfo.todayManualCount;
        return shopInfo;
    }
    public isShopOpened(shopId) {
        let ShopInfo = G_ConfigLoader.getConfig(ConfigNameConst.SHOP);
        let shopCfg = ShopInfo.get(shopId);
        console.assert(shopCfg, 'shop_info not find id ' + String(shopId));
        if (!LogicCheckHelper.funcIsOpened(shopCfg.function_id)[0]) {
            return false;
        }
        return true;
    }
    public isFixShopItemDataCanBuy(shopData, checkType) {
        function checkItemType(baseData, item) {
            let itemConfig = baseData.getConfig();
            let numBanType = itemConfig.num_ban_type;
            let buyCount = baseData.getBuyCount();
            let vipTimes = baseData.getVipBuyTimes();
            if (numBanType == 2) {
                if (itemConfig.price1_type == item.type && itemConfig.price1_value == item.value && buyCount < vipTimes) {
                    return true;
                }
            }
            return false;
        }
        function checkBuyCondition(baseData) {
            let config = baseData.getConfig();

            let [r] = ShopCheck.shopEnoughLimit(config.limit_type, config.limit_value);
            if (!r){
                return false;
            }
            if (ShopCheck.shopFixBuyCheck(baseData, 1, false)[0] == false) {
                return false;
            }
            return true;
        }
        if (checkItemType(shopData, checkType) && checkBuyCondition(shopData)) {
            return true;
        }
        return false;
    }
    public isFixShopTypeItemCanBuy(shopId, subId, checkType?) {
        checkType = checkType || {
            type: 5,
            value: 2
        };
        if (!this.isShopOpened(shopId)) {
            return false;
        }
        let itemList = this._getFixShopGoods(shopId, subId);
        for (let i in itemList) {
            let data = itemList[i];
            if (this.isFixShopItemDataCanBuy(data, checkType) == true) {
                return true;
            }
        }
        return false;
    }
    public isFixShopGoodsCanBuy(shopId, subId) {
        if (!this.isShopOpened(shopId)) {
            return false;
        }
        function checkBanType(baseData) {
            let numBanType = baseData.getConfig().num_ban_type;
            let buyCount = baseData.getBuyCount();
            if (numBanType == 1) {
                if (buyCount >= 1) {
                    return true;
                }
                return false;
            }
            return false;
        }
        function checkBuyCondition(baseData, elitePassCount, explorePassCount) {
            let config = baseData.getConfig();

            let [r] = ShopCheck.shopEnoughLimit(config.limit_type, config.limit_value, elitePassCount, explorePassCount);
            if (!r) {
                return false;
            }
            //cc.warn('ShopData:isFixShopGoodsCanBuy');
            if (ShopCheck.shopFixBuyCheck(baseData, 1, false)[0] == false) {
                return false;
            }
            return true;
        }
         //elitePassCount?, explorePassCount?  性能优化，外层如果有for循环的, 先在外层计算然后传进来
        var elitePassCount = G_UserData.getChapter().getElitePassCount();
        var explorePassCount = G_UserData.getExplore().getExplorePassCount();

        let itemList = this._getFixShopGoods(shopId, subId);
        for (let i in itemList) {
            let data = itemList[i];
            if (checkBanType(data) == false && checkBuyCondition(data, elitePassCount, explorePassCount) == true) {
                return true;
            }
        }
        return false;
    }
    public _getFixShopGoods(shopId, subId) {
        let tempList = [];

        let subTab = subId || 1;
        this._shopList[shopId] = this._shopList[shopId] || {};
        let fixList = this._shopList[shopId].fixGoods || {};
        function buyCondition() {
        }
        function filterGoods(cfg) {
            if (cfg.is_true == 0) {
                return true;
            }
            if (cfg.tab != subTab) {
                return true;
            }
            let playerLevel = G_UserData.getBase().getLevel();
            let levelMin = cfg.level_min;
            let levelMax = cfg.level_max;
            let levelShow = cfg.level_show;
            let showControl = cfg.show_control;
            let isAppStore = G_ConfigManager.isAppstore();
            // let isAppStore = false;
            // cc.warn({
            //     cfg: cfg,
            //     isAppStore: isAppStore,
            //     showControl: showControl
            // });
            if (showControl != 0) {
                if (isAppStore && showControl == ShopConst.SHOW_CONTORL_NO_APPSTORE) {
                    return true;
                }
                let isAppStoreAndNotInAppstore = isAppStore && showControl != ShopConst.SHOW_CONTORL_APPSTORE;
                if (isAppStoreAndNotInAppstore || !isAppStore) {
                    return true;
                }
            }
            if (LogicCheckHelper.enoughOpenDay(cfg.day) == false) {
                return true;
            }
            if (playerLevel < levelShow || playerLevel > levelMax) {
                return true;
            }
            return false;
        }
        function checkAndSetIsOwn(unitData) {
            if (unitData.getConfig().type == TypeConvertHelper.TYPE_AVATAR) {
                let isHave = G_UserData.getAvatar().isHaveWithBaseId(unitData.getConfig().value);
                unitData.setIsHaveBuy(isHave);
            }
        }
        let useSortNormal = true;
        for (let key in fixList) {
            let value = fixList[key];
            let config = value.getConfig();
            if (filterGoods(config) == false) {
                checkAndSetIsOwn(value);
                tempList.push(value);
            }
            if (config.num_ban_type == 1) {
                useSortNormal = false;
            }
        }
        function sortNormal(tempList) {
            ArraySort(tempList, function (a, b) {
                let configA = a.getConfig();
                let configB = b.getConfig();
                return configA.order < configB.order;
            });
        }
        function sortNumBanType1(tempList) {
            ArraySort(tempList, function (a, b) {
                let configA = a.getConfig();
                let configB = b.getConfig();
                if (a.getIsHaveBuy() != b.getIsHaveBuy()) {
                    return !a.getIsHaveBuy();
                }
                if (a.getIsCanBuy() != b.getIsCanBuy()) {
                    return a.getIsCanBuy();
                }
                return configA.order < configB.order;
            });
        }
        if (useSortNormal) {
            //cc.warn('sortNormal shopId[%d] subId[%d]'.format(shopId, subId));
            sortNormal(tempList);
        } else {
            //cc.warn('sortNumBanType1 shopId[%d] subId[%d]'.format(shopId, subId));
            sortNumBanType1(tempList);
        }
        return tempList;
    }
    public _getRandomShopGoods(shopId) {
        let tempList = [];
        this._shopList[shopId] = this._shopList[shopId] || {};
        let goodList = this._shopList[shopId].randomGoods || {};
        for (let key in goodList) {
            let value = goodList[key];
            tempList.push(value);
        }
        ArraySort(tempList, function (a, b) {
            let qa = a.getGoodNo(), qb = b.getGoodNo();
            return qa < qb;
        });
        return tempList;
    }
    public _initShopList() {
        if (this._shopInfoList == null) {
            let ShopInfo = G_ConfigLoader.getConfig(ConfigNameConst.SHOP);
            this._shopInfoList = [];
            for (let i = 0; i < ShopInfo.length(); i++) {
                let data = ShopInfo.indexOf(i);
                this._shopInfoList.push(data);
                if (isFixShop(data.shop_id)) {
                    this._initFixShop(data.shop_id);
                }
            }
        }
    }
    public getShopCfgList() {
        let ShopInfo = G_ConfigLoader.getConfig(ConfigNameConst.SHOP);
        if (this._shopInfoList == null) {
            this._shopInfoList = [];
            for (let i = 0; i < ShopInfo.length(); i++) {
                this._shopInfoList.push(ShopInfo.indexOf(i));
            }
        }
        return this._shopInfoList;
    }
    public getShopCfgByTabIndex(tabIndex) {
        let shopInfo = this._shopInfoList[tabIndex];
        return shopInfo;
    }
    public getShopCfgById(shopId) {
        for (let i in this._shopInfoList) {
            let shopInfo = this._shopInfoList[i];
            if (shopInfo.shop_id == shopId) {
                return shopInfo;
            }
        }
        return null;
    }
    public setBuyOnceShow(needShow) {
        this._popBuyOnceShow = needShow;
    }
    public getBuyOnceShow() {
        return this._popBuyOnceShow;
    }
}
