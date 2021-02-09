import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager, G_SignalManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentLine from "./ComponentLine";
import ComponentBattleDesc from "./ComponentBattleDesc";
import ComponentSmallRank from "./ComponentSmallRank";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryMineWin extends SummaryBase {

    public init(battleData, callback) {
        var list = [];
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = SummaryBase.NORMAL_FIX_X;
        var componentBattleDesc = new cc.Node("componentBattleDesc").addComponent(ComponentBattleDesc);
        componentBattleDesc.init(battleData, cc.v2(midXPos, 250 - height * 0.5));
        list.push(componentBattleDesc);
        var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
        componentLine.init('fight_mine_end', cc.v2(midXPos, 215 - height * 0.5));
        list.push(componentLine);
        var changeData = battleData.selfData;
        var beforeArmy = changeData.myBeginArmy;
        var nowArmy = changeData.myEndArmy;
        var beforeInfame = changeData.myBeginInfame;
        var nowInfame = changeData.myEndInfame;
        if (nowArmy < 0) {
            nowArmy = 0;
        }
        var panelArmy = new cc.Node("panelArmy").addComponent(ComponentSmallRank);
        panelArmy.init(cc.v2(midXPos, 160 - height * 0.5), Lang.get('fight_end_my_army'), beforeArmy, nowArmy);
        list.push(panelArmy);
        var beforeTarArmy = changeData.tarBeginArmy;
        var nowTarArmy = changeData.tarEndArmy;
        if (nowTarArmy < 0) {
            nowTarArmy = 0;
        }
        var panelTired = new cc.Node("panelTired").addComponent(ComponentSmallRank)
        panelTired.init(cc.v2(midXPos, 125 - height * 0.5), Lang.get('fight_end_army'), beforeTarArmy, nowTarArmy);
        list.push(panelTired);
        if (Math.abs(nowInfame - beforeInfame) != 0) {
            var panelTired =  new cc.Node("panelTired").addComponent(ComponentSmallRank);
            panelTired.init(cc.v2(midXPos, 90 - height * 0.5), Lang.get('fight_end_my_infame'), beforeInfame, nowInfame, null, '0');
            list.push(panelTired);
        }
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