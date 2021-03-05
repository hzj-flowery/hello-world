import { G_ConfigLoader } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { assert } from "../../../utils/GlobleFunc";

export namespace EnemyHelper {
    export let getDayMaxRevengeNum = function () {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(222);
      //assert((config != null, 'can not find ParamConfig id = 222');
        return parseInt(config.content);
    };
    export let getFightSuccessEnergy = function () {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(225);
      //assert((config != null, 'can not find ParamConfig id = 225');
        return parseInt(config.content);
    };
    export let getFightWinVaule = function () {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(217);
      //assert((config != null, 'can not find ParamConfig id = 217');
        return parseInt(config.content);
    };
    export let getFightLoseVaule = function () {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(219);
      //assert((config != null, 'can not find ParamConfig id = 219');
        return parseInt(config.content);
    };
    export let getMaxEnemyNum = function () {
        var config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(221);
      //assert((config != null, 'can not find ParamConfig id = 221');
        return parseInt(config.content);
    };
}