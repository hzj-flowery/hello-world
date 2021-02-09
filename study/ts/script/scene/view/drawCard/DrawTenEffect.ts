import { AudioConst } from "../../../const/AudioConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_ResolutionManager, G_SignalManager, G_TutorialManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonContinueNode from "../../../ui/component/CommonContinueNode";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import HeroShow from "../heroShow/HeroShow";
import DrawCardBg from "./DrawCardBg";
const { ccclass, property } = cc._decorator;
@ccclass
export default class DrawTenEffect extends PopupBase {
    public static readonly DRAW_TYPE_MONEY = 1;
    public static readonly DRAW_TYPE_GOLD = 2;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGetBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGetDetail: cc.Label = null;

    _awards: any;
    _cardNode: any;
    _cardToOpen: any;
    _isAction: boolean;
    _isOpenCardAnim: any;
    _labelGetMoney: any;
    _hasShowTip: boolean;
    _getMoney: number;
    _getPoint: number;
    _heroShow: HeroShow;

    private _commonContinueNode: any;
    private _drawCardBgNode: any;
    private _closeCallBack:Function;
    public setCloseCB(cb:Function):void{
        this._closeCallBack = cb;
    }
    initData(awards: any, type?: any) {
        this._awards = awards;
        this._isAction = false
        this._hasShowTip = false
        if (type == DrawTenEffect.DRAW_TYPE_MONEY) {
            this._getMoney = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_NORMAL_GIVE).content);
            this._getPoint = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_POINT_NORMAL).content);
        } else if (type == DrawTenEffect.DRAW_TYPE_GOLD) {
            this._getMoney = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_MONEY_GIVE).content) * this._awards.length;
            this._getPoint = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_POINT_GOLD).content) * this._awards.length;
        }

        var data: Array<string> = [];
        data.push("prefab/common/CommonContinueNode");
        data.push("prefab/common/CommonHeroAvatar");
        cc.resources.load(data, cc.Prefab, handler(this, () => {
            var resource = cc.resources.get("prefab/common/CommonContinueNode");
            this._commonContinueNode = cc.instantiate(resource) as cc.Node;
        }));
    }

    onCreate() {
    }

    onEnter() {
        this._textGetDetail.node.active = false;
        this._imageGetBG.node.active = false;
        var point = G_ResolutionManager.getDesignCCPoint();
        point.x = 0;
        point.y = 0;
        this.node.setPosition(point);
        this.play();
    }
    onExit() {
        if(this._closeCallBack)
        this._closeCallBack();
        this._closeCallBack = null;
    }
    _playHeroShow(index) {
        var hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(this._awards[index].value);
        this._cardNode[index].addComponent(HeroShow);
        var node1 = new cc.Node();
        this._heroShow = node1.addComponent(HeroShow) as HeroShow;
        this._heroShow.create(hero.id, function () {
            this._openCard(index);
        }.bind(this));
    }
    onFinishTouch(sender, event) {
        if (this._isAction) {
            return;
        }
        if (this._isOpenCardAnim) {
            return;
        }
        if (this._cardToOpen.length == 0) {
            this.node.destroy();
            this._drawCardBgNode.destroy();
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "DrawTenEffect");
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
        } else {
            this._playHeroShow(this._cardToOpen[0]);
        }
    }
    _reset() {
        this._cardNode = [];
        this._cardToOpen = [];
        this._heroShow = null;
        this._textGetDetail.node.active = (false);
        this._imageGetBG.node.active = (false);
        this._hasShowTip = false;
    }
    _showGetDetail() {
        this._textGetDetail.node.active = (true);
        this._imageGetBG.node.active = (true);
        this._textGetDetail.string = (Lang.get('recruit_get_money', {
            count: this._getMoney,
            count2: this._getPoint
        }));
    }
    _playAvatarOpen(rootNode, hero) {
        this._isOpenCardAnim = true;
        var effectFunction = function (effect) {
            if (effect == 'card_lv') {
                var card = this._createCard(hero.color);
                if (!this._hasShowTip) {
                    this._showGetDetail();
                    this._hasShowTip = true;
                }
                return card;
            }
            else if (effect == "hero_come") {
                var resource = cc.resources.get("prefab/common/CommonHeroAvatar");
                let node1 = cc.instantiate(resource) as cc.Node;
                let avatar = node1.getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                avatar.init()
                avatar.updateUI(hero.id);
                avatar.showName(true, null);
                avatar.setCallBack(handler(this,this.onFinishTouch));
                G_AudioManager.playSoundWithId(AudioConst.SOUND_DRAW_SHOW_CARD);
                return node1;
            }
        }.bind(this);
        var eventFunction = function (event) {
            if (event == 'finish') {
                this._isOpenCardAnim = false;
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(rootNode, 'moving_card_open_yes', effectFunction, handler(this, eventFunction), false);
        var size = rootNode.getContentSize();
        effect.node.setPosition(size.width * 0.5, size.height * 0.5);
    }
    _playAvatarClose(rootNode, index: number) {
        function effectFunction(effect) {
            if (effect == 'card_lv') {
                var heroId = this._awards[index].value;
                var hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroId);
                var card = this._createCard(hero.color);
                return card;
            } else if (effect == 'shabi') {
                var params = {
                    name: index.toString(),
                    contentSize: cc.size(148, 208),
                    anchorPoint: cc.v2(0.5, 0.5),
                    position: cc.v2(0, 0)
                };
                var panel = UIHelper.createPanel(params);
                panel.active = true;
                panel.on("click", this._onTouchCard, this);
                return panel;
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(rootNode, 'moving_card_open_no', effectFunction.bind(this), null, false);
        var size = rootNode.getContentSize();
        effect.node.setPosition(size.width * 0.5, size.height * 0.5);
    }
    _onTouchCard(sender, event) {
        if (event == 2) {
            var index = parseInt(sender.getName());
            this._playHeroShow(index);
        }
    }
    _openCard(index) {
        var hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(this._awards[index].value);
        this._cardNode[index].removeAllChildren();
        this._playAvatarOpen(this._cardNode[index], hero);
        this._removeCardToOpenByIndex(index);
    }
    _removeCardToOpenByIndex(index) {
        for (var i = this._cardToOpen.length - 1; i >= 0; i--) {
            var val = this._cardToOpen[i];
            if (val == index) {
                this._cardToOpen.splice(i, 1);
                return;
            }
        }
    }
    // play() {
    //     this._reset();
    //     this._isAction = true;
    //     G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN);
    // }
    _createCard(color) {
        var effectName = [
            Path.getDrawCard('blue_card'),
            Path.getDrawCard('green_card'),
            Path.getDrawCard('blue_card'),
            'moving_cardlight_zise',
            'moving_cardlight_chengse',
            'moving_cardlight_hongse'
        ];
        if (color < 4) {
            var node = new cc.Node();
            node.addComponent(cc.Sprite);
            UIHelper.loadTexture(node.getComponent(cc.Sprite), effectName[color - 1])
            return node;
        } else {
            var node = new cc.Node();
            G_EffectGfxMgr.createPlayMovingGfx(node, effectName[color - 1]);
            return node;
        }
    }

    _createContinueNode() {
        var continueNode = (cc.instantiate(this._commonContinueNode) as cc.Node).getComponent(CommonContinueNode) as CommonContinueNode
        this.node.addChild(continueNode.node);
        continueNode.node.setPosition(cc.v2(0, -250));
    }
    _createHeroCardNode(nodeIndex?: any) {
        var showColor = 5;
        if (G_TutorialManager.isDoingStep()) {
            showColor = 4;
        }
        var index = nodeIndex || 1;
        var node = this._cardNode[index - 1];
        if (!node) {
            node = new cc.Node();
            this._cardNode[index - 1] = node;
        }
        var heroId = this._awards[index - 1].value;
        var hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroId);
        if (hero.color < showColor) {
            this._playAvatarOpen(node, hero);
        } else {
            this._playAvatarClose(node, index - 1);
            this._cardToOpen.push(index - 1);
        }
        return node;
    }


    _createActionNode(effect) {
        if (effect == "kabaoc_c") {
            let node = new cc.Node();
            node.addComponent(cc.Sprite);
            UIHelper.loadTexture(node.getComponent(cc.Sprite), Path.getDrawCard('zhaomu_cheng'))
            return node;
        }
        else if (effect == "draw_hero_back_a") {
            let point = G_ResolutionManager.getDesignCCPoint()
            this._drawCardBgNode = new cc.Node();
            this._drawCardBgNode.addComponent(DrawCardBg);
            return this._drawCardBgNode;
        }
        else if (effect == "draw_hero_back_b") {
            let node = new cc.Node();
            node.addComponent(cc.Sprite);
            UIHelper.loadTexture(node.getComponent(cc.Sprite), Path.getDrawCard('zhaomu_bj_2'))
            return node;
        }
        else if (effect == "draw_hero_back_c") {
            let node = new cc.Node();
            node.addComponent(cc.Sprite);
            UIHelper.loadTexture(node.getComponent(cc.Sprite), Path.getDrawCard('zhaomu_bj_3'))
            return node;
        }
        if (effect.indexOf("card_to_hero_") != -1) {
            let strArray = effect.split("_")
            let index = parseInt(strArray[3])
            return this._createHeroCardNode(index)
        }
        else if (effect.indexOf("card_") != -1) {
            let strArray = effect.split("_");
            let index = parseInt(strArray[1])
            let heroId = this._awards[index - 1].value
            let hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroId)
            let card = this._createCard(hero.color)
            return card;
        }
    }
    play() {
        this._reset();
        this._isAction = true;
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN);

        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_draw_hero_kabaoc', this.effectFunction.bind(this), handler(this, this.eventFunction), false);
    }

    private effectFunction(effect: any) {
        if (effect == 'effect_kabao_red_z') {

        }
        else if (effect == "effect_choujiang_knight_sj1_z") {

        }
        else if (effect == "effect_hei_z") {

        }
        else {
            return this._createActionNode(effect);
        }
    }

    private eventFunction(event: any) {
        if (event == 'finish') {
            this._isAction = false;
            this._createContinueNode();
        }
    }
}