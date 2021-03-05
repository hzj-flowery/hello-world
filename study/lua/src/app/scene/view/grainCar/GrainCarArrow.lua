-- Description: 粮车路线
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-10-11
local ViewBase = require("app.ui.ViewBase")
local GrainCarArrow = class("GrainCarArrow", ViewBase)

local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")

function GrainCarArrow:ctor(isMyGuild)
	self._isMyGuild = isMyGuild
	local resource = {
		file = Path.getCSB("GrainCarArrow", "grainCar"),
		binding = {
            
		}
	}
	self:setName("GrainCarArrow")
	GrainCarArrow.super.ctor(self, resource)
end

function GrainCarArrow:onCreate()
end

function GrainCarArrow:onEnter()
	if self._isMyGuild then
		self._arrow:loadTexture(Path.getMineImage("img_route_02"))
	end
end

function GrainCarArrow:onExit()
end

function GrainCarArrow:onShowFinish()
end


--------------------------------------------------------------------------
-------------------------------外部方法------------------------------------
--------------------------------------------------------------------------
function GrainCarArrow:setPercent(percent)
    self._percent = percent
end

function GrainCarArrow:getPercent()
    return self._percent
end

return GrainCarArrow