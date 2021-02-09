import { BullectScreenConst } from "../../../const/BullectScreenConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_EffectGfxMgr, G_ResolutionManager } from "../../../init";
import { BulletScreenHelper } from "./BulletScreenHelper";

export default class BulletScreenLayer extends cc.Component {
    _positions: any[];
    _posIndex: number;
    _middlePositions: any[];
    _posMidIndex: number;
    _cacheTopBulletTime: [];
    constructor() {
        super();
        this.loadPosition();
    }
    onCreate() {
    }
    onEnter() {
    }
    onExit() {
    }
    getPositionList() {
        var retList = [];
        for (var index = 1; index <= 6; index++) {
            var positionDesc = BulletScreenHelper.getParameter('boss_coordinate_' + index);
            let res = positionDesc.split('|');
            var posX = res[0];
            var posY = res[1];
            var position = cc.v2(parseInt(posX), parseInt(posY));
            retList.push(position);
        }
        return retList;
    }
    getMidPosList() {
        var positionDesc = BulletScreenHelper.getParameter('boss_coordinate_baofa');
        var posList = positionDesc.split('|');
        var retList = [];
        for (var i in posList) {
            var value = posList[i];
            let res = value.split(',');
            var posX = res[0];
            var posY = res[1];
            var position = cc.v2(parseInt(posX), parseInt(posY));
            retList.push(position);
        }
        return retList;
    }
    loadPosition() {
        this._positions = [];
        var retList = this.getPositionList();
        for (var i in retList) {
            var value = retList[i];
            var position = value;
            var bulletPos = new BulletMotionPosition();
            bulletPos.setPos(position);
            bulletPos.release();
            this._positions[i] = bulletPos;
        }
        this._posIndex = 0;
        this._middlePositions = this.getMidPosList();
        this._posMidIndex = 0;
        this._cacheTopBulletTime = [];
    }
    getUnusedMidPos() {
        this._posMidIndex = this._posMidIndex + 1;
        if (this._posMidIndex > this._middlePositions.length) {
            this._posMidIndex = 1;
        }
        return this._middlePositions[this._posMidIndex - 1];
    }
    getUnusedPos() {
        for (var i in this._positions) {
            var value = this._positions[i];
            if (value.isUsed() == false) {
                return value;
            }
        }
        return null;
    }
    clear() {
        this.node.removeAllChildren();
        this.clearPosition();
    }
    clearPosition() {
        this._positions = [];
        this.loadPosition();
    }
    pushMiddleRichText(richText, dealyTime, snType) {
        var richWidget = this.createRichText(richText);
        this.node.addChild(richWidget);
        richWidget.active = (false);
        var bulletNodeRect = richWidget.getContentSize();
        var pos = this.getUnusedMidPos();
        if (snType == BullectScreenConst.GACHA_GOLDENHERO_TYPE) {
            richWidget.setPosition(cc.v2(G_ResolutionManager.getDesignWidth() / 2, G_ResolutionManager.getDesignHeight() / 2));
        } else {
            richWidget.setPosition(cc.v2(pos.x, pos.y));
        }
        function eventFunction(event, frameIndex, effectNode) {
            if (event == 'finish') {
                effectNode._node.runAction(cc.destroySelf());
            }
        }
        richWidget.setAnchorPoint(cc.v2(0.5, 0.5));
        dealyTime = dealyTime || BulletScreenHelper.getBulletShowTime();
        richWidget.runAction(cc.sequence(cc.delayTime(dealyTime), cc.show(), cc.callFunc(function () {
            var effect = G_EffectGfxMgr.applySingleGfx(richWidget, 'smoving_danmu', eventFunction, null, null);
        })));
    }
    createRichText(richContents) {
        let node = new cc.Node();
        let rich = node.addComponent(cc.RichText);
        RichTextExtend.setRichText(rich, richContents);
        node.setAnchorPoint(cc.v2(0, 0));
        // node.setCascadeOpacityEnabled(true);
        // node.ignoreContentAdaptWithSize(true);
        // label.formatText();
        return node;
    }
    pushTopRichText(richText, delayTime, noticeColor, way) {
        var position = this.getUnusedPos();
        if (position == null) {
            return false;
        }
        var motionType = BullectScreenConst.TYPE_UNIFORM;
        var richWidget = RichTextExtend.createWithContent(richText);//this.createRichText(richText);
        richWidget.node.setPosition(position.getPos());
        richWidget.node.setAnchorPoint(cc.v2(0, 0));
        position.retain();
        this.node.addChild(richWidget.node);
        //richWidget.node.active = (false);
        var bulletNodeRect = richWidget.node.getContentSize();
        var time = BulletScreenHelper.getParameterTime();
        var width = G_ResolutionManager.getDesignWidth();
        var speed = width / time;
        var calcDelayTime = (bulletNodeRect.width + BulletScreenHelper.getBulletShowDistance()) / speed;
        delayTime = delayTime || 0;
        // var showAction = cc.show();
        // if (way && way > 0) {
        //     if ((way == BullectScreenConst.SHOWTYPE_POPUP_CENTER)) {
        //         showAction = null;
        //     }
        // } else {
        //     if (noticeColor >= BullectScreenConst.COLOR_TYPE_4) {
        //         showAction = null;
        //     }
        // }
        var showAction = cc.callFunc(function () {
            //richWidget.node.active = true;
        });
        var actType = (motionType == 0 && Math.floor(Math.random() * 4)) || motionType;
        var seq1 = cc.sequence(cc.delayTime(delayTime), showAction, BulletScreenHelper.action(actType, -bulletNodeRect.width, time), cc.destroySelf());
        var seq2 = cc.sequence(cc.delayTime(calcDelayTime), cc.callFunc(function () {
            position.release();
        }));
        richWidget.node.runAction(cc.spawn(seq1, seq2));
        return true;
    }
}


class BulletMotionPosition {
    _isUsed: boolean;
    _pos: any;
    retain() {
        this._isUsed = true;
    }
    release() {
        this._isUsed = false;
    }
    getPos() {
        return this._pos;
    }
    setPos(pos) {
        this._pos = pos;
    }
    isUsed() {
        return this._isUsed;
    }
}