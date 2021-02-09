import EffectGfxBase from "../effect/EffectGfxBase";
import EffectGfxMoving from "../effect/EffectGfxMoving";
import EffectGfxNode from "../effect/EffectGfxNode";
import EffectGfxSingle from "../effect/EffectGfxSingle";
import { G_SceneManager } from "../init";

export enum EffectGfxType {
    PlayGfx = 1,
    SingleGfx = 2,
    MovingGfx = 3
}

export interface EffectGfxData {
    type: EffectGfxType,
    name: string,
    effectGfx?: EffectGfxBase,
    isPlay?: boolean
}

/**
 * 特效管理器
 */
export class EffectGfxManager {

    private _effectTypeClass: { [key: number]: any } = {
        1: EffectGfxNode,
        2: EffectGfxSingle,
        3: EffectGfxMoving
    };
    private _effectGfxList: {[key: string]: {[key: string]: EffectGfxData}};

    constructor() {
        this._effectGfxList = {};
    }



    /**
     * 加载特效列表
     * @param effectList 加载特效列表 {type: 特效类型EffectGfxType, name: 特效名字}
     * @param completeCallback 特效加载完成回掉
     */
    public loadEffectGfxList(effectList: EffectGfxData[], completeCallback?: Function, sceneName?: string) {
        if (effectList == null || effectList.length <= 0) {
            if (completeCallback) {
                completeCallback();
            }
            return;
        }


        let loadedNum: number = 0;
        for (let i = 0; i < effectList.length; i++) {
            let effect = effectList[i];
            let effectData: EffectGfxData = {
                type: effect.type,
                name: effect.name,
                effectGfx: null,
                isPlay: false
            };
            this._loadEffectGfx(effectData, function () {
                loadedNum++;
                if (loadedNum >= effectList.length) {
                    if (completeCallback) {
                        completeCallback();
                    }
                }
            }, sceneName);
        }
    }

    private _loadEffectGfx(effectData: EffectGfxData, completeCallback?: Function, sceneName?: string): EffectGfxBase {
        let effect = this._getEffectGfx(effectData.name, effectData.type, sceneName);
        if (effect) {
            completeCallback();
            return effect;
        }

        sceneName = sceneName || G_SceneManager.getRunningSceneName();
        let effectNode: cc.Node = new cc.Node(effectData.name);
        let effectGfx: EffectGfxBase = effectNode.addComponent(this._effectTypeClass[effectData.type]);
        effectData.effectGfx = effectGfx;
        effectGfx.setEffectName(effectData.name);
        effectGfx.setSceneName(sceneName);
        effectGfx.load(completeCallback);

        this.cacheEffectData(effectData, sceneName);

        return effectGfx;
    }

    private cacheEffectData(effectData: EffectGfxData, sceneName?: string) {
        sceneName = sceneName || G_SceneManager.getRunningSceneName();
        if (!this._effectGfxList[sceneName]) {
            this._effectGfxList[sceneName] = {}
        }

        this._effectGfxList[sceneName][effectData.name] = effectData;
    }

    public clearCache(sceneName: string) {
        if (!sceneName) {
            return;
        }

        let effects = this._effectGfxList[sceneName]
        if (!effects) {
            return;
        }

        for (let key in effects) {
            let effectGfx = effects[key].effectGfx;
            if (effectGfx.isValid) {
                effectGfx.node.destroy();
            }
        }

        delete this._effectGfxList[sceneName];
    }


    /**
     * 加载并播放嵌套特效形式，不能用于UI控件的控制
     * @param attachNode 需要将特效绑定的父节点
     * @param effectName 特效文件 一般是存放与effect目录下
     * @param callBack  特效事件回调
     * @param autoRelease 特效播放完后自动释放、
     * @param position 
     */
    public createPlayGfx(attachNode: cc.Node, effectName: string, callBack?: Function, autoRelease?: boolean, position?: cc.Vec2): EffectGfxNode {
        let effectGfx: EffectGfxNode = this._createEffectGfx(effectName, EffectGfxType.PlayGfx,
            this._playPlayGfx,
            attachNode, callBack, autoRelease, position) as EffectGfxNode;
        if (effectGfx == null) {
            return;
        }
        if (attachNode != null && attachNode.isValid) {
            attachNode.addChild(effectGfx.node);
        }
        return effectGfx;
    }

    /**
     * 加载并播放flash编辑好的特效文件，生成action， 使得UI播放
     * @param applyNode 指代需要做处理的UI控件
     * @param effectName 特效文件 一般是存放与move目录下
     * @param eventHandler 特效事件回调
     * @param ignoreAttr 可以忽略掉美术flash一些效果（位移，旋转），而不用重新导出flash文件
     * @param startFrame 起始帧
     */
    public applySingleGfx(applyNode: cc.Node, effectName: string, eventHandler?: Function, ignoreAttr?, startFrame?): EffectGfxSingle {
        let effectGfx: EffectGfxSingle = this._createEffectGfx(effectName, EffectGfxType.SingleGfx,
            this._playSingleGfx,
            applyNode, eventHandler, ignoreAttr, startFrame) as EffectGfxSingle;
        return effectGfx;
    }

