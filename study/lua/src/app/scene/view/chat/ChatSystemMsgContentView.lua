
--@Author:Conley
local ViewBase = require("app.ui.ViewBase")
local ChatSystemMsgItemCell = import(".ChatSystemMsgItemCell")
local ChatMiniMsgScrollView = import(".ChatMiniMsgScrollView")
local ChatConst = require("app.const.ChatConst")
local ChatSystemMsgContentView = class("ChatSystemMsgContentView", ViewBase)

function ChatSystemMsgContentView:ctor(mainView,channelId)
    self._mainView = mainView
	self._channelId = channelId
	self._panelContent = nil--私聊消息滚动View的父节点
	self._chatMsgScrollView = nil--私聊消息滚动View
    self._isFirstEnter = true--是否第一次进入
    local resource = {
        file = Path.getCSB("ChatSystemMsgContentView", "chat"),
        binding = {
		}
    }
    ChatSystemMsgContentView.super.ctor(self, resource)
end

function ChatSystemMsgContentView:onCreate()
	--创建私聊消息滚动View
	local msgContainerSize = self._panelContent:getContentSize()
	self._chatMsgScrollView = ChatMiniMsgScrollView.new(self,msgContainerSize,self._channelId,
        ChatConst.MAX_MSG_CACHE_NUM[self._channelId],{},self:_getTemplate(),2)
    self._chatMsgScrollView:enableScroll()
    self._chatMsgScrollView:enableScrollToLatestMsg(false)
    self._panelContent:addChild(self._chatMsgScrollView)
end

function ChatSystemMsgContentView:onEnter()
	self._signalSystemMsgReceive = G_SignalManager:add(SignalConst.EVENT_SYSTEM_MSG_RECEIVE, handler(self, self._onEventGetMsg))
    self._signalChatEnterChannel = G_SignalManager:add(
        SignalConst.EVENT_CHAT_ENTER_CHANNEL, handler(self, self._onEventChatEnterChannel))


    local msgList = G_UserData:getRollNotice():getSystemMsgList()
	self._chatMsgScrollView:refreshData(msgList)
end


function ChatSystemMsgContentView:onExit()
	 self._signalSystemMsgReceive:remove()
     self._signalSystemMsgReceive = nil
     self._signalChatEnterChannel:remove()
     self._signalChatEnterChannel  = nil
end

function ChatSystemMsgContentView:_onClickUnReadMsgView(sender)
    self._chatMsgScrollView:readAllMsg()
end

--收到新聊天消息事件
function ChatSystemMsgContentView:_onEventGetMsg(event,systemMsg)
	self._chatMsgScrollView:addNewMsg(systemMsg)
end

function ChatSystemMsgContentView:_onEventChatEnterChannel(event,channelId)
    if self._channelId == channelId then
         if self._isFirstEnter then
            self._isFirstEnter = false
            --显示到最底部
            self._chatMsgScrollView:readAllMsg()
         end
    end
end

function ChatSystemMsgContentView:_getTemplate()
    local ChatMsgItemCell = require("app.scene.view.chat.ChatSystemMsgItemCell")
    return ChatMsgItemCell
end


return ChatSystemMsgContentView
