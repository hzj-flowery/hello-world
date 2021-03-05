import { table } from "../table";

export namespace ReturnDataHelper {
    export function getRewardConfigInfo(configInfo, num) {
        var rewardConfigInfo = [];
        if (configInfo == null) {
            return {};
        }
        for (var index = 1; index <= num; index++) {
            var reward_type = configInfo['reward_type' + index];
            var reward_value = configInfo['reward_value' + index];
            var reward_size = configInfo['reward_size' + index];
            if (reward_size && reward_size > 0) {
                table.insert(rewardConfigInfo, {
                    type: reward_type,
                    value: reward_value,
                    size: reward_size
                });
            }
        }
        return rewardConfigInfo;
    }
}
