const {ccclass, property} = cc._decorator;

import CommonFullScreenActivityTitle from '../../../../ui/component/CommonFullScreenActivityTitle'
import ActivitySubView from '../ActivitySubView';
import { G_UserData, G_SignalManager, G_Prompt } from '../../../../init';
import { SignalConst } from '../../../../const/SignalConst';
import { handler } from '../../../../utils/handler';
import LevelGiftItemCell from './LevelGiftItemCell';
import CommonCustomListViewEx from '../../../../ui/component/CommonCustomListViewEx';
import { FunctionConst } from '../../../../const/FunctionConst';
import { ActivityConst } from '../../../../const/ActivityConst';

@ccclass
export default class LevelGiftView extends ActivitySubView {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property(cc.Prefab)
    LevelGiftItemCell:cc.Prefab = null;
    
    _signalLevelGift: any;
    _signalLevelGiftAward: any;
    _items: any[];
    _listViewData: any[];
    loadIndex:number = 0;
    scheduleHandler:any;

    onCreate() {
        G_UserData.getActivityLevelGiftPkg().pullData();
        this._initListView();
    }
    onEnter() {
        this._signalLevelGift = G_SignalManager.add(SignalConst.EVENT_WELFARE_LEVEL_GIFT_INFO, handler(this, this._refreshView));
        this._signalLevelGiftAward = G_SignalManager.add(SignalConst.EVENT_WELFARE_LEVEL_GIFT_AWARD, handler(this, this._getAwards));
    }
    onExit() {
        this._signalLevelGift.remove();
        this._signalLevelGift = null;
        this._signalLevelGiftAward.remove();
        this._signalLevelGiftAward = null;
    }
    _initListView() {
        this._listViewData = G_UserData.getActivityLevelGiftPkg().getListViewData();
        this._items = [];
        this.loadIndex = 0;
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
        this.scheduleHandler = handler(this,this.updateListView);
        this.schedule(this.scheduleHandler, 0.1);
    }
    _refreshView() {
        this._listViewData = G_UserData.getActivityLevelGiftPkg().getListViewData();
        for (let k in this._listViewData) {
            var v = this._listViewData[k];
            var item = this._items[k];
            item.updateUI(v);
        }
    }
    updateListView(){
        if(this.loadIndex >= this._listViewData.length){
            if(this.scheduleHandler){
                this.unschedule(this.scheduleHandler);
                this.scheduleHandler = null;
            }
            return;
        }
        var v = this._listViewData[this.loadIndex];
        var item = cc.instantiate(this.LevelGiftItemCell).getComponent(LevelGiftItemCell);
        item.updateUI(v);
        this._listView.pushBackCustomItem(item.node);
        this._items.push(item);
        this.loadIndex++;
    }
    _getAwards(message, awards) {
        if (awards) {
            G_Prompt.showAwards(awards);
        }
        if (!G_UserData.getActivityLevelGiftPkg().canBuy()) {
            G_UserData.getRedPoint().clearRedPointShowFlag(FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_LEVEL_GIFT_PKG });
        }
    }
    exitModule(){
        //this._listView.clearAll();
    }

}
