const {ccclass, property} = cc._decorator;

import { ActivityConst } from '../../../const/ActivityConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_SceneManager, G_SignalManager, G_UserData, G_WaitingMask, G_ConfigManager } from '../../../init';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonTabGroupScrollView from '../../../ui/component/CommonTabGroupScrollView';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { Waiting_Show_Type } from '../../../ui/WaitingMask';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { TextHelper } from '../../../utils/TextHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import DailySigninView from './dailysignin/DailySigninView';
import DinnerView from './dinner/DinnerView';
import LevelGiftView from './levelGift/LevelGiftView';
import LuxuruGiftPkgView from './luxurygiftpkg/LuxuruGiftPkgView';
import MoneyTreeView from './moneytree/MoneyTreeView';
import MonthlyCardView from './monthlycard/MonthlyCardView';
import OpenServerFundView from './openserverfund/OpenServerFundView';
import ResourceBackView from './resourceBack/ResourceBackView';
import SuperCheckinView from './superCheckin/SuperCheckinView';
import WeeklyGiftPkgView from './weeklygiftpkg/WeeklyGiftPkgView';




@ccclass
export default class ActivityView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRight: cc.Node = null;

    @property({
        type: CommonTabGroupScrollView,
        visible: true
    })
    _tabGroup: CommonTabGroupScrollView = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type:cc.Node,
        visible:true
    })
    _scrollViewTab:cc.Node = null;

    DailySigninView:cc.Prefab = null;

    SuperCheckinView:cc.Prefab = null;

    DinnerView:cc.Prefab = null;

    MoneyTreeView:cc.Prefab = null;

    MonthlyCardView:cc.Prefab = null;

    OpenServerFundView:cc.Prefab = null;

    LuxuryGiftPkgView:cc.Prefab = null;

    WeeklyGiftPkgView:cc.Prefab = null;

    ResourceBackView:cc.Prefab = null;

    LevelGiftView:cc.Prefab = null;


    _paramActivityId: any;
    _activityModuleUIList: any;
    _selectTabIndex: number;
    _activityDataList: any[];
    _signalRedPointUpdate: any;

    static loadPreabList:any = {
        'MonthlyCardView':'monthlycard/MonthlyCardView',
        'DinnerView':'dinner/DinnerView',
        'LevelGiftView':'levelGift/LevelGiftView',
        'LuxuruGiftPkgView':'luxurygiftpkg/LuxuruGiftPkgView',
        'MoneyTreeView':'moneytree/MoneyTreeView',
        'OpenServerFundView':'openserverfund/OpenServerFundView',
        'RechargeRebate':'rechargeRebate/RechargeRebate',
        'ResourceBackView':'resourceBack/ResourceBackView',
        'SuperCheckinView':'superCheckin/SuperCheckinView',
        'WeeklyGiftPkgView':'weeklygiftpkg/WeeklyGiftPkgView',
        'DailySigninView':'dailysignin/DailySigninView'
    };

    loadCompleteList:any;


    ctor(activityId?) {
        this._paramActivityId = activityId;
        this._activityModuleUIList = {};
        this._selectTabIndex = -1;
        this._activityDataList = [];
    }
    onCreate() {
        this.setSceneSize();
        var activityId = null;
        var params = G_SceneManager.getViewArgs('activity');
        if(params && params.length > 0){
            activityId = params[0];
        }
        this.ctor(activityId);
        this._topbarBase.setImageTitle('txt_sys_com_fuli');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_ACTIVITY);
        this._commonFullScreen.showCount(false);
        this._commonFullScreen.setTitle('');
        this.node.name = ('ActivityView');
        this.loadCompleteList = {};
        
        Util.remberActivityViewOpen = true;
    }
    onEnter() {
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._activityDataList = G_UserData.getActivity().getOpenActivityCfgList();
        if (!G_ConfigManager.checkCanRecharge()) {
            this._activityDataList = this._activityDataList.filter((v)=>{
                var id = v.id;
                if (id == 3 || id == 5 || id == 7 || id == 8 || id == 9 || id == 10 || id >= 40) {
                    return false;
                }
                return true;
            })
        }
        this._refreshActTagGroup();
        var actId = this._paramActivityId || G_UserData.getActivity().getLastSelectActId();
        this._paramActivityId = null;
        var tabIndex = this._seekTabIndexByActivityId(actId);
        if (tabIndex < 0) {
            this.setTabIndex(0);
            tabIndex = 0;
        } else {
            this.setTabIndex(tabIndex);
            // if (!success) {
            //     this._resetTabIndex();
            //     this.setTabIndex(0);
            // }
        }
        this._refreshRedPoint();
        //this._onTabSelect(tabIndex);
    }
    onExit() {
        G_UserData.getActivity().setLastSelectTabIndex(this._selectTabIndex);
        G_UserData.getActivity().setLastSelectActId(this._seekActIdByTabIndex(this._selectTabIndex));
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
    }
    _refreshRedPoint() {
        var actListData = this._getActListData();
        for (let k=0; k<actListData.length; k++) {
            var v = actListData[k];
            var redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_WELFARE, 'subActivity', v.id);
            this._tabGroup.setRedPointByTabIndex(k, redPointShow);
        }
    }
    _onEventRedPointUpdate(event, funcId, param) {
        if (funcId != FunctionConst.FUNC_WELFARE) {
            return;
        }
        if (!param || typeof(param) != 'object') {
            return;
        }
        var actId = param.actId;
        if (actId == ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
            this._refreshRedPoint();
            return;
        }
        var tabIndex = this._seekTabIndexByActivityId(actId);
        if (tabIndex >= 0) {
            var redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_WELFARE, 'subActivity', actId);
            this._tabGroup.setRedPointByTabIndex(tabIndex, redPointShow);
        }
    }
    _makeTabTextListFromTabData(actDataList) {
        var textList = [];
        for (var k=0; k<actDataList.length; k++) {
            var v = actDataList[k];
            textList.push(v.name);
        }
        return textList;
    }
    _seekTabIndexByActivityId(activityId) {
        var actListData = this._getActListData();
        for (var k=0; k<actListData.length; k++) {
            var v = actListData[k];
            if (v.id == activityId) {
                return k;
            }
        }
        return -1;
    }
    _seekActIdByTabIndex(index) {
        var actData = this._getActDataByIndex(index);
        if (actData) {
            return actData.id;
        }
        return -1;
    }
    _getActListData() {
        return this._activityDataList;
    }
    _getActDataByIndex(index?) {
        if (!index) {
            index = this._selectTabIndex;
        }
        var actListData = this._getActListData();
        var data = actListData[index];
        return data;
    }
    _refreshActTagGroup() {
        var param = {
            rootNode: this._scrollViewTab,
            containerStyle: 2,
            offset: 0,
            callback: handler(this, this._onTabSelect),
            textList: this._makeTabTextListFromTabData(this._getActListData())
        };
        this._tabGroup.recreateTabs(param);
    }
    setTabIndex(index, needCheck = true){
        if(needCheck){
            if(!this.checkActivityModuleUI(index)){
                return false;
            }
        }
        return this._tabGroup.setTabIndex(index);
    }
    _resetTabIndex() {
        this._selectTabIndex = 0;
    }
    _onTabSelect(index, sender?) {
        if(!this.checkActivityModuleUI(index)){
            return;
        }
        if (this._selectTabIndex == index) {
            return;
        }
        this._selectTabIndex = index;
        for (let i in this._activityModuleUIList) {
            var view = this._activityModuleUIList[i];
            view.node.active = (false);
            if (parseInt(i) != index && view.exitModule) {
                view.exitModule();
            }
        }
        var [activityModuleUI, newCreate] = this._getActivityModuleUI(index);
        if(activityModuleUI == null){
            return;
        }
        activityModuleUI.node.active = (true);
        if (activityModuleUI.enterModule) {
            activityModuleUI.enterModule();
        }
        this._refreshTitle(activityModuleUI);
        if (!newCreate) {
            this._resetDataForZero();
        }
        this._sendClickRedPointEvent();
    }
    _refreshTitle(activityModuleUI) {
        var data = this._getActDataByIndex();
        var actCfg:any = G_UserData.getActivity().getActivityDataById(data.id).getBaseActivityData().getConfig();
        activityModuleUI.setTitle(TextHelper.expandTextByLen(actCfg.name, 3));
    }
    _resetDataForZero() {
        var data = this._getActDataByIndex();
        var activityData = G_UserData.getActivity().getActivityDataById(data.id);
        if (activityData.isExpired()) {
            G_UserData.getActivity().pullActivityData(data.id);
        }
    }
    _getActivityModuleUI(index) {
        var activityModuleUI = this._activityModuleUIList[index];
        if (activityModuleUI == null) {
            var listData = this._getActListData();
            var data = listData[index];
            if (data.id == ActivityConst.ACT_ID_MONTHLY_CARD) {
                activityModuleUI = cc.instantiate(this.MonthlyCardView).getComponent(MonthlyCardView);
                activityModuleUI.ctor(this, data.id);
            } else if (data.id == ActivityConst.ACT_ID_SIGNIN) {
                activityModuleUI = cc.instantiate(this.DailySigninView).getComponent(DailySigninView);
                activityModuleUI.ctor(this, data.id);
            } else if (data.id == ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
                activityModuleUI = cc.instantiate(this.OpenServerFundView).getComponent(OpenServerFundView);
                activityModuleUI.ctor(this, data.id);
            } else if (data.id == ActivityConst.ACT_ID_LUXURY_GIFT_PKG) {
                activityModuleUI = cc.instantiate(this.LuxuryGiftPkgView).getComponent(LuxuruGiftPkgView);
                activityModuleUI.ctor(this, data.id);
            } else if (data.id == ActivityConst.ACT_ID_WEEKLY_GIFT_PKG) {
                activityModuleUI = cc.instantiate(this.WeeklyGiftPkgView).getComponent(WeeklyGiftPkgView);
                activityModuleUI.ctor(this, data.id);
            } else if (data.id == ActivityConst.ACT_ID_DINNER) {
                activityModuleUI = cc.instantiate(this.DinnerView).getComponent(DinnerView);
                activityModuleUI.ctor(data.id);
            } else if (data.id == ActivityConst.ACT_ID_MONEY_TREE) {
                activityModuleUI = cc.instantiate(this.MoneyTreeView).getComponent(MoneyTreeView);
                activityModuleUI.ctor(this, data.id);
            } else if (data.id == ActivityConst.ACT_ID_LEVEL_GIFT_PKG) {
                activityModuleUI = cc.instantiate(this.LevelGiftView).getComponent(LevelGiftView);
            } else if (data.id == ActivityConst.ACT_ID_BETA_APPOINTMENT) {
                //var BetaAppointmentView = require('BetaAppointmentView');
               // activityModuleUI = new BetaAppointmentView(this, data.id);
               return [null];
            } else if (data.id == ActivityConst.ACT_ID_RECHARGE_REBATE) {
                //var RechargeRebateView = require('RechargeRebateView');
                //activityModuleUI = new RechargeRebateView(this, data.id);
                return [null];
            } else if (data.id == ActivityConst.ACT_ID_RESROUCE_BACK) {
                activityModuleUI = cc.instantiate(this.ResourceBackView).getComponent(ResourceBackView);
                activityModuleUI.ctor(this, data.id);
            } else if (data.id == ActivityConst.ACT_ID_SUPER_CHECKIN) {
                activityModuleUI = cc.instantiate(this.SuperCheckinView).getComponent(SuperCheckinView);
                activityModuleUI.ctor(this, data.id);
            } else if (data.id > ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
                activityModuleUI = cc.instantiate(this.OpenServerFundView).getComponent(OpenServerFundView);
                activityModuleUI.ctor(this, data.id, UserDataHelper.getFundGroupByFundActivityId(data.id));
            }
            this._panelRight.addChild(activityModuleUI.node);
            this._activityModuleUIList[index] = activityModuleUI;
            return [
                activityModuleUI,
                true
            ];
        }
        return [
            activityModuleUI,
            false
        ];
        
    }
    checkActivityModuleUI(index) {
        var activityModuleUI = this._activityModuleUIList[index];
        if (activityModuleUI == null) {
            var listData = this._getActListData();
            var data = listData[index];
            if (data.id == ActivityConst.ACT_ID_MONTHLY_CARD) {
                let viewName = 'MonthlyCardView';
                if(this.loadCompleteList[viewName]){
                    return true;
                }
                this.loadPreabView(viewName, function(preab){
                    this.MonthlyCardView = preab;
                    this.setTabIndex(index, false);
                }.bind(this));
                return false;
            } else if (data.id == ActivityConst.ACT_ID_SIGNIN) {
                let viewName = 'DailySigninView';
                if(this.loadCompleteList[viewName]){
                    return true;
                }
                this.loadPreabView(viewName, function(preab){
                    this.DailySigninView = preab;
                    this.setTabIndex(index, false);
                }.bind(this));
                return false;
            } else if (data.id == ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
                let viewName = 'OpenServerFundView';
                if(this.loadCompleteList[viewName]){
                    return true;
                }
                this.loadPreabView(viewName, function(preab){
                    this.OpenServerFundView = preab;
                    this.setTabIndex(index, false);
                }.bind(this));
                return false;
            } else if (data.id == ActivityConst.ACT_ID_LUXURY_GIFT_PKG) {
                let viewName = 'LuxuruGiftPkgView';
                if(this.loadCompleteList[viewName]){
                    return true;
                }
                this.loadPreabView(viewName, function(preab){
                    this.LuxuryGiftPkgView = preab;
                    this.setTabIndex(index, false);
                }.bind(this));
                return false;
            } else if (data.id == ActivityConst.ACT_ID_WEEKLY_GIFT_PKG) {
                let viewName = 'WeeklyGiftPkgView';
                if(this.loadCompleteList[viewName]){
                    return true;
                }
                this.loadPreabView(viewName, function(preab){
                    this.WeeklyGiftPkgView = preab;
                    this.setTabIndex(index, false);
                }.bind(this));
                return false;
            } else if (data.id == ActivityConst.ACT_ID_DINNER) {
                let viewName = 'DinnerView';
                if(this.loadCompleteList[viewName]){
                    return true;
                }
                this.loadPreabView(viewName, function(preab){
                    this.DinnerView = preab;
                    this.setTabIndex(index, false);
                }.bind(this));
                return false;
            } else if (data.id == ActivityConst.ACT_ID_MONEY_TREE) {
                let viewName = 'MoneyTreeView';
                if(this.loadCompleteList[viewName]){
                    return true;
                }
                this.loadPreabView(viewName, function(preab){
                    this.MoneyTreeView = preab;
                    this.setTabIndex(index, false);
                }.bind(this));
                return false;
            } else if (data.id == ActivityConst.ACT_ID_LEVEL_GIFT_PKG) {
                let viewName = 'LevelGiftView';
                if(this.loadCompleteList[viewName]){
                    return true;
                }
                this.loadPreabView(viewName, function(preab){
                    this.LevelGiftView = preab;
                    this.setTabIndex(index, false);
                }.bind(this));
                return false;
            } else if (data.id == ActivityConst.ACT_ID_BETA_APPOINTMENT) {
               return true;
            } else if (data.id == ActivityConst.ACT_ID_RECHARGE_REBATE) {
                return true;
            } else if (data.id == ActivityConst.ACT_ID_RESROUCE_BACK) {
                let viewName = 'ResourceBackView';
                if(this.loadCompleteList[viewName]){
                    return true;
                }
                this.loadPreabView(viewName, function(preab){
                    this.ResourceBackView = preab;
                    this.setTabIndex(index, false);
                }.bind(this));
                return false;
            } else if (data.id == ActivityConst.ACT_ID_SUPER_CHECKIN) {
                let viewName = 'SuperCheckinView';
                if(this.loadCompleteList[viewName]){
                    return true;
                }
                this.loadPreabView(viewName, function(preab){
                    this.SuperCheckinView = preab;
                    this.setTabIndex(index, false);
                }.bind(this));
                return false;
            } else if (data.id > ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
                let viewName = 'OpenServerFundView';
                if(this.loadCompleteList[viewName]){
                    return true;
                }
                this.loadPreabView(viewName, function(preab){
                    this.OpenServerFundView = preab;
                    this.setTabIndex(index, false);
                }.bind(this));
                return false;
            }
            return true;
        }
        return true;
    }
    loadPreabView(viewName, callback){
        var path = ActivityView.loadPreabList[viewName];
        var realPath: string = 'prefab/activity/' + path;
        let preLoadRes:any[] = [];
        preLoadRes.push(realPath);
        G_WaitingMask.showWaiting(true);
        let loadCompleteList = this.loadCompleteList;
        cc.resources.load(preLoadRes, (err, resource) => {
            G_WaitingMask.showWaiting(false);
            loadCompleteList[viewName] = true;
            var prefab = cc.resources.get(realPath);
            callback && callback(prefab);
        });
    }
    _sendClickRedPointEvent() {
        var actData = this._getActDataByIndex();
        if (actData.id == ActivityConst.ACT_ID_MONTHLY_CARD) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_WELFARE, {
                actId: actData.id,
                '0': 'buyMonthCardHint'
            });
        } else if (actData.id == ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_WELFARE, {
                actId: actData.id,
                '0': 'vipHint'
            });
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_GROWTH_FUND, { actId: actData.id });
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_DAILY_GIFT_PACK, { actId: actData.id });
        } else if (actData.id == ActivityConst.ACT_ID_LUXURY_GIFT_PKG) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_WELFARE, { actId: actData.id });
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_GROWTH_FUND, { actId: actData.id });
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_DAILY_GIFT_PACK, { actId: actData.id });
        } else if (actData.id == ActivityConst.ACT_ID_WEEKLY_GIFT_PKG) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_WELFARE, { actId: actData.id });
        } else if (actData.id == ActivityConst.ACT_ID_MONEY_TREE) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_WELFARE, { actId: actData.id });
        } else if (actData.id == ActivityConst.ACT_ID_LEVEL_GIFT_PKG) {
            var redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_WELFARE, 'subActivity', ActivityConst.ACT_ID_LEVEL_GIFT_PKG);
            if (redPointShow) {
                G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_WELFARE, { actId: actData.id });
            }
        } else if (actData.id == ActivityConst.ACT_ID_BETA_APPOINTMENT) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_WELFARE, { actId: actData.id });
        } else if (actData.id == ActivityConst.ACT_ID_RECHARGE_REBATE) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_WELFARE, { actId: actData.id });
        } else if (actData.id == ActivityConst.ACT_ID_RESROUCE_BACK) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK_MEMORY, FunctionConst.FUNC_WELFARE, { actId: actData.id });
        } else if (actData.id == ActivityConst.ACT_ID_SUPER_CHECKIN) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_WELFARE, { actId: actData.id });
        } else if (actData.id > ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_WELFARE, {
                actId: ActivityConst.ACT_ID_OPEN_SERVER_FUND,
                '0': 'vipHint'
            });
        }
    }
    getActivityId() {
        var actData = this._getActDataByIndex();
        return actData.id;
    }
    // 显示等待界面
    public _showLoading(b) {
        G_WaitingMask.showWaiting(b, Waiting_Show_Type.SCENE)
    }
}
