import Entity from "../unit/Entity";
import UnitHero from "../unit/UnitHero";

export class State {

    private _isFinish: boolean = false;
    private _isStart: boolean = false;
    protected entity: Entity = null;
    protected bShowName: boolean = false;

    public cName: string;

    constructor(entity: Entity) {
        this._isFinish = false;
        this._isStart = false;
        this.entity = entity;
        this.bShowName = true;
    }

    public get isStart(): boolean {
        return this._isStart;
    }

    public get isFinish(): boolean {
        return this._isFinish;
    }

    public start() {
        this.entity.updateShadow = (true);
        if (this.entity.isPet) {
            this.entity.showBillBoard(false);
        }
        else {
            if (this.entity.inCombineWatcher) {
                this.entity.showBillBoard(false);
            }
            else {
                this.entity.showBillBoard(this.bShowName);
            }
        }

        this._isFinish = false;
        this._isStart = true;

        if (this.cName != "StateIdle") {
            if (!this.entity.isPet) {
                (this.entity as UnitHero).showIdle2Effect(false);
            }
        }

        if (this.cName == "StateIdle" || this.cName == "StateBuff" || this.cName == "StateWin") {

        }
        else {
            if (!this.entity.isPet) {
                (this.entity as UnitHero).stopTalk();
            }
        }
    }

    public stop() {
        this._isStart = false;
    }

    public update(f: number) {

    }

    public updateFrame(f: number) {

    }

    public onFinish() {
        this._isFinish = true;
    }
}