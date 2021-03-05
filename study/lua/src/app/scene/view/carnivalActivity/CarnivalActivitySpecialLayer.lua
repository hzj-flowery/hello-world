local ViewBase = require("app.ui.ViewBase")
local CarnivalActivitySpecialLayer = class("CarnivalActivitySpecialLayer", ViewBase)
local FestivalResConfog = require("app.config.festival_res")


function CarnivalActivitySpecialLayer:ctor(special_id)
    self._specialId = special_id or 0
	local resource = {
		file = Path.getCSB("CarnivalActivitySpecialLayer", "carnivalActivity"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		},
	}
	CarnivalActivitySpecialLayer.super.ctor(self, resource)
end

function CarnivalActivitySpecialLayer:onCreate()
    local config = FestivalResConfog.get(self._specialId)

    if config == nil then
        return 
    end

    self._specialImg:loadTexture(config.res_id)
    self._specialImg:ignoreContentAdaptWithSize(true)
end



return CarnivalActivitySpecialLayer