const {ccclass, property} = cc._decorator;
@ccclass
export default class CommonCheckBox extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _textNoShow: cc.Label = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox: cc.Toggle = null;

    private _callback;
    public onBtnCheckBox(sender) {
        var isCheck = this._checkBox.isChecked;
        if (this._callback) {
            this._callback(isCheck);
        }
    }

    public setChangeCallBack(callback) {
        this._callback = callback;
    }

    public setSelected(selected) {
        this._checkBox.isChecked = (selected);
    }

    public setTouchEnabled(enable) {
        this._checkBox.interactable = enable;
    }

    public isSelected() {
        var isCheck = this._checkBox.isChecked;
        return isCheck;
    }

    public setString(str) {
        this._textNoShow.string = (str);
    }

}