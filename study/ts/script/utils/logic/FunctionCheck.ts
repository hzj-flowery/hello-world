import { assert } from "../GlobleFunc";
import { BaseConfig } from "../../config/BaseConfig";
import { G_ConfigLoader, G_UserData, G_ConfigManager } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { UserCheck } from "./UserCheck";
import { VipData } from "../../data/VipData";
import { FunctionConst } from "../../const/FunctionConst";

/**
 * --逻辑检查函数列表
 * --用户数据逻辑检查
 */
export namespace FunctionCheck {
    let cfg: BaseConfig;
    function getLevelConfig() {
        if (!cfg) {
            cfg = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
        }

        return cfg;
    }

    // --策划配置格式 0|0 需要转化 成秒
    export function getFunctionUpdateTime(timeStr: string) {
        if (!timeStr || timeStr == '') {
            return;
        }
        let timeStrArr = timeStr.split('|');
        let hour = parseInt(timeStrArr[0]) || 0;
        let min = parseInt(timeStrArr[1]) || 0;
        return hour * 3600 + min * 60;
    }

    export function functionOpen(funcId, callback) {
        // assert(FunctionSetting[funcId], 'Invalid FunctionSetting key: ' + tostring(funcId));
    };

    /**
     * 判断一个模块是否开启
	一个模块是否开启分为两个维度
	1.是否达到开启条件
	2.当前功能是否能开启（就是是否被人为屏蔽）
     * @param funcId 
     * @param callback 
     * @param userLastLevel 
     */
    export function funcIsOpened(funcId, callback?, userLastLevel?): any[] {
        if (!funcId) {
            if (callback) {
                callback(false);
            }
            return [false, null, null];
        }
        let funcLevelInfo = getLevelConfig().get(funcId);
        let commit = funcLevelInfo.comment;
        let userCheck = UserCheck.enoughLevel(funcLevelInfo.level);
        if (userLastLevel) {
            userCheck = UserCheck.enoughLastLevel(funcLevelInfo.level);
        }
        //插一下代码  5,6 位置 老服上阵了但是等级没达到就还可以操作
        if (!userCheck && (funcId == FunctionConst.FUNC_TEAM_SLOT5 || funcId == FunctionConst.FUNC_TEAM_SLOT6)) {
            var heroIdList = G_UserData.getTeam().getHeroIdsInBattle();
            var heroId = heroIdList[funcId - FunctionConst.FUNC_TEAM_SLOT1];
            userCheck = userCheck || heroId != undefined;
        }
        if (userCheck && funcLevelInfo.day > 0) {
            let resetTime = this.getFunctionUpdateTime(funcLevelInfo.update_time);
            userCheck = UserCheck.enoughOpenDay(funcLevelInfo.day, resetTime);
            commit = funcLevelInfo.comment_time;
        }
        let needVipLevel = 99;
        if (funcLevelInfo.vip_level > 0) {
            needVipLevel = funcLevelInfo.vip_level;
        }
        let userVipLevel = G_UserData.getVip().getLevel();
        if (userCheck || userVipLevel >= needVipLevel) {
            if (callback) {
                callback(true);
            }
            return [
                true,
                funcLevelInfo.description,
                funcLevelInfo
            ];
        }
        return [
            false,
            commit,
            funcLevelInfo
        ];
    };

    export function funcIsShow(funcId, callback?) {
        let funcLevelInfo = getLevelConfig().get(funcId);
        assert(funcLevelInfo, 'Invalid function_level can not find funcId ' + funcId);
        let userCheck = UserCheck.enoughLevel(funcLevelInfo.show_level);
        let timeCheck = true;
        if (funcLevelInfo.show_day > 0) {
            let resetTime = this.getFunctionUpdateTime(funcLevelInfo.update_time);
            timeCheck = UserCheck.enoughOpenDay(funcLevelInfo.show_day, resetTime);
        }
        return userCheck && timeCheck;
    }
}