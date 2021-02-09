import PopupCheckBase from "./PopupCheckBase";
import { PopupCheckInstrumentHelper } from "./PopupCheckInstrumentHelper";
import { Lang } from "../../../lang/Lang";

const {ccclass, property} = cc._decorator;
@ccclass
export default class PopupCheckInstrument extends PopupCheckBase {
    private TITLE = {
        [1]: "instrument_check_title_1"
    }

    private helpFuncs = {
        [1]: PopupCheckInstrumentHelper._FROM_TYPE1,
        [2]: PopupCheckInstrumentHelper._FROM_TYPE2,
    }

    public updateUI(fromType, clickOk) {
        super.updateUI(fromType, clickOk);
        super._updateInfo(this.helpFuncs[fromType](),
        PopupCheckInstrumentHelper.getMaxCount(fromType),
            Lang.get(this.TITLE[fromType]));
    }

    protected _onItemUpdate(item: cc.Node, index: number) {
        if (this._listData[index] != null) {
            super._onItemUpdate(item, index, PopupCheckInstrumentHelper.addInstrumentDataDesc(this._listData[index], this._fromType));
        }
    }
}