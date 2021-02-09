import SummaryBase from "./SummaryBase";
import { G_ResolutionManager, G_EffectGfxMgr } from "../../../init";
import ComponentLine from "./ComponentLine";
import ComponentDrop from "./ComponentDrop";
import { handler } from "../../../utils/handler";
import ComponentBase from "./ComponentBase";
import ComponentBattleDesc from "./ComponentBattleDesc";
import ComponentSmallRank from "./ComponentSmallRank";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SummaryGuildWarWin extends SummaryBase {

    private _battleData;

    public init(battleData, callback) {
        this._battleData = battleData;
        var list: ComponentBase[] = [];

        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = SummaryBase.NORMAL_FIX_X;

        var componentBattleDesc = new cc.Node("ComponentBattleDesc").addComponent(ComponentBattleDesc)
        componentBattleDesc.init(battleData, cc.v2(midXPos, 250 - height*0.5));
        list.push(componentBattleDesc);

        var componentLine = new cc.Node("ComponentLine").addComponent(ComponentLine)
        componentLine.init("fight_mine_end", cc.v2(midXPos, 215 - height*0.5));
        list.push(componentLine);

        var changeData = battleData.selfData;
        var beforeVit = changeData.myBeginVit;
        var nowVit = changeData.myEndVit;
        if (nowVit < 0) {
            nowVit = 0;
        }
        var panelVit = new cc.Node("panelVit").addComponent(ComponentSmallRank);
        panelVit.init(cc.v2(midXPos, 160 - height*0.5), Lang.get("fight_end_my_vit"), beforeVit, nowVit);
        list.push(panelVit);

        var beforeTarVit = changeData.tarBeginVit;
        var nowTarVit = changeData.tarEndVit;
        if (nowTarVit < 0) {
            nowTarVit = 0;
        }
        var panelTired = new cc.Node("panelTired").addComponent(ComponentSmallRank)
        panelTired.init(cc.v2(midXPos, 125 - height*0.5), Lang.get("fight_end_vit"), beforeTarVit, nowTarVit);
        list.push(panelTired);

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