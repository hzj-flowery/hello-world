import { G_UserData, G_ConfigLoader, G_ServerTime } from "../../../init";
import { TerritoryConst } from "../../../const/TerritoryConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { assert } from "../../../utils/GlobleFunc";

export namespace TerritoryHelper {
    export function getTerritoryData(index) {
        index = index || 1;
        var retData: any = {};
        var TerritoryMgr = G_UserData.getTerritory();
        retData.state = TerritoryMgr.getTerritoryState(index);
        retData.name = TerritoryMgr.getTerritoryName(index);
        retData.heroId = TerritoryMgr.getTerritoryHeroId(index);
        console.log(retData.heroId);
        retData.startTime = TerritoryMgr.getStartTime(index);
        retData.endTime = TerritoryMgr.getTerritoryEndTime(index);
        retData.isReady = TerritoryMgr.getTerritoryReady(index);
        retData.limitLevel = TerritoryMgr.getTerritoryLimitLevel(index);
        retData.limitRedLevel = TerritoryMgr.getTerritoryLimitRedLevel(index);
        retData.lockMsg = TerritoryMgr.getLockMsg(index);
        retData.heroDrop = TerritoryMgr.getHeroDrop(index);
        retData.cfg = TerritoryMgr.getTerritoryCfg(index);
        return retData;
    };
    export function isRoitState(index) {
        var TerritoryMgr = G_UserData.getTerritory();
        var state = TerritoryMgr.getTerritoryState(index);
        if (state == TerritoryConst.STATE_RIOT) {
            return true;
        }
        return false;
    };
    export function getTerritoryInfo(cityId) {
        var info = G_ConfigLoader.getConfig('territory_performance');
        var res = info.get(cityId);
        assert(res, 'territory_performance not find id ' + (cityId));
        return res;
    };
    export function getTerritoryParameter(keyIndex) {
        var TerritoryParameter = G_ConfigLoader.getConfig(ConfigNameConst.TERRITORY_PARAMETER);
        for (var i = 0; i < TerritoryParameter.length(); i++) {
            var territoryData = TerritoryParameter.indexOf(i);
            if (territoryData.key == keyIndex) {
                return territoryData.content;
            }
        }
        console.assert(false, ' can\'t find key index in TerritoryParameter ' + keyIndex);
        return null;
    };
    export function getTerritoryPatrolCost(keyIndex) {
        var keyValue = getTerritoryParameter(keyIndex);
        var [time, itemType] = keyValue.split('|');
        var [type, value, size] = itemType.split(':');
        var typeItem = TypeConvertHelper.convert(Number(type), Number(value), Number(size));
        return [
            typeItem,
            Number(time)
        ];
    };
    export function getRiotInfo(infoId) {
        var RiotInfo = G_ConfigLoader.getConfig(ConfigNameConst.TERRITORY_RIOT);
        var riotData = RiotInfo.get(infoId);
        console.assert(riotData, ' can\'t find infoId in territory_riot ' + infoId);
        return riotData;
    };
    export function getEventInfo(infoId) {
        var eventInfo = G_ConfigLoader.getConfig(ConfigNameConst.TERRITORY_EVENT);
        var data = eventInfo.get(infoId);
        console.assert(data, ' can\'t find infoId in territory_event ' + infoId);
        return data;
    };
    export function getTerritoryHelpBubble() {
        var content = getTerritoryParameter('help_bubble');
        var idList = content.split('|');
        console.log(idList);
        if (idList.length > 0) {
            var index = Math.randInt(0, idList.length - 1);
            var bubbleId = Number(idList[index]);
            return getBubbleContentById(bubbleId);
        }
        return '';
    };
    export function getBubbleContentById(bubbleId) {
        var BubbleInfo = G_ConfigLoader.getConfig(ConfigNameConst.BUBBLE);
        var data = BubbleInfo.get(Number(bubbleId));
        console.assert(data, 'bubble cfg data can not find by bubbleId ' + bubbleId);
        return data.content;
    };
    export function getBubbleEmjById(bubbleId) {
        var BubbleInfo = G_ConfigLoader.getConfig(ConfigNameConst.BUBBLE);
        var data = BubbleInfo.get(Number(bubbleId));
        console.assert(data, 'bubble cfg data can not find by bubbleId ' + bubbleId);
        return data.emote_value;
    };
    export function isRiotEventExpiredTime(event) {
        var riotNeedTime = Number(getTerritoryParameter('riot_continue_time'));
        var riotEndTime = event.time + riotNeedTime;
        if (TerritoryConst.RIOT_OVERTIME == getRiotEventState(event)) {
            var [nextUpdateTime, isExpired] = G_ServerTime.getNextUpdateTime(riotEndTime);
            return isExpired;
        }
        return false;
    };
    export function getRiotEventState(event) {
        var riotNeedTime = Number(getTerritoryParameter('riot_continue_time'));
        var riotEndTime = event.time + riotNeedTime;
        var terrItoryId = event['territory_id'];
        var endTime = event['end_time'] || G_UserData.getTerritory().getTerritoryEndTime(terrItoryId);
        var isPartolFinish = endTime < G_ServerTime.getTime();
        var isOverRitoTime = riotEndTime < G_ServerTime.getTime();
        if (event.is_award == true) {
            return TerritoryConst.RIOT_TAKEN;
        }
        if (event.is_repress == true) {
            return TerritoryConst.RIOT_TAKE;
        }
        if (isPartolFinish || isOverRitoTime) {
            return TerritoryConst.RIOT_OVERTIME;
        }
        if (event.for_help == false) {
            return TerritoryConst.RIOT_HELP;
        }
        if (event.is_repress == false) {
            return TerritoryConst.RIOT_HELPED;
        }
        if (event.is_award == false) {
            return TerritoryConst.RIOT_TAKE;
        }
        return TerritoryConst.RIOT_TAKEN;
    };
    export function getNextEventTime(cityData, event) {
        var profitTime = Number(getTerritoryParameter('patrol_profit_time'));
        var nextTime = null;
        if (event == null) {
            nextTime = cityData.startTime + profitTime;
        } else {
            nextTime = event.time + profitTime;
        }
        var nextTimeStr = G_ServerTime.getLeftSecondsString(nextTime);
        return nextTimeStr;
    };
    export function setTextBgByColor(imageWidget, color) {
        if (!imageWidget) {
            return;
        }
        if (color == 3) {
            UIHelper.loadTexture(imageWidget, Path.getComplexRankUI('img_midsize_ranking05'));
        } else if (color == 4) {
            UIHelper.loadTexture(imageWidget, Path.getComplexRankUI('img_midsize_ranking03'));
        } else if (color == 5) {
            UIHelper.loadTexture(imageWidget, Path.getComplexRankUI('img_midsize_ranking02'));
        }
    };

}