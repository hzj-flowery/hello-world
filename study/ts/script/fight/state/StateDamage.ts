import Entity from "../unit/Entity";
import { StateFlash } from "./StateFlash";
import { Path } from "../../utils/Path";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";
import BuffManager from "../BuffManager";
import UnitHero from "../unit/UnitHero";

export class StateDamage extends StateFlash {

    private _buffList: any[];
    public isLastBuff;
    private _actionID: string;

    constructor(entity: Entity, info:any[], isLastBuff?) {
        super(entity);
        this.cName = "StateDamage";
        this._buffList = info;
        this.isLastBuff = isLastBuff;

        if (this._buffList.length == 0) {
            let actionID = "idle";
            this.setAction(Path.getTargetAction(actionID));
            return;
        }
        this._actionID = "idle";
        this._buffList.forEach(v => {
            let damageInfo = v.damage;
            let showvalue = damageInfo.showValue;
            if (damageInfo.type == 1) {
                showvalue *= -1;
                this._actionID = "damage";
            }
        });
        this.setAction(Path.getTargetAction(this._actionID));
    }

    public start() {
        if (this._actionID == "idle") {
            this.doBuffs();
        }
        super.start();
        if (this._buffList.length == 0) {
            this.onFinish();
        }
    }

    public onDamageEvent(value1: string, value2: string) {
        this.doBuffs();

        if (!this.isLastBuff) {
            return;
        }

        if (!this.entity.getHasSkill()) {
            this.entity.is_alive = this.entity.to_alive;
        }

        if (value2 == "dying") {
            if (!this.entity.is_alive) {
                this.onFinish();

                this.entity.setDieState();

                // 处理武将死亡情况
                FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_LAST_HIT, this.entity);
            }
        }
    }

    public doBuffs() {
        for (let i = 0; i < this._buffList.length; i++) {
            let val = this._buffList[i];
            let configId = val.configId;
            if (configId == null) {
                configId = BuffManager.getBuffManager().getBuffConfigIdByGlobalId(val.globalId);
            }
            let damageInfo = null;
            if (val.damage.showValue != 0 || val.damage.protect != 0) {
                damageInfo = val.damage;
            }
            (this.entity as UnitHero).buffPlay(configId, damageInfo, null, null, null, true);
        }
    }

    public onFinish() {
        if (this.isLastBuff) {
            BuffManager.getBuffManager().clearBuffEffect(this.entity.stageID);
            BuffManager.getBuffManager().checkDelBefore(this.entity.stageID);
        }

      //  this.entity.is_alive = this.entity.to_alive;

        if (!this.entity.is_alive) {
            this.entity.dispatchDie();
            BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_ATTACK_BACK, this.entity.stageID, null, true);
        }
        super.onFinish();
    }
}