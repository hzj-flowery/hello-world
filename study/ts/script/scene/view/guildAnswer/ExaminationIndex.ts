import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExaminationIndex extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLight: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGray: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageWrong: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRight: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _num: cc.Label = null;
    _index: any;

    initData(index) {
        this._index = index;
    }
    onCreate() {
        this._num.string = ((this._index).toString());
    }
    updateUI(curIndex, isRight, isAnswer) {
        if (curIndex > this._index && isAnswer) {
            this._imageGray.node.active = (false);
            this._imageLight.node.active = (true);
            this._num.node.active = (false);
            if (isRight) {
                this._imageRight.node.active = (true);
                this._imageWrong.node.active = (false);
            } else {
                this._imageRight.node.active = (false);
                this._imageWrong.node.active = (true);
            }
        } else if (curIndex == this._index) {
            this._imageGray.node.active = (false);
            this._imageLight.node.active = (true);
            this._imageRight.node.active = (false);
            this._imageWrong.node.active = (false);
            this._num.node.active = (true);
            this._num.node.color = (new cc.Color(255, 122, 22));
            UIHelper.enableOutline(this._num, new cc.Color(255, 243, 219), 2);
        } else {
            this._imageGray.node.active = (true);
            this._imageLight.node.active = (false);
            this._imageRight.node.active = (false);
            this._imageWrong.node.active = (false);
            this._num.node.active = (true);
            this._num.node.color = (new cc.Color(158, 135, 118));
            UIHelper.enableOutline(this._num, new cc.Color(237, 234, 229), 2);
        }
    }
    onEnter() {
    }
    onExit() {
    }

}