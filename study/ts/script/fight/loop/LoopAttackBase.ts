import { Attack, Target, Buff } from "../report/WaveData"
import { FightConfig } from "../FightConfig";
import UnitHero from "../unit/UnitHero";
import { FightRunData } from "../FightRunData";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";
import { handler } from "../../utils/handler";
import { Slot } from "../../utils/event/Slot";
import Entity from "../unit/Entity";
import BuffManager from "../BuffManager";
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { HistoryBuff } from "../history/HistoryBuff";

export class LoopAttackBase {

    protected data: Attack;
    protected unit: Entity;
    protected unitPartner: UnitHero;
    protected targets;
    protected targetCount;
    protected addTargets;
    protected selfTarget;

    protected hitFinish;
    protected attackFinish;
    protected hitFinishCount;

    protected skillInfo;

    protected hasCheckChat;

    protected _isStart = false;
    protected _isExecute = false;
    protected _isFinish;
    protected index = 0;
    protected atkType = 0;
    protected saveData = false;

    private testHpData;

    private targetHurt = 0;;
    private calcId = 0;
    private addDamage = 0;
    private addDamageB = 0;

    protected buffManager: BuffManager;

    protected signals: Slot[];
    protected signalAttacker: Slot;
    protected signalWait: Slot;
    protected signalWait2: Slot;
    protected _listenerSignal: Slot;

    constructor(data: Attack, index: number) {
        // print("1112233 loop attack new index", index)
        this.data = data //本次攻击信息
        this.unit = null //攻击的单位或者宠物
        this.unitPartner = null //合击的武将，合击技能时候出现
        this.targets = null //目标
        this.targetCount = 0 //目标数量
        this.addTargets = null //附加目标
        this.selfTarget = null //攻击者自己是目标时候的信息（通常是加血的时候）


        this.hitFinish = false //所有受击完成
        this.attackFinish = false //所有攻击（包括buff类型4检测）完成
        this.hitFinishCount = 0 //攻击结束数量

        this.skillInfo = null //skillInfo

        this.signals = [];

        this.hasCheckChat = false //是否检查过对话
        this._isStart = false //是否开始攻击
        this._isExecute = false //是否已经执行
        this._isFinish = false //是否结束

        this._listenerSignal = FightSignalManager.getFightSignalManager().addListenerHandler(handler(this, this.onSignalEvent))

        this.buffManager = BuffManager.getBuffManager();


        this.index = index
        this.atkType = null

        this.saveData = false
    }

    private processBuffs() {
        this.processBuffEffect()
        this.processDelBuffBefore()
        this.processDelBuffMiddle()
        this.processAnger()
        this.processAddBuff()
        this.processBattleEffect()
        this.processDelBuff()
    }

    _checkRoundBuff() {
        if (this.index == 1) {
            this.buffManager.checkRoundBuff();
        }
    }
    _processHistoryStar() {
        var historyStars = this.data.stars;
        var hisBuffs = [];
        for (var _ in historyStars) {
            var data = historyStars[_];
            var historyBuff = new HistoryBuff(data);
            hisBuffs.push(historyBuff);
        }
        this.buffManager.formatHistoryBuff(hisBuffs);
    }

    protected makeTargets() {
        let targets: any = {
            list: [],
            cell: [],
            MainCellIdx: 0 //主要目标idx（相邻攻击时，主要收集idx）
        };

        for (let i = 0; i < this.data.targets.length; i++) {

            let targetData: Target = this.data.targets[i];
            let target: UnitHero = FightRunData.instance.getUnitById(this.data.targets[i].stageId)
            if (target) {
                if (i == 0) {
                    targets.MainCellIdx = target.cell
                }
                if (!targetData.isAlive) {
                    target.to_alive = targetData.isAlive
                }
                if (targetData.awards.length != 0) {
                    target.dropAward = targetData.awards
                }
                let t: any = {
                    unit: target,
                    info: targetData
                };

                targets.cell[target.cell] = t;
                targets.list.push(t);
                if (targetData.stageId != this.unit.stageID) {
                    this.targetCount = this.targetCount + 1
                    let signal = target.signalStateFinish.add(handler(this, this.onHitFinish));
                    this.signals.push(signal);
                }
                else
                    this.selfTarget = t
            }
        }
        this.targets = targets //目标
        this.targetCount = this.data.targets.length;
        if (this.selfTarget) {
            this.targetCount = this.targetCount - 1 //把自己从target里面拿掉
        }
    }

