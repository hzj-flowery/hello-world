const {ccclass, property} = cc._decorator;

import { MessageIDConst } from '../../../const/MessageIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { G_NetworkManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonListView from '../../../ui/component/CommonListView';
import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop';
import PopupBase from '../../../ui/PopupBase';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { handler } from '../../../utils/handler';

@ccclass
export default class PopupArenaAward extends PopupBase {

   @property({
       type: CommonNormalMidPop,
       visible: true
   })
   _commonNodeBk: CommonNormalMidPop = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textMyRankDesc: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _labelMaxRank: cc.Label = null;

   @property({
       type: CommonListView,
       visible: true
   })
   _listViewItem: CommonListView = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textRankDesc: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textAwardDesc: cc.Label = null;

   @property({
    type: cc.Node,
    visible: true
})
_popupArenaAwardCell: cc.Node = null;

   

   private _title:string;
   private _awardList:Array<any>;
   private _getArenaReward:any;
   

   onLoad() {
    this._title = Lang.get('arena_award_title');
    super.onLoad();
}
onCreate() {
    this._commonNodeBk.setTitle(this._title);
    this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
    var maxRank = G_UserData.getArenaData().getArenaMaxRank();
    this._labelMaxRank.string = (maxRank);
    this._updateListView();
}
_updateListView() {
    this._awardList = G_UserData.getArenaData().getAwardList();
    var lineCount = this._awardList.length;
    var listView = this._listViewItem;
    var scrollViewParam = {
        template: this._popupArenaAwardCell,
    };
    listView.init(scrollViewParam.template, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
    listView.setData(lineCount);

}
_onItemTouch(index, awardId) {
  //assert((awardId, 'PopupArenaAward:_onItemTouch, awardId is null');
    if (awardId && awardId > 0) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetArenaRankReward, { reward_id: awardId });
    }
}
_onItemUpdate(item, index) {
    if (this._awardList[index + 1]) {
        item.updateUI(index, this._awardList[index + 1]);
    }
}
_onItemSelected(item, index) {
}
onEnter() {
    this._getArenaReward = G_SignalManager.add(SignalConst.EVENT_ARENA_GET_REWARD, handler(this, this._onEventGetReward));
    this._updateListView();
}
onExit() {
    this._getArenaReward.remove();
    this._getArenaReward = null;
}
onBtnCancel() {
    this.close();
}
_onEventGetReward(id, message) {
    if (message.ret != 1) {
        return;
    }
    var awards = message['award'] || {};
    PopupGetRewards.showRewards(awards);
    this._updateListView();
}


}