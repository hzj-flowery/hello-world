import { G_ResolutionManager } from "../../init";

export namespace PromptAction {
    export function tipAction() {
        return cc.sequence(cc.spawn(cc.moveBy(0.15, cc.v2(0, 40)), cc.fadeIn(0.15)), cc.delayTime(0.8), cc.spawn(cc.moveBy(0.4, cc.v2(0, 100)), cc.fadeOut(0.4)));
    };
    export function PopupAction(position?) {
        var width = 0; G_ResolutionManager.getDesignWidth();
        var height = 0; G_ResolutionManager.getDesignHeight();
        var dstPosition = cc.v2(width * 0.5, height * 0.5);
        position = position || dstPosition;
        var offset = dstPosition.sub(position);
        var duration = 0.3;
        return cc.spawn(
            cc.spawn(
                cc.scaleTo(duration, 1).easing(cc.easeBackOut()),
                cc.moveBy(duration, offset).easing(cc.easeBackOut())),
            cc.fadeIn(0.1));
    };
    export function popupBackAction(position) {
        var width = G_ResolutionManager.getDesignWidth();
        var height = G_ResolutionManager.getDesignHeight();
        var dstPosition = position || cc.v2(width * 0.5, height * 0.5);
        var duration = 0.3;
        return cc.spawn(cc.spawn(cc.scaleTo(duration, 0).easing(cc.easeBackOut()), cc.moveTo(duration, dstPosition).easing(cc.easeBackOut())), cc.fadeOut(0.1));
    };
    export function awardSummaryIconAction() {
        return cc.sequence(cc.spawn(cc.scaleTo(0.4, 1).easing(cc.easeBackOut()), cc.fadeIn(0.4).easing(cc.easeBackOut())), cc.delayTime(0.8), cc.spawn(cc.moveBy(0.4, cc.v2(0, 100)), cc.fadeOut(0.4)));
    };
    export function awardSummaryIconNameAction() {
        return cc.sequence(cc.delayTime(0.2), cc.spawn(cc.scaleTo(0.4, 1).easing(cc.easeBackOut()), cc.fadeIn(0.4).easing(cc.easeBackOut())), cc.delayTime(0.6), cc.spawn(cc.moveBy(0.4, cc.v2(0, 100)), cc.fadeOut(0.4)));
    };
}