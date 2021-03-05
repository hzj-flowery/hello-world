import { G_ConfigLoader, G_ServerTime, Colors, G_UserData } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Lang } from "../../../lang/Lang";

export namespace SiegeHelper {
    export let getRankReward = function (type, rank) {
        var reward = null;
        let RebelRankReward = G_ConfigLoader.getConfig(ConfigNameConst.REBEL_RANK_REWARD);
        var totalCount = RebelRankReward.length();
        for (let i = 0; i < totalCount; i++) {
            var data = RebelRankReward.indexOf(i);
            if (type == data.type && rank >= data.rank_min && rank <= data.rank_max) {
                reward = {
                    type: data.award_type,
                    value: data.award_value,
                    size: data.award_size
                };
                break;
            }
        }
        return reward;
    };
    export let getHalfTimeString = function () {
        function getTimeString(time) {
            var hour = G_ServerTime.minToString(time);
            return hour;
        }
        var halfPower = 1;
        var beginTime: any[] = [];
        var endTime: any[] = [];
        for (var i = 1; i <= 3; i++) {
            var data = G_ConfigLoader.getConfig(ConfigNameConst.REBEL_TIME).get(i);
            var start = data.start_time;
            beginTime.push(start);
            var finish = data.over_time;
            endTime.push(finish);
        }
        var isHalfTime = false;
        var [fontDark, fontGreen] = Colors.getETypeColor();
        var fontColor = [
            fontDark,
            fontDark,
            fontDark
        ];
        var serverTime = G_ServerTime.getTime();
        for (let i = 0; i < 3; i++) {
            var time1 = beginTime[i];
            var time2 = endTime[i];
            if (serverTime >= G_ServerTime.getTimestampBySeconds(time1) && serverTime < G_ServerTime.getTimestampBySeconds(time2)) {
                fontColor[i] = fontGreen;
                isHalfTime = true;
            }
        }
        var timeText = RichTextExtend.createWithContent(Lang.get('siege_half_token', {
            begin1: getTimeString(beginTime[0]),
            end1: getTimeString(endTime[0]),
            color1: Colors.colorToNumber(fontColor[0]),
            begin2: getTimeString(beginTime[1]),
            end2: getTimeString(endTime[1]),
            color2: Colors.colorToNumber(fontColor[1]),
            begin3: getTimeString(beginTime[2]),
            end3: getTimeString(endTime[2]),
            color3: Colors.colorToNumber(fontColor[2])
        }));
        timeText.node.setAnchorPoint(0, 0);
        return [
            isHalfTime,
            timeText.node
        ];
    };
    export let parseRewardList = function (level, type) {
        let RebelDmgReward = G_ConfigLoader.getConfig(ConfigNameConst.REBEL_DMG_REWARD);
        var totalCount = RebelDmgReward.length();
        var rewardList: any[] = [];
        for (let i = 0; i < totalCount; i++) {
            var data = RebelDmgReward.indexOf(i);
            if (level >= data.lv_min && level <= data.lv_max && data.type == type) {
                rewardList.push(data);
            }
        }
        rewardList.sort(function (a, b) {
            return a.index - b.index;
        });
        return rewardList;
    };
    export let getSortedRewardList = function (list): any[] {
        var sortedList: any[] = [];
        var getList: any[] = [];
        for (let i in list) {
            var v = list[i];
            if (G_UserData.getSiegeData().isHurtRewardGet(v.id)) {
                getList.push(v);
            } else {
                sortedList.push(v);
            }
        }
        for (let i = 0; i < getList.length; i++) {
            sortedList.push(getList[i]);
        }
        return sortedList;
    };
}