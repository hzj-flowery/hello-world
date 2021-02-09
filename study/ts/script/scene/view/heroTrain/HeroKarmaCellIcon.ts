import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { Lang } from "../../../lang/Lang";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import PopupItemGuider from "../../../ui/PopupItemGuider";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HeroKarmaCellIcon extends cc.Component {
    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeIcon: CommonHeroIcon= null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label= null;

    private _heroBaseId:number;
    private _isDark:boolean;
    onLoad():void{
        
    }

    start():void{
        this._init();
    }

    private _init() {
        this._fileNodeIcon.setCallBack(handler(this, this._onClickIcon));
        this._fileNodeIcon.setTouchEnabled(true);
    }

    updateIcon(heroBaseId, isDark):void {
        this._heroBaseId = heroBaseId;
        this._isDark = isDark;
        this._fileNodeIcon.updateUI(heroBaseId);
        this._fileNodeIcon.setIconMask(isDark);
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
        this._textName.string = (heroParam.name);
        this._textName.node.color = (heroParam.icon_color);
        UIHelper.updateTextOutline(this._textName, heroParam);
    }
    _onClickIcon() {
        var itemParam = this._fileNodeIcon.getItemParams();
        UIPopupHelper.popupItemGuider(function(popupItemGuider:PopupItemGuider){
            popupItemGuider.updateUI(TypeConvertHelper.TYPE_HERO, itemParam.cfg.id);
            popupItemGuider.setTitle(Lang.get('way_type_get'));
        }.bind(this))
    }
}