import { State } from "./State";
import Entity from "../unit/Entity";
import { StateIdle } from "./StateIdle";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";
import UnitHero from "../unit/UnitHero";

export class StateWait extends StateIdle {
    public static WAIT_COMBINE = "wait_combine"
    public static WAIT_START = "wait_start"
    public static WAIT_COMBINE_SKILL = "wait_skill"
    public static WAIT_SECOND_WAVE = "wait_second_wave"
    public static WAIT_NEW_UNIT = "wait_new_unit" //引导新人进入之后
    public static WAIT_COMBINE_FLASH = "wait_combine_flash"
    public static WAIT_ENTER_STAGE = "wait_enter_stage" //等待入场

    private waitType: string;
    private action: string;
    private callback;
    private delay: number;
    private startDelay;

    constructor(entity: Entity, waitType: string, action?: string, callback?, delay?) {
        super(entity);
        this.cName = "StateWait";
        this.waitType = waitType;
        this.entity.readyForCombineSkill = false;
        this.action = action;
        this.callback = callback;
        this.delay = delay || 0;
        this.startDelay = 0;
    }

    public start() {
        super.start();

        this.startDelay = 0;

        if (this.waitType == StateWait.WAIT_COMBINE || this.waitType == StateWait.WAIT_COMBINE_SKILL ||
            this.waitType == StateWait.WAIT_COMBINE_FLASH) {
            this.entity.signalStateWait.dispatch(this.waitType);
        }
        else if (this.waitType == StateWait.WAIT_SECOND_WAVE) {
            FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_RUN_MAP,this.entity.stageID);
        }
        else if (this.waitType == StateWait.WAIT_NEW_UNIT) {
            (this.entity as UnitHero).playWinAction();
        }
        else if (this.waitType == StateWait.WAIT_START) {
            this.entity.signalStartCG.dispatch("enterStage");
        }

        if (this.waitType == StateWait.WAIT_COMBINE || this.waitType == StateWait.WAIT_COMBINE_SKILL) {
            (this.entity as UnitHero).setBuffEffectVisible(false);
        }
    }

    public update(f: number) {
        if (this.isStart && this.callback) {
            if (this.startDelay >= this.delay) {
                this.callback();
                this.callback = null;
            }
            this.startDelay += f;
        }

        if (this.waitType == StateWait.WAIT_COMBINE_SKILL && this.entity.readyForCombineSkill) {
            this.onFinish();
        }

        if (this.entity.startMove) {
            this.onFinish();
            this.entity.startMove = false;
        }
    }

    public onFinish() {
        if (this.waitType == StateWait.WAIT_COMBINE_SKILL) {
            (this.entity as UnitHero).setBuffEffectVisible(true);
        }
        super.onFinish();
    }
}