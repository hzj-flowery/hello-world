--
-- Author: Liangxu
-- Date: 2017-04-21 16:20:23
-- 
local CommonStar = class("CommonStar")
local EffectGfxNode = require("app.effect.EffectGfxNode")

local EXPORTED_METHODS = {
    "setCount",
	"playStar",
	"setCountEx",
	"setStarOrMoon",
	"playStarOrMoon",
	"setStarOrMoonForPlay",
	"setCountAdv",
}

local IMAGE_RES = {
	[1] = {
		["light"] = "img_lit_stars02", 
		["dark"] = "img_lit_stars02c",
		["moving"] = "moving_xiaoxingxing", 
		},
	[2] = {
		["light"] = "img_lit_stars03", 
		["dark"] = "img_lit_stars03b",
		["moving"] = "moving_daxingxing",
		},
}

function CommonStar:ctor()
	self._target = nil
	
end

function CommonStar:_init()
	self._imageStar1 = ccui.Helper:seekNodeByName(self._target, "ImageStar1")
	self._imageStar2 = ccui.Helper:seekNodeByName(self._target, "ImageStar2")
	self._imageStar3 = ccui.Helper:seekNodeByName(self._target, "ImageStar3")
	self._imageStar4 = ccui.Helper:seekNodeByName(self._target, "ImageStar4")
	self._imageStar5 = ccui.Helper:seekNodeByName(self._target, "ImageStar5")
	self._imageStar6 = ccui.Helper:seekNodeByName(self._target, "ImageStar6")
end

function CommonStar:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonStar:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonStar:_initStars()
	for i = 1, 6 do
		if self["_imageStar"..i] then
			self["_imageStar"..i]:setVisible(false)
		end
	end
end

function CommonStar:setCount(count,maxCount)
	self:_initStars()
	maxCount = maxCount or 5 
	for i = 1, maxCount do
		if i <= count then
			self["_imageStar"..i]:loadTexture(Path.getUICommon("img_lit_stars02"))
			self["_imageStar"..i]:setVisible(true)
		else
			self["_imageStar"..i]:loadTexture(Path.getUICommon("img_lit_stars02c"))
			self["_imageStar"..i]:setVisible(true)
		end
	end
end

function CommonStar:setCountEx(count)
	self:_initStars()
	for i = 1, count do
		if self["_imageStar"..i] then
			self["_imageStar"..i]:loadTexture(Path.getUICommon("img_lit_stars02"))
			self["_imageStar"..i]:setVisible(true)
		end
	end
end

function CommonStar:setCountAdv(count)
	self:_initStars()

	if count > 5 or count <= 0 then
		return
	end

	for i = 1, count do
		if self["_imageStar"..i] then
			self["_imageStar"..i]:loadTexture(Path.getUICommon("img_lit_stars02"))
			self["_imageStar"..i]:setVisible(true)
		end
	end

	if count % 2 == 0 then
		for i = 1, count do
			local posX = 64 + (i - count / 2 - 1) * 26
			if self["_imageStar"..i] then
				self["_imageStar"..i]:setPosition(cc.p(posX, 0))
			end
		end
	else
		for i = 1, count do
			local posX = 48 + (i - (count + 1) / 2) * 26
			if self["_imageStar"..i] then
				self["_imageStar"..i]:setPosition(cc.p(posX, 0))
			end
		end
	end
end

function CommonStar:playStar(index,delayTimme)
	-- body
	local imageStar =  self["_imageStar"..index]
	if imageStar == nil then
		return
	end

	self:_playSingleStarEft(imageStar,delayTimme)
end

function CommonStar:_onStarEffectFinish( srcImage )
	-- body
	srcImage:loadTexture(Path.getUICommon("img_lit_stars02"))
end

function CommonStar:_playSingleStarEft(node, delayTimme)
	delayTimme = delayTimme or 0.1

	--先变灰
	node:loadTexture(Path.getUICommon("img_lit_stars02c"))
	local function effectFunction(effect)
        if effect == "effect_xiaoxingxing"then
            local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect 
        end
    end
	local function eventFunction(event)
		if event == "finish" then
			self:_onStarEffectFinish(node)
		end
	end
	local function funcStar()	
		local effect = G_EffectGfxMgr:createPlayMovingGfx(node, "moving_xiaoxingxing", effectFunction, eventFunction, false )	
		local nodeSize = node:getContentSize()
		local pos = cc.p(nodeSize.width*0.5, nodeSize.height*0.5)
		effect:setPosition(pos)
		effect:setScale(0.8)
	end
	local action1 = cc.DelayTime:create(delayTimme)
	local action2 = cc.CallFunc:create(function() funcStar() end)
	local action = cc.Sequence:create(action1, action2)
	node:runAction(action)
end

--个数超过星星显示最大值后，显示下一层次，月亮
--5个星星，再下一级，是1个月亮、2个月亮。。。
function CommonStar:setStarOrMoon(count, countPerLevel)
	self:_initStars()
	countPerLevel = countPerLevel or 5 --每级的数量，默认5
	local level = math.ceil(count/countPerLevel)
	if level == 0 then
		level = 1
	end
	if count > 0 then
		count = count % countPerLevel
		if count == 0 then
			count = countPerLevel
		end
	end
	local imageLight = IMAGE_RES[level].light
	local imageDark = IMAGE_RES[level].dark
	for i = 1, countPerLevel do
		self["_imageStar"..i]:setVisible(true)
		if i <= count then
			self["_imageStar"..i]:loadTexture(Path.getUICommon(imageLight))
		else
			self["_imageStar"..i]:loadTexture(Path.getUICommon(imageDark))
		end
	end
end

--为了播放特效，提前设置星星数量
--播6星时，是先设置为5星（表现为5颗暗的），因此和直接设置不同
function CommonStar:setStarOrMoonForPlay(count, countPerLevel)
	self:_initStars()
	countPerLevel = countPerLevel or 5 --每级的数量，默认5
	local level = math.floor(count/countPerLevel) + 1
	count = count % countPerLevel
	local imageLight = IMAGE_RES[level].light
	local imageDark = IMAGE_RES[level].dark
	for i = 1, countPerLevel do
		self["_imageStar"..i]:setVisible(true)
		if i <= count then
			self["_imageStar"..i]:loadTexture(Path.getUICommon(imageLight))
		else
			self["_imageStar"..i]:loadTexture(Path.getUICommon(imageDark))
		end
	end
end

function CommonStar:playStarOrMoon(count, countPerLevel, delayTimme)
	countPerLevel = countPerLevel or 5 --每级的数量，默认5
	delayTimme = delayTimme or 0.1

	local level = math.ceil(count/countPerLevel)
	local index = count % countPerLevel
	if index == 0 then
		index = countPerLevel
	end
	local imageStar =  self["_imageStar"..index]
	if imageStar == nil then
		return
	end

	local darkImage = IMAGE_RES[level].dark
	imageStar:loadTexture(Path.getUICommon(darkImage))
	local function eventFunction(event)
		if event == "finish" then
			local lightImage = IMAGE_RES[level].light
			imageStar:loadTexture(lightImage)
		end
	end
	local function funcStar()	
		local movingName = IMAGE_RES[level].moving
		local effect = G_EffectGfxMgr:createPlayMovingGfx(imageStar, movingName, nil, eventFunction, false )	
		local nodeSize = imageStar:getContentSize()
		local pos = cc.p(nodeSize.width*0.5, nodeSize.height*0.5)
		effect:setPosition(pos)
		effect:setScale(0.8)
	end
	local action1 = cc.DelayTime:create(delayTimme)
	local action2 = cc.CallFunc:create(function() funcStar() end)
	local action = cc.Sequence:create(action1, action2)
	imageStar:runAction(action)
end

return CommonStar