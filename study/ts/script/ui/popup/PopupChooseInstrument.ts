import PopupChooseBase from "./PopupChooseBase";
import PopupChooseInstrumentHelper from "./PopupChooseInstrumentHelper";

const {ccclass, property} = cc._decorator;
@ccclass
export default class PopupChooseInstrument extends PopupChooseBase {

    public updateUI(fromType, callBack, instrumentDatas, showRP?, curEquipUnitData?) {
        let data: any[] = null;
        let listData: any[] = null;
        var helpFunc = PopupChooseInstrumentHelper['_FROM_TYPE' + fromType];
        if (helpFunc && typeof (helpFunc) == 'function') {
            data = helpFunc(instrumentDatas);
        }
        if (data != null) {
            listData = [];
            for (let i = 0; i < data.length; i++) {
                listData.push(PopupChooseInstrumentHelper.addInstrumentDataDesc(data[i], fromType, showRP, curEquipUnitData));
            }
        }
        this._setData(data, listData, [instrumentDatas, showRP, curEquipUnitData]);
        super.updateUI(fromType, callBack);
    }

    protected _onItemUpdate(item: cc.Node, index: number) {
        super._onItemUpdate(item, index, true);
    }
}