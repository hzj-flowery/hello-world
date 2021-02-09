const { ccclass, property } = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import PopupBase from '../../../ui/PopupBase';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Colors } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import ListView from '../recovery/ListView';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import RecentReportCell from './RecentReportCell';

@ccclass
export default class PopupRecentReportView extends PopupBase {

    @property({ type: CommonNormalMidPop, visible: true })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({ type: ListView, visible: true })
    _scrollView: ListView = null;

    @property({ type: cc.Label, visible: true })
    _textFightCount: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textWinPercent: cc.Label = null;

    @property({ type: CommonHeroIcon, visible: true })
    _fileNodeIcon: CommonHeroIcon = null;

    @property({ type: cc.Label, visible: true })
    _textServerName: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textPlayerName: cc.Label = null;
    @property({ type: cc.Prefab, visible: true })
    _recentReportCellPrefab: cc.Prefab = null;

    private _recentReportData;
    public init(data) {
        this._recentReportData = data;
    }

    public onCreate() {
        this._commonNodeBk.setTitle(Lang.get('season_recent_report'));
        this._commonNodeBk.addCloseEventListener(handler(this, this._btnClose));
        this._initBaseView();
        this._initScrollView();
    }

    public onEnter() {
        this._updateScrollView();
    }

    public onExit() {
    }

    private _btnClose() {
        this.close();
    }

    private _initBaseView() {
        if (!this._recentReportData) {
            return;
        }
        var avatarData = {
            baseId: this._recentReportData.base_id,
            avatarBaseId: this._recentReportData.avatar_base_id,
            covertId: UserDataHelper.convertToBaseIdByAvatarBaseId(this._recentReportData.avatar_base_id, this._recentReportData.base_id)[0],
            isHasAvatar: this._recentReportData.avatar_base_id && this._recentReportData.avatar_base_id > 0
        };
        this._fileNodeIcon.updateIcon(avatarData);
        if ((this._recentReportData.sname as string).match(/^\D+\d+/) != null) {
            var nameStr = (this._recentReportData.sname as string).match(/^\D+\d+/);
            this._textServerName.string = nameStr.toString();
        } else {
            this._textServerName.string = this._recentReportData.sname;
        }
        var targetPosX = this._textServerName.node.x + this._textServerName.node.getContentSize().width + 10;
        this._textPlayerName.node.x = targetPosX;
        this._textPlayerName.string = this._recentReportData.name;
        this._textPlayerName.node.color = (Colors.getOfficialColor(this._recentReportData.title));
        UIHelper.updateTextOfficialOutline(this._textPlayerName.node, this._recentReportData.title);
        this._textFightCount.string = (this._recentReportData.fight_count).toString();
        this._textWinPercent.string = this._recentReportData.fight_count > 0 && Lang.get('season_win_percent', { number: '%.2f'.format(100 * this._recentReportData.win_count / this._recentReportData.fight_count) }) || Lang.get('season_win_percent', { number: 0 });
    }

    private _initScrollView() {
        this._scrollView.setTemplate(this._recentReportCellPrefab);
        this._scrollView.setCallback(handler(this, this._onCellUpdate));
    }

    private _updateScrollView() {
        if (!this._recentReportData || this._recentReportData.units == null) {
            return;
        }
        var idsNums = this._recentReportData.units.length;
        if (idsNums < SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS) {
            return;
        }
        this._scrollView.resize(idsNums / SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS)
    }

    private _onCellUpdate(node: cc.Node, index) {
        if (!this._recentReportData || this._recentReportData.units == null) {
            return;
        }
        let cell: RecentReportCell = node.getComponent(RecentReportCell);
        var lineStartIdx = index * SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS + 1;
        var lineEndIdx = (index + 1) * SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS;
        var cellData: any = {};
        if (this._recentReportData.units) {
            var ids = [];
            for (var i = lineStartIdx - 1; i < lineEndIdx; i++) {
                if (this._recentReportData.units[i] != null) {
                    ids.push(this._recentReportData.units[i]);
                }
            }
            cellData.ids = ids;
            cellData.index = index;
            cell.updateUI(cellData);
        }
    }

    private _onCellSelected(cell, index) {
    }

    private _onCellTouch(index, data) {
    }
}