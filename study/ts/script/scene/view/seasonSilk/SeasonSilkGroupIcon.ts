import { G_UserData, Colors } from "../../../init";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SeasonSilkGroupIcon extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBackNormal: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _silkEquipped: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _silkUnEquip: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _silkLock: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelected: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textGroupName: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textGroupIndex: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    private _data;
    private _customCallback;

    public onLoad() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        // if (G_UserData.getSeasonSport().getInSeasonSilkView() == false) {
        //     var positionX = this._resourceNode.x;
        //     var positionY = this._resourceNode.y;
        //     this._resourceNode.x = (positionX - 5);
        //     this._resourceNode.y = (positionY + 5);
        // }
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, handler(this, this._onBtnTouchGroup));
        UIHelper.setSwallowTouches(this._panelTouch, false);
        this._silkUnEquip.node.active = false;
    }

    public updateUI(data) {
        this._data = data;
        this._silkLock.node.active = (data.state == 0 || false);
        this._silkEquipped.node.active = (data.isSelected);
        this._imageSelected.node.active = (data.isSelected);
        this._textGroupName.string = data.name;
        this._textGroupName.node.active = (data.state != 0 || false);
        this._textGroupName.node.color = (data.isSelected && Colors.getFTypeRed() || Colors.getATypeYellow());
        this._textGroupIndex.string = (data.pos);
    }

    private _onBtnTouchGroup(sender: cc.Touch, state) {
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            if (this._customCallback) {
                this._customCallback(this._data);
            }
        }
    }

    public setSelected(isVisible) {
        this._imageSelected.node.active = isVisible;
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}