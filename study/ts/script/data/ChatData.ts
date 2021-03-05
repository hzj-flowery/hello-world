import { BaseData } from './BaseData';
import { Slot } from '../utils/event/Slot';
import { G_UserData, G_NetworkManager, G_SignalManager, G_ServerTime, G_ConfigLoader } from '../init';

import { ChatSetting } from './ChatSetting'
import { MessageIDConst } from '../const/MessageIDConst';
import { SignalConst } from '../const/SignalConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { ChatConst } from '../const/ChatConst';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { ChatMsgData } from './ChatMsgData';
import { FunctionConst } from '../const/FunctionConst';
import { clone } from '../utils/GlobleFunc';
import { FunctionCheck } from '../utils/logic/FunctionCheck';
import { ArraySort } from '../utils/handler';
import { LogicCheckHelper } from '../utils/LogicCheckHelper';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { TextHelper } from '../utils/TextHelper';
import { DailyCountData } from './DailyCountData';
import { ChatDataHelper } from '../utils/data/ChatDataHelper';
let schema = {};
schema['hasData'] = [
    'boolean',
    false
];

schema['lastUISelectedChannel'] = [
    'object',
    0
];

schema['lastUISelectedChatPlayerData'] = [
    'object',
    null
];

schema['chatSetting'] = [
    'object',
    null
];

schema['lastInputCache'] = [
    'number',
    ''
];

export interface ChatData {
    isHasData(): boolean
    setHasData(value: boolean): void
    isLastHasData(): boolean
    getLastUISelectedChannel(): Object
    setLastUISelectedChannel(value: Object): void
    getLastLastUISelectedChannel(): Object
    getLastUISelectedChatPlayerData(): Object
    setLastUISelectedChatPlayerData(value: Object): void
    getLastLastUISelectedChatPlayerData(): Object
    getChatSetting(): ChatSetting
    setChatSetting(value: ChatSetting): void
    getLastChatSetting(): ChatSetting
    getLastInputCache(): string
    setLastInputCache(value: string): void
    getLastLastInputCache(): number
}
export class ChatData extends BaseData {

    public static schema = schema;

    _s2cChatRequestListener: Slot;
    _s2cChatListener: Slot;
    _s2cChatGetMsgListener: Slot;
    _s2cChatMsgStatusUpdateListener: Slot;
    _s2cChatMsgDeleteListener: Slot;
    _s2cGetMultiUserBaseInfoListener: Slot;
    _s2cChatGetSimpleMsgListener: Slot;
    _signalRecvFlushData: Slot;
    _signalLoginSuccess: Slot;
    _worldList: any[];
    _privateList: any;
    _guildList: any[];
    _teamList: any[];
    _crossServerList: any[];
    _sendMsgStampList;
    _showTimeLabelDic;
    _sendMsgDataCache;
    _clientChatSessionList: any[];
    _chatSettingData;
    _privateChatDataIsGetFlag;
    _worldAutoPlayVoiceList;
    _guildAutoPlayVoiceList;
    _privateObjectInfo;

    constructor(properties?) {
        super(properties)
        this._initData();
        this._s2cChatRequestListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ChatRequest, this._s2cChatRequest.bind(this));
        this._s2cChatListener = G_NetworkManager.add(MessageIDConst.ID_S2C_Chat, this._s2cChat.bind(this));
        this._s2cChatGetMsgListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ChatGetMsg, this._s2cChatGetMsg.bind(this));
        this._s2cChatMsgStatusUpdateListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ChatMsgStatusUpdate, this._s2cChatMsgStatusUpdate.bind(this));
        this._s2cChatMsgDeleteListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ChatMsgDelete, this._s2cChatMsgDelete.bind(this));
        this._s2cGetMultiUserBaseInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetMultiUserBaseInfo, this._s2cGetMultiUserBaseInfo.bind(this));
        this._s2cChatGetSimpleMsgListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ChatGetSimpleMsg, this._s2cChatGetSimpleMsg.bind(this));
        this._signalRecvFlushData = G_SignalManager.add(SignalConst.EVENT_RECV_FLUSH_DATA, this._onEventRecvFlushData.bind(this));
        this._signalLoginSuccess = G_SignalManager.add(SignalConst.EVENT_LOGIN_SUCCESS, this._onEventLoginSuccess.bind(this));
    }
    public _initData() {
        this._worldList = [];
        this._privateList = {};
        this._guildList = [];
        this._teamList = [];
        this._crossServerList = [];
        this._sendMsgStampList = {};
        this._showTimeLabelDic = {};
        this._sendMsgDataCache = null;
        this._clientChatSessionList = [];
        this._chatSettingData = {};
        this._privateChatDataIsGetFlag = {};
        this._worldAutoPlayVoiceList = {};
        this._guildAutoPlayVoiceList = {};
        this._privateObjectInfo = [];
        this.setChatSetting(new ChatSetting());
    }
    public clear() {
        this._s2cChatRequestListener.remove();
        this._s2cChatRequestListener = null;
        this._s2cChatListener.remove();
        this._s2cChatListener = null;
        this._s2cChatGetMsgListener.remove();
        this._s2cChatGetMsgListener = null;
        this._s2cChatMsgStatusUpdateListener.remove();
        this._s2cChatMsgStatusUpdateListener = null;
        this._s2cChatMsgDeleteListener.remove();
        this._s2cChatMsgDeleteListener = null;
        this._s2cChatGetSimpleMsgListener.remove();
        this._s2cChatGetSimpleMsgListener = null;
        this._signalRecvFlushData.remove();
        this._signalRecvFlushData = null;
        this._s2cGetMultiUserBaseInfoListener.remove();
        this._s2cGetMultiUserBaseInfoListener = null;
        this._signalLoginSuccess.remove();
        this._signalLoginSuccess = null;
    }
    public reset() {
        this.setHasData(false);
        this._initData();
    }
    public _onEventRecvFlushData() {
        this.pullData();
    }
    public _onEventLoginSuccess() {
        // console.warn('ChatData ---------------- onEventLoginSuccess ');
        this._privateChatDataIsGetFlag = {};
    }
    public _s2cChatRequest(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CHAT_SEND_SUCCESS);
    }
    public _s2cGetMultiUserBaseInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CHAT_GETNULTIUSERSINFO, message);
    }
    public _s2cChatGetSimpleMsg(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._clientChatSessionList = [];
        let msgs = message['msgs'] || {};
        for (let k in msgs) {
            let v = msgs[k];
            let chatMsgData = new ChatMsgData();
            chatMsgData.initDataWithPrivateMsg(v);
            this._clientChatSessionList.push(chatMsgData);
        }
        this.setHasData(true);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_CHAT);
        G_SignalManager.dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE);
        G_SignalManager.dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE, null);
    }
    public _s2cChat(id, message) {
        if (!this.canAcceptMsg(message.channel)) {
            return false;
        }
        if (message.channel == ChatConst.CHANNEL_WORLD && G_UserData.getFriend().isUserIdInBlackList(message.sender_id)) {
            return false;
        }
        let chatMsgData = new ChatMsgData();
        chatMsgData.getSender().setId(message.sender_id);
        chatMsgData.getSender().setName(message.sender);
        chatMsgData.getSender().setBase_id(message.base_id);
        chatMsgData.getSender().setOffice_level(message.office_level);
        chatMsgData.getSender().setAvatar_base_id(message['avatar_base_id'] || 0);
        chatMsgData.getSender().setTitles(message.title);
        chatMsgData.getSender().setHead_frame_id(message.sender_head_frame_id);
        let [covertId, playerInfo] = UserDataHelper.convertAvatarId(chatMsgData.getSender());
        chatMsgData.getSender().setPlayer_info(playerInfo);
        chatMsgData.setChannel(message.channel);
        chatMsgData.setContent(message.content);
        chatMsgData.setStatus(ChatConst.MSG_STATUS_UNREAD);
        chatMsgData.setId(message.msg_id);
        chatMsgData.initDataWithSycMsg(message);
        if (message.sender_id == 0) {
            let rollMsg = {
                msg: message.content,
                noticeType: 0,
                param: message.control,
                sendId: 0
            };
            chatMsgData.setSysMsg(rollMsg);
        }
        if (message.channel == ChatConst.CHANNEL_PRIVATE) {
            if (message.sender_id == G_UserData.getBase().getId()) {
                if (this._sendMsgDataCache && this._sendMsgDataCache.channel == message.channel && this._sendMsgDataCache.reciver) {
                    chatMsgData.getReciver().setId(this._sendMsgDataCache.reciver.getId());
                    chatMsgData.getReciver().setName(this._sendMsgDataCache.reciver.getName());
                    chatMsgData.getReciver().setBase_id(this._sendMsgDataCache.reciver.getBase_id());
                    chatMsgData.getReciver().setOffice_level(this._sendMsgDataCache.reciver.getOffice_level());
                    chatMsgData.getReciver().setAvatar_base_id(this._sendMsgDataCache.reciver.getAvatar_base_id());
                    chatMsgData.getReciver().setHead_frame_id(this._sendMsgDataCache.reciver.getHead_frame_id());
                    let playerInfo = this._sendMsgDataCache.reciver.getPlayer_info();
                    chatMsgData.getReciver().setPlayer_info(clone(playerInfo));
                }
                chatMsgData.setStatus(ChatConst.MSG_STATUS_READED);
            } else {
                chatMsgData.getReciver().setId(G_UserData.getBase().getId());
                chatMsgData.getReciver().setName(G_UserData.getBase().getName());
                chatMsgData.getReciver().setBase_id(G_UserData.getHero().getRoleBaseId());
                chatMsgData.getReciver().setOffice_level(G_UserData.getBase().getOfficer_level());
                chatMsgData.getReciver().setAvatar_base_id(G_UserData.getBase().getAvatar_base_id());
                chatMsgData.getReciver().setHead_frame_id(G_UserData.getBase().getHead_frame_id());
                let [covertId, playerInfo] = UserDataHelper.convertAvatarId(chatMsgData.getReciver());
                chatMsgData.getReciver().setPlayer_info(playerInfo);
            }
        }
        this._onAddNewMessage(chatMsgData, true);
    }
    public _s2cChatGetMsg(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (!this.canAcceptMsg(ChatConst.CHANNEL_PRIVATE)) {
            return false;
        }
        let msgs = message['msgs'] || {};
        let userId = message['user_id'] || 0;
        this._setIsGetPrivateMsgWithPlayer(userId, true);
        let chatSession = this.seekChatSessionByPlayerId(userId);
        let privateTargetData = chatSession && chatSession.getChatObject() || null;
        this._deletePrivateMsgByPlayerId(userId);
        for (let k in msgs) {
            let v = msgs[k];
            let chatMsgData = new ChatMsgData();
            chatMsgData.initDataWithPrivateMsg(v);
            this._onAddNewMessage(chatMsgData, false);
        }
        let isClearSession = msgs.length <= 0;
        if (isClearSession && privateTargetData) {
            this.createChatSessionWithPlayer(privateTargetData, false);
        }
        let chatPlayerData = privateTargetData;
        if (chatPlayerData) {
            G_SignalManager.dispatch(SignalConst.EVENT_CHAT_MSG_LIST_GET, chatPlayerData);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE, null);
        G_SignalManager.dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_CHAT);
    }
    public _s2cChatMsgStatusUpdate(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let msgIds = message['msg_ids'] || {};
        for (let k in msgIds) {
            let v = msgIds[k];
            for (let k1 in this._privateList) {
                let v1 = this._privateList[k1];
                for (let k2 in v1) {
                    let v2 = v1[k2];
                    if (v2.getId() == v) {
                        v2.setStatus(ChatConst.MSG_STATUS_READED);
                    }
                }
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_CHAT);
    }
    public _s2cChatMsgDelete(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let deleteUserId = message['delete_user_id'] || {};
        for (let k in deleteUserId) {
            let v = deleteUserId[k];
            this._deletePrivateMsgByPlayerId(v);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE, null);
        G_SignalManager.dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_CHAT);
    }
    public _onAddNewMessage(newMsg, notify) {
        let channel = newMsg.getChannel();
        if (channel == ChatConst.CHANNEL_WORLD) {
            this._onAddNewMsg2List(this._worldList, newMsg, channel);
            this._onAddVoiceMsg2List(this._worldAutoPlayVoiceList, newMsg, channel);
        } else if (channel == ChatConst.CHANNEL_PRIVATE) {
            let privateChatTargetId = newMsg.getChatObjectId();
            if (privateChatTargetId != 0) {
                this._onAddPrivateChatNewMsg2List(newMsg);
            } else {
                newMsg = null;
            }
        } else if (channel == ChatConst.CHANNEL_GUILD) {
            this._onAddNewMsg2List(this._guildList, newMsg, channel);
            this._onAddVoiceMsg2List(this._guildAutoPlayVoiceList, newMsg, channel);
        } else if (channel == ChatConst.CHANNEL_TEAM) {
            this._onAddNewMsg2List(this._teamList, newMsg, channel);
            this._onAddVoiceMsg2List(this._guildAutoPlayVoiceList, newMsg, channel);
        } else if (channel == ChatConst.CHANNEL_CROSS_SERVER) {
            this._onAddNewMsg2List(this._crossServerList, newMsg, channel);
            this._onAddVoiceMsg2List(this._guildAutoPlayVoiceList, newMsg, channel);
        }
        if (newMsg && notify) {
            G_SignalManager.dispatch(SignalConst.EVENT_CHAT_GET_MESSAGE, newMsg);
            G_SignalManager.dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE);
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_CHAT);
        }
        return newMsg;
    }
    public _onAddNewMsg2List(list: any[], newMsg, channel) {
        let size = list.length + 1;
        newMsg.setIndex(size);
        newMsg.setNeedShowTimeLabel(this._isNeedShowTimeLabel(newMsg));
        list.push(newMsg);
        if (list.length > ChatConst.MAX_MSG_CACHE_NUM[channel - 1]) {
            list.shift();
        }
    }
    public _onAddVoiceMsg2List(list, newMsg, channel) {
        let chatSetting = this.getChatSetting();
        let isAutoPlay = chatSetting.isAutoPlayVoiceOfChannel(channel);
        if (!isAutoPlay) {
            return;
        }
        if (newMsg.getSender().isSelf()) {
            return;
        }
        if (!newMsg.isVoice()) {
            return;
        }
        list.push(newMsg);
        //TODO:
        // G_VoiceManager.tryAutoPlay();
    }
    public _onAddPrivateChatNewMsg2List(newMsg) {
        let privateChatTargetId = newMsg.getChatObjectId();
        if (!this._privateList[privateChatTargetId]) {
            this._privateList[privateChatTargetId] = [];
        }
        this._onAddNewMsg2List(this._privateList[privateChatTargetId], newMsg, ChatConst.CHANNEL_PRIVATE);
        this._deleteClientChatSession(newMsg, false);
    }
    public _deleteClientChatSession(newMsg, notify) {
        console.warn('clear clientChatSessionList start ');
        for (let i = this._clientChatSessionList.length; i >= 1; i += -1) {
            let v = this._clientChatSessionList[i - 1];
            //console.warn('delete clientChatSessionList id :' + (String(v.getChatObjectId()) + (' = ' + String(newMsg.getChatObjectId()))));
            if (v.getChatObjectId() == newMsg.getChatObjectId()) {
                this._clientChatSessionList.splice(i - 1, 1);
            }
        }
        console.warn('clear _clientChatSessionList end ');
        if (notify) {
            G_SignalManager.dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE, newMsg);
        }
    }
    public _clearClientChatSession() {
        if (this._clientChatSessionList.length > 0) {
            this._clientChatSessionList = [];
            G_SignalManager.dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE);
        }
    }
    public _createClientSession(chatPlayerData, notify) {
        let chatMsgData = new ChatMsgData();
        chatMsgData.setReciver(chatPlayerData);
        chatMsgData.getSender().setId(G_UserData.getBase().getId());
        chatMsgData.getSender().setName(G_UserData.getBase().getName());
        chatMsgData.getSender().setBase_id(G_UserData.getHero().getRoleBaseId());
        chatMsgData.getSender().setOffice_level(G_UserData.getBase().getOfficer_level());
        this._clientChatSessionList.push(chatMsgData);
        if (notify) {
            G_SignalManager.dispatch(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE, chatMsgData);
        }
        return chatMsgData;
    }
    public _deletePrivateMsgByPlayerId(playerId) {
        let msgList = this._privateList[playerId];
        this._privateList[playerId] = [];
        this._clearTimeLabel(ChatConst.CHANNEL_PRIVATE, playerId);
        return msgList;
    }
    public onSendMsgSuccess(channel, msgType) {
        let cdType = this._getCdTypeWithMsgType(msgType);
        if (this._sendMsgStampList[channel] == null) {
            this._sendMsgStampList[channel] = {};
        }
        this._sendMsgStampList[channel][cdType] = G_ServerTime.getTime();
    }
    public _getCdTypeWithMsgType(msgType) {
        let cdType = ChatConst.CD_TYPE_COMMON;
        if (msgType == ChatConst.MSG_TYPE_EVENT) {
            cdType = ChatConst.CD_TYPE_EVENT;
        }
        return cdType;
    }
    public geUnReadMsgNumWithObject(playerId) {
        return this.getUnReadMsgNum(this._privateList[playerId]);
    }
    public getUnReadMsgNum(msgList) {
        if (!msgList) {
            return 0;
        }
        let count = 0;
        for (let k in msgList) {
            let v = msgList[k];
            if (v.getStatus() == ChatConst.MSG_STATUS_UNREAD) {
                count = count + 1;
            }
        }
        return count;
    }
    public getChannelUnReadMsgNum(channel) {
        if (channel == ChatConst.CHANNEL_WORLD) {
            return this.getUnReadMsgNum(this._worldList);
        } else if (channel == ChatConst.CHANNEL_GUILD) {
            return this.getUnReadMsgNum(this._guildList);
        } else if (channel == ChatConst.CHANNEL_ALL) {
            let sysMsgList = G_UserData.getRollNotice().getSystemMsgList();
            let num1 = this.getUnReadMsgNum(this._worldList);
            let num2 = this.getUnReadMsgNum(this._guildList);
            let num3 = this.getUnReadMsgNum(sysMsgList);
            console.warn('*** ' + num1);
            console.warn('*** ' + num2);
            console.warn('*** ' + num3);
            return num1 + num2 + num3;
        } else if (channel == ChatConst.CHANNEL_PRIVATE) {
            let num = 0;
            for (let k in this._privateList) {
                let v = this._privateList[k];
                num = num + this.getUnReadMsgNum(v);
            }
            return num;
        } else if (channel == ChatConst.CHANNEL_TEAM) {
            return this.getUnReadMsgNum(this._teamList);
        } else if (channel == ChatConst.CHANNEL_CROSS_SERVER) {
            return this.getUnReadMsgNum(this._crossServerList);
        }
        return 0;
    }
    public getCDTime(channel, msgType?) {
        let cdType = this._getCdTypeWithMsgType(msgType);
        let sendStamp = 0;
        if (this._sendMsgStampList[channel]) {
            sendStamp = this._sendMsgStampList[channel][cdType] || 0;
        }
        let maxCd = 0;
        let currentTime = G_ServerTime.getTime();
        if (channel == ChatConst.CHANNEL_GUILD) {
            if (cdType == ChatConst.CD_TYPE_COMMON) {
                maxCd = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_GUILD_INTERVAL);
            } else if (cdType == ChatConst.CD_TYPE_EVENT) {
                maxCd = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_QIN_GUILD_CD);
            }
        } else if (channel == ChatConst.CHANNEL_WORLD) {
            if (cdType == ChatConst.CD_TYPE_COMMON) {
                maxCd = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_WORLD_INTERVAL);
            } else if (cdType == ChatConst.CD_TYPE_EVENT) {
                maxCd = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_QIN_WORLD_CD);
            }
        } else if (channel == ChatConst.CHANNEL_TEAM) {
            maxCd = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_TEAM_INTERVAL);
        }
        let cdTime = 0;
        sendStamp = sendStamp + 0.1;
        if (currentTime - sendStamp < maxCd) {
            cdTime = maxCd - (currentTime - sendStamp);
        }
        return [
            Math.min(Math.ceil(cdTime), maxCd),
            cdType
        ];
    }
    public isFuncOpen() {
        let isFunctionOpen = FunctionCheck.funcIsShow(FunctionConst.FUNC_CHAT);
        return isFunctionOpen;
    }
    public canAcceptMsg(channel) {
        if (!this.isFuncOpen()) {
            return false;
        }
        if (!this.getChatSetting().isReceiveMsgOfChannel(channel)) {
            return false;
        }
        let playerLevel = G_UserData.getBase().getLevel();
        if (channel == ChatConst.CHANNEL_GUILD) {
            return true;
        } else if (channel == ChatConst.CHANNEL_WORLD) {
            return playerLevel >= UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_WORLD_ACCEPT_MSG_LEVEL);
        } else if (channel == ChatConst.CHANNEL_TEAM) {
            return true;
        }
        return true;
    }
    public canSendMsg(channel, limitInfo) {
        if (!this.isFuncOpen()) {
            return false;
        }
        let count = G_UserData.getDailyCount().getCountById(DailyCountData.DAILY_RECORD_CHAT_CNT);
        let maxCount = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_SEND_MSG_NUM_DAILY);
        let vipLevel = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_SEND_MSG_VIP_LEVEL);
        let roleLevel = UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_SEND_MSG_ROLE_LEVEL);
        if (count >= maxCount && channel == ChatConst.CHANNEL_WORLD) {
            let playerLevel = G_UserData.getBase().getLevel();
            let playerVipLevel = G_UserData.getVip().getLevel();
            if (playerVipLevel < vipLevel && playerLevel < roleLevel) {
                if (limitInfo) {
                    limitInfo[ChatConst.LIMIT_FLAG_NO_COUNT] = [
                        vipLevel,
                        roleLevel
                    ];
                }
                return false;
            }
        }
        let checkLevelFunc = function (paramId, limitInfo) {
            let playerLevel = G_UserData.getBase().getLevel();
            if (playerLevel < UserDataHelper.getChatParameterById(paramId)) {
                if (limitInfo) {
                    limitInfo[ChatConst.LIMIT_FLAG_LEVLE] = UserDataHelper.getChatParameterById(paramId);
                }
                return false;
            }
            return true;
        };
        if (channel == ChatConst.CHANNEL_GUILD) {
            if (!G_UserData.getGuild().isInGuild()) {
                if (limitInfo) {
                    limitInfo[ChatConst.LIMIT_FLAG_NO_GANG] = true;
                }
                return false;
            }
            if (!checkLevelFunc(ChatConst.PARAM_CHAT_GUILD_SEND_MSG_LEVEL, limitInfo)) {
                return false;
            }
        } else if (channel == ChatConst.CHANNEL_WORLD) {
            if (!checkLevelFunc(ChatConst.PARAM_CHAT_WORLD_SEND_MSG_LEVEL, limitInfo)) {
                return false;
            }
        } else if (channel == ChatConst.CHANNEL_PRIVATE) {
            if (!checkLevelFunc(ChatConst.PARAM_CHAT_PRIVATE_CHAT_LEVEL, limitInfo)) {
                return false;
            }
        } else if (channel == ChatConst.CHANNEL_TEAM) {
            return true;
        } else if (channel == ChatConst.CHANNEL_CROSS_SERVER) {
            if (!checkLevelFunc(ChatConst.PARAM_CHAT_CROSS_SERVER_LEVEL, limitInfo)) {
                return false;
            }
            if (!ChatDataHelper.isCanCrossServerChat()) {
                if (limitInfo) {
                    limitInfo[ChatConst.LIMIT_FLAG_CROSS_SERVER] = true;
                }
                return false;
            }
        }
        return true;
    }
    public _isNeedShowTimeLabel(newMsg) {
        let channel = newMsg.getChannel();
        let playerId = null;
        if (channel == ChatConst.CHANNEL_PRIVATE) {
            playerId = newMsg.getChatObjectId();
        }
        let currentTime = newMsg.getTime();
        let currentIndex = newMsg.getIndex();
        let needShow = false;
        let key = String(channel) + ('_' + String(playerId));
        let lastShowTimeLabelMsg = this._showTimeLabelDic[key];
        let lastShowTime = lastShowTimeLabelMsg && lastShowTimeLabelMsg.getTime() || 0;
        let lastShowTimeIndex = lastShowTimeLabelMsg && lastShowTimeLabelMsg.getIndex() || 0;
        // console.warn(key);
        // console.warn(lastShowTime + ('++++++++++++++++' + lastShowTimeIndex));
        // console.warn(currentTime + ('++++++++++++++++' + currentIndex));
        if (currentTime - lastShowTime >= ChatConst.SHOW_TIME_LABEL_BLANK) {
            this._showTimeLabelDic[key] = newMsg;
            needShow = true;
        } else if (currentIndex - lastShowTimeIndex >= ChatConst.SHOW_TIME_LABEL_MSG_NUM) {
            this._showTimeLabelDic[key] = newMsg;
            needShow = true;
        } else {
            needShow = false;
        }
        return needShow;
    }
    public _clearTimeLabel(channel, playerId) {
        let key = String(channel) + ('_' + String(playerId));
        this._showTimeLabelDic[key] = null;
    }
    public getWorldList() {
        return this._worldList;
    }
    public getPrivateList() {
        return this._privateList;
    }
    public getGuildList() {
        return this._guildList;
    }
    public getTeamList() {
        return this._teamList;
    }
    getCrossServerList() {
        return this._crossServerList;
    }
    public getMsgListByChannel(channelId) {
        let msgList = {};
        if (channelId == ChatConst.CHANNEL_WORLD) {
            msgList = G_UserData.getChat().getWorldList();
        } else if (channelId == ChatConst.CHANNEL_GUILD) {
            msgList = G_UserData.getChat().getGuildList();
        } else if (channelId == ChatConst.CHANNEL_ALL) {
            msgList = G_UserData.getChat().getAllChannelMsgList();
        } else if (channelId == ChatConst.CHANNEL_TEAM) {
            msgList = this._teamList;
        } else if (channelId == ChatConst.CHANNEL_CROSS_SERVER) {
            msgList = this._crossServerList;
        }
        return msgList;
    }
    public getPrivateChatLastestMsgList() {
        let chatObjectIdList = {};
        for (let k in this._clientChatSessionList) {
            let chatMsgData = this._clientChatSessionList[k];
            chatObjectIdList[chatMsgData.getChatObjectId()] = chatMsgData;
        }
        for (let k in this._privateList) {
            let msgList = this._privateList[k];
            if (msgList && msgList.length > 0) {
                let chatMsgData = msgList[msgList.length - 1];
                chatObjectIdList[chatMsgData.getChatObjectId()] = chatMsgData;
            }
        }
        let resultList = [];
        for (let k in chatObjectIdList) {
            let v = chatObjectIdList[k];
            resultList.push(v);
        }
        let sortFunc = function (msg1, msg2) {
            let time1 = msg1.getTime();
            let time2 = msg2.getTime();
            return time1 > time2;
        };
        ArraySort(resultList, sortFunc);
        return resultList;
    }
    public getMiniMsgList() {
        let showWorldMsg = this.getChatSetting().isShowMiniMsgOfChannel(ChatConst.CHANNEL_WORLD);
        let showSystemMsg = this.getChatSetting().isShowMiniMsgOfChannel(ChatConst.CHANNEL_SYSTEM);
        let miniMsgList = [];
        if (showWorldMsg) {
            for (let k in this._worldList) {
                let v = this._worldList[k];
                miniMsgList.push(v);
            }
        }
        for (let k in this._guildList) {
            let v = this._guildList[k];
            miniMsgList.push(v);
        }
        for (let k in this._teamList) {
            let v = this._teamList[k];
            miniMsgList.push(v);
        }
        for (let k in this._crossServerList) {
            var v = this._crossServerList[k];
            miniMsgList.push(v);
        }
        if (showSystemMsg) {
            for (let k in G_UserData.getRollNotice().getSystemMsgList()) {
                let v = G_UserData.getRollNotice().getSystemMsgList()[k];
                miniMsgList.push(v);
            }
        }
        miniMsgList.sort(this._sortChatMsg.bind(this));
        return this._clipMsgList(miniMsgList, ChatConst.MAX_MINI_MSG_CACHE_NUM);
    }
    public getAllChannelMsgList() {
        let worldMsgList = G_UserData.getChat().getWorldList();
        let sysMsgList = G_UserData.getRollNotice().getSystemMsgList();
        let guildMsgList = G_UserData.getChat().getGuildList();
        let teamMsgList = G_UserData.getChat().getTeamList();
        var crossServerList = G_UserData.getChat().getCrossServerList();
        let msgList = [];
        for (let k in sysMsgList) {
            let v = sysMsgList[k];
            msgList.push(v);
        }
        for (let k in worldMsgList) {
            let v = worldMsgList[k];
            msgList.push(v);
        }
        for (let k in guildMsgList) {
            let v = guildMsgList[k];
            msgList.push(v);
        }
        for (let k in teamMsgList) {
            let v = teamMsgList[k];
            msgList.push(v);
        }
        for (let k in crossServerList) {
            var v = crossServerList[k];
            msgList.push(v);
        }
        msgList.sort(this._sortChatMsg.bind(this));
        let maxMsgNum = ChatConst.MAX_MSG_CACHE_NUM[ChatConst.CHANNEL_ALL];
        return this._clipMsgList(msgList, maxMsgNum);
    }
    public _clipMsgList(msgList, maxMsgNum) {
        let resultList = [];
        let startIndex = msgList.length - maxMsgNum;
        startIndex = Math.max(startIndex, 0);
        for (let i = startIndex; i < msgList.length; i += 1) {
            resultList.push(msgList[i]);
        }
        return resultList;
    }
    public getPrivateMsgListWithPlayerId(playerId) {
        for (let k in this._privateList) {
            let msgList = this._privateList[k];
            if (k == playerId) {
                return msgList;
            }
        }
        return {};
    }
    public _sortChatMsg(msg1, msg2) {
        let time1 = msg1.getTime();
        let time2 = msg2.getTime();
        return time1 - time2;
    }
    public seekChatSessionByPlayerId(playerId) {
        for (let k in this._privateList) {
            let msgList = this._privateList[k];
            if (k == playerId) {
                let lastData = msgList[msgList.length - 1];
                return lastData;
            }
        }
        return this._seekClientChatSessionByPlayerId(playerId);
    }
    public _seekClientChatSessionByPlayerId(playerId) {
        for (let k in this._clientChatSessionList) {
            let chatMsgData = this._clientChatSessionList[k];
            if (chatMsgData.getChatObjectId() == playerId) {
                return chatMsgData;
            }
        }
        return null;
    }
    public createChatSessionWithPlayer(chatPlayerData, notify) {
        let chatSession = this.seekChatSessionByPlayerId(chatPlayerData.getId());
        if (!chatSession) {
            chatSession = this._createClientSession(chatPlayerData, notify);
        }
        return chatSession;
    }
    public hasRedPoint(channelId) {
        if (!channelId || typeof channelId != 'number') {
            return this.isChannelHasRedPoint(ChatConst.CHANNEL_PRIVATE);
        } else {
            return this.isChannelHasRedPoint(channelId);
        }
    }
    public hasRedPointWithPlayer(playerId) {
        return this.geUnReadMsgNumWithObject(playerId) > 0;
    }
    public isChannelHasRedPoint(channel) {
        if (channel != ChatConst.CHANNEL_PRIVATE && channel != ChatConst.CHANNEL_GUILD && channel != ChatConst.CHANNEL_TEAM) {
            return false;
        }
        return this.getChannelUnReadMsgNum(channel) > 0;
    }
    public clearAllPrivateChatMsg() {
        let deleteUserIds = {};
        for (let k in this._privateList) {
            let msgList = this._privateList[k];
            if (Number(k) != 0) {
                deleteUserIds[k] = true;
            }
        }
        for (let k in this._clientChatSessionList) {
            let chatMsgData = this._clientChatSessionList[k];
            deleteUserIds[chatMsgData.getChatObjectId()] = true;
        }
        console.log(deleteUserIds);
        let newDeleteUserIds = [];
        for (let k in deleteUserIds) {
            let v = deleteUserIds[k];
            newDeleteUserIds.push(parseInt(k));
        }
        if (newDeleteUserIds.length > 0) {
            this.c2sChatMsgDelete(newDeleteUserIds);
        }
        this._clearClientChatSession();
    }
    public clearPrivateChatMsg(chatMsgData) {
        let playerId = chatMsgData.getChatObject().getId();
        let chatSession = this._seekClientChatSessionByPlayerId(playerId);
        if (chatSession) {
            this._deleteClientChatSession(chatSession, true);
        }
        let deleteUserIds = [playerId];
        this.c2sChatMsgDelete(deleteUserIds);
    }
    public readChatMsgDatas(msgList) {
        let ids = [];
        let readMsg = false;
        for (let k in msgList) {
            let v = msgList[k];
            if (v.getStatus() == ChatConst.MSG_STATUS_UNREAD) {
                if (v.getChannel() == ChatConst.CHANNEL_PRIVATE) {
                    ids.push(v.getId());
                    readMsg = true;
                    v.setStatus(ChatConst.MSG_STATUS_READED);
                } else {
                    readMsg = true;
                    v.setStatus(ChatConst.MSG_STATUS_READED);
                    console.warn('----msg id:' + (v.getSender().getId() + ' read'));
                }
            }
        }
        if (ids.length > 0) {
            console.log(ids);
            this.c2sChatMsgStatusUpdate(ids);
        }
        if (readMsg) {
            G_SignalManager.dispatch(SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE);
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_CHAT);
        }
    }
    public createChatMsgDataBySysMsg(systemMsg) {
        let chatMsgData = new ChatMsgData();
        chatMsgData.setSysMsg(systemMsg);
        chatMsgData.setChannel(ChatConst.CHANNEL_SYSTEM);
        chatMsgData.setStatus(ChatConst.MSG_STATUS_UNREAD);
        return chatMsgData;
    }
    public _setIsGetPrivateMsgWithPlayer(playerId, isGet) {
        this._privateChatDataIsGetFlag[playerId] = isGet;
    }
    public isGetPrivateMsgWithPlayer(playerId) {
        return this._privateChatDataIsGetFlag[playerId];
    }
    public _onEventCheckWord(name, content) {
    }
    public c2sChatRequest(channel, content, chatPlayerData, msgType, parameter) {
        msgType = msgType || 1;
        let data = {
            channel: channel,
            content: content,
            reciver_id: chatPlayerData && chatPlayerData.getId() || null,
            msg_type: msgType,
            parameter: parameter
        };
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChatRequest, data);
        this._sendMsgDataCache = {
            channel: channel,
            content: content,
            reciver: chatPlayerData
        };
        this.onSendMsgSuccess(channel, msgType);
    }
    public c2SChatGetMsg(userId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChatGetMsg, { user_id: userId });
    }
    public c2sChatMsgStatusUpdate(msgIds) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChatMsgStatusUpdate, { msg_ids: msgIds });
    }
    public c2sChatMsgDelete(deleteUserIds) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ChatMsgDelete, { delete_user_id: deleteUserIds });
    }
    public c2sGetMultiUserBaseInfo(userIds) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetMultiUserBaseInfo, { user_ids: userIds });
    }
    public sendCreateTeamMsg(channelId, teamId, teamType, minPeople, maxPeople, isInFight) {
        if (!LogicCheckHelper.chatMsgSendCheck(channelId, true, null, ChatConst.MSG_TYPE_EVENT)[0]) {
            return false;
        }
        let PaoMaDeng = G_ConfigLoader.getConfig(ConfigNameConst.PAOMADENG);
        let id = isInFight && ChatConst.CREATE_TEAM_IN_FIGHT_ROLL_NOTICE_ID || ChatConst.CREATE_TEAM_ROLL_NOTICE_ID;
        let cfg = PaoMaDeng.get(id);
        console.assert(cfg, 'paomadeng not find id ' + String(id));
        let param = [];
        param.push({
            key: 'number',
            value: String(minPeople)
        });
        param.push({
            key: 'people_number',
            value: String(maxPeople)
        });
        param.push({
            key: 'teamId',
            value: String(teamId)
        });
        param.push({
            key: 'teamType',
            value: String(teamType)
        });
        let content = TextHelper.convertKeyValuePairs(cfg.description, param);
        G_UserData.getChat().c2sChatRequest(channelId, content, null, ChatConst.MSG_TYPE_EVENT, param);
        return true;
    }
    public pullData() {
    }
    public getNextAutoPlayVoiceMsg() {
        let clearPlayedListFunc = function (list) {
            for (let i = list.length - 1; i >= 0; i--) {
                let v = list[i];
                if (v.isVoicePlay()) {
                    list.splice(i, 1);
                }
            }
        };
        clearPlayedListFunc(this._guildAutoPlayVoiceList);
        clearPlayedListFunc(this._worldAutoPlayVoiceList);
        let msg = null;
        for (let k in this._guildAutoPlayVoiceList) {
            let v = this._guildAutoPlayVoiceList[k];
            if (!v.isVoicePlay()) {
                msg = v;
                break;
            }
        }
        if (msg) {
            return msg;
        }
        for (let k in this._worldAutoPlayVoiceList) {
            let v = this._worldAutoPlayVoiceList[k];
            if (!v.isVoicePlay()) {
                msg = v;
                break;
            }
        }
        return msg;
    }
    public clearGuildAutoPlayVoiceList() {
        console.warn('VoiceManager....... clearGuildAutoPlayVoiceList');
        this._guildAutoPlayVoiceList = {};
    }
    public clearWorldAutoPlayVoiceList() {
        console.warn('VoiceManager....... clearWorldAutoPlayVoiceList');
        this._worldAutoPlayVoiceList = {};
    }
    public setPrivateObjectInfo(info) {
        if (this._privateObjectInfo && this._privateObjectInfo.length > 0) {
            this._privateObjectInfo = null;
        }
        this._privateObjectInfo = info;
    }
    public getPrivateObjectTitles(userId) {
        if (this._privateObjectInfo && this._privateObjectInfo.length > 0) {
            for (let index = 0; index < this._privateObjectInfo.length; index++) {
                if (userId == this._privateObjectInfo[index].user_id) {
                    let titles = this._privateObjectInfo[index]['title'] || null;
                    if (titles && titles.length > 0) {
                        return titles[1];
                    }
                    return 0;
                }
            }
        }
        return 0;
    }
}