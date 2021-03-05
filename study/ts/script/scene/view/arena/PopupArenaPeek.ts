const {ccclass, property} = cc._decorator;

import { MessageIDConst } from '../../../const/MessageIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { ReportParser } from '../../../fight/report/ReportParser';
import { G_NetworkManager, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import CommonListView from '../../../ui/component/CommonListView';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import PopupBase from '../../../ui/PopupBase';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { handler } from '../../../utils/handler';


@ccclass
export default class PopupArenaPeek extends PopupBase {

   @property({
       type: CommonNormalLargePop,
       visible: true
   })
   _commonNodeBk: CommonNormalLargePop = null;

   @property({
       type: CommonEmptyListNode,
       visible: true
   })
   _nodeEmpty: CommonEmptyListNode = null;

   @property({
       type: CommonListView,
       visible: true
   })
   _listViewItem: CommonListView = null;

   @property({
    type: cc.Node,
    visible: true
})
_popupArenaPeekCell: cc.Node = null;

   
   
   private _title:string;
   private _getChallengeArena:any;
   private _getBattleReport:any;
   
   private static  _reportList = [];
   public static waitEnterMsg(callBack) {
    PopupArenaPeek._reportList = [];
    var onMsgCallBack = function (id, message) {
        var arenaList = message['report'] || [];
        var sortFunc = function (obj1, obj2) {
            return obj1.defense_rank - obj2.defense_rank;
        };
        arenaList.sort(sortFunc);
        PopupArenaPeek._reportList = arenaList;
        callBack();
    }
    G_UserData.getArenaData().c2sGetArenaTopTenReport();
    return G_SignalManager.addOnce(SignalConst.EVENT_ARENA_GET_ARENA_TOP_TEN_INFO, onMsgCallBack);
}
onLoad() {
    this._title = Lang.get('arena_peek_title');
    super.onLoad();
} 
onCreate() {
    this._commonNodeBk.setTitle(this._title);
    this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
    this.setClickOtherClose(true);
} 
_onItemTouch(index, reportId) {
    cc.log(reportId);
    G_NetworkManager.send(MessageIDConst.ID_C2S_GetBattleReport, { id: reportId });
} 
_onItemUpdate(item, index) {
    if (index<0||index >= PopupArenaPeek._reportList.length) {
        item.updateItem(index, null, 0);
    }
    else {
        var data: Array<any> = [];
        data.push(PopupArenaPeek._reportList[index])
        item.updateItem(index, data.length > 0 ? data : null, 0);
    }

} 
_onItemSelected(item, index) {
} 
onEnter() {
    this._getChallengeArena = G_SignalManager.add(SignalConst.EVENT_ARENA_GET_ARENA_TOP_TEN_INFO, handler(this, this._onEventGetChallengeReport));
    this._getBattleReport = G_SignalManager.add(SignalConst.EVENT_GET_ARENA_BATTLE_REPORT, handler(this, this._onEventGetBattleReport));
    this._updateListView();
} 
onExit() {
    this._getChallengeArena.remove();
    this._getChallengeArena = null;
    this._getBattleReport.remove();
    this._getBattleReport = null;
} 
onBtnCancel() {
    this.close();
} 
_onEventGetChallengeReport(id, message) {
    var arenaList = message['report'] || [];
    var sortFunc = function (obj1, obj2) {
        return obj1.defense_rank - obj2.defense_rank;
    };
    arenaList.sort(sortFunc);
    PopupArenaPeek._reportList = arenaList;
    this._updateListView();
} 
_updateListView() {
    var lineCount = PopupArenaPeek._reportList.length;
    if (lineCount > 0 && this._listViewItem) {
        var listView = this._listViewItem;
        var scrollViewParam = {
            template: this._popupArenaPeekCell,
        };
        listView.init(scrollViewParam.template, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
        listView.setData(lineCount);

    }
    this._nodeEmpty.node.active = (lineCount <= 0);
} 
_onEventGetBattleReport(id, message) {
    var reportId = message.id;
    var getReportMsg = function (reportId) {
        for (var i in PopupArenaPeek._reportList) {
            var value = PopupArenaPeek._reportList[i];
            if (value.report_id == reportId) {
                return value;
            }
        }
        return null;
    }
    var enterFightView = function (reportId) {
        var arenaBattleMsg = getReportMsg(reportId);
        var battleReport = G_UserData.getFightReport().getReport();
        var reportData = ReportParser.parse(battleReport);
        var battleData =BattleDataHelper.parseBattleReportData(arenaBattleMsg);
        G_SceneManager.showScene('fight', reportData, battleData);
    }
    G_SceneManager.registerGetReport(message.battle_report, function () {
        enterFightView(reportId);
    });
}

}