---------------------------------------------------------------------
-- Created by: liangxu
-- Date: 2020-03-19 14:58:21
---------------------------------------------------------------------
local PopupBase = require("app.ui.PopupBase")
local PopupUniverseRacePastChampion = class("PopupUniverseRacePastChampion", PopupBase)
local UserDetailViewHelper = require("app.scene.view.team.UserDetailViewHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDetailData = require("app.data.UserDetailData")

function PopupUniverseRacePastChampion:ctor(detailUser, championData)
	self._detailData = UserDetailData.new()
	self._detailData:updateData(detailUser)
	self._championData = championData
	local resource = {
		file = Path.getCSB("PopupUniverseRacePastChampion", "universeRace"),
		binding = {}
	}
	
	PopupUniverseRacePastChampion.super.ctor(self, resource)
end

function PopupUniverseRacePastChampion:onCreate()
	
end

function PopupUniverseRacePastChampion:onEnter()
	G_EffectGfxMgr:createPlayGfx(self._nodeEffect, "effect_zhenwuzhanshen_lihui_bg")
	self:_updateUser()
	self:_updateHero()
end

function PopupUniverseRacePastChampion:onExit()

end

function PopupUniverseRacePastChampion:_updateUser()
	local heroId, limitLevel, limitRedLevel = self._championData:getCovertIdAndLimitLevel()
	self._nodeStory:updateUI(heroId, limitLevel, limitRedLevel)
	self._textName:setString(self._championData:getUser_name())
	self._textName:setColor(Colors.getOfficialColor(self._championData:getOfficer_lv()))
	self._textServer:setString(self._championData:getServer_name())
end

function PopupUniverseRacePastChampion:_updateHero()
	local iconData = UserDetailViewHelper.getHeroAndPetIconData(self._detailData)
	for i = 1, 6 do
		local data = iconData[i]
		if data.type == TypeConvertHelper.TYPE_HERO and data.value > 0 then
			self["_nodeIcon"..i]:updateUI(data.value, nil, data.limitLevel, data.limitRedLevel)
			self["_nodeIcon"..i]:showHeroUnknow(false)
		else
			self["_nodeIcon"..i]:showHeroUnknow(true)
		end
	end
end

return PopupUniverseRacePastChampion