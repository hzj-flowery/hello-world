local ViewBase = require("app.ui.ViewBase")
local ChatView = class("ChatView", ViewBase)

local StoryChat = require("app.config.story_chat")
local Scheduler = require("cocos.framework.scheduler")

local ChatNode = require("app.scene.view.storyChat.ChatNode")
local Hero = require("app.config.hero")

--chat类型
ChatView.TYPE_CHAPTER_START = 1			--第一次进入章节触发

ChatView.ZORDER_BASE = 0
ChatView.ZORDER_LINSTER = 1
ChatView.ZORDER_LINSTER_NAME = 2
ChatView.ZORDER_COVER = 3
ChatView.ZORDER_UP_COVER = 4
ChatView.ZORDER_TALKER = 5
ChatView.ZORDER_DOWN_COVER = 6
ChatView.ZORDER_TALKER_NAME = 7

ChatView.AUTO_SKIP_TIME = 5

--动画相关变量
ChatView.MOVE_TIME = 0.3
ChatView.ENTER_POS_LEFT = cc.p(-100, 320)
ChatView.TALK_POS_LEFT = cc.p(260, 320)
ChatView.ENTER_POS_RIGHT = cc.p(1236, 320)
ChatView.TALK_POS_RIGHT = cc.p(876, 320)

ChatView.ENTER_NAME_LEFT = cc.p(-115, 112)
ChatView.NAME_LEFT = cc.p(205, 112)
ChatView.ENTER_NAME_RIGHT = cc.p(1288, 112)
ChatView.NAME_RIGHT = cc.p(928, 112)

ChatView.ENTER_UP_COVER = cc.p(568, 740)
ChatView.UP_COVER = cc.p(568, 640)
ChatView.ENTER_DOWN_COVER = cc.p(568,-100)
ChatView.DOWN_COVER = cc.p(568, 0)

function ChatView:ctor(touchId, callback)
    self._touchId = touchId
	self._touchList = {}
	self._idx = 0	--放到第几段对话
	self._startTime = 0
	self._roles = {}	--场上人物

	self._panelTouch = nil		--底层黑色
	self._imageUpLine = nil		--上幕布
	self._imageDownLine = nil	--下幕布
	self._panelCover = nil		--角色遮罩层
	self._imageName1 = nil		--左边名字底
	self._textName1 = nil		--左边名字
	self._imageName2 = nil		--右边名字底
	self._textName2 = nil		--右边名字
	self._imageNames = {}

	self._scheduler = nil		--update
	self._startPlay = false
	self._finishPlay = false

	self._callbackHandler = callback	--结束后回调
	self._jumpCallback = nil

	local resource = {
		file = Path.getCSB("ChatView", "storyChat"),
		size = {1136, 640},
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPanelTouch"}}
			},
			_imageJump = {
				events = {{event = "touch", method = "_onJumpTouch"}}
			}
		}
	}
	ChatView.super.ctor(self, resource)
end

