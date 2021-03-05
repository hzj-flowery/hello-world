import PopupCheckBase from "./PopupCheckBase";
import { SignalConst } from "../../../const/SignalConst";
import { G_SignalManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { PopupCheckPetHelper } from "./PopupCheckPetHelper";

const {ccclass, property} = cc._decorator;
@ccclass
export default class PopupCheckPet extends PopupCheckBase {
    private TITLE = {
        [1]: "pet_check_title_1",
        [2]: "pet_check_title_2",
    }

    private helpFuncs = {
        [2]: PopupCheckPetHelper._FROM_TYPE2,
    }

    public onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupCheckPet");
    }

    public updateUI(fromType, clickOk) {
        super.updateUI(fromType, clickOk);
        super._updateInfo(this.helpFuncs[fromType](),
        PopupCheckPetHelper.getMaxCount(fromType),
            Lang.get(this.TITLE[fromType]));
    }

    protected _onItemUpdate(item: cc.Node, index: number) {
        if (this._listData[index] != null) {
            super._onItemUpdate(item, index, PopupCheckPetHelper.addPetDataDesc(this._listData[index], this._fromType));
        }
    }
}