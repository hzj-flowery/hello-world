import PopupBase from "../../../ui/PopupBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupDrawEffect extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGetBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGetDetail: cc.Label = null;


}