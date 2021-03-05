import SummaryBase from "./SummaryBase";
import { G_ResolutionManager, G_EffectGfxMgr } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentBattleDesc from "./ComponentBattleDesc";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SummaryFriendWin extends SummaryBase {

    public init(battleData, callback) {
        var list = [];
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = SummaryBase.NORMAL_FIX_X;
        var componentBattleDesc = new cc.Node("componentBattleDesc").addComponent(ComponentBattleDesc);
        componentBattleDesc.init(battleData, cc.v2(midXPos, 308 - height * 0.5));
        list.push(componentBattleDesc);
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
        G_EffectGfxMgr.createPlayMovingGfx(this.node, "moving_jwin_2", handler(this, this.playWinText),
            handler(this, this.checkStart), false);
    }
}