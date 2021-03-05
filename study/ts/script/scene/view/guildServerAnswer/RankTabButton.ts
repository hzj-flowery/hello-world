import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RankTabButton extends cc.Component {
    public static readonly COLOR_SELECT = new cc.Color(255, 180, 106);
    public static readonly COLOR_NORMAL = new cc.Color(169, 106, 42);

    @property({
        type: cc.Button,
        visible: true
    })
    _button: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text: cc.Label = null;

    addClickEventListenerEx(callback) {
        // this._button.addClickEventListenerEx(callback, true, null, 0);
        var click_event = new cc.Component.EventHandler;
       click_event.target = this._button.node;
       click_event.handler = callback;
       this._button.clickEvents.push(click_event);
    }
    setString(text) {
        this._text.string = (text);
    }
    setSelected(isSelected) {
        if (isSelected) {
            UIHelper.loadBtnTexture(this._button, Path.getAnswerImg('img_server_answer_01a'), Path.getAnswerImg('img_server_answer_01a'), Path.getAnswerImg('img_server_answer_01a'))
            this._text.node.color = (RankTabButton.COLOR_SELECT);
        } else {
            UIHelper.loadBtnTexture(this._button, Path.getAnswerImg('img_server_answer_01b'), Path.getAnswerImg('img_server_answer_01b'), Path.getAnswerImg('img_server_answer_01b'))
            this._text.node.color = (RankTabButton.COLOR_NORMAL);
        }
    }
}