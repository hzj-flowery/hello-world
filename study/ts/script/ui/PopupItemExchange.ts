import PopupItemUse from "./PopupItemUse";
import { Lang } from "../lang/Lang";
import UIHelper from "../utils/UIHelper";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import CommonResourceInfo from "./component/CommonResourceInfo";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupItemExchange extends PopupItemUse{

    @property({
        type: CommonResourceInfo,
        visible:true
    })
    _costResInfo1:CommonResourceInfo = null;
    @property({
        type:CommonResourceInfo,
        visible:true
    })
    _costResInfo2:CommonResourceInfo = null;


    _costResInfoList: CommonResourceInfo[];
    _exchangeItem: any;
    _consumeItems: any;

    public static path = 'common/PopupItemExchange' ;

    ctor(title, callback) {
        this._title = title || Lang.get('common_title_exchange_item');
        this._callback = callback;
        this._costResInfoList = [];
        this._useNum = 1;
    }
    onCreate() {
        super.onCreate();
        UIHelper.addEventListener(this.node, this._btnOk._button, 'PopupItemExchange', 'onBtnOk');
        UIHelper.addEventListener(this.node, this._btnCancel._button, 'PopupItemExchange', 'onBtnCancel');
        this._itemName.node.active = (false);
        this._costResInfoList = [
            this._costResInfo1,
            this._costResInfo2
        ];
        for (let k in this._costResInfoList) {
            var v = this._costResInfoList[k];
            v.setVisible(false);
        }
    }
    onEnter() {
    }
    onExit() {
    }
    _onNumSelect(num) {
        //logDebug('_onNumSelect :' + num);
        this._useNum = num;
        if (this._consumeItems.length && this._consumeItems.length > 2) {
            this._itemName.node.active = (false);
            return;
        }
        this._itemName.node.active = (true);
        for (let k in this._costResInfoList) {
            var v = this._costResInfoList[k];
            var consumeItem = this._consumeItems[k];
            if (consumeItem) {
                v.updateUI(consumeItem.type, consumeItem.value, consumeItem.size * num);
                v.setVisible(true);
            } else {
                v.setVisible(false);
            }
        }
    }
    updateUI(exchangeItem, consumeItems, surplusCount) {
        this._exchangeItem = exchangeItem;
        this._consumeItems = consumeItems;
        super.updateUI(exchangeItem.type, exchangeItem.value, exchangeItem.size);
        if (surplusCount > 0) {
            this.setMaxLimit(surplusCount);
        }
        var itemOwnerNum = UserDataHelper.getNumByTypeAndValue(exchangeItem.type, exchangeItem.value);
        this.setOwnerCount(itemOwnerNum);
        this._onNumSelect(this._useNum);
    }
    onBtnOk() {
        var isBreak;
        if (this._callback) {
            isBreak = this._callback(this._exchangeItem, this._consumeItems, this._useNum);
        }
        if (!isBreak) {
            this.close();
        }
    }
}
