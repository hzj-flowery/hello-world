import { FakeProgress } from "../../../scripts/FakeProgress";
import { G_TopLevelNode } from "../init";

const { ccclass, property } = cc._decorator

export const enum Waiting_Show_Type {
    NET = 1 << 0,
    LOAD_RES = 1 << 1,
    SCENE
}

@ccclass
export class WaitingMask extends cc.Component {

    @property(cc.Node)
    private bar: cc.Node = null;

    @property(cc.Node)
    private shine: cc.Node = null;

    @property(cc.Label)
    private progressLabel: cc.Label = null;

    @property(cc.Node)
    private waitingNode: cc.Node = null;

    @property(cc.Label)
    private tipsLabel: cc.Label = null;

    @property(cc.Node)
    private mask: cc.Node = null;

    @property(cc.JsonAsset)
    tipsJson: cc.JsonAsset = null;

    private _shown: number;
    private _isInit: boolean = false;

    private _fakeProgress: FakeProgress;

    private tips: string[]
    private _progress: number;

    public updateProgress(percent: number) {
        if (!this._shown) {
            return;
        }

        this.progressLabel.string = Math.floor(percent * 100) + '%'
        this._progress = percent;
    }

    public get progress(): number {
        return this._progress;
    }

    public onLoad() {
        if (this._isInit) {
            return;
        }
        this.node.active = false;
        this.waitingNode.active = false;
        this._fakeProgress = new FakeProgress();

        this.tips = this.tipsJson.json;
    }

    public init() {
        this._isInit = true;
        this.node.zIndex = 3000;
        this.node.active = false;
        this._shown = 0;

        this.onResized();
        if (cc.sys.isMobile) {
            window.addEventListener('resize', this.onResized.bind(this));
        }
        else {
            cc.view.on('canvas-resize', this.onResized, this);
        }
    }

    private onResized() {
        this.node.setContentSize(G_TopLevelNode.getRootContentSize());
        this.node.setPosition(0, 0);
    }

    public showWaiting(show: boolean, type = Waiting_Show_Type.NET, t?: number) {
        let toShow: boolean;
        let lastShow = this._shown;
        if (show) {
            this._shown |= type;
        } else {
            this._shown &= ~type;
        }
        if (this._shown > 0) {
            toShow = true;
        } else {
            toShow = false;
        }

        if (this.node.active === toShow) {
            return;
        }

        this.node.active = toShow;
        if (toShow) {
            t = t || 0.5;
            this.scheduleOnce(this.showSprite, t);
            this.updateProgress(0);
            this._fakeProgress.run(Math.random() * 2 + 4, this.onProgress, this);
        }
        else {
            this._fakeProgress.cancel();
            this.updateProgress(0);
            this.hideSprite();
            this.unscheduleAllCallbacks();
        }
    }

    private onProgress(progress: number) {
        if (this.progress < progress) {
            this.updateProgress(progress);
        }
    }

    private showSprite() {
        this.waitingNode.active = true;
        this.mask.runAction(cc.fadeTo(1, 128));
        this.bar.runAction(cc.repeatForever(cc.rotateBy(4, 360)))
        this.shine.runAction(cc.repeatForever(cc.rotateBy(2, 360)))
        this.waitingNode.scale = 0;
        this.waitingNode.runAction(cc.scaleTo(0.3, 1.2, 1.2).easing(cc.easeBackOut()))
        // if (!this.tips || this.tips.length == 0 || G_SceneManager.getRunningSceneName() == 'login') {
            // this.tipsLabel.node.parent.active = false;
        // } else {
            // this.tipsLabel.node.parent.active = true;
            this.updateTips();
            this.schedule(this.updateTips, 2.5, cc.macro.REPEAT_FOREVER, 0);
        // }
    }

    private updateTips() {
        if (!this.tips || this.tips.length == 0) {
            return;
        }

        let tip = this.tips[Math.floor(Math.random() * this.tips.length)];
        this.tipsLabel.string = tip;
    }

    private hideSprite() {
        this.mask.opacity = 0;
        this.waitingNode.active = false;
        this.mask.stopAllActions();
        this.bar.stopAllActions();
        this.shine.stopAllActions();
        this.unscheduleAllCallbacks();
    }
}