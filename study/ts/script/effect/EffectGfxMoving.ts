import ResourceLoader from "../utils/resource/ResourceLoader";
import EffectController from "./EffectController";
import EffectGfxBase from "./EffectGfxBase";
import EffectGfxNode from "./EffectGfxNode";
import EffectGfxParticle from "./EffectGfxParticle";
import EffectGfxSpine from "./EffectGfxSpine";

/**
 * 第节点设计目的在于使用自定义的配置文件（通常位于res/moving/目录下）播放自定义动画
 */
export default class EffectGfxMoving extends EffectGfxBase {

    private static defaultDouble = 1;
    private static effectDesignInterval = 1 / 30; // 动画设计时的FPS速度

    private _effectNodes: { [key: string]: cc.Node };
    private _effectGfxNodes: { [key: string]: EffectGfxNode };
    private _effectSpineNodes: { [key: string]: EffectGfxSpine };
    private _effectParticleNodes: { [key: string]: EffectGfxParticle };
    private _loadEffectNum: number;

    private _effectFunction: Function;
    private _eventHandler: Function;
    private _double: number;
    private _autoRelease: boolean;
    private _totalDt: number;

    private _frameIndex: number;
    private _lastFrameStartArr: { [key: string]: number };

    private _effectController: EffectController;

    private loadedNum: number

    protected onInit() {
        this.effectPath = "moving/" + this.effectName;

        this._effectNodes = {};
        this._effectGfxNodes = {};
        this._effectSpineNodes = {};
        this._effectParticleNodes = {};
        this._loadEffectNum = 0;

        this._double = EffectGfxMoving.defaultDouble;
        this._autoRelease = false;
        this._totalDt = 0;

        this._frameIndex = 1;
        this._lastFrameStartArr = {};

        this._effectController = new EffectController();
    }

    public setHandler(effectFunction, eventHandler) {
        this._effectFunction = effectFunction;
        this._eventHandler = eventHandler;
    }

    protected onLoadEffect() {
        ResourceLoader.loadRes(this.effectPath, cc.JsonAsset, null, this.loadResComplete.bind(this), this.sceneName);
    }

    private loadResComplete(err, res: any) {
        if (this.node == null || !this.node.isValid) {
            return;
        }
        this.setJson(res.json)

        for (const key in this.effectJson) {
            if (key == "events") {
                continue;
            }
            this.createSubNode(key, this.effectJson[key]);
        }

        if (this._loadEffectNum == 0) {
            this.loadComplete();
            return;
        }

        this.loadedNum = 0;
        for (const key in this._effectGfxNodes) {
            this._effectGfxNodes[key].load(this.checkLoadComplete.bind(this));
        }
        for (const key in this._effectSpineNodes) {
            this._effectSpineNodes[key].load(this.checkLoadComplete.bind(this));
        }

        for (const key in this._effectParticleNodes) {
            this._effectParticleNodes[key].load(this.checkLoadComplete.bind(this));
        }
    }

    private checkLoadComplete() {
        this.loadedNum++;
        if (this.loadedNum >= this._loadEffectNum) {
            this.loadComplete();
        }
    }

    private createSubNode(key: string, subJson: any) {
        let effectNode: cc.Node = null;
        let strArray = key.split('_');
        if (strArray[0] == 'effect') {
            effectNode = this._createEffectNode(strArray, key, subJson.order);
            this._loadEffectNum++;
        } else if (strArray[0] == 'spine') {
            effectNode = this._createSpineNode(strArray, key, subJson.order);
            this._loadEffectNum++;
        } else if (strArray[0] == 'lizi') {
            effectNode = this._createParticleNode(strArray, key, subJson.order);
            this._loadEffectNum++;
        }
        this._effectNodes[key] = effectNode;
    }

    private _createEffectNode(strArray: string[], key, order): cc.Node {
        let lastCount: string = strArray[strArray.length - 1];
        let effectName = null;
        if (lastCount.indexOf('copy') > -1) {
            effectName = 'effect';
            for (let i = 1; i < strArray.length - 1; i++) {
                effectName = effectName + ('_' + strArray[i]);
            }

        } else {
            effectName = key;
        }
        let effectNode = new cc.Node().addComponent(EffectGfxNode);
        effectNode.setEffectName(effectName);
        effectNode.setSceneName(this.sceneName);
        this._effectGfxNodes[key] = effectNode;
        this.rootNode.addChild(effectNode.node, order);
        effectNode.node.active = false;
        return effectNode.node;
    }

    private _createSpineNode(strArray: string[], key: string, order): cc.Node {

        // console.log("_createSpineNode:",key);
        let effectSpine: EffectGfxSpine = new cc.Node().addComponent(EffectGfxSpine);
        effectSpine.setSpine(key);
        effectSpine.setScnenName(this.sceneName);

        this._effectSpineNodes[key] = effectSpine;
        this.rootNode.addChild(effectSpine.node, order);
        effectSpine.node.active = false;
        return effectSpine.node;
    }

