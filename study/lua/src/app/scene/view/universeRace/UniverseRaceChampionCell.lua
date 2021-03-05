---------------------------------------------------------------------
-- Created by: liangxu
-- Date: 2020-03-13 17:42:22
---------------------------------------------------------------------
local ViewBase = require("app.ui.ViewBase")
local UniverseRaceChampionCell = class("UniverseRaceChampionCell", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local RES_INFO = {
	["left"] = {bg = "img_hero_zuo01", frame = "img_hero_zuo02", showAdornment = false},	
	["mid"] = {bg = "img_hero_zhong01", frame = "img_hero_zhong02", showAdornment = false},
	["right"] = {bg = "img_hero_you01", frame = "img_hero_you02", showAdornment = true},
}

function UniverseRaceChampionCell:ctor(type, callback)
	self._type = type
	self._callback = callback
	local resource = {
		file = Path.getCSB("UniverseRaceChampionCell", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonLook = {
				events = {{event = "touch", method = "_onButtonLookClicked"}}
			},
		},
	}
	UniverseRaceChampionCell.super.ctor(self, resource)
end

function UniverseRaceChampionCell:onCreate()
	local info = RES_INFO[self._type]
	self._imageBg:loadTexture(Path.getPvpUniverseImage(info.bg))
	self._imageFrame:loadTexture(Path.getPvpUniverseImage(info.frame))
	self._imageAdornment:setVisible(info.showAdornment)
	self._imageHero:setVisible(false)
end

function UniverseRaceChampionCell:updateUI(coverId, limitLevel, limitRedLevel)
	if coverId then
		local itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, coverId, nil, nil, limitLevel, limitRedLevel)
		self._imageHero:setVisible(true)
		self._imageHero:loadTexture(itemParams.bodyIcon)
	else
		self._imageHero:setVisible(false)
	end
end

function UniverseRaceChampionCell:_onButtonLookClicked()
	if self._callback then
		self._callback()
	end
end

return UniverseRaceChampionCell