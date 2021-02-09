import { AudioConst } from "../../../const/AudioConst";
import { LimitCostConst } from "../../../const/LimitCostConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_AudioManager, G_EffectGfxMgr, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonUI from "../../../ui/component/CommonUI";
import { SpineNode } from "../../../ui/node/SpineNode";
import { Path } from "../../../utils/Path";
import UIActionHelper from "../../../utils/UIActionHelper";
import HeroGoldHelper from "./HeroGoldHelper";

var RES_CONST = {
    [LimitCostConst.LIMIT_COST_KEY_2]: {
        imageButtom: 'img_gold_cultivate_bg01b',
        imageFront: '',
        effectBg: 'effect_tujieorange',
        imageName: 'txt_goldhero_cultivate_03',
        ripple: 'orange',
        effectFull: 'effect_tujie_mannengliangorange',
        smoving: 'smoving_tujiehuanblue',
        effectReceive: 'effect_tujiedianjiorange',
        fullName: 'img_gold_cultivate_01b'
    },
    [LimitCostConst.LIMIT_COST_KEY_3]: {
        imageButtom: 'img_gold_cultivate_bg01a',
        imageFront: '',
        ripple: 'orange',
        imageName: 'txt_goldhero_cultivate_01',
        effectBg: 'effect_tujiepurple',
        smoving: 'smoving_tujiehuanpurple',
        effectReceive: 'effect_tujiedianjipurple',
        effectFull: 'effect_tujie_mannengliangpurple',
        fullName: 'img_gold_cultivate_01a'
    },
    [LimitCostConst.LIMIT_COST_KEY_4]: {
        imageButtom: 'img_gold_cultivate_bg01c',
        imageFront: '',
        ripple: 'orange',
        imageName: 'txt_goldhero_cultivate_02',
        effectBg: 'effect_tujieorange',
        smoving: 'smoving_tujiehuanorange',
        effectReceive: 'effect_tujiedianjiorange',
        effectFull: 'effect_tujie_mannengliangorange',
        fullName: 'img_gold_cultivate_01c'
    }
};
var HERO_NAME_RES = {
    [250]: 'txt_goldhero_cultivate_shu01',
    [450]: 'txt_goldhero_cultivate_qun01',
    [350]: 'txt_goldhero_cultivate_wu01',
    [150]: 'txt_goldhero_cultivate_wei01'
};
const {ccclass, property} = cc._decorator;
@ccclass
export default class HeroGoldCostNode extends cc.Component {

    /************ */
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeNormal: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFull: cc.Node = null;

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


    protected _costKey: number;
    private _callback: any;
    protected _isShowCount: boolean;
    protected _isFull: boolean;
    protected _lock: boolean;
    protected _initPos: cc.Vec2;
    public POSY_START = -46;
    public POSY_END = 30;

    /*** */
    private _isFirst:boolean;
    private _panelCallback:any;
    private _effectIng:any;

    setInitData(costKey, callback) {
        this._costKey = costKey;
        this._callback = callback;
        this._isShowCount = false;
        this._isFull = false;
        this._init();
        this._check();
    }

    setExtraInitData(costKey,callback){
        this._costKey = costKey;
        this._callback = callback;
        this._isShowCount = false;
        this._isFull = false;
        this._init();
        this._check();
    }

    _init() {
        UIActionHelper.playBlinkEffect2(this._buttonAdd.node);
        this.initImageFront();
        this.initRipple();
        this.changeImageName();
        this.initEffectBg();
        if(this._redPoint)
        this._redPoint.node.setPosition(65, -10)
        this._initPos = cc.v2(this.node.x, this.node.y);
        this._isFirst = true;
    }

    _panelTouchClicked() {
        if (this._panelCallback) {
            this._panelCallback();
        }
    }

    _initEffectBg(resId) {
        var effectBg = G_EffectGfxMgr.createPlayGfx(this._nodeEffectBg, resId)
        effectBg.play();
    }

