import { Unit, Award } from "../report/WaveData";
import { FightConfig } from "../FightConfig";
import Entity from "./Entity";
import { StateMove } from "../state/StateMove";
import { StateGoldShow } from "../state/StateGoldShow";
import { StateWait } from "../state/StateWait";
import { StateIdle } from "../state/StateIdle";
import { StateShow } from "../state/StateShow";
import { StateBuff } from "../state/StateBuff";
import { StateSkill } from "../state/StateSkill";
import { StateHit } from "../state/StateHit";
import { State } from "../state/State";
import { StateDamage } from "../state/StateDamage";
import { StateAttackFinish } from "../state/StateAttackFinish";
import { StateDying } from "../state/StateDying";
import { StateWin } from "../state/StateWin";
import { Path } from "../../utils/Path";
import { G_ConfigLoader, G_AudioManager } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import Actor from "../views/Actor";
import { FightResourceManager } from "../FightResourceManager";
import { HeroConst } from "../../const/HeroConst";
import BillBoard from "../views/BillBoard";
import ShadowActor from "../views/ShadowActor";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";
import { handler } from "../../utils/handler";
import BuffManager from "../BuffManager";
import { StateDamageWait } from "../state/StateDamageWait";
import { StateAction } from "../state/StateAction";
import HitTipView from "../views/HitTipView";
import { StateOut } from "../state/StateOut";
import { StateOpneShow } from "../state/StateOpenShow";
import { FightRunData } from "../FightRunData";
import { BattleHelper } from "../BattleHelper";
import { StateHistoryShow } from "../state/StateHistoryShow";
const { ccclass, property } = cc._decorator;

@ccclass
export default class UnitHero extends Entity {

    public totalDamage: number;
    public calcDamage: boolean;

    private _data: Unit;

    private isLeader: boolean;

    private maxHp: number;
    public hp: number;
    private anger: number;
    private rankLevel: number;
    private showHp: number;
    public monsterId: number;
    private limitLevel: number;
    private showMark: number[];

    public attackIndex = 0;
    private attackId: number;

    private _finalDie: boolean;
    private _isJump: boolean;

    public dropAward: Award[] = null

    private _positionIdle: number[];
    private _positionEnter: number[];

    private _heroInfo: any;
    private _monsterInfo: any;
    private _resInfo: any;

    private _showBuff: any;

    private _isTalking: boolean;
    private _talkTime: number;

    private _beHit: boolean;
    private _istransparent: boolean;

    private _enterCallback: Function;

    private _hitTipView: HitTipView;
    limitRedLevel: any;
    protect: any;

    public isPlayer(): boolean {
        return this.isLeader;
    }

    public isFinalDie(): boolean {
        return this._finalDie;
    }

    public init(data: Unit, enterCallback?: Function) {
        super.init(data);
        this._data = data;

        this.isLeader = data.isLeader //是否是主角
        this.stageID = data.stageId //唯一id
        this.configId = data.configId //表id
        this.camp = data.camp //队伍
        this.cell = data.cell //坐标
        this.maxHp = data.maxHp //最大血量
        this.hp = data.hp //血量
        this.anger = data.anger //怒气
        this.rankLevel = data.rankLevel //突破等级
        this.showHp = data.hp //展示血量
        this.monsterId = data.monsterId //怪物表id
        this.is_alive = true //是否死亡
        this.to_alive = true //本轮次结束后是否死亡
        this.limitLevel = data.limitLevel //界限突破等级
        this.limitRedLevel = data.limitRedLevel; //红升金界限突破
        this.showMark = data.showMark //开局展示的图标
        this.protect = data.protect || 0; //开局的保护盾

        this.attackIndex = 0 //攻击轮次

        this._finalDie = true //跳过战斗的时候是否死亡
        this._isJump = false //是否是最后展示win状态

        this.dropAward = null //掉落物品
        this.startMove = false;
        //
        this.states = [] //状态堆栈
        this._positionIdle = FightConfig.cells[this.camp - 1][this.cell - 1] //战斗位置
        this._positionEnter = FightConfig.cells[this.camp - 1][this.cell + 5] //进场位置

        this._heroInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(this._data.configId);
        if (this.limitRedLevel && this.limitRedLevel >= HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL) {
            this._resInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(this._heroInfo.limit_red_res_id);
        } else if (this.limitLevel && this.limitLevel >= HeroConst.HERO_LIMIT_RED_MAX_LEVEL) {
            this._resInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(this._heroInfo.limit_res_id);
        } else {
            this._resInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(this._heroInfo.res_id);
        }


        // 怪物信息
        this._monsterInfo = null;
        if (this.monsterId != 0) {
            this._monsterInfo = G_ConfigLoader.getConfig(ConfigNameConst.MONSTER).get(this.monsterId);
        }

        this.buffList = [];

        this.country = this._heroInfo.country;//阵营

        this._beHit = false;

        this._enterCallback = enterCallback;

        this.setPosition(this._positionEnter[0], this._positionEnter[1]);
        this.idle();

        this.enterStage = true; // 进入场地，开始战斗update

        this._showBuff = {};

        this._isTalking = false;
        this._talkTime = 0;

        this._istransparent = false;
    }

    public frameUpdate(f: number) {
        super.frameUpdate(f);
        this.billBoard.node.zIndex = this.actor.node.zIndex + 1;
        if (this.updateShadow) {
            this.shadow.updatePos(this.actor.node.position);
        }
        this.shadow.node.zIndex = -Math.round(this._positionFrame[1]) - 1;
    }

    public logicUpdate(f: number) {
        super.logicUpdate(f);
        (this.billBoard as BillBoard).setUpdate(f);
        this._updateTalk(f);
        if (this.states.length == 0) {
            if (!this.is_alive) {
                BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_HIT_BACK, this.attackId, [this.stageID]);
                // TODO:addDieDrop
                this.remove();
                this._beHit = false;
            }
            else if (!this.isSandby()) {
                let moveState = new StateMove(this, StateMove.TYPE_MOVE, "run", 12,
                    new cc.Vec2(this._positionIdle[0], this._positionIdle[1]), StateMove.BACK_HIT);

                var stateHistoryShow = new StateHistoryShow(this, BuffManager.HIS_AFTER_HIT, true);
                this.addState(stateHistoryShow);
                this.setState(moveState);
                let stateBuff = new StateBuff(this, BuffManager.BUFF_HIT_BACK, this.attackId, [this.stageID]);
                this.addState(stateBuff)
                this._beHit = false;
            }
            else {
                if (this._isJump) {
                    if (!this.isSandby()) {
                        let moveState = new StateMove(this, StateMove.TYPE_MOVE, "run", 12,
                            new cc.Vec2(this._positionIdle[0], this._positionIdle[1]), StateMove.BACK_HIT);
                        this.setState(moveState);
                    }
                    this._isJump = false;
                }
                else {
                    if (this._beHit) {
                        var stateHistoryShow = new StateHistoryShow(this, BuffManager.HIS_AFTER_HIT, true);
                        this.setState(stateHistoryShow);
                        BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_HIT_BACK, this.attackId, [this.stageID]);
                        this._beHit = false;
                    }
                    if (this.states.length == 0) {
                        this.idle();
                    }
                }
            }
        }

    }

    public setReborn() {
        this.actor.node.active = true;
        this.setPosition(this._positionIdle[0], this._positionIdle[1]);
        this.setTowards(this.camp);
        this._showRebornEffect();
    }

    private _showRebornEffect() {
        this._hitTipView.popup(0, FightConfig.BUFF_REBORN_ID, "buff_damage",
            cc.v2(this._positionIdle[0], this._positionIdle[1]));
        this.actor.doOnceEffect(FightConfig.REBOEN_EFFECT);
    }

    public createActor() {

        // console.log("createActor:", this.configId, this.camp);

        let spineId: number = this._resInfo.fight_res;
        this.actor = new cc.Node(spineId.toString()).addComponent(Actor);
        this.actor.init(spineId, this.camp == FightConfig.campLeft ? 1 : -1);
        this.node.addChild(this.actor.node);
        this.actor.node.setPosition(this.position[0], this.position[1]);
    }

    public createBillBoard(leftName, leftOfficerLevel, rightName, rightOfficerLevel) {
        var name = this._heroInfo.name;
        var officerLevel = null;
        var rankLevel = this.rankLevel;
        if (this._monsterInfo) {
            name = this._monsterInfo.name;
        }
        if (this.isLeader) {
            if (this.camp == 1) {
                name = leftName;
                officerLevel = leftOfficerLevel;
            } else {
                name = rightName;
                officerLevel = rightOfficerLevel;
            }
        }
        var color = this._heroInfo.color;
        var trueColor = color;
        if (this._monsterInfo) {
            trueColor = color = this._monsterInfo.color;
        } else {
            if (this.limitRedLevel && this.limitRedLevel >= HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL) {
                color = 7;
            } else if (this.limitLevel && this.limitLevel >= HeroConst.HERO_LIMIT_MAX_LEVEL) {
                color = this._heroInfo.color + 1;
            }
        }
        this.billBoard = new cc.Node("_billBoard").addComponent(BillBoard);
        this.node.addChild(this.billBoard.node);
        let officalInfoName = "";
        if (officerLevel && officerLevel != 0 && this.isLeader) {
            officalInfoName = G_ConfigLoader.getConfig(ConfigNameConst.OFFICIAL_RANK).get(officerLevel).name
        }
        this.billBoard.init(name, color, rankLevel, this.isLeader,
            officerLevel, officalInfoName,
            this.showMark, this.camp, this.maxHp, trueColor);
        this.billBoard.updateAnger(this.anger);
        this.billBoard.node.active = false;
        if (this.actor) {
            this.billBoard.node.zIndex = this.actor.node.zIndex + 1;
        }
        this.updateHP();
        this.billBoard.updateHpShadow();
        this.billBoard.node.setPosition(this._positionIdle[0], this._positionIdle[1] + 185 * FightConfig.getScale(this._positionIdle[1]));

        return this.billBoard;
    }

    public createShadow() {
        let needAnim = false;
        if (this.isLeader) {
            let HeroConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(this.configId);
            if (HeroConfig.type != 1) {
                needAnim = true;
            }
        }
        this.shadow = new cc.Node("shadow").addComponent(ShadowActor);
        this.node.addChild(this.shadow.node);
        this.shadow.init(needAnim);
        this.shadow.node.setPosition(this._positionEnter[0], this._positionEnter[1]);
    }
    //每一个角色都创建一个提示层，这个层用于播放提示信息，血量加多少，攻击多少，加成多少等
    public createHitTipView() {
        this._hitTipView = new cc.Node("hitTipView-" + this.configId).addComponent(HitTipView);
        this._hitTipView.init();
        this._hitTipView.node.setPosition(0, 0);
        // this._hitTipView.node.zIndex = this.actor.node.zIndex + 2;
        // this.node.addChild(this._hitTipView.node);
    }

    public getHitTipView(): cc.Node {
        return this._hitTipView.node;
    }

    public xingcaiIn() {
        let cells = FightConfig.cells[FightConfig.campRight - 1] //	星彩放到右边
        this.setPosition(cells[this.cell + 5][0], cells[this.cell + 5][1]);
        this.clearState()
        this.actor.node.active = (true)
        let f = FightConfig.rows[this.getRow() - 1];
        let move = new StateMove(this, StateMove.TYPE_MOVE, "run",
            FightConfig.speed * f, cc.v2(this._positionIdle[0], this._positionIdle[1]));
        this.setState(move)
        let wait = new StateWait(this, StateWait.WAIT_NEW_UNIT, "win", this._enterCallback, FightConfig.XINGCAI_WAIT_TIME)
        this.addState(wait)
    }

    public enterFightStage() {

        this.setPosition(this._positionEnter[0], this._positionEnter[1]);

        if (this.enterStage) {
            let f = FightConfig.rows[this.getRow() - 1];
            let stateMove: StateMove = new StateMove(this, StateMove.TYPE_MOVE, "run",
                FightConfig.speed * f, new cc.Vec2(this._positionIdle[0], this._positionIdle[1]),
                StateMove.ENTER_STAGE);
            this.setState(stateMove);
            let showTime = this._resInfo.hero_ani_time / 1000;
            if (showTime != 0) {
                this.setVisible(false);
                this.showShadow(false);
                let stateGoldShow = new StateGoldShow(this, showTime)
                this.addState(stateGoldShow);
            }
            else {
                this.setVisible(true);
            }

            let wait: StateWait = new StateWait(this, StateWait.WAIT_START);
            this.addState(wait);
        }
        else {
            let wait: StateWait = new StateWait(this, StateWait.WAIT_ENTER_STAGE);
            this.setState(wait);
        }
    }

    public jumpIntoStage() {
        this.actor.node.active = true;
        if (this.needOpenShow) {
            this._openShow();
            return;
        }
        let f = FightConfig.rows[this.getRow() - 1];
        let move =
            new StateMove(
                this,
                StateMove.TYPE_BEZIER,
                "moveahead",
                FightConfig.jumpSpeed * f,
                cc.v2(this._positionIdle[0], this._positionIdle[1])
            )
        this.setState(move)
        let wait =
            new StateWait(this, StateWait.WAIT_START, "idle", handler(this, this._jumpEnd), FightConfig.JUMP_IN_WAIT_TIME)
        this.addState(wait)
    }

    private _openShow() {
        this.setTowards(this.camp);
        let stateOpenShow = new StateOpneShow(this, cc.v2(this._positionIdle[0], this._positionIdle[1]), 0);
        this.setState(stateOpenShow);
        let wait = new StateWait(this, StateWait.WAIT_START, "idle", handler(this, this._jumpEnd));
        this.addState(wait);
    }

    private _jumpEnd() {
        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_JUMP_TALK, this.configId);
        this.signalStartCG.dispatch("enterStage");
    }

    public getAddHurtEnd() {
        if (!this.to_alive) {
            this.is_alive = false;
            if (this.getState() == "StateIdle") {
                this.clearState();
                this.dying();
            }
            return;
        }
        this.updateHpShadow(true);
    }

    public playStartBuff() {
        let stateBuff = new StateBuff(this, 6, this.stageID);
        this.setState(stateBuff);
    }

    public skill(skillInfo, targets, unitPartner: UnitHero) {
        if (unitPartner != null) {
            // console.log("skill partner:", this.stageID, unitPartner.stageID);
        }
        this.partner = unitPartner;
        if (this.getState() == "StateIdle") {
            this.clearState();
        }

        // 根据skillinfo判断是否实行本次攻击
        BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_PRE_ATTACK, this.stageID);
        this.hasSkill = true;
        if (skillInfo == null) {
            if (this.states.length == 0) {
                this.signalStateFinish.dispatch("StateAttackFinish", this.stageID);
            }
            this.hasSkill = false;
            BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_ATTACK_BACK, this.stageID, null, true);
            BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_HIT_BACK, this.stageID, null, true);
            // if (this.to_alive) {
            //     BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_HIT_BACK, this.stageID, null, true);
            // }
            if (!this.to_alive) {
                this.dying();
                this.is_alive = this.to_alive;
                return;
            }
            return;
        }

        var stateHistoryShow = new StateHistoryShow(this, BuffManager.HIS_BEFORE_ATK);
        this.addState(stateHistoryShow);

        let skillShowId: number = skillInfo.skill_show_id;
        var selfSkillId;
        if (targets.list.length == 1 && targets.list[0].unit.stageID == this.stageID) {
            selfSkillId = skillShowId - skillShowId % 10 + 9;       //如果是加血并且只加自己,去掉id最后的数值，改成9
        }
        let skillPlay = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_PLAY).get(skillShowId);
        if (selfSkillId && G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_PLAY).get(selfSkillId)) {
            var selfSkillPlay = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_PLAY).get(selfSkillId);
            skillPlay = selfSkillPlay;
        }

        //把技能位置先算出来
        let start_location_type = skillPlay.start_location_type;

        let posX: number = skillPlay.x;
        let posY: number = skillPlay.y;
        let prePosition = this.getAttackPosition(start_location_type, new cc.Vec2(posX, posY), targets);

        // 加入展示环节,如果是合击的话，把需要移动位置放进去，给副将移动提供基准
        let skillType: number = skillInfo.skill_type;
        if (skillType == 2 || skillType == 3) {
            let show = new StateShow(this, skillPlay, skillType, prePosition)
            this.addState(show)
        }

        let buff = new StateBuff(this, 5, this.stageID)
        this.addState(buff)

        if (skillType == 3) {
            let waitFlash = new StateWait(this, StateWait.WAIT_COMBINE_FLASH)
            this.addState(waitFlash)
        }

        if (prePosition) {
            prePosition.y = prePosition.y - 2 //如果打后排的话。。由于前排位置有 - 1，所以要 - 2
            let cameraTargetPos: cc.Vec2 = null
            let cameraLocalType: number = skillPlay.camera_location_type;
            if (cameraLocalType != 0) {
                let camera_x: number = skillPlay.camera_x;
                let camera_y: number = skillPlay.camera_y;
                cameraTargetPos =
                    this.getAttackPosition(
                        cameraLocalType,
                        new cc.Vec2(camera_x, camera_y + FightConfig.GAME_GROUND_FIX),
                        targets
                    )
            }
            let atk_pre_type = skillPlay.atk_pre_type;
            let atk_pre_action = skillPlay.atk_pre_action;
            let atk_pre_speed = skillPlay.atk_pre_speed;
            let move =
                new StateMove(
                    this,
                    atk_pre_type,
                    atk_pre_action,
                    atk_pre_speed,
                    prePosition,
                    null,
                    cameraTargetPos
                )
            this.addState(move)
        }

        //合击技能情况处理
        if (skillType == 3) {
            //移动到位后等待
            let wait = new StateWait(this, StateWait.WAIT_COMBINE_SKILL)
            this.addState(wait)
        }

        //技能释放
        let skill = new StateSkill(this, skillPlay, targets, skillInfo)
        this.addState(skill)

        //攻击完成后结算
        let finishBuff = BuffManager.getBuffManager().getFinishBuffByStageId(this.stageID);
        this.addAttackFinish(finishBuff)


        //攻击后回位
        if (prePosition) {  //&& this.to_alive
            let cameraTargetPos = null;
            let camera_location_type = skillPlay.camera_location_type;
            if (camera_location_type != 0) {
                cameraTargetPos = new cc.Vec2(0, 0)
            }
            let atk_follow_type = skillPlay.atk_follow_type;
            let atk_follow_action = skillPlay.atk_follow_action;
            let atk_follow_speed = skillPlay.atk_follow_speed;
            let move =
                new StateMove(
                    this,
                    atk_follow_type,
                    atk_follow_action,
                    atk_follow_speed,
                    new cc.Vec2(this._positionIdle[0], this._positionIdle[1]),
                    StateMove.BACK_ATTACK,
                    cameraTargetPos
                )
            this.addState(move)
        }

        let targetIds: number[] = [];

        targets.list.forEach(v => {
            targetIds.push(v.unit.stageID);
        });
        let stateBuff = new StateBuff(this, 2, this.stageID, targetIds)
        this.addState(stateBuff)
    }

    public startCombineVice(skillPlay, prePosition: cc.Vec2) {
        //副将展示合击
        let show = new StateShow(this, null, 3, null)
        this.setState(show)

        //副将等待flash展示
        let waitFlash = new StateWait(this, StateWait.WAIT_COMBINE_FLASH)
        this.addState(waitFlash)

        //副将移动
        let factor: number = this.camp == FightConfig.campLeft ? 1 : - 1
        let x_2: number = skillPlay.x_2;
        let y_2: number = skillPlay.y_2;
        let prePositionVice: cc.Vec2 = prePosition.add(new cc.Vec2(x_2 * factor, y_2))
        let atk_pre_type_2 = skillPlay.atk_pre_type_2;
        let atk_pre_action_2 = skillPlay.atk_pre_action_2;
        let atk_pre_speed_2 = skillPlay.atk_pre_speed_2;
        let move =
            new StateMove(
                this,
                atk_pre_type_2,
                atk_pre_action_2,
                atk_pre_speed_2,
                prePositionVice,
                null
            )
        this.addState(move)

        //副将移动到位等待
        let waitCombine = new StateWait(this, StateWait.WAIT_COMBINE_SKILL)
        this.addState(waitCombine)

        //副将攻击后回位
        let atk_follow_type_2 = skillPlay.atk_follow_type_2;
        let atk_follow_action_2 = skillPlay.atk_follow_action_2;
        let atk_follow_speed_2 = skillPlay.atk_follow_speed_2;
        let moveBack =
            new StateMove(
                this,
                atk_follow_type_2,
                atk_follow_action_2,
                atk_follow_speed_2,
                new cc.Vec2(this._positionIdle[0], this._positionIdle[1]),
                null
            )
        this.addState(moveBack)
    }

    public setFinalData(data) {
        this._data = data;
        this.stageID = data.stageId;
        this.maxHp = data.maxHp;
        this.hp = data.hp;
        this.anger = data.anger;
        this.showHp = data.hp;
        this._finalDie = false;
        this.protect = data.protect;
    }

    public doFinal() {
        //人物出现
        this.showShadow(true);
        //首先回原位待机
        this.setRotation(0)
        this.setPosition(this._positionIdle[0], this._positionIdle[1])
        this.setHeight(0)
        this.setScale(1, 1)
        if (this._finalDie) {
            this.updateHP()
            this.updateHpShadow()
            this.clearState()
            this.is_alive = false
            this.dying()
        }
        else {
            this.actor.stopEffect()
            this.updateHP()
            this.updateHpShadow()
            this.updateAnger()
            this.clearState()
            this._isJump = true
        }
        this.fade(true)
    }

    public fade(isIn: boolean) {
        this.actor.playFade(isIn, this._istransparent)
        if (isIn) {
            this.inCombineWatcher = false;
            this.showBillBoard(true);
            this.showShadow(true);
        }
        else {
            this.showBillBoard(false);
            this.showShadow(false);
        }
    }

    public runMap() {
        var targetCamp = 2;
        var cell = this.stageID % 100;
        var targetCell = cell + 3;
        if (targetCell > 6) {
            targetCell = targetCell - 6;
        }
        var targetPos = FightConfig.cells[targetCamp - 1][targetCell + 5];
        var f = FightConfig.rows[this.getRow() - 1];
        var runFix = 2;
        var move = new StateMove(
            this,
            StateMove.TYPE_MOVE,
            'run',
            FightConfig.speed * f * runFix,
            cc.v2(targetPos[0] + 20, targetPos[1]));
        this.setState(move);
        var wait = new StateWait(this, StateWait.WAIT_SECOND_WAVE);
        this.addState(wait);
    }

    public buffPlay(buffId, damage?, isAngerBuff?, dieIndex?, attackIndex?, sound?, isBuffEffect?) {
        if (!this.is_alive && !isBuffEffect) {
            return;
        }
        var config = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(buffId);
        if (config.buff_res != '') {
            if (this.actor) {
                this.actor.doOnceEffect(config.buff_res);
            }
        }
        if (damage) { //&& damage.showValue && damage.value
            var type = 'buff_damage';
            if (isAngerBuff) {
                type = 'anger_buff';
            }
            var damageType = 0;
            if (damage.type == 1) {
                damageType = -1;
            } else if (damage.type == 2) {
                damageType = 1;
            }
            var value = damageType * damage.value;
            var showValue = damageType * damage.showValue;
            this._hitTipView.popup(showValue, buffId, type, cc.v2(this._positionFrame[0], this._positionFrame[1]));
            if (type == 'buff_damage') {
                var [hpValue, protectValue] = BattleHelper.parseDamage(damage);
                this.updateHP(hpValue, protectValue);
                this.updateHpShadow(true);
            }
            if (!this.to_alive && dieIndex) { //&& dieIndex <= attackIndex
                this.setDieState();
                this.is_alive = false;
            }
        } else {
            if (this._hitTipView) {
                this._hitTipView.popup(null, buffId, 'buff', cc.v2(this._positionFrame[0], this._positionFrame[1]));
            }
        }
        if (sound) {
            G_AudioManager.playSound(Path.getFightSound(sound), FightRunData.instance.getBattleSpeed());
        }
    }

    public playOnceBuff(buff, config?) {
        let buffConfig = config;
        if (config == null) {
            buffConfig = buff.buffConfig;
        }
        if (this.actor) {
            this.actor.doOnceBuff(buffConfig.buff_res, buffConfig.buff_pos);
        }
    }

    public deleteBuff(buff) {
        for (let i = 0; i < this.buffList.length; i++) {
            if (this.buffList[i].globalId == buff.globalId) {
                this.buffList.splice(i, 1);
                if (buff.buffConfig.special == 'jifei') {
                    this.clearState();
                }
                break;
            }
        }
        this._updateBuffBoard();
        this._updateDeleteShowBuff(buff);
        if (this.getState() == 'StateIdle') {
            this._refreshAction();
        }
    }

    public doBuffEndOp(type, damage) {
        var buffConfig = FightConfig.REMOVE_BUFF_TYPE[type - 1];
        if (buffConfig.name == 'addHp' || buffConfig.name == 'DecHp') {
            damage.type = buffConfig.addType;
            damage.pType = damage.type;
            var hurtInfo = {};
            this._doEndHpEffect(damage, hurtInfo);
        } else if (buffConfig.name == 'removeAnger' || buffConfig.name == 'addAnger') {
            damage.type = buffConfig.addType;
            var configId = buffConfig.configId;
            this.buffPlay(configId, damage, true);
            this.actor.doOnceBuff(buffConfig.buffRes);
            var sValue = damage.showValue;
            if (damage.type == 1) {
                sValue = -sValue;
            }
            this.updateAnger(sValue);
        }
    }

    private _doEndHpEffect(damage, hitInfo) {
        var [hpValue, protectValue, showValue] = BattleHelper.parseDamage(damage);
        this.updateHP(hpValue, protectValue);
        this.tipHit(showValue, hitInfo);
        if (!this.to_alive) {
            this.is_alive = false;
            if (this.getState() == 'StateIdle') {
                this.clearState();
                this.dying();
            }
            return;
        }
        if (this.getState() == 'StateIdle' && hpValue < 0) {
            var stateAction = new StateAction(this, 'hit');
            this.setState(stateAction);
        }
        this.updateHpShadow(true);
    }

    private _refreshAction() {
        this.setAction('idle', true);
        this.actor.stopMoving();
        var buffList = this.buffList;
        for (let i = 0; i < buffList.length; i++) {
            var v = buffList[i];
            var buffData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(v.configId);
            if (buffData.buff_action != '') {
                this.setAction(buffData.buff_action, true);
            }
            if (buffData.flash_action != '') {
                this.actor.doMoving(buffData.flash_action);
            }
        }
    }

    public getBuff(buff) {
        this.buffList.push(buff);
        this._updateBuffBoard();
        this._updateBuffShow(buff);
    }

    public checkSpcialBuff() {
        for (let i = 0; i < this.buffList.length; i++) {
            let buff = this.buffList[i];
            if (buff.buffConfig.special == "jifei" && this.to_alive) {
                let out = new StateOut(this, buff.attackId);
                this.addState(out);
            }
        }
    }

    private _updateBuffBoard() {
        this.billBoard.updateBuff(this.buffList);
    }

    private _updateBuffShow(buff) {
        if (!buff.buffConfig) {
            buff.buffConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(buff.configId);
        }
        var buffData = buff.buffConfig;
        var buffPos = buffData.buff_pos;
        var buffPri = buffData.buff_pri;
        if (buffData.target_color == 'translucent') {
            this.actor.node.stopAllActions();
            this.actor.node.opacity = 100;
            this._istransparent = true;
            return;
        }
        if (buffData.buff_res == '') {
            return;
        }
        if (!this._showBuff[buffPos]) {
            this.actor.showBuff(buffData.buff_res, buffData.buff_pos, buffData.target_color, buffData.buff_action);
            this._showBuff[buffPos] = buff;
        } else if (this._showBuff[buffPos].configId != buff.configId) {
            var lastBuffData = this._showBuff[buffPos].buffConfig;
            if (buffData.buff_pri <= lastBuffData.buff_pri) {
                this.actor.showBuff(buffData.buff_res, buffData.buff_pos, buffData.target_color, buffData.buff_action);
                this._showBuff[buffPos] = buff;
            }
        } else {
            var data = buff.buffConfig;
            if (data.buff_sup == 1) {
                var buffCount = BuffManager.getBuffManager().getBuffCount(this.stageID, buff.configId);
                this.actor.showBuffCount(buffCount, data.buff_colour, data.buff_pos);
            }
        }
    }

    private _updateDeleteShowBuff(buff) {
        var buffData = buff.buffConfig;
        var buffPos = buffData.buff_pos;
        var buffPri = buffData.buff_pri;
        if (this._showBuff[buffPos] && this._showBuff[buffPos].configId == buff.configId) {
            var nextShowBuff = null;
            for (let i = this.buffList.length - 1; i >= 0; i--) {
                var data = this.buffList[i].buffConfig;
                if (data.buff_res != '' && data.buff_pos == buffPos) {
                    if (!nextShowBuff) {
                        nextShowBuff = this.buffList[i];
                    } else if (data.buff_pri < nextShowBuff.buffConfig.buff_pri) {
                        nextShowBuff = this.buffList[i];
                    }
                }
            }
            if (nextShowBuff) {
                var nextData = nextShowBuff.buffConfig;
                this.actor.showBuff(nextData.buff_res, nextData.buff_pos, nextData.target_color, buffData.buff_action);
                this._showBuff[buffPos] = nextShowBuff;
                if (nextData.buff_sup == 1) {
                    var count = BuffManager.getBuffManager().getBuffCount(this.stageID, nextShowBuff.configId);
                    this.actor.showBuffCount(count, nextData.buff_colour, nextData.buff_pos);
                }
            } else {
                this.actor.removeBuff(buffPos);
                this._showBuff[buffPos] = null;
            }
        }
    }

    //开始合击攻击
    public startCombineSkill() {
        this.readyForCombineSkill = true;//主将释放技能，副将依然等待，完成后副将设置此参数调用回位
    }

    public hitPlay(skillPlay, info, hitCount, isProjectile, attackId) {
        let action = skillPlay.atk_action;
        let cell = null;
        let atk_type = skillPlay.atk_type;

        if (FightResourceManager.instance.getSkillJson(Path.getTargetAction(action)) == null) {
            if (atk_type == 2) //列
            {
                if (this.cell == 1 || this.cell == 2 || this.cell == 3) {
                    cell = 1;
                }
                else {
                    cell = 2;
                }
            }
            else if (atk_type == 3) // 排
            {
                if (this.cell == 1 || this.cell == 4) {
                    cell = 1;
                }
                else if (this.cell == 2 || this.cell == 5) {
                    cell = 2;
                }
                else if (this.cell == 3 || this.cell == 6) {
                    cell = 3;
                }
            }
            else if (atk_type == 5) {
                cell = hitCount;
            }
            else {
                cell = this.cell;
            }
        }

        this.attackId = attackId;

        this.hit(Path.getTargetAction(action, cell), info, isProjectile, attackId);
    }

    public damage(buffs: any[]) {
        let hasSpineEffect = false;
        let isFirstBuff = false;
        let buffList = [];
        for (let i = 0; i < buffs.length; i++) {
            let config = BuffManager.getBuffManager().getBuffConfigByGlobalId(buffs[i].globalId);
            if (config == null) {
                continue;
            }
            if (config.buff_front_effect == "") {
                buffList.push(buffs[i]);
            }
            else {
                if (!isFirstBuff) {
                    this.startDamageWithSpine(config, buffs[i], i == (buffs.length - 1));
                    isFirstBuff = true;
                }
                else {
                    this.addDamageWithSpine(config, buffs[i], i == (buffs.length - 1));
                }
                hasSpineEffect = true;
            }
        }
        let damage = new StateDamage(this, buffList, true);
        if (hasSpineEffect) {
            this.addState(damage);
        }
        else {
            this.setState(damage);
        }
    }

    private startDamageWithSpine(buffConfig, buff, isLast) {
        let damageWait = new StateDamageWait(this, buffConfig);
        this.setState(damageWait);
        let damage = new StateDamage(this, [buff]);
        this.addState(damage);
    }

    private addDamageWithSpine(buffConfig, buff, isLast) {
        let damageWait = new StateDamageWait(this, buffConfig);
        this.addState(damageWait);
        let damage = new StateDamage(this, [buff]);
        this.addState(damage);
    }

    //处理damage跳字以及血量更新
    //伤害类型，真实伤害，显示伤害， 伤害类型（暴击～闪避，等等）
    public doHurt(type: number, damage: number, showDamage: number, hurts, protect?) {
        let damageType = 0;
        if (type == 1) {
            damageType = -1
        }
        else if (type == 2) {
            damageType = 1;
        }

        showDamage *= damageType;
        damage *= damageType;
        this.tipHit(showDamage, hurts);
        this.updateHP(damage, protect, true);
    }

    //播放合击duang
    public playDuang(callback?: Function) {
        this.actor.playCombineDuang(callback);
    }

    public playSpineEffect(spine, action, sound) {
        this.actor.playEffect(spine, action);
        if (sound != "") {
            G_AudioManager.playSound(Path.getFightSound(sound), FightRunData.instance.getBattleSpeed());
        }
    }

    public dispatchDie() {
        let unitId = this.configId;
        if (this.monsterId != 0) {
            unitId = this.monsterId;
        }
        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_UNIT_DIE, unitId);
    }

    //死亡状态
    public dying() {
        console.log("dying:", this.stageID);
        let dying = new StateDying(this, Path.getTargetAction("dying"))
        this.addState(dying);
    }

    public setDieState() {
        console.log("setDieState:", this.stageID);
        let dying = new StateDying(this, Path.getTargetAction("dying"))
        this.addState(dying);
    }

    public death() {
        this.actor.death();
        (this.billBoard as BillBoard).showDead();
        this.shadow.death();
    }

    public setWin() {
        this.clearState();
        if (!this.isSandby()) {
            let move = new StateMove(this, StateMove.TYPE_MOVE, "run", 12,
                new cc.Vec2(this._positionIdle[0], this._positionIdle[1]),
                StateMove.ENTER_STAGE);
            this.setState(move);
        }
        let win = new StateWin(this);
        this.addState(win);
    }

    public playWinAction() {
        if (this.actor.isAnimationExist("win1")) {
            this.actor.setActionWithCallback("win", function () {
                this.setAction("win1", true);
            }.bind(this))
        }
        else {
            this.setAction("win", true);
        }
    }

    public showSkill(imageId) {
        this.actor.showSkill(imageId);
    }

    public getPartner(): any {
        return this.partner;
    }

    private hit(action: string, info, isProjectile, attackId) {
        this.clearState();
        let hit = new StateHit(this, action, info, isProjectile, attackId);
        this.addState(hit);
        this._beHit = true;
    }

    private tipHit(value: number, hitInfo) {
        if (this._hitTipView) {
            let height = this._heightFrame;
            if (height < 0) {
                height = 0;
            }
            this._hitTipView.popup(value, hitInfo, "damage", cc.v2(this._positionFrame[0], this._positionFrame[1] + height));
        }
    }

    //更新血量,参数1,更新的hp值;参数2,更改护盾值;参数3:是否是攻击中带入
    changeHp(value) {
        this.hp = this.hp + value;
        this.showHp = this.hp;
        if (this.showHp > this.maxHp) {
            this.showHp = this.maxHp;
        } else if (this.showHp < 0) {
            this.showHp = 0;
        }
    }

    private updateHP(value?: number, protect?, isHitInfo?) {
        var changeValue = value || 0;
        var changeProtect = protect || 0;
        if (this.calcDamage) {
            if (changeValue < -1) {
                this.totalDamage = this.totalDamage + changeValue;
            }
        }
        if (isHitInfo) {
            var isAddHp = false;
            if (changeValue > 0 || changeProtect > 0) {
                isAddHp = true;
            }
            if (isAddHp) {
                this.changeHp(changeValue);
                this.protect = this.protect + changeProtect;
            } else {
                var hpHit = changeValue;
                this.protect = this.protect + changeValue;
                if (this.protect < 0) {
                    hpHit = this.protect;
                    this.protect = 0;
                }
                if (this.protect == 0) {
                    this.changeHp(hpHit);
                }
            }
        } else {
            this.changeHp(changeValue);
            this.protect = this.protect + changeProtect;
            if (this.protect < 0) {
                this.protect = 0;
            }
        }
        if (this._billBoard) {
            this._billBoard.updateHP(this.showHp, this.protect);
            if (value == 0) {
                this._billBoard.updateHpShadow();
            }
        }
    }

    public updateHpShadow(needMoving?) {
        if (this.billBoard) {
            this.billBoard.updateHpShadow(needMoving);
        }
    }

    public playFeature(skillId, callback) {
        let skillInfo = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(skillId);
        let skillPath = skillInfo.talent;
        this._hitTipView.popup(skillPath, null, "feature", cc.v2(this._positionFrame[0], this._positionFrame[1]), callback)
    }

    public updateAnger(value?: number) {
        let changeValue = value || 0;
        this.anger = this.anger + changeValue;
        if (this.anger < 0) {
            this.anger = 0;
        }
        this.billBoard.updateAnger(this.anger);
    }

    private idle() {
        if (!this.is_alive) {
            return;
        }
        let idle = new StateIdle(this);
        this.setState(idle);
        this.setTowards(this.camp);
    }

    public doMoving(actionName: string) {
        if (this.actor) {
            this.actor.doMoving(actionName);
        }
    }

    public stopMoving() {
        if (this.actor) {
            this.actor.stopMoving();
        }
    }

    private _updateTalk(f: number) {
        if (this._isTalking) {
            if (this._talkTime >= FightConfig.UNIT_TALK_SHOW_TIME) {
                this.stopTalk();
            }
            else {
                this._talkTime += f;
            }
        }
    }

    public talk(position: string, face, content) {
        if (position == '0') {
            this.actor.talk(face, content);
            this._isTalking = true;
            this._talkTime = 0;
        } else {
            var strArr = position.split('|');
            for (let i = 0; i < strArr.length; i++) {
                let v = strArr[i];
                let pos: number = parseInt(v);
                if (pos == this.cell) {
                    this.actor.talk(face, content);
                    this._isTalking = true;
                    this._talkTime = 0;
                    break;
                }
            }
        }
    }

    public endTalk(position, face, content) {
        if (position == '0') {
            this.actor.talk(face, content);
        } else {
            var strArr = position.split('|');
            for (let i = 0; i < strArr.length; i++) {
                let v = strArr[i];
                let pos = parseInt(v);
                if (pos == this.cell) {
                    this.actor.talk(face, content);
                    break;
                }
            }
        }
    }
    public stopTalk() {
        this.actor.stopTalk();
        this._isTalking = false;
    }

    public setBuffLayerVisible(s: boolean) {
        this.actor.showBuffLayer(s);
    }

    public setBuffEffectVisible(s: boolean) {
        this.actor.showBuffLayer(s);
        this.actor.setColorVisible(s);
    }

    public showIdle2Effect(v) {
        this.actor.showIdle2Effect(v);
    }

    //添加攻击完成状态
    private addAttackFinish(buffList: any[]) {
        let attackFinish = new StateAttackFinish(this, buffList)
        this.addState(attackFinish)
    }

    protected onStateFinish(state: State) {
        // if (this.stageID == 201) {
        //     console.log("onStateFinish:", state.cName, this.states.length);
        // }
        if (state.cName == "StateDamage" && !this.hasSkill && (state as StateDamage).isLastBuff)//没有攻击info
        {
            // 如果死了，
            BuffManager.getBuffManager().checkPoint(BuffManager.BUFF_AFTER_SHOW, this.stageID);
            this.signalStateFinish.dispatch("StateAttackFinish", this.stageID);
        }
        this.signalStateFinish.dispatch(state.cName, this.stageID);
    }

    // 获取行数
    private getRow() {
        if (this.cell == 1 || this.cell == 4) {
            return 1;
        }
        else if (this.cell == 2 || this.cell == 5) {
            return 2;
        }
        else if (this.cell == 3 || this.cell == 6) {
            return 3;
        }
        return 0;
    }

    // 是否就位
    private isSandby() {
        if (Math.abs(this.position[0] - this._positionIdle[0]) > 0.01 || Math.abs(this.position[1] - this._positionIdle[1]) > 0.01) {
            return false;
        }
        return true;
    }

    private getAttackPosition(t: number, offset: cc.Vec2, targets): cc.Vec2 {
        let factor = this.camp == FightConfig.campLeft ? -1 : 1;
        if (t == 1) { //无位移
        }
        else if (t == 2) { //屏幕中心点偏移
            return new cc.Vec2(offset.x * factor, offset.y)
        }
        else if (t == 3) { //目标偏移
            let totalPos: cc.Vec2[] = []
            let count = 0;

            for (let i = 0; i < targets.list.length; i++) {
                let target: UnitHero = targets.list[i].unit;
                let poses: number[] = FightConfig.getIdlePosition(target.camp, target.cell);
                let pos: cc.Vec2 = new cc.Vec2(poses[0], poses[1]);
                totalPos.push(pos);
                count = count + 1
            }

            let posX = 0
            let posY = 0

            for (let i = 0; i < totalPos.length; i++) {
                posX = totalPos[i].x + posX
                posY = totalPos[i].y + posY
            }

            posX = posX / count
            posY = posY / count
            return new cc.Vec2(posX, posY).add(new cc.Vec2(offset.x * factor, offset.y))
        }
        else if (t == 4) { //排 2,5

            let pos: cc.Vec2;
            for (let i = 0; i < targets.list.length; i++) {
                let target: UnitHero = targets.list[i].unit;
                let poses: number[];
                if (target.cell == 1 || target.cell == 2 || target.cell == 3) {
                    poses = FightConfig.getIdlePosition(target.camp, 2)
                    pos = new cc.Vec2(poses[0], poses[1])
                }
                else if (target.cell == 4 || target.cell == 5 || target.cell == 6) {
                    poses = FightConfig.getIdlePosition(target.camp, 5)
                    pos = new cc.Vec2(poses[0], poses[1]);
                }
            }
            return pos.add(new cc.Vec2(offset.x * factor, offset.y))
        }

        else if (t == 5) { //列 1,2,3
            let pos: cc.Vec2;

            for (let i = 0; i < targets.list.length; i++) {
                let target: UnitHero = targets.list[i].unit;
                let poses: number[];
                if (target.cell == 1 || target.cell == 4) {
                    poses = FightConfig.getIdlePosition(target.camp, 1)
                    pos = new cc.Vec2(poses[0], poses[1])
                }
                else if (target.cell == 2 || target.cell == 5) {
                    poses = FightConfig.getIdlePosition(target.camp, 2)
                    pos = new cc.Vec2(poses[0], poses[1])
                }
                else if (target.cell == 3 || target.cell == 6) {
                    poses = FightConfig.getIdlePosition(target.camp, 3)
                    pos = new cc.Vec2(poses[0], poses[1])
                }
            }
            return pos.add(new cc.Vec2(offset.x * factor, offset.y));
        }
        return null;
    }

    playHistoryShow(hisHeroId, skillId) {
        if (this.actor) {
            this.actor.playHistoryShowAnim(hisHeroId, skillId, this.stageID);
        }
    }
    getBufflist() {
        return this.buffList;
    }
}