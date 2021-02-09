import { RichTextExtend } from "../../extends/RichTextExtend";
import { G_ResolutionManager, G_SceneManager } from "../../init";
import { PromptAction } from "./PromptAction";

export default class PromptSummary {
    private static TEXT_LINE_INTERVAL = 35;

    show(params) {
        if (params.length == 0) {
            return;
        }
        let richTexts: cc.RichText[] = [];
        for (let i = 0; i < params.length; i++) {
            let param = params[i];
            let node = new cc.Node;
            let richText = node.addComponent(cc.RichText);
            if (param.content) {
                RichTextExtend.setRichTextWithJson(richText, param.content);
            } else {
                RichTextExtend.setRichText(richText, param);
            }
            richTexts.push(richText);
        }
        var nums = richTexts.length;
        var runningScene = G_SceneManager.getRunningScene();
        var width = G_ResolutionManager.getDesignWidth();
        var height = G_ResolutionManager.getDesignHeight();
        var endY = height * 0.5 + nums / 2 * 40;
        for (let i = 0; i < nums; i++) {
            var index = i - nums / 2 + 0.5;
            var richText = richTexts[i];
            runningScene.addTextSummary(richText.node);
            var anchorPoint = params[i].anchorPoint || cc.v2(0.5, 0.5);
            richText.node.setAnchorPoint(anchorPoint);
            var offsetX = params[i].startPosition && params[i].startPosition.x ? params[i].startPosition.x : 0;
            var offsetY = params[i].startPosition && params[i].startPosition.y ? params[i].startPosition.y : 0;
            richText.node.setPosition(cc.v2(offsetX, offsetY - PromptSummary.TEXT_LINE_INTERVAL * index));
            richText.node.setScale(0.5);
            var actions = [];
             actions.push(PromptAction.PopupAction());
            actions.push(cc.delayTime(1));
            if (params[i].dstPosition) {
                actions.push(
                    cc.sequence(
                        cc.spawn(cc.moveTo(0.5, params[i].dstPosition),
                            cc.scaleTo(0.5, 0.8)),
                        cc.callFunc( () => {
                            if (params[i].finishCallback) {
                                params[i].finishCallback(i);
                            }
                        }), cc.destroySelf()));
            } else {
                actions.push(cc.sequence(
                    cc.spawn(cc.fadeOut(0.5),
                    
                        cc.moveBy(0.7, cc.v2(0, 80))),
                    cc.callFunc( ()=> {
                        if (params[i].finishCallback) {
                            params[i].finishCallback(i);
                        }
                    }), cc.destroySelf()));
            }
            richText.node.runAction(cc.sequence(actions));
        }
        return endY;
    }
    _getRunAction(index, dstPosition, finishCallback) {
        var runningAction = null;
        if (dstPosition) {
            var dstPos = dstPosition;
            dstPos.y = dstPos.y - PromptSummary.TEXT_LINE_INTERVAL * index;
            var spawnAction = cc.spawn(cc.moveTo(0.5, dstPosition), cc.scaleTo(0.5, 0.3));
            var callAction = cc.callFunc(function () {
                if (finishCallback) {
                    finishCallback();
                }
            });
            runningAction = cc.sequence(spawnAction, callAction, cc.destroySelf());
        } else {
            cc.sequence(cc.spawn(cc.fadeOut(0.5), cc.moveBy(0.7, cc.v2(0, 80))), cc.destroySelf());
        }
        return runningAction;
    }
}