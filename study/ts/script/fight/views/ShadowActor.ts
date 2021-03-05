import { G_EffectGfxMgr } from "../../init";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShadowActor extends cc.Component {

    private _shadow: cc.Node;
    public init(needAnim?: boolean) {
        this._shadow = UIHelper.newSprite(Path.getUICommon("img_heroshadow")).node;
        this._shadow.name = "_shadow";
        this._shadow.setScale(2);
        this.node.addChild(this._shadow);
        if (needAnim) {
            G_EffectGfxMgr.createPlayMovingGfx(this.node, "moving_bianshenka");
        }
    }

    public updatePos(position) {
        this.node.setPosition(position.x, position.y);
    }

    public setHeight(h: number) {
        this.node.y += h;
    }

    public setRotation(r: number) {
        this.node.angle = -r;
    }

    public setScale(x, y) {
        this.node.setScale(x, y);
    }

    public setPosition(x, y) {
        this.node.setPosition(x, y);
    }

    public death() {
        let action1 = cc.fadeOut(0.2)
        let action2 = cc.destroySelf()
        let action = cc.sequence(action1, action2)
        this.node.runAction(action)
    }
}