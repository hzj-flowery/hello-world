import { G_TopLevelNode } from "../init";
import { handler } from "../utils/handler";

const { ccclass, property } = cc._decorator

@ccclass
export class TouchEffect extends cc.Component {

    @property({
        type: cc.ParticleSystem,
        visible: true
    })
    private _emitter: cc.ParticleSystem = null;

    public onLoad() {
        this.node.zIndex = 4000;
        this.node.setContentSize(G_TopLevelNode.getRootContentSize());
    }

    public clear() {
        if (!this.node.active) {
            return;
        }
        this.node.active = false;
        this._emitter.stopSystem();
        this.node.off(cc.Node.EventType.TOUCH_START, handler(this, this._onTouchBegan));
        this.node.off(cc.Node.EventType.TOUCH_MOVE, handler(this, this._onTouchMoved));
        this.node.off(cc.Node.EventType.TOUCH_END, handler(this, this._onTouchEnded));
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, handler(this, this._onTouchCancelled));
    }

    public setStart() {
        if (this.node.active) {
            return;
        }
        this.node.active = true;
        this._emitter.stopSystem();
        this.node.on(cc.Node.EventType.TOUCH_START, handler(this, this._onTouchBegan));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, handler(this, this._onTouchMoved));
        this.node.on(cc.Node.EventType.TOUCH_END, handler(this, this._onTouchEnded));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, handler(this, this._onTouchCancelled));
        if ((this.node as any)._touchListener != null) {
            (this.node as any)._touchListener.setSwallowTouches(false);
        }
    }

    private _onTouchBegan(touch: cc.Touch, event) {
        if (this._emitter) {
            var locationInNode = this.node.convertToNodeSpaceAR(touch.getLocation());
            this._emitter.resetSystem();
            this._emitter.node.setPosition(locationInNode);
            return true;
        }
        return false;
    }

    private _onTouchMoved(touch, event) {
        if (this._emitter) {
            var locationInNode = this.node.convertToNodeSpaceAR(touch.getLocation());
            this._emitter.node.setPosition(locationInNode);
        }
    }

    private _onTouchEnded(touch, event) {
        if (this._emitter) {
            this._emitter.stopSystem();
        }
    }

    private _onTouchCancelled(touch, event) {
        if (this._emitter) {
            this._emitter.stopSystem();
        }
    }
}