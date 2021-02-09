-- @Author panhoa
-- @Date 8.1.2019
-- @Role

local ViewBase = require("app.ui.ViewBase")
local WarringRightPanel = class("WarringRightPanel", ViewBase)
local TextHelper = require("app.utils.TextHelper")


function WarringRightPanel:ctor()
    local resource = {
		file = Path.getCSB("WarringRightPanel", "guildCrossWar"),
	}
	WarringRightPanel.super.ctor(self, resource)
end

function WarringRightPanel:onCreate()
end

function WarringRightPanel:onEnter()
end

function WarringRightPanel:onExit()
end

-- @Role	刷新当前段位信息
-- @Param	data
function WarringRightPanel:updateUI(data, hurtHp)
    self:_updateNodeIcon(data)
    self:_updateHeadFrame(data)
    self:_updateHp(data, hurtHp)
    self:_updateNamePower(data)
end

-- @Role    Update HeadFrame
function WarringRightPanel:_updateNodeIcon(data)
    local avatarData = {
        baseId = data:getBase_id(),
        avatarBaseId = data:getAvatar_base_id(),
        covertId = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(data:getAvatar_base_id(), data:getBase_id()),
        isHasAvatar = data:getAvatar_base_id() and data:getAvatar_base_id() > 0 
    }

    if avatarData.covertId ~= nil and avatarData.covertId ~= 0 then
        self._fileNodeIcon:updateIcon(avatarData)
        self._fileNodeIcon:setIconMask(false)
    end
end

-- @Role    Update HeadFrame
function WarringRightPanel:_updateHeadFrame(data)
    self["_commonFrame"]:updateUI(data:getHead_frame_id(), self._fileNodeIcon:getScale())
end

-- @Role    Update Name&Power
function WarringRightPanel:_updateNamePower(data)
    self["_playerName"]:setString(data:getName())
    self["_playerName"]:setColor(Colors.getOfficialColor(data:getOfficer_level()))
    self["_playerPower"]:setString(TextHelper.getAmountText(data:getPower()))
end

-- @Role    Update Hp
function WarringRightPanel:_updateHp(data, hurtHp)
    local curHp = (data:getHp() - hurtHp)
    curHp = curHp > 0 and curHp or 0
    local acceleration = hurtHp * 10 / 15
    self._commonProgress:startProgress({preHp = data:getHp(), curHp = curHp, maxHp = data:getMax_hp(), acceleration = acceleration})
end


return WarringRightPanel