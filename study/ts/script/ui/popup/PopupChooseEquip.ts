import PopupChooseBase from "./PopupChooseBase";
import { G_SignalManager } from "../../init";
import { SignalConst } from "../../const/SignalConst";
import { PopupChooseEquipHelper } from "./PopupChooseEquipHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseEquip extends PopupChooseBase {

    public onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupChooseEquip");
    }

    public updateUI(fromType, callBack, equipDatas) {
        let data: any[] = null;
        let listData: any[] = null;
        var helpFunc = PopupChooseEquipHelper['_FROM_TYPE' + fromType];
        if (helpFunc && typeof (helpFunc) == 'function') {
            data = helpFunc(equipDatas);
        }
        if (data != null) {
            listData = [];
            for (let i = 0; i < data.length; i++) {
                listData.push(PopupChooseEquipHelper.addEquipDataDesc(data[i], fromType));
            }
        }
        this._setData(data, listData, [equipDatas]);
        super.updateUI(fromType, callBack);
    }

    protected _onItemUpdate(item: cc.Node, index: number) {
        super._onItemUpdate(item, index, true);
    }
}