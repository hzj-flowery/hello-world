const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { HeroConst } from '../../../const/HeroConst';
import PetConst from '../../../const/PetConst';
import { SignalConst } from '../../../const/SignalConst';
import TeamConst from '../../../const/TeamConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_SignalManager, G_UserData, G_SpineManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonHeroStar from '../../../ui/component/CommonHeroStar';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import CommonUI from '../../../ui/component/CommonUI';
import PopupChooseHeroHelper from '../../../ui/popup/PopupChooseHeroHelper';
import PopupChoosePet from '../../../ui/popup/PopupChoosePet';
import PopupChoosePetHelper from '../../../ui/popup/PopupChoosePetHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { unpack } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import HeroGoldHelper from '../heroGoldTrain/HeroGoldHelper';
import PopupEmbattle from './PopupEmbattle';
import TeamHeroBustIcon from './TeamHeroBustIcon';
import TeamHeroIcon from './TeamHeroIcon';
import TeamHeroNode from './TeamHeroNode';
import TeamHeroPageItem from './TeamHeroPageItem';
import TeamPartnerButton from './TeamPartnerButton';
import TeamPetNode from './TeamPetNode';
import TeamViewHelper from './TeamViewHelper';
import TeamYokeNode from './TeamYokeNode';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { table } from '../../../utils/table';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { MilitaryMasterPlanHelper } from '../militaryMasterPlan/MilitaryMasterPlanHelper';
import { MilitaryMasterPlanView } from '../militaryMasterPlan/MilitaryMasterPlanView';







