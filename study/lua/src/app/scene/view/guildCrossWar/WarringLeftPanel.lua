-- @Author panhoa
-- @Date 8.1.2019
-- @Role

local ViewBase = require("app.ui.ViewBase")
local WarringLeftPanel = class("WarringLeftPanel", ViewBase)
local TextHelper = require("app.utils.TextHelper")


function WarringLeftPanel:ctor()
    local resource = {
		file = Path.getCSB("WarringLeftPanel", "guildCrossWar"),
	}
	WarringLeftPanel.super.ctor(self, resource)
end

function WarringLeftPanel:onCreate()
end

function WarringLeftPanel:onEnter()
end

function WarringLeftPanel:onExit()
end

-- @Role	刷新当前段位信息
-- @Param	data
function WarringLeftPanel:updateUI(hurtNum)
	local data = G_UserData:getGuildCrossWar():getSelfUnit()
    self:_updateNodeIcon(data)
    self:_updateHeadFrame(data)
    self:_updateHp(data, hurtNum)
    self:_updateNamePower(data)
end

-- @Role    Update HeadFrame
function WarringLeftPanel:_updateNodeIcon(data)
    local avatarData = {
        baseId = G_UserData:getHero():getRoleBaseId(),
        avatarBaseId = G_UserData:getBase():getAvatar_base_id(),
        covertId = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(data:getAvatar_base_id(), data:getBase_id()),
        isHasAvatar = G_UserData:getBase():getAvatar_base_id() and G_UserData:getBase():getAvatar_base_id() > 0 
    }
    if avatarData.covertId ~= nil and avatarData.covertId ~= 0 then
        self._fileNodeIcon:updateIcon(avatarData)
        self._fileNodeIcon:setIconMask(false)
    end
end

-- @Role    Update HeadFrame
function WarringLeftPanel:_updateHeadFrame(data)
    self["_commonFrame"]:updateUI(G_UserData:getBase():getHead_frame_id(), self._fileNodeIcon:getScale())
end

-- @Role    Update Name&Power
function WarringLeftPanel:_updateNamePower(data)
    self["_playerName"]:setString(data:getName())
    self["_playerName"]:setColor(Colors.getOfficialColor(data:getOfficer_level()))
    self["_playerPower"]:setString(TextHelper.getAmountText(data:getPower()))
end

-- @Role    Update Hp
function WarringLeftPanel:_updateHp(data, hurtHp)
    local acceleration = hurtHp * 10 / 15
    self._commonProgress:startProgress({preHp = (data:getHp() + hurtHp), curHp = data:getHp(), maxHp = data:getMax_hp(), acceleration = acceleration})
end


return WarringLeftPanel