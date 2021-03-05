import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";
import CommonCheckBoxAnymoreHint from "../../../ui/component/CommonCheckBoxAnymoreHint";
import ViewBase from "../../ViewBase";
import PopupBase from "../../../ui/PopupBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestSuper extends PopupBase{
    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDownTitle: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDown: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBuyNum: cc.Label = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnBuy: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon1: CommonIconTemplate = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon2: CommonIconTemplate = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon3: CommonIconTemplate = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon4: CommonIconTemplate = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon5: CommonIconTemplate = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    icon6: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRate: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCost: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgYuan: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgTitle: cc.Sprite = null;

    @property({
        type: CommonCheckBoxAnymoreHint,
        visible: true
    })
    _commonCheckBoxAnymoreHint: CommonCheckBoxAnymoreHint = null;

    onCreate(){};

    onEnter(){};
    onExit(){};
}