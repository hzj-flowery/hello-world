import { G_EffectGfxMgr } from "../../init";
import { assert } from "../../utils/GlobleFunc";
import { Path } from "../../utils/Path";
import { HeroSpineNode } from "../node/HeroSpineNode";
import CommonIconBase from "./CommonIconBase";
import CommonUI from "./CommonUI";




const { ccclass, property } = cc._decorator;
@ccclass
export default class CommonGrainCarAvatar extends cc.Component {

    static SPINE_RES_NAME = [
        'kuangzhanliangche',
        'kuangzhanniuche',
        'kuangzhanmache',
        'kuangzhanxiniuche',
        'kuangzhandaxiangche'
    ];
    static ACTION_IDLE = 1;
    static ACTION_RUN = 2;
    static ACTION_DEAD = 3;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCar: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatarEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_car: cc.Node = null;

    private _scaleEx = 1.5;
    private _curAction = null;
    private _idGGG = null;
    private _turnBack = false;
    private _spineHero: HeroSpineNode;
    hasLoaded:boolean = false;
    onLoad() {
        // this._scaleEx = 1.5;
        if (!this.hasLoaded) {
            this.hasLoaded = true;
            this._curAction = null;
            this._idGGG = null;
            this._turnBack = false;
            this._init();
        }
    }
    _init() {
        this._spineHero = HeroSpineNode.create();
        this._node_car.addChild(this._spineHero.node);
        this._createDeadEffect();
    }
    updateUI(id) {
        assert(id, 'CommonGrainCarAvatar\'s id can\'t be nil ');
        if (this._idGGG == id) {
            return;
        }
        this._curAction = null;
        this._idGGG = id;
        this._initSpine(id);
    }
    turnBack(needBack) {
        if (this._spineHero) {
            if (needBack == null || needBack == true) {
                this._turnBack = true;
                this._imageCar.node.scaleX = (-this._scaleEx * HeroSpineNode.SCALE);
                this._spineHero.setScaleX(-this._scaleEx);
            } else if (needBack == false) {
                this._turnBack = false;
                this._imageCar.node.scaleX = (this._scaleEx * HeroSpineNode.SCALE);
                this._spineHero.setScaleX(this._scaleEx);
            }
        }
    }
    playIdle() {
        if (this._curAction == CommonGrainCarAvatar.ACTION_IDLE) {
            return;
        }
        this._curAction = CommonGrainCarAvatar.ACTION_IDLE;
        this._spineHero.setAnimation('idle', true);
        this._spineHero.node.active = (true);
        this._imageCar.node.active = (false);
        this._nodeAvatarEffect.active = (false);
    }
    playRun() {
        if (this._curAction == CommonGrainCarAvatar.ACTION_RUN) {
            return;
        }
        this._curAction = CommonGrainCarAvatar.ACTION_RUN;
        this._spineHero.setAnimation('run', true);
        this._spineHero.node.active = (true);
        this._imageCar.node.active = (false);
        this._nodeAvatarEffect.active = (false);
    }
    playDead() {
        if (this._curAction == CommonGrainCarAvatar.ACTION_DEAD) {
            return;
        }
        this._curAction = CommonGrainCarAvatar.ACTION_DEAD;
        this._imageCar.node.addComponent(CommonUI).loadTexture(Path.getGrainCar('car_dead_' + this._idGGG));
        this._spineHero.node.active = (false);
        this._imageCar.node.active = (true);
        this._nodeAvatarEffect.active = (true);
    }
    _createDeadEffect() {
        function effectFunction(effect) {
            return new cc.Node();
        }
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeAvatarEffect, 'moving_biaochesunhuai', effectFunction, eventFunction, false);
    }
    setScale(scale) {
        scale = scale || 0.5;
        this._scaleEx = scale;
        if (this._spineHero) {
            this._spineHero.setScale(scale);
            this._imageCar.node.setScale(scale * HeroSpineNode.SCALE);
            if (this._turnBack) {
                this._spineHero.setScaleX(-scale);
                this._imageCar.node.scaleX = (-scale * HeroSpineNode.SCALE);
            }
        }
    }
    _initSpine(id) {
        var resJson = this._getSpineData(id);
        this._spineHero.setAsset(resJson);
        this._spineHero.setScale(this._scaleEx);
        this._imageCar.node.setScale(this._scaleEx * HeroSpineNode.SCALE);
    }
    _getSpineData(id) {
        return Path.getEffectSpine(CommonGrainCarAvatar.SPINE_RES_NAME[id-1]);
    }


}