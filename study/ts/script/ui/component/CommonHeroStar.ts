
import CommonUI from "./CommonUI";
import { G_EffectGfxMgr } from "../../init";
import { Path } from "../../utils/Path";
import EffectGfxNode from "../../effect/EffectGfxNode";
import UIHelper from "../../utils/UIHelper";


var IMAGE_RES = {
    1: {
        'light': 'img_lit_stars02',
        'dark': 'img_lit_stars02c',
        'moving': 'moving_xiaoxingxing'
    },
    2: {
        'light': 'img_lit_stars03',
        'dark': 'img_lit_stars03b',
        'moving': 'moving_daxingxing'
    }
};

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHeroStar extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageStar6: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageStar5: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageStar4: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageStar3: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageStar2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageStar1: cc.Sprite = null;

    constructor() {
        super();
    }

    _initStars() {
        for (var i = 1; i <= 6; i++) {
            if (this['_imageStar' + i]) {
                this['_imageStar' + i].node.active = (false);
            }
        }
    }
    setCount(count, maxCount?) {
        this._initStars();
        maxCount = maxCount || 5;
        for (var i = 1; i <= maxCount; i++) {
            if (this['_imageStar' + i]) {
                if (i <= count) {
                    this['_imageStar' + i].node.addComponent(CommonUI).node.addComponent(CommonUI).loadTexture(Path.getUICommon('img_lit_stars02'));
                    this['_imageStar' + i].node.active = (true);
                } else {
                    this['_imageStar' + i].node.addComponent(CommonUI).loadTexture(Path.getUICommon('img_lit_stars02c'));
                    this['_imageStar' + i].node.active = (true);
                }
            }
        }
    }
    setCountEx(count) {
        this._initStars();
        for (var i = 1; i <= count; i++) {
            if (this['_imageStar' + i]) {
                this['_imageStar' + i].node.addComponent(CommonUI).loadTexture(Path.getUICommon('img_lit_stars02'));
                this['_imageStar' + i].node.active = (true);
            }
        }
    }

    setCountAdv(count) {
        this._initStars();
        if (count > 5 || count <= 0) {
            return;
        }
        for (var i = 1; i <= count; i++) {
            if (this['_imageStar' + i]) {
                UIHelper.loadTexture(this['_imageStar' + i], Path.getUICommon('img_lit_stars02'));
                this['_imageStar' + i].node.active = (true);
            }
        }
        if (count % 2 == 0) {
            for (var i = 1; i <= count; i++) {
                var posX = 64 + (i - count / 2 - 1) * 26;
                if (this['_imageStar' + i]) {
                    this['_imageStar' + i].node.setPosition(cc.v2(posX, 0));
                }
            }
        } else {
            for (var i = 1; i <= count; i++) {
                var posX = 48 + (i - (count + 1) / 2) * 26;
                if (this['_imageStar' + i]) {
                    this['_imageStar' + i].node.setPosition(cc.v2(posX, 0));
                }
            }
        }
    }

    playStar(index, delayTimme) {
        var imageStar = this['_imageStar' + index];
        if (imageStar == null) {
            return;
        }
        this._playSingleStarEft(imageStar, delayTimme);
    }
    _onStarEffectFinish(srcImage:cc.Sprite) {
        UIHelper.loadTexture(srcImage, Path.getUICommon('img_lit_stars02'))
    }
    _playSingleStarEft(image, delayTimme) {
        delayTimme = delayTimme || 0.1;
        UIHelper.loadTexture(image, Path.getUICommon('img_lit_stars02c'));
        var effectFunction = function (effect): cc.Node {
            return null;
        }
        var eventFunction = function (event) {
            if (event == 'finish') {
                this._onStarEffectFinish(image);
            }
        }.bind(this);
        var funcStar = function () {
            var effect = G_EffectGfxMgr.createPlayMovingGfx(image.node, 'moving_xiaoxingxing', null, eventFunction, false);
            var nodeSize = image.node.getContentSize();
            var pos = new cc.Vec2(nodeSize.width * 0.5, nodeSize.height * 0.5);
            effect.node.setPosition(pos);
            effect.node.setScale(0.8);
        }
        var action1 = cc.delayTime(delayTimme);
        var action2 = cc.callFunc(function () {
            funcStar();
        });
        var action = cc.sequence(action1, action2);
        image.node.runAction(action);
    }
    setStarOrMoon(count, countPerLevel?) {
        this._initStars();
        countPerLevel = countPerLevel || 5;
        var level = Math.ceil(count / countPerLevel);
        if (level == 0) {
            level = 1;
        }
        if (count > 0) {
            count = count % countPerLevel;
            if (count == 0) {
                count = countPerLevel;
            }
        }
        var imageLight = IMAGE_RES[level].light;
        var imageDark = IMAGE_RES[level].dark;
        for (var i = 1; i <= countPerLevel; i++) {
            this['_imageStar' + i].node.active = (true);
            if (i <= count) {
                this['_imageStar' + i].node.addComponent(CommonUI).loadTexture(Path.getUICommon(imageLight))
            } else {
                this['_imageStar' + i].node.addComponent(CommonUI).loadTexture(Path.getUICommon(imageDark))
            }
        }
    }
    setStarOrMoonForPlay(count, countPerLevel?) {
        this._initStars();
        countPerLevel = countPerLevel || 5;
        var level = Math.floor(count / countPerLevel) + 1;
        count = count % countPerLevel;
        var imageLight = IMAGE_RES[level].light;
        var imageDark = IMAGE_RES[level].dark;
        for (var i = 1; i <= countPerLevel; i++) {
            this['_imageStar' + i].node.active = (true);
            if (i <= count) {
                UIHelper.loadTexture(this['_imageStar' + i], Path.getUICommon(imageLight))
            } else {
                UIHelper.loadTexture(this['_imageStar' + i], Path.getUICommon(imageDark))
            }
        }
    }
    playStarOrMoon(count, countPerLevel, delayTimme) {
        countPerLevel = countPerLevel || 5;
        delayTimme = delayTimme || 0.1;
        var level = Math.ceil(count / countPerLevel);
        var index = count % countPerLevel;
        if (index == 0) {
            index = countPerLevel;
        }
        var imageStar:cc.Sprite = this['_imageStar' + index];
        if (imageStar == null) {
            return;
        }
        var darkImage = IMAGE_RES[level].dark;
        UIHelper.loadTexture(imageStar, Path.getUICommon(darkImage))
        function eventFunction(event) {
            if (event == 'finish') {
                var lightImage = IMAGE_RES[level].light;
                UIHelper.loadTexture(imageStar, Path.getUICommon(lightImage))
            }
        }
        function funcStar() {
            var movingName = IMAGE_RES[level].moving;
            var effect = G_EffectGfxMgr.createPlayMovingGfx(imageStar.node, movingName, null, eventFunction, false);
            var nodeSize = imageStar.node.getContentSize();
            var pos = new cc.Vec2(nodeSize.width * 0.5, nodeSize.height * 0.5);
            effect.node.setPosition(pos);
            effect.node.setScale(0.8);
        }
        var action1 = cc.delayTime(delayTimme);
        var action2 = cc.callFunc(function () {
            funcStar();
        });
        var action = cc.sequence(action1, action2);
        imageStar.node.runAction(action);
    }

}