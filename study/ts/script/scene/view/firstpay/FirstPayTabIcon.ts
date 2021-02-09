import CommonTabIcon from "../../../ui/component/CommonTabIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FirstPayTabIcon extends CommonTabIcon {

    @property({
        type: cc.SpriteFrame
    }) openFrame: cc.SpriteFrame = null;

    @property({
        type: cc.SpriteFrame
    }) closeFrame: cc.SpriteFrame = null;

    updateUI(txt, isOpen, index) {
        this._isOpen = isOpen;
        this._index = index;
        var res = isOpen ? this.openFrame : this.closeFrame;
        var color = isOpen ? cc.color(180, 30, 0) : cc.color(229, 74, 72);
        this._imageBg.spriteFrame = res;
        this._text.string = (txt);
        this._text.node.color = (color);
    }

    setSelected(selected) {
        if (!this._isOpen) {
            return;
        }
        var res = selected ? this.openFrame : this.closeFrame;
        var color = selected ? cc.color(180, 30, 0) : cc.color(229, 74, 72);
        this._imageBg.spriteFrame = res;
        this._text.node.color = (color);
    }
}
