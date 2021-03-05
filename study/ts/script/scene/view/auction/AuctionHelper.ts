import { G_UserData, G_ServerTime, G_ConfigLoader } from "../../../init";

import { AuctionConst } from "../../../const/AuctionConst";

import { Lang } from "../../../lang/Lang";

import { table } from "../../../utils/table";

import { assert } from "../../../utils/GlobleFunc";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";

export var AuctionHelper: any = {};
AuctionHelper.makeMainData = function (groupList, auctionType) {
    var groupData: any = {};
    function checkCfgIdOpen(auctionId) {
        var subTab = G_UserData.getAuction().isAuctionShow(auctionId);
        var subTabList = G_UserData.getAuction().getAuctionData(auctionId);
        if (subTab && subTabList.length > 0) {
            return true;
        }
        return false;
    }
    if (auctionType == AuctionConst.AC_TYPE_GUILD) {
        groupData.name = Lang.get('auction_main_tab1');
        groupData.cfgId = AuctionConst.AC_TYPE_GUILD_ID;
        groupData.type = auctionType;
        groupData.rootCfgId = AuctionConst.AC_TYPE_GUILD_ID;
        groupData.isMain = true;
    }
    if (auctionType == AuctionConst.AC_TYPE_WORLD) {
        groupData.name = Lang.get('auction_main_tab2');
        groupData.cfgId = AuctionConst.AC_TYPE_WORLD_ID;
        groupData.rootCfgId = AuctionConst.AC_TYPE_WORLD_ID;
        groupData.type = auctionType;
        groupData.isMain = true;
    }
    if (auctionType == AuctionConst.AC_TYPE_ARENA) {
        groupData.name = Lang.get('auction_main_tab3');
        groupData.cfgId = AuctionConst.AC_TYPE_ARENA_ID;
        groupData.rootCfgId = AuctionConst.AC_TYPE_ARENA_ID;
        groupData.type = auctionType;
        groupData.isMain = true;
        if (checkCfgIdOpen(groupData.cfgId) == false) {
            return;
        }
    }
    if (auctionType == AuctionConst.AC_TYPE_TRADE) {
        groupData.name = Lang.get('auction_main_tab4');
        groupData.cfgId = AuctionConst.AC_TYPE_WAR_TRADE_ID;
        groupData.rootCfgId = AuctionConst.AC_TYPE_WAR_TRADE_ID;
        groupData.type = auctionType;
        groupData.isMain = true;
        if (checkCfgIdOpen(groupData.cfgId) == false) {
            return;
        }
    }
    if (auctionType == AuctionConst.AC_TYPE_GM) {
        groupData.name = Lang.get('auction_main_tab5');
        groupData.cfgId = AuctionConst.AC_TYPE_GM_ID;
        groupData.rootCfgId = AuctionConst.AC_TYPE_GM_ID;
        groupData.type = auctionType;
        groupData.isMain = true;
        if (checkCfgIdOpen(groupData.cfgId) == false) {
            return;
        }
    }
    if (auctionType == AuctionConst.AC_TYPE_PERSONAL_ARENA) {
        groupData.name = Lang.get('auction_main_tab6');
        groupData.cfgId = AuctionConst.AC_TYPE_PERSONAL_ARENA_ID;
        groupData.rootCfgId = AuctionConst.AC_TYPE_PERSONAL_ARENA_ID;
        groupData.type = auctionType;
        groupData.isMain = true;
        if (checkCfgIdOpen(groupData.cfgId) == false) {
            return;
        }
    }
    if (auctionType == AuctionConst.AC_TYPE_GUILDCROSS_WAR) {
        groupData = null;
    }
    if (groupData) {
        groupList[auctionType] = groupData;
    }
};
AuctionHelper.makeSubData = function (subList, auctionType) {
    var guildCfgId = 0;
    function checkCfgIdOpen(auctionId) {
        var subTab = G_UserData.getAuction().isAuctionShow(auctionId);
        var subTabList = G_UserData.getAuction().getAuctionData(auctionId);
        if (subTab && subTabList.length > 0) {
            return true;
        }
        return false;
    }
    if (auctionType == AuctionConst.AC_TYPE_GUILD) {
        for (var auctionId = AuctionConst.AC_TYPE_GUILD_ID; auctionId <= AuctionConst.AC_TYPE_GUILD_MAX; auctionId++) {
            if (checkCfgIdOpen(auctionId)) {
                var groupData: any = {};
                var index = auctionId - 100;
                groupData.cfgId = auctionId;
                groupData.name = Lang.get('auction_sub_tab' + index);
                groupData.type = auctionType;
                groupData.rootCfgId = auctionId;
                groupData.isMain = false;
                guildCfgId = auctionId;
                subList.push(groupData);
            }
        }
    }
    function makeSubAuctionList(auctionType) {
        var auctionId = 0;
        if (auctionType == AuctionConst.AC_TYPE_WORLD) {
            auctionId = AuctionConst.AC_TYPE_WORLD_ID;
        }
        if (auctionType == AuctionConst.AC_TYPE_ARENA) {
            auctionId = AuctionConst.AC_TYPE_ARENA_ID;
        }
        if (auctionType == AuctionConst.AC_TYPE_TRADE) {
            auctionId = AuctionConst.AC_TYPE_WAR_TRADE_ID;
        }
        if (auctionType == AuctionConst.AC_TYPE_GM) {
            auctionId = AuctionConst.AC_TYPE_GM_ID;
        }
        if (auctionType == AuctionConst.AC_TYPE_PERSONAL_ARENA) {
            auctionId = AuctionConst.AC_TYPE_PERSONAL_ARENA_ID;
        }
        if (auctionType == AuctionConst.AC_TYPE_GUILDCROSS_WAR) {
            auctionId = AuctionConst.AC_TYPE_GUILDCROSSWAR_ID;
        }
        var [allSubTabList, itemList] = AuctionHelper.getAllSubTabList(auctionId);
        var tempList = [];
        if (checkCfgIdOpen(auctionId) && itemList.length > 0) {
            for (var i in allSubTabList) {
                var value = allSubTabList[i];
                if (value != '') {
                    var groupData: any = [];
                    groupData.cfgId = i;
                    groupData.name = value;
                    groupData.type = auctionType;
                    groupData.rootCfgId = auctionId;
                    groupData.isMain = false;
                    tempList.push(groupData);
                }
            }
            tempList.sort(function (item1, item2) {
                return item1.cfgId - item2.cfgId;
            });
            for (i in tempList) {
                var value = tempList[i];
                subList.push(value);
            }
        }
    }
    makeSubAuctionList(auctionType);
    return guildCfgId;
};
AuctionHelper.getAuctionTextListEx = function () {
    var textList = [];
    var groupList = {};
    for (var auctionType = AuctionConst.AC_TYPE_GUILD; auctionType <= AuctionConst.AC_TYPE_MAX; auctionType++) {
        AuctionHelper.makeMainData(groupList, auctionType);
        if (groupList[auctionType]) {
            groupList[auctionType].subList = [];
            var guildCfgId = AuctionHelper.makeSubData(groupList[auctionType].subList, auctionType);
            if (auctionType == AuctionConst.AC_TYPE_GUILD) {
                groupList[auctionType].cfgId = guildCfgId;
                groupList[auctionType].rootCfgId = guildCfgId;
            }
        }
    }
    for (var i in groupList) {
        var mainData = groupList[i];
        textList.push(mainData.name);
        mainData.tabIndex = textList.length;
        if (mainData.subList) {
            for (var j in mainData.subList) {
                var subData = mainData.subList[j];
                textList.push(subData.name);
                subData.tabIndex = textList.length;
            }
        }
    }
    return [
        textList,
        groupList
    ];
};
AuctionHelper.getAllSubTabList = function (configId) {
    var [itemList] = AuctionHelper.getConfigIdByIndex(configId);
    var tabList = {};
    if (itemList.length > 0) {
        tabList[AuctionConst.AC_ALLSERVER_OFFICIAL] = '';
        tabList[AuctionConst.AC_ALLSERVER_HEROS] = '';
        tabList[AuctionConst.AC_ALLSERVER_TREASURE] = '';
        tabList[AuctionConst.AC_ALLSERVER_INSTRUMENT] = '';
        tabList[AuctionConst.AC_ALLSERVER_SILKBAG] = '';
        tabList[AuctionConst.AC_ALLSERVER_HISTORYHERO] = "";
        tabList[AuctionConst.AC_ALLSERVER_OTHERS] = '';
    }
    for (var i in itemList) {
        var value = itemList[i];
        if (value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_OFFICIAL) {
            var index = AuctionConst.AC_ALLSERVER_OFFICIAL;
            tabList[index] = Lang.get('auction_all_server_sub' + index);
        }
        if (value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_HEROS) {
            var index = AuctionConst.AC_ALLSERVER_HEROS;
            tabList[index] = Lang.get('auction_all_server_sub' + index);
        }
        if (value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_TREASURE) {
            var index = AuctionConst.AC_ALLSERVER_TREASURE;
            tabList[index] = Lang.get('auction_all_server_sub' + index);
        }
        if (value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_INSTRUMENT) {
            var index = AuctionConst.AC_ALLSERVER_INSTRUMENT;
            tabList[index] = Lang.get('auction_all_server_sub' + index);
        }
        if (value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_SILKBAG) {
            var index = AuctionConst.AC_ALLSERVER_SILKBAG;
            tabList[index] = Lang.get('auction_all_server_sub' + index);
        }
        if (value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_HISTORYHERO) {
            var index = AuctionConst.AC_ALLSERVER_HISTORYHERO;
            tabList[index] = Lang.get('auction_all_server_sub' + index);
        }
        if (value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_OTHERS) {
            var index = AuctionConst.AC_ALLSERVER_OTHERS;
            tabList[index] = Lang.get('auction_all_server_sub' + index);
        }
    }
    return [
        tabList,
        itemList
    ];
};
AuctionHelper.getConfigIdByIndex = function (configId, subIndex) {
    function filter(dataList) {
        if (!dataList) {
            dataList = [];
        }
        var filterData = [];
        for (var k in dataList) {
            var v = dataList[k];
            var endTime = v.getEnd_time();
            var timeLeft = G_ServerTime.getLeftSeconds(endTime);
            if (timeLeft >= 0) {
                filterData.push(v);
            }
        }
        return filterData;
    }
    if (configId && configId > 0) {
        var [itemList, bouns] = G_UserData.getAuction().getAuctionData(configId);
        if (subIndex && subIndex > 0 && subIndex < 100) {
            var retList = [];
            for (var i in itemList) {
                var value = itemList[i];
                if (value.cfg.auction_full_tab == subIndex) {
                    retList.push(value);
                }
            }
            return [filter(retList)];
        }
        return [filter(itemList), bouns];
    }
    return [[], null];
};
AuctionHelper.getAuctionDataByTabIndex = function (tabIndex) {
};

AuctionHelper.getMoneyInfoByData = function (unitData) {
    var moneyType = unitData.getMoney_type();
    var moneyParams;
    if (moneyType == 1) {
        moneyParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
    } else {
        moneyParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND);
    }
    return moneyParams;
}
AuctionHelper.getParameterValue = function (keyIndex) {
    var parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER)
    for (var i = 1; i <= parameter.length(); i++) {
        var value = parameter.indexOf(i - 1);
        if (value.key == keyIndex) {
            return parseFloat(value.content);
        }
    }
    //assert((false, ' can\'t find key index in parameter ' + keyIndex);
};