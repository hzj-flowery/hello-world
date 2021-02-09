const { ccclass, property } = cc._decorator;

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import { G_UserData, G_SignalManager, G_Prompt } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { SeasonSportHelper } from './SeasonSportHelper';
import ListView from '../recovery/ListView';
import SeasonDailyRewardsCell from './SeasonDailyRewardsCell';
import { bit } from '../../../utils/bit';

@ccclass
export default class PopupSeasonDailyRewards extends PopupBase {

    @property({ type: CommonNormalMidPop, visible: true })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({ type: ListView, visible: true })
    _scrollView: ListView = null;

    @property({ type: cc.Prefab, visible: true })
    _seasonDailyRewardsCellPrefab: cc.Prefab = null;

    private _ownDailyData: any[];

    private _getRewards;
    private _listnerSeasonEnd;
    private _dailyFightResult: any[];
    private _dailyWinResult: any[];

    public static waitEnterMsg(callBack) {
        function onMsgCallBack(id, message) {
            callBack();
        }
        G_UserData.getSeasonSport().c2sFightsEntrance();
        var signal = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, onMsgCallBack);
        return signal;
    }

    public onCreate() {
        this._commonNodeBk.setTitle(Lang.get('season_daily_title'));
        this._commonNodeBk.addCloseEventListener(handler(this, this._btnClose));
        this._initScrollView();
    }

    public onEnter() {
        this._getRewards = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_REWARDS, handler(this, this._onGetRewards));
        this._listnerSeasonEnd = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_END, handler(this, this._onListnerSeasonEnd));
        this._dailyFightResult = G_UserData.getSeasonSport().getDailyFightReward();
        this._dailyWinResult = G_UserData.getSeasonSport().getDailyWinReward();
        this._initData();
        this._updateScrollView();
    }

    public onExit() {
        this._getRewards.remove();
        this._listnerSeasonEnd.remove();
        this._getRewards = null;
        this._listnerSeasonEnd = null;
    }

    private _onListnerSeasonEnd() {
        G_UserData.getSeasonSport().c2sFightsEntrance();
        this.close();
    }

    private _btnClose() {
        this.close();
    }

    private _initData() {
        this._ownDailyData = SeasonSportHelper.getSeasonDailyData();
    }

    private _initScrollView() {
        this._scrollView.setTemplate(this._seasonDailyRewardsCellPrefab);
        this._scrollView.setCallback(handler(this, this._onCellUpdate));
    }

    private _updateScrollView() {
        var maxCount = this._ownDailyData.length;
        if (!this._ownDailyData || maxCount <= 0) {
            return;
        }
        this._scrollView.resize(maxCount);
    }

    private _onCellUpdate(node: cc.Node, index) {
        if (!this._ownDailyData || this._ownDailyData.length <= 0) {
            return;
        }
        let cell: SeasonDailyRewardsCell = node.getComponent(SeasonDailyRewardsCell);
        var cellData: any = {};
        if (this._ownDailyData[index]) {
            cellData = this._ownDailyData[index];
            cellData.index = index;
            if (cellData.type == 1) {
                cellData.state = this._dailyFightResult[cellData.idx] != null && this._dailyFightResult[cellData.idx] || 0;
                cellData.curNum = G_UserData.getSeasonSport().getFightNum();
                cellData.canGet = G_UserData.getSeasonSport().getFightNum() >= cellData.num || false;
            } else if (cellData.type == 2) {
                cellData.state = this._dailyWinResult[cellData.idx] != null && this._dailyWinResult[cellData.idx] || 0;
                cellData.curNum = G_UserData.getSeasonSport().getWinNum();
                cellData.canGet = G_UserData.getSeasonSport().getWinNum() >= cellData.num || false;
            }
            cell.setCustomCallback(handler(this,this._onCellTouch));
            cell.updateUI(cellData);
        }
    }

    private _onCellSelected(cell, index) {
    }

    private _onCellTouch(data) {
        if (!data) {
            return;
        }
        G_UserData.getSeasonSport().c2sFightsBonus(data.type, data.idx);
    }

    private _onGetRewards(id, message) {
        if (message.bonus_type == 3) {
            return;
        }
        G_Prompt.showAwards(message.awards);
        if (message.bonus_type == 1) {
            var state = bit.tobits(message.reward_state);
            this._dailyFightResult = state;
            G_UserData.getSeasonSport().setDailyFightReward(state);
        } else if (message.bonus_type == 2) {
            var state = bit.tobits(message.reward_state);
            this._dailyWinResult = state;
            G_UserData.getSeasonSport().setDailyWinReward(state);
        }
        this._initData();
        this._updateScrollView();
    }
}