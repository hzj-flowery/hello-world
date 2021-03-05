import { State } from "./State";
import BuffManager from "../BuffManager";
import { handler } from "../../utils/handler";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";

export class StateHistoryShow extends State {
    private _checkTime: any;
    private _showCount: number;
    private _checkId: any;
    private _endCount: number;
    constructor(entity, checkTime, checkId?) {
        super(entity);
        this._checkTime = checkTime;
        this._showCount = 0;
        this._checkId = checkId;
    }
    start() {
        super.start();
        this._checkHistoryBuff();
    }
    _checkHistoryBuff() {
        var buffs = null;
        if (this._checkId) {
            buffs = BuffManager.getBuffManager().checkHisBuff(this._checkTime, this.entity.stageID);
        } else {
            buffs = BuffManager.getBuffManager().checkHisBuff(this._checkTime);
        }
        if (!buffs) {
            this.onFinish();
            return;
        }
        this._endCount = 0;
        for (var _ in buffs) {
            var v = buffs[_];
            v.playBuff(handler(this, this._playBuffCallback));
            this._showCount = this._showCount + 1;
        }
    }
    _playBuffCallback() {
        this._endCount = this._endCount + 1;
        if (this._endCount == this._showCount) {
            this.onFinish();
        }
    }
    onFinish() {
        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_ROUND_BUFF_CHECK);
        super.onFinish();
    }
}