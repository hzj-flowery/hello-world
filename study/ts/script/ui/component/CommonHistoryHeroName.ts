const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHistoryHeroName extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_1: cc.Label = null;

    setName(heroName) {
        this._text_1.string = (heroName);
    }
    setColor(color) {
        this._text_1.node.color = (color);
    }

    setVisible(arg0: boolean) {
        this.node.active = arg0;
    }

}