    /**
     * 加载并播放flash编辑好的特效文件，MovingGfx主要是特效播放过程中会抛出事件
     * 该事件可以动态创建一些UI控件或特效在MovingGfx上。
     * @param attachNode 需要将特效绑定的父节点
     * @param effectName 特效文件 一般是存放与move目录下
     * @param effectFunction 节点回调
     * @param eventHandler 事件回调
     * @param autoRelease 特效播放完后自动释放
     */
    public createPlayMovingGfx(attachNode: cc.Node, effectName: string, effectFunction?: (effect: string) => cc.Node, eventHandler?: Function, autoRelease?: boolean): EffectGfxMoving {
        let effectGfx: EffectGfxMoving = this._createEffectGfx(effectName, EffectGfxType.MovingGfx,
            this._playPlayMovingGfx,
            attachNode, effectFunction, eventHandler, autoRelease) as EffectGfxMoving;
        if (effectGfx == null) {
            return;
        }
        if (attachNode != null && attachNode.isValid) {
            attachNode.addChild(effectGfx.node);
        }
        return effectGfx;
    }

    private _createEffectGfx(effectName: string, effectType: EffectGfxType, playEffect: Function, ...args) {
        if (effectName == null) return;
        let effectGfx: EffectGfxBase = this._getEffectGfx(effectName, effectType);
        if (effectGfx == null) {
            effectGfx = this._loadEffectGfx({
                type: effectType,
                name: effectName,
                effectGfx: null,
                isPlay: true
            }, function (effectGfx) {
                args.unshift(effectGfx);
                playEffect.apply(this, args);
            }) as EffectGfxMoving;
        }
        else {
            args.unshift(effectGfx);
            playEffect.apply(this, args);
        }
        return effectGfx;
    }

    private _playPlayGfx(effectNode: EffectGfxNode, attachNode: cc.Node, callBack?: Function, autoRelease?: boolean, position?: cc.Vec2): EffectGfxNode {
        if (effectNode == null || !effectNode.isValid) {
            return;
        }
        effectNode.setEventHandler(callBack)
        // if (attachNode != null && attachNode.isValid) {
        //     attachNode.addChild(effectNode.node);
        // }
        if (position != null) {
            effectNode.node.setPosition(position.x, position.y);
        }
        effectNode.play();
        if (autoRelease && autoRelease == true) {
            effectNode.setAutoRelease(autoRelease);
        }
        return effectNode;
    }

    private _playSingleGfx(effectNode: EffectGfxSingle, applyNode: cc.Node, eventHandler?: Function, ignoreAttr?, startFrame?): EffectGfxSingle {
        if (effectNode == null || !effectNode.isValid) {
            return;
        }
        effectNode.setEffectSingle(applyNode, eventHandler, ignoreAttr, startFrame);
        effectNode.play();
        return effectNode;
    }

    private _playPlayMovingGfx(effectNode: EffectGfxMoving, attachNode: cc.Node, effectFunction?: (effect: string) => cc.Node, eventHandler?: Function, autoRelease?: boolean): EffectGfxMoving {
        if (effectNode == null || !effectNode.isValid) {
            return;
        }
        effectNode.setHandler(effectFunction, eventHandler);
        // if (attachNode != null && attachNode.isValid) {
        //     attachNode.addChild(effectNode.node);
        // }

        effectNode.play();

        if (autoRelease && autoRelease == true) {
            effectNode.setAutoRelease(autoRelease);
        }
        return effectNode;
    }

    private _getEffectGfx(effectName: string, effectType: EffectGfxType, sceneName?: string): EffectGfxBase {
        sceneName = sceneName || G_SceneManager.getRunningSceneName();
        let effectDatas = this._effectGfxList[sceneName];
        if (!effectDatas) {
            return;
        }

        let effectData = effectDatas[effectName];
        if (effectData && effectData.name == effectName && effectData.type == effectType && !effectData.isPlay) {
            effectData.isPlay = true;
            return effectData.effectGfx;
        }
    }

    // /**
    //  * 释放嵌套特效形式PlayGfx
    //  */
    // public releasePlayGfx(effectNode: EffectGfxNode) {
    //     this.releaseEffectGfx(effectNode);
    // }

    // /**
    //  * 释放flash编辑好的特效文件SingleGfx
    //  */
    // public releaseSingleGfx(effectNode: EffectGfxSingle) {
    //     this.releaseEffectGfx(effectNode);
    // }

    // /**
    //  * 释放flash编辑好的特效文件PlayMovingGfx
    //  */
    // public releasePlayMovingGfx(effectNode: EffectGfxMoving) {
    //     this.releaseEffectGfx(effectNode);
    // }

    // private releaseEffectGfx(effectNode: EffectGfxBase) {

    //     for (let i = 0; i < this._effectGfx.length; i++) {
    //         if (this._effectGfx[i] == effectNode) {
    //             this._effectGfx[i].releaseRes();
    //             this._effectGfx.splice(i, 1);
    //             return;
    //         }
    //     }
    // }


