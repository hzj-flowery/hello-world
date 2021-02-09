import { Loop } from "./Loop";
import { Round } from "../report/WaveData";
import { FightConfig } from "../FightConfig";
import { LoopOneAttackPet } from "./LoopOneAttackPet";
import { LoopOneAttackhistory } from "./LoopOneAttackHistory";
import { LoopOneAttack } from "./LoopOneAttack";
import { LoopAttackBase } from "./LoopAttackBase";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";
import BuffManager from "../BuffManager";
import { HistoryBuff } from "../history/HistoryBuff";

export class LoopRound extends Loop {
    private _data: Round;
    private _index = 0;
    private _attack: LoopAttackBase = null;
    private _buff = null;
    private _attackIndex = 0;
    private _hasStar: boolean;

    constructor(data: Round) {
        super();
        this._data = data;
        this._index = 0     //attack序列号
        this._attack = null
        this._buff = null
        this._attackIndex = 0   //execute的attack序列号

        var hisBuffs = [];
        for (var _ in this._data.stars) {
            var d = this._data.stars[_];
            var historyBuff = new HistoryBuff(d);
            hisBuffs.push(historyBuff);
        }
        BuffManager.getBuffManager().formatHistoryBuff(hisBuffs);
        this._hasStar = false;
        if (hisBuffs.length != 0) {
            this._hasStar = true;
        }
        BuffManager.getBuffManager().addRoundBuff(this._data.buffs);
    }

    public start() {
        super.start();
        this._index = 1;

        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_ROUND_START);
    }

    public checkAttack() {
        if (this._attack == null) {
            let attackData = this._data.attacks[this._index - 1];
            if (attackData.isPet) {
                this._attack = new LoopOneAttackPet(attackData, this._index);
            }
            // else if (attackData.isHistory) {
            //     this._attack = new LoopOneAttackhistory(attackData, this._index);
            // }
            else {
                this._attack = new LoopOneAttack(attackData, this._index);
            }
        }
    }

    public update(f: number) {
        // console.log("LoopRpund update:", this.index, this.data.attacks.length);
        if (this._index > this._data.attacks.length) {
            this.isFinish = true;
        }
        else {
            this.checkAttack();
            if (this._attack) {
                if (this._attack.isFinish) {
                    this._attack.clear();
                    this._attack = null;
                    this._index += 1;
                    console.log("LoopRound attack next:", this._index);
                }
                else {
                    if (this._attack.isExecute()) {
                        this._attack.execute();
                        this._attackIndex += 1;
                    }
                }
            }
        }
    }

    public getLoopAttack() {
        if (!this._attack) {
            return;
        }
        let type = this._attack.getAttackType();
        if (type != FightConfig.HISTORY_ATTACK) {
            return this._attack;
        }
    }

    public clear() {
        if (!this._attack) {
            return;
        }
        this._attack.clear();
        this._attack = null;
    }

    public onFinish() {
        BuffManager.getBuffManager().checkRoundEndAnger(this._data.angers)
        super.onFinish();
    }

    public getAttackIndex() {
        return this._index;
    }
}