function ChatView:onCreate()
	local count = StoryChat.length()
	for i = 1, count do
		local touch = StoryChat.indexOf(i)
		if touch.story_touch == self._touchId then
			table.insert(self._touchList, touch)
		end
	end
	assert(#self._touchList ~= 0 , "chat id is error "..self._touchId)
	table.sort(self._touchList, function(a, b) return a.step < b.step end)
	self:_createRole()
	self._imageNames = {self._imageName1, self._imageName2}
	self._imageName1:setPosition(ChatView.ENTER_NAME_LEFT)
	self._imageName2:setPosition(ChatView.ENTER_NAME_RIGHT)
	self._imageUpLine:setPosition(ChatView.ENTER_UP_COVER)
	self._imageDownLine:setPosition(ChatView.ENTER_DOWN_COVER)
	self:_refreshUI(self._touchList[1])
	local width = math.min(1136, display.width)
	local height = math.min(640, display.height)
	self:setPosition(cc.p(width*0.5, height*0.5))
end

function ChatView:_createRole()
	local info = self._touchList[1]	--最开始根据第一个数据建人物
	local roleLeft = nil
	local roleRight = nil
	if info.speaker_position == 1 then
		roleLeft = ChatNode.new(info.story_res1)
		roleRight = ChatNode.new(info.story_res2)
		self:_setRoleName(info.name1, self._textName1, self._imageName1)
		self:_setRoleName(info.name2, self._textName2, self._imageName2)
	elseif info.speaker_position == 2 then
		roleLeft = ChatNode.new(info.story_res2)
		roleRight = ChatNode.new(info.story_res1)
		self:_setRoleName(info.name2, self._textName1, self._imageName1)
		self:_setRoleName(info.name1, self._textName2, self._imageName2)
	end
	roleRight:turnBack()
	self._panelTouch:addChild(roleLeft)
	roleLeft:setPosition(ChatView.ENTER_POS_LEFT)
	self._panelTouch:addChild(roleRight)
	roleRight:setPosition(ChatView.ENTER_POS_RIGHT)
	self._roles = {roleLeft, roleRight}
end

function ChatView:_setRoleName(name, textLabel, imageName)
	if name == "" then
		imageName:setVisible(false)
	else
		if name == Lang.get("main_role") then
			local myName = G_UserData:getBase():getName()
			textLabel:setString(myName)
		else
			textLabel:setString(name)
		end
		imageName:setVisible(true)
	end
end

function ChatView:setCallback(callback)
	self._callbackHandler = callback
end

function ChatView:_refreshUI(talkInfo)
	local talkerIdx = talkInfo.speaker_position
	local listenerIdx = 2
	if talkerIdx == 2 then
		listenerIdx = 1
		self._imageUpLine:setScaleX(-1)
		self._imageDownLine:setScaleX(-1)
	else
		self._imageUpLine:setScaleX(1)
		self._imageDownLine:setScaleX(1)
	end

-- setLocalZOrder
	self._panelTouch:setLocalZOrder(ChatView.ZORDER_BASE)
	self._imageUpLine:setLocalZOrder(ChatView.ZORDER_UP_COVER)
	self._imageDownLine:setLocalZOrder(ChatView.ZORDER_DOWN_COVER)
	self._roles[talkerIdx]:setLocalZOrder(ChatView.ZORDER_TALKER)
	self._roles[listenerIdx]:setLocalZOrder(ChatView.ZORDER_LINSTER)
	self._imageNames[talkerIdx]:setLocalZOrder(ChatView.ZORDER_TALKER_NAME)
	self._imageNames[listenerIdx]:setLocalZOrder(ChatView.ZORDER_LINSTER_NAME)
	self._panelCover:setLocalZOrder(ChatView.ZORDER_COVER)

end

--检测是否说话的人换了
function ChatView:_checkRoleChange()
	local info = self._touchList[self._idx]
	local pos = info.speaker_position
	--根据info找到左边或者右边的resid
	local resId = {info.story_res1, info.story_res2}
	local name = info.name1
	if info.speaker_position == 2 then
		resId = {info.story_res2, info.story_res1}
	end

	local role = self._roles[pos]
	if resId[pos] ~= 0 and resId[pos] ~= 9999 and role:getResId() ~= resId[pos] then
		self._startPlay = false
		--换人
		role:setLocalZOrder(ChatView.ZORDER_LINSTER)
		local leavePos = ChatView.ENTER_POS_LEFT
		local talkPos = ChatView.TALK_POS_LEFT
		local nameEnterPos = ChatView.ENTER_NAME_LEFT
		local namePos = ChatView.NAME_LEFT
		if pos == 2 then
			leavePos = ChatView.ENTER_POS_RIGHT
			talkPos = ChatView.TALK_POS_RIGHT
			nameEnterPos = ChatView.ENTER_NAME_RIGHT
			namePos = ChatView.NAME_RIGHT
		end


    	local action1 = cc.MoveTo:create(ChatView.MOVE_TIME, leavePos)
    	local action2 = cc.RemoveSelf:create()
    	local action = cc.Sequence:create(action1, action2)
		role:runAction(action)

		local roleNew = ChatNode.new(resId[pos])
		self._panelTouch:addChild(roleNew)
		roleNew:setPosition(leavePos)
		local action1 = cc.MoveTo:create(ChatView.MOVE_TIME, talkPos)
    	local action2 = cc.CallFunc:create(handler(self, self._startTalk))
    	local action = cc.Sequence:create(action1, action2)
		roleNew:runAction(action)
		self._roles[pos] = roleNew

		local nameBG = self._imageNames[pos]:setPosition(nameEnterPos)
		nameBG:runAction(cc.MoveTo:create(ChatView.MOVE_TIME, namePos))

		if pos == 1 then
			self:_setRoleName(name, self._textName1, self._imageName1)
		elseif pos == 2 then
			self:_setRoleName(name, self._textName2, self._imageName2)
			roleNew:turnBack()
		end
		self:_refreshUI(info)
		return true
	end
end

function ChatView:_startTalk()
	self._startPlay = true
	self._startTime = 0
	local info = self._touchList[self._idx]

	local substance = info.substance
	-- if info.story_res2 == 1 then
	local myHeroId = G_UserData:getHero():getRoleBaseId()
	if myHeroId then
		if Hero.get(myHeroId).gender == 2 then
			substance = info.substance2
		end
	end
	-- end
	self._roles[info.speaker_position]:talk(substance, info.face, info.form)
	local listenerIdx = 2
	if info.speaker_position == 2 then
		listenerIdx = 1
	end
	self._roles[listenerIdx]:listen()
	self:_refreshUI(info)
end

function ChatView:_playNext()
	self._idx = self._idx + 1
	if self._idx > #self._touchList then
		self._finishPlay = true
		return
	end
	local info = self._touchList[self._idx]
	local isChangeRole = self:_checkRoleChange()
	if isChangeRole then
		self._startPlay = false
	else
		self:_startTalk()
	end
end

function ChatView:onEnter()
    local action1 = cc.MoveTo:create(ChatView.MOVE_TIME, ChatView.TALK_POS_LEFT)
    local action2 = cc.CallFunc:create(handler(self, self._playNext))
    local action = cc.Sequence:create(action1, action2)
	self._roles[1]:runAction(action)
	self._roles[2]:runAction(cc.MoveTo:create(ChatView.MOVE_TIME, ChatView.TALK_POS_RIGHT))
	self._imageName1:runAction(cc.MoveTo:create(ChatView.MOVE_TIME, ChatView.NAME_LEFT))
	self._imageName2:runAction(cc.MoveTo:create(ChatView.MOVE_TIME, ChatView.NAME_RIGHT))
	self._imageUpLine:runAction(cc.MoveTo:create(ChatView.MOVE_TIME, ChatView.UP_COVER))
	self._imageDownLine:runAction(cc.MoveTo:create(ChatView.MOVE_TIME, ChatView.DOWN_COVER))

	self._scheduler = Scheduler.scheduleGlobal(handler(self, self._update), 0.1)

	--对话要申请触摸
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN)
end

function ChatView:_update(f)
	if self._finishPlay then
		if self._callbackHandler then
			self._callbackHandler()
		end
		self:runAction(cc.RemoveSelf:create())
	end
	if not self._finishPlay and self._startPlay then
		if self._startTime >= ChatView.AUTO_SKIP_TIME then
			self:_playNext()
		else
			self._startTime = self._startTime + f
		end
	end
end

function ChatView:onExit()
	--对话要申请触摸
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)

	Scheduler.unscheduleGlobal(self._scheduler)
	self._scheduler = nil
end

function ChatView:_onPanelTouch()
	if self._startPlay then
		self:_playNext()
	end
end

function ChatView:setJumpCallback(callback)
	self._jumpCallback = callback
end

function ChatView:_onJumpTouch()
	if self._callbackHandler then
		self._callbackHandler()
	end
	if self._jumpCallback then
		self._jumpCallback()
	end
	self:runAction(cc.RemoveSelf:create())
end

function ChatView:setJumpVisible(s)
	self._imageJump:setVisible(s)
end

return ChatView
