const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonVerticalText extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text: cc.Label = null;

    setString(txt): void {
        if(txt)
        {
            this._text.string = (txt);
        }
        this.node.active = (txt != ''&&txt);
    }
    setTextPosition(pos): void {
        this._text.node.setPosition(pos);
    }

}