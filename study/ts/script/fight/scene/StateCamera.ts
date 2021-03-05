export default class StateCamera {

    private _targetViewport: cc.Vec2;
    private _startViewport: cc.Vec2;
    private _maxDistance: number;
    private _positionDelta: cc.Vec2;
    private _distance: number;
    private _time: number;
    private _speed: number;
    private _isBack: boolean;
    private _finishCallback: Function;
    private _finish: boolean;
    private _start: boolean;

    public constructor(startViewport: cc.Vec2, targetViewport: cc.Vec2, time: number, isback: boolean, finishCallback: Function) {
        this._startViewport = startViewport;
        this._targetViewport = targetViewport;
        this._maxDistance = null;
        this._positionDelta = null;
        this._distance = null;
        this._time = time;
        this._speed = null;
        this._isBack = isback;
        this._finishCallback = finishCallback;
        this._finish = false;
        this._start = false;
    }
    public setStart() {
        this._start = true;
        this._positionDelta = this._targetViewport.sub(this._startViewport);
        this._maxDistance = this._positionDelta.mag();
        this._speed = this._maxDistance / this._time;
    }
    public setUpdate(f): cc.Vec2 {
        if (this._start && this._finish == false) {
            if (this._distance == null) {
                this._distance = 0;
            } else {
                this._distance = this._distance + this._speed;
            }
            var t = this._distance / this._maxDistance;
            t = t > 1 && 1 || t;
            var viewport = this._startViewport.sub(this._positionDelta.mul(t));
            if (t == 1) {
                this.onFinish();
            }
            return viewport
        }
        else {
            return null;
        }
    }

    onFinish() {
        this._finish = true;
        if (this._targetViewport.x == 0 && this._targetViewport.y == 0) {
            this._finishCallback(false);
        }
    }
    isFinish() {
        return this._finish;
    }
    isStart() {
        return this._start;
    }
    isBack() {
        return this._isBack;
    }
}