
import { AudioConst } from "../../../const/AudioConst";
import { HeroConst } from "../../../const/HeroConst";
import { LimitCostConst } from "../../../const/LimitCostConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_AudioManager, G_EffectGfxMgr } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonUI from "../../../ui/component/CommonUI";
import { SpineNode } from "../../../ui/node/SpineNode";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { Path } from "../../../utils/Path";
import UIActionHelper from "../../../utils/UIActionHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroLimitCostNode extends cc.Component {
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


    protected _costKey: number;
    protected _callback: any;
    protected _isShowCount: boolean;
    protected _isFull: boolean;
    protected _lock: boolean;
    protected _initPos: cc.Vec2;
    public POSY_START = -46;
    public POSY_END = 30;
    protected _index: any;
    _addMask: any;

    onLoad(){
        this._nodeCount.active = false;
        this._imageButtom.node.zIndex = -2;
        // var clip = UIHelper.setCircleClip(this._nodeRipple, 37);
        // clip.setLocalZOrder(-1);
        this._imageFront.node.setContentSize(74, 74);
        this._imageFront.node.y = 0;
  


        this._isShowCount = false;
        this._isFull = false;
        this._init();
        this._check();
    }

    setInitData(costKey, callback, index?){
        this._costKey = costKey;
        this._callback = callback;
        this._index = index || 1;
    }
    _check() {
        if (this._costKey >= HeroConst.HERO_LIMIT_COST_KEY_3 && this._costKey != HeroConst.HERO_LIMIT_COST_KEY_6) {
            this._isShowCount = true;
        } else {
            this._isShowCount = false;
        }
    }
    updateUI(limitLevel, curCount, limitRed?) {
        this.addMask();
        if ((limitRed == 0 && limitLevel >= 3) || (limitRed != 0 && limitLevel >= 4)) {
            this._isFull = false;
            this.node.active = false;
            return;
        }
        this._updateCommonUI(limitLevel, curCount, limitRed);
    }

    protected addMask() {
        if(!this._addMask) {
            this._addMask = true;
            var rippleCt = new cc.Node();
            rippleCt.setContentSize(74,74);
            rippleCt.setAnchorPoint(0.5,0.5);
            this._nodeNormal.addChild(rippleCt);
            var mask = rippleCt.addComponent(cc.Mask);
            mask.type = cc.Mask.Type.ELLIPSE;
            mask.segements = 65;
            this._nodeRipple.parent = rippleCt;
            rippleCt.zIndex = -1; 
        }
    }

    private onClickAdd() {
        if (this._lock || this._isFull) {
            return;
        }
        if (this._callback) {
            this._callback(this._costKey);
        }
    }

    _calPercent(limitLevel, curCount, limitRed?) {
        var info = HeroDataHelper.getHeroLimitCostConfig(limitLevel, limitRed);
        var configKey = HeroDataHelper.getLimitCostConfigKey(this._costKey);
        var size = info[configKey.size] || 0;
        var percent = Math.floor(curCount / size * 100);
        return [
            Math.min(percent, 100),
            size
        ];
    }


    _init() {
        //todo
        // this._buttonAdd.addClickEventListenerEx(handler(this, this._onClickAdd));
        UIActionHelper.playBlinkEffect2(this._buttonAdd.node);
        this.initImageFront();
        this.initRipple();
        this.changeImageName();
        this.initEffectBg();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeFull, this.getMoving(), null, null, false);
        var pos = this.node.getPosition();
        this._initPos = new cc.Vec2(pos.x, pos.y);
    }
    getMoving() {
        return LimitCostConst.RES_NAME[this._costKey].moving[this._index - 1];
    }
    initImageFront() {
        this._initImageFront(LimitCostConst.RES_NAME[this._costKey].imageButtom[this._index - 1], LimitCostConst.RES_NAME[this._costKey].imageFront[this._index - 1]);
    }
    initRipple() {
        this._initRipple(LimitCostConst.RES_NAME[this._costKey].ripple[this._index - 1]);
    }
    initEffectBg() {
        this._initEffectBg(LimitCostConst.RES_NAME[this._costKey].effectBg[this._index - 1]);
    }
    _initImageFront(buttomResId, frontResId) {
        this._imageButtom.node.addComponent(CommonUI).loadTexture(Path.getLimitImg(buttomResId));
        this._imageFront.node.addComponent(CommonUI).loadTexture(Path.getLimitImg(frontResId));
    }
    _initRipple(animation) {

        var spineRipple = SpineNode.create();
        this._nodeRipple.addChild(spineRipple.node);
        spineRipple.setAsset(Path.getEffectSpine('tujieshui'));
        spineRipple.setAnimation(animation, true);
    }
    _initEffectBg(resId) {
        G_EffectGfxMgr.createPlayGfx(this._nodeEffectBg, resId);
    }
    changeImageName() {
        this._imageName.node.addComponent(CommonUI).loadTexture(Path.getTextLimit(LimitCostConst.RES_NAME[this._costKey].imageName[this._index - 1]));
    }

    enableTextOutline (enable) {
        if (enable) {
            var txtColorOutline = cc.color(0, 0, 0, 255);
            UIHelper.enableOutline(this._textPercent, txtColorOutline, 2);
        } else {
            UIHelper.disableOutline(this._textPercent);
        }
    }
    _updateCommonUI(limitLevel, curCount, limitRed?) {
        this.node.active = true;
        var ret = this._calPercent(limitLevel, curCount, limitRed);
        var percent = ret[0];
        var totalCount: number = ret[1];
        this._isFull = percent >= 100;
        var ripplePos = this._getRipplePos(percent);
        this._nodeRipple.setPosition(ripplePos.x, ripplePos.y);
        if (this._isShowCount) {
            this._textPercent.string = curCount + ('/' + totalCount);
            // this._nodeCount.removeAllChildren();
            // var content = Lang.get('hero_limit_cost_count', {
            //     curCount: curCount,
            //     totalCount: totalCount
            // });
            // let richText = RichTextExtend.createWithContent(content);
            // richText.node.setAnchorPoint(new cc.Vec2(0, 0.5));
            // this._nodeCount.addChild(richText.node);
        } else {
            cc.warn('CommonLimitCostNode:_updateCommonUI ' + percent);
            this._textPercent.string = percent + '%';
        }
        this._updateState();
        this.node.setPosition(this._initPos);
    }
    
    _getRipplePos(percent):any {
        var height = (this.POSY_END - this.POSY_START) * percent / 100;
        var targetPosY = this.POSY_START + height;
        return {
            x: 0,
            y: targetPosY
        };
    }
    playRippleMoveEffect(limitLevel, curCount, limitRed) {
        limitRed = limitRed || 0;
        this._nodeRipple.stopAllActions();
        var ret = this._calPercent(limitLevel, curCount, limitRed);
        var percent = ret[0];
        var totalCount = ret[1];
        this._isFull = percent >= 100;
        var targetPos = this._getRipplePos(percent);
        var action = cc.moveTo(0.4, new cc.Vec2(targetPos.x, targetPos.y));
        this._nodeRipple.runAction(action);
        if (this._isShowCount) {
            this._textPercent.string = curCount + '/' + totalCount;;
            // this._nodeCount.removeAllChildren();
            // var content = Lang.get('limit_cost_count', {
            //     curCount: curCount,
            //     totalCount: totalCount
            // });
            // let richText = RichTextExtend.createWithContent(content);
            // richText.node.setAnchorPoint(new cc.Vec2(0, 0.5));
            // this._nodeCount.addChild(richText.node);
        } else {
            cc.warn('CommonLimitCostNode:playRippleMoveEffect ' + percent);
            this._textPercent.string = percent + '%';
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
        
        var effectReceive = G_EffectGfxMgr.createPlayGfx(this._nodeEffect,this.getEffectReceiveName(), eventFunc, true);
    }
    getEffectReceiveName() {
        return LimitCostConst.RES_NAME[this._costKey].effectReceive[this._index - 1];
    }
    _playFullEffect() {
        var eventFunc = function (event) {
            if (event == 'fuck') {
                this._updateState();
            }
        }.bind(this)
        var effectFull = G_EffectGfxMgr.createPlayGfx(this._nodeEffect,this.getFullEffectName(), eventFunc, true);
    }
    getFullEffectName() {
        return LimitCostConst.RES_NAME[this._costKey].effectFull[this._index - 1];
    }
    playSMoving() {
        this._playSmoving(LimitCostConst.RES_NAME[this._costKey].smoving[this._index - 1]);
    }
    _playSmoving(smoving) {
        let pos = this.node.getPosition();
        G_EffectGfxMgr.applySingleGfx(this.node, smoving, function () {
            this.node.active = (false);
            this.node.setPosition(pos);
        }.bind(this));
    }
    _updateState() {
        this._nodeFull.active = this._isFull;
        this._nodeNormal.active = !this._isFull;
        this._lock = false;
    }
    isFull() {
        return this._isFull;
    }
    showRedPoint(show) {
        this._redPoint.node.active = show;
    }
    lock() {
        this._lock = true;
    }
    setVisible(visible) {
        this.node.active = visible;
    }

}