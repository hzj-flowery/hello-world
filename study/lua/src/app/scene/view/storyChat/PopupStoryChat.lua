local PopupBase = require("app.ui.PopupBase")
local PopupStoryChat = class("PopupStoryChat", PopupBase)


local StoryChat = require("app.config.story_chat")
local Scheduler = require("cocos.framework.scheduler")
local Hero = require("app.config.hero")
local HeroRes = require("app.config.hero_res")
local StoryChatLength = require("app.config.story_chat_length")


--chat类型
PopupStoryChat.TYPE_CHAPTER_START = 1			--第一次进入章节触发

PopupStoryChat.ZORDER_BASE = 0          
PopupStoryChat.ZORDER_LINSTER = 1           --听话的人
PopupStoryChat.ZORDER_COVER = 2             --黑色遮罩
PopupStoryChat.ZORDER_TALKER = 3            --说话的人
PopupStoryChat.ZORDER_CONTENT_PANEL = 4     --说话面板
PopupStoryChat.ZORDER_TOUCH = 5				--触摸层
PopupStoryChat.ZORDER_JUMP = 6              --跳过按钮

PopupStoryChat.ROLE_LEFT = 1
PopupStoryChat.ROLE_RIGHT = 2

PopupStoryChat.AUTO_SKIP_TIME = 5
PopupStoryChat.DEFAULT_SOUND_LENGTH = 10

function PopupStoryChat:ctor(touchId, callback, isTutorial)
    self._touchId = touchId
	self._touchList = {}
	self._soundList = {}
	self._idx = 0	--放到第几段对话
	self._startTime = 0
    self._roles = {}	--场上人物  1,左， 2，右

	self._panelTouch = nil		--触摸版
	self._panelCover = nil		--黑色遮罩层

	self._scheduler = nil		--update
	self._startPlay = false

	self._callbackHandler = callback	--结束后回调
	self._jumpCallback = nil        --跳过时候特殊回掉

	self._isTutorial = isTutorial

	self._nowPlayId = nil
	self._hasSound = false	--播放的对话有没有配语音

	self._signalSpineLoaded = nil

	self._spineIdList = {}

	-- self._signalSoundEnd = nil

	self._myHeroId = G_UserData:getHero():getRoleBaseId()	--我的英雄id

	self._soundLength = PopupStoryChat.DEFAULT_SOUND_LENGTH		--声音长度

	local resource = {
		file = Path.getCSB("StoryChatView", "storyChat"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPanelTouch"}}
			},
			_imageJump = {
				events = {{event = "touch", method = "_onJumpTouch"}}
			}
		}
	}
	self:setName("PopupStoryChat")
	PopupStoryChat.super.ctor(self, resource, false, true)
end

function PopupStoryChat:onCreate()
	self._spineIdList = {}
	local count = StoryChat.length()
	for i = 1, count do
		local touch = StoryChat.indexOf(i)
		if touch.story_touch == self._touchId then
			table.insert(self._touchList, touch)
		end
	end

	for i = 1, #self._touchList do
		local touch = self._touchList[i]
		local sound = touch.common_sound
		local myHeroId = self._myHeroId
		if myHeroId then
			if Hero.get(myHeroId).gender == 2 then
				sound = touch.common_sound2
			end
		end
		local soundPath = Path.getSkillVoice(sound)
		G_AudioManager:preLoadSound(soundPath)
		table.insert(self._soundList, soundPath)

		if touch.story_res1 ~= 1 then
			self:_addSpine(touch.story_res1)
		end 
		if touch.story_res2 ~= 1 then 
			self:_addSpine(touch.story_res2)
		end
		self:_addSpine(self._myHeroId)
	end

	assert(#self._touchList ~= 0 , "chat id is error "..self._touchId)
    table.sort(self._touchList, function(a, b) return a.step < b.step end)

    self._panelCover:setLocalZOrder(PopupStoryChat.ZORDER_COVER)
    self._panelChat:setLocalZOrder(PopupStoryChat.ZORDER_CONTENT_PANEL)
	self._panelTouch:setLocalZOrder(PopupStoryChat.ZORDER_TOUCH)
    self._imageJump:setLocalZOrder(PopupStoryChat.ZORDER_JUMP)

	local resolutionSize =  G_ResolutionManager:getDesignCCSize()
	self._panelCover:setContentSize(cc.size( resolutionSize.width*2, resolutionSize.height*2))
	self._panelCover:setTouchEnabled(true)
	self._panelCover:addClickEventListenerEx(handler(self, self.onTouchHandler))

end


function PopupStoryChat:_addSpine(id)
	local heroData = Hero.get(id)
	if not heroData then 
		return 
	end
	local resId = heroData.res_id
	local resData = HeroRes.get(resId)
	local spineId = resData.story_res_spine
	if spineId == 0 then 
		return 
	end
	for i, v in pairs(self._spineIdList) do 
		if v == spineId then 
			return 
		end
	end
	print("1112233 insert spine = ", spineId, id)
	table.insert(self._spineIdList, spineId)
end

function PopupStoryChat:_cacheSpine()
	local spineList = self._spineIdList
	self._loadCount = 0
	self._totalSpine = #spineList
	for i, v in pairs(spineList) do 
		G_SpineManager:addSpineAsync(Path.getStorySpine(v), 1, function ()
			G_SignalManager:dispatch(SignalConst.EVENT_CHAT_SPINE_LOADED)
		end, self)	
	end
end

function PopupStoryChat:onTouchHandler( ... )
	-- body
	logWarn("PopupStoryChat:onTouchHandler")
end
function PopupStoryChat:onEnter()

	self:setPosition(cc.p(0, 0))
	
    self._panelChat:setVisible(false)
	self._scheduler = Scheduler.scheduleGlobal(handler(self, self._update), 0.1)

	self._signalSpineLoaded = G_SignalManager:add(SignalConst.EVENT_CHAT_SPINE_LOADED, handler(self, self._onSpineLoaded))
	
	self:_cacheSpine()
	
	-- self._signalSoundEnd = G_SignalManager:add(SignalConst.EVENT_SOUND_END, handler(self, self._onEventSoundEnd))

	--对话要申请触摸
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN)
end

