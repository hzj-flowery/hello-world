import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentBase from "./ComponentBase";
import ComponentBattleDesc from "./ComponentBattleDesc";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryGuildReportEnd extends SummaryBase {

    private _battleData;
    public init(battleData, callback) {
        this._battleData = battleData;
        var list: ComponentBase[] = [];

        var height = G_ResolutionManager.getDesignHeight();

        let midXPos = 0;
        var componentBattleDesc = new cc.Node("componentBattleDesc").addComponent(ComponentBattleDesc);
        componentBattleDesc.init(battleData, cc.v2(midXPos, 270 - height * 0.5), ComponentBattleDesc.TYPE_REPORT)
        list.push(componentBattleDesc);

        super.init(this._battleData, callback, list);
    }
    public onEnter() {
        super.onEnter();
        this._createAnimation();
    }
    public onExit() {
        super.onExit();
    }
    private _createAnimation() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_battleend', null, handler(this, this.checkStart), false);
    }
}