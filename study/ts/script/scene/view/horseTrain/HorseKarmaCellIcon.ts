import CommonHorseIcon from "../../../ui/component/CommonHorseIcon";
import { handler } from "../../../utils/handler";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { G_SceneManager } from "../../../init";
import { Path } from "../../../utils/Path";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { Lang } from "../../../lang/Lang";
import PopupHorseDetail from "../horseDetail/PopupHorseDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HorseKarmaCellIcon extends cc.Component {

    @property({ type: CommonHorseIcon, visible: true })
    _fileNodeIcon: CommonHorseIcon = null;
    @property({ type: cc.Label, visible: true })
    _textName: cc.Label = null;

    private _heroBaseId;
    private _isDark;
    init() {
        this._fileNodeIcon.onLoad();
        this._fileNodeIcon.setCallBack(handler(this, this._onClickIcon));
        this._fileNodeIcon.setTouchEnabled(true);
    }

    public updateIcon(heroBaseId, isDark) {
        this._heroBaseId = heroBaseId;
        this._isDark = isDark;
        this._fileNodeIcon.updateUI(heroBaseId);
        this._fileNodeIcon.setIconMask(isDark);
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE, heroBaseId);
        this._textName.string = (heroParam.name);
        this._textName.node.color = (heroParam.icon_color);
    }

    private _onClickIcon() {
        var itemParam = this._fileNodeIcon.getItemParams();
        G_SceneManager.openPopup(Path.getPrefab("PopupHorseDetail","horse"),(popup:PopupHorseDetail)=>{
            popup.ctor(TypeConvertHelper.TYPE_HORSE, itemParam.cfg.id);
            popup.openWithAction();
        });
        // G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemGuider"),(popupItemGuider:PopupItemGuider)=>{
        //     popupItemGuider.setTitle(Lang.get('way_type_get'));
        //     popupItemGuider.updateUI(TypeConvertHelper.TYPE_HORSE, itemParam.cfg.id);
        //     popupItemGuider.openWithAction();
        // })
    }
}