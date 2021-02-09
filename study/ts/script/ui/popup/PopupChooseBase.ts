import PopupBase from "../PopupBase";
import CommonNormalLargePop from "../component/CommonNormalLargePop";
import ListView from "../../scene/view/recovery/ListView";
import { handler } from "../../utils/handler";
import PopupChooseCellBase from "./PopupChooseCellBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseBase extends PopupBase {

    @property({ type: cc.Prefab, visible: true })
    _cellPrefab: cc.Prefab = null;

    @property({ type: CommonNormalLargePop, visible: true })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({ type: ListView, visible: true })
    _listView: ListView = null;

    protected _fromType: number;
    protected _callBack: Function;
    protected _data: any[];
    protected _listData: any[];
    protected _param: any[];
    private _arg: any;

    public setTitle(title) {
        this._commonNodeBk.setTitle(title);
    }

    public onCreate() {
        this._commonNodeBk.addCloseEventListener(handler(this, this._onButtonClose));
    }

    public onShowFinish() {

    }

    public updateUI(fromType, callBack, ...args) {
        this._fromType = fromType;
        this._callBack = callBack;
        this._arg = args;
        this._listView.setTemplate(this._cellPrefab);
        this._listView.setCallback(handler(this, this._onItemUpdate));
        this._listView.setData(this._listData);
    }

    protected _setData(data, listData, args: any[]) {
        this._data = data;
        this._listData = listData;
        this._param = args;
    }

    protected _onItemUpdate(item: cc.Node, index: number) {
        let data = this._listData[index];
        if (index < this._listData.length && !data) {
            data = this.addDataDesc(this._data[index], this._fromType, index);
            this._listData[index] = data;
        }
        if (data) {
            let cell: PopupChooseCellBase = item.getComponent(PopupChooseCellBase);
            cell.updateUI(index, data);
            cell.setCustomCallback(handler(this, this._onItemTouch));
        }
    }

    addDataDesc(data, fromType, i) {
        return data;
    }

    protected _onItemTouch(index) {
        var data = this._data[index];
        var id = data.getId();
        if (this._callBack) {
            this._callBack(id, this._param, data);
        }
        this.close();
    }

    protected _onButtonClose() {
        this.close();
    }
}