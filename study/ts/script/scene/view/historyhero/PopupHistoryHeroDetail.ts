import { G_UserData, Colors, G_SceneManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel1Normal from "../../../ui/component/CommonButtonLevel1Normal";
import CommonHeroCountryFlag from "../../../ui/component/CommonHeroCountryFlag";
import CommonHistoryAvatar from "../../../ui/component/CommonHistoryAvatar";
import CommonHistoryWeaponAvatar from "../../../ui/component/CommonHistoryWeaponAvatar";
import CommonHistoryWeaponProperty from "../../../ui/component/CommonHistoryWeaponProperty";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import CommonPageItem from "../../../ui/component/CommonPageItem";
import PopupBase from "../../../ui/PopupBase";
import PopupItemGuider from "../../../ui/PopupItemGuider";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import HistoryHeroAttrLayer from "./HistoryHeroAttrLayer";

const { ccclass, property } = cc._decorator;


@ccclass
export default class PopupHistoryHeroDetail extends PopupBase {
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
        type: HistoryHeroAttrLayer,
        visible: true
    })
    historicalDetailView: HistoryHeroAttrLayer = null;
    @property({
        type: CommonHistoryAvatar,
        visible: true
    })
    avatar: CommonHistoryAvatar = null;

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
    _type: any;
    _uniqueId: any;
    _heroList: any[];
    _isPage: any;
    _limitLevel: any;
    _value: any;
    _isShowDrawing: boolean;
    _avatarPageItems: any;
    _storyPageItems: any;
    _curSelectedPos: number;
    _nodeLayer: any;
    _heroBaseId: any;
    _textHeroName: any;
    _scrollPageStory: any;

    ctor(type, uniqueId, heroList, isPage, limitLevel, value) {
        this._type = type;
        this._uniqueId = uniqueId;
        this._heroList = heroList;
        this._isPage = isPage;
        this._limitLevel = limitLevel;
        this._value = value;
    }
    onCreate() {
        this._commonBg.addCloseEventListener(handler(this, this._onBtnClose));
        this._commonBg.setTitle(Lang.get('historyhero_book_title'));
        this._btnWayGet.setString(Lang.get('way_type_goto_get'));
        this._isShowDrawing = false;
        this._avatarPageItems = null;
        this._storyPageItems = null;
        this._curSelectedPos = 1;
        this._btnWayGet.addClickEventListenerEx(handler(this, this._onBtnWayGetClicked));
    }
    onEnter() {
       // this._updateHeroInfo(this._value, 1);
       this._updateHeroItem();
    }
    onExit() {
    }
    _updateHeroInfo(heroBaseId, limitLevel, limitRedLevel?) {
        this._heroBaseId = heroBaseId;
        var haveHero = G_UserData.getHistoryHero().isHaveHero(heroBaseId);
        var color = haveHero && Colors.DARK_BG_THREE || Colors.BRIGHT_BG_RED;
        this._hasText.node.color = (color);
        this._hasText.string = (haveHero && Lang.get('common_have') || Lang.get('common_not_have'));
        this.historicalDetailView.setName(heroBaseId);
        this._updateHeroState(heroBaseId);
        if (this._uniqueId == null) {
            this['historicalDetailView'].updateUIForNoraml(this._value);
        } else {
            var heroData = G_UserData.getHistoryHero().getHisoricalHeroValueById(this._uniqueId);
            this['historicalDetailView'].updateUI(heroData);
        }
    }
    _updateDetailLayer() {
    }
    _updateHeroState(heroBaseId) {
        var isHave = this._isHaveStory(heroBaseId);
        var show = this._isShowDrawing && isHave;
        this._updateDrawing(show);
    }
    _onBtnClose() {
        this.close();
    }
    _onBtnWayGetClicked() {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemGuider"), (popup: PopupItemGuider) => {
            popup.setTitle(Lang.get('way_type_get'));
            popup.updateUI(this._type, this._value);
            popup.openWithAction();
        })
    }
    _showDrawing(show) {
        this._isShowDrawing = show;
        this._updateDrawing(show);
    }
    _updateDrawing(show) {
        this._heroStage.node.active = (!show);
    }
    _updateHeroItem() {
        var data = this._heroList[0];
        if (data == null) {
            return;
        }
        var heroBaseId = data.cfg.id;
        var limitLevel = data.limitLevel;
        var limitRedLevel = data.limitRedLevel;
        this.avatar.updateUI(heroBaseId, null, null, limitLevel);
        this._updateDetailLayer();
        this._updateHeroInfo(heroBaseId, limitLevel, limitRedLevel);
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