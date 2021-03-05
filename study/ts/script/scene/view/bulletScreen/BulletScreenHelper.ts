import { G_ResolutionManager, G_ConfigLoader } from "../../../init";
import { BullectScreenConst } from "../../../const/BullectScreenConst";

export class BulletScreenHelper {


    public static TYPE_UNIFORM = 1;
    public static TYPE_RIGHT_FADEIN_UNIFORM = 2;
    public static TYOE_RIGHT_FADEIN_UNIFORM_LEFT_FADEOUT = 3;
    public static TYPE_RIGHT_UNIFORM_LEFT_FADEOUT = 4;
    public static getParameterTime() {
        var min = parseInt((BulletScreenHelper.getParameter('boss_speed_section').split('|'))[0]);
        var max = parseInt((BulletScreenHelper.getParameter('boss_speed_section').split('|'))[1]);
        var time = (Math.floor(Math.random() * (max - min)) + min) / 1000;

        return time;
    }
    public static action(type, offset, time) {
        var action = null;
        if (type == BulletScreenHelper.TYPE_UNIFORM) {
            var width = G_ResolutionManager.getDesignWidth();
            action = cc.moveBy(time, cc.v2(-width + offset, 0));
        } else if (type == BulletScreenHelper.TYPE_RIGHT_FADEIN_UNIFORM) {
            action = cc.spawn((cc.spawn(cc.fadeIn(0.5).easing(cc.easeExponentialOut), cc.moveBy(0.5, cc.v2(-400, 0)).easing(cc.easeExponentialOut))), cc.sequence(cc.delayTime(0.3), cc.moveBy(6, cc.v2(-540 + offset, 0))));
        } else if (type == BulletScreenHelper.TYOE_RIGHT_FADEIN_UNIFORM_LEFT_FADEOUT) {
            action = cc.spawn((cc.spawn(cc.fadeIn(0.5).easing(cc.easeExponentialOut), cc.moveBy(0.5, cc.v2(-400, 0)).easing(cc.easeExponentialOut))), cc.sequence(cc.delayTime(0.3), cc.moveBy(6, cc.v2(-540 + offset, 0))), cc.sequence(cc.delayTime(3), (cc.spawn(cc.fadeOut(0.5).easing(cc.easeExponentialOut), cc.moveBy(0.5, cc.v2(-300, 0)).easing(cc.easeExponentialOut)))));
        } else if (type == BulletScreenHelper.TYPE_RIGHT_UNIFORM_LEFT_FADEOUT) {
            var width = G_ResolutionManager.getDesignWidth();
            action = cc.spawn(cc.sequence(cc.moveBy(8, cc.v2(-width + offset, 0))), cc.sequence(cc.delayTime(5), (cc.spawn(cc.fadeOut(0.5).easing(cc.easeExponentialOut), cc.moveBy(0.5, cc.v2(-300, 0)).easing(cc.easeExponentialOut)))));
        } else if (type == BullectScreenConst.TYPE_MIDDLE) {
        }
        return cc.sequence(action, cc.callFunc(function () {
        }));
    }
    public static getParameter(keyIndex) {
        var parameter = G_ConfigLoader.getConfig("parameter");
        for (var i = 1; i <= parameter.length(); i++) {
            var configData = parameter.indexOf(i);
            if (configData.key == keyIndex) {
                return configData.content;
            }
        }
        // assert(false, ' can\'t find key index in BulletScreenHelper.getParameter' + keyIndex);
        return null;
    }
    public static getBulletShowTime() {
        var tempDesc = BulletScreenHelper.getParameter('boss_paomadeng_interval');
        var min = parseInt((tempDesc.split('|'))[0]);
        var max = parseInt((tempDesc.split('|'))[1]);
        var sec = (Math.floor(Math.random() * (max - min)) + min) / 1000;
        return sec;
    }
    public static getBulletShowDistance() {
        var tempDesc = BulletScreenHelper.getParameter('boss_barrage_distance');
        return parseInt(tempDesc);
    }

}