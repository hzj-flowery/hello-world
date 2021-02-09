import { G_ResolutionManager } from "../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonDlgBackground extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_day: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_night: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_content: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_2: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_1: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_right: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_left: cc.Sprite = null;

    onLoad() {
        this._panel_content.setContentSize(G_ResolutionManager.getDesignWidth(), G_ResolutionManager.getDesignHeight());
    }

}