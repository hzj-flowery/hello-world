import { handler } from "../../utils/handler";
import UIHelper from "../../utils/UIHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonVoiceButton extends cc.Component {

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

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;

    _timerHandle: any;
    _inRecordVoice: boolean;
    _isInBtnRange: boolean;
    _isChatVoiceViewInCentre: boolean;
    _voiceNode: any;
    _btnTouchListener: any;
    _getChatObjectFuncfunc: any;
    _chatObject: any;


    ctor() {
        this._inRecordVoice = false;
        this._isInBtnRange = false;
        //this._maxRecordTime = G_VoiceManager.MAX_RECORD_TIME;
        this._timerHandle = null;
        this._isChatVoiceViewInCentre = false;
    }
    onLoad() {
        this.ctor();
        UIHelper.addClickEventListenerEx(this.node, handler(this, this._onPanelTouched));
    }
    _isTouchInBtn(node:cc.Node, point) {
        var pos = node.convertToNodeSpace(cc.v2(point));
        var size = node.getContentSize();
        var rect = new cc.Rect(0, 0, size.width, size.height);
        if(!rect.contains(pos)){
            return false;
        }
        return true;
    }
    _onPanelTouched(event:cc.Event, data) {
        var sender = event.target;
        if (event.type == cc.Node.EventType.TOUCH_START) {
            return this._startRecordVoice();
        } else if (event.type == cc.Node.EventType.TOUCH_MOVE) {
            var point = sender.getTouchMovePosition();
            this._isInBtnRange = this._isTouchInBtn(sender, point);
            if (this._voiceNode) {
                this._voiceNode.refreshState(this._isInBtnRange);
            }
        } else if (event.type == cc.Node.EventType.TOUCH_END) {
            var point = sender.getTouchEndPosition();
            if (this._isTouchInBtn(sender, point)) {
                this._finishRecordVoice();
            } else {
                this.cancelRecordVoice();
            }
        } else if (event.type == cc.Node.EventType.TOUCH_CANCEL) {
            this.cancelRecordVoice();
        }
    }
    _refreshRecordBtnState(isPress) {
        if (this._btnTouchListener) {
            this._btnTouchListener(this.node, isPress);
        }
    }
    _showRecordVoiceNode() {
        if (this._voiceNode) {
            this._voiceNode.destro();
            this._voiceNode = null;
        }
        // var voiceNode = new ChatVoiceView();
        // voiceNode.setName('ChatVoiceView');
        // if (this._isChatVoiceViewInCentre) {
        //     voiceNode.setImgRootXPos(G_ResolutionManager.getDesignWidth() / 2);
        // }
        // G_SceneManager.getRunningScene().addChildToVoiceLayer(voiceNode);
        // this._voiceNode = voiceNode;
    }
    showChatVoiceViewInCentre() {
        this._isChatVoiceViewInCentre = true;
    }
    _hideRecordVoiceNode() {
        if (this._voiceNode) {
            this._voiceNode.destroy();
            this._voiceNode = null;
        }
    }
    _stastRecordVoice() {
        // var chatObject = this._chatObject;
        // if (this._getChatObjectFuncfunc) {
        //     chatObject = this._getChatObjectFuncfunc();
        // }
        // var sendMsgChannel = chatObject.getChannel();
        // if (!LogicCheckHelper.chatMsgSendCheck(sendMsgChannel, true)) {
        //     return false;
        // }
        // var success = G_VoiceManager.startRecordVoice(chatObject);
        // if (!success) {
        //     return false;
        // }
        // this._inRecordVoice = true;
        // this._isInBtnRange = true;
        // this._refreshRecordBtnState(true);
        // this._showRecordVoiceNode();
        // this._startTimer();
        return true;
    }
    _finishRecordVoice() {
        if (!this._inRecordVoice) {
            return;
        }
        this._inRecordVoice = false;
        this._isInBtnRange = false;
        this._refreshRecordBtnState(false);
        this._hideRecordVoiceNode();
        this._endTimer();
        //G_VoiceManager.finishRecordVoice();
    }
    cancelRecordVoice() {
        if (!this._inRecordVoice) {
            return;
        }
        this._inRecordVoice = false;
        this._isInBtnRange = false;
        this._refreshRecordBtnState(false);
        this._hideRecordVoiceNode();
        this._endTimer();
       // G_VoiceManager.cancelRecordVoice();
    }
    updateInfo(chatObject, btnTouchListener) {
        this._chatObject = chatObject;
        this._btnTouchListener = btnTouchListener;
    }
    setGetChatObjectFunc(func) {
        this._getChatObjectFuncfunc = func;
    }
    _startTimer() {
        this._endTimer();
        // this._timerHandle = scheduler.performWithDelayGlobal(function () {
        //     this.forceFinishRecord();
        // }, this._maxRecordTime);
    }
    _endTimer() {
        // if (this._timerHandle) {
        //     scheduler.unscheduleGlobal(this._timerHandle);
        //     this._timerHandle = null;
        // }
    }
    forceFinishRecord() {
        if (this._inRecordVoice) {
            if (this._isInBtnRange) {
                this._finishRecordVoice();
            } else {
                this.cancelRecordVoice();
            }
        }
    }
    isInRecordVoice() {
        return this._inRecordVoice;
    }

}