function PopupStoryChat:onExit()
	for i, v in pairs(self._soundList) do 
		G_AudioManager:unLoadSound(v)
	end
	self._signalSpineLoaded:remove()
	self._signalSpineLoaded = nil

	G_SpineManager:removeSpineLoadHandlerByTarget(self)
	-- self._signalSoundEnd:remove()
	-- self._signalSoundEnd = nil
end

function PopupStoryChat:onClose()
	--对话要申请触摸
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)
	if self._nowPlayId then 
		G_AudioManager:stopSound(self._nowPlayId)
		self._nowPlayId = nil
	end
	if self._scheduler then 
		Scheduler.unscheduleGlobal(self._scheduler)
		self._scheduler = nil
	end
	if self._callbackHandler then
		self._callbackHandler()
		self._callbackHandler = nil
	end

end

function PopupStoryChat:_onSpineLoaded()
	self._loadCount = self._loadCount + 1
	if self._loadCount == self._totalSpine then 
		self:_playNext()
	end
end

function PopupStoryChat:_playNext()
	self._startPlay = false
	self._idx = self._idx + 1
	if self._idx > #self._touchList then
        self:_talkEnd()
        return
	end
	self._startPlay = true
	self._startTime = 0
	self:_refreshTalk()
end

function PopupStoryChat:_refreshTalk()
    self:_refreshTalker()
    self:_refreshListener()
end

function PopupStoryChat:_refreshTalker()
    local talkData = self._touchList[self._idx]
    local speakerPos = talkData.speaker_position
    local role = self._roles[speakerPos]
    if not role then
        local chatNode = require("app.scene.view.storyChat.PopupStoryChatNode").new(talkData.story_res1, speakerPos, self._myHeroId)
        local baseNode = self:getResourceNode()
        baseNode:addChild(chatNode)
        self._roles[speakerPos] = chatNode
        chatNode:enterStage(handler(self, self._refreshTalkContent))
    elseif role and role:getHeroId() ~= talkData.story_res1 then
        role:leaveStage()
        local chatNode = require("app.scene.view.storyChat.PopupStoryChatNode").new(talkData.story_res1, speakerPos, self._myHeroId)
        local baseNode = self:getResourceNode()
        baseNode:addChild(chatNode)
        self._roles[speakerPos] = chatNode
        chatNode:enterStage(handler(self, self._refreshTalkContent))
    else
        self:_refreshTalkContent()
    end
    self._roles[speakerPos]:setLocalZOrder(PopupStoryChat.ZORDER_TALKER)
end

function PopupStoryChat:_refreshListener()
    local talkData = self._touchList[self._idx]
    local speakerPos = talkData.speaker_position
    local listenPos = PopupStoryChat.ROLE_RIGHT
    if speakerPos == PopupStoryChat.ROLE_RIGHT then
        listenPos = PopupStoryChat.ROLE_LEFT
    end  

    local role = self._roles[listenPos]
    if role then
        role:setLocalZOrder(PopupStoryChat.ZORDER_LINSTER)
    end

    local res2 = talkData.story_res2
    if res2 == 0 or res2 == 999 then
        return
    end
    if role and role:getHeroId() == res2 then
        return
    end

    if role then
        role:leaveStage()
        self._roles[listenPos] = nil
    end
    local chatNode = require("app.scene.view.storyChat.PopupStoryChatNode").new(res2, listenPos, self._myHeroId)
    local baseNode = self:getResourceNode()
    baseNode:addChild(chatNode)
    self._roles[listenPos] = chatNode
    chatNode:setLocalZOrder(PopupStoryChat.ZORDER_LINSTER)
    chatNode:enterStage()
end

