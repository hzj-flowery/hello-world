import { FunctionConst } from "../../const/FunctionConst";
import { G_UserData, G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";

export namespace GroupsDataHelper {
    export function getTeamTargetConfig(targetId) {
        let info = G_ConfigLoader.getConfig(ConfigNameConst.TEAM_TARGET).get(targetId);
        console.assert(info, 'team_target config can not find target = %d');
        return info;
    };
    export function getTeamInfoConfig(id) {
        let info = G_ConfigLoader.getConfig(ConfigNameConst.TEAM_INFO).get(id);
        console.assert(info, 'team_info config can not find id = %d');
        return info;
    };
    export function getGroupInfos() {
        let result = [];
        let Config = G_ConfigLoader.getConfig(ConfigNameConst.TEAM_INFO);
        let funcLevel = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
        for (let i = 0; i < Config.length(); i++) {
            let info = Config.indexOf(i);
            let funcInfo = funcLevel.get(info.function_id);
            console.assert(funcInfo, 'function_level config can not find function_id = %d');
            result.push({
                configInfo: info,
                name: funcInfo.name
            });
        }
        return result;
    };
    export function getGroupIdWithFunctionId(functionId) {
        let groupId = 0;
        let Config = G_ConfigLoader.getConfig(ConfigNameConst.TEAM_INFO);
        for (let i = 0; i < Config.length(); i++) {
            let info = Config.indexOf(i);
            if (info.function_id == functionId) {
                groupId = info.id;
            }
        }
        return groupId;
    };
    export function getGroupTypeWithTarget(targetId) {
        let Config = G_ConfigLoader.getConfig(ConfigNameConst.TEAM_INFO);
        for (let i = 0; i < Config.length(); i++) {
            let info = Config.indexOf(i);
            let targetIds = info.target.split('|');
            for (let k in targetIds) {
                let id = targetIds[k];
                if (Number(id) == targetId) {
                    return info.id;
                }
            }
        }
        return 0;
    };
    export function getActiveState(functionId) {
        let isOpen = null, openSec, closeSec;
        if (functionId == FunctionConst.FUNC_MAUSOLEUM) {
            let qinCfg = G_ConfigLoader.getConfig(ConfigNameConst.QIN_INFO).get(1);
            isOpen = G_UserData.getQinTomb().isQinOpen();
            openSec = Number(qinCfg.open_time);
            closeSec = Number(qinCfg.close_time);
        }
        return [
            isOpen,
            openSec,
            closeSec
        ];
    };
    export function getActiveCloseTime(functionId) {
        let closeTime = 0;
        if (functionId == FunctionConst.FUNC_MAUSOLEUM) {
            closeTime = G_UserData.getQinTomb().getCloseTime();
        }
        return closeTime;
    };
    export function getMyActiveLeftTime(functionId) {
        let leftTime = 0;
        if (functionId == FunctionConst.FUNC_MAUSOLEUM) {
            leftTime = G_UserData.getBase().getGrave_left_sec();
        }
        return leftTime;
    };
    export function getMyActiveAssistTime(functionId) {
        let assistTime = 0;
        if (functionId == FunctionConst.FUNC_MAUSOLEUM) {
            assistTime = G_UserData.getBase().getGrave_assist_sec();
        }
        return assistTime;
    };
};