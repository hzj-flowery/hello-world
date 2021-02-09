import { Colors } from "../../init";
import { Path } from "../../utils/Path";
import ShaderHelper from "../../utils/ShaderHelper";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { HeroSpineNode } from "../node/HeroSpineNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonSimpleHeroAvatar extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHero: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageShadow: cc.Sprite = null;
    _heroId: number;
    _scale: number;
    _spineHero: HeroSpineNode;
    _delayTime: number;
    _scaleEx: number;
    _userData: any;
    _height: number;
    _convertType: number;
    _avatarEffect: any;
    _target: any;
    _callback: any;


    ctor() {
        this._heroId = 0;
        this._scale = 0.5;
        this._spineHero = null;
        this._delayTime = 1;
        this._scaleEx = 1;
        this._userData = null;
        this._height = 0;
        this._convertType = TypeConvertHelper.TYPE_HERO;
        this._avatarEffect = null;
    }
    setConvertType(type) {
        if (type && type > 0) {
            this._convertType = type;
        }
    }
    _getSpineData(heroId, animSuffix, limitLevel) {
        var heroData = TypeConvertHelper.convert(this._convertType, heroId, null, null, limitLevel);
        var fightResId = heroData.res_cfg.fight_res;
        // if (petSmall) {
        //     if (this._convertType == TypeConvertHelper.TYPE_PET) {
        //         fightResId = fightResId + '_small';
        //     }
        // }
        this._height = heroData.res_cfg.spine_height;
        animSuffix = animSuffix || '';
        return Path.getSpine(fightResId + animSuffix);
    }
    _init(_target) {
        this.ctor();
        this._target = _target;
        this._textName.node.active = (false);
        this._spineHero = HeroSpineNode.create();
        this._nodeHero.addChild(this._spineHero.node);
    }
    updateUI(heroId, animSuffix, notPlayIdle, limitLevel) {
        // assert(heroId, 'CommonSimpleHeroAvatar\'s heroId can\'t be nil ');
        this._initSpine(heroId, animSuffix, limitLevel);
        if (!notPlayIdle) {
            this._spineHero.setAnimation('idle', true);
        }
    }
    setAction(name, loop) {
        if (this._spineHero) {
            this._spineHero.setAnimation(name, loop, true);
        }
    }
    setScale(scale) {
        scale = scale || 0.5;
        this._scaleEx = scale;
        if (this._spineHero) {
            this._spineHero.node.setScale(scale);
        }
        if (this._imageShadow) {
            this._imageShadow.node.setScale(scale);
        }
    }
    turnBack(needBack) {
        if (this._spineHero) {
            if (needBack == null || needBack == true) {
                this._spineHero.node.scaleX = (-this._scaleEx);
            } else if (needBack == false) {
                this._spineHero.node.scaleX = (this._scaleEx);
            }
        }
    }
    setSpineVisible(needShow) {
        if (this._spineHero) {
            this._spineHero.node.active = (needShow);
        }
    }
    _initSpine(heroId, animSuffix, limitLevel) {
        this._heroId = heroId;
        var resJson = this._getSpineData(heroId, animSuffix, limitLevel);
        this._spineHero.setAsset(resJson);
    }
    getSize() {
        return this._spineHero.node.getContentSize();
    }
    playAnimationOnce(name) {
        this._spineHero.setAnimation(name, false);
        this._spineHero.signalComplet.addOnce(function () {
            this._spineHero.setAnimation('idle', true);
        });
    }
    playEffectOnce(name, callback) {
        this._spineHero.setAnimation(name, false);
        this._spineHero.signalComplet.addOnce(function () {
            this._spineHero.setAnimation('idle', true);
            if (callback) {
                callback();
            }
        });
    }
    setCallBack(callback) {
        if (this._callback) {
            this._callback = null;
        }
        this._callback = callback;
    }
    _onTouchCallBack(sender) {
        var moveOffsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        var moveOffsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            // logWarn(' CommonSimpleHeroAvatar:_onTouchCallBack(sender,state) ');
            if (this._callback) {
                this._callback(this._userData);
            }
        }
    }
    showShadow(visible) {
        this._imageShadow.node.active = (visible);
    }
    setShadowScale(scale) {
        this._imageShadow.node.active = (scale);
    }
    getBaseId() {
        if (this._heroId) {
            return this._heroId;
        }
        return 0;
    }
    showName(visible, heroName) {
        if (visible == null) {
            visible = false;
        }
        if (this._heroId && this._heroId > 0) {
            var heroData = TypeConvertHelper.convert(this._convertType, this._heroId);
            if (heroName == null) {
                this._textName.string = (heroData.name);
            } else {
                this._textName.string = (heroName);
            }
            this._textName.node.color = (heroData.icon_color);
            UIHelper.enableOutline(this._textName, heroData.icon_color_outline, 2);
            this._textName.node.active = (visible);
        }
    }
    updateHeroName(name, color) {
        var textName = null;
        textName = this._textName;
        textName.string = (name);
        textName.node.color = (Colors.getColor(color));
        UIHelper.enableOutline(textName, Colors.getColorOutline(color), 2)
        textName.node.active = (true);
    }
    updateUserName(name, officerLevel) {
        var textName = null;
        textName = this._textName;
        textName.string = (name);
        textName.node.color = (Colors.getOfficialColor(officerLevel));
        UIHelper.enableOutline(textName, Colors.getOfficialColor(officerLevel), 2)
        textName.node.active = (true);
    }
    setNameColor(color, outlineColor) {
        var textName = null;
        textName = this._textName;
        textName.node.color = (color);
        UIHelper.enableOutline(textName, outlineColor, 2)
    }
    setDark() {
        var setColor = function (spine) {
            if (spine != null) {
                spine.node.color = (new cc.Color(255 * 0.4, 255 * 0.4, 255 * 0.4));
            }
        };
        setColor(this._spineHero);
    }
    setLight() {
        var setColor = function (spine) {
            if (spine != null) {
                spine.node.color = (new cc.Color(255, 255, 255));
            }
        };
        setColor(this._spineHero);
    }
    applyShader(shaderName) {
        var spine = this._spineHero.getSpine();
        if (spine) {
            ShaderHelper.filterNode(spine.node, shaderName);
        } else {
            this._spineHero.signalLoad.addOnce(function () {
                var spine = this._spineHero.getSpine();
                ShaderHelper.filterNode(spine, shaderName);
            }.bind(this));
        }
    }
    cancelShader() {
        var spine = this._spineHero.getSpine();
        if (spine) {
            ShaderHelper.filterNode(spine.node, '', true);
        } else {
            this._spineHero.signalLoad.addOnce(function () {
                var spine = this._spineHero.getSpine();
                ShaderHelper.filterNode(spine.node, '', true);
            }.bind(this));
        }
    }
    setAniTimeScale(timeScale) {
        var setTimeScale = function (spine) {
            if (spine != null) {
                spine.setTimeScale(timeScale);
            }
        };
        setTimeScale(this._spineHero);
    }
    getNodeHero() {
        return this._nodeHero;
    }
    setUserData(userData) {
        this._userData = userData;
    }
    getUserData() {
        return this._userData;
    }
    getSpineHero() {
        return this._spineHero.getSpine();
    }
    getHeight() {
        return this._height;
    }
    setNameOffsetY(offsetY) {
        var posY = this._textName.node.y;
        posY = posY + offsetY;
        this._textName.node.y = (posY);
    }
    updateNameHeight(YPos) {
        this._textName.node.y = (YPos);
    }
    setNameSize(size) {
        this._textName.fontSize = (size);
    }
    isAnimExit(anim) {
        if (this._spineHero) {
            return this._spineHero.isAnimationExist(anim);
        }
        return false;
    }
    addSpineLoadHandler(handler) {
        this._spineHero.signalComplet.addOnce(handler);
    }
    removeSpineLoadHandler(handler) {
        this._spineHero.signalComplet.remove(handler);
    }
    setAsset(resName, animSuffix) {
        animSuffix = animSuffix || '';
        var resJson = Path.getSpine(resName + animSuffix);
        this._spineHero.setAsset(resJson);
    }
}