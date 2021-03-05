import { G_EffectGfxMgr } from "../../../init";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ComponentBase from "./ComponentBase";
import PanelDamage from "./PanelDamage";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentDamage extends ComponentBase {

    private _damage;
    private _richText;
    private _richTextParams;
    public init(damage, position, richText?, richTextParams?) {
        this._damage = damage;
        this._richText = richText;
        this._richTextParams = richTextParams;
        this.node.setPosition(position);
        super.init();
    }

    public setStart() {
        this._createExpAnim();
        super.setStart();
    }

    _createCsbNode() {
        let panel: cc.Node = new cc.Node();
        cc.resources.load(Path.getPrefab('PanelDamage', 'settlement'), cc.Prefab, (err, res: any) => {
            if (err != null || res == null || !panel.isValid) {
                return;
            }
            let panelDamage: PanelDamage = cc.instantiate(res).getComponent(PanelDamage);
            panel.addChild(panelDamage.node);
            panelDamage.updateUI(this._damage, this._richText, this._richTextParams);
        });
        return panel;
    }
    
    _createExpAnim() {
        function effectFunction(effect) {
            if (effect == 'pingjia') {
                var node = this._createCsbNode();
                return node;
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_win_pingjia', effectFunction.bind(this), handler(this, this.checkEnd), false);
    }
}