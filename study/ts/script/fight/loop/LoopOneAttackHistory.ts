import { LoopAttackBase } from "./LoopAttackBase"
import { FightConfig } from "../FightConfig"
import UnitHero from "../unit/UnitHero";
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";
import { FightRunData } from "../FightRunData";

//历代名将攻击, 没有攻击者，只有攻击目标
export class LoopOneAttackhistory extends LoopAttackBase {

    private hasStartSkill = false;
    private skillShowId = 0;

    constructor(data, index) {
        super(data, index)
        this.hasStartSkill = false
        this.skillShowId = 0
        this.makeAttacker()
        this.makeTargets()
        this.addBuffs()
        this.atkType = FightConfig.HISTORY_ATTACK
    }

    private makeAttacker() {
        this.unit = new UnitHero();
        this.unit.stageID = 0;

        let skillInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(this.data.skillId)
        this.skillShowId = skillInfo.skill_show_id
    }

    public isExecute() {
        if (this.hasStartSkill)
            return false
        return super.isExecute()
    }

    //执行攻击
    public execute() {
        this.hasStartSkill = true
        super.execute()
    }

    //开始攻击
    public startSkill() {

        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_HISTORY_SHOW, this.data.hisCamp, this.data.hisId, this.skillShowId)

        let units = FightRunData.instance.getUnits();
        for (let i = 0; i < units.length; i++) {
            units[i].setZOrderFix(FightConfig.ZORDER_SKILL_UNIT)

        }
        let sceneView = FightRunData.instance.getView();
        if (sceneView) {
            sceneView.showSkill2Layer(true)
        }
        super.startSkill()
    }

    private addBuffs() {
        this.data.addBuffs.forEach(buffData => {
            let data = this.processBuff(buffData)
            this.buffManager.addHistoryBuff(data)
        });
    }

    protected onSignalEvent(event, ...args) {

        if (event == FightSignalConst.SIGNAL_HISTORY_SHOW_END) {
            this.onFinish()
        }
        else if (event == FightSignalConst.SIGNAL_HISTORY_BUFF) {
            this.buffManager.doHistoryBuffs()
        }
        super.onSignalEvent(event, ...args);
    }

    public onFinish() {

        let units = FightRunData.instance.getUnits();
        for (let i = 0; i < units.length; i++) {
            units[i].setZOrderFix(0)

        }
        let sceneView = FightRunData.instance.getView();
        
        if (sceneView) {
            sceneView.showSkill2Layer(false)
        }
        super.onFinish()
    }
}