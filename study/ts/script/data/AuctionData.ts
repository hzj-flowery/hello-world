import { G_NetworkManager, G_ServerTime, G_SignalManager, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { handler } from "../utils/handler";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { AuctionConst } from "../const/AuctionConst";
import { SignalConst } from "../const/SignalConst";
import { BaseData } from "./BaseData";
import { ConfigManager } from "../manager/ConfigManager";
import { assert } from "../utils/GlobleFunc";

let auction_schema = {};
auction_schema['id'] = [
    'number',
    0
];
auction_schema['item'] = [
    'object',
    {}
];
auction_schema['init_price'] = [
    'number',
    0
];
auction_schema['add_price'] = [
    'number',
    0
];
auction_schema['now_price'] = [
    'number',
    0
];
auction_schema['now_buyer'] = [
    'number',
    0
];
auction_schema['final_price'] = [
    'number',
    0
];
auction_schema['open_time'] = [
    'number',
    0
];
auction_schema['start_time'] = [
    'number',
    0
];
auction_schema['end_time'] = [
    'number',
    0
];
auction_schema['boss_id'] = [
    'number',
    0
];
auction_schema['order_id'] = [
    'number',
    0
];
auction_schema['money_type'] = [
    'number',
    0
];

export interface AuctionItemData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getItem(): any
    setItem(value: any): void
    getLastItem(): any
    getInit_price(): number
    setInit_price(value: number): void
    getLastInit_price(): number
    getAdd_price(): number
    setAdd_price(value: number): void
    getLastAdd_price(): number
    getNow_price(): number
    setNow_price(value: number): void
    getLastNow_price(): number
    getNow_buyer(): number
    setNow_buyer(value: number): void
    getLastNow_buyer(): number
    getFinal_price(): number
    setFinal_price(value: number): void
    getLastFinal_price(): number
    getOpen_time(): number
    setOpen_time(value: number): void
    getLastOpen_time(): number
    getStart_time(): number
    setStart_time(value: number): void
    getLastStart_time(): number
    getEnd_time(): number
    setEnd_time(value: number): void
    getLastEnd_time(): number
    getBoss_id(): number
    setBoss_id(value: number): void
    getLastBoss_id(): number
    getOrder_id(): number
    setOrder_id(value: number): void
    getLastOrder_id(): number
    getMoney_type():number
    setMoney_type(value:number):void
}
export class AuctionItemData extends BaseData {
    public static schema = auction_schema;
}

var auctionIdDataMap = {};
auctionIdDataMap['guild'] = [[
    null,
    '_guildAuctionBaseInfo'
]];
auctionIdDataMap['world'] = [
    [
        AuctionConst.AC_TYPE_WORLD_ID,
        '_worldAuctionBaseInfo'
    ],
    [
        AuctionConst.AC_TYPE_ARENA_ID,
        '_worldAuctionBaseInfo'
    ],
    [
        AuctionConst.AC_TYPE_PERSONAL_ARENA_ID,
        '_worldAuctionBaseInfo'
    ],
    [
        AuctionConst.AC_TYPE_GUILDCROSSWAR_ID,
        '_worldAuctionBaseInfo'
    ]
];
auctionIdDataMap['guildWar'] = [[
    AuctionConst.AC_TYPE_WAR_TRADE_ID,
    '_guildWarActionBaseInfo'
]];
auctionIdDataMap['gm'] = [[
    AuctionConst.AC_TYPE_GM_ID,
    '_gmAuctionBaseInfo'
]];

export class AuctionData extends BaseData {
    public static schema = {};

    private _recvGetAuctionInfo;
    private _recvAuction;
    private _recvGetAuctionLog;
    private _recvAuctionBuyerReplace;
    private _recvUpdateAuctionItem;
    private _recvGetAllAuctionInfo;
    private _auctionDataMap;
    private _bonusMap;
    private _endTimeMap;
    private _canBonus;
    private _cfgList;

    private _yubiBonusMap;
    private _canYubi;
    private _auctionItemMap;
    private _guildAuctionBaseInfo;
    private _worldAuctionBaseInfo;
    private _guildWarActionBaseInfo;
    private _gmAuctionBaseInfo;
    private _curGetAuctionType;

