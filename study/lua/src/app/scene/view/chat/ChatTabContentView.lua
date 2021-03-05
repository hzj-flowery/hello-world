--私人聊天页面
--@Author:Conley
local ViewBase = require("app.ui.ViewBase")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")
local ChatPrivateMsgItemCell = import(".ChatPrivateMsgItemCell")
local ChatMsgScrollView = import(".ChatMsgScrollView")
local ChatConst = require("app.const.ChatConst")
local ChatUnReadMsgNode = import(".ChatUnReadMsgNode")
local ChatTabContentView = class("ChatTabContentView", ViewBase)

function ChatTabContentView:ctor(mainView,channelId)
    self._mainView = mainView
	self._channelId = channelId
	self._panelContent = nil--私聊消息滚动View的父节点
	self._chatMsgScrollView = nil--私聊消息滚动View
    self._isFirstEnter = true--是否第一次进入
    self._nodeMsgNum = nil
    self._chatUnReadMsgNode = nil
    local resource = {
        file = Path.getCSB("ChatTabContentView", "chat"),
        binding = {
		}
    }
    ChatTabContentView.super.ctor(self, resource)
end

function ChatTabContentView:onCreate()
	local msgContainerSize = self._panelContent:getContentSize()
	self._chatMsgScrollView = ChatMsgScrollView.new(self,msgContainerSize,self._channelId,
        ChatConst.MAX_MSG_CACHE_NUM[self._channelId],{},self:_getTemplate())
    self._panelContent:addChild(self._chatMsgScrollView)
    self._chatUnReadMsgNode = ChatUnReadMsgNode.new(self._nodeMsgNum,self._chatMsgScrollView)

    if G_ConfigManager:isDalanVersion() then
        self._imageWaterFlow:setVisible(false)
    end
end

function ChatTabContentView:onEnter()
	self._signalChatGetMessage = G_SignalManager:add(SignalConst.EVENT_CHAT_GET_MESSAGE, handler(self, self._onEventGetMsg))  
	self._signalChatUnReadMsgNumChange = G_SignalManager:add(
        SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE, handler(self, self._onEventChatUnReadMsgNumChange))  
    self._signalChatEnterChannel = G_SignalManager:add(
        SignalConst.EVENT_CHAT_ENTER_CHANNEL, handler(self, self._onEventChatEnterChannel))  
    self._signalSystemMsgReceive = G_SignalManager:add(SignalConst.EVENT_SYSTEM_MSG_RECEIVE, handler(self, self._onEventGetMsg))

    local msgList = G_UserData:getChat():getMsgListByChannel(self._channelId)
	self._chatMsgScrollView:refreshData(msgList)
    self:_refreshAcceptMsgNum()
end

function ChatTabContentView:onExit()
	 self._signalChatGetMessage:remove()
     self._signalChatGetMessage = nil

     self._signalChatUnReadMsgNumChange:remove()
     self._signalChatUnReadMsgNumChange  = nil

     self._signalChatEnterChannel:remove()
     self._signalChatEnterChannel  = nil

     self._signalSystemMsgReceive:remove()
     self._signalSystemMsgReceive = nil
end

--收到新聊天消息事件
function ChatTabContentView:_onEventGetMsg(event,chatUnit)
    if self:_canShowChatMsg(chatUnit) then
		self._chatMsgScrollView:addNewMsg(chatUnit,self._mainView:getCurrChannel() == self._channelId)
        self:_refreshAcceptMsgNum()
	end
end

--[[收到系统消息
function ChatTabContentView:_onEventGetMsg(event,systemMsg)
	self._chatMsgScrollView:addNewMsg(systemMsg)
end
]]

function ChatTabContentView:_canShowChatMsg(chatUnit)
   return  chatUnit:getChannel() == self._channelId or 
        (self._channelId == ChatConst.CHANNEL_ALL and chatUnit:getChannel() ~=  ChatConst.CHANNEL_PRIVATE) 
end



function ChatTabContentView:_onEventChatUnReadMsgNumChange(event)
    self:_refreshAcceptMsgNum()
end

function ChatTabContentView:_onEventChatEnterChannel(event,channelId)
    if self._channelId == channelId then
         if self._isFirstEnter then
            self._isFirstEnter = false
            --显示到最底部
            self._chatMsgScrollView:readAllMsg()
         else
            --self._chatMsgScrollView:readMsgsInScreen()   
            self._chatMsgScrollView:readAllMsg()
         end
    end

    self._chatMsgScrollView:setChannelVisible(self._channelId == channelId)
end

function ChatTabContentView:_getTemplate()
    local ChatMsgItemCell = require("app.scene.view.chat.ChatMsgItemCell")
    return ChatMsgItemCell
end 

function ChatTabContentView:_refreshAcceptMsgNum()
    local msgList = self._chatMsgScrollView:getChatMsgList()
    local unReadNum = G_UserData:getChat():getUnReadMsgNum(msgList)--G_UserData:getChat():getChannelUnReadMsgNum(self._channelId)
    self._chatUnReadMsgNode:refreshAcceptMsgNum(unReadNum)
end

return ChatTabContentView




