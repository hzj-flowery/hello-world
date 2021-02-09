


local ViewBase = require("app.ui.ViewBase")
local GuildWarPopulationNode = class("GuildWarPopulationNode")
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")

function GuildWarPopulationNode:ctor(target)
	self._target = target
	self._imageSelfState = nil
    self._imageOtherState = nil
    self._textOtherCount = nil
    self._textSelfCount = nil
	self:_init()
end

function GuildWarPopulationNode:_init()
	self._imageSelfState = ccui.Helper:seekNodeByName(self._target, "ImageSelfState")
    self._imageOtherState = ccui.Helper:seekNodeByName(self._target, "ImageOtherState")
    self._textOtherCount = ccui.Helper:seekNodeByName(self._target, "TextOtherCount")
    self._textSelfCount = ccui.Helper:seekNodeByName(self._target, "TextSelfCount")
end


function GuildWarPopulationNode:updateInfo(cityId,pointId)
	local num1,num2 = GuildWarDataHelper.calculatePopulation(cityId,pointId)
	self._textSelfCount:setString(num1)
	self._textOtherCount:setString(num2)
end


return GuildWarPopulationNode