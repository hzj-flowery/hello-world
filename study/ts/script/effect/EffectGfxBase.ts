import EffectHelper from "./EffectHelper";

export default abstract class EffectGfxBase extends cc.Component {

    public effectName: string;
    public effectJson: any;
    public effectPath: string;

    protected rootNode:cc.Node;
    protected isStart: boolean;
    protected isPause: boolean;
    protected isFinished: boolean;
    protected isLoaded: boolean;
    protected isReleased: boolean;

    protected loadCompleteCallback: Function;

    protected sceneName: string;

    public setEffectName(effectName: string) {
        this.effectName = effectName;
        this.node.name = this.effectName;
        this.isStart = false;
        this.isPause = false;
        this.isFinished = false;
        this.isLoaded = false;
        this.isReleased = false;
        this.rootNode = new cc.Node("_root");
        this.rootNode.active = false;
        this.node.addChild(this.rootNode);
        this.onInit();
        return this;
    }

    public setSceneName(name: string) {
        this.sceneName = name;
    }

    public load(completeCallback?: Function) {
        this.loadCompleteCallback = completeCallback;
        this.onLoadEffect();
    }

    public isPlaying() {
        return this.isStart && !this.isPause;
    }

    public isDone() {
        return this.isFinished;
    }

    public play() {
        if (!this.isLoaded || this.isReleased) {
            return;
        }
        if (this.isStart) {
            this.reset();
        }
        this.isStart = true;
        this.isPause = false;
        this.isFinished = false;
        this.rootNode.active = true;
        this.onPlay();
    }

    public reset() {
        this.onReset();
    }

    public pause() {
        this.isPause = true;
        this.onPause();
    }

    public resume() {
        this.isPause = false;
        this.onResume();
    }

    public stop() {
        this.isStart = false;
        this.onStop();
    }

    public releaseRes() {
    }

    update(dt: number) {
        if (!this.isLoaded || this.isReleased) {
            return;
        }

        if (this.isFinished || !this.isStart || this.isPause) {
            return;
        }
        this.onUpdate(dt);
    }

    onDestroy() {
        this.isStart = false;
        if (this.isReleased) {
            return;
        }
        this.releaseRes();
    }

    protected loadComplete() {
        this.isLoaded = true;
        if (this.loadCompleteCallback != null) {
            this.loadCompleteCallback(this);
        }
    }

    protected setJson(effectJson: any) {
        this.effectJson = effectJson;
        if (this.effectJson != null) {
            this.effectJson = EffectHelper.parseJson(this.effectJson);
        }
    }

    protected abstract onInit();
    protected abstract onLoadEffect();
    protected abstract onPlay();
    protected abstract onPause();
    protected abstract onResume();
    protected abstract onReset();
    protected abstract onStop();
    protected abstract onUpdate(dt: number);
}