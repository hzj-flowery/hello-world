const {ccclass, property} = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonListView from '../../../ui/component/CommonListView';
import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { ArenaHelper } from './ArenaHelper';


@ccclass
export default class PopupArenaRank extends PopupBase {

   @property({
       type: CommonNormalMidPop,
       visible: true
   })
   _commonNodeBk: CommonNormalMidPop = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textMyRank: cc.Label = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _resInfoEx1: CommonResourceInfo = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _resInfoEx2: CommonResourceInfo = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textNullReward: cc.Label = null;

   @property({
       type: CommonListView,
       visible: true
   })
   _listViewItem: CommonListView = null;

   @property({
    type: cc.Node,
    visible: true
})
_popupArenaRankCell: cc.Node = null;

   
   
   private _title:string;
   private _userList:Array<any>;
   
   private static _msgData:Array<any> = [];
   public static waitEnterMsg(callBack) {
    function onMsgCallBack(id, message) {
        PopupArenaRank._msgData = [];
        PopupArenaRank._msgData.push(id);
        PopupArenaRank._msgData.push(message);
        callBack();
    }
    G_UserData.getArenaData().c2sGetArenaTopInfo();
    return G_SignalManager.addOnce(SignalConst.EVENT_ARENA_GET_ARENA_RANK_INFO, onMsgCallBack);
}
onLoad() {
    this._title = Lang.get('arena_challenge_rank_title');
    this._userList = [];
    super.onLoad();
}
onCreate() {
    this._commonNodeBk.setTitle(this._title);
    this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
    this.setClickOtherClose(true);
}
onEnable():void{
    this.updateGetArenaTopInfo(PopupArenaRank._msgData[0], PopupArenaRank._msgData[1]);
}
_onItemTouch(index) {
    var itemData = this._userList[index];
    if (itemData) {
        G_UserData.getBase().c2sGetUserBaseInfo(itemData.user_id);
    }
}
_onItemUpdate(item:CommonListItem, index) {
    if (index<0||index >= this._userList.length) {
        item.updateItem(index, null, 0);
    }
    else {
        var data: Array<any> = [];
        data.push(this._userList[index])
        item.updateItem(index, data.length > 0 ? data : null, 0);
    }

}
_onItemSelected(item, index) {
}
onEnter() {
}
onExit() {
}
onBtnCancel() {
    this.close();
}
onShowFinish() {
}
updateGetArenaTopInfo(id, message) {
    if (message.ret != 1) {
        return;
    }
    this._userList = message['user_list'] || [];
    var userRank = message['user_arena_rank'] || 0;
    this._textMyRank.string = (userRank);
    var lineCount = this._userList.length;
    if (lineCount > 0 && this._listViewItem) {
        var listView = this._listViewItem;
        var scrollViewParam = {
            template: this._popupArenaRankCell,
        };
        listView.init(scrollViewParam.template, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
        listView.setData(lineCount);
    }
    var awardList = ArenaHelper.getAwardListByRank(userRank);
    if (awardList && awardList.length == 0) {
        this._textNullReward.node.active = (true);
    } else {
        this._textNullReward.node.active = (false);
        for (var i = 1;i<=awardList.length;i++) {
            var value = awardList[i-1];
            this['_resInfoEx' + i].node.active =  (true);
            this['_resInfoEx' + i].updateUI(value.type, value.value, value.size);
        }
    }
}


}