--
-- Author: Liangxu
-- Date: 2018-3-9 14:15:11
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local SilkbagDetailExCell = class("SilkbagDetailExCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

function SilkbagDetailExCell:ctor()
	local resource = {
		file = Path.getCSB("SilkbagDetailExCell", "silkbag"),
		binding = {
			
		}
	}
	SilkbagDetailExCell.super.ctor(self, resource)
end

function SilkbagDetailExCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self:_initDesc()
end


function SilkbagDetailExCell:_updateDesc(strDesc)
	self._textDesTrue:setString(strDesc)
	
	local labelSize = self._textDesTrue:getContentSize()
	self._textDescSc:setInnerContainerSize(labelSize)
	local orgHeight = self._textDescSc:getContentSize().height
	local height = math.max(orgHeight, labelSize.height)
	self._textDesTrue:setPosition(cc.p(0, height))
	local enable = labelSize.height>orgHeight
	self._textDescSc:setTouchEnabled(enable)
	self._textDescSc:setSwallowTouches(enable)
end

function SilkbagDetailExCell:_initDesc()
	local size = self._textDes:getContentSize()
	local sc = ccui.ScrollView:create()
	sc:setBounceEnabled(true)
	sc:setDirection(ccui.ScrollViewDir.vertical)
	sc:setTouchEnabled(true)
	sc:setSwallowTouches(true)
	sc:setScrollBarEnabled(false)
	sc:setContentSize(size)

	local label = cc.Label:createWithTTF("", Path.getCommonFont(), self._textDes:getFontSize())
	label:setColor(self._textDes:getColor())
	label:setMaxLineWidth(size.width)
	label:setAnchorPoint(self._textDes:getAnchorPoint())
	self._textDesTrue = label

	self._textDes:getParent():addChild(sc)
	sc:setAnchorPoint(self._textDes:getAnchorPoint())
	sc:setPosition(cc.p(self._textDes:getPosition()))
	self._textDes:setVisible(false)
	sc:addChild(label)
	self._textDescSc = sc
end

function SilkbagDetailExCell:update(silkId, heroBaseId)
	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)
	local strLimit = ""
	local strDes = ""
	if silkId > 0 then
		local info = SilkbagDataHelper.getSilkMappingConfig(silkId, heroBaseId)
		strDes = info.description
		local limitRank = SilkbagDataHelper.getLimitRankForEffective(info)
		local limitLevel = SilkbagDataHelper.getLimitLevelForEffective(info)
		local limitRedLevel = SilkbagDataHelper.getRedLimitLevelForEffective(info)
		
		if limitRank then
			if limitRank > 0 then
				strLimit = Lang.get("silkbag_effective_rank_ex", {rank = limitRank})
			end
		elseif info.effective_5 == 1 then
			local heroInfo = HeroDataHelper.getHeroConfig(heroBaseId)
			local instrumentMaxLevel = require("app.config.instrument").get(heroInfo.instrument_id).level_max
			strLimit = Lang.get("silkbag_effective_instrument_ex", {level = instrumentMaxLevel})
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

	self._fileNodeIcon:updateUI(heroBaseId)
	self._textName:setString(heroParam.cfg.name.." "..strLimit)
	self._textName:setColor(heroParam.icon_color)
	require("yoka.utils.UIHelper").updateTextOutline(self._textName, heroParam)
	self:_updateDesc(strDes)
	-- self._textDes:setString(strDes)
end

return SilkbagDetailExCell