import { G_EffectGfxMgr } from "../../init";
import { assert } from "../../utils/GlobleFunc";
import { handler } from "../../utils/handler";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { HeroSpineNode } from "../node/HeroSpineNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHistoryAvatar extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageShadow: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHero: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatarEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelClick: cc.Node = null;
    _heroId: number;
    _scale: number;
    _name: any;
    _spineHero: HeroSpineNode;
    _userData: any;
    _scaleEx: number;
    _avatarEffect: any;
    _itemParams: any;
    _convertType: any;
    _target: any;
    _callback: any;
    _height: any;
    _initMaterial: any;

    onLoad() {
        this._heroId = 0;
        this._scale = 0.5;
        this._name = null;
        this._spineHero = null;
        this._userData = null;
        this._scaleEx = 1;
        this._avatarEffect = null;
        this._itemParams = null;
        this._convertType = TypeConvertHelper.TYPE_HISTORY_HERO;
        this._init();
    }
    _init() {
        this._spineHero = HeroSpineNode.create();
        this._nodeHero.addChild(this._spineHero.node);
        UIHelper.addEventListenerToNode(this.node, this._panelClick, 'CommonHistoryAvatar', '_onTouchCallBack');
    }
    setConvertType(type) {
        if (type && type > 0) {
            this._convertType = type;
        }
    }
    getBaseId() {
        if (this._heroId) {
            return this._heroId;
        }
        return 0;
    }
    setName(ctrlname) {
        this.setName(name);
    }
    getItemParams() {
        return this._itemParams;
    }
    setTouchCallBack(callback) {
        if (this._callback) {
            this._callback = null;
        }
        this._callback = callback;
    }
    _onTouchCallBack(sender) {
        if (this._callback) {
            this._callback(this._userData);
        }
    }
    setUserData(userData) {
        this._userData = userData;
    }
    getUserData() {
        return this._userData;
    }
    updateUI(heroId, animSuffix?, notPlayIdle?, limitLevel?) {
        assert(heroId, 'CommonHistoryAvatar\'s heroId can\'t be nil ');
        this._initSpine(heroId, animSuffix, limitLevel);
        if (!notPlayIdle) {
            this._spineHero.setAnimation('idle', true);
        }
    }
    _getSpineData(heroId, animSuffix, limitLevel) {
        var heroData = TypeConvertHelper.convert(this._convertType, heroId, null, null, limitLevel);
        this._itemParams = heroData;
        var fightResId = heroData.res_cfg.fight_res;
        this._height = heroData.res_cfg.spine_height;
        animSuffix = animSuffix || '';
        return Path.getSpine(fightResId + animSuffix);
    }
    _initSpine(heroId, animSuffix, limitLevel) {
        this._heroId = heroId;
        var resJson = this._getSpineData(heroId, animSuffix, limitLevel);
        this._spineHero.setAsset(resJson);
    }
    setScale(scale) {
        scale = scale || 0.5;
        this._scaleEx = scale;
        if (this._spineHero) {
            this._spineHero.setScale(scale);
        }
        if (this._imageShadow) {
            this._imageShadow.node.setScale(scale);
        }
    }
    turnBack(needBack) {
        if (this._spineHero) {
            if (needBack == null || needBack == true) {
                this._spineHero.setScaleX(-this._scaleEx);
            } else if (needBack == false) {
                this._spineHero.setScaleX(this._scaleEx);
            }
        }
    }
    setSpineVisible(needShow) {
        if (this._spineHero) {
            this._spineHero.setVisible(needShow);
        }
    }
    playAnimationOnce(idleName) {
        this._spineHero.setAnimation(name, false);
        this._spineHero.signalComplet.addOnce(function () {
            this._spineHero.setAnimation('idle', true);
        });
    }
    showShadow(bVisible) {
        this._imageShadow.node.active = (bVisible);
    }
    updateOpcacity(opacity) {
        // var setColor = function (spine, opacity) {
        //     if (spine != null) {
        //         spine.setColor(cc.color(255 * opacity, 255 * opacity, 255 * opacity));
        //     }
        // };
        opacity = opacity == null ? 1 : opacity;
        this._spineHero.node.opacity = opacity;
        //setColor(this._spineHero, opacity);
    }
    public applyShader(shaderName?) {
        var spine = this._spineHero.getSpine();
        if (spine == null) {
            return;
        }
        this._initMaterial = this._initMaterial || spine.getMaterial(0);
        cc.resources.load(Path.getMaterial("builtin-2d-gray-spine"), cc.Material, (err, res: cc.Material) => {
            if (res != null && spine != null && spine.node != null && spine.node.isValid) {
                spine.setMaterial(0, res);
                spine.node.active = false;
                spine.node.active = true;
                // this.scheduleOnce(() => { spine.node.active = true }, 0.1);
            }
        })
    }

    public cancelShader() {
        var spine = this._spineHero.getSpine();
        if (spine == null || this._initMaterial == null) {
            return;
        }
        spine.setMaterial(0, this._initMaterial);
        spine.node.active = false;
        spine.node.active = true;
    }

    showAvatarEffect(show, scale) {
        scale = scale || 1;
        this._nodeAvatarEffect.setScale(scale);
        if (show) {
            if (this._avatarEffect == null) {
                this._avatarEffect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeAvatarEffect, 'moving_bianshenka', null, null, false);
            }
        } else {
            if (this._avatarEffect) {
                this._avatarEffect.runAction(cc.removeSelf());
                this._avatarEffect = null;
            }
        }
    }
    showName() {
    }
    setVisible(visible) {
        this.node.active = visible;
    }
}