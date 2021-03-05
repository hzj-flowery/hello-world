import { AudioConst } from "../../../const/AudioConst";
import InstrumentConst from "../../../const/InstrumentConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_AudioManager, G_EffectGfxMgr } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { SpineNode } from "../../../ui/node/SpineNode";
import { InstrumentDataHelper } from "../../../utils/data/InstrumentDataHelper";
import { Path } from "../../../utils/Path";
import UIActionHelper from "../../../utils/UIActionHelper";
import UIHelper from "../../../utils/UIHelper";
import { StateHistoryShow } from "../../../fight/state/StateHistoryShow";

const { ccclass, property } = cc._decorator;


var POSY_START = -46;
var POSY_END = 30;
var RES_NAME_RED = {
    [InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1]: {
        imageButtom: 'img_limit_03',
        imageFront: 'img_limit_gold_hero05a',
        ripple: 'purple',
        imageName: 'txt_limit_03',
        effectBg: 'effect_tujiepurple',
        moving: 'moving_tujieballpurple',
        effectReceive: 'effect_tujiedianjipurple',
        effectFull: 'effect_tujie_mannengliangpurple',
        smoving: 'smoving_shenbingtujie_left'
    },
    [InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2]: {
        imageButtom: 'img_limit_04',
        imageFront: 'img_limit_gold_hero06a',
        ripple: 'orange',
        imageName: 'txt_limit_04',
        effectBg: 'effect_tujieorange',
        moving: 'moving_tujieballorange',
        effectReceive: 'effect_tujiedianjiorange',
        effectFull: 'effect_tujie_mannengliangorange',
        smoving: 'smoving_shenbingtujie_right'
    }
};
var RES_NAME_GOLD = {
    [InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1]: {
        imageButtom: 'img_limit_03',
        imageFront: 'img_limit_gold_hero05a',
        ripple: 'purple',
        imageName: 'txt_limit_01d',
        effectBg: 'effect_tujiepurple',
        moving: 'moving_tujieballpurple',
        effectReceive: 'effect_tujiedianjipurple',
        effectFull: 'effect_tujie_mannengliangpurple',
        smoving: 'smoving_shenbingtujie_left'
    },
    [InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2]: {
        imageButtom: 'img_limit_04',
        imageFront: 'img_limit_gold_hero06a',
        ripple: 'orange',
        imageName: 'txt_limit_02d',
        effectBg: 'effect_tujieorange',
        moving: 'moving_tujieballorange',
        effectReceive: 'effect_tujiedianjiorange',
        effectFull: 'effect_tujie_mannengliangorange',
        smoving: 'smoving_shenbingtujie_right'
    }
};

