import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { G_ConfigLoader } from "../../../init";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import HitTipParticle from "./HitTipParticle";

export default class HitTipAngerBuff extends HitTipParticle {

    private _buffId;
    private _damageValue: number;
    private _resId;

    public init(buffId, damageValue) {
        this.initHitTip("anger_buff");
        this.node.name = "HitTipAngerBuff";
        this._buffId = buffId;
        this._damageValue = damageValue;
        this._resId = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(buffId).buff_tween_pic;
        this._tween = 0;
        let width = 0;
        let height = 0;
        if (this._resId != '') {
            let spriteBuff = new cc.Node(this._resId).addComponent(cc.Sprite);
            spriteBuff.spriteFrame = cc.resources.get(Path.getBuffText(this._resId), cc.SpriteFrame);
            this._node.addChild(spriteBuff.node);
            this._tween = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(buffId).buff_tween);
            spriteBuff.node.setAnchorPoint(0, 0.5);
            width = spriteBuff.node.getContentSize().width;
            height = spriteBuff.node.getContentSize().height;
        }
        var label: cc.Label = null;
        var strValue = damageValue;
        if (damageValue > 0) {
            label = UIHelper.createWithCharMap(Path.getBattleFontLableAtlas('buff_01shuzi'));
            strValue = '+' + damageValue;
        } else if (damageValue < 0) {
            label = UIHelper.createWithCharMap(Path.getBattleFontLableAtlas('buff_02shuzi'));
            strValue = damageValue;
        }
        if (label) {
            label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            label.verticalAlign = cc.Label.VerticalAlign.CENTER;
            label.fontSize = 36;
            label.lineHeight = 36;
            this._node.addChild(label.node);
            label.string = (strValue);
            label.node.setAnchorPoint(0, 0.5);
            label.node.x = (width);
            width = width + label.node.width;
        }
        this._node.setContentSize(width, height);
        this._node.setAnchorPoint(0.5, 0.5);
        this._height = height;
    }
    public popup() {
        if (this._tween == 0) {
            this._runUpAction();
        } else if (this._tween == 1) {
            this._runMiddleAction();
        } else if (this._tween == 2) {
            this._runDownAction();
        }
    }
}