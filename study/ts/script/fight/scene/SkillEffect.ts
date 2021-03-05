import EffectActor from "../views/EffectActor";
import { FightConfig } from "../FightConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillEffect extends cc.Component {

    private _actor: EffectActor;
    private _towards: number;
    private _zOrderFix: number;

    private _remove: boolean;

    private _positionFrame: number[];
    private _position: number[];
    private _positionLast: number[];
    private _heightFrame: number;
    private _heightLat: number;
    private _height: number;

    private _scaleFrame: number[];
    private _scale: number[];
    private _scaleLast: number[];

    public init(path: string, zOrderFix: number, towards: number) {

        this._scale = [1, 1];
        this._scaleFrame = [1, 1];
        this._scaleLast = [1, 1];
        this._towards = FightConfig.campLeft;
        this._position = [0, 0];
        this._positionFrame = [0, 0];
        this._positionLast = [0, 0];
        this._height = 0;
        this._heightFrame = 0;
        this._heightLat = 0;
        this._zOrderFix = 0;

        this.createActor(path);
        this._zOrderFix = zOrderFix;
        this._actor.setTowards(towards);
        this.setZOrderFix(this._zOrderFix);
    }

    private createActor(path) {
        this._actor = new cc.Node(path).addComponent(EffectActor);
        this.node.addChild(this._actor.node);
        this._actor.init(path);
    }

    public setStart() {
        this._remove = false;
        this._actor.setAction("effect");
        this._actor.getAnimation().signalComplet.add(this._onEffectFinish.bind(this));
    }

    public isRemove() {
        return this._remove;
    }

    public setPosition(x: number, y: number) {
        this._position[0] = x;
        this._position[1] = y;
    }

    public setScale(x: number, y: number) {
        this._scale[0] = x;
        this._scale[1] = y;
    }

    public setHeight(height: number) {
        this._height = height;
    }

    public setMotion(b) {

    }

    public setZOrderFix(zOrder) {
        this._zOrderFix = zOrder;
        this.node.zIndex = -Math.round(this._positionFrame[1]) + this._zOrderFix;
    }

    public setRotation(r: number) {
        this.node.angle = -r;
    }

    public logicUpdate(f: number) {
        this._positionLast[0] = this._position[0];
        this._positionLast[1] = this._position[1];

        this._scaleLast[0] = this._scale[0];
        this._scaleLast[1] = this._scale[1];

        this._heightLat = this._height;
    }

    public frameFrame(f) {
        if (this._positionFrame[0] != this._position[0] || this._positionFrame[1] != this._position[1] ||
            this._heightFrame != this._height) {
            this._positionFrame[0] = this._positionLast[0] + (this._position[0] - this._positionLast[0]) * f;
            this._positionFrame[1] = this._positionLast[1] + (this._position[1] - this._positionLast[1]) * f;

            this._heightFrame = this._heightLat + (this._height - this._heightLat) * f;

            this.node.setScale(FightConfig.getScale(this._positionFrame[1] + this._heightFrame));
            this.setZOrderFix(this._zOrderFix);
            this.node.setPosition(this._positionFrame[0], this._positionFrame[1] + this._heightFrame);
        }

        if (this._scaleFrame[0] != this._scale[0] || this._scaleFrame[1] != this._scale[1]) {
            this._scaleFrame[0] = this._scaleLast[0] + (this._scale[0] - this._scaleLast[0]) * f;
            this._scaleFrame[1] = this._scaleLast[1] + (this._scale[1] - this._scaleLast[1]) * f;
            this.node.setScale(this._scaleFrame[0], this._scaleFrame[1]);
        }
    }

    public setAction(name, loop) {
        this._actor.setAction(name, loop);
    }

    private _onEffectFinish() {
        this._remove = true;
    }
}