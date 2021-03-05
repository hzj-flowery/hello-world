import { State } from "./State";
import Entity from "../unit/Entity";
import { G_AudioManager } from "../../init";
import { AudioConst } from "../../const/AudioConst";

// 第一场战斗中吕布的openshow
export class StateOpneShow extends State {

    private _playTime: number;
    private _waitingTime: number;
    private _waitTime: number;
    private _isWaiting;
    private _position;
    private _bShowName;
    constructor(entity, position, waitTime) {
        super(entity);
        this.cName = "StateOpneShow";
        this._playTime = 0;
        this._waitingTime = 0;
        this._waitTime = waitTime;
        this._isWaiting = true;
        this._position = position;
        this._bShowName = false;
    }

    public start() {
        super.start();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_LVBU_IN);
        this._playTime = 0;
        this._waitingTime = 0;
        this._isWaiting = true;
    }

    public update(f) {
        if (this._isWaiting) {
            if (this._waitingTime >= this._waitTime) {
                this.entity.setPosition(this._position.x, this._position.y);
                this.entity.setAction('openshow', false);
                this._isWaiting = false;
            }
            this._waitingTime = this._waitingTime + f;
            return;
        }
        if (this._playTime >= 2.37) {
            this.onFinish();
        }
        this._playTime = this._playTime + f;
    }
    public onFinish() {
        super.onFinish();
    }
}