import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager, G_SignalManager, Colors } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentLine from "./ComponentLine";
import { Lang } from "../../../lang/Lang";
import ComponentDamage from "./ComponentDamage";
import { EnemyHelper } from "../friend/EnemyHelper";
const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryRevengeWin extends SummaryBase {

    public init(battleData, callback) {
        var list = [];

        var size = G_ResolutionManager.getDesignCCSize();
        var width = size.width;
        var height = size.height;
        var midXPos = SummaryBase.NORMAL_FIX_X;

        var componentLine = new cc.Node("componentLine").addComponent(ComponentLine);
        componentLine.init('txt_sys_reward02', cc.v2(midXPos, 253 - height * 0.5));
        list.push(componentLine);

        var award = battleData.awards[0];
        var content = '';
        if (award && award.size) {
            if (award.size >= EnemyHelper.getFightSuccessEnergy()) {
                content = Lang.get('lang_friend_enemy_revenge_win2', {
                    num1: EnemyHelper.getFightWinVaule(),
                    num2: award.size
                });
            } else {
                content = Lang.get('lang_friend_enemy_revenge_win1', {
                    num1: EnemyHelper.getFightWinVaule(),
                    num2: award.size
                });
            }
        } else {
            content = Lang.get('lang_friend_enemy_revenge_win0', { num1: EnemyHelper.getFightWinVaule() });
        }
        var componentDamage = new cc.Node("componentDamage").addComponent(ComponentDamage);
        componentDamage.init(null, cc.v2(midXPos - 50, 170 - height * 0.5 - 50), content, {
            defaultColor: Colors.DARK_BG_ONE,
            fontSize: 22,
            YGap: 15,
            alignment: 2
        });
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