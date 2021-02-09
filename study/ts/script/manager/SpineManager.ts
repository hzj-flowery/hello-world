import ResourceLoader from "../utils/resource/ResourceLoader";

export class SpineManager {

    public static readonly KEY_TIME_SCALE = "KEY_SPINE_TIME_SCALE"

    private _spinesMap: { [key: string]: sp.SkeletonData } = {};
    private _timeScale: number = 1;
    private loadingSpineCallback: { [key: string]: Function[]} = {};

    public isSpineExist(url: string) {
        return this._spinesMap[url] != null;
    }

    public setTimeScale(scale: number) {
        this._timeScale = scale;
        cc.director.emit(SpineManager.KEY_TIME_SCALE, scale)
    }

    public getTimeScale(): number {
        return this._timeScale;
    }

    public loadSpine(url: string, completeCallback?: (comp: sp.SkeletonData) => void, sceneName?: string) {
        if (this._spinesMap[url] || this._spinesMap[url] === null) {
            if (completeCallback) {
                cc.director.once(cc.Director.EVENT_AFTER_UPDATE, () => {
                    completeCallback(this._spinesMap[url])
                });
                // completeCallback(this._spinesMap[url]);
            }
            return;
        }

        ResourceLoader.loadRes(url, sp.SkeletonData, null, (err, comp: sp.SkeletonData) => {
            if (err || comp == null || (Array.isArray(comp) && comp.length == 0)) {
                this.loadingSpineCallback[url] = null;
                comp = null;
            }

            completeCallback(comp)
        }, sceneName)
    }

    public getSpine(url: string): sp.SkeletonData {
        return cc.resources.get(url, sp.SkeletonData)
    }
}