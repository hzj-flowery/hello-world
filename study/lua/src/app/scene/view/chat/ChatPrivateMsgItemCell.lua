-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local RichTextHelper = require("app.utils.RichTextHelper")
local ChatPrivateMsgItemCell = class("ChatPrivateMsgItemCell", ListViewCellBase)
local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")
local HonorTitleConst = require("app.const.HonorTitleConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local ChatConst = require("app.const.ChatConst")

 ChatPrivateMsgItemCell.LEFT_SLIDE_DISTANCE =  99--向左滑动的距离

 ChatPrivateMsgItemCell.SLIDE_STATE_NONE = 0  --静止状态
 ChatPrivateMsgItemCell.SLIDE_STATE_MOVE = 1  --移动状态
 ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_LEFT = 2 --滑动状态
 ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_RIGHT = 3 --滑动状态
 ChatPrivateMsgItemCell.SLIDE_STATE_COMPLETE_SHOW_HIDE = 4  --完全显示了隐藏部分

 ChatPrivateMsgItemCell.RICH_TEXT_MAX_LENGTH = 9--最大的长度

function ChatPrivateMsgItemCell:ctor()
    self._nodeMsg = nil--富文本的父节点
	self._commonButtonSmallNormal2 = nil --删除按钮
	self._imageArrow = nil--箭头
	self._textPlayerName = nil--名字
	self._imageSoundFlag = nil--聊天声音图标
	self._commonHeroIcon = nil--头像
	self._imageRedPoint = nil--红点
	self._spriteTitle = nil --称号

	self._callback = nil
	self._chatMsgData = nil
	self._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_NONE

	local resource = {
		file = Path.getCSB("ChatPrivateMsgItemCell", "chat"),
		binding = {
		},
	}
	ChatPrivateMsgItemCell.super.ctor(self, resource)
end

function ChatPrivateMsgItemCell:onCreate()
   	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._imageSoundFlag:setVisible(false)--暂无语音
	--self._imageArrow:addTouchEventListener(handler(self, self._onClickItem))
	self._imageArrow:setSwallowTouches(false)

	self._commonButtonSmallNormal2:addTouchEventListener(handler(self, self._onClickDelete))

	self._commonHeroIcon:setTouchEnabled(true)
	self._commonHeroIcon:setCallBack(handler(self,self.onClickHeroHead))

	self._scrollView:setScrollBarEnabled(false)
	self._scrollView:setSwallowTouches(false)
	self._scrollView:setInertiaScrollEnabled(false)
	self._scrollView:addEventListener(handler(self, self._onScrollViewEventCallBack))
	self._scrollView:addTouchEventListener(handler(self, self._onScrollViewTouchCallBack))
end

function ChatPrivateMsgItemCell:onEnter()
	self._signalRedPointUpdateChart = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))

end

function ChatPrivateMsgItemCell:onExit()
	self._signalRedPointUpdateChart:remove()
	self._signalRedPointUpdateChart = nil
end

function ChatPrivateMsgItemCell:_onEventRedPointUpdate(event,funcId)
	if funcId == FunctionConst.FUNC_CHAT and self._chatMsgData then
		self:_refreshRedPoint()
	end
end

function ChatPrivateMsgItemCell:_refreshRedPoint()
	local playerId = self._chatMsgData:getChatObject():getId()
	local redPointHelper = require("app.data.RedPointHelper")
    local showRedPoint = redPointHelper.isModuleSubReach(FunctionConst.FUNC_CHAT,"personalChatRP",playerId)
	self._imageRedPoint:setVisible(showRedPoint)
end

function ChatPrivateMsgItemCell:onClickHeroHead(sender)
	local chatPlayerData = self._chatMsgData:getChatObject()
    if not chatPlayerData:isSelf() then
        G_SignalManager:dispatch(SignalConst.EVENT_CHAT_SHOW_PLAYER_DETAIL,chatPlayerData)
    end
