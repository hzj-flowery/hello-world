const { ccclass, property } = cc._decorator;

@ccclass
export default class RollNoticeLayer extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNormal: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContent: cc.Node = null;

}