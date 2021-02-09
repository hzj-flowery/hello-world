const {ccclass, property} = cc._decorator;

import { FunctionConst } from '../../../../const/FunctionConst';
import { SignalConst } from '../../../../const/SignalConst';
import { G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData, G_ConfigLoader } from '../../../../init';
import { Lang } from '../../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../../ui/component/CommonButtonLevel0Highlight';
import CommonButtonLevel0Normal from '../../../../ui/component/CommonButtonLevel0Normal';
import CommonMainMenu from '../../../../ui/component/CommonMainMenu';
import CommonUI from '../../../../ui/component/CommonUI';
import { ComponentIconHelper } from '../../../../ui/component/ComponentIconHelper';
import { PopupGetRewards } from '../../../../ui/PopupGetRewards';
import { WayFuncDataHelper } from '../../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../../utils/handler';
import { UserCheck } from '../../../../utils/logic/UserCheck';
import { Path } from '../../../../utils/Path';
import { table } from '../../../../utils/table';
import { TypeConvertHelper } from '../../../../utils/TypeConvertHelper';
import UIActionHelper from '../../../../utils/UIActionHelper';
import { UIPopupHelper } from '../../../../utils/UIPopupHelper';
import ViewBase from '../../../ViewBase';
import { CustomActivityUIHelper } from '../CustomActivityUIHelper';
import { CustomActivityAvatarHelper } from './CustomActivityAvatarHelper';
import CustomActivityAvatarViewItem from './CustomActivityAvatarViewItem';
import { UserDataHelper } from '../../../../utils/data/UserDataHelper';
import { ConfigNameConst } from '../../../../const/ConfigNameConst';
import { DataConst } from '../../../../const/DataConst';




var  FAST_STEP_TIME = 0.025 //快速转动步长时间
var  FAST_STEP_TIME_CONTINUOUTS = FAST_STEP_TIME  //连续过程中的步长时间
var  HIGHLIGHT_TIME = FAST_STEP_TIME * 5 //高亮停留时间
var  SLOW_TIME = 0.04 //减数时间
var  TOTAL_ITEM_NUM = 14 //item 个数


