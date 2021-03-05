import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentBase from "./ComponentBase";
import ComponentDamage from "./ComponentDamage";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryCountryBossEnd extends SummaryBase {

    private _battleData;
    public init(battleData, callback) {
        this._battleData = battleData;
        var list: ComponentBase[] = [];

        var height = G_ResolutionManager.getDesignHeight();

        let midXPos = 0;
        let hurt = battleData.hurt;
        var componentDamage = new cc.Node("componentDamage").addComponent(ComponentDamage);
        componentDamage.init(hurt, cc.v2(midXPos, 265 - height * 0.5 - 20));
        list.push(componentDamage);

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