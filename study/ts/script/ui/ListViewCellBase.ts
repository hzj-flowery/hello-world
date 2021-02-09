const { ccclass, property } = cc._decorator;

@ccclass
export default class ListViewCellBase extends cc.Component {

    onLoad() {
        this.onCreate();
    }

    start() {
        this.onEnter();
    }

    onDestroy() {
        this.onExit();
    }

    onInit(){

    }

    protected onCreate() {

    };
    protected onEnter() {

    };
    protected onExit() {

    };
    protected _customCallback: Function;
    private _idx: number;
    private _tag: number;
    public _index: number = 0;
    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }

    public dispatchCustomCallback(...args) {
        if (this._customCallback) {
            this._customCallback(this._idx, ...args);
        }
    }

    public reset() {
    }

    public setIdx(id) {
        this._idx = id;
    }

    public getIdx() {
        return this._idx;
    }

    public _init(id) {
        this.setIdx(id);
    }


    setTag(tag): void {
        this._idx = tag;
    }
    getTag(): number {
        return this._idx;
    }
    initItem(index) {
        this._idx = index;
    }
}
