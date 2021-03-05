const { ccclass, property } = cc._decorator;

import { ComplexRankConst } from '../../../const/ComplexRankConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonListView from '../../../ui/component/CommonListView';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import ViewBase from '../../ViewBase';
import { CustomActivityUIHelper } from '../customActivity/CustomActivityUIHelper';

@ccclass
export default class ActivityGuildSprintView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _textNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textActDes: cc.Label = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listItemSource: CommonListView = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _titleBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitleName: cc.Label = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonRank: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMyRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRankTitle: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _countDownNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTimeTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    protected preloadResList = [  
        { path: Path.getPrefab("ActivityGuildSprintItemCell","activityGuildSprint"), type: cc.Prefab },
        // { path: "prefab/ActivityguildSprint/PopupGuildSprintRank", type: cc.Prefab }
    ]

    private _listData: Array<any>;
    private _actUnitData: any;
    private _signalActivityGuildSprintInfo: any;
    private _refreshHandler: any;

    setInitData(mainView, actUnitData) {
        this._actUnitData = actUnitData;
    }
    onCreate() {
        this._initListItemSource();
        this._refreshDes();
        this._buttonRank.setString(Lang.get('activity_guild_sprint_goto_rank'));
        this._buttonRank.addClickEventListenerEx(handler(this, this._onButtonRank))
    }
    onEnter() {
        G_UserData.getGuildSprint().c2sGetSevenDaysSprintGuild();
        this._startRefreshHandler();
        this._signalActivityGuildSprintInfo = G_SignalManager.add(SignalConst.EVENT_ACTIVITY_GUILD_SPRINT_INFO, handler(this, this._onEventActivityGuildSprintInfo));
    }
    onExit() {
        this._signalActivityGuildSprintInfo.remove();
        this._signalActivityGuildSprintInfo = null;
        this._endRefreshHandler();
    }
    _onEventActivityGuildSprintInfo(event) {
        this.refreshView();
    }
    _startRefreshHandler() {
        if (this._refreshHandler != null) {
            return;
        }
        this._refreshHandler = handler(this, this._onRefreshTick);
        this.schedule(this._refreshHandler, 1)
    }
    _endRefreshHandler() {
        if (this._refreshHandler != null) {
            this.unschedule(this._refreshHandler);
            this._refreshHandler = null;
        }
    }
    _onRefreshTick(dt) {
        this._refreshActTime();
        this._refreshMyRank();
    }
    _refreshActTime() {

        var [startTime, endTime, competitionEndTime] = this._actUnitData.srcData.getActivityStartEndTime();
        var currTime = G_ServerTime.getTime();
        var timeStr = '';
        if (currTime < competitionEndTime) {
            timeStr = CustomActivityUIHelper.getLeftDHMSFormat(competitionEndTime);
            this._textTimeTitle.string = (Lang.get('activity_guild_sprint_downtime_title'));
        } else {
            timeStr = Lang.get('activity_guild_sprint_already_finish');
            this._textTimeTitle.string = (Lang.get('activity_guild_sprint_downtime_title'));
        }
        this._textTime.string = (timeStr);
        var x = this._textTimeTitle.node.getContentSize().width + this._textTimeTitle.node.x + 11;
        this._textTime.node.x = (x);
    }
    _initListItemSource() {

    }
    _onListItemSourceItemUpdate(item: CommonListItem, index) {
        var itemData = this._listData[index];
        item.updateItem(index, itemData != null ? [itemData] : null);
    }
    _onListItemSourceItemSelected(item, index) {
    }
    _onListItemSourceItemTouch(index, params) {
    }
    _updateList(listData) {
        var lineCount = listData.length;
        this._listItemSource.spawnCount = 4;
        
        this._listItemSource.init(cc.resources.get(Path.getPrefab("ActivityGuildSprintItemCell","activityGuildSprint")), handler(this, this._onListItemSourceItemUpdate), handler(this, this._onListItemSourceItemSelected), handler(this, this._onListItemSourceItemTouch));
        this._listItemSource.setData(lineCount);
    }
    refreshView() {
        var isHasData = G_UserData.getGuildSprint().isHasData();
        if (isHasData) {
            var rankDataList = G_UserData.getGuildSprint().getShowGuilds();
            this._listData = UserDataHelper.getGuildSprintRankRewardList(rankDataList);
            this._updateList(this._listData);
        }
        this._refreshMyRank();
        this._refreshActTime();
    }
    _refreshMyRank() {
        var isActCompetitionTimeEnd = this._actUnitData.srcData.isActivityCompetitionTimeEnd();
        var showRank = !isActCompetitionTimeEnd;
        var myRank = G_UserData.getGuildSprint().getGuild_rank();
        this._textMyRank.node.active = (showRank);
        this._textRankTitle.node.active = (showRank);
        if (myRank <= 0) {
            this._textMyRank.string = (Lang.get('activity_guild_sprint_no_crops'));
        } else {
            this._textMyRank.string = (myRank).toString();
        }
        this._textTitleName.string = (showRank && Lang.get('activity_guild_sprint_title_01') || Lang.get('activity_guild_sprint_title_02'));
    }
    _refreshDes() {
        this._textActDes.string = (this._actUnitData.srcData.getDescription());
    }
    _onButtonRank(sender, state) {
        var isActCompetitionTimeEnd = this._actUnitData.srcData.isActivityCompetitionTimeEnd();
        if (isActCompetitionTimeEnd) {
            G_SceneManager.showDialog('prefab/activityGuildSprint/PopupGuildSprintRank');
        } else {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RANK, ComplexRankConst.USER_GUILD_RANK);
        }
    }


}