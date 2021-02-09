import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "./ConfigNameConst";

export namespace RedPacketRainConst {
    export const TYPE_BIG = 1;
    export const TYPE_SMALL = 2;
    export const RESULT_TYPE_1 = 1;
    export const RESULT_TYPE_2 = 2;
    export const RESULT_TYPE_3 = 3;
    export let TIME_PRE_SHOW_ICON;
    export let TIME_PRE_START;
    export let TIME_PRE_FINISH;
    export let TIME_PLAY;
    export let TIME_DISAPPEAR;
    export const RAIN_STATE_PRE = 1;
    export const RAIN_STATE_ING = 2;
    export const RAIN_STATE_FINISH = 3;

    export function init() {
        let Config = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER_REDPACKET_RAIN);
        TIME_PRE_SHOW_ICON = Number(Config.get(1).content);
        TIME_PRE_START = 3; //Number(Config.get(2).content);
        TIME_PRE_FINISH = Number(Config.get(4).content);
        TIME_PLAY = Number(Config.get(3).content);
        TIME_DISAPPEAR = Number(Config.get(5).content);
    }
}