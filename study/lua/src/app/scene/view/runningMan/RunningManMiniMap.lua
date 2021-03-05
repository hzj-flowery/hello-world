
-- Author: hedili
-- Date:2018-04-19 14:10:17
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local RunningManMiniMap = class("RunningManMiniMap", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RunningManHelp = require("app.scene.view.runningMan.RunningManHelp")
local RunningManConst= require("app.const.RunningManConst")

local IMAGE_NORMAL = "img_runway_smallmap_lv"
local IMAGE_TOP = "img_runway_smallmap_red"

function RunningManMiniMap:ctor()

	--csb bind var name
	self._line1 = nil  --Panel
	self._line2 = nil  --Panel
	self._line3 = nil  --Panel
	self._line4 = nil  --Panel
	self._line5 = nil  --Panel

	local resource = {
		file = Path.getCSB("RunningManMiniMap", "runningMan"),
	}
	RunningManMiniMap.super.ctor(self, resource)
end

function RunningManMiniMap:onCreate()
	self._pixelDist = self._line1:getContentSize().width - 10
end

function RunningManMiniMap:reset( ... )
	-- body
	for i = 1, 5 do
		local widget = self["_line"..i]:getSubNodeByName("Image_run")

		widget:setPositionX(0)
		widget:loadTexture(Path.getRunningMan(IMAGE_NORMAL))
		
	end
end
--每帧刷新
function RunningManMiniMap:updateUI()

	local runningTable, maxIndex = RunningManHelp.runningProcess()
	for i, runningData in ipairs(runningTable) do
		local updatePos = math.floor( runningData.percent * self._pixelDist )
		local subNode = self["_line"..runningData.roadNum]:getSubNodeByName("Image_run")
		subNode:setPositionX(updatePos)
		subNode:loadTexture(Path.getRunningMan(IMAGE_NORMAL))
	end
	local maxTable = runningTable[maxIndex]
	if maxTable then
		local subNode = self["_line"..maxTable.roadNum]:getSubNodeByName("Image_run")
		subNode:loadTexture(Path.getRunningMan(IMAGE_TOP))
	end
end


return RunningManMiniMap