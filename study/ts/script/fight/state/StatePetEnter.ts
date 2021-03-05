import { State } from "./State";
import Entity from "../unit/Entity";

export class StatePetEnter extends State {

    private _showTime: number;
    private _stopTime: number;
    constructor(entity: Entity, stopTime) {
        super(entity);
        this.cName = "StatePetEnter";
        this._showTime = 0;
        this._stopTime = stopTime / 100;
    }

    private _playSkillVoice() {

    }

    public start() {
        super.start();
        this.entity.setAction("show");
        this._showTime = 0;
        this.entity.showBillBoard(false);
    }

    public update(f) {
        if (this._showTime > this._stopTime) {
            super.onFinish();
        }
        this._showTime += f;
    }
}