import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import CommonListView from "../../../ui/component/CommonListView";
import { handler } from "../../../utils/handler";
import { Lang } from "../../../lang/Lang";
import PopupSingleRaceReplayCell from "./PopupSingleRaceReplayCell";
import { G_SignalManager, G_UserData, G_SceneManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import PopupBase from "../../../ui/PopupBase";
import { ReportParser } from "../../../fight/report/ReportParser";
import { BattleDataHelper } from "../../../utils/data/BattleDataHelper";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import { Round } from "../../../fight/report/WaveData";
import { ObjKeyLength } from "../../../utils/GlobleFunc";

const { ccclass, property } = cc._decorator;



@ccclass
export default class PopupSingleRaceReplay extends PopupBase {
    public static path = 'singleRace/PopupSingleRaceReplay';

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _popBG: CommonNormalLargePop = null;
    @property({
        type: CommonCustomListView,
        visible: true
    })
    _listView: CommonCustomListView = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textScore: cc.Label = null;
    @property(cc.Prefab)
    popupSingleRaceReplayCell: cc.Prefab = null;

    _replays: any;
    _curReportId: number;
    _signalGetBattleReport: any;

    ctor(replays) {
        this._replays = replays;
    }
    onCreate() {
        this._curReportId = 0;
        this._popBG.addCloseEventListener(handler(this, this._onButtonClose));
        this._popBG.setTitle(Lang.get('camp_replay_title'));
        this._popBG.setTitlePositionX(-45);
        //this._listView.init(this.popupSingleRaceReplayCell, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
    }
    onEnter() {
        this._signalGetBattleReport = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_GET_REPORT, handler(this, this._onEventGetReport));
        this._updateList();
        this._updateScore();
    }
    onExit() {
        this._signalGetBattleReport.remove();
        this._signalGetBattleReport = null;
    }
    _updateList() {
       // this._listView.setData(this._replays.length);
       var len = ObjKeyLength(this._replays);
       for (var i in this._replays) {
           var replay = this._replays[i];
           var round = Number(i);
           var isLast = len  == round;
           var item = cc.instantiate(this.popupSingleRaceReplayCell).getComponent(PopupSingleRaceReplayCell);
           item.setCustomCallback(handler(this, this._onItemTouch));
           this._listView.pushBackCustomItem(item.node);
           item.updateUI(i, [replay, round, isLast]);
       }
    }
    _updateScore() {
        var [score1, score2] = G_UserData.getSingleRace().getWinNumWithReportData(this._replays);
        this._textScore.string = (Lang.get('single_race_replay_score', {
            score1: score1,
            score2: score2
        }));
    }
    _onItemUpdate(item, index, type) {
        var round = index;
        var replay = this._replays[round];
        if (replay) {
            var isLast = this._replays.length == round;
            item.updateItem(index, [replay, round, isLast], type);
        } else {
            item.updateItem(index, null, type);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, reportId) {
        G_UserData.getSingleRace().c2sGetBattleReport(reportId);
        this._curReportId = reportId;
    }
    _onButtonClose() {
        this.close();
    }
    _onEventGetReport(eventName, battleReport, id) {
        function enterFightView() {
            var battleReport = G_UserData.getFightReport().getReport();
            var reportData = ReportParser.parse(battleReport);
            var leftName = reportData.getLeftName();
            var leftOfficer = reportData.getAttackOfficerLevel();
            var rightName = reportData.getRightName();
            var rightOfficer = reportData.getDefenseOfficerLevel();
            var winPos = 1;
            if (!reportData.getIsWin()) {
                winPos = 2;
            }
            var battleData = BattleDataHelper.parseSingleRace(leftName, rightName, leftOfficer, rightOfficer, winPos);
            G_SceneManager.showScene('fight', reportData, battleData);
        }
        if (id == this._curReportId) {
            G_SceneManager.registerGetReport(battleReport, function () {
                enterFightView();
            });
        }
    }
}