    setPanelTouchCallback(callback) {
        this._panelCallback = callback;
    }
    changeImageName() {
        if(this._imageName)
        this._imageName.node.addComponent(CommonUI).loadTexture(Path.getTextLimit(RES_CONST[this._costKey].imageName));
    }
    _check() {
        if (this._costKey == LimitCostConst.LIMIT_COST_KEY_1) {
            this._isShowCount = true;
        } else {
            this._isShowCount = false;
        }
    }
    initRipple() {
        this._initRipple(LimitCostConst.RES_NAME[this._costKey].ripple);
    }

    _initImageFront(buttomResId, frontResId) {
        if(this._imageButtom)
        this._imageButtom.node.addComponent(CommonUI).loadTexture(Path.getLimitImg(buttomResId));
        if(this._imageFront)
        this._imageFront.node.addComponent(CommonUI).loadTexture(Path.getLimitImg(frontResId));
    }
    playRippleMoveEffect(limitLevel, curCount) {
        this._nodeRipple.stopAllActions();
        var [percent, totalCount] = this._calPercent(limitLevel, curCount);
        this._isFull = percent >= 100;
        var targetPos = this._getRipplePos(percent);
        var addL = 15*percent/100;
        var action = cc.moveTo(0.4, cc.v2(targetPos.x, targetPos.y+addL));
        if(this._nodeRipple)
        this._nodeRipple.runAction(action);
        if (this._isShowCount) {
            if(this._textPercent)
            this._textPercent.string = ('');
            if(this._nodeCount)
            this._nodeCount.removeAllChildren();
            var content = Lang.get('limit_cost_count', {
                curCount: curCount,
                totalCount: totalCount
            });
            var richText = RichTextExtend.createWithContent(content);
            richText.node.setAnchorPoint(cc.v2(0, 0.5));
            if(this._nodeCount)
            this._nodeCount.addChild(richText.node);
        } else {
            cc.warn('CommonLimitCostNode:playRippleMoveEffect ' + percent);
            if(this._textPercent)
            this._textPercent.string = (percent + '%');
        }
        this._playEffect(this._isFull);
    }
    _playEffect(isFull) {
        if (isFull) {
            cc.warn(' CommonLimitCostNode:_playEffect Full');
            G_AudioManager.playSoundWithId(AudioConst.SOUND_LIMIT_YINMAN);
            this._playFullEffect();
        } else {
            cc.warn(' CommonLimitCostNode:_playEffect not Full');
            this._playCommonEffect();
        }
    }
    _playCommonEffect() {
        var eventFunc = function (event) {
            if (event == 'finish') {
                this._updateState();
            }
        }.bind(this);
        var effectReceive = G_EffectGfxMgr.createPlayGfx(this._nodeEffect, this.getEffectReceiveName(), eventFunc)
        effectReceive.setAutoRelease(true);
        effectReceive.play();
    }

