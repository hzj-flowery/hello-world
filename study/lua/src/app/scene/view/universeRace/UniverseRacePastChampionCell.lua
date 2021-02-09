

local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRacePastChampionCell = class("UniverseRacePastChampionCell", ListViewCellBase)
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDetailData = require("app.data.UserDetailData")

function UniverseRacePastChampionCell:ctor()
	local resource = {
		file = Path.getCSB("UniverseRacePastChampionCell", "universeRace"),
		binding = {
			_buttonLook = {
				events = {{event = "touch", method = "_onButtonLookClicked"}}
			},
		}
	}
	UniverseRacePastChampionCell.super.ctor(self, resource)
end

function UniverseRacePastChampionCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function UniverseRacePastChampionCell:update(data, index)
	if data.isEmpty == true then
		self._nodeLock:setVisible(true)
		self._nodeOpen:setVisible(false)
	else
		self._nodeLock:setVisible(false)
		self._nodeOpen:setVisible(true)
		
		self._textSession:setString(Lang.get("universe_race_pass_champion_session", {session = index}))
		local covertId, limitLevel, limitRedLevel = data:getCovertIdAndLimitLevel()
		self._nodeIcon:updateUI(covertId, nil, limitLevel, limitRedLevel)
		self._nodeIcon:updateHeadFrame(data:getHead_frame_id())
		self._textServer:setString(data:getServer_name())
		self._textName:setString(data:getUser_name())
		local officalLevel = data:getOfficer_lv()
		self._textName:setColor(Colors.getOfficialColor(officalLevel))
	end
end

function UniverseRacePastChampionCell:_onButtonLookClicked()
	self:dispatchCustomCallback(1)
end

return UniverseRacePastChampionCell