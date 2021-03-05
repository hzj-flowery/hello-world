const { ccclass, property } = cc._decorator;

import { Colors, G_HeroVoiceManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel1Normal from '../../../ui/component/CommonButtonLevel1Normal';
import CommonButtonSwitchDraw from '../../../ui/component/CommonButtonSwitchDraw';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonHeroCountry from '../../../ui/component/CommonHeroCountry';
import CommonHeroCountryFlag from '../../../ui/component/CommonHeroCountryFlag';
import CommonHeroProperty from '../../../ui/component/CommonHeroProperty';
import CommonPageItem from '../../../ui/component/CommonPageItem';
import CommonPageItemHero from '../../../ui/component/CommonPageItemHero';
import CommonStoryAvatar from '../../../ui/component/CommonStoryAvatar';
import CommonVerticalText from '../../../ui/component/CommonVerticalText';
import PopupBase from '../../../ui/PopupBase';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';








@ccclass
export default class PopupHeroDetail extends PopupBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

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
        type: CommonPageItemHero,
        visible: true
    })
    _scrollPageStory: CommonPageItemHero = null;

    @property({
        type: CommonHeroCountry,
        visible: true
    })
    _fileNodeCountry: CommonHeroCountry = null;

    @property({
        type: CommonHeroProperty,
        visible: true
    })
    _detailWindow: CommonHeroProperty = null;

    @property({
        type: CommonButtonSwitchDraw,
        visible: true
    })
    _buttonSwitch: CommonButtonSwitchDraw = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

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

    @property({
        type: CommonVerticalText,
        visible: true
    })
    _commonVerticalText: CommonVerticalText = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonVoice: cc.Button = null;

    protected preloadResList = [
        { path: Path.getCommonPrefab("CommonHeroAvatar"), type: cc.Prefab },
        { path: Path.getCommonPrefab("CommonStoryAvatar"), type: cc.Prefab },
        { path: Path.getCommonPrefab("CommonDetailTitleWithBg"), type: cc.Prefab },
        { path: Path.getCommonPrefab("CommonButtonLevel2Highlight"), type: cc.Prefab },
        { path: 'prefab/heroDetail/HeroDetailSkillCell', type: cc.Prefab },
        { path: "prefab/heroDetail/HeroDetailAttrModule", type: cc.Prefab },
        { path: "prefab/heroDetail/HeroDetailJointModule", type: cc.Prefab },
        { path: "prefab/heroDetail/HeroDetailSkillModule", type: cc.Prefab },
        { path: "prefab/heroDetail/HeroDetailWeaponModule", type: cc.Prefab },
        { path: 'prefab/heroDetail/HeroDetailTalentModule', type: cc.Prefab },
        { path: 'prefab/heroDetail/HeroDetailKarmaModule', type: cc.Prefab },
        { path: "prefab/heroDetail/HeroDetailYokeModule", type: cc.Prefab },
        { path: "prefab/heroDetail/HeroDetailAwakeModule", type: cc.Prefab },
        { path: "prefab/heroDetail/HeroDetailBriefModule", type: cc.Prefab },
        { path: "prefab/heroDetail/HeroDetailDynamicModule", type: cc.Prefab },
    ];
    _limitRedLevel: any;


    onLoad(): void {
        super.onLoad();
    }

    public setInitData(): void {

    }

    private _isShowDrawing: boolean;
    private _avatarPageItems: Array<cc.Node>;
    private _storyPageItems: Array<cc.Node>;
    private _dataList;
    private _curSelectedPos: number
    private _isPage: boolean;
    private _value: number;
    private _type: number;
    private _limitLevel: number;
    private _heroBaseId: number;
    private _commonHeroAvatar: any;
    private _commonStoryAvatar: any;
    onCreate() {
        this._btnWayGet._text.string = (Lang.get('way_type_goto_get'));
        this._buttonSwitch.setCallback(handler(this, this._showDrawing));
        this._commonHeroAvatar = cc.resources.get(Path.getCommonPrefab("CommonHeroAvatar"));
        this._commonStoryAvatar = cc.resources.get(Path.getCommonPrefab("CommonStoryAvatar"));
        this._isShowDrawing = false;
        this._avatarPageItems = null;
        this._storyPageItems = null;
        this._curSelectedPos = 0;
    }

    initData(type, value, isPage?, limitLevel?, limitRedLevel?) {
        this._type = type
        this._value = value
        this._isPage = isPage
        this._limitLevel = limitLevel;
        this._limitRedLevel = limitRedLevel;
    }
    onEnter() {
        this._buttonSwitch.setState(this._isShowDrawing);
        if (!this._isPage) {
            var dataList = [{
                cfg: { id: this._value },
                limitLevel: this._limitLevel,
                limitRedLevel : this._limitRedLevel
            }];
            this.setPageData(dataList);
        }
        this._buttonVoice.clickEvents = [];
        var clickHandler = new cc.Component.EventHandler();
        clickHandler.component = "PopupHeroDetail";
        clickHandler.target = this.node;
        clickHandler.handler = "_onButtonVoiceClicked";
        this._buttonVoice.clickEvents.push(clickHandler);
    }
    onExit() {
    }
    _updateHeroInfo(heroBaseId, limitLevel, limitRedLevel) {
        this._heroBaseId = heroBaseId;
        this._fileNodeCountry.updateUI(heroBaseId);
        this._fileNodeCountryFlag.updateUI(TypeConvertHelper.TYPE_HERO, heroBaseId, limitLevel, limitRedLevel);
        this._detailWindow.reset();
        this._detailWindow.updateUI(null, heroBaseId, null, limitLevel, limitRedLevel);
        var haveHero = G_UserData.getHandBook().isHeroHave(heroBaseId, limitLevel, limitRedLevel);
        var color = haveHero && Colors.DARK_BG_THREE || Colors.BRIGHT_BG_RED;
        this._hasText.node.color = (color);
        this._hasText.string = (haveHero && Lang.get('common_have') || Lang.get('common_not_have'));
        var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId);
        this._commonVerticalText.setString(heroParam.cfg.feature);
        this._updateHeroState(heroBaseId);
        this._btnWayGet.setEnabled(heroParam.cfg.type != 1);
        this._playCurHeroVoice();
    }
    _updateHeroState(heroBaseId) {
        var isHave = this._isHaveStory(heroBaseId);
        this._buttonSwitch.node.active = (isHave);
        var show = this._isShowDrawing && isHave;
        this._updateDrawing(show);
    }
    onBtnWayGetClicked() {
        UIPopupHelper.popupItemGuider(function (popupItemGuider: PopupItemGuider) {
            popupItemGuider.updateUI(this._type, this._value);
            popupItemGuider.setTitle(Lang.get('way_type_get'));
        }.bind(this))
    }
    _showDrawing(show) {
        this._isShowDrawing = show;
        this._updateDrawing(show);
    }
    _updateDrawing(show?) {
        this._heroStage.node.active = (!show);
        this._scrollPage.node.active = (!show);
        this._scrollPageStory.node.active = (show);
        if(this._handleSelect)
        {
            this.unschedule(this._handleSelect);
        }
        this._handleSelect = this.updateSelect.bind(this,show);
        this.scheduleOnce(this._handleSelect,0.1);
        // if (show) {
        //     this._scrollPageStory.setCurPage(this._curSelectedPos);
        // } else {
        //     this._scrollPage.setCurPage(this._curSelectedPos);
        // }
    }
    private _handleSelect:Function;
    private updateSelect(data:boolean):void{
        if (data) {
            this._scrollPageStory.setCurPage(this._curSelectedPos);
        } else {
            this._scrollPage.setCurPage(this._curSelectedPos);
        }
    }
    setDrawing(show) {
        if (!this._isHaveStory(this._value)) {
            return;
        }
        this._showDrawing(show);
        this._buttonSwitch.setState(this._isShowDrawing);
    }
    onBtnClose() {
        this.close();
    }
    setPageData(dataList) {
        var selectPos = this._curSelectedPos;
        for (var i in dataList) {
            var data = dataList[i];
            if (data.cfg.id == this._value && data.limitLevel == this._limitLevel) {
                selectPos = parseInt(i) + 1;
            }
        }
        this._setScrollPage(dataList, selectPos);
        this._showDrawing(this._isShowDrawing);
    }
    _setScrollPage(dataList, selectPos) {
        this._dataList = dataList;
        this._scrollPage.setCallBack(handler(this, this._updateHeroItem));
        this._scrollPage.setUserData(dataList, selectPos);
        this._scrollPageStory.setCallBack(handler(this, this._updateHeroItem));
        this._scrollPageStory.setUserData(dataList, selectPos);
        this._scrollPageStory.setTouchEnabled(false);
    }
    _updateHeroItem(sender, widget, index, selectPos) {
        var data = this._dataList[index];
        if (data == null) {
            return;
        }
        this._avatarPageItems = this._scrollPage.getPageItems();
        this._storyPageItems = this._scrollPageStory.getPageItems();
        var heroBaseId = data.cfg.id;
        var limitLevel = data.limitLevel;
        var limitRedLevel = data.limitRedLevel
        if (this._avatarPageItems) {
            var avatarItem = this._avatarPageItems[index];
            if (avatarItem) {
                var avatarCount = avatarItem.childrenCount;
                if (avatarCount == 0) {
                    var node = cc.instantiate(this._commonHeroAvatar) as cc.Node;
                    var avatar = node.getComponent(CommonHeroAvatar);
                    avatar.init();
                    avatar.updateUI(heroBaseId, null, null, limitLevel, null, null, limitRedLevel);
                    avatar.setScale(1.4);
                    avatar.node.setPosition(new cc.Vec2(this._scrollPage.getPageSize().width / 2, this._scrollPage.getPageSize().height / 2 - 150));
                    avatarItem.addChild(avatar.node);
                    avatar._playAnim("idle", true);
                }
                else {
                    avatarItem.children[0].getComponent(CommonHeroAvatar)._playAnim("idle", true);
                }
            }
        }
        if (this._storyPageItems&&selectPos - 1 == index) {
            var storyItem = this._storyPageItems[index];
            if (storyItem) {
                var storyCount = storyItem.childrenCount;
                if (storyCount == 0) {
                    var node = cc.instantiate(this._commonStoryAvatar) as cc.Node;
                    var story = node.getComponent(CommonStoryAvatar) as CommonStoryAvatar;
                    // story.init();
                    story.updateUI(heroBaseId, limitLevel, limitRedLevel);
                    story.node.setScale(0.8);
                    story.node.setPosition(new cc.Vec2(this._scrollPageStory.getPageSize().width / 2, 0));
                    storyItem.addChild(story.node);
                    story.playIdleAni();
                }
                else {
                    storyItem.children[0].getComponent(CommonStoryAvatar).playIdleAni();
                }
            }
        }
        if (selectPos - 1 == index) {
            if (this._curSelectedPos != selectPos) {
                this._value = heroBaseId;
                this._curSelectedPos = selectPos;
                this._updateHeroInfo(heroBaseId, limitLevel, limitRedLevel);
            }
        }
    }
    _isHaveStory(heroBaseId) {
        var info = HeroDataHelper.getHeroConfig(heroBaseId);
        var resId = info.res_id;
        var resData = HeroDataHelper.getHeroResConfig(resId);
        var isHaveSpine = resData.story_res_spine != 0;
        var isHaveRes = resData.story_res != 0 && resData.story_res != 777;
        return isHaveSpine || isHaveRes;
    }
    _onButtonVoiceClicked() {
        this._playCurHeroVoice(true);
    }
    _playCurHeroVoice(must?) {
        var baseId = this._heroBaseId;
        G_HeroVoiceManager.playVoiceWithHeroId(baseId, must);
    }

}