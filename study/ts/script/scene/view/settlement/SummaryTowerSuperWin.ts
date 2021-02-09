import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager, G_SignalManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentLine from "./ComponentLine";
import ComponentDrop from "./ComponentDrop";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryTowerSuperWin extends SummaryBase {

    public init(battleData, callback) {
        var list = [];
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;

        var midXPos = SummaryBase.NORMAL_FIX_X;

        var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
        componentLine.init("txt_sys_reward02", cc.v2(midXPos, 253 - height * 0.5));
        list.push(componentLine);

        var componentDrop = new cc.Node("componentDrop").addComponent(ComponentDrop);
        componentDrop.init(battleData.awards, cc.v2(midXPos, 183 - height*0.5));
        list.push(componentDrop);

        super.init(battleData, callback, list, midXPos, true);
    }
    public onEnter() {
        super.onEnter();
        this._createAnimation();
    }
    public onExit() {
        super.onExit();
    }
    private _createAnimation() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_allwin_win', handler(this, this.playWinText), handler(this, this.checkStart), false);
    }
}