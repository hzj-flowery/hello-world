import { UserDataHelper } from "../../utils/data/UserDataHelper";
import UIHelper from "../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonCheckBoxAnymoreHint extends cc.Component {

   @property({
       type: cc.Label,
       visible: true
   })
   _textNoShow: cc.Label = null;

   @property({
       type: cc.Toggle,
       visible: true
   })
   _checkBox: cc.Toggle = null;

   private _moduleName:string;

   onLoad(){
       UIHelper.addCheckEvent(this.node, this._checkBox, 'CommonCheckBoxAnymoreHint', '_onBtnCheckBox');
   }

    _onBtnCheckBox(sender:cc.Toggle) {
        var isCheck = sender.isChecked;
        //dump(isCheck);
        if (this._moduleName && this._moduleName != '') {
            //dump(this._moduleName);
            UserDataHelper.setPopModuleShow(this._moduleName, isCheck);
        }
    }
    setModuleName(moduleDataName) {
        this._moduleName = moduleDataName;
    }

}
