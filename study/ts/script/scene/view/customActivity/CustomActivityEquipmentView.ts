const {ccclass, property} = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { CustomActivityConst } from '../../../const/CustomActivityConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import EffectGfxMoving from '../../../effect/EffectGfxMoving';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors, G_AudioManager, G_EffectGfxMgr, G_Prompt, G_ServerTime, G_SignalManager, G_UserData, G_ConfigLoader } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonIconTemplate from '../../../ui/component/CommonIconTemplate';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonUI from '../../../ui/component/CommonUI';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { ActivityEquipDataHelper } from '../../../utils/data/ActivityEquipDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import { CustomActivityUIHelper } from './CustomActivityUIHelper';
import { DataConst } from '../../../const/DataConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';




var BG_MOVE_SPEED = 500;
var BG_WIDTH = 1400 * 0.9;

@ccclass
export default class CustomActivityEquipmentView extends ViewBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeBg1: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeBg2: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageNight: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDay: cc.Sprite = null;

   @property({
       type: CommonMainMenu,
       visible: true
   })
   _btnShop: CommonMainMenu = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnReadme: cc.Button = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTimeTitle: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTime: cc.Label = null;

   @property({
       type: cc.ScrollView,
       visible: true
   })
   _listViewRecord: cc.ScrollView = null;

   @property({
       type: CommonHeroAvatar,
       visible: true
   })
   _nodeHeroAvatar: CommonHeroAvatar = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeTip: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeCount: cc.Node = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _button1: CommonButtonLevel0Highlight = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _button2: CommonButtonLevel0Highlight = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCostBg1: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCost1: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCost1: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCostBg2: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textCost2: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCost2: cc.Sprite = null;

   @property({
    type: cc.Sprite,
    visible: true
})
_imgLeftBottom: cc.Sprite = null;
   
   private _parentView:any;
   private _batch:any;
   private _configInfo:any;
   private _nodeDropStartPos:any;

   private  _countDownHandler;
    private  _shoutHandler;
    private  _bgmHandler;
    private  _listViewWidth:number;
    private  _listViewHeight:number;
    private  _bgInitPosx1:number;
    private  _bgInitPosx2:number;
    private  _targetPosX:number;
    private  _awards:Array<any>;
    private  _effect1:EffectGfxMoving;
    private  _effect2:EffectGfxMoving;
    private  _effect3:EffectGfxMoving;
    private  _effect0:EffectGfxMoving;
    private  _isInHitState:boolean;
    private  _bgmSoundId:any;
    
    private _signalCustomActivityEquipInfo:any;
    private _signalCustomActivityDrawEquipSuccess:any;
    private _signalCustomActivityRechargeLimitChange:any;


   public setInitData(parentView) {
    this._parentView = parentView;
}
onCreate() {
    this._nodeHeroAvatar.init();
    this._nodeDropStartPos = this._nodeHeroAvatar.node;
    this._initData();
    this._initView();
}
_initData() {
    var actUnitData = G_UserData.getCustomActivity().getEquipActivity();
    if (actUnitData) {
        this._batch = actUnitData.getBatch();
        this._configInfo = ActivityEquipDataHelper.getActiveConfig(this._batch);
    }
    this._countDownHandler = null;
    this._shoutHandler = null;
    this._bgmHandler = null;
    this._listViewWidth = this._listViewRecord.node.getContentSize().width;
    this._listViewHeight = this._listViewRecord.node.getContentSize().height;
    this._bgInitPosx1 = this._nodeBg1.x;
    this._bgInitPosx2 = this._nodeBg2.x;
    this._targetPosX = this._bgInitPosx1 - BG_WIDTH;
    this._awards = [];
    this._effect1 = null;
    this._effect2 = null;
    this._effect3 = null;
    this._effect0 = null;
    this._isInHitState = false;
    this._bgmSoundId = null;
}
_initCostUI() {
    var resParam = TypeConvertHelper.convert(this._configInfo.money_type, this._configInfo.money_value);
    var resNum = UserDataHelper.getNumByTypeAndValue(this._configInfo.money_type, this._configInfo.money_value);
    var yubiParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
    var yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
    this._imgLeftBottom.node.active = (false);
    var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
    var consume_time1 = parseInt(Paramter.get(884).content);
    var consume_time2 = parseInt(Paramter.get(884).content);
    if (resNum >= 10) {
        this._textCost1.string = (this._configInfo.consume_time1);
        this._imageCost1.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
        this._textCost2.string =""+(this._configInfo.consume_time2 * this._configInfo.hit_num);
        this._imageCost2.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
    } else if (resNum > 0) {
        this._textCost1.string = (this._configInfo.consume_time1);
        this._imageCost1.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
        this._textCost2.string = ""+(consume_time2 * this._configInfo.hit_num);
        this._imageCost2.node.addComponent(CommonUI).loadTexture(yubiParam.res_mini);
    } else {
        this._textCost1.string = ""+(consume_time1);
        this._imageCost1.node.addComponent(CommonUI).loadTexture(yubiParam.res_mini);
        this._textCost2.string = ""+(consume_time2 * this._configInfo.hit_num);
        this._imageCost2.node.addComponent(CommonUI).loadTexture(yubiParam.res_mini);
    }
    this.scheduleOnce(()=>{
        this._imageCost1.node.x = this._textCost1.node.x + this._textCost1.node.width;
        this._imageCost2.node.x = this._textCost2.node.x + this._textCost2.node.width;
    })
    
}
_initView() {
    this._nodeHeroAvatar.setAsset('103_escape');
    this._nodeHeroAvatar.setShadowScale(2);
    this._nodeHeroAvatar.setBubblePosition(new cc.Vec2(128, 105));
    this._btnShop.updateUI(FunctionConst.FUNC_EQUIP_ACTIVITY_SHOP);
    this._button2.setString(this._configInfo.name2);
    this._initBowStatic();
    var resParam = TypeConvertHelper.convert(this._configInfo.money_type, this._configInfo.money_value);
    var content = Lang.get('customactivity_equip_hit_num_tip', {
        money: this._configInfo.money,
        count: this._configInfo.money_size,
        urlIcon: resParam.res_mini
    });
    var richText = RichTextExtend.createWithContent(content);
    richText.node.setAnchorPoint(new cc.Vec2(0, 0));
    this._nodeTip.addChild(richText.node);
    this._initCostUI();

}
_initDayOrNight() {
    var isNight = function () {
        var hour = G_ServerTime.getCurrentHHMMSS(G_ServerTime.getTime())[0];
        if (hour >= 18 && hour <= 23) {
            return true;
        }
        if (hour >= 0 && hour <= 5) {
            return true;
        }
    }
    this._imageDay.node.active = (true);
    this._imageNight.node.active = (false);
    if (isNight()) {
        this._imageDay.node.active = (false);
        this._imageNight.node.active = (true);
    }
}
onEnter() {
    this._signalCustomActivityEquipInfo = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_INFO, handler(this, this._customActivityEquipInfo));
    this._signalCustomActivityDrawEquipSuccess = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_PLAY_SUCCESS, handler(this, this._customActivityDrawEquipSuccess));
    this._signalCustomActivityRechargeLimitChange = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_LIMIT_CHANGE, handler(this, this._customActivityRechargeLimitChange));
    this._resetBg();
    this._startCountDown();
    this.schedule(this._onUpdateMoveBg, 0);
    this._runStart();
    this._startShout();
    this._updateShopRP();
}
onExit() {
    this._stopCountDown();
    this.unscheduleAllCallbacks();
    this._stopShout();
    this.stopBGM();
    this._signalCustomActivityEquipInfo.remove();
    this._signalCustomActivityEquipInfo = null;
    this._signalCustomActivityDrawEquipSuccess.remove();
    this._signalCustomActivityDrawEquipSuccess = null;
    this._signalCustomActivityRechargeLimitChange.remove();
    this._signalCustomActivityRechargeLimitChange = null;
    this.unschedule(this._scheduleCreateRecordItem);
}
refreshView(customActUnitData, resetListData) {
    var rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP);
    if (rechargeUnit.isExpired()) {
        G_UserData.getCustomActivityRecharge().c2sSpecialActInfo(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP);
        return;
    }
    this._updateData();
    this._updateView();
}
_customActivityEquipInfo(eventName, actType) {
    if (actType != CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP) {
        return;
    }
    this._updateData();
    this._updateView();
}
_updateData() {
}
_updateView() {
    this._updateRecord();
    this._updateCost();
    this._initCostUI();
}
_startCountDown() {
    this._stopCountDown();
    this._countDownHandler = handler(this,this._onCountDown)
    this.schedule(this._countDownHandler, 1);
    this._onCountDown();
}
_stopCountDown() {
    if (this._countDownHandler) {
       this.unschedule(this._countDownHandler);
        this._countDownHandler = null;
    }
}
_onCountDown() {
    var actUnitData = G_UserData.getCustomActivity().getEquipActivity();
    if (actUnitData && actUnitData.isActInRunTime()) {
        var timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getEnd_time());
        this._textTime.string = (timeStr);
    } else {
        this._textTime.string = (Lang.get('customactivity_equip_act_end'));
        this._stopCountDown();
    }
}
_startShout() {
    this._stopShout();
    this._onShout();
    this._shoutHandler = handler(this, this._startShout)
    this.scheduleOnce(this._shoutHandler, 5);
}
_stopShout() {
    if (this._shoutHandler) {
        this.unschedule(this._shoutHandler);
        this._shoutHandler = null;
    }
}
_onShout() {
    var bubbleText = '';
    if (this._isInHitState) {
        bubbleText = ActivityEquipDataHelper.randomHitChat(this._batch);
    } else {
        bubbleText = ActivityEquipDataHelper.randomCommonChat(this._batch);
    }
    this._nodeHeroAvatar.setBubble(bubbleText, null, null, null, 145);
    var func = function () {
        this._nodeHeroAvatar.setBubbleVisible(false);
    }.bind(this);
    var delay = cc.delayTime(3);
    var action = cc.sequence(delay, cc.callFunc(func));
    this._nodeHeroAvatar.node.stopAllActions();
    this._nodeHeroAvatar.node.runAction(action);
}
_updateRecord() {
    var count = this._awards.length;
    var rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP);
    var records = rechargeUnit.getRecordList(count);
    //var textInfo = ActivityEquipDataHelper.getAwardRecordText(records);
    this._listViewRecord.content.removeAllChildren();
    this._listViewRecord.content.height = 0;
    // for (var i in textInfo) {
    //     var info = textInfo[i];
    //     var item = this._createRecordItem(info);
    //     UIHelper.updateCurstomListSize(this._listViewRecord.content,item)
    // }
    // var size = this._listViewRecord.content.getContentSize();
    // if (size.height > this._listViewHeight) {
    //     this._listViewRecord.scrollToTop();
    // }
    this._createPos = 0;
    this._textInfo = ActivityEquipDataHelper.getAwardRecordText(records);
    this.unschedule(this._scheduleCreateRecordItem);
    this.schedule(this._scheduleCreateRecordItem,0.1);
}
private _createPos:number = 0;
private _textInfo:any;
_scheduleCreateRecordItem():void{
    if(this._createPos>=this._textInfo.length)
    {
        var size = this._listViewRecord.content.getContentSize();
        if (size.height > this._listViewHeight) {
            this._listViewRecord.scrollToTop();
        }
        this.unschedule(this._scheduleCreateRecordItem);
        return;
    }
    
    var info = this._textInfo[this._createPos]
    var item = this._createRecordItem(info);
    UIHelper.updateCurstomListSize(this._listViewRecord.content,item);
    this._createPos++;
}
_createRecordItem(info) {
    var text = info.text;
    var color = info.color;
    var widget = new cc.Node();
    var des = '$c' + (color + ('_' + (text + '$')));
    var formatStr = Lang.get('customactivity_equip_award_record', { des: des });
    var params = {
        defaultColor: Colors.DARK_BG_ONE,
        defaultSize: 20
    };
    
    var richText = RichTextExtend.createRichTextByFormatString(formatStr, params);
    richText.node.setAnchorPoint(new cc.Vec2(0, 0));
    // richText.ignoreContentAdaptWithSize(false);
    richText.node.width = this._listViewWidth;
    widget.addChild(richText.node);
    var height = richText.node.getContentSize().height;
    var size = cc.size(this._listViewWidth, height);
    widget.setContentSize(size);
    return widget;
}
_updateCost() {
    var rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP);
    var freeCount = rechargeUnit.getRestFreeCount(this._batch);
    if (freeCount > 0) {
        this._button1.setString(Lang.get('customactivity_equip_rest_free_count', { count: freeCount }));
        this._imageCostBg1.node.active = (false);
    } else {
        this._button1.setString(this._configInfo.name1);
        this._imageCostBg1.node.active = (true);
    }
}
_updateLimitCount() {
    var formatStr = '';
    var max = this._configInfo.toplimit;
    if (max == 9999) {
        formatStr = Lang.get('customactivity_equip_free_tip');
    } else {
        var rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP);
        var totalCount = rechargeUnit.getTotal_use();
        var count = '$c110_' + (totalCount + '$');
        if (totalCount >= max) {
            count = '$c6_' + (totalCount + '$');
        }
        formatStr = Lang.get('customactivity_equip_max_num_tip', {
            count: count,
            max: max
        });
    }
    var params = {
        defaultColor: Colors.DARK_BG_ONE,
        defaultSize: 20
    };
    var richText = RichTextExtend.createRichTextByFormatString(formatStr, params);
    richText.node.setAnchorPoint(new cc.Vec2(0, 0.5));
    this._nodeCount.removeAllChildren();
    this._nodeCount.addChild(richText.node);
}
_resetBg() {
    this._nodeBg1.x = (this._bgInitPosx1);
    this._nodeBg2.x = (this._bgInitPosx2);
}
_onUpdateMoveBg(dt) {
    var moveNode = function (node) {
        var posx = node.x - BG_MOVE_SPEED * dt;
        node.x = (posx);
    }
    var checkNode = function (node) {
        var posx = node.x;
        if (posx < this._targetPosX) {
            return false;
        } else {
            return true;
        }
    }.bind(this)
    moveNode(this._nodeBg1);
    moveNode(this._nodeBg2);
    if (checkNode(this._nodeBg1) == false) {
        var posx = this._nodeBg2.x + BG_WIDTH;
        this._nodeBg1.x = (posx);
    }
    if (checkNode(this._nodeBg2) == false) {
        var posx = this._nodeBg1.x + BG_WIDTH;
        this._nodeBg2.x = (posx);
    }
}
_runStart() {
    this._nodeHeroAvatar.setAction('run', true);
}
private onBtnReadme() {
    UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_EQUIP_ACTIVITY);
}
private onBtnShop() {
    if (!G_UserData.getCustomActivity().isEquipActivityVisible()) {
        G_Prompt.showTip(Lang.get('customactivity_equip_act_end_tip'));
        return;
    }
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_EQUIP_ACTIVITY_SHOP);
}
// private onClickButton1() {
//     if (this._checkTime() == false) {
//         return;
//     }
//     if (this._checkCost(CustomActivityConst.EQUIP_DRAW_TYPE_1) == false) {
//         return;
//     }
//     G_UserData.getCustomActivityRecharge().c2sPlaySpecialActivity(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP, CustomActivityConst.EQUIP_DRAW_TYPE_1, 1);
// }
// private onClickButton2() {
//     if (this._checkTime() == false) {
//         return;
//     }
//     if (this._checkCost(CustomActivityConst.EQUIP_DRAW_TYPE_2) == false) {
//         return;
//     }
//     G_UserData.getCustomActivityRecharge().c2sPlaySpecialActivity(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP, CustomActivityConst.EQUIP_DRAW_TYPE_2, 1);
//     this._button1.setEnabled(false);
//     this._button2.setEnabled(false);
// }