@ccclass
export default class CustomActivityAvatarView extends ViewBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _itemParentNode: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _itemsEffectNode: cc.Node = null;

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
   _curName: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _runState: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _freeNode: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _freeText: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _freeNum: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _oneCostNode: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCostIcon1: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _costNum1: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCostIcon2: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _costNum2: cc.Label = null;

   @property({
       type: CommonButtonLevel0Normal,
       visible: true
   })
   _btnOne: CommonButtonLevel0Normal = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _btnFive: CommonButtonLevel0Highlight = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _getState: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _countDownNode: cc.Node = null;

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

    private  _parentView:any;
    private  _awardsItemList:any;
    private  _lastIndex:number;
    private  _actionState:boolean;
    private  _targetIndex:number;
    private  _targetIndexs:any;
    private  _fiveTurnIndex:number;
    private  _awards:any;
    private  _recvAwards:any;
    private  _activityUnitData:any;
    private _signalRun:any;
    private _signalFreeCountChange:any;
    private _startIndex:number;

    private _count:number;
    private _stepCount:number;
    private _stepTime:number;
    private _dt:number;
    private _callFunc:any;
    private _endCallFunc:any;



   setInitData(parentView, activityUnitData) {
    this._parentView = parentView;
    this._awardsItemList = {};
    this._lastIndex = 1;
    this._actionState = false;
    this._targetIndex = 1;
    this._targetIndexs = {};
    this._fiveTurnIndex = 1;
    this._awards = {};
    this._recvAwards = {};
    this._activityUnitData = activityUnitData;
    // var resource = {
    //     size: G_ResolutionManager.getDesignSize(),
    //     file: Path.getCSB('CustomActivityAvatarView', 'customactivity/avatar'),
    //     binding: {
    //         _btnFive: {
    //             events: [{
    //                     event: 'touch',
    //                     method: '_onBtnFive'
    //                 }]
    //         }
    //         _btnOne: {
    //             events: [{
    //                     event: 'touch',
    //                     method: '_onBtnOne'
    //                 }]
    //         }
    //         _btnReadme: {
    //             events: [{
    //                     event: 'touch',
    //                     method: '_onBtnReadme'
    //                 }]
    //         }
    //         _btnShop: {
    //             events: [{
    //                     event: 'touch',
    //                     method: '_onBtnShop'
    //                 }]
    //         }
    //     }
    // };
}
onCreate() {
    this._btnFive.addTouchEventListenerEx(handler(this,this._onBtnFive),true);
    this._btnOne.addClickEventListenerEx(handler(this,this._onBtnOne))
    this._btnFive.setString(Lang.get('customactivity_avatar_act_fivetime'));
    this._btnOne.setString(Lang.get('customactivity_avatar_act_onetime'));
    this._btnShop.updateUI(FunctionConst.FUNC_AVATAR_ACTIVITY_SHOP);
    this._btnShop.addClickEventListenerEx(handler(this,this._onBtnShop));
    this._initView();
    this._createStaticEffect();
}
_initView() {
    var [awardsList, cosRes, freeNum] = CustomActivityAvatarHelper.getInitViewData(this._activityUnitData.getBatch());
    
    var customActivityAvatarViewItem =  cc.resources.get(Path.getPrefab("CustomActivityAvatarViewItem","customActivity/avatar"));
    this._awards = awardsList;
    this._awardsItemList = {};
    
    for (var k =0;k<awardsList.length;k++) {
        var v = awardsList[k];
        var item = (cc.instantiate(customActivityAvatarViewItem) as cc.Node).getComponent(CustomActivityAvatarViewItem);
        item.setInitData(k+1, v);
        this._awardsItemList[k+1] = item;
        var pos = CustomActivityAvatarHelper.getItemPositionByIndex(k+1);
        this._itemParentNode.addChild(item.node);
        item.node.setPosition(pos);
    }
    this._initCostUI();
    this._switchRunState();
    this._updateFreeCount();
}

_initCostUI() {
    var [awardsList, cosRes, freeNum] = CustomActivityAvatarHelper.getInitViewData(this._activityUnitData.getBatch());
    var resParam = TypeConvertHelper.convert(cosRes.type, cosRes.value, cosRes.size);
    var resNum = UserDataHelper.getNumByTypeAndValue(cosRes.type, cosRes.value);
    var yubiParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
    var yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
    var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
    var consume_time1 = parseInt(Paramter.get(885).content);
    if (resNum >= 10) {
        this._imageCostIcon1.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
        this._imageCostIcon2.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
        this._costNum1.string = (cosRes.size);
        this._costNum2.string = ""+(cosRes.size * 10);
    } else if (resNum > 0) {
        this._imageCostIcon1.node.addComponent(CommonUI).loadTexture(resParam.res_mini);
        this._imageCostIcon2.node.addComponent(CommonUI).loadTexture(yubiParam.res_mini);
        this._costNum1.string = (cosRes.size);
        this._costNum2.string = ""+(consume_time1 * 10);
    } else {
        this._imageCostIcon1.node.addComponent(CommonUI).loadTexture(yubiParam.res_mini);
        this._imageCostIcon2.node.addComponent(CommonUI).loadTexture(yubiParam.res_mini);
        this._costNum1.string = ""+(consume_time1);
        this._costNum2.string = ""+(consume_time1 * 10);
    }
}

_createStaticEffect() {
    G_EffectGfxMgr.createPlayGfx(this._itemsEffectNode, 'effect_xianshihuodong_faguang', null, false);
}
_updateFreeCount() {
    var freeCount = CustomActivityAvatarHelper.getFreeCount(this._activityUnitData.getBatch());
    if (freeCount > 0) {
        this._freeNode.active = (true);
        this._oneCostNode.active = (false);
        this._freeNum.string = (freeCount).toString();
    } else {
        this._freeNode.active = (false);
        this._oneCostNode.active = (true);
    }
}
onEnter() {
    this._signalRun = G_SignalManager.add(SignalConst.EVENT_AVATAR_ACTIVITY_SUCCESS, handler(this, this._onEventRun));
    this._signalFreeCountChange = G_SignalManager.add(SignalConst.EVENT_GET_DAILY_COUNT_SUCCESS, handler(this, this._onEventFreeCountChange));
}
onExit() {
    this._signalRun.remove();
    this._signalRun = null;
    this._signalFreeCountChange.remove();
    this._signalFreeCountChange = null;
}

