import ResourceLoader from "../utils/resource/ResourceLoader";
import EffectGfxBase from "./EffectGfxBase";

/**
 * 第节点设计目的在于使用自定义的配置文件（通常位于res/moving/目录下）播放自定义动画
 * 
 */
export default class EffectGfxSingle extends EffectGfxBase {

    private static defaultDouble: number = 1;
    private static effectDesignInterval: number = 1 / 30 // 动画设计时的FPS速度

    private _eventHandler: Function;
    private _ignoreAttr: any;
    private _double: number;
    private _frameIndex: number;
    private _lastFrameStart: number;
    private _startX: number;
    private _startY: number;
    private _startScaleX: number;
    private _startScaleY: number;
    private _startRotation: number;
    private _startOpacity: number;
    private _totalDt: number;
    private _startFrame: number;

    private _targetNode: cc.Node;

    protected onInit() {
        this.effectPath = 'moving/' + this.effectName;

        this._double = EffectGfxSingle.defaultDouble;
        this._frameIndex = 1;
        this._lastFrameStart = 0;

        this._totalDt = 0;

    }

    public setEffectSingle(targetNode: cc.Node, eventHandler?, ignoreAttr?, startFrame?) {
        this._targetNode = targetNode;
        if (this._targetNode != null) {
            //处理节点销毁的情况
            if(this._targetNode._children != null){
                this._targetNode.addChild(this.node);
            }else {
                this.isReleased = true;
            }
        }

        this._eventHandler = eventHandler;
        this._ignoreAttr = ignoreAttr || {};
        this._startX = this._targetNode.position.x;
        this._startY = this._targetNode.position.y;
        this._startScaleX = this._targetNode.scaleX;
        this._startScaleY = this._targetNode.scaleY;
        this._startRotation = this._targetNode.angle;
        this._startOpacity = this._targetNode.opacity;

        this._startFrame = startFrame;
    }

    protected onLoadEffect() {
        ResourceLoader.loadRes(this.effectPath, cc.JsonAsset, null, this._onLoadComplete.bind(this), this.sceneName);
    }

    private _onLoadComplete(err, res) {
        this.setJson(res.json);
        this.loadComplete();
    }

    protected onPlay() {
        if (this._startFrame != null) {
            for (let i = 1; i <= this._startFrame - 1; i++) {
                this._step();
            }
        }
    }

    protected onStop() {
        this.node && this.node.removeFromParent();
    }

    protected onPause() {
    }

    protected onResume() {
    }

    protected onUpdate(dt: number) {
        this._totalDt = this._totalDt + dt;
        var extraInterval = EffectGfxSingle.effectDesignInterval / this._double;
        var frames = Math.floor(this._totalDt / extraInterval);
        if (frames > this._double) {
            frames = Math.floor(this._double);
        }

        for (let i = 0; i < frames; i++) {
            this._totalDt = this._totalDt - extraInterval;
            if (!this._step()) {
                break;
            }

        }
    }

    private _step() {
        var fx = 'f' + this._frameIndex;
        var effectJson = this.effectJson;
        this._nodeStep();
        if (this._eventHandler && effectJson.events[fx] != null) {
            this._eventHandler(effectJson.events[fx], this._frameIndex, this);
        }
        this._frameIndex = this._frameIndex + 1;
        if (effectJson.events[fx] == 'forever') {
            this._frameIndex = 1;
        } else if (effectJson.events[fx] == 'finish') {
            this.stop();
            return false;
        }
        return true;
    }

    public _nodeStep() {
        var effectNode: cc.Node = this._targetNode;
        var targetKey = 'target';
        var effectLayer = this.effectJson[targetKey];
        var frameIndex = this._frameIndex;
        var fx = 'f' + frameIndex;
        if (effectLayer[fx]) {
            this._lastFrameStart = frameIndex;
        }
        var lastFrameStart = this._lastFrameStart;
        if (lastFrameStart == frameIndex) {
            var start = effectLayer[fx].start;
            if (!this._ignoreAttr['position']) {
                effectNode.setPosition(start.dx + this._startX, start.dy + this._startY);
            }
            if (!this._ignoreAttr['rotation']) {
                effectNode.angle = -start.rotation;
            }
            if (!this._ignoreAttr['scale']) {
                effectNode.setScale(start.scaleX * this._startScaleX, start.scaleY * this._startScaleY);
            }
            if (!this._ignoreAttr['opacity']) {
                effectNode.opacity = start.opacity;
            }
        } else {
            var lastFx = 'f' + lastFrameStart;
            var start = effectLayer[lastFx].start;
            var nextFrame = effectLayer[lastFx].nextFrame;
            var frames = effectLayer[lastFx].frames;
            if (nextFrame) {
                var percent = (frameIndex - lastFrameStart) / frames;
                var nextStart = effectLayer[nextFrame].start;
                if (!this._ignoreAttr['position']) {
                    var startX = start.dx + this._startX;
                    var startY = start.dy + this._startY;
                    var nextX = nextStart.dx + this._startX;
                    var nextY = nextStart.dy + this._startY;
                    var targetX = startX + (nextX - startX) * percent;
                    var targetY = startY + (nextY - startY) * percent;
                    effectNode.setPosition(targetX, targetY);
                }
                if (!this._ignoreAttr['rotation']) {
                    effectNode.angle = -(start.rotation + (nextStart.rotation - start.rotation) * percent);
                }
                if (!this._ignoreAttr['scale']) {
                    effectNode.setScale((start.scaleX + (nextStart.scaleX - start.scaleX) * percent) * this._startScaleX,
                        (start.scaleY + (nextStart.scaleY - start.scaleY) * percent) * this._startScaleY);
                }
                if (!this._ignoreAttr['opacity']) {
                    effectNode.opacity = start.opacity + (nextStart.opacity - start.opacity) * percent;
                }
            }
        }
    }

    protected onReset() {
        if (this._targetNode != null) {
            if (!this._ignoreAttr['position']) {
                this._targetNode.setPosition(this._startX, this._startY);
            }
            if (!this._ignoreAttr['rotation']) {
                this._targetNode.angle = -this._startRotation;
            }
            if (!this._ignoreAttr['scale']) {
                this._targetNode.setScale(this._startScaleX, this._startScaleY);
            }
            if (!this._ignoreAttr['opacity']) {
                this._targetNode.opacity = this._startOpacity;
            }
        }
    }
}