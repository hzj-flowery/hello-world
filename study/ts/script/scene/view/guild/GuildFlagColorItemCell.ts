import ListViewCellBase from "../../../ui/ListViewCellBase";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildFlagColorItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageColor: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelect: cc.Sprite = null;


    setIndex(index: number) {
        this._index = index;
    }


    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(index: number) {
        this._imageSelect.node.active = (false);
        UIHelper.loadTexture(this._imageColor, Path.getGuildFlagImage(index))
    }
    setSelect(select: boolean) {
        this._imageSelect.node.active = (select);
    }
    onButton(sender) {
        // var offsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        // var offsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        // if (offsetX < 20 && offsetY < 20) {
        this.dispatchCustomCallback(this._index);
        // }
    }

}