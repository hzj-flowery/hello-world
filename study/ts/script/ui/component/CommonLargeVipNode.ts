import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonLargeVipNode extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_vip: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _image_num: cc.Sprite = null;

    setVip(vip){
        var num = parseInt(vip);
        UIHelper.loadTexture(this._image_num, Path.getVipNum(num));
    }
    loadVipImg(path) {
        UIHelper.loadTexture(this._image_num, path);
    }
}