private onClickButton1() {
    if (this._checkTime() == false) {
        return;
    }
    var [ret, costYuBi, itemCount] = this._checkCost(CustomActivityConst.EQUIP_DRAW_TYPE_1);
    if (ret == false) {
        return;
    }
    var params = {
        moduleName: 'COST_YUBI_MODULE_NAME_2',
        yubiCount: costYuBi,
        itemCount: itemCount
    };
    UIPopupHelper.popupCostYubiTip(params, handler(this, this._doPlaySpecialActivity), CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP, CustomActivityConst.EQUIP_DRAW_TYPE_1);
}
private onClickButton2() {
    if (this._checkTime() == false) {
        return;
    }
    var [ret, costYuBi, itemCount] = this._checkCost(CustomActivityConst.EQUIP_DRAW_TYPE_2);
    if (ret == false) {
        return;
    }
    var params = {
        moduleName: 'COST_YUBI_MODULE_NAME_2',
        yubiCount: costYuBi,
        itemCount: itemCount
    };
    UIPopupHelper.popupCostYubiTip(params, handler(this, this._doPlaySpecialActivity), CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP, CustomActivityConst.EQUIP_DRAW_TYPE_2, true);
}
private _doPlaySpecialActivity(activityType, drawType, ctlBtn) {
    G_UserData.getCustomActivityRecharge().c2sPlaySpecialActivity(activityType, drawType, 1);
    if (ctlBtn) {
        this._button1.setEnabled(false);
        this._button2.setEnabled(false);
    }
}