    // /**
    //  * 提前加载PlayGfx
    //  * createPlayGfx
    //  * @param effectName 
    //  */
    // public loadPlayGfx(effectName: string, completeCallback?: Function): EffectGfxNode {
    //     if (effectName == null) return;
    //     let effectNode = new cc.Node().addComponent(EffectGfxNode);
    //     effectNode.setEffectName(effectName);
    //     this._effectGfx.push(effectNode);
    //     effectNode.load(completeCallback);
    //     return effectNode;
    // }

    // /**
    //  * 提前加载SingleGfx
    //  * applySingleGfx
    //  * @param effectName 
    //  */
    // public loadSingleGfx(effectName: string, completeCallback?: Function): EffectGfxSingle {
    //     if (effectName == null) return;
    //     let effectNode = new cc.Node().addComponent(EffectGfxSingle);
    //     effectNode.setEffectName(effectName);
    //     this._effectGfx.push(effectNode);
    //     effectNode.load(completeCallback);
    //     return effectNode;
    // }

    // /**
    //  * 提前加载MovingGfx
    //  * createPlayMovingGfx
    //  * @param effectName 
    //  */
    // public loadPlayMovingGfx(effectName: string, completeCallback?: Function): EffectGfxMoving {
    //     // console.log("[EffectGfxManager] loadPlayMovingGfx", effectName)
    //     if (effectName == null) return;
    //     let effectNode = new cc.Node().addComponent(EffectGfxMoving);
    //     effectNode.setEffectName(effectName);
    //     this._effectGfx.push(effectNode);
    //     effectNode.load(completeCallback);
    //     return effectNode;
    // }

    // /**
    //  * 需调用loadPlayGfx提前加载
    //  * 播放嵌套特效形式，不能用于UI控件的控制
    //  * @param effectNode 预加载返回的EffectGfxNode
    //  * @param attachNode 需要将特效绑定的父节点
    //  * @param callBack  特效事件回调
    //  * @param autoRelease 特效播放完后自动释放
    //  * @param position 
    //  */
    // public playPlayGfx(effectNode: EffectGfxNode, attachNode: cc.Node, callBack?: Function, autoRelease?: boolean, position?: cc.Vec2): EffectGfxNode {
    //     if (effectNode == null) {
    //         return;
    //     }

    //     effectNode.setEventHandler(callBack)
    //     if (attachNode != null && attachNode.isValid) {
    //         attachNode.addChild(effectNode.node);
    //     }
    //     if (position != null) {
    //         effectNode.node.setPosition(position.x, position.y);
    //     }
    //     effectNode.play();
    //     if (autoRelease && autoRelease == true) {
    //         effectNode.setAutoRelease(autoRelease);
    //     }
    //     return effectNode;
    // }

    // /**
    //  * 需调用loadSingleGfx提前加载
    //  * 播放flash编辑好的特效文件，生成action， 使得UI播放
    //  * @param effectNode 预加载返回的EffectGfxSingle
    //  * @param applyNode 指代需要做处理的UI控件
    //  * @param callBack 特效事件回调
    //  * @param ignoreAttr 可以忽略掉美术flash一些效果（位移，旋转），而不用重新导出flash文件
    //  * @param startFrame 起始帧
    //  */
    // public playSingleGfx(effectNode: EffectGfxSingle, applyNode: cc.Node, eventHandler?: Function, ignoreAttr?, startFrame?): EffectGfxSingle {
    //     if (effectNode == null || !effectNode.isValid) {
    //         return;
    //     }
    //     effectNode.setEffectSingle(applyNode, eventHandler, ignoreAttr, startFrame);
    //     effectNode.play();
    //     return effectNode;
    // }

    // /**
    //  * 需调用loadPlayMovingGfx提前加载
    //  * 播放flash编辑好的特效文件，MovingGfx主要是特效播放过程中会抛出事件
    //  * 该事件可以动态创建一些UI控件或特效在MovingGfx上。
    //  * @param effectNode 预加载返回的EffectGfxMoving
    //  * @param attachNode 需要将特效绑定的父节点
    //  * @param effectFunction 节点回调
    //  * @param callBack 事件回调
    //  * @param autoRelease 特效播放完后自动释放
    //  */
    // public playPlayMovingGfx(effectNode: EffectGfxMoving, attachNode: cc.Node, effectFunction?: (effect: string) => cc.Node, eventHandler?: Function, autoRelease?: boolean): EffectGfxMoving {

    //     // console.log("[EffectGfxManager] createPlayMovingGfx", effectNode.effectName)
    //     if (effectNode == null) {
    //         console.log("EffectGfxManager.createPlayMovingGfx effectNode null")
    //         return;
    //     }
    //     effectNode.setHandler(effectFunction, eventHandler);
    //     if (attachNode != null && attachNode.isValid) {
    //         attachNode.addChild(effectNode.node);
    //     }

    //     effectNode.play();

    //     if (autoRelease && autoRelease == true) {
    //         effectNode.setAutoRelease(autoRelease);
    //     }
    //     return effectNode;
    // }
}