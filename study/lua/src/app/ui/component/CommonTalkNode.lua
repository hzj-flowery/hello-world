local CommonTalkNode = class("CommonTalkNode")


local EXPORTED_METHODS = {
    "setText",
    "showLoopBubble",
    "setBubbleColor",
    "setMaxWidth",
    "setString",
    "setBubbleScaleX",
    "setBubblePositionX",
    "doAnim",
    "showLoopBubbleList",
    "getTalkString",
}

function CommonTalkNode:ctor()
	self._target = nil
	self._imageTalkBG = nil
	self._textTalk = nil
    self._currBubbleIndex = 0
    self._maxWidth = 0
    self._richText = nil
end

function CommonTalkNode:_init()

	self._imageTalkBG = ccui.Helper:seekNodeByName(self._target, "Image_talk_bg")
	self._textTalk = ccui.Helper:seekNodeByName(self._target, "Text_talk")
  
end

function CommonTalkNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTalkNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonTalkNode:getTalkString( ... )
    -- body
    return self._textTalk:getString()
end
function CommonTalkNode:showLoopBubbleList(bubbleList,interval)
	self._imageTalkBG:stopAllActions()
	interval = interval or 5
	local function getBubbleMsg(bubbleId)
		local BubbleInfo = require("app.config.bubble")
		local data = BubbleInfo.get(tonumber(bubbleId))
		assert(data, "bubble cfg data can not find by bubbleId "..bubbleId)
		return data.content
	end
	local function loopFunc()
        self._currBubbleIndex = self._currBubbleIndex + 1
        if self._currBubbleIndex > #bubbleList then
            self._currBubbleIndex = 1
        end
		local bubbleId = bubbleList[self._currBubbleIndex]
		local bubbleMsg = getBubbleMsg(bubbleId)
		self:setText(bubbleMsg,nil,true)
	end
	local delay = cc.DelayTime:create(interval)
    local sequence = cc.Sequence:create(cc.CallFunc:create(loopFunc),delay)
    local action = cc.RepeatForever:create(sequence)
	self._imageTalkBG:runAction(action)
end


function CommonTalkNode:showLoopBubble(content,interval)
	self._imageTalkBG:stopAllActions()
	interval = interval or 5
	local function getBubbleMsg(bubbleId)
		local BubbleInfo = require("app.config.bubble")
		local data = BubbleInfo.get(tonumber(bubbleId))
		assert(data, "bubble cfg data can not find by bubbleId "..bubbleId)
		return data.content
	end
	local function loopFunc()
		local npc1talk = string.split(content,"|")
		self._currBubbleIndex = self._currBubbleIndex + 1
		if self._currBubbleIndex > #npc1talk then
			self._currBubbleIndex = 1
		end
		local bubbleId = npc1talk[self._currBubbleIndex]
		local bubbleMsg = getBubbleMsg(bubbleId)
		self:setText(bubbleMsg,nil,true)
	end
	local delay = cc.DelayTime:create(interval)
    local sequence = cc.Sequence:create(cc.CallFunc:create(loopFunc),delay)
    local action = cc.RepeatForever:create(sequence)
	self._imageTalkBG:runAction(action)
end



function CommonTalkNode:setBubbleColor( color )
    -- body
    self._textTalk:setColor(color)
end

function CommonTalkNode:setMaxWidth(maxWidth)
    self._maxWidth = maxWidth
end

function CommonTalkNode:setBubbleScaleX( xScale )
    -- body
    self._textTalk:setScaleX(xScale)

    local imageBG = self._imageTalkBG:getContentSize().width
    self._textTalk:setPositionX(imageBG)

end

function CommonTalkNode:setBubblePositionX( xScale )
    -- body
    self._textTalk:setPositionX(xScale)
end


function CommonTalkNode:setText(talkString, maxWidth, needAnim, towards)

    --图片原始高宽
    local minWidth = 62
    local minHeight = 66
    self._maxWidth = maxWidth or self._maxWidth
    local render = self._textTalk:getVirtualRenderer()
    if self._maxWidth > 0 then
        render:setMaxLineWidth(self._maxWidth)
    end		
    -- --先设置宽度，再设置字符
    self._textTalk:setString(talkString)
    local size = render:getContentSize()

    -- 框的高度是高度如果换行加上45， 宽度加20
    local bubbleWidth = minWidth
    if size.width > minWidth then
        bubbleWidth = size.width + 20
    end

    local bubbleHeight = minHeight
    local changeLine = size.height > self._textTalk:getFontSize()
    if changeLine then
        bubbleHeight = size.height + 45
    end
    self._imageTalkBG:setScale(1)
    self._imageTalkBG:setContentSize(cc.size(bubbleWidth, bubbleHeight))
    if needAnim then
        G_EffectGfxMgr:applySingleGfx(self._imageTalkBG, "smoving_duihuakuang")
    end  

    local textY = (bubbleHeight - 20) / 2 + 20
    self._textTalk:setPosition(cc.p(bubbleWidth/2, textY))



    --if towards then
    --    self._textTalk:setScaleX(towards)
    --    if towards == -1 then
     --       self._textTalk:setPositionX(bubbleSize.width - 6)
     --   end
    --end 
end


function CommonTalkNode:setString(talkString, maxWidth, needAnim,minWidth,minHeight,horizonBlank,verticalBlank,isRichText)
    minWidth = minWidth or 62--默认图片原始宽
    minHeight = minHeight or 66--默认图片原始高
    horizonBlank = horizonBlank or 40--水平留白
    verticalBlank = verticalBlank or 50--垂直留白
    local arrowHeight = 18  
    self._maxWidth = maxWidth or self._maxWidth
    local textWidth = math.max(self._maxWidth - horizonBlank,10)
    self._maxWidth = textWidth + horizonBlank

   
    local size = nil
    local textWidget = nil 
    if isRichText then
        self._textTalk:setVisible(false)
        local richText = self:_createProgressRichText(talkString,textWidth)
       -- render = richText:getVirtualRenderer()
        size = richText:getVirtualRendererSize()
        textWidget =self._richText 
    else
        self._textTalk:setVisible(true)
        self._textTalk:setString(talkString)
        if self._richText then
            self._richText:removeFromParent()
        end
        local  render = self._textTalk:getVirtualRenderer()
        render:setMaxLineWidth(textWidth)    
        size =  render:getContentSize()
        textWidget = self._textTalk
    end
  

    --if self._maxWidth - horizonBlank > 0 then    
        
    --end		
    --先设置宽度，再设置字符
  
    
   
    
    local bubbleSize = cc.size(size.width, size.height)
    bubbleSize.width = bubbleSize.width + horizonBlank
    bubbleSize.height = bubbleSize.height + verticalBlank

    if bubbleSize.width < minWidth then
        bubbleSize.width = minWidth
    end
    if bubbleSize.height < minHeight then
        bubbleSize.height = minHeight
    end

    if bubbleSize.width >  maxWidth then
        bubbleSize.width = maxWidth
    end

    local posY  = (verticalBlank-arrowHeight) * 0.5 + arrowHeight +( bubbleSize.height - verticalBlank - size.height) * 0.5

    logWarn("sssssss "..posY)
    self._imageTalkBG:setScale(1)
    self._imageTalkBG:setContentSize(bubbleSize)
    textWidget:setAnchorPoint(cc.p(0,0))
    textWidget:setPosition( horizonBlank * 0.5, posY)
    if needAnim then
       G_EffectGfxMgr:applySingleGfx(self._imageTalkBG, "smoving_duihuakuang")
    end   
end

function CommonTalkNode:doAnim()
    self._imageTalkBG:setScale(1)
    G_EffectGfxMgr:applySingleGfx(self._imageTalkBG, "smoving_duihuakuang")
end

function CommonTalkNode:_createProgressRichText(msg,width)
    if self._richText then
        self._richText:removeFromParent()
    end
	local RichTextHelper = require("app.utils.RichTextHelper")
	local richMsg =  json.encode(RichTextHelper.getRichMsgListForHashText(
				msg,Colors.BRIGHT_BG_RED,Colors.BRIGHT_BG_TWO,20))
    local widget = ccui.RichText:createWithContent(richMsg)
    widget:setAnchorPoint(cc.p(0,0))
	widget:ignoreContentAdaptWithSize(false)
	widget:setContentSize(cc.size(width,0))--高度0则高度自适应
    widget:formatText()
    self._imageTalkBG:addChild(widget)
    self._richText = widget
    return widget
end



return CommonTalkNode