import { HistoryHeroWeaponUnit } from "../../../data/HistoryHeroWeaponUnit";
import { G_UserData, Colors, G_SceneManager, G_ConfigLoader } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel1Normal from "../../../ui/component/CommonButtonLevel1Normal";
import CommonHeroCountryFlag from "../../../ui/component/CommonHeroCountryFlag";
import CommonHistoryWeaponAvatar from "../../../ui/component/CommonHistoryWeaponAvatar";
import CommonHistoryWeaponProperty from "../../../ui/component/CommonHistoryWeaponProperty";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import CommonPageItem from "../../../ui/component/CommonPageItem";
import CommonPetProperty from "../../../ui/component/CommonPetProperty";
import PopupBase from "../../../ui/PopupBase";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class PopupHistoryHeroWeaponDetail extends PopupBase {
    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonBg: CommonNormalLargePop = null;

    @property({
        type: CommonHeroCountryFlag,
        visible: true
    })
    _fileNodeCountryFlag: CommonHeroCountryFlag = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _heroStage: cc.Sprite = null;

    @property({
        type: CommonPageItem,
        visible: true
    })
    _scrollPage: CommonPageItem = null;

    @property({
        type: CommonHistoryWeaponProperty,
        visible: true
    })
    _detailWindow: CommonHistoryWeaponProperty = null;
    @property({
        type: CommonHistoryWeaponAvatar,
        visible: true
    })
    avatar: CommonHistoryWeaponAvatar = null;

    @property({
        type: CommonButtonLevel1Normal,
        visible: true
    })
    _btnWayGet: CommonButtonLevel1Normal = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _hasText: cc.Label = null;
    _weaponId: any;
    _isShowDrawing: boolean;
    _avatarPageItems: any;
    _curSelectedPos: number;

    ctor(weaponId) {
        this._weaponId = weaponId;
    }
    onCreate() {
        this._commonBg.addCloseEventListener(handler(this, this._onBtnClose));
        this._commonBg.setTitle(Lang.get('historyhero_book_title_weapon'));
        this._btnWayGet.setString(Lang.get('way_type_goto_get'));
        this._isShowDrawing = false;
        this._avatarPageItems = null;
        this._curSelectedPos = 1;
        this._btnWayGet.addClickEventListenerEx(handler(this, this._onBtnWayGetClicked));
    }
    onEnter() {
        this._updateWeaponItem();
    }
    onExit() {
    }
    _updateWeaponInfo(weaponData) {
        this._detailWindow.updateUI(weaponData);
        var haveHero = G_UserData.getHistoryHero().haveWeapon(this._weaponId);
        var color = haveHero && Colors.DARK_BG_THREE || Colors.BRIGHT_BG_RED;
        this._hasText.node.color = (color);
        this._hasText.string = (haveHero && Lang.get('common_have') || Lang.get('common_not_have'));
    }
    _updateDetailLayer() {
    }
    _onBtnClose() {
        this.close();
    }
    _onBtnWayGetClicked() {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemGuider"), (popup: PopupItemGuider) => {
            popup.setTitle(Lang.get('way_type_get'));
            popup.updateUI(TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON, this._weaponId);
            popup.openWithAction();
        })
    }
    _updateWeaponItem() {
        this.avatar.updateUI(this._weaponId);
        this.avatar.showShadow(false);
        var config = G_ConfigLoader.getConfig('historical_hero_equipment').get(this._weaponId);
        var unit = new HistoryHeroWeaponUnit();
        unit.setId(this._weaponId);
        unit.setNum(1);
        unit.setConfig(config);
        this._updateWeaponInfo(unit);
    }
    _isHaveStory(heroBaseId) {
        var info = HeroDataHelper.getHeroConfig(heroBaseId);
        var resId = info.res_id;
        var resData = HeroDataHelper.getHeroResConfig(resId);
        var isHaveSpine = resData.story_res_spine != 0;
        var isHaveRes = resData.story_res != 0 && resData.story_res != 777;
        return isHaveSpine || isHaveRes;
    }
}