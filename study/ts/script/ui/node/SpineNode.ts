const {ccclass} = cc._decorator
import { G_SpineManager } from "../../init";
import { SpineManager } from "../../manager/SpineManager";
import { PrioritySignal } from "../../utils/event/PrioritySignal";

@ccclass
export class SpineNode extends cc.Component {

    private _timeScale: number;
    protected _spine: sp.Skeleton;
    private _spineNode: cc.Node;
    private _animationName: string;
    private _animationLoop;
    private _scale: number;
    private _size: cc.Size;
    private _isregisterSpineEventHandler: boolean;
    public signalLoad: PrioritySignal;
    public signalStart: PrioritySignal;
    public signalEnd: PrioritySignal;
    public signalComplet: PrioritySignal;
    public signalEvent: PrioritySignal;

    static create(scale?:number, size?: cc.Size): SpineNode {
        let node = new cc.Node
        let spineNode = node.addComponent(this)
        spineNode._spineNode = new cc.Node;
        node.addChild(spineNode._spineNode);
        let spine = spineNode._spineNode.addComponent(sp.Skeleton)

        spineNode._spine = spine;
        spineNode._spine.premultipliedAlpha = false;

        scale && spineNode.setScale(scale)
        size && spineNode.setSize(size)

        spineNode._animationName = null;
        spineNode._animationLoop = null;
        // this._scale = 1;
        spineNode._isregisterSpineEventHandler = false;
        spineNode.signalLoad = new PrioritySignal('string');
        spineNode.signalStart = new PrioritySignal('string');
        spineNode.signalEnd = new PrioritySignal('string');
        spineNode.signalComplet = new PrioritySignal('string');
        spineNode.signalEvent = new PrioritySignal('string');

        return spineNode
    }

    onLoad() {
        cc.director.on(SpineManager.KEY_TIME_SCALE, this.setTimeScale, this)
    }

    public setSize(size: cc.Size) {
        this._size = size;
        this._spineNode.setContentSize(size);
        this._spineNode.setAnchorPoint(0.5, 0);
    }

    public setScale(scale: number) {
        this._scale = scale;
        this._spineNode.setScale(scale)
    }

    public setAsset(path: string) {
        this._unregisterSpineEvent();
        // this.node.removeAllChildren(true);
        this._animationName = null;
        this._animationLoop = null;
        G_SpineManager.loadSpine(path, function (sk: sp.SkeletonData) {
            // var spineAni = G_SpineManager.createSkeleton(path);
            this.loadSpineComplete(sk);
        }.bind(this));
    }

    public setData(skeletonData: sp.SkeletonData) {
        if (skeletonData == null) {
            return;
        }
        this._unregisterSpineEvent();
        // this.node.removeAllChildren(true);
        this._animationName = null;
        this._animationLoop = null;
        this.loadSpineComplete(skeletonData);
    }

    protected loadSpineComplete(skeletonData: sp.SkeletonData) {
        if (skeletonData == null || this._spineNode == null || !this._spineNode.isValid) {
            return;
        }
        this._spine.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
        this._spine.skeletonData = skeletonData;
        this._spine.setToSetupPose();
        if (this._scale) {
            this._spineNode.setScale(this._scale);
        }
        if (this._size) {
            this.setSize(this._size);
        }
        this._registerSpineEvent();
        if (this._animationName != null) {
            this.setAnimation(this._animationName, this._animationLoop);
        }
        this.setTimeScale();
        this.signalLoad.dispatch('load');
    }

    private _registerSpineEvent() {
        if (this._spine) {
            if (!this._isregisterSpineEventHandler) {
                this._isregisterSpineEventHandler = true;
                this._spine.setStartListener(function (event) {
                    this.signalStart.dispatch(event.trackIndex);
                }.bind(this));
                this._spine.setEndListener(function (event) {
                    this.signalEnd.dispatch(event.trackIndex);
                }.bind(this));
                this._spine.setCompleteListener(function (event) {
                    this.signalComplet.dispatch(event.trackIndex, event.loopCount);
                }.bind(this));
                this._spine.setEventListener(function (event) {
                    this.signalEvent.dispatch(event.trackIndex, event.eventData.name, event.eventData.intValue, event.eventData.floatValue, event.eventData.stringValue);
                }.bind(this));
            }
        }
    }

    private _unregisterSpineEvent() {
        if (this._isregisterSpineEventHandler) {
            this._isregisterSpineEventHandler = false;
            if (this._spine) {
                this._spine.setStartListener(null);
                this._spine.setEndListener(null);
                this._spine.setCompleteListener(null);
                this._spine.setEventListener(null);
            }
        }
    }
    public onEnable() {
        this._registerSpineEvent();
    }
    public onDisable() {
        this._unregisterSpineEvent();
        // G_SpineManager.removeSpineLoadHandlerByTarget(this);
    }
    public onDestroy() {
        cc.director.off(SpineManager.KEY_TIME_SCALE, this.setTimeScale, this)
        // G_SpineManager.removeSpineLoadHandlerByTarget(this);
        this._spine = null;
    }
    public getSpine() {
        return this._spine;
    }
    public resetSkeletonPose() {
        if (this._spine != null) {
            this._spine.setToSetupPose();
            // this._spine.clearTracks();
        }
    }
    public removeSelf() {
        this.node.destroy();
        this._unregisterSpineEvent();
    }

    public setAnimation(name, loop?, reset?) {
        this._animationLoop = loop || false;
        if (this._spine) {
            if (reset != null && reset == true) {
                this.resetSkeletonPose();
            }

            this._spine.setAnimation(0, name, loop);
            // this._spine.update(1 / 30);
        }
        this._animationName = name;
    }

    public setTimeScale(time?) {
        this._timeScale = time || G_SpineManager.getTimeScale();
        if (this._spine) {
            this._spine.timeScale = this._timeScale;
        }
    }

    public isAnimationExist(name): boolean {
        if (this._spine) {
            return this._spine.findAnimation(name);
        }
        return false;
    }

    public getAnimationName() {
        return this._animationName;
    }
}