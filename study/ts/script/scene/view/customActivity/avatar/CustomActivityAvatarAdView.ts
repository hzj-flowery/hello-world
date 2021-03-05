const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../../ui/component/CommonButtonLevel0Highlight'
import ViewBase from '../../../ViewBase';
import { Lang } from '../../../../lang/Lang';
import { G_UserData, G_ConfigLoader, G_ServerTime } from '../../../../init';
import { ConfigNameConst } from '../../../../const/ConfigNameConst';
import { CustomActivityAvatarHelper } from './CustomActivityAvatarHelper';
import { TypeConvertHelper } from '../../../../utils/TypeConvertHelper';
import CommonUI from '../../../../ui/component/CommonUI';
import { Path } from '../../../../utils/Path';
import UIActionHelper from '../../../../utils/UIActionHelper';
import { DataConst } from '../../../../const/DataConst';
import { CustomActivityUIHelper } from '../CustomActivityUIHelper';
import { handler } from '../../../../utils/handler';

var IMAGE = {
    [1]: {
        ['bgName']: 'img_activity_bg04',
        ['timeBgName']: 'img_activity_changecard0',
        ['dayName']: 'img_activity_changecard'
    },
    [2]: {
        ['bgName']: 'img_activity_bg07',
        ['timeBgName']: 'img_activity_hong0',
        ['dayName']: 'img_activity_hong'
    }
};

@ccclass
export default class CustomActivityAvatarAdView extends ViewBase {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBg: cc.Sprite = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _buttonGoto: CommonButtonLevel0Highlight = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCostIcon: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTime: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTime: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textResCost: cc.Label = null;
   
   private _parentView:any;

   setInitData(parentView) {
    this._parentView = parentView;
}
onCreate() {
    this._buttonGoto.setString(Lang.get('common_btn_goto_activity'));
    this._buttonGoto.addClickEventListenerEx(handler(this,this._onButtonGoto));
    var cosRes = CustomActivityAvatarHelper.getCosRes();
    var itemParams = TypeConvertHelper.convert(cosRes.type, cosRes.value, cosRes.size);
    if (itemParams.res_mini) {
        this._imageCostIcon.node.addComponent(CommonUI).loadTexture(itemParams.res_mini);
    }
    this.enterModule();
}
_updateDayNum() {
    var actUnitdata = G_UserData.getCustomActivity().getAvatarActivity();
    if (actUnitdata) {
        var batch = actUnitdata.getBatch();
        
        var bgIndex = G_ConfigLoader.getConfig(ConfigNameConst.AVATAR_ACTIVITY).get(batch).Background;
        var endTime = actUnitdata.getEnd_time();
        var leftTime = endTime - G_ServerTime.getTime();
        var [day, hour, min, second] = G_ServerTime.convertSecondToDayHourMinSecond(leftTime);
        var imageInfo = IMAGE[bgIndex];
        if (imageInfo) {
            this._imageBg.node.addComponent(CommonUI).loadTexture(Path.getCustomActivityUIBg(imageInfo.bgName));
        }
        if (day >= 1 && day <= 3) {
            if (imageInfo) {
                this._imageTime.node.addComponent(CommonUI).loadTexture(Path.getCustomActivityUI(imageInfo.dayName + day));
            }
            this._textTime.node.active = (false);
        } else {
            if (imageInfo) {
                this._imageTime.node.addComponent(CommonUI).loadTexture(Path.getCustomActivityUI(imageInfo.timeBgName));
            }
            this._textTime.node.active = (true);
            this._textTime.node.stopAllActions();
            var timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitdata.getEnd_time());
            this._textTime.string = (timeStr);
            var action = UIActionHelper.createUpdateAction(function () {
                var timeStr1 = CustomActivityUIHelper.getLeftDHMSFormat(actUnitdata.getEnd_time());
                this._textTime.string = (timeStr1);
            }.bind(this),0.5);
            this._textTime.node.runAction(action);
        }
    }
}
enterModule() {
    this._textResCost.string = (cc.js.formatStr('x%s', G_UserData.getItems().getItemNum(DataConst.ITEM_AVATAR_ACTIVITY_TOKEN)));
    this._updateDayNum();
}
onEnter() {
}
onExit() {
}
_onButtonGoto() {
    this._parentView.jumpToAvatarActivity();
}


}