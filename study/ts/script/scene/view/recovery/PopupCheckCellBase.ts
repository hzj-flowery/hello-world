import CommonListCellBase from "../../../ui/component/CommonListCellBase";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupCheckCellBase extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: CommonListCellBase, visible: true })
    _item: CommonListCellBase = null;

    @property({ type: CommonDesValue, visible: true })
    _nodeDes1: CommonDesValue = null;

    @property({ type: CommonDesValue, visible: true })
    _nodeDes2: CommonDesValue = null;

    @property({ type: cc.Toggle, visible: true })
    _checkBox: cc.Toggle = null;

    private _customCallback: Function;
    private _index: number;

    public updateUI(index: number, data, isAdded: boolean, type?: number) {
        this._index = index;
        var baseId = data.getBase_id();
        this._item.updateUI(type, baseId);
        this._item.setTouchEnabled(true);
        this._checkBox.isChecked = (isAdded);
    }

    protected _updateDes(data) {
        let nodesDes: CommonDesValue[] = [this._nodeDes1, this._nodeDes2];
        for (let i = 0; i < nodesDes.length; i++) {
            var info = data.desValue[i];
            if (info) {
                nodesDes[i].updateUI(info.des, info.value);
                nodesDes[i].setValueColor(info.colorValue);
                nodesDes[i].setVisible(true);
            } else {
                nodesDes[i].setVisible(false);
            }
        }
    }

    public onCheckBoxClicked(sender) {
        this.setCheckBoxSelected(this._checkBox.isChecked);
    }

    public setCheckBoxSelected(b: boolean) {
        this._checkBox.isChecked = b;
        this.dispatchCustomCallback(this._index, b, this);
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }

    public dispatchCustomCallback(...args) {
        if (this._customCallback) {
            this._customCallback.apply(this, args);
        }
    }
}