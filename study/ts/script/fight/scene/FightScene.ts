import { G_ResolutionManager } from "../../init";
import { PrioritySignal } from "../../utils/event/PrioritySignal";
import EffectScreen from "./EffectScreen";
import FightViewport from "./FightViewport";
import Projectile from "./Projectile";
import SceneView from "./SceneView";
import SkillEffect from "./SkillEffect";
import StateCamera from "./StateCamera";
const { ccclass, property } = cc._decorator;
@ccclass
export default class FightScene extends cc.Component {

    private _background: number;

    private _position: number[];
    private _positionFrame: number[];
    private _positionLast: number[];
    private _vp: number[];
    private _vpFrame: number[];
    private _vpLast: number[];
    private _scale: number[];
    private _scaleFrame: number[];
    private _scaleLast: number[];

    private _states: StateCamera[];
    private _backContaienr: cc.Node;
    private _contaienr: cc.Node;
    private _viewContaienr: cc.Node;
    private _view: SceneView;
    private _frontContaienr: cc.Node;
    private _viewport: FightViewport;

    private _frontEffects: EffectScreen[];
    private _projectiles: Projectile[];
    private _skillEffects: SkillEffect[];

    public signalStateFinish;

    public init(background) {

        this._background = background;

        this._position = [0, 0];
        this._positionFrame = [0, 0];
        this._positionLast = [0, 0];
        this._vp = [0.5, 0.5];
        this._vpFrame = [0.5, 0.5];
        this._vpLast = [0.5, 0.5];
        this._scale = [0, 0];
        this._scaleFrame = [0, 0];
        this._scaleLast = [0, 0];

        this._states = [];

        this._backContaienr = new cc.Node("_backContaienr");
        this._backContaienr.setAnchorPoint(0.5, 0.5);
        this.node.addChild(this._backContaienr);

        this._contaienr = new cc.Node("_contaienr");
        this.node.addChild(this._contaienr);

        this._viewContaienr = new cc.Node("_viewContaienr");
        this._viewContaienr.setAnchorPoint(cc.v2(0.5, 0.5));
        let size = G_ResolutionManager.getDesignCCSize();
        this._viewContaienr.setContentSize(size);
        this._contaienr.addChild(this._viewContaienr);

        this._view = new cc.Node("_view").addComponent(SceneView);
        this._view.init();
        this._viewContaienr.addChild(this._view.node);
        this._view.node.setPosition(0, 0);
        this._view.resetScene(this._background);

        this._frontContaienr = new cc.Node("_frontContaienr");
        this.node.addChild(this._frontContaienr);

        this._viewport = new FightViewport();
        this._viewport.init(this, size.width, size.height);
        this.signalStateFinish = new PrioritySignal('string');

        this._frontEffects = [];
        this._projectiles = [];
        this._skillEffects = [];
    }

    public getView(): SceneView {
        return this._view;
    }

    public getFlashGround() {
        return this._view.getFlashGround();
    }

    public addEntity(entity: cc.Node) {
        this._view.addEntityActor(entity);
    }

    public removeEntity(entity) {
        this._view.removeEntityActor(entity);
    }

    public addTipView(view) {
        this._view.addTipView(view);
    }

    public createEffectBySceneFront(name: string, towards?: number): EffectScreen {
        let effect = new cc.Node(name).addComponent(EffectScreen);
        this.addEntityByFront(effect.node);
        this._frontEffects.push(effect);
        effect.init(name, towards);
        effect.setStart();
        return effect;
    }

    public createProjectile(skillPlay, targets, startP: cc.Vec2, endP: cc.Vec2, attackId): Projectile {
        let projectile = new cc.Node(skillPlay.bullet_res_id).addComponent(Projectile);
        this._projectiles.push(projectile);
        projectile.init(skillPlay, targets, endP, attackId);
        this.addEntity(projectile.node);
        projectile.node.setPosition(startP.x, startP.y);
        projectile.setStart();
        return projectile;
    }

    public createSkillEffect(name, zOrderFix, towards?): SkillEffect {
        let skillEffect = new cc.Node(name).addComponent(SkillEffect);
        this._skillEffects.push(skillEffect);
        skillEffect.init(name, zOrderFix, towards);
        this.addEntity(skillEffect.node);
        skillEffect.setStart();
        return skillEffect;
    }

    public addEntityByFront(entity: cc.Node) {
        this._frontContaienr.addChild(entity);
    }

    public removeEntityByFront(entity: cc.Node) {
        entity.destroy();
    }

    public stopFlash() {
        this._viewport.stop();
        this._view.getFlashGround().node.active = false;

        for (let i = 0; i < this._frontEffects.length; i++) {
            this.removeEntityByFront(this._frontEffects[i].node);
        }
        this._frontEffects = [];

        for (let i = 0; i < this._projectiles.length; i++) {
            this.removeEntity(this._projectiles[i].node);
        }
        this._projectiles = [];

        for (let i = 0; i < this._skillEffects.length; i++) {
            this.removeEntity(this._skillEffects[i].node);
        }
        this._skillEffects = [];
    }

    public shake(ampX, ampY, atteCoef, timeCoef) {
        this._view.shake(ampX, ampY, atteCoef, timeCoef);
    }