end

--删除按钮点击
function ChatPrivateMsgItemCell:_onClickDelete(sender,state)
	local UIHelper = require("yoka.utils.UIHelper")
	if UIHelper.isClick(sender,state) then
		if self._chatMsgData then
			G_UserData:getChat():clearPrivateChatMsg(self._chatMsgData)
		end
	end
end

function ChatPrivateMsgItemCell:_onClickItem(sender,state)
	logWarn("______________ChatPrivateMsgItemCell onClickItem")
	local UIHelper = require("yoka.utils.UIHelper")
	if UIHelper.isClick(sender,state) then
		local curSelectedPos = self:getTag()
		self:dispatchCustomCallback(curSelectedPos)
	end
end

function ChatPrivateMsgItemCell:_onScrollViewEventCallBack(sender, eventType)
	logWarn("...."..tostring(eventType))
	if eventType == ccui.ScrollviewEventType.scrollToLeft then
	elseif eventType == ccui.ScrollviewEventType.scrollToRight then
	elseif eventType == ccui.ScrollviewEventType.scrolling then
	elseif eventType == ccui.ScrollviewEventType.containerMoved then
		local x = self._scrollView:getInnerContainer():getPositionX()
		if self._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_LEFT  then
			if x <=  -ChatPrivateMsgItemCell.LEFT_SLIDE_DISTANCE + 5 then--
				self._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_COMPLETE_SHOW_HIDE
			end
		elseif self._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_RIGHT then
			if  x >= -5 then
				self._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_NONE
			end

		end
	elseif eventType == ccui.ScrollviewEventType.autoscrollEnded then
		self:_performWithDelay(function()
			if self._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_LEFT  or
				self._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_RIGHT then
				local x = self._scrollView:getInnerContainer():getPositionX()
				if x <=  -ChatPrivateMsgItemCell.LEFT_SLIDE_DISTANCE + 5 then
					self._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_COMPLETE_SHOW_HIDE
				elseif  x >= -5 then
					self._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_NONE
				else

				end
			end
		end,0.01)

	end
end

function ChatPrivateMsgItemCell:_onScrollViewTouchCallBack(sender,state)
	logWarn(state.."..._onScrollViewTouchCallBack"..self._scrollState)
	if state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		if self._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_NONE then
			local x = self._scrollView:getInnerContainer():getPositionX()
			if x <=  -ChatPrivateMsgItemCell.LEFT_SLIDE_DISTANCE *0.2 then
				logWarn("...scrollToRight")
				self._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_LEFT
				self:_performWithDelay(function()
					self._scrollView:scrollToRight(0.5,true)
				end,0.01)
			elseif x >  -ChatPrivateMsgItemCell.LEFT_SLIDE_DISTANCE *0.2 and  x < 0  then
				logWarn("...scrollToLeft")
				self._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_RIGHT

				self:_performWithDelay(function()
					self._scrollView:scrollToLeft(0.5,true)
				end,0.01)
			else
				self._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_NONE
			end
		end

	end
	if self._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_COMPLETE_SHOW_HIDE then
		logWarn("...scrollToLeft2")
		self._scrollState = ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_RIGHT

		self:_performWithDelay(function()
			self._scrollView:scrollToLeft(0.5,true)
		end,0.01)
	end

	if self._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_LEFT then
		self._scrollView:scrollToRight(0.5,true)
	elseif self._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_SLIDE_TO_RIGHT then
		self._scrollView:scrollToLeft(0.5,true)
	end

	if self._scrollState == ChatPrivateMsgItemCell.SLIDE_STATE_NONE and (state == ccui.TouchEventType.ended)then
		self:_onClickItem(sender,state)
	end
end

--TODO
function ChatPrivateMsgItemCell:_performWithDelay( callback, delay)
    local delay = cc.DelayTime:create(delay)
    local sequence = cc.Sequence:create(delay, cc.CallFunc:create(callback))
    self:runAction(sequence)
    return sequence
