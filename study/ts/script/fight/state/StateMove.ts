import { State } from "./State";
import Entity from "../unit/Entity";
import { FightRunData } from "../FightRunData";
import UnitHero from "../unit/UnitHero";

export class StateMove extends State {

    public static TYPE_MOVE = "type_move"
    public static TYPE_BEZIER = "type_bezier"

    public static BACK_ATTACK = "back_attack"
    public static BACK_HIT = "back_hit"
    public static ENTER_STAGE = "enter_stage"
    public static PETS_ENTER = "pets_enter"

    private bezier: cc.Vec2[];
    private distance;
    private startPosition: cc.Vec2;
    private endPosition: cc.Vec2;
    private maxDistance: number;
    private positionDelta: cc.Vec2;
    private moveType: string;
    private elapsed: number;
    private action: string;
    private speed: number;
    private backType: string;
    private cameraTargetPos;
    private callback;

    constructor(entity: Entity, moveType: string, action: string, speed: number, endPosition: cc.Vec2, back_type?: string, cameraTargetPos?: cc.Vec2) {
        super(entity);
        this.cName = "StateMove";
        this.bezier = null;
        this.distance = null;
        this.startPosition = null;
        this.endPosition = endPosition;
        this.moveType = moveType;

        this.elapsed = 0;
        this.action = action;
        this.speed = speed;
        this.backType = back_type;
        this.cameraTargetPos = cameraTargetPos;
        this.callback = null;

        if (this.backType != StateMove.BACK_HIT) {
            this.bShowName = false;
        }
    }

    public getMoveType() {
        return this.moveType
    }

    public setCallback(callback) {
        this.callback = callback
    }

    //
    public start() {
        super.start()
        //取消合击伙伴等待状态
        let partner = this.entity.partner;
        if (partner && this.backType == StateMove.BACK_ATTACK) {
            (partner as UnitHero).startCombineSkill();
        }

        this.elapsed = 0
        this.distance = null
        this.bezier = null
        this.startPosition = new cc.Vec2(this.entity.getPosition()[0], this.entity.getPosition()[1]);
        this.maxDistance = this.endPosition.sub(this.startPosition).mag();

        this.positionDelta = this.endPosition.sub(this.startPosition);

        let moveAngle = Math.atan2(this.endPosition.y - this.startPosition.y, this.endPosition.x - this.startPosition.x)
        if (Math.cos(moveAngle) > 0) {
            this.entity.setTowards(1)
        }
        else {
            this.entity.setTowards(2)
        }


        if (this.moveType == StateMove.TYPE_BEZIER) {
            let mp: cc.Vec2 = this.endPosition.sub(this.startPosition).mul(0.5);
            let posY = this.startPosition.y
            if (this.endPosition.y > posY) {
                posY = this.endPosition.y
            }
            mp.y = posY + 300

            this.bezier = [
                new cc.Vec2(0, 0),
                mp.sub(this.startPosition),
                this.endPosition.sub(this.endPosition),
            ]
        }

        this.entity.setAction(this.action, true)

        // //摄像机移动
        if (this.cameraTargetPos) {
            let isBack = false
            if (this.backType == StateMove.BACK_ATTACK) {
                isBack = true
            }
            let time = this.maxDistance / this.speed
            let cameraPos = new cc.Vec2(this.cameraTargetPos.x, this.cameraTargetPos.y)

            FightRunData.instance.getScene().addCameraState(cameraPos, time, isBack)
        }
    }

    //
    private getBezierDuration(bezier: cc.Vec2[], duration) {
        let xa = 0
        let xb = bezier[0].x
        let xc = bezier[1].x
        let xd = bezier[2].x

        let ya = 0;
        let yb = bezier[0].y
        let yc = bezier[1].y
        let yd = bezier[2].y
        let t = 0
        let dis = 0
        while (t < 1) {
            t = t + 1 / 30
            if (t < 1) {
                t = 1
            }

            let cur = new cc.Vec2(this.bezierat(xa, xb, xc, xd, t), this.bezierat(ya, yb, yc, yd, t))
            dis += cur.mag();
        }

        let ti = 1 / 30 / duration
        return Math.floor(ti * dis * 100) / 100
    }


    //
    public getBezierPosition(bezier: cc.Vec2[], t) {
        let xa = bezier[0].x
        let xb = bezier[1].x
        let xc = bezier[2].x

        let ya = bezier[0].y
        let yb = bezier[1].y
        let yc = bezier[2].y

        let posx1 = this.bezierAngle(xa, xb, t)
        let posy1 = this.bezierAngle(ya, yb, t)
        let posx2 = this.bezierAngle(xb, xc, t)
        let posy2 = this.bezierAngle(yb, yc, t)

        let angle = Math.atan2(posy2 - posy1, posx2 - posx1)
        let angleRet = -Math.floor(angle * 180 / 3.14)

        return [this.bezierFix(xa, xb, xc, t), this.bezierFix(ya, yb, yc, t), angleRet]
    }

    //
    public update(f: number) {
        if (this.isStart && this.isFinish == false) {
            if (this.distance == null) {
                this.distance = 0
            }
            else {
                this.distance = this.distance + this.speed
            }

            let t: number = this.distance / this.maxDistance
            t = t > 1 ? 1 : t

            //
            let height = 0
            let newPos = this.startPosition.add(this.positionDelta.mul(t));
            if (this.moveType == StateMove.TYPE_BEZIER) {
                let n: number[] = this.getBezierPosition(this.bezier, t);
                let posx: number = n[0];
                let posy: number = n[1];
                let angle: number = n[2];
                let p = this.startPosition.add(new cc.Vec2(posx, posy))
                height = p.y - newPos.y
                if (this.entity.needRotation()) {
                    this.entity.setTowards(1)
                    this.entity.setRotation(angle)
                }
            }

            // if(this.entity.stageID == 101)
            // {
            //     console.log("statemove", newPos.x, newPos.y, this.entity.stageID);
            // }
            this.entity.setPosition(newPos.x, newPos.y)
            this.entity.setHeight(height)

            if (t == 1) {
                this.onFinish()
            }
        }
    }

    //
    public onFinish() {

        if (this.backType == StateMove.BACK_HIT) {

        }
        if (this.backType == StateMove.BACK_ATTACK) {
            this.entity.setAction("idle", true)
            if (this.entity.isPet) {
                this.entity.fade(false)
            }
        }
        if (this.callback) {
            this.callback()
        }
        this.entity.setTowards(this.entity.camp)
        super.onFinish()

    }

    private bezierat(a: number, b: number, c: number, d: number, t: number) {
        return (Math.pow(1 - t, 3) * a + 3 * t * (Math.pow(1 - t, 2)) * b + 3 * Math.pow(t, 2) * (1 - t) * c + Math.pow(t, 3) * d);
    }

    private bezierFix(posStart, posMid, posEnd, t) {
        return (Math.pow(1 - t, 2) * posStart + 2 * t * (1 - t) * posMid + Math.pow(t, 2) * posEnd)
    }

    private bezierAngle(posStart, posEnd, t) {
        return posStart + (posEnd - posStart) * t
    }
}