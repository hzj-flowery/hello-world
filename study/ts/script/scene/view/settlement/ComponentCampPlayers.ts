import { G_EffectGfxMgr } from "../../../init";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ComponentBase from "./ComponentBase";
import PanelCampPlayers from "./PanelCampPlayers";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentCampPlayers extends ComponentBase {

    private _battleData;
    public init(battleData, position) {
        this._battleData = battleData;
        this.node.setPosition(position);
        super.init();
    }
    public setStart() {
        super.setStart();
        this._createAnim();
    }

    private _createCsbNode():cc.Node {
        let node = new cc.Node();
        cc.resources.load(Path.getPrefab('PanelCampPlayers', 'settlement'), cc.Prefab, (err, res:cc.Prefab)=> {
            if (err != null || res == null || !node.isValid) {
                return;
            }
            let panel = cc.instantiate(res).getComponent(PanelCampPlayers);
            node.addChild(panel.node);
            panel.updateUI(this._battleData);
        });

       return node;
    }

    private _createAnim() {
        function effectFunction(effect) {
            if (effect == 'pingjia') {
                var node = this._createCsbNode();
                return node;
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_win_pingjia', effectFunction.bind(this), handler(this, this.checkEnd), false);
    }
}