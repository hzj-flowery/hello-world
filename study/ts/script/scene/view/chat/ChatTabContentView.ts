const {ccclass, property} = cc._decorator;

import ChatUnReadMsgNode from './ChatUnReadMsgNode'
import ViewBase from '../../ViewBase';
import { G_ConfigManager, G_UserData, G_SignalManager } from '../../../init';
import { ChatConst } from '../../../const/ChatConst';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import ChatMsgScrollView from './ChatMsgScrollView';

@ccclass
export default class ChatTabContentView extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageWaterFlow: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContent: cc.Node = null;

    @property({
        type: ChatUnReadMsgNode,
        visible: true
    })
    _nodeMsgNum: ChatUnReadMsgNode = null;

    @property({
        type: ChatMsgScrollView,
        visible: true
    })
    _chatMsgScrollView: ChatMsgScrollView = null;

    @property(cc.Prefab)
    msgItemCell:cc.Prefab = null;

    _mainView: any;
    _channelId: number;
    //_chatMsgScrollView: ChatMsgScrollView;
    _isFirstEnter: boolean;
    _chatUnReadMsgNode: ChatUnReadMsgNode;
    _signalChatGetMessage: any;
    _signalChatUnReadMsgNumChange: any;
    _signalChatEnterChannel: any;
    _signalSystemMsgReceive: any;


    ctor(mainView, channelId) {
        this._mainView = mainView;
        this._channelId = channelId;
        this._isFirstEnter = true;
    }
    onCreate() {
        var msgContainerSize = this._panelContent.getContentSize();
       // var node = new cc.Node();
       // this._chatMsgScrollView = node.addComponent(ChatMsgScrollView);
        //this._panelContent.addChild(this._chatMsgScrollView.node);
        this._chatMsgScrollView.ctor(this, msgContainerSize, this._channelId, ChatConst.MAX_MSG_CACHE_NUM[this._channelId-1], {}, this._getTemplate());
        this._chatUnReadMsgNode = this._nodeMsgNum;
        this._chatUnReadMsgNode.ctor(this._chatMsgScrollView);
        if (G_ConfigManager.isDalanVersion()) {
            this._imageWaterFlow.node.active = (false);
        }
    }
    onEnter() {
        this._signalChatGetMessage = G_SignalManager.add(SignalConst.EVENT_CHAT_GET_MESSAGE, handler(this, this._onEventGetMsg));
        this._signalChatUnReadMsgNumChange = G_SignalManager.add(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE, handler(this, this._onEventChatUnReadMsgNumChange));
        this._signalChatEnterChannel = G_SignalManager.add(SignalConst.EVENT_CHAT_ENTER_CHANNEL, handler(this, this._onEventChatEnterChannel));
        this._signalSystemMsgReceive = G_SignalManager.add(SignalConst.EVENT_SYSTEM_MSG_RECEIVE, handler(this, this._onEventGetMsg));
        var msgList = G_UserData.getChat().getMsgListByChannel(this._channelId);
        this._chatMsgScrollView.refreshData(msgList);
        this._refreshAcceptMsgNum();
    }
    onExit() {
        this._signalChatGetMessage.remove();
        this._signalChatGetMessage = null;
        this._signalChatUnReadMsgNumChange.remove();
        this._signalChatUnReadMsgNumChange = null;
        this._signalChatEnterChannel.remove();
        this._signalChatEnterChannel = null;
        this._signalSystemMsgReceive.remove();
        this._signalSystemMsgReceive = null;
    }
    _onEventGetMsg(event, chatUnit) {
        if (this._canShowChatMsg(chatUnit)) {
            this._chatMsgScrollView.addNewMsg(chatUnit, this._mainView.getCurrChannel() == this._channelId);
            this._refreshAcceptMsgNum();
        }
    }
    _canShowChatMsg(chatUnit) {
        return chatUnit.getChannel() == this._channelId || this._channelId == ChatConst.CHANNEL_ALL && chatUnit.getChannel() != ChatConst.CHANNEL_PRIVATE;
    }
    _onEventChatUnReadMsgNumChange(event) {
        this._refreshAcceptMsgNum();
    }
    _onEventChatEnterChannel(event, channelId) {
        if (this._channelId == channelId) {
            if (this._isFirstEnter) {
                this._isFirstEnter = false;
                this._chatMsgScrollView.readAllMsg();
            } else {
                this._chatMsgScrollView.readAllMsg();
            }
        }
        this._chatMsgScrollView.setChannelVisible(this._channelId == channelId);
    }
    _getTemplate() {
        // var ChatMsgItemCell = require('ChatMsgItemCell');
        // return ChatMsgItemCell;
        return this.msgItemCell;
    }
    _refreshAcceptMsgNum() {
        var msgList = this._chatMsgScrollView.getChatMsgList();
        var unReadNum = G_UserData.getChat().getUnReadMsgNum(msgList);
        this._chatUnReadMsgNode.refreshAcceptMsgNum(unReadNum);
    }

}
