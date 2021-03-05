import { G_EffectGfxMgr } from "../../../init";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ComponentBase from "./ComponentBase";
import PanelBattleDesc from "./PanelBattleDesc";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentBattleDesc extends ComponentBase {
    public static TYPE_NORMAL = 1 //普通战斗
    public static TYPE_REPORT = 2 //巅峰录像

    private _type;
    private _battleData;

    public init(battleData, position, type?) {
        this._type = type || ComponentBattleDesc.TYPE_NORMAL;
        this._battleData = battleData;
        this.node.setPosition(position);
        super.init();
    }

    public setStart() {
        super.setStart();
        this._createAnim();
    }
    _createCsbNode() {
        let panel: cc.Node = new cc.Node();
        cc.resources.load(Path.getPrefab('PanelBattleDesc', 'settlement'), cc.Prefab, function (err, res: any) {
            if (err != null || res == null || !panel.isValid) {
                return;
            }
            let panelBattleDesc: PanelBattleDesc = cc.instantiate(res).getComponent(PanelBattleDesc);
            panel.addChild(panelBattleDesc.node);
            panelBattleDesc.updateUI(this._type == ComponentBattleDesc.TYPE_NORMAL, this._battleData);
        }.bind(this));
        return panel;
    }
    _createAnim() {
        function effectFunction(effect) {
            if (effect == 'pingjia') {
                var node = this._createCsbNode();
                return node;
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_win_pingjia', effectFunction.bind(this), handler(this, this.checkEnd), false);
    }
}