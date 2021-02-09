import ListViewCellBase from "../../../ui/ListViewCellBase";
import { G_Prompt, G_SignalManager, G_UserData } from "../../../init";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { Path } from "../../../utils/Path";
import { assert } from "../../../utils/GlobleFunc";
import CommonUI from "../../../ui/component/CommonUI";
import { ChallengeRes } from "./ChallengeRes";
import { Lang } from "../../../lang/Lang";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChallengeCell extends ListViewCellBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBase: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageChallenge: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageName: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDesc: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCover: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTip: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRedPoint: cc.Sprite = null;
   
   private _functionId:number;
   private _functionInfo:any;
   private _open:boolean;

   public setInitData(functionId, functionInfo) {
    this._functionId = functionId;
    this._functionInfo = functionInfo;
    //cc.log(this._functionInfo);
    this._open = false;
    this.node.name = ('ChallengeCell_' + this._functionId);
}
onCreate() {
    var size = this._panelBase.getContentSize();
    this.node.setContentSize(size);
    // this._panelBase.setSwallowTouches(false);
    // this._imageChallenge.setSwallowTouches(false);
    var res = ChallengeRes[this._functionId];
  //assert((res, 'no function id, ' + this._functionId);
    var icon = Path.getChallengeIcon(res.icon);
    var iconMask = Path.getChallengeIcon(res.iconMask);
    var imgName = Path.getChallengeText(res.imgName);
    this._imageChallenge.node.addComponent(CommonUI).loadTexture(icon);
    this._textDesc.string = (res.text);
    this._textDesc.node.color = (res.textColor);
    // this._imageName.ignoreContentAdaptWithSize(true);
    this._imageName.node.addComponent(CommonUI).loadTexture(imgName);
    if (G_UserData.getBase().getLevel() < this._functionInfo.level) {
        this._imageCover.node.active = (true);
        this._open = false;
        this._imageCover.node.addComponent(CommonUI).loadTexture(iconMask);
        this._textTip.string = (Lang.get('challenge_open', { count: this._functionInfo.level }));
    } else {
        this._imageCover.node.active = (false);
        this._open = true;
    }
    this._imageChallenge.node.on(cc.Node.EventType.TOUCH_END,this._onChallengeClick,this)
    this.refreshRedPoint();
}
_onChallengeClick(sender:cc.Touch) {
    var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
    var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
    if (offsetX < 20 && offsetY < 20) {
        this.goToScene();
    }
}
goToScene() {
    if (!this._open) {
        G_Prompt.showTip(this._functionInfo.comment);
    } else {
        if (this._functionId == FunctionConst.FUNC_PVE_TOWER) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_PVE_TOWER, { attackOnce: true });
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_PVE_TOWER, { fullCount: true });
        }
        WayFuncDataHelper.gotoModuleByFuncId(this._functionId);
    }
}
showRedPoint(value) {
    if (value == null) {
        value = false;
    }
    this._imageRedPoint.node.active = (value);
}
refreshRedPoint() {
    var redPoint = RedPointHelper.isModuleReach(this._functionId);
    this.showRedPoint(redPoint);
}


}