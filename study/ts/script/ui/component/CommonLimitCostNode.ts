import { AudioConst } from "../../const/AudioConst";
import { LimitCostConst } from "../../const/LimitCostConst";
import { RichTextExtend } from "../../extends/RichTextExtend";
import { G_AudioManager, G_EffectGfxMgr } from "../../init";
import { Lang } from "../../lang/Lang";
import { Path } from "../../utils/Path";
import UIActionHelper from "../../utils/UIActionHelper";
import { SpineNode } from "../node/SpineNode";
import CommonUI from "./CommonUI";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonLimitCostNode extends cc.Component {

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
    setInitData(costKey, callback) {
        this._costKey = costKey;
        this._callback = callback;
        this._isShowCount = false;
        this._isFull = false;
        this._init();
        this._check();
    }
    setExtraInitData(costKey, callback){
        this._costKey = costKey;
        this._callback = callback;
    }
    onLoad(){
        
    }
    protected _init() {
        // this._buttonAdd.clickEvents = [];
        // var newEventHandler = new cc.Component.EventHandler();
        // newEventHandler.component = "CommonLimitCostNode";
        // newEventHandler.target = this.node;
        // newEventHandler.handler = handler(this, this.onClickAdd);
        // this._buttonAdd.clickEvents.push(newEventHandler);
        UIActionHelper.playBlinkEffect2(this._buttonAdd.node);
        this.initImageFront();
        this.initRipple();
        this.changeImageName();
        this.initEffectBg();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeFull, this.getMoving(), null, null, false);
        this._initPos = cc.v2(this.node.x, this.node.y);
    }
    getMoving() {
        return LimitCostConst.RES_NAME[this._costKey].moving;
    }
    initImageFront() {
        this._initImageFront(LimitCostConst.RES_NAME[this._costKey].imageButtom, LimitCostConst.RES_NAME[this._costKey].imageFront);
    }
    initRipple() {
        this._initRipple(LimitCostConst.RES_NAME[this._costKey].ripple);
    }
    initEffectBg() {
        this._initEffectBg(LimitCostConst.RES_NAME[this._costKey].effectBg);
    }
    _initImageFront(buttomResId, frontResId) {
        if(this._imageButtom)
        this._imageButtom.node.addComponent(CommonUI).loadTexture(Path.getLimitImg(buttomResId));
        if(this._imageFront)
        this._imageFront.node.addComponent(CommonUI).loadTexture(Path.getLimitImg(frontResId));
    }
    _initRipple(animation) {
        var spineRipple = SpineNode.create();
        this._nodeRipple.addChild(spineRipple.node);
        spineRipple.setAsset(Path.getEffectSpine('tujieshui'));
        spineRipple.setAnimation(animation, true);
    }
    _initEffectBg(resId) {
        var effectBg = G_EffectGfxMgr.createPlayGfx(this._nodeEffectBg, resId)
        effectBg.play();
    }
    changeImageName() {
        this._imageName.node.addComponent(CommonUI).loadTexture(Path.getTextLimit(LimitCostConst.RES_NAME[this._costKey].imageName));
    }
    _check() {
        this._isShowCount = true;
    }
    updateUI(limitLevel, curCount) {
        this._updateCommonUI(limitLevel, curCount);
    }
    _updateCommonUI(limitLevel, curCount) {
        this.node.active = (true);
        var [percent, totalCount] = this._calPercent(limitLevel, curCount);
        this._isFull = percent >= 100;
        var ripplePos = this._getRipplePos(percent);
        this._nodeRipple.setPosition(ripplePos.x, ripplePos.y);
        if (this._isShowCount) {
            this._textPercent.string = ('');
            this._nodeCount.removeAllChildren();
            var content = Lang.get('hero_limit_cost_count', {
                curCount: curCount,
                totalCount: totalCount
            });
            var richText = RichTextExtend.createWithContent(content);
            richText.node.setAnchorPoint(cc.v2(0, 0.5));
            this._nodeCount.addChild(richText.node);
        } else {
            cc.warn('CommonLimitCostNode:_updateCommonUI ' + percent);
            this._textPercent.string = (percent + '%');
        }
        this._updateState();
        this.node.setPosition(this._initPos);
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
    _calPercent(limitLevel, curCount) {
        return [
            0,
            1
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
            var content = Lang.get('limit_cost_count', {
                curCount: curCount,
                totalCount: totalCount
            });
            var richText = RichTextExtend.createWithContent(content);
            richText.node.setAnchorPoint(cc.v2(0, 0.5));
            this._nodeCount.addChild(richText.node);
        } else {
            cc.warn('CommonLimitCostNode:playRippleMoveEffect ' + percent);
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
    getEffectReceiveName() {
        return LimitCostConst.RES_NAME[this._costKey].effectReceive;
    }
    _playFullEffect() {
        var eventFunc = function (event) {
            if (event == 'fuck') {
                this._updateState();
            }
        }
        var effectName = this.getFullEffectName();
        var effectFull = G_EffectGfxMgr.createPlayGfx(this._nodeEffect, effectName, eventFunc)
        effectFull.setAutoRelease(true);
        effectFull.play();
    }
    getFullEffectName() {
        return LimitCostConst.RES_NAME[this._costKey].effectFull;
    }
    playSMoving() {
        this._playSmoving(LimitCostConst.RES_NAME[this._costKey].smoving);
    }
    _playSmoving(smoving) {
        G_EffectGfxMgr.applySingleGfx(this.node, smoving, function () {
            this._target.setVisible(false);
        }.bind(this));
    }
    _updateState() {
        this._nodeFull.active = (this._isFull);
        this._nodeNormal.active = (!this._isFull);
        this._lock = false;
    }
    isFull() {
        return this._isFull;
    }
    showRedPoint(show) {
        this._redPoint.node.active = (show);
    }
    lock() {
        this._lock = true;
    }
    setVisible(visible) {
        this.node.active = (visible);
    }

}