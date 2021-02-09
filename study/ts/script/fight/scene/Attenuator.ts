export default class Attenuator extends cc.Component {

    private _fixed: boolean;
    private _targetX: number;
    private _targetY: number;
    private _attenuating: boolean;
    private _ampX: number;
    private _ampY: number;
    private _atteCoef: number;
    private _timeCoef: number;
    private _x: number;
    private _y: number;

    public init(fixed?: boolean) {
        this._fixed = fixed || true;
        this._targetX = this.node.getPosition().x;
        this._targetY = this.node.getPosition().y;
        this._attenuating = false;
        this._ampX = 4;
        this._ampY = 4;
        this._atteCoef = 0.4;
        this._timeCoef = 0.05;
        this._x = 0;
        this._y = 0;
    }

    public setStart(ampX: number, ampY: number, atteCoef?: number, timeCoef?: number) {
        if (!this._fixed) {
            if (!this._attenuating) {
                this._targetX = this.node.getPosition().x;
                this._targetY = this.node.getPosition().y;
            }
        }
        this._ampX = ampX || 20;
        this._ampY = ampY || 20;
        this._atteCoef = atteCoef || 0.6;
        this._timeCoef = timeCoef || 0.05;
        this._x = this._ampX;
        this._y = this._ampY;
        this.unschedule(this.onAtteTimer);
        this.schedule(this.onAtteTimer, this._timeCoef);
    }

    onAtteTimer() {
        this._attenuating = true;
        var y = this._y * this._atteCoef;
        var x = this._y * this._atteCoef;
        this.node.setPosition(this._targetX + x, this._targetY + y);
        this._x = -x;
        this._y = -y;
        if (x < 0.01 && x > -0.01 && y < 0.01 && y > -0.01) {
            this._attenuating = false;
            this.node.setPosition(this._targetX, this._targetY);
            this.unschedule(this.onAtteTimer);
        }
    }
}