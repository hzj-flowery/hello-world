const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupPlayerLevelUpCell extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_Icon: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _text_way_name: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _text_way_desc: cc.Label = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _button_OK: cc.Button = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _text_way_unlock_desc: cc.Label = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_way_unlock: cc.Sprite = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panel_Touch: cc.Node = null;
}