import { SignalConst } from "../const/SignalConst";
import { G_ResolutionManager, G_SceneManager, G_SignalManager, G_TopLevelNode, G_WaitingMask } from "../init";
import ViewBase from "../scene/ViewBase";
import { PrioritySignal } from "../utils/event/PrioritySignal";
import { handler } from "../utils/handler";

var LAYER_COLOR_PERCENT = 0.8
const { ccclass } = cc._decorator;

@ccclass
export default class PopupBase extends ViewBase {

    public signal: PrioritySignal = new PrioritySignal('string');
    private _isShowFinish: boolean;
    protected _isClickOtherClose: boolean;
    private _isNotCreateShade: boolean;
    private _otherCloseCallback;
    private _isAllowHide: boolean;
    private _layerColor: cc.Node;
    protected _rootNode: cc.Node;

    public prefab: cc.Prefab;

    constructor() {
        super();
        // this._isAllowHide = true;
        this._isClickOtherClose = false;
        this._isNotCreateShade = false;
    }

    protected onCreate() {

    }

    protected onEnter(): void {

    }
    protected onExit() { }

    private validateModalLayerVisible() {
        var runningScene = G_SceneManager.getRunningScene();
        if (!runningScene) return;
        var rootPopupNode = runningScene.getPopupNode();
        if (rootPopupNode != null) {
            if (rootPopupNode.children.length <= 0) {
                return;
            }
            var topModalLayer: cc.Node;
            for (var i = 0; i < rootPopupNode.children.length; i++) {
                var modalLayer = rootPopupNode.children[i].getComponent(PopupBase);
                if (modalLayer == null) {
                    continue;
                }
                if (modalLayer.node.getChildByName('popModalLayer') != null && modalLayer.isAllowHide()) {
                    topModalLayer = modalLayer.node;
                    modalLayer.node.active = false;
                }
                if (topModalLayer != null) {
                    topModalLayer.active = true;
                }
            }
        }
    }


    public open() {
        // this._rootNode = this.node.getChildByName("_resourceNode") || this.node.children[0];
        this._rootNode = this.node;
        this.validateModalLayerVisible();
        this._createMask();
        this._isShowFinish = true;
        var scene = G_SceneManager.getRunningScene();
        if (scene) {
            scene.addChildToPopup(this.node);
        }
        else {
            cc.director.getScene().addChild(this.node);
        }
    }
    public openToOfflineLevel() {
        // this._rootNode = this.node.getChildByName("_resourceNode") || this.node.children[0];
        this._rootNode = this.node;
        this._createMask();
        this.node.setPosition(0, 0);
        G_TopLevelNode.addToOfflineLevel(this.node);
    }

    public openWithAction() {
        this.open();
        this._rootNode.opacity = 0;
        this._rootNode.setScale(0.5);
        this._isShowFinish = false;
        this._rootNode.active = true;
        this._rootNode.runAction(cc.sequence(this.getOpenAction(), cc.callFunc(function () {
            this.signal.dispatch('open');
            this._isShowFinish = true;
            this.onShowFinish();
        }.bind(this))));
    }


