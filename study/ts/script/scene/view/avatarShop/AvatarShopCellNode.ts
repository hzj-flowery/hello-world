import CommonStoryAvatar from "../../../ui/component/CommonStoryAvatar";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import { handler } from "../../../utils/handler";
import { G_UserData } from "../../../init";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { AvatarConst } from "../../../const/AvatarConst";
import { HeroConst } from "../../../const/HeroConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { ShopActiveDataHelper } from "../../../utils/data/ShopActiveDataHelper";
import { Lang } from "../../../lang/Lang";
import CommonUI from "../../../ui/component/CommonUI";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AvatarShopCellNode extends cc.Component {


    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: CommonStoryAvatar,
        visible: true
    })
    _fileNodeDraw: CommonStoryAvatar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNew: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resource1: CommonResourceInfo = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resource2: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonBuy: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;
    

    private _callback:any;
    private _index:number;
    private _avatarId:number;

    setInitData(callback, index) {
        this._callback = callback;
        this._index = index;
        this._avatarId = 0;
    }
    onEnable() {
        this._resource1.setImageResScale(0.8);
        this._resource2.setImageResScale(0.8);
        this._buttonBuy.addClickEventListenerEx(handler(this, this._onButtonBuyClicked));
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onPanelTouch,this);
    }
    updateUI(goodId) {
        var data = G_UserData.getShopActive().getUnitDataWithId(goodId);
        var info = data.getConfig();
        var avatarId = info.value;
        this._avatarId = avatarId;
        var avatarInfo = AvatarDataHelper.getAvatarConfig(avatarId);
        var avatarColor = avatarInfo.color;
        var resBg = AvatarConst.color2ImageBg[avatarColor];
        var heroId = avatarInfo.hero_id;
        var limitLevel = 0;
        if (avatarInfo.limit == 1) {
            limitLevel = HeroConst.HERO_LIMIT_MAX_LEVEL;
        }
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, null, null, limitLevel);
        var actUnitData = G_UserData.getCustomActivity().getAvatarActivity();
        var curBatch = actUnitData.getBatch();
        var isNew = data.isNew(curBatch);
        var costInfo = ShopActiveDataHelper.getCostInfo(goodId);
        var isBought = data.isBought() || G_UserData.getAvatar().isHaveWithBaseId(avatarId);
        var strButton = isBought && Lang.get('shop_btn_buyed') || Lang.get('shop_btn_buy');
        if (resBg) {
            this._imageBg.node.addComponent(CommonUI).loadTexture(Path.getTurnscard(resBg, '.jpg'));
        }
        this._fileNodeDraw.updateUI(heroId, limitLevel);
        this._textHeroName.string = (heroParam.name);
        this._textHeroName.node.color = (heroParam.icon_color);
        UIHelper.enableOutline(this._textHeroName,heroParam.icon_color_outline, 2)
        this._imageNew.node.active = (isNew);
        for (var i = 1; i <= 2; i++) {
            var cost = costInfo[i-1];
            if (cost) {
                (this['_resource' + i] as CommonResourceInfo).setVisible(true);
                (this['_resource' + i] as CommonResourceInfo).updateUI(cost.type, cost.value, cost.size);
                (this['_resource' + i] as CommonResourceInfo).setTextColorToDTypeColor();
            } else {
                (this['_resource' + i] as CommonResourceInfo).setVisible(false);
            }
        }
        this._buttonBuy.setString(strButton);
        this._buttonBuy.setEnabled(!isBought);
    }
    _onButtonBuyClicked() {
        if (this._callback) {
            this._callback(this._index);
        }
    }
    _onPanelTouch(sender:cc.Touch, state) {
        var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (offsetX < 20 && offsetY < 20) {
            UIPopupHelper.popupAvatarDetail(TypeConvertHelper.TYPE_AVATAR, this._avatarId)
        }
    }


}