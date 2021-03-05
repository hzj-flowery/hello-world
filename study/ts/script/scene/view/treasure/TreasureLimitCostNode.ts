import { AudioConst } from "../../../const/AudioConst";
import TreasureConst from "../../../const/TreasureConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_AudioManager, G_EffectGfxMgr, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { SpineNode } from "../../../ui/node/SpineNode";
import { TreasureDataHelper } from "../../../utils/data/TreasureDataHelper";
import { Path } from "../../../utils/Path";
import UIActionHelper from "../../../utils/UIActionHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;


var POSY_START = -46;
var POSY_END = 30;
var RES_NAME = {
    [TreasureConst.TREASURE_LIMIT_COST_KEY_1]: {
        imageButtom: 'img_limit_01',
        imageFront: [
            'img_limit_gold_hero01a',
            'img_limit_gold_hero01a'
        ],
        ripple: 'green',
        imageName: [
            'txt_limit_01b',
            'txt_limit_01b'
        ],
        effectBg: 'effect_tujiegreen',
        moving: 'moving_tujieballgreen',
        effectReceive: 'effect_tujiedianjigreen',
        effectFull: 'effect_tujie_mannenglianggreen',
        smoving: 'smoving_tujiehuangreen'
    },
    [TreasureConst.TREASURE_LIMIT_COST_KEY_2]: {
        imageButtom: 'img_limit_02',
        imageFront: [
            'img_limit_gold_hero02a',
            'img_limit_gold_hero02a'
        ],
        ripple: 'blue',
        imageName: [
            'txt_limit_02b',
            'txt_limit_02b'
        ],
        effectBg: 'effect_tujieblue',
        moving: 'moving_tujieballblue',
        effectReceive: 'effect_tujiedianjiblue',
        effectFull: 'effect_tujie_mannengliangblue',
        smoving: 'smoving_tujiehuanblue'
    },
    [TreasureConst.TREASURE_LIMIT_COST_KEY_3]: {
        imageButtom: 'img_limit_03',
        imageFront: [
            'img_limit_gold_hero05a',
            'img_limit_gold_hero05a'
        ],
        ripple: 'purple',
        imageName: [
            'txt_limit_03',
            'txt_limit_01d'
        ],
        effectBg: 'effect_tujiepurple',
        moving: 'moving_tujieballpurple',
        effectReceive: 'effect_tujiedianjipurple',
        effectFull: 'effect_tujie_mannengliangpurple',
        smoving: 'smoving_tujiehuanpurple'
    },
    [TreasureConst.TREASURE_LIMIT_COST_KEY_4]: {
        imageButtom: 'img_limit_04',
        imageFront: [
            'img_limit_gold_hero06a',
            'img_limit_gold_hero06a'
        ],
        ripple: 'orange',
        imageName: [
            'txt_limit_04',
            'txt_limit_02d'
        ],
        effectBg: 'effect_tujieorange',
        moving: 'moving_tujieballorange',
        effectReceive: 'effect_tujiedianjiorange',
        effectFull: 'effect_tujie_mannengliangorange',
        smoving: 'smoving_tujiehuanorange'
    }
};

@ccclass
export default class TreasureLimitCostNode extends cc.Component {
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
    private _treasureUnitData: any;

    ctor(costKey, callback) {
        this._costKey = costKey;
        this._callback = callback;
        this._isShowCount = false;
        this._isFull = false;
        this._init();
        this._check();
    }
    _init() {
        UIHelper.addEventListener(this.node, this._buttonAdd, 'TreasureLimitCostNode', '_onClickAdd');
        UIActionHelper.playBlinkEffect2(this._buttonAdd.node);
        UIHelper.loadTexture(this._imageButtom, Path.getLimitImg(RES_NAME[this._costKey].imageButtom));
        UIHelper.loadTexture(this._imageFront, Path.getLimitImg(RES_NAME[this._costKey].imageFront[0]));
        var spineRipple = SpineNode.create();
        this._nodeRipple.addChild(spineRipple.node);
        spineRipple.setAsset(Path.getEffectSpine('tujieshui'));
        spineRipple.setAnimation(RES_NAME[this._costKey].ripple, true);
        UIHelper.loadTexture(this._imageName, Path.getTextLimit(RES_NAME[this._costKey].imageName[0]));
        G_EffectGfxMgr.createPlayGfx(this._nodeEffectBg, RES_NAME[this._costKey].effectBg);
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeFull, RES_NAME[this._costKey].moving, null, null, false);
        this._initPos = this.node.getPosition();
        var treasureId = G_UserData.getTreasure().getCurTreasureId();
        this._treasureUnitData = G_UserData.getTreasure().getTreasureDataWithId(treasureId);
    }
    _check() {
        if (this._costKey == TreasureConst.TREASURE_LIMIT_COST_KEY_3 || this._costKey == TreasureConst.TREASURE_LIMIT_COST_KEY_4) {
            this._isShowCount = true;
        } else {
            this._isShowCount = false;
        }
    }
    updateUI(limitLevel, curCount, showTop) {
        if (limitLevel >= TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL && showTop) {
            this._isFull = false;
            this.node.active = (false);
            return;
        }
        var changeBg = limitLevel == TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL || limitLevel == TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL && !showTop;
        if (changeBg) {
            UIHelper.loadTexture(this._imageFront, Path.getLimitImg(RES_NAME[this._costKey].imageFront[1]));
            UIHelper.loadTexture(this._imageName, Path.getTextLimit(RES_NAME[this._costKey].imageName[1]));
        } else {
            UIHelper.loadTexture(this._imageFront, Path.getLimitImg(RES_NAME[this._costKey].imageFront[0]));
            UIHelper.loadTexture(this._imageName, Path.getTextLimit(RES_NAME[this._costKey].imageName[0]));
        }
        this.node.active = (true);
        var [percent, totalCount] = this._calPercent(limitLevel, curCount);
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
    _calPercent(limitLevel, curCount) {
        var info = TreasureDataHelper.getLimitCostConfig(limitLevel);
        var size = 0;
        if (this._costKey == TreasureConst.TREASURE_LIMIT_COST_KEY_1) {
            size = info.exp;
        } else {
            size = info['size_' + this._costKey] || 0;
        }
        var percent = Math.floor(curCount / size * 100);
        return [
            Math.min(percent, 100),
            size
        ];
    }
    playRippleMoveEffect(limitLevel, curCount) {
        this._nodeRipple.stopAllActions();
        var [percent, totalCount] = this._calPercent(limitLevel, curCount);
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
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, RES_NAME[this._costKey].effectReceive, eventFunc, true);
    }
    _playFullEffect() {
        let eventFunc = function (event) {
            if (event == 'fuck') {
                this._updateState();
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, RES_NAME[this._costKey].effectFull, eventFunc, true);
    }
    playSMoving() {
        G_EffectGfxMgr.applySingleGfx(this.node, RES_NAME[this._costKey].smoving, function () {
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
