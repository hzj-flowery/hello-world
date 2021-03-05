import { G_ConfigLoader } from "../init"
import { ConfigNameConst } from "../const/ConfigNameConst"
import { FightRunData } from "./FightRunData"
import { handler } from "../utils/handler"
import { clone2 } from "../utils/GlobleFunc"
import FightEngine from "./FightEngine"

export default class BuffManager {

    public static BUFF_PRE_ATTACK = 0 //作用时间是攻击前, 喊话前
    public static BUFF_ATTACK = 1 //作用时间攻击第一下时候
    public static BUFF_ATTACK_BACK = 2 //作用时间是攻击者回位
    public static BUFF_HIT_BACK = 3 //作用时间是受击回位
    public static BUFF_ATTACK_FINISHED = 4 //作用时间是攻击完成后
    public static BUFF_AFTER_SHOW = 5 //喊话之后
    public static BUFF_FIGHT_OPENING = 6 //开始战斗时候的buff
    public static BUFF_PET_SHOW_END = 7 //开场怪物回到位置
    public static BUFF_DIE = 8 //死亡

    public static HIS_BEFORE_FIGHT = 1 //整场开始前
    public static HIS_BEFORE_ATK = 2 //攻击开始前
    public static HIS_AFTER_ATK = 3 //攻击回位后
    public static HIS_AFTER_HIT = 4 //受击回位后

    private static _buffManager;
    public static getBuffManager(): BuffManager {
        if (this._buffManager == null) {
            this._buffManager = new BuffManager();
        }
        return this._buffManager;
    }

    private _buffEffect: { [key: number]: any[] };
    private _addBuff: any[];
    private _angerBuff: any[];
    private _delBuffBefore: any[];
    private _delBuffMiddle: any[];
    private _delBuff: any[];
    private _battleEffect: any[];
    private _petsBuff: any[];
    private _buffList: any[];
    private _effectLaterShow: any[];
    private _addBuffLastShow: any[];
    private _buffHistory: any[];
    private _historyIndex = 1;
    private _buffHistoryLeft: {};
    private _buffHistoryRight: {};
    private _roundBuff: any[];

    private _engine: FightEngine

    public set engine(value: FightEngine) {
        this._engine = value
    }

    public get engine(){
        return this._engine;
    }

    constructor() {
        this._buffEffect = {};
        this._addBuff = [];
        this._angerBuff = [];
        this._delBuffBefore = [];
        this._delBuffMiddle = [];
        this._delBuff = [];
        this._battleEffect = [];
        this._petsBuff = [];
        this._buffList = [];
        this._effectLaterShow = [];
        this._addBuffLastShow = [];
        this._buffHistory = [];
        this._buffHistoryLeft = [];
        this._buffHistoryRight = [];
        this._roundBuff = [];
    }



    public clearBuff() {
        this._addBuff = [];
        this._delBuff = [];
        this._buffEffect = {};
        this._angerBuff = [];
        this._delBuffBefore = [];
        this._battleEffect = [];
        this._buffList = [];
        this._petsBuff = [];
        this._effectLaterShow = [];
        this._buffHistory = [];
        this._buffHistoryLeft = [];
        this._buffHistoryRight = [];
        this._roundBuff = [];
    }

    public deleteUsedBuff() {
        var newbuff = [];
        for (var i = 0; i < this._battleEffect.length; i++) {
            var data = this._battleEffect[i];
            if (!data.isShowed) {
                newbuff.push(clone2(data));
            }
        }
        this._battleEffect = null;
        this._battleEffect = newbuff;
    }

    public clearDelBuffBefore() {
        this._delBuffBefore = [];
    }

    public addHistoryBuff(data) {
        this._buffHistory.push(data);
    }

    public addAngerBuff(data) {
        this._angerBuff.push(data);
    }

    public addAddBuff(data) {
        this._addBuff.push(data);
    }

    public addPetsBuff(data) {
        this._petsBuff.push(data);
    }

    public addBuffEffect(data, stageID) {
        if (!this._buffEffect[stageID]) {
            this._buffEffect[stageID] = [];
        }
        this._buffEffect[stageID].push(data);
    }

    public addBattleEffect(data) {
        this._battleEffect.push(data);
    }

    public addDelBuffBefore(data) {
        this._delBuffBefore.push(data);
    }

