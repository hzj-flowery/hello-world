

local ViewBase = require("app.ui.ViewBase")
local GuildWarAttackNode = class("GuildWarAttackNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")

function GuildWarAttackNode:ctor(cityId,config)
	self._cityId = cityId
	self._config = config

	self._listener = nil
	self._nodeSword = nil
    self._panelTouch = nil
	local resource = {
		file = Path.getCSB("GuildWarAttackNode", "guildwarbattle"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPointClick"}}
			},
		},
	}
	GuildWarAttackNode.super.ctor(self, resource)
end

-- Describle：
function GuildWarAttackNode:onCreate()
	--local x,y = self._config.clickPos.x,self._config.clickPos.y
	--self:setPosition(x,y)

    self:showSword(true)
end

-- Describle：
function GuildWarAttackNode:onEnter()
end

-- Describle：
function GuildWarAttackNode:onExit()
end

function GuildWarAttackNode:_createSwordEft()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_shuangjian"then
            local subEffect = EffectGfxNode.new("effect_shuangjian")
            subEffect:play()
            return subEffect 
        end
    end
    self._swordEffect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeSword, "moving_shuangjian", effectFunction, nil, false )
	self._swordEffect:setPosition(0,0)
	self._swordEffect:setAnchorPoint(cc.p(0.5,0.5))
end

function GuildWarAttackNode:showSword(s)
	if not self._swordEffect then 
		self:_createSwordEft()
	end
	self._swordEffect:setVisible(s)
end

function GuildWarAttackNode:_onPointClick(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._listener then
				self._listener(self._cityId,self._config.point_id)
			end
		end
	end

end

function GuildWarAttackNode:setOnPointClickListener(listener)
	self._listener = listener
end



return GuildWarAttackNode