    initImageFront() {
        this._initImageFront(RES_CONST[this._costKey].imageButtom, RES_CONST[this._costKey].imageFront);
    }
    initEffectBg() {
        this._initEffectBg(RES_CONST[this._costKey].effectBg);
        if(this._nodeEffectBg)
        this._nodeEffectBg.active = (false);
    }
    _updateState() {
        this._lock = false;
    }
    showRedPoint(show) {
        this._redPoint.node.active = (show);
    }
    _initRipple(animation) {
        if(!this._nodeRipple||this._nodeRipple.active==false)return;
        var spineRipple = SpineNode.create();
        this._nodeRipple.addChild(spineRipple.node);
        spineRipple.setAsset(Path.getEffectSpine('jinjiangyangchengshui'));
        spineRipple.setAnimation('effect', true);
    }
    _playFullEffect() {
        cc.warn(' HeroGoldCostNode:_playFullEffect exp');
        if (this._effectIng) {
            return;
        }
        this._effectIng = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_jinjiangyangcheng_man', function (key) {
            if (key == 'wenzi') {
                return this._getTextIamge();
            }
        }.bind(this),function (event) {
            if (event == 'finish') {
                this._fullEffect();
            }
        }.bind(this));
    }
    _getTextIamge():cc.Node {
        var txt = RES_CONST[this._costKey].fullName;
        var image = new cc.Node().addComponent(cc.Sprite);
        image.node.addComponent(CommonUI).loadTexture(Path.getGoldHero(txt));
        image.node.setPosition(0, -3);
        return image.node;
    }
    _fullEffect() {
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_jinjiangyangcheng_biankuangxunhuan', function (key) {
            if (key == 'wenzi') {
                return this._getTextIamge();
            }
        }.bind(this));
    }
    clearEffect() {
        this._nodeEffect.removeAllChildren();
        this._effectIng = null;
    }
    getEffectReceiveName() {
        return RES_CONST[this._costKey].effectReceive;
    }
    playSMoving() {
        this._playSmoving(RES_CONST[this._costKey].smoving);
    }
    _playSmoving(smoving) {
        G_EffectGfxMgr.applySingleGfx(this.node, smoving, function () {
            this.node.active = (false);
        }.bind(this));
    }
    onClickAdd() {
        if (this._lock || this._isFull) {
            return;
        }
        if (this._callback) {
            this._callback(this._costKey);
        }
    }
    _getRipplePos(percent) {
        var height = (this.POSY_END - this.POSY_START) * percent / 100;
        var targetPosY = this.POSY_START + height;
        return {
            x: 0,
            y: targetPosY
        };
    }
    _updateCommonUI(limitLevel, curCount) {
        this.node.active = (true);
        var [percent, totalCount] = this._calPercent(limitLevel, curCount);
        this._isFull = percent >= 100;
        var ripplePos = this._getRipplePos(percent);
        var addL = 15*percent/100;
        if(this._nodeRipple)
        this._nodeRipple.setPosition(ripplePos.x, ripplePos.y+addL);
        if (this._isShowCount) {
            if(this._textPercent)
            this._textPercent.string = ('');
            if(this._nodeCount)
            this._nodeCount.removeAllChildren();
            var content = Lang.get('hero_limit_cost_count', {
                curCount: curCount,
                totalCount: totalCount
            });
            var richText = RichTextExtend.createWithContent(content);
            richText.node.setAnchorPoint(cc.v2(0, 0.5));
            if(this._nodeCount)
            this._nodeCount.addChild(richText.node);
        } else {
            cc.warn('CommonLimitCostNode:_updateCommonUI ' + percent);
            if(this._textPercent)
            this._textPercent.string = (percent + '%');
        }
        this._updateState();
        this.node.setPosition(this._initPos);
    }

    updateUI(limitLevel, curCount) {
        this._updateCommonUI(limitLevel, curCount);
        if (this._isFirst && this._isFull) {
            this._fullEffect();
        }
    }
    checkRedPoint(rank_lv, curCount) {
        var percent = this._calPercent(rank_lv, curCount)[0];
        if (percent >= 100) {
            this._redPoint.node.active = (false);
        }
    }
    _calPercent(rank_lv, curCount):Array<any> {
        var heroId = G_UserData.getHero().getCurHeroId();
        var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var costInfo = HeroGoldHelper.heroGoldTrainCostInfo(unitData)[0];
        var size = 0;
        if (this._costKey == LimitCostConst.LIMIT_COST_KEY_1) {
            size = costInfo['cost_hero'];
        } else {
            size = costInfo['size_' + this._costKey];
        }
        var percent = Math.floor(curCount / size * 100);
        if (percent >= 100) {
            this._buttonAdd.node.active = (false);
        } else {
            this._buttonAdd.node.active = (true);
        }
        cc.warn('HeroGoldCostNode:_calPercent ' + percent);
        return [
            Math.min(percent, 100),
            size
        ];
    }

    /**************************** */
    getMoving() {
        return LimitCostConst.RES_NAME[this._costKey].moving;
    }
    getFullEffectName() {
        return LimitCostConst.RES_NAME[this._costKey].effectFull;
    }
    isFull() {
        return this._isFull;
    }
    lock() {
        this._lock = true;
    }
    setVisible(visible) {
        this.node.active = (visible);
    }
}