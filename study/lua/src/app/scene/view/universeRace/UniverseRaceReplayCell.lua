
local ListViewCellBase = require("app.ui.ListViewCellBase")
local UniverseRaceReplayCell = class("UniverseRaceReplayCell", ListViewCellBase)
local UniverseRaceConst = require("app.const.UniverseRaceConst")

function UniverseRaceReplayCell:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceReplayCell", "universeRace"),
		binding = {
			_buttonLook = {
				events = {{event = "touch", method = "_onButtonLookClicked"}}
			},
		}
	}
	UniverseRaceReplayCell.super.ctor(self, resource)
end

function UniverseRaceReplayCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function UniverseRaceReplayCell:update(replayData)
	local function updateUnit(data, index)
		local isWin = data.isWin
		local heroInfoList = data.heroInfoList
		local resName = isWin and "txt_com_battle_win" or "txt_com_battle_lose"
		self["_imageResult"..index]:loadTexture(Path.getBattleFont(resName))
		for i = 1, 6 do
			local heroInfo = heroInfoList[i]
			if heroInfo then
				local heroId = heroInfo.heroId
				local limitLevel = heroInfo.limitLevel
				local limitRedLevel = heroInfo.limitRedLevel
				self["_nodeIcon"..index.."_"..i]:updateUI(heroId, nil, limitLevel, limitRedLevel)
				self["_nodeIcon"..index.."_"..i]:showHeroUnknow(false)
			else
				self["_nodeIcon"..index.."_"..i]:showHeroUnknow(true)
			end
		end
	end

	local battleNo = replayData:getBattle_no()
	self._textMatch:setString(Lang.get("camp_round", {count = battleNo}))

	local datas = {}
	datas[1] = {}
	datas[2] = {}
	local winnerSide = replayData:getWinnerSide()
	if winnerSide == UniverseRaceConst.SIDE_LEFT then
		datas[1].isWin = true
		datas[2].isWin = false
	elseif winnerSide == UniverseRaceConst.SIDE_RIGHT then
		datas[1].isWin = false
		datas[2].isWin = true
	end
	datas[1].heroInfoList = replayData:getHeroInfoList()
	datas[2].heroInfoList = replayData:getHeroInfoList()
	for i = 1, 2 do
		updateUnit(datas[i], i)
	end
end

function UniverseRaceReplayCell:_onButtonLookClicked()
	self:dispatchCustomCallback(1)
end

return UniverseRaceReplayCell