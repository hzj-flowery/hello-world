import SummaryBase from "./SummaryBase";
import { G_ResolutionManager, G_EffectGfxMgr } from "../../../init";
import ComponentLine from "./ComponentLine";
import { handler } from "../../../utils/handler";
import ComponentBase from "./ComponentBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SummaryCountryBossInterceptWin extends SummaryBase {

    private _battleData;

    public init(battleData, callback) {
        this._battleData = battleData;
        var list: ComponentBase[] = [];

        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = SummaryBase.NORMAL_FIX_X;
        
        var componentLine = new cc.Node("ComponentLine").addComponent(ComponentLine)
        componentLine.init("country_boss_intercept_success", cc.v2(midXPos, 253 - height*0.5 - 60));
        list.push(componentLine);

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