import { G_EffectGfxMgr } from "../../init";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";

export default class FarGround extends cc.Component {
    private static ZORDER_BACK = 1;
    private static ZORDER_EFFECT = 2;

    private _image: cc.Sprite;
    private _effectNode: cc.Node;

    public init() {
        this._image = null;
        this._effectNode = new cc.Node();
        this.node.addChild(this._effectNode, FarGround.ZORDER_EFFECT);
    }

    public setBG(name) {
        if (this._image) {
            this._image.node.destroy();
            this._image = null;
        }
        if (name == '') {
            return;
        }
        this._image = new cc.Node().addComponent(cc.Sprite);
        name = name.split(".")[0];
        UIHelper.loadTexture(this._image, name);
        this._image.node.setAnchorPoint(0.5, 1);
        this._image.node.y = 320;
        this.node.addChild(this._image.node, FarGround.ZORDER_BACK);
    }

    public createEffect(effectName) {
        this._effectNode.removeAllChildren();
        if (effectName != null && effectName != '') {
            G_EffectGfxMgr.createPlayMovingGfx(this._effectNode, Path.getFightSceneEffect(effectName), null, null, false);
        }
    }
}