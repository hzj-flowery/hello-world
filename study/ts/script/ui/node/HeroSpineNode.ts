const {ccclass} = cc._decorator
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import { SpineNode } from "./SpineNode";

@ccclass
export class HeroSpineNode extends SpineNode {
    public static SCALE = 0.45;
    private loadingNode: cc.Node;
    private labelNode: cc.Node;

    public onLoad() {
        super.onLoad();
        this.setScale(HeroSpineNode.SCALE);
        this.setSize(cc.size(500, 500))
    }

    private addLoadingNode() {
        if (this._spine && this._spine.skeletonData) {
            return;
        }

        if (this.loadingNode) {
            return;
        }

        this.loadingNode = new cc.Node;
        this.loadingNode.y = 97;
        let node = new cc.Node;
        let sprite = node.addComponent(cc.Sprite);
        UIHelper.loadTexture(sprite, Path.getUICommon("hero_loading"))
        this.loadingNode.addChild(node);

        let labelNode = UIHelper.createLabel({
            text: '加载中',
            fontSize: 20
        });
        labelNode.setPosition(8, -8);
        this.loadingNode.addChild(labelNode);
        this.labelNode = labelNode;

        this.node.addChild(this.loadingNode);
    }

    private destroyLoadingNode() {
        this.loadingNode && this.loadingNode.destroy();
        this.loadingNode = null;
        this.labelNode = null;
    }

    public setAsset(path: string) {
        super.setAsset(path);
        this.addLoadingNode();
    }

    public setScaleX(scale) {
        this.node.scaleX = scale;
        if (this.labelNode && scale < 0) {
            this.labelNode.scaleX = -1;
        }
    }

    protected loadSpineComplete(skeletonData: sp.SkeletonData) {
        super.loadSpineComplete(skeletonData);
        this.destroyLoadingNode();
    }

    setVisible(visible) {
        this.node.active = visible;
    }
}