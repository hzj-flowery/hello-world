
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildWarTaskNode = class("GuildWarTaskNode", ListViewCellBase)

function GuildWarTaskNode:ctor()
    self._imageBg = nil
    self._textTaskInfo = nil
    self._textProgress = nil
    local resource = {
        file = Path.getCSB("GuildWarTaskNode", "guildwarbattle"),
        binding = {
		}
    }
    GuildWarTaskNode.super.ctor(self, resource)
end

function GuildWarTaskNode:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function GuildWarTaskNode:updateUI(data,index)
    self._data = data

    --[[
    local count = 0
    for k,v in ipairs(data.pointList) do
        local warWatch = G_UserData:getGuildWar():getWarWatchById(v)
        if warWatch then
           
            if warWatch:getWatch_value()  <= 0 then
                count  = count + 1
            end
        end
    end
    local total = #data.pointList
    self._textProgress:setString(Lang.get("guildwar_task_progress",{
            min =  count,
            max= total,
     }))
]]
    self._textTaskInfo:setString(data.des)

   
    
end

return GuildWarTaskNode