_onBtnFive() {
    if (this._actionState) {
        return;
    }
    if (!G_UserData.getCustomActivity().isAvatarActivityVisible()) {
        G_Prompt.showTip(Lang.get('customactivity_avatar_act_end_tip'));
        return;
    }
    var getCosRes = CustomActivityAvatarHelper.getCosRes(this._activityUnitData.getBatch());
    var ownNum = UserDataHelper.getNumByTypeAndValue(getCosRes.type, getCosRes.value);
    var costYuBi = null;
    if (getCosRes.size * 10 <= ownNum) {
    } else {
        var yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var onceNeedNum = parseInt(Paramter.get(885).content);
        if (onceNeedNum * 10 > yubiNum) {
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
            G_Prompt.showTip(Lang.get('customactivity_equip_cost_not_enough', {
                name1: param.name,
                name2: param.name
            }));
            return;
        }
        costYuBi = onceNeedNum * 10;
    }
    var params = {
        moduleName: 'COST_YUBI_MODULE_NAME_4',
        yubiCount: costYuBi,
        itemCount: 10
    };
    UIPopupHelper.popupCostYubiTip(params, handler(this, this._doAvatarActivity), 2);
}
_onBtnOne() {
    if (this._actionState) {
        return;
    }
    if (!G_UserData.getCustomActivity().isAvatarActivityVisible()) {
        G_Prompt.showTip(Lang.get('customactivity_avatar_act_end_tip'));
        return;
    }
    var freeCount = CustomActivityAvatarHelper.getFreeCount(this._activityUnitData.getBatch());
    var costYuBi = null;
    if (freeCount <= 0) {
        var getCosRes = CustomActivityAvatarHelper.getCosRes(this._activityUnitData.getBatch());
        var ownNum = UserDataHelper.getNumByTypeAndValue(getCosRes.type, getCosRes.value);
        if (getCosRes.size <= ownNum) {
        } else {
            var yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
            var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
            var onceNeedNum = parseInt(Paramter.get(885).content);
            if (onceNeedNum > yubiNum) {
                var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
                G_Prompt.showTip(Lang.get('customactivity_equip_cost_not_enough', {
                    name1: param.name,
                    name2: param.name
                }));
                return;
            }
            costYuBi = onceNeedNum;
        }
    }
    var params = {
        moduleName: 'COST_YUBI_MODULE_NAME_4',
        yubiCount: costYuBi,
        itemCount: 1
    };
    UIPopupHelper.popupCostYubiTip(params, handler(this, this._doAvatarActivity), 1);
}
_doAvatarActivity(index) {
    this._parentView.pauseUpdateTopBar();
    G_UserData.getAvatarActivity().c2sAvatarActivity(index);
}

