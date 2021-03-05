const { ccclass, property } = cc._decorator;
import PopupBase from "../../../ui/PopupBase";
import { G_ConfigLoader, G_ResolutionManager, G_SignalManager, G_EffectGfxMgr } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import UIHelper from "../../../utils/UIHelper";
import { handler } from "../../../utils/handler";
import { SignalConst } from "../../../const/SignalConst";
import { assert } from "../../../utils/GlobleFunc";
import { Path } from "../../../utils/Path";
import { Lang } from "../../../lang/Lang";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

@ccclass
export default class PetShow extends PopupBase {
    public static path = 'petMerge/PetShow';

    public static AUTO_CLOSE_TIME = 10;
    public static HERO_COLOR_BACK = [
        '',
        '',
        '',
        'show_purple',
        'show_yellow1',
        'show_red'
    ];
    public static PET_YUANQUAN = [
        '',
        '',
        '',
        'img_beast_magi_zi',
        'img_beast_magi_cheng',
        'img_beast_magi_zi'
    ];
    public static SKILL_BG1 = [
        '',
        '',
        '',
        'img_beast_zi',
        'img_beast_cheng',
        'img_beast_cheng'
    ];
    public static SKILL_BG3 = [
        '',
        '',
        '',
        'img_beast_zi2',
        'img_beast_cheng2',
        'img_beast_cheng2'
    ];

    @property({ type: cc.Prefab, visible: true })
    _avatarPrefab: cc.Prefab = null;

    @property({ type: cc.Prefab, visible: true })
    _commonContinueNode: cc.Prefab = null;

    _petCfg: any;
    _heroRes: any;
    _panelFinish: any;
    _isAction: boolean;
    _effectShow: any;
    _callback: any;
    _needAutoClose: any;
    _scheduleHandler: any;
    _autoTime: number;
    _isRight: any;

    ctor(heroId, callback, needAutoClose?, isRight?) {
        var hero = G_ConfigLoader.getConfig(ConfigNameConst.PET).get(heroId);
        this._petCfg = hero;
        this._heroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(hero.res_id);
        this._panelFinish = null;
        this._isAction = true;
        this._effectShow = null;
        this._callback = callback;
        this._needAutoClose = needAutoClose;
        this._scheduleHandler = null;
        this._autoTime = 0;
        this._isRight = isRight;
    }
    onCreate() {
    }
    onEnter() {
        this.play();
    }
    onExit() {
        if (this._scheduleHandler) {
            this.unschedule(this._scheduleHandler);
        }
        this._scheduleHandler = null;
    }
    _onFinishTouch(sender, event) {
        if (!this._isAction) {
            if (this._callback) {
                this._callback();
            }
            this.close();
        }
    }
    play() {
        this._isAction = true;
        var params = {
            name: 'index',
            contentSize: G_ResolutionManager.getDesignCCSize(),
            anchorPoint: cc.v2(0.5, 0.5),
            position: cc.v2(0, 0)
        };
        this._panelFinish = UIHelper.createPanel(params);
        UIHelper.addEventListenerToNode(this.node, this._panelFinish, 'PetShow', '_onFinishTouch')
        this.node.addChild(this._panelFinish);
        this._isAction = true;
        this._effectShow = null;
        this._createAnimation();
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN);
    }
    _createActionNode(effect) {
        var funcName = '_' + effect;
        if (funcName) {
            var func:Function = this[funcName];
          //assert((func, 'has not func name = ' + funcName);
            var node = func.apply(this);
            return node;
        }
    }
    _xiujiang_shenshouzhuanquan() {
        var node = new cc.Node();
        let effectFunction = function(effect) {
            if (effect == 'yuanquan') {
                var sprite = UIHelper.newSprite(Path.getPet(PetShow.PET_YUANQUAN[this._petCfg.color - 1]));
                return sprite.node;
            }
        }.bind(this);
        function eventFunction(event) {
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_shenshouxiujiang_fazhen', effectFunction, eventFunction, false);
        effect.node.scaleY = (0.22);
        return node;
    }
    _xiujiang_jineng_1() {
        var sprite = UIHelper.newSprite(Path.getPet(PetShow.SKILL_BG1[this._petCfg.color - 1]));
        return sprite.node;
    }
    _xiujiang_jineng_2() {
        var content = this._petCfg.skill_name + this._petCfg.skill_description;
        var label = UIHelper.createWithTTF(content, Path.getCommonFont(), 22);
        label.node.width = (290);
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.node.setAnchorPoint(cc.v2(0, 0.5));
        return label.node;
    }
    _xiujiang_jineng_3() {
        var sprite = UIHelper.newSprite(Path.getPet(PetShow.SKILL_BG3[this._petCfg.color - 1]));
        return sprite.node;
    }
    _xiujiang_zi_1() {
        var content = Lang.get('pet_show_story_title');
        var label = UIHelper.createWithTTF(content, Path.getCommonFont(), 22);
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.node.width = (25);
        label.node.setAnchorPoint(cc.v2(0.5, 1));
        return label.node;
    }
    _xiujiang_zi_2() {
        var content = this._petCfg.description1;
        var label = UIHelper.createWithTTF(content, Path.getCommonFont(), 22);
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.node.width = (25);
        label.node.setAnchorPoint(cc.v2(0.5, 1));
        return label.node;
    }
    _xiujiang_zi_3() {
        var content = this._petCfg.description2;
        var label = UIHelper.createWithTTF(content, Path.getCommonFont(), 22);
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.node.width = (25);
        label.node.setAnchorPoint(cc.v2(0.5, 1));
        return label.node;
    }
    _xiujiang_mingzi() {
        var image = this._heroRes.show_name;
        var sprite = UIHelper.newSprite(Path.getShowHeroName(image));
        return sprite.node;
    }
    _xiujiang_role() {
        var avatar = (cc.instantiate(this._avatarPrefab) as cc.Node).getComponent(CommonHeroAvatar) as CommonHeroAvatar;
        avatar.init();
        avatar.setConvertType(TypeConvertHelper.TYPE_PET);
        avatar.updateUI(this._petCfg.id);
        avatar.showName(false);
        avatar.setScale(1.5);
        avatar.scheduleOnce(function () {
            avatar._playAnim("idle", true);
        }, 2)
        return avatar.node;
    }
    _xiujiang_colour_di() {
        var image = Path.getShowHero(PetShow.HERO_COLOR_BACK[this._petCfg.color -1] );
        var sprite = UIHelper.newSprite(image);
        return sprite.node;
    }
    _createAnimation() {
        let effectFunction = function (effect) {
            if (effect == 'effect_xiujiang_heidi') {
                var subEffect = new cc.Node();
                return subEffect;
            } else {
                return this._createActionNode(effect);
            }
        }.bind(this);
        let eventFunction = function (event) {
            if (event == 'finish') {
                this._createContinueNode();
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
            }
        }.bind(this);
        var movingName = 'moving_shenshouxiujiang';
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, movingName, effectFunction, eventFunction, false);
        this._effectShow = effect;
    }
    _createContinueNode() {
        var continueNode = cc.instantiate(this._commonContinueNode);
        this.node.addChild(continueNode);
        continueNode.setPosition(cc.v2(0, -250));
        this._isAction = false;
        if (this._needAutoClose) {
            this._scheduleHandler = function () {
                this._autoTime = this._autoTime + 1;
                if (this._autoTime >= PetShow.AUTO_CLOSE_TIME) {
                    if (this._callback) {
                        this._callback();
                    }
                    this.close();
                }
            }.bind(this);
            this.schedule(this._scheduleHandler, 1);
        }
    }
}