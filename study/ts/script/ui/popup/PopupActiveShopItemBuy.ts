import PopupBase from "../PopupBase";
import PopupItemUse from "../PopupItemUse";
import { ShopActiveDataHelper } from "../../utils/data/ShopActiveDataHelper";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { Lang } from "../../lang/Lang";
import CommonResourceInfo from "../component/CommonResourceInfo";
import { handler } from "../../utils/handler";
const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupActiveShopItemBuy extends PopupItemUse{
    private _goodId:number;
    
    @property({ type: CommonResourceInfo, visible: true })
    _costResInfo1: CommonResourceInfo = null;
    @property({ type: CommonResourceInfo, visible: true })
    _costResInfo2: CommonResourceInfo = null;


    setInitData(goodId, callback, title?) {
        this.ctor(title,callback)
        this._goodId = goodId;
        this._useNum = 1; 
    }
    onInitCsb() {
        // var CSHelper = require('CSHelper');
        // var resource = {
        //     file: Path.getCSB('PopupItemBuy', 'common'),
        //     binding: {
        //         _btnOk: {
        //             events: [{
        //                     event: 'touch',
        //                     method: 'onBtnOk'
        //                 }]
        //         }
        //         _btnCancel: {
        //             events: [{
        //                     event: 'touch',
        //                     method: 'onBtnCancel'
        //                 }]
        //         }
        //     }
        // };
        // if (resource) {
        //     CSHelper.createResourceNode(this, resource);
        // }
    }
    onCreate() {
        super.onCreate();
        this._costResInfo2.setVisible(false);
    }
    onEnter() {
        super.onEnter()
        this._updateUI();
        var maxLimit = ShopActiveDataHelper.getMaxLimit(this._goodId);
        this.setMaxLimit(maxLimit);
    }
    onExit() {
    }
    _onNumSelect(num) {
        this._useNum = num;
        var info1 = this._getItemPrice(0);
        if (info1) {
            this.setCostInfo1(info1.type, info1.value, info1.size);
        }
        var info2 = this._getItemPrice(1);
        if (info2) {
            this.setCostInfo2(info2.type, info2.value, info2.size);
        }
    }
    _getItemPrice(index) {
        var costInfo = ShopActiveDataHelper.getCostInfo(this._goodId);
        var info = costInfo[index];
        if (info) {
            info.size = info.size * this._useNum;
        }
        return info;
    }
    _updateUI() {
        var info = ShopActiveDataHelper.getShopActiveConfig(this._goodId);
        var itemOwnerNum = UserDataHelper.getNumByTypeAndValue(info.type, info.value);
       this.updateUI(info.type, info.value, info.size);
        this.setOwnerCount(itemOwnerNum);
        this._onNumSelect(this._useNum);
    }
    onBtnOk() {
        if (this._callback) {
            this._callback(this._goodId, this._useNum);
        }
        this.close();
    }
    setCostInfo1(costType, costValue, costSize) {
        this._costResInfo1.updateUI(costType, costValue, costSize);
    }
    setCostInfo2(costType, costValue, costSize) {
        this._costResInfo2.updateUI(costType, costValue, costSize);
        this._costResInfo2.setVisible(true);
    }
}