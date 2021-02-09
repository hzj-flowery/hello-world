import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager, G_SignalManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentLine from "./ComponentLine";
import { Lang } from "../../../lang/Lang";
import ComponentBattleDesc from "./ComponentBattleDesc";
import ComponentItemInfo from "./ComponentItemInfo";
import ComponentRankChange from "./ComponentRankChange";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryArenaWin extends SummaryBase {

    public init(battleData, callback) {
        var list = [];
        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = SummaryBase.NORMAL_FIX_X;
        if (battleData.oldRank != battleData.newRank) {
            var componentBattleDesc = new cc.Node("componentBattleDesc").addComponent(ComponentBattleDesc);
            componentBattleDesc.init(battleData, cc.v2(midXPos, 308 - height * 0.5));
            list.push(componentBattleDesc);
            var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
            componentLine.init('txt_sys_mingcitisheng01', cc.v2(midXPos, 260 - height * 0.5));
            list.push(componentLine);
            var oldRankDesc = battleData.oldRank;
            if (battleData.oldRank == 0) {
                oldRankDesc = Lang.get('arena_rank_zero');
            }
            var componentRankChange = new cc.Node("componentRankChange").addComponent(ComponentRankChange);
            componentRankChange.init(oldRankDesc, battleData.newRank, cc.v2(midXPos, 213 - height * 0.5));
            list.push(componentRankChange);
            var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
            componentLine.init('txt_sys_reward02', cc.v2(midXPos, 168 - height * 0.5));
            list.push(componentLine);
            for (let i = 0; i < 2; i++) {
                var componentItemInfo = new cc.Node("componentItemInfo").addComponent(ComponentItemInfo);
                componentItemInfo.init(battleData.awards[i], cc.v2(midXPos, 140 - height * 0.5 - 40 * (i + 1)));
                list.push(componentItemInfo);
                for (let _ in battleData.addAwards) {
                    var v = battleData.addAwards[_];
                    if (v.award.type == battleData.awards[i].type && v.award.value == battleData.awards[i].value) {
                        componentItemInfo.updateCrit(v.index, v.award.size);
                        break;
                    }
                }
            }
        } else {
            var componentBattleDesc = new cc.Node("componentBattleDesc").addComponent(ComponentBattleDesc);
            componentBattleDesc.init(battleData, cc.v2(midXPos, 290 - height * 0.5));
            list.push(componentBattleDesc);
            var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
            componentLine.init('txt_sys_reward02', cc.v2(midXPos, 229 - height * 0.5));
            list.push(componentLine);
            for (let i = 0; i < 2; i++) {
                var componentItemInfo = new cc.Node("componentItemInfo").addComponent(ComponentItemInfo);
                componentItemInfo.init(battleData.awards[i], cc.v2(midXPos, 201 - height * 0.5 - 40 * (i + 1)));
                list.push(componentItemInfo);
            }
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
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_jwin_2', handler(this, this.playWinText), handler(this, this.checkStart), false);
    }
}