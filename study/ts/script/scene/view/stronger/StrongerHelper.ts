import { G_UserData, G_ConfigLoader } from "../../../init";
import { UserBaseData } from "../../../data/UserBaseData";
import { Lang } from "../../../lang/Lang";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { recommend } from "../../../config/recommend";
import { UserCheck } from "../../../utils/logic/UserCheck";

export var StrongerHelper: any = {};
StrongerHelper.getFuncLevelList = function () {

    let getFunctionUpdateTime = (timeStr)=> {
        if(!timeStr || timeStr === "") return;
        let timeStrArr = timeStr.split("|");
        let hour = Number(timeStrArr[1]) ?? 0;
        let min = Number(timeStrArr[2]) ?? 0;
        return hour * 3600 + min * 60
    }
    var retList = [];
    var playerLevel = 100; G_UserData.getBase().getLevel();
    var function_level = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
    for (var i = 0; i < function_level.length(); i++) {
        var cfgData = function_level.indexOf(i);
        if (cfgData.preview_show == 1 && playerLevel >= cfgData.preview_level) {
            var saveTable: any = {};
            saveTable.funcData = cfgData;
            saveTable.isOpen = true//FunctionCheck.funcIsOpened(cfgData.function_id)[0];
            saveTable.limitDes = "";
            let resetTime = getFunctionUpdateTime(cfgData.update_time);
            if(!UserCheck.enoughOpenDay(cfgData.day,resetTime)){
                saveTable.isOpen = false;
                saveTable.limitDes = Lang.get("lang_stronger_open_day",{day: cfgData.day})
            }else if(!UserCheck.enoughLevel(cfgData.level)){
                saveTable.isOpen = false;
                saveTable.limitDes = Lang.get("lang_stronger_level",{level: cfgData.level})
            }
            retList.push(saveTable);
        }
    }
    retList.sort((a, b) => {
        if (a.isOpen != b.isOpen) {
            if (b.isOpen) {
                return -1;
            }else{
                return 1;
            }
        }
        return a.funcData.level - b.funcData.level;
    });
    return retList;
};
StrongerHelper.getBubbleList = function () {
    var retList = [
    ];
    function filterFunc(cfgData) {
        if (cfgData.id == 0) {
            return false;
        }
        var playerLevel = 100; G_UserData.getBase().getLevel();
        if (cfgData.function_level_id > 0) {
            if (FunctionCheck.funcIsOpened(cfgData.function_level_id)[0] == true && cfgData.upgrade_level <= playerLevel) {
                var percent = StrongerHelper.getPercent(cfgData);
                if (percent < 100) {
                    return false;
                }
            }
        }
        return true;
    }
    var recommend_upgrade = G_ConfigLoader.getConfig(ConfigNameConst.RECOMMEND_UPGRADE);
    for (var i = 0; i < recommend_upgrade.length(); i++) {
        var cfgData = recommend_upgrade.indexOf(i);
        if (filterFunc(cfgData) == false) {
            retList.push(cfgData.bubble_id);
        }
    }
    return retList;
};
StrongerHelper.getRecommendUpgradeList = function () {
    var retList = [];
    var playerLevel = G_UserData.getBase().getLevel();
    var recommend_upgrade = G_ConfigLoader.getConfig(ConfigNameConst.RECOMMEND_UPGRADE);
    for (var i = 0; i < recommend_upgrade.length(); i++) {
        var saveTable: any = {};
        var cfgData = recommend_upgrade.indexOf(i);
        if (cfgData.function_level_id > 0) {
            if (FunctionCheck.funcIsOpened(cfgData.function_level_id)[0] == true && cfgData.upgrade_level <= playerLevel){
                saveTable.cfgData = cfgData;
                saveTable.funcData = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(cfgData.function_level_id);
                saveTable.percent = StrongerHelper.getPercent(cfgData);
                retList.push(saveTable);
            }
        }
    }
    return retList;
};

StrongerHelper.getPercent = function (cfgData) {
    var index = cfgData.id;
    var avgLevel = 0;
    if(StrongerHelper['getAvgLevel' + index]){
        avgLevel = StrongerHelper['getAvgLevel' + index]();
        if (avgLevel == null) {
            avgLevel = 0;
        }
    }
    var playerLevel = G_UserData.getBase().getLevel();
    let func1 = recommend.getFuncs(cfgData.id)(playerLevel);
    // var str = Lang.getTxt(cfgData.upgrade_percent, { LEVEL: playerLevel });
    // var func1 = eval(str);
    var percent = Math.floor(func1);
    return Math.floor(avgLevel / percent * 100);
};
StrongerHelper.getAvgLevel1 = function () {
    return UserDataHelper.getHeroInBattleAverageLevel();
};
StrongerHelper.getAvgLevel2 = function () {
    return UserDataHelper.getHeroInBattleAverageRank();
};
StrongerHelper.getAvgLevel3 = function () {
    return UserDataHelper.getHeroInBattleAverageAwakeLevel();
};
StrongerHelper.getAvgLevel4 = function () {
    return UserDataHelper.getEquipInBattleAverageStr();
};
StrongerHelper.getAvgLevel5 = function () {
    return UserDataHelper.getEquipInBattleAverageRefine();
};
StrongerHelper.getAvgLevel6 = function () {
    return UserDataHelper.getTreasureInBattleAverageStr();
};
StrongerHelper.getAvgLevel7 = function () {
    return UserDataHelper.getTreasureInBattleAverageRefine();
};
StrongerHelper.getAvgLevel8 = function () {
    return UserDataHelper.getInstrumentInBattleAverageAdvance();
};
