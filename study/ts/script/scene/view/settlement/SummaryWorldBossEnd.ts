import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentDamage from "./ComponentDamage";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryWorldBossEnd extends SummaryBase {

    private _battleData;
    public init(battleData, callback, attackHurt?) {
        this._battleData = battleData;
        var list = [];
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = 0;
        var hurt = battleData.hurt;
        var componentDamage = new cc.Node("componentDamage").addComponent(ComponentDamage);
        componentDamage.init(hurt, cc.v2(midXPos, 265 - height * 0.5));
        list.push(componentDamage);
        var richText = Lang.get('worldboss_fight_finish_point', { num: battleData.point });
        var componentLine = new cc.Node("componentDamage").addComponent(ComponentDamage);
        componentLine.init('', cc.v2(midXPos, 265 - height * 0.5 - 45), richText);
        list.push(componentLine);

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