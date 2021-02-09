import { CakeActivityConst } from "../../const/CakeActivityConst";
import { G_UserData, G_ServerTime, G_ConfigLoader, G_Prompt } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { Lang } from "../../lang/Lang";
import { assert } from "../GlobleFunc";
import { Path } from "../Path";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { AudioConst } from "../../const/AudioConst";
import { BaseConfig } from "../../config/BaseConfig";

export namespace CakeActivityDataHelper {
    let cakeLevelConfig:BaseConfig;
    let cakeTaskConfig:BaseConfig;
    let cakeChangeConfig:BaseConfig;
    let cakeDailyConfig:BaseConfig;
    let cakeResourceConfig:BaseConfig;
    export function initConfig():void{
        cakeLevelConfig =  G_ConfigLoader.getConfig(ConfigNameConst.CAKE_LEVEL);
        cakeTaskConfig = G_ConfigLoader.getConfig(ConfigNameConst.CAKE_TASK);
        cakeChangeConfig = G_ConfigLoader.getConfig(ConfigNameConst.CAKE_CHARGE);
        cakeDailyConfig = G_ConfigLoader.getConfig(ConfigNameConst.CAKE_DAILY);
        cakeResourceConfig = G_ConfigLoader.getConfig(ConfigNameConst.CAKE_RESOURCE);
    }
    export function getCakeLevelConfig(type, id) {
        var info = cakeLevelConfig.get(type, id);
        console.assert(info, 'cake_level config can not find id = %d');
        return info;
    }
    export function  getCurCakeLevelConfig(id) {
        var actType = G_UserData.getCakeActivity().getActType();
        var info = CakeActivityDataHelper.getCakeLevelConfig(actType, id);
        return info;
    };
    export function getCakeTaskConfig(type, id) {
        var info = cakeTaskConfig.get(type, id);
        return info;
    };
    export function  getCurCakeTaskConfig(id) {
        var actType = G_UserData.getCakeActivity().getActType();
        var info = CakeActivityDataHelper.getCakeTaskConfig(actType, id);
        return info;
    };

