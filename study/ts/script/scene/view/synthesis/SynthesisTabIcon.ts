import ListViewCellBase from "../../../ui/ListViewCellBase";
import RecoveryTableItem from "../recovery/RecoveryTableItem";
import { Lang } from "../../../lang/Lang";
const { ccclass, property } = cc._decorator;

@ccclass
export default class SynthesisTabIcon extends RecoveryTableItem {

    showRedPoint(bShow) {
        this._nodeTabIcon.showRedPoint(bShow);
    }
    setSelected(bSelect) {
        this._nodeTabIcon.setSelected(bSelect);
    }
    updateUI(index, value, lastIndex) {
        this._resourcePanel.active = (true);
        this._imageTop.node.active = (index == 1);
        this._imageBottom.node.active = (index == lastIndex);
        this._imageLink.node.active = (!(index == lastIndex));
        // var size = this._resourcePanel.getContentSize();
        // if (index == 1) {
        //     size.height = this._imageTop.node.y;
        // }
        // if (index == lastIndex) {
        //     this._resourcePanel.y = (Math.abs(this._imageBottom.node.y));
        //     this.node.setContentSize(size.width, size.height + Math.abs(this._imageBottom.node.y));
        // } else {
        //     this._resourcePanel.y = (Math.abs(this._imageLink.node.y) - 6);
        //     this.node.setContentSize(size.width, size.height + Math.abs(this._imageLink.node.y) - 6);
        // }
        var clickItem = function (value) {
            if (this._clickCallBack) {
                this._clickCallBack(value);
            }
        }.bind(this)
        var txt = Lang.get('synthesis_type' + value);
        var isOpen = true;
        this._nodeTabIcon.updateUI(txt, isOpen, value);
        this._nodeTabIcon.setCallback(clickItem);
    }
}