    public addDelBuffMiddle(data) {
        this._delBuffMiddle.push(data);
    }

    public addDelBuff(data) {
        this._delBuff.push(data);
    }

    public getBuffListByStageId(stageId) {
        var buffList = [];
        for (let i = 0; i < this._buffList.length; i++) {
            var val = this._buffList[i];
            if (val.stageId == stageId) {
                buffList.push(val);
            }
        }

        return buffList;
    }

    public getBuffConfigIdByGlobalId(globalId) {
        var hasBuff = null;
        for (let i = 0; i < this._buffList.length; i++) {
            var val = this._buffList[i];
            if (globalId == val.globalId) {
                hasBuff = 1;
                return val.configId;
            }

        }
    }

    public getBuffConfigByGlobalId(globalId) {
        for (let i = 0; i < this._buffList.length; i++) {
            var val = this._buffList[i];
            if (globalId == val.globalId) {
                var configId = val.configId;
                var data = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(configId);
                return data;
            }
        }
    }

    private _checkBuffEffect(stageId) {
        if (!this._buffEffect[stageId] || this._buffEffect[stageId].length == 0) {
            this.checkDelBeforeNotAttack();
            return;
        }
        var unit = FightRunData.instance.getUnitById(stageId);
        unit.damage(this._buffEffect[stageId]);
    }

    public clearBuffEffect(stageId) {
        this._buffEffect[stageId] = [];
    }

    public checkDelBefore(stageId) {
        for (let i = this._delBuffBefore.length - 1; i >= 0; i--) {
            var val = this._delBuffBefore[i];
            if (val.stageId == stageId) {
                this.doBuffEndOp(val.buffEndOps);
                this.removeBuffByGlobalId(val.globalId);
                this._delBuffBefore.splice(i, 1);
            }
        }
    }

    private _checkDelBuffMiddle() {
        for (let i = this._delBuffMiddle.length - 1; i >= 0; i--) {
            var val = this._delBuffMiddle[i];
            this.doBuffEndOp(val.buffEndOps);
            this.removeBuffByGlobalId(val.globalId);
            this._delBuffMiddle.splice(i, 1);
        }
    }

    public checkDelBeforeNotAttack() {
        for (let i = this._delBuffBefore.length - 1; i >= 0; i--) {
            var val = this._delBuffBefore[i];
            this.doBuffEndOp(val.buffEndOps);
            this.removeBuffByGlobalId(val.globalId);
            this._delBuffBefore.splice(i, 1);
        }
    }

    private _checkAngerBuffNoShow() {
        for (let i = this._angerBuff.length - 1; i >= 0; i--) {
            var val = this._angerBuff[i];
            if (val.showType == 0) {
                var unit = FightRunData.instance.getUnitById(val.stageId);
                var sValue = val.value;
                if (val.type == 1) {
                    sValue = -val.value;
                }
                if (unit) {
                    unit.updateAnger(sValue);
                }
                this._angerBuff.splice(i, 1);
            }

        }
    }

    private _checkDelBuff() {
        for (let i = this._delBuff.length - 1; i >= 0; i--) {
            var val = this._delBuff[i];
            this.doBuffEndOp(val.buffEndOps);
            this.removeBuffByGlobalId(val.globalId);
        }
        this._delBuff = [];
    }

    private _BUFF_PRE_ATTACK(attackId) {
        this._checkBuffEffect(attackId);
    }

    private _BUFF_AFTER_SHOW() {
    }

    private _BUFF_DIE() {
    }

    private _BUFF_ATTACK(attackId) {
        this._checkAngerBuffNoShow();
        this._checkDelBuffMiddle();
    }

    private _BUFF_ATTACK_BACK() {
    }

    private _BUFF_HIT_BACK() {
    }

    private _BUFF_ATTACK_FINISHED() {
        this._checkDelBuff();
        this.clearDelBuffBefore();
    }

    private _BUFF_FIGHT_OPENING() {
    }

