const {ccclass, property} = cc._decorator;


var COLOR2RES = {
    [3]: 'img_transform_frame_03',
    [4]: 'img_transform_frame_04',
    [5]: 'img_transform_frame_05',
    [6]: 'img_transform_frame_06',
    [7]: 'img_transform_frame_07'
};
var COVER_RES = {
    [3]: 'img_transform_03',
    [4]: 'img_transform_04',
    [5]: 'img_transform_05',
    [6]: 'img_transform_06',
    [7]: 'img_transform_07'
};

import CommonAvatarIcon from '../../../ui/component/CommonAvatarIcon'
import { G_UserData, Colors } from '../../../init';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import ViewBase from '../../ViewBase';
import CommonUI from '../../../ui/component/CommonUI';
import { Path } from '../../../utils/Path';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';

@ccclass
export default class AvatarIcon extends ViewBase {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBg: cc.Sprite = null;

   @property({
       type: CommonAvatarIcon,
       visible: true
   })
   _fileNodeCommon: CommonAvatarIcon = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageSelected: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageCover: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageTop: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageRP: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch: cc.Node = null;
   
   private _index:number;
   private _callback:any;

   setInitData(index, callback) {
    this._index = index;
    this._callback = callback;
    // var resource = {
    //     file: Path.getCSB('AvatarIcon', 'avatar'),
    //     binding: {
    //         _panelTouch: {
    //             events: [{
    //                     event: 'touch',
    //                     method: '_onPanelTouch'
    //                 }]
    //         }
    //     }
    // };
}
onCreate() {
    this.node.setContentSize(this._panelTouch.getContentSize());
    this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onPanelTouch,this);
}
onEnter() {
    this._initUI();
}
onExit() {
    // this._panelTouch.off(cc.Node.EventType.TOUCH_END,this._onPanelTouch,this);
}
_initUI() {
    this._fileNodeCommon.node.active = (false);
    this._fileNodeCommon.setTouchEnabled(false);
    this._imageSelected.node.active = (false);
    this._imageTop.node.active = (false);
    this._textName.node.active = (false);
    this._imageRP.node.active = (false);
}
updateUI(baseId) {
    this._initUI();
    if (baseId == 0) {
        this._updateMe();
    } else {
        this._updateCommon(baseId);
    }
}
_updateMe() {
    this._fileNodeCommon.node.active = (true);
    var baseId = G_UserData.getHero().getRoleBaseId();
    this._fileNodeCommon.setType(TypeConvertHelper.TYPE_HERO);
    this._fileNodeCommon.updateUI(baseId);
    var officialInfo:any = G_UserData.getBase().getOfficialInfo()[0];
    var color = officialInfo.color;
    var bgResName = COLOR2RES[color];
    if (bgResName) {
        this._imageBg.node.addComponent(CommonUI).loadTexture(Path.getUICommonFrame(bgResName));
    }
    var coverRes = COVER_RES[color];
    if (coverRes) {
        this._imageCover.node.addComponent(CommonUI).loadTexture(Path.getUICommonFrame(coverRes));
    }
    this._textName.node.active = (true);
    this._textName.string = (G_UserData.getBase().getName());
    this._textName.node.color = (Colors.getColor(color));
    var isEquip = G_UserData.getBase().isEquipAvatar();
    this._imageTop.node.active = (!isEquip);
}
_updateCommon(baseId) {
    var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_AVATAR, baseId);
    this._fileNodeCommon.node.active = (true);
    this._fileNodeCommon.setType(TypeConvertHelper.TYPE_AVATAR);
    this._fileNodeCommon.updateUI(baseId);
    var bgResName = COLOR2RES[param.color];
    if (bgResName) {
        this._imageBg.node.addComponent(CommonUI).loadTexture(Path.getUICommonFrame(bgResName));
    }
    var coverRes = COVER_RES[param.color];
    if (coverRes) {
        this._imageCover.node.addComponent(CommonUI).loadTexture(Path.getUICommonFrame(coverRes));
    }
    this._textName.node.active = (true);
    var str = (param.list_name as string).split(" ");
    var des1:string = "";
    var des2:string = "";
    for(var j =0;j<str.length;j++)
    {
        if(str[j]!=""&&des1=="")
        {
            des1 = str[j];
        }
        else if(str[j]!=""&&des1!="")
        {
           des2 = str[j];
        }
    }
    if(des1.length==2)
    {
        des1 = des1[0]+" "+ des1[1];
    }
    else if(des1.length==1)
    {
        des1 = " " + des1[0] + " ";
    }
    this._textName.string = des1+des2;
    des1 = null;
    des2 = null;
    this._textName.node.color = (param.icon_color);
    var unitData = G_UserData.getAvatar().getUnitDataWithBaseId(baseId);
    if (unitData) {
        this._fileNodeCommon.setIconMask(false);
        this._imageTop.node.active = (unitData.isEquiped());
        var redValue = AvatarDataHelper.isBetterThanCurEquiped(unitData);
        this._imageRP.node.active = (redValue);
    } else {
        this._fileNodeCommon.setIconMask(true);
    }
}
_onPanelTouch(sender:cc.Touch, state) {
    var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
    var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
    if (offsetX < 20 && offsetY < 20) {
        if (this._callback) {
            this._callback(this._index);
        }
    }
}
setSelected(selected) {
    this._imageSelected.node.active = (selected);
}

}