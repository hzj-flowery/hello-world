const { ccclass, property } = cc._decorator;

import { CustomActivityConst } from '../../../const/CustomActivityConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TimeLimitActivityConst } from '../../../const/TimeLimitActivityConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { Colors, G_Prompt, G_ResolutionManager, G_SceneManager, G_ServiceManager, G_SignalManager, G_UserData, G_ConfigLoader, G_GameAgent } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import ActivityGuildSprintView from '../activityGuildSprint/ActivityGuildSprintView';
import CustomActivityAvatarAdView from './avatar/CustomActivityAvatarAdView';
import CustomActivityAvatarView from './avatar/CustomActivityAvatarView';
import CustomActivityEquipmentView from './CustomActivityEquipmentView';
import CustomActivityFundsView from './CustomActivityFundsView';
import CustomActivityHorseConquerView from './CustomActivityHorseConquerView';
import CustomActivityPetView from './CustomActivityPetView';
import CustomActivityTabButton from './CustomActivityTabButton';
import CustomActivityTaskView from './CustomActivityTaskView';
import { CustomActivityUIHelper } from './CustomActivityUIHelper';
import CustomActivityVipRecommendGift from './CustomActivityVipRecommendGift';
import CustomActivityWelfareView from './CustomActivityWelfareView';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import CustomActivityTenJadeAuction from './CustomActivityTenJadeAuction';




