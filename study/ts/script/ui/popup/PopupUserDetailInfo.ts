import { FunctionConst } from "../../const/FunctionConst";
import TeamConst from "../../const/TeamConst";
import { UserDetailData } from "../../data/UserDetailData";
import TeamHeroBustIcon from "../../scene/view/team/TeamHeroBustIcon";
import TeamHeroIcon from "../../scene/view/team/TeamHeroIcon";
import TeamHeroPageItem from "../../scene/view/team/TeamHeroPageItem";
import TeamPartnerButton from "../../scene/view/team/TeamPartnerButton";
import UserDetailHeroNode from "../../scene/view/team/UserDetailHeroNode";
import UserDetailPetNode from "../../scene/view/team/UserDetailPetNode";
import { UserDetailViewHelper } from "../../scene/view/team/UserDetailViewHelper";
import UserYokeNode from "../../scene/view/team/UserYokeNode";
import { handler } from "../../utils/handler";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import CommonHeroPower from "../component/CommonHeroPower";
import CommonMainMenu from "../component/CommonMainMenu";
import CommonNormalLargePop from "../component/CommonNormalLargePop";
import CommonUI from "../component/CommonUI";
import PopupBase from "../PopupBase";
import CommonHeroStar from "../component/CommonHeroStar";


var LIST_LINE_WIDTH = 90;
var LIST_LINE_HEIGHT_NORMAL = 508;
var LIST_LINE_HEIGHT_JADE = 416;
var SWItCH_HERO_NODE = 1;
var SWItCH_PET_NODE = 2;
var SWItCH_YOKE_NODE = 3;
var SWItCH_JADE_NODE = 4;
var LIST_NORMAL = 1;
var LIST_JADE = 2;
const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupUserDetailInfo extends PopupBase {


    @property({ type: CommonNormalLargePop, visible: true })
    _nodeBg: CommonNormalLargePop = null;

    @property({ type: cc.ScrollView, visible: true })
    _listViewLineup: cc.ScrollView = null;

    @property({ type: cc.PageView, visible: true })
    _pageView: cc.PageView = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBackground: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _imageAwakeBg: cc.Sprite = null;
    @property({ type: CommonHeroStar, visible: true })
    _nodeHeroStar: CommonHeroStar = null;

    @property({ type: cc.Node, visible: true })
    _nodeContent: cc.Node = null;

    @property({ type: CommonHeroPower, visible: true })
    _nodePower: CommonHeroPower = null;









    private _message: any;
    private _power: number;
    private _pos: number;
    private _subLayers: any;
    private _curSelectedPanelIndex: number;
    private _detailData: UserDetailData;
    private _heroCount: number;
    private _isPageViewMoving: boolean;
    private _leftIcons: Array<any>;
    private _heroIcons: Array<any>;
    private _pageItems: Array<TeamHeroPageItem>;

    private _teamHeroBustIconPrefab: any;
    private _teamheroIconPrefab: any;
    private _commonMainMenu: any;
    private _teamPartnerButton: any;
    private _petButton: CommonMainMenu;
    private _partnerButton: TeamPartnerButton;
    private _userDetailPetNode: any;
    private _userDetailHeroNode: any;
    private _userYokeNode: any;

    protected preloadResList = [
        { path: Path.getCommonPrefab("CommonMainMenu"), type: cc.Prefab },
        { path: Path.getCommonPrefab("CommonHeroAvatar"), type: cc.Prefab },
        { path: Path.getCommonPrefab("CommonDetailTitleWithBg"), type: cc.Prefab },
        { path: Path.getPrefab("TeamHeroBustIcon", "team"), type: cc.Prefab },
        { path: Path.getPrefab("TeamHeroIcon", "team"), type: cc.Prefab },
        { path: Path.getPrefab("UserDetailPetSingle", "team"), type: cc.Prefab },
        { path: Path.getPrefab("TeamPartnerButton", "team"), type: cc.Prefab },
        { path: Path.getPrefab("TeamYokeDynamicModule", "team"), type: cc.Prefab },
        { path: Path.getPrefab("TeamYokeConditionNode", "team"), type: cc.Prefab },
        // {path:Path.getPrefab("UserDetailHeroNode","team"),type:cc.Prefab},
        // {path:Path.getPrefab("UserDetailPetNode","team"),type:cc.Prefab},
        // {path:Path.getPrefab("UserYokeNode","team"),type:cc.Prefab},
        { path: Path.getPrefab("SilkbagIcon", "silkbag"), type: cc.Prefab }
    ];
    public setInitData(message, power?) {
        this._message = message;
        this._power = power;
    }
    onCreate() {
        this._teamHeroBustIconPrefab = cc.resources.get(Path.getPrefab("TeamHeroBustIcon", "team"));
        this._teamheroIconPrefab = cc.resources.get(Path.getPrefab("TeamHeroIcon", "team"));
        this._commonMainMenu = cc.resources.get(Path.getCommonPrefab("CommonMainMenu"));
        this._teamPartnerButton = cc.resources.get(Path.getPrefab("TeamPartnerButton", "team"));
        this._initData();
        this._initView();
    }
    onEnter() {
        this._updateLeftIcons();
        this._updateHeroIconsSelectedState();
        this._updateHeroPageView();
        this.switchPanelView(1);
        this._listViewLineup.scrollToTop();
    }
    onExit() {
    }
    _initData() {
        this._pos = 1;
        this._subLayers = {};
        this._curSelectedPanelIndex = 0;
        this._detailData = new UserDetailData();
        this._detailData.updateData(this._message);
        this._heroCount = this._detailData.getHeroCount();
        this._isPageViewMoving = false;
    }
    _initView() {
        this._nodeBg.setTitle(this._detailData.getName());
        this._nodeBg.addCloseEventListener(handler(this, this._onButtonClose));
        this._nodeBg.setTitleSysFont();
        this._nodeBg.setTitleFontSize(28);
        var createIcon = function (icon: cc.Node, isHeroBust?) {
            var iconBg = new cc.Node();
            var iconBgSize = cc.size(90, 90);
            if (isHeroBust) {
                iconBgSize = cc.size(100, 105);
            }
            iconBg.setContentSize(iconBgSize);
            icon.setScale(0.84);
            icon.setPosition(cc.v2(iconBgSize.width / 2, iconBgSize.height / 2));
            iconBg.addChild(icon);
            return [
                iconBg,
                icon
            ];
        }
        // this._listViewLineup.setScrollBarEnabled(false);
        this._leftIcons = [];
        this._heroIcons = [];
        for (var i = 1; i <= 6; i++) {
            if (i <= 6) {
                var thb = (cc.instantiate(this._teamHeroBustIconPrefab) as cc.Node).getComponent(TeamHeroBustIcon);
                thb.setInitData(i, handler(this, this._onLeftIconClicked));
                var icon = thb;
                var iconBg = createIcon(icon.node, true)[0];
                UIHelper.updateCurstomListSize(this._listViewLineup.content, iconBg)
                this._leftIcons.push(icon);
                this._heroIcons.push(icon);
            } else if (this._detailData.funcIsShow(FunctionConst.FUNC_PET_HOME)) {
                var thi = (cc.instantiate(this._teamheroIconPrefab) as cc.Node).getComponent(TeamHeroIcon);
                thi.setInitData(i, handler(this, this._onLeftIconClicked), true);
                var iconBg1 = createIcon(thi.node)[0];
                UIHelper.updateCurstomListSize(this._listViewLineup.content, iconBg1)
                this._leftIcons.push(icon);
            }
        }
        this._petButton = (cc.instantiate(this._commonMainMenu) as cc.Node).getComponent(CommonMainMenu);
        this._petButton.updateUI(FunctionConst.FUNC_PET_HOME);
        this._petButton.node.setScale(0.8);
        this._petButton.addClickEventListenerEx(handler(this, this._onClickButtonPet));
        var iconBgPet = createIcon(this._petButton.node)[0];
        UIHelper.updateCurstomListSize(this._listViewLineup.content, iconBgPet);
        this._partnerButton = (cc.instantiate(this._teamPartnerButton) as cc.Node).getComponent(TeamPartnerButton)
        this._partnerButton.setInitData(handler(this, this._onButtonJiBanClicked));
        var iconBgPartner = createIcon(this._partnerButton.node)[0];
        UIHelper.updateCurstomListSize(this._listViewLineup.content, iconBgPartner)
        this._pageItems = [];
        // this._pageView.setSwallowTouches(false);
        // this._pageView.setScrollDuration(0.3);
        // this._pageView.node.on(cc.Node.EventType.TOUCH_START,handler(this, this._onTouchCallBackStart));
        // this._pageView.node.on(cc.Node.EventType.TOUCH_CANCEL,handler(this, this._onTouchCallBackEnd));
        // this._pageView.node.on(cc.Node.EventType.TOUCH_END,handler(this, this._onTouchCallBackEnd));

        var showDatas = UserDetailViewHelper.getHeroAndPetShowData(this._detailData);
        var viewSize = this._pageView.node.getContentSize();
        for (var j = 0; j < showDatas.length; j++) {
            var data = showDatas[j];
            if (this._pageItems[j] == null) {
                var item = (new cc.Node()).addComponent(TeamHeroPageItem)
                item.setInitData(viewSize.width, viewSize.height, null, null);
                this._pageItems[j] = item;
                this._pageView.addPage(item.node);
            }
        }
        if (this._power) {
            this._nodePower.node.active = (false);
            this._nodePower.updateUI(this._power);
            this._nodeBg.node.y = (-20);
            this._nodeBg.offsetCloseButton(0, -20);
        } else {
            this._nodePower.node.active = (false);
            this._nodeBg.node.y = (0);
        }
    }
    _onButtonClose() {
        this.close();
    }
    _updateLeftIcons() {
        var iconData = UserDetailViewHelper.getHeroAndPetIconData(this._detailData);
        for (var i in iconData) {
            var data = iconData[i];
            var icon = this._leftIcons[i];
            if (icon) {
                icon.onlyShow(data.type, data.value, data.limitLevel, data.limitRedLevel);
            }
        }
    }
    _updateHeroIconsSelectedState() {
        var curPos = this._pos;
        for (var i in this._leftIcons) {
            var icon = this._leftIcons[i];
            if ((parseInt(i) + 1) == curPos) {
                icon.setSelected(true);
            } else {
                icon.setSelected(false);
            }
        }
    }
    _gotoHeroPageItem() {
        var curPos = this._pos;
        var pageIndex = UserDetailViewHelper.getPageIndexWithIconPos(curPos - 1, this._detailData);
        this._pageView.setCurrentPageIndex(pageIndex);
    }
    _updateHeroPageView() {
        var showDatas = UserDetailViewHelper.getHeroAndPetShowData(this._detailData);
        var curPos = this._pos;
        var curIndex = UserDetailViewHelper.getPageIndexWithIconPos(curPos - 1, this._detailData);
        var minPos = curIndex - 1;
        var maxPos = curIndex + 1;
        if (minPos <= 0) {
            minPos = 0;
        }
        if (maxPos >= showDatas.length) {
            maxPos = showDatas.length - 1;
        }
        var viewSize = this._pageView.node.getContentSize();
        for (var i = minPos; i <= maxPos; i++) {
            if (this._pageItems[i] == null) {
                var item = (new cc.Node()).addComponent(TeamHeroPageItem)
                item.setInitData(viewSize.width, viewSize.height, null, null);
                this._pageItems[i] = item;
                this._pageView.addPage(item.node);
            }
            var info = showDatas[i];
            this._pageItems[i].updateUI(info.type, info.value, null, info.limitLevel, info.limitRedLevel);
            if (info.type == TypeConvertHelper.TYPE_HERO) {
                this._pageItems[i].setAvatarScale(1.04);
            } else {
                this._pageItems[i].setAvatarScale(0.9);
            }
        }
        this._gotoHeroPageItem();
        this._updatePageItemVisible();
    }
    switchPanelView(index) {
        this._curSelectedPanelIndex = index;
        var layer = this._subLayers[this._curSelectedPanelIndex];
        if (layer == null) {
            var zorder = 0;
            if (this._curSelectedPanelIndex == SWItCH_HERO_NODE) {
                if (!this._userDetailHeroNode)
                    cc.resources.load(Path.getPrefab("UserDetailHeroNode", "team"), cc.Prefab, function () {
                        this._userDetailHeroNode = cc.resources.get(Path.getPrefab("UserDetailHeroNode", "team"));
                        layer = (cc.instantiate(this._userDetailHeroNode) as cc.Node).getComponent(UserDetailHeroNode);
                        layer.setInitData(this, this._detailData);
                        zorder = 2;
                        this._nodeContent.addChild(layer.node, zorder);
                        this._subLayers[this._curSelectedPanelIndex] = layer;
                        this.realUpdateView(layer, zorder);
                    }.bind(this))
                else {
                    layer = (cc.instantiate(this._userDetailHeroNode) as cc.Node).getComponent(UserDetailHeroNode);
                    layer.setInitData(this, this._detailData);
                    zorder = 2;
                    this._nodeContent.addChild(layer.node, zorder);
                    this._subLayers[this._curSelectedPanelIndex] = layer;
                    this.realUpdateView(layer, zorder);
                }

            }
            else if (this._curSelectedPanelIndex == SWItCH_PET_NODE) {
                if (!this._userDetailPetNode)
                    cc.resources.load(Path.getPrefab("UserDetailPetNode", "team"), cc.Prefab, function () {
                        this._userDetailPetNode = cc.resources.get(Path.getPrefab("UserDetailPetNode", "team"));
                        layer = (cc.instantiate(this._userDetailPetNode) as cc.Node).getComponent(UserDetailPetNode)
                        layer.setInitData(this);
                        this._nodeContent.addChild(layer.node, zorder);
                        this._subLayers[this._curSelectedPanelIndex] = layer;
                        this.realUpdateView(layer, zorder);
                    }.bind(this));
                else {
                    layer = (cc.instantiate(this._userDetailPetNode) as cc.Node).getComponent(UserDetailPetNode)
                    layer.setInitData(this);
                    this._nodeContent.addChild(layer.node, zorder);
                    this._subLayers[this._curSelectedPanelIndex] = layer;
                    this.realUpdateView(layer, zorder);
                }

            }
            else if (this._curSelectedPanelIndex == SWItCH_YOKE_NODE) {
                if (!this._userYokeNode)
                    cc.resources.load(Path.getPrefab("UserYokeNode", "team"), cc.Prefab, function () {
                        this._userYokeNode = cc.resources.get(Path.getPrefab("UserYokeNode", "team"));
                        layer = (cc.instantiate(this._userYokeNode) as cc.Node).getComponent(UserYokeNode);
                        layer.setInitData(this);
                        this._nodeContent.addChild(layer.node, zorder);
                        this._subLayers[this._curSelectedPanelIndex] = layer;
                        this.realUpdateView(layer, zorder);
                    }.bind(this));
                else {
                    layer = (cc.instantiate(this._userYokeNode) as cc.Node).getComponent(UserYokeNode);
                    layer.setInitData(this);
                    this._nodeContent.addChild(layer.node, zorder);
                    this._subLayers[this._curSelectedPanelIndex] = layer;
                    this.realUpdateView(layer, zorder);

                }

            }

        }
        else {
            this.realUpdateView(layer, 0);
        }




    }
    private realUpdateView(layer, zorder): void {
        for (var k in this._subLayers) {
            var subLayer = this._subLayers[k];
            subLayer.node.active = (false);
        }
        layer.node.active = (true);
        this._pageView.node.active = this._imageAwakeBg.node.active = (this._curSelectedPanelIndex == 1);
        this._updateView();
    }
    _updateView() {
        var layer = this._subLayers[this._curSelectedPanelIndex];
        if (layer) {

            if (this._curSelectedPanelIndex == SWItCH_HERO_NODE) {
                layer.updateInfo(this._pos);
                this._imageBackground.node.addComponent(CommonUI).loadTexture(Path.getBackground('img_chakan_bg'));
            }
            else if (this._curSelectedPanelIndex == SWItCH_PET_NODE) {
                this._imageBackground.node.addComponent(CommonUI).loadTexture(Path.getBackground('img_yaoqianshu'));
                layer.updateInfo(this._detailData);
            } else if (this._curSelectedPanelIndex == SWItCH_YOKE_NODE) {
                this._imageBackground.node.addComponent(CommonUI).loadTexture(Path.getBackground('img_chakanjiban_bg'));
                layer.updateView(this._detailData);
                layer.updatePanel();
            }
        }
    }
    private onPageViewEvent(sender, event) {
        var targetIndex = this._pageView.getCurrentPageIndex();
        var targetPos = UserDetailViewHelper.getIconPosWithPageIndex(targetIndex, this._detailData) + 1;
        var curPos = this._pos;
        if (targetPos != curPos) {
            this._pos = targetPos;
            this._updateHeroIconsSelectedState();
            this._updateHeroPageView();
            if (targetPos == TeamConst.PET_POS) {
                this.switchPanelView(SWItCH_PET_NODE);
            } else {
                this.switchPanelView(SWItCH_HERO_NODE);
            }
        }
    }

    private _onTouchCallBackEnd(): void {
        this._isPageViewMoving = false;
    }
    private _onTouchCallBackStart(): void {
        this._isPageViewMoving = true;
    }
    _updatePageItemVisible() {
        var curPos = this._pos;
        var curIndex = UserDetailViewHelper.getPageIndexWithIconPos(curPos - 1, this._detailData);
        for (var i = 0; i < this._pageItems.length; i++) {
            var item = this._pageItems[i];
            var show = i == curIndex || this._isPageViewMoving;
            item.node.active = (show);
            item.playSkillAnimationOnce();
        }
    }
    _onLeftIconClicked(pos) {
        var iconData = UserDetailViewHelper.getHeroAndPetIconData(this._detailData);
        var info = iconData[pos - 1];
        if (info.type == TypeConvertHelper.TYPE_HERO) {
            var state = this._detailData.getPosState(pos);
            if (state == TeamConst.STATE_HERO) {
                if (pos == this._pos) {
                    return;
                }
                this._pos = pos;
                this._updateHeroIconsSelectedState();
                this._updateHeroPageView();
                this.switchPanelView(SWItCH_HERO_NODE);
            }
        } else if (info.type == TypeConvertHelper.TYPE_PET) {
            if (info.value > 0) {
                this._pos = pos;
                this._updateHeroIconsSelectedState();
                this._updateHeroPageView();
                this.switchPanelView(SWItCH_PET_NODE);
            }
        }
    }
    switchToHeroNode() {
        this.switchListLineUp(LIST_NORMAL);
        this.switchPanelView(SWItCH_HERO_NODE);
    }
    _onButtonJiBanClicked() {
        if (this._curSelectedPanelIndex == SWItCH_YOKE_NODE) {
            return;
        }
        this._pos = 0;
        this.switchListLineUp(LIST_NORMAL);
        this._listViewLineup.scrollToBottom();
        this._updateHeroIconsSelectedState();
        this.switchPanelView(SWItCH_YOKE_NODE);
    }
    _onClickButtonPet() {
        if (this._curSelectedPanelIndex == SWItCH_PET_NODE) {
            return;
        }
        this._pos = 0;
        this.switchListLineUp(LIST_NORMAL);
        this._listViewLineup.scrollToBottom();
        this._updateHeroIconsSelectedState();
        this.switchPanelView(SWItCH_PET_NODE);
    }
    switchListLineUp(flag) {
        if (flag == LIST_NORMAL) {
            this._listViewLineup.node.setContentSize(LIST_LINE_WIDTH, LIST_LINE_HEIGHT_NORMAL);
            this._listViewLineup.node.y = (0);
        } else {
            this._listViewLineup.node.setContentSize(LIST_LINE_WIDTH, LIST_LINE_HEIGHT_JADE);
            this._listViewLineup.node.y = (LIST_LINE_HEIGHT_NORMAL - LIST_LINE_HEIGHT_JADE);
        }
    }

    //刷新镜像觉醒星星
    //为了防止高个武将把觉醒星星挡掉，在上层加入一个同样的觉醒控件
    updateAwake(visible, star) {
        this._imageAwakeBg.node.active = visible;
        if (star) {
            this._nodeHeroStar.setStarOrMoon(star);
        }
    }
}