    // public openWithTarget(target) {
    // function onClickShader(x, y) {
    //     var rect = this._resourceNode.getBoundingBox();
    //     if (this._isShowFinish == true) {
    //         if (!cc.rectContainsPoint(rect, cc.v2(x, y))) {
    //             if (this._layerColor) {
    //                 this._layerColor.removeFromParent();
    //             }
    //         }
    //     }
    // }
    // function onTouch(event, x, y) {
    //     if (event == 'began') {
    //         return true;
    //     } else if (event == 'ended') {
    //         if (this.getNumberOfRunningActions() == 0) {
    //             onClickShader(x, y);
    //         }
    //     }
    // }
    // var layerColor = cc.LayerColor.create(cc.c4b(0, 0, 0, 255 * LAYER_COLOR_PERCENT));
    // layerColor.setAnchorPoint(0.5, 0.5);
    // layerColor.setIgnoreAnchorPointForPosition(false);
    // layerColor.setTouchEnabled(true);
    // layerColor.setTouchMode(cc.TOUCHES_ONE_BY_ONE);
    // layerColor.registerScriptTouchHandler(onTouch);
    // layerColor.addChild(this);
    // this._layerColor = layerColor;
    // var scene = G_SceneManager.getRunningScene();
    // scene.addChildToPopup(layerColor);
    // this._resourceNode.setCascadeOpacityEnabled(true);
    // this._resourceNode.setOpacity(0);
    // this._resourceNode.setScale(0.2);
    // var UIActionHelper = require('UIActionHelper');
    // var width = G_ResolutionManager.getDesignWidth();
    // var height = G_ResolutionManager.getDesignHeight();
    // var position = target && cc.v2(target.convertToWorldSpaceAR(cc.v2(0, 0))) || cc.v2(width * 0.5, height * 0.5);
    // this.setPosition(position);
    // var action = UIActionHelper.popupAction(position);
    // this._resourceNode.runAction(cc.Sequence.create(action, cc.CallFunc.create(function () {
    //     this.signal.dispatch('open');
    //     this._isShowFinish = true;
    //     this.onShowFinish();
    // })));
    // this.close = function () {
    //     this.signal.dispatch('close');
    //     this._layerColor.removeFromParent();
    // };
    // }

    protected onClose() {
    }

    public close() {
        if (!this._isNotCreateShade && this._layerColor) {
            this._layerColor.off(cc.Node.EventType.TOUCH_START, handler(this, this.onTouchHandler));
        }
        this.onClose();
        this.signal.dispatch('close');
        this.node.destroy();
        this.validateModalLayerVisible();
    }

    private getOpenAction() {
        return cc.spawn(cc.scaleTo(0.3, 1).easing(cc.easeBackOut()), cc.fadeIn(0.1));
    }
    private getCloseAction() {
        return cc.spawn(cc.scaleTo(0.1, 0), cc.fadeOut(0.1));
    }
    public openWithTarget(target: cc.Node) {

        this.openWithAction();
        return;
        var onClickShader = function (x, y) {
            var rect: cc.Rect = this.node.getBoundingBox();
            if (this._isShowFinish == true) {
                if (!rect.contains(cc.v2(x, y))) {
                    if (this._layerColor) {
                        this._layerColor.removeFromParent();
                    }
                }
            }
        }.bind(this);
        var onTouchStart = function (event, x, y) {
            return true;
        }.bind(this)
        var onTouchEnd = function (touch: cc.Touch) {
            if (this.getNumberOfRunningActions() == 0) {
                onClickShader(touch.getLocation().x, touch.getLocation().y);
            }
        }.bind(this);

        var layerColor = new cc.Node();
        layerColor.color = new cc.Color(0, 0, 0, 255 * LAYER_COLOR_PERCENT);
        layerColor.setAnchorPoint(0.5, 0.5);
        // layerColor.setIgnoreAnchorPointForPosition(false);
        // layerColor.setTouchEnabled(true);
        // layerColor.setTouchMode(cc.TOUCHES_ONE_BY_ONE);
        layerColor.on(cc.Node.EventType.TOUCH_START, onTouchStart);
        layerColor.on(cc.Node.EventType.TOUCH_END, onTouchEnd);
        layerColor.addChild(this.node);
        this._layerColor = layerColor;
        var scene = G_SceneManager.getRunningScene();
        scene.addChildToPopup(layerColor);
        // this.node.cascadeOpacity = (true);
        this.node.opacity = (0);
        this.node.setScale(0.2);
        var width = G_ResolutionManager.getDesignWidth();
        var height = G_ResolutionManager.getDesignHeight();
        var position = target && cc.v2(target.convertToWorldSpaceAR(cc.v2(0, 0))) || cc.v2(width * 0.5, height * 0.5);
        this.node.setPosition(position);
        //var action = UIActionHelper.popupAction(position);
        var action = cc.delayTime(1);
        this.node.runAction(cc.sequence(action, cc.callFunc(function () {
            this.signal.dispatch('open');
            this._isShowFinish = true;
            this.onShowFinish();
        }.bind(this))));
        this.close = function () {
            this.signal.dispatch('close');
            this._layerColor.removeFromParent();
        }.bind(this);
    }

