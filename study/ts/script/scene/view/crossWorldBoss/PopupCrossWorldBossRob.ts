import { SignalConst } from "../../../const/SignalConst";
import { G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonListView from "../../../ui/component/CommonListView";
import CommonNormalMidPop from "../../../ui/component/CommonNormalMidPop";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import { CrossWorldBossHelperT } from "./CrossWorldBossHelperT";


const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupCrossWorldBossRob extends PopupBase {
    name: 'PopupCrossWorldBossRob';
    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _PopupCrossWorldBossRobCell: cc.Prefab = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listViewItem: CommonListView = null;

    
    
    private _signalGrabList:any;
    private _title:string;
    static _needRequest:boolean = true;
    static _dataList:Array<any> = [];
    static waitEnterMsg(callBack) {
        let onMsgCallBack = function (id, grabList) {
            cc.log(grabList);
            PopupCrossWorldBossRob._dataList = grabList || {};
            PopupCrossWorldBossRob._needRequest = false;
            callBack();
        }.bind(this)
        G_UserData.getCrossWorldBoss().c2sGetCrossWorldBossGrabList();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_CROSS_WORLDBOSS_GET_GRAB_LIST, onMsgCallBack);
        return signal;
    }
    onCreate() {
        this._title = Lang.get('worldboss_rob_title');
        this._commonNodeBk.setTitle(this._title);
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
    }
    onEnter() {
        this._signalGrabList = G_SignalManager.add(SignalConst.EVENT_CROSS_WORLDBOSS_GET_GRAB_LIST, handler(this, this._onEventGrabList));
        if (PopupCrossWorldBossRob._needRequest) {
            G_UserData.getCrossWorldBoss().c2sGetCrossWorldBossGrabList();
        } else {
            this._updateListView();
        }
    }
    onExit() {
        this._signalGrabList.remove();
        this._signalGrabList = null;
    }
    _onEventGrabList(id, grabList) {
        PopupCrossWorldBossRob._dataList = grabList || {};
        this._updateListView();
    }
    onBtnCancel() {
        this.close();
    }
    _updateListView() {
        var lineCount = PopupCrossWorldBossRob._dataList.length;
        if (lineCount > 0 && this._listViewItem) {
            var listView = this._listViewItem;
            listView.init(this._PopupCrossWorldBossRobCell,handler(this, this._onItemUpdate), handler(this, this._onItemSelected),handler(this, this._onItemTouch))
            listView.resize(lineCount);
        }
    }
    _onItemTouch(index, userId, usersid) {
        if (CrossWorldBossHelperT.checkUserFight() == false) {
            return;
        }
        var [isOpen] = G_UserData.getCrossWorldBoss().isBossStart();
        if (isOpen == true) {
            G_UserData.getCrossWorldBoss().c2sGrabCrossWorldBossPoint(userId, usersid);
            PopupCrossWorldBossRob._needRequest = true;
            this.close();
        }
    }
    _onItemUpdate(item, index) {
        if (PopupCrossWorldBossRob._dataList.length > 0) {
            if (PopupCrossWorldBossRob._dataList[index] != null) {
                item.updateUI(index, PopupCrossWorldBossRob._dataList[index]);
            }
        }
    }
    _onItemSelected(item, data) {   
        if (CrossWorldBossHelperT.checkUserFight() == false) {
            return;
        }
        let userId = data[0];
        let usersid = data[1];
        var [isOpen] = G_UserData.getCrossWorldBoss().isBossStart();
        if (isOpen == true) {
            G_UserData.getCrossWorldBoss().c2sGrabCrossWorldBossPoint(userId, usersid);
            PopupCrossWorldBossRob._needRequest = true;
            this.close();
        }
    }
}