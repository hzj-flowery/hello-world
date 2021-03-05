import EffectActor from "../views/EffectActor";
import { FightConfig } from "../FightConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Projectile extends cc.Component {

    private _skillPlay: any;
    private _targets: any[];
    private _pos: any;
    private _zOrderFix: number;
    private _attackId: number;
    private _needRotation: boolean;
    private _actor: EffectActor;
    private _remove: boolean;
    private _start: boolean;
    private _finish: boolean;

    private _bezier: cc.Vec2[];
    private _distance: number;
    private _startPosition: cc.Vec2;
    private _endPosition: cc.Vec2;
    private _speed: number;
    private _height: number;
    private _maxDistance: number;
    private _needTurn: boolean;
    private _positionDelta: cc.Vec2;

    public init(skillPlay, targets: any[], pos: cc.Vec2, attackId) {
        this._skillPlay = skillPlay;
        this._targets = targets;
        this._pos = pos;
        this._zOrderFix = 4000;
        this._attackId = attackId;
        this._needRotation = true;
        this._remove = false;
        this.createActor();
        this.node.zIndex = this._zOrderFix;
    }

    private createActor() {
        var resId = this._skillPlay.bullet_res_id;
        this._actor = new cc.Node("_projectileActor").addComponent(EffectActor);
        this.node.addChild(this._actor.node);
        this._actor.init(resId);
        this._actor.getAnimation().node.setScale(FightConfig.SCALE_ACTOR);
        return this._actor;
    }

    onStateFinish() {
        for (let i = 0; i < this._targets.length; i++) {
            var v = this._targets[i];
            v.unit.hitPlay(this._skillPlay, v.info, null, true, this._attackId);
        }
        this._remove = true;
        this._start = false;
        this._finish = true;
    }

    public isRemove() {
        return this._remove;
    }

    setAction(name, loop) {
        this._actor.setAction(name, loop);
    }

    public setStart() {
        this._start = true;
        this._finish = false;
        this._distance = null;
        this._endPosition = this._pos;
        this._speed = this._skillPlay.bullet_speed;
        this._height = this._skillPlay.bullet_curve_height;

        this._startPosition = new cc.Vec2(this.node.getPosition().x, this.node.getPosition().y);
        this._positionDelta = this._endPosition.sub(this._startPosition);
        this._maxDistance = this._positionDelta.len();
        this._needTurn = false;
        var moveAngle = Math.atan2(this._endPosition.y - this._startPosition.y, this._endPosition.x - this._startPosition.x);
        if (Math.cos(moveAngle) > 0) {
            this.node.scaleX = 1;
        } else {
            this._needTurn = true;
            this.node.scaleX = -1;
        }
        var mp: cc.Vec2 = this._endPosition.add(this._startPosition).mul(0.5);
        if (this._height != 0) {
            var posY = this._startPosition.y;
            if (this._endPosition.y > posY) {
                posY = this._endPosition.y;
            }
            mp.y = posY + this._height;
        }
        this._bezier = [
            new cc.Vec2(0, 0),
            mp.sub(this._startPosition),
            this._positionDelta
        ];
        this._actor.setAction('effect', true);
    }

    public frameFrame(f) {
        if (this._start && this._finish == false) {
            if (this._distance == null) {
                this._distance = 0;
            } else {
                this._distance = this._distance + this._speed;
                this._speed = this._speed + 0.5;
            }
            var t = this._distance / this._maxDistance;
            t = t > 1 && 1 || t;
            var height = 0;
            var newPos = this._startPosition.add(this._positionDelta.mul(t));
            var [posx, posy, angle] = this.getBezierPosition(this._bezier, t);
            var p = this._startPosition.add(cc.v2(posx, posy));
            height = p.y - newPos.y;
            if (this._needTurn) {
                angle = angle - 180;
            }
            this.node.angle = -(angle);
            this.node.setPosition(newPos.x, newPos.y + height);
            if (t == 1) {
                this.onStateFinish();
            }
        }
    }

    getBezierPosition(bezier, t) {
        var xa = bezier[0].x;
        var xb = bezier[1].x;
        var xc = bezier[2].x;
        var ya = bezier[0].y;
        var yb = bezier[1].y;
        var yc = bezier[2].y;
        var posx1 = this.bezierAngle(xa, xb, t);
        var posy1 = this.bezierAngle(ya, yb, t);
        var posx2 = this.bezierAngle(xb, xc, t);
        var posy2 = this.bezierAngle(yb, yc, t);
        var angle = Math.atan2(posy2 - posy1, posx2 - posx1);
        var angleRet = -Math.floor(angle * 180 / 3.14);
        return [
            this.bezierFix(xa, xb, xc, t),
            this.bezierFix(ya, yb, yc, t),
            angleRet
        ];
    }

    private bezierFix(posStart, posMid, posEnd, t) {
        return Math.pow(1 - t, 2) * posStart + 2 * t * (1 - t) * posMid + Math.pow(t, 2) * posEnd;
    }

    private bezierAngle(posStart, posEnd, t) {
        return posStart + (posEnd - posStart) * t;
    }
}