    // 做一个新的addtarget，用stageId
    protected makeAddTargets() {
        let targets = []

        this.data.addTargets.forEach(v => {
            let target = FightRunData.instance.getUnitById(v.stageId)
            if (target) {
                let t: any = {};
                if (!v.isAlive) {
                    target.to_alive = v.isAlive
                }
                t.stageId = v.stageId
                t.info = v
                targets.push(t);
            }
        });
        this.addTargets = targets
    }

    //buff相关处理 begin//////////////////////////////////////////////////////
    //处理攻击前表现
    private processBuffEffect() {
        this.data.buffEffects.forEach(buffData => {
            let data = this.processBuff(buffData)
            this.buffManager.addBuffEffect(data, this.unit.stageID)
        });
    }

    //处理全场展示的buff
    private processBattleEffect() {

        this.data.battleEffects.forEach(buffData => {
            let data = this.processBuff(buffData)
            this.buffManager.addBattleEffect(data)
        });
    }

    //处理攻击前删除buff
    private processDelBuffBefore() {

        this.data.delBuffsBefore.forEach(buffData => {
            let data = this.processBuff(buffData)
            this.buffManager.addDelBuffBefore(data)
        });
    }

    //处理攻击中删除的buff
    private processDelBuffMiddle() {

        this.data.delBuffsMiddle.forEach(buffData => {
            let data = this.processBuff(buffData)
            this.buffManager.addDelBuffMiddle(data)
        });
    }

    //处理攻击后删除buff
    private processDelBuff() {

        this.data.delBuffs.forEach(buffData => {
            let data = this.processBuff(buffData)
            this.buffManager.addDelBuff(data)
        });
    }

    //处理怒气buff
    private processAnger() {

        this.data.angers.forEach(buffData => {
            let data = this.processBuff(buffData)
            this.buffManager.addAngerBuff(data)
        });
    }

    //处理添加buff
    private processAddBuff() {

        this.data.addBuffs.forEach(buffData => {
            let data = this.processBuff(buffData)
            this.buffManager.addAddBuff(data)
        });
    }

    //给buff加上攻击者，受击者列表，//如果是宠物上的buff，函数重写
    protected processBuff(data) {
        let buffData: any = {};
        for (const key in data) {
            buffData[key] = data[key];
        }
        if (data.configId != null) {
            buffData.buffConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(data.configId)
        }
        buffData.attacker = this.unit.stageID
        buffData.target = data.stageId //被上buff的对象
        buffData.targets = [] //被攻击的目标
        buffData.atkTargets = [] //攻击者用buff目标
        buffData.checkCount = 0 //被攻击的检察数量
        buffData.atkCheckCount = 0 //攻击者的检查数量

        this.targets.list.forEach(hitter => {
            if (hitter.unit.to_alive) {
                buffData.targets.push(hitter.unit.stageID);
            }
            buffData.atkTargets.push(hitter.unit.stageID);
        });

        buffData.totalCount = buffData.targets.length;
        buffData.atkTotalCount = buffData.atkTargets.length

        buffData.attackIndex = this.index
        buffData.isAlive = data.isAlive
        if (buffData.isAlive == false) {
            buffData.dieIndex = this.index
        }

        return buffData;
    }
    //buff相关处理 end//////////////////////////////////////////////////////

