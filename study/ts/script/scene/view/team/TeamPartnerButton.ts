import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TeamPartnerButton extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    private _onClick: any;


    public setInitData(callBack:any): void {
        this._onClick = callBack;
    }

    onCreate() {
        this._initUI();
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, this._onPanelTouch, this);
    }
    onEnter() {
    }
    onExit(){
        
    }
    onCleanup() {
        this._panelTouch.off(cc.Node.EventType.TOUCH_END, this._onPanelTouch, this);
        this._onClick = null;
    }
    _initUI() {
        this._imageSelected.node.active = (false);
        this._redPoint.node.active = (false);
    }
    setSelected(selected) {
        this._imageSelected.node.active = (selected);
    }
    _onPanelTouch(sender: cc.Touch) {
        var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (offsetX < 20 && offsetY < 20) {
            if (this._onClick) {
                this._onClick();
            }
        }
    }
    showRedPoint(visible) {
        this._redPoint.node.active = (visible);
    }

}