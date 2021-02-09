import PopupCommonLimitCost from "../../../ui/PopupCommonLimitCost";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { G_UserData, G_ResolutionManager } from "../../../init";
import { LimitCostConst } from "../../../const/LimitCostConst";
import { handler } from "../../../utils/handler";
import HeroGoldHelper from "./HeroGoldHelper";
import { DataConst } from "../../../const/DataConst";

const {ccclass, property} = cc._decorator;
@ccclass
export default class HeroGoldCostPanel extends PopupCommonLimitCost{

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

    _initView() {
        var heroId = G_UserData.getHero().getCurHeroId();
        var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var [costInfo, baseId] = HeroGoldHelper.heroGoldTrainCostInfo(unitData);
        if (this._costKey == LimitCostConst.LIMIT_COST_KEY_2) {
            var tbPos = {
                [1]: [
                    46,
                    148
                ],
                [2]: [
                    110,
                    56
                ],
                [3]: [
                    225,
                    56
                ],
                [4]: [
                    290,
                    148
                ]
            };
            for (var i = 1; i <= 4; i++) {
                var item = this._createMaterialIcon(DataConst['ITEM_HERO_LEVELUP_MATERIAL_' + i], costInfo['consume_' + this._costKey], TypeConvertHelper.TYPE_ITEM);
                // item.setPosition(cc.v2(tbPos[i][0], tbPos[i][1]));
                item.setPosition(new cc.Vec2(tbPos[i][0]-this._imageBg.node.getContentSize().width/2, tbPos[i][1]-this._imageBg.node.getContentSize().width/2));
            }
        } else if (this._costKey == LimitCostConst.LIMIT_COST_KEY_1) {
            var item =  this._createMaterialIcon(baseId, costInfo.consume_hero, TypeConvertHelper.TYPE_HERO);
            item.setPosition(0,-this._imageBg.node.getContentSize().height/2)
        } else {
            var item = this._createMaterialIcon(costInfo['value_' + this._costKey], costInfo['consume_' + this._costKey], costInfo['type_' + this._costKey]);
            item.setPosition(0,-this._imageBg.node.getContentSize().height/2)
        }
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onClickPanel,this);
    }
    fitterItemCount(item) {
        var type = item.getType();
        if (type == TypeConvertHelper.TYPE_HERO) {
            var value = item.getItemId();
            item.updateCount(UserDataHelper.getSameCardCount(type, value, G_UserData.getHero().getCurHeroId()));
        } else {
            item.updateCount();
        }
    }
}