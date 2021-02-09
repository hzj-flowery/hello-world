import { HeroUnitData } from "../../../data/HeroUnitData";
import { Colors, G_Prompt, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import PopupChooseHeroHelper from "../../../ui/popup/PopupChooseHeroHelper";
import { unpack } from "../../../utils/GlobleFunc";
import { handler } from "../../../utils/handler";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIActionHelper from "../../../utils/UIActionHelper";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TeamPartnerIcon extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _spriteAdd: cc.Sprite = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _fileNodeHero: CommonHeroIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPoint: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    

    private _index:number;
    private _lock:boolean;
    private _heroData:HeroUnitData;
    private _level:number;
    private _comment:any;
    setInitData(index) {
        this._index = index;
        this._init();
    }
    _init() {
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,handler(this, this._onPanelTouch));
    }

    onDestroy():void{
        this._panelTouch.off(cc.Node.EventType.TOUCH_END,handler(this, this._onPanelTouch));
    }
    updateView(info) {
        this._lock = info.lock;
        this._heroData = info.heroData;
        this._level = info.level;
        this._comment = info.comment;
        this._imageLock.node.active = (false);
        this._spriteAdd.node.active = (false);
        this._fileNodeHero.node.active = (false);
        this._textName.node.active = (false);
        this._imageRedPoint.node.active = (false);
        if (!this._lock) {
            if (this._heroData) {
                this._fileNodeHero.node.active = (true);
                this._textName.node.active = (true);
                var baseId = this._heroData.getBase_id();
                var limitLevel = this._heroData.getLimit_level();
                var limitRedLevel = this._heroData.getLimit_rtg()
                var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
                this._fileNodeHero.updateUI(baseId, null, limitLevel, limitRedLevel);
                this._textName.string = (heroParam.name);
                this._textName.node.color = (heroParam.icon_color);
                UIHelper.enableOutline(this._textName,heroParam.icon_color_outline);
            } else {
                this._spriteAdd.node.active = (true);
                UIActionHelper.playBlinkEffect(this._spriteAdd.node);
            }
        } else {
            this._imageLock.node.active = (true);
            this._textName.node.active = (true);
            this._textName.string = (Lang.get('hero_yoke_unlock', { level: this._level }));
            this._textName.node.color = (Colors.uiColors.BEIGE);
        }
    }
    _onPanelTouch() {
        if (!this._lock) {
            var fromType = PopupChooseHeroHelper.FROM_TYPE3;
            if (this._heroData) {
                fromType = PopupChooseHeroHelper.FROM_TYPE4;
            }
            var isEmpty = PopupChooseHeroHelper.checkIsEmpty(fromType, [this._index]);
            if (isEmpty) {
                G_Prompt.showTip(Lang.get('hero_popup_list_empty_tip' + fromType));
            } else {
                UIPopupHelper.popupChooseHero(fromType,handler(this, this._changePartnerCallBack),this._index,Lang.get("hero_yoke_choose_hero"));
            }
        } else {
            G_Prompt.showTip(this._comment);
        }
    }
    _changePartnerCallBack(heroId, param) {
        var pos = unpack(param)[0];
        if (this._heroData && heroId == this._heroData.getId()) {
            G_UserData.getTeam().c2sChangeHeroSecondFormaion(pos, null);
        } else {
            G_UserData.getTeam().c2sChangeHeroSecondFormaion(pos, heroId);
        }
    }
    showRedPoint(visible) {
        this._imageRedPoint.node.active = (visible);
    }
    onlyShow(info) {
        var lock = info.lock;
        var heroData = info.heroData;
        this._imageLock.node.active = (false);
        this._spriteAdd.node.active = (false);
        this._fileNodeHero.node.active = (false);
        this._textName.node.active = (false);
        this._imageRedPoint.node.active = (false);
        //this._panelTouch.setEnabled(false);
        if (!lock) {
            if (heroData) {
                this._fileNodeHero.node.active = (true);
                this._textName.node.active = (true);
                var baseId = heroData.getBase_id();
                var limitLevel = heroData.getLimit_level();
                var limitRedLevel = heroData.getLimit_rtg();
                var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
                this._fileNodeHero.updateUI(baseId, null, limitLevel, limitRedLevel);
                this._textName.string = (heroParam.name);
                this._textName.node.color = (heroParam.icon_color);
                UIHelper.enableOutline(this._textName,heroParam.icon_color_outline);
            } else {
                this._imageLock.node.active = (true);
            }
        } else {
            this._imageLock.node.active = (true);
        }
    }
}