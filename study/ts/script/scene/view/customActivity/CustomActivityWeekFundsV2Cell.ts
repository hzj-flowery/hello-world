import CommonListItem from "../../../ui/component/CommonListItem";
import EffectGfxNode from "../../../effect/EffectGfxNode";
import CommonUI from "../../../ui/component/CommonUI";
import { Path } from "../../../utils/Path";
import { CustomActivityConst } from "../../../const/CustomActivityConst";
import { Lang } from "../../../lang/Lang";
import { Colors, G_EffectGfxMgr } from "../../../init";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CustomActivityWeekFundsV2Cell extends CommonListItem {

   @property({
       type: cc.Node,
       visible: true
   })
   _resource: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageNormal: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageShade: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageLarge: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDay: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageSelected: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageYuanBao: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textNum: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textState: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageDuiGou: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch: cc.Node = null;
   
   private _rewardCallback:any
   setInitData(rewardCallback) {
    this._rewardCallback = rewardCallback;
}
onCreate() {
    var size = this._resource.getContentSize();
    this.node.setContentSize(size.width, size.height);
}
_createEffect(effect, state) {
    if (effect == 0) {
        return;
    }
    var selectedFlash = this['_nodeEffect'].getChildByName('flash_effect');
    if (selectedFlash == null) {
        var lightEffect = G_EffectGfxMgr.createPlayGfx(this['_nodeEffect'],"effect_chongzhi_guangyun6");
        lightEffect.node.setAnchorPoint(0, 0);
        lightEffect.play();
        lightEffect.node.active = (state == 0);
        lightEffect.node.name = ('flash_effect');
        lightEffect.node.setPosition(this['_nodeEffect'].getContentSize().width * 0.5, this['_nodeEffect'].getContentSize().height * 0.5 + 8);
    } else {
        selectedFlash.active = (state == 0);
    }
}
updateUI(data) {
    var effect = parseInt(data.effects);
    var curDay = parseInt(data.day);
    this._imageDay.node.addComponent(CommonUI).loadTexture(Path.getCustomActivityUI(CustomActivityConst.FUNDS_V2_DAY[curDay-1]));
    // this._imageDay.ignoreContentAdaptWithSize(true);
    this._imageYuanBao.node.addComponent(CommonUI).loadTexture(Path.getCustomActivityUI(CustomActivityConst.FUNDS_YUANBAO[effect]));
    // this._imageYuanBao.ignoreContentAdaptWithSize(true);
    this._textNum.string = ('x' + (data.reward_size_1));
    if (data.isActived && data.canSignedDay) {
        this._createEffect(effect, data.canGet);
        this._imageShade.node.active = (data.canGet == 1);
        this._imageDuiGou.node.active = (data.canGet == 1);
        this._imageLarge.node.active = (data.canGet == 0);
        this._imageSelected.node.active = (data.canGet == 0);
        this._panelTouch.active = (data.canGet == 0);
        this._textState.string = (data.canGet == 1 && Lang.get('weekfunds_v2_state2') || Lang.get('weekfunds_v2_state3'));
        this._textState.node.color = (data.canGet == 0 && Colors.FUNDSWEEK_V2_GOT || Colors.FUNDSWEEK_V2_NOTGOT);
    } else {
        this._createEffect(effect, 0);
        this._imageShade.node.active = (false);
        this._imageDuiGou.node.active = (false);
        this._imageLarge.node.active = (false);
        this._imageSelected.node.active = (false);
        this._panelTouch.active = (false);
        this._textState.string = (Lang.get('weekfunds_v2_state1'));
        this._textState.node.color = (Colors.FUNDSWEEK_V2_NOTGOT);
    }

    var btn = this._panelTouch.getComponent(cc.Button) as cc.Button;
    btn.clickEvents = [];
    var newE = new cc.Component.EventHandler();
    newE.component = "CustomActivityWeekFundsV2Cell";
    newE.target = this.node;
    newE.handler = "onCallBack";
    newE.customEventData = curDay.toString();
    btn.clickEvents.push(newE);
}
private onCallBack(sender,day:number){
      if(this._rewardCallback)
      this._rewardCallback(day);
}

}
