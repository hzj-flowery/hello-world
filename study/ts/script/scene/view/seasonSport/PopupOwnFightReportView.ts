const { ccclass, property } = cc._decorator;

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_SignalManager, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import ListView from '../recovery/ListView';
import OwnFightReportCell from './OwnFightReportCell';
import { MessageErrorConst } from '../../../const/MessageErrorConst';
import { ReportParser } from '../../../fight/report/ReportParser';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';

@ccclass
export default class PopupOwnFightReportView extends PopupBase {

    @property({ type: CommonNormalMidPop, visible: true })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({ type: ListView, visible: true })
    _scrollView: ListView = null;

    @property({ type: cc.Label, visible: true })
    _textSeasonFightNum: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textSeasonFightRate: cc.Label = null;

    @property({ type: cc.Prefab, visible: true })
    _ownFightReportCellPrefab: cc.Prefab = null;

    private _isSelectedWin;
    private _ownReportData: any[];
    private _ownDanInfo;
    private _otherDanInfo;

    private _playReport;
    private _listnerSeasonEnd;

    public static waitEnterMsg(callBack) {
        function onMsgCallBack(id, message) {
            callBack();
        }
        G_UserData.getSeasonSport().c2scFightsReport();
        var signal = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_OWNFIGHTREPORT, onMsgCallBack);
        return signal;
    }

    public onCreate() {
        this._isSelectedWin = null;
        this._ownReportData = [];
        this._commonNodeBk.setTitle(Lang.get('season_own_report'));
        this._commonNodeBk.addCloseEventListener(handler(this, this._btnClose));
        this._initScrollView();
    }

    public onEnter() {
        this._playReport = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_PLAYFIGHTREPORT, handler(this, this._onPlayReport));
        this._listnerSeasonEnd = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_END, handler(this, this._onListnerSeasonEnd));
        this._ownReportData = G_UserData.getSeasonSport().getOwnFightReport();
        this._updateScrollView();
        this._updateOwnFightUI();
    }

    public onExit() {
        this._playReport.remove();
        this._listnerSeasonEnd.remove();
        this._playReport = null;
        this._listnerSeasonEnd = null;
    }

    private _onListnerSeasonEnd() {
        G_UserData.getSeasonSport().c2sFightsEntrance();
        this.close();
    }

    private _btnClose() {
        this.close();
    }

    private _initScrollView() {
        this._scrollView.setTemplate(this._ownFightReportCellPrefab);
        this._scrollView.setCallback(handler(this, this._onCellUpdate));
    }

    private _updateScrollView() {
        var maxCount = this._ownReportData.length;
        if (!this._ownReportData || maxCount <= 0) {
            return;
        }
        this._scrollView.resize(maxCount);
    }

    private _updateOwnFightUI() {
        var winNum = G_UserData.getSeasonSport().getSeason_Win_Num();
        var fightNum = G_UserData.getSeasonSport().getSeason_Fight_Num();
        var strWinRate = '0.00%';
        if (fightNum != 0) {
            strWinRate = '%.2f'.format(100 * winNum / fightNum) + '%';
        }
        this._textSeasonFightNum.string = fightNum.toString();
        this._textSeasonFightRate.string = strWinRate;
    }

    private _onCellUpdate(node: cc.Node, index) {
        if (!this._ownReportData || this._ownReportData.length <= 0) {
            return;
        }
        let cell: OwnFightReportCell = node.getComponent(OwnFightReportCell);
        var cellData: any = {};
        if (this._ownReportData[index]) {
            cellData = this._ownReportData[index];
            cellData.index = index;
            cell.setCustomCallback(handler(this, this._onCellTouch));
            cell.updateUI(cellData);
        }
    }

    private _onCellSelected(cell, index) {
    }

    private _onCellTouch(data) {
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_CANCEL_MATCHWHILEREPORT);
        this._isSelectedWin = data.is_win;
        this._ownDanInfo = {
            isOwn: true,
            sid: G_UserData.getBase().getServer_name(),
            star: data.user_star != null && data.user_star || G_UserData.getSeasonSport().getCurSeason_Star(),
            name: G_UserData.getBase().getName(),
            officialLevel: G_UserData.getBase().getOfficialLevel()
        };
        this._otherDanInfo = {
            isOwn: false,
            sid: data.sname,
            name: data.op_name,
            star: data.op_star,
            officialLevel: data.op_title
        };
        G_UserData.getSeasonSport().c2scPlayFightsReport(data.report_id);
    }

    private _onPlayReport(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let enterFightView = (message) => {
            var battleReport = G_UserData.getFightReport().getReport();
            this._ownDanInfo.isProir = battleReport.is_win == this._isSelectedWin || false;
            this._otherDanInfo.isProir = !this._ownDanInfo.isProir;
            battleReport.is_win = this._isSelectedWin;
            var reportData = ReportParser.parse(battleReport);
            var battleData: any = BattleDataHelper.parseSeasonSportData(message, true);
            battleData.is_win = battleReport.is_win;
            battleData.ownDanInfo = this._ownDanInfo;
            battleData.otherDanInfo = this._otherDanInfo;
            G_SceneManager.showScene('fight', reportData, battleData);
        }
        G_SceneManager.registerGetReport(message.battle_report, () => {
            enterFightView(message);
        });
    }
}