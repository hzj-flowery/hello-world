import { ActivityConst } from "../../const/ActivityConst";
import { UserCheck } from "../logic/UserCheck";

export namespace ActivityDataHelper {
    export function checkPackBeforeGetActReward(data) {
        let cfg = data.getConfig();
        console.log(cfg);
        let rewardType = cfg.type;
        let rewardValue = cfg.value;
        let [isFull, leftCapacity] = UserCheck.isPackFull(rewardType, rewardValue);
        if (isFull) {
            return false;
        }
        return true;
    };
    export function checkPackBeforeGetActReward2(data) {
        let cfg = data.getConfig();
        console.log(cfg);
        let rewardType = cfg.reward_type;
        let rewardValue = cfg.reward_value;
        let [isFull, leftCapacity] = UserCheck.isPackFull(rewardType, rewardValue);
        if (isFull) {
            return false;
        }
        return true;
    };
    export function getFundGroupByFundActivityId(actId) {
        if (actId <= ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
            return null;
        }
        return actId - ActivityConst.ACT_ID_OPEN_SERVER_FUND;
    };
};