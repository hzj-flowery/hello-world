import { Path } from "../../utils/Path";
import CommonUI from "./CommonUI";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonGogok extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image3: cc.Sprite = null;
    _showSize: number;
    _size: number;

    onLoad() {
        this._showSize = 3;
        this._size = 3;
    }

    resetSize(size) {
        for (var i = this._size + 1; i <= size; i++) {
            var img = UIHelper.newSprite(Path.getLimitImg('img_limit_05b'));
            this.node.addChild(img.node);
            img.node.setPosition(cc.v2(0, 0));
            this['_image' + i] = img;
        }
        this._showSize = size;
        this._size = Math.max(this._size, this._showSize);
        var offset = 50;
        var width = (size - 1) * offset;
        for (var i = 1; i <= size; i++) {
            var posX = (i - (size + 1) / 2) * offset;
            this['_image' + i].node.x = (posX);
            this['_image' + i].node.active = (true);
        }
        for ( i = size + 1; i <= this._size; i++) {
            this['_image' + i].node.active = (false);
        }
    }

    setCount(count): void {
        for (var i = 1; i <= this._showSize; i++) {
            if (i <= count) {
                (this['_image' + i] as cc.Sprite).addComponent(CommonUI).loadTexture(Path.getLimitImg('img_limit_05'));
            } else {
                (this['_image' + i] as cc.Sprite).addComponent(CommonUI).loadTexture(Path.getLimitImg('img_limit_05b'));
            }
        }
    }

}