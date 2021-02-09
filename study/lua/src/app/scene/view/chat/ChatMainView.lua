--聊天主View
--@Author:Conley
local PopupBase = require("app.ui.PopupBase")
local ViewBase = require("app.ui.ViewBase")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local TabButtonGroup = require("app.utils.TabButtonGroup")
local UIHelper = require("yoka.utils.UIHelper")
local ChatConst = require("app.const.ChatConst")
local ChatTabContentView = import(".ChatTabContentView")
local ChatSystemMsgContentView = import(".ChatSystemMsgContentView")
local ChatPrivateChatView = import(".ChatPrivateChatView")
local ChatVoiceView = import(".ChatVoiceView")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local UTF8 = require("app.utils.UTF8")
local RichTextHelper = require("app.utils.RichTextHelper")
local UpdateUIHelper = require("app.utils.UpdateUIHelper")
local ChatMainView = class("ChatMainView", PopupBase)
local UserDataHelper = require("app.utils.UserDataHelper")

local POS_OFFSET_X = 15

--@channel:要切换到此聊天频道
--@chatPlayerId
function ChatMainView:ctor(channel,chatPlayerData)
    --数据
    self._channelParam = channel
    self._chatPlayerDataParam = chatPlayerData

	self._selectTabIndex = 0
    self._tabDataList = {}
    self._tabTextList = {}
    
    --节点数据
	self._nodeTab = nil
    self._buttonSetting = nil--设置按钮
    self._buttonVoice = nil--声音按钮
    self._buttonEmoj = nil--表情按钮
    self._buttonSend = nil--发送按钮
    self._buttonAddGuild = nil--加入军团按钮
    self._panelInput = nil--输入框背景
    self._buttonFold = nil--收起按钮
    self._panelRoot = nil
    self._nodeBottom = nil
    self._hintNodeList = {}
    self._nodeSendMsg = nil
    self._nodeVoice = nil--语音面板
    self._chatFaceNode = nil
    self._panelContent = nil--聊天内容父面板，加入世界、军团、私人聊天View
    self._chatModuleUIList = {}--世界、军团、私人聊天View
    --辅助类
	self._tabGroup = nil
	self._inputView = nil
    self._refreshHandler = nil
    self._isShowRecordVoicePanel = false


    local resource = {
        file = Path.getCSB("ChatMainView", "chat"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            _panelTouch = {events = {{event = "touch", method = "_onClickFold"}}},
           	_buttonSetting = {events = {{event = "touch", method = "_onClickSetting"}}},
            _buttonVoice = {events = {{event = "touch", method = "_onClickVoice"}}},
            _buttonEmoj = {events = {{event = "touch", method = "_onClickEmoji"}}},
            _buttonSend = {events = {{event = "touch", method = "_onClickSend"}}},
            _buttonFold = {events = {{event = "touch", method = "_onClickFold"}}},
            _buttonKeyBoard = {events = {{event = "touch", method = "_onClickKeyBoard"}}},
            _buttonAddGuild = {events = {{event = "touch", method = "_onClickAddGuild"}}},
		}
    }
    ChatMainView.super.ctor(self, resource,false,true)
end

function ChatMainView:onCreate()
    self._buttonSend:setString(Lang.get("chat_send_btn_name"))
    self._buttonAddGuild:setString(Lang.get("chat_btn_name_add_guild"))

    self:_initTabGroup()
    self._chatTextLength =  UserDataHelper.getChatParameterById(ChatConst.PARAM_CHAT_TEXT_LENGTH)
    local editBoxParam = {
        bgPanel = self._panelInput,
        placeholder = Lang.get("chat_max_words", {num = self._chatTextLength }),
    }
    local InputUtils = require("app.utils.InputUtils")
    self._inputView = InputUtils.createInputView(
        {
            bgPanel = self._panelInput,
            fontSize = 22,
            fontColor = cc.c4b(0xb6, 0x65, 0x11, 0xff),
            placeholder = Lang.get("chat_max_words", {num = self._chatTextLength }),
            placeholderFontColor = cc.c4b(0xb6, 0x65, 0x11, 0xff),
            maxLength = self._chatTextLength ,
            textLabel = self._textLabel,
        }
    )

    for i = ChatConst.CHANNEL_MIN,ChatConst.CHANNEL_MAX  do
         self._hintNodeList[i] = self["_nodeHint"..i]
    end



    cc.bind(self._buttonRecord,"CommonVoiceBtn")
    self._buttonRecord:updateInfo(nil,handler(self,self._onRecordVoiceTouchListener))
    self._buttonRecord:setGetChatObjectFunc(handler(self,self._getCurrChatObject))
   

    local posLeft = G_ResolutionManager:getBangOffset()
 
    self._panelRoot:setPositionX(self._panelRoot:getPositionX()+posLeft+POS_OFFSET_X)

