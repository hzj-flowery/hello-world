import { G_ResolutionManager } from "../../init";

const {ccclass, property} = cc._decorator;

@ccclass
export class TopLevelNode extends cc.Component {
    public init() {
        cc.game.addPersistRootNode(this.node);

        var resolutionSize = G_ResolutionManager.getDesignCCSize();
        var width = resolutionSize.width;
        var height = resolutionSize.height;
        // this. = cc.LayerColor.create(cc.c4b(100, 0, 0, 0));
        this.node.setContentSize(width, height);
        this.node.setAnchorPoint(0.5, 0.5);
        // this.node.setIgnoreAnchorPointForPosition(false);
        this.node.setPosition(width / 2, height / 2);
        // this.addChild(this._root, 100000);
        // this.addToBlackFrame(this._drawNodeTop);
        // this._drawNodeTop.clear();

        // let display = cc.view.getVisibleSize();
        // var p = [
        //     {
        //         x: -display.width * 0.5,
        //         y: 0
        //     },
        //     {
        //         x: -display.width * 0.5,
        //         y: 400
        //     },
        //     {
        //         x: display.width * 0.5,
        //         y: 400
        //     },
        //     {
        //         x: display.width * 0.5,
        //         y: 0
        //     }
        // ];
        // this._drawNodeTop.drawPolygon(p, 4, cc.c4f(0, 0, 0, 1), 0, cc.c4f(0, 0, 0, 0));
        // this._drawNodeTop.setPosition(cc.v2(display.cx, height * 0.5 + 320));
        // this._drawNodeBottom = cc.DrawNode.create();
        // this.addToBlackFrame(this._drawNodeBottom);
        // this._drawNodeBottom.clear();
        // var p = [
        //     {
        //         x: -display.width * 0.5,
        //         y: 0
        //     },
        //     {
        //         x: -display.width * 0.5,
        //         y: -400
        //     },
        //     {
        //         x: display.width * 0.5,
        //         y: -400
        //     },
        //     {
        //         x: display.width * 0.5,
        //         y: 0
        //     }
        // ];
        // this._drawNodeBottom.drawPolygon(p, 4, cc.c4f(0, 0, 0, 1), 0, cc.c4f(0, 0, 0, 0));
        // this._drawNodeBottom.setPosition(cc.v2(display.cx, height * 0.5 - 320));
        // if (APP_DEVELOP_MODE) {
        //     var imageView = ccui.Button.create();
        //     imageView.addClickEventListenerEx(handler(this, this.onDebugClick), true, null, 0);
        //     imageView.setSwallowTouches(true);
        //     imageView.loadTextures(Path.getUICommon('img_battle_arrow_up'), '');
        //     imageView.setScale(1.5);
        //     var resolutionSize = G_ResolutionManager.getDesignCCSize();
        //     imageView.setTouchEnabled(true);
        //     imageView.setPosition(resolutionSize.width - 4, resolutionSize.height);
        //     imageView.setAnchorPoint(cc.v2(1, 1));
        //     this.addToOfflineLevel(imageView);
        // }
    }
    // public onDebugClick('...') {
    //     if (APP_DEVELOP_MODE) {
    //         var UIDebugView = ccui.Helper.seekNodeByName(display.getRunningScene(), 'UIDebugView');
    //         if (UIDebugView == null) {
    //             UIDebugView = new (require('UIDebugView'))();
    //             UIDebugView.open();
    //         }
    //     }
    // }
    public getRootContentSize() {
        return this.node.getContentSize();
    }
    public addToWaitingLevel(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 3000);
        }
    }
    public addToOfflineLevel(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 20000);
        }
    }
    public addToRealNameLevel(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 3000);
        }
    }
    public addToTipLevel(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 4000);
        }
    }
    public addToNoticeLevel(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 30000);
        }
    }
    public addToShareLevel(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 50000);
        }
    }
    public addToTouchEffectLevel(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 10000);
        }
    }
    public addTutorialLayer(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 2000);
        }
    }
    public addBulletLayer(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 1000);
        }
    }
    public addToSubtitleLayer(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 1000);
        }
    }
    public addToGroupNoticeLayer(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 1000);
        }
    }
    public addToBlackFrame(node:cc.Node) {
        if (this.node) {
            this.node.addChild(node, 40000);
        }
    }
    public remove(node:cc.Node) {
        if (this.node) {
            this.node.removeChild(node);
        }
    }
    public clear() {
        this.node.removeAllChildren();
        this.node = null;
    }
}