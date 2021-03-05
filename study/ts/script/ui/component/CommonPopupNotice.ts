const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonPopupNotice extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_bg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_title: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _button_close: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_5: cc.Sprite = null;

    private _closeCallback;
    addCloseEventListener(callback) {
        this._closeCallback = callback;
    }
    setTitle(s) {
        this._text_title.string = s;
    }

    public onCloseClick() {
        if (this._closeCallback) {
            this._closeCallback();
        }
    }
}