--竞技场
--起始动画玩家名称战力 展示
local ViewBase = require("app.ui.ViewBase")
local ArenaFightStartName = class("ArenaFightStartName", ViewBase)

local TextHelper = require("app.utils.TextHelper")
function ArenaFightStartName:ctor()
    
    self._fileNodePower = nil
    self._playerName     = nil

    local resource = {
        file = Path.getCSB("ArenaFightStartName", "arena"),
    }
    ArenaFightStartName.super.ctor(self, resource)
end

function ArenaFightStartName:onCreate()

end

function ArenaFightStartName:updateUI(playerName,officialLevel, playerPower)
    self:updateLabel("_playerName",{
        text    = playerName,
        color   =   Colors.getOfficialColor(officialLevel),
        outlineColor = Colors.getOfficialColorOutline(officialLevel),
    })
  
  
    self._fileNodePower:updateUI(playerPower)
    -- body
end

return ArenaFightStartName
