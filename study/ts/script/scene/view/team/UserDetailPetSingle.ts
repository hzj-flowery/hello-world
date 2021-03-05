import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import ViewBase from "../../ViewBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { Path } from "../../../utils/Path";
import CommonUI from "../../../ui/component/CommonUI";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UserDetailPetSingle extends ViewBase {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageStar1: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageStar2: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageStar3: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageStar4: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageStar5: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textLevel: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName: cc.Label = null;

   @property({
       type: CommonHeroAvatar,
       visible: true
   })
   _nodePet: CommonHeroAvatar = null;
   
   private _petUnitData:any;

   setInitData(petUnitData) {
    this._petUnitData = petUnitData;
    this._nodePet.init();
    this._updateView();
}
onCreate() {
    
}
onEnter() {
}
onExit() {
}
_updateView() {
    var baseId = this._petUnitData.getBase_id();
    var star = this._petUnitData.getStar();
    var level = this._petUnitData.getLevel();
    var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, baseId);
    for (var i = 1;i<=5;i++) {
        if (i <= star) {
            (this['_imageStar' + i] as cc.Sprite).addComponent(CommonUI).loadTexture(Path.getUICommon('img_lit_stars02'));
        } else {
            (this['_imageStar' + i] as cc.Sprite).addComponent(CommonUI).loadTexture(Path.getUICommon('img_lit_stars02c'));
        }
    }
    this._textLevel.string = (Lang.get('pet_txt_level', { level: level }));
    this._textName.string = (param.name);
    this._textName.node.color = (param.icon_color);
    UIHelper.enableOutline(this._textName,param.icon_color_outline)
    this._nodePet.setConvertType(TypeConvertHelper.TYPE_PET);
    this._nodePet.updateUI(baseId);
}
setAvatarScale(scale) {
    this._nodePet.setScale(scale);
}


}