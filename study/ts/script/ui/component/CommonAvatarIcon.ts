import { Colors, G_SceneManager } from "../../init";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { UIPopupHelper } from "../../utils/UIPopupHelper";
import CommonIconBase from "./CommonIconBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonAvatarIcon extends CommonIconBase {

    private _avatarId:number;
    private _textLevel:cc.Label;
    private _imageLevel:cc.Sprite;

    constructor(){
        super();
        this._type = TypeConvertHelper.TYPE_AVATAR;
    }

    updateUI(value, size?) {
        var itemParams = super.updateUI(value, size);
        if (itemParams && itemParams.size != null) {
            this.setCount(itemParams.size);
        }
    }
    setType(type) {
        this._type = type;
    }
    setId(avatarId) {
        this._avatarId = avatarId;
    }
    setLevel(level) {
        if (this._textLevel == null) {
            var params = {
                name: '_textLevel',
                text: '0',
                fontSize: 20,
                color: Colors.COLOR_QUALITY[1],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[1]
            };
            var label = UIHelper.createLabel(params);
            label.setAnchorPoint(cc.v2(0.5, 0.5));
            label.setPosition(cc.v2(21, 10));
            this._textLevel = label.getComponent(cc.Label);
        }
        var equipParam = this.getItemParams();
        if (this._imageLevel == null) {
            var params1 = {
                name: '_imageLevel',
                texture: Path.getUICommonFrame('img_iconsmithingbg_0' + equipParam.color)
            };
            var imageBg = UIHelper.createImage(params1);
            imageBg.addChild(this._textLevel.node);
            imageBg.setAnchorPoint(cc.v2(0, 1));
            imageBg.setPosition(cc.v2(3, 95));
            this._imageLevel = imageBg.getComponent(cc.Sprite);
            this.appendUI(imageBg);
        }
        this._textLevel.string = (level);
        UIHelper.loadTexture(this._imageLevel, Path.getUICommonFrame('img_iconsmithingbg_0' + equipParam.color));
        this._imageLevel.node.active = (level > 0);
    }
    _onTouchCallBack(event, customEventData) {
        var sender:cc.Node = event.target;
        if (this._callback) {
            this._callback(sender, this._itemParams);
            return;
        }
        if (this._avatarId) {
            G_SceneManager.showScene('avatar', this._avatarId);
        } else {
            var id = this._itemParams.cfg.id;
            UIPopupHelper.popupAvatarDetail(TypeConvertHelper.TYPE_AVATAR, id)
        }
    }  

}
