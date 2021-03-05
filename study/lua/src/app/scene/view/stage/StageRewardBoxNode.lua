
-- Author: nieming
-- Date:2017-12-23 15:22:20
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local StageRewardBoxNode = class("StageRewardBoxNode", ViewBase)


function StageRewardBoxNode:ctor(data)

	--csb bind var name
	self._boxName = nil  --Text
	self._btnBox = nil  --Button
	self._richName = nil  --SingleNode

	local resource = {
		file = Path.getCSB("StageRewardBoxNode", "stage"),
		binding = {
			_btnBox = {
				events = {{event = "touch", method = "_onBtnBox"}}
			},
		},
	}
	StageRewardBoxNode.super.ctor(self, resource)
	self._data = data
end

-- Describle：
function StageRewardBoxNode:onCreate()
	self._btnBox:ignoreContentAdaptWithSize(true)
end

-- Describle：
function StageRewardBoxNode:onEnter()

end

-- Describle：
function StageRewardBoxNode:onExit()

end
-- Describle：
function StageRewardBoxNode:_onBtnBox()
	-- body
	if self._data.clickCallback then
		self._data.clickCallback(self._data)
	end
end

function StageRewardBoxNode:updateUI()
	local data = self._data
	if data.isAlreadyGet(data) then
		self._btnBox:loadTextures(data.emptyImagePath, "", "", 0)
		self:_removeEffect()
	else
		self._btnBox:loadTextures(data.fullImagePath, "", "", 0)
		self:_addEffect()
	end
	

	if not self._richTextNode then
		if data.richNode then
			self._richTextNode = data.richNode
			data.richNode:setAnchorPoint(cc.p(0.5,0.5))
			self._richName:addChild(data.richNode)
			self._boxName:setVisible(false)
		end
	end

	if data.name then
		self._boxName:setVisible(true)
		self._boxName:setString(data.name)
	end
end

function StageRewardBoxNode:_addEffect()
	if self._effect then
		return
	end
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
	   if effect == "effect_boxflash_xingxing"then
		   local subEffect = EffectGfxNode.new("effect_boxflash_xingxing")
		   subEffect:play()
		   return subEffect
	   end
   end
   self._effect = G_EffectGfxMgr:createPlayMovingGfx( self._btnBox, "moving_boxflash", effectFunction, nil, false )
end

function StageRewardBoxNode:_removeEffect()
	if self._effect then
		self._effect:removeFromParent()
		self._effect = nil
	end
end

return StageRewardBoxNode
