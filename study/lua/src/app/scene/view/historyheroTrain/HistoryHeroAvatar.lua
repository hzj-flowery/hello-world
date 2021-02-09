--[[
   Description: 
   Company: yoka
   Author: chenzhongjie
   Date: 2019-07-15 10:48:02
   LastEditors: chenzhongjie
   LastEditTime: 2019-07-26 16:21:06
]]

local ViewBase = require("app.ui.ViewBase")
local HistoryHeroAvatar = class("HistoryHeroAvatar", ViewBase)

function HistoryHeroAvatar:ctor()
	self._nodeAvatar 	    = nil
	self._heroName      	= nil
	self._touchCallback		= nil

	local resource = {
		file = Path.getCSB("HistoryHeroAvatar", "historyhero"),
		-- binding = {
			-- _buttonChange = {
			-- 	events = {{event = "touch", method = "_onButtonChange"}}
			-- },
	}
	HistoryHeroAvatar.super.ctor(self, resource)
end

function HistoryHeroAvatar:onCreate()
	self:setCascadeOpacityEnabled(true)
end

function HistoryHeroAvatar:onEnter()
	self._panelTouch:addClickEventListenerEx(handler(self, self._onTouched))
end

function HistoryHeroAvatar:onExit()
end

function HistoryHeroAvatar:updateUI(historyHeroCfgData, isEquiping)
    if isEquiping then
        self._nodeEffect:removeAllChildren()
        self:_playHeroPickAnimation(self._nodeEffect, historyHeroCfgData)
    else
        self._nodeAvatar:setVisible(true)
        self._nodeAvatar:updateUI(historyHeroCfgData.id)
        self._nodeAvatar:setScale(1.8)
        local params = self._nodeAvatar:getItemParams()
        self._heroName:setName(params.name)
        self._heroName:setColor(params.icon_color)
    end	
end

function HistoryHeroAvatar:setTouchCallback(cb)
	self._touchCallback = cb
end

function HistoryHeroAvatar:_onTouched()
	if self._touchCallback then
		self._touchCallback()
	end
end


function HistoryHeroAvatar:_playHeroPickAnimation(rootNode, historyHeroCfgData)
	local function effectFunction(effect)
		local EffectGfxNode = require("app.effect.EffectGfxNode")
		if effect == "effect_zm_boom" then
			local subEffect = EffectGfxNode.new("effect_zm_boom")
            subEffect:play()
			return subEffect
		end
    end
    local function eventFunction(event)
		if event == "finish" then
			-- 1: 插入数据要同步
			
		elseif event == "hero" then
			self._nodeAvatar:setVisible(true)
			self._nodeAvatar:updateUI(historyHeroCfgData.id)
			self._nodeAvatar:setScale(1.8)
			local params = self._nodeAvatar:getItemParams()
			self._heroName:setName(params.name)
			self._heroName:setColor(params.icon_color)
        end
	end
	
    G_EffectGfxMgr:createPlayMovingGfx(rootNode, "moving_wuchabiebuzhen_wujiang", effectFunction, eventFunction , false)
end

return HistoryHeroAvatar