    public tipHit(pos, value, crit) {
        console.error("[FightScene] tipHit");
        // var tip = new (require('HitTipView'))(value);
        // this._view.addViewObject(tip);
        // tip.setPosition(pos);
        // tip.popup();
    }

    public setViewport(pos) {
        if (pos == null) {
            return;
        }
        var sx = (pos.x + 568) / 1136;
        var sy = (pos.y + 320) / 640;
        this._vp[0] = sx;
        this._vp[1] = sy;
    }

    public getViewport(): cc.Vec2 {
        var anchorPoint = this._viewContaienr.getAnchorPoint();
        var point = cc.v2(1136 * anchorPoint.x - 568, 640 * anchorPoint.y - 320);
        return point;
    }

    public startFlashViewport(id, towards) {
        this._viewport.setStart(id, towards);
    }

    public setFlashPosition(x, y) {
        this._position[0] = x;
        this._position[1] = y;
    }

    public getFlashPosition() {
        return [
            this._position[0],
            this._position[1]
        ];
    }

    public setFlashScale(x, y) {
        this._scale[0] = x;
        this._scale[1] = y;
    }

    public addState(state:StateCamera) {
        this._states.push(state);
    }

    public setState(state:StateCamera) {
        this._states = [];
        this.addState(state);
    }

    public clearState() {
        this._states = [];
    }

    public onStateFinish(state:StateCamera) {
        if (state.isBack()) {
            this.signalStateFinish.dispatch("StateCamera");
        }
    }

    public logicUpdate(f) {
        this._viewport.setUpdate();
        this._positionLast[0] = this._position[0];
        this._positionLast[1] = this._position[1];
        this._vpLast[0] = this._vp[0];
        this._vpLast[1] = this._vp[1];
        this._scaleLast[0] = this._scale[0];
        this._scaleLast[1] = this._scale[1];
        if (this._states.length > 0) {
            var state = this._states[0];
            if (state.isStart() == false) {
                state.setStart();
            }
            this.setViewport(state.setUpdate(f));
            if (state.isFinish()) {
                this._states.splice(0, 1);
                this.onStateFinish(state);
            }
        }

        for (let i = 0; i < this._frontEffects.length; i++) {
            if (this._frontEffects[i].isRemove()) {
                this.removeEntityByFront(this._frontEffects[i].node);
                this._frontEffects.splice(i, 1);
                i > 0 ? i-- : i = 0;
            }
        }

        for (let i = 0; i < this._projectiles.length; i++) {
            if (this._projectiles[i].isRemove()) {
                this.removeEntity(this._projectiles[i].node);
                this._projectiles.splice(i, 1);
                i > 0 ? i-- : i = 0;
            }
        }

        for (let i = 0; i < this._skillEffects.length; i++) {
            if (this._skillEffects[i].isRemove()) {
                this.removeEntity(this._skillEffects[i].node);
                this._skillEffects.splice(i, 1);
                i > 0 ? i-- : i = 0;
            }
            else
            {
                this._skillEffects[i].logicUpdate(f);
            }
        }
    }

    public updateFrame(f) {
        if (this._positionFrame[0] != this._position[0] || this._positionFrame[1] != this._position[1]) {
            this._positionFrame[0] = this._positionLast[0] + (this._position[0] - this._positionLast[0]) * f;
            this._positionFrame[1] = this._positionLast[1] + (this._position[1] - this._positionLast[1]) * f;
            this._contaienr.setPosition(this._positionFrame[0], this._positionFrame[1]);
        }
        if (this._vpFrame[0] != this._vp[0] || this._vpFrame[1] != this._vp[1]) {
            this._vpFrame[0] = this._vpLast[0] + (this._vp[0] - this._vpLast[0]) * f;
            this._vpFrame[1] = this._vpLast[1] + (this._vp[1] - this._vpLast[1]) * f;
            this._viewContaienr.setAnchorPoint(cc.v2(this._vpFrame[0], this._vpFrame[1]));
        }
        if (this._scaleFrame[0] != this._scale[0] || this._scaleFrame[1] != this._scale[1]) {
            this._scaleFrame[0] = this._scaleLast[0] + (this._scale[0] - this._scaleLast[0]) * f;
            this._scaleFrame[1] = this._scaleLast[1] + (this._scale[1] - this._scaleLast[1]) * f;
            this._contaienr.setScale(this._scaleFrame[0], this._scaleFrame[1]);
        }

        for (let i = 0; i < this._frontEffects.length; i++) {
            this._frontEffects[i].frameFrame(f);
        }

        for (let i = 0; i < this._projectiles.length; i++) {
            this._projectiles[i].frameFrame(f);
        }

        for (let i = 0; i < this._skillEffects.length; i++) {
            this._skillEffects[i].frameFrame(f);
        }
    }

    public addCameraState(targetPos, time, isBack) {
        var stateCamera = new StateCamera(this.getViewport(), targetPos, time, isBack, this._view.showSkill3Layer.bind(this._view));
        this.addState(stateCamera);
    }

    public addDropItem(stageId, awards) {
        this._view.addDrop(stageId, awards);
    }

    public changeBG(name) {
        this._view.resetScene(name);
    }
}