@ccclass
export default class InstrumentLimitCostNode extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFull: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeNormal: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageButtom: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCount: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPercent: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageName: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectBg: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonAdd: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageFront: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRipple: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    _costKey: any;
    _callback: any;
    _isShowCount: boolean;
    _isFull: boolean;
    _initPos: cc.Vec2;
    _addMask: any;
    RES_NAME = {}

    onLoad() {
        this._imageFront.node.setContentSize(74, 74);
        this._imageFront.node.y = 0;
        this._imageButtom.node.zIndex = -2;
    }

    ctor(costKey, callback) {
        this._costKey = costKey;
        this._callback = callback;
        this._isShowCount = false;
        this._isFull = false;
        this._init();
        this._check();
    }
    _init() {
        UIHelper.addEventListener(this.node, this._buttonAdd, 'InstrumentLimitCostNode', '_onClickAdd');
        UIActionHelper.playBlinkEffect2(this._buttonAdd.node);

        this.setStyle(5);
        this._initPos = this.node.getPosition();
    }
    _check() {
        this._isShowCount = true;
    }

    private addMask() {
        if (!this._addMask) {
            this._addMask = true;
            var rippleCt = new cc.Node();
            rippleCt.setContentSize(74, 74);
            rippleCt.setAnchorPoint(0.5, 0.5);
            this._nodeNormal.addChild(rippleCt);
            var mask = rippleCt.addComponent(cc.Mask);
            mask.type = cc.Mask.Type.ELLIPSE;
            mask.segements = 65;
            this._nodeRipple.parent = rippleCt;
        }
    }

    updateUI(templateId, limitLevel, curCount, instrumentUnitData) {
        this.addMask();
        var maxLimitLevel = instrumentUnitData.getMaxLimitLevel();
        var isLevelMax = instrumentUnitData.getLevel() >= instrumentUnitData.getAdvanceMaxLevel();
        if (limitLevel >= maxLimitLevel || !instrumentUnitData.getLimitFuncOpened()) {
            this._isFull = false;
            this.node.active = (false);
            return;
        }
        this.node.active = (true);
        var [percent, totalCount] = this._calPercent(templateId, limitLevel, curCount);
        this._isFull = percent >= 100;
        var ripplePos = this._getRipplePos(percent);
        this._nodeRipple.setPosition(ripplePos.x, ripplePos.y);
        if (this._isShowCount) {
            this._textPercent.string = ('');
            this._nodeCount.removeAllChildren();
            var content = Lang.get('instrument_limit_cost_count', {
                curCount: curCount,
                totalCount: totalCount
            });
            var richText = RichTextExtend.createWithContent(content);
            richText.node.setAnchorPoint(cc.v2(0, 0.5));
            this._nodeCount.addChild(richText.node);
        } else {
            this._textPercent.string = (percent + '%');
        }
        this._updateState();
        this.node.setPosition(this._initPos);
    }

    setStyle(style) {
        if (style == 6) {
            this.RES_NAME = RES_NAME_GOLD;
        } else {
            this.RES_NAME = RES_NAME_RED;
        }
        UIHelper.loadTexture(this._imageButtom, Path.getLimitImg(this.RES_NAME[this._costKey].imageButtom));
        UIHelper.loadTexture(this._imageFront, Path.getLimitImg(this.RES_NAME[this._costKey].imageFront));
        this._nodeRipple.removeAllChildren();

        var spineRipple = SpineNode.create();
        this._nodeRipple.addChild(spineRipple.node);
        spineRipple.setAsset(Path.getEffectSpine('tujieshui'));
        spineRipple.setAnimation(this.RES_NAME[this._costKey].ripple, true);

        this._nodeEffectBg.removeAllChildren();
        UIHelper.loadTexture(this._imageName, Path.getTextLimit(this.RES_NAME[this._costKey].imageName));
        G_EffectGfxMgr.createPlayGfx(this._nodeEffectBg, this.RES_NAME[this._costKey].effectBg);
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeFull, this.RES_NAME[this._costKey].moving, null, null, false);
    }
    _onClickAdd() {
        if (this._callback) {
            this._callback(this._costKey);
        }
    }
    _getRipplePos(percent) {
        var height = (POSY_END - POSY_START) * percent / 100;
        var targetPosY = POSY_START + height;
        return {
            x: 0,
            y: targetPosY
        };
    }
    _calPercent(templateId, limitLevel, curCount) {
        var info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel);
        var size = info['size_' + this._costKey] || 0;
        var percent = Math.floor(curCount / size * 100);
        return [
            Math.min(percent, 100),
            size
        ];
    }
    playRippleMoveEffect(templateId, limitLevel, curCount) {
        this._nodeRipple.stopAllActions();
        var [percent, totalCount] = this._calPercent(templateId, limitLevel, curCount);
        this._isFull = percent >= 100;
        var targetPos = this._getRipplePos(percent);
        var action = cc.moveTo(0.4, cc.v2(targetPos.x, targetPos.y));
        this._nodeRipple.runAction(action);
        if (this._isShowCount) {
            this._textPercent.string = ('');
            this._nodeCount.removeAllChildren();
            var content = Lang.get('instrument_limit_cost_count', {
                curCount: curCount,
                totalCount: totalCount
            });
            var richText = RichTextExtend.createWithContent(content);
            richText.node.setAnchorPoint(cc.v2(0, 0.5));
            this._nodeCount.addChild(richText.node);
        } else {
            this._textPercent.string = (percent + '%');
        }
        this._playEffect(this._isFull);
    }
    _playEffect(isFull) {
        if (isFull) {
            G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_YINMAN);
            this._playFullEffect();
        } else {
            this._playCommonEffect();
        }
    }
    _playCommonEffect() {
        let eventFunc = function (event) {
            if (event == 'finish') {
                this._updateState();
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, this.RES_NAME[this._costKey].effectReceive, eventFunc, true);
    }
    _playFullEffect() {
        let eventFunc = function (event) {
            if (event == 'fuck') {
                this._updateState();
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, this.RES_NAME[this._costKey].effectFull, eventFunc, true);
    }
    playSMoving() {
        G_EffectGfxMgr.applySingleGfx(this.node, this.RES_NAME[this._costKey].smoving, function () {
            this.node.active = (false);
        }.bind(this));
    }
    _updateState() {
        this._nodeFull.active = (this._isFull);
        this._nodeNormal.active = (!this._isFull);
    }
    isFull() {
        return this._isFull;
    }
    showRedPoint(show) {
        this._redPoint.node.active = (show);
    }

}
