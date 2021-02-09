const {ccclass, property} = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonSelectNumNode from '../../../ui/component/CommonSelectNumNode'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import MineBarNode from './MineBarNode'

import CommonNormalSmallPop from '../../../ui/component/CommonNormalSmallPop'
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { DataConst } from '../../../const/DataConst';
import { G_SignalManager, G_UserData, G_ConfigLoader} from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { MineCraftData } from '../../../data/MineCraftData';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { MineCraftHelper } from './MineCraftHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { UserCheck } from '../../../utils/logic/UserCheck';
import PopupBase from '../../../ui/PopupBase';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';

@ccclass
export default class PopupBuyArmy extends PopupBase {

   @property({
       type: CommonNormalSmallPop,
       visible: true
   })
   _commonNodeBk: CommonNormalSmallPop = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _itemName: cc.Label = null;

   @property({
       type: MineBarNode,
       visible: true
   })
   _armyBar: MineBarNode = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _btnOk: CommonButtonLevel0Highlight = null;

   @property({
       type: CommonButtonLevel0Normal,
       visible: true
   })
   _btnOneKey: CommonButtonLevel0Normal = null;

   @property({
       type: CommonSelectNumNode,
       visible: true
   })
   _selectNumNode: CommonSelectNumNode = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _costResInfo1: CommonResourceInfo = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _costResInfo2: CommonResourceInfo = null;
   
   private _useNum:number;
   private _needFood:number;
   private _buyFoodGold:number;
   private _signalMineBuyArmy:any;
   private _needMoney:number;
   private _barArmy:MineBarNode;
   constructor(){
       super();
           this._useNum = 1;
    this._needFood = 0;
    this._buyFoodGold = 0;
   }

onLoad():void{
    super.onLoad();
}
onCreate() {
    this._commonNodeBk.setTitle(Lang.get('mine_buy_army_title'));
    this._commonNodeBk.addCloseEventListener(handler(this, this._onClickClose));
    this._selectNumNode.setCallBack(handler(this, this._onNumSelect));
    this._itemName.string = (Lang.get('ming_bingli'));
    this._costResInfo1.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD);
    this._btnOk.setString(Lang.get('mine_buy_food_confirm'));
    this._btnOneKey.setString(Lang.get('mine_one_key_buy'));

    this._btnOk.addClickEventListenerEx(handler(this,this.onBtnOkClick));
    this._btnOneKey.addClickEventListenerEx(handler(this,this.onBtnOneKey));
    this._barArmy = this._armyBar;
    
}
onEnter() {
    this._signalMineBuyArmy = G_SignalManager.add(SignalConst.EVENT_MINE_BUY_ARMY, handler(this, this._onEventBuyArmy));
    this._refreshBuyDetail();
}
onExit() {
    this._signalMineBuyArmy.remove();
    this._signalMineBuyArmy = null;
}
_refreshBuyDetail() {
    var nowArmy = G_UserData.getMineCraftData().getMyArmyValue();
    
    var maxArmy = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.TROOP_MAX).content);
    if (G_UserData.getMineCraftData().isSelfPrivilege()) {
        var soilderAdd = MineCraftHelper.getParameterContent(ParameterIDConst.MINE_CRAFT_SOILDERADD);
        maxArmy = maxArmy + soilderAdd;
    }
    this._barArmy.setPercent(nowArmy, true, G_UserData.getMineCraftData().isSelfPrivilege());
    this._needFood = maxArmy - nowArmy;
    var maxFood = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD);
    var limit = Math.min(maxFood, maxArmy - nowArmy);
    this._selectNumNode.setMaxLimit(limit);
    this._selectNumNode.setAmount(1);
    this._costResInfo1.setCount(1);
    this._useNum = 1;
}
_onNumSelect(num) {
    this._useNum = num;
    this._updateBuyCount();
}
_updateBuyCount() {
    this._costResInfo1.setCount(this._useNum);
}
private onBtnOkClick() {
    var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD, this._useNum);
    if (!success) {
        return;
    }

    G_UserData.getMineCraftData().c2sMineBuyArmy(this._useNum);
}
private onBtnOneKey() {
    var maxFood = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_ARMY_FOOD);
    var goldToFood = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.MINE_GOLD_TO_FOOD).content);
    this._needMoney = 0;
    var strContent = '';
    if (maxFood >= this._needFood) {
        strContent = Lang.get('mine_buy_all', { count: this._needFood });
    } else if (maxFood == 0) {
        this._buyFoodGold = this._needFood * goldToFood;
        strContent = Lang.get('mine_buy_all_no_food', { count: this._buyFoodGold });
    } else {
        var leftGold = (this._needFood - maxFood) * goldToFood;
        this._buyFoodGold = leftGold;
        strContent = Lang.get('mine_buy_all_money', {
            count1: maxFood,
            count2: leftGold
        });
    }
    var title = Lang.get('mine_one_key_title');

    UIPopupHelper.popupSystemAlert(title, strContent, handler(this, this._sendBuyAll),null,function(popupSystemAlert:PopupSystemAlert){
        popupSystemAlert.setCheckBoxVisible(false);
    })
}
_sendBuyAll() {
    var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, this._buyFoodGold);
    if (!success) {
        return;
    }
    G_UserData.getMineCraftData().c2sMineBuyArmy(this._needFood);
}
_onEventBuyArmy(eventName, buyCount) {
    this._refreshBuyDetail();
    this.closeWithAction();
}
_onClickClose() {
    this.closeWithAction();
}

}