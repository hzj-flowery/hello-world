import { LoopAttackBase } from "./LoopAttackBase"
import { FightConfig } from "../FightConfig"
import { FightRunData } from "../FightRunData"
import { handler } from "../../utils/handler"
import { G_ConfigLoader } from "../../init"
import { ConfigNameConst } from "../../const/ConfigNameConst"
import UnitPet from "../unit/UnitPet"
import { FightSignalManager } from "../FightSignalManager"
import { FightSignalConst } from "../FightSignConst"

export class LoopOneAttackPet extends LoopAttackBase {

    constructor(data, index) {
        super(data, index)
        this.makeAttacker()
        this.makeTargets()
        this.makeAddTargets()
        this.atkType = FightConfig.PET_ATTACK
    }
    public makeAttacker() {

        this.unit = FightRunData.instance.getPetByCamp(this.data.petCamp, this.data.petId);		//攻击单位
        this.signalAttacker = this.unit.signalStateFinish.add(handler(this, this.onHitFinish))	//攻击者监听

        this.skillInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(this.data.skillId)

        let sceneSignal = FightRunData.instance.getScene().signalStateFinish.add(handler(this, this.onSceneFinish))
        this.signals.push(sceneSignal);
    }

    //执行攻击
    public execute() {
        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_ROUND_BUFF_CHECK)
        this.unit.fade(true)
        super.execute()
    }

    //开始攻击
    public startSkill() {
        (this.unit as UnitPet).skill(this.skillInfo, this.targets)
        super.startSkill()
        if (this.skillInfo && this.skillInfo.skill_type == 2) {
            let petId = (this.unit as UnitPet).getResId()
            let color = (this.unit as UnitPet).getColor()
            FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_PLAY_PET_SKILL,
                this.unit.camp, (this.unit as UnitPet).getSkillAnim(), petId, color)
        }
    }

    //获得攻击unit的id
    public getUnitConfigId() {
        return this.unit.configId
    }

    public processBuff(data) {
        let buffData = data
        buffData.buffConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(buffData.configId)
        buffData.attacker = this.unit.camp
        buffData.attackId = this.unit.camp
        buffData.target = buffData.stageId		//被上buff的对象
        buffData.targets = []					//被攻击的目标
        buffData.atkTargets = []				//攻击者用buff目标
        buffData.checkCount = 0					//被攻击的检察数量
        buffData.atkCheckCount = 0				//攻击者的检查数量

        this.targets.list.forEach(hitter => {
            if (hitter.unit.to_alive) {
                buffData.targets.push(hitter.unit.stageID);
            }
            buffData.atkTargets.push(hitter.unit.stageID);
        });
        buffData.totalCount = buffData.targets.length;
        buffData.atkTotalCount = buffData.atkTargets.length;
        buffData.attackIndex = this.index
        return buffData
    }

    //结束本次攻击轮次
    public onFinish() {

        FightRunData.instance.getUnits().forEach(unit => {
            unit.setZOrderFix(0);
        });

        FightRunData.instance.getPets().forEach(pet => {
            pet.setZOrderFix(0);
        });

        let sceneView = FightRunData.instance.getView();
        if (sceneView) {
            sceneView.showSkill2Layer(false)
        }
        super.onFinish()
    }
}