    private _createParticleNode(strArray: string[], key: string, order): cc.Node {

        let effectParticle: EffectGfxParticle = new cc.Node().addComponent(EffectGfxParticle);
        effectParticle.setParticle(key);
        effectParticle.setSceneName(this.sceneName);

        this._effectParticleNodes[key] = effectParticle;
        this.rootNode.addChild(effectParticle.node, order);
        effectParticle.node.active = false;
        return effectParticle.node;
    }

    protected onPlay() {
        // if (this.effectName == "moving_card_open_yes") {
        //     console.log("111");
        // }
        // for (const key in this._effectGfxNodes) {
        //     this._effectGfxNodes[key].play();
        // }
        // for (const key in this._effectSpineNodes) {
        //     this._effectSpineNodes[key].play();
        // }

        // for (const key in this._effectParticleNodes) {
        //     this._effectParticleNodes[key].play();
        // }
    }

    protected onReset() {
        this._frameIndex = 1;
    }

    protected onStop() {
    }

    protected onPause() {
    }

    protected onResume() {
    }

    public setDouble(double) {
        this._double = double;
    }

    protected onUpdate(dt: number) {
        // if (this.effectName == "moving_card_open_yes") {
        //     console.log("222");
        // }
        this._totalDt = this._totalDt + dt;
        var extraInterval = EffectGfxMoving.effectDesignInterval / this._double;
        var frames = Math.floor(this._totalDt / extraInterval);
        if (frames > this._double) {
            frames = Math.floor(this._double);
        }

        for (let i = 0; i < frames; i++) {
            this._totalDt = this._totalDt - extraInterval;
            if (!this._step()) {
                this.isFinished = true;
                if (this._autoRelease) {
                    this.node.runAction(cc.destroySelf());
                }
                break;
            }
        }
    }

    private _step() {
        var fx = 'f' + this._frameIndex;
        var effectJson = this.effectJson;
        for (const k in effectJson) {
            var v = effectJson[k];
            if (k == 'events') {
                continue;
            }
            this._effectStep(k, v, this._frameIndex);
        }
        if (this._eventHandler && effectJson.events[fx] != null) {
            this._eventHandler(effectJson.events[fx], this._frameIndex, this);
        }
        this._frameIndex = this._frameIndex + 1;
        if (effectJson.events[fx] == 'forever') {
            this._frameIndex = 0;
        } else if (effectJson.events[fx] == 'finish') {
            this.isStart = false;
            return false;
        }
        return true;
    }

    private _effectStep(key, effectLayer: any, frameIndex: number) {
        // if (this.effectName == "moving_card_open_yes") {
        //     console.log("222");
        // }
        if (this._effectNodes[key] == null && this._effectFunction != null) {
            if (typeof this._effectFunction != "function") {
                cc.warn('effect function is not function:', typeof this._effectFunction)
                return
            }
            this._effectNodes[key] = this._effectFunction(key);
            this._effectNodes[key].active = false;
            this.rootNode.addChild(this._effectNodes[key], effectLayer.order);
        }
        var effectNode: cc.Node = this._effectNodes[key];
        if (effectNode == null) {
            // console.warn("[EffectGfxMoving] _effectStep")
            return;
        }
        var lastFrameStart = this._lastFrameStartArr[key];
        var fx = 'f' + frameIndex;
        if (lastFrameStart || effectLayer[fx]) {
            if (!lastFrameStart) {
                effectNode.active = true;
                this._playEffectNode(key);
            }
            if (effectLayer[fx] && effectLayer[fx].remove) {
                effectNode.active = false;
                lastFrameStart = null;
                this._lastFrameStartArr[key] = null;
                return;
            }
            if (effectLayer[fx]) {
                lastFrameStart = frameIndex;
                this._lastFrameStartArr[key] = lastFrameStart;
            }
            if (lastFrameStart == frameIndex) {
                var start = effectLayer[fx].start;
                this._effectController.keyUpdate(effectNode, effectLayer, frameIndex);
                if (start.png) {

                    console.warn("[EffectGfxMoving] _effectStep")
                    // let sprite: cc.Sprite = effectNode.addComponent(cc.Sprite);
                    // cc.resources.load(start.png, cc.SpriteFrame, function (err, res: any) {
                    //     sprite.spriteFrame = res;
                    // })
                    // effectNode.setDisplayFrame(display.newSpriteFrame(start.png));
                }
            } else {
                this._effectController.keyInterUpdate(effectNode, effectLayer, frameIndex, lastFrameStart);
            }
        }
    }

    private _playEffectNode(key: string) {
        if (this._effectGfxNodes[key] != null) {
            this._effectGfxNodes[key].play();
            return;
        }
        if (this._effectSpineNodes[key] != null) {
            this._effectSpineNodes[key].play();
            return;
        }
        if (this._effectParticleNodes[key] != null) {
            this._effectParticleNodes[key].play();
            return;
        }
    }

    public setAutoRelease(auto) {
        this._autoRelease = auto;
    }
}