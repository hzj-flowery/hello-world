import { StateFlash } from "./StateFlash";
import Entity from "../unit/Entity";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";
import BuffManager from "../BuffManager";
import UnitHero from "../unit/UnitHero";

export class StateHit extends StateFlash {
    private info;
    private hitCount;
    private isProjectile;
    private totalPercent;
    private attackId;

    constructor(entity: Entity, actionID: string, info, isProjectile: boolean, attackId) {
        super(entity);
        this.cName = "StateHit";
        this.setAction(actionID);

        this.info = info;
        this.hitCount = 0;
        this.isProjectile = isProjectile;
        this.totalPercent = 0;
        this.attackId = attackId;
    }

    public onDamageEvent(value1: string, value2: string) {
        // 伤害
        let count = this.flashData.damage; //受击次数
        let c: number = parseInt(value1) //当次受击所占的比重
        let p = c / count //每次手机所占百分比
        if (this.isProjectile) { //如果是弹道攻击的话，平分100
            p = c / 100
        }

        FightSignalManager.getFightSignalManager().dispatchSignal(
            FightSignalConst.SIGNAL_FIGHT_ADD_HURT,
            p, this.entity.stageID);//伤害百分比分配出去

        let damageInfo = this.info.damage;
        var damageType = damageInfo.type;

        //如果有吸收信息这边处理一下
        let singleValue: number = Math.ceil(damageInfo.showValue * p)
        var hpDamage = damageInfo.value;
        var protectDamage = damageInfo.protect;
        var damage = 0;
        var realDamage = 0;
        var realProtect = 0;
        if (damageType == 1) {
            damage = hpDamage + protectDamage;
            realDamage = Math.ceil(damage * p);
        } else if (damageType == 2) {
            realDamage = Math.ceil(hpDamage * p);
            realProtect = Math.ceil(protectDamage * p);
        }

        this.info.hurts.forEach(v => {
            if (v.hurtId == 5) {
                if (v.hurtValue >= singleValue) {
                    singleValue = 0
                }
                else {
                    singleValue = singleValue - v.hurtValue
                }

                if (v.hurtValue >= realDamage) {
                    v.hurtValue = v.hurtValue - realDamage
                    realDamage = 0
                }
                else {
                    realDamage = realDamage - v.hurtValue
                    v.hurtValue = 0
                }
            }
        });

        if (damageType != 0) {
            (this.entity as UnitHero).doHurt(damageType, realDamage, singleValue, this.info.hurts, realProtect);
            if (!this.isProjectile) {
                this.entity.is_alive = this.entity.to_alive
            }
            this.hitCount = this.hitCount + 1
            if (this.hitCount == 1) {
                BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_ATTACK, this.attackId)
            }
            let type = 0
            if (damageType == 1) {
                type = -1
            }
            else if (damageType == 2) {
                type = 1
            }

            let v = type * (singleValue)
            if (v != 0) {

                FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_HURT_VALUE, type * singleValue);
            }
        }

        if (this.isProjectile) { //如果事弹道目标
            this.entity.projectileCount = this.entity.projectileCount - 1
            if (this.entity.projectileCount == 0) {

                FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_ADD_HURT_END, this.entity.stageID);

                if (!this.entity.to_alive) {
                    FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_LAST_HIT, this.entity);
                    this.entity.is_alive = this.entity.to_alive
                    //之前被注释了
                    if (value2 == "dying") {
                        if (!this.entity.is_alive) {
                            this.onFinish()
                            this.entity.dying()
                        }
                    }
                }
            }
        }
        else {
            this.totalPercent = this.totalPercent + c
            if (this.totalPercent == count) {
                FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_LAST_HIT, this.entity);
                FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_ADD_HURT_END, this.entity.stageID);
            }
            if (value2 == "dying") {
                if (!this.entity.is_alive) {
                    this.entity.dying()
                    this.onFinish()
                }
            }
        }
    }

    public onFinish() {
        super.onFinish();
        this.entity.updateHpShadow(true);
        (this.entity as UnitHero).checkSpcialBuff();
        super.onFinish();

        if (!this.entity.is_alive) {
            BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_DIE, this.entity.stageID);
            BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_HIT_BACK, this.attackId, [this.entity.stageID]);
            BuffManager.getBuffManager().deleteEffectByStateId(this.entity.stageID);
            this.entity.dispatchDie()
        }
    }
}