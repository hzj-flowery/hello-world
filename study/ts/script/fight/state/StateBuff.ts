import { State } from "./State";
import Entity from "../unit/Entity";
import { FightConfig } from "../FightConfig";
import BuffManager from "../BuffManager";

export class StateBuff extends State {

    private _buffTime: number;
    private _attackId: number;
    private _targetIds: number[];
    private _showBuff: boolean;
    private _showBuffTime = 0;
    constructor(entity: Entity, buffTime: number, attackId: number, targetIds?: number[]) {
        super(entity);
        this.cName = "StateBuff";

        this._buffTime = buffTime;
        this._attackId = attackId;
        this._targetIds = targetIds;
        this._showBuff = false;
        this._showBuffTime = 0;
        if (!this.entity.isPet) {
            this.bShowName = false;
        }
    }

    public start() {
        super.start();
        let isBuffShow = false;
        if (this.entity.isPet) {
            this.entity.setAction("idle", true);
            isBuffShow = BuffManager.getBuffManager().checkPoint(this._buffTime, this.entity.camp, this._targetIds)
        }
        else {
            isBuffShow = BuffManager.getBuffManager().checkPoint(this._buffTime, this._attackId, this._targetIds)
        }
        if (isBuffShow) {
            this._showBuff = true;
            this._showBuffTime = 0;
        }
    }

    public update(f: number) {
        if (!this.isStart) {
            return;
        }
        if (!this._showBuff) {
            this.onFinish();
        }
        if (!this.isFinish && this._showBuffTime >= FightConfig.SHOW_BUFF_PRE_ATTACK_TIME) {
            this._showBuff = false;
        }
        else {
            this._showBuffTime += f;
        }
    }

    public onFinish() {
        super.onFinish();
    }
}