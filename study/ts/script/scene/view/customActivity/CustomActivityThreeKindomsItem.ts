const {ccclass, property} = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import ViewBase from '../../ViewBase';
import EffectGfxNode from '../../../effect/EffectGfxNode';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import { Lang } from '../../../lang/Lang';
import { CustomActivityConst } from '../../../const/CustomActivityConst';

@ccclass
export default class CustomActivityThreeKindomsItem extends ViewBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _resource: cc.Node = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _fileNodeIcon: CommonIconTemplate = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textDesc: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch: cc.Node = null;
   
   private _touchCallback:any;

   setInitData(touchCallback) {
    this._touchCallback = touchCallback;
}
onCreate() {
    var size = this._resource.getContentSize();
    this.node.setContentSize(size.width, size.height);
}
onEnter() {
}
onExit() {
}
_createEffect(index, data) {
    var selectedFlash = this._nodeEffect.getChildByName('flash_effect' + index);
    if (selectedFlash == null) {
        var lightEffect = new EffectGfxNode().setEffectName(SeasonSportConst.SEASON_PET_SELECTEDEFFECT[1]);
        lightEffect.node.setAnchorPoint(0, 0);
        lightEffect.play();
        lightEffect.node.setScale(1.1);
        lightEffect.node.active = (data.taskStatus == 1);
        lightEffect.name  = ('flash_effect' + index);
        this._nodeEffect.addChild(lightEffect.node);
        lightEffect.node.setPosition(this._nodeEffect.getContentSize().width * 0.5, this._nodeEffect.getContentSize().height * 0.5 + 1);
    } else {
        selectedFlash.active = (data.taskStatus == 1);
    }
}
_createDesc(color, data) {
    var strDesc = Lang.getTxt(data.mission_description, { num:parseInt(data.value) });
    var descStr = '';
    var iconColor = null;
    if (data.taskStatus == 1) {
        descStr = Lang.get('activity_linkage_notreceive');
        iconColor = CustomActivityConst.RECEIVED_OR_NOT[1];
    } else if (data.taskStatus == 2) {
        descStr = Lang.get('activity_linkage_received');
        iconColor = CustomActivityConst.RECEIVED_OR_NOT[0];
    } else {
        descStr = strDesc;
        iconColor = color;
    }
    return [
        iconColor,
        descStr
    ];
}
_onPanelTouch(sender:cc.Touch, state) {
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            // var idx = sender.getTag();
            // if (sender.isEnabled()) {
            //     if (this._touchCallback) {
            //         this._touchCallback(idx);
            //     }
            // }
        }
}
updateUI(index, data) {
    this._createEffect(index, data);
    this._fileNodeIcon.unInitUI();
    this._fileNodeIcon.initUI(data.reward_type, data.reward_value, data.reward_size);
    this._fileNodeIcon.setTouchEnabled(data.taskStatus != 1);
    this._fileNodeIcon.setIconMask(data.taskStatus == 2);
    var [iconColor, strName] = this._createDesc(this._fileNodeIcon.getItemParams().icon_color, data);
    this._textDesc.node.color = (iconColor);
    this._textDesc.string = (strName);
    // this._panelTouch.setTag(index);
    this._panelTouch.active = (data.taskStatus == 1);
    // this._panelTouch.setEnabled(data.taskStatus == 1);
    // this._panelTouch.setSwallowTouches(false);
    // this._panelTouch.setTouchEnabled(true);
    this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onPanelTouch,this);
}


}