    //是否可以攻击
    public isExecute() {
        if (this.unit.getState() == 'StateOut') {
            this.processDelBuffBefore();
            var buffManager = BuffManager.getBuffManager();
            buffManager.checkDelBefore(this.unit.stageID);
        }

        if (!this.skillInfo && !this.data.isHistory && this.unit.getState() == "StateOut") {
            this.onFinish()
            return false
        }

        if (!this.data.isHistory && !this.unit.isStateStart("StateIdle")) {
            return false
        }

        if (this.unitPartner && !this.unit.isStateStart("StateIdle")) {
            return false
        }

        for (let i = 0; i < this.targets.list.length; i++) {
            let v = this.targets.list[i]
            if (!v.unit.isStateStart("StateIdle")) {
                return false
            }
        }

        if (!this.hasCheckChat) {
            this.checkChat();
            this.hasCheckChat = true;
            return false
        }

        if (!this._isStart) {
            return false;
        }

        if (this._isExecute) {
            return false;
        }

        return true;
    }

    //是否结束
    public get isFinish() {
        return this._isFinish;
    }

    public getUnitConfigId() {

    }

    private checkChat() {
        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_ATTACK_CHECK_CHAT);
    }

    //攻击
    public execute() {
        this.buffManager.deleteUsedBuff();
        this._processHistoryStar();
        this.processBuffs()

        this.targets.cell.forEach(v => {
            v.unit.attackIndex = this.index
        });

        this.targets.list.forEach(v => {
            let target = v.unit
            let info = v.info
            if (info.type == 1) {
                target.hp = target.hp - info.value
                if (target.hp < 0) {
                    target.hp = 0
                }
            }
        });

        this._isFinish = false
        this.startSkill()
        this._isExecute = true
    }

    //开始攻击
    public startSkill() {
    }

    //结束本次攻击轮次
    public onFinish() {
        this.buffManager.checkPoint(BuffManager.BUFF_ATTACK_FINISHED, this.unit.stageID)
        this.updateFinalHp()
        this._isFinish = true
        if (this.unit.to_alive == false) {
            this.unit.is_alive = this.unit.to_alive
        }
    }

    //清除监听
    public clear() {
        for (let i = 0; i < this.signals.length; i++) {
            this.signals[i].remove();
            this.signals[i] = null;
        }
        if (this.signalAttacker) {
            this.signalAttacker.remove();
            this.signalAttacker = null;
        }

        if (this.signalWait) {
            this.signalWait.remove();
            this.signalWait = null;
        }

        if (this.signalWait2) {
            this.signalWait2.remove();
            this.signalWait2 = null;
        }

        if (this._listenerSignal) {
            this._listenerSignal.remove();
            this._listenerSignal = null;
        }
    }

    protected onSignalEvent(event, ...args) {
        if (event == FightSignalConst.SIGNAL_START_ATTACK) {
            this._isStart = true;
        }
        else if (event == FightSignalConst.SIGNAL_FIGHT_ADD_HURT) {
            this.doAddHurt(args[0], args[1]);
        }

        else if (event == FightSignalConst.SIGNAL_ADD_HURT_END) {
            this.doAddHurtEnd(args[0]);
        }else if (event == FightSignalConst.SIGNAL_ROUND_BUFF_CHECK) {
            this._checkRoundBuff();
        }
    }

    private doAddHurt(percent: number, attackId: number) {
        if (!this.addTargets || this.addTargets.length == 0) {
            return
        }

        if (FightConfig.HP_TEST_ON) {
            if (!this.testHpData) {
                this.testHpData = {
                    type: "桃源扣血",
                    showValue: 0,
                    realValue: 0
                }
            }
        }

        for (let i = 0; i < this.addTargets.length; i++) {
            let v = this.addTargets[i]
            let atkId = v.info.attackStageId
            if (atkId == attackId) {
                let unit = FightRunData.instance.getUnitById(v.stageId)
                let hurtInfo = [
                    {
                        hurtId: FightConfig.getAddHurtId(v.info.showType),
                        hurtValue: 0
                    }
                ]

                let damageInfo = v.info.damage
                let type = damageInfo.type
                let showValue = Math.ceil(damageInfo.showValue * percent)
                var totalValue = damageInfo.value + damageInfo.protect
                let value = Math.ceil(totalValue * percent);

                if (unit) {
                    unit.doHurt(type, value, showValue, hurtInfo)
                    if (type == 1) {
                        showValue = -showValue
                    }

                    FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_HURT_VALUE, showValue);
                    if (FightConfig.HP_TEST_ON && unit.stageID == FightConfig.HP_TEST_ID) {
                        unit.hp = unit.hp - value
                        this.testHpData.finalHp = unit.hp
                        this.testHpData.showValue = this.testHpData.showValue - showValue
                        this.testHpData.realValue = this.testHpData.realValue + value
                    }
                }
            }
        }
    }

    private doAddHurtEnd(attackId) {

        this.addTargets.forEach(v => {
            let atkId = v.info.attackStageId
            if (atkId == attackId) {
                let unit = FightRunData.instance.getUnitById(v.stageId)
                if (unit) {
                    unit.getAddHurtEnd()
                }
            }
        });
        // if (this.testHpData && !this.saveData) {
        //     if (this.testHpData.realValue != 0) {
        //         // let FightHelper = require("app.scene.view.fight.FightHelper")
        //         // FightHelper.pushDamageData(this.testHpData)
        //         this.saveData = true
        //     }
        // }
    }

    //场景动画回掉
    protected onSceneFinish(event) {
        this.onFinish()
    }

    //受击结束事件处理
    protected onHitFinish(event: string, unitId: number) {
        if (!this._isStart) {
            return
        }
        if (event == 'StateHit' || event == 'StateDying') {
            this.hitFinishCount = this.hitFinishCount + 1;
            if (this.hitFinishCount == this.targetCount) {
                this.hitFinish = true;
                var hisBuffs = BuffManager.getBuffManager().checkSelfCampBackHistory(this.unit.camp);
                if (hisBuffs) {
                    for (var i in hisBuffs) {
                        var v = hisBuffs[i];
                        v.playBuff();
                    }
                }
            }
        }
        else if (event == "StateDamage" && !this.unit.to_alive && !this.skillInfo) {
            //buff跳伤害死亡的情况\
            this.onFinish()
            return
        }
        else if (event == "StateAttackFinish") {
            this.attackFinish = true
            if (this.targetCount == 0) { //自己打自己的情况
                this.hitFinish = true
            }
            if (this.data.newUnits.length != 0) {
                FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_NEW_UNIT, this.data.newUnits, true);
                // Engine.getEngine(): initUnit(this.data.newUnits, true)
            }
        }
        if (this.hitFinish && this.attackFinish) {
            if (!this.skillInfo) {
                this.onFinish()
            }
            else if (this.skillInfo && this.skillInfo.skill_type != 3) {
                this.onFinish()
            }
        }
    }

    public getAttackType() {
        return this.atkType
    }

    private gethurtByStageId(stageId) {
        this.targetHurt = 0
        this.calcId = stageId
        this.addDamage = 0
        this.addDamageB = 0
        let unit = FightRunData.instance.getUnitById(stageId)
        unit.totalDamage = 0
        unit.calcDamage = true
        this.data.targets.forEach(v => {
            if (v.stageId == stageId) {
                let vhp = v.value
                if (v.type == 1) {
                    vhp = -vhp
                    this.targetHurt = this.targetHurt + vhp
                    this.addDamageB = vhp
                }

                v.hurts.forEach(vv => {
                    if (vv.hurtId == 5) {
                        vhp = vv.hurtValue
                        this.targetHurt = this.targetHurt + vhp
                    }
                });
            }
        });

        this.data.addTargets.forEach(v => {
            if (v.stageId == stageId) {
                // type = 0, 								//事件类型
                // value = 0, 								//数值
                let vhp = v.value
                if (v.type == 1) {
                    vhp = -vhp
                    this.targetHurt = this.targetHurt + vhp
                    this.addDamage = vhp
                }
            }
        });

    }

    //比较伤害
    private calchurt() {
        let unit = FightRunData.instance.getUnitById(this.calcId)
        if (!unit) {
            return
        }
        unit.calcDamage = false
        unit.totalDamage = 0
        this.addDamage = 0
        this.addDamageB = 0
    }

    private updateFinalHp() {

    }
}