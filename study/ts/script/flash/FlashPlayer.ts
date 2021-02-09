import { G_AudioManager } from "../init";
import CommonHeroAvatar from "../ui/component/CommonHeroAvatar";
import { SpineNode } from "../ui/node/SpineNode";
import { Path } from "../utils/Path";
import FlashElement from "./FlashElement";

export default class FlashPlayer {

    private effectDesignInterval = 1 / 30;
    private _frame: number;
    private _totalDt;
    private _startPosition: cc.Vec2;
    private _data;
    private _ani;
    private _entity: SpineNode;
    private _shadow: cc.Node;
    private _shadowInitPos: cc.Vec3;
    private _towards;
    private _commonAvatar: CommonHeroAvatar;
    private _effects: { [key: string]: SpineNode };
    private _layers: any[];
    private _finish;
    private _start;
    private _isLoop;
    private _callback;
    private _enableSound;

    constructor(entity: SpineNode, shadow: cc.Node, ani, towards, commonAvatar: CommonHeroAvatar, isLoop, callback?) {
        // console.log("FlashPlayer:", ani);
        this._frame = 0;
        this._totalDt = 0;
        this._startPosition = cc.v2(0, 0);
        this._data = cc.resources.get(ani, cc.JsonAsset).json;
        this._ani = ani;
        this._entity = entity;
        var scaleX = this._entity.node.scaleX;
        var scaleY = this._entity.node.scaleY;
        this._shadow = shadow;
        this._shadowInitPos = this._shadow.position;
        this._towards = towards;
        this._commonAvatar = commonAvatar;
        this._effects = {};
        this._layers = [];
        for (let i in this._data.layers) {
            var v = this._data.layers[i];
            var layer = new FlashElement(this, this._towards, v, scaleX, scaleY);
            this._layers.push(layer);
        }
        this._finish = false;
        this._start = false;
        this._isLoop = isLoop;
        this._callback = callback;
        this._enableSound = true;
        cc.director.getScheduler().enableForTarget(this);
    }

    public setSoundEnable(e) {
        this._enableSound = e;
    }

    public getStartPosition() {
        return this._startPosition;
    }

    public start() {
        this._start = true;
        this._totalDt = 0;
        cc.director.getScheduler().schedule(this._update, this, 0);
        // if (this._commonAvatar) {
        //     this._commonAvatar.schedule(this._update.bind(this), 0);
        // }
    }

    public createSymbol(name, extras): cc.Node {
        if (name == 'body') {
            return this._entity.node;
        } else if (name == 'shadow') {
            return this._shadow;
        }
        var effect = null;
        if (!extras) {
            effect = this._createEffect(name, true);
        }
        effect = this._createEffect(name);
        return effect;
    }

    private _createEffect(name, isExtras?): cc.Node {
        if (!this._commonAvatar) {
            return;
        }
        if (this._effects[name]) {
            return this._effects[name].node;
        }
        var towards = this._towards;
        if (isExtras) {
            towards = 1;
        }
        var effect = SpineNode.create();
        var path = Path.getFightEffectSpine(name);
        effect.setAsset(path);
        effect.signalComplet.addOnce(function () {
            effect.resetSkeletonPose();
        });
        effect.setAnimation('effect', false);
        effect.node.scaleX = (towards);
        this._commonAvatar.node.addChild(effect.node);
        effect.node.zIndex = (this._entity.node.zIndex - 1);
        this._effects[name] = effect;
        return effect.node;
    }

    private _onFinish() {
        this._finish = true;
        if (this._commonAvatar) {
            this._commonAvatar.setAction('idle', true);
        } else {
            this._entity.setAnimation('idle', true);
        }
        if (this._commonAvatar) {
            // this._commonAvatar.unschedule(this._update);
            this._commonAvatar = null;
        }
        cc.director.getScheduler().unschedule(this._update, this);
        this._entity.node.setPosition(0, 0);
        if (this._shadow) {
            this._shadow.setPosition(this._shadowInitPos);
        }
        for (let i in this._effects) {
            var v = this._effects[i];
            v.destroy();
        }

        this._effects = null;
    }

    public finish() {
        this._onFinish();
    }

    private _update(dt) {
        if (this._start == true && this._finish == false) {
            var events = this._data.events;
            var event = events[this._frame.toString()];
            if (event != null) {
                for (let i in event) {
                    var v = event[i];
                    if (v.type == 'animation') {
                        if (this._commonAvatar) {
                            this._commonAvatar.setAction(v.value1);
                        } else {
                            this._entity.setAnimation(v.value1);
                        }
                    } else if (v.type == 'sound' && this._enableSound) {
                        G_AudioManager.playSound(Path.getFightSound(v.value1));
                    }
                }
            }
        }
        for (let i in this._layers) {
            var v = this._layers[i];
            v.update(this._frame);
        }
        this._totalDt = this._totalDt + dt;
        var frames = Math.floor(this._totalDt / this.effectDesignInterval);
        this._frame = frames;
        if (this._frame >= this._data.frameCount) {
            if (this._isLoop) {
                this._frame = 0;
                this._totalDt = 0;
            } else {
                this._onFinish();
            }
            if (this._callback) {
                this._callback();
            }
        }
    }
}