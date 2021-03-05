local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupSilkbagInfoCell = class("PopupSilkbagInfoCell", ListViewCellBase)
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")

function PopupSilkbagInfoCell:ctor()
	local resource = {
		file = Path.getCSB("PopupSilkbagInfoCell", "common"),
		binding = {
			
		}
	}
	PopupSilkbagInfoCell.super.ctor(self, resource)
end

function PopupSilkbagInfoCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function PopupSilkbagInfoCell:update(heroBaseId, silkId)
	self._icon:updateUI(heroBaseId)
	self._icon:setTouchEnabled(true)
	local heroConfig = HeroDataHelper.getHeroConfig(heroBaseId)
	local strLimit = ""
	if silkId > 0 then
		local info = SilkbagDataHelper.getSilkMappingConfig(silkId, heroBaseId)
		local limitRank = SilkbagDataHelper.getLimitRankForEffective(info)
		local limitLevel = SilkbagDataHelper.getLimitLevelForEffective(info)
		local limitRedLevel = SilkbagDataHelper.getRedLimitLevelForEffective(info)
		
		if limitRank then
			if limitRank > 0 then
				strLimit = Lang.get("silkbag_effective_rank", {rank = limitRank})
			end
		elseif info.effective_5 == 1 then
			local heroInfo = HeroDataHelper.getHeroConfig(heroBaseId)
			local instrumentMaxLevel = require("app.config.instrument").get(heroInfo.instrument_id).level_max
			strLimit = Lang.get("silkbag_effective_instrument", {level = instrumentMaxLevel})
		elseif limitLevel > 0 then
			local heroInfo = HeroDataHelper.getHeroConfig(heroBaseId)
			if heroInfo.limit == 1 then
				strLimit = Lang.get("silkbag_effective_limit_ex", {limit = limitLevel})
			end
		elseif limitRedLevel > 0 then
			local heroInfo = HeroDataHelper.getHeroConfig(heroBaseId)
			if heroInfo.limit_red == 1 then
				strLimit = Lang.get("silkbag_effective_red_limit_ex", {limit = limitRedLevel})
			end
		end
	end
	local des = heroConfig.name.."\n"..strLimit
	self._textName:setString(des)
	self._textName:setColor(Colors.getColor(heroConfig.color))
end

return PopupSilkbagInfoCell