    export function getCakeChargeConfig(id) {
        let info = cakeChangeConfig.get(id);
        console.assert(info, 'cake_charge config can not find id = %d');
        return info;
    };
    export function getCakeDailyConfig (type, daily) {
        var info = cakeDailyConfig.get(type, daily);
        return info;
    };
    export function getCurCakeDailyConfig (daily) {
        var actType = G_UserData.getCakeActivity().getActType();
        var info = CakeActivityDataHelper.getCakeDailyConfig(actType, daily);
        return info;
    };
    export function getCakeResouceConfig (type) {
        var info = cakeResourceConfig.get(type);
        return info;
    };
    export function getCurCakeResouceConfig () {
        var actType = G_UserData.getCakeActivity().getActType();
        var info = CakeActivityDataHelper.getCakeResouceConfig(actType);
        return info;
    };
    export function getMaterialItemId (type) {
        var info = CakeActivityDataHelper.getCurCakeResouceConfig();
        var itemId = info['gift' + (type + '_item_id')];
        return [
            itemId,
            info
        ];
    };
    export function getMaterialName (type) {
        var [itemId] = CakeActivityDataHelper.getMaterialItemId(type);
        var itemName = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId).name;
        return itemName;
    };
    export function getMaterialValue (type) {
        var info = CakeActivityDataHelper.getCurCakeResouceConfig();
        var value = info['gift' + (type + '_point')];
        return value;
    };
    export function getMaterialMoving (type) {
        var info = CakeActivityDataHelper.getCurCakeResouceConfig();
        var moving = info['gift' + (type + '_moving')];
        return moving;
    };
    export function getBulletPlayTime (type) {
        var info = CakeActivityDataHelper.getCurCakeResouceConfig();
        var time = info['gift' + (type + '_time')];
        return time;
    };
    export function getTabTitleNames () {
        var result = [];
        var info = CakeActivityDataHelper.getCurCakeResouceConfig();
        for (var i = 1; i <= 2; i++) {
            result.push(info['cake_name' + i]);
        }
        return result;
    };
    export function getFoodName () {
        var info = CakeActivityDataHelper.getCurCakeResouceConfig();
        return info.type_name;
    };
    export function getMaterialTypeWithId (id) {
        for (var materialType = CakeActivityConst.MATERIAL_TYPE_1; materialType <= CakeActivityConst.MATERIAL_TYPE_3; materialType++) {
            var [itemId] = CakeActivityDataHelper.getMaterialItemId(materialType);
            if (id == itemId) {
                return materialType;
            }
        }
    };
    export function getMaterialIconWithId (id) {
        var res = null;
        for (var materialType = CakeActivityConst.MATERIAL_TYPE_1; materialType <= CakeActivityConst.MATERIAL_TYPE_3; materialType++) {
            var [itemId, info] = CakeActivityDataHelper.getMaterialItemId(materialType);
            if (id == itemId) {
                var resName = info['gift' + (materialType + '_resouce')];
                res = Path.getAnniversaryImg(resName);
                break;
            }
        }
        if (res == null) {
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, id);
            res = param.icon;
        }
        return res;
    };
    export function getMaterialSoundIdWithId (id) {
        var TYPE2SOUNDID = {
            [CakeActivityConst.MATERIAL_TYPE_1]: AudioConst.SOUND_CAKE_EGG,
            [CakeActivityConst.MATERIAL_TYPE_2]: AudioConst.SOUND_CAKE_CREAM,
            [CakeActivityConst.MATERIAL_TYPE_3]: AudioConst.SOUND_CAKE_FRUIT
        };
        var type = CakeActivityDataHelper.getMaterialTypeWithId(id);
        var soundId = TYPE2SOUNDID[type] || 0;
        return soundId;
    };
    export function getAllServerStageStartTime() {
        let startTime1 = G_UserData.getCakeActivity().getActivityStartTime();
        let endTime1 = startTime1 + CakeActivityConst.CAKE_LOCAL_TIME;
        let startTime2 = endTime1 + CakeActivityConst.CAKE_TIME_GAP;
        return startTime2;
    };
    export function getActStage(): any[] {
        let startTime1 = G_UserData.getCakeActivity().getActivityStartTime();
        let endTime1 = startTime1 + CakeActivityConst.CAKE_LOCAL_TIME;
        let startTime2 = endTime1 + CakeActivityConst.CAKE_TIME_GAP;
        let endTime2 = startTime2 + CakeActivityConst.CAKE_CROSS_TIME;
        let showEndTime = endTime2 + CakeActivityConst.CAKE_TIME_LEFT;
        let curTime = G_ServerTime.getTime();
        if (startTime1 == 0) {
            return [CakeActivityConst.ACT_STAGE_0, null, null];
        }
        if (curTime >= startTime1 && curTime < endTime1) {
            return [
                CakeActivityConst.ACT_STAGE_1,
                startTime1,
                endTime1
            ];
        } else if (curTime >= endTime1 && curTime < startTime2) {
            return [
                CakeActivityConst.ACT_STAGE_2,
                endTime1,
                startTime2
            ];
        } else if (curTime >= startTime2 && curTime < endTime2) {
            return [
                CakeActivityConst.ACT_STAGE_3,
                startTime2,
                endTime2
            ];
        } else if (curTime >= endTime2 && curTime < showEndTime) {
            return [
                CakeActivityConst.ACT_STAGE_4,
                endTime2,
                showEndTime
            ];
        } else {
            return [
                CakeActivityConst.ACT_STAGE_0,
                startTime1,
                showEndTime
            ];
        }
    };
    export function isCanGiveMaterial(isShowTip?) {
        let actStage = CakeActivityDataHelper.getActStage()[0];
        if (actStage == CakeActivityConst.ACT_STAGE_0) {
            if (isShowTip) {
                G_Prompt.showTip(Lang.get('cake_activity_act_end_tip'));
            }
            return false;
        } else if (actStage == CakeActivityConst.ACT_STAGE_2) {
            if (isShowTip) {
                G_Prompt.showTip(Lang.get('cake_activity_act_end_tip2'));
            }
            return false;
        } else if (actStage == CakeActivityConst.ACT_STAGE_4) {
            if (isShowTip) {
                G_Prompt.showTip(Lang.get('cake_activity_act_end_tip3'));
            }
            return false;
        }
        return true;
    };
    export function isCanRecharge() {
        let actStage = CakeActivityDataHelper.getActStage()[0];
        if (actStage == CakeActivityConst.ACT_STAGE_0 || actStage == CakeActivityConst.ACT_STAGE_4) {
            G_Prompt.showTip(Lang.get('cake_activity_act_end_tip'));
            return false;
        }
        return true;
    };
    export function formatServerName(serverName: string, txtLen) {
        txtLen = txtLen || 8;
        let len = serverName.length;
        let str = serverName.substr(0, txtLen);
        if (len > txtLen) {
            str = str + '..';
        }
        return str;
    };
    export function  getDailyAwardInfo() {
        var result = [];
        var Config = cakeDailyConfig;
        var actType = G_UserData.getCakeActivity().getActType();
        var len = Config.length();
        for (var i = 0; i < len; i++) {
            var info = Config.indexOf(i);
            if (info.type == actType) {
                var temp:any = {};
                temp.awards = [];
                temp.day = info.daily;
                temp.state = CakeActivityDataHelper.getDailyAwardState(info.daily);
                for (var j = 1; j <= 5; j++) {
                    if (info['type_' + j] > 0 && info['id_' + j] > 0 && info['size_' + j] > 0) {
                        temp.awards.push({
                            type: info['type_' + j],
                            value: info['id_' + j],
                            size: info['size_' + j]
                        });
                    }
                }
                result.push(temp);
            }
        }
        return result;
    };

    export function  getDailyAwardMaxDay() {
        var maxDay = 0;
        var Config = cakeDailyConfig;
        var actType = G_UserData.getCakeActivity().getActType();
        var len = Config.length();
        for (var i = 1; i != len; i++) {
            var info = Config.indexOf(i);
            if (info.type == actType) {
                maxDay = info.daily;
            }
        }
        return maxDay;
    };

    export function  getDailyAwardState (day) {
        var state = null;
        var data = G_UserData.getCakeActivity().getLoginRewardWithDay(day);
        if (data) {
            if (data.isReceived) {
                state = CakeActivityConst.DAILY_AWARD_STATE_3;
            } else {
                state = CakeActivityConst.DAILY_AWARD_STATE_2;
            }
        } else {
            var startTime = G_UserData.getCakeActivity().getActivityStartTime();
            var curTime = G_ServerTime.getTime();
            var openZeroTime = G_ServerTime.secondsFromZero(startTime);
            var currZeroTime = G_ServerTime.secondsFromZero(curTime);
            var curDay = Math.ceil((currZeroTime - openZeroTime) / (3600 * 24));
            curDay = curDay + 1;
            if (day < curDay) {
                state = CakeActivityConst.DAILY_AWARD_STATE_1;
            } else if (day > curDay) {
                state = CakeActivityConst.DAILY_AWARD_STATE_4;
            } else {
                state = CakeActivityConst.DAILY_AWARD_STATE_0;
            }
        }
        return state;
    };

    export function  getLevelAwardInfo(curLevel) {
        var result = [];
        var limitLevel = 0;
        if (curLevel <= 3) {
            limitLevel = 5;
        } else {
            limitLevel = curLevel + 2;
        }
        var Config = cakeLevelConfig;;
        var len = Config.length();
        var actType = G_UserData.getCakeActivity().getActType();
        for (var i = 0; i < len; i++) {
            var info = Config.indexOf(i);
            if (info.type == actType) {
                var temp:any= {};
                if (info.lv <= limitLevel) {
                    temp.level = info.lv;
                    temp.state = CakeActivityDataHelper.getLevelAwardState(info.lv);
                    temp.awards = [];
                    for (var j = 1; j <= 4; j++) {
                        if (info['type_' + j] > 0 && info['id_' + j] > 0 && info['size_' + j] > 0) {
                            temp.awards.push({
                                type: info['type_' + j],
                                value: info['id_' + j],
                                size: info['size_' + j]
                            });
                        }
                    }
                    if (temp.awards.length > 0) {
                        result.push(temp);
                    }
                }
            }
        }
        return result;
    };

    export function getLevelAwardState(level) {
        let awardId = level;
        let state = null;
        let data = G_UserData.getCakeActivity().getUpRewardWithId(awardId);
        if (data) {
            if (data.isReceived) {
                state = CakeActivityConst.AWARD_STATE_3;
            } else {
                state = CakeActivityConst.AWARD_STATE_2;
            }
        } else {
            state = CakeActivityConst.AWARD_STATE_1;
        }
        return state;
    };
}