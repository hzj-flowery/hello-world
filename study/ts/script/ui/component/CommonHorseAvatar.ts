import { G_EffectGfxMgr } from "../../init";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { HeroSpineNode } from "../node/HeroSpineNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHorseAvatar extends cc.Component {

    @property({ type: cc.Sprite, visible: true })
    _imageShadow: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffectDown: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeHorse: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffectUp: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelClick: cc.Node = null;

    private static EFFECT_NAME = {
        [3]: { down: "moving_zhanma_lanse_down", up: "moving_zhanma_lanse_up" },
        [4]: { down: "moving_zhanma_zise_down", up: "moving_zhanma_zise_up" },
        [5]: { down: "moving_zhanma_chengse_down", up: "moving_zhanma_chengse_up" },
    }

    private _horseId = 0;
    private _scale = 0.5;
    private _spineHorse: HeroSpineNode;
    private _scaleEx=1;
    private _userData;
    private _convertType;
    private _avatarEffectDown;
    private _avatarEffectUp;
    private _callback;
    onLoad() {
        var button = this._panelClick.addComponent(cc.Button);
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "CommonHorseAvatar";
        clickEventHandler.handler = "_onTouchCallBack";
        button.clickEvents = [];
        button.clickEvents.push(clickEventHandler);
    }

    public setConvertType(type) {
        if (type && type > 0) {
            this._convertType = type;
        }
    }

    public _getSpineData(horseId, animSuffix) {
        this._convertType = this._convertType || TypeConvertHelper.TYPE_HORSE;
        var horseData = TypeConvertHelper.convert(this._convertType, horseId);
        var resId = horseData.cfg.res_id;
        animSuffix = animSuffix || '';
        return Path.getSpine(resId + animSuffix);
    }

    public _init() {

    }

    public updateUI(horseId, animSuffix?, notPlayIdle?) {
        this._initSpine(horseId, animSuffix);
        if (!notPlayIdle) {
            this._spineHorse.setAnimation('idle', true);
        }
    }

    public setScale(scale) {
        scale = scale || 0.5;
        this._scaleEx = scale;
        if (this._spineHorse) {
            this._spineHorse.node.setScale(scale);
        }
        if (this._imageShadow) {
            this._imageShadow.node.setScale(scale);
        }
    }

    public turnBack(needBack) {
        if (this._spineHorse) {
            if (needBack == null || needBack == true) {
                this._spineHorse.node.scaleX = (-this._scaleEx);
            } else if (needBack == false) {
                this._spineHorse.node.scaleX = (this._scaleEx);
            }
        }
    }

    public setSpineVisible(needShow) {
        if (this._spineHorse) {
            this._spineHorse.node.active = (needShow);
        }
    }

    public _initSpine(horseId, animSuffix) {
        if (this._spineHorse == null) {
            this._spineHorse = HeroSpineNode.create();
            this._nodeHorse.addChild(this._spineHorse.node);
        }
        this._horseId = horseId;
        var resJson = this._getSpineData(horseId, animSuffix);
        this._spineHorse.setAsset(resJson);
    }

    public setCallBack(callback) {
        if (this._callback) {
            this._callback = null;
        }
        this._callback = callback;
    }

    public _onTouchCallBack(sender) {

        if (this._callback) {
            this._callback(this._userData);
        }
    }

    public showShadow(visible) {
        this._imageShadow.node.active = (visible);
    }

    public setShadowScale(scale) {
        this._imageShadow.node.setScale(scale);
    }

    public resetAnimation()
    {
        this._spineHorse.setAnimation('idle', true);
    }

    public playAnimationOnce(name) {
        this._spineHorse.setAnimation(name, false);
        this._spineHorse.signalComplet.addOnce(function () {
            this._spineHorse.setAnimation('idle', true);
        }.bind(this));
    }

    public getBaseId() {
        if (this._horseId) {
            return this._horseId;
        }
        return 0;
    }

    public setDark() {
        this._spineHorse.node.color = new cc.Color(255 * 0.4, 255 * 0.4, 255 * 0.4);
    }

    public setLight() {
        this._spineHorse.node.color = new cc.Color(255, 255, 255);
    }

    public setAniTimeScale(timeScale) {
        var setTimeScale = function (spine) {
            if (spine != null) {
                spine.setTimeScale(timeScale);
            }
        };
        setTimeScale(this._spineHorse);
    }

    public setTouchEnabled(enable) {
        let button = this._panelClick.getComponent(cc.Button);
        if (button) {
            button.interactable = enable;
        }
    }

    public getNodeHorse() {
        return this._nodeHorse;
    }

    public setUserData(userData) {
        this._userData = userData;
    }

    public getUserData() {
        return this._userData;
    }

    public showEffect(show) {
        if (show) {
            this._convertType = this._convertType || TypeConvertHelper.TYPE_HORSE;
            var param = TypeConvertHelper.convert(this._convertType, this._horseId);
            var names = CommonHorseAvatar.EFFECT_NAME[param.color];
            if (this._avatarEffectDown == null && names) {
                this._avatarEffectDown = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffectDown, names.down, null, null, false);
            }
            if (this._avatarEffectUp == null && names) {
                this._avatarEffectUp = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffectUp, names.up, null, null, false);
            }
        } else {
            if (this._avatarEffectDown) {
                this._avatarEffectDown.runAction(cc.destroySelf());
                this._avatarEffectDown = null;
            }
            if (this._avatarEffectUp) {
                this._avatarEffectUp.runAction(cc.destroySelf());
                this._avatarEffectUp = null;
            }
        }
    }
}
