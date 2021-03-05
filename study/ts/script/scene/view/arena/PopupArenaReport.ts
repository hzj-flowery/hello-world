const {ccclass, property} = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import CommonListView from '../../../ui/component/CommonListView';
import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop';
import CommonTabGroupSmallHorizon from '../../../ui/component/CommonTabGroupSmallHorizon';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';



@ccclass
export default class PopupArenaReport extends PopupBase {

   @property({
       type: CommonNormalMidPop,
       visible: true
   })
   _commonNodeBk: CommonNormalMidPop = null;

   @property({
       type: CommonTabGroupSmallHorizon,
       visible: true
   })
   _nodeTab: CommonTabGroupSmallHorizon = null;

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
       type: cc.Sprite,
       visible: true
   })
   _rankBG: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _titleBG: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _line2: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _titleName: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _titleChapter: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textBattleReportCount: cc.Label = null;

   @property({
    type: cc.Node,
    visible: true
})
_popupArenaReportCell: cc.Node = null;

   


private _title:string;
private _getReport:any;
private _reportList:Array<any>;
private _tabIndex:number;
public static  MAX_REPORT_SIZE = 10;

onCreate() {
    this._title = Lang.get('arena_report_rank_title');
    this._commonNodeBk.setTitle(this._title);
    this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
    this._initTab();
    this.setClickOtherClose(true);
}
_initTab() {
    var param = {
        callback: handler(this, this._onTabSelect),
        isVertical: 2,
        offset: 0,
        textList: [
            Lang.get('arena_report_atk_tab'),
            Lang.get('arena_report_def_tab')
        ]
    };
    this._nodeTab.recreateTabs(param);
}
_onItemTouch(index) {
}
_onItemUpdate(item, index) {
    if (index<0||index >= this._reportList.length) {
        item.updateItem(index, null, 0);
    }
    else {
        var data: Array<any> = [];
        data.push(this._reportList[index])
        item.updateItem(index, data.length > 0 ? data : null, 0);
    }

}
_onItemSelected(item, index) {
}
_onTabSelect(index) {
    index = index + 1;
    if (this._tabIndex == index) {
        return;
    }
    this._tabIndex = index;
    this._titleName.string = (Lang.get('arena_report_sub_title' + (index)));
    this._textBattleReportCount.string = ('0/10');
    G_UserData.getArenaData().c2sCommonGetReport(this._getReportType());
}
onBtnCancel() {
    this.close();
}
_getReportType() {
    if (this._tabIndex == 1) {
        return 2;
    }
    if (this._tabIndex == 2) {
        return 1;
    }
}
onShowFinish() {
    this._nodeTab.setTabIndex(0);
}
onEnter() {
    this._getReport = G_SignalManager.add(SignalConst.EVENT_GET_COMMON_REPORT_LIST, handler(this, this._onGetReport));
}
onExit() {
    this._getReport.remove();
    this._getReport = null;
}
_onGetReport(id, message) {
    if (message.ret != 1) {
        return;
    }
    if (message.report_type == this._getReportType()) {
        var arenaList = message['arena_reports'] || [];
        var sortFunc = function (obj1, obj2) {
            return obj2.fight_time - obj1.fight_time;
        };
        arenaList.sort(sortFunc);
        this._reportList = arenaList;
        this._updateListView();
    }
}
_updateListView() {
    var lineCount = this._reportList.length;
    if (this._listViewItem) {
        var listView = this._listViewItem;
        var listView = this._listViewItem;
        var scrollViewParam = {
            template: this._popupArenaReportCell,
        };
        listView.init(scrollViewParam.template, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
        listView.setData(lineCount);
    }
    this._textBattleReportCount.string = (lineCount + ('/' + PopupArenaReport.MAX_REPORT_SIZE));
    this._nodeEmpty.node.active = (lineCount <= 0);
}


}