end

--创建并添加富文本
function ChatPrivateMsgItemCell:_createMsgRichText(richStr)
    local label = ccui.RichText:createWithContent(richStr)
    label:setAnchorPoint(cc.p(0,0.5))
	label:setCascadeOpacityEnabled(true)
    label:ignoreContentAdaptWithSize(true)--单行
    label:formatText()
	self._nodeMsg:removeAllChildren()
    self._nodeMsg:addChild(label)

    local size = label:getContentSize()
    if size.width > 0 then
        self._nodeMsgBg:setVisible(true)
        local bgSize = self._nodeMsgBg:getContentSize()
		local isVoice  = self._chatMsgData:isVoice() 
        self._nodeMsgBg:setContentSize(cc.size(size.width + (isVoice and (46+17) or 46), bgSize.height))
    else
        self._nodeMsgBg:setVisible(false)
    end
end


function ChatPrivateMsgItemCell:updateInfo(chatMsgData)
	self._chatMsgData  = chatMsgData
	local chatTarget = chatMsgData:getChatObject()
	local chatTargetId = chatMsgData:getChatObjectId()
	local name = chatTarget:getName()
	local baseId = chatTarget:getPlayer_info().covertId
	local content = chatMsgData:getContent()--消息内容
	local officialLevel = chatTarget:getOffice_level()
	local nameColor = Colors.getOfficialColor(officialLevel)
	local frameId = chatTarget:getHead_frame_id()

    -- local nameOutline = Colors.getOfficialColorOutline(officialLevel)
	local isFriend = false

	local isFriend = G_UserData:getFriend():isUserIdInFriendList(chatTargetId)
	if isFriend then 
		self._imageFriend:loadTexture(Path.getTextSignet("img_voice_haoyou"))
	else
		self._imageFriend:loadTexture(Path.getTextSignet("img_voice_moshengren"))
	end

	self._commonHeroIcon:updateIcon(chatTarget:getPlayer_info(), nil, frameId)
	--if frameId ~= nil then 
		--self._commonHeadFrame:updateUI(frameId,self._commonHeroIcon:getScale())
	--end

	self._textPlayerName:setString(name)
	self._textPlayerName:setColor(nameColor)
	require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textPlayerName, officialLevel)

	-- Show Title
	local titile = G_UserData:getChat():getPrivateObjectTitles(chatTargetId)
	if self._spriteTitle ~= nil then
		if titile > 0 then
			local titilePosX = (self._textPlayerName:getPositionX() + self._textPlayerName:getContentSize().width+ChatConst.CHAT_TITLE_OFFSET)
			self._spriteTitle:setPositionX(titilePosX)
            UserDataHelper.appendNodeTitle(self._spriteTitle,titile,self.__cname)
			self._spriteTitle:setVisible(true)
		else
			self._spriteTitle:setVisible(false)
		end
	end

    -- self._textPlayerName:enableOutline(nameOutline,2)
	local isVoice  = self._chatMsgData:isVoice() 
	self._nodeMsg:setPositionX(isVoice and (self._imageSoundFlag:getPositionX()+ 21) or self._imageSoundFlag:getPositionX())
	self._imageSoundFlag:setVisible(isVoice)

	self:_createMsgRichText(self:_createRichStr(content))

	self:_refreshRedPoint()
end

function ChatPrivateMsgItemCell:_createRichStr(content)
	local param = {
        strInput = content,
        textColor = Colors.CHAT_MSG,
        fontSize = 22
    }
	local richElementList = RichTextHelper.parse2MiniRichMsgArr(param,
		ChatPrivateMsgItemCell.RICH_TEXT_MAX_LENGTH )
    local richStr = json.encode(richElementList)
	return richStr
end

function ChatPrivateMsgItemCell:setCallBack(callback)
	if callback then
		self._callback = callback
	end
end

return ChatPrivateMsgItemCell
