import UIHelper from "../../../utils/UIHelper";
import { handler } from "../../../utils/handler";
import { ChatConst } from "../../../const/ChatConst";
import { Lang } from "../../../lang/Lang";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatUnReadMsgNode extends cc.Component {

    @property({
        type:cc.Node,
        visible:true
    })
    _imageUnReadMsgNum:cc.Node = null;

    @property({
        type:cc.Label,
        visible:true
    })
    _textUnReadMsgNum:cc.Label = null;

    _chatMsgScrollView: any;

    ctor(chatMsgScrollView) {
        this._chatMsgScrollView = chatMsgScrollView;
        UIHelper.addClickEventListenerEx(this._imageUnReadMsgNum, handler(this, this._onClickUnReadMsgView));
        this.setVisible(false);
    }
    _onClickUnReadMsgView(sender) {
        this._chatMsgScrollView.readAllMsg();
    }
    setVisible(visible) {
        this.node.active = (visible);
        //this._imageUnReadMsgNum.setTouchEnabled(visible);
    }
    refreshAcceptMsgNum(unReadNum:number) {
        if (unReadNum <= 0) {
            this._fadeMsgNumView();
            return;
        }
        this._showMsgNumView();
        var maxNum = ChatConst.UNREAD_MSG_MAX_SHOW_NUM;
        var str = Lang.get('chat_accept_msg_num', { num: unReadNum > maxNum && (maxNum) + '+' || (unReadNum).toString() });
        this._textUnReadMsgNum.string = (str);
    }
    _fadeMsgNumView() {
        var action1 = cc.fadeOut(0.2);
        var action2 = cc.callFunc(function (actionNode) {
            this.setVisible(false);
        }, this);
        var action = cc.sequence(action1, action2);
        this._imageUnReadMsgNum.stopAllActions();
        this._imageUnReadMsgNum.runAction(action);
    }
    _showMsgNumView() {
        this.setVisible(true);
        this._imageUnReadMsgNum.stopAllActions();
        this._imageUnReadMsgNum.opacity = (255);
    }

}