_playHitAndTalk() {
    this._nodeHeroAvatar.playEffectOnce('hit');
    this._nodeHeroAvatar.addSpineLoadHandler(function () {
        this._nodeHeroAvatar.setAction('run', true);
    }.bind(this));
    this._startShout();
}
_customActivityDrawEquipSuccess(eventName, actType, drawType, records, equips) {
    if (actType != CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP) {
        return;
    }
    this._updateData();
    this._updateCost();
    this._initCostUI();
    this._updateShopRP();
    this._playBowEffect(equips);
    for (var i in records) {
        var id = records[i];
        var info = ActivityEquipDataHelper.getActiveDropConfig(id);
        var unit = {
            type: info.type,
            id: info.value,
            num: info.size
        };
        this._awards.push(unit);
    }
}
_customActivityRechargeLimitChange(eventName, actType, limitUse) {
    if (actType != CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP) {
        return;
    }
}
_checkTime() {
    var isVisible = G_UserData.getCustomActivity().isEquipActivityVisible();
    if (isVisible) {
        return true;
    } else {
        G_Prompt.showTip(Lang.get('customactivity_equip_act_end_tip'));
        return false;
    }
}
_checkCost(drawType) {
    var result = false;
    var costYuBi = null;
    var itemCount = null;
    var consume_time1 = parseInt(this._configInfo.consume_time1);
    var consume_time2 = parseInt(this._configInfo.consume_time2);
    var hit_num = this._configInfo.hit_num;
    var checkCostCoin = function (type, value) {
        var hitCount = UserDataHelper.getNumByTypeAndValue(type, value);
        if (drawType == CustomActivityConst.EQUIP_DRAW_TYPE_1) {
            var rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP);
            var freeCount = rechargeUnit.getRestFreeCount(this._batch);
            if (freeCount > 0) {
                return [true,null,null];
            }
            var limitCount = consume_time1;
            if (hitCount >= limitCount) {
                return [
                    true,
                    limitCount,
                    1
                ];
            }
        } else if (drawType == CustomActivityConst.EQUIP_DRAW_TYPE_2) {
            var limitCount = consume_time2 * hit_num;
            if (hitCount >= limitCount) {
                return [
                    true,
                    limitCount,
                    hit_num
                ];
            }
        }
        return [false,null,null];
    }.bind(this);
    [result] = checkCostCoin(this._configInfo.money_type, this._configInfo.money_value);
    if (result) {
    } else {
        var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        consume_time1 = parseInt(Paramter.get(884).content);
        consume_time2 = parseInt(Paramter.get(884).content);
        hit_num = this._configInfo.hit_num;
        [result,costYuBi,itemCount] = checkCostCoin(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        if (!result) {
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
            G_Prompt.showTip(Lang.get('customactivity_horse_conquer_cost_not_enough', {
                name1: param.name,
                name2: param.name
            }));
        }
    }
    return [
        result,
        costYuBi,
        itemCount
    ];
}
_playOneDropEffect(record) {
    var startPos = UIHelper.convertSpaceFromNodeToNode(this._nodeDropStartPos, this.node);
    var endPos = {
        x: Math.random()*500+500,
        y: 220
    };
    var fadeOut = cc.fadeOut(1);
    var jumpTo = cc.jumpTo(1, new cc.Vec2(endPos.x, endPos.y), 200, 1);
    var action1 = jumpTo.easing(cc.easeBounceOut());
    var action3 = cc.spawn(action1,cc.scaleTo(1, 0.6));
    
    var sp = (cc.instantiate(cc.resources.get(Path.getCommonPrefab("CommonIconTemplate"))) as cc.Node).getComponent(CommonIconTemplate) as CommonIconTemplate;
    sp.initUI(record.type, record.id, record.num);
    sp.node.setPosition(startPos);
    sp.node.setScale(0.3);
    this.node.addChild(sp.node);
    sp.node.runAction(cc.sequence(action3, fadeOut,cc.destroySelf()));
}
_playBowEffect(equips) {
    var count = this._awards.length;
    if (count == 0) {
        this._playBowOut(equips);
    } else {
        this._playBowShoot(equips);
    }
}
_playBowOut(equips) {
    var effectFunction = function () {
        return new cc.Node();
    }
    var eventFunction = function (event) {
        if (event == 'finish') {
            this._playBowShoot(equips);
            if (this._effect1) {
                this._effect1.node.runAction(cc.destroySelf());
                this._effect1 = null;
            }
        }
    }.bind(this)
    this._effect0.node.opacity = 0;
    if (this._effect1) {
        this._effect1.node.runAction(cc.destroySelf());
        this._effect1 = null;
    }
    this._effect1 = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_gxqp_shejian1', effectFunction, eventFunction, false);
    this._isInHitState = true;
}
_playBowShoot(equips) {
    function effectFunction() {
        return new cc.Node();
    }
    
    var eventFunction = function (event) {
        if (event == 'hit') {
            this._playHitAndTalk();
            var record = this._awards[0];
            if (record) {
                this._playOneDropEffect(record);
            }
        } else if (event == 'finish') {
            if (this._effect2) {
                this._effect2.node.runAction(cc.destroySelf());
                this._effect2 = null;
            }
            this._awards.splice(0,1)
            this._updateRecord();
            var count = this._awards.length;
            if (count > 0) {
                this._playBowShoot(equips);
            } else {
                this._playBowIn(equips);
            }
        }
    }.bind(this)
    this._effect0.node.opacity = 0;
    if (this._effect2) {
        this._effect2.node.runAction(cc.destroySelf());
        this._effect2 = null;
    }
    this._effect2 = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_gxqp_shejian2', effectFunction, eventFunction, false);
    G_AudioManager.playSoundWithId(AudioConst.SOUND_SHOOT);
}
_playBowIn(equips) {
    function effectFunction() {
        return new cc.Node();
    }
    var eventFunction = function (event) {
        if (event == 'finish') {
            if (this._effect3) {
                this._effect3.node.runAction(cc.destroySelf());
                this._effect3 = null;
            }
            this._effect0.node.opacity = 255;
            if (equips.length > 0) {
                PopupGetRewards.showRewards(equips);
            }
            this._button1.setEnabled(true);
            this._button2.setEnabled(true);
        }
    }.bind(this);
    this._effect0.node.opacity = 0;
    if (this._effect3) {
        this._effect3.node.runAction(cc.destroySelf());
        this._effect3 = null;
    }
    this._effect3 = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_gxqp_shejian3', effectFunction, eventFunction, false);
    this._isInHitState = false;
}
_initBowStatic() {
    this._effect0 = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_gxqp_shejian0', null, null, false);
}
_updateShopRP() {
    var shopRP = G_UserData.getShopActive().isShowEquipRedPoint();
    this._btnShop.showRedPoint(shopRP);
}
startBGM() {
    this.stopBGM();
    this._onBGM();
    this._bgmHandler = handler(this, this._onBGM);
    this.schedule(this._bgmHandler, 1);
}
_onBGM() {
    this._bgmSoundId = G_AudioManager.playSoundWithId(AudioConst.SOUND_MA_TI);
}
stopBGM() {
    if (this._bgmSoundId) {
        G_AudioManager.stopSound(this._bgmSoundId);
    }
    if (this._bgmHandler) {
        this.unschedule(this._bgmHandler);
        this._bgmHandler = null;
    }
}


}