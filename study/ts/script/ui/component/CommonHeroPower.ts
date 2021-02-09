const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHeroPower extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCombatValue: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _label: cc.Label = null;

    updateUI(power) {
        this._label.string = (power);
    }
    getWidth() {
        var posX = 50;
        var width = this._label && this._label.string.length * 18.22 || 0;
        return posX + width;
    }
    hideImage(...vars) {
        this._imageCombatValue.node.active = (false);
    }

}