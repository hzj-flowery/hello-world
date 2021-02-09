import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_ConfigLoader, G_EffectGfxMgr, G_HeroVoiceManager, G_ResolutionManager, G_SceneManager, G_SignalManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonStoryAvatar from "../../../ui/component/CommonStoryAvatar";
import { Color } from "../../../utils/Color";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroShow extends cc.Component {

    private static AUTO_CLOSE_TIME = 10

    private static HERO_COLOR_BACK =
        [
            "",
            "",
            "",
            "show_purple",
            "show_yellow1",
            "show_red",
            "show_gold",
        ]

    private static SHENBING_BACK =
        [
            "",
            "",
            "",
            "show_purple2",
            "show_yellow2",
            "show_red2",
            "show_gold2",
        ]

    private static DES_BG1 =
        [
            "",
            "",
            "",
            "show_purple3",
            "show_yellow3",
            "show_red3",
            "show_god3",
        ]

    private static DES_BG2 =
        [
            "",
            "",
            "",
            "show_purple4",
            "show_yellow4",
            "show_red4",
            "show_red4",
        ]

    private static EFFECT_DI = [
        "",
        "",
        "",
        "effect_xiujiang_yuanquanzise",
        "effect_xiujiang_yuanquanchengse",
        "effect_xiujiang_yuanquanhongse",
        "effect_xiujiang_yuanquanjinse",
    ]

    private _hero;
    private _heroRes;
    private _instrument;
    private _panelFinish: cc.Node;
    private _isAction: boolean;
    private _callback: Function;
    private _needAutoClose;
    private _autoTime: number;
    private _isRight: boolean;
    private _layerColor: cc.Node;

    public create(heroId, callback, needAutoClose?: boolean, isRight?) {
        this._createMask();
        this._hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroId);
        this._heroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(this._hero.res_id);
        this._instrument = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(this._hero.instrument_id);
        this._panelFinish = null;
        this._isAction = true;
        this._callback = callback;
        this._needAutoClose = needAutoClose;
        this._autoTime = 0;
        this._isRight = isRight;
        G_SceneManager.getRunningScene().addChildToPopup(this.node);

        this.play();
    }

    private _createMask() {
        this._layerColor = new cc.Node("popModalLayer");
        let width: number = G_ResolutionManager.getDesignWidth();
        let height: number = G_ResolutionManager.getDesignHeight();
        this._layerColor.setContentSize(width, height);
        this._layerColor.addComponent(cc.BlockInputEvents);
        this._layerColor.on(cc.Node.EventType.TOUCH_START, handler(this, this._onFinishTouch));

        let g: cc.Graphics = this._layerColor.addComponent(cc.Graphics);
        g.lineWidth = 1;
        g.fillColor = new cc.Color(0, 0, 0, 255 * 0.8);
        g.fillRect(-width / 2, -height / 2, width, height);
        this.node.addChild(this._layerColor, -1);
    }


    public _onFinishTouch(sender, event) {
        if (!this._isAction) {
            if (this._callback) {
                this._callback();
            }
            this.node.removeFromParent();
        }
    }

    public play() {
        this._isAction = true;
        this._panelFinish = new cc.Node("_panelFinish");
        this._panelFinish.addComponent(cc.BlockInputEvents);
        this._panelFinish.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelFinish.on(cc.Node.EventType.TOUCH_START, handler(this, this._onFinishTouch));
        this.node.addChild(this._panelFinish);
        this._isAction = true;
        this._createAnimation();
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN);
    }

    private _createActionNode(effect) {
        var funcName = '_' + effect;
        if (funcName) {
            var func: Function = this[funcName];
            var node = func.apply(this);
            return node;
        }
    }

    private _xiujiang_zi_shenbing_wuqiu(): cc.Node {
        var image = Path.getInstrument(this._instrument.res);
        var sprite = UIHelper.newSprite(image);
        sprite.node.name = "_xiujiang_zi_shenbing_wuqiu";
        return sprite.node;
    }

    private _xiujiang_zi_shenbing_o(): cc.Node {
        var image = Path.getShowHero(HeroShow.SHENBING_BACK[this._hero.color - 1]);
        var sprite = UIHelper.newSprite(image);
        sprite.node.name = "_xiujiang_zi_shenbing_o";
        return sprite.node;
    }

    private _xiujiang_zi_dingwei(): cc.Node {
        var content = Lang.get('hero_show_position') + this._hero.feature;
        var label = UIHelper.createWithTTF(content, Path.getCommonFont(), 32);
        let args: any[] = Color.getHeroYellowShowColor();
        var color = args[0];
        let outline = args[1];
        label.node.color = (color);
        UIHelper.enableOutline(label, outline, 2);
        label.node.setAnchorPoint(0, 0.5);
        label.node.name = "_xiujiang_zi_dingwei";
        return label.node;
    }

    private _xiujiang_zi_dingwei_txt(): cc.Node {
        var content: string = this._hero.skill_name + this._hero.skill_description;
        content = content.replace("\\n", "\n");
        var label = UIHelper.createWithTTF(content, Path.getCommonFont(), 20);
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.node.width = (370);
        label.node.setAnchorPoint(0, 0.5);
        label.node.name = "_xiujiang_zi_dingwei_txt";
        return label.node;
    }

    private _xiujiang_zi_dingwei_di(): cc.Node {
        var path = HeroShow.DES_BG1[this._hero.color - 1];
        if (!this._isRight) {
            path += "_r";
        } 
        var image = Path.getShowHero(path);
        var sprite = UIHelper.newSprite(image);
        sprite.node.name = "_xiujiang_zi_dingwei_di";
        return sprite.node;
    }

    private _xiujiang_zi_shenbing(): cc.Node {
        var content = Lang.get('hero_show_instrument') + this._instrument.name;
        var label = UIHelper.createWithTTF(content, Path.getCommonFont(), 32);
        let args: any[] = Color.getHeroYellowShowColor();
        var color = args[0];
        let outline = args[1];
        label.node.color = (color);
        UIHelper.enableOutline(label, outline, 2);
        label.node.setAnchorPoint(0, 0.5);
        label.node.name = "_xiujiang_zi_shenbing";
        return label.node;
    }

    private _xiujiang_zi_shenbing_txt(): cc.Node {
        var content = this._hero.instrument_description;
        content = content.replace("\\n", "\n");
        var label = UIHelper.createWithTTF(content, Path.getCommonFont(), 20);
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.node.width = (370);
        label.node.setAnchorPoint(0, 0.5);
        label.node.name = "_xiujiang_zi_shenbing_txt";
        return label.node;
    }

    private _xiujiang_zi_shenbing_di(): cc.Node {
        var path = HeroShow.DES_BG1[this._hero.color - 1];
        if (!this._isRight) {
            path += "_r";
        } 
        var image = Path.getShowHero(path);
        var sprite = UIHelper.newSprite(image);
        sprite.node.name = "_xiujiang_zi_shenbing_di";
        return sprite.node;
    }

    private _xiujiang_zi_1(): cc.Node {
        var content = Lang.get('hero_show_story_title');
        var label = UIHelper.createWithTTF(content, Path.getCommonFont(), 20);
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.node.width = (25);
        label.node.setAnchorPoint(0.5, 1);
        label.node.name = "_xiujiang_zi_1";
        return label.node;
    }

    private _xiujiang_zi_2(): cc.Node {
        var content = this._hero.description1;
        var label = UIHelper.createWithTTF(content, Path.getCommonFont(), 20);
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.node.width = (25);
        label.node.setAnchorPoint(0.5, 1);
        label.node.name = "_xiujiang_zi_2";
        return label.node;
    }

    private _xiujiang_zi_3(): cc.Node {
        var content = this._hero.description2;
        var label = UIHelper.createWithTTF(content, Path.getCommonFont(), 20);
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.node.width = (25);
        label.node.setAnchorPoint(0.5, 1);
        label.node.name = "_xiujiang_zi_3";
        return label.node;
    }

    private _xiujiang_country(): cc.Node {
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, this._hero.id);
        var sprite = UIHelper.newSprite(param.country_text);
        sprite.node.name = "_xiujiang_country";
        return sprite.node;
    }

    private _xiujiang_mingzi(): cc.Node {
        var image = this._heroRes.show_name;
        var sprite = UIHelper.newSprite(Path.getShowHeroName(image));
        sprite.node.name = "_xiujiang_mingzi"
        return sprite.node;
    }

    private _xiujiang_role(): cc.Node {
        let node: cc.Node = new cc.Node("_xiujiang_role");
        cc.resources.load(Path.getPrefab('CommonStoryAvatar', 'common'), function (err, res) {
            if (err != null || res == null) {
                return;
            }
            let heroAvatar = cc.instantiate(res).getComponent(CommonStoryAvatar) as CommonStoryAvatar;
            node.addChild(heroAvatar.node);
            heroAvatar.updateUI(this._hero.id);

            heroAvatar.scheduleOnce(function () {
                heroAvatar.playIdleAni();
            }, 1);
            G_HeroVoiceManager.playVoiceWithHeroId(this._hero.id, true);
        }.bind(this));
        return node;
    }

    private _xiujiang_colour_di(): cc.Node {
        if (this._isRight) {
            var image = Path.getShowHero(HeroShow.HERO_COLOR_BACK[this._hero.color - 1]); // ;
            var sprite = UIHelper.newSprite(image);
            sprite.node.name = "_xiujiang_colour_di";
            return sprite.node;
        }else {
            let node = new cc.Node();
            G_EffectGfxMgr.createPlayGfx(node, HeroShow.EFFECT_DI[this._hero.color -1]);
            return node;
        }
 
    }

    private _xiujiang_colour_di2(): cc.Node {
        var path = HeroShow.HERO_COLOR_BACK[this._hero.color - 1] + '_r';
        var image = Path.getShowHero(path); 
        var sprite = UIHelper.newSprite(image);
        sprite.node.name = "_xiujiang_colour_di";
        return sprite.node;
    }

    private _createAnimation() {
        function effectFunction(effect) {
            return this._createActionNode(effect);
        }
        function eventFunction(event) {
            if (event == 'finish') {
                this._createContinueNode();
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
            }
        }
        var movingName = 'moving_xiujiang';
        if (this._isRight) {
            movingName = 'moving_xiujiangjx';
        }
        G_EffectGfxMgr.createPlayMovingGfx(this.node, movingName, effectFunction.bind(this), eventFunction.bind(this), false);
    }

    private _createContinueNode() {
        let node: cc.Node = new cc.Node();
        node.setPosition(0, -250);
        this.node.addChild(node);

        cc.resources.load(Path.getPrefab('CommonContinueNode', 'common'), function (err, res) {
            if (err != null || res == null) {
                return;
            }
            let continueNode = cc.instantiate(res);
            node.addChild(continueNode);
        });
        this._isAction = false;
        if (this._needAutoClose) {
            this.scheduleOnce(function () {
                if (this._callback) {
                    this._callback();
                }
                this._close();
            }, HeroShow.AUTO_CLOSE_TIME);
        }
    }

    private _close() {
        this.node.removeFromParent();
    }
}