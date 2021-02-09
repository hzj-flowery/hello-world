import { State } from "./State";
import Entity from "../unit/Entity";
import { FightConfig } from "../FightConfig";
import UnitHero from "../unit/UnitHero";
import { FightResourceManager } from "../FightResourceManager";
import { FightRunData } from "../FightRunData";
import { G_AudioManager } from "../../init";
import { Path } from "../../utils/Path";

export class Element {
    private helper: StateFlash;
    private layerInfo: any;
    private layerName: string;
    private frames: any[];
    private entity: Entity;
    private lastFrame;
    private towards: number;

    constructor(helper: StateFlash, towards: number, info: any) {

        this.helper = helper;
        this.layerInfo = info;
        this.frames = this.layerInfo.frames;
        this.layerName = this.layerInfo.name;
        this.entity = null;
        this.lastFrame = null;
        this.towards = towards == FightConfig.campLeft ? 1 : -1;
    }

    public update(f: number) {
        let frame = this.frames[f];
        if (frame != null) {
            //print(frame.id)
            if (this.entity == null) {
                this.entity = this.helper.createSymbol(this.layerName, this.layerInfo.extras)
            }
            // if(this.layerName == "se2160031")
            // {
            //     console.log("stateflash frame", frame.x, frame.y, frame.height);
            // }
            let start: cc.Vec2 = this.helper.getStartPosition();
            if (this.layerName == "body_2") {
                start = this.helper.getPartnerStartPosition()
            }


            this.entity.setPosition(start.x + (frame.x * this.towards), start.y + (frame.y))
            if (this.layerName != "shadow") {
                if (frame.isMotion == false) {
                    this.entity.setMotion(false)
                }
                this.entity.setHeight(frame.height)
                this.entity.setRotation(frame.rotation * this.towards)
                this.entity.setScale(frame.scaleX, frame.scaleY)
            }
            this.lastFrame = frame
        }

        if (this.lastFrame != null) {
            if (this.lastFrame.isMotion == true) {
                let n: number = this.lastFrame.id + this.lastFrame.duration;
                let nextFrame = this.frames[n]
                if (nextFrame) {
                    let start = this.helper.getStartPosition()
                    if (this.layerName == "body_2") {
                        start = this.helper.getPartnerStartPosition()
                    }

                    // if(this.layerName == "se2160031")
                    // {
                    //     console.log("stateflash lastFrame", this.lastFrame.x, this.lastFrame.y, this.lastFrame.height)
                    // }
                    let t = (f - this.lastFrame.id) / this.lastFrame.duration
                    let x = this.lerpf(this.lastFrame.x, nextFrame.x, t)
                    let y = this.lerpf(this.lastFrame.y, nextFrame.y, t)
                    let height = this.lerpf(this.lastFrame.height, nextFrame.height, t)
                    let scaleX = this.lerpf(this.lastFrame.scaleX, nextFrame.scaleX, t)
                    let scaleY = this.lerpf(this.lastFrame.scaleY, nextFrame.scaleY, t)
                    let rotation = this.lerpf(this.lastFrame.rotation, nextFrame.rotation, t)

                    this.entity.setPosition(start.x + (x * this.towards), start.y + (y))
                    if (this.layerName != "shadow") {
                        this.entity.setHeight((height))
                        this.entity.setRotation(rotation * this.towards)
                        this.entity.setScale(scaleX, scaleY)
                    }
                }
            }
        }
    }

    private lerpf(src, target, t) {
        return (src + t * (target - src))
    }
}

export class StateFlash extends State {

    private _startPosition: cc.Vec2;
    private _partnerStartPosition: cc.Vec2;

    private _partner: UnitHero;

    protected frame: number;
    protected flashData: any;

    private layers: Element[];

    protected projectileCount = 0;

    constructor(entity: Entity) {
        super(entity);
        this.frame = 0;
        this._startPosition = new cc.Vec2(0, 0);
        this._partnerStartPosition = new cc.Vec2(0, 0);
    }

    protected setAction(action: string) {
        this.flashData = FightResourceManager.instance.getSkillJson(action);
        if (this.flashData) {
            this.doAction();
        }else {
            console.log('after load action -- ' + action);
            FightResourceManager.instance.addActionLaterLoad(action, ()=>{
                this.flashData = FightResourceManager.instance.getSkillJson(action);
                this.doAction();
            })
        }
    }

    doAction(){
        this.layers = [];

        // console.log("setaction:", action);

        this.flashData.layers.forEach(v => {
            let layer = new Element(this, this.entity.camp, v);
            this.layers.push(layer);
        });

        this.projectileCount = 0;
        let events = this.flashData.events;

        for (const key in events) {
            for (let j = 0; j < events[key].length; j++) {
                if (events[key][j].value2 == "projectile") {
                    this.projectileCount += 1;
                }
            }
        }
    }

    public createSymbol(entityName: string, extras: string): any {
        if (entityName == "body")
            return this.entity;
        else if (entityName == "shadow")
            return this.entity.getShadow();
        else if (entityName == "body_2")
            return this.entity.getPartner();

        // create animation
        // console.log(entityName);
        if (extras && extras == "flip") {
            return FightRunData.instance.getScene().createSkillEffect(entityName, this.entity.getZOrderFix());
        }
        return FightRunData.instance.getScene().createSkillEffect(entityName, this.entity.getZOrderFix(), this.entity.getTowards());
    }

    public start() {
        super.start();

        this._startPosition = new cc.Vec2(this.entity.getPosition()[0], this.entity.getPosition()[1]);

        this._partner = this.entity.getPartner();
        if (this._partner) {
            let pos: number[] = this._partner.getPosition();
            this._partnerStartPosition = new cc.Vec2(pos[0], pos[1]);
        }
    }

    public getStartPosition(): cc.Vec2 {
        return this._startPosition;
    }

    public getPartnerStartPosition(): cc.Vec2 {
        return this._partnerStartPosition;
    }

    public update(f: number) {
        if (this.isFinish == false && this.isStart == true) {

            //事件
            let events = this.flashData.events;
            let event = events[this.frame]
            if (event != null) {
                event.forEach(v => {
                    if (v.type == "animation") {
                        this.entity.setAction(v.value1)
                    }
                    else if (v.type == "animation_2") {
                        this._partner.setAction(v.value1)
                    }
                    else if (v.type == "hit") {
                        this.onHitEvent(v.value2, v.value1, v.value3, v.value4)
                    }
                    else if (v.type == "damage") {
                        this.onDamageEvent(v.value1, v.value2)
                    }
                    else if (v.type == "sound") {
                        let speed = FightRunData.instance.getBattleSpeed();
                        // console.log("222:", v.value1);
                        G_AudioManager.playSound(Path.getFightSound(v.value1), speed);
                    }
                    else if (v.type == "hpbar") {
                        if ("show" == v.value1) {
                            this.entity.showBillBoard(true)
                        }
                        else if ("hide" == v.value1) {
                            this.entity.showBillBoard(false)
                        }
                    }
                });
            }

            this.layers.forEach(v => {
                v.update(this.frame)

            });

            this.frame = this.frame + 1
            if (this.frame >= this.flashData.frameCount) {
                this.onFinish()
                this.stop()
            }
        }
    }

    protected onHitEvent(hitType: string, value1: string, value2: string, value3: string) {

    }

    public onDamageEvent(value1: string, value2: string) {

    }
}