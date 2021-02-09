const {ccclass, property} = cc._decorator;

import CommonButtonSwitchLevel0 from '../../../ui/component/CommonButtonSwitchLevel0'
import PopupBase from '../../../ui/PopupBase';
import { Colors, G_SignalManager, G_UserData, G_GameAgent, G_Prompt, G_ServerTime } from '../../../init';
import { MineCraftHelper } from './MineCraftHelper';
import ParameterIDConst, { G_ParameterIDConst } from '../../../const/ParameterIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Lang } from '../../../lang/Lang';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { MessageErrorConst } from '../../../const/MessageErrorConst';

@ccclass
export default class PopupMineCraftPrivilege extends PopupBase {

   @property({
       type: cc.Button,
       visible: true
   })
   _btnClose: cc.Button = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeToken: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeHurt: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeDefense: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeSilder: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeInfame: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeActivedLast3: cc.Node = null;

   @property({
       type: CommonButtonSwitchLevel0,
       visible: true
   })
   _fileNodeBtn: CommonButtonSwitchLevel0 = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageSigned: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageVip5: cc.Sprite = null;

   @property({
    type: cc.Label,
    visible: true
})
_fileNodeText: cc.Label = null;


   
   
   private _signalRechargeGetInfo:any;
   private _signalWelfareMonthCardGetReward:any;
   private _signalWelfareMonthCardAvalable:any;
   private _isChangeState:boolean;
   onCreate() {
    this._isChangeState = false;
    this._initDesc();
    this._updateBtnDesc();
    
}
onEnter() {
    var eventHandler = new cc.Component.EventHandler();
    eventHandler.target = this.node;
    eventHandler.component = "PopupMineCraftPrivilege";
    eventHandler.handler = "_onBtnClose";
    this._btnClose.clickEvents = [];
    this._btnClose.clickEvents.push(eventHandler);
    this._fileNodeBtn.addClickEventListenerEx(handler(this,this._onBtnGet));
    this._signalRechargeGetInfo = G_SignalManager.add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(this, this._onEventRechargeGetInfo));
    this._signalWelfareMonthCardGetReward = G_SignalManager.add(SignalConst.EVENT_WELFARE_MONTH_CARD_GET_REWARD, handler(this, this._onEventWelfareMonthCardGetReward));
    this._signalWelfareMonthCardAvalable = G_SignalManager.add(SignalConst.EVENT_WELFARE_MONTH_CARD_NOT_AVAILABLE, handler(this, this._onEventWelfareMonthCardAvalable));
}
onExit() {
    this._signalRechargeGetInfo.remove();
    this._signalRechargeGetInfo = null;
    this._signalWelfareMonthCardGetReward.remove();
    this._signalWelfareMonthCardGetReward = null;
    this._signalWelfareMonthCardAvalable.remove();
    this._signalWelfareMonthCardAvalable = null;
}
_updateBtnDesc() {
    var payCfg = MineCraftHelper.getPrivilegeVipCfg();
        var vipLimit = payCfg.vip_show;
        var vipLevel = G_UserData.getVip().getLevel() || 0;
        var bVisible = vipLimit > vipLevel;
        this._imageVip5.node.active = (bVisible);
        this._fileNodeBtn.setVisible(!bVisible);
        this._fileNodeBtn.setString('');
        this._imageSigned.node.active = (false);
        if (bVisible) {
            this._updateLast(1);
            this._updateToken(7);
            return;
        }
        var cardData = G_UserData.getActivityMonthCard().getMonthCardDataById(payCfg.id);
        if (cardData) {
            var bReceive = cardData.isCanReceive();
            var remainDay = cardData.getRemainDay();
            var lastDay = payCfg.renew_day;
            if (remainDay > 0 && remainDay <= lastDay) {
                if (remainDay == 1) {
                    var todayZero = G_ServerTime.secondsFromZero() + 86400;
                    if (G_ServerTime.getLeftSeconds(G_UserData.getMineCraftData().getPrivilegeTime()) <= G_ServerTime.getLeftSeconds(todayZero)) {
                        this._isChangeState = true;
                        this._updateLast(3, false, remainDay);
                        this._updateToken(7);
                    } else {
                        this._updateLast(3, bReceive, remainDay);
                        this._updateToken(remainDay);
                    }
                } else {
                    this._updateLast(3, bReceive, remainDay);
                    this._updateToken(remainDay);
                }
            } else if (remainDay > lastDay) {
                this._updateLast(2, bReceive, remainDay);
                this._updateToken(remainDay);
            } else {
                this._updateLast(1);
                this._updateToken(7);
            }
        } else {
            if (G_UserData.getMineCraftData().isSelfPrivilege()) {
                this._updateLast(3, false, 1);
                this._updateToken(7);
            } else {
                this._updateLast(1);
                this._updateToken(7);
            }
        }
}
_initDesc() {
    var atkSelfHurt = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_ATKSELF_LOSS);
    var atkOtherHurt = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_ATKENEMY_LOSS);
    var defselfHurt = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_DEFENSESELF_LOSS);
    var defOtherHurt = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_DEFENSEENEMY_LOSS);
    var soilderAdd = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_SOILDERADD);
    var infameReduce = MineCraftHelper.getInfameReduceRelative();
        var infameMax = MineCraftHelper.getInfameRelative();
        this._updateHurt(atkSelfHurt, atkOtherHurt);
        this._updateDefense(defselfHurt, defOtherHurt);
        this._updateSoilder(soilderAdd);
        this._updateInfame(infameReduce, infameMax);
}
_updateToken(days) {
    this._nodeToken.removeAllChildren();
    var richText = RichTextExtend.createRichTextByFormatString(Lang.get('mine_craft_privilege_token', {
        num1: 2,
        num2: days
    }), {
        defaultColor: Colors.BRIGHT_BG_TWO,
        defaultSize: 20,
        other: [
            { fontSize: 21 },
            { fontSize: 21 },
            { fontSize: 21 }
        ]
    });
    richText.node.setAnchorPoint(cc.v2(0, 0.5));
    this._nodeToken.addChild(richText.node);
}
_updateHurt(selfHurt, otherHurt) {
    this._nodeHurt.removeAllChildren();
    var richText = RichTextExtend.createRichTextByFormatString(Lang.get('mine_craft_privilege_hurt', {
        num1: selfHurt,
        num2: otherHurt
    }), {
        defaultColor: Colors.BRIGHT_BG_TWO,
        defaultSize: 20,
        other: [
            { fontSize: 21 },
            { fontSize: 21 }
        ]
    });
    richText.node.setAnchorPoint(cc.v2(0, 0.5));
    this._nodeHurt.addChild(richText.node);
}
_updateInfame(infameReduce, infameMax) {
    this._nodeInfame.removeAllChildren();
    var richText = RichTextExtend.createRichTextByFormatString(Lang.get('mine_craft_privilege_infame', {
        num: infameReduce,
        num2: infameMax
    }), {
        defaultColor: Colors.BRIGHT_BG_TWO,
        defaultSize: 20,
        other: [
            { fontSize: 21 },
            { fontSize: 21 }
        ]
    });
    richText.node.setAnchorPoint(cc.v2(0, 0.5));
    this._nodeInfame.addChild(richText.node);
}
_updateDefense(selfHurt, otherHurt) {
    this._nodeDefense.removeAllChildren();
    var richText = RichTextExtend.createRichTextByFormatString(Lang.get('mine_craft_privilege_defense', {
        num1: selfHurt,
        num2: otherHurt
    }), {
        defaultColor: Colors.BRIGHT_BG_TWO,
        defaultSize: 20,
        other: [
            { fontSize: 21 },
            { fontSize: 21 }
        ]
    });
    richText.node.setAnchorPoint(cc.v2(0, 0.5));
    this._nodeDefense.addChild(richText.node);
}
_updateSoilder(soilders) {
    this._nodeSilder.removeAllChildren();
    var richText = RichTextExtend.createRichTextByFormatString(Lang.get('mine_craft_privilege_soilder', { num: soilders }), {
        defaultColor: Colors.BRIGHT_BG_TWO,
        defaultSize: 20,
        other: [ { fontSize: 21 } ]
    });
    richText.node.setAnchorPoint(cc.v2(0, 0.5));
    this._nodeSilder.addChild(richText.node);
}
_updateLast(state, canReceive?, days?) {
    var getRewards = function ():cc.Node {
        var redImg = this._fileNodeBtn.node.getChildByName('privilege_card');
        if (!redImg) {
            redImg = UIHelper.createImage({ texture: Path.getCraftPrivilege('img_04') });
            redImg.name = ('privilege_card');
            redImg.setPosition(20, 0);
            this._fileNodeBtn.node.addChild(redImg);
        }
        return redImg;
    }.bind(this);
    this._nodeActivedLast3.removeAllChildren();
    var payCfg = MineCraftHelper.getPrivilegeVipCfg();
    var richText:cc.RichText;
    if (state == 1) {
        var payCfg = MineCraftHelper.getPrivilegeVipCfg();
        var content = Lang.get('mine_craft_privilege_activelast', {
            money: payCfg.gold,
            urlIcon: Path.getResourceMiniIcon('1'),
            count: 7
        });
        richText = RichTextExtend.createWithContent(content);
        var cfg = MineCraftHelper.getPrivilegeVipCfg();
        this._fileNodeBtn.switchToNormal();
        this._fileNodeText.string = ('');
        this._fileNodeBtn.setString(Lang.get('mine_craft_privilege_money', { money: ''+(cfg.rmb) }));
    } else if (state == 2) {
        richText = RichTextExtend.createRichTextByFormatString(Lang.get('mine_craft_privilege_lastday', { num: days }), {
            defaultColor: Colors.BRIGHT_BG_TWO,
            defaultSize: 20,
            other: [ { fontSize: 21 } ]
        });
        var img:cc.Node = getRewards();
        if (canReceive) {
            this._fileNodeBtn.switchToHightLight();
            this._fileNodeText.node.color = (Colors.BUTTON_ONE_NOTE);
            img.active = (true);
        } else {
            this._fileNodeBtn.switchToNormal();
            this._fileNodeText.node.color = (Colors.BUTTON_ONE_NORMAL);
            img.active = (false);
        }
        this._imageSigned.node.active = (!canReceive);
        this._fileNodeBtn.setVisible(canReceive);
        this._fileNodeBtn.setString('');
        this._fileNodeText.string = (Lang.get('mine_craft_privilege_get'));
    } else if (state == 3) {
        richText = RichTextExtend.createRichTextByFormatString(Lang.get('mine_craft_privilege_continue', {
            num1: days,
            num2: 2
        }), {
            defaultColor: Colors.BRIGHT_BG_TWO,
            defaultSize: 20,
            other: [
                { fontSize: 21 },
                { fontSize: 21 }
            ]
        });
        var img:cc.Node = getRewards();
        var payCfg = MineCraftHelper.getPrivilegeVipCfg();
        var str = canReceive && Lang.get('mine_craft_privilege_get') || Lang.get('mine_craft_privilege_again', { num: ''+(payCfg.rmb) });
        if (canReceive) {
            this._fileNodeBtn.switchToHightLight();
            this._fileNodeBtn.setString('');
            this._fileNodeText.string = (str);
            this._fileNodeText.node.color = (Colors.BUTTON_ONE_NOTE);
            img.active = (true);
        } else {
            this._fileNodeBtn.switchToNormal();
            this._fileNodeBtn.setString(str);
            this._fileNodeText.string = ('');
            this._fileNodeText.node.color = (Colors.BUTTON_ONE_NORMAL);
            img.active = (false);
        }
    }
    richText.node.setAnchorPoint(cc.v2(0.5, 0.5));
    this._nodeActivedLast3.addChild(richText.node);
}
_onBtnClose() {
    this.close();
}
_onBtnGet() {
    var payCfg = MineCraftHelper.getPrivilegeVipCfg();
        var cardData = G_UserData.getActivityMonthCard().getMonthCardDataById(payCfg.id);
        if (cardData && cardData.isCanReceive()) {
            var todayZero = G_ServerTime.secondsFromZero() + 86400;
            if (cardData.getRemainDay() == 1 && G_ServerTime.getLeftSeconds(G_UserData.getMineCraftData().getPrivilegeTime()) <= G_ServerTime.getLeftSeconds(todayZero)) {
                if (this._isChangeState) {
                    G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
                } else {
                    G_Prompt.showTip(Lang.get('minecraft_privilege_over'));
                    this._updateBtnDesc();
                }
            } else {
                G_UserData.getActivityMonthCard().c2sUseMonthlyCard(payCfg.id);
            }
        } else {
            G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
        }
}
_onEventRechargeGetInfo() {
    this._updateBtnDesc();
}
_onEventWelfareMonthCardGetReward(event, id, message) {
    var awards = message['reward'];
    if (awards) {
        G_Prompt.showAwards(awards);
    }
}

_onEventWelfareMonthCardAvalable(event, retId) {
    if (retId == MessageErrorConst.RET_MONTH_CARD_NOT_AVAILABLE) {
        G_Prompt.showTip(Lang.get('minecraft_privilege_over'));
        this._updateBtnDesc();
    } else if (retId == MessageErrorConst.RET_MONTH_CARD_NOT_USE) {
        G_Prompt.showTip(Lang.get('minecraft_privilege_overtime'));
        this._updateBtnDesc();
    }
}


}