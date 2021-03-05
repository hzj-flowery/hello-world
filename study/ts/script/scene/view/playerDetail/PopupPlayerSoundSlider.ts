const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupPlayerSoundSlider extends cc.Component {

    @property({
        type: cc.Slider,
        visible: true
    })
    _slider: cc.Slider = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _sliderBar: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _sliderHandle: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _levelLow: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _levelHigh: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _soundImg: cc.Node = null;

    private _callBack;

    public setCallBack(_callBack) {
        if (_callBack) {
            this._callBack = _callBack;
        }
    }

    public updateUI(_value) {
        this._soundImg.active = (_value == 0);
        this._levelLow.active = (_value != 0);
        this._slider.progress = (_value);
        this._sliderBar.width = this._slider.node.width * this._slider.progress;
    }

    public onSlider(sender, event) {
        var value = this._slider.progress;
        this._sliderBar.width = this._slider.node.width * this._slider.progress;
        this.updateUI(value);
        // console.log("onSlider:", value);
        if (this._callBack) {
            this._callBack(value, 'on');
        }
        if (value == 0 || value == 1) {
            if (this._callBack) {
                this._callBack(this._slider.progress, 'up');
            }
        }
    }

    public onSliderEnd() {
        // console.log("onSliderEnd:", this._slider.progress);
        if (this._callBack) {
            this._callBack(this._slider.progress, 'up');
        }
    }
}