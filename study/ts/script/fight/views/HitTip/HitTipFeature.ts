import HitTipParticle from "./HitTipParticle";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { G_EffectGfxMgr } from "../../../init";

export default class HitTipFeature extends HitTipParticle {

    private _picPath: string;
    private _callBack: Function;

    public init(skillPath, callBack) {
        this.initHitTip("feature");
        this.node.name = "HitTipFeature";
        this._picPath = Path.getTalent(skillPath);
        this._callBack = callBack;
    }
    
    public popup() {
        function effectFunc(effect) {
            if (effect == 'tianfu_id_r' || effect == 'tianfu_id_l') {
                return UIHelper.newSprite(this._picPath).node;
            }
        }
        function eventFunc(event) {
            if (event == 'boom') {
                if (this._callBack) {
                    this._callBack();
                }
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._node, 'moving_tianfu_id', effectFunc.bind(this), eventFunc.bind(this), true);
    }
}