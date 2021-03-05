import { ConfigNameConst } from "../../const/ConfigNameConst";
import { HeroConst } from "../../const/HeroConst";
import { Colors, G_ConfigLoader, G_EffectGfxMgr } from "../../init";
import { AvatarDataHelper } from "../../utils/data/AvatarDataHelper";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { HeroSpineNode } from "../node/HeroSpineNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHeroAvatar extends cc.Component {

    private _panelClick: cc.Node;
    private _textTalk: cc.Label;
    private _textTalk2: cc.Label;
    private _textName: cc.Label;
    private _imageCountry: cc.Sprite;
    private _imageShadow: cc.Node;
    private _nodeHero: cc.Node;
    private _nodeAvatarEffect: cc.Node;
    private _imageTalkBg: cc.Node;
    private _imageTalkBg2: cc.Node;
    private _imageNameBg: cc.Node;
    private _panelVName: cc.Node;
    private _effectNodeFront: cc.Node;
    private _effectNodeBack: cc.Node;

    private _spineHero: HeroSpineNode;
    private _panelClickButton: cc.Button;

    private _needAnimSp: boolean;
    private _heroId: number;
    private _scale: number;
    private _scaleEx: number;
    private _delayTime: number;
    private _currBubbleIndex: number;
    private _height: number;
    private _talkStr: string;
    private _convertType = TypeConvertHelper.TYPE_HERO;
    private _userData;
    private _avatarEffect;
    private _backEffectSpine: HeroSpineNode;
    private _foreEffectSpine: HeroSpineNode;
    private _initMaterial: cc.Material;

    private _callback: Function;
    _hasInited: boolean = false;

    onLoad() {
        this.init();
    }

    public init() {
        if (!this._hasInited) {
            this._hasInited = true;

            this._heroId = 0;
            this._scale = 0.5;
            this._spineHero = null;
            this._delayTime = 1;
            this._scaleEx = 1;
            this._userData = null;
            this._currBubbleIndex = 0;
            this._height = 0;
            this._talkStr = null;
            this._convertType = TypeConvertHelper.TYPE_HERO;
            this._avatarEffect = null;
            this._needAnimSp = false;

            this._panelClick = this.node.getChildByName('Panel_click');
            this._textName = this.node.getChildByName('Text_name').getComponent(cc.Label);
            this._imageCountry = this.node.getChildByName('ImageCountry').getComponent(cc.Sprite);
            this._imageShadow = this.node.getChildByName('Image_shadow');
            this._nodeHero = this.node.getChildByName('Node_hero');
            this._nodeAvatarEffect = this.node.getChildByName('NodeAvatarEffect');
            this._imageTalkBg = this.node.getChildByName('Image_talk_bg');
            this._imageTalkBg2 = this.node.getChildByName('Image_talk_bg2');
            this._textTalk = this._imageTalkBg.getChildByName('Text_talk').getComponent(cc.Label);
            this._textTalk2 = this._imageTalkBg2.getChildByName('Text_talk2').getComponent(cc.Label);
            this._imageNameBg = this.node.getChildByName('Image_name_bg');
            this._panelVName = this.node.getChildByName('Panel_v_name');
            this._effectNodeFront = this.node.getChildByName('Node_effect_front');
            this._effectNodeBack = this.node.getChildByName('Node_effect_back');
            this._panelVName.active = false;
            this._imageNameBg.active = false;
            this._imageTalkBg.active = false;
            this._imageTalkBg2.active = false;
            this._imageCountry.node.active = false;
            this._textName.node.active = false;
            // var render = this._textTalk2.getVirtualRenderer();
            // render.setMaxLineWidth(400);
            this._textTalk2.node.width = 200;
            this._spineHero = HeroSpineNode.create();
            this._nodeHero.addChild(this._spineHero.node);
            UIHelper.addEventListener(this.node, this._panelClick.getComponent(cc.Button) || this._panelClick.addComponent(cc.Button), 'CommonHeroAvatar', 'onTouchCallBack');
        }
    }

    public _playAnim(anim, isLoop, isReset?) {
        if (this._needAnimSp) {
            this._spineHero.setAnimation(anim, isLoop, isReset);
        } else {
            if (anim == 'idle' && this._spineHero.isAnimationExist('idle3')) {
                this._spineHero.setAnimation('idle3', isLoop, isReset);
            } else if (anim == 'run' && this._spineHero.isAnimationExist('run2')) {
                this._spineHero.setAnimation('run2', isLoop, isReset);
            } else {
                this._spineHero.setAnimation(anim, isLoop, isReset);
            }
        }
    }

    public setConvertType(ct: number): void {
        this._convertType = ct;
    }

    public  getClickPanel() {
        return this._panelClick;
    }


    public updateUI(heroId, animSuffix?, notPlayIdle?, limitLevel?, callback?, needAnimSp?,limitRedLevel?) {
        this._initSpine(heroId, animSuffix, limitLevel, callback, notPlayIdle,limitRedLevel);
        if (needAnimSp) {
            this._needAnimSp = needAnimSp;
        }
        if (!notPlayIdle) {
            this._playAnim('idle', true);
        }
    }

    public updateAvatar(avatarInfo, animSuffix?, notPlayIdle?, callback?) {
        if (!avatarInfo) {
            return;
        }
        if (avatarInfo.isHasAvatar) {
            var avatarConfig = AvatarDataHelper.getAvatarConfig(avatarInfo.avatarBaseId);
            if (avatarConfig.limit == 1) {
                this.updateUI(avatarInfo.covertId, animSuffix, notPlayIdle, HeroConst.HERO_LIMIT_MAX_LEVEL, callback);
            } else {
                this.updateUI(avatarInfo.covertId, animSuffix, notPlayIdle, null, callback);
            }
        } else {
            this.updateUI(avatarInfo.covertId, animSuffix, notPlayIdle, null, callback);
        }
    }

    public setAction(name, loop?) {
        if (this._spineHero) {

            if (this._backEffectSpine == null) {
                this._backEffectSpine = this._createEffectSpine(Path.getSpine(this._heroId + '_back_effect'), name, loop);
                this._backEffectSpine.node.name = ('back_effect');
                this._effectNodeBack.addChild(this._backEffectSpine.node, 1);
            } else {
                if (this._backEffectSpine.isAnimationExist(name)) {
                    this._backEffectSpine.setAnimation(name, loop, true);
                }
            }

            if (this._foreEffectSpine == null) {
                this._foreEffectSpine = this._createEffectSpine(Path.getSpine(this._heroId + '_fore_effect'), name, loop);
                this._foreEffectSpine.node.name = ('fore_effect');
                this._effectNodeBack.addChild(this._foreEffectSpine.node, 1);
            } else {
                if (this._foreEffectSpine.isAnimationExist(name)) {
                    this._foreEffectSpine.setAnimation(name, loop, true);
                }
            }
            this._playAnim(name, loop, true);
        }
    }

    private _createEffectSpine(spinePath, actionName, loop): HeroSpineNode {
        let spineEffect = HeroSpineNode.create();
        spineEffect.setAsset(spinePath);
        spineEffect.signalLoad.addOnce(() => {
            if (spineEffect.isAnimationExist(actionName)) {
                spineEffect.setAnimation(actionName, loop, true);
            }
        });
        return spineEffect;
    }

    public setScale(scale) {
        scale = scale || 0.5;
        this._scaleEx = scale;
        if (this._spineHero) {
            this._spineHero.node.setScale(scale);
        }
        if (this._imageShadow) {
            this._imageShadow.setScale(scale);
        }
    }

    public turnBack(needBack?) {
        if (this._spineHero) {
            if (needBack == null || needBack == true) {
                this._spineHero.setScaleX(-this._scaleEx);
                this._effectNodeBack.scaleX = -this._scaleEx;
                this._effectNodeFront.scaleX = -this._scaleEx;
            } else if (needBack == false) {
                this._spineHero.setScaleX(this._scaleEx);
                this._effectNodeBack.scaleX = this._scaleEx;
                this._effectNodeFront.scaleX = this._scaleEx;
            }
        }
    }

    public setSpineVisible(needShow) {
        if (this._spineHero) {
            this._spineHero.node.active = needShow;
        }
    }

    private _initSpine(heroId, animSuffix, limitLevel, callback, notPlayIdle,limitRedLevel) {
        this._heroId = heroId;
        var resJson = this._getSpineData(heroId, animSuffix, limitLevel,limitRedLevel);
        this._spineHero.setAsset(resJson);
        this._spineHero.signalLoad.addOnce(() => {
            if (!notPlayIdle && this._spineHero.getAnimationName() == 'idle') {
                this._playAnim('idle', true);
            }
            if (callback) {
                callback();
            }
        });
    }


    private _getSpineData(heroId, animSuffix, limitLevel,limitRedLevel) {
        var heroData = TypeConvertHelper.convert(this._convertType, heroId, null, null, limitLevel,limitRedLevel);
        var fightResId = heroData.res_cfg.fight_res;

        this._height = heroData.res_cfg.spine_height;
        animSuffix = animSuffix || '';
        return Path.getSpine(fightResId + animSuffix);
    }

    public getSize() {
        return this._spineHero.node.getContentSize();
    }

    public playAnimationOnce(name) {
        this._playAnim(name, false);
        var _this = this;
        this._spineHero.signalComplet.addOnce(function () {
            _this._playAnim('idle', true);
        });
    }

    public playAnimationEfcOnce(name) {
        this.setAction(name, false);
        var _this = this;
        this._spineHero.signalComplet.addOnce(function () {
            _this._spineHero.setAnimation('idle', true);
        });
    }

    public playAnimationLoopIdle(callBack?, posIndex?) {
        this._playAnim('idle', true);
        var _this = this;
        this._spineHero.signalComplet.add(function (index, loopCount) {
            if (callBack) {
                callBack(loopCount, _this._spineHero, _this._heroId, posIndex);
            }
            if (loopCount == 2 && _this._spineHero.getAnimationName() != 'idle2') {
                _this._playAnim('idle2', false);
            }
            if (loopCount == 1 && _this._spineHero.getAnimationName() != 'idle') {
                _this._playAnim('idle', true);
            }
        });
    }

    public playEffectOnce(name) {
        this._playAnim(name, false);
    }

    public setCallBack(callback) {
        if (this._callback) {
            this._callback = null;
        }
        this._callback = callback;
    }

    private onTouchCallBack(sender: cc.Touch) {
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            if (this._callback) {
                this._callback(this._userData);
            }
        }
    }

    public showShadow(visible) {
        this._imageShadow.active = visible;
    }

    public setShadowScale(scale) {
        this._imageShadow.setScale(scale);
    }

    public getBaseId() {
        if (this._heroId) {
            return this._heroId;
        }
        return 0;
    }

    public setBaseId(heroId) {
        this._heroId = heroId;
    }

    public showVName(visible) {
        if (visible == null) {
            visible = false;
        }
        if (this._heroId && this._heroId > 0) {
            var heroData = TypeConvertHelper.convert(this._convertType, this._heroId);
            this._panelVName.active = true;
            var textName = this._panelVName.getChildByName('Text_v_name').getComponent(cc.Label);
            textName.string = heroData.name;
            textName.node.color = heroData.icon_color;
            UIHelper.enableOutline(textName, heroData.icon_color_outline, 2);
            textName.node.active = true;
        }
    }

    public showCountry(visible) {
        if (visible == null) {
            visible = false;
        }
        var heroData = TypeConvertHelper.convert(this._convertType, this._heroId);
        UIHelper.loadTextureFromAtlas(this._imageCountry, heroData.country_text);
        this._imageCountry.node.active = visible;
    }

    public showName(visible, heroName?) {
        if (visible == null) {
            visible = false;
        }
        if (this._heroId && this._heroId > 0) {
            var heroData = TypeConvertHelper.convert(this._convertType, this._heroId);
            if (heroName == null) {
                this._textName.string = heroData.name;
            } else {
                this._textName.string = heroName;
            }
            this._textName.node.color = heroData.icon_color;
            UIHelper.enableOutline(this._textName, heroData.icon_color_outline, 2);
            this._textName.node.active = visible;
        }
    }

    public updateHeroName(name, color, useVName) {
        var textName: cc.Label = null;
        if (useVName) {
            this._panelVName.active = true;
            textName = this._panelVName.getChildByName('Text_v_name').getComponent(cc.Label);
        } else {
            textName = this._textName;
        }
        textName.string = name;
        textName.node.color = Colors.getColor(color);
        UIHelper.enableOutline(textName, Colors.getColorOutline(color), 2);
        textName.node.active = true;
    }

    public setDark() {
        var setColor = function (spine: HeroSpineNode) {
            if (spine != null) {
                spine.node.color = new cc.Color(255 * 0.4, 255 * 0.4, 255 * 0.4);
            }
        };
        setColor(this._spineHero);
    }

    public setLight() {
        var setColor = function (spine) {
            if (spine != null) {
                spine.node.color = new cc.Color(255 * 0.4, 255 * 0.4, 255 * 0.4);
            }
        };
        setColor(this._spineHero);
    }

    public applyShader(shaderName?) {
        var spine = this._spineHero.getSpine();
        if (spine == null) {
            return;
        }
        this._initMaterial =  this._initMaterial || spine.getMaterial(0);
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

    public setTalkString(talkStr) {
        if (talkStr && talkStr != '') {
            this._textTalk.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this._textTalk2.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this._textTalk.string = talkStr;
            this._textTalk2.string = talkStr;
            (this._textTalk2 as any)._updateRenderData(true);
            this._talkStr = talkStr;
        }
    }

    public setAniTimeScale(timeScale) {
        var setTimeScale = function (spine) {
            if (spine != null) {
                spine.setTimeScale(timeScale);
            }
        };
        setTimeScale(this._spineHero);
    }

    public setBubbleVisible(visible) {
        this._imageTalkBg.active = visible;
        this._imageTalkBg2.active = visible;
    }

    public showLoopBubble(content: string, interval) {
        this._panelClick.stopAllActions();
        interval = interval || 5;
        var getBubbleMsg = function (bubbleId) {
            var BubbleInfo = G_ConfigLoader.getConfig(ConfigNameConst.BUBBLE);
            var data = BubbleInfo.get(parseInt(bubbleId));
            return data.content;
        };
        var _this = this;
        var loopFunc = function () {
            var npc1talk = content.split('|');
            _this._currBubbleIndex = _this._currBubbleIndex + 1;
            if (_this._currBubbleIndex > npc1talk.length) {
                _this._currBubbleIndex = 1;
            }
            var bubbleId = npc1talk[_this._currBubbleIndex - 1];
            var bubbleMsg = getBubbleMsg(bubbleId);
            _this.setBubble(bubbleMsg, null, 2);
        }.bind(_this);
        var delay = cc.delayTime(interval);
        var sequence = cc.sequence(cc.callFunc(loopFunc), delay);
        var action = cc.repeatForever(sequence);
        this._panelClick.runAction(action);
    }

    public setBubble(bubbleText, delay, type, showAction?, maxWidth?) {
        this._delayTime = delay || this._delayTime;
        var textAction = showAction || false;
        var textType = type || 2;
        if (bubbleText != null && bubbleText != '') {
            if (textType == 1) {
                this.setTalkString(bubbleText);
                this._imageTalkBg.angle = (-50);
                this._imageTalkBg.setScale(0);
                this._imageTalkBg.runAction(cc.sequence(cc.delayTime(this._delayTime),
                    cc.spawn(cc.scaleTo(0.3, 0.8).easing(cc.easeBackOut())),
                    cc.rotateTo(0.3, 0).easing(cc.easeBackInOut())));
                this._imageTalkBg.active = true;
            } else if (textType == 2) {
                var minWidth = 62;
                var minHeight = 66;
                // var render = this._textTalk2.getVirtualRenderer();
                // if (maxWidth) {
                //     render.setMaxLineWidth(maxWidth);
                // }
                if (maxWidth) {
                    this._textTalk2.node.width = (maxWidth);
                }
                this._textTalk2.enableWrapText = true;
                this.setTalkString(bubbleText);
                // var size = render.getContentSize();
                var size = new cc.Size(this._textTalk2.node.width, this._textTalk2.node.height);
                var bubbleSize = new cc.Size(size.width, size.height);
                var changeLine = false;
                if (size.height > 30) {
                    changeLine = true;
                }
                bubbleSize.width = bubbleSize.width + 30;
                if (changeLine) {
                    bubbleSize.height = bubbleSize.height + 47;
                }
                if (bubbleSize.width < minWidth) {
                    bubbleSize.width = minWidth;
                }
                if (bubbleSize.height < minHeight) {
                    bubbleSize.height = minHeight;
                }
                this._textTalk2.node.setPosition(bubbleSize.width / 2, size.height / 2 + 30);
                this._imageTalkBg2.setContentSize(bubbleSize);
                if (textAction) {
                    G_EffectGfxMgr.applySingleGfx(this._imageTalkBg2, 'smoving_duihuakuang');
                }
                this._imageTalkBg2.active = true;
            }
        } else {
            this._imageTalkBg.active = false;
            this._imageTalkBg2.active = false;
        }
    }

    public setBubbleTextWidth(width) {
        // var render = this._textTalk2.getVirtualRenderer();
        // render.setMaxLineWidth(width);
        this._textTalk2.node.width = width;
        this.setTalkString(this._talkStr);
        var size = this._textTalk2.node.getContentSize();
        this._imageTalkBg2.setContentSize(size);
    }

    public setTouchEnabled(enable) {
        this._panelClick.active = enable;
    }

    public getNodeHero() {
        return this._nodeHero;
    }

    public setUserData(userData) {
        this._userData = userData;
    }

    public getUserData() {
        return this._userData;
    }

    public getSpineHero(): cc.Node {
        return this._spineHero.getSpine().node;
    }

    public getHeight() {
        return this._height;
    }

    public turnBubble() {
        var posX = this._imageTalkBg2.position.x;
        var posTextX = this._textTalk2.node.position.x;
        this._imageTalkBg2.scaleX = -1;
        this._imageTalkBg2.x = -posX
        this._textTalk2.node.scaleX = -1;
    }

    public moveTalkToTop() {
        this._imageTalkBg.zIndex = 1;
        let newPos: cc.Vec3 = this.node.position.add(this._imageTalkBg2.position);
        this._imageTalkBg2.removeFromParent();
        if (this.node.parent != null) {
            this.node.parent.addChild(this._imageTalkBg2);
        }
        this._imageTalkBg2.setPosition(newPos);
    }

    public setNameOffsetY(offsetY) {
        var posY = this._textName.node.position.y;
        posY = posY + offsetY;
        this._textName.node.y = posY;
    }

    public updateNameHeight(YPos) {
        this._textName.node.y = YPos;
    }

    public showAvatarEffect(show, scale?) {
        scale = scale || 1;
        this._nodeAvatarEffect.setScale(scale);
        if (show) {
            if (this._avatarEffect == null) {
                this._avatarEffect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeAvatarEffect, 'moving_bianshenka', null, null, false);
            }
        } else {
            if (this._avatarEffect) {
                this._avatarEffect.node.runAction(cc.destroySelf());
                this._avatarEffect = null;
            }
        }
    }

    public isAnimExit(anim) {
        if (this._spineHero) {
            return this._spineHero.isAnimationExist(anim);
        }
        return false;
    }

    public addSpineLoadHandler(handler) {
        this._spineHero.signalComplet.addOnce(handler);
    }

    public setAsset(resName, animSuffix?) {
        animSuffix = animSuffix || '';
        var resJson = Path.getSpine(resName + animSuffix);
        this._spineHero.setAsset(resJson);
    }

    public setBubblePosition(pos) {
        this._imageTalkBg2.setPosition(pos);
    }

    public setName(name) {
        this.setName(name);
    }

    public getFlashEntity(): [HeroSpineNode, cc.Node] {
        return [
            this._spineHero,
            this._imageShadow
        ];
    }

    public showTitle(titleId, modelName) {
        UserDataHelper.appendNodeTitle(this.node, titleId, modelName);
    }

    setVisible(v) {
        this.node.active = v;
    }
}