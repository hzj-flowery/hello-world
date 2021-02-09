const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonGuildTalk extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_talk_bg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_talk: cc.Label = null;

    setText(text) {
        this._text_talk.node.width = 140;
        this._text_talk.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        this._text_talk.string = (text);
    }
}