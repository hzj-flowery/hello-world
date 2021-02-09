import PopupChooseBase from "./PopupChooseBase";
import { G_SignalManager } from "../../init";
import { SignalConst } from "../../const/SignalConst";
import PopupChoosePetHelper from "./PopupChoosePetHelper";

const {ccclass, property} = cc._decorator;

@ccclass

export default class PopupChoosePet extends PopupChooseBase {

    public static path: string = "common/PopupChoosePet";

    public onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupChoosePet");
    }

    public updateUI(fromType, callBack, ...args) {
        let data: any[] = null;
        let listData: any[] = null;
        var helpFunc = PopupChoosePetHelper['_FROM_TYPE' + fromType];
        if (helpFunc && typeof (helpFunc) == 'function') {
            data = helpFunc(args);
        }
        if (data != null) {
            listData = [];
            for (let i = 0; i < data.length; i++) {
                listData.push(PopupChoosePetHelper.addPetDataDesc(data[i], fromType, i));
            }
        }
        this._setData(data, listData, args);
        super.updateUI(fromType, callBack);
    }
}