    public closeWithAction() {
        if (!this._isNotCreateShade && this._layerColor) {
            this._layerColor.off(cc.Node.EventType.TOUCH_START, handler(this, this.onTouchHandler));
        }
        if (this._rootNode) {
            this._rootNode.runAction(cc.sequence(this.getCloseAction(), cc.callFunc(function () {
                this.close();
            }.bind(this))));
        }
    }

    onShowFinish() {
    }

    private _createMask() {
        if (this._isNotCreateShade) {
            return;
        }
        this._layerColor = new cc.Node("popModalLayer");
        let width: number = G_ResolutionManager.getDesignWidth();
        let height: number = G_ResolutionManager.getDesignHeight();
        this._layerColor.setScale(10, 10);
        this._layerColor.setContentSize(width, height);
        this._layerColor.addComponent(cc.BlockInputEvents);
        this._layerColor.on(cc.Node.EventType.TOUCH_START, handler(this, this.onTouchHandler));

        let g: cc.Graphics = this._layerColor.addComponent(cc.Graphics);
        g.lineWidth = 1;
        g.fillColor = new cc.Color(0, 0, 0, 255 * 0.8);
        g.fillRect(-width / 2, -height / 2, width, height);

        this.node.addChild(this._layerColor, -1);
    }

    protected onTouchHandler() {
        if (this._isShowFinish && this._isClickOtherClose) {
            if (this._otherCloseCallback != null) {
                this._otherCloseCallback();
            }
            this.closeWithAction();
        }
    }

    setShowFinish(showFinish) {
        this._isShowFinish = showFinish;
    }
    isShowFinish() {
        return this._isShowFinish;
    }
    setNotCreateShade(isNotCreateShade: boolean) {
        this._isNotCreateShade = isNotCreateShade;
    }
    setClickOtherClose(isClickOtherClose: boolean) {
        this._isClickOtherClose = isClickOtherClose;
    }
    setClickOtherCloseCallback(otherCloseCallback) {
        this._otherCloseCallback = otherCloseCallback;
    }
    setAllowHide(allowHide) {
        this._isAllowHide = allowHide;
    }
    isAllowHide(): boolean {
        return this._isAllowHide;
    }

    public static getIns<T extends PopupBase>(cls: { prototype: T }, cb: (T) => void) {
        var clsName = cc.js.getClassName(cls);
        var path = (cls as any).path;
      //assert((path, clsName + '的prefab路径找不到');
        G_WaitingMask.showWaiting(true);
        cc.resources.load('prefab/'+path, cc.Prefab, (err, prefab) => {
            var node: cc.Node = cc.instantiate(prefab);
            node.name = clsName;
            var comp = node.getComponent(cls);
            cb(comp);
            G_WaitingMask.showWaiting(false);
        });
    }

    /**
     * 异步加载prefab并返回脚本
     * 默认脚本与prefab同名并放在common目录下，不同名的添加静态路径path(与Popupbase.getIns方法兼容，此路径不加prefab)
     * 弹出前需要额外预加载的资源添加静态属性preLoadRes
     */
    static loadCommonPrefab(claName: string, cb: (component: any) => void) {
        var script = cc.js.getClassByName(claName) as any;
        var path = script.path;
        if (!path) {
            path = 'common/' + claName;
        }
        var preLoadRes: any[] = script.preLoadRes;
        if (!preLoadRes) {
            preLoadRes = [];
        }
        else {
            preLoadRes = preLoadRes.concat();
        }
        var realPath: string = 'prefab/' + path;
        preLoadRes.push(realPath);
        G_WaitingMask.showWaiting(true);
        cc.resources.load(preLoadRes, (err, resource) => {
            G_WaitingMask.showWaiting(false);
            var prefab = cc.resources.get(realPath);
            var node: cc.Node = cc.instantiate(prefab);
            node.name = claName;
            var component = node.getComponent(claName);
            if (!component) component = node.addComponent(claName);
            cb && cb(component);
        });
    }
}