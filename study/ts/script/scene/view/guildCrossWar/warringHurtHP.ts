const { ccclass, property } = cc._decorator;

@ccclass
export default class warringHurtHP extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _hurtNum: cc.Label = null;

    onCreate() {
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI(hurtNum) {
        this._hurtNum.string = (hurtNum);
    }

}