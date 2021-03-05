import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Path } from "../../../utils/Path";
import ServerConst from "../../../const/ServerConst";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupServerListCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item1: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _button1: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _ImageStatus1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayer1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageType1: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item2: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _button2: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _ImageStatus2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayer2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageType2: cc.Sprite = null;

    onInit() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(data1, data2) {
        if (data1) {
            this._item1.active = (true);
            var s1 = data1.server.getStatus();
            this._textName1.string = (data1.server.getName());
            var [statusIcon, showStatusIcon] = Path.getServerStatusIcon(s1);
            this._ImageStatus1.node.active = (showStatusIcon);
            this._imageType1.node.active = (showStatusIcon && ServerConst.SHOW_BIG_STATUS_ICON[s1]);
            if (showStatusIcon) {

                UIHelper.loadTexture(this._ImageStatus1, statusIcon);
            }
            if (showStatusIcon && ServerConst.SHOW_BIG_STATUS_ICON[s1]) {
                UIHelper.loadTexture(this._imageType1, Path.getServerStatusBigIcon(s1));
            }
            if (data1.role) {
                this._textPlayer1.string = (Lang.get('login_select_server_player_info', { value: data1.role.getRole_lv() }));
            } else {
                this._textPlayer1.string = ('');
            }
        } else {
            this._item1.active = (false);
        }
        if (data2) {
            this._item2.active = (true);
            var s2 = data2.server.getStatus();
            this._textName2.string = (data2.server.getName());
            var [statusIcon, showStatusIcon] = Path.getServerStatusIcon(s2);
            this._ImageStatus2.node.active = (showStatusIcon);
            this._imageType2.node.active = (showStatusIcon && ServerConst.SHOW_BIG_STATUS_ICON[s2]);
            if (showStatusIcon) {
                UIHelper.loadTexture(this._ImageStatus2, statusIcon);
            }
            if (showStatusIcon && ServerConst.SHOW_BIG_STATUS_ICON[s2]) {
                UIHelper.loadTexture(this._imageType2, Path.getServerStatusBigIcon(s2));
            }
            if (data2.role) {
                this._textPlayer2.string = (Lang.get('login_select_server_player_info', { value: data2.role.getRole_lv() }));
            } else {
                this._textPlayer2.string = ('');
            }
        } else {
            this._item2.active = (false);
        }
    }
    onButton1() {
        this.dispatchCustomCallback(1);
    }
    onButton2() {
        this.dispatchCustomCallback(2);
    }
    onEnter() {
    }
    onExit() {
    }
}