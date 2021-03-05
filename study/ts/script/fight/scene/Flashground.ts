import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";

export default class Flashground extends cc.Component {

    private _drawNode: cc.Node;

    public init() {
        this._drawNode = UIHelper.newSprite(Path.getUICommon("img_com_line01")).node;
        this.node.addChild(this._drawNode);
        this._drawNode.opacity = 0;
    }

    public setFlashColor(r, g, b, a) {
        if (a > 0) {
            this._drawNode.color = new cc.Color(r, g, b);
            this._drawNode.opacity = a;
        }
    }

    public clear() {
        this._drawNode.opacity = 0;
    }

    public setFlashPosition() {
    }

    public getFlashPosition() {
        return [
            0,
            0
        ];
    }

    public setFlashScale() {
    }
}