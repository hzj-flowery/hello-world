import { Util } from "../../../utils/Util";

export class ExploreUIHelper {
    static makeRewards(param) {
        var cfg = param.cfg;
        var maxNum = param.maxNum || 4;
        var typeFormatStr = param.typeFormatStr;
        var valueFormatStr = param.valueFormatStr;
        var sizeFormatStr = param.sizeFormatStr;
        var rewardList = [];
        for (var i = 1; i <= maxNum; i++) {
            if (i == 1 && param.firstRewardTypeFormatStr && param.firstRewardValueFormatStr && param.firstRewardSizeFormatStr) {
                if (cfg[param.firstRewardTypeFormatStr] != 0) {
                    var reward = {
                        type: cfg[param.firstRewardTypeFormatStr],
                        value: cfg[param.firstRewardValueFormatStr],
                        size: cfg[param.firstRewardSizeFormatStr]
                    };
                    rewardList.push(reward);
                }
            } else {
                if (cfg[Util.format(typeFormatStr, i)] != 0) {
                    var reward = {
                        type: cfg[Util.format(typeFormatStr, i)],
                        value: cfg[Util.format(valueFormatStr, i)],
                        size: cfg[Util.format(sizeFormatStr, i)]
                    };
                    rewardList.push(reward);
                }
            }
        }
        return rewardList;
    }
    static makeExploreRebelRewards(cfg) {
        var param = {
            cfg: cfg,
            maxNum: 2,
            typeFormatStr: 'kill%d_type',
            valueFormatStr: 'kill%d_resource',
            sizeFormatStr: 'kill%d_size',
            firstRewardTypeFormatStr: 'kill_type',
            firstRewardValueFormatStr: 'kill_resource',
            firstRewardSizeFormatStr: 'kill_size'
        };
        var rewards = ExploreUIHelper.makeRewards(param);
        return rewards;
    }
}