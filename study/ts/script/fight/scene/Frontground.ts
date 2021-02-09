import { G_EffectGfxMgr } from "../../init";
import { Path } from "../../utils/Path";

export default class Frontground extends cc.Component {

    private _effectName;

    public init() {
        this._effectName = null;
    }

    public createEffect(effectName) {
        this.node.removeAllChildren();
        if (effectName != null && effectName != '') {
            G_EffectGfxMgr.createPlayMovingGfx(this.node, Path.getFightSceneEffect(effectName), null, null, false);
            this._effectName = effectName;
        }
    }

    public removeEffect() {
        this.node.removeAllChildren();
    }

    public reCreateEffect() {
        if (this._effectName) {
            this.createEffect(this._effectName);
        }
    }
}