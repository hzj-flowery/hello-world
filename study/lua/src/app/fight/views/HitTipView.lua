local HitTipDamage = require("app.fight.views.HitTip.HitTipDamage")
local HitTipBuff = require("app.fight.views.HitTip.HitTipBuff")
local HitTipAngerBuff = require("app.fight.views.HitTip.HitTipAngerBuff")
local HitTipFeature = require("app.fight.views.HitTip.HitTipFeature")

local HitTipView = class("HitTipView", function()
	return cc.Node:create()
end)

--
function HitTipView:ctor(value)
	self._tips = {}
	self._tipBuffs = {}
	self._startPosY = 0
end

--
function HitTipView:popup(value, hitInfo, type, position, callback)
	position.y = position.y + 180
	self._startPosY = position.y
	-- self:setPosition(position)
	local tip = nil
	--做一个相对位置的偏移
	-- local posX, posY = self:getPosition()
	-- local posFixX = position.x - posX
	-- local posFixY = position.y - posY
	-- local pos = cc.p(posFixX, posFixY)
	if type == "damage" or type == "buff_damage" then
		tip = HitTipDamage.new(value, hitInfo, type)
	elseif type == "buff" then
		tip = HitTipBuff.new(hitInfo) 
	elseif type == "anger_buff" then
		tip = HitTipAngerBuff.new(hitInfo, value)
	elseif type == "feature" then
		tip = HitTipFeature.new(value, callback)
	end
	if tip then
		self:addChild(tip:getViewNode())
		if tip._type == "feature" then
			local pos = cc.p(position.x, position.y - 50)
			tip:setPosition(pos)
			tip:popup()
		elseif tip._type ~= "buff" and tip._type ~= "anger_buff" then
			tip:setPosition(position)
			table.insert(self._tips, 1, tip)
			self:_resetTipOrder()
			tip:popup()
		else
			tip:setPosition(position)
			table.insert(self._tipBuffs, tip)
			self:_resetTipBuffOrder()
			tip:popup()
		end 
	end
end

function HitTipView:_resetTipOrder()
	local tips = {}
	for i,v in ipairs(self._tips) do
		if not v:isFinish() then
			tips[#tips + 1] = v
		end
	end
	for i,v in ipairs(tips) do
		local posx = v:getViewNode():getPosition()
		v:getViewNode():setPosition(cc.p(posx+i*2, self._startPosY + i*20))
	end
	self._tips = tips
end

function HitTipView:_resetTipBuffOrder()
	local tips = {}
	local posY = self._startPosY
	for i, v in ipairs(self._tipBuffs) do
		if not v:isFinish() then
			tips[#tips + 1] = v
		end
	end
	table.sort(tips, function(a, b) return a:getActionType() < b:getActionType() end)
	for i, v in ipairs(tips) do
		local posx = v:getViewNode():getPosition()
		v:getViewNode():setPosition(cc.p(posx,posY))
		local height = v:getHeight()
		posY = posY - height
	end
	self._tipBuffs = tips
end

-- --
-- function HitTipView:resetOrder()
-- 	local tips = {}
-- 	for i,v in ipairs(self._tips) do
-- 		if not v:isFinish() then
-- 			tips[#tips + 1] = v
-- 		end
-- 	end
-- 	local damageCount = 1
-- 	local buffCount = 1
-- 	for i,v in ipairs(tips) do
-- 		if v._type ~= "buff" then
-- 			v:getViewNode():setPositionY(damageCount*25)
-- 			damageCount = damageCount + 1
-- 		else
			
-- 		end
-- 	end
-- 	self._tips = tips
-- end

-- function HitTipView:_fixBuffPositionY(tip)
-- 	local actionType = tip:getActionType()
-- 	if actionType == 0 then
-- 	elseif actionType == 1 then
-- 	elseif actionType == 2 then
-- 	end
-- end



return HitTipView