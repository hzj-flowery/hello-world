import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { G_ConfigLoader } from "../../../init";
import { Path } from "../../../utils/Path";
import HitTipParticle from "./HitTipParticle";

export default class HitTipBuff extends HitTipParticle {
    private _resId;
    public init(buffId) {
        this.initHitTip("buff");
        this.node.name = "HitTipBuff";
        this._tween = 0;
        var buffData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(buffId);
        this._resId = buffData.buff_tween_pic;
        if (this._resId != '') {
            let spriteBuff = new cc.Node(this._resId).addComponent(cc.Sprite);
            spriteBuff.spriteFrame = cc.resources.get(Path.getBuffText(this._resId), cc.SpriteFrame);
            this._node.addChild(spriteBuff.node);
            var size = spriteBuff.node.getContentSize();
            this._node.setContentSize(size);
            this._node.setAnchorPoint(0, 0.5);
            this._height = size.height;
            this._tween = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(buffId).buff_tween);
        }
    }
    public popup() {
        if (this._tween == 0) {
            this._runUpAction();
        } else if (this._tween == 1) {
            this._runMiddleAction();
        } else if (this._tween == 2) {
            this._runDownAction();
        }
    }
}