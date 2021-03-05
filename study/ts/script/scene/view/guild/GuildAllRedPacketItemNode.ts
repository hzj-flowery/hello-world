import ViewBase from "../../ViewBase";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { GuildConst } from "../../../const/GuildConst";
import { Lang } from "../../../lang/Lang";
import { Colors } from "../../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildAllRedPacketItemNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRate: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageState: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _userName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textState: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRedPacketName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _goldNum: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSee: cc.Label = null;

    _callback: Function = null;
    _index: number;
    static readonly RATE_IMGS = {
        6: 'img_liubei01',
        3: 'img_sanbei01',
        2: 'img_shuangbei01'
    };

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        // this._resourceNode.setSwallowTouches(false);
    }
    onEnter() {

    }

    onExit() {

    }

    updateData(data) {
        var config = data.getConfig();
        var money = data.getTotal_money() * data.getMultiple();
        var state = data.getRed_bag_state();
        var multiple = data.getMultiple();
        this._textRedPacketName.string = (config.name);
        if (multiple > 1) {
            this._imageRate.node.active = (true);
            UIHelper.loadTexture(this._imageRate, Path.getGuildRes(GuildAllRedPacketItemNode.RATE_IMGS[multiple]));
        } else {
            this._imageRate.node.active = (false);
        }
        this._goldNum.string = (money.toString());
        this._userName.string = (data.getUser_name());
        if (state == GuildConst.GUILD_RED_PACKET_NO_SEND) {
            var bgRes = config.show == 1 && 'img_lit_hongbao_01' || 'img_lit_hongbao_01_2';
            // this.addComponent(cc.Sprite);
            // let img = this.getComponent(cc.Sprite) as cc.Sprite;
            // UIHelper.loadTexture(img, Path.getGuildRes(bgRes));
            this._imageState.node.active = (true);
            UIHelper.loadTexture(this._imageRate, Path.getGuildRes(Path.getGuildRes('img_lit_hongbao_01c')));
            this._textState.node.active = (true);
            this._textState.string = (Lang.get('guild_red_packet_btn_not_send'));
            this._textSee.node.active = (false);
        }
        else if (state == GuildConst.GUILD_RED_PACKET_NO_RECEIVE) {
            var bgRes = config.show == 1 && "img_lit_hongbao_01" || "img_lit_hongbao_01b_2"
            // this.addComponent(cc.Sprite);
            // let img = this.getComponent(cc.Sprite) as cc.Sprite;
            // UIHelper.loadTexture(img, Path.getGuildRes(bgRes));
            this._imageState.node.active = (config.show == 1)
            var stateRes = "img_lit_hongbao_01b"
            UIHelper.loadTexture(this._imageState, Path.getGuildRes(stateRes));
            this._textState.node.active = (true)
            this._textState.string = (Lang.get("guild_red_packet_btn_open"))
            this._textSee.node.active = (false)
        }
        else {
            var bgRes = config.show == 1 && 'img_lit_hongbao_02' || 'img_lit_hongbao_02_2';
            // this.addComponent(cc.Sprite);
            // let img = this.getComponent(cc.Sprite) as cc.Sprite;
            // UIHelper.loadTexture(img, Path.getGuildRes(bgRes));
            this._imageState.node.active = (false);
            this._textState.node.active = (false);
            this._textSee.node.active = (true);
        }
        var outline = 1;
        UIHelper.enableOutline(this._textSee, Colors.BUTTON_TWO_NOTE_OUTLINE, outline);
        var color = config.show == 1 && Colors.DARK_BG_ONE || Colors.CLASS_WHITE;
        this._userName.node.color = (color);
        this._goldNum.node.color = (color);
        var pos = config.show == 1 && cc.v2(84, 16.4) || cc.v2(84, 25.4);
        this._userName.node.setPosition(pos);
        var pos = config.show == 1 && cc.v2(83.38, 104.2) || cc.v2(83.38, 126.2);
        this._textSee.node.setPosition(pos);
    }

    onButton(sender) {
        if (this._callback) {
            this._callback(this, this._index);
        }
    }
    setCallBack(callback) {
        this._callback = callback;
    }

}