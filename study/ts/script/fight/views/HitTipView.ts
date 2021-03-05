import HitTipDamage from "./HitTip/HitTipDamage";
import HitTipBuff from "./HitTip/HitTipBuff";
import HitTipAngerBuff from "./HitTip/HitTipAngerBuff";
import HitTipFeature from "./HitTip/HitTipFeature";
import HitTipParticle from "./HitTip/HitTipParticle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HitTipView extends cc.Component {

    private _tips: HitTipParticle[];
    private _tipBuffs: HitTipParticle[];
    private _startPosY: number;

    public init() {
        this._tips = [];
        this._tipBuffs = [];
        this._startPosY = 0;
    }
    public popup(value, hitInfo, type, position, callback?) {
        position.y = position.y + 180;
        this._startPosY = position.y;
        var tip: HitTipParticle = null;
        if (type == 'damage' || type == 'buff_damage') {
            tip = new cc.Node().addComponent(HitTipDamage)
            tip.init(value, hitInfo, type);
        } else if (type == 'buff') {
            tip = new cc.Node().addComponent(HitTipBuff)
            tip.init(hitInfo);
        } else if (type == 'anger_buff') {
            tip = new cc.Node().addComponent(HitTipAngerBuff)
            tip.init(hitInfo, value);
        } else if (type == 'feature') {
            tip = new cc.Node().addComponent(HitTipFeature)
            tip.init(value, callback);
        }
        if (tip) {
            this.node.addChild(tip.node);
            if (tip.getType() == 'feature') {
                var pos = cc.v2(position.x, position.y - 50);
                tip.setPosition(pos);
                tip.popup();
            } else if (tip.getType() != 'buff' && tip.getType() != 'anger_buff') {
                tip.setPosition(position);
                this._tips.unshift(tip);
                this._resetTipOrder();
                tip.popup();
            } else {
                tip.setPosition(position);
                this._tipBuffs.push(tip);
                this._resetTipBuffOrder();
                tip.popup();
            }
        }
    }

    private _resetTipOrder() {
        var tips: HitTipParticle[] = [];

        for (let i = 0; i < this._tips.length; i++) {
            var v: HitTipParticle = this._tips[i];
            if (!v.isFinish()) {
                tips.push(v);
            }
        }

        for (let i = 0; i < tips.length; i++) {
            var v: HitTipParticle = tips[i];
            var posx = v.node.getPosition().x;
            v.node.setPosition(posx + (i + 1) * 2, this._startPosY + (i + 1) * 20);
        }

        this._tips = tips;
    }

    private _resetTipBuffOrder() {
        var tips: HitTipParticle[] = [];
        var posY = this._startPosY;
        for (let i = 0; i < this._tipBuffs.length; i++) {
            var v: HitTipParticle = this._tipBuffs[i];
            if (!v.isFinish()) {
                tips.push(v);
            }
        }
        tips.sort(function (a, b) {
            return a.getActionType() - b.getActionType();
        });

        for (let i = 0; i < tips.length; i++) {
            var v: HitTipParticle = tips[i];
            var posx = v.node.getPosition().x;
            v.node.setPosition(posx, posY);
            var height = v.getHeight();
            posY = posY - height;
        }
        this._tipBuffs = tips;
    }
}