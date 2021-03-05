import ComponentBase from "./ComponentBase";
import { Colors, G_EffectGfxMgr } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { handler } from "../../../utils/handler";

const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentRankChange extends ComponentBase {

    private _rank1;
    private _rank2;
    public init(rank1, rank2, position) {
        this._rank1 = rank1;
        this._rank2 = rank2;
        this.node.setPosition(position);
        super.init();
    }
    public setStart() {
        super.setStart();
        this._playAnim();
    }

    private _createLabel(rank, type): cc.Node {
        var [fontColor, fontOutline] = Colors.getSettlementRankColor(type);
        var label = UIHelper.createWithTTF(rank, Path.getCommonFont(), 30);
        label.node.color = (fontColor);
        UIHelper.enableOutline(label, fontOutline, 2)
        return label.node;
    }

    private _playAnim() {
        function effectFunction(effect) {
            if (effect == 'mingci_1') {
                return this._createLabel(this._rank1, 1);
            } else if (effect == 'mingci_2') {
                return this._createLabel(this._rank2, 2);
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_jwin_mingci', effectFunction.bind(this),
            handler(this, this.checkEnd), false);
    }
}