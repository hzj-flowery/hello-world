import CommonIconBase from "./CommonIconBase";
import { Lang } from "../../lang/Lang";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { PopupItemInfo } from "../PopupItemInfo";
import PopupChooseHero from "../popup/PopupChooseHero";
import PopupBase from "../PopupBase";
import PopupSelectReward from "../PopupSelectReward";
import PopupSelectRewardTab from "../PopupSelectRewardTab";
import { UIPopupHelper } from "../../utils/UIPopupHelper";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { ObjKeyLength } from "../../utils/GlobleFunc";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonItemIcon extends CommonIconBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectDown: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectUp: cc.Node = null;

    _type = TypeConvertHelper.TYPE_ITEM;

    onLoad():void{
        // this._type = TypeConvertHelper.TYPE_ITEM;
        super.onLoad();
    }


    updateUI(value, size?, rank?) {
        super.updateUI(value, size, rank);
        this.showIconEffect();
    }

    _onTouchCallBack() {
        if (this._callback) {
            this._callback(this._panelItemContent, this._itemParams);
        } else {
            this.popupItemInfo();
        }
    }

    showIconEffect(scale?) {
        this.removeLightEffect();
        if (this._itemParams &&  this._itemParams.cfg.moving != null &&  this._itemParams.cfg.moving != '') {
            this.showLightEffect(scale, this._itemParams.cfg.moving);
        }
    }
    popupItemInfo() {
        var itemParam = this._itemParams;
        var itemId = itemParam.cfg.id;
        var itemConfig = itemParam.cfg;
        if (itemConfig.item_type == 2) {
            var boxId = itemConfig.item_value;
            var [itemList] = UIPopupHelper.getBoxItemList(boxId, itemId);
            var callBackFunction = function (awardItem, index, total) {
            }
            var itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId);
            var itemListSize = ObjKeyLength(itemList);
            if (itemListSize == 1) {
                var awardItem = null;
                for (var i in itemList) {
                    var awards = itemList[i];
                    awardItem = awards;
                }
                PopupBase.loadCommonPrefab('PopupSelectReward', (popup:PopupSelectReward)=>{
                    popup.ctor(Lang.get('popup_title_select_reward'), callBackFunction);
                    popup.updateUI(awardItem);
                    popup.showCheck(false);
                    popup.onlyShowOkButton();
                    popup.openWithAction();                    

                });
            } else if (itemListSize > 1) {
                PopupBase.loadCommonPrefab('PopupSelectRewardTab', (popup:PopupSelectRewardTab)=>{
                    popup.ctor(Lang.get('popup_title_select_reward'), callBackFunction);
                    popup.updateUI(itemList);
                    popup.showCheck(false);
                    popup.onlyShowOkButton();
                    popup.openWithAction();                    

                });
            }
        } else {
            // PopupItemInfo.updateUI(TypeConvertHelper.TYPE_ITEM, itemId);
            // PopupItemInfo.openWithAction();
            PopupChooseHero.getIns(PopupItemInfo, (p)=> {
                p.updateUI(TypeConvertHelper.TYPE_ITEM, itemId);
                p.openWithAction();
            });
        }
    }
}