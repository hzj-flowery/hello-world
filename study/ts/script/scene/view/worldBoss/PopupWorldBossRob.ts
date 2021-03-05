const { ccclass, property } = cc._decorator;

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import PopupBase from '../../../ui/PopupBase';
import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { WorldBossHelper } from './WorldBossHelper';
import { Util } from '../../../utils/Util';
import PopupWorldBossRobCell from './PopupWorldBossRobCell';

@ccclass
export default class PopupWorldBossRob extends PopupBase {

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewItem: cc.ScrollView = null;
    _title: any;
    _signalGrabList;
    public static _needRequest: boolean;
    public static _dataList: any[] = [];


    public static waitEnterMsg(callBack) {
        var onMsgCallBack = function (index, grabList) {
            // dump(grabList);
            PopupWorldBossRob._dataList = grabList || [];
            PopupWorldBossRob._needRequest = false;
            callBack();
        }
        G_UserData.getWorldBoss().c2sGetWorldBossGrabList();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_WORLDBOSS_GET_GRAB_LIST, onMsgCallBack);
        return signal;
    }
    ctor() {
        this._title = Lang.get('worldboss_rob_title');
    }
    onCreate() {
        this.ctor();
        this._commonNodeBk.setTitle(this._title);
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
    }
    onEnter() {
        this._signalGrabList = G_SignalManager.add(SignalConst.EVENT_WORLDBOSS_GET_GRAB_LIST, handler(this, this._onEventGrabList));
        if (PopupWorldBossRob._needRequest) {
            G_UserData.getWorldBoss().c2sGetWorldBossGrabList();
        } else {
            this._updateListView();
        }
    }
    onExit() {
        this._signalGrabList.remove();
        this._signalGrabList = null;
    }
    _onEventGrabList(index, grabList) {
        PopupWorldBossRob._dataList = grabList || [];
        this._updateListView();
    }
    onBtnCancel() {
        this.close();
    }
    _updateListView() {
        var lineCount = PopupWorldBossRob._dataList.length;
        if (lineCount > 0 && this._listViewItem) {
            this._listViewItem.content.removeAllChildren();
            this._listViewItem.content.height = 500;
            for (let i = 0; i < PopupWorldBossRob._dataList.length; i++) {
                let cell = Util.getNode("prefab/worldBoss/PopupWorldBossRobCell", PopupWorldBossRobCell) as PopupWorldBossRobCell;
                cell.setIdx(i);
                cell.setCustomCallback(handler(this, this._onItemTouch));
                cell.updateUI(i, PopupWorldBossRob._dataList[i]);
                this._listViewItem.content.addChild(cell.node);
                cell.node.x = 0;
                cell.node.y = (-1 - i) * 144;
                if (Math.abs(cell.node.y) > 500) {
                    this._listViewItem.content.height =  Math.abs(cell.node.y);
                }
            }
        }
    }
    _onItemTouch(index, userId) {
        if (WorldBossHelper.checkUserFight() == false) {
            return;
        }
        var isOpen = G_UserData.getWorldBoss().isBossStart()[0];
        if (isOpen == true) {
            G_UserData.getWorldBoss().c2sGrabWorldBossPoint(userId);
            PopupWorldBossRob._needRequest = true;
            this.close();
        }
    }
    _onItemUpdate(item, index) {
        if (PopupWorldBossRob._dataList.length > 0) {
            if (PopupWorldBossRob._dataList[index + 1] != null) {
                item.updateUI(index, PopupWorldBossRob._dataList[index + 1]);
            }
        }
    }
    _onItemSelected(item, index) {
    }

}