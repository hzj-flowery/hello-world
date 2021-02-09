const { ccclass, property } = cc._decorator;

import { Lang } from '../../../lang/Lang';
import { assert } from '../../../utils/GlobleFunc';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import CommonIconTemplateWithBg from '../../../ui/component/CommonIconTemplateWithBg';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';

@ccclass
export default class EventAnswerCell extends cc.Component {

    static INDEX_CHAR_MAP = ["A", "B", "C", "D"];

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageHighLight: cc.Sprite = null;

    @property({
        type: CommonIconTemplateWithBg,
        visible: true
    })
    _imageHero: CommonIconTemplateWithBg = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textAnswer: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRight: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageWrong: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnAnswer: CommonButtonLevel1Highlight = null;

    private _index;
    private _answerId;
    private _answerPicId;
    private _description;
    private _callback;

    setUp(answerData, index, callback) {
        this._index = index;
        this._answerId = answerData['answer' + (index + '_id')];
        this._answerPicId = answerData['answer' + (index + '_picture')];
        this._description = answerData['answer' + (index + '_description')];
        this._callback = callback;
      //assert((this._callback, 'call back should not be nil!!');
        this.node.name = 'EventAnswerCell' + this._index;

        this._imageHighLight.node.active = false;
        this._imageRight.node.active = false;
        this._imageWrong.node.active = false;
        this._textAnswer.string = this._description;
        this._btnAnswer.setString(Lang.get('explore_answer_btn_name', { index: EventAnswerCell.INDEX_CHAR_MAP[this._index - 1] }));
        this._setAnswerImage();
    }
    _setAnswerImage() {
        this._imageHero.initUI(TypeConvertHelper.TYPE_HERO, this._answerPicId, null);
        this._imageHero.setImageTemplateVisible(true);
    }
    public onBtnAnswerClick() {
        console.log('onBtnAnswerClick ', this._index);
        this._callback(this._index);
    }
    //设置是否正确
    setRight(isRight) {
        this._imageRight.node.active = isRight;
        this._imageWrong.node.active = !isRight;
    }
    disableAnswer() {
        this._btnAnswer.setEnabled(false);
    }

}