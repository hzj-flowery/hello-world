import CommonGuildFlag from "../../../ui/component/CommonGuildFlag";
import { handler } from "../../../utils/handler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CakeGuildTab extends cc.Component {
    _target: cc.Node;
    _index: any;
    _onClick: any;
    _enableClick: boolean;

    @property({
        type: CommonGuildFlag,
        visible: true
    })
    _nodeGuildIcon: CommonGuildFlag = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDark: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelClick: cc.Node = null;

    ctor(index, onClick) {
        this._index = index;
        this._onClick = onClick;
        this._enableClick = true;
        // this._panelClick.addClickEventListenerEx(handler(this, this._onClickPanel));
    }
    updateUI(data) {
        var guildIcon = data.getGuild_icon();
        if (guildIcon == 0) {
            guildIcon = 1;
        }
        var guildName = data.getGuild_name();
        this._nodeGuildIcon.updateUI(guildIcon, guildName);
    }
    setSelected(selected) {
        this._imageDark.node.active = (!selected);
    }
    onClickPanel() {
        if (this._enableClick && this._onClick) {
            this._onClick(this._index);
        }
    }
    setEnabled(enable) {
        this._enableClick = enable;
    }
}