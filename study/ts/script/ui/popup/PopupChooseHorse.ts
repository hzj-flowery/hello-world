import PopupChooseBase from "./PopupChooseBase";
import { G_SignalManager } from "../../init";
import { SignalConst } from "../../const/SignalConst";
import { PopupChooseHorseHelper } from "./PopupChooseHorseHelper";

const {ccclass, property} = cc._decorator;

@ccclass

export default class PopupChooseHorse extends PopupChooseBase {

    public static path: string = "common/PopupChooseHorse";

    public updateUI(fromType, callBack, horseDatas, showRP?) {
        let data: any[] = null;
        let listData: any[] = null;
        var helpFunc = PopupChooseHorseHelper['_FROM_TYPE' + fromType];
        if (helpFunc && typeof (helpFunc) == 'function') {
            data = helpFunc(horseDatas);
        }
        if (data != null) {
            listData = [];
            for (let i = 0; i < data.length; i++) {
                listData.push(PopupChooseHorseHelper.addHorseDataDesc(data[i], fromType));
            }
        }
        this._setData(data, listData, [horseDatas, showRP]);
        super.updateUI(fromType, callBack);
    }
}