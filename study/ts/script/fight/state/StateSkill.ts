import Entity from "../unit/Entity";
import { StateFlash } from "./StateFlash";
import { FightConfig } from "../FightConfig";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";
import UnitHero from "../unit/UnitHero";
import { Path } from "../../utils/Path";
import { FightRunData } from "../FightRunData";
import Projectile from "../scene/Projectile";
import BuffManager from "../BuffManager";

export class StateSkill extends StateFlash {
    private searchType: number[][][] =
        [
            [],
            [
                [1, 2, 3],
                [4, 5, 6]
            ],
            [
                [1, 4],
                [2, 5],
                [3, 6]
            ],
            [],
            [
                [1, 0, 4, 2],
                [2, 1, 5, 3],
                [3, 2, 6, 0],
                [4, 0, 0, 5],
                [5, 4, 0, 6],
                [6, 5, 0, 0]
            ]

        ]

    private skillPlay;
    private skillInfo;
    private targets;
    private selfHitInfo;
    private hitCount;
    private projectiles: Projectile[];
    private hitType: string;
    private wait: boolean;
    private firstProjectilOver: boolean;
    private projectBuffPlay: boolean;
    private isProjectile: boolean;

    constructor(entity: Entity, skillPlay, targets, skillInfo) {
        super(entity);
        this.cName = "StateSkill";
        this.skillPlay = skillPlay;
        this.skillInfo = skillInfo;

        let aniId: number = this.skillPlay.atk_action;
        let ani = Path.getAttackerAction(aniId.toString());
        this.setAction(ani);

        this.targets = targets;
        this.selfHitInfo = null;

        this.hitCount = 0;
        this.targets.list.forEach(v => {
            if (v.unit.stageID == this.entity.stageID) {
                this.selfHitInfo = v.info;
            }
        });

        this.projectiles = [];
        this.hitType = null;
        this.wait = false;
        this.projectBuffPlay = false;

        if (this.projectileCount != 0) {
            this.targets.list.forEach(v => {
                v.unit.projectileCount = this.projectileCount;
            });
        }
        this.bShowName = false;
    }

    //
    public start() {
        super.start()

        BuffManager.getBuffManager().checkDelBeforeNotAttack();
        if (!this.entity.isPet) {
            (this.entity as UnitHero).setBuffEffectVisible(false)
        }
        this.entity.setTowards(this.entity.camp)
        this.entity.updateShadow = false;
        let skill_type = this.skillInfo.skill_type;
        if (skill_type == 2) {
            this.entity.setZOrderFix(FightConfig.ZORDER_SKILL_UNIT)
            this.targets.list.forEach(v => {
                v.unit.setZOrderFix(FightConfig.ZORDER_SKILL_UNIT);
            });
            let sceneView = FightRunData.instance.getView()
            sceneView.showSkill2Layer(true)
        }
        FightRunData.instance.getScene().startFlashViewport(this.skillPlay.atk_action, this.entity.camp)
    }

    public update(f: number) {
        if (this.wait == false) {
            super.update(f)
        }

        if (this.hitType == "projectile") {
            let isProjectileOver = true

            for (let i = 0; i < this.projectiles.length; i++) {
                if (!this.projectiles[i].isRemove()) {
                    isProjectileOver = false;
                }
                else {
                    this.firstProjectilOver = true;
                }

            }

            if (isProjectileOver && this.frame >= this.flashData.frameCount) {
                super.onFinish()
            }

            if (this.firstProjectilOver && !this.projectBuffPlay) {

                BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_ATTACK, this.entity.stageID)
                this.projectBuffPlay = true
            }
        }
    }

    //
    public onHitEvent(hitType: string, value1: string, value2: string, value3: string) {
        this.hitType = hitType
        //attack, 3, "",""
        if (hitType == "attack") {

            let buffManager = BuffManager.getBuffManager()
            if (!this.entity.isPet) {
                buffManager.checkPoint(BuffManager.BUFF_ATTACK, this.entity.stageID)
            }
            else {
                buffManager.checkPoint(BuffManager.BUFF_ATTACK, this.entity.camp)
            }

            let atk_type = this.skillPlay.atk_type;
            if (atk_type == 1) { //1单体
                this.targets.list.forEach(v => {
                    this.doHitPlay(v, this.skillPlay, v.info)
                });
            }
            else {
                let search: string[] = value1.split("_");
                if (search[0] == "0") { // 全体

                    this.targets.list.forEach(v => {
                        this.doHitPlay(v, this.skillPlay, v.info)
                    });

                }
                else {
                    if (atk_type == 4) { // 4全体

                        for (let i = 0; i < search.length; i++) {
                            let target = this.targets.cell[parseInt(search[i])]
                            if (target) {
                                this.doHitPlay(target, this.skillPlay, target.info)
                            }
                        }
                    }
                    else if (atk_type == 5) { //相邻
                        let stype = this.searchType[atk_type - 1];
                        if (stype) {
                            let cells = stype[this.targets.MainCellIdx - 1] //第一个人是主受击者,找出他的位置
                            for (let i = 0; i < search.length; i++) {
                                let cell = cells[parseInt(search[i]) - 1]
                                let target = this.targets.cell[cell];
                                if (target) {
                                    this.doHitPlay(target, this.skillPlay, target.info, parseInt(search[i]))
                                }
                            }

                        }
                    }
                    else { // 2列，3排
                        let stype = this.searchType[atk_type - 1]
                        if (stype) {
                            for (let i = 0; i < search.length; i++) {

                                let cells = stype[parseInt(search[i]) - 1]
                                for (let i = 0; i < cells.length; i++) {
                                    let target = this.targets.cell[cells[i]]
                                    if (target) {
                                        this.doHitPlay(target, this.skillPlay, target.info)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else if (hitType == "projectile") {
            let f = this.entity.camp == FightConfig.campLeft ? 1 : - 1
            let startP = new cc.Vec2(this.entity.getPosition()[0], this.entity.getPosition()[1])
                .add(new cc.Vec2(parseInt(value2) * f, -value3));
            this.targets.list.forEach(v => {
                let endP = new cc.Vec2(v.unit.getPosition()[0], this.entity.getPosition()[1])
                    .add(new cc.Vec2(0, 50));
                let projectile =
                    FightRunData.instance.getScene().createProjectile(this.skillPlay, [v], startP, endP, this.entity.stageID)
                this.projectiles.push(projectile);
            });

        }
    }

    //
    public doHitPlay(target, skillPlay, info, hitCount?) { //hitcount,相邻时第几个受击
        if (target && target.unit.stageID != this.entity.stageID) {
            let stageId = this.entity.stageID
            if (this.entity.isPet) {
                stageId = this.entity.camp
            }
            (target.unit as UnitHero).hitPlay(skillPlay, info, hitCount, null, stageId)
            // print("1112233 target = ", target.unit.stageID)
        }
    }

    //
    public onDamageEvent(value1: string, value2: string) {
        if (!this.selfHitInfo) { //如果没有自己受伤信息，不执行该函数
            return
        }

        // 伤害
        let count = parseInt(this.flashData.damage) //受击次数
        let c: number = parseInt(value1) //当次受击所占的比重
        let p = c / count //每次手机所占百分比
        if (this.isProjectile) { //如果是弹道攻击的话，平分100
            p = c / 100
        }

        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_FIGHT_ADD_HURT, p, this.entity.stageID); //伤害百分比分配出去

        let damageInfo = this.selfHitInfo.damage
        if (!damageInfo.type) {
            return
        }
        var damageType = damageInfo.type;
        var singleValue = Math.ceil(damageInfo.showValue * p);
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
        
        if (damageType != 0) {
            (this.entity as UnitHero).doHurt(damageType, realDamage, singleValue, this.selfHitInfo.hurts, realProtect);
            if (!this.isProjectile) {
                this.entity.is_alive = this.entity.to_alive
            }
            this.hitCount = this.hitCount + 1
            if (this.hitCount == 1) {
                BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_ATTACK, null)
            }
            let type = 0
            if (damageType == 1) {
                type = -1
            }
            else if (damageType == 2) {
                type = 1
            }
            let v = type * singleValue
            if (v != 0) {

                FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_HURT_VALUE, type * singleValue);
            }
        }
        // 死亡
        if (value2 == "dying") {
            if (!this.entity.is_alive) {
                this.onFinish()
                this.entity.dying()
            }
        }
    }

    //
    public onFinish() {
        if (this.hitType == "projectile") {
            this.entity.setAction("idle", true)
            this.wait = true
        }
        else {
            super.onFinish()
        }
        if (!this.entity.isPet) {
            this.entity.updateHpShadow(true);
            (this.entity as UnitHero).setBuffEffectVisible(true);
        }
        else {
            this.entity.checkShow()
        }

        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_ATTACK_FINISH);

        if (this.selfHitInfo) {

            FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_FIGHT_ADD_HURT, this.entity.stageID);
            BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_HIT_BACK, this.entity.stageID, [this.entity.stageID])
        }
        if (!this.entity.to_alive) {
            BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_ATTACK_BACK, this.entity.stageID)
        }
    }
}