end

function ChatMainView:_initTabGroup()
    self._tabDataList = UserDataHelper.getShowChatChannelIds()
    self._tabTextList = {}
    for k,v in ipairs(self._tabDataList) do
        table.insert(self._tabTextList, Lang.get("chat_channel_names")[v])
    end

    logWarn("tabIndex------------------- "..tostring(self._selectTabIndex))
    local param = {
        tabIndex = self._selectTabIndex == 0 and nil or self._selectTabIndex,
		rootNode = self._nodeTab,
		callback = handler(self, self._onTabSelect),
        offset   = 2, -- tab间隔像素
		textList =  self._tabTextList,
        updateTabItemCallback = handler(self,self._updateTabItem),
        brightTabItemCallback = handler(self,self._brightTabItem),
	}
  

    if not self._tabGroup then
        self._tabGroup = TabButtonGroup.new(param)
    else
        self._tabGroup:recreateTabs(param)
    end
end

function ChatMainView:_updateTabItem(tabItem)
    local index = tabItem.index
    local text =  self._tabTextList[index] or ""
    local textWidget = tabItem.textWidget
    local normalImage = tabItem.normalImage
    local downImage =  tabItem.downImage
    normalImage:setVisible(true)
    downImage:setVisible(false)
    
    local isLoadImage = self:_checkTabImageText(tabItem)
    
    if textWidget then
        if isLoadImage then
            textWidget:setVisible(false)
        else
            textWidget:setVisible(true)
            textWidget:setString(text)
        end
    end
end

--检查显示tab图片文字
function ChatMainView:_checkTabImageText(tabItem, bright)
    bright = bright or false --默认没选中
    local imageWidget = tabItem.imageWidget
    if imageWidget == nil then
        return false
    end

    imageWidget:setVisible(false)

    local index = tabItem.index
    local channelId = self:_getChannelWithIndex(index)
    if channelId == ChatConst.CHANNEL_CROSS_SERVER then --跨服频道
        local imageRes = bright and "voice_kuafu" or "voice_kuafu2"
        imageWidget:setVisible(true)
        imageWidget:loadTexture(Path.getTextVoice(imageRes))
        return true
    end
    return false
end

function ChatMainView:_brightTabItem(tabItem,bright)
    local textWidget = tabItem.textWidget
    local imageWidget = tabItem.imageWidget
    local normalImage = tabItem.normalImage
    local downImage =  tabItem.downImage
    normalImage:setVisible(not bright)
    downImage:setVisible(bright)
    local isLoadImage = self:_checkTabImageText(tabItem, bright)
    if isLoadImage then
        textWidget:setVisible(false)
    else
        textWidget:setVisible(true)
        textWidget:setColor(bright and  Colors.CHAT_TAB_BRIGHT or Colors.CHAT_TAB_NORMAL)
        -- textWidget:enableOutline(bright and Colors.CHAT_TAB_BRIGHT_OUTLINE or Colors.CHAT_TAB_NORMAL_OUTLINE ,2)
    end
end

function ChatMainView:_isEnableTab(index)
    local channelId = self:_getTabDataByIndex(index)
    if channelId == ChatConst.CHANNEL_GUILD then
        local isInGuild = G_UserData:getGuild():isInGuild()
        return isInGuild
    end
    return true
end

function ChatMainView:_refreshRedPoint()
    local tabDataList = self:_getTabDataList()
	for k,channelId in ipairs(tabDataList) do
        local redPointHelper = require("app.data.RedPointHelper")
        local red = redPointHelper.isModuleReach(FunctionConst.FUNC_CHAT,channelId)
		self._tabGroup:setRedPointByTabIndex(k,red)
	end
end


