const { ccclass, property } = cc._decorator;

import CommonDesDiff from '../../../../ui/component/CommonDesDiff'

import CommonContinueNode from '../../../../ui/component/CommonContinueNode'
import PopupBase from '../../../../ui/PopupBase';
import { TypeConvertHelper } from '../../../../utils/TypeConvertHelper';
import PopupTransformResult from '../../heroTransform/PopupTransformResult';
import { Lang } from '../../../../lang/Lang';
import EffectGfxNode from '../../../../effect/EffectGfxNode';
import { Path } from '../../../../utils/Path';
import { G_EffectGfxMgr } from '../../../../init';
import { stringUtil } from '../../../../utils/StringUtil';
import CommonTreasureAvatar from '../../../../ui/component/CommonTreasureAvatar';
import CommonInstrumentAvatar from '../../../../ui/component/CommonInstrumentAvatar';

@ccclass
export default class TrPopupTransformResult extends PopupBase {
    public static path = 'transform/treasure/TrPopupTransformResult';
    public static ATTAR_SUM = 3;
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
    _textSrcTreasure: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTarTreasure: cc.Label = null;

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
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property(cc.Prefab)
    commonTreasureAvatar: cc.Prefab = null;

    @property(cc.Prefab)
    commonInstrumentAvatar: cc.Prefab = null;

    _parentView: any;
    _data: any;
    _canContinue: boolean;
    _type: number;
    _attrNum = 3;

    ctor(parentView, data, type = TypeConvertHelper.TYPE_TREASURE) {
        this._parentView = parentView;
        this._data = data;
        this._type = type;
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
        var srcItemBaseId = this._data.srcItemBaseId;
        var tarItemBaseId = this._data.tarItemBaseId;
        if (this._type == TypeConvertHelper.TYPE_TREASURE) {
            var srcParam = TypeConvertHelper.convert(this._type, srcItemBaseId);
            var tarParam = TypeConvertHelper.convert(this._type, tarItemBaseId);
            this._attrNum = 3;
        } else {
            var tarLimitLevel = this._data.tarLimitLevel
            var srcParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, srcItemBaseId, null, null, tarLimitLevel)
            var tarParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, tarItemBaseId, null, null, tarLimitLevel)
            this._attrNum = 2;
        }

        this._textSrcTreasure.string = (srcParam.name);
        this._textTarTreasure.string = (tarParam.name);
        this._textSrcTreasure.node.color = (srcParam.icon_color);
        this._textTarTreasure.node.color = (tarParam.icon_color);
        for (var i = 1; i <= this._attrNum; i++) {
            this['_nodeDesDiff' + i].updateUI(Lang.get('treasure_transform_result_title_' + i), this._data.value[i - 1], this._data.value[i - 1]);
        }
    }
    _initEffect() {
        this._nodeContinue.node.active = (false);
        this._nodeTxt1.active = (false);
        for (var i = 1; i <= TrPopupTransformResult.ATTAR_SUM; i++) {
            this['_nodeDesDiff' + i].node.active = (false);
        }
    }
    _playEffect() {
        let effectFunction = function (effect) {
            if (effect == 'moving_zhihuan_role') {
                var node = this._createRoleEffect();
                return node;
            }
            return new cc.Node();
        }.bind(this);
        let eventFunction = function (event) {
            var stc = stringUtil.find(event, 'play_txt2_');
            if (stc != -1) {
                var index = parseFloat(event.charAt(event.length - 1));
                if (index <= this._attrNum) {
                    this['_nodeDesDiff' + index].node.active = (true);
                    G_EffectGfxMgr.applySingleGfx(this['_nodeDesDiff' + index].node, 'smoving_wujiangbreak_txt_2', null, null, null);
                }
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
            if (effect == 'levelup_role') {
                var spineNode = new cc.Node();
                if (this._type == TypeConvertHelper.TYPE_TREASURE) {
                    var itemSpine = cc.instantiate(this.commonTreasureAvatar).getComponent(CommonTreasureAvatar);
                    itemSpine.updateUI(this._data.tarItemBaseId);
                } else {
                    itemSpine = cc.instantiate(this.commonInstrumentAvatar).getComponent(CommonInstrumentAvatar);
                    itemSpine.updateUI(this._data.tarItemBaseId, this._data.tarLimitLevel);
                }
                itemSpine.showShadow(false);
                itemSpine.node.y = (80);
                spineNode.addChild(itemSpine.node);
                return spineNode;
            }
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