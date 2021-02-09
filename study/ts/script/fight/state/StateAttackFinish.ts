import Entity from "../unit/Entity";
import { StateFlash } from "./StateFlash";
import { Path } from "../../utils/Path";
import UnitHero from "../unit/UnitHero";

// 攻击完成后状态，对应攻击完成后buff
export class StateAttackFinish extends StateFlash {
    private buffList: any[];
    constructor(entity: Entity, buffList:any[]) {
        super(entity);
        let actionID: string = Path.getTargetAction("damage");
        this.setAction(actionID);
        this.buffList = buffList;
        this.bShowName = false;
        this.cName = "StateAttackFinish"
    }

    public start() {
        super.start();

        if (this.buffList.length <= 0) {
            this.onFinish();
        }
    }

    public onDamageEvent(value1: string, value2: string) {
        this.doBuffs();

        this.buffList.forEach(v => {
            if (!v.isAlive) {
                this.entity.to_alive = false;
            }
        });

        this.entity.is_alive = this.entity.to_alive;

        if (value2 == "dying") {
            if (!this.entity.is_alive) {
                this.onFinish();
                this.entity.dying();
            }
        }
    }

    private doBuffs() {
        this.buffList.forEach(data => {
            let damageInfo = null;
            if (data.damage.showValue != 0) {
                damageInfo = data.damage;
            }
            let configId = data.configId;
            (this.entity as UnitHero).buffPlay(configId, damageInfo);
        });
    }

    public onFinish() {
        this.entity.is_alive = this.entity.to_alive;
        super.onFinish();
    }
}