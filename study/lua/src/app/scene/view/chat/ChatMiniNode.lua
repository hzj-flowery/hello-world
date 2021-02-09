
local ChatVoiceView = import(".ChatVoiceView")
local ChatMiniMsgScrollView = import(".ChatMiniMsgScrollView")
local ChatConst = require("app.const.ChatConst")
local ChatMiniNode = class("ChatMiniNode")


function ChatMiniNode:ctor(target)
	self._target = target
	self._resourceNode = ccui.Helper:seekNodeByName(self._target, "ResourceNode")
	self._panelRoot = ccui.Helper:seekNodeByName(self._target, "PanelRoot")
	self._panelPrivateChatHint = ccui.Helper:seekNodeByName(self._target, "PanelPrivateChatHint")
	self._buttonWorld = ccui.Helper:seekNodeByName(self._target, "ButtonWorld")
	self._buttonGuild = ccui.Helper:seekNodeByName(self._target, "ButtonGuild")
	
	--[[
	self._mailMenu = ccui.Helper:seekNodeByName(self._target, "MailMenu")
	]]

	self._chatMsgScrollView = nil
	self._msgGap = 4

	self._panelRoot:addClickEventListenerEx(handler(self,self._onClickMsgPanel), true, nil, 0)
	self._buttonWorld:addClickEventListenerEx(handler(self,self._onClickWorldVoice), true, nil, 0)
	self._buttonGuild:addClickEventListenerEx(handler(self,self._onClickGuildVoice), true, nil, 0)
	self._panelPrivateChatHint:addClickEventListenerEx(handler(self,self._onClickUnReadHint), true, nil, 0)
	

	local ChatObject = require("app.data.ChatObject")
    local worldchatObject = ChatObject.new()
	worldchatObject:setChannel(ChatConst.CHANNEL_WORLD)

    local guildChatObject = ChatObject.new()
	guildChatObject:setChannel(ChatConst.CHANNEL_GUILD)

	--[[
	cc.bind(self._mailMenu,"CommonMainMenu")
	]]

	cc.bind(self._buttonWorld,"CommonVoiceBtn")
	cc.bind(self._buttonGuild,"CommonVoiceBtn")
	self._buttonWorld:updateInfo(worldchatObject,handler(self,self._onRecordVoiceTouchListener))
	self._buttonGuild:updateInfo(guildChatObject,handler(self,self._onRecordVoiceTouchListener))

	self._buttonWorld:showChatVoiceViewInCentre()
	self._buttonGuild:showChatVoiceViewInCentre()

	--[[
	self._mailMenu:updateUI(FunctionConst.FUNC_MAIL )
	self._mailMenu:addClickEventListenerEx(handler(self,self._onMenuClick))
]]
	self._scale = self._buttonWorld:getScale()

	--[[
	self._target:registerScriptHandler(function(state)
        if state == "enter" then
            self:onEnter()
        elseif state == "exit" then
            self:onExit()
		end+
    end)
]]
	self:_onCreate()
end

function ChatMiniNode:_onCreate()
	self:_createScrollView()

	self:_createEffectNode(self._panelPrivateChatHint)
end

function ChatMiniNode:onEnter()
	self._signalChatGetMessage = G_SignalManager:add(SignalConst.EVENT_CHAT_GET_MESSAGE, handler(self, self._onEventGetMsg))
   	self._signalRedPointUpdateChart = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))
	self._signalSystemMsgReceive = G_SignalManager:add(SignalConst.EVENT_SYSTEM_MSG_RECEIVE, handler(self, self._onEventSystemMsgReceive))
	self._signalUserLevelUpdate = G_SignalManager:add(SignalConst.EVENT_USER_LEVELUP, handler(self, self._onEventUserLevelUpdate))
	self._signalVoiceRecordChangeNotice = G_SignalManager:add(SignalConst.EVENT_VOICE_RECORD_CHANGE_NOTICE, handler(self, self._onEventVoiceRecordChangeNotice))
	self._signalUICloseChatMainView = G_SignalManager:add(SignalConst.EVENT_CHAT_UI_CLOSE_CHAT_MAIN_VIEW, handler(self, self._onEventUICloseChatMainView))

	self:_refreshOpenState()
	self:_refreshRedPoint()
	self:_refreshScrollView()
end

function ChatMiniNode:onExit()
	self._signalChatGetMessage:remove()
	self._signalChatGetMessage = nil

    self._signalRedPointUpdateChart:remove()
	self._signalRedPointUpdateChart = nil

	self._signalSystemMsgReceive:remove()
    self._signalSystemMsgReceive = nil

	self._signalUserLevelUpdate:remove()
    self._signalUserLevelUpdate =nil

	self._signalVoiceRecordChangeNotice:remove()
	self._signalVoiceRecordChangeNotice  = nil

	self._signalUICloseChatMainView:remove()
	self._signalUICloseChatMainView = nil
end

--收到新聊天消息事件
function ChatMiniNode:_onEventGetMsg(event,chatUnit)
	if not G_UserData:getChat():getChatSetting():isShowMiniMsgOfChannel(chatUnit:getChannel()) then
		return
	end
    if chatUnit:getChannel() == ChatConst.CHANNEL_PRIVATE then
		return
	end
	self._chatMsgScrollView:addNewMsg(chatUnit)
end

--收到系统消息事件
function ChatMiniNode:_onEventSystemMsgReceive(event,systemMsg)
	self._chatMsgScrollView:addNewMsg(systemMsg)
end

--收到红点通知
function ChatMiniNode:_onEventRedPointUpdate(event,funcId)
	if funcId == FunctionConst.FUNC_CHAT or funcId == FunctionConst.FUNC_MAIL then
		self:_refreshRedPoint()
	end
end

-- 角色升级，刷新按钮状态
function ChatMiniNode:_onEventUserLevelUpdate(event, param)
	self:_refreshOpenState()
end

function ChatMiniNode:_refreshOpenState()
	local isOpen = G_UserData:getChat():isFuncOpen()
	self._target:setVisible(isOpen)

	local isFunctionOpen = require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_ARMY_GROUP)
	self._buttonGuild:setVisible(isFunctionOpen)
end

function ChatMiniNode:_createScrollView()
	local ChatMiniMsgItemCell = require("app.scene.view.chat.ChatMiniMsgItemCell")
	--创建私聊消息滚动View
	local msgContainerSize = self._panelRoot:getContentSize()
	local msgList = {}--Enter刷新数据
	self._chatMsgScrollView = ChatMiniMsgScrollView.new(self,msgContainerSize,self._channelId,ChatConst.MAX_MINI_MSG_CACHE_NUM,msgList,
		ChatMiniMsgItemCell,self._msgGap)
	self._chatMsgScrollView:setVisible(true)
	self._panelRoot:addChild(self._chatMsgScrollView)
end

function ChatMiniNode:_refreshScrollView()
	local msgList = G_UserData:getChat():getMiniMsgList()
	self._chatMsgScrollView:refreshData(msgList)
end


function ChatMiniNode:_refreshRedPoint()
	local redPointHelper = require("app.data.RedPointHelper")
    local showRedPoint = redPointHelper.isModuleSubReach(FunctionConst.FUNC_CHAT, "privateChatRp")
	self._panelPrivateChatHint:setVisible(showRedPoint)
--[[
	local redValue2 = redPointHelper.isModuleReach(FunctionConst.FUNC_MAIL)
	self._mailMenu:setVisible(redValue2)
	]]
end

function ChatMiniNode:_createEffectNode(effectRootNode)
	local TextHelper = require("app.utils.TextHelper")
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if TextHelper.stringStartsWith(effect,"effect_") then
            local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect
		else
			return display.newNode()
		end
    end
   local node = G_EffectGfxMgr:createPlayMovingGfx(effectRootNode, "moving_miyu", effectFunction, nil , false )
   return node
end


--设置间距
function ChatMiniNode:setMsgGap(gap)
	 self._msgGap = gap
end

--点击聊天面板
function ChatMiniNode:_onClickMsgPanel(sender)
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT)
	local scene = G_SceneManager:getTopScene()
	if scene and scene:getName() == "main" then
		self._resourceNode:setVisible(false)
	end
end

--点击世界声音按钮
function ChatMiniNode:_onClickWorldVoice(sender)
end

--点击军团声音按钮
function ChatMiniNode:_onClickGuildVoice(sender)
end

--私聊消息未读提示按钮
function ChatMiniNode:_onClickUnReadHint(sender)
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_CHAT,{ChatConst.CHANNEL_PRIVATE} )
end

function ChatMiniNode:_onMenuClick( sender )
	local WayFuncDataHelper	= require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_MAIL)
end


function ChatMiniNode:_onRecordVoiceTouchListener(target,isPress)
    target:setScale(isPress and (self._scale * 1.1) or self._scale)
end


function ChatMiniNode:_onEventVoiceRecordChangeNotice(event,isFinish)
	if isFinish then
		self._buttonWorld:forceFinishRecord()
		self._buttonGuild:forceFinishRecord()
	else
        self._buttonWorld:cancelRecordVoice()
		self._buttonGuild:cancelRecordVoice()
	end
end

function ChatMiniNode:_onEventUICloseChatMainView(event, close)
	self._resourceNode:setVisible(true)
end


function ChatMiniNode:isInRecordVoice()
	return self._buttonWorld:isInRecordVoice() or self._buttonGuild:isInRecordVoice()
end


return ChatMiniNode
