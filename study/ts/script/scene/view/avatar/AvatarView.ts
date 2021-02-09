const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { HeroConst } from '../../../const/HeroConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import UIConst from '../../../const/UIConst';
import { Colors, G_HeroVoiceManager, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonAvatarAvatar from '../../../ui/component/CommonAvatarAvatar';
import CommonAvatarName from '../../../ui/component/CommonAvatarName';
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal';
import { CommonDetailBaseView } from '../../../ui/component/CommonDetailBaseView';
import { CommonDetailModule } from '../../../ui/component/CommonDetailModule';
import CommonHeroName from '../../../ui/component/CommonHeroName';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import ScrollViewExtra from '../../../ui/component/ScrollViewExtra';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import HeroDetailBriefModule from '../heroDetail/HeroDetailBriefModule';
import HeroDetailSkillModule from '../heroDetail/HeroDetailSkillModule';
import HeroDetailTalentModule from '../heroDetail/HeroDetailTalentModule';
import HeroDetailWeaponModule from '../heroDetail/HeroDetailWeaponModule';
import AvatarDetailBaseAttrModule from './AvatarDetailBaseAttrModule';
import AvatarDetailBriefModule from './AvatarDetailBriefModule';
import AvatarDetailCombinationModule from './AvatarDetailCombinationModule';
import AvatarDetailInstrumentFeatureModule from './AvatarDetailInstrumentFeatureModule';
import AvatarDetailSkillModule from './AvatarDetailSkillModule';
import AvatarDetailTalentModule from './AvatarDetailTalentModule';
import AvatarIcon from './AvatarIcon';





// import ScrollViewExtra from '../../../ui/component/ScrollViewExtra';

@ccclass
export default class AvatarView extends CommonDetailBaseView {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodeName: CommonHeroName = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textAvatarName: cc.Label = null;

    @property({
        type: CommonAvatarAvatar,
        visible: true
    })
    _fileNodeAvatar: CommonAvatarAvatar = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _buttonGet: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _buttonWear: CommonButtonLevel0Normal = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageWear: cc.Sprite = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewIcon: cc.ScrollView = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _buttonBook: CommonMainMenu = null;

    @property({
        type: CommonAvatarName,
        visible: true
    })
    _fileNodeName2: CommonAvatarName = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    private _isFormTeamView: boolean;
    private _signalAvatarEquip: any;
    private _curIndex: number;
    private _curData: any;
    private _allAvatarIds: Array<any>;
    private _allIcons: Array<AvatarIcon>;

    private _showIds;

    protected preloadResList = [
        { path: Path.getPrefab("HeroDetailSkillModule", "heroDetail"), type: cc.Prefab },
        { path: Path.getPrefab("HeroDetailWeaponModule", "heroDetail"), type: cc.Prefab },
        { path: Path.getPrefab("HeroDetailTalentModule", "heroDetail"), type: cc.Prefab },
        { path: Path.getPrefab("HeroDetailSkillCell", "heroDetail"), type: cc.Prefab },
        { path: Path.getPrefab("HeroDetailBriefModule", "heroDetail"), type: cc.Prefab },
        { path: Path.getPrefab("AvatarDetailBaseAttrModule", "avatar"), type: cc.Prefab },
        { path: Path.getPrefab("AvatarDetailBriefModule", "avatar"), type: cc.Prefab },
        { path: Path.getPrefab("AvatarDetailInstrumentFeatureModule", "avatar"), type: cc.Prefab },
        { path: Path.getPrefab("AvatarDetailCombinationModule", "avatar"), type: cc.Prefab },
        { path: Path.getPrefab("AvatarDetailTalentModule", "avatar"), type: cc.Prefab },
        { path: Path.getPrefab("AvatarDetailSkillModule", "avatar"), type: cc.Prefab },
        { path: Path.getPrefab("AvatarIcon", "avatar"), type: cc.Prefab },
        { path: Path.getPrefab("CommonDetailTitleWithBg", "common"), type: cc.Prefab },
        { path: Path.getPrefab("CommonHeroIcon", "common"), type: cc.Prefab },
    ];

    // public static waitEnterMsg(callBack) {
    //     callBack();
    // }

    public setInitData(avatarId, isFormTeamView) {
        var curAvatarId = avatarId || 0;
        G_UserData.getAvatar().setCurAvatarId(curAvatarId);
        this._isFormTeamView = isFormTeamView || false;
    }

    //以下预制体需要实例化
    private _heroDetailSkillModule;
    private _heroDetailWeaponModule;
    private _heroDetailTalentModule;
    private _heroDetailBriefModule;

    private _avatarIcon: any;
    private _avatarDetailBaseAttrModule: any;
    private _avatarDetailBriefModule: any;
    private _avatarDetailInstrumentFeatureModule: any;
    private _avatarDetailCombinationModule: any;
    private _avatarDetailTalentModule: any;
    private _avatarDetailSkillModule: any;

    onCreate() {
        this.setSceneSize();
        this._heroDetailSkillModule = cc.resources.get(Path.getPrefab("HeroDetailSkillModule", "heroDetail"));
        this._heroDetailWeaponModule = cc.resources.get(Path.getPrefab("HeroDetailWeaponModule", "heroDetail"));
        this._heroDetailTalentModule = cc.resources.get(Path.getPrefab("HeroDetailTalentModule", "heroDetail"));
        this._heroDetailBriefModule = cc.resources.get(Path.getPrefab("HeroDetailBriefModule", "heroDetail"));

        this._avatarDetailBaseAttrModule = cc.resources.get(Path.getPrefab("AvatarDetailBaseAttrModule", "avatar"));
        this._avatarDetailBriefModule = cc.resources.get(Path.getPrefab("AvatarDetailBriefModule", "avatar"));
        this._avatarDetailInstrumentFeatureModule = cc.resources.get(Path.getPrefab("AvatarDetailInstrumentFeatureModule", "avatar"));
        this._avatarDetailCombinationModule = cc.resources.get(Path.getPrefab("AvatarDetailCombinationModule", "avatar"));
        this._avatarDetailTalentModule = cc.resources.get(Path.getPrefab("AvatarDetailTalentModule", "avatar"));
        this._avatarDetailSkillModule = cc.resources.get(Path.getPrefab("AvatarDetailSkillModule", "avatar"));
        this._avatarIcon = cc.resources.get(Path.getPrefab("AvatarIcon", "avatar"));
        this._fileNodeAvatar._init();
        this._initData();
        this._initView();
    }
    onEnter() {
        this._signalAvatarEquip = G_SignalManager.add(SignalConst.EVENT_AVATAR_EQUIP_SUCCESS, handler(this, this._avatarEquipSuccess));
        this._buttonGet.addClickEventListenerEx(handler(this, this._onButtonGetClicked));
        this._buttonWear.addClickEventListenerEx(handler(this, this._onButtonWearClicked));
        //  this._listView.content.on(cc.Node.EventType.SIZE_CHANGED,this._onSizeChanged,this);
        this._listView.node.addComponent(ScrollViewExtra);
        var events = new cc.Component.EventHandler();
        events.component = "AvatarView";
        events.target = this.node;
        events.handler = "onScrollViewEvent";
        this._listViewIcon.scrollEvents = [];
        this._listViewIcon.scrollEvents.push(events);
        this._updateLaterCount = 0;
        this.schedule(this._updateAvatarIconNew.bind(this), 1);
        this._calCurIndex();
        this._updateData();
        this._initIcons();

    }
    onExit() {
        this._signalAvatarEquip.remove();
        this._signalAvatarEquip = null;
    }

    private _updateLaterCount: number = 0;
    _updateAvatarIconNew(): void {
        if (this._listViewIcon.isAutoScrolling() || this._listViewIcon.isScrolling()) {
            this._updateLaterCount = 0;
            this.unschedule(this._updateAvatarIcon.bind(this));
            this._updateAvatarIcon();
        }
        else {
            if (this._updateLaterCount == 0) {
                this._updateLaterCount = 1;
                this.scheduleOnce(this._updateAvatarIcon.bind(this), 1);
            }
        }
    }

    /**
     * (0,-120,-240,-360,-480,...)
     */
    private onScrollViewEvent(): void {
        var curPosY = this._listViewIcon.content.y;
        var fromIndex = Math.floor(curPosY / 120);
        if (fromIndex < 0) fromIndex = 0;
        var endIndex = fromIndex + 7;
        if (endIndex >= this._allIcons.length) endIndex = this._allIcons.length - 1;
        for (var j = 0; j < this._allIcons.length; j++) {
            this._allIcons[j].node.parent.active = fromIndex <= j && j <= endIndex;
        }
    }
    // private _onSizeChanged():void{
    //     this.onScrollViewEvent();
    //     this._listView.scrollToTop();
    // }

    private _initData() {
        this._curIndex = 1;
        this._curData = null;
    }
    private _calCurIndex() {
        this._allAvatarIds = AvatarDataHelper.getAllAvatarIds();
        var curAvatarId = G_UserData.getAvatar().getCurAvatarId();
        if (curAvatarId > 0) {
            for (var i in this._allAvatarIds) {
                var id = this._allAvatarIds[i];
                if (id == curAvatarId) {
                    this._curIndex = parseInt(i) + 1;
                    break;
                }
            }
        } else if (G_UserData.getBase().isEquipAvatar()) {
            var avatarBaseId = G_UserData.getBase().getAvatar_base_id();
            for (i in this._allAvatarIds) {
                var id = this._allAvatarIds[i];
                if (id == avatarBaseId) {
                    this._curIndex = parseInt(i) + 1;
                    break;
                }
            }
        }
    }
    private _initView() {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.setImageTitle('txt_sys_com_bianshenka');
        this._buttonGet.setString(Lang.get('avatar_btn_get'));
        this._buttonWear.setString(Lang.get('avatar_btn_wear'));
        this._buttonBook.updateUI(FunctionConst.FUNC_HAND_BOOK);
        this._buttonBook.addClickEventListenerEx(handler(this, this._onButtonBookClicked));
        var roleId = G_UserData.getTeam().getHeroIdWithPos(1);
        var unitData = G_UserData.getHero().getUnitDataWithId(roleId);
        var roleBaseId = unitData.getBase_id();
        var rank = unitData.getRank_lv();
        this._fileNodeName.setName(roleBaseId, rank);
        this._fileNodeAvatar.setScale(1.4);
    }
    //初始化icon
    private _initIcons() {
        this._allIcons = [];
        this._listViewIcon.content.removeAllChildren();
        this._listViewIcon.content.height = 0;
        for (var i = 1; i <= this._allAvatarIds.length; i++) {
            var avatarId = this._allAvatarIds[i - 1];
            var icon = (cc.instantiate(this._avatarIcon) as cc.Node).getComponent(AvatarIcon)
            icon.setInitData(i, handler(this, this._onClickAvatarIcon));
            this._allIcons.push(icon);
            var widget = new cc.Node();
            var lastIconSize = cc.size(icon.node.getContentSize().width, icon.node.getContentSize().height + 30);
            var iconSize = i == this._allAvatarIds.length && lastIconSize || icon.node.getContentSize();
            var offset = i == this._allAvatarIds.length && 0 || 30;
            widget.setContentSize(iconSize.width, iconSize.height - 20);
            icon.node.setPosition(new cc.Vec2(iconSize.width / 2, - iconSize.height / 2));
            widget.addChild(icon.node);
            UIHelper.insertCurstomListContent(this._listViewIcon.content, widget, -1);
        }
        this._updateView();
        this._locationIcon();
    }
    //重新设置icon的渲染顺序
    private _reorderIcons() {
        var curItem = this._allIcons[this._curIndex - 1];
        curItem.node.parent.zIndex = (10000);
        for (var i = this._curIndex - 2; i >= 0; i--) {
            var item = this._allIcons[i];
            var zorder = 10000 - (this._allIcons.length - i);
            item.node.parent.zIndex = (zorder);
        }
        for (var i = this._curIndex; i < this._allIcons.length; i++) {
            var item = this._allIcons[i];
            var zorder = 10000 - i;
            item.node.parent.zIndex = (zorder);
        }
    }
    private _updateData() {
        var avatarId = this._allAvatarIds[this._curIndex - 1];
        var unitData = G_UserData.getAvatar().getUnitDataWithBaseId(avatarId);
        if (unitData) {
            this._curData = unitData;
        } else {
            var data = { base_id: avatarId };
            this._curData = G_UserData.getAvatar().createTempAvatarUnitData(data);
        }
        G_UserData.getAttr().recordPower();
    }
    //更新视野
    private _updateView() {
        this._updateAvatarIcon();
        this._updateName();
        this._updateShow();
        this._updateWearState();
        this._updateListView();
        var reach = AvatarDataHelper.isCanActiveBook();
        this._buttonBook.showRedPoint(reach);
    }
    private _locationIcon() {
        var tempHeight = this._listViewIcon.node.getContentSize().height / 2;
        var iconHeight = this._allIcons[0].node.getContentSize().height;
        var topHeight = (this._curIndex - 0.5) * iconHeight;
        var bottomHeight = (this._allIcons.length - this._curIndex + 0.5) * iconHeight;
        if (topHeight < tempHeight) {
            this._listViewIcon.scrollToTop();
        } else {
            // this._listViewIcon.jumpToItem(this._curIndex - 1, new cc.Vec2(0, 0.5), new cc.Vec2(0, 0.5));
        }
    }
    private _updateAvatarIcon() {
        for (var index = 0; index < this._allAvatarIds.length; index++) {
            var icon = this._allIcons[index];
            var avatarId = this._allAvatarIds[index];
            icon.updateUI(avatarId);
            icon.setSelected(index + 1 == this._curIndex);
        }
        this._reorderIcons();
    }
    private _updateName() {
        var baseId = this._curData.getBase_id();
        var param = null;
        var rank = null;
        if (baseId == 0) {
            var roleId = G_UserData.getTeam().getHeroIdWithPos(1);
            var unitData = G_UserData.getHero().getUnitDataWithId(roleId);
            param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, unitData.getBase_id());
            rank = unitData.getRank_lv();
            this._fileNodeName.node.active = (true);
            this._textAvatarName.node.active = (false);
        } else {
            param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_AVATAR, baseId);
            this._textAvatarName.string = (param.name);
            this._textAvatarName.node.color = (Colors.COLOR_QUALITY[param.color - 1]);
            this._textAvatarName.node.active = (true);
            this._fileNodeName.node.active = (false);
        }
        this._fileNodeName2.setName(baseId, rank);
    }
    private _updateShow() {
        var avatarId = this._curData.getBase_id();
        var info = AvatarDataHelper.getAvatarConfig(avatarId);
        var heroBaseId = info.hero_id;
        if (avatarId == 0) {
            heroBaseId = G_UserData.getHero().getRoleBaseId();
        }
        this._fileNodeAvatar.updateUI(avatarId);
        this._fileNodeAvatar.resetImageTalk();
        var limitLevel = 0;
        if (info.limit == 1) {
            limitLevel = HeroConst.HERO_LIMIT_MAX_LEVEL;
        }
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel);
        var actionName = param.res_cfg.show_action;
        this._fileNodeAvatar.setBubble(info.talk);
        G_HeroVoiceManager.playVoiceWithHeroId(heroBaseId);
    }
    private _updateWearState() {
        this._buttonGet.setVisible(false);
        this._buttonWear.setVisible(false);
        this._imageWear.node.active = (false);
        var baseId = this._curData.getBase_id();
        if (baseId == 0) {
            var isEquiped = !G_UserData.getBase().isEquipAvatar();
            if (isEquiped) {
                this._imageWear.node.active = (true);
            } else {
                this._buttonWear.setVisible(true);
            }
        } else {
            var isHave = G_UserData.getAvatar().isHaveWithBaseId(baseId);
            if (isHave) {
                isEquiped = this._curData.isEquiped();
                if (isEquiped) {
                    this._imageWear.node.active = (true);
                } else {
                    this._buttonWear.setVisible(true);
                    var redValue = AvatarDataHelper.isBetterThanCurEquiped(this._curData);
                    this._buttonWear.showRedPoint(redValue);
                }
            } else {
                this._buttonGet.setVisible(true);
            }
        }
    }
    private _updateListView() {
        this.reset();
        if (this._curData.getBase_id() == 0) {
            this._updateListSpecial();
        } else {
            this._updateListCommon();
        }
    }
    private _updateListSpecial() {
        var skillIds = [];
        var roleId = G_UserData.getTeam().getHeroIdWithPos(1);
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(roleId);
        var rankLevel = heroUnitData.getRank_lv();
        var limitLevel = heroUnitData.getLimit_level();
        var heroRankConfig = HeroDataHelper.getHeroRankConfig(heroUnitData.getBase_id(), rankLevel, limitLevel);
        for (var i = 1; i <= 3; i++) {
            var skillId = heroRankConfig['rank_skill_' + i];
            if (skillId != 0) {
                skillIds.push(skillId);
            }
        }

        this._sectionInfoes = [];
        if (skillIds.length > 0) {
            this._sectionInfoes.push({
                buildFunc: this.buildHeroDetailSkillModule,
                param: skillIds
            });
        }

        if (heroUnitData.isCanBreak()) {
            this._sectionInfoes.push({
                buildFunc: this.buildHeroDetailTalentModule,
                param: heroUnitData
            });
        }
        var baseId = heroUnitData.getConfig().instrument_id;
        if (baseId > 0) {
            this._sectionInfoes.push({
                buildFunc: this.buildHeroDetailWeaponModule,
                param: heroUnitData
            });
        }
        this._sectionInfoes.push(
            {
                buildFunc: this.buildHeroDetailBriefModule,
                param: heroUnitData
            });

        this.startDraw();
    }

    buildHeroDetailBriefModule(heroUnitData): CommonDetailModule {
        var briefModule = (cc.instantiate(this._heroDetailBriefModule) as cc.Node).getComponent(HeroDetailBriefModule);
        briefModule.setInitData(heroUnitData);
        return briefModule;
    }

    buildHeroDetailWeaponModule(heroUnitData): CommonDetailModule {
        var weaponModule = (cc.instantiate(this._heroDetailWeaponModule) as cc.Node).getComponent(HeroDetailWeaponModule);
        weaponModule.setInitData(heroUnitData);
        return weaponModule;
    }

    buildHeroDetailTalentModule(heroUnitData): CommonDetailModule {
        var talentModule = (cc.instantiate(this._heroDetailTalentModule) as cc.Node).getComponent(HeroDetailTalentModule);
        talentModule.setInitData(heroUnitData, true);
        return talentModule;
    }

    buildHeroDetailSkillModule(skillIds): CommonDetailModule {
        var skillModule = (cc.instantiate(this._heroDetailSkillModule) as cc.Node).getComponent(HeroDetailSkillModule);
        skillModule.setInitData(skillIds);
        return skillModule;
    }



    private _updateListCommon() {
        this._sectionInfoes = [
            {
                buildFunc: this._buildBaseAttrModule,
            },
            {
                buildFunc: this._buildSkillModule,
            },
            {
                buildFunc: this._buildTalentModule,
            },
            {
                buildFunc: this._buildInstrumentFeatureModule,
            }];

        var strShowId = this._curData.getConfig().show_id;
        if (strShowId != '' && strShowId != '0') {
            this._showIds = strShowId.split('|');
        }
        for (var i = 0; i < this._showIds.length; i++) {
            this._sectionInfoes.push({
                buildFunc: this._buildCombinationModule,
                param: i
            });
        }

        this._sectionInfoes.push({
            buildFunc: this._buildBriefModule,
        });

        this.startDraw();
    }
    private _buildBaseAttrModule(): CommonDetailModule {
        var moduleItem = (cc.instantiate(this._avatarDetailBaseAttrModule) as cc.Node).getComponent(AvatarDetailBaseAttrModule);
        moduleItem.updateUI(this._curData);
        return moduleItem;
        //   UIHelper.updateCurstomListSize(this._listView.content, moduleItem.node);

    }
    private _buildSkillModule(): CommonDetailModule {
        var moduleItem = (cc.instantiate(this._avatarDetailSkillModule) as cc.Node).getComponent(AvatarDetailSkillModule);
        moduleItem.updateUI(this._curData);
        return moduleItem;
        // UIHelper.updateCurstomListSize(this._listView.content, moduleItem.node);

    }
    private _buildTalentModule(): CommonDetailModule {
        var moduleItem = (cc.instantiate(this._avatarDetailTalentModule) as cc.Node).getComponent(AvatarDetailTalentModule);
        moduleItem.updateUI(this._curData);
        return moduleItem;
    }
    private _buildInstrumentFeatureModule(): CommonDetailModule {
        var moduleItem = (cc.instantiate(this._avatarDetailInstrumentFeatureModule) as cc.Node).getComponent(AvatarDetailInstrumentFeatureModule);
        moduleItem.updateUI(this._curData);
        return moduleItem;
    }
    private _buildCombinationModule(i): CommonDetailModule {
        var showId = this._showIds[i];
        var moduleItem = (cc.instantiate(this._avatarDetailCombinationModule) as cc.Node).getComponent(AvatarDetailCombinationModule);
        moduleItem.updateUI(parseInt(showId));
        moduleItem.setTitle(i + 1);
        return moduleItem;
    }
    private _buildBriefModule(): CommonDetailModule {
        var moduleItem = (cc.instantiate(this._avatarDetailBriefModule) as cc.Node).getComponent(AvatarDetailBriefModule);
        moduleItem.updateUI(this._curData);
        //UIHelper.updateCurstomListSize(this._listView.content, moduleItem.node);
        return moduleItem;
    }
    private _onClickAvatarIcon(index) {
        if (index == this._curIndex) {
            return;
        }
        this._curIndex = index;
        this._updateData();
        this._updateView();
    }
    private _onButtonBookClicked() {
        G_SceneManager.showScene('avatarBook');
    }
    private _onButtonGetClicked() {

        UIPopupHelper.popupItemGuider(function (popup: PopupItemGuider) {
            popup.updateUI(TypeConvertHelper.TYPE_AVATAR, this._curData.getBase_id());
        }.bind(this));
    }
    private _onButtonWearClicked() {
        G_UserData.getAvatar().c2sEquipAvatar(this._curData.getId());
    }
    private _avatarEquipSuccess(eventName, avatarId) {
        if (this._isFormTeamView) {
            G_UserData.getTeamCache().setShowAvatarEquipFlag(true);
        }
        this._updateData();
        this._updateAvatarIcon();
        this._updateWearState();
        // this._updateListView(); //变身卡穿戴成功的时候不更新list列表
        this._playPrompt(avatarId);
    }
    private _playPrompt(avatarId) {
        var summary = [];
        var param = {
            content: Lang.get('summary_avatar_add_success'),
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_AVATAR }
        };
        summary.push(param);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_AVATAR);
    }

}