import ViewBase from "../../ViewBase";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import ChatMiniMsgScrollView from "./ChatMiniMsgScrollView";
import { ChatConst } from "../../../const/ChatConst";
import { G_UserData, G_SignalManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatSystemMsgContentView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContent: cc.Node = null;
    @property({
        type: ChatMiniMsgScrollView,
        visible: true
    })
    _chatMsgScrollView: ChatMiniMsgScrollView = null;

    @property(cc.Prefab)
    ChatSystemMsgItemCell:cc.Prefab = null;
    
    _mainView: any;
    _channelId: any;
    _isFirstEnter: boolean;
    _signalSystemMsgReceive: any;
    _signalChatEnterChannel: any;


    ctor(mainView, channelId) {
        this._mainView = mainView;
        this._channelId = channelId;
        this._panelContent = null;
        this._chatMsgScrollView = null;
        this._isFirstEnter = true;
    }
    onCreate() {
        var msgContainerSize = this._panelContent.getContentSize();
        this._chatMsgScrollView.ctor(this, msgContainerSize, this._channelId, ChatConst.MAX_MSG_CACHE_NUM[this._channelId-1], {}, this._getTemplate(), 2);
        // this._chatMsgScrollView.enableScroll();
        // this._chatMsgScrollView.enableScrollToLatestMsg(false);
    }
    onEnter() {
        this._signalSystemMsgReceive = G_SignalManager.add(SignalConst.EVENT_SYSTEM_MSG_RECEIVE, handler(this, this._onEventGetMsg));
        this._signalChatEnterChannel = G_SignalManager.add(SignalConst.EVENT_CHAT_ENTER_CHANNEL, handler(this, this._onEventChatEnterChannel));
        var msgList = G_UserData.getRollNotice().getSystemMsgList();
        this._chatMsgScrollView.refreshData(msgList);
    }
    onExit() {
        this._signalSystemMsgReceive.remove();
        this._signalSystemMsgReceive = null;
        this._signalChatEnterChannel.remove();
        this._signalChatEnterChannel = null;
    }
    _onClickUnReadMsgView(sender) {
        this._chatMsgScrollView.readAllMsg();
    }
    _onEventGetMsg(event, systemMsg) {
        this._chatMsgScrollView.addNewMsg(systemMsg);
    }
    _onEventChatEnterChannel(event, channelId) {
        if (this._channelId == channelId) {
            if (this._isFirstEnter) {
                this._isFirstEnter = false;
                this._chatMsgScrollView.readAllMsg();
            }
        }
    }
    _getTemplate() {
        return this.ChatSystemMsgItemCell;
    }

}