@ccclass
export default class CustomActivityView extends PopupBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRight: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _helpBg: cc.Sprite = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _helpInfo: CommonHelpBig = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLantern: cc.Sprite = null;

    @property({
        type: CustomActivityTabButton,
        visible: true
    })
    _tabGroup: CustomActivityTabButton = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _consumptionTips: cc.Sprite = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    private _selectedFirstTabIndex: number;
    private _isEnterPull: boolean;
    private _signalCustomActInfo: any;
    private _signalCustomActUpdate: any;
    private _signalCustomActUpdateQuest: any;
    private _signalCustomActGetAward: any;
    private _signalRedPointUpdate: any;
    private _signalCustomActExpired: any;
    private _activityModuleUIList: Array<any>;
    private _mainTabGroupData: Array<any>;
    private _selectActivityId: number;
    private _signalCheckBuyReturnGift: any;
    private _signalReturnGiftGetAward: any;
    private _firstEnter: boolean = true;


    protected preloadResList = [
        { path: Path.getPrefab("CustomActivityAvatarViewItem", "customActivity/avatar"), type: cc.Prefab },
        { path: Path.getPrefab("CustomActivityWeekFundsV2Cell", "customActivity"), type: cc.Prefab },
        { path: Path.getPrefab("ActivityGuildSprintItemCell", "activityGuildSprint"), type: cc.Prefab },

        { path: Path.getPrefab("CustomActivityTaskItemCell", "customActivity"), type: cc.Prefab },
        { path: Path.getPrefab("CustomActivityExchangeItemCell", "customActivity"), type: cc.Prefab },
        { path: Path.getPrefab("CustomActivityRechargeTaskItemCell", "customActivity"), type: cc.Prefab },
        { path: Path.getPrefab("CustomActivityYuBiExchangeCell", "customActivity"), type: cc.Prefab },
        { path: Path.getPrefab("CustomActivitySingleRechargeItemCell", "customActivity"), type: cc.Prefab },
        { path: Path.getPrefab("CustomActivityBuyGoodsItemCell", "customActivity"), type: cc.Prefab },

        { path: Path.getPrefab("CommonIconTemplate", "common"), type: cc.Prefab },
        { path: "icon/itemmini.png", type: cc.Asset },
        { path: "icon/itemmini.plist", type: cc.ParticleAsset },
    ];


    constructor() {
        super();
        this._selectedFirstTabIndex = 0;
        this._activityModuleUIList = [];
    }

    //设置初始化数据
    private setInitData(id: number): void {
        this._selectActivityId = id;
    }

    onCreate() {
        this._selectActivityId = G_SceneManager.getViewArgs("customActivity")[0];
        this.setSceneSize();
        this._imageBg.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        // this._topbarBase.setCallBackOnBack(handler(this, this.onClickClose));

        this._topbarBase.updateUI(TopBarStyleConst.STYLE_MAIN, true);
        this._topbarBase.setBGType(2);
        this._topbarBase.hideBack();
    }
    onEnter() {
        this._firstEnter = true;
        this._signalCustomActInfo = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_INFO, handler(this, this._onEventCustomActInfo));
        this._signalCustomActUpdate = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_UPDATE, handler(this, this._onEventCustomActUpdate));
        this._signalCustomActUpdateQuest = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_UPDATE_QUEST, handler(this, this._onEventCustomActUpdateQuest));
        this._signalCustomActGetAward = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_GET_AWARD, handler(this, this._onEventCustomActGetAward));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalCustomActExpired = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_EXPIRED, handler(this, this._onEventCustomActExpired));
        this._signalCheckBuyReturnGift = G_SignalManager.add(SignalConst.EVENT_CHECK_BUY_RETURN_GIFT, handler(this, this._onEventCheckBuyReturnGift));
        this._signalReturnGiftGetAward = G_SignalManager.add(SignalConst.EVENT_RETURN_BUY_RETURN_GIFT, handler(this, this._onEventReturnGiftGetAward));
        this._refreshData();
        if (this._isEnterPull) {
            G_UserData.getCustomActivity().pullData();
        }
        this._isEnterPull = true;
        G_UserData.getCustomActivity().checkVipRecommendGift();
        G_ServiceManager.getService('CustomActivityService').enterModule();
    }
    onExit() {
        this._signalCustomActInfo.remove();
        this._signalCustomActInfo = null;
        this._signalCustomActUpdate.remove();
        this._signalCustomActUpdate = null;
        this._signalCustomActUpdateQuest.remove();
        this._signalCustomActUpdateQuest = null;
        this._signalCustomActGetAward.remove();
        this._signalCustomActGetAward = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalCustomActExpired.remove();
        this._signalCustomActExpired = null;
        this._signalReturnGiftGetAward.remove();
        this._signalReturnGiftGetAward = null;
        this._signalCheckBuyReturnGift.remove();
        this._signalCheckBuyReturnGift = null;
        G_ServiceManager.getService('CustomActivityService').exitModule();
    }
    _updateTopBar() {
        var actUnitdata = this._getTabDataByIndex();
        if (!actUnitdata) {
            return;
        }
        this.resumeUpdateTopBar();
        if (actUnitdata.type == TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT) {
            var actType = actUnitdata.srcData.getAct_type();
            if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR) {
                this._topbarBase.updateUIByResList([
                    {
                        type: TypeConvertHelper.TYPE_RESOURCE,
                        value: DataConst.RES_JADE2
                    },
                    {
                        type: TypeConvertHelper.TYPE_RESOURCE,
                        value: DataConst.RES_DIAMOND
                    },
                    {
                        type: TypeConvertHelper.TYPE_ITEM,
                        value: DataConst.ITEM_AVATAR_ACTIVITY_TOKEN
                    },
                    {
                        type: TypeConvertHelper.TYPE_RESOURCE,
                        value: DataConst.RES_AVATAR_FRAGMENT
                    }
                ], true);
                return;
            }
            this._topbarBase.updateUIByResList(actUnitdata.srcData.getTopBarItems(), true);
            return;
        }
        this._topbarBase.updateUIByResList([
            {
                type: 0,
                value: 0
            },
            {
                type: 0,
                value: 0
            },
            {
                type: 0,
                value: 0
            },
            {
                type: TypeConvertHelper.TYPE_RESOURCE,
                value: DataConst.RES_DIAMOND
            }
        ], true);
    }
    pauseUpdateTopBar() {
        this._topbarBase.pauseUpdate();
    }
    resumeUpdateTopBar() {
        this._topbarBase.resumeUpdate();
    }

    onShowFinish() {
        G_UserData.getCustomActivity().c2sGetUserCustomActivityQuest();
    }
    _refreshRedPoint() {
        var actListData = this._getMainTabGroupData();
        for (var k in actListData) {
            var v = actListData[k];
            var [_, newTagShow, redPointShow] = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ACTIVITY, 'subActivityRP', [
                v.type,
                v.id
            ]);
            this._tabGroup.setRedPointByTabIndex(parseInt(k) + 1, redPointShow, new cc.Vec2(0.9, 0.85));
            var tabItem = this._tabGroup.getTabItem(parseInt(k) + 1);
            if (tabItem) {
                tabItem.imageTag.node.active = (newTagShow);
            }
        }
    }
    _onEventRedPointUpdate(event, funcId, param) {
        if (funcId == FunctionConst.FUNC_ACTIVITY) {
            this._refreshRedPoint();
        }
    }
    _onEventCustomActInfo(event, data) {
        this._refreshData();
    }
    _onEventCustomActExpired(event, data) {
        this._refreshData();
    }
    _onEventCustomActUpdate(event, data) {
        this._refreshData();
    }
    _onEventCustomActUpdateQuest(event, data) {
        this.analyseData2();
    }
    _onEventCustomActGetAward(event, message) {
        var taskUnitData = G_UserData.getCustomActivity().getActTaskUnitDataById(message.act_id, message.quest_id);
        var rewards = [];
        var fixRewards = taskUnitData.getRewardItems();
        var selectRewards = taskUnitData.getSelectRewardItems();
        for (var k in fixRewards) {
            var v = fixRewards[k];
            rewards.push(v);
        }
        cc.warn('award_id' + message.award_id);
        var selectReward = selectRewards[message.award_id - 1];
        if (selectReward) {
            rewards.push(selectReward);
        }
        var newRewards = rewards;
        if (message.award_num > 1) {
            newRewards = [];
            var rate = message.award_num;
            for (k in rewards) {
                var v = rewards[k];
                newRewards.push({
                    type: v.type,
                    value: v.value,
                    size: v.size * rate
                });
            }
        }
        this._showRewards(newRewards);
    }

    _onEventReturnGiftGetAward(event, awards) {
        this._showRewards(awards);
        this._refreshModuleUI();
    }
    _onEventCheckBuyReturnGift(event, giftId) {
        var return_charge_active = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_CHARGE_ACTIVE);
        var giftInfo = return_charge_active.get(giftId);
        var payId = giftInfo.vip_pay_id;
        var VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
        var payCfg = VipPay.get(payId);
        // assert(payCfg, 'vip_pay not find id ' + tostring(payId));
        G_GameAgent.pay(payCfg.id, payCfg.rmb, payCfg.product_id, payCfg.name, payCfg.name);
    }

    private _showRewards(awards) {
        if (awards) {
            G_Prompt.showAwards(awards);
        }
    }
    private onClickClose(sender) {
        this._topbarBase.onButtonBack();
    }
    private _onTabSelect(tabIndex, sender) {
        if (this._selectedFirstTabIndex == tabIndex) {
            if (!this._firstEnter) {
                return false;
            }
            else {
                this._firstEnter = false;
            }
        }
        this._selectedFirstTabIndex = tabIndex;
        var actUnitdata = this._getTabDataByIndex(tabIndex);
        this._refreshModuleUI();
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_ACTIVITY, {
            actId: actUnitdata.id,
            actType: actUnitdata.type
        });
        return true;
    }
    private _createTabItem(tabNode: cc.Node) {
        var tabItem: any = {};
        var instNode = tabNode;
        tabItem.normalImage = (instNode.getChildByName('Image_normal') as cc.Node).getComponent(cc.Sprite);
        tabItem.downImage = (instNode.getChildByName('Image_down') as cc.Node).getComponent(cc.Sprite);
        tabItem.textWidget = (instNode.getChildByName('Text_desc') as cc.Node).getComponent(cc.Label);
        tabItem.imageWidget = (instNode.getChildByName('Image_icon') as cc.Node).getComponent(cc.Sprite);
        tabItem.imageSelect = (instNode.getChildByName('Image_select') as cc.Node).getComponent(cc.Sprite);
        tabItem.imageTag = (instNode.getChildByName('Image_tag') as cc.Node).getComponent(cc.Sprite);
        tabItem.redPoint = instNode.getChildByName('Image_RedPoint');
        // tabItem.imageWidget.ignoreContentAdaptWithSize(true);
        return tabItem;
    }
    private _updateTabItem(tabItem) {
        var index = tabItem.index;
        var customActUnitData = this._getTabDataByIndex(index);
        if (customActUnitData) {
            tabItem.textWidget.string = (customActUnitData.title);
            tabItem.imageWidget.node.active = (false);
        }
    }
    private _brightTabItem(tabItem, bright) {
        var textWidget = tabItem.textWidget;
        var normalImage = tabItem.normalImage;
        var downImage = tabItem.downImage;
        normalImage.node.active = (!bright);
        downImage.node.active = (bright);
        textWidget.node.color = (bright && Colors.CUSTOM_ACT_TAB_BRIGHT || Colors.CUSTOM_ACT_TAB_NORMAL);
    }
    private _getTabCount() {
        var groupData = this._getMainTabGroupData();
        return groupData.length;
    }

    private _preLoadModuleUIList: Array<string> = [];
    private getPreLoadData(actUnitdata): string {
        var type = actUnitdata.type;
        var activityModuleUI = this._preLoadModuleUIList[actUnitdata.type + ('_' + actUnitdata.id)];
        if (activityModuleUI == null) {
            if (TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == type) {
                var actType = actUnitdata.srcData.getAct_type();
                if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PUSH) {
                    activityModuleUI = Path.getPrefab("CustomActivityTaskView", "customActivity");
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_WEAL) {
                    activityModuleUI = Path.getPrefab("CustomActivityWelfareView", "customActivity");
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL) {
                    activityModuleUI = Path.getPrefab("CustomActivityTaskView", "customActivity");
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY) {
                    activityModuleUI = Path.getPrefab("CustomActivityTaskView", "customActivity");
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR) {
                    activityModuleUI = Path.getPrefab("CustomActivityAvatarView", "customActivity/avatar");
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP) {
                    activityModuleUI = Path.getPrefab("CustomActivityEquipmentView", "customActivity");
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET) {
                    activityModuleUI = Path.getPrefab("CustomActivityPetView", "customActivity");
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE) {
                    // activityModuleUI = new CustomActivityHorseJudgeView(this);
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_FUNDS) {
                    activityModuleUI = Path.getPrefab("CustomActivityFundsView", "customActivity");
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER) {
                    activityModuleUI = Path.getPrefab("CustomActivityHorseConquerView", "customActivity");
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_VIP_RECOMMEND_GIFT) {
                    activityModuleUI = Path.getPrefab("CustomActivityVipRecommendGift", "customActivity");
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_TEN_JADE_AUCTION) {
                    activityModuleUI = Path.getPrefab("CustomActivityTenJadeAuction", "customActivity");
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_RETURN_SERVER_GIFT) {
                    // activityModuleUI = new CustomActivityReturnGiftView(this);
                    console.log("wait-----");
                }
            }
            else if (TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT == type) {
                var id = actUnitdata.id;
                if (id == TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT) {
                    activityModuleUI = Path.getPrefab("ActivityGuildSprintView", "activityGuildSprint");
                }
            } else if (TimeLimitActivityConst.ID_TYPE_AVATAR_ACT_INTRO == type) {
                activityModuleUI = Path.getPrefab("CustomActivityAvatarAdView", "customActivity/avatar");

            } else if (TimeLimitActivityConst.ID_TYPE_THREEKINDOMS == type) {
                // var CustomActivityThreeKindomsView = require('CustomActivityThreeKindomsView');
                // activityModuleUI = new CustomActivityThreeKindomsView(this);
            }
            this._preLoadModuleUIList[actUnitdata.type + ('_' + actUnitdata.id)] = activityModuleUI;
        }
        return activityModuleUI;
    }

    private analyseData2(): void {
        var mainTabGroupData = CustomActivityUIHelper.getTabDatas();
        this._mainTabGroupData = CustomActivityUIHelper.getTabDatas();
        var typeArray: Array<string> = [];
        this._preLoadModuleUIList = [];
        for (var j = 0; j < mainTabGroupData.length; j++) {
            //一共有多少条数据
            var actUnitdata = this._getTabDataByIndex(j);
            typeArray.push(this.getPreLoadData(actUnitdata));
        }
        cc.resources.load(typeArray, cc.Prefab, () => {
            if (this.isValid) {
                this._refreshModuleUI(false);
            }
        });
    }
    private analyseData(): void {
        this._mainTabGroupData = CustomActivityUIHelper.getTabDatas();
        var typeArray: Array<string> = [];
        this._preLoadModuleUIList = [];
        for (var j = 0; j < this._mainTabGroupData.length; j++) {
            //一共有多少条数据
            var actUnitdata = this._getTabDataByIndex(j);
            typeArray.push(this.getPreLoadData(actUnitdata));
        }
        cc.resources.load(typeArray, cc.Prefab, () => {
            if (this.isValid) {
                this._realRefreshData();
            }
        });
    }
    //真的准备刷新数据
    private _realRefreshData() {
        var oldTabData = this._getTabDataByIndex(this._selectedFirstTabIndex);
        this._mainTabGroupData = CustomActivityUIHelper.getTabDatas();
        this._initTabGroup();
        var newSelectIndex = this._seekTabIndexByTabData(oldTabData);
        var isResetTabIndex = newSelectIndex == 0;
        if (isResetTabIndex) {
            //todo
            var targetIndex = 0;
            if (this._selectActivityId) {
                for (var k = 0; k < this._mainTabGroupData.length; k++) {
                    var v = this._mainTabGroupData[k];
                    if (this._selectActivityId == v.id) {
                        targetIndex = k;
                    }
                }
                this._selectActivityId = null;
            }
            this._selectedFirstTabIndex = 0;
            this._tabGroup.setTabIndex(targetIndex);
        } else {
            var success = this._tabGroup.setTabIndex(newSelectIndex);
            if (!success) {
                this._refreshModuleUI();
            } else {
            }
        }
    }
    private _refreshData() {
        this.analyseData();
    }
    private _initTabGroup() {
        var param = {
            tabIndex: this._selectedFirstTabIndex < 0 && null || this._selectedFirstTabIndex,
            callback: handler(this, this._onTabSelect),
            containerStyle: 2,
            offset: -6,
            tabStyle: 1,
            rootNode: this._tabGroup._scrollViewTab,
            createTabItemCallback: handler(this, this._createTabItem),
            updateTabItemCallback: handler(this, this._updateTabItem),
            getTabCountCallback: handler(this, this._getTabCount),
            brightTabItemCallback: handler(this, this._brightTabItem)
        };
        this._tabGroup.recreateTabs(param);
        this._refreshRedPoint();
    }
    private _getMainTabGroupData() {
        return this._mainTabGroupData;
    }
    private _seekTabIndexByTabData(tabData) {
        if (!tabData) {
            return 0;
        }
        var actListData = this._getMainTabGroupData();
        for (var k in actListData) {
            var v = actListData[k];
            if (v.id == tabData.id && v.type == tabData.type) {
                return k;
            }
        }
        return 0;
    }
    //通过数据获取TabData
    private _getTabDataByIndex(tabIndex?) {
        var mainTabGroupData = this._getMainTabGroupData();
        if (!mainTabGroupData) {
            return null;
        }
        if (tabIndex == null) {
            tabIndex = this._selectedFirstTabIndex;
        }
        if (tabIndex < 0) {
            return null;
        }


        return mainTabGroupData[tabIndex];
    }
    private _checkShowConsumptionTips(actUnitdata) {
        var type = actUnitdata.type;
        if (TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == type) {
            var actType = actUnitdata.srcData.getAct_type();
            if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR) {
                this._consumptionTips.node.active = (true);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP) {
                this._consumptionTips.node.active = (true);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER) {
                this._consumptionTips.node.active = (true);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET) {
                this._consumptionTips.node.active = (true);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_FUNDS) {
                this._consumptionTips.node.active = (true);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_VIP_RECOMMEND_GIFT) {
                this._consumptionTips.node.active = (true);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_WEAL) {
                this._consumptionTips.node.active = (true);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY) {
                this._consumptionTips.node.active = (true);
            } else {
                this._consumptionTips.node.active = (false);
            }
        } else if (TimeLimitActivityConst.ID_TYPE_AVATAR_ACT_INTRO == type) {
            this._consumptionTips.node.active = (true);
        } else {
            this._consumptionTips.node.active = (false);
        }
    }
    //刷新UI
    private _refreshModuleUI(resetListData?) {
        var actUnitdata = this._getTabDataByIndex();
        if (!actUnitdata) {
            return;
        }
        for (var i in this._activityModuleUIList) {
            var view = this._activityModuleUIList[i];
            view.node.active = (false);
            if (view.stopBGM) {
                view.stopBGM();
            }
        }
        this._helpBg.node.active = (true);
        this._helpInfo.node.active = (true);
        if (TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == actUnitdata.type) {
            var actType = actUnitdata.srcData.getAct_type();
            if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR) {
                this._helpInfo.updateUI(FunctionConst.FUNC_AVATAR_ACTIVITY);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP) {
                this._helpInfo.updateUI(FunctionConst.FUNC_EQUIP_ACTIVITY);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER) {
                this._helpInfo.updateUI(FunctionConst.FUNC_HORSE_CONQUER_ACTIVITY);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET) {
                this._helpInfo.updateUI(FunctionConst.FUNC_PET_ACTIVITY);
            } else {
                this._helpBg.node.active = (false);
                this._helpInfo.node.active = (false);
            }
        } else {
            this._helpBg.node.active = (false);
            this._helpInfo.node.active = (false);
        }
        this._checkShowConsumptionTips(actUnitdata);
        var activityModuleUI = this._getActivityModuleUI(actUnitdata);
        //assert((activityModuleUI, 'CustomActivityView not find activityModuleUI ' + (actUnitdata.type + ('_' + actUnitdata.id)));
        activityModuleUI.node.active = (true);
        if (activityModuleUI.startBGM) {
            activityModuleUI.startBGM();
        }
        if (activityModuleUI.enterModule) {
            activityModuleUI.enterModule();
        }
        this._updateLanternImage(actUnitdata);
        if (TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == actUnitdata.type) {
            activityModuleUI.refreshView(actUnitdata.srcData, resetListData);
        } else if (TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT == actUnitdata.type) {
            activityModuleUI.refreshView(actUnitdata.srcData, resetListData);
        } else if (TimeLimitActivityConst.ID_TYPE_THREEKINDOMS == actUnitdata.type) {
            activityModuleUI.refreshView(actUnitdata.srcData, resetListData);
        }
        this._updateTopBar();
    }
    private _getActivityModuleUI(actUnitdata) {
        var type = actUnitdata.type;
        var activityModuleUI = this._activityModuleUIList[actUnitdata.type + ('_' + actUnitdata.id)];
        if (activityModuleUI == null) {
            if (TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == type) {
                var actType = actUnitdata.srcData.getAct_type();
                if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PUSH) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityTaskView", "customActivity"))) as cc.Node).getComponent(CustomActivityTaskView) as CustomActivityTaskView;
                    activityModuleUI.setInitData(this, actType);
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_WEAL) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityWelfareView", "customActivity"))) as cc.Node).getComponent(CustomActivityWelfareView) as CustomActivityWelfareView;
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityTaskView", "customActivity"))) as cc.Node).getComponent(CustomActivityTaskView) as CustomActivityTaskView;
                    activityModuleUI.setInitData(this, actType);
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityTaskView", "customActivity"))) as cc.Node).getComponent(CustomActivityTaskView) as CustomActivityTaskView;
                    activityModuleUI.setInitData(this, actType);
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityAvatarView", "customActivity/avatar"))) as cc.Node).getComponent(CustomActivityAvatarView) as CustomActivityAvatarView;
                    activityModuleUI.setInitData(this, actUnitdata.srcData);
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityEquipmentView", "customActivity"))) as cc.Node).getComponent(CustomActivityEquipmentView) as CustomActivityEquipmentView;
                    activityModuleUI.setInitData(this);
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityPetView", "customActivity"))) as cc.Node).getComponent(CustomActivityPetView) as CustomActivityPetView;
                    activityModuleUI.setInitData(this);
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE) {
                    // activityModuleUI = new CustomActivityHorseJudgeView(this);
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_FUNDS) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityFundsView", "customActivity"))) as cc.Node).getComponent(CustomActivityFundsView) as CustomActivityFundsView;
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityHorseConquerView", "customActivity"))) as cc.Node).getComponent(CustomActivityHorseConquerView) as CustomActivityHorseConquerView;
                    activityModuleUI.setInitData(this);
                } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_TEN_JADE_AUCTION) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityTenJadeAuction", "customActivity"))) as cc.Node).getComponent(CustomActivityTenJadeAuction) as CustomActivityTenJadeAuction;
                    activityModuleUI.setInitData(this);
                }
                else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_VIP_RECOMMEND_GIFT) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityVipRecommendGift", "customActivity"))) as cc.Node).getComponent(CustomActivityVipRecommendGift) as CustomActivityVipRecommendGift;
                    activityModuleUI.setInitData(this);
                }
            }
            else if (TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT == type) {
                var id = actUnitdata.id;
                if (id == TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT) {
                    activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("ActivityGuildSprintView", "activityGuildSprint"))) as cc.Node).getComponent(ActivityGuildSprintView) as ActivityGuildSprintView;
                    activityModuleUI.setInitData(this, actUnitdata);
                }
            } else if (TimeLimitActivityConst.ID_TYPE_AVATAR_ACT_INTRO == type) {
                activityModuleUI = (cc.instantiate(cc.resources.get(Path.getPrefab("CustomActivityAvatarAdView", "customActivity/avatar"))) as cc.Node).getComponent(CustomActivityAvatarAdView) as CustomActivityAvatarAdView;
                activityModuleUI.setInitData(this);

            } else if (TimeLimitActivityConst.ID_TYPE_THREEKINDOMS == type) {
                // var CustomActivityThreeKindomsView = require('CustomActivityThreeKindomsView');
                // activityModuleUI = new CustomActivityThreeKindomsView(this);
            }
            //assert((activityModuleUI, 'CustomActivityView _getActivityModuleUI not find activityModuleUI ' + (actUnitdata.type + ('_' + actUnitdata.id)));
            var point = G_ResolutionManager.getDesignCCPoint();
            activityModuleUI.node.setPosition(-568, -320);
            this._nodeRight.addChild(activityModuleUI.node);
            this._activityModuleUIList[actUnitdata.type + ('_' + actUnitdata.id)] = activityModuleUI;
        }
        return activityModuleUI;
    }
    jumpToAvatarActivity() {
        var avatarActUnitData = G_UserData.getCustomActivity().getAvatarActivity();
        if (!avatarActUnitData) {
            G_Prompt.showTip(Lang.get('customactivity_avatar_act_end_tip'));
            return;
        }
        var targetActId = avatarActUnitData.getAct_id();
        var targetIndex;
        for (var k in this._mainTabGroupData) {
            var v = this._mainTabGroupData[k];
            if (targetActId == v.id) {
                targetIndex = k;
            }
        }
        if (targetIndex) {
            this._tabGroup.setTabIndex(targetIndex);
        }
    }
    private _updateLanternImage(actUnitdata) {
        var hideImageType = [CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE];
        var isHide = function (actType) {
            for (var i in hideImageType) {
                var type = hideImageType[i];
                if (actType == type) {
                    return true;
                }
            }
            return false;
        }
        this._imageLantern.node.active = (true);
        if (actUnitdata.srcData && actUnitdata.srcData.getAct_type) {
            var actType = actUnitdata.srcData.getAct_type();
            if (isHide(actType)) {
                this._imageLantern.node.active = (false);
            }
        }
    }


}