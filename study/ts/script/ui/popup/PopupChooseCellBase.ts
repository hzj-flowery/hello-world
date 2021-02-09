import CommonListCellBase from "../component/CommonListCellBase";
import CommonDesValue from "../component/CommonDesValue";
import CommonButtonSwitchLevel1 from "../component/CommonButtonSwitchLevel1";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseCellBase extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: CommonListCellBase, visible: true })
    _item: CommonListCellBase = null;

    @property({ type: CommonButtonSwitchLevel1, visible: true })
    _buttonChoose: CommonButtonSwitchLevel1 = null;

    private _customCallback: Function;
    protected _index: number;

    public updateUI(index: number, data, type?) {
        this._index = index;
        var baseId = data.getBase_id();
        this._item.updateUI(type, baseId);
        this._item.setTouchEnabled(true);
    }

    public onButtonClicked() {
        this.dispatchCustomCallback(this._index);
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