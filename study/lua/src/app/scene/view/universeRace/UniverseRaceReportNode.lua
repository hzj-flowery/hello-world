local UniverseRaceReportNode = class("UniverseRaceReportNode")
local UniverseRaceConst = require("app.const.UniverseRaceConst")

function UniverseRaceReportNode:ctor(target, position)
    self._target = target
	self._position = position

    self._imageLineLight = ccui.Helper:seekNodeByName(self._target, "ImageLineLight")
	self._imagePlat = ccui.Helper:seekNodeByName(self._target, "ImagePlat")
end

function UniverseRaceReportNode:updateUI()
	if self._imageLineLight == nil then
		return
	end
	
	local groupReportData = G_UserData:getUniverseRace():getGroupReportData(self._position)
	local isEnd = false
	if groupReportData then
		isEnd = groupReportData:isMatchEnd()
	end
	self._imageLineLight:setVisible(isEnd)
end

function UniverseRaceReportNode:setEffect(show)
	self._imagePlat:removeAllChildren()
	if show then
		local effectNode = G_EffectGfxMgr:createPlayGfx(self._imagePlat, "effect_yanwu_leitai")
		local size = self._imagePlat:getContentSize()
		effectNode:setPosition(cc.p(size.width/2, size.height/2))
	end
end

return UniverseRaceReportNode