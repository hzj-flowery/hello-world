-- Author: panhoa
-- Date:
-- 
local ViewBase = require("app.ui.ViewBase")
local ChamptionAvatar = class("ChamptionAvatar", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
--local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
--local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")


function ChamptionAvatar:ctor()
    self._atCellNum = 0
    self._config = {}

    local resource = {
        file = Path.getCSB("ChamptionAvatar", "guildCrossWar"),
    }
    ChamptionAvatar.super.ctor(self, resource)
end

function ChamptionAvatar:onCreate()
end

function ChamptionAvatar:onEnter()
end

function ChamptionAvatar:onExit()
end

function ChamptionAvatar:updateUI(data)
    if not data then
        return
    end

    
    local _, userTable = UserDataHelper.convertAvatarId(data)
    self["_commonAvatar"]:updateAvatar(userTable)
    self["_txtName"]:setString(data.name)
    self["_txtName"]:setColor(Colors.getOfficialColor(data.officer_level))
end

function ChamptionAvatar:setConfig(cfg)
    self._config = cfg or {}
end

function ChamptionAvatar:getConfig()
    return self._config
end

function ChamptionAvatar:setCellNum(num)
    self._atCellNum = num
end

function ChamptionAvatar:getCellNum()
    return self._atCellNum
end


return ChamptionAvatar
