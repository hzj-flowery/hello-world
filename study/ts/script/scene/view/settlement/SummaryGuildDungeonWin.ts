import SummaryBase from "./SummaryBase";
import { G_ResolutionManager, G_EffectGfxMgr } from "../../../init";
import ComponentLine from "./ComponentLine";
import ComponentDrop from "./ComponentDrop";
import { handler } from "../../../utils/handler";
import ComponentBase from "./ComponentBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SummaryGuildDungeonWin extends SummaryBase {

    private _battleData;

    public init(battleData, callback) {
        this._battleData = battleData;
        var list: ComponentBase[] = [];

        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = SummaryBase.NORMAL_FIX_X;

        var componentLine = new cc.Node("ComponentLine").addComponent(ComponentLine)
        componentLine.init("txt_sys_reward02", cc.v2(midXPos, 253 - height * 0.5));
        list.push(componentLine);

        var componentDrop = new cc.Node("ComponentDrop").addComponent(ComponentDrop)
        componentDrop.init(this._battleData.awards, cc.v2(midXPos, 183 - height * 0.5));
        list.push(componentDrop);

        super.init(battleData, callback, list, midXPos, true);
    }

    onEnter() {
        super.onEnter();
        this._createAnimation();
    }

    onExit() {
        super.onExit();
    }
    _createAnimation() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, "moving_allwin_win", handler(this, this.playWinText),
            handler(this, this.checkStart), false);
    }
}