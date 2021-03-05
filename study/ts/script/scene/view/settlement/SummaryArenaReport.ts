import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentBattleDesc from "./ComponentBattleDesc";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryArenaReport extends SummaryBase {

    private _battleData;
    public init(battleData, callback, attackHurt?) {
        this._battleData = battleData;
        var list = [];
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        // var midXPos = 850 - width * 0.5;
        var midXPos = 290;
        var componentBattleDesc = new cc.Node("componentBattleDesc").addComponent(ComponentBattleDesc);
        componentBattleDesc.init(battleData, cc.v2(midXPos, 290 - height * 0.5), ComponentBattleDesc.TYPE_REPORT);
        list.push(componentBattleDesc)

        super.init(this._battleData, callback, list, midXPos, true);
    }
    public onEnter() {
        super.onEnter();
        this._createAnimation();
    }
    public onExit() {
        super.onExit();
    }
    private _createAnimation() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_jwin_2',
            handler(this, this.playWinText), handler(this, this.checkStart), false);
    }
}