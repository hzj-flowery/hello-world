const {ccclass, property} = cc._decorator;

import CustomActivityVipRecommendGiftNode from './CustomActivityVipRecommendGiftNode'
import { G_Prompt, G_UserData, G_SignalManager } from '../../../init';
import { CustomActivityUIHelper } from './CustomActivityUIHelper';
import { Lang } from '../../../lang/Lang';
import ViewBase from '../../ViewBase';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';

@ccclass
export default class CustomActivityVipRecommendGift extends ViewBase {

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
       type: CustomActivityVipRecommendGiftNode,
       visible: true
   })
   _nodeGift1: CustomActivityVipRecommendGiftNode = null;

   @property({
       type: CustomActivityVipRecommendGiftNode,
       visible: true
   })
   _nodeGift2: CustomActivityVipRecommendGiftNode = null;

   @property({
       type: CustomActivityVipRecommendGiftNode,
       visible: true
   })
   _nodeGift3: CustomActivityVipRecommendGiftNode = null;

   @property({
       type: CustomActivityVipRecommendGiftNode,
       visible: true
   })
   _nodeGift4: CustomActivityVipRecommendGiftNode = null;
   
   private _parentView;
   private _countDownHandler:any;
   private _signalGetVipRecommendGiftSuccess:any;
   private _signalBuyVipRecommendGiftSuccess:any;
   public setInitData(parentView) {
    this._parentView = parentView;
}
onCreate() {
    this._initData();
}
_initData() {
    this._countDownHandler = null;
}
onEnter() {
    this._signalGetVipRecommendGiftSuccess = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_GET_VIP_RECOMMEND_GIFT_SUCCESS, handler(this, this._getVipRecommendGiftSuccess));
    this._signalBuyVipRecommendGiftSuccess = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_BUY_VIP_RECOMMEND_GIFT_SUCCESS, handler(this, this._buyVipRecommendGiftSuccess));
    this._startCountDown();
}
onExit() {
    this._stopCountDown();
    this._signalGetVipRecommendGiftSuccess.remove();
    this._signalGetVipRecommendGiftSuccess = null;
    this._signalBuyVipRecommendGiftSuccess.remove();
    this._signalBuyVipRecommendGiftSuccess = null;
}
_startCountDown() {
    this._stopCountDown();
    this._countDownHandler = handler(this, this._onCountDown);
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
    var actUnitData = G_UserData.getCustomActivity().getVipRecommendGiftActivity();
    if (actUnitData && actUnitData.isActInRunTime()) {
        var timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData.getEnd_time());
        this._textTime.string = (timeStr);
    } else {
        this._textTime.string = (Lang.get('customactivity_vip_recommend_gift_act_end'));
        this._stopCountDown();
    }
}
refreshView() {
    this._updateGifts();
}
_updateGifts() {
    var gifts = G_UserData.getCustomActivity().getVipRecommendGiftList();
    var showCount = 0;
    for (var i = 1; i <= 4; i++) {
        var gift = gifts[i-1];
        if (gift) {
            this['_nodeGift' + i].node.active = (true);
            this['_nodeGift' + i].updateUI(gift);
            showCount = showCount + 1;
        } else {
            this['_nodeGift' + i].node.active = (false);
        }
    }
    this._layoutGift(showCount);
}
_layoutGift(showCount) {
    var scale = 1;
    if (showCount == 4) {
        scale = 0.9;
    }
    var tbPosX = {
        [2]: [
            -169,
            158
        ],
        [3]: [
            -255,
            0,
            255
        ],
        [4]: [
            -308,
            -103,
            103,
            308
        ]
    };
    var posX = tbPosX[showCount];
    for (var i = 1; i <= showCount; i++) {
        this['_nodeGift' + i].node.x = (posX[i-1]);
        this['_nodeGift' + i].node.setScale(scale);
    }
}
_buyVipRecommendGiftSuccess(eventName, awards) {
    this._updateGifts();
    G_Prompt.showAwards(awards);
}
_getVipRecommendGiftSuccess() {
    this._updateGifts();
}


}