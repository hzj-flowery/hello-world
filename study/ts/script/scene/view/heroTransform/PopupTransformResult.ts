const { ccclass, property } = cc._decorator;

import CommonDesDiff from '../../../ui/component/CommonDesDiff'

import CommonContinueNode from '../../../ui/component/CommonContinueNode'
import PopupBase from '../../../ui/PopupBase';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Lang } from '../../../lang/Lang';
import EffectGfxNode from '../../../effect/EffectGfxNode';
import { Path } from '../../../utils/Path';
import { G_EffectGfxMgr } from '../../../init';
import { stringUtil } from '../../../utils/StringUtil';
import PetBreakResultTalentDesNode from '../pet/PetBreakResultTalentDesNode';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';

@ccclass
export default class PopupTransformResult extends PopupBase {
    public static path = 'heroTransform/PopupTransformResult'
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: CommonContinueNode,
        visible: true
    })
    _nodeContinue: CommonContinueNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTxt1: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSrcHero: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTarHero: cc.Label = null;

    @property({
        type: CommonDesDiff,
        visible: true
    })
    _nodeDesDiff1: CommonDesDiff = null;

    @property({
        type: CommonDesDiff,
        visible: true
    })
    _nodeDesDiff2: CommonDesDiff = null;

    @property({
        type: CommonDesDiff,
        visible: true
    })
    _nodeDesDiff3: CommonDesDiff = null;

    @property({
        type: CommonDesDiff,
        visible: true
    })
    _nodeDesDiff4: CommonDesDiff = null;

    @property({
        type: CommonDesDiff,
        visible: true
    })
    _nodeDesDiff5: CommonDesDiff = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;
    @property(cc.Prefab)
    petBreakResultTalentDesNode: cc.Prefab = null;
    @property(cc.Prefab)
    commonHeroAvatar: cc.Prefab = null;

    _parentView: any;
    _data: any;
    _canContinue: boolean;

    ctor(parentView, data) {
        this._parentView = parentView;
        this._data = data;
    }
    onCreate() {
    }
    onEnter() {
        this._canContinue = false;
        this._updateInfo();
        this._initEffect();
        this._playEffect();
    }
    onExit() {
    }
    onClickTouch() {
        if (this._canContinue) {
            this.close();
        }
    }
    _updateInfo() {
        var srcHeroBaseId = this._data.srcHeroBaseId;
        var tarHeroBaseId = this._data.tarHeroBaseId;
        var tarHeroLimitLevel = this._data.tarHeroLimitLevel;
        var srcParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, srcHeroBaseId, null, null, tarHeroLimitLevel);
        var tarParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, tarHeroBaseId, null, null, tarHeroLimitLevel);
        this._textSrcHero.string = (srcParam.name);
        this._textTarHero.string = (tarParam.name);
        this._textSrcHero.node.color = (srcParam.icon_color);
        this._textTarHero.node.color = (tarParam.icon_color);
        for (var i = 1; i <= 5; i++) {
            this['_nodeDesDiff' + i].updateUI(Lang.get('hero_transform_result_title_' + i), this._data.value[i-1], this._data.value[i-1]);
        }
        if (this._data.isGoldHero) {
            this['_nodeDesDiff1'].updateUI(Lang.get('hero_transform_result_title_gold'), this._data.value[2-1], this._data.value[2-1]);
            this['_nodeDesDiff4'].node.y = (this['_nodeDesDiff2'].node.y);
            this['_nodeDesDiff5'].node.y = (this['_nodeDesDiff3'].node.y);
            this['_nodeDesDiff2'].node.active = (false);
            this['_nodeDesDiff3'].node.active = (false);
        }
    }
    _initEffect() {
        this._nodeContinue.node.active = (false);
        this._nodeTxt1.active = (false);
        for (var i = 1; i <= 5; i++) {
            this['_nodeDesDiff' + i].node.active = (false);
        }
    }
    _playEffect() {
        let effectFunction = function (effect) {
            // if (effect == 'effect_wujiangbreak_jiesuotianfu') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_jiesuotianfu');
            //     subEffect.play();
            //     return subEffect;
            // }
            if (effect == 'moving_wujiangbreak_jiesuo') {
                var desNode = cc.instantiate(this.petBreakResultTalentDesNode).getComponent(PetBreakResultTalentDesNode) as PetBreakResultTalentDesNode;
                var textTalentName = desNode.TextTalentName;
                var textTalentDes: cc.Label = desNode.TextTalentDes;
                var imageButtomLine = desNode.ImageButtomLine;
                textTalentName.string = (this._talentName);
                textTalentName["_updateRenderData"](true)
                var nameSize = textTalentName.node.getContentSize();
                var namePosX = textTalentName.node.x;
                textTalentDes.node.width = 290 - nameSize.width;
                textTalentDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
                textTalentDes.string = (this._talentDes);
                textTalentDes.node.x = (namePosX + nameSize.width + 5);
                textTalentDes["_updateRenderData"](true)
                var desSize = textTalentDes.node.getContentSize();
                var posLineY = textTalentDes.node.y - desSize.height - 5;
                posLineY = Math.min(posLineY, 0);
                imageButtomLine.node.y = (posLineY);
                return desNode.node;
            }
            // if (effect == 'moving_wujiangbreak_txt_1') {
            // }
            // if (effect == 'effect_wujiangbreak_jiantou') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_jiantou');
            //     subEffect.play();
            //     return subEffect;
            // }
            if (effect == 'moving_zhihuan_role') {
                var node = this._createRoleEffect();
                return node;
            }
            return new cc.Node();
        }.bind(this);
        let eventFunction = function (event: string) {
            var stc = stringUtil.find(event, 'play_txt2_');
            if (stc != -1) {
                var index = parseFloat(event.charAt(event.length - 1));
                this['_nodeDesDiff' + index].node.active = (true);
                if (this._data.isGoldHero) {
                    this['_nodeDesDiff2'].node.active = (false);
                    this['_nodeDesDiff3'].node.active = (false);
                }
                G_EffectGfxMgr.applySingleGfx(this['_nodeDesDiff' + index].node, 'smoving_wujiangbreak_txt_2', null, null, null);
            } else if (event == 'play_txt1') {
                this._nodeTxt1.active = (true);
                G_EffectGfxMgr.applySingleGfx(this._nodeTxt1, 'smoving_wujiangbreak_txt_1', null, null, null);
            } else if (event == 'finish') {
                this._canContinue = true;
                this._nodeContinue.node.active = (true);
            }
        }.bind(this);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_zhihuanchenggong', effectFunction, eventFunction, false);
        effect.node.setPosition(cc.v2(0, 0));
    }
    _createRoleEffect() {
        let effectFunction = function (effect) {
            // if (effect == 'effect_wujiangbreak_xingxing') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_xingxing');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_wujiangbreak_guangxiao') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_guangxiao');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_wujiangbreak_tupochenggong') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_tupochenggong');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_wujiangbreak_luoxia') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_luoxia');
            //     subEffect.play();
            //     return subEffect;
            // }
            if (effect == 'levelup_role') {
                var petSpine = (cc.instantiate(this.commonHeroAvatar) as cc.Node).getComponent(CommonHeroAvatar) as CommonHeroAvatar;
                petSpine.init();
                petSpine.updateUI(this._data.tarHeroBaseId, null, null, this._data.tarHeroLimitLevel);
                petSpine.scheduleOnce(function () {
                    petSpine._playAnim("idle", true);
                }, 2)
                return petSpine.node;
            }
            // if (effect == 'effect_wujiangbreak_fazhen') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_fazhen');
            //     subEffect.play();
            //     return subEffect;
            // }
            // if (effect == 'effect_wujiangbreak_txt_di') {
            //     var subEffect = new EffectGfxNode('effect_wujiangbreak_txt_di');
            //     subEffect.play();
            //     return subEffect;
            // }
            return new cc.Node();
        }.bind(this);
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var node = new cc.Node();
        var effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_zhihuan_role', effectFunction, eventFunction, false);
        return node;
    }
}