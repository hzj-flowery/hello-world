import { Colors, G_EffectGfxMgr, G_SceneManager } from "../init";
import { Path } from "./Path";
import UIHelper from "./UIHelper";

var ACTION_ID = {};
ACTION_ID['playTipEffect'] = 1001;
export default class UIActionHelper {
    public static playFloatEffect(node:cc.Node) {
        if (!node) {
            return;
        }
        if (node.getActionByTag(678)) {
            return;
        }
        var action1 = cc.moveBy(0.75, new cc.Vec2(0, 8));
        var fade1 = cc.fadeTo(0.75, 255);
        var spawn1 = cc.spawn(action1, fade1);
        var action2 = cc.moveBy(0.75, new cc.Vec2(0, -8));
        var fade2 = cc.fadeTo(0.75, 255 * 0.5);
        var spawn2 = cc.spawn(action2, fade2);
        var seq = cc.sequence(spawn1, spawn2);
        var rep = cc.repeatForever(seq);
        rep.setTag(678);
        node.runAction(rep);
    };
    public static playFloatXEffect(node:cc.Node) {
        if (!node) {
            return;
        }
        if (node.getActionByTag(678)) {
            return;
        }
        var action1 = cc.moveBy(0.75, new cc.Vec2(8, 0));
        var fade1 = cc.fadeTo(0.75, 255);
        var spawn1 = cc.spawn(action1, fade1);
        var action2 = cc.moveBy(0.75, new cc.Vec2(-8, 0));
        var fade2 = cc.fadeTo(0.75, 255 * 0.5);
        var spawn2 = cc.spawn(action2, fade2);
        var seq = cc.sequence(spawn1, spawn2);
        var rep = cc.repeatForever(seq);
        rep.setTag(678);
        node.runAction(rep);
    };
    public static playBlinkEffect(node:cc.Node, fade:boolean = true) {
        if (!node) {
            return;
        }
        if (node.getActionByTag(123)) {
            return;
        }
        var action1 = cc.fadeTo(2, 50);
        var action2 = cc.fadeTo(2, 255);
        var seq1 = cc.sequence(action1, action2);
        var action3 = cc.scaleTo(2, 0.9);
        var action4 = cc.scaleTo(2, 1);
        var seq2 = cc.sequence(action3, action4);
        if (fade) {
            var spawn = cc.spawn(seq1, seq2);
            var rep = cc.repeatForever(spawn);
        }else {
             rep = cc.repeatForever(seq2);
        }
        rep.setTag(123);
        node.runAction(rep);
    };
    public static playBlinkEffect2(node:cc.Node) {
        if (!node) {
            return;
        }
        if (node.getActionByTag(567)) {
            return;
        }
        var action1 = cc.fadeOut(1);
        var action2 = cc.fadeIn(1);
        var seq = cc.sequence(action1, action2);
        var rep = cc.repeatForever(seq);
        rep.setTag(567);
        node.runAction(rep);
    };
    public static addCommonIconRoundEffect(parent:cc.Node, scale) {
      //assert((parent != null, '---------addCommonIconRoundEffect parent error------------');
        return null;
    };
    public static playSkewFloatEffect(node:cc.Node) {
        if (!node) {
            return;
        }
        if (node.getActionByTag(789)) {
            return;
        }
        var action1 = cc.moveBy(0.75, new cc.Vec2(-10, -10));
        var action2 = cc.moveBy(0.75, new cc.Vec2(10, 10));
        var seq = cc.sequence(action1, action2);
        var rep = cc.repeatForever(seq);
        rep.setTag(789);
        node.runAction(rep);
    };
    public static playSkewFloatEffect2(node:cc.Node) {
        if (!node) {
            return;
        }
        if (node.getActionByTag(789)) {
            return;
        }
        var action1 = cc.moveBy(0.75, new cc.Vec2(10, -10));
        var action2 = cc.moveBy(0.75, new cc.Vec2(-10, 10));
        var seq = cc.sequence(action1, action2);
        var rep = cc.repeatForever(seq);
        rep.setTag(789);
        node.runAction(rep);
    };
    public static playScaleUpEffect(node:cc.Node) {
        var action1 = cc.scaleTo(0.2, 1.2);
        var action2 = cc.scaleTo(0.2, 1);
        var seq = cc.sequence(action1, cc.delayTime(0.1), action2);
        node.runAction(seq);
    };
    public static popupAction(position: cc.Vec2) {
        var width = cc.winSize.width;
        var height = cc.winSize.height;
        var dstPosition = new cc.Vec2(width * 0.5, height * 0.5);
        position = position || dstPosition;
        var offset = new cc.Vec2(dstPosition.x - position.x, dstPosition.y - position.y);
        console.log(offset);
        var duration = 0.3;
        return cc.spawn(cc.easeBackOut(),cc.scaleTo(duration, 1), cc.moveBy(duration, offset), cc.fadeIn(0.1));
    };
    public static addNumberChangeEffect(startPos, num: number, endPos, parent) {
        if (num == 0) {
            return;
        }
        var str = (num).toString();
        var color = num > 0 && Colors.BRIGHT_BG_ONE || Colors.BRIGHT_BG_TWO;
        if (num > 0) {
            str = '+' + str;
        }
        var label = UIHelper.createLabel().getComponent(cc.Label);
        label.string = str;
        label.fontFamily =  Path.getCommonFont();
        label.fontSize = 22;
        label.node.color = color;
        label.node.setAnchorPoint(1, 0.5);
        //label.enableOutline(Colors.CLASS_GREEN_OUTLINE, 2);
        if (parent != null) {
            parent.addChild(label);
        } else {
            G_SceneManager.getRunningScene().addChildToPopup(label.node);
        }
        label.node.setPosition(startPos.x, startPos.y);
        label.node.setScale(0);
        var fadeIn = cc.fadeIn(0.2);
        var scaleIn = cc.scaleTo(0.2, 1);
        var fadeIn1 = cc.spawn(fadeIn, scaleIn);
        var fadeOut = cc.fadeOut(0.2);
        var moveOutPos = endPos || new cc.Vec2(startPos.x, startPos.y + 15);
        var moveOut = cc.moveTo(0.2, moveOutPos);
        var fadeOut1 = cc.spawn(fadeOut, moveOut);
        var seq = cc.sequence(fadeIn1, cc.delayTime(0.2), fadeOut1, cc.callFunc(function (actionNode) {
            actionNode.destroy(true);
        }));
        label.node.runAction(seq);
    };
    public static createUpdateAction(callback, interval) {
        if (!interval) {
            interval = 0.5;
        }
        var delay = cc.delayTime(interval);
        var sequence = cc.sequence(delay, cc.callFunc(function () {
            if (callback) {
                callback();
            }
        }));
        var action = cc.repeatForever(sequence);
        return action;
    };
    public static createDelayAction(dt, callback) {
        var delayAction = cc.delayTime(dt);
        var callFuncAction = cc.callFunc(callback);
        var seqAction = cc.sequence(delayAction, callFuncAction);
        return seqAction;
    };
    public static playEnterShopSceneEffect(params) {
        if (!params) {
            return;
        }
        if (params.startCallback) {
            params.startCallback();
        }
        params.tabGroup.node.active = (false);
        for (var i in params.rightNodes) {
            var v = params.rightNodes[i];
            v.active = false;
        }
        function eventFunc(event) {
            if (event == 'top') {
                params.topBar.playEnterEffect();
            } else if (event == 'icon') {
                if (params.listViewPlayCallback) {
                    params.listViewPlayCallback();
                }
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(params.attachNode, 'moving_shangdian_ui', null, eventFunc);
    };
}