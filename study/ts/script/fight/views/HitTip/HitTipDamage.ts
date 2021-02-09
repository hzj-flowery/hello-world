import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { G_ConfigLoader } from "../../../init";
import CustomNumLabel from "../../../ui/number/CustomNumLabel";
import { Path } from "../../../utils/Path";
import { FightConfig } from "../../FightConfig";
import HitTipParticle from "./HitTipParticle";

export default class HitTipDamage extends HitTipParticle {

    private static HURT_SHAN_BI = 1
    private static HURT_CRIT = 2
    private static HURT_GE_DANG = 3
    private static HURT_WU_DI = 4
    private static HURT_XI_SHOU = 5
    private static spriteName = {
        [1]: Path.getTextBattle("zhuangtai_teshu_b_01shanbi"),
        [2]: Path.getTextBattle("txt_battle_crit"),
        [3]: Path.getTextBattle("gedang"),
        [4]: Path.getTextBattle("zhuangtai_teshu_b_01wudi"),
        [5]: Path.getTextBattle("zhuangtai_teshu_b_01xishou"),
        [99]: Path.getTextBattle("txt_taoyuanjieyi"),
        [100]: Path.getTextBattle("txt_fentan"),
    }
    private static spriteNameHeal =
        {
            [1]: Path.getTextBattle("zhuangtai_teshu_b_01shanbi"),
            [2]: Path.getTextBattle("txt_battle_heal"),
            [3]: Path.getTextBattle("gedang"),
            [4]: Path.getTextBattle("zhuangtai_teshu_b_01wudi"),
            [5]: Path.getTextBattle("zhuangtai_teshu_b_01xishou"),
            [99]: Path.getTextBattle("zhuangtai_teshu_b_01xinsheng"),
        }

    private _crit: boolean;
    private _posX;
    private _width;
    private _hasXiShou;
    private _label: CustomNumLabel;

    public init(value, info, type) {
        this.initHitTip(type);
        this.node.name = "HitTipDamage";
        this._crit = false;
        this._posX = 0;
        this._width = 0;
        this._height = 0;
        this._tween = 0;
        this._hasXiShou = false;
        if (type == 'damage') {
            for (let i = 0; i < info.length; i++) {
                var hurtValue = info[i];
                if (hurtValue.hurtId == FightConfig.HURT_TYPE_XISHOU && hurtValue.hurtValue) {
                    this._hasXiShou = true;
                }
                this._createHurtType(hurtValue.hurtId, hurtValue.hurtValue, value);
            }
        } else {
            this._createBuffType(info);
        }
        this._label = null;
        if (value > 0) {
            this._label = this.createValueLabel(HitTipParticle.TYPE_HEAL, this._crit, value);
        } else if (value < 0) {
            this._label = this.createValueLabel(HitTipParticle.TYPE_DAMAGE, this._crit, value);
        }
        if (this._label) {
            this._node.addChild(this._label.node);
            this._label.node.x = this._posX;
            this._width = this._width + this._label.node.getContentSize().width / 2;
            if (this._height == 0) {
                this._height = this._label.node.getContentSize().height;
            }
        }
        this._node.setContentSize(this._width, this._height);
        this._node.setAnchorPoint(0.5, 0.5);
    }

    private _createHurtType(hurtId, hurtValue, value) {
        if (hurtId == FightConfig.HURT_TYPE_XISHOU && value != 0) {
            return;
        }
        if (hurtId == 0) {
            return;
        }
        if (this._hasXiShou && hurtId != FightConfig.HURT_TYPE_XISHOU && value == 0) {
            return;
        }
        let frames: any = HitTipDamage.spriteName;
        if (value > 0) {
            frames = HitTipDamage.spriteNameHeal;
        }
        let spriteHurtType = new cc.Node("_hurtType").addComponent(cc.Sprite);
        spriteHurtType.spriteFrame = cc.resources.get(frames[hurtId], cc.SpriteFrame);
        if (hurtId == HitTipDamage.HURT_CRIT) {
            this._crit = true;
        }
        spriteHurtType.node.setAnchorPoint(0, 0.5);
        spriteHurtType.node.x = (this._posX);
        this._posX = this._posX + spriteHurtType.node.getContentSize().width;
        this._width = this._width + spriteHurtType.node.getContentSize().width;
        this._height = spriteHurtType.node.getContentSize().height;
        this._node.addChild(spriteHurtType.node);
    }

    private _createBuffType(buffId) {
        var buffData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_EFFECT).get(buffId);
        var resId = buffData.buff_tween_pic;
        if (resId != '') {
            let spriteBuff = new cc.Node("_buffType").addComponent(cc.Sprite);
            spriteBuff.spriteFrame = cc.resources.get(Path.getBuffText(resId), cc.SpriteFrame);
            spriteBuff.node.setAnchorPoint(0, 0.5);
            var size = spriteBuff.node.getContentSize();
            this._posX = this._posX + spriteBuff.node.getContentSize().width;
            this._width = this._width + spriteBuff.node.getContentSize().width;
            this._height = size.height;
            this._node.addChild(spriteBuff.node);
        }
    }

    public popup() {
        if (this._tween == 0) {
            this._runUpAction();
        } else if (this._tween == 1) {
            this._runMiddleAction();
        } else if (this._tween == 2) {
            this._runDownAction();
        } else {
            if (this._crit) {
                this._runCritAction();
            } else {
                this._runDamageAction();
            }
        }
    }
}