import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentBase from "./ComponentBase";
import ComponentSingleRacePlayers from "./ComponentSingleRacePlayers";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummarySingleRaceEnd extends SummaryBase {

    private _battleData;
    public init(battleData, callback, attackHurt?) {
        this._battleData = battleData;
        var list: ComponentBase[] = [];

        var height = G_ResolutionManager.getDesignHeight();

        let midXPos = 0;
        var componentSingleRacePlayers = new cc.Node("componentSingleRacePlayers").addComponent(ComponentSingleRacePlayers);
        componentSingleRacePlayers.init(battleData, cc.v2(midXPos, 265 - height*0.5))
        list.push(componentSingleRacePlayers);

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