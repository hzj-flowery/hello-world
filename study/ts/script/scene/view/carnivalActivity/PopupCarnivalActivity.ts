const { ccclass, property } = cc._decorator;

import CommonTopbarItemList from '../../../ui/component/CommonTopbarItemList'

import CommonTabGroupHorizon6 from '../../../ui/component/CommonTabGroupHorizon6'

import CarnivalActivityTab from './CarnivalActivityTab'
import PopupBase from '../../../ui/PopupBase';
import UIHelper from '../../../utils/UIHelper';
import { Colors, G_SignalManager, G_UserData, G_Prompt, G_ConfigLoader, G_EffectGfxMgr, G_ServerTime, G_ResolutionManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import { table } from '../../../utils/table';
import { CustomActivityConst } from '../../../const/CustomActivityConst';
import { assert } from '../../../utils/GlobleFunc';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { Path } from '../../../utils/Path';
import { FunctionConst } from '../../../const/FunctionConst';
import UIActionHelper from '../../../utils/UIActionHelper';
import { Lang } from '../../../lang/Lang';
import { CustomActivityUIHelper } from '../customActivity/CustomActivityUIHelper';
import CommonTabGroupScrollVertical from '../../../ui/component/CommonTabGroupScrollVertical';
import CarnivalActivityIntroLayer from './CarnivalActivityIntroLayer';
import CarnivalActivityTaskLayer from './CarnivalActivityTaskLayer';
import CarnivalActivityExchangeLayer from './CarnivalActivityExchangeLayer';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import CarnivalActivityRechargeLayer from './CarnivalActivityRechargeLayer';
import CommonTabGroupScrollHorizon from '../../../ui/component/CommonTabGroupScrollHorizon';
import CommonTabGroupHorizon from '../../../ui/component/CommonTabGroupHorizon';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { CarnivalStageActivityData } from '../../../data/CarnivalStageActivityData';
import CarnivalActivitySpecialLayer from './CarnivalActivitySpecialLayer';

export interface TapLeftItem {
    index: number,
    normalImage: cc.Node,
    downImage: cc.Node,
    textWidget: cc.Label,
    imageWidget: cc.Node,
    imageSelect: cc.Node,
    imageTag: cc.Node,
    redPoint: cc.Node

}

@ccclass
export default class PopupCarnivalActivity extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _backEffectNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCurtain1_0: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCurtain1: cc.Sprite = null;

    @property({
        type: CommonTabGroupScrollVertical,
        visible: true
    })
    _tabGroup: CommonTabGroupScrollVertical = null;

    @property({
        type: CommonTabGroupHorizon6,
        visible: true
    })
    _commonTabGroupHorizon: CommonTabGroupHorizon6 = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _countdownText: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _countdownTime: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeContent: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _title: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _rightBtn: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _rightRedPoint: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _leftBtn: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _leftRedPoint: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _closeBtn: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _tips: cc.Label = null;

    @property({
        type: CommonTopbarItemList,
        visible: true
    })
    _topBarItemList: CommonTopbarItemList = null;

    @property(cc.Prefab)
    CarnivalActivityIntroLayer: cc.Prefab = null;

    @property(cc.Prefab)
    CarnivalActivityTaskLayer: cc.Prefab = null;

    @property(cc.Prefab)
    CarnivalActivityExchangeLayer: cc.Prefab = null;

    @property(cc.Prefab)
    CarnivalActivityRechargeLayer: cc.Prefab = null;

    _carnivalActivitySpecialPanel: cc.Node = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _carnivalActivitySpecialLayer: cc.Prefab = null;

    _curTermIndex: number;
    _termsNum: number;
    _curTermData: any;
    _stagesData: CarnivalStageActivityData[];
    _visibleActivityDatas: any[];
    _curSelectLeftTabIndex: number;
    _curSelectRightTabIndex: number;
    _recoverLeftTabIndex: number;
    _recoverRightTabIndex: number;
    _activityModuleUIList: {};
    _signalGetAward: any;
    _signalActivtyDataChange: any;
    _terms: any[];
    _tabBrightColor: any;

    ctor() {
        this._curTermIndex = 0;
        this._termsNum = 0;
        this._curTermData = null;
        this._stagesData = null;
        this._visibleActivityDatas = [];
        this._curSelectLeftTabIndex = 0;
        this._curSelectRightTabIndex = 0;
        this._recoverLeftTabIndex = 0;
        this._recoverRightTabIndex = 0;
        this._activityModuleUIList = {};
        UIHelper.addEventListener(this.node, this._closeBtn, 'PopupCarnivalActivity', '_onCloseBtn');
        UIHelper.addEventListener(this.node, this._leftBtn, 'PopupCarnivalActivity', '_onLeftBtn');
        UIHelper.addEventListener(this.node, this._rightBtn, 'PopupCarnivalActivity', '_onRightBtn');
    }
    onCreate() {
        this.ctor();
        this._updateTopBar();
        //this._title.node.ignoreContentAdaptWithSize(true);
        this._refreshData();
        this._countdownText.node.active = (false);
        this._countdownTime.node.active = (false);
        // this.setSceneSize();
    }
    onEnter() {
        this._signalGetAward = G_SignalManager.add(SignalConst.EVENT_GET_CARNIVAL_ACTIVITY_AWARD_SUCCESS, handler(this, this._onEventGetAward));
        this._signalActivtyDataChange = G_SignalManager.add(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE, handler(this, this._onEventDataChange));
    }
    onExit() {
        this._signalGetAward.remove();
        this._signalGetAward = null;
        this._signalActivtyDataChange.remove();
        this._signalActivtyDataChange = null;
    }
    _updateTopBar() {
        this.resumeUpdateTopBar();
        this._topBarItemList.updateUI(TopBarStyleConst.STYLE_CARNIVAL_ACTIVITY, true);

    }
    resumeUpdateTopBar() {
        this._topBarItemList.resumeUpdate();
    }
    _onCloseBtn() {
        this.close();
    }
    _onLeftBtn() {
        if (this._curTermIndex > 1) {
            this._curTermIndex = this._curTermIndex - 1;
            this.switchTerm();
        }
    }
    _onRightBtn() {
        if (this._curTermIndex < this._termsNum) {
            this._curTermIndex = this._curTermIndex + 1;
            this.switchTerm();
        }
    }
    _onEventGetAward(event, message) {
        var activityData = G_UserData.getCarnivalActivity().getActivityDataById(message.act_id);
        if (!activityData) {
            return;
        }
        var questData = activityData.getQuestDataById(message.quest_id);
        if (!questData) {
            return;
        }
        var rewards = [];
        var fixRewards = questData.getRewardItems();
        var selectRewards = questData.getSelectRewardItems();
        for (let k in fixRewards) {
            var v = fixRewards[k];
            table.insert(rewards, v);
        }
        var award_id = (message['award_id']);
        var selectReward;
        if (award_id) {
            selectReward = selectRewards[message.award_id - 1];
        }
        if (selectReward) {
            table.insert(rewards, selectReward);
        }
        var award_num = (message['award_num']);
        var newRewards = rewards;
        if (award_num && award_num > 1) {
            newRewards = [];
            var rate = award_num;
            for (let k in rewards) {
                var v = rewards[k];
                table.insert(newRewards, {
                    type: v.type,
                    value: v.value,
                    size: v.size * rate
                });
            }
        }
        G_Prompt.showAwards(newRewards);
    }
    _refreshData() {
        var terms = G_UserData.getCarnivalActivity().getAllVisibleTermData();
        if (terms.length == 0) {
            return;
        }
        this._terms = terms;
        var oldTermData = this._curTermData;
        this._termsNum = this._terms.length;
        var selectIndex = null;
        var isRrefreshData = false;
        if (oldTermData) {
            for (let k = 1; k <= terms.length; k++) {
                var v = terms[k - 1];
                if (v.getCarnival_id() == oldTermData.getCarnival_id() && v.getTerm() == oldTermData.getTerm()) {
                    selectIndex = k;
                    isRrefreshData = true;
                    break;
                }
            }
        }
        if (selectIndex == null) {
            for (let k = 1; k <= terms.length; k++) {
                var v = terms[k - 1];
                if (v.getState() == CustomActivityConst.STATE_ING) {
                    selectIndex = k;
                    break;
                }
            }
        }
        if (selectIndex == null) {
            for (var i = terms.length; i >= 1; i--) {
                var termData = terms[i - 1];
                if (termData.getState() == CustomActivityConst.STATE_AWARD_ING) {
                    selectIndex = i;
                    break;
                }
            }
        }
        this._curTermIndex = selectIndex || 1;
        this._curTermData = this._terms[this._curTermIndex - 1];
        this._stagesData = this._curTermData.getStages();
        if (isRrefreshData) {
            this._recoverLeftTabIndex = this._curSelectLeftTabIndex;
            this._recoverRightTabIndex = this._curSelectRightTabIndex;
        }
        this._curSelectLeftTabIndex = 0;
        this._curSelectRightTabIndex = 0;
        //var normalImage = UIHelper.seekNodeByName(this._tabGroup.node, 'Image_normal');
        //var titleConfig = G_ConfigLoader.getConfig(ConfigNameConst.FESTIVAL_RES).get(this._curTermData.getTerm_icon());
        //UIHelper.loadTexture(normalImage.getComponent(cc.Sprite), titleConfig.res_id_4);
        this._refreshAll();
    }
    switchTerm() {
        this._curTermData = this._terms[this._curTermIndex - 1];
        if (!this._curTermData) {
            //assert((false, 'term data is nil');
            return;
        }
        this._stagesData = this._curTermData.getStages();
        this._curSelectLeftTabIndex = 0;
        this._curSelectRightTabIndex = 0;
        this._refreshAll();
    }
    _refreshAll() {
        this._refreshLeftTab();
        this._refreshLeftAndRightBtn();
        this._refreshAllRedPoint();
        this._refreshTitleAndOther();
    }
    _refreshTitleAndOther() {
        if (!this._curTermData) {
            return;
        }
        var FestivalResConfog = G_ConfigLoader.getConfig(ConfigNameConst.FESTIVAL_RES);
        var titleConfig = FestivalResConfog.get(this._curTermData.getTerm_icon());
        //assert((titleConfig != null, 'can not find res id');
        UIHelper.loadTextureAutoSize(this._title, titleConfig.res_id);
        //this._title.ignoreContentAdaptWithSize(true);
        UIHelper.loadTexture(this._imageBg, titleConfig.res_id_2);
        //this._imageBg.ignoreContentAdaptWithSize(true);
        UIHelper.loadTexture(this._imageBg1, titleConfig.res_id_3);
        var effectConfig = titleConfig;
        var addEffect = function (effectName, parentNode) {
            parentNode.removeAllChildren();
            if (!effectName || effectName == '') {
                return;
            }
            var effect = G_EffectGfxMgr.createPlayMovingGfx(parentNode, Path.getFightSceneEffect(effectName), null, null, false);
        };
        addEffect(effectConfig.front_eft, this._effectNode);
        addEffect(effectConfig.back_eft, this._backEffectNode);
    }
    _refreshContent() {
        var stageData = this._stagesData[this._curSelectLeftTabIndex - 1];
        if (!stageData) {
            //assert((false, 'not find stage data');
            return;
        }
        if (stageData.getSpecial_id() != 0) return;
        var activitys = this._visibleActivityDatas;
        var activityData = activitys[this._curSelectRightTabIndex - 1];
        if (!activityData) {
            //assert((false, 'not find activity data');
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_CLICK, FunctionConst.FUNC_CARNIVAL_ACTIVITY, { actId: activityData.getId() });
        this._setActivityModuleUIVisible(false);
        var activityModuleUI = this._getActivityModuleUI(activityData);
        activityModuleUI.node.active = (true);
        (activityModuleUI as any).refreshView(activityData, true);
    }
    _onLeftTabSelect(tabIndex, sender) {
        if (tabIndex + 1 == this._curSelectLeftTabIndex) {
            return;
        }
        this._curSelectLeftTabIndex = tabIndex + 1;
        this._refreshRightTab();
    }
    _createLeftTabItem(tabNode) {
        var tabItem = {} as TapLeftItem;
        var instNode = tabNode;
        tabItem.normalImage = UIHelper.seekNodeByName(instNode, 'Image_normal');
        tabItem.downImage = UIHelper.seekNodeByName(instNode, 'Image_down');
        tabItem.textWidget = UIHelper.seekNodeByName(instNode, 'Text_desc').getComponent(cc.Label);
        tabItem.textWidget.fontSize = (24);
        //(tabItem.textWidget as cc.Label).disableEffect(cc.LabelEffect.OUTLINE);
        tabItem.imageWidget = UIHelper.seekNodeByName(instNode, 'Image_icon');
        tabItem.imageSelect = UIHelper.seekNodeByName(instNode, 'Image_select');
        tabItem.imageTag = UIHelper.seekNodeByName(instNode, 'Image_tag');
        //tabItem.imageWidget.ignoreContentAdaptWithSize(true);
        tabItem.redPoint = UIHelper.seekNodeByName(instNode, 'Image_RedPoint');
        return tabItem;
    }
    _updateLeftTabItem(tabItem: TapLeftItem) {
        var index = tabItem.index;
        var stageData = this._stagesData[index];
        if (stageData) {
            tabItem.textWidget.string = (stageData.getName());
        }
    }
    _getLeftTabCount() {
        return this._stagesData.length;
    }
    _refreshLeftTab() {

        var FestivalResConfog = G_ConfigLoader.getConfig(ConfigNameConst.FESTIVAL_RES);
        var titleConfig = FestivalResConfog.get(this._curTermData.getTerm_icon());
        this._tabBrightColor = Colors.toColor3B(Number(titleConfig.color_5))
        var param = {
            rootNode: this._tabGroup._scrollViewTab,
            callback: handler(this, this._onLeftTabSelect),
            containerStyle: 2,
            offset: 2,
            tabStyle: 1,
            createTabItemCallback: handler(this, this._createLeftTabItem),
            updateTabItemCallback: handler(this, this._updateLeftTabItem),
            getTabCountCallback: handler(this, this._getLeftTabCount),
            brightTabItemCallback: handler(this, this._brightLeftTabItem)
        };
        this._curSelectLeftTabIndex = 0;
        this._tabGroup.recreateTabs(param);
        this._tips.node.color = (Colors.toColor3B(Number(titleConfig.color_4)));
        UIHelper.enableOutline(this._tips, Colors.toColor3B(Number(titleConfig.color_4_1)), 2);
        if (this._recoverLeftTabIndex != 0 && this._recoverLeftTabIndex <= this._stagesData.length) {
            this._tabGroup.setTabIndex(this._recoverLeftTabIndex - 1);
        } else {
            this._tabGroup.setTabIndex(0);
        }
        this._recoverLeftTabIndex = 0;
    }
    _onRightTabSelect(tabIndex, sender) {
        if (tabIndex + 1 == this._curSelectRightTabIndex) {
            return;
        }
        this._curSelectRightTabIndex = tabIndex + 1;
        this._refreshContent();
        this._refreshTabRedPoint();
    }
    _refreshRightTab() {
        var stageData = this._stagesData[this._curSelectLeftTabIndex - 1];
        if (stageData.getSpecial_id() != 0) {
            this._setActivityModuleUIVisible(false);
            var specialPanel = this._getSpecialDesPanel(stageData.getSpecial_id());
            specialPanel.active = (true);
            return;
        }
        var activitys = stageData.getVisibleActivitys();
        var textList = [];
        for (let k in activitys) {
            var v = activitys[k];
            table.insert(textList, v.getTitle());
        }
        if (textList.length <= 0) {
            this._setActivityModuleUIVisible(false);
        }
        var param = {
            callback: handler(this, this._onRightTabSelect),
            isVertical: 2,
            offset: 2,
            textList: textList,
            brightTabItemCallback: handler(this, this._brightTabItem)
        };
        this._curSelectRightTabIndex = 0;
        this._visibleActivityDatas = activitys;
        this._commonTabGroupHorizon.recreateTabs(param);
        if (this._recoverRightTabIndex != 0 && this._recoverRightTabIndex <= textList.length) {
            this._commonTabGroupHorizon.setTabIndex(this._recoverRightTabIndex - 1);
        } else {
            this._commonTabGroupHorizon.setTabIndex(0);
        }
        this._recoverRightTabIndex = 0;
        this._refreshTabRedPoint();
    }
    _brightLeftTabItem(tabItem: TapLeftItem, bright) {
        var textWidget = tabItem.textWidget;
        var normalImage = tabItem.normalImage;
        var downImage = tabItem.downImage;
        normalImage.active = (!bright);
        downImage.active = (bright);
        textWidget.node.color = (bright && Colors.TAB_CHOOSE_TEXT_COLOR || Colors.TAB_NORMAL_TEXT_COLOR);
    }
    _brightTabItem(tabItem, bright) {
        var textWidget = tabItem.textWidget;
        var normalImage = tabItem.normalImage;
        var downImage = tabItem.downImage;
        normalImage.active = (!bright);
        downImage.active = (bright);
        textWidget.color = (bright && Colors.TAB_TWO_SELECTED || Colors.TAB_TWO_NORMAL);
    }
    _refreshTime() {
        this._countdownTime.node.stopAllActions();
        this._updateTime();
        var action = UIActionHelper.createUpdateAction(function () {
            this._updateTime();
        }, 0.5);
        this._countdownTime.node.runAction(action);
    }
    _updateTime() {
        if (!this._curTermData) {
            return;
        }
        var startTime = this._curTermData.getStart_time();
        var endTime = this._curTermData.getEnd_time();
        var awardTime = this._curTermData.getAward_time();
        var curTime = G_ServerTime.getTime();
        if (curTime < startTime) {
            this._countdownText.node.active = (true);
            this._countdownText.string = (Lang.get('lang_carnival_activity_begin_countdown'));
            this._countdownTime.string = (CustomActivityUIHelper.getLeftDHMSFormat(startTime));
        } else if (curTime >= startTime && curTime < endTime) {
            this._countdownText.node.active = (true);
            this._countdownText.string = (Lang.get('lang_carnival_activity_end_countdown'));
            this._countdownTime.string = (CustomActivityUIHelper.getLeftDHMSFormat(endTime));
        } else if (curTime >= endTime && curTime < awardTime) {
            this._countdownText.node.active = (true);
            this._countdownText.string = (Lang.get('lang_carnival_activity_award_end_countdown'));
            this._countdownTime.string = (CustomActivityUIHelper.getLeftDHMSFormat(awardTime));
        } else {
            this._countdownText.node.active = (false);
            this._countdownTime.node.stopAllActions();
            this._countdownTime.string = (Lang.get('lang_carnival_activity_award_end'));
        }
    }
    _refreshLeftAndRightBtn() {
        this._leftBtn.node.active = (this._curTermIndex > 1);
        this._rightBtn.node.active = (this._curTermIndex < this._termsNum);
    }
    _refreshTabRedPoint() {
        if (!this._stagesData) {
            return;
        }
        for (let k = 1; k <= this._stagesData.length; k++) {
            var v = this._stagesData[k - 1];
            var activitys = v.getVisibleActivitys();
            var havaRedPoint = false;
            for (let i in activitys) {
                var act = activitys[i];
                if (act.isHasRedPoint()) {
                    havaRedPoint = true;
                    break;
                }
            }
            this._tabGroup.setRedPointByTabIndex(k, havaRedPoint);
        }
        for (let k = 1; k <= this._visibleActivityDatas.length; k++) {
            var act = this._visibleActivityDatas[k - 1];
            if (act.isHasRedPoint()) {
                this._commonTabGroupHorizon.setRedPointByTabIndex(k - 1, true);
            } else {
                this._commonTabGroupHorizon.setRedPointByTabIndex(k - 1, false);
            }
        }
    }
    _refreshAllRedPoint() {
        this._refreshTabRedPoint();
        var leftBtnRedPoint = false;
        var rightBtnRedPoint = false;
        var leftTerms = {};
        var leftCount = 0;
        for (var i = 1; i <= this._curTermIndex - 1; i++) {
            var termData = this._terms[i - 1];
            var key = termData.getCarnival_id() + ('_' + termData.getTerm());
            leftTerms[key] = true;
            leftCount = leftCount + 1;
        }
        if (leftCount > 0) {
            leftBtnRedPoint = G_UserData.getCarnivalActivity().isTermsHasRedPoint(leftTerms);
        }
        var rightTerms = {};
        var rightCount = 0;
        for (var i = this._curTermIndex + 1; i <= this._termsNum; i++) {
            var termData = this._terms[i - 1];
            var key = termData.getCarnival_id() + ('_' + termData.getTerm());
            rightTerms[key] = true;
            rightCount = rightCount + 1;
        }
        if (rightCount > 0) {
            rightBtnRedPoint = G_UserData.getCarnivalActivity().isTermsHasRedPoint(rightTerms);
        }
        this._rightRedPoint.node.active = (rightBtnRedPoint);
        this._leftRedPoint.node.active = (leftBtnRedPoint);
    }
    _onEventDataChange() {
        this._refreshData();
    }
    _setActivityModuleUIVisible(visible) {
        for (let i in this._activityModuleUIList) {
            var view = this._activityModuleUIList[i];
            (view as cc.Component).node.active = (visible);
        }
        if (this._carnivalActivitySpecialPanel) {
            this._carnivalActivitySpecialPanel.active = (false);
        }
    }
    _getActivityModuleUI(actUnitdata): cc.Component {
        var actType = actUnitdata.getAct_type();
        var activityModuleUI = this._activityModuleUIList[actType];
        if (activityModuleUI == null) {
            if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_DROP_SHOW) {
                activityModuleUI = cc.instantiate(this.CarnivalActivityIntroLayer).getComponent(CarnivalActivityIntroLayer);
                activityModuleUI.ctor(actType);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL) {
                activityModuleUI = cc.instantiate(this.CarnivalActivityExchangeLayer).getComponent(CarnivalActivityExchangeLayer);
                activityModuleUI.ctor(actType);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY) {
                activityModuleUI = cc.instantiate(this.CarnivalActivityRechargeLayer).getComponent(CarnivalActivityRechargeLayer);
                activityModuleUI.ctor(actType);
            } else if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PUSH) {
                activityModuleUI = cc.instantiate(this.CarnivalActivityTaskLayer).getComponent(CarnivalActivityTaskLayer);
                activityModuleUI.ctor(actType);
            }
            var point = G_ResolutionManager.getDesignCCPoint();
            // activityModuleUI.node.setPosition(-point.x, -point.y);
            activityModuleUI.node.setPosition(-1136 / 2, -640 / 2);
            this._nodeContent.addChild(activityModuleUI.node);
            this._activityModuleUIList[actType] = activityModuleUI;
        }
        return activityModuleUI;
    }
    _getSpecialDesPanel(special_id) {
        if (this._carnivalActivitySpecialPanel == null) {
            this._carnivalActivitySpecialPanel = cc.instantiate(this._carnivalActivitySpecialLayer);
            this._carnivalActivitySpecialPanel.getComponent(CarnivalActivitySpecialLayer).ctor(special_id)
            var point = G_ResolutionManager.getDesignCCPoint();
            this._carnivalActivitySpecialPanel.setPosition(-point.x, -point.y);
            this._nodeContent.addChild(this._carnivalActivitySpecialPanel);
        }
        return this._carnivalActivitySpecialPanel;
    }

}
