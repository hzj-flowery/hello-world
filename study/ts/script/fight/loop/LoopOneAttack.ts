import { LoopAttackBase } from "./LoopAttackBase"
import { FightConfig } from "../FightConfig"
import { FightRunData } from "../FightRunData";
import { StateWait } from "../state/StateWait";
import { handler } from "../../utils/handler";
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";
import UnitHero from "../unit/UnitHero";
import BuffManager from "../BuffManager";

export class LoopOneAttack extends LoopAttackBase {

    private combineReady = 0;
    private combineFlash = 0;
    private skillType: number;

    constructor(data, index) {
        super(data, index);
        this.makeAttacker()
        this.makeAddTargets()
        this.makeTargets()

        this.atkType = FightConfig.NORMAL_ATTACK
    }

    //制作攻击者
    private makeAttacker() {

        this.unit = FightRunData.instance.getUnitById(this.data.stageId) //攻击单位
        this.unit.to_alive = this.data.isAlive;
        this.signalAttacker = this.unit.signalStateFinish.add(handler(this, this.onHitFinish));

        //攻击者回掉
        if (this.data.skillId == 0 || !this.data.skillId) { //技能id是0的时候，认为没有放技能，跳过回合
            this.hitFinish = true
        }
        else {
            let HeroSkillActive = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE);
            this.skillInfo = HeroSkillActive.get(this.data.skillId);
        }

        let Hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        BuffManager.getBuffManager().doPerCheck(this.unit.stageID, this.data.delBuffsBefore);
        if (this.skillInfo) {
            //处理合击技能
            this.skillType = this.skillInfo.skill_type;
            if (this.skillType == 3) {
                let hero = Hero.get(this.unit.configId);

                let partnerId = hero.skill_3_partner;

                let units = FightRunData.instance.getUnits();
                for (let i = 0; i < units.length; i++) {
                    if (units[i].camp == this.data.camp && units[i].configId == partnerId && units[i].to_alive && units[i].getState() != "StateOut") {
                        this.unitPartner = units[i];
                    }
                }

                this.signalWait = this.unit.signalStateWait.add(handler(this, this.onWaitCombine));
                this.signalWait2 = this.unitPartner.signalStateWait.add(handler(this, this.onWaitCombine));

                this.combineReady = 0
                this.combineFlash = 0
                this.unit.startMove = false
                this.unitPartner.startMove = false
            }
        }

        //场景动画结束回掉
        let sceneSignal = FightRunData.instance.getScene().signalStateFinish.add(handler(this, this.onSceneFinish));
        this.signals.push(sceneSignal);
    }

    //执行攻击
    public execute() {
        //处理合击
        if (this.skillInfo && this.skillType == 3) {

            let units = FightRunData.instance.getUnits();
            for (let i = 0; i < units.length; i++) {
                units[i].inCombineWatcher = true
            }

            this.unitPartner.inCombineWatcher = false
            this.unit.inCombineWatcher = false

            this.targets.list.forEach(v => {
                v.unit.inCombineWatcher = false;
            });
            this.unit.showBillBoard(false)
            this.unitPartner.showBillBoard(false)
            let view = FightRunData.instance.getView();
            view.showSkill3Layer(true)

            for (let i = 0; i < units.length; i++) {
                units[i].showShadow(false);
                if (units[i].inCombineWatcher) {
                    units[i].fade(false);
                }
            }
        }
        super.execute()
    }

    //开始攻击
    public startSkill() {
        (this.unit as UnitHero).skill(this.skillInfo, this.targets, this.unitPartner)
        super.startSkill()
    }

    //接受合击等待信号
    private onWaitCombine(event: string) {
        // console.log("onWaitCombine:", event);
        if (event == StateWait.WAIT_COMBINE_SKILL) {
            this.combineReady = this.combineReady + 1
            if (this.combineReady == 2) {
                (this.unit as UnitHero).startCombineSkill()
                this.combineReady = 0
            }
        }
        else if (event == StateWait.WAIT_COMBINE_FLASH) {
            this.combineFlash = this.combineFlash + 1
            if (this.combineFlash == 2) {
                let HeroSkillPlay = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_PLAY);
                let skillPlay = HeroSkillPlay.get(this.skillInfo.skill_show_id);
                if (skillPlay.heji_show && skillPlay.heji_show != "0") {
                    FightSignalManager.getFightSignalManager().dispatchSignal(
                        FightSignalConst.SIGNAL_PLAY_COMBINE_FLASH,
                        skillPlay.heji_show
                    )
                }
                else {
                    this._startCombine()
                }
            }
        }
    }

    protected onSignalEvent(event, ...args) {
        if (event == FightSignalConst.SIGNAL_PLAY_COMBINE_FLASH) {
            this._startCombine();
        }
        super.onSignalEvent(event, ...args);
    }

    //开始合击
    private _startCombine() {
        this.unit.startMove = true
        this.unitPartner.startMove = true

        //处理合击

        FightRunData.instance.getUnits().forEach(unit => {
            unit.inCombineWatcher = true;
        });

        this.unitPartner.inCombineWatcher = false
        this.unit.inCombineWatcher = false

        this.targets.list.forEach(v => {
            v.unit.inCombineWatcher = false
        });

        this.unit.showBillBoard(false)
        this.unitPartner.showBillBoard(false)
        let view = FightRunData.instance.getView();
        if (view) {
            view.showSkill3Layer(true)
        }

        FightRunData.instance.getUnits().forEach(unit => {
            if (unit.inCombineWatcher)
                unit.fade(false);
        });
    }

    //结束本次攻击轮次
    public onFinish() {
        let units = FightRunData.instance.getUnits();
        if (this.skillInfo && this.skillType == 3) {
            for (let i = 0; i < units.length; i++) {
                units[i].fade(true);
            }
        }

        for (let i = 0; i < units.length; i++) {
            units[i].inCombineWatcher = null;
            units[i].setZOrderFix(0);
        }

        let sceneView = FightRunData.instance.getView();
        sceneView.showSkill2Layer(false)
        super.onFinish()
    }

    //获得攻击unit的id
    public getUnitConfigId() {
        if ((this.unit as UnitHero).isPlayer()) {
            return 1
        }
        return this.unit.configId
    }
}