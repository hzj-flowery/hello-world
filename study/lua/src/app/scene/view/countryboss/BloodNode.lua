
-- Author: nieming
-- Date:2018-05-09 10:39:29
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local BloodNode = class("BloodNode", ViewBase)
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
function BloodNode:ctor(bossId)
	--csb bind var name
	self._countDownLabel = nil  --Text
	self._countDownTime = nil  --Text
	self._loadingBarTime = nil  --LoadingBar
	self._textBossName = nil  --Text

	self._bossId = bossId
	local resource = {
		file = Path.getCSB("BloodNode", "countryboss"),

	}
	BloodNode.super.ctor(self, resource)
end

-- Describle：
function BloodNode:onCreate()
	self._cfg = CountryBossHelper.getBossConfigById(self._bossId)
	self._textBossName:setString(self._cfg.name)
	if self._cfg.type == 2 then
		self._textBossName:setColor(Colors.COLOR_QUALITY[6])
		self._textBossName:enableOutline(Colors.COLOR_QUALITY_OUTLINE[6], 2)
	else
		self._textBossName:setColor(Colors.COLOR_QUALITY[5])
		self._textBossName:enableOutline(Colors.COLOR_QUALITY_OUTLINE[5], 2)
	end
end

function BloodNode:updateUI()
	local bossData = G_UserData:getCountryBoss():getBossDataById(self._bossId)
	if not bossData then
		return
	end

	local progress = bossData:getNow_hp() * 100/ bossData:getMax_hp()
	if progress >= 100 then
		progress = 100
	end
	self._loadingBarTime:setPercent(progress)
	local str = string.format("%.2f%% ( %s / %s )", progress, bossData:getNow_hp() , bossData:getMax_hp())
	-- local str = string.format("%.2f%%", progress)
	self._progressLabel:setString(str)
end

-- Describle：
function BloodNode:onEnter()

end

-- Describle：
function BloodNode:onExit()

end

return BloodNode
