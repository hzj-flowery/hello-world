const { ccclass, property } = cc._decorator;

import { ChatConst } from '../../../const/ChatConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { ChatObject } from '../../../data/ChatObject';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { Colors, G_GameAgent, G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import PopupBase from '../../../ui/PopupBase';
import BlackList from '../../../utils/BlackList';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import InputUtils from '../../../utils/InputUtils';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import { RichTextHelper } from '../../../utils/RichTextHelper';
import { table } from '../../../utils/table';
import UIHelper from '../../../utils/UIHelper';
import { UTF8 } from '../../../utils/UTF8';
import ChatPrivateChatView from './ChatPrivateChatView';
import ChatSystemMsgContentView from './ChatSystemMsgContentView';
import ChatTabContentView from './ChatTabContentView';
import PopupChatSetting from './PopupChatSetting';


var POS_OFFSET_X = 15;

@ccclass
export default class ChatMainView extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRoot: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTab: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonSetting: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonFold: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHint5: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHint2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHint3: cc.Node = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonAddGuild: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHint6: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHint7: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSendMsg: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBottom: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonVoice: cc.Button = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonSend: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelInput: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonEmoj: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeVoice: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonKeyBoard: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _buttonRecord: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLabel: cc.Label = null;

    @property(cc.Prefab)
    ChatTabContentView: cc.Prefab = null;

    @property(cc.Prefab)
    ChatSystemMsgContentView: cc.Prefab = null;

    @property(cc.Prefab)
    commonEditBox: cc.Prefab = null;

    @property(cc.Prefab)
    ChatPrivateChatView: cc.Prefab = null;

    @property(cc.Prefab)
    chatFaceView: cc.Prefab = null;

    public static path: string = 'chat/ChatMainView';


    _selectTabIndex: any;
    _chatModuleUIList: any = {};
    _isShowRecordVoicePanel: boolean;
    _chatTextLength: any;
    _channelParam: any;
    _chatPlayerDataParam: any;
    _tabDataList: any[];
    _tabTextList: any[];
    _inputView: cc.EditBox;
    _hintNodeList: any;
    _tabGroup: CommonTabGroup;
    _signalSendSuccess: any;
    _signalChatSelecteFace: any;
    _signalChatShowPlayerDetail: any;
    _signalRedPointUpdateChart: any;
    _signalVoiceRecordChangeNotice: any;
    _signalChatCopyMsg: any;
    _signalGroupMyGroupChatChange: any;
    _refreshHandler: any;
    _chatFaceNode: any;


    ctor(channel, chatPlayerData) {
        this._channelParam = channel;
        this._chatPlayerDataParam = chatPlayerData;
        this._selectTabIndex = 0;
        this._tabDataList = [];
        this._tabTextList = [];

        this._isShowRecordVoicePanel = false;
        UIHelper.addClickEventListenerEx(this._panelTouch, handler(this, this._onClickFold));
        UIHelper.addEventListener(this.node, this._buttonSetting, 'ChatMainView', '_onClickSetting');
        UIHelper.addEventListener(this.node, this._buttonVoice, 'ChatMainView', '_onClickVoice');
        UIHelper.addEventListener(this.node, this._buttonEmoj, 'ChatMainView', '_onClickEmoji');
        UIHelper.addEventListener(this.node, this._buttonSend._button, 'ChatMainView', '_onClickSend');
        UIHelper.addEventListener(this.node, this._buttonFold, 'ChatMainView', '_onClickFold');
        UIHelper.addEventListener(this.node, this._buttonKeyBoard, 'ChatMainView', '_onClickKeyBoard');
        UIHelper.addEventListener(this.node, this._buttonAddGuild._button, 'ChatMainView', '_onClickAddGuild');
        UIHelper.addEventListener(this.node, this._buttonSetting, 'ChatMainView', '_onClickSetting');
    }
    onCreate() {
        this._buttonSend.setString(Lang.get('chat_send_btn_name'));
        this._buttonAddGuild.setString(Lang.get('chat_btn_name_add_guild'));
        this._initTabGroup();
        this._chatTextLength = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_TEXT_LENGTH);
        var editBoxParam = {
            bgPanel: this._panelInput,
            placeholder: Lang.get('chat_max_words', { num: this._chatTextLength })
        };
        this._inputView = InputUtils.createInputView({
            bgPanel: this._panelInput,
            fontSize: 22,
            fontColor: cc.color(182, 101, 17, 255),
            placeholder: Lang.get('chat_max_words', { num: this._chatTextLength }),
            placeholderFontColor: cc.color(182, 101, 17, 255),
            maxLength: this._chatTextLength,
            // textLabel: this._textLabel
        });
        this._hintNodeList = {};
        for (var i = ChatConst.CHANNEL_MIN; i <= ChatConst.CHANNEL_MAX; i++) {
            if (this['_nodeHint' + i]) {
                this._hintNodeList[i] = this['_nodeHint' + i];
            }
        }
        // cc.bind(this._buttonRecord, 'CommonVoiceBtn');
        // this._buttonRecord.updateInfo(null, handler(this, this._onRecordVoiceTouchListener));
        // this._buttonRecord.setGetChatObjectFunc(handler(this, this._getCurrChatObject));
        var posLeft = G_ResolutionManager.getBangOffset();
        this._panelRoot.x = (this._panelRoot.x + posLeft + POS_OFFSET_X);
        let widget = this.node.addComponent(cc.Widget);
        widget.left = 0;
        widget.isAlignLeft = true;
        widget.verticalCenter = 0;
    }
    _initTabGroup() {
        this._tabDataList = UserDataHelper.getShowChatChannelIds();
        this._tabTextList = [];
        var textList = Lang.get('chat_channel_names');
        for (let k in this._tabDataList) {
            var v = this._tabDataList[k];
            table.insert(this._tabTextList, textList[v - 1]);
        }
        //logWarn('tabIndex------------------- ' + (this._selectTabIndex));
        var param = {
            tabIndex: this._selectTabIndex == 0 && null || this._selectTabIndex,
            rootNode: this._nodeTab,
            callback: handler(this, this._onTabSelect),
            offset: 2,
            textList: this._tabTextList,
            updateTabItemCallback: handler(this, this._updateTabItem),
            brightTabItemCallback: handler(this, this._brightTabItem)
        };
        if (!this._tabGroup) {
            this._tabGroup = this._nodeTab.getComponent(CommonTabGroup);
        }
        this._tabGroup.recreateTabs(param);
    }
    _updateTabItem(tabItem) {
        var index = tabItem.index;
        var text = this._tabTextList[index];
        var textWidget = tabItem.textWidget;
        var normalImage = tabItem.normalImage;
        var downImage = tabItem.downImage;
        normalImage.active = (true);
        downImage.active = (false);
        if (textWidget && text) {
            textWidget.getComponent(cc.Label).string = text;
        }
    }
    _brightTabItem(tabItem, bright) {
        var textWidget = tabItem.textWidget;
        var normalImage = tabItem.normalImage;
        var downImage = tabItem.downImage;
        normalImage.active = (!bright);
        downImage.active = (bright);
        textWidget.color = (bright && Colors.CHAT_TAB_BRIGHT || Colors.CHAT_TAB_NORMAL);
    }
    _isEnableTab(index) {
        var channelId = this._getTabDataByIndex(index - 1);
        if (channelId == ChatConst.CHANNEL_GUILD) {
            var isInGuild = G_UserData.getGuild().isInGuild();
            return isInGuild;
        }
        return true;
    }
    _refreshRedPoint() {
        var tabDataList = this._getTabDataList();
        for (let k = 0; k < tabDataList.length; k++) {
            var channelId = tabDataList[k];
            var red = RedPointHelper.isModuleReach(FunctionConst.FUNC_CHAT, channelId);
            this._tabGroup.setRedPointByTabIndex(k + 1, red);
        }
    }
    onEnter() {
        this._signalSendSuccess = G_SignalManager.add(SignalConst.EVENT_CHAT_SEND_SUCCESS, handler(this, this._onEventSendSuccess));
        this._signalChatSelecteFace = G_SignalManager.add(SignalConst.EVENT_CHAT_SELECTE_FACE, handler(this, this._onEventSelectedFace));
        this._signalChatShowPlayerDetail = G_SignalManager.add(SignalConst.EVENT_CHAT_SHOW_PLAYER_DETAIL, handler(this, this._onEventChatShowPlayerDetail));
        this._signalRedPointUpdateChart = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalVoiceRecordChangeNotice = G_SignalManager.add(SignalConst.EVENT_VOICE_RECORD_CHANGE_NOTICE, handler(this, this._onEventVoiceRecordChangeNotice));
        this._signalChatCopyMsg = G_SignalManager.add(SignalConst.EVENT_CHAT_COPY_MSG, handler(this, this._onEventChatCopyMsg));
        this._signalGroupMyGroupChatChange = G_SignalManager.add(SignalConst.EVENT_GROUP_MY_GROUP_CHAT_CHANGE, handler(this, this._onEventGroupMyGroupChatChange));
        if (this._refreshHandler == null) {
            this._refreshHandler = handler(this, this._onRefreshTick);
            this.schedule(this._refreshHandler, 0.5);
        }
        this.refreshUI(this._channelParam, this._chatPlayerDataParam);
        var runningScene = G_SceneManager.getRunningScene();
        runningScene.addGetUserBaseInfoEvent();
        this._inputView.string = (G_UserData.getChat().getLastInputCache()).toString();
        G_UserData.getChat().setLastInputCache('');
        this._refreshRedPoint();
        this._refreshInputState();
    }
    onExit() {
        this._signalSendSuccess.remove();
        this._signalSendSuccess = null;
        this._signalChatSelecteFace.remove();
        this._signalChatSelecteFace = null;
        this._signalChatShowPlayerDetail.remove();
        this._signalChatShowPlayerDetail = null;
        this._signalRedPointUpdateChart.remove();
        this._signalRedPointUpdateChart = null;
        this._signalVoiceRecordChangeNotice.remove();
        this._signalVoiceRecordChangeNotice = null;
        this._signalChatCopyMsg.remove();
        this._signalChatCopyMsg = null;
        this._signalGroupMyGroupChatChange.remove();
        this._signalGroupMyGroupChatChange = null;
        if (this._refreshHandler != null) {
            this.unschedule(this._refreshHandler);
            this._refreshHandler = null;
        }
        var channel = this._getCurrTabData();
        G_UserData.getChat().setLastUISelectedChannel(channel);
        if (channel == ChatConst.CHANNEL_PRIVATE) {
            var activityModuleUI = this._getActivityModuleUI(this._selectTabIndex);
            G_UserData.getChat().setLastUISelectedChatPlayerData(activityModuleUI.getNeedCacheChatPlayerData());
        }
        G_UserData.getChat().setLastInputCache(this._inputView.string);
    }
    refreshUI(channel, chatPlayerData) {
        this._channelParam = channel;
        this._chatPlayerDataParam = chatPlayerData;
        channel = channel || G_UserData.getChat().getLastUISelectedChannel();
        if (channel == ChatConst.CHANNEL_PRIVATE) {
            if (!chatPlayerData) {
                chatPlayerData = G_UserData.getChat().getLastUISelectedChatPlayerData();
            } else {
                G_UserData.getChat().createChatSessionWithPlayer(chatPlayerData, false);
            }
        }
        var tabIndex = this._getTabIndexByChannel(channel);
        if (!tabIndex) {
            //logWarn('setTabIndex-------------------1');
            this._tabGroup.setTabIndex(0);
        } else if (this._isEnableTab(tabIndex)) {
            this._tabGroup.setTabIndex(tabIndex - 1);
            //logWarn('setTabIndex-------------------' + tabIndex);
            if (channel == ChatConst.CHANNEL_PRIVATE && chatPlayerData) {
                var activityModuleUI = this._getActivityModuleUI(tabIndex);
                activityModuleUI.gotoChatWithPlayer(chatPlayerData);
            }
        } else {
            this._tabGroup.setTabIndex(0);
        }
    }
    _onRefreshTick(dt) {
        this._refreshCDTime();
    }
    _refreshCDTime() {
        var channel = this._getCurrSendMsgChannel();
        var [cdTime] = G_UserData.getChat().getCDTime(channel);
        var btnTxt = '';
        if (cdTime > 0) {
            btnTxt = Lang.get('chat_send_cd_of_btn', { num: cdTime });
        } else {
            btnTxt = Lang.get('chat_send_btn_name');
        }
        this._buttonSend.setString(btnTxt);
    }
    _getTabIndexByChannel(channelId) {
        for (var k = 1; k <= this._tabDataList.length; k++) {
            var v = this._tabDataList[k - 1];
            if (v == channelId) {
                return k;
            }
        }
        return null;
    }
    _onEventSelectedFace(event, faceId) {
        var currentStr = this._inputView.string;
        currentStr = currentStr + ('#' + ((faceId) + '#'));
        if (UTF8.utf8len(currentStr) > this._chatTextLength) {
            return;
        }
        this._inputView.string = (currentStr);
    }
    _onEventChatCopyMsg(event, txt) {
        this._inputView.string = (txt);
    }
    _onEventGroupMyGroupChatChange() {
        this._refreshInputState();
    }
    _onEventSendSuccess(event) {
        this._inputView.string = ('');
        this._refreshCDTime();
    }
    _onEventChatShowPlayerDetail(event, chatPlayerData) {
        G_UserData.getBase().c2sGetUserBaseInfo(chatPlayerData.getId());
    }
    _onEventRedPointUpdate(event, funcId) {
        if (funcId == FunctionConst.FUNC_CHAT) {
            //logWarn('tabIndex------------------- FUNC_CHAT');
            this._refreshRedPoint();
        }
    }
    _onTabSelect(index, sender) {
        if (this._selectTabIndex == index + 1) {
            return false;
        }
        this._selectTabIndex = index + 1;
        for (let i in this._chatModuleUIList) {
            var view = this._chatModuleUIList[i];
            view.node.active = (false);
        }
        var activityModuleUI = this._getActivityModuleUI(index + 1);
        activityModuleUI.node.active = (true);
        //this._buttonRecord.updateInfo(this._getCurrChatObject(), handler(this, this._onRecordVoiceTouchListener));
        var channelId = this._getTabDataByIndex(index);
        G_SignalManager.dispatch(SignalConst.EVENT_CHAT_ENTER_CHANNEL, channelId);
        this._refreshInputState();
        this._refreshCDTime();
    }
    showHintNode(channelId, needShow) {
        this._nodeSendMsg.active = (!needShow);
        for (let k in this._hintNodeList) {
            var v = this._hintNodeList[k];
            var id = parseInt(k);
            if (id == channelId) {
                v.active = (needShow);
            } else {
                v.active = (false);
            }
        }
    }
    _onClickAddGuild() {
        var sceneName = G_SceneManager.getRunningScene().getName();
        if (sceneName == 'fight') {
            G_Prompt.showTip(Lang.get('chat_pk_hint_when_infight'));
            return;
        }
        var isInGuild = G_UserData.getGuild().isInGuild();
        if (isInGuild == false) {
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_ARMY_GROUP);
            return;
        }
    }
    _getTabDataList() {
        return this._tabDataList;
    }
    _getTabDataByIndex(index) {
        var tabDataList = this._getTabDataList();
        if (!tabDataList) {
            return;
        }
        return tabDataList[index];
    }
    getCurrChannel() {
        return this._getCurrTabData();
    }
    _getCurrSendMsgChannel() {
        var channelId = this.getCurrChannel();
        if (channelId == ChatConst.CHANNEL_ALL) {
            return ChatConst.CHANNEL_WORLD;
        }
        return channelId;
    }
    _getCurrChatObject() {
        var chatObject = new ChatObject();
        var sendMsgChannel = this._getCurrSendMsgChannel();
        var chatPlayerData = null;
        if (sendMsgChannel == ChatConst.CHANNEL_PRIVATE) {
            var activityModuleUI = this._getActivityModuleUI(this._selectTabIndex);
            if (activityModuleUI) {
                chatPlayerData = activityModuleUI.getCurrChatPlayerData();
            }
        }
        chatObject.setChannel(sendMsgChannel);
        chatObject.setChatPlayerData(chatPlayerData);
        return chatObject;
    }
    _getCurrTabData() {
        var tabDataList = this._getTabDataList();
        if (!tabDataList) {
            return;
        }
        return tabDataList[this._selectTabIndex - 1];
    }
    _onClickSetting(sender) {
        // var popupChatSetting = new (require('PopupChatSetting'))();
        // popupChatSetting.openWithAction();
        PopupBase.loadCommonPrefab('PopupChatSetting', (popup: PopupChatSetting) => {
            popup.openWithAction();
        });
    }
    _onClickEmoji(sender) {
        if (!this._chatFaceNode) {
            this._chatFaceNode = cc.instantiate(this.chatFaceView);
            this.node.addChild(this._chatFaceNode);
        }
        this._chatFaceNode.active = (true);
    }
    _onClickSend(sender) {
        var channel = this._getCurrTabData();
        var sendMsgChannel = this._getCurrSendMsgChannel();
        var activityModuleUI = this._getActivityModuleUI(this._selectTabIndex);
        if (!channel || !activityModuleUI) {
            return;
        }
        if (sendMsgChannel == ChatConst.CHANNEL_PRIVATE && !activityModuleUI.isCanSendMsg()) {
            G_Prompt.showTip(Lang.get('chat_select_private_chat_player_hint'));
            return;
        }
        var [checkResult] = LogicCheckHelper.chatMsgSendCheck(sendMsgChannel, true);
        if (!checkResult) {
            return;
        }
        var str = this._inputView.string;
        if (str == '') {
            G_Prompt.showTip(Lang.get('chat_no_input_txt'));
            return;
        }
        str = RichTextHelper.getSubText(str, this._chatTextLength);
        var chatPlayerData = null;
        if (sendMsgChannel == ChatConst.CHANNEL_PRIVATE) {
            chatPlayerData = activityModuleUI.getCurrChatPlayerData();
        }
        str = BlackList.filterBlack(str);
        str.replace('|', '*');
        str.replace('\n', '');
        str.replace('\r', '');
        // str = string.gsub(str, '|', '*');
        // str = string.gsub(str, '\n', '');
        // str = string.gsub(str, '\r', '');
        var content = str;
        G_GameAgent.checkTalkAndSend(sendMsgChannel, content, chatPlayerData);
    }
    _onClickFold(sender) {
        this._closeWindow();
        G_SignalManager.dispatch(SignalConst.EVENT_CHAT_UI_CLOSE_CHAT_MAIN_VIEW, true);
    }
    forceClose() {
        G_UserData.getChat().setLastInputCache(this._inputView.string);
        this.node.destroy();
    }
    _onClickVoice(sender) {
        this._isShowRecordVoicePanel = true;
        this._nodeBottom.active = (!this._isShowRecordVoicePanel);
        this._nodeVoice.active = (this._isShowRecordVoicePanel);
        //this._buttonRecord.updateInfo(this._getCurrChatObject(), handler(this, this._onRecordVoiceTouchListener));
    }
    _onClickKeyBoard(sender) {
        this._isShowRecordVoicePanel = false;
        this._nodeBottom.active = (!this._isShowRecordVoicePanel);
        this._nodeVoice.active = (this._isShowRecordVoicePanel);
    }
    _closeWindow() {
        var posX = this._buttonFold.node.x;
        var callAction = cc.callFunc(function () {
            this.node.destroy();
        }, this);
        var action = cc.moveBy(0.3, cc.v2(-posX, 0));
        var runningAction = cc.sequence(action, callAction);
        this.node.runAction(runningAction);
    }
    _getActivityModuleUI(index) {
        var chatModuleUI = this._chatModuleUIList[index];
        if (chatModuleUI == null) {
            var channelId = this._getTabDataByIndex(index - 1);
            var msgContainerSize = this._panelContent.getContentSize();
            if (channelId == ChatConst.CHANNEL_ALL) {
                chatModuleUI = cc.instantiate(this.ChatTabContentView).getComponent(ChatTabContentView);
                chatModuleUI.ctor(this, channelId);
            } else if (channelId == ChatConst.CHANNEL_SYSTEM) {
                //chatModuleUI = new ChatSystemMsgContentView(this, channelId);
                chatModuleUI = cc.instantiate(this.ChatSystemMsgContentView).getComponent(ChatSystemMsgContentView);
                chatModuleUI.ctor(this, channelId);
            } else if (channelId == ChatConst.CHANNEL_WORLD) {
                //chatModuleUI = new ChatTabContentView(this, channelId);
                chatModuleUI = cc.instantiate(this.ChatTabContentView).getComponent(ChatTabContentView);
                chatModuleUI.ctor(this, channelId);
            } else if (channelId == ChatConst.CHANNEL_GUILD) {
                //chatModuleUI = new ChatTabContentView(this, channelId);
                chatModuleUI = cc.instantiate(this.ChatTabContentView).getComponent(ChatTabContentView);
                chatModuleUI.ctor(this, channelId);
            } else if (channelId == ChatConst.CHANNEL_PRIVATE) {
                //chatModuleUI = new ChatPrivateChatView(this, channelId);
                chatModuleUI = cc.instantiate(this.ChatPrivateChatView).getComponent(ChatPrivateChatView);
                chatModuleUI.ctor(this, channelId);
            } else if (channelId == ChatConst.CHANNEL_TEAM) {
                //chatModuleUI = new ChatTabContentView(this, channelId);
                chatModuleUI = cc.instantiate(this.ChatTabContentView).getComponent(ChatTabContentView);
                chatModuleUI.ctor(this, channelId);
            }
            this._panelContent.addChild(chatModuleUI.node);
            this._chatModuleUIList[index] = chatModuleUI;
        }
        return chatModuleUI;
    }
    _refreshInputState() {
        var channelId = this._getTabDataByIndex(this._selectTabIndex - 1);
        if (channelId == ChatConst.CHANNEL_GUILD) {
            var isInGuild = G_UserData.getGuild().isInGuild();
            this.showHintNode(channelId, isInGuild == false);
        } else if (channelId == ChatConst.CHANNEL_PRIVATE) {
            var activityModuleUI = this._getActivityModuleUI(this._selectTabIndex);
            if (activityModuleUI.isCanSendMsg && activityModuleUI.isCanSendMsg()) {
                this.showHintNode(channelId, false);
            } else {
                this.showHintNode(channelId, true);
            }
        } else if (channelId == ChatConst.CHANNEL_WORLD) {
            this.showHintNode(channelId, false);
        } else if (channelId == ChatConst.CHANNEL_ALL) {
            this.showHintNode(channelId, false);
        } else if (channelId == ChatConst.CHANNEL_TEAM) {
            var showSendUI = G_UserData.getGroups().getMyGroupData() != null;
            this.showHintNode(channelId, !showSendUI);
        } else if (channelId == ChatConst.CHANNEL_CROSS_SERVER) {
            var showSendUI = UserDataHelper.isCanCrossServerChat();
            this.showHintNode(channelId, !showSendUI);
        } else {
            this.showHintNode(channelId, false);
        }
    }
    _getTemplate() {
        // var ChatMsgItemCell = require('ChatMsgItemCell');
        // return ChatMsgItemCell;
    }
    _onRecordVoiceTouchListener(target, isPress) {
        target.loadTexture(Path.getVoiceRes(isPress && 'btn_chat06_dow' || 'btn_chat06_nml'));
    }
    _onEventVoiceRecordChangeNotice(event, isFinish) {
        if (isFinish) {
            //this._buttonRecord.forceFinishRecord();
        } else {
            //this._buttonRecord.cancelRecordVoice();
        }
    }

}
