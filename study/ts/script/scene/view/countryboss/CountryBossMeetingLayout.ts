import { CountryBossConst } from "../../../const/CountryBossConst";
import { SignalConst } from "../../../const/SignalConst";
import { Colors, G_ServerTime, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonCountdown from "../../../ui/component/CommonCountdown";
import CommonListView from "../../../ui/component/CommonListView";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import { handler } from "../../../utils/handler";
import ViewBase from "../../ViewBase";
import { CountryBossHelper } from "./CountryBossHelper";
import StageWidget from "./StageWidget";










const { ccclass, property } = cc._decorator;



@ccclass
export default class CountryBossMeetingLayout extends ViewBase {
    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _popBg: CommonNormalLargePop = null;
    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;
    @property({
        type: CommonCountdown,
        visible: true
    })
    _commonCountDown: CommonCountdown = null;

    @property({ type: cc.Prefab, visible: true })
    countryBossMeetingCell: cc.Prefab = null;
    _closeCallback: any;
    _signalRefresh: any;
    _signalVote: any;
    _signalEnter: any;
    _datas: any[];
    _stageWidget: any;

    ctor(callback) {
        this._closeCallback = callback;
    }
    onCreate() {
        this.setSceneSize(null, false);
        this.node.name = "CountryBossMeetingLayout";
        this._popBg.setTitle(Lang.get('country_boss_meeting_title'));
        this._popBg.setCloseVisible(false);
        this._initListView();
        this._initWidget();
        this._initData();
        this.updateUI();
    }
    close() {
        if (this._closeCallback) {
            this._closeCallback();
        }
        this.node.destroy();
    }
    onEnter() {
        this._signalRefresh = G_SignalManager.add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_VOTE_SUCCESS, handler(this, this._onEventRefresh));
        this._signalVote = G_SignalManager.add(SignalConst.EVENT_COUNTRY_BOSS_VOTE_SUCCESS, handler(this, this._onEventRefresh));
        this._signalEnter = G_SignalManager.add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, handler(this, this._onEventEnter));
    }
    onExit() {
        this._signalRefresh.remove();
        this._signalRefresh = null;
        this._signalVote.remove();
        this._signalVote = null;
        this._signalEnter.remove();
        this._signalEnter = null;
    }
    _initData() {
        var configList = CountryBossHelper.getBossConfigListByType(2);
        var datas = [];
        for (var k in configList) {
            var v = configList[k];
            var singleData: any = {};
            singleData.hero_id = v.hero_id;
            singleData.id = v.id;
            singleData.vote = 0;
            singleData.name = v.name;
            singleData.config = v;
            [singleData.isUnLock, singleData.lockStr] = CountryBossHelper.getLockString(v);
            datas.push(singleData);
        }
        this._datas = datas;
    }
    _onEventRefresh() {
        if (this.updateUI) {
            this.updateUI();
        }
    }
    _onStageChangeCallback(curStage) {
        this.updateUI();
    }
    _initWidget() {
        this._commonCountDown.enableEndLable(Lang.get('country_boss_countdown_vote_end'));
        this._commonCountDown.setCountdownLableParam({ color: Colors.BRIGHT_BG_TWO });
        this._commonCountDown.setEndLabelParam({ color: Colors.BRIGHT_BG_TWO });
        this._commonCountDown.setCountdownTimeParam({ color: Colors.BRIGHT_BG_RED });
        this._stageWidget = StageWidget.newIns(this.node, handler(this, this._onStageChangeCallback))
    }
    updateUI() {
        for (var k in this._datas) {
            var v = this._datas[k];
            v.vote = G_UserData.getCountryBoss().getVoteById(v.id);
            [v.isUnLock, v.lockStr] = CountryBossHelper.getLockString(v.config);
        }
        this._listView.setData(this._datas.length);
        var curStage = this._stageWidget.updateStage();
        if (curStage == CountryBossConst.STAGE2) {
            var [_, endTime] = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE2);
            this._commonCountDown.startCountDown(Lang.get('country_boss_meeting_countdown_label'), endTime, null, function (t) {
                var curTime = G_ServerTime.getTime();
                var dt = t - curTime;
                if (dt < 0) {
                    dt = 0;
                }
                return Lang.get('country_boss_meeting_countdown', { num: dt });
            });
        } else {
            this._commonCountDown.setEndLabelString(Lang.get('country_boss_countdown_vote_end'));
        }
    }
    _initListView() {
        this._listView.init(this.countryBossMeetingCell, handler(this, this._onListViewItemUpdate))
    }
    _onListViewItemUpdate(item, index) {
        item.updateItem(index,this._datas[index]);
    }
    _onListViewItemSelected(item, index) {
    }
    _onListViewItemTouch(index, params) {
    }
    _onEventEnter() {
        this.updateUI();
    }
}