import CommonNormalMidPop from "../../../ui/component/CommonNormalMidPop";
import CommonListView from "../../../ui/component/CommonListView";
import { Lang } from "../../../lang/Lang";
import { handler } from "../../../utils/handler";
import { G_SignalManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { SeasonSportHelper } from "../seasonSport/SeasonSportHelper";
import PopupSilkRecommandCell from "./PopupSilkRecommandCell";
import TabScrollView from "../../../utils/TabScrollView";
import { table } from "../../../utils/table";
import PopupBase from "../../../ui/PopupBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupSilkRecommand extends PopupBase {
    @property({ type: CommonNormalMidPop, visible: true })
    _commonNodeBk: CommonNormalMidPop = null;
    @property({ type: CommonListView, visible: true })
    _ownReportView: CommonListView = null;
    @property({ type: cc.Prefab, visible: true })
    popupSilkRecommandCell: cc.Prefab = null;
    _recommandData: any[];
    _curGroupPos: any;
    _listnerSeasonEnd: any;
    _listnerSilkEquipSuccess: any;
    _callBack: any;


    ctor(pos) {
        this._recommandData = [];
        this._curGroupPos = pos;
        this.node.name = ('PopupSilkRecommand');
    }
    onCreate() {
        this._commonNodeBk.setTitle(Lang.get('season_silk_recommand_title'));
        this._commonNodeBk.addCloseEventListener(handler(this, this._btnClose));
        this._initScrollView();
    }
    onEnter() {
        this._listnerSeasonEnd = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_END, handler(this, this._onListnerSeasonEnd));
        this._listnerSilkEquipSuccess = G_SignalManager.add(SignalConst.EVENT_SEASONSPORT_SILKEQUIP_SUCCESS, handler(this, this._onListnerSilkEquipSuccess));
        this._initData();
        this._updateScrollView();
    }
    onExit() {
        this._listnerSeasonEnd.remove();
        this._listnerSeasonEnd = null;
        this._listnerSilkEquipSuccess.remove();
        this._listnerSilkEquipSuccess = null;
        if (this._callBack) {
            this._callBack();
        }
    }
    _onListnerSeasonEnd() {
        this.close();
    }
    _onListnerSilkEquipSuccess() {
        this.close();
    }
    _btnClose() {
        this.close();
    }
    _initData() {
        this._recommandData = SeasonSportHelper.getSileRecommand();
    }
    _initScrollView() {
        this._ownReportView.init(this.popupSilkRecommandCell, handler(this, this._onCellUpdate), handler(this, this._onCellTouch));
    }
    _updateScrollView() {
        var maxCount = (this._recommandData).length;
        if (!this._recommandData || maxCount <= 0) {
            return;
        }
        this._ownReportView.setData(maxCount)
    }
    _onCellUpdate(cell, index, type) {
        if (!this._recommandData || table.nums(this._recommandData) <= 0) {
            return;
        }
        var curIndex = index;
        var cellData: any = {};
        if (this._recommandData[curIndex]) {
            cellData = this._recommandData[curIndex];
            cellData.index = curIndex;
            cell.updateItem(index, [this._curGroupPos, cellData], type);
        }else {
            cell.updateItem(index, null, type);
        }
    }
    _onCellSelected(cell, index) {
    }
    _onCellTouch(index, data) {
    }
    setCloseCallBack(callback) {
        this._callBack = callback;
    }
}