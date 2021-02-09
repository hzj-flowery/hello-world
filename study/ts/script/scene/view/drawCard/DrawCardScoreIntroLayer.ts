import PopupBase from "../../../ui/PopupBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DrawCardScoreIntroLayer extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    onCreate() {
        this.node.setPosition(-584, -320);
    }
    onEnter() {
        // this.node.setPosition(cc.v2(0, 0));
    }
    onExit() {
    }
    onCloseClick() {
        this.closeWithAction();
    }

}