const { ccclass, property } = cc._decorator;
@ccclass
export default class ComponentBase extends cc.Component {

    private _isStart: boolean;
    private _isFinish: boolean;
    
    public init(...args) {
        this._isStart = false;
        this._isFinish = false;
    }

    public setStart() {
        this._isStart = true;
        this._isFinish = false;
    }

    public onFinish() {
        this._isFinish = true;
    }

    public isFinish() {
        return this._isFinish;
    }

    public isStart() {
        return this._isStart;
    }

    public checkEnd(event) {
        if (event == 'finish') {
            this.onFinish();
        }
    }

    public setUpdate(f) {
    }
}