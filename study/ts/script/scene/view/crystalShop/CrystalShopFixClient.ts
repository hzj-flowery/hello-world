const {ccclass, property} = cc._decorator;

import CommonCountdown from '../../../ui/component/CommonCountdown'
import ViewBase from '../../ViewBase';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { handler } from '../../../utils/handler';
import { G_ServerTime, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { UserBaseData } from '../../../data/UserBaseData';
import { Util } from '../../../utils/Util';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import PopupBase from '../../../ui/PopupBase';
import PopupCrystalShopItemBuy from './PopupCrystalShopItemBuy';

@ccclass
export default class CrystalShopFixClient extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _listViewParent: cc.Node = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listViewTab: CommonCustomListViewEx = null;

    @property({
        type: CommonCountdown,
        visible: true
    })
    _countdownTime: CommonCountdown = null;

    @property(cc.Prefab)
    CrystalChargeShopCell:cc.Prefab = null;

    _itemList: any[];
    _playerEnterFlag: any;

    loadIndex:number = 0;
    scheduleHandler:any;


    onCreate() {
        this._initListViewTab();
        this._initCountdown();
        this._startCountDown();
    }
    onEnter() {
    }
    onExit() {
    }
    _initListViewTab() {
        this._listViewTab.setTemplate(this.CrystalChargeShopCell);
        this._listViewTab.setCallback(handler(this, this._onListViewTabItemUpdate), handler(this, this._onListViewTabItemSelected));
        this._listViewTab.setCustomCallback(handler(this, this._onListViewTabItemTouch));
    }
    _initCountdown() {
    }
    _startCountDown() {
        var t = G_ServerTime.secondsFromZero();
        var date = G_ServerTime.getDateObject(t);
        var dayNum = 0;
        var curDay = date.getDay();
        var startDay = 1;//每周一
        if (date.getDay() > startDay) {
            dayNum = startDay + 7 - date.getDay();
        } else if (date.getDay() == startDay) {
            if (G_ServerTime.getTime() >= t) {
                dayNum = 7;
            } else {
                dayNum = 0;
            }
        } else {
            dayNum = startDay - date.getDay();
        }
        t = t + dayNum * 24 * 3600;
        var endCallBack = function () {
            G_UserData.getCrystalShop().requestShopData(true);
            this._startCountDown();
        }.bind(this);
        var timeFunc = function (t) {
            var leftTime = t - G_ServerTime.getTime();
            var [day, hour, min, second] = G_ServerTime.convertSecondToDayHourMinSecond(leftTime);
            if (day >= 1) {
                return Util.format(Lang.get('common_time_DHMS'), day, hour, min, second);
            }
            var time = Util.format(Lang.get('common_time_DHM'), hour, min, second);
            return time;
        };
        this._countdownTime.startCountDown(Lang.get('lang_crystal_shop_countdown_label'), t, endCallBack, timeFunc);
    }
    _onListViewTabItemUpdate(item, index) {
        var cellData = [];
        for (var i = 1; i<=2; i++) {
            var j = index * 2 + i;
            if (this._itemList[j-1]) {
                cellData.push({ data: this._itemList[j-1] });
            }
        }
        item.updateUI(cellData);
    }
    _onListViewTabItemSelected(item, index) {
    }
    _onListViewTabItemTouch(index, data) {
        if (!data) {
            return;
        }
        var leftBuyCount = data.getLeftBuyCount();
        if (leftBuyCount == -1 || leftBuyCount > 0) {
            var cfg = data.getConfig();
            for (var i = 1; i<=2; i++) {
                var canBuy = LogicCheckHelper.enoughValue(cfg['price_type_' + i], cfg['price_value_' + i], cfg['price_size_' + i], true);
                if (!canBuy) {
                    return;
                }
            }
            PopupBase.loadCommonPrefab('PopupCrystalShopItemBuy', (popup:PopupCrystalShopItemBuy)=>{
                popup.ctor(Lang.get('lang_crystal_shop_popup_buy_title'), function (shopItemData, num) {
                        G_UserData.getCrystalShop().c2sShopCrystalBuy(shopItemData.getId(), num);
                });
                popup.updateUI(data);
                popup.openWithAction();
            });
        }
    }
    setPlayEnterEffectTag(trueOrFalse) {
        this._playerEnterFlag = trueOrFalse;
        if (this._playerEnterFlag) {
            this.setListViewVisible(false);
        }
    }
    playEnterEffect() {
        if (this._playerEnterFlag) {
            this.setListViewVisible(true);
            //this._listViewTab.playEnterEffect();
            this._playerEnterFlag = null;
        }
    }
    setListViewVisible(trueOrFalse) {
        this._listViewTab.setVisible(trueOrFalse);
    }
    refreshClient() {
        var itemList = G_UserData.getCrystalShop().getShopData();
        this._itemList = itemList;
        this.loadIndex = 0;
        this._listViewTab.removeAllChildren();
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
        this.scheduleHandler = handler(this,this.loadListView);
        this.schedule(this.scheduleHandler, 0.1);
        this.loadListView();
        this.playEnterEffect();
    }
    loadListView(){
        this.loadIndex++;
        let total = Math.ceil(this._itemList.length / 2);
        if(this.loadIndex >= total){
            if(this.scheduleHandler){
                this.unschedule(this.scheduleHandler);
                this.scheduleHandler = null;
            }
            this.loadIndex = total;
        }
        this._listViewTab.resize(this.loadIndex, 2, false);
    }
}
