import SummaryBase from "./SummaryBase";
import { G_EffectGfxMgr, G_ResolutionManager, G_UserData, G_SceneManager } from "../../../init";
import { handler } from "../../../utils/handler";
import ComponentBase from "./ComponentBase";
import ComponentSeasonPlayers from "./ComponentSeasonPlayers";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummarySeasonEnd extends SummaryBase {

    private _battleData;
    public init(battleData, callback, attackHurt?) {
        this._battleData = battleData;
        var list: ComponentBase[] = [];

        var height = G_ResolutionManager.getDesignHeight();

        let midXPos = 0;
        var componentSeasonPlayers = new cc.Node("componentSeasonPlayers").addComponent(ComponentSeasonPlayers);
        componentSeasonPlayers.init(battleData, cc.v2(midXPos, 265 - height * 0.5))
        list.push(componentSeasonPlayers);

        super.init(this._battleData, callback, list);
    }
    public onEnter() {
        super.onEnter();
        this._createAnimation();
    }
    public onExit() {
        if (G_UserData.getSeasonSport().isSquadReconnect() && G_UserData.getSeasonSport().isPlayReport() == false) {
            G_SceneManager.showScene("seasonSport")
        }

        G_UserData.getSeasonSport().setPlayReport(false)
        super.onExit();
    }
    private _createAnimation() {
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_battleend', null, handler(this, this.checkStart), false);
    }
}