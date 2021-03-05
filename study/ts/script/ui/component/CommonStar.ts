import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import { G_EffectGfxMgr } from "../../init";

const { ccclass, property } = cc._decorator;
@ccclass
export default class CommonStar extends cc.Component {
    @property({ type: cc.Sprite, visible: true })
    _imageStar6: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar5: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar4: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar3: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar2: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar1: cc.Sprite = null;

    private static IMAGE_RES = {
        [1]: {
            ["light"]: "img_lit_stars02",
            ["dark"]: "img_lit_stars02c",
            ["moving"]: "moving_xiaoxingxing",
        },
        [2]: {
            ["light"]: "img_lit_stars03",
            ["dark"]: "img_lit_stars03b",
            ["moving"]: "moving_daxingxing",
        },
    }

    private _imageStars: cc.Sprite[];

    private _initStars() {
        this._imageStars = [this._imageStar1, this._imageStar2, this._imageStar3, this._imageStar4, this._imageStar5, this._imageStar6];
        for (let i = 1; i <= this._imageStars.length; i++) {
            this['_imageStar' + i] = this['_imageStar' + i] || this.node.getChildByName('ImageStar' + i).getComponent(cc.Sprite);
            if (this._imageStars[i] != null) {
                this._imageStars[i].node.active = false;
            }
        }

    }

    public setCount(count, maxCount?) {
        this._initStars();
        maxCount = maxCount || 5;
        for (let i = 0; i < maxCount; i++) {
            let path: string = i < count ? Path.getUICommon("img_lit_stars02") : Path.getUICommon('img_lit_stars02c');
            UIHelper.loadTexture(this._imageStars[i], path);
            this._imageStars[i].node.active = true;
        }
    }

    public setCountEx(count) {
        this._initStars();
        for (let i = 0; i < count; i++) {
            UIHelper.loadTexture(this._imageStars[i], Path.getUICommon("img_lit_stars02"));
            this._imageStars[i].node.active = true;
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

    public playStar(index, delayTimme) {
        var imageStar = this._imageStars[index - 1];
        if (imageStar == null) {
            return;
        }
        this._playSingleStarEft(imageStar, delayTimme);
    }

    private _onStarEffectFinish(srcImage: cc.Sprite) {
        UIHelper.loadTexture(srcImage, Path.getUICommon('img_lit_stars02'));
    }

    private _playSingleStarEft(node: cc.Sprite, delayTimme) {
        delayTimme = delayTimme || 0.1;
        UIHelper.loadTexture(node, Path.getUICommon('img_lit_stars02c'));
        var eventFunction = function (event) {
            if (event == 'finish') {
                this._onStarEffectFinish(node);
            }
        }
        var funcStar = function () {
            var effect = G_EffectGfxMgr.createPlayMovingGfx(node.node, 'moving_xiaoxingxing', null, eventFunction.bind(this), false);
            var nodeSize = node.node.getContentSize();
            var pos = new cc.Vec2(nodeSize.width * 0.5, nodeSize.height * 0.5);
            effect.node.setPosition(pos);
            effect.node.setScale(0.8);
        }
        var action1 = cc.delayTime(delayTimme);
        var action2 = cc.callFunc(function () {
            funcStar();
        });
        var action = cc.sequence(action1, action2);
        node.node.runAction(action);
    }

    public setStarOrMoon(count, countPerLevel?) {
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
        var imageLight = CommonStar.IMAGE_RES[level].light;
        var imageDark = CommonStar.IMAGE_RES[level].dark;

        for (let i = 0; i < countPerLevel; i++) {
            let path: string = i < count ? Path.getUICommon(imageLight) : Path.getUICommon(imageDark);
            UIHelper.loadTexture(this._imageStars[i], path);
            this._imageStars[i].node.active = true;
        }
    }

    public setStarOrMoonForPlay(count, countPerLevel?) {
        this._initStars();
        countPerLevel = countPerLevel || 5;
        var level = Math.floor(count / countPerLevel) + 1;
        count = count % countPerLevel;
        var imageLight = CommonStar.IMAGE_RES[level].light;
        var imageDark = CommonStar.IMAGE_RES[level].dark;

        for (let i = 0; i < countPerLevel; i++) {
            let path: string = i < count ? Path.getUICommon(imageLight) : Path.getUICommon(imageDark);
            UIHelper.loadTexture(this._imageStars[i], path);
            this._imageStars[i].node.active = true;
        }
    }

    public playStarOrMoon(count, countPerLevel, delayTimme) {
        countPerLevel = countPerLevel || 5;
        delayTimme = delayTimme || 0.1;
        var level = Math.ceil(count / countPerLevel);
        var index = count % countPerLevel;
        if (index == 0) {
            index = countPerLevel;
        }
        var imageStar = this._imageStars[index - 1];
        if (imageStar == null) {
            return;
        }
        var darkImage = CommonStar.IMAGE_RES[level].dark;
        UIHelper.loadTexture(imageStar, Path.getUICommon(darkImage));
        function eventFunction(event) {
            if (event == 'finish') {
                var lightImage = CommonStar.IMAGE_RES[level].light;
                UIHelper.loadTexture(imageStar, lightImage);
            }
        }
        function funcStar() {
            var movingName = CommonStar.IMAGE_RES[level].moving;
            var effect = G_EffectGfxMgr.createPlayMovingGfx(imageStar.node, movingName, null, eventFunction.bind(this), false);
            var nodeSize = imageStar.node.getContentSize();
            var pos = new cc.Vec2(nodeSize.width * 0.5, nodeSize.height * 0.5);
            effect.node.setPosition(pos);
            effect.node.setScale(0.8);
        }
        var action1 = cc.delayTime(delayTimme);
        var action2 = cc.callFunc(function () {
            funcStar();
        }.bind(this));
        var action = cc.sequence(action1, action2);
        imageStar.node.runAction(action);
    }
}