function PopupStoryChat:_refreshTalkContent()
    self._panelChat:setVisible(true)
	local talkData = self._touchList[self._idx]
	local showName = talkData.name1
	if talkData.name1 == Lang.get("main_role") then
		showName = G_UserData:getBase():getName()
	end
    self._chatName:setString(showName)
    -- self._chatContent:setString(talkData.substance)

	local substance = talkData.substance
	local sound = talkData.common_sound
    local myHeroId = self._myHeroId
	if myHeroId then
		if Hero.get(myHeroId).gender == 2 then
			sound = talkData.common_sound2
			substance = talkData.substance2
		end
	end
    local richText = self:_parseDialogueContent(
        substance,
        26,
        Colors.getChatNormalColor(),
        self._chatContent:getContentSize()
    )
    if self._richTextNode then
        self._richTextNode:removeFromParent()
    end

    self._chatContent:addChild(richText)
    richText:setAnchorPoint(cc.p(0.5, 0.5))
    local posX = self._chatContent:getContentSize().width/2
    local posY = self._chatContent:getContentSize().height/2
    richText:setPosition(posX, posY)
	self._richTextNode = richText
	
	self._hasSound = false
	--播放声音
	if G_AudioManager:isSoundEnable() and sound ~= "" then 
		local mp3 = Path.getSkillVoice(sound)
		if self._nowPlayId then 
			G_AudioManager:stopSound(self._nowPlayId)
			self._nowPlayId = nil
		end
		self._nowPlayId = G_AudioManager:playSound(mp3)
		-- if self._idx <= #self._touchList and self._nowPlayId then
		-- 	G_AudioManager:setCallback(self._nowPlayId, handler(self, self._playNext))
		-- end
		self._soundLength = math.ceil(StoryChatLength.get(sound).length/1000) 
		self._hasSound = true
	end
end

function PopupStoryChat:_talkEnd()
	self._startPlay = false
	self:close()
end

function PopupStoryChat:_onPanelTouch()
	self:_playNext()
end

function PopupStoryChat:setJumpCallback(callback)
	self._jumpCallback = callback
end

function PopupStoryChat:_onJumpTouch()
    if self._jumpCallback then
		self._jumpCallback()
	end
    self:_talkEnd()
end

function PopupStoryChat:_update(f)
	if self._startPlay then
		self._startTime = self._startTime + f
		if not self._hasSound then
			if self._startTime >= PopupStoryChat.AUTO_SKIP_TIME then
				self:_playNext()
			end
		else 
			if self._soundLength ~= 0 and self._startTime >= self._soundLength then 
				self:_playNext()
			end
		end
	end

end

local function colorToNumber(color)
    if type(color) == "table" then
        local num = 0
        if color.r then
            num = num + color.r * 65536
        end
        if color.g then
            num = num + color.g * 256
        end
        if color.b then
            num = num + color.b
        end

        return num
    else
        return checknumber(color)
    end
end

function PopupStoryChat:_parseDialogueContent(dialogueContent, fontSize, fontColor, contentSize)
	-- 先找出所有的关键词，并整理
	local content = dialogueContent
	local contents = {}
	local lastIndex = 0
	while true do

		local headIndex = string.find(content, "#", lastIndex+1)
		local tailIndex

		if headIndex then
			tailIndex = string.find(content, "#", headIndex+1)
		else
			contents[#contents+1] = {content = string.sub(content, lastIndex+1), isKeyWord = false}
			break
		end

		if headIndex > lastIndex+1 then
			contents[#contents+1] = {content = string.sub(content, lastIndex+1, headIndex-1), isKeyWord = false}
		end

		if headIndex and tailIndex then
			if tailIndex > headIndex+1 then
				contents[#contents+1] = {content = string.sub(content, headIndex+1, tailIndex-1), isKeyWord = true}
			end
			lastIndex = tailIndex
		else
			if headIndex+1 < string.len(dialogueContent) then
				contents[#contents+1] = {content = string.sub(content, headIndex+1), isKeyWord = false}
			end
			break
		end

	end

	-- 文本模板
	local richTextContents = {}

	for i=1, #contents do

		local content = contents[i]
		
		table.insert(richTextContents, {
			type = "text",
			msg = content.content,
			color = colorToNumber(content.isKeyWord and cc.c3b(255, 0, 0) or fontColor),
			fontSize = fontSize,
			opacity = 255
		})

	end

	local richText = ccui.RichText:create()
	richText:setCascadeOpacityEnabled(true)

	richText:setRichText(richTextContents)

	richText:setAnchorPoint(cc.p(0.5, 0.5))
	richText:ignoreContentAdaptWithSize(false)
	richText:setContentSize(contentSize)

	richText:formatText()

	local node = display.newNode()
	node:setAnchorPoint(cc.p(0.5, 0.5))
	node:setCascadeOpacityEnabled(true)
	node:setContentSize(contentSize)

	node:addChild(richText)
	richText:setPosition(contentSize.width/2, contentSize.height/2)

	return node

end

function PopupStoryChat:_onEventSoundEnd(eventName, soundId)
	if self._nowPlayId == soundId then 
		self._nowPlayId = nil
		self:_playNext()
	end
end

return PopupStoryChat