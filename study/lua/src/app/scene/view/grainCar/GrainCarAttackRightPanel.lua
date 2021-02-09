-- Description: 攻击粮车右侧头像
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-10-14

local ViewBase = require("app.ui.ViewBase")
local GrainCarAttackRightPanel = class("GrainCarAttackRightPanel", ViewBase)
local TextHelper = require("app.utils.TextHelper")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 
local GrainCarBar = require("app.scene.view.grainCar.GrainCarBar")
local GrainCarConst  = require("app.const.GrainCarConst")

function GrainCarAttackRightPanel:ctor()
    local resource = {
		file = Path.getCSB("GrainCarAttackRightPanel", "grainCar"),
	}
	GrainCarAttackRightPanel.super.ctor(self, resource)
end

function GrainCarAttackRightPanel:onCreate()
    self._barArmy = GrainCarBar.new(self._armyBar)
end

function GrainCarAttackRightPanel:onEnter()
end

function GrainCarAttackRightPanel:onExit()
end

function GrainCarAttackRightPanel:updateUI(carUnit)
    self:_updateNodeIcon(carUnit)
    self:_updateHp(carUnit)
end

-- @Role    Update HeadFrame
function GrainCarAttackRightPanel:_updateNodeIcon(carUnit)
    self._fileNodeIcon:updateUI(carUnit)
end

-- @Role    Update Name&Power
function GrainCarAttackRightPanel:_updateHp(carUnit)
    --军团名
    self._guildName:setString(carUnit:getGuild_name()..Lang.get("grain_car_guild_de")..carUnit:getConfig().name)

    --粮车血量
    self._barArmy:updateBarWithCarUnit(carUnit)
end


return GrainCarAttackRightPanel