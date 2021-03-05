import { CustomActivityConst } from "../../../const/CustomActivityConst";
import { G_ConfigLoader, G_ServerTime, G_UserData, G_ConfigManager } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { assert } from "../../../utils/GlobleFunc";
import { Lang } from "../../../lang/Lang";
import { RichTextHelper } from "../../../utils/RichTextHelper";
import { TimeLimitActivityConst } from "../../../const/TimeLimitActivityConst";
import { TenJadeAuctionConst } from "../../../const/TenJadeAuctionConst";
import { table } from "../../../utils/table";
import { TenJadeAuctionConfigHelper } from "../tenJadeAuction/TenJadeAuctionConfigHelper";

export namespace CustomActivityUIHelper{

    export let   getRichMsgListForHashText = function (text, highlightColor, highlightOutlineColor, defalutColor, defalutOutlineColor, defaultFontSize) {
        var subTitles = RichTextHelper.parse2SubTitleExtend(text, true);
        subTitles = RichTextHelper.fillSubTitleUseColor(subTitles, [
            null,
            highlightColor,
            highlightOutlineColor
        ]);
        var richElementList = RichTextHelper.convertSubTitleToRichMsgArr({
            textColor: defalutColor,
            outlineColor: defalutOutlineColor,
            fontSize: defaultFontSize
        }, subTitles);
        return richElementList;
    };
    export let   getTabDatas = function () {
        var customActTabData = G_UserData.getCustomActivity().getShowActUnitDataArr();
        var tabDatas = [];
        if (G_UserData.getCustomActivity().isAvatarActivityVisible()) {
            tabDatas.push({
                id: 0,
                type: TimeLimitActivityConst.ID_TYPE_AVATAR_ACT_INTRO,
                title: Lang.get('customactivity_avatar_act_intro_title'),
                srcData: {}
            });
        }
        for (let k in customActTabData) {
            var v = customActTabData[k];
            //暂时去掉充值活动
            if (v.getAct_type() == 4 && !G_ConfigManager.checkCanRecharge()) {
                continue;
            }
            if (v.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_TEN_JADE_AUCTION) {
                var phase = TenJadeAuctionConfigHelper.getAuctionPhase();
                if (phase == TenJadeAuctionConst.PHASE_SHOW || phase == TenJadeAuctionConst.PHASE_ITEM_SHOW || phase == TenJadeAuctionConst.PHASE_START) {
                    table.insert(tabDatas, {
                        id: v.getAct_id(),
                        type: TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT,
                        title: v.getTitle(),
                        srcData: v
                    });
                }
            } else {
                table.insert(tabDatas, {
                    id: v.getAct_id(),
                    type: TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT,
                    title: v.getTitle(),
                    srcData: v
                });
            }
        }

        var sprintUnitList = G_UserData.getTimeLimitActivity().getSprintActUnitList();
        for (let k in sprintUnitList) {
            var v = sprintUnitList[k];
            if (v.isActivityOpen()) {
                var data = {
                    id: null,
                    type: TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT,
                    title: null,
                    srcData: null
                };
                data.id = v.getType();
                data.title = v.getName();
                data.srcData = v;
                tabDatas.push(data);
            }
        }
        //等待翻译
        // if (G_UserData.getCustomActivity().getThreeKindomsData() != null) {
        //     if (G_ConfigManager.isDownloadThreeKindoms() && !G_UserData.getCustomActivity().getThreeKindomsData().isActivityFinish()) {
        //         var data = G_UserData.getCustomActivity().getThreeKindomsData();
        //         var deviceId = G_NativeAgent.getDeviceId();
        //         if (deviceId != null && deviceId != 'unknown') {
        //             var startidx = string.find(deviceId, '_sn', -3), endidx, strnil;
        //             if (typeof(startidx) != 'number' && typeof(endidx) != 'number') {
        //                 tabDatas.push({
        //                     id: 1000,
        //                     type: TimeLimitActivityConst.ID_TYPE_THREEKINDOMS,
        //                     title: Lang.get('customactivity_threekindoms_title'),
        //                     srcData: data
        //                 });
        //             }
        //         }
        //     }
        // }
        return tabDatas;
    };
    export let   getLeftDHMSFormat = function (t) {
        var leftTime = t - G_ServerTime.getTime();
        var [day, hour, min, second] = G_ServerTime.convertSecondToDayHourMinSecond(leftTime);
        if (day >= 1) {
            if (hour < 1) {
                hour = 1;
            }
            return cc.js.formatStr(Lang.get('common_time_D'), day, hour);
        }
        // var time = cc.js.formatStr(Lang.get('common_time_DHM'), hour, min, second);
        var str = "";
        if(hour<10)
        str = "0"+hour;
        else 
        str = hour;
        if(min<10)
        str = str + ":0"+min;
        else
        str = str + ":"+min;
        if(second<10)
        str = str + ":0"+second;
        else 
        str = str + ":"+second;
        return str;
    };
    export let   makeCustomActItemData = function (actTaskUnitData) {
        var consumeItems = actTaskUnitData.getConsumeItems();
        var fixRewards = actTaskUnitData.getRewardItems();
        var selectRewards = actTaskUnitData.getSelectRewardItems();
        var rewardNum = fixRewards.length + selectRewards.length;
        var rewards = [];
        var rewardTypes = [];
        for (var i = 1; i <= rewardNum; i += 1) {
            if (i <= fixRewards.length) {
                rewards.push(fixRewards[i-1]);
                rewardTypes.push(CustomActivityConst.REWARD_TYPE_ALL);
            } else {
                rewards.push(selectRewards[i - fixRewards.length-1]);
                rewardTypes.push(CustomActivityConst.REWARD_TYPE_SELECT);
            }
        }
        var consumeItemTypes = [];
        for (var i = 1; i <= consumeItems.length; i += 1) {
            consumeItemTypes.push(CustomActivityConst.REWARD_TYPE_ALL);
        }
        return [
            consumeItems,
            consumeItemTypes,
            rewards,
            rewardTypes
        ];
    };
    export let   getParameterConfigById = function (paramId) {
        var ParamConfig =  G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var paramInfo = ParamConfig.get(paramId);
      //assert((paramInfo, 'parameter.lua can\'t find id = '+(paramId));
        return paramInfo;
    };


}