import ListViewCellBase from "../../../ui/ListViewCellBase";
import { CakeActivityDataHelper } from "../../../utils/data/CakeActivityDataHelper";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { TextHelper } from "../../../utils/TextHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CakeRankPlayerCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textServerName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textScore: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    onCreate() {
        var size = this._panelBg.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._imageArrow.sizeMode = cc.Sprite.SizeMode.RAW;
    }
    updateUI(data) {
        this._textRank.string = (data.getRank());
        var serverName =  TextHelper.cutText(data.getServer_name(), 5);
        this._textServerName.string = (serverName);
        this._textName.string = (data.getName());
        this._textScore.string = (data.getPoint());
        UIHelper.loadTexture(this._imageArrow, Path.getUICommon(data.getChangeResName()))
    }

}