import { DataConst } from "../../../const/DataConst";
import { LimitCostConst } from "../../../const/LimitCostConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_ResolutionManager, G_SignalManager, G_ConfigLoader, Colors } from "../../../init";
import PopupCommonLimitCost from "../../../ui/PopupCommonLimitCost";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { handler } from "../../../utils/handler";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { EquipTrainHelper } from "./EquipTrainHelper";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import CommonMaterialIcon from "../../../ui/component/CommonMaterialIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipLimitCostPanel extends PopupCommonLimitCost {
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

    onLoad(): void {
        this.setNode(this._imageBg.node);
        super.onLoad();
    }

    public setInitData(costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode): void {
        super.setInitData(costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode);
    }
    _initView() {
        var info = EquipTrainHelper.getLimitUpCostInfo();
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
            for (var i = 1; i <= 4; i++) {
                var item = this._createMaterialIcon(DataConst['ITEM_HERO_LEVELUP_MATERIAL_' + i], info['consume_' + this._costKey], TypeConvertHelper.TYPE_ITEM);
                item.setPosition(new cc.Vec2(tbPos[i][0] - this._imageBg.node.getContentSize().width / 2, tbPos[i][1] - this._imageBg.node.getContentSize().width / 2));
            }
        } else {
            var itemType = TypeConvertHelper.TYPE_ITEM;
            if (this._costKey == LimitCostConst.LIMIT_COST_KEY_2) {
                itemType = TypeConvertHelper.TYPE_EQUIPMENT;
            }
            var item = this._createMaterialIcon(info['value_' + this._costKey], info['consume_' + this._costKey], itemType);
            if (itemType == TypeConvertHelper.TYPE_EQUIPMENT) {

                var Equipment = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT);
                var config = Equipment.get(info['value_' + this._costKey]);
                item.getComponent(CommonMaterialIcon).setNameColor(Colors.getColor(config.color));
                item.getComponent(CommonMaterialIcon).showNameBg(true);
            }
        }
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, this._onClickPanel, this);
    }

}