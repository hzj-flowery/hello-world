import HeroGoldHelper from "../heroGoldTrain/HeroGoldHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { G_ResolutionManager, G_UserData, G_SignalManager } from "../../../init";
import { handler } from "../../../utils/handler";
import PopupCommonLimitCost from "../../../ui/PopupCommonLimitCost";
import { HeroData } from "../../../data/HeroData";
import { DataConst } from "../../../const/DataConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { LimitCostConst } from "../../../const/LimitCostConst";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { SignalConst } from "../../../const/SignalConst";
import { PetTrainHelper } from "../petTrain/PetTrainHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PetLimitCostPanel extends PopupCommonLimitCost {
    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;
    
    onLoad():void{
        this.setNode(this._imageBg.node);
        super.onLoad();
    }

    public setInitData(costKey,onClick, onStep, onStart, onStop, limitLevel, fromNode):void{
           super.setInitData(costKey,onClick, onStep, onStart, onStop, limitLevel, fromNode);
    }
    _initView() {
        var info = PetTrainHelper.getCurLimitCostInfo()
        if (this._costKey == LimitCostConst.LIMIT_COST_KEY_1) {
            var tbPos = {
                1: [
                    46,
                    148
                ],
                2: [
                    110,
                    56  
                ],
                3: [
                    225,
                    56
                ],
                4: [
                    290,
                    148
                ]
            };
            for (var i = 1;i<=4;i++) {
                var item = this._createMaterialIcon(DataConst['ITEM_PET_LEVELUP_MATERIAL_' + i], info['consume_' + this._costKey], TypeConvertHelper.TYPE_ITEM);
                item.setPosition(new cc.Vec2(tbPos[i][0]-this._imageBg.node.getContentSize().width/2, tbPos[i][1]-this._imageBg.node.getContentSize().width/2));
            }
        } else {
            var item = this._createMaterialIcon(info['value_' + this._costKey], info['consume_' + this._costKey], TypeConvertHelper.TYPE_ITEM);
        }
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onClickPanel,this);
    }

    fitterItemCount(item) {
        var type = item.getType();
        var value = item.getItemId();
        if (type == TypeConvertHelper.TYPE_PET) {
            item.updateCount(PetTrainHelper.getCanConsumePetNums(value));
        } else {
            item.updateCount();
        }
    }
}