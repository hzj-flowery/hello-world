const { ccclass, property } = cc._decorator;

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_SignalManager } from '../../../init';
import { MineCraftData } from '../../../data/MineCraftData';
import { SignalConst } from '../../../const/SignalConst';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import CommonListView from '../../../ui/component/CommonListView';
import PopupReportCell from './PopupReportCell';

@ccclass
export default class PopupReport extends PopupBase {

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _rankBG: cc.Sprite = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listViewItem: CommonListView = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _popupReportCell: cc.Node = null;

    public static waitEnterMsg(callBack, msgParam) {
        var onMsgCallBack = function (id, message) {
            callBack();
        }
        G_UserData.getMineCraftData().c2sCommonGetReport();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_GET_MINE_ATTACK_REPORT, onMsgCallBack);
        return signal;
    }

    private _signalAttackReport: any;
    private _reports: any;
    onCreate() {
        this._commonNodeBk.setTitle(Lang.get('mine_report_title'));
        this._commonNodeBk.addCloseEventListener(function () {
            this.closeWithAction();
        }.bind(this));

    }
    onEnter() {
        this._signalAttackReport = G_SignalManager.add(SignalConst.EVENT_GET_MINE_ATTACK_REPORT, handler(this, this._refreshReport));
        this._refreshReport();
    }
    onExit() {
        this._signalAttackReport.remove();
        this._signalAttackReport = null;
    }
    _refreshReport(eventName?) {
        var reports = G_UserData.getMineCraftData().getAttackReport();
        this._reports = reports;
        var lineCount = this._reports.length || 0;
        if (this._listViewItem) {
            var listView = this._listViewItem;
            var scrollViewParam = {
                template: this._popupReportCell,
            };
            listView.init(scrollViewParam.template, handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
            listView.setData(lineCount);
        }
        this._nodeEmpty.node.active = (lineCount <= 0);
    }
    _onItemUpdate(item, index) {
        if (index<0||index >= this._reports.length) {
            item.updateItem(index, null, 0);
        }
        else {
            var data: Array<any> = [];
            data.push(this._reports[index])
            item.updateItem(index, data.length > 0 ? data : null, 0);
        }
    }
    _onItemSelected(item, index) {
    }

}