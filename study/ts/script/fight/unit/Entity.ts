import { State } from "../state/State";
import { Unit } from "../report/WaveData";
import { FightConfig } from "../FightConfig";
import { PrioritySignal } from "../../utils/event/PrioritySignal";
import Actor from "../views/Actor";
import BillBoard from "../views/BillBoard";
import ShadowActor from "../views/ShadowActor";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Entity extends cc.Component {
    public stageID: number;
    public configId: number;
    public cell: number;
    public camp: number;
    public country: number;
    public is_alive: boolean;
    public to_alive: boolean;
    public projectileCount: number;
    public buffList: any[];
    public isPet: boolean;
    public enterStage: boolean;
    public readyForCombineSkill: boolean;
    public startMove: boolean;
    public needOpenShow: boolean;
    public inCombineWatcher: boolean;
    public updateShadow = false;

    public partner: Entity;

    protected actor: Actor;
    protected _billBoard: BillBoard;

    protected shadow: ShadowActor;

    private _remove: boolean;
    protected states: State[] = [];

    protected hasSkill: boolean;

    protected position: number[];
    protected _positionFrame: number[];
    private _positionLast: number[];

    private _scale: number[];
    private _scaleFrame: number[];
    private _scaleLast: number[];
    private _towards: number;

    private _height: number;
    protected _heightFrame: number;
    private _heightLat: number;

    private _zOrderFix: number;
    protected _isMotion: boolean;


    public signalStateFinish: PrioritySignal;
    public signalBuff: PrioritySignal;
    public signalStartCG: PrioritySignal;
    public signalStateWait: PrioritySignal;

    public init(data) {
        this._remove = false;

        this.states = [];
        this._scale = [1, 1];
        this._scaleFrame = [1, 1];
        this._scaleLast = [1, 1];
        this._towards = FightConfig.campLeft;
        this.position = [0, 0];
        this._positionFrame = [0, 0];
        this._positionLast = [0, 0];

        this._height = 0;
        this._heightFrame = 0;

        this._zOrderFix = 0;

        this._isMotion = true;

        this.signalStateFinish = new PrioritySignal("string");
        this.signalBuff = new PrioritySignal("string");
        this.signalStartCG = new PrioritySignal("string");
        this.signalStateWait = new PrioritySignal("string");
    }

    public logicUpdate(f: number) {
        this._positionLast[0] = this.position[0];
        this._positionLast[1] = this.position[1];

        this._scaleLast[0] = this._scale[0];
        this._scaleLast[1] = this._scale[1];

        this._heightLat = this._height;


        if (this.states.length > 0) {
            let state = this.states[0];

            // if (this.stageID == 203) {
            //     console.log("logicupdate:", this.stageID, this.states[0].cName);
            // }
            if (!state.isStart) {
                state.start();
            }
            state.update(f);

            if (state.isFinish) {
                // console.log("logic update:",this.configId,state.cName)
                this.states.splice(0, 1);
                this.onStateFinish(state);
            }
        }
    }

    public frameUpdate(f: number) {
        if (!this._isMotion) {
            f = 1
            this._isMotion = true
        }

        if (this._positionFrame[0] != this.position[0] || this._positionFrame[1] != this.position[1] ||
            this._heightFrame != this._height) {
            this._positionFrame[0] = this._positionLast[0] + (this.position[0] - this._positionLast[0]) * f;
            this._positionFrame[1] = this._positionLast[1] + (this.position[1] - this._positionLast[1]) * f;

            this._heightFrame = this._heightLat + (this._height - this._heightLat) * f;

            this.actor.node.setScale(FightConfig.getScale(this._positionFrame[1] + this._heightFrame));
            this.setZOrderFix(this._zOrderFix);
            // if (this.stageID == 101) {
            //     console.log(this._positionFrame[0], this._positionFrame[1]);
            // }
            this.actor.node.setPosition(this._positionFrame[0], this._positionFrame[1] + this._heightFrame);
        }

        if (this._scaleFrame[0] != this._scale[0] || this._scaleFrame[1] != this._scale[1]) {
            this._scaleFrame[0] = this._scaleLast[0] + (this._scale[0] - this._scaleLast[0]) * f;
            this._scaleFrame[1] = this._scaleLast[1] + (this._scale[1] - this._scaleLast[1]) * f;
            if (this.actor) {
                this.actor.node.setScale(this._scaleFrame[0], this._scaleFrame[1]);
            }
        }
    }

    protected onStateFinish(state: State) {

    }

    public isRemove() {
        return this._remove;
    }

    public remove() {
        this._remove = true;
    }

    public getPartner(): any {
        return null;
    }

    public getShadow(): ShadowActor {
        return this.shadow;
    }

    public get billBoard(): BillBoard {
        return this._billBoard;
    }

    public set billBoard(value: BillBoard) {
        this._billBoard = value;
    }
  

    public updateHpShadow(b: boolean) {

    }

    public checkShow() {
    }

    public showShadow(b: boolean) {
        this.shadow.node.active = b;
    }

    public showBillBoard(isShow: boolean) {
        if (this.billBoard) {
            this.billBoard.node.active = isShow;
        }
    }

    public setVisible(b: boolean) {
        this.node.active = b;
    }

    public setZOrderFix(zOrder: number) {
        this._zOrderFix = zOrder;
        if (this.actor) {
            this.node.zIndex = -Math.round(this._positionFrame[1]) + this._zOrderFix;
        }
    }

    public getZOrderFix(): number {
        return this._zOrderFix;
    }

    public getTowards(): number {
        return this._towards;
    }

    public setTowards(t: number) {
        this._towards = t;
        if (this.actor) {
            this.actor.setTowards(t);
        }
    }

    public getPosition(): number[] {
        return this.position;
    }

    public setPosition(x: number, y: number) {
        // console.log("setPosition:", x, y);
        this.position[0] = x;
        this.position[1] = y;
    }

    public setScale(x: number, y: number) {
        this._scale[0] = x;
        this._scale[1] = y;
    }

    public setHeight(height: number) {
        this._height = height;
    }

    public setRotation(r) {
        if (this.actor) {
            this.actor.node.angle = -r;
        }
    }

    public needRotation(): boolean {
        return false;
    }

    public setMotion(motion: boolean) {
        this._isMotion = motion;
    }

    public setAction(actionName: string, loop: boolean = false) {
        this.actor.setAction(actionName, loop);
    }

    public doMoving(actionName: string) {

    }


    public stopMoving() {

    }

    public dying() {

    }

    public setDieState() {

    }

    public dispatchDie() {

    }

    public fade(b: boolean) {

    }

    public getHasSkill(): boolean {
        return this.hasSkill;
    }

    protected setState(state: State) {
        this.clearState();
        this.addState(state);
    }

    public clearState() {
        if (this.states.length != 0) {
            if (!this.states[this.states.length - 1].isFinish){
                this.states[this.states.length - 1].onFinish();
            }
        }
        this.states = [];
    }

    public addState(state: State) {
        this.states.push(state);
    }

    public getState(): string {
        if (this.states.length > 0) {
            return this.states[0].cName;
        }
        return "";
    }

    public isStateStart(stateName: string) {
        if (this.states.length <= 0) {
            return false;
        }

        if (this.states[0].cName == stateName && this.states[0].isStart) {
            return true;
        }
    }

    public getStateName(): string {
        if (this.states.length > 0) {
            return this.states[0].toString();
        }
        return "";
    }

    public clearActor() {
        this.actor = null;
    }
}