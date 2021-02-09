const { ccclass, property } = cc._decorator;

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_SignalManager, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import ListView from '../recovery/ListView';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { SeasonSportHelper } from './SeasonSportHelper';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import SeasonRankCell from './SeasonRankCell';
import PopupRecentReportView from './PopupRecentReportView';

@ccclass
export default class PopupSeasonRankView extends PopupBase {

    @property({ type: CommonNormalLargePop, visible: true })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({ type: CommonEmptyListNode, visible: true })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({ type: ListView, visible: true })
    _scrollView: ListView = null;

    @property({ type: cc.Label, visible: true })
    _ownRank: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSword: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageOwnDan: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textOwnStar: cc.Label = null;
    @property({ type: cc.Prefab, visible: true })
    _seasonRankCellPrefab: cc.Prefab = null;

    public static _rankData: any[];
    private _seasonRankData: any[];
    private _listnerSeasonEnd;

    public static waitEnterMsg(callBack) {
        function onMsgCallBack(id, message) {
            PopupSeasonRankView._rankData = message.ladder || [];
            callBack();
        }
        PopupSeasonRankView._rankData = [];
        G_UserData.getSeasonSport().c2sFightsLadder();
        var signal = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_RANK, onMsgCallBack);
        return signal;
    }

    public onCreate() {
        this._seasonRankData = PopupSeasonRankView._rankData;
        this._commonNodeBk.setTitle(Lang.get('common_title_rank'));
        this._commonNodeBk.addCloseEventListener(handler(this, this._onBtnClose));
        this._initScrollView();
    }

    public onEnter() {
        this._listnerSeasonEnd = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_END, handler(this, this._onListnerSeasonEnd));
        this._updateOwnView();
        this._updateScrollView();
    }

    public onExit() {
        this._listnerSeasonEnd.remove();
        this._listnerSeasonEnd = null;
    }

    private _onListnerSeasonEnd() {
        G_UserData.getSeasonSport().c2sFightsEntrance();
        this.close();
    }

    private _onBtnClose() {
        this.close();
    }

    private _initScrollView() {
        this._scrollView.setTemplate(this._seasonRankCellPrefab);
        this._scrollView.setCallback(handler(this, this._onCellUpdate));
    }

    private _updateOwnView() {
        var rank = G_UserData.getSeasonSport().getOwnRank();
        var star = G_UserData.getSeasonSport().getCurSeason_Star();
        var dan = parseInt(SeasonSportHelper.getDanInfoByStar(star).rank_1);
        var star2 = parseInt(SeasonSportHelper.getDanInfoByStar(star).star2);
        var danPic = SeasonSportHelper.getDanInfoByStar(star).name_pic;
        this._textOwnStar.string = (star2).toString();
        this._ownRank.string = rank == 0 && Lang.get('common_text_no_rank') || (rank).toString();
        UIHelper.loadTexture(this._imageSword, Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[dan - 1]));
        UIHelper.loadTexture(this._imageOwnDan, Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[dan - 1]));
        UIHelper.loadTexture(this._imageStar, Path.getSeasonStar(danPic));
    }

    private _updateScrollView() {
        if (!this._seasonRankData || this._seasonRankData.length <= 0) {
            return;
        }
        this._scrollView.resize(this._seasonRankData.length);
    }

    private _onCellUpdate(node: cc.Node, index) {
        if (!this._seasonRankData) {
            return;
        }
        let cell: SeasonRankCell = node.getComponent(SeasonRankCell);
        var cellData: any = {};
        if (this._seasonRankData[index]) {
            cellData = this._seasonRankData[index];
            cellData.index = index;
            cell.setCustomCallback(handler(this, this._onCellTouch));
            cell.updateUI(cellData);
        }
    }

    private _onCellSelected(cell, index) {
    }

    private _onCellTouch(data) {
        if (data == null) {
            return;
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupRecentReportView", "seasonSport"), (popupRecentReportView: PopupRecentReportView) => {
            popupRecentReportView.init(data);
            popupRecentReportView.open();
        });
    }
}