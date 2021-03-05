import { G_ResolutionManager } from "../../../init";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

export default class TutorialTipLayer extends cc.Component {

    private _touchRect: cc.Rect;
    private _authTouchRect: cc.Rect[];
    private _touchRectLayer: cc.Node;
    public init() {
        this.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._touchRect = cc.rect(0, 0, 0, 0);
        this._authTouchRect = [];
        this.node.on(cc.Node.EventType.TOUCH_START, handler(this, this._onTouchEvent));
        UIHelper.setSwallowTouches(this.node, true);
    }

    public setDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, handler(this, this._onTouchEvent));
    }

    public showHighLightClick(targetPosition: cc.Vec2, info) {
        let createClipNode = () => {
            var stencil = new cc.Node("stencil").addComponent(cc.Mask);
            var clippingNode = new cc.Node("clippingNode");
            clippingNode.addChild(stencil.node);
            let contentSize = G_ResolutionManager.getDesignCCSize();
            clippingNode.color = cc.color(0, 0, 0);
            clippingNode.setContentSize(contentSize);
            clippingNode.opacity = 0.8 * 255;
            stencil.node.opacity = 127;
            stencil.inverted = true;

            if (info && info.light && info.light > 0) {
                var image = UIHelper.newSprite(Path.getGuide('mask'), contentSize);
                image.node.setAnchorPoint(cc.v2(0.5, 0.5));
                image.node.setPosition(-targetPosition.x, -targetPosition.y);
                stencil.node.addChild(image.node);
                var image2 = UIHelper.newSprite(Path.getGuide(info.light), cc.size(300, 300));
                image2.node.setPosition(targetPosition);
                image2.node.opacity = 200;
                this.node.addChild(image2.node);
            }
            stencil.node.setPosition(targetPosition);
            stencil.node.setContentSize(300, 300);
            this.node.addChild(clippingNode);
        }
        var clippingNode = this.node.getChildByName('clippingNode');
        if (clippingNode == null) {
            if (info.black == 1) {
                createClipNode();
            }
        } else {
            clippingNode.destroy();
            if (info.black == 1) {
                createClipNode();
            }
        }
    }

    private _onTouchEvent(touch: cc.Event.EventTouch, event) {
        var location = touch.getLocation();
        var x = location.x;
        var y = location.y;
        // var nodePos = this.node.convertToNodeSpaceAR(cc.v2(x, y));
        var rect = this._authTouchRect[this._authTouchRect.length - 1] || this._touchRect;
        // var retValue = !rect.contains(cc.v2(nodePos.x, nodePos.y));
        var retValue = rect.contains(cc.v2(x, y));
        // console.log("_onTouchEvent:", retValue)
        if (retValue == true) {
            UIHelper.setSwallowTouches(this.node, false);
        }
        else {
            UIHelper.setSwallowTouches(this.node, true);
        }
        // return retValue;
    }

    public setTouchRect(rect) {
        this._touchRect = rect;
        this._showTouchRect();
    }

    public pushAuthTouchRect(rect) {
        this._authTouchRect.push(rect);
        this._showTouchRect();
    }

    public popAuthTouchRect() {
        this._authTouchRect.pop();
        this._showTouchRect();
    }

    public clearTip() {
        this.node.removeAllChildren();
        this._touchRectLayer = null;
    }

    private _showTouchRect() {
        if (this._touchRectLayer) {
            this._touchRectLayer.destroy();
            this._touchRectLayer = null;
        }
        var rect = this._touchRect;
        if (this._authTouchRect != null) {
            var rect = this._authTouchRect[this._authTouchRect.length - 1]
        }
        if (rect) {
            if (rect.width != 0 && rect.height != 0) {
            }
        }
    }
}