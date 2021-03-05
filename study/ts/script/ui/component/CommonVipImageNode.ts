import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonVipImageNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_num: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_vip: cc.Sprite = null;

    public setVip(vip) {
        var num = parseInt(vip);
        UIHelper.loadTexture(this._image_num, Path.getVipNum(num));
    }

    public loadVipImg(path) {
        UIHelper.loadTexture(this._image_num, path);
    }
}