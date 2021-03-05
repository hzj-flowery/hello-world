local ViewBase = require("app.ui.ViewBase")
local ChatNode = class("ChatNode", ViewBase)

local HeroRes = require("app.config.hero_res")
local Hero = require("app.config.hero")

local Path = require("app.utils.Path")
local Color = require("app.utils.Color")

ChatNode.POS_FIX_1 = 350
ChatNode.POS_FIX_2 = 250
ChatNode.ROLE_SCALE = 0.95

function ChatNode:ctor(resId)
    self._resId = resId
    self._imageTalker = nil     --说话的人

    self._imageTalkBG = nil     --说话背景
    self._textTalk = nil        --说话内容
    self._imageFace = nil       --表情

    self._imageTalkBG2 = nil    --爆炸背景
    self._textTalk2 = nil       --爆炸内容
    self._imageFace2 = nil      --爆炸表情

    self._toward = 1
    self._richTextNode = nil        --说的话

    self._avatarTalker = nil

    -- print("1112233 hero resId = ", resId)

    -- 	self._textDesc = ccui.RichText:createWithContent(self._content)
	-- self._textDesc:setAnchorPoint(cc.p(0.5, 0.5))
	-- self._textDesc:setContentSize(sizeTemp)
	-- self._textDesc:ignoreContentAdaptWithSize(false)

	-- self._textDesc:setPosition(size.width*0.5, size.height*0.5)
	-- self._richPanel:addChild(self._textDesc)

	local resource = {
		file = Path.getCSB("ChatNode", "storyChat"),
		size = {1136, 640},
		binding = {
		}
	}
	ChatNode.super.ctor(self, resource)
end

function ChatNode:getResId()
    return self._resId
end

function ChatNode:turnBack()
    self:setScaleX(-1)
    self._textTalk:setScaleX(-1)
    local posX = self._textTalk:getPositionX()
    self._textTalk:setPositionX(posX - 20)
    self._textTalk2:setScaleX(-1)
    self._toward = -1
end

function ChatNode:onCreate()
    if self._resId == 0 then
        self:setVisible(false)
        return
    end
    self._textTalk:setVisible(false)
    self._textTalk:getVirtualRenderer():setMaxLineWidth(320)
    self._textTalk2:setVisible(false)
    self._textTalk2:getVirtualRenderer():setMaxLineWidth(260)
    self._imageTalkBG:setVisible(false)
    self._imageTalkBG2:setVisible(false)
    self._avatarTalker:setScale(ChatNode.ROLE_SCALE)
    local heroId = self._resId
    if self._resId == 1 then
        local myHeroId = G_UserData:getHero():getRoleBaseId()
        self._avatarTalker:updateUI(myHeroId)
        heroId = myHeroId
    elseif self._resId ~= 0 then
        self._avatarTalker:updateUI(self._resId)
    end
    local heroData = Hero.get(heroId)
    assert(heroData, "not hero id "..heroId)
    local resData = HeroRes.get(heroData.res_id)
    assert(resData, "not hero res "..heroData.res_id)
    self._avatarTalker:setPositionX(resData.story_res_chat_x)
end

function ChatNode:onEnter()
end

function ChatNode:onExit()
end

ChatNode.TEXT_NAME = "rich_text"

function ChatNode:talk(substance, face, form)

    self._imageTalkBG:setVisible(false)
    self._imageTalkBG2:setVisible(false)

    local talkBG = self._imageTalkBG
    local imgFace = self._imageFace
    local text = self._textTalk
    local posFix = ChatNode.POS_FIX_1
    if form == 2 then
        talkBG = self._imageTalkBG2
        imgFace = self._imageFace2
        text = self._textTalk2
        posFix = ChatNode.POS_FIX_2
    end
    text:setString(substance)
    local richText = self:_parseDialogueContent(
        substance,
        26,
        Color.getChatNormalColor(),
        text:getContentSize()
    )
    if self._richTextNode then
        self._richTextNode:removeFromParent()
    end
    talkBG:setVisible(true)
    talkBG:addChild(richText)
    richText:setAnchorPoint(cc.p(0, 0.5))
    local posX, posY = text:getPosition()
    richText:setScaleX(self._toward)
    if self._toward == -1 then
        posX = posX + posFix
    end
    richText:setPosition(posX, posY)
    self._richTextNode = richText
    -- text:setString(substance)

    if face == 0 then
        imgFace:setVisible(false)
    else
        local texFace = Path.getStoryChatFace(face)
        imgFace:loadTexture(texFace)
        imgFace:setVisible(true)
    end

    local action1 = cc.MoveBy:create(0.1, cc.p(0, -10))
    local action2 = cc.MoveBy:create(0.1, cc.p(0, 10))
    local action = cc.Sequence:create(action1, action2)
	talkBG:runAction(action)
end

function ChatNode:listen()
    self._imageTalkBG:setVisible(false)
    self._imageTalkBG2:setVisible(false)
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


function ChatNode:_parseDialogueContent(dialogueContent, fontSize, fontColor, contentSize)
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


return ChatNode
