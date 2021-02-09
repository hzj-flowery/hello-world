-- @Author panhoa
-- @Role
-- @Date 8.15.2019

local ViewBase = require("app.ui.ViewBase")
local InspireNode = class("InspireNode", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
--local GuildCrossWarHelper = import(".GuildCrossWarHelper")


function InspireNode:ctor()
     
    local resource = {
		file = Path.getCSB("InspireNode", "guildCrossWarGuess"),
	}
	InspireNode.super.ctor(self, resource)
end

function InspireNode:onCreate()
    --self["_monsterBlood"]:setSwallowTouches(false)

    self["_resource"]:setVisible(false)
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
end

function InspireNode:onEnter()
end

function InspireNode:onExit()
end

-- @Role    UpdateUI
function InspireNode:updateUI(data)
    if not data then return end
    self["_resource"]:setVisible(true)

    self["_txtAtk"]:setString(data.atk_insp_level)
    self["_txtDef"]:setString(data.def_insp_level)

    local _, userTable = UserDataHelper.convertAvatarId(data)
    self["_commonAvatar"]:updateAvatar(userTable)


    local selfUid = G_UserData:getBase():getId()
    self["_imgNormal"]:setVisible(data.uid ~= selfUid)
    self["_imgSelect"]:setVisible(data.uid == selfUid)

    self["_txtName"]:setString(data.name)
    self["_txtName"]:setColor(Colors.getOfficialColor(data.officer_level))
    self["_txtName"]:enableOutline(Colors.getOfficialColorOutline(data.officer_level))
end



return InspireNode