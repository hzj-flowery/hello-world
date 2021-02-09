const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_Prompt, G_SignalManager, G_UserData, G_ConfigLoader, G_SceneManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonListView from '../../../ui/component/CommonListView';
import CommonTabGroupVertical from '../../../ui/component/CommonTabGroupVertical';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { Path } from '../../../utils/Path';
import { table } from '../../../utils/table';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import DailyActivityHint from './DailyActivityHint';
import DailyActivityHintNew from './DailyActivityHintNew';
import DailyMissionActiviyValue from './DailyMissionActiviyValue';




@ccclass
export default class AchievementView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBk: cc.Node = null;

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAchievement: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _listView: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeDaily: cc.Node = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listViewDaily: CommonListView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeDailyValue: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeActivityHint: cc.Node = null;

    @property({
        type: CommonTabGroupVertical,
        visible: true
    })
    _nodeTabRoot: CommonTabGroupVertical = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _tabListView: CommonListView = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _dailyActivityHint: cc.Prefab = null;


    protected preloadResListInner = [
        Path.getPrefab("DailyMissionActiviyValue", "achievement"),
        Path.getPrefab("AchievementItemCell", "achievement"),
        // Path.getPrefab("DailyActivityHintNew", "achievement"),
        // Path.getPrefab("DailyActivityHintCellNew", "achievement"),
        Path.getPrefab("DailyMissionItemCell", "achievement"),
    ];

    // protected preloadResListInner = [
    //     {path:Path.getPrefab("DailyMissionActiviyValue","achievement"),type:cc.Prefab},
    //     {path:Path.getPrefab("AchievementItemCell","achievement"),type:cc.Prefab},
    //     {path:Path.getPrefab("DailyActivityHint","achievement"),type:cc.Prefab},
    //     {path:Path.getPrefab("DailyActivityHintCell","achievement"),type:cc.Prefab},
    //     {path:Path.getPrefab("DailyMissionItemCell","achievement"),type:cc.Prefab},
    //     {path:Path.getUICommonFrame('img_frame_07'),type:cc.SpriteFrame}
    // ];


    private _getAchievementInfo: any;
    private _getAchievementReward: any;
    private _updateAchievementInfo: any;
    private _signalRedPointUpdate: any;
    private _getDailyReward: any;
    private _updateDailyInfo: any;
    private _updateDailyMission: any;

    private _selectTabIndex: number = 0;
    private _initTabIndex: number;
    private _dailyMissionActiviyValue: DailyMissionActiviyValue;
    // private _dailyActivityHintView: DailyActivityHint;
    private _dailyActivityHintView: DailyActivityHintNew;
    private _fullScreenTitles: Array<string> = [];
    private static FIRST_MEET_OPEN_DAYS = 40;
    private _dataList: any;
    private _achievementItemCell: any;
    private _dailyMissionItemCell: any;
    private _hasLoaded: boolean = false;

    setInitData(selectTab) {
        
        this._initTabIndex = selectTab || 0;

        this._selectTabIndex = this._initTabIndex-1;

        if(this._selectTabIndex<0)this._selectTabIndex = 0;
    }
    onCreate() {
        this.setSceneSize();
        this.setInitData(G_SceneManager.getViewArgs("achievement")[0])
        this._topbarBase.setImageTitle('txt_sys_com_renwu');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._fullScreenTitles = [
            Lang.get('achievement_tab_title1'),
            Lang.get('achievement_tab_title2'),
            Lang.get('achievement_tab_title3'),
            Lang.get('achievement_tab_title4')
        ];
        var openServerDays = G_UserData.getBase().getOpenServerDayNum();
        var firstMeetOpenDays = Number(G_ConfigLoader.getConfig('parameter').get(871).content);
        if (openServerDays >= firstMeetOpenDays) {
            table.insert(this._fullScreenTitles, Lang.get('achievement_tab_title5'));
        }
        var param = {
            containerStyle: 1,
            tabIndex:0,
            callback: handler(this, this._onTabSelect),
            textList: this._fullScreenTitles
        };

        cc.resources.load(this.preloadResListInner, cc.Prefab, function () {
            this._dailyMissionActiviyValue = (cc.instantiate(cc.resources.get(Path.getPrefab("DailyMissionActiviyValue", "achievement"))) as cc.Node).getComponent(DailyMissionActiviyValue);
            this._achievementItemCell = cc.resources.get(Path.getPrefab("AchievementItemCell", "achievement"));
            // this._dailyActivityHint = cc.resources.get(Path.getPrefab("DailyActivityHintNew", "achievement"));
            this._dailyMissionItemCell = cc.resources.get(Path.getPrefab("DailyMissionItemCell", "achievement"));
            this._nodeDailyValue.addChild(this._dailyMissionActiviyValue.node);
            this._hasLoaded = true;
            this.updateUI();
        }.bind(this))

        this._commonFullScreen.setTitle(this._fullScreenTitles[this._selectTabIndex]);

        this._nodeTabRoot.recreateTabs(param);
        this._nodeTabRoot.setTabIndex(this._selectTabIndex||0);

        G_UserData.getWorldBoss().c2sGetWorldBossVoteInfo();
        G_UserData.getCrossWorldBoss().c2sGetCrossWorldBossVoteInfo();
        G_UserData.getCrossWorldBoss().c2sEnterCrossWorldBoss();
    }
    onEnter() {
        this._getAchievementInfo = G_SignalManager.add(SignalConst.EVENT_GET_ACHIEVEMENT_INFO, handler(this, this._onEventGetAchievementInfo));
        this._getAchievementReward = G_SignalManager.add(SignalConst.EVENT_GET_ACHIEVEMENT_AWARD, handler(this, this._onEventGetAchievementReward));
        this._updateAchievementInfo = G_SignalManager.add(SignalConst.EVENT_GET_ACHIEVEMENT_UPDATE, handler(this, this._onEventUpdateAchievementInfo));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._getDailyReward = G_SignalManager.add(SignalConst.EVENT_DAILY_TASK_AWARD, handler(this, this._onEventGetDailyTaskReward));
        this._updateDailyInfo = G_SignalManager.add(SignalConst.EVENT_DAILY_TASK_INFO, handler(this, this._onEventUpdateDailyInfoFunc));
        this._updateDailyMission = G_SignalManager.add(SignalConst.EVENT_DAILY_TASK_UPDATE, handler(this, this._onEventDailyTaskUpdate));
        this._onEventRedPointUpdate();
        this.updateUI();
    }

    private updateUI() {
        if (!this._hasLoaded) return;
        if (this._selectTabIndex >= 0) {
            this._nodeTabRoot.setTabIndex(this._selectTabIndex);
            this._updateListView(this._selectTabIndex);
        } else {
            this._nodeTabRoot.setTabIndex(this._initTabIndex);
        }
    }


    _onTabSelect(index, sender) {
        if (this._selectTabIndex == index) {
            return;
        }
        this._commonFullScreen.setTitle(this._fullScreenTitles[index]);
        this._selectTabIndex = index;
        this._updateListView(this._selectTabIndex);
    }
    _onEventRedPointUpdate() {
        var dailyPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_DAILY_MISSION, 'dailyRP');
        cc.log(dailyPoint);
        this._nodeTabRoot.setRedPointByTabIndex(1, dailyPoint);
        var limitTimePoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAMP_RACE);
        var canDonate = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GRAIN_CAR, 'canDonate');
        this._nodeTabRoot.setRedPointByTabIndex(2, limitTimePoint||canDonate);
        var targetPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ACHIEVEMENT, 'targetRP');
        this._nodeTabRoot.setRedPointByTabIndex(3, targetPoint);
        var gamePoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ACHIEVEMENT, 'gameRP');
        this._nodeTabRoot.setRedPointByTabIndex(4, gamePoint);
        var firstMeetPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ACHIEVEMENT, 'firstMeetRP');
        this._nodeTabRoot.setRedPointByTabIndex(5, firstMeetPoint);
    }
    onExit() {
        this._getAchievementInfo.remove();
        this._getAchievementInfo = null;
        this._getAchievementReward.remove();
        this._getAchievementReward = null;
        this._updateAchievementInfo.remove();
        this._updateAchievementInfo = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._getDailyReward.remove();
        this._getDailyReward = null;
        this._updateDailyInfo.remove();
        this._updateDailyInfo = null;
        this._updateDailyMission.remove();
        this._updateDailyMission = null;
    }

    private _lastUpdateTabIndex: number = 0;
    _updateListView(tabIndex) {

        tabIndex = tabIndex = null ? 1 : tabIndex;
        tabIndex = tabIndex + 1;
        this._nodeDaily.active = (false);
        this._nodeAchievement.active = (false);
        this._nodeActivityHint.active = (false);
        if (tabIndex == 1) {
            if (G_UserData.getDailyMission().isExpired() == true) {
                G_UserData.getDailyMission().c2sGetDailyTaskInfo();
            }
            this._nodeDaily.active = (true);
            this._dataList = G_UserData.getDailyMission().getDailyMissionDatas(false);
            this._dailyMissionActiviyValue.updateUI();
            if (this._listViewDaily.isHasLoaded() == false) {
                this._listViewDaily.spawnCount = 6;
                this._listViewDaily.init(cc.instantiate(this._dailyMissionItemCell), handler(this, this._onDailyItemUpdate), handler(this, this._onDailyItemSelected)
                    , handler(this, this._onDailyItemTouch));
                this._listViewDaily.resize(this._dataList.length);
            }
            else {
                this._listViewDaily.setData(this._dataList.length, 0, true);
            }
            this._listViewDaily.scrollView.scrollToTop();
        } else if (tabIndex == 2) {
            this._nodeActivityHint.active = (true);
            if (!this._dailyActivityHintView) {
                this._dailyActivityHintView = (cc.instantiate(this._dailyActivityHint) as cc.Node).getComponent(DailyActivityHintNew);
                this._nodeActivityHint.addChild(this._dailyActivityHintView.node);
            }
            this._dailyActivityHintView.onReEnterModule();
        } else {
            if (G_UserData.getAchievement().isExpired() == true) {
                G_UserData.getAchievement().c2sGetAchievementInfo();
            }
            this._nodeAchievement.active = (true);
            this._dataList = G_UserData.getAchievement().getAchievementListData(tabIndex - 2) || {};
            if (this._tabListView.isHasLoaded() == false) {
                this._tabListView.spawnCount = 6;
                this._tabListView.init(cc.instantiate(this._achievementItemCell),
                    handler(this, this._onItemUpdate), handler(this, this._onItemSelected), handler(this, this._onItemTouch));
                this._tabListView.resize(this._dataList.length);
            }
            else {
                this._tabListView.setData(this._dataList.length, 0, true);
            }
        }
        this._lastUpdateTabIndex = tabIndex;
    }
    _onDailyItemUpdate(item: CommonListItem, index) {
        var data = this._dataList[index];
        item.updateItem(index, data != null ? [data] : null);
    }
    _onDailyItemSelected(index, missonId) {
        G_UserData.getDailyMission().c2sGetDailyTaskAward(missonId);
    }
    _onDailyItemTouch(index, missonId) {
        G_UserData.getDailyMission().c2sGetDailyTaskAward(missonId);
    }
    _onItemUpdate(item: CommonListItem, index) {
        var data = this._dataList[index];
        item.updateItem(index, data != null ? [data] : null);
    }
    _onItemSelected(index, achId) {
        G_UserData.getAchievement().c2sGetAchievementReward(achId);
    }
    _onItemTouch(index, achId) {
        G_UserData.getAchievement().c2sGetAchievementReward(achId);
    }
    _onEventGetAchievementReward(eventId, message) {
        if (message.ret != 1) {
            return;
        }
        var awards = message['awards'] || {};
        G_Prompt.showAwards(awards);
    }
    _onEventUpdateAchievementInfo(eventId, message) {
        this._updateListView(this._selectTabIndex);
    }
    _onEventGetAchievementInfo(eventId, message) {
        this._updateListView(this._selectTabIndex);
    }
    _onEventUpdateDailyInfoFunc() {
        this._updateListView(this._selectTabIndex);
    }
    _onEventDailyTaskUpdate() {
        this._updateListView(this._selectTabIndex);
    }
    _onEventGetDailyTaskReward(id, message) {
        var awards = message['awards'] || {};
        G_Prompt.showAwards(awards);
        this._updateListView(this._selectTabIndex);
        UserCheck.isLevelUp();
        var id = message['id'] || 0;
        var activityItemList = this._dailyMissionActiviyValue.getActivityItemList();
        var lastActivity = activityItemList[activityItemList.length];
        if (lastActivity && lastActivity.id == id) {
            UIPopupHelper.popupCommentGuide();
        }
    }


}