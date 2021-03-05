import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager, G_SignalManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentLine from "./ComponentLine";
import { Lang } from "../../../lang/Lang";
import ComponentDamage from "./ComponentDamage";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryWorldBossWin extends SummaryBase {

    public init(battleData, callback) {
        var list = [];
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = SummaryBase.NORMAL_FIX_X;
        var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
        componentLine.init('txt_sys_reward02', cc.v2(midXPos, 253 - height * 0.5));
        list.push(componentLine);
        var richText = Lang.get('worldboss_fight_grob_point', { num: battleData.point });
        var componentDamage = new cc.Node("componentDamage").addComponent(ComponentDamage);
        componentDamage.init(null, cc.v2(midXPos, 183 - height * 0.5), richText);
        list.push(componentDamage);
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