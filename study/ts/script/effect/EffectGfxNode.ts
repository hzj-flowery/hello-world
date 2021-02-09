import ResourceLoader from "../utils/resource/ResourceLoader";
import EffectController from "./EffectController";
import EffectGfxBase from "./EffectGfxBase";

//[=========================[

//特效播放类

//旨在使用自定义的配置文件（effect_xxx.json，通常位于res / effect / 目录下）播放自定义动画

//内部结构如下:

// *EffectGfxNode(key1)    (存放于self._playingSublayers)
// *EffectGfxNode(key2)    (存放于self._playingSublayers)
// *clippingNode(key3)  (存放于self._maskNodes)
// **stencilNode(key3)(clippingNode的stencil)   (存放于self._maskStencilNodes) 
// ***stencil(key3)(遮罩的实际样子,是stencilNode的子节点)   (存放于self._playingSublayers) 

//]=========================]
export default class EffectGfxNode extends EffectGfxBase {

    private static defaultDouble = 1;
    private static effectDesignInterval = 1 / 30; // 动画设计时的FPS速度
    private static reservedKeys = { events: true, scale: true, png: true }

    private _colorOffset: cc.Vec4;
    private _effectSpriteAltas: cc.SpriteAtlas;

    private _subNodes: any;//cc.Node || EffectGfxNode
    private _playingSubNodes: any;//cc.Node || EffectGfxNode
    private _subEffectNodes: { [key: string]: EffectGfxNode };//EffectGfxNode
    private _subEffectNodesLength: number;
    private _subLastStartFrame: any;//number
    private _maskNodes: any;
    private _maskStencilNodes: any;
    private _eventHandler: Function;
    private _frameIndex: number;
    private _double: number;
    private _totalDt: number;
    private _autoRelease: boolean;

    private _effectController: EffectController;

    protected onInit() {

        this.effectPath = 'effect/' + this.effectName + '/' + this.effectName;

        this._subNodes = {};
        this._playingSubNodes = {};

        this._subEffectNodes = {};
        this._subEffectNodesLength = 0;

        this._subLastStartFrame = {};
        this._maskNodes = {};
        this._maskStencilNodes = {};
        this._frameIndex = 1;
        this._double = EffectGfxNode.defaultDouble;

        this._totalDt = 0;
        this._autoRelease = false;

        this.effectJson = null;
        this._effectSpriteAltas = null;

        this._effectController = new EffectController();
    }

    public setEventHandler(eventHandler?: Function) {
        this._eventHandler = eventHandler;
    }

    protected onLoadEffect() {
        // console.log("[EffectGfxNode] load:", this.effectName);
        this.loadJsonRes();
    }

    private loadJsonRes() {
        ResourceLoader.loadRes(this.effectPath, cc.JsonAsset, null, (err, res:cc.JsonAsset) => {
            if (this.node == null || !this.isValid) {
                return;
            }
            if (res == null) {
                this.setLoadCompleteCallback();
                return;
            }
            this.setJson(res.json);
            this.loadSpriteAltasRes();
        }, this.sceneName);
    }

    private loadSpriteAltasRes() {
        if (this.effectJson == null) {
            this.setLoadCompleteCallback();
            return;
        }
        if (this.effectJson.png != null && this.effectJson.png == "") {
            this.setSpriteAltas(null);
            this.loadResComplete();
            return;
        }
        ResourceLoader.loadRes(this.effectPath, cc.SpriteAtlas, null, (err, res: cc.SpriteAtlas) => {
            if (this.node == null || !this.node.isValid) {
                return;
            }
            this.setSpriteAltas(res);
            this.loadResComplete();
        }, this.sceneName);
    }

    private loadResComplete() {
        for (const k in this.effectJson) {
            if (EffectGfxNode.reservedKeys[k] != null) {
                continue;
            }
            this.createSubNode(k, this.effectJson[k]);
        }

        if (this._subEffectNodesLength <= 0) {
            this.setLoadCompleteCallback();
            return;
        }

        let loadedNum: number = 0;
        for (const key in this._subEffectNodes) {
            (this._subEffectNodes[key] as EffectGfxNode).load(function () {
                loadedNum++;
                if (loadedNum >= this._subEffectNodesLength) {
                    this.setLoadCompleteCallback();
                }
            }.bind(this))
        }
    }

    private setLoadCompleteCallback() {
        this.loadComplete();
    }

