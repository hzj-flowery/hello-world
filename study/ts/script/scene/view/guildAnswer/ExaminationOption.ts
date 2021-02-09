import ViewBase from "../../ViewBase";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExaminationOption extends ViewBase {

    @property({
        type: cc.Button,
        visible: true
    })
    _btnSelect: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _optionABCD: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _optionText: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelect: cc.Sprite = null;

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
    _index: any;
    _selectOptionCallback: any;

    initData(index, selectOptionCallback) {
        this._index = index;
        this._selectOptionCallback = selectOptionCallback;
    }
    onCreate() {
        var abcd = [
            'A.',
            'B.',
            'C.',
            'D.'
        ];
        this._optionABCD.string = (abcd[this._index - 1]);
    }
    onEnter() {
    }
    onExit() {
    }
    onBtnSelect() {
        if (this._selectOptionCallback) {
            this._selectOptionCallback(this._index);
        }
    }
    updateUI(string, isNeedShowRight, isSelect, isRight,isNeedShowWrong?) {
        this._optionText.string = (string);
        this._imageSelect.node.active = (isSelect);
        if (isSelect) {
            UIHelper.loadTexture(this._btnSelect.node.getComponent(cc.Sprite), Path.getCommonImage('img_com_board04c'));
        } else {
            UIHelper.loadTexture(this._btnSelect.node.getComponent(cc.Sprite), Path.getCommonImage('img_com_board04'));
        }
        this._btnSelect.node.getComponent(cc.Sprite).type == cc.Sprite.Type.SLICED;
        let spriteFrame = this._btnSelect.node.getComponent(cc.Sprite).spriteFrame
        spriteFrame.insetBottom = 13;
        spriteFrame.insetLeft = 13;
        spriteFrame.insetRight = 13;
        spriteFrame.insetTop = 13;
        this._imageRight.node.active = false;
        this._imageWrong.node.active = false;
        if (isNeedShowRight) {
            this._imageRight.node.active = (isRight);
            if (isSelect && !isRight) {
                this._imageWrong.node.active = (true);
            } else {
                this._imageWrong.node.active = (false);
            }
        } else {
            this._imageRight.node.active = (false);
            this._imageWrong.node.active = (false);
        }
        if (isNeedShowWrong) {
            if (!isRight) {
                this._imageWrong.node.active = (true);
            }
        }
    }

}