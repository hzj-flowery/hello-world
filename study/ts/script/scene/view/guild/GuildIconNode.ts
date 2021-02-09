import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildIconNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _panelTouch: cc.Sprite = null;

    _target: any;
    _iconIndex: any;
    _onClick: any;

    initData(target, iconIndex, onClick) {
        this._target = target;
        this._iconIndex = iconIndex;
        this._onClick = onClick;
        var icon = Path.getCommonIcon('guild', iconIndex);
        UIHelper.loadTexture(this._imageIcon, icon);
    }
    onPanelTouch() {
        if (this._onClick) {
            this._onClick(this._iconIndex);
        }
    }
    setSelected(selected) {
        if (selected == null) {
            selected = false;
        }
        this._imageSelected.node.active = (selected);
    }
}