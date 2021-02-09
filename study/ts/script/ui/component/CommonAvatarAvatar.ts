import { HeroConst } from "../../const/HeroConst";
import { G_UserData } from "../../init";
import { AvatarDataHelper } from "../../utils/data/AvatarDataHelper";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { HeroSpineNode } from "../node/HeroSpineNode";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonAvatarAvatar extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_shadow: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _node_hero: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panel_click: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_talk_bg2: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _text_talk2: cc.Label = null;

   private _effect:any;
   private _spineHero:HeroSpineNode;

    ctor() {

        //this._height = 0;
    }
    _init() {
        // this._panel_click = ccui.Helper.seekNodeByName(this._target, 'Panel_click');
        // this._panel_click.addClickEventListenerEx(handler(this, this._onTouchCallBack));
        // this._panel_click.setSwallowTouches(false);
        // this._imageShadow = ccui.Helper.seekNodeByName(this._target, 'Image_shadow');
        this._spineHero = HeroSpineNode.create();
        this._node_hero.addChild(this._spineHero.node);
        this._image_talk_bg2.node.active = (false);
    }
    updateUI(avatarId) {
        var info = AvatarDataHelper.getAvatarConfig(avatarId);
        var heroId = info.hero_id;
        if (avatarId == 0) {
            heroId = G_UserData.getHero().getRoleBaseId();
        }
        var limitLevel = 0;
        if (info.limit == 1) {
            limitLevel = HeroConst.HERO_LIMIT_MAX_LEVEL;
        }
        var heroData = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, null, null, limitLevel);
        var fightResId = heroData.res_cfg.fight_res;
        this.node.height = heroData.res_cfg.spine_height;
        var resJson = Path.getSpine(fightResId);
        this._spineHero.setAsset(resJson);
        this._spineHero.setAnimation('idle', true);
    }
    setTouchEnabled(enable) {
        // this._panel_click.setTouchEnabled(enable);
        // this._panel_click.setSwallowTouches(false);
    }
    setScale(scale) {
        scale = scale || 0.5;
        if (this._spineHero) {
            this._spineHero.node.setScale(scale);
        }
        if (this._image_shadow) {
            this._image_shadow.node.setScale(scale);
        }
    }
    getHeight() {
        return this.node.height;
    }
    playAnimationOnce(name, callback) {
        this._spineHero.setAnimation(name, false);
        var spineHero = this._spineHero;
        this._spineHero.signalComplet.addOnce(function () {
            spineHero.setAnimation('idle', true);
            if (callback) {
                callback();
            }
        });
    }
    setBubble(bubbleText) {
        if (bubbleText == null || bubbleText == '') {
            this._image_talk_bg2.node.active = (false);
            return;
        }
        var minWidth = 62;
        var minHeight = 66;
        this._text_talk2.node.width = 200;
        this._text_talk2.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        this._text_talk2.string = (bubbleText);
        this._text_talk2["_updateRenderData"](true);
        
        var render = this._text_talk2.node;//getVirtualRenderer();
        var size = render.getContentSize();
        var bubbleSize = cc.size(size.width, size.height);
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
        this._text_talk2.node.setPosition(cc.v2(bubbleSize.width / 2, size.height / 2 + 30));
        this._image_talk_bg2.node.setContentSize(bubbleSize);
        var position = this._image_talk_bg2.node.getPosition();
        this._image_talk_bg2.node.setPosition(cc.v2(position.x, this.getHeight()));
        if (this._effect) {
            this._effect.reset();
        }
        //this._effect = G_EffectGfxMgr.applySingleGfx(this._image_talk_bg2, 'smoving_duihuakuang', handler(this, this._onBubbleFinish));
        this._image_talk_bg2.node.active = (true);
    }
    _onBubbleFinish() {
        // this._image_talk_bg2.runAction(cc.Sequence.create(cc.DelayTime.create(10), cc.CallFunc.create(function () {
        //     this._image_talk_bg2.node.active = (false);
        // })));
    }
    resetImageTalk() {
        //this._image_talk_bg2.stopAllActions();
        this._image_talk_bg2.node.active = (false);
    }

}