    constructor() {
        super()
        this._recvGetAuctionInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetAuctionInfo, this._s2cGetAuctionInfo.bind(this));
        this._recvAuction = G_NetworkManager.add(MessageIDConst.ID_S2C_Auction, this._s2cAuction.bind(this));
        this._recvGetAuctionLog = G_NetworkManager.add(MessageIDConst.ID_S2C_GetAuctionLog, this._s2cGetAuctionLog.bind(this));
        this._recvAuctionBuyerReplace = G_NetworkManager.add(MessageIDConst.ID_S2C_AuctionBuyerReplace, this._s2cAuctionBuyerReplace.bind(this));
        this._recvUpdateAuctionItem = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateAuctionItem, this._s2cUpdateAuctionItem.bind(this));
        this._recvGetAllAuctionInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetAllAuctionInfo, this._s2cGetAllAuctionInfo.bind(this));
        this._auctionDataMap = [];
        this._bonusMap = {};
        this._yubiBonusMap = {};
        this._canYubi = {};
        this._endTimeMap = {};
        this._canBonus = {};
        this._cfgList = {};

        this._auctionItemMap = {};
        this._guildAuctionBaseInfo = {};
        this._worldAuctionBaseInfo = {};
        this._guildWarActionBaseInfo = {};
        this._gmAuctionBaseInfo = {};
        this._curGetAuctionType = null;

        this._initCfg();
    }

    public c2sGetAuctionInfo(auctionType) {
        auctionType = auctionType || 1;
        var message = { auction_type: auctionType };
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetAuctionInfo, message);
    }

    public c2sGetAllAuctionInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetAllAuctionInfo, {});
    }

    public c2sAuction(mainType, itemId, configId, auctionType) {
        var message = {
            main_type: mainType,
            config_id: configId,
            item_id: itemId,
            auction_type: auctionType
        };
        G_NetworkManager.send(MessageIDConst.ID_C2S_Auction, message);
    }

    public c2sGetAuctionLog(auctionType) {
        var message = { auction_type: auctionType };
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetAuctionLog, message);
    }

    public _initCfg() {
        this._cfgList = [];
        var auctionCfg = G_ConfigLoader.getConfig(ConfigNameConst.AUCTION);
        for (var i = 0; i < auctionCfg.length(); i++) {
            var data = auctionCfg.indexOf(i);
            this._cfgList.push(data);
        }
    }

    public getListByMainType(mainType): any[] {
        var idList = [];
        for (let i = 0; i < this._cfgList.length; i++) {
            var value = this._cfgList[i];
            if (value.auction_type == mainType) {
                idList.push(value);
            }
        }
        return idList;
    }

    public clear() {
        this._recvGetAuctionInfo.remove();
        this._recvGetAuctionInfo = null;
        this._recvAuction.remove();
        this._recvAuction = null;
        this._recvGetAuctionLog.remove();
        this._recvGetAuctionLog = null;
        this._recvAuctionBuyerReplace.remove();
        this._recvAuctionBuyerReplace = null;
        this._recvGetAllAuctionInfo.remove();
        this._recvGetAllAuctionInfo = null;
        this._recvUpdateAuctionItem.remove();
        this._recvUpdateAuctionItem = null;
    }

    public reset() {
    }

    public isAuctionShow(configId) {
        var endTime = this._endTimeMap['k' + configId];
        if (endTime && endTime > 0) {
            return G_ServerTime.getLeftSeconds(endTime) > 0;
        }
        return false;
    }

    isCrossWorldBossAuctionShow():boolean{
        if (this.isAuctionShow(AuctionConst.AC_TYPE_CROSS_WORLD_BOSS)) {
            var [itemList, bouns] = this.getAuctionData(AuctionConst.AC_TYPE_CROSS_WORLD_BOSS);
            if (itemList.length > 0) {
                return true;
            }
        }
        return false;
    }
    isAuctionCanYubi(configId):boolean {
        var canYubi = this._canYubi['k' + configId];
        if (canYubi == null) {
            return false;
        }
        return canYubi;
    }
    getYubiBonus(configId):any {
        var yubiBonus = this._yubiBonusMap['k' + configId];
        if (yubiBonus == null) {
            return 0;
        }
        return yubiBonus;
    }

    public isGuildAuctionShow() {
        if (this.isAuctionShow(AuctionConst.AC_TYPE_GUILD_ID)) {
            var itemList = this.getAuctionData(AuctionConst.AC_TYPE_GUILD_ID)[0];
            if (itemList.length > 0) {
                return true;
            }
        }
        return false;
    }

    public getAuctionEndTime(configId) {
        var endTime = this._endTimeMap['k' + configId];
        return endTime;
    }

    public isAuctionCanBonus(configId) {
        var canBonus = this._canBonus['k' + configId];
        if (canBonus == null) {
            return false;
        }
        return canBonus;
    }

    public getBonus(configId) {
        var bonus = this._bonusMap['k' + configId];
        if (bonus == null) {
            return 0;
        }
        return bonus;
    }

    getAuctionData(configId):Array<any> {
        var itemList = this._auctionDataMap['k' + configId];
        var bonus = this._bonusMap['k' + configId];
        var yubiBonus = this._yubiBonusMap['k' + configId];
        var endTime = this._endTimeMap['k' + configId];
        return [
            itemList || [],
            bonus,
            yubiBonus,
            endTime
        ];
    }

    public isHaveRedPoint() {
        for (var i = AuctionConst.AC_TYPE_GUILD_ID; i <= AuctionConst.AC_TYPE_GUILD_MAX; i++) {
            var [data] = this.getAuctionData(i);
            if (data.length > 0) {
                return true;
            }
        }
        var [data5] = this.getAuctionData(AuctionConst.AC_TYPE_ARENA_ID);
        if (data5.length > 0) {
            return true;
        }
        var [data6] = this.getAuctionData(AuctionConst.AC_TYPE_WAR_TRADE_ID);
        if (data6.length > 0) {
            return true;
        }
        var [data7] = this.getAuctionData(AuctionConst.AC_TYPE_GM_ID);
        if (data7.length > 0) {
            return true;
        }
        var [data8] = this.getAuctionData(AuctionConst.AC_TYPE_PERSONAL_ARENA_ID);
        if (data8.length > 0) {
            return true;
        }
        var [data9] = this.getAuctionData(AuctionConst.AC_TYPE_GUILDCROSSWAR_ID);
        if (data9.length > 0) {
            return true;
        }
        
        return false;
    }

    public _s2cGetAuctionInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.first) {
            var mainType = message['main_type'] || AuctionConst.AC_TYPE_GUILD;
            this._curGetAuctionType = mainType;
            this._auctionItemMap = {};
            var infoList = message['auction_info'] || {};
            this._guildAuctionBaseInfo = infoList;
        }
        var actionItemList = message['auction_items'] || {};
        for (let i in actionItemList) {
            var v = actionItemList[i];
            var itemId = v['id'] || 0;
            this._auctionItemMap[itemId] = v;
        }
        if (message.last) {
            var mainType = this._curGetAuctionType;
            this._initMapByMainType(mainType);
            this._udpateAuctionInfos('guild');
            this._clearAuctionTempInfo();
            G_SignalManager.dispatch(SignalConst.EVENT_GET_AUCTION_INFO, message);
        }

    }

    _createAuctionItemData(item) {
        var tempEndTime = item['end_time']|| 0;
        var itemConfigId = item['config_id']|| 0;
        var itemData:any = new AuctionItemData();
        itemData.setProperties(item);
        
        var auctionCfg = G_ConfigLoader.getConfig(ConfigNameConst.AUCTION).get(itemConfigId);
        assert(auctionCfg, 'can not find auctionItemData by configid ' + itemConfigId);
        var confName = 'app.config.' + auctionCfg.cfg_name;
        var itemId = itemData.getOrder_id();
        
        itemData.cfg = G_ConfigLoader.getConfig(auctionCfg.cfg_name).get(itemId);
        assert(itemData.cfg, 'can not find cfg by ' + (confName + (' id is:' + itemId)));
        var item = itemData.getItem();
        var auction_content_order = G_ConfigLoader.getConfig(ConfigNameConst.AUCTION_CONTENT_ORDER);
        var auctionContentOrderCfg = auction_content_order.get(item.type, item.value);
        assert(auctionContentOrderCfg, 'auction_content_order can not find type = ' + (item.type + (' value = ' + item.value)));
        itemData.item_order = auctionContentOrderCfg.order;
        return [
            itemData,
            tempEndTime
        ];
    }
    _clearAuctionTempInfo() {
        this._auctionItemMap = {};
        this._guildAuctionBaseInfo = {};
        this._worldAuctionBaseInfo = {};
        this._guildWarActionBaseInfo = {};
        this._gmAuctionBaseInfo = {};
    }

    _udpateAuctionInfos(key):void {
        var info = auctionIdDataMap[key];
        for (let i in info) {
            var v = info[i];
            var matchConfigId = v[0];
            var infoList = this[v[1]] || {};
            var allItems = [];
            var configId = null;
            var bonus = null;
            var yubiBonus = null;
            var endTime = 0;
            var canBonus = null;
            var canYubi = null;
            for (let ii in infoList) {
                var auctionInfo = infoList[ii];
                var tempCfgId = auctionInfo['config_id']|| 0;
                if (matchConfigId == null || matchConfigId == tempCfgId) {
                    configId = tempCfgId;
                    bonus = auctionInfo['bonus']|| 0;
                    yubiBonus = auctionInfo['bonus_yubi']|| 0;
                    canBonus = auctionInfo['canBonus'];
                    if (canBonus == null) {
                        canBonus = false;
                    }
                    canYubi = auctionInfo['canYubi']|| false;
                    var idList = auctionInfo['item_ids']|| {};
                    for (let jj in idList) {
                        var id = idList[jj];
                        var item = this._auctionItemMap[id];
                        if (item) {
                            var [auctionData, tempEndTime] = this._createAuctionItemData(item);
                            allItems.push(auctionData);
                            if (tempEndTime > endTime) {
                                endTime = tempEndTime;
                            }
                        }
                    }
                }
            }
            if (configId && allItems.length > 0) {
                allItems = this.sortItems(allItems);
                this._auctionDataMap['k' + configId] = allItems;
                this._bonusMap['k' + configId] = bonus;
                this._yubiBonusMap['k' + configId] = yubiBonus;
                this._endTimeMap['k' + configId] = endTime;
                this._canBonus['k' + configId] = canBonus;
                this._canYubi['k' + configId] = canYubi;
            }
        }
    }


    public _s2cGetAllAuctionInfo(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.first) {
            this._initMapByMainType(AuctionConst.AC_TYPE_GUILD);
            this._initMapByMainType(AuctionConst.AC_TYPE_WORLD);
            this._initMapByMainType(AuctionConst.AC_TYPE_ARENA);
            this._initMapByMainType(AuctionConst.AC_TYPE_TRADE);
            this._initMapByMainType(AuctionConst.AC_TYPE_GM);
            this._initMapByMainType(AuctionConst.AC_TYPE_PERSONAL_ARENA);
            this._initMapByMainType(AuctionConst.AC_TYPE_GUILDCROSS_WAR);
            this._auctionItemMap = {};
            var guildList = message['guild_auction']|| {};
            this._guildAuctionBaseInfo = guildList;
            var worldList = message['world_auction']|| {};
            this._worldAuctionBaseInfo = worldList;
            var tradeList = message['guild_war_auction']|| {};
            this._guildWarActionBaseInfo = tradeList;
            var gmList = message['gm_auction']|| {};
            this._gmAuctionBaseInfo = gmList;
        }
        var actionItemList = message['auction_items']|| {};
        for (let i in actionItemList) {
            var v = actionItemList[i];
            var itemId = v['id']|| 0;
            this._auctionItemMap[itemId] = v;
        }
        if (message.last) {
            this._updateAllAuctionInfos();
            this._clearAuctionTempInfo();
            G_SignalManager.dispatch(SignalConst.EVENT_GET_ALL_AUCTION_INFO, message);
        }
    }

    public _initMapByMainType(mainType) {
        var cfgList: any[] = this.getListByMainType(mainType);
        for (let i = 0; i < cfgList.length; i++) {
            var value = cfgList[i];
            this._auctionDataMap['k' + value.id] = [];
            this._bonusMap['k' + value.id] = 0;
            this._endTimeMap['k' + value.id] = 0;
            this._yubiBonusMap['k' + value.id] = 0;
            this._canBonus['k' + value.id] = false;
            this._canYubi['k' + value.id] = false;
        }

    }

    _updateAllAuctionInfos() {
        this._udpateAuctionInfos('guild');
        this._udpateAuctionInfos('world');
        this._udpateAuctionInfos('guildWar');
        this._udpateAuctionInfos('gm');
    }

    public _updateItemListById(matchConfigId, infoList: any[]) {
        var allItems = [];
        var configId = null;
        var bonus = null;
        var endTime = 0;
        var canBonus = null;
        function isConfigMatch(configId, matchId?) {
            if (matchId == null) {
                return true;
            }
            if (configId == matchId) {
                return true;
            }
            return false;
        }

        for (let i = 0; i < infoList.length; i++) {
            var auctionInfo = infoList[i];
            var tempCfgId = auctionInfo.config_id || 0;
            if (isConfigMatch(tempCfgId.matchConfigId)) {
                configId = tempCfgId;
                bonus = auctionInfo.bonus || 0;
                canBonus = auctionInfo.canBonus;
                if (canBonus == null) {
                    canBonus = false;
                }
                var auctionItems = auctionInfo.auction_items || [];

                for (let j = 0; j < auctionItems.length; j++) {
                    var item = auctionItems[j];
                    var tempEndTime = item.end_time || 0;
                    var itemConfigId = item.config_id || 0;
                    endTime = Math.max(endTime, tempEndTime);
                    var auctionData = new AuctionItemData();
                    auctionData.setProperties(item);
                    var configContent = null;
                    var auctionCfg = G_ConfigLoader.getConfig(ConfigNameConst.AUCTION).get(itemConfigId);
                    var confName = auctionCfg.cfg_name;
                    var itemId = auctionData.getOrder_id();
                    auctionData["cfg"] = G_ConfigLoader.getConfig(confName).get(itemId);
                    var item = auctionData.getItem();
                    var auction_content_order = G_ConfigLoader.getConfig(ConfigNameConst.AUCTION_CONTENT_ORDER);
                    var auctionContentOrderCfg = auction_content_order.get(item.type, item.value);
                    auctionData["item_order"] = auctionContentOrderCfg.order;
                    allItems.push(auctionData);
                }
            }
        }

        if (configId && allItems.length > 0) {
            allItems = this.sortItems(allItems);
            this._auctionDataMap['k' + configId] = allItems;
            this._bonusMap['k' + configId] = bonus;
            this._endTimeMap['k' + configId] = endTime;
            this._canBonus['k' + configId] = canBonus;
        }
    }

    public _updateItemInfos(infoList) {
        this._updateItemListById(null, infoList);
    }

    public _updateAuctionInfos(infoList) {
        this._updateItemListById(AuctionConst.AC_TYPE_WORLD_ID, infoList);
        this._updateItemListById(AuctionConst.AC_TYPE_ARENA_ID, infoList);
        this._updateItemListById(AuctionConst.AC_TYPE_PERSONAL_ARENA_ID, infoList);
    }

    public sortItems(items: any[]) {
        items.sort(function (item1, item2) {
            if (item1.item_order != item2.item_order) {
                return item1.item_order - item2.item_order;
            }
            if (item1.getStart_time() != item2.getStart_time()) {
                return item1.getStart_time() - item2.getStart_time();
            }
            if (item1.cfg.id != item2.cfg.id) {
                return item1.cfg.id - item2.cfg.id;
            } else {
                return item2.getId() - item1.getId();
            }
        });
        return items;
    }

    public _s2cAuction(id, message) {
        if (message.ret != 1) {
            return;
        }
        var configId = message.config_id;
        if (configId && configId > 0) {
            var items: AuctionItemData[] = this._auctionDataMap['k' + configId];
            for (let i = 0; i < items.length; i++) {
                var item: AuctionItemData = items[i];
                if (item.getId() == message.item_id) {
                    if (message.now_price >= item.getFinal_price()) {
                        items.splice(i, 1);
                        this._auctionDataMap['k' + configId] = items;
                        break;
                    }
                    item.setNow_buyer(message.now_price_uid);
                    item.setNow_price(message.now_price);
                }

            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_AUCTION_ITEM, message);
    }

    public _s2cGetAuctionLog(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_AUCTION_LOG, message);
    }

    public _s2cAuctionBuyerReplace(id, message) {
        G_SignalManager.dispatch(SignalConst.EVENT_AUCTION_BUYER_REPLACE, message);
    }

    public _s2cUpdateAuctionItem(id, message) {
        var configId = message.config_id;
        var share_bonus = message.share_bonus;
        var share_yubi_bonus = message['share_bonus_yubi'];
        if (configId && configId > 0) {
            if (share_bonus) {
                this._bonusMap['k' + configId] = share_bonus;
            }
            if (share_yubi_bonus) {
                this._yubiBonusMap['k' + configId] = share_yubi_bonus;
            }
            var items: AuctionItemData[] = this._auctionDataMap['k' + configId] || [];

            for (let i = 0; i < items.length; i++) {
                var item: AuctionItemData = items[i];
                if (item.getId() == message.item_id) {
                    if (message.delete == true) {
                        items.splice(i, 1);
                        this._auctionDataMap['k' + configId] = items;
                        break;
                    }
                    item.setNow_buyer(message.now_buyer);
                    item.setNow_price(message.now_price);
                    item.setEnd_time(message.end_time);
                }
            }
            var worldAuctionKey = 'k' + AuctionConst.AC_TYPE_WORLD_ID;
            var allServerItems: AuctionItemData[] = this._auctionDataMap[worldAuctionKey] || [];
            for (let i = 0; i < allServerItems.length; i++) {
                var item = allServerItems[i];
                if (item.getId() == message.item_id) {
                    if (message.delete == true) {
                        allServerItems.splice(i, 1);
                        this._auctionDataMap[worldAuctionKey] = allServerItems;
                        break;
                    }
                    item.setNow_buyer(message.now_buyer);
                    item.setNow_price(message.now_price);
                    item.setEnd_time(message.end_time);
                }
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_AUCTION_UPDATE_ITEM, message);
    }

}