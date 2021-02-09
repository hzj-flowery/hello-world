--私人聊天页面
--@Author:Conley
local ViewBase = require("app.ui.ViewBase")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")
local ChatPrivateMsgItemCell = import(".ChatPrivateMsgItemCell")
local ChatMsgScrollView = import(".ChatMsgScrollView")
local ChatConst = require("app.const.ChatConst")
local ChatUnReadMsgNode = import(".ChatUnReadMsgNode")
local ChatPrivateChatView = class("ChatPrivateChatView", ViewBase)

function ChatPrivateChatView:ctor(mainView,channelId)
    self._mainView = mainView
	self._channelId = channelId
	self._isInList = true--是否处于列表状态
	self._currChatPlayerData = nil--当前的聊天玩家数据
	self._listDatas = {}
	self._panelTrim = nil
	self._listItemSource = nil--私聊列表
	self._nodePrivateChatMsg = nil--私聊消息滚动View的父节点
	self._chatMsgScrollView = nil--私聊消息滚动View
	self._textPrivateMsgTitle = nil--私聊标题
	self._nodeReturn = nil --导航按钮
	self._nodeClear = nil--清理按钮
	self._textEmptyListHint = nil --空列表文字提示
	self._nodeMsgNum = nil
    self._chatUnReadMsgNode = nil
    local resource = {
        file = Path.getCSB("ChatPrivateChatView", "chat"),
        binding = {
			_buttonReturn = {
				events = {{event = "touch", method = "_onClickNavigate"}}
			},
			_buttonClear = {
				events = {{event = "touch", method = "_onClickNavigate"}}
			},
		}
    }
    ChatPrivateChatView.super.ctor(self, resource)
end

function ChatPrivateChatView:onCreate()
	self:_initListView(self._listItemSource)
	--创建私聊消息滚动View
	local msgContainerSize = self._panelTrim:getContentSize()
	self._chatMsgScrollView = ChatMsgScrollView.new(self,msgContainerSize,self._channelId,
		ChatConst.MAX_MSG_CACHE_NUM[self._channelId],{},self:_getTemplate())
	self._chatMsgScrollView:setVisible(false)
	self._nodePrivateChatMsg:addChild(self._chatMsgScrollView)
	self._chatUnReadMsgNode = ChatUnReadMsgNode.new(self._nodeMsgNum,self._chatMsgScrollView)
	if G_ConfigManager:isDalanVersion() then
        self._imageWaterFlow:setVisible(false)
    end
end

function ChatPrivateChatView:onEnter()
	self._signalChatGetMultiusersInfo = G_SignalManager:add(SignalConst.EVENT_CHAT_GETNULTIUSERSINFO, handler(self, self._onEventChatObjectsInfo))
	self._signalChatGetMessage = G_SignalManager:add(SignalConst.EVENT_CHAT_GET_MESSAGE, handler(self, self._onEventGetMsg))
	self._signalMemberChangeMessage = G_SignalManager:add(SignalConst.EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE, handler(self, self._onEventMemberChange))
	self._signalChatUnReadMsgNumChange = G_SignalManager:add(
        SignalConst.EVENT_CHAT_UNREAD_MSG_NUM_CHANGE, handler(self, self._onEventChatUnReadMsgNumChange))
	self._signalChatEnterChannel = G_SignalManager:add(
        SignalConst.EVENT_CHAT_ENTER_CHANNEL, handler(self, self._onEventChatEnterChannel))

	self._signalChatMsgListGet = G_SignalManager:add(
        SignalConst.EVENT_CHAT_MSG_LIST_GET, handler(self, self._onEventChatMsgListGet))

	self._signalLoginSuccess = G_SignalManager:add(SignalConst.EVENT_LOGIN_SUCCESS, handler(self, self._onEventLoginSuccess))

	--初始显示人员列表
	if self._isInList then
		self:_showPersonList()
		self:refreshListData()
	else
		self:_refreshPrivateChatWithPlayer(self._currChatPlayerData)
	end
end

function ChatPrivateChatView:onExit()
	self._signalChatGetMultiusersInfo:remove()
	self._signalChatGetMultiusersInfo = nil

	 self._signalChatGetMessage:remove()
     self._signalChatGetMessage = nil

	 self._signalMemberChangeMessage:remove()
	 self._signalMemberChangeMessage = nil

	 self._signalChatUnReadMsgNumChange:remove()
     self._signalChatUnReadMsgNumChange  = nil

	 self._signalChatEnterChannel:remove()
	 self._signalChatEnterChannel = nil

	 self._signalChatMsgListGet:remove()
	 self._signalChatMsgListGet = nil

	 self._signalLoginSuccess:remove()
	 self._signalLoginSuccess = nil
end

function ChatPrivateChatView:_onEventLoginSuccess()
	local playerData = self:getNeedCacheChatPlayerData()
	if playerData then
		G_UserData:getChat():c2SChatGetMsg(playerData:getId())
	end
end



function ChatPrivateChatView:isCanSendMsg()
	return not self._isInList
end

function ChatPrivateChatView:getCurrChatPlayerData()
	return  self._currChatPlayerData
end

function ChatPrivateChatView:getNeedCacheChatPlayerData()
	if self._isInList then
		--清除列表
		return nil
	else
		return  self._currChatPlayerData
	end
end

function ChatPrivateChatView:gotoChatWithPlayer(chatPlayerData)
	if not chatPlayerData then
		return
	end
	local isGet = G_UserData:getChat():isGetPrivateMsgWithPlayer(chatPlayerData:getId())
	if isGet then
		self:_refreshPrivateChatWithPlayer(chatPlayerData)
	else
		 G_UserData:getChat():c2SChatGetMsg(chatPlayerData:getId())
	end
end

function ChatPrivateChatView:_refreshPrivateChatWithPlayer(chatPlayerData,isFirstEnter)
	if not chatPlayerData then
		return
	end



	isFirstEnter = isFirstEnter or false
	if not self._currChatPlayerData or
		self._currChatPlayerData:getId() ~= chatPlayerData:getId() then
		isFirstEnter = true
	end

	self._currChatPlayerData = chatPlayerData

	self:_showChatDetailMsg()
	local privateMsgList = G_UserData:getChat():getPrivateMsgListWithPlayerId(
		self._currChatPlayerData:getId())
	self._chatMsgScrollView:refreshData(privateMsgList,isFirstEnter)
	self._chatMsgScrollView:readMsgsInScreen()
	self._chatMsgScrollView:setChannelVisible(true)
end


function ChatPrivateChatView:_onClickNavigate(sender)
	if self._isInList then
		--清除列表
		G_UserData:getChat():clearAllPrivateChatMsg()
	else
		--返回列表
		self:_showPersonList()
		self:refreshListData()
	end
end

function ChatPrivateChatView:_onClickUnReadMsgView(sender)
	 self._chatMsgScrollView:readAllMsg()
end

-- 收到玩家私聊对象
function ChatPrivateChatView:_onEventChatObjectsInfo(event, message)
	G_UserData:getChat():setPrivateObjectInfo(rawget(message, "infos"))
	self:_refreshListView(self._listItemSource,self._listDatas)
	self._textEmptyListHint:setVisible(false)
end

--收到新聊天消息事件
function ChatPrivateChatView:_onEventGetMsg(event,chatUnit)
    if chatUnit:getChannel() == ChatConst.CHANNEL_PRIVATE then
		if self._isInList then--如果页面处于人员列表页面
			--有消息通知时处理，判断私聊，找到那个成员，刷最新消息
			local index = self:_seekIndexByChatMsgChat(chatUnit)
			--TODO 成员列表有排序，并排序和新消息有关，这里不能刷单个成员
			if index then--找到此成员
				self:_refreshItemNodeByIndex(index,chatUnit)
			else
			   --一般是有新成员
			   	self:refreshListData()
			end
		else--处于消息列表页面
			if self._currChatPlayerData and
				self._currChatPlayerData:getId() == chatUnit:getChatObjectId() then
				self._chatMsgScrollView:addNewMsg(chatUnit,self._mainView:getCurrChannel() == self._channelId)
			end

		end

	end
end

function ChatPrivateChatView:_onEventChatUnReadMsgNumChange(event)
	if not self._isInList then
		self:_refreshAcceptMsgNum()
	end
end

function ChatPrivateChatView:_onEventMemberChange(event)
	self:refreshListData()
end

function ChatPrivateChatView:_onEventChatEnterChannel(event,channelId)
	local channelVisible = self._channelId == channelId and not self._isInList
    if channelVisible then
        --self._chatMsgScrollView:readMsgsInScreen()
		self._chatMsgScrollView:readAllMsg()
    end
	
	self._chatMsgScrollView:setChannelVisible(channelVisible)
end

function ChatPrivateChatView:_onEventChatMsgListGet(event,chatPlayerData)
	if chatPlayerData then
		self:_refreshPrivateChatWithPlayer(chatPlayerData,true)--由于发送了两次请求，这里列表强制拉到底部
	end
end

function ChatPrivateChatView:_getTemplate()
    local ChatMsgItemCell = require("app.scene.view.chat.ChatMsgItemCell")
    return ChatMsgItemCell
end

function ChatPrivateChatView:_initListView(listView)
	listView:setTemplate(ChatPrivateMsgItemCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))
end

function ChatPrivateChatView:_refreshListView(listView,itemList)
	local lineCount = #itemList
	logWarn("ChatPrivateChatView:line  "..lineCount)
	listView:clearAll()
	listView:resize(lineCount)
end

function ChatPrivateChatView:_getListDatas()
	return self._listDatas
end

function ChatPrivateChatView:_seekIndexByChatMsgChat(chatUnit)
	for k,v in ipairs(self._listDatas) do
		if v:getChatObjectId() == chatUnit:getChatObjectId() then
			return k
		end
	end
	return nil
end

function ChatPrivateChatView:_refreshItemNodeByIndex(index,chatUnit)
	local itemNode = self:_findItemNodeByIndex(index)
	if itemNode then
		self._listDatas[index] = chatUnit
		itemNode:updateInfo(chatUnit)
	end
end

function ChatPrivateChatView:_findItemNodeByIndex(index)
	local lineIndex = index
	local items = self._listItemSource:getItems()
	if not items then
		return nil
	end
	local itemCellNode = nil
	for k,v in ipairs(items) do
		if v:getTag() + 1 == lineIndex then
			itemCellNode = v
			break
		end
	end
	return itemCellNode
end

function ChatPrivateChatView:_onItemUpdate(item, index)
	logWarn("ChatPrivateChatView:_onItemUpdate  "..(index+1))
	local itemList = self:_getListDatas()
	local data = itemList[index+1]
	if data then
		item:updateInfo(data)
	end
end

function ChatPrivateChatView:_onItemSelected(item, itemPos)
	logWarn("ChatPrivateChatView:_onItemSelected "..(itemPos+1))
end

function ChatPrivateChatView:_onItemTouch(index, itemPos)
	logWarn("ChatPrivateChatView:_onItemTouch "..tostring(index).." "..tostring(itemPos+1))

	local chatMsgData = self._listDatas[itemPos+1]
	if not chatMsgData then
		return
	end

	--触发两次
	local currChatPlayerData = chatMsgData:getChatObject()
	self:gotoChatWithPlayer(currChatPlayerData)
end

function ChatPrivateChatView:refreshListData()
	self._listDatas = G_UserData:getChat():getPrivateChatLastestMsgList()
	
	local chatObjectList = {}
	for index=1, #self._listDatas do
		local chatTargetId = self._listDatas[index]:getChatObjectId()
		table.insert(chatObjectList, chatTargetId)
	end

	if chatObjectList and #chatObjectList > 0 then
		G_UserData:getChat():c2sGetMultiUserBaseInfo(chatObjectList)
	else
		self:_refreshListView(self._listItemSource,self._listDatas)
		self._textEmptyListHint:setVisible(false)
		--self._textEmptyListHint:setVisible(#self._listDatas <= 0)
	end
end

function ChatPrivateChatView:_showPersonList()
	self._isInList = true
	self._listItemSource:setVisible(true)
	self._chatMsgScrollView:setVisible(false)
	self._chatUnReadMsgNode:setVisible(false)
	self._textPrivateMsgTitle:setVisible(false)


	self._nodeReturn:setVisible(false)
	self._nodeClear:setVisible(true)
	if self._mainView then
		self._mainView:showHintNode(self._channelId,true)
	end
end

function ChatPrivateChatView:_showChatDetailMsg()
	if self._mainView then
		self._mainView:showHintNode(self._channelId,false)
	end
	self._isInList = false
	self._listItemSource:setVisible(false)
	self._chatMsgScrollView:setVisible(true)
	self._chatUnReadMsgNode:setVisible(false)
	self._textPrivateMsgTitle:setVisible(true)
	self._textEmptyListHint:setVisible(false)

	local targetPlayerName = self._currChatPlayerData:getName()

	self._nodeReturn:setVisible(true)
	self._nodeClear:setVisible(false)
	-- self._textPrivateMsgTitle:setString(
	-- 	Lang.get("chat_private_chat_title",{name = targetPlayerName}))
    self._textPrivateMsgTitle:removeAllChildren()
    local officialLevel = self._currChatPlayerData:getOffice_level()
	local targetPlayerNameColor = Colors.getOfficialColor(officialLevel)
    targetPlayerNameColor = Colors.colorToNumber(targetPlayerNameColor)
    logError(Lang.get("chat_private_chat_title", {name = targetPlayerName, color = targetPlayerNameColor}))
    local outlineColor = Colors.getOfficialColorOutlineEx(officialLevel)
    local richText =  ccui.RichText:createWithContent(Lang.get("chat_private_chat_title", {name = targetPlayerName, 
																							color = targetPlayerNameColor}))
    if outlineColor then
    	richText =  ccui.RichText:createWithContent(Lang.get("chat_private_chat_title2", {name = targetPlayerName, 
																							color = targetPlayerNameColor, 
																							outlineColor = Colors.colorToNumber(outlineColor)}))
    end
	richText:setAnchorPoint(cc.p(0,0.5))
	self._textPrivateMsgTitle:addChild(richText)
	self:_refreshAcceptMsgNum()
end



function ChatPrivateChatView:_refreshAcceptMsgNum()
	local playerId = self._currChatPlayerData and self._currChatPlayerData:getId() or 0
    local unReadNum = G_UserData:getChat():geUnReadMsgNumWithObject(playerId)
    self._chatUnReadMsgNode:refreshAcceptMsgNum(unReadNum)
end


return ChatPrivateChatView
