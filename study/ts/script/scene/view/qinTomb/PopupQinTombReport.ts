const { ccclass, property } = cc._decorator;

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import ListView from '../recovery/ListView';
import PopupQinTombReportCell from './PopupQinTombReportCell';
import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';

@ccclass
export default class PopupQinTombReport extends PopupBase {

    @property({ type: CommonNormalLargePop, visible: true })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({ type: ListView, visible: true })
    _listViewItem: ListView = null;

    @property({ type: CommonEmptyListNode, visible: true })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({ type: cc.Prefab, visible: true })
    _reportCellPrefab: cc.Prefab = null;

    private _title;
    private _reportList: any[];
    private _getReport;

    public onCreate() {
        this.setClickOtherClose(true);
        this._title = Lang.get('qin_battle_report');
        this._commonNodeBk.setTitle(this._title);
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._listViewItem.setTemplate(this._reportCellPrefab);
        this._listViewItem.setCallback(handler(this, this._onListViewItemItemUpdate));
    }

    private _onListViewItemItemUpdate(node: cc.Node, index) {
        let item: PopupQinTombReportCell = node.getComponent(PopupQinTombReportCell);
        var data = this._reportList[index];
        if (data) {
            item.updateUI(data, index);
        }
    }

    private _onListViewItemItemTouch(index) {
    }

    private _onListViewItemItemSelected(item, index) {
    }

    public onBtnCancel() {
        this.close();
    }

    public onEnter() {
        this._getReport = G_SignalManager.add(SignalConst.EVENT_GET_COMMON_REPORT_LIST, handler(this, this._onGetReport));
        G_UserData.getQinTomb().c2sCommonGetReport();
    }

    public onExit() {
        this._getReport.remove();
        this._getReport = null;
    }

    private _onGetReport(id, message) {
        if (message.ret != 1) {
            return;
        }
        var reportList:any[] = message.grave_reports || [];
        var sortFunc = function (obj1, obj2) {
            return obj2.report_time - obj1.report_time;
        };
        reportList.sort(sortFunc);
        this._reportList = reportList;
        this._updateListView();
    }

    private _updateListView() {
        var lineCount = this._reportList.length;
        if (this._listViewItem && lineCount > 0) {
            this._listViewItem.resize(lineCount);
        }
        this._nodeEmpty.node.active = (lineCount <= 0);
    }

    private _initListItemSource() {
    }
}