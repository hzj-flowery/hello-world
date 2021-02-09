import PopupCheckBase from "./PopupCheckBase";
import { PopupCheckHorseHelper } from "./PopupCheckHorseHelper";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupCheckHorse extends PopupCheckBase {
    private TITLE = {
        [1]: "horse_check_title_1"
    }

    private helpFuncs = {
        [1]: PopupCheckHorseHelper._FROM_TYPE1,
    }

    public updateUI(fromType, clickOk) {
        super.updateUI(fromType, clickOk);
        super._updateInfo(this.helpFuncs[fromType](),
            PopupCheckHorseHelper.getMaxCount(fromType),
            Lang.get(this.TITLE[fromType]));
    }

    protected _onItemUpdate(item: cc.Node, index: number) {
        if (this._listData[index] != null) {
            super._onItemUpdate(item, index, PopupCheckHorseHelper.addHorseDataDesc(this._listData[index], this._fromType));
        }
    }
}