    private _checkBuffTime(buffData, effectTime, attackId, targetId: number[], isServer?, isNoAttack?) {
        if (buffData.isShowed) {
            return false;
        }
        if (isNoAttack) {
            return true;
        }
        if (effectTime == BuffManager.BUFF_FIGHT_OPENING) {
            var target = buffData.target;
            if (targetId == target) {
                return true;
            }
        }
        var showTime = null;
        if (isServer) {
            showTime = buffData.showTime;
        } else {
            showTime = buffData.buffConfig.buff_eff_time;
        }
        if (effectTime == BuffManager.BUFF_AFTER_SHOW) {
            effectTime = BuffManager.BUFF_PRE_ATTACK;
        }
        if (showTime != effectTime) {
            return false;
        }
        if (effectTime == BuffManager.BUFF_PRE_ATTACK || effectTime == BuffManager.BUFF_ATTACK_FINISHED || effectTime == BuffManager.BUFF_ATTACK) {
            if (buffData.attacker == attackId) {
                return true;
            }
        }
        else if (effectTime == BuffManager.BUFF_HIT_BACK) {
            if (buffData.attacker != attackId) {
                return false;
            }
            let targetList: any[] = buffData.targets;
            if (targetList.length == 0) {
                if (targetId && buffData.target == targetId[0]) {
                    return true;
                }
                var buffUnit = FightRunData.instance.getUnitById(buffData.target);
                if (buffUnit && buffUnit.to_alive) {
                    return true;
                }
                return false;
            }
            for (let i = 0; i < targetList.length; i++) {
                var v = targetList[i];
                if (targetId == v) {
                    var unit = FightRunData.instance.getUnitById(v);
                    if (unit && unit.attackIndex == buffData.attackIndex) {
                        targetList.splice(i, 1);
                        return true;
                    }
                }
            }
            return false;
        } else if (effectTime == BuffManager.BUFF_ATTACK_BACK) {
            if (buffData.attacker != attackId) {
                return false;
            }
            if (!targetId) {
                return true;
            }
            let targetList: any[] = buffData.atkTargets;
            if (targetList.length != targetId.length) {
                return false;
            }
            for (let i = 0; i < targetList.length; i++) {
                var id: number = targetList[i];
                for (let j = 0; j < targetId.length; j++) {
                    let v: number = targetId[j];
                    if (id == v) {
                        buffData.atkCheckCount = buffData.atkCheckCount + 1;
                        if (buffData.atkCheckCount == buffData.atkTotalCount) {
                            return true;
                        }
                    }

                }
            }
            return false;
        } else if (effectTime == BuffManager.BUFF_DIE) {
            if (buffData.attacker == attackId) {
                return true;
            }
            var targetList = buffData.atkTargets;
            for (let i = 0; i < targetList.length; i++) {
                let id = targetList[i];
                if (id == attackId) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    public _doAddBuffLater() {
        for (let i = this._addBuffLastShow.length - 1; i >= 0; i--) {
            var data = this._addBuffLastShow[i];
            var unit = FightRunData.instance.getUnitById(data.stageId);
            if (unit) {
                unit.getBuff(data);
                unit.buffPlay(data.configId);
                this._addBuffLastShow.splice(i, 1);
                // this._buffList.push(data);
            }
        }
        this._addBuffLastShow = [];
    }

    private _checkAddBuff(effectTime, attackId, targetId: number[], isNoSkill) {

        var isShowBuff = false;
        for (let i = this._addBuff.length - 1; i >= 0; i--) {
            var val = this._addBuff[i];
            isShowBuff = this._checkBuffTime(val, effectTime, attackId, targetId, true, isNoSkill);
            if (isShowBuff) {
                this._addBuffFunc(i, attackId);
            }
        }
        return isShowBuff;
    }

    private _addBuffFunc(i, attackId) {
        var data = this._addBuff[i];
        var unit = FightRunData.instance.getUnitById(data.stageId);
        var attackUnit = FightRunData.instance.getUnitById(data.attackId);
        if (unit) {
            var skillData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(data.skillId);
            if (attackId != data.attackId && skillData && skillData.talent != '' && attackUnit && attackUnit.to_alive) {
                this._addBuffLastShow.push(data);
                this._buffList.push(data);
                let playFeatureUnit = FightRunData.instance.getUnitById(data.attackId);
                if (playFeatureUnit) {
                    playFeatureUnit.playFeature(data.skillId, handler(this, this._doAddBuffLater));
                }
            } else {
                this._buffList.push(data);
                unit.buffPlay(data.configId);
                unit.getBuff(data);
                if (data.removeId != 0) {
                    this.removeBuffByGlobalId(data.removeId);
                }
            }
            this._addBuff.splice(i, 1);
        }
    }

    public checkPetsBuff() {
        var isShowBuff = false;
        for (let i = this._petsBuff.length - 1; i >= 0; i--) {
            var val = this._petsBuff[i];
            var data = this._petsBuff[i];
            var unit = FightRunData.instance.getUnitById(data.stageId);
            if (!unit) {
                this._petsBuff.splice(i, 1);
                return;
            } else {
                var damageInfo = null;
                if (data.damage.showValue != 0 || data.damage.protect != 0) {
                    damageInfo = data.damage;
                }
                unit.buffPlay(data.configId, damageInfo);
                if (unit.to_alive) {
                    unit.to_alive = data.isAlive;
                }
                this._petsBuff.splice(i, 1);
            }
        }
    }

    private _doBattleEffectList() {
        for (let i = this._effectLaterShow.length - 1; i >= 0; i--) {
            var data = this._effectLaterShow[i];
            var unit = FightRunData.instance.getUnitById(data.stageId);
            if (unit) {
                var damageInfo = null;
                if (data.damage.showValue != 0) {
                    damageInfo = data.damage;
                }
                if (unit.to_alive) {
                    unit.to_alive = data.isAlive;
                }
                unit.buffPlay(data.configId, damageInfo, false, data.dieIndex, FightRunData.instance.getAttackIndex());
                this.doBuffEndOp(data.buffEndOps);

                this._effectLaterShow.splice(i, 1);
            }
        }
        this._effectLaterShow = [];
    }

    public _checkBattleEffect(effectTime, attackId, targetId: number[]) {
        if (effectTime == BuffManager.BUFF_PRE_ATTACK) {
            return;
        }
        var isShowBuff = false;
        for (let i = this._battleEffect.length - 1; i >= 0; i--) {
            var val = this._battleEffect[i];
            if (!val.isShowed) {
                isShowBuff = this._checkBuffTime(val, effectTime, attackId, targetId);
                if (isShowBuff) {
                    this._doBattleEffectFunc(i, attackId);
                }
            }
        }
        return isShowBuff;
    }

    private _doBattleEffectFunc(i, attackId) {
        var data = this._battleEffect[i];
        if (data.isShowed) {
            return;
        }
        var unit = FightRunData.instance.getUnitById(data.stageId);
        if (!unit) {
            this._battleEffect.splice(i, 1);
            return;
        } else {
            data.isShowed = true;
            var damageInfo = null;
            if (data.damage.showValue != 0 || data.damage.protect != 0) {
                damageInfo = data.damage;
            }
            let skillData = null
            if (data.skillId != null) {
                skillData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(data.skillId);
            }
            if (attackId != data.attackId && skillData && skillData.talent != '') {
                // this._effectLaterShow.splice(data, 1);
                this._effectLaterShow.push(data);
                let playFeatureUnit = FightRunData.instance.getUnitById(data.attackId);
                if (playFeatureUnit) {
                    playFeatureUnit.playFeature(data.skillId, handler(this, this._doBattleEffectList))
                }
            } else {
                if (data.isAlive != null && unit.to_alive) {
                    unit.to_alive = data.isAlive;
                }
                unit.buffPlay(data.configId, damageInfo, false, data.dieIndex, FightRunData.instance.getAttackIndex());
                this.doBuffEndOp(data.buffEndOps);
            }
            // this._battleEffect.splice(i, 1);
        }
    }

    private _checkAngerBuffShow(effectTime, attackId, targetId: number[]) {
        var isShowBuff = false;
        for (let i = this._angerBuff.length - 1; i >= 0; i--) {
            var val = this._angerBuff[i];
            if (val.showType == 1) {
                isShowBuff = this._checkBuffTime(val, effectTime, attackId, targetId, true);
                if (isShowBuff) {
                    var data = this._angerBuff[i];
                    var unit = FightRunData.instance.getUnitById(data.stageId);
                    if (unit) {
                        var sValue = data.value;
                        var damage = {
                            type: data.type,
                            value: sValue,
                            showValue: sValue
                        };
                        unit.buffPlay(data.configId, damage, true);
                        if (data.type == 1) {
                            sValue = -sValue;
                        }
                        unit.updateAnger(sValue);
                        unit.playOnceBuff(data);
                        this._angerBuff.splice(i, 1);
                    }
                }
            }
        }
        return isShowBuff;
    }

    public checkPoint(effectTime: number, attackId?: number, targetId?: number[], isNoSkill?) {
        var isAddBuff = this._checkAddBuff(effectTime, attackId, targetId, isNoSkill);
        var isBattleBuff = this._checkBattleEffect(effectTime, attackId, targetId);
        var isAngerBuff = this._checkAngerBuffShow(effectTime, attackId, targetId);
        var funcName = null;
        for (const key in BuffManager) {
            var value = BuffManager[key];
            if (key.indexOf("BUFF_") > -1 && value == effectTime) {
                funcName = '_' + key;
            }
        }
        if (funcName) {
            let func: Function = this[funcName];
            func.apply(this, [attackId, targetId]);
        }
        return isAddBuff || isBattleBuff || isAngerBuff;
    }

    public getFinishBuffByStageId(stageId): any[] {
        var bufflist = [];
        for (let i = this._battleEffect.length - 1; i >= 0; i--) {
            var val = this._battleEffect[i];
            var buffData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(val.configId);
            if (buffData.buff_eff_time == BuffManager.BUFF_ATTACK_FINISHED && val.stageId == stageId) {
                var buff = {
                    stageId: val.stageId,
                    configId: val.configId,
                    //    type: val.type,
                    //    value: val.value,
                    damage: val.damage,
                    isAlive: val.isAlive
                };
                bufflist.push(buff);
                this._battleEffect.splice(i, 1);
            }
        }
        return bufflist;
    }

    public doBuffEndOp(endOps: any[]) {
        if (endOps && endOps.length != 0) {
            for (let i = 0; i < endOps.length; i++) {
                var v = endOps[i];
                var unit = FightRunData.instance.getUnitById(v.stageId);
                if (unit) {
                    if (unit.to_alive) {
                        unit.to_alive = v.isAlive;
                    }
                    unit.doBuffEndOp(v.type, v.damage);
                }
            }
        }
    }

    public removeBuffByGlobalId(globalId) {
        for (let i = this._buffList.length - 1; i >= 0; i--) {
            var val = this._buffList[i];
            if (val.globalId == globalId) {
                var unit = FightRunData.instance.getUnitById(val.stageId);
                if (unit && unit.is_alive) {
                    unit.deleteBuff(val);
                }
                this._buffList.splice(i, 1);
                break;
            }
        }
    }

    public clearAllBuff() {
        for (let i = this._buffList.length - 1; i >= 0; i--) {
            var val = this._buffList[i];
            var unit = FightRunData.instance.getUnitById(val.stageId);
            if (unit && unit.is_alive) {
                unit.deleteBuff(val);
            }
        }
        this._buffList = [];
    }

    public getBuffCount(stageId, configId) {
        var count = 0;
        for (let i = 0; i < this._buffList.length; i++) {
            var val = this._buffList[i];
            if (val.stageId == stageId && val.configId == configId) {
                count = count + 1;
            }
        }
        return count;
    }

    public checkNextHistoryBuff(buffTime) {
        this._historyIndex = this._historyIndex;
        var buff1 = null;
        var buff2 = null;
        if (this._buffHistoryLeft[buffTime]) {
            buff1 = this._buffHistoryLeft[buffTime][this._historyIndex];
        }
        if (this._buffHistoryRight[buffTime]) {
            buff1 = this._buffHistoryRight[buffTime][this._historyIndex];
        }
        if (!buff1 && buff2) {
            this._historyIndex = 0;
        }
        return [
            buff1,
            buff2
        ];
    }
    public checkHisBuff(buffTime, stageId?) {
        var buffs = null;
        if (this._buffHistoryLeft[buffTime]) {
            for (var _ in this._buffHistoryLeft[buffTime]) {
                var data = this._buffHistoryLeft[buffTime][_];
                if (!buffs) {
                    buffs = [];
                }
                buffs.push(data);
            }
        }
        if (this._buffHistoryRight[buffTime]) {
            for (_ in this._buffHistoryRight[buffTime]) {
                var data = this._buffHistoryRight[buffTime][_];
                if (!buffs) {
                    buffs = [];
                }
                buffs.push(data);
            }
        }
        if (stageId && buffs) {
            var newbuff = [];
            for (var i = 0; i < buffs.length; i++) {
                if (buffs[i].getStageId() == stageId) {
                    newbuff.push(clone2(buffs[i]));
                }
            }
            if (newbuff.length == 0) {
                buffs = null;
            } else {
                buffs = null;
                buffs = newbuff;
            }
        }
        return buffs;
    }
    public checkSelfCampBackHistory(camp) {
        var buffs = this._buffHistoryLeft[BuffManager.HIS_AFTER_HIT];
        var showBuff = null;
        if (camp == 2) {
            buffs = this._buffHistoryRight[BuffManager.HIS_AFTER_HIT];
        }
        if (!buffs) {
            return null;
        }
        for (var _ in buffs) {
            var data = buffs[_];
            if (!showBuff) {
                showBuff = [];
            }
           showBuff.push(data);
        }
        return showBuff;
    }
    public formatHistoryBuff(buffs) {
        this._historyIndex = 0;
        this._buffHistoryLeft = {};
        this._buffHistoryRight = {};
        for (var _ in buffs) {
            var data = buffs[_];
            var buff = clone2(data);
            if (buff.getCamp() == 1) {
                var time = buff.getBuffTime();
                if (!this._buffHistoryLeft[time]) {
                    this._buffHistoryLeft[time] = [];
                }
                this._buffHistoryLeft[time].push(buff);
            } else if (buff.getCamp() == 2) {
                var time = buff.getBuffTime();
                if (!this._buffHistoryRight[time]) {
                    this._buffHistoryRight[time] = [];
                }
                this._buffHistoryRight[time].push(buff);
            }
        }
    }

    public doHistoryBuffs() {
        // var isShowBuff = false;
        // for (let i = this._buffHistory.length - 1; i >= 0; i--) {
        //     var val = this._buffHistory[i];
        //     var data = this._buffHistory[i];
        //     var unit = FightRunData.instance.getUnitById(data.stageId);
        //     if (unit) {
        //         unit.buffPlay(data.configId);
        //         unit.playOnceBuff(data);
        //         if (data.removeId != 0) {
        //             this.removeBuffByGlobalId(data.removeId);
        //         }
        //         this._buffHistory.splice(i, 1);
        //     }
        // }
    }

    public checkRoundEndAnger(angers) {
        for (let i = 0; i < angers.length; i++) {
            var v = angers[i];
            var unit = FightRunData.instance.getUnitById(v.stageId);
            if (unit) {
                var sValue = v.value;
                var damage = {
                    type: v.type,
                    value: sValue,
                    showValue: sValue
                };
                unit.buffPlay(v.configId, damage, true);
                if (v.type == 1) {
                    sValue = -sValue;
                }
                unit.updateAnger(sValue);
                var config = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(v.configId);
                unit.playOnceBuff(v, config);
            }
        }
    }

    public addRoundBuff(buffs) {
        this._roundBuff = buffs;
    }
    public checkRoundBuff() {
        if (!this._roundBuff) {
            return;
        }
        for (var _ in this._roundBuff) {
            var data = this._roundBuff[_];
            var unit = this._engine.getUnitById(data.stageId);
            if (unit) {
                this._buffList.push(data);
                unit.buffPlay(data.configId);
                unit.getBuff(data);
                if (data.removeId != 0) {
                    this.removeBuffByGlobalId(data.removeId);
                }
            }
        }
        this._roundBuff = null;
    }

    public doPerCheck(stageId, buffs: any[]) {
        for (let i = buffs.length - 1; i >= 0; i--) {
            var data = buffs[i];
            var config = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(data.configId);
            if (config.special == 'jifei') {
                this.removeBuffByGlobalId(data.globalId);
                buffs.splice(i, 1);
            }
        }
    }

    public deleteEffectByStateId(stageId) {
        for (var i = this._battleEffect.length -1 ; i > 0; i += -1) {
            var data = this._battleEffect[i];
            if (data.target == stageId && !data.isShowed) {
                var damageInfo = null;
                if (data.damage.showValue != 0 || data.damage.protect != 0) {
                    damageInfo = data.damage;
                }
                var unit = this._engine.getUnitById(stageId);
                unit.buffPlay(data.configId, damageInfo, false, data.dieIndex);
                this._battleEffect[i].isShowed = true;
            }
        }
    }
}