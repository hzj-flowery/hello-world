import { ChatConst } from "../../const/ChatConst";
import { FunctionCheck } from "../logic/FunctionCheck";
import { FunctionConst } from "../../const/FunctionConst";
import { G_ConfigLoader, G_UserData, G_ServerTime } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { withDefault } from "../withDefault";
import { GuildCrossWarHelper } from "../../scene/view/guildCrossWar/GuildCrossWarHelper";
import { SingleRaceConst } from "../../const/SingleRaceConst";
import { SingleRaceDataHelper } from "./SingleRaceDataHelper";
import { G_ParameterIDConst } from "../../const/ParameterIDConst";
import { TenJadeAuctionDataHelper } from "../../scene/view/tenJadeAuction/TenJadeAuctionDataHelper";

export namespace ChatDataHelper {
    export function getChatParameterById(id) {
        let config = G_ConfigLoader.getConfig(ConfigNameConst.CHAT).get(id);
        console.assert(config, 'chat config not find id ' + id);
        return Number(withDefault(() => config.content, "")) || 0;
    };
    export function getShowChatChannelIds() {
        let allChannelIds = [
            ChatConst.CHANNEL_CROSS_SERVER,
            ChatConst.CHANNEL_ALL,
            ChatConst.CHANNEL_WORLD,
            ChatConst.CHANNEL_GUILD,
            ChatConst.CHANNEL_TEAM,
            ChatConst.CHANNEL_PRIVATE
        ];
        let ids = [];
        for (let k in allChannelIds) {
            let v = allChannelIds[k];
            if (v == ChatConst.CHANNEL_TEAM) {
                let isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GROUPS)[0];
                if (isOpen) {
                    ids.push(v);
                }
            } else if (v == ChatConst.CHANNEL_CROSS_SERVER) {
                let isOpen = ChatDataHelper.isCanCrossServerChat();
                if (isOpen) {
                    ids.push(v);
                }
            } else {
                ids.push(v);
            }
        }
        return ids;
    };
    var isInCrossServerTime = function () {
        var startTime = SingleRaceDataHelper.getStartTimeOfChat();
        var endTime = SingleRaceDataHelper.getEndTimeOfChat();
        var curTime = G_ServerTime.getTime();
        if (curTime >= startTime && curTime < endTime) {
            return true;
        } else {
            return false;
        }
    };
    var isInCrossGuildWarServerTime = function () {
        var bOpenToday = GuildCrossWarHelper.isTodayOpen();
        if (!bOpenToday) {
            return false;
        }
        var curTime = G_ServerTime.getTime();
        var zeroTime = G_ServerTime.secondsFromZero();
        var startTime = zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_CHAT_SHOW);
        var endTime = zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_CHAT_CLOSE);
        if (curTime >= startTime && curTime < endTime) {
            return true;
        }
        return false;
    };
    var isInCrossWorldBossServerTime = function () {
        return //CrossWorldBossHelper.getIsChatOpen();
    };
    var isInCrossAuction = function () {
        return TenJadeAuctionDataHelper.isAuctionStart();
    };
    export function isCanCrossServerChat() {
        var isInTime = [
            isInCrossServerTime(),
            isInCrossGuildWarServerTime(),
            isInCrossWorldBossServerTime(),
            isInCrossAuction()
        ];
        var bGuildCrossWarOpen = GuildCrossWarHelper.isGuildCrossWarEntry();
        var isCrossWorldBossOpen = isInCrossWorldBossServerTime();
        var isCrossAuctionOpen = isInCrossAuction();
        var isOpenAct = [
            G_UserData.getSingleRace().getStatus() != SingleRaceConst.RACE_STATE_NONE,
            bGuildCrossWarOpen,
            isCrossWorldBossOpen,
            isCrossAuctionOpen
        ];
        var maxNum = Math.min(isInTime.length, isOpenAct.length);
        for (var i = 1; i <= maxNum; i++) {
            if (isInTime[i] && isOpenAct[i]) {
                return true;
            }
        }
        return false;
    };
};