_onEventFreeCountChange() {
    this._updateFreeCount();
}
_onEventRun(event, message) {
    var recvAwards = message['awards'];
    var indexs = [];
    var awards = [];
    if (recvAwards) {
        for (var k in recvAwards) {
            var v = recvAwards[k];
            indexs.push(v.index);
            awards.push(v.award);
        }
    }
    this._recvAwards = awards;
    this._stopActions();
    if (indexs.length <= 0) {
        return;
    }
    if (indexs.length == 1) {
        this._playOne(indexs[0]);
    } else {
        this._playFive(indexs);
    }
    this._initCostUI();
}
_stopActions() {
    this.node.stopAllActions();
    for (var k in this._awardsItemList) {
        var v = this._awardsItemList[k];
        v.stopAction();
    }
}
_onBtnReadme() {
    UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_AVATAR_ACTIVITY);
}
_getTargetIndexCount(index) {
    var newCount = 0;
    if (index <= this._lastIndex) {
        newCount = index + table.nums(this._awardsItemList) - this._lastIndex + 1;
    } else {
        newCount = index - this._lastIndex + 1;
    }
    return newCount;
}
_runStartSlow(startIndex, callback) {
    this._newSteps(startIndex, TOTAL_ITEM_NUM / 2, FAST_STEP_TIME + SLOW_TIME * TOTAL_ITEM_NUM / 2, -1 * SLOW_TIME, function (index) {
        this._awardsItemList[index].playRun(HIGHLIGHT_TIME);
    }.bind(this),function (index) {
        callback();
    });
}
_runEndSlow(startIndex, callback) {
    this._newSteps(startIndex, TOTAL_ITEM_NUM / 2, FAST_STEP_TIME, SLOW_TIME, function (index) {
        this._awardsItemList[index].playRun(HIGHLIGHT_TIME);
    }.bind(this),function (index) {
        callback();
    });
}
_runAverage(startIndex, count, t, callback) {
    this._newSteps(startIndex, count, t, 0, function (index) {
        this._awardsItemList[index].playRun(HIGHLIGHT_TIME);
    }.bind(this),function (index) {
        callback();
    });
}
_playOne(targetIndex) {
    this._playActionStart();
    this._targetIndex = targetIndex;
    var count = this._getTargetIndexCount(targetIndex);
    count = count + 2 * table.nums(this._awardsItemList);
    this._runStartSlow(this._lastIndex, function () {
        this._runAverage(this._lastIndex + 1, count, FAST_STEP_TIME, function () {
            this._runEndSlow(this._lastIndex + 1, function () {
                this._awardsItemList[this._lastIndex].playSelect(function () {
                    this._popupAwards(this._recvAwards);
                    this._playActionEnd();
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
}
_playActionStart() {
    this._actionState = true;
    this._itemsEffectNode.active = (false);
}
_playActionEnd() {
    this._parentView.resumeUpdateTopBar();
    this._actionState = false;
    this._itemsEffectNode.active = (true);
    this._awardsItemList[this._lastIndex].setHighlight(false);
}
_switchAwardState() {
    this._getState.active = (true);
    this._getState.removeAllChildren();
    this._getState.x = (0);
    this._runState.active = (false);
    this._curName.string = (Lang.get('customactivity_avatar_act_title2'));
}
_switchRunState() {
    this._getState.active = (false);
    this._getState.removeAllChildren();
    this._runState.active = (true);
    var actUnitdata = G_UserData.getCustomActivity().getAvatarActivity();
    if (actUnitdata) {
        this._curName.string = (actUnitdata.getTitle());
    }
}
_updateFiveAward(index) {
    var gapX = 75;
    var posx = (index - 1) * gapX;
    var awardIndex = this._targetIndexs[index]-1;
    var award = this._awards[awardIndex];
    if(!award)
    {
        cc.error("-----",awardIndex)
    }
    var parentNode = new cc.Node();
    this._getState.addChild(parentNode);
    parentNode.setPosition(new cc.Vec2(posx, 0));
    var effectFunction = function (effect):cc.Node {
        if (effect == 'icon') {
            var item = ComponentIconHelper.createIcon(award.type, award.value, award.size);
            return item;
        }
    }
    var effect = G_EffectGfxMgr.createPlayMovingGfx(parentNode, 'moving_xianshihuodong_lianchou', effectFunction, null, false);
    var size = this._getState.getParent().getContentSize();
    if (index <= 5) {
        this._getState.x = (-1 * posx / 2);
    } else {
        this._getState.x = (-1 * posx + gapX * 2);
    }
}
_popupAwards(awards, callback) {
    PopupGetRewards.showRewards(awards,callback);
}
_fiveStepCallBack(index) {
    this._updateFiveAward(index);
    if (index >= this._targetIndexs.length-1) {
        this._playActionEnd();
        this._popupAwards(this._recvAwards, function () {
            if (this._switchRunState) {
                this._switchRunState();
            }
        }.bind(this));
    }
}
_runFiveAverage() {
    if (this._fiveTurnIndex >= this._targetIndexs.length-1) {
        return;
    }
    this._fiveTurnIndex = this._fiveTurnIndex + 1;
    this._targetIndex = this._targetIndexs[this._fiveTurnIndex];
    var count = this._getTargetIndexCount(this._targetIndex);
    this._runAverage(this._lastIndex, count, FAST_STEP_TIME_CONTINUOUTS, function () {
        (this._awardsItemList[this._lastIndex] as CustomActivityAvatarViewItem).playSelect(handler(this,this._playSelectCallBack));
    }.bind(this));
}

private _playSelectCallBack():void{
    this._fiveStepCallBack(this._fiveTurnIndex);
    this._runFiveAverage();
}
_playFive(targetIndexs) {
    if (!targetIndexs || targetIndexs.length <= 0) {
        return;
    }
    this._targetIndexs = targetIndexs;
    this._fiveTurnIndex = 0;
    this._targetIndex = this._targetIndexs[this._fiveTurnIndex];
    this._playActionStart();
    var count = this._getTargetIndexCount(this._targetIndex);
    count = count + 2 * table.nums(this._awardsItemList);
    this._runStartSlow(this._lastIndex, function () {
        this._runAverage(this._lastIndex + 1, count, FAST_STEP_TIME, function () {
            this._runEndSlow(this._lastIndex + 1, function () {
                this._awardsItemList[this._lastIndex].playSelect(function () {
                    this._switchAwardState();
                    this._fiveStepCallBack(this._fiveTurnIndex);
                    this._runFiveAverage();
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
}
_getCurRunIndex() {
    var itemsNum = table.nums(this._awardsItemList);
    var temp = this._startIndex + this._stepCount - 1;
    var curIndex = temp - Math.floor(temp / itemsNum) * itemsNum;
    if (curIndex == 0) {
        curIndex = itemsNum;
    }
    this._lastIndex = curIndex;
    return this._lastIndex;
}
//新建立一个下一步动作
private _newSteps(startIndex, count, t, dt, callFunc, endCallFunc) {
    this._startIndex = startIndex;
    if(!count)
    {
        cc.error("");
    }
    this._count = count;
    this._stepCount = 0;
    this._stepTime = t;
    this._dt = dt;
    this._callFunc = callFunc;
    this._endCallFunc = endCallFunc;//结束函数
    this._nextStep();
}
private _nextStep() {
    if (this._stepCount > this._count - 1) {
        if (this._endCallFunc) {
            this._endCallFunc(this._getCurRunIndex());
        }
        return;
    }
    this._stepCount = this._stepCount + 1;
    if (this._callFunc) {
        this._callFunc(this._getCurRunIndex());
    }
    this._stepTime = this._stepTime + this._dt;
    var delayAction = cc.delayTime(this._stepTime);
    var callFuncAction = cc.callFunc(function () {
        this._nextStep();
    }.bind(this));
    var action = cc.sequence(delayAction, callFuncAction);
    this.node.runAction(action);
}
_onBtnShop() {
    if (!G_UserData.getCustomActivity().isAvatarActivityVisible()) {
        G_Prompt.showTip(Lang.get('customactivity_avatar_act_end_tip'));
        return;
    }
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AVATAR_ACTIVITY_SHOP);
}
refreshView(customActUnitData, resetListData) {
    this._refreshActTime();
}
_updateTime() {
    var actUnitData = G_UserData.getCustomActivity().getAvatarActivity();
    if (actUnitData && actUnitData.isActInRunTime()) {
        if (actUnitData.isActInRunTime()) {
            var timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getEnd_time());
            this._textTime.string = (timeStr);
            return;
        }
    }
    this._textTime.node.stopAllActions();
    this._textTime.string = (Lang.get('customactivity_avatar_act_end'));
}
_refreshActTime(actUnitData?) {
    this._textTime.node.stopAllActions();
    this._updateTime();
    var action = UIActionHelper.createUpdateAction(function () {
        this._updateTime();
    }.bind(this),0.5);
    this._textTime.node.runAction(action);
}


}