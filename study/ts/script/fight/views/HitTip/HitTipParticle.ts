import CustomNumLabel from "../../../ui/number/CustomNumLabel";
import { Path } from "../../../utils/Path";
import { G_EffectGfxMgr } from "../../../init";
import { handler } from "../../../utils/handler";

export default class HitTipParticle extends cc.Component {

    protected static TYPE_DAMAGE = 1
    protected static TYPE_HEAL = 2
    protected _isFinish: boolean;
    protected _type: string;
    protected _node: cc.Node;
    protected _tween: number;
    protected _height: number;

    public init(...args)
    {

    }

    public initHitTip(type: string) {
        this._isFinish = false;
        this._type = type;
        this._node = new cc.Node();
        this.node.addChild(this._node);
        this._tween = 0;
        this._height = 0;
    }

    public isFinish() {
        return this._isFinish;
    }

    public popup() {
    }

    onFinish() {
        this.node.active = (false);
        this._isFinish = true;
    }

    public createValueLabel(type, isCrit, value) {
        var label: CustomNumLabel = null;
        if (type == HitTipParticle.TYPE_DAMAGE) {
            if (isCrit) {
                label = new cc.Node("num_battle_crit").addComponent(CustomNumLabel)
                label.init('num_battle_crit', Path.getBattleDir(), value, null, null, true);
            } else {
                label = new cc.Node("num_battle_hit").addComponent(CustomNumLabel)
                label.init('num_battle_hit', Path.getBattleDir(), value, null, null, true);
            }
        } else if (type == HitTipParticle.TYPE_HEAL) {
            if (isCrit) {
                label = new cc.Node("num_battle_heal").addComponent(CustomNumLabel)
                label.init('num_battle_heal', Path.getBattleDir(), value, null, null, true);
            } else {
                label = new cc.Node("num_battle_heal").addComponent(CustomNumLabel)
                label.init('num_battle_heal', Path.getBattleDir(), value, null, null, true);
            }
        }
        return label;
    }

    public setPosition(pos: cc.Vec2) {
        this.node.setPosition(pos);
    }

    protected _runDamageAction() {
        G_EffectGfxMgr.applySingleGfx(this._node, 'smoving_putong_tiaozi', handler(this, this.onFinish), null, null);
    }

    protected _runCritAction() {
        G_EffectGfxMgr.applySingleGfx(this._node, 'smoving_baoji_tiaozi', handler(this, this.onFinish), null, null);
    }

    protected _runDownAction() {
        this._node.opacity = (51);
        this._node.setScale(1.8);
        var action1 = cc.spawn(cc.fadeIn(0.1), cc.scaleTo(0.1, 0.9));
        var action2 = cc.scaleTo(0.1, 1);
        var action3 = cc.delayTime(1);
        var action4 = cc.spawn(cc.moveBy(0.3, cc.v2(0, -14)), cc.fadeOut(0.3));
        var callFunc = cc.callFunc(handler(this, this.onFinish));
        var action = cc.sequence(action1, action2, action3, action4, callFunc);
        this._node.runAction(action);
    }

    protected _runUpAction() {
        this._node.opacity = (51);
        this._node.setScale(1.8);
        var action1 = cc.spawn(cc.fadeIn(0.1), cc.scaleTo(0.1, 0.9));
        var action2 = cc.scaleTo(0.1, 1);
        var action3 = cc.delayTime(1);
        var action4 = cc.spawn(cc.moveBy(0.3, cc.v2(0, 14)), cc.fadeOut(0.3));
        var callFunc = cc.callFunc(handler(this, this.onFinish));
        var action = cc.sequence(action1, action2, action3, action4, callFunc);
        this._node.runAction(action);
    }

    protected _runMiddleAction() {
        this._node.opacity = (51);
        this._node.setScale(0.8);
        var action1 = cc.spawn(cc.fadeIn(0.1), cc.scaleTo(0.1, 1.8));
        var action2 = cc.scaleTo(0.1, 1);
        var action3 = cc.delayTime(1);
        var action4 = cc.fadeOut(0.3);
        var callFunc = cc.callFunc(handler(this, this.onFinish));
        var action = cc.sequence(action1, action2, action3, action4, callFunc);
        this._node.runAction(action);
    }

    public getActionType() {
        return this._tween;
    }

    public getHeight() {
        return this._height;
    }

    public getType() {
        return this._type;
    }
}