const {ccclass, property} = cc._decorator;

import CommonIconTemplate from '../../../../ui/component/CommonIconTemplate'
import ViewBase from '../../../ViewBase';
import { ActivityDailySigninConst } from '../../../../const/ActivityDailySigninConst';
import { Lang } from '../../../../lang/Lang';
import { ActivityConst } from '../../../../const/ActivityConst';

@ccclass
export default class DailySigninItemNode extends ViewBase {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageNormalBg: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageLightBg: cc.Sprite = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _commonIconTemplate: CommonIconTemplate = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageVipFlag: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textVip: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageShade: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTick: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _textResignin: cc.Sprite = null;

    _globalOrder: number;
    _callback: any;


    ctor() {
        this._globalOrder = 0;
        this._imageNormalBg.node.on('touchend', this._onTouchCallBack, this, true);
        
    }
    onCreate() {
        this.ctor();
        //this._imageNormalBg.setSwallowTouches(false);
    }
    onEnter(){

    }
    onExit(){
        
    }
    _onTouchCallBack(event:cc.Event.EventTouch, state) {
        var moveOffsetX = Math.abs(event.getLocation().x - event.getPreviousLocation().x);
        var moveOffsetY = Math.abs(event.getLocation().y - event.getPreviousLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            if (this._callback) {
                this._callback(this);
            }
        }
    }
    updateInfo(dailySigninUnitData) {
        this.setLightEffectGlobalZorder(0);
        var cfg = dailySigninUnitData.getConfig();
        if (cfg.vip >= ActivityDailySigninConst.REWARD_DOUBLE_VIP_MAX) {
            this._textVip.node.active = (false);
            this._imageVipFlag.node.active = (false);
        } else {
            this._textVip.node.active = (true);
            this._imageVipFlag.node.active = (true);
            this._textVip.string = (Lang.get('lang_activity_dailysign_item_vip', { vip: cfg.vip }));
        }
        //this._commonIconTemplate.unInitUI();
        this._commonIconTemplate.initUI(cfg.type, cfg.value, cfg.size);
        this._commonIconTemplate.setTouchEnabled(true);
        this._commonIconTemplate.removeLightEffect();
        var state = dailySigninUnitData.getState();
        this._textResignin.node.active = (false);
        if (state == ActivityConst.CHECKIN_STATE_WRONG_TIME) {
            this._imageShade.node.active = (false);
            this._imageTick.node.active = (false);
            this._imageLightBg.node.active = (false);
        } else if (state == ActivityConst.CHECKIN_STATE_RIGHT_TIME) {
            this._imageShade.node.active = (false);
            this._imageTick.node.active = (false);
            this._imageLightBg.node.active = (true);
            this._commonIconTemplate.setTouchEnabled(false);
            this._commonIconTemplate.showLightEffect(1, 'effect_icon_liuguang');
        } else if (state == ActivityConst.CHECKIN_STATE_PASS_TIME || state == ActivityConst.CHECKIN_STATE_PASS_ALL_TIME) {
            this._imageShade.node.active = (true);
            this._imageTick.node.active = (true);
            this._imageLightBg.node.active = (false);
        } else if (state == ActivityConst.CHECKIN_STATE_OVER_TIME) {
            this._imageShade.node.active = (false);
            this._imageTick.node.active = (false);
            this._imageLightBg.node.active = (false);
            this._textResignin.node.active = (true);
            this._commonIconTemplate.setTouchEnabled(false);
        }
    }
    setLightEffectGlobalZorder(order) {
        if (this._globalOrder == order) {
            return;
        }
        this._globalOrder = order;
    }
    setCallBack(callback) {
        if (callback) {
            this._callback = callback;
        }
    }   

}