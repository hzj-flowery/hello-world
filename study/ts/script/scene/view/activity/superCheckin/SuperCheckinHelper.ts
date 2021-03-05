import { assert } from "../../../../utils/GlobleFunc";
import { G_UserData, G_ConfigLoader } from "../../../../init";
import { ConfigNameConst } from "../../../../const/ConfigNameConst";

export let SuperCheckinHelper = {
    getAwardList() {
        var list = {};
        var curLevel = G_UserData.getBase().getLevel();
        var ActCheckinSuperConfig = G_ConfigLoader.getConfig(ConfigNameConst.ACT_CHECKIN_SUPER);//require('app.config.act_checkin_super');
        var curAwardsConfig = ActCheckinSuperConfig.get(curLevel);
      //assert((curAwardsConfig != null, 'act_checkin_super can not find level = ' + curLevel);
        var maxConfig = 9;//(curAwardsConfig._raw.length - 1) / 3;
        var awards = [];
        for (var i = 1; i<=maxConfig; i++) {
            if (curAwardsConfig['type_' + i] && curAwardsConfig['type_' + i] != 0) {
                var award = {};
                (award as any).type = curAwardsConfig['type_' + i];
                (award as any).value = curAwardsConfig['value_' + i];
                (award as any).size = curAwardsConfig['size_' + i];
                awards.push(award);
            }
        }
        return awards;
    },
    getMaxSelectNum() {
        var ParamConfig = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);//require('app.config.parameter');
        var config = ParamConfig.get(200);
      //assert((config != null, 'can not find ParamConfig id = 200');
        return parseInt(config.content);
    }
};