@ccclass
export default class TeamView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeContent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelMid: cc.Node = null;

    @property({
        type: cc.PageView,
        visible: true
    })
    _pageView: cc.PageView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAwake: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAwakeBg: cc.Sprite = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _nodeHeroStar: CommonHeroStar = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonAwake: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAwakeRedPoint: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTip: cc.Sprite = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewLineup: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInDown: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnEmbattle: cc.Button = null;

  

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTotalEffect: cc.Node = null;

    protected preloadResList = [
        {path:Path.getPrefab("ActiveJointDesNode","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamHeroNode","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamPetNode","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamHeroIcon","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamHeroBustIcon","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamPartnerButton","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamYokeNode","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamYokeDynamicModule","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamYokeConditionNode","team"),type:cc.Prefab},
        {path:Path.getPrefab("TeamGemstoneIcon","team"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonDetailNewTitleWithBg"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonHeroAvatar"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonHeroIcon"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonHorseIcon"),type:cc.Prefab},
        {path:Path.getCommonPrefab("CommonPetIcon"),type:cc.Prefab},
    ];

    private static _enterPos:number = 1;
    _enterEffectAwakeStar;
    _enterEffectHistoryHero;

    public static waitEnterMsg(callBack, param) {
        let checkHero = function (pos) {
            if (pos && pos != TeamConst.PET_POS && G_UserData.getTeam().getStateWithPos(pos) == TeamConst.STATE_OPEN) {
                let isEmpty = PopupChooseHeroHelper.checkIsEmpty(PopupChooseHeroHelper.FROM_TYPE1);
                if (isEmpty) {
                    G_Prompt.showTip(Lang.get('hero_popup_list_empty_tip' + PopupChooseHeroHelper.FROM_TYPE1));
                    return false;
                }
            }
            return true;
        }
        let checkPet = function (pos) {
            if (pos && pos == TeamConst.PET_POS && G_UserData.getTeam().getPetState()[0] == TeamConst.STATE_OPEN) {
                let isEmpty = PopupChoosePetHelper.checkIsEmpty(PopupChoosePetHelper.FROM_TYPE1);
                if (isEmpty) {
                    G_Prompt.showTip(Lang.get('pet_popup_list_empty_tip' + PopupChoosePetHelper.FROM_TYPE1));
                    return false;
                }
            }
            return true;
        }
        let pos = null;
        if (param && typeof (param) == 'object') {
            pos = unpack(param)[0];
            TeamView._enterPos = pos;
        }
        else
        {
            TeamView._enterPos = null;
        }
        if (checkHero(pos) == false) {
            return false;
        }
        if (checkPet(pos) == false) {
            return false;
        }
        callBack();
    }

    private _pos: number;
    private _pageItems: Array<TeamHeroPageItem>;
    private _enterMoving: any;
    private _enterEffectHero: any;
    private _enterEffectDown: any;
    private _enterEffectPower: any
    private _enterEffectBasicInfo: any;
    private _enterEffectPanelAttr: any;
    private _enterEffectInstrument: any;
    private _enterEffectHorse: any;
    private _enterEffectTop: any;
    private _iconBgs: Array<cc.Node>;
    private _leftIcons: Array<any>;//下标从0走
    private _heroIcons: Array<any>;
    private _petIcons: Array<any>;
    private _imageTipInitPos: cc.Vec2;
    private _subLayers: any;
    private _curSelectedPanelIndex: number;
    private _enterEffects: Array<any>;
    private _isPageViewMoving: boolean;

    private _partnerButton: TeamPartnerButton;

    //需要实例化
    private _teamPetNode: any;
    private _teamHeroIcon: any;
    private _teamHeroBustIcon: any;
    private _teamPartnerButton: any;
    private _teamYokeNode: any;
    private _teamHeroNode: any;


    private _signalChangeHeroFormation;
    private _signalPetOnTeam;
    private _signalRedPointUpdate;
    private _signalAvatarEquip;
    private _funcId2HeroReach: any;

    public preloadRes(callBack: Function, params) {
        this.addPreloadSceneRes(2005);
        super.preloadRes(callBack, params);
    }

    onLoad() {
        super.onLoad();
    }
    onCreate() {

        this.updateSceneId(2005);
        this.setSceneSize();
        
        this._pos = TeamView._enterPos;
        this._teamPetNode = cc.resources.get(Path.getPrefab("TeamPetNode","team"));
        this._teamHeroIcon = cc.resources.get(Path.getPrefab("TeamHeroIcon","team"));
        this._teamHeroBustIcon = cc.resources.get(Path.getPrefab("TeamHeroBustIcon","team"));
        this._teamPartnerButton = cc.resources.get(Path.getPrefab("TeamPartnerButton","team"));
        this._teamYokeNode = cc.resources.get(Path.getPrefab("TeamYokeNode","team"));
        this._teamHeroNode = cc.resources.get(Path.getPrefab("TeamHeroNode","team"));

        this._initCurPos();
        this._initData();
        this._initView();
        
    }
    _initCurPos() {
        if (this._pos && this._pos != TeamConst.PET_POS && G_UserData.getTeam().getStateWithPos(this._pos) == TeamConst.STATE_HERO) {
            G_UserData.getTeam().setCurPos(this._pos);
        }
        else if (this._pos == TeamConst.PET_POS && G_UserData.getTeam().getPetState()[0] == TeamConst.STATE_HERO)
		{
            G_UserData.getTeam().setCurPos(this._pos);
        } 
        else {
            G_UserData.getTeam().setCurPos(1);
        }
    }
    _initData() {
        this._subLayers = {};
        this._curSelectedPanelIndex = 0;
        this._enterEffects = [];
        this._isPageViewMoving = false;
    }
    _initView() {
        this._topbarBase.setImageTitle('txt_sys_com_zhenrong');
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_JADE2)[0];
        var topbarConst = isOpen && TopBarStyleConst.STYLE_COMMON2 || TopBarStyleConst.STYLE_COMMON;
        this._topbarBase.updateUI(topbarConst);
      
        this._initLeftIcons();
        this._initPageView();
        this._initPetNode();
        this._imageTipInitPos = new cc.Vec2(this._imageTip.node.x, this._imageTip.node.y);
    }



    _initLeftIcons() {

        let _this = this;
        let createIcon = function (icon: cc.Node, isHeroBust?): cc.Node {
            let iconBg = new cc.Node();
            let iconBgSize = cc.size(114, 108);
            if (isHeroBust) {
                iconBgSize = cc.size(100, 127);
            }
            iconBg.setContentSize(iconBgSize);
            icon.setAnchorPoint(0, 0);
            let listSize = _this._listViewLineup.node.getContentSize();
            iconBg.x = (listSize.width - iconBg.width) / 2;
            icon.setPosition(46, 61);
            iconBg.addChild(icon);
            return iconBg;
        }
        //this._listViewLineup.verticalScrollBar.node.active = (false);
        this._listViewLineup.content.removeAllChildren();
        this._listViewLineup.content.setContentSize(0, 0);
        this._iconBgs = [];
        this._leftIcons = [];
        this._heroIcons = [];
        this._petIcons = [];




        for (let i = 1; i <= 6; i++) {
            if (i <= 6) {
                let thbi = (cc.instantiate(this._teamHeroBustIcon) as cc.Node);
                let icon = thbi.getComponent(TeamHeroBustIcon) as TeamHeroBustIcon;
                icon.setInitData(i, handler(this, this._onLeftIconClicked));
                let iconBg = createIcon(icon.node, true);
                UIHelper.insertCurstomListContent(this._listViewLineup.content, iconBg);
                this._iconBgs.push(iconBg);
                this._leftIcons.push(icon);
                this._heroIcons.push(icon);
            } else if (FunctionCheck.funcIsShow(FunctionConst.FUNC_PET_HOME)) {
                let thi = cc.instantiate(this._teamHeroIcon) as cc.Node;
                let icon1 = thi.getComponent(TeamHeroIcon) as TeamHeroIcon;
                icon1.setInitData(i, handler(this, this._onLeftIconClicked), true);
                let iconBg = createIcon(icon1.node);
                UIHelper.insertCurstomListContent(this._listViewLineup.content, iconBg);
                this._iconBgs.push(iconBg);
                this._leftIcons.push(icon1);
                this._petIcons.push(icon1);
            }
        }
        //援军
        let tpb = cc.instantiate(this._teamPartnerButton) as cc.Node;
        this._partnerButton = tpb.getComponent(TeamPartnerButton) as TeamPartnerButton;
        this._partnerButton.setInitData(handler(this, this._onButtonJiBanClicked))
        var iconBg = createIcon(this._partnerButton.node);
        UIHelper.insertCurstomListContent(this._listViewLineup.content, iconBg);
        this._iconBgs.push(iconBg);

        // var iconBg = new cc.Node();
        // var iconBgSize = cc.size(114, 108);
        // iconBg.setContentSize(iconBgSize);
        // this._partnerButton.node.setAnchorPoint(0, 0);
        // var listSize = _this._listViewLineup.node.getContentSize();
        // iconBg.x = (listSize.width - iconBg.width) / 2;
        // this._partnerButton.node.setPosition(46, 61);
        // iconBg.addChild( this._partnerButton.node);
        // UIHelper.insertCurstomListContent(this._listViewLineup.content, iconBg);

    }


    _initPageView() {
        this._pageItems = [];
        // this._pageView.setSwallowTouches(false);
        // this._pageView.setScrollDuration(0.3);

        this._pageView.node.on(cc.Node.EventType.TOUCH_START, this.onTouchCallBackStart, this);
        this._pageView.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCallBackEndOrCanceled, this);
        this._pageView.node.on(cc.Node.EventType.TOUCH_END, this.onTouchCallBackEndOrCanceled, this);

        this._pageView.removeAllPages();
        let showDatas = TeamViewHelper.getHeroAndPetShowData();
        let viewSize = (this._pageView.node.getChildByName("view") as cc.Node).getContentSize();
        for (let i in showDatas) {
            let data = showDatas[i];
            if (this._pageItems[i] == null) {
                let node = new cc.Node();
                let item = node.addComponent(TeamHeroPageItem) as TeamHeroPageItem;
                item.setInitData(viewSize.width, viewSize.height, handler(this, this._showHeroDetailView), i);
                this._pageItems[i] = item;
                this._pageView.insertPage(item.node, parseInt(i));
            }
        }
    }
    _initPetNode() {
        let tpn = cc.instantiate(this._teamPetNode) as cc.Node;
        let layer = tpn.getComponent(TeamPetNode) as TeamPetNode;
        layer.setInitData(this);
        this._nodeContent.addChild(layer.node);
        this._subLayers[2] = layer;
    }
    onEnter() {
        this._topbarBase.setImageTitle('txt_sys_com_zhenrong');
        this._signalChangeHeroFormation = G_SignalManager.add(SignalConst.EVENT_CHANGE_HERO_FORMATION_SUCCESS, handler(this, this._changeHeroFormation));
        this._signalPetOnTeam = G_SignalManager.add(SignalConst.EVENT_PET_ON_TEAM_SUCCESS, handler(this, this._changePetFormation));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalAvatarEquip = G_SignalManager.add(SignalConst.EVENT_AVATAR_EQUIP_SUCCESS, handler(this, this._avatarEquipSuccess));
        this._funcId2HeroReach = {};
        this._updateLeftIcons();
        this._updateLeftIconsSelectedState();
        this._updateHeroPageView();
        if (G_UserData.getTeam().getCurPos() == -1) {
            this._switchPanelView(3);
            this._updateView();
        }
        else if (G_UserData.getTeam().getCurPos() == TeamConst.PET_POS) {
            this._switchPanelView(2)
            this.getPetLayer().checkPetTrainRP()
        }
        else {
            this._switchPanelView(1);
            this._checkPosState();
            let heroLayer = this.getHeroLayer();
            if (heroLayer)
                heroLayer.checkHeroTrainRP();
            this._playEnterEffect();
            this._updateView();
        }
        this._checkReinforcementPosRP(FunctionConst.FUNC_TEAM);
    }
    onExit() {
        this._signalChangeHeroFormation.remove();
        this._signalChangeHeroFormation = null;
        this._signalPetOnTeam.remove();
        this._signalPetOnTeam = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalAvatarEquip.remove();
        this._signalAvatarEquip = null;
        for (let k in this._pageItems) {
            let item = this._pageItems[k];
            item.stopScheduler();
        }
    }
    _avatarEquipSuccess() {
        this._updateView();
    }
    _checkPosState() {
        if (this._pos) {
            if (this._pos == TeamConst.PET_POS) {
                let state = G_UserData.getTeam().getPetState()[0];
                if (state == TeamConst.STATE_OPEN) {
                    G_SceneManager.openPopup(Path.getCommonPrefab("PopupChoosePet"),function(popup:PopupChoosePet){
                        popup.setTitle(Lang.get('pet_replace_title'));
                        popup.updateUI(PopupChoosePetHelper.FROM_TYPE1, handler(this, this._changePetCallBack));
                        popup.openWithAction();
                    }.bind(this))
                    this._pos = null;
                }
            } else if (G_UserData.getTeam().getStateWithPos(this._pos) == TeamConst.STATE_OPEN) {
                let iconData = TeamViewHelper.getHeroAndPetIconData();
                if(this.getHasUseHeroCount(iconData)>=4)
                    {
                        //第五 第六
                        UIPopupHelper.popupSystemAlert(Lang.get('common_title_notice'),Lang.get("hero_shangzheng_tips"),()=>{
                            UIPopupHelper.popupChooseHero(PopupChooseHeroHelper.FROM_TYPE1, handler(this, this._changeHeroCallBack), this._pos, Lang.get("hero_replace_title"));
                            this._pos = null;
                        },null,(pop:PopupSystemAlert)=>{
                            pop.setCheckBoxVisible(false);
                        })
                    }
                    else
                {
                    UIPopupHelper.popupChooseHero(PopupChooseHeroHelper.FROM_TYPE1, handler(this, this._changeHeroCallBack), this._pos, Lang.get("hero_replace_title"));
                    this._pos = null;
                }
            }
        }
    }
    _updateLeftIcons() {
        let iconData = TeamViewHelper.getHeroAndPetIconData();
        for (let i = 0; i < iconData.length; i++) {
            let data = iconData[i];
            let icon = this._leftIcons[i] as TeamHeroBustIcon;
            if (icon) {
                icon.updateIcon(data.type, data.value, data.funcId, data.limitLevel, data.limitRedLevel);
            }
        }
        this._checkHeroIconRP();
        this._checkPetIconRP();
    }
    _updateHeroIcons() {
        let iconData = TeamViewHelper.getHeroIconData();
        for (let i in iconData) {
            let data = iconData[i];
            let icon = this._heroIcons[i];
            icon.updateIcon(data.type, data.value, data.funcId, data.limitLevel, data.limitRedLevel);
        }
        this._checkHeroIconRP();
    }
    _updatePetIcon() {
        let iconData = TeamViewHelper.getPetIconData();
        for (let i in iconData) {
            let data = iconData[i];
            let icon = this._petIcons[i];
            icon.updateIcon(data.type, data.value, data.funcId);
        }
        this._checkPetIconRP();
    }

    //更新选中框
    _updateLeftIconsSelectedState() {
        let curPos = G_UserData.getTeam().getCurPos();
        //从上到下（1-7）--》（0-6）
        for (let i = 0; i < this._leftIcons.length; i++) {
            let icon = this._leftIcons[i];
            if (i == (curPos - 1)) {
                icon.setSelected(true);
            } else {
                icon.setSelected(false);
            }
        }
        if (curPos >= 1 && curPos <= 4) {
            this._listViewLineup.scrollToTop();
        } else if (curPos >= 5 && curPos <= 7) {
            this._listViewLineup.scrollToBottom();
        }
    }
    _gotoHeroPageItem() {
        let curPos = G_UserData.getTeam().getCurPos();
        let pageIndex = TeamViewHelper.getPageIndexWithIconPos(curPos - 1);
        this._pageView.scrollToPage(pageIndex,0);
        var pages = this._pageView.getPages();
        for(var j =0;j<pages.length;j++)
        {
            if(j==pageIndex)
            pages[j].opacity = 255;
            else
            pages[j].opacity = 0;
        }
        this._playSkillAnimationOnce();
    }
    _playSkillAnimationOnce() {
        let curIndex = this._pageView.getCurrentPageIndex();
        let pageItems = this._pageView.getPages();
        for (let i in pageItems) {
            let node = pageItems[i];
            let item = node.getComponent(TeamHeroPageItem);
            if (parseInt(i) == curIndex) {
                // item.playSkillAnimationOnce();
                item.setIdleAnimation();
            } else {
                item.setIdleAnimation();
            }
        }
    }
    _updateHeroPageView() {
        let showDatas = TeamViewHelper.getHeroAndPetShowData();
        let curPos = G_UserData.getTeam().getCurPos();
        let curIndex = TeamViewHelper.getPageIndexWithIconPos(curPos - 1);
        curIndex = curIndex - 1;
        let minIndex = curIndex - 1;
        let maxIndex = curIndex + 1;
        if (minIndex < 0) {
            minIndex = 0;
        }
        if (maxIndex >= showDatas.length) {
            maxIndex = showDatas.length - 1;
        }
        let viewSize = this._pageView.node.getContentSize();
        for (let i = minIndex; i <= maxIndex; i++) {
            if (this._pageItems[i] == null) {
                let node = new cc.Node;
                let item = node.addComponent(TeamHeroPageItem) as TeamHeroPageItem;
                item.setInitData(viewSize.width, viewSize.height, handler(this, this._showHeroDetailView), i)
                this._pageItems[i] = item;
                this._pageView.insertPage(item.node, i);
                node.x = i * viewSize.width + viewSize.width/2;
                this._pageView.content.width += viewSize.width;
            }
            let info = showDatas[i];
            this._pageItems[i].updateUI(info.type, info.value, info.isEquipAvatar, info.limitLevel, info.limitRedLevel);
            // this._pageItems[i].playSkillAnimationOnce();
        }
        this._gotoHeroPageItem();
        this._updatePageItemVisible();
    }
    //获取当前角色的spine动画
    getCurHeroSpine(): [CommonHeroAvatar, TeamHeroPageItem] {
        let curIndex = this._pageView.getCurrentPageIndex();
        let item = this._pageView.getPages()[curIndex].getComponent(TeamHeroPageItem);
        let spine = item.getComponent(TeamHeroPageItem).getAvatar();
        return [
            spine,
            item
        ];
    }


    _switchPanelView(index) {
        this._curSelectedPanelIndex = index;
        let layer = this._subLayers[this._curSelectedPanelIndex];
        if (layer == null) {
            if (this._curSelectedPanelIndex == 1) {
                layer = (cc.instantiate(this._teamHeroNode) as cc.Node).getComponent(TeamHeroNode) as TeamHeroNode;
                layer.node.name = "TeamHeroNode";
            }
            else if (this._curSelectedPanelIndex == 2) {
                layer = (cc.instantiate(this._teamPetNode) as cc.Node).getComponent(TeamPetNode) as TeamPetNode;
                layer.node.name = "TeamPetNode";
            }
            else if (this._curSelectedPanelIndex == 3) {
                layer = (cc.instantiate(this._teamYokeNode) as cc.Node).getComponent(TeamYokeNode) as TeamYokeNode;
                layer.node.name = "TeamYokeNode";
            }

            if (layer) {
                layer.setInitData(this)
                this._nodeContent.addChild(layer.node);
                this._subLayers[this._curSelectedPanelIndex] = layer;
            }

        }
        for (let k in this._subLayers) {
            let subLayer = this._subLayers[k];
            if (subLayer && subLayer != layer) {
                subLayer.node.active = (false);
            }
        }
        if (layer && !layer.node.active)
            layer.node.active = (true);
        this._resetSomeWidget();
    }
    _updateView() {
        let layer = this._subLayers[this._curSelectedPanelIndex];
        if (layer) {
            if (this._curSelectedPanelIndex == 1) {
                layer.updateInfo();
            }
            else if (this._curSelectedPanelIndex == 2) {
                layer.updateInfo();
            }
            else if (this._curSelectedPanelIndex == 3) {
                let secondHeroDatas = G_UserData.getTeam().getHeroDataInReinforcements();
                let heroDatas = G_UserData.getTeam().getHeroDataInBattle();
                layer.updatePartnerIcon(secondHeroDatas);
                layer.updatePanel(heroDatas);
                layer.checkReinforcementPosRP(FunctionConst.FUNC_TEAM);
            }
        }
    }
    onPageViewEvent(sender, event) {
        if (event == cc.PageView.EventType.PAGE_TURNING && sender == this._pageView) {
            let targetIndex = this._pageView.getCurrentPageIndex();
            let targetPos = TeamViewHelper.getIconPosWithPageIndex(targetIndex) + 1;
            let curPos = G_UserData.getTeam().getCurPos();
            if (targetPos != curPos) {
                G_UserData.getTeam().setCurPos(targetPos);
                this._updateLeftIconsSelectedState();
                this._updateHeroPageView();
                if (targetPos == TeamConst.PET_POS) {
                    this._switchPanelView(2);
                } else {
                    this._switchPanelView(1);
                }
                this._updateView();
            }
        }
    }
    onTouchCallBackStart(): void {
        this._isPageViewMoving = true;
        this._updatePageItemVisible();
    }
    onTouchCallBackEndOrCanceled(): void {
        this._isPageViewMoving = false;
    }
    _updatePageItemVisible() {
        let curPos = G_UserData.getTeam().getCurPos();
        let curIndex = TeamViewHelper.getPageIndexWithIconPos(curPos - 1);
        for (let i in this._pageItems) {
            let item = this._pageItems[i];
            if (parseInt(i) == curIndex) {
             //   item.node.active = (true);
                // item.playSkillAnimationOnce();
            } else {
              //  item.node.active = (this._isPageViewMoving);
            }
        }
    }
    private getHasUseHeroCount(iconData:Array<any>):number{
        let count = 0;
        for(let j = 1;j<=iconData.length;j++)
        {
            let info = iconData[j-1];
            if(info.type == TypeConvertHelper.TYPE_HERO)
            {
                let state = G_UserData.getTeam().getStateWithPos(j);
                if (state == TeamConst.STATE_HERO) count++;
            }
        }
        return count;
    }
    _onLeftIconClicked(pos) {
        let iconData = TeamViewHelper.getHeroAndPetIconData();
        //下标从0走
        //0-5--->1-6
        let info = iconData[pos - 1];
        if (info.type == TypeConvertHelper.TYPE_HERO) {
            let state = G_UserData.getTeam().getStateWithPos(pos);
            if (state == TeamConst.STATE_HERO) {
                let curPos = G_UserData.getTeam().getCurPos();
                if (pos == curPos) {
                    return;
                }
                G_UserData.getTeam().setCurPos(pos);
                this._updateLeftIconsSelectedState();
                this._updateHeroPageView();
                this._switchPanelView(1);
                this._updateView();
            }
            else if (state == TeamConst.STATE_OPEN) {
                let isEmpty = PopupChooseHeroHelper.checkIsEmpty(PopupChooseHeroHelper.FROM_TYPE1)
                if (isEmpty)
                    G_Prompt.showTip(Lang.get("hero_popup_list_empty_tip" + PopupChooseHeroHelper.FROM_TYPE1))
                else {
                    if(this.getHasUseHeroCount(iconData)>=4)
                    {
                        //第五 第六
                        UIPopupHelper.popupSystemAlert(Lang.get('common_title_notice'),Lang.get("hero_shangzheng_tips"),()=>{
                            UIPopupHelper.popupChooseHero(PopupChooseHeroHelper.FROM_TYPE1, handler(this, this._changeHeroCallBack), pos, Lang.get("hero_replace_title"));
                        },null,(pop:PopupSystemAlert)=>{
                            pop.setCheckBoxVisible(false);
                        })
                    }
                    else
                    {
                        UIPopupHelper.popupChooseHero(PopupChooseHeroHelper.FROM_TYPE1, handler(this, this._changeHeroCallBack), pos, Lang.get("hero_replace_title"));
                    }
                }
            }
            else if (state == TeamConst.STATE_LOCK) {
                G_Prompt.showTip(Lang.get('team_not_unlock_tip'));
            }
        } else if (info.type == TypeConvertHelper.TYPE_PET) {
            let ret = G_UserData.getTeam().getPetState();
            let state = ret[0];
            let funcLevelInfo = ret[1];
            if (state == TeamConst.STATE_HERO) {
                G_UserData.getTeam().setCurPos(pos);
                this._updateLeftIconsSelectedState();
                this._updateHeroPageView();
                this._switchPanelView(2);
                this._updateView();
            }
            else if (state == TeamConst.STATE_OPEN) {
                let isEmpty = PopupChoosePetHelper.checkIsEmpty(PopupChoosePetHelper.FROM_TYPE1)
                if (isEmpty) {
                    G_Prompt.showTip(Lang.get("pet_popup_list_empty_tip" + PopupChoosePetHelper.FROM_TYPE1));
                }
                else {
                    UIPopupHelper.popupChoosePet(PopupChoosePetHelper.FROM_TYPE1, handler(this, this._changePetCallBack), Lang.get("pet_replace_title"))
                }
            }
            else if (state == TeamConst.STATE_LOCK) {
                let level = funcLevelInfo.level;
                G_Prompt.showTip(Lang.get('team_pet_unlock_level', { level: level }));
            }
        }
    }
    _onButtonJiBanClicked() {
        let funcId = FunctionConst['FUNC_REINFORCEMENTS'];
        if (!FunctionCheck.funcIsOpened(funcId)[0]) {
            let comment = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(funcId).comment;
            G_Prompt.showTip(comment);
            return;
        }
        G_UserData.getTeam().setCurPos(-1);
        this._updateLeftIconsSelectedState();
        this._switchPanelView(3);
        this._updateView();
    }

    //排兵布阵
    onButtonEmbattleClicked() {
        G_SceneManager.openPopup(Path.getPrefab("PopupEmbattle","team"),function(pop:PopupEmbattle){
              pop.openWithAction();
        });
    }
  
    _showHeroDetailView(index) {
        let showDatas = TeamViewHelper.getHeroAndPetShowData();
        let info = showDatas[index];
        if (info.type == TypeConvertHelper.TYPE_HERO) {
            var curPos = G_UserData.getTeam().getCurPos();
            var heroId = G_UserData.getTeam().getHeroIdWithPos(curPos);
            G_SceneManager.showScene('heroDetail', heroId, HeroConst.HERO_RANGE_TYPE_2);
        } else if (info.type == TypeConvertHelper.TYPE_PET) {
            G_SceneManager.showScene('petDetail', info.id, PetConst.PET_RANGE_TYPE_2);
        }
    }
    _changePetFormation(eventName, petId: number) {
        petId = G_UserData.getBase().getOn_team_pet_id();
        let curPos = petId == 0 && 1 || TeamConst.PET_POS;
        let panelIndex = petId == 0 && 1 || 2;
        G_UserData.getTeam().setCurPos(curPos);
        this._updatePetIcon();
        this._updateLeftIconsSelectedState();
        this._updateHeroPageView();
        this._switchPanelView(panelIndex);
        this._updateView();
    }
    _changeHeroFormation(eventName, pos, oldHeroId) {
        G_UserData.getTeam().setCurPos(pos);
        this._updateHeroIcons();
        this._updateLeftIconsSelectedState();
        this._updateHeroPageView();
        this._switchPanelView(1);
    }
    setNeedPopupEquipReplace(showRP) {
        let layer = this.getHeroLayer();
        if (layer) {
            layer.setNeedPopupEquipReplace(showRP);
        }
    }
    setNeedEquipClearPrompt(need) {
        let layer = this.getHeroLayer();
        if (layer) {
            layer.setNeedEquipClearPrompt(need);
        }
    }
    setNeedPopupTreasureReplace(showRP) {
        let layer = this.getHeroLayer();
        if (layer) {
            layer.setNeedPopupTreasureReplace(showRP);
        }
    }
    setNeedTreasureRemovePrompt(need) {
        let layer = this.getHeroLayer();
        if (layer) {
            layer.setNeedTreasureRemovePrompt(need);
        }
    }
    setNeedPopupInstrumentReplace(showRP) {
        let layer = this.getHeroLayer();
        if (layer) {
            layer.setNeedPopupInstrumentReplace(showRP);
        }
    }
    setNeedInstrumentRemovePrompt(need) {
        let layer = this.getHeroLayer();
        if (layer) {
            layer.setNeedInstrumentRemovePrompt(need);
        }
    }
    setNeedPopupHorseReplace(showRP) {
        let layer = this.getHeroLayer();
        if (layer) {
            layer.setNeedPopupHorseReplace(showRP);
        }
    }
    setNeedHorseRemovePrompt(need) {
        let layer = this.getHeroLayer();
        if (layer) {
            layer.setNeedHorseRemovePrompt(need);
        }
    }
    _changeHeroCallBack(heroId, param) {
        let pos = unpack(param)[0];
        G_UserData.getTeam().c2sChangeHeroFormation(pos, heroId);
    }
    _changePetCallBack(petId, param, petData) {
        G_UserData.getPet().c2sPetOnTeam(petId, 1);
    }
    _onEventRedPointUpdate(eventName, funcId) {
        this._checkHeroIconRP(funcId);
        this._checkReinforcementPosRP(funcId);
        this._checkPetIconRP(funcId);
    }
    _checkHeroIconRP(funcId?) {
        function checkTeam(pos) {
            let state = G_UserData.getTeam().getStateWithPos(pos);
            if (state == TeamConst.STATE_OPEN) {
                let reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TEAM, 'posRP');
                if (reach) {
                    return true;
                }
            }
            return false;
        }
        function checkAvatar(pos) {
            if (pos != 1) {
                return false;
            }
            let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_AVATAR);
            return reach;
        }
        function checkHeroLevelUp(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE1, heroUnitData);
                return reach;
            }
            return false;
        }
        function checkHeroBreak(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE2, heroUnitData);
                return reach;
            }
            return false;
        }
        function checkHeroAwake(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE3, heroUnitData);
                return reach;
            }
            return false;
        }
        function checkHeroLimit(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE4, heroUnitData);
                return reach;
            }
            return false;
        }
        function checkEquip(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, 'posRP', pos);
                return reach;
            }
            return false;
        }
        function checkTreasure(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, 'posRP', pos);
                return reach;
            }
            return false;
        }
        function checkInstrument(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let heroBaseId = unitData.getBase_id();
                let param = {
                    pos: pos,
                    heroBaseId: heroBaseId
                };
                let reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, 'posRP', param);
                return reach;
            }
            return false;
        }
        function checkHorse(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let heroBaseId = unitData.getBase_id();
                let param = {
                    pos: pos,
                    heroBaseId: heroBaseId
                };
                let reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE, 'posRP', param);
                return reach;
            }
            return false;
        }
        function checkEquipStrengthen(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1, pos);
                return reach;
            }
            return false;
        }
        function checkEquipRefine(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, pos);
                return reach;
            }
            return false;
        }
        function checkTreasureUpgrade(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1, pos);
                return reach;
            }
            return false;
        }
        function checkTreasureRefine(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, pos);
                return reach;
            }
            return false;
        }
        function checkTreasureLimit(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4, pos);
                return reach;
            }
            return false;
        }
        function checkInstrumentAdvance(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, pos);
                return reach;
            }
            return false;
        }
        function checkHorseUpStar(pos) {
            let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_TRAIN, pos);
            return reach;
        }
        function checkKarma(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_KARMA, heroUnitData);
                return reach;
            }
            return false;
        }

        function checkTactics(pos) {
            var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            // if (heroId > 0) {
            //     var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TACTICS, 'posRP', pos);
            //     return reach;
            // }
            return false;
        }

        function checkHeroChange(pos) {
            let heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
            if (heroId > 0) {
                let heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                let reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_CHANGE, heroUnitData);
                return reach;
            }
            return false;
        }
        let checkFuncs = {
            [FunctionConst.FUNC_TEAM]: checkTeam,
            [FunctionConst.FUNC_EQUIP]: checkEquip,
            [FunctionConst.FUNC_TREASURE]: checkTreasure,
            [FunctionConst.FUNC_INSTRUMENT]: checkInstrument,
            [FunctionConst.FUNC_HORSE]: checkHorse,
            [FunctionConst.FUNC_AVATAR]: checkAvatar,
            [FunctionConst.FUNC_HERO_TRAIN_TYPE1]: checkHeroLevelUp,
            [FunctionConst.FUNC_HERO_TRAIN_TYPE2]: checkHeroBreak,
            [FunctionConst.FUNC_HERO_TRAIN_TYPE3]: checkHeroAwake,
            [FunctionConst.FUNC_HERO_TRAIN_TYPE4]: checkHeroLimit,
            [FunctionConst.FUNC_EQUIP_TRAIN_TYPE1]: checkEquipStrengthen,
            [FunctionConst.FUNC_EQUIP_TRAIN_TYPE2]: checkEquipRefine,
            [FunctionConst.FUNC_TREASURE_TRAIN_TYPE1]: checkTreasureUpgrade,
            [FunctionConst.FUNC_TREASURE_TRAIN_TYPE2]: checkTreasureRefine,
            [FunctionConst.FUNC_TREASURE_TRAIN_TYPE4]: checkTreasureLimit,
            [FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1]: checkInstrumentAdvance,
            [FunctionConst.FUNC_HORSE_TRAIN]: checkHorseUpStar,
            [FunctionConst.FUNC_HERO_KARMA]: checkKarma,
            [FunctionConst.FUNC_TACTICS]: checkTactics,
            [FunctionConst.FUNC_HERO_CHANGE]: checkHeroChange
        };
        let redPointFuncId = [
            FunctionConst.FUNC_TEAM,
            FunctionConst.FUNC_EQUIP,
            FunctionConst.FUNC_TREASURE,
            FunctionConst.FUNC_INSTRUMENT,
            FunctionConst.FUNC_HORSE,
            FunctionConst.FUNC_AVATAR,
            FunctionConst.FUNC_HERO_TRAIN_TYPE1,
            FunctionConst.FUNC_HERO_TRAIN_TYPE2,
            FunctionConst.FUNC_HERO_TRAIN_TYPE3,
            FunctionConst.FUNC_HERO_TRAIN_TYPE4,
            FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1,
            FunctionConst.FUNC_HORSE_TRAIN,
            FunctionConst.FUNC_HERO_KARMA,
            FunctionConst.FUNC_TACTICS,
            FunctionConst.FUNC_HERO_CHANGE
        ];
        let arrowFuncId = [
            FunctionConst.FUNC_EQUIP_TRAIN_TYPE1,
            FunctionConst.FUNC_EQUIP_TRAIN_TYPE2,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE1,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE2,
            FunctionConst.FUNC_TREASURE_TRAIN_TYPE3
        ];
        for (let i = 0; i < this._heroIcons.length; i++) {
            let heroIcon = this._heroIcons[i];
            let reachArrow = false;
            let reachRedPoint = false;
            for (let j = 0; j < arrowFuncId.length; j++) {
                funcId = arrowFuncId[j];
                let func = checkFuncs[funcId];
                if (func) {
                    let reach = func(i + 1);
                    this._funcId2HeroReach[funcId] = reach;
                    if (reach) {
                        reachArrow = true;
                        break;
                    }
                }
            }
            for (let j in redPointFuncId) {
                funcId = redPointFuncId[j];
                let func = checkFuncs[funcId];
                if (func) {
                    let reach = func(i + 1);
                    this._funcId2HeroReach[funcId] = reach;
                    if (reach) {
                        reachRedPoint = true;
                        break;
                    }
                }
            }
            if (reachArrow) {
                heroIcon.showRedPoint(reachRedPoint);
                heroIcon.showImageArrow(!reachRedPoint);
            } else {
                heroIcon.showRedPoint(reachRedPoint);
                heroIcon.showImageArrow(false);
            }
        }
    }
    _checkPetIconRP(funcId?) {
        for (let i in this._petIcons) {
            let petIcon = this._petIcons[i];
            let reach = false;
            let petId = G_UserData.getBase().getOn_team_pet_id();
            if (petId && petId > 0) {
                let petUnitData = G_UserData.getPet().getUnitDataWithId(petId);
                let reach1 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE1, petUnitData);
                let reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE2, petUnitData);
                let reach3 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE3, petUnitData);
                reach = reach1 || reach2 || reach3;
            }
            petIcon.showRedPoint(reach);
        }
    }
    _checkReinforcementPosRP(funcId) {
        if (funcId && funcId == FunctionConst.FUNC_TEAM) {
            let reach = RedPointHelper.isModuleSubReach(funcId, 'reinforcementEmptyRP');
            this._partnerButton.showRedPoint(reach);
        }
    }
    _playEnterEffect() {
        let _this = this;
        let effectFunction = function (effect) {
            return new cc.Node();
        }
        let eventFunction = function (event) {
            if (event == 'top_down') {
                _this._playTopAndDownEnter();
            } else if (event == 'finish') {
                _this._onEnterEffectFinish();
            }
            else if (event == "ren") {
                _this._playHeroEnter()
            }
            else if (event == "left_right") {
                _this._playLeftHeroIconEnter()
                _this._playRightPanelEnter();
            }
            else if (event == "zhanli") {
                _this._playPowerEnter();
            }
            else if (event == "left_right_icon") {
                _this._playEquipAndTreasureIconEnter();
            }
            else if (event == "mingcheng") {
                _this._playBasicInfoEnter();
                _this._playAwakeStarEnter();
            }
            else if (event == "shenbing") {
                _this._playInstrumentIconEnter();
                _this._playHorseIconEnter();
                _this._playHistoryHeroIconEnter();
            }

        }
        this._resetEffectNode();
        this._hideAllEffectNode();
        if (this._enterMoving) {
            this._enterMoving.node.runAction(cc.destroySelf());
            this._enterMoving = null;
        }
        this._enterMoving = G_EffectGfxMgr.createPlayMovingGfx(this._nodeTotalEffect, 'moving_zhenrong_ui', effectFunction, eventFunction, false);
    }
    _resetEffectNode() {
        for (let i in this._enterEffects) {
            let effect = this._enterEffects[i];
            effect.reset();
        }
        this._enterEffects = [];
    }
    _hideAllEffectNode() {
        this._topbarBase.node.active = (false);
        this._nodeInDown.active = (false);
        this._pageView.node.active = (false);
        this._nodeAwake.active = false;
        this._hideLeftHeroIcon();
        this._hideRightPanel();
        this._hidePowerPanel();
        this._hideEquipAndTreasureIcon();
        this._hideTopPanel();
        this._hideInstrumentPanel();
        this._hideHorsePanel();
        this._hideHistoryHeroPanel();
    }
    _hideLeftHeroIcon() {
        for (let i in this._iconBgs) {
            let iconBg = this._iconBgs[i];
            iconBg.active = (false);
        }
    }
    _hideRightPanel() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer) {
            heroLayer._panelAttr.active = (false);
            heroLayer._panelBasic.active = (false);
            // heroLayer._panelTactics.setVisible(false);
            heroLayer._panelKarma.active = (false);
            heroLayer._nodePanelYoke.active = (false);
        }
    }
    _hidePowerPanel() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer) {
            heroLayer._nodeInPower.active = (false);
        }
    }
    _hideEquipAndTreasureIcon() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer) {
            for (let i = 1; i <= 4; i++) {
                heroLayer['_fileNodeEquip' + i].node.active = (false);
            }
            for (let i = 1; i <= 2; i++) {
                heroLayer['_fileNodeTreasure' + i].node.active = (false);
            }
        }
    }
    _hideTopPanel() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer) {
            heroLayer._nodeInTop.active = (false);
        }
    }
    _hideInstrumentPanel() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer) {
            heroLayer._nodeInInstrument.active = (false);
        }
    }
    _hideHorsePanel() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer) {
            heroLayer._nodeInHorse.active = (false);
        }
    }
    _hideHistoryHeroPanel() {
        var heroLayer = this.getHeroLayer();
        if (heroLayer) {
            heroLayer._nodeInHistoryHero.active = (false);
        }
    }
    _playTopAndDownEnter() {
        this._topbarBase.node.active = (true);
        this._nodeInDown.active = (true);
        this._enterEffectTop = G_EffectGfxMgr.applySingleGfx(this._topbarBase.node, 'smoving_shangdian_top', null, null, null);
        this._enterEffectDown = G_EffectGfxMgr.applySingleGfx(this._nodeInDown, 'smoving_zhenrong_down', null, null, null);
        this._enterEffects.push(this._enterEffectTop);
        this._enterEffects.push(this._enterEffectDown);
    }
    update(): void {

        let s = this._subLayers[1];
        let pos = this._pageView.node.position;
    }
    _playHeroEnter() {
        this._pageView.node.active = (true);
        this._pageView.node.opacity = 0;
        this._enterEffectHero = G_EffectGfxMgr.applySingleGfx(this._pageView.node, 'smoving_shangdian_alpha', null, null, null);
        this._enterEffects.push(this._enterEffectHero);
    }
    _playLeftHeroIconEnter() {
        let nodes: Array<cc.Node> = [];
        let _this = this;
        for (let i in this._iconBgs) {
            let iconBg = this._iconBgs[i];
            nodes.push(iconBg);
        }
        let actions = [];
        for (let i in nodes) {
            let node = nodes[i];
            let action1 = cc.callFunc(function (cur, data: any) {
                let node:cc.Node = data.node;
                let _this = data._this;
                let i = data.i;
                node.active = true;
                node.opacity = 0;
                _this['_enterEffectHeroIcon' + i] = G_EffectGfxMgr.applySingleGfx(node, 'smoving_zhenrong_left', null, null, null);
                _this._enterEffects.push(_this['_enterEffectHeroIcon' + i]);
            }, null, { i: i, node: node, _this: this });
            let action2 = cc.delayTime(0.12);
            actions.push(action1);
            if (parseInt(i) != nodes.length-1) {
                actions.push(action2);
            }
        }
        let action = cc.sequence(actions);
        this._nodeTotalEffect.runAction(action);
    }
    _playRightPanelEnter() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer == null) {
            return;
        }
        let nodes: Array<cc.Node> = [
            heroLayer._panelBasic,
            heroLayer._panelKarma,
            heroLayer._nodePanelYoke
        ];
        // var [isTacticsOpen] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TACTICS);
        // if (isTacticsOpen) {
        //    nodes.splice( 2, 0, heroLayer._panelTactics);
        // }
        let actions = [];
        let _this = this;
        let action0 = cc.callFunc(function (cur, data: any) {
            let _this = data._this;
            let heroLayer = data.heroLayer;
            heroLayer._panelAttr.active = (true);
            heroLayer._panelAttr.opacity = 0;
            _this._enterEffectPanelAttr = G_EffectGfxMgr.applySingleGfx(heroLayer._panelAttr, 'smoving_shangdian_alpha', null, null, null);
            _this._enterEffects.push(_this._enterEffectPanelAttr);
        }, null, { heroLayer: heroLayer, _this: _this });
        let action2 = cc.delayTime(0.12);
        actions.push(action0);
        actions.push(action2);
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            let action1 = cc.callFunc(function (cur, data: any) {
                let node = data.node;
                let i = data.i;
                let _this = data._this;
                node.active = (true);
                node.opacity = 0;
                _this['_enterEffectRight' + i] = G_EffectGfxMgr.applySingleGfx(node, 'smoving_zhenrong_right', null, null, null);
                _this._enterEffects.push(_this['_enterEffectRight' + i]);
            }, null, { node: node, _this: _this, i: i });
            actions.push(action1);
            if (i != nodes.length - 1) {
                actions.push(action2);
            }
        }
        let action = cc.sequence(actions);
        this._nodeTotalEffect.runAction(action);
    }
    _playPowerEnter() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer == null) {
            return;
        }
        heroLayer._nodeInPower.active = (true);
        heroLayer._nodeInPower.opacity = 0;
        this._enterEffectPower = G_EffectGfxMgr.applySingleGfx(heroLayer._nodeInPower, 'smoving_zhenrong_zhanli', null, null, null);
        this._enterEffects.push(this._enterEffectPower);
    }
    _playEquipAndTreasureIconEnter() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer == null) {
            return;
        }
        let leftNodes: Array<cc.Node> = [
            heroLayer._fileNodeEquip1.node,
            heroLayer._fileNodeEquip3.node,
            heroLayer._fileNodeTreasure1.node
        ];
        let rightNodes: Array<cc.Node> = [
            heroLayer._fileNodeEquip2.node,
            heroLayer._fileNodeEquip4.node,
            heroLayer._fileNodeTreasure2.node
        ];
        let leftActions = [];
        let _this = this;
        let actionDelay = cc.delayTime(0.12);

        for (let i in leftNodes) {
            let node = leftNodes[i];
            let action = cc.callFunc(function (cur, data: any) {
                let i = data.i;
                let _this = data._this;
                let node = data.node;
                node.active = (true);
                node.opacity = 0;
                _this['_enterEffectLeftIcon' + i] = G_EffectGfxMgr.applySingleGfx(node, 'smoving_zhenrong_left_icon', null, null, null);
                _this._enterEffects.push(_this['_enterEffectLeftIcon' + i]);
            }, null, { i: i, _this: _this, node: node });
            leftActions.push(action);
            if (parseInt(i) != leftNodes.length-1) {
                leftActions.push(actionDelay);
            }
        }
        let rightActions = [];
        actionDelay = cc.delayTime(0.12);

        for (let i in rightNodes) {
            let node = rightNodes[i];
            let action = cc.callFunc(function (cur, data: any) {
                let i = data.i;
                let _this = data._this;
                let node = data.node;
                node.active = (true);
                node.opacity = 0;
                _this['_enterEffectRightIcon' + i] = G_EffectGfxMgr.applySingleGfx(node, 'smoving_zhenrong_right_icon', null, null, null);
                _this._enterEffects.push(_this['_enterEffectRightIcon' + i]);
            }, null, { i: i, _this: _this, node: node });
            rightActions.push(action);
            if (parseInt(i) != rightNodes.length-1) {
                rightActions.push(actionDelay);
            }
        }
        let leftAction = cc.sequence(unpack(leftActions));
        let rightAction = cc.sequence(unpack(rightActions));
        this._nodeTotalEffect.runAction(leftAction);
        this._nodeTotalEffect.runAction(rightAction);
    }
    _playBasicInfoEnter() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer == null) {
            return;
        }
        heroLayer._nodeInTop.active = (true);
        heroLayer._nodeInTop.opacity = 0;
        this._enterEffectBasicInfo = G_EffectGfxMgr.applySingleGfx(heroLayer._nodeInTop, 'smoving_zhenrong_mingcheng', null, null, null);
        this._enterEffects.push(this._enterEffectBasicInfo);
    }

    _playAwakeStarEnter () {
        this._nodeAwake.active = (false);
        this._enterEffectAwakeStar = G_EffectGfxMgr.applySingleGfx(this._nodeAwake, 'smoving_zhenrong_mingcheng', null, null, null);
        table.insert(this._enterEffects, this._enterEffectAwakeStar);
    }
    _playInstrumentIconEnter() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer == null) {
            return;
        }
        heroLayer._nodeInInstrument.active = (true);
        heroLayer._nodeInInstrument.opacity = 0;
        this._enterEffectInstrument = G_EffectGfxMgr.applySingleGfx(heroLayer._nodeInInstrument, 'smoving_zhenrong_shenbing', null, null, null);
        this._enterEffects.push(this._enterEffectInstrument);
    }
    _playHorseIconEnter() {
        let heroLayer = this.getHeroLayer();
        if (heroLayer == null) {
            return;
        }
        heroLayer._nodeInHorse.active = (true);
        heroLayer._nodeInHorse.opacity = 0;
        this._enterEffectHorse = G_EffectGfxMgr.applySingleGfx(heroLayer._nodeInHorse, 'smoving_zhenrong_shenbing', null, null, null);
        this._enterEffects.push(this._enterEffectHorse);
    }

    _playHistoryHeroIconEnter() {
        var heroLayer = this.getHeroLayer();
        if (heroLayer == null) {
            return;
        }
        heroLayer._nodeInHistoryHero.active = (true);
        this._enterEffectHistoryHero = G_EffectGfxMgr.applySingleGfx(heroLayer._nodeInHistoryHero, 'smoving_zhenrong_shenbing', null, null, null);
        table.insert(this._enterEffects, this._enterEffectHistoryHero);
    }
    _onEnterEffectFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
    }
    getHeroLayer(): TeamHeroNode {
        let layer = this._subLayers[1];
        return layer;
    }
    getPetLayer(): TeamPetNode {
        let layer = this._subLayers[2];
        return layer;
    }
    getYokeLayer() {
        let layer = this._subLayers[3];
        return layer;
    }
    checkHeroTrainRP(curHeroData) {
        if (this._curSelectedPanelIndex != 1) {
            this._imageTip.node.active = (false);
            return;
        }
        let reach1 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE1, curHeroData);
        let reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE2, curHeroData);
        let resLevelUp = 'img_hint02b';
        let resRankUp = 'img_hint01b';
        if (HeroGoldHelper.isPureHeroGold(curHeroData)) {
            resRankUp = 'img_hint06b';
            var ret = HeroGoldHelper.heroGoldNeedRedPoint(curHeroData);
            var none = ret[0];
            reach2 = ret[1];
        }
        this._imageTip.node.setPosition(this._imageTipInitPos);
        if (reach1 == true && reach2 == true) {
            this._imageTip.node.active = (true);
            let res1 = Path.getTextSignet(resLevelUp);
            let res2 = Path.getTextSignet(resRankUp);
            TeamViewHelper.playSkewFloatSwitchEffect(this._imageTip.node, res1, res2);
        }
        else if (reach1 == true) {
            this._imageTip.node.active = (true)
            let res = Path.getTextSignet(resLevelUp)
            this._imageTip.node.addComponent(CommonUI).loadTexture(res)
            TeamViewHelper.playSkewFloatEffect(this._imageTip.node);
        }
        else if (reach2 == true) {
            this._imageTip.node.active = (true)
            let res = Path.getTextSignet(resRankUp)
            this._imageTip.node.addComponent(CommonUI).loadTexture(res)
            TeamViewHelper.playSkewFloatEffect(this._imageTip.node);
        }
        else {
            this._imageTip.node.active = (false);
        }
    }
    checkPetTrainRP(curPetData) {
        if (curPetData == null) {
            this._imageTip.node.active = (false);
            return;
        }
        if (this._curSelectedPanelIndex != 2) {
            this._imageTip.node.active = (false);
            return;
        }
        let reach1 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE1, curPetData);
        let reach2 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE2, curPetData);
        let reach3 = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE3, curPetData);
        this._imageTip.node.setPosition(this._imageTipInitPos);
        if (reach1 == true && reach2 == true) {
            this._imageTip.node.active = (true);
            let res1 = Path.getTextSignet('img_hint02b');
            let res2 = Path.getTextSignet('img_hint05b');
            TeamViewHelper.playSkewFloatSwitchEffect(this._imageTip.node, res1, res2);
        }
        else if (reach1 == true) {
            this._imageTip.node.active = (true)
            let res = Path.getTextSignet("img_hint02b")
            this._imageTip.node.addComponent(CommonUI).loadTexture(res)
            TeamViewHelper.playSkewFloatEffect(this._imageTip.node)
        }
        else if (reach2 == true) {
            this._imageTip.node.active = (true)
            let res = Path.getTextSignet("img_hint05b")
            this._imageTip.node.addComponent(CommonUI).loadTexture(res)
            TeamViewHelper.playSkewFloatEffect(this._imageTip.node);
        }

        else {
            this._imageTip.node.active = (false);
        }
    }
    _resetSomeWidget() {
        let isShow = this._curSelectedPanelIndex == 1 || this._curSelectedPanelIndex == 2;
        this._panelMid.active = (isShow);
        if (this._curSelectedPanelIndex == 3) {
            this._imageTip.node.active = (false);
        }
    }

}