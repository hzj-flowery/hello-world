import { G_EffectGfxMgr, G_ResolutionManager } from "../../init";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";

export default class Background extends cc.Component {

    private static ZORDER_BACK = 1;
    private static ZORDER_EFFECT = 2;
    private static ZORDER_COMBINE_BACK = 3;

    private _image: cc.Sprite;
    private _effectNode: cc.Node;
    private _imageCombine: cc.Sprite;
    private _layerWhite: cc.Node;
    private _layerYellow: cc.Node;

    public init() {
        this._image = null;
        this._effectNode = new cc.Node("_effectNode");
        this._imageCombine = null;
        this.node.addChild(this._effectNode, Background.ZORDER_EFFECT);
        this._layerWhite = null;
        this._layerYellow = null;
    }

    public setBG(name: string) {
        if (this._image) {
            this._image.node.destroy();
            this._image = null;
        }
        this._image = new cc.Node().addComponent(cc.Sprite);
        name = name.split(".")[0];
        UIHelper.loadTexture(this._image, name);
        this._image.node.setAnchorPoint(0.5, 0);
        var height = G_ResolutionManager.getDesignCCSize().height;
        this._image.node.setPosition(0, -height / 2);
        this.node.addChild(this._image.node, Background.ZORDER_BACK);
    }

    public createCombineBG() {
        this._imageCombine = new cc.Node("_imageCombine").addComponent(cc.Sprite);
        this._imageCombine.node.setScale(20, 4.2);
        UIHelper.loadTexture(this._imageCombine, 'fight/scene/img_skill3bg');
        this.node.addChild(this._imageCombine.node, Background.ZORDER_COMBINE_BACK);
    }

    public createEffect(effectName) {
        // console.log("createEffect:", effectName);
        this._effectNode.removeAllChildren();
        if (effectName != null && effectName != '') {
            G_EffectGfxMgr.createPlayMovingGfx(this._effectNode, Path.getFightSceneEffect(effectName), null, null, false);
        }
    }

    public fadeInCombineBG() {
        if (!this._imageCombine) {
            this.createCombineBG();
        }
        this._imageCombine.node.active = true;
    }

    public fadeOutCombineBG() {
        if (this._imageCombine) {
            this._imageCombine.node.active = false;
        }
    }
}