const {ccclass, property} = cc._decorator;

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import PopupBase from '../../../ui/PopupBase';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { G_UserData, G_SignalManager, G_ServerTime} from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { table } from '../../../utils/table';
import FriendEnemyLogCell from './FriendEnemyLogCell';

@ccclass
export default class PopupEnemyLog extends PopupBase {

   @property({
       type: CommonNormalMidPop,
       visible: true
   })
   _popMid: CommonNormalMidPop = null;

   @property({
       type: CommonCustomListViewEx,
       visible: true
   })
   _listView: CommonCustomListViewEx = null;

   @property({
       type: CommonEmptyListNode,
       visible: true
   })
   _emptyNode: CommonEmptyListNode = null;

   @property(cc.Prefab)
   friendEnemyLogCell:cc.Prefab = null;

   public static path:string = 'friend/PopupEnemyLog';
   public static readMsg:boolean = false;

    _logDatas:any[] = [];




    public static popupEnemyLog(){
        PopupEnemyLog.readMsg = false;
        function onMsgCallBack(id, logList) {
            if(PopupEnemyLog.readMsg){
                return;
            }
            PopupEnemyLog.readMsg = true;
            PopupBase.loadCommonPrefab('PopupEnemyLog',(popup:PopupEnemyLog)=>{
                if (popup && popup.updateView) {
                    popup.updateView(id, logList);
                }
                popup.openWithAction();
            });
        }
        G_UserData.getEnemy().c2sCommonGetReport();
        return G_SignalManager.add(SignalConst.EVENT_ENEMY_BATTLE_REPORT_SUCCESS, onMsgCallBack);
    }
    onCreate() {
        this._popMid.setTitle(Lang.get('lang_friend_enemy_log_title'));
        this._popMid.addCloseEventListener(handler(this, this.close));
    }
    onEnter() {
    }
    onExit() {
        PopupEnemyLog.readMsg = false;
    }
    updateView(id, logList) {
        var targetList = {};
        var logDatas = [];
        if (logList) {
            for (let k in logList) {
                var v = logList[k];
                var [str] = G_ServerTime.getDateAndTime(v.getFight_time());
                if (!targetList[str]) {
                    targetList[str] = {};
                    targetList[str].timeStr = str;
                    targetList[str].logs = [];
                    table.insert(logDatas, targetList[str]);
                }
                table.insert(targetList[str].logs, v);
            }
        }
        this._logDatas = logDatas;
        this._listView.removeAllChildren();
        for (let k in logDatas) {
            var v = logDatas[k];
            var view = cc.instantiate(this.friendEnemyLogCell).getComponent(FriendEnemyLogCell);
            view.updateUI(v);
            this._listView.pushBackCustomItem(view.node);
        }
        this._emptyNode.node.active = (this._logDatas.length == 0);
    }

}