    private createSubNode(key: string, subJosn: any) {
        if (subJosn == null) {
            return;
        }
        let parentNode = this._getParentNode(subJosn);
        //如果当前节点层是指定effect，表示是嵌套层
        if (subJosn.effect) {
            let subEffect = new cc.Node().addComponent(EffectGfxNode);
            subEffect.setEffectName(subJosn.effect)
            subEffect.setSceneName(this.sceneName);
            parentNode.addChild(subEffect.node, subJosn.order);
            this._subEffectNodes[key] = subEffect;
            this._subEffectNodesLength++;

            this._subNodes[key] = subEffect;
        } else {
            // TODO:effect mask
            //如果这个是遮罩层, 而且是rect/circle类型的遮罩,那么创建一个矩形/圆形即可,不需要加载图片
            // if (subJosn.mask_info && subJosn.mask_info.mask_type != 'image') {
            //     let sub = EffectHelper.createDrawNode(subJosn.mask_info);
            //     parentNode.addChild(sub, subJosn.order);
            // } else {
            //     parentNode.addChild(new cc.Node(), subJosn.order);
            // }
            let subNode = new cc.Node();
            subNode.name = key;
            parentNode.addChild(subNode, subJosn.order);
            this._subNodes[key] = subNode;
        }
    }

    private setSpriteAltas(effectSpriteAltas: cc.SpriteAtlas) {
        this._effectSpriteAltas = effectSpriteAltas;
    }

    protected onPlay() {
        this.update(0.3);
        for (const k in this._playingSubNodes) {
            var sub = this._playingSubNodes[k];
            if (this.isTypeOfEffectGfxNode(sub)) {
                sub.play();
            }
        }
    }

    protected onStop() {
        for (const i in this._playingSubNodes) {
            var sub = this._playingSubNodes[i];
            if (this.isTypeOfEffectGfxNode(sub)) {
                sub.stop();
            }
        }
    }

    protected onPause() {
        for (const i in this._playingSubNodes) {
            var sub = this._playingSubNodes[i];
            if (this.isTypeOfEffectGfxNode(sub)) {
                sub.pause();
            }
        }
    }

    protected onResume() {
        for (const i in this._playingSubNodes) {
            var sub = this._playingSubNodes[i];
            if (this.isTypeOfEffectGfxNode(sub)) {
                sub.resume();
            }
        }
    }

    public setDouble(double) {
        this._double = double;
    }

    private gotoAndStop(n) {
        this.onReset();
        for (let i = 0; i < n; i++) {
            this._step();
        }
        this.stop();
    }

    protected onReset() {
        this._frameIndex = 1;
        for (const key in this._playingSubNodes) {
            var sub = this._playingSubNodes[key];
            if (sub != null) {
                this.deleteSub(sub);
            }
        }
        this._subLastStartFrame = {};
        this._playingSubNodes = {};
        this._maskNodes = {};
        this._maskStencilNodes = {};
    }


    protected onUpdate(dt) {

        this._totalDt = this._totalDt + dt;

        //计算实际上应该播放多少帧
        var extraInterval = EffectGfxNode.effectDesignInterval / this._double;
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
            if (!EffectGfxNode.reservedKeys[k]) {
                this._stepSub(k, this._frameIndex);
            }
        }

        if (this._eventHandler && effectJson.events[fx]) {
            this._eventHandler(effectJson.events[fx], this._frameIndex, this);
        }

        if (this._frameIndex == null) {
            return false;
        }

        this._frameIndex = this._frameIndex + 1;

        if (effectJson.events[fx] == 'forever') {
            // console.log("forever", this._frameIndex);
            this._frameIndex = 1;
        } else if (effectJson.events[fx] == 'finish') {
            this.isStart = false;
            return false;
        }
        return true;
    }

    private _stepSub(key, frameIndex: number) {

        var lastFrameStart = this._subLastStartFrame[key];
        var playingSub = this._playingSubNodes[key];
        var subInfo = this.effectJson[key];
        var fx = 'f' + frameIndex;

        // console.log("_stepSub:", frameIndex, lastFrameStart);
        if (lastFrameStart || subInfo[fx]) {
            if (this.removeSubNode(subInfo[fx], key)) {
                return;
            }
            if (subInfo[fx]) {
                this._subLastStartFrame[key] = frameIndex;
                lastFrameStart = frameIndex;
            }
            if (lastFrameStart == frameIndex) {
                if (playingSub == null) {
                    playingSub = this._subNodes[key];
                    this.showSub(playingSub);
                    this._playingSubNodes[key] = playingSub;
                    if (this.isTypeOfEffectGfxNode(playingSub) && subInfo['first_frame']) {
                        playingSub.gotoAndStop(subInfo['first_frame']);
                    }
                    if (this.isPlaying() && this.isTypeOfEffectGfxNode(playingSub)) {
                        playingSub.play();
                    }
                }
                if (playingSub == null) {
                    return;
                }
                var start = subInfo[fx].start;
                if (start.png && start.png != '') {
                    this.setSprite(start.png, playingSub);
                }
                this._effectController.keyUpdate(this.getSubNode(playingSub), subInfo, frameIndex);
            } else {
                this._effectController.keyInterUpdate(this.getSubNode(playingSub), subInfo, frameIndex, lastFrameStart);
            }
        }
    }

    private setSprite(spriteName: string, playingSub: any) {
        let spriteNames: string[] = spriteName.split(".");
        let spriteFrame: cc.SpriteFrame = this._effectSpriteAltas.getSpriteFrame(spriteNames[0]);
        let node: cc.Node = this.getSubNode(playingSub);
        let sprite: cc.Sprite = node.getComponent(cc.Sprite);
        if (sprite == null) {
            sprite = node.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            sprite.trim = false;
        }
        if (spriteFrame != null) {
            sprite.spriteFrame = spriteFrame;
        }
        if (this.effectJson.scale) {
            sprite.node.setScale(this.effectJson.scale);
        }
    }

    private removeSubNode(fxInfo, key) {
        if (fxInfo && fxInfo.remove) {

            if (this._playingSubNodes[key] != null) {
                this._subLastStartFrame[key] = null;
                this.deleteSub(this._playingSubNodes[key]);
                this._playingSubNodes[key] = null;
            }
            return true;
        }
        return false;
    }

    private getSubNode(playingSub): cc.Node {
        let node: cc.Node = playingSub;
        if (this.isTypeOfEffectGfxNode(playingSub)) {
            node = playingSub.node;
        }
        return node;
    }

    private showSub(playingSub) {
        this.getSubNode(playingSub).active = true;
    }

    private deleteSub(playingSub) {
        let node: cc.Node = this.getSubNode(playingSub)
        node.active = false;
        node.setPosition(0, 0);
        node.setScale(1);
        node.angle = 0;
        node.opacity = 255;
    }

    private _getParentNode(subInfo) {

        var parentNode: cc.Node = this.rootNode;
        if (subInfo.mask) {
            //--这是被遮罩
            parentNode = this._getMaskParent(subInfo.mask);
        } else if (subInfo.mask_info) {
            //-- 这是遮罩的stencil层
            parentNode = this._getMaskStencil(null);
        }

        return parentNode;
    }

    private _getMaskParent(key): cc.Node {
        var effectJson = this.effectJson;
        var node: cc.Node = this._maskNodes[key];
        if (node == null) {
            var maskInfo = effectJson[key];
            node = new cc.Node();
            node.addComponent(cc.Mask);
            this.rootNode.addChild(node, maskInfo.order);
            this._maskNodes[key] = node;
        }
        return node;
    }

    private _getMaskStencil(key) {
        var effectJson = this.effectJson;
        var node: cc.Node = this._maskStencilNodes[key];
        if (node == null) {
            var maskInfo = effectJson[key];
            node = new cc.Node();
            var parent: cc.Node = this._getMaskParent(key);
            parent.addChild(node);
            // TODO:
            // if (parent.getStencil() == null) {
            //     parent.setStencil(node);
            //     if (maskInfo.mask_info.mask_type != 'image') {
            //         //矩形遮罩 或者circle遮罩
            //     } else {
            //         //图形遮罩
            //         parent.setAlphaThreshold(0.05);
            //     }
            // }
            this._maskStencilNodes[key] = node;
        }
        return node;
    }

    public setAutoRelease(auto) {
        this._autoRelease = auto;
    }

    public setColorOffset(colorOffset) {
        for (const key in this._playingSubNodes) {
            var sub = this._playingSubNodes[key];
            var subColorOffset = sub.getColorOffset();
            // sub.setColorOffset(new cc.Vec4(colorOffset.r + subColorOffset.r - this._colorOffset.r, colorOffset.g + subColorOffset.g - this._colorOffset.g, colorOffset.b + subColorOffset.b - this._colorOffset.b, colorOffset.a + subColorOffset.a - this._colorOffset.a));
        }
        this._colorOffset = colorOffset;
    }

    public getColorOffset() {
        return this._colorOffset;
    }

    private isTypeOfEffectGfxNode(o: any) {
        if (o != null && o.constructor == EffectGfxNode) {
            return true;
        }
        return false;
    }
}