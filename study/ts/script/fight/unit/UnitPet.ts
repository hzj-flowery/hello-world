import { Pet } from "../report/WaveData";
import Entity from "./Entity";
import BuffManager from "../BuffManager";
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { FightConfig } from "../FightConfig";
import { StateWait } from "../state/StateWait";
import PetActor from "../views/PetActor";
import BillBoardPet from "../views/BillBoardPet";
import ShadowActor from "../views/ShadowActor";
import { StateIdle } from "../state/StateIdle";
import { StatePetEnter } from "../state/StatePetEnter";
import { StateMove } from "../state/StateMove";
import { handler } from "../../utils/handler";
import { StateSkill } from "../state/StateSkill";
import { StateBuff } from "../state/StateBuff";
import { StateAttackFinish } from "../state/StateAttackFinish";
import { State } from "../state/State";
const { ccclass, property } = cc._decorator;

@ccclass
export default class UnitPet extends Entity {

    private _data: Pet;
    private _star: number;
    private _configData;
    private _resData;
    private _skillAnim;
    private _buffManager: BuffManager;

    private _isMoveAttack: boolean;

    private _positionIdle: number[];
    private _positionEnter: number[];

    public init(data: Pet) {
        super.init(data);
        this._data = data;

        this.camp = data.camp;
        this.configId = data.configId;
        this._star = data.star;
        this._configData = G_ConfigLoader.getConfig(ConfigNameConst.PET).get(data.configId);
        this._resData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(this._configData.res_id);
        this._skillAnim = FightConfig.PET_SKILL_ANIM[this.camp - 1];
        this._buffManager = BuffManager.getBuffManager();
        this.isPet = true;
        this._isMoveAttack = false;
        this._updatePetPos();
    }

    public getResId() {
        return this._configData.res_id;
    }

    public getColor() {
        return this._configData.color;
    }

    public getSkillAnim() {
        return this._skillAnim;
    }

    private _updatePetPos() {
        if (FightConfig.NEED_PET_SHOW) {
            this._positionEnter = FightConfig.getPetEnterPosition(this.camp);
        } else {
            this._positionEnter = FightConfig.getPetIdlePosition(this.camp);
        }
        var posXYArr: string[] = this._resData.battle_xy.split('|');
        var fix = this.camp == FightConfig.campLeft && -1 || 1;
        this._positionIdle = [
            parseFloat(posXYArr[0]) * fix,
            parseFloat(posXYArr[1])
        ];
        // console.log("_updatePetPos:", this._positionEnter[0], this._positionEnter[1], this._positionIdle[0], this._positionIdle[1]);
        this.setPosition(this._positionEnter[0], this._positionEnter[1]);
        var wait = new StateWait(this, StateWait.WAIT_ENTER_STAGE);
        this.addState(wait);
    }

    public createActor() {
        let spineId: number = this._resData.fight_res;
        this.actor = new cc.Node(spineId.toString()).addComponent(PetActor);
        this.actor.init(spineId, this.camp == FightConfig.campLeft ? 1 : -1);
        this.node.addChild(this.actor.node);
        this.actor.node.active = false;
        this.setTowards(this.camp);
    }

    public createBillBoard() {
        this.billBoard = new cc.Node("_billBoard").addComponent(BillBoardPet) as BillBoardPet;
        (this.billBoard as BillBoardPet).init(this._configData.name, this._configData.color, this._star);
        if (this.actor) {
            var billboardZ = this.actor.node.zIndex + 1;
            this.billBoard.node.zIndex = (billboardZ);
        }
        var towards = this.camp == FightConfig.campLeft && 1 || -1;
        var petHeight = this._resData.spine_height * FightConfig.SCALE_ACTOR;
        this.billBoard.node.setPosition(this._positionIdle[0] + towards * this._resData.name_x, this._positionIdle[1] + petHeight);
        this.billBoard.node.active = (false);
        this.node.addChild(this.billBoard.node);
    }

    public getBillBoard() {
        return this.billBoard;
    }

    public createShadow() {
        this.shadow = new cc.Node("shadow").addComponent(ShadowActor);
        this.shadow.init();
        this.node.addChild(this.shadow.node);
        this.shadow.node.setPosition(this._positionIdle[0], this._positionIdle[1]);
        this.updateShadow = true;
        this.shadow.node.active = false;
        this.shadow.node.setScale(FightConfig.PET_SHADOW_SCALE);
    }

    public getShadow() {
        return this.shadow;
    }

    public getActor() {
        return this.actor;
    }

    public _onSpineLoadFinish() {
    }

    public getCamp() {
        return this.camp;
    }

    public getConfigId() {
        return this.configId;
    }

    public idle() {
        var idle = new StateIdle(this);
        this.setState(idle);
        this.setTowards(this.camp);
    }

    public setAction(name, loop) {
        this.actor.setAction(name, loop);
    }

    public enterFightGround() {
        if (FightConfig.NEED_PET_SHOW) {
            var statePetEnter = new StatePetEnter(this, this._resData.show_stop);
            this.setState(statePetEnter);
            var move = new StateMove(this, StateMove.TYPE_BEZIER, 'moveback', 30, cc.v2(this._positionIdle[0], this._positionIdle[1]), StateMove.BACK_ATTACK);
            move.setCallback(handler(this, this._checkOpenBuff));
            this.addState(move);
        } else {
            var move = new StateMove(this, StateMove.TYPE_BEZIER, 'run', FightConfig.speed, cc.v2(this._positionIdle[0], this._positionIdle[1]), StateMove.BACK_ATTACK);
            move.setCallback(handler(this, this._checkOpenBuff));
            this.setState(move);
        }
        var wait = new StateWait(this, StateWait.WAIT_START, 'idle', handler(this, this._dispatchInPosition), 0.5);
        this.addState(wait);
    }

    public _checkOpenBuff() {
        this._buffManager.checkPetsBuff();
    }

    public _dispatchInPosition() {
        this.idle();
    }

    public skill(skillInfo, targets) {
        this.clearState();
        var skillPlay = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_PLAY).get(skillInfo.skill_show_id);
        var start_location_type = skillPlay.start_location_type;
        var prePosition = this.getAttackPosition(start_location_type, cc.v2(skillPlay.x, skillPlay.y), targets);
        if (skillInfo.skill_type == 2) {
        }
        this._isMoveAttack = false;
        if (prePosition) {
            this._isMoveAttack = true;
            prePosition.y = prePosition.y - 2;
            var cameraTargetPos = null;
            if (skillPlay.camera_location_type != 0) {
                cameraTargetPos = this.getAttackPosition(skillPlay.camera_location_type,
                    cc.v2(skillPlay.camera_x, skillPlay.camera_y + FightConfig.GAME_GROUND_FIX), targets);
            }
            var move = new StateMove(this, skillPlay.atk_pre_type, skillPlay.atk_pre_action,
                skillPlay.atk_pre_speed, prePosition, null, cameraTargetPos);
            this.addState(move);
        }
        var skill = new StateSkill(this, skillPlay, targets, skillInfo);
        this.addState(skill);
        if (prePosition) {
            var cameraTargetPos = null;
            if (skillPlay.camera_location_type != 0) {
                cameraTargetPos = cc.v2(0, 0);
            }
            var move = new StateMove(this, skillPlay.atk_follow_type, skillPlay.atk_follow_action,
                skillPlay.atk_follow_speed, cc.v2(this._positionIdle[0], this._positionIdle[1]),
                StateMove.BACK_ATTACK, cameraTargetPos);
            this.addState(move);
        }
        var targetIds = [];
        for (let i = 0; i < targets.list.length; i++) {
            var v = targets.list[i];
         //   if (v.unit.to_alive) {
                targetIds.push(v.unit.stageID);
          //  }
        }
        var stateBuff = new StateBuff(this, BuffManager.BUFF_ATTACK_BACK, this.camp, targetIds);
        this.addState(stateBuff);
        var attackFinish = new StateAttackFinish(this, []);
        this.addState(attackFinish);
    }

    public getAttackPosition(t, offset, targets) {
        var factor = this.camp == FightConfig.campLeft && -1 || 1;
        if (t == 1) {
        } else if (t == 2) {
            return cc.v2(offset.x * factor, offset.y);
        } else if (t == 3) {
            var totalPos = [];
            var count = 0;
            for (let i = 0; i < targets.list.length; i++) {
                var v = targets.list[i];
                var target = v.unit;
                let p: number[] = FightConfig.getIdlePosition(target.camp, target.cell)
                let pos = cc.v2(p[0], p[1]);
                totalPos.push(pos);
                count = count + 1;

            }
            var finalPos = [];
            var posX = 0;
            var posY = 0;
            for (let i = 0; i < totalPos.length; i++) {
                var v = totalPos[i];
                posX = v.x + posX;
                posY = v.y + posY;

            }
            posX = posX / count;
            posY = posY / count;
            return cc.v2(posX, posY).add(cc.v2(offset.x * factor, offset.y));
        } else if (t == 4) {
            for (let i = 0; i < targets.list.length; i++) {
                var v = targets.list[i];
                let pos: cc.Vec2;
                var target = v.unit;
                if (target.cell == 1 || target.cell == 2 || target.cell == 3) {
                    let p: number[] = FightConfig.getIdlePosition(target.camp, 2);
                    pos = cc.v2(p[0], p[1]);
                } else if (target.cell == 4 || target.cell == 5 || target.cell == 6) {
                    let p: number[] = FightConfig.getIdlePosition(target.camp, 5);
                    pos = cc.v2(p[0], p[1]);
                }
                return pos.add(cc.v2(offset.x * factor, offset.y));
            }
        } else if (t == 5) {
            for (let i = 0; i < targets.list.length; i++) {
                var v = targets.list[i];
                var pos: cc.Vec2;
                var target = v.unit;
                if (target.cell == 1 || target.cell == 4) {
                    let p: number[] = FightConfig.getIdlePosition(target.camp, 1);
                    pos = cc.v2(p[0], p[1]);
                } else if (target.cell == 2 || target.cell == 5) {
                    let p: number[] = FightConfig.getIdlePosition(target.camp, 2);
                    pos = cc.v2(p[0], p[1]);
                } else if (target.cell == 3 || target.cell == 6) {
                    let p: number[] = FightConfig.getIdlePosition(target.camp, 3);
                    pos = cc.v2(p[0], p[1]);
                }
                return pos.add(cc.v2(offset.x * factor, offset.y));
            }
        }
        return null;
    }

    public logicUpdate(f) {
        super.logicUpdate(f);
        if (this.states.length == 0) {
            this.idle();
        }
    }

    public frameUpdate(f) {
        super.frameUpdate(f);
        if (this.updateShadow) {
            this.shadow.updatePos(cc.v2(this._positionFrame[0], this._positionFrame[1]));
        }
        this.shadow.node.zIndex = (-Math.round(this._positionFrame[1]) - 1);
    }

    public onStateFinish(state: State) {
        this.signalStateFinish.dispatch(state.cName);
    }

    public showShadow(v) {
        this.shadow.node.active = (v);
    }

    public fade(isIn) {
        this.actor.node.active = (isIn);
        this.billBoard.node.active = (isIn);
        this.showShadow(isIn);
    }

    public doWinAction() {
        this.actor.setAction('win', true);
    }

    public checkShow() {
        if (!this._isMoveAttack) {
            this.setPosition(this._positionIdle[0], this._positionIdle[1]);
            this.fade(false);
        }
    }

    public death() {
        this.actor.death();
        this.shadow.death();
    }
}