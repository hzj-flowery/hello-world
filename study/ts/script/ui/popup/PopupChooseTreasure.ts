import PopupChooseBase from "./PopupChooseBase";
import { PopupChooseTreasureHelper } from "./PopupChooseTreasureHelper";

const {ccclass, property} = cc._decorator;
@ccclass
export default class PopupChooseTreasure extends PopupChooseBase {
    public static path = 'common/PopupChooseTreasure';
    public updateUI(fromType, callBack, ...args) {
        let data: any[] = null;
        let listData: any[] = null;
        var helpFunc = PopupChooseTreasureHelper['_FROM_TYPE' + fromType];
        if (helpFunc && typeof (helpFunc) == 'function') {
            data = helpFunc(args);
        }
        if (data != null) {
            listData = [];
            for (let i = 0; i < data.length; i++) {
                listData.push(PopupChooseTreasureHelper.addTreasureDataDesc(data[i], fromType));
            }
        }
        this._setData(data, listData, args);
        super.updateUI(fromType, callBack);
    }
}