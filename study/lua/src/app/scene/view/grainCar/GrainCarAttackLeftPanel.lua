-- Description: 攻击粮车左侧头像
-- Company: yoka
-- Author: chenzhongjie
-- Date: 2019-10-14

local ViewBase = require("app.ui.ViewBase")
local GrainCarAttackLeftPanel = class("GrainCarAttackLeftPanel", ViewBase)
local TextHelper = require("app.utils.TextHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")
local GrainCarBar = require("app.scene.view.grainCar.GrainCarBar")
local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")

function GrainCarAttackLeftPanel:ctor()
    local resource = {
		file = Path.getCSB("GrainCarAttackLeftPanel", "grainCar"),
	}
	GrainCarAttackLeftPanel.super.ctor(self, resource)
end

function GrainCarAttackLeftPanel:onCreate()
    self._barArmy = GrainCarBar.new(self._armyBar)
end

function GrainCarAttackLeftPanel:onEnter()
end

function GrainCarAttackLeftPanel:onExit()
end

function GrainCarAttackLeftPanel:updateUI(army)
    self:_updateNodeIcon()
    self:_updateHeadFrame()
    self:_updateNameArmy(army)
end

-- @Role    Update HeadFrame
function GrainCarAttackLeftPanel:_updateNodeIcon()
    local avatarBaseId = G_UserData:getBase():getAvatar_base_id()
    local id = G_UserData:getHero():getRoleBaseId()
    local avatarData = {
        baseId = G_UserData:getHero():getRoleBaseId(),
        avatarBaseId = avatarBaseId,
        covertId = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(avatarBaseId, id),
        isHasAvatar = avatarBaseId and avatarBaseId > 0 
    }
    if avatarData.covertId ~= nil and avatarData.covertId ~= 0 then
        self._fileNodeIcon:updateIcon(avatarData)
        self._fileNodeIcon:setIconMask(false)
    end
end

-- @Role    Update HeadFrame
function GrainCarAttackLeftPanel:_updateHeadFrame()
    self["_commonFrame"]:updateUI(G_UserData:getBase():getHead_frame_id(), self._fileNodeIcon:getScale())
end

-- @Role    Update Name&Power
function GrainCarAttackLeftPanel:_updateNameArmy(army)
    self["_playerName"]:setString(G_UserData:getBase():getName())
    self["_playerName"]:setColor(Colors.getOfficialColor(G_UserData:getBase():getOfficer_level()))

    --兵力
    local maxArmy = tonumber(require("app.config.parameter").get(ParameterIDConst.TROOP_MAX).content)
    if G_UserData:getMineCraftData():isSelfPrivilege() then
        local soilderAdd  = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_SOILDERADD)
        maxArmy = (maxArmy + soilderAdd)
    end
    self._barArmy:updateBarWithValue(army, maxArmy)
end


return GrainCarAttackLeftPanel