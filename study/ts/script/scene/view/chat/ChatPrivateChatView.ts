const {ccclass, property} = cc._decorator;

import ChatUnReadMsgNode from './ChatUnReadMsgNode'
import ViewBase from '../../ViewBase';
import UIHelper from '../../../utils/UIHelper';
import ChatMsgScrollView from './ChatMsgScrollView';
import { ChatConst } from '../../../const/ChatConst';
import { G_ConfigManager, G_SignalManager, G_UserData, Colors } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { table } from '../../../utils/table';
import { Lang } from '../../../lang/Lang';
import { RichTextExtend } from '../../../extends/RichTextExtend';

@ccclass
export default class ChatPrivateChatView extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageWaterFlow: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTrim: cc.Node = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listItemSource: CommonCustomListViewEx = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePrivateChatMsg: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _imageTopBarShade: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeClear: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClear: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeReturn: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonReturn: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _textPrivateMsgTitle: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textEmptyListHint: cc.Label = null;

    @property({
        type: ChatUnReadMsgNode,
        visible: true
    })
    _nodeMsgNum: ChatUnReadMsgNode = null;

    @property({
        type:ChatMsgScrollView,
        visible:true
    })
    _chatMsgScrollView:ChatMsgScrollView = null;

    @property(cc.Prefab)
    ChatMsgItemCell:cc.Prefab = null;

    @property(cc.Prefab)
    ChatPrivateMsgItemCell:cc.Prefab = null;

    
    _mainView: any;
    _channelId: any;
    _isInList: boolean;
    _currChatPlayerData: any;
    _listDatas: any[];
    _signalChatGetMultiusersInfo: any;
    _signalChatGetMessage: any;
    _signalMemberChangeMessage: any;
    _signalChatUnReadMsgNumChange: any;
    _signalChatEnterChannel: any;
    _signalChatMsgListGet: any;
    _signalLoginSuccess: any;



    ctor(mainView, channelId) {
        this._mainView = mainView;
        this._channelId = channelId;
        this._isInList = true;
        this._currChatPlayerData = null;
        this._listDatas = [];
        UIHelper.addEventListener(this.node, this._buttonReturn, 'ChatPrivateChatView', '_onClickNavigate');
        UIHelper.addEventListener(this.node, this._buttonClear, 'ChatPrivateChatView', '_onClickNavigate');
    }
    onCreate() {
        this._initListView(this._listItemSource);
        var msgContainerSize = this._panelTrim.getContentSize();
        this._chatMsgScrollView.ctor(this, msgContainerSize, this._channelId, ChatConst.MAX_MSG_CACHE_NUM[this._channelId], {}, this._getTemplate());
        this._chatMsgScrollView.node.active = (false);
        //this._chatUnReadMsgNode = new ChatUnReadMsgNode(this._nodeMsgNum, this._chatMsgScrollView);
        if (G_ConfigManager.isDalanVersion()) {
            this._imageWaterFlow.node.active = (false);
        }
    }
    onEnter() {
        this._signalChatGetMultiusersInfo = G_SignalManager.add(SignalConst.EVENT_CHAT_GETNULTIUSERSINFO, handler(this, this._onEventChatObjectsInfo));
        this._signalChatGetMessage = G_SignalManager.add(SignalConst.EVENT_CHAT_GET_MESSAGE, handler(this, this._onEventGetMsg));
        this._signalMemberChangeMessage = G_SignalManager.add(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE, handler(this, this._onEventMemberChange));
        this._signalChatUnReadMsgNumChange = G_SignalManager.add(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE, handler(this, this._onEventChatUnReadMsgNumChange));
        this._signalChatEnterChannel = G_SignalManager.add(SignalConst.EVENT_CHAT_ENTER_CHANNEL, handler(this, this._onEventChatEnterChannel));
        this._signalChatMsgListGet = G_SignalManager.add(SignalConst.EVENT_CHAT_MSG_LIST_GET, handler(this, this._onEventChatMsgListGet));
        this._signalLoginSuccess = G_SignalManager.add(SignalConst.EVENT_LOGIN_SUCCESS, handler(this, this._onEventLoginSuccess));
        if (this._isInList) {
            this._showPersonList();
            this.refreshListData();
        } else {
            this._refreshPrivateChatWithPlayer(this._currChatPlayerData);
        }
    }
    onExit() {
        this._signalChatGetMultiusersInfo.remove();
        this._signalChatGetMultiusersInfo = null;
        this._signalChatGetMessage.remove();
        this._signalChatGetMessage = null;
        this._signalMemberChangeMessage.remove();
        this._signalMemberChangeMessage = null;
        this._signalChatUnReadMsgNumChange.remove();
        this._signalChatUnReadMsgNumChange = null;
        this._signalChatEnterChannel.remove();
        this._signalChatEnterChannel = null;
        this._signalChatMsgListGet.remove();
        this._signalChatMsgListGet = null;
        this._signalLoginSuccess.remove();
        this._signalLoginSuccess = null;
    }
    _onEventLoginSuccess() {
        var playerData = this.getNeedCacheChatPlayerData();
        if (playerData) {
            G_UserData.getChat().c2SChatGetMsg(playerData.getId());
        }
    }
    isCanSendMsg() {
        return !this._isInList;
    }
    getCurrChatPlayerData() {
        return this._currChatPlayerData;
    }
    getNeedCacheChatPlayerData() {
        if (this._isInList) {
            return null;
        } else {
            return this._currChatPlayerData;
        }
    }
    gotoChatWithPlayer(chatPlayerData) {
        if (!chatPlayerData) {
            return;
        }
        var isGet = G_UserData.getChat().isGetPrivateMsgWithPlayer(chatPlayerData.getId());
        if (isGet) {
            this._refreshPrivateChatWithPlayer(chatPlayerData);
        } else {
            G_UserData.getChat().c2SChatGetMsg(chatPlayerData.getId());
        }
    }
    _refreshPrivateChatWithPlayer(chatPlayerData, isFirstEnter?) {
        if (!chatPlayerData) {
            return;
        }
        isFirstEnter = isFirstEnter || false;
        if (!this._currChatPlayerData || this._currChatPlayerData.getId() != chatPlayerData.getId()) {
            isFirstEnter = true;
        }
        this._currChatPlayerData = chatPlayerData;
        this._showChatDetailMsg();
        var privateMsgList = G_UserData.getChat().getPrivateMsgListWithPlayerId(this._currChatPlayerData.getId());
        this._chatMsgScrollView.refreshData(privateMsgList, isFirstEnter);
        this._chatMsgScrollView.readMsgsInScreen();
        this._chatMsgScrollView.setChannelVisible(true);
    }
    _onClickNavigate(sender) {
        if (this._isInList) {
            G_UserData.getChat().clearAllPrivateChatMsg();
        } else {
            this._showPersonList();
            this.refreshListData();
        }
    }
    _onClickUnReadMsgView(sender) {
        this._chatMsgScrollView.readAllMsg();
    }
    _onEventChatObjectsInfo(event, message) {
        G_UserData.getChat().setPrivateObjectInfo((message['infos']));
        this._refreshListView(this._listItemSource, this._listDatas);
        this._textEmptyListHint.node.active = (false);
    }
    _onEventGetMsg(event, chatUnit) {
        if (chatUnit.getChannel() == ChatConst.CHANNEL_PRIVATE) {
            if (this._isInList) {
                var index = this._seekIndexByChatMsgChat(chatUnit);
                if (index) {
                    this._refreshItemNodeByIndex(index, chatUnit);
                } else {
                    this.refreshListData();
                }
            } else {
                if (this._currChatPlayerData && this._currChatPlayerData.getId() == chatUnit.getChatObjectId()) {
                    this._chatMsgScrollView.addNewMsg(chatUnit, this._mainView.getCurrChannel() == this._channelId);
                }
            }
        }
    }
    _onEventChatUnReadMsgNumChange(event) {
        if (!this._isInList) {
            this._refreshAcceptMsgNum();
        }
    }
    _onEventMemberChange(event) {
        this.refreshListData();
    }
    _onEventChatEnterChannel(event, channelId) {
        var channelVisible = this._channelId == channelId && !this._isInList;
        if (channelVisible) {
            this._chatMsgScrollView.readAllMsg();
        }
        this._chatMsgScrollView.setChannelVisible(channelVisible);
    }
    _onEventChatMsgListGet(event, chatPlayerData) {
        if (chatPlayerData) {
            this._refreshPrivateChatWithPlayer(chatPlayerData, true);
        }
    }
    _getTemplate() {
        return this.ChatMsgItemCell;
    }
    _initListView(listView:CommonCustomListViewEx) {
        listView.setTemplate(this.ChatPrivateMsgItemCell);
        listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
        listView.setCustomCallback(handler(this, this._onItemTouch));
    }
    _refreshListView(listView:CommonCustomListViewEx, itemList) {
        var lineCount = itemList.length;
        //logWarn('ChatPrivateChatView:line  ' + lineCount);
        listView.clearAll();
        listView.resize(lineCount);
    }
    _getListDatas() {
        return this._listDatas;
    }
    _seekIndexByChatMsgChat(chatUnit) {
        for (let k in this._listDatas) {
            var v = this._listDatas[k];
            if (v.getChatObjectId() == chatUnit.getChatObjectId()) {
                return parseInt(k)+1;
            }
        }
        return null;
    }
    _refreshItemNodeByIndex(index, chatUnit) {
        var itemNode = this._findItemNodeByIndex(index);
        if (itemNode) {
            this._listDatas[index-1] = chatUnit;
            itemNode.updateInfo(chatUnit);
        }
    }
    _findItemNodeByIndex(index) {
        var lineIndex = index;
        var items = this._listItemSource.getItems();
        if (!items) {
            return null;
        }
        var itemCellNode = null;
        for (let k in items) {
            var v = items[k];
            if (v.getTag() + 1 == lineIndex) {
                itemCellNode = v;
                break;
            }
        }
        return itemCellNode;
    }
    _onItemUpdate(item, index) {
        //logWarn('ChatPrivateChatView:_onItemUpdate  ' + (index + 1));
        var itemList = this._getListDatas();
        var data = itemList[index];
        if (data) {
            item.updateInfo(data);
        }
    }
    _onItemSelected(item, itemPos) {
        //logWarn('ChatPrivateChatView:_onItemSelected ' + (itemPos + 1));
    }
    _onItemTouch(index, itemPos) {
        //logWarn('ChatPrivateChatView:_onItemTouch ' + (tostring(index) + (' ' + tostring(itemPos + 1))));
        var chatMsgData = this._listDatas[itemPos];
        if (!chatMsgData) {
            return;
        }
        var currChatPlayerData = chatMsgData.getChatObject();
        this.gotoChatWithPlayer(currChatPlayerData);
    }
    refreshListData() {
        this._listDatas = G_UserData.getChat().getPrivateChatLastestMsgList();
        var chatObjectList = [];
        for (var index = 1; index<=this._listDatas.length; index++) {
            var chatTargetId = this._listDatas[index-1].getChatObjectId();
            table.insert(chatObjectList, chatTargetId);
        }
        if (chatObjectList && chatObjectList.length > 0) {
            G_UserData.getChat().c2sGetMultiUserBaseInfo(chatObjectList);
        } else {
            this._refreshListView(this._listItemSource, this._listDatas);
            this._textEmptyListHint.node.active = (false);
        }
    }
    _showPersonList() {
        this._isInList = true;
        this._listItemSource.setVisible(true);
        this._chatMsgScrollView.node.active = (false);
        //this._chatUnReadMsgNode.setVisible(false);
        this._textPrivateMsgTitle.active = (false);
        this._nodeReturn.active = (false);
        this._nodeClear.active = (true);
        if (this._mainView) {
            this._mainView.showHintNode(this._channelId, true);
        }
    }
    _showChatDetailMsg() {
        if (this._mainView) {
            this._mainView.showHintNode(this._channelId, false);
        }
        this._isInList = false;
        this._listItemSource.setVisible(false);
        this._chatMsgScrollView.node.active = (true);
        //this._chatUnReadMsgNode.setVisible(false);
        this._textPrivateMsgTitle.active = (true);
        this._textEmptyListHint.node.active = (false);
        var targetPlayerName = this._currChatPlayerData.getName();
        this._nodeReturn.active = (true);
        this._nodeClear.active = (false);
        this._textPrivateMsgTitle.removeAllChildren();
        var officialLevel = this._currChatPlayerData.getOffice_level();
        var targetPlayerNameColor = Colors.getOfficialColor(officialLevel);
        var outColor = Colors.colorToNumber(targetPlayerNameColor);
        // logError(Lang.get('chat_private_chat_title', {
        //     name: targetPlayerName,
        //     color: targetPlayerNameColor
        // }));
        var outlineColor = Colors.getOfficialColorOutlineEx(officialLevel);
        var richText = RichTextExtend.createWithContent(Lang.get('chat_private_chat_title', {
            name: targetPlayerName,
            color: outColor
        }));
        if (outlineColor) {
            richText = RichTextExtend.createWithContent(Lang.get('chat_private_chat_title2', {
                name: targetPlayerName,
                color: outColor,
                outlineColor: Colors.colorToNumber(outlineColor)
            }));
        }
        richText.node.setAnchorPoint(cc.v2(0, 0.5));
        this._textPrivateMsgTitle.addChild(richText.node);
        this._refreshAcceptMsgNum();
    }
    _refreshAcceptMsgNum() {
        var playerId = this._currChatPlayerData && this._currChatPlayerData.getId() || 0;
        var unReadNum = G_UserData.getChat().geUnReadMsgNumWithObject(playerId);
        //this._chatUnReadMsgNode.refreshAcceptMsgNum(unReadNum);
    }

}
