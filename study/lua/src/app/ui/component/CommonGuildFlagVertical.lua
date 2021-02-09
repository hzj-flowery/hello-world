
local CommonGuildFlag = require("app.ui.component.CommonGuildFlag")
local CommonGuildFlagVertical = class("CommonGuildFlagVertical",CommonGuildFlag)

function CommonGuildFlagVertical:ctor()
	CommonGuildFlagVertical.super.ctor(self)
end



function CommonGuildFlagVertical:getImagePath()
    local path = ""
    
    if self._flagConfigInfo then
        path = Path.getGuildRes(self._flagConfigInfo.long_res)
    end

    return path
end


return CommonGuildFlagVertical