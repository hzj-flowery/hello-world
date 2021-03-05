import PopupCheckBase from "./PopupCheckBase";
import { PopupCheckTreasureHelper } from "./PopupCheckTreasureHelper";
import { Lang } from "../../../lang/Lang";

const {ccclass, property} = cc._decorator;
@ccclass
export default class PopupCheckTreasure extends PopupCheckBase {
    public static path = 'recovery/PopupCheckTreasure';
    private TITLE = {
        [1]: "treasure_check_title_1"
    }

    private helpFuncs = {
        [1]: PopupCheckTreasureHelper._FROM_TYPE1,
        [2]: PopupCheckTreasureHelper._FROM_TYPE2,
    }

    public updateUI(fromType, clickOk) {
        super.updateUI(fromType, clickOk);
        super._updateInfo(this.helpFuncs[fromType](),
        PopupCheckTreasureHelper.getMaxCount(fromType),
            Lang.get(this.TITLE[fromType]));
    }

    protected _onItemUpdate(item: cc.Node, index: number) {
        if (this._listData[index] != null) {
            super._onItemUpdate(item, index, PopupCheckTreasureHelper.addTreasureDataDesc(this._listData[index], this._fromType));
        }
    }
}