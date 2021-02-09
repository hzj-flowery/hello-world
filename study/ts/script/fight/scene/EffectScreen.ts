import { FightConfig } from "../FightConfig";
import EffectActor from "../views/EffectActor";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EffectScreen extends cc.Component {

    private _actor: EffectActor;
    private _remove: boolean;
    private _towards: number;
    private _scale: number;
    private _position: number[];
    private _positionFrame: number[];
    private _positionLast: number[];

    public init(path: string, towards?: number) {
        this._remove = false;
        this._towards = towards || FightConfig.campLeft;
        this._scale = 1;
        this._position = [0, 0];
        this._positionFrame = [0, 0];
        this._positionLast = [0, 0];
        this.createActor(path);
        this._actor.setTowards(this._towards);
    }

    private createActor(path) {
        this._actor = new cc.Node("_effectScreenActor").addComponent(EffectActor);
        this._actor.init(path);
        this.node.addChild(this._actor.node);
    }

    public setStart() {
        this._actor.setAction("effect");
        this._actor.getAnimation().signalComplet.add(function () {
            this._onEffectFinish();
        }.bind(this));
    }

    public isRemove() {
        return this._remove;
    }

    public setUpdate(dt: number) {
        this._positionLast[0] = this._position[0];
        this._positionLast[1] = this._position[1];
    }

    public frameFrame(dt: number) {
        if (this._positionFrame[0] != this._position[0] || this._positionFrame[1] != this._position[1]) {
            this._positionFrame[0] = this._positionLast[0] + (this._position[0] - this._positionLast[0]) * dt;
            this._positionFrame[1] = this._positionLast[1] + (this._position[1] - this._positionLast[1]) * dt;
            this._actor.node.setPosition(this._positionFrame[0], this._positionFrame[1])
        }
    }

    public setFlashColor(r, g, b, a) {

    }

    public setFlashScale(x, y) {

    }

    getFlashPosition() {
        return [
            this._position[0],
            this._position[1]
        ];
    }

    setFlashPosition(x, y) {
        this._position[0] = x;
        this._position[1] = y;
    }

    private _onEffectFinish() {
        this._remove = true;
    }
}