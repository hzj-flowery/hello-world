import { G_UserData, G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { FunctionConst } from "../../const/FunctionConst";
import { LogicCheckHelper } from "../LogicCheckHelper";
export namespace TeamDataHelper {
    export function isHaveEquipInPos(baseId, pos) {
        let equipIds = G_UserData.getBattleResource().getEquipIdsWithPos(pos);
        for (let i in equipIds) {
            let id = equipIds[i];
            let equipData = G_UserData.getEquipment().getEquipmentDataWithId(id);
            let equipBaseId = equipData.getBase_id();
            if (equipBaseId == baseId) {
                return true;
            }
        }
        return false;
    };
    export function getOpenLevelWithId(funcId) {
        console.assert(funcId, 'FunctionConst can not find funcId be nil ');
        let config = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(funcId);
        console.assert(config, 'function_level config can not find id = %d');
        return config.level;
    };
    export function getHeroBaseIdWithPos(pos) {
        let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
        let unitData = G_UserData.getHero().getUnitDataWithId(heroId);
        let baseId = unitData.getBase_id();
        return baseId;
    };
    export function getTeamOpenCount() {
        let count = 0;
        for (let i = 1; i <= 6; i++) {
            let isOpen = LogicCheckHelper.funcIsOpened(FunctionConst['FUNC_TEAM_SLOT' + i])[0];
            if (isOpen) {
                count = count + 1;
            }
        }
        return count;
    };
};