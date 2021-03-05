import { AttrData } from "../../data/AttrData";
import { G_ConfigManager, G_EffectGfxMgr, G_SceneManager, G_UserData } from "../../init";
import { TextHelper } from "../../utils/TextHelper";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { Util } from "../../utils/Util";
import CommonAwardTip from "../component/CommonAwardTip";
import CommonPowerPrompt from "../component/CommonPowerPrompt";
import PrompTip from "../PromptTip";
import PromptRewards from "./PromptRewards";
import PromptSummary from "./PromptSummary";
import PromptTextSummary from "./PromptTextSummary";

export default class PromptManager {

    private _promptReward;

    constructor() {
    }
    showTipDelay(params, callback, delayTime) {
        if (params != null) {
            var promptTip: PrompTip = this.getPromptip();
            promptTip.setCallBack(callback);
            promptTip.show(params, delayTime);
        }
    }
    showTip(params, callback = null) {
        if (!G_ConfigManager.checkCanRecharge() && typeof(params) == 'string' && params.indexOf('充值') != -1) {
            params = params.replace('充值', "获取");
        }
        if (params != null) {
            var promptTip: PrompTip = this.getPromptip();
            promptTip.setCallBack(callback);
            promptTip.show(params, 0);
        }
    }
    showTipOnTop(params, callback?) {
        if (params != null) {
            var promptTip: PrompTip = this.getPromptip();
            promptTip.setCallBack(callback);
            promptTip.showOnTop(params, 0);
        }
    }
    clearTips() {
        var scene = G_SceneManager.getRunningScene();
        scene.removeAllTips();
    }
    showAwards(awards) {
        if (!this._promptReward) {
            this._promptReward = new PromptRewards();
        }
        if (awards.length > 0) {
            this._promptReward.show(awards);
        }
    }
    showTextSummary(params, extParams) {
        var summary = new PromptTextSummary();
        summary.show(params, extParams);
    }
    showSummary(params) {
        var promptSummary = new PromptSummary();
        promptSummary.show(params);
        //console.log(params);
    }
    showPower() {
    }
    playTotalPowerSummary(offsetX?, offsetY?) {
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;
        cc.resources.load('prefab/common/CommonPowerPrompt', () => {
            var prompt: CommonPowerPrompt = Util.getNode('prefab/common/CommonPowerPrompt', CommonPowerPrompt);
            var attrData: AttrData = G_UserData.getAttr();
            var diffPower = attrData.getPowerDiffValue();
            var curPower = attrData.getCurPower();
            prompt.updateUI(curPower, diffPower);
            prompt.play(offsetX, offsetY);
        });
    }
    playTotalPowerSummaryWithKey(key, offsetX, offsetY) {
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;
        cc.resources.load('prefab/common/CommonPowerPrompt', () => {
            var prompt: CommonPowerPrompt = Util.getNode('prefab/common/CommonPowerPrompt', CommonPowerPrompt);
            var attrData: AttrData = G_UserData.getAttr();
            var curPower = attrData.getCurPowerWithKey(key);
            var diffPower = attrData.getPowerDiffValueWithKey(key);
            prompt.updateUI(curPower, diffPower);
            prompt.play(offsetX, offsetY);
        });
    }
    showAwardsExploreMode(rootNode, awards) {
        function createResNode(award) {
            var gainNode: CommonAwardTip = Util.getNode('prefab/common/CommonAwardTip', CommonAwardTip);
            var textValue = gainNode._textValue;
            var imageRes = gainNode._imageRes;
            var textRes = gainNode._textRes;
            var itemParams = TypeConvertHelper.convert(award.type, award.value);
            UIHelper.loadTexture(imageRes, itemParams.icon);
            var name = TextHelper.expandTextByLen(itemParams.name, 3);
            textRes.string = (name);
            textRes.node.color = (itemParams.icon_color);
            UIHelper.enableOutline(textRes, itemParams.icon_color_outline, 2)
            textValue.string = ('+' + award.size);
            return gainNode.node;
        }
        function effectFunction(effect) {
            if (effect == 'exp') {
                if (awards[0]) {
                    return createResNode(awards[0]);
                }
            }
            return new cc.Node;
        }
        cc.resources.load('prefab/common/CommonAwardTip', () => {
            G_EffectGfxMgr.createPlayMovingGfx(rootNode, 'moving_dangao_txt', effectFunction.bind(this), null, true);
        });
    }

    getPromptip() {
        var node: cc.Node = new cc.Node();
        return node.addComponent(PrompTip);
    }
}