function ChatMainView:onEnter()
    --接受新聊天消息事件
    self._signalSendSuccess = G_SignalManager:add(SignalConst.EVENT_CHAT_SEND_SUCCESS, handler(self, self._onEventSendSuccess))
    self._signalChatSelecteFace = G_SignalManager:add(SignalConst.EVENT_CHAT_SELECTE_FACE, handler(self, self._onEventSelectedFace))
    self._signalChatShowPlayerDetail = G_SignalManager:add(SignalConst.EVENT_CHAT_SHOW_PLAYER_DETAIL, handler(self, self._onEventChatShowPlayerDetail))
    self._signalRedPointUpdateChart = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))
    self._signalVoiceRecordChangeNotice = G_SignalManager:add(SignalConst.EVENT_VOICE_RECORD_CHANGE_NOTICE, handler(self, self._onEventVoiceRecordChangeNotice))
    self._signalChatCopyMsg = G_SignalManager:add(SignalConst.EVENT_CHAT_COPY_MSG, handler(self, self._onEventChatCopyMsg))
    self._signalGroupMyGroupChatChange = G_SignalManager:add(SignalConst.EVENT_GROUP_MY_GROUP_CHAT_CHANGE, handler(self, self._onEventGroupMyGroupChatChange))
    



    if self._refreshHandler == nil then
        self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),0.5)
	end
    self:refreshUI(self._channelParam,self._chatPlayerDataParam)

    local runningScene = G_SceneManager:getRunningScene()
	runningScene:addGetUserBaseInfoEvent()

    self._inputView:setText(G_UserData:getChat():getLastInputCache())
    G_UserData:getChat():setLastInputCache("")

    self:_refreshRedPoint()
    self:_refreshInputState()
   
end

function ChatMainView:onExit()
    self._signalSendSuccess:remove()
    self._signalSendSuccess = nil

    self._signalChatSelecteFace:remove()
    self._signalChatSelecteFace = nil

    self._signalChatShowPlayerDetail:remove()
    self._signalChatShowPlayerDetail = nil

    self._signalRedPointUpdateChart:remove()
    self._signalRedPointUpdateChart = nil

    self._signalVoiceRecordChangeNotice:remove()
    self._signalVoiceRecordChangeNotice = nil

    self._signalChatCopyMsg:remove()
    self._signalChatCopyMsg = nil

    self._signalGroupMyGroupChatChange:remove()
    self._signalGroupMyGroupChatChange = nil

    if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end

    local channel = self:_getCurrTabData()

    --保存当前选中的频道和聊天对象
    G_UserData:getChat():setLastUISelectedChannel(channel)




    if channel == ChatConst.CHANNEL_PRIVATE  then
        local activityModuleUI = self:_getActivityModuleUI(self._selectTabIndex)
        G_UserData:getChat():setLastUISelectedChatPlayerData(
            activityModuleUI:getNeedCacheChatPlayerData()
        )
    end

     G_UserData:getChat():setLastInputCache(self._inputView:getText())

end

function ChatMainView:refreshUI(channel,chatPlayerData)
    self._channelParam = channel
    self._chatPlayerDataParam = chatPlayerData



    channel = channel or G_UserData:getChat():getLastUISelectedChannel()
    if channel == ChatConst.CHANNEL_PRIVATE then
         if not chatPlayerData then
             chatPlayerData =  G_UserData:getChat():getLastUISelectedChatPlayerData()
         else
            G_UserData:getChat():createChatSessionWithPlayer(chatPlayerData,false)
         end
    end



    local tabIndex = self:_getTabIndexByChannel(channel)
    if not tabIndex then
        logWarn("setTabIndex-------------------1")
        self._tabGroup:setTabIndex(1)

    elseif self:_isEnableTab(tabIndex) then--有可能不能进入频道（比如军团）
        self._tabGroup:setTabIndex(tabIndex)
        logWarn("setTabIndex-------------------"..tabIndex)
        if channel == ChatConst.CHANNEL_PRIVATE and chatPlayerData then
            local activityModuleUI = self:_getActivityModuleUI(tabIndex)
            activityModuleUI:gotoChatWithPlayer(chatPlayerData)
        end
    else
        self._tabGroup:setTabIndex(1)
    end
end

function ChatMainView:_onRefreshTick( dt )
    self:_refreshCDTime()
end

function ChatMainView:_refreshCDTime()
    --刷新CD 时间
    local channel =  self:_getCurrSendMsgChannel() --self:_getCurrTabData()

    local cdTime = G_UserData:getChat():getCDTime(channel)

    local btnTxt = ""
    if cdTime > 0 then
        btnTxt = Lang.get("chat_send_cd_of_btn",{num = cdTime})
    else
        btnTxt = Lang.get("chat_send_btn_name")
    end
    self._buttonSend:setString(btnTxt)
end

function ChatMainView:_getTabIndexByChannel(channelId)
    for k,v in ipairs(self._tabDataList) do
        if v == channelId then
            return k
        end
    end
    return nil
end

function ChatMainView:_getChannelWithIndex(index)
    for k, v in ipairs(self._tabDataList) do
        if k == index then
            return v
        end
    end
    return nil
end

--收到发送表情事件
function ChatMainView:_onEventSelectedFace(event,faceId)
	local currentStr = self._inputView:getText()
	currentStr = currentStr .. "#" .. tostring(faceId) .. "#"


    --currentStr = RichTextHelper.getSubText (currentStr, chatTextLength)
    if UTF8.utf8len (currentStr)  > self._chatTextLength  then--android操过了设置的长度会崩溃 --string.len(currentStr)
        return
    end
	self._inputView:setText(currentStr)
end

function ChatMainView:_onEventChatCopyMsg(event,txt)
    self._inputView:setText(txt)
end

function ChatMainView:_onEventGroupMyGroupChatChange()
    self:_refreshInputState()
end

--收到聊天消息发送成功
function ChatMainView:_onEventSendSuccess(event)
	self._inputView:setText("") --清空输入文本
    self:_refreshCDTime()
end

function ChatMainView:_onEventChatShowPlayerDetail(event,chatPlayerData)
    --local popupPlayerDetail = require("app.scene.view.chat.ChatPopupPlayerDetail").new(self,chatPlayerData)
	--popupPlayerDetail:openWithAction()

    G_UserData:getBase():c2sGetUserBaseInfo(chatPlayerData:getId())

end

function ChatMainView:_onEventRedPointUpdate(event,funcId)
    if funcId == FunctionConst.FUNC_CHAT then
        logWarn("tabIndex------------------- FUNC_CHAT")
		self:_refreshRedPoint()
	end
end

function ChatMainView:_onTabSelect(index, sender)

	if self._selectTabIndex == index then
		return false
	end
	self._selectTabIndex = index

    --右边内容视图切换
	for i,view in pairs(self._chatModuleUIList) do
		view:setVisible(false)
	end
	local activityModuleUI = self:_getActivityModuleUI(index)
	activityModuleUI:setVisible(true)

    self._buttonRecord:updateInfo(self:_getCurrChatObject(),handler(self,self._onRecordVoiceTouchListener))

    local channelId = self:_getTabDataByIndex(index)
    G_SignalManager:dispatch(SignalConst.EVENT_CHAT_ENTER_CHANNEL,channelId)


    self:_refreshInputState()
    self:_refreshCDTime()
end


function ChatMainView:showHintNode(channelId,needShow)
    self._nodeSendMsg:setVisible(not needShow)
    for k,v in pairs(self._hintNodeList) do
        if k == channelId then
            v:setVisible(needShow)
        else
            v:setVisible(false)
        end
    end
end

function ChatMainView:_onClickAddGuild()
    local sceneName = G_SceneManager:getRunningScene():getName()
    if sceneName == "fight" then
        G_Prompt:showTip(Lang.get("chat_pk_hint_when_infight"))
        return
    end

    local isInGuild = G_UserData:getGuild():isInGuild()
    if isInGuild == false then
        local WayFuncDataHelper	=require("app.utils.data.WayFuncDataHelper")
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_ARMY_GROUP)
        return
    end
end
function ChatMainView:_getTabDataList()
    return self._tabDataList
end

function ChatMainView:_getTabDataByIndex(index)
    local tabDataList = self:_getTabDataList()
    if not tabDataList then
        return
    end
    return tabDataList[index]
end

function ChatMainView:getCurrChannel()
    return self:_getCurrTabData()
end

function ChatMainView:_getCurrSendMsgChannel()
    local channelId =  self:getCurrChannel()
    if channelId == ChatConst.CHANNEL_ALL then
        return ChatConst.CHANNEL_WORLD
    end
    return channelId
end

function ChatMainView:_getCurrChatObject()
    local ChatObject = require("app.data.ChatObject")
    local chatObject = ChatObject.new()
    local sendMsgChannel = self:_getCurrSendMsgChannel()
    local chatPlayerData = nil
    if sendMsgChannel == ChatConst.CHANNEL_PRIVATE then
        local activityModuleUI = self:_getActivityModuleUI(self._selectTabIndex)
        if activityModuleUI then chatPlayerData =  activityModuleUI:getCurrChatPlayerData() end
    end
    chatObject:setChannel(sendMsgChannel)
    chatObject:setChatPlayerData(chatPlayerData)
    return chatObject
end


function ChatMainView:_getCurrTabData()
    local tabDataList = self:_getTabDataList()
    if not tabDataList then
        return
    end
    return tabDataList[self._selectTabIndex]
end

function ChatMainView:_onClickSetting(sender)
    local popupChatSetting = require("app.scene.view.chat.PopupChatSetting").new()
	popupChatSetting:openWithAction()

    --local  rollMsg = {msg = "恭喜#name#在酒馆中抽中#hero#！恭喜小王将曹操成功突破到5，战力大涨！恭喜小王将曹操成功突破到5，战力大涨！",noticeType = 2,param = "727514|1|0,张角|2|5",sendId = 0}
	--G_UserData:getRollNotice():_onAddNewMessage(rollMsg)
end

function ChatMainView:_onClickEmoji(sender)
    if not self._chatFaceNode then
        self._chatFaceNode = require("app.scene.view.chat.ChatFaceView").new()
        self:addChild(self._chatFaceNode)
    end
    self._chatFaceNode:setVisible(true)
	--popupChatFace:openWithAction()
end

function ChatMainView:_onClickSend(sender)

    local channel = self:_getCurrTabData()
    local sendMsgChannel = self:_getCurrSendMsgChannel()
    local activityModuleUI = self:_getActivityModuleUI(self._selectTabIndex)
    if not channel or not activityModuleUI then
        return
    end
    if sendMsgChannel == ChatConst.CHANNEL_PRIVATE and not activityModuleUI:isCanSendMsg() then
         G_Prompt:showTip(Lang.get("chat_select_private_chat_player_hint"))
        return
    end




    local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
    if not LogicCheckHelper.chatMsgSendCheck(sendMsgChannel,true) then
        return
    end

    local str = self._inputView:getText()
    if str == "" then
        G_Prompt:showTip(Lang.get("chat_no_input_txt"))
        return
    end

    ---此处控制输入的字符长度
    str = RichTextHelper.getSubText(str, self._chatTextLength)

    local chatPlayerData = nil
    if sendMsgChannel == ChatConst.CHANNEL_PRIVATE then
        chatPlayerData =  activityModuleUI:getCurrChatPlayerData()
    end

    local BlackList = require("app.utils.BlackList")
    str = BlackList.filterBlack(str) --过滤禁词
    --如果有|将其替换为*
    str = string.gsub(str, "|", "*")
    str = string.gsub(str, "\n", "")
    str = string.gsub(str, "\r", "")
    local content = str
    -- G_UserData:getChat():c2sChatRequest(sendMsgChannel,content,chatPlayerData)
    G_GameAgent:checkTalkAndSend(sendMsgChannel,content,chatPlayerData)

    --chatInput
end

function ChatMainView:_onClickFold(sender)
    self:_closeWindow()
    G_SignalManager:dispatch(SignalConst.EVENT_CHAT_UI_CLOSE_CHAT_MAIN_VIEW, true)
end


function ChatMainView:forceClose()
   -- if self._normalCloseFlag then
    G_UserData:getChat():setLastInputCache(self._inputView:getText())--被迫关闭聊天时才缓存文字消息
    self:removeFromParent()
   -- end
end

function ChatMainView:_onClickVoice(sender)
    self._isShowRecordVoicePanel  = true
    self._nodeBottom:setVisible(not self._isShowRecordVoicePanel)
    self._nodeVoice:setVisible(self._isShowRecordVoicePanel)

    self._buttonRecord:updateInfo(self:_getCurrChatObject(),handler(self,self._onRecordVoiceTouchListener))
end

function ChatMainView:_onClickKeyBoard(sender)
    self._isShowRecordVoicePanel  = false
    self._nodeBottom:setVisible(not self._isShowRecordVoicePanel)
    self._nodeVoice:setVisible(self._isShowRecordVoicePanel)
end

function ChatMainView:_closeWindow()
    local posX = self._buttonFold:getPositionX()
    local callAction = cc.CallFunc:create(function()
        self:removeFromParent()
	end)
	local action = cc.MoveBy:create(0.3,cc.p(-posX,0))
	local runningAction = cc.Sequence:create(action,callAction)
	self:runAction(runningAction)
end

function ChatMainView:_getActivityModuleUI(index)
	local chatModuleUI = self._chatModuleUIList[index]
	if chatModuleUI == nil then
		local channelId = self:_getTabDataByIndex(index)
        local msgContainerSize = self._panelContent:getContentSize()
        if channelId == ChatConst.CHANNEL_ALL then
            chatModuleUI = ChatTabContentView.new(self,channelId)
        elseif channelId == ChatConst.CHANNEL_SYSTEM then
			chatModuleUI = ChatSystemMsgContentView.new(self,channelId)
		elseif channelId ==  ChatConst.CHANNEL_WORLD  then
			chatModuleUI = ChatTabContentView.new(self,channelId)
		elseif channelId == ChatConst.CHANNEL_GUILD  then
			chatModuleUI = ChatTabContentView.new(self,channelId)
		elseif channelId == ChatConst.CHANNEL_PRIVATE then
			chatModuleUI = ChatPrivateChatView.new(self,channelId)
        elseif channelId == ChatConst.CHANNEL_TEAM  then
            chatModuleUI = ChatTabContentView.new(self,channelId)
        elseif channelId == ChatConst.CHANNEL_CROSS_SERVER then
            chatModuleUI = ChatTabContentView.new(self,channelId)
		end
		self._panelContent:addChild(chatModuleUI)
		self._chatModuleUIList[index] = chatModuleUI
	end
	return chatModuleUI
end

function ChatMainView:_refreshInputState()
    --切换标签页逻辑，未加入军团时的显示逻辑
    local channelId = self:_getTabDataByIndex(self._selectTabIndex)
    if channelId == ChatConst.CHANNEL_GUILD then
        local isInGuild = G_UserData:getGuild():isInGuild()
        self:showHintNode(channelId,isInGuild == false)
    elseif channelId == ChatConst.CHANNEL_PRIVATE then
        local activityModuleUI = self:_getActivityModuleUI(self._selectTabIndex)
        if activityModuleUI.isCanSendMsg and activityModuleUI:isCanSendMsg() then
            self:showHintNode(channelId,false)
        else
            self:showHintNode(channelId,true)
        end
    elseif channelId == ChatConst.CHANNEL_WORLD then
        self:showHintNode(channelId,false)
    elseif channelId == ChatConst.CHANNEL_ALL then
		self:showHintNode(channelId,false)
    elseif channelId == ChatConst.CHANNEL_TEAM then
        local showSendUI = G_UserData:getGroups():getMyGroupData() ~= nil
        self:showHintNode(channelId,not showSendUI)
    elseif channelId == ChatConst.CHANNEL_CROSS_SERVER then
        local showSendUI = UserDataHelper.isCanCrossServerChat()
        self:showHintNode(channelId, not showSendUI)
    else
        self:showHintNode(channelId,false)
    end
end


function ChatMainView:_getTemplate()
    local ChatMsgItemCell = require("app.scene.view.chat.ChatMsgItemCell")
    return ChatMsgItemCell
end

function ChatMainView:_onRecordVoiceTouchListener(target,isPress)
    target:loadTexture(Path.getVoiceRes(isPress and "btn_chat06_dow" or  "btn_chat06_nml"))
end

function ChatMainView:_onEventVoiceRecordChangeNotice(event,isFinish)
	if isFinish then
		self._buttonRecord:forceFinishRecord()
	else
        self._buttonRecord:cancelRecordVoice()
	end
end


return ChatMainView
