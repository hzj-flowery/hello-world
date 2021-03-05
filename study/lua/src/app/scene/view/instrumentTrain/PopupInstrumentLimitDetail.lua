--
-- Author: Liangxu
-- Date: 2018-11-5
-- 神兵界限详情弹框
local PopupBase = require("app.ui.PopupBase")
local PopupInstrumentLimitDetail = class("PopupInstrumentLimitDetail", PopupBase)
local InstrumentLimitDetailAttrNode = require("app.scene.view.instrumentTrain.InstrumentLimitDetailAttrNode")
local InstrumentLimitDetailTalentNode = require("app.scene.view.instrumentTrain.InstrumentLimitDetailTalentNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local InstrumentDataHelper = require("app.utils.data.InstrumentDataHelper")
local InstrumentConst = require("app.const.InstrumentConst")

function PopupInstrumentLimitDetail:ctor(instrumentUnitData)
	self._instrumentUnitData = instrumentUnitData

	local resource = {
		file = Path.getCSB("PopupLimitDetail", "hero"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onButtonClose"}}
			},
		}
	}
	PopupInstrumentLimitDetail.super.ctor(self, resource)
end

function PopupInstrumentLimitDetail:onCreate()
	self._textTitle:setString(Lang.get("limit_break_title"))
end

function PopupInstrumentLimitDetail:onEnter()
	local baseId = self._instrumentUnitData:getBase_id()
	local limitLevel = self._instrumentUnitData:getLimit_level()
	local param = nil
	local param2 = nil
	if limitLevel < self._instrumentUnitData:getMaxLimitLevel() and 
		 self._instrumentUnitData:getLimitFuncOpened() then
		param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, nil, nil, limitLevel)
		param2 = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, nil, nil, limitLevel + 1)
	else
		param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, nil, nil, limitLevel - 1)
		param2 = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, nil, nil, limitLevel)
	end
	self._textName1:setString(param.name)
	self._textName2:setString(param2.name)
	self._textName1:setColor(param.icon_color)
	self._textName2:setColor(param2.icon_color)
	require("yoka.utils.UIHelper").updateTextOutline(self._textName1, param)
	require("yoka.utils.UIHelper").updateTextOutline(self._textName2, param2)
	self:_updateList()
end

function PopupInstrumentLimitDetail:onExit()
	
end

function PopupInstrumentLimitDetail:_updateList()
	self._listView:removeAllChildren()
	local module1 = self:_buildAttrModule()
	local module2 = self:_buildTalentModule()
	self._listView:pushBackCustomItem(module1)
	self._listView:pushBackCustomItem(module2)
	self._listView:doLayout()
end

function PopupInstrumentLimitDetail:_buildAttrModule()
	local instrumentUnitData = self._instrumentUnitData
	local info = self._instrumentUnitData:getConfig()
	local limitLevel = self._instrumentUnitData:getLimit_level()
	local nextLimitLevel = limitLevel
	local templateId1 = self._instrumentUnitData:getAdvacneTemplateId()
	local curRankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, limitLevel)
	local level = curRankInfo.level
	if limitLevel < self._instrumentUnitData:getMaxLimitLevel() and
		self._instrumentUnitData:getLimitFuncOpened() then
		nextLimitLevel = limitLevel + 1
	else
		--满级了 找前一级
		local preRankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, limitLevel - 1)
		level = preRankInfo.level
		templateId1 = preRankInfo.rank_size
	end
	local rankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, nextLimitLevel)
	local templateId2 = rankInfo.rank_size
	local attrModule = InstrumentLimitDetailAttrNode.new(level, templateId1, templateId2)
	return attrModule
end

function PopupInstrumentLimitDetail:_buildTalentModule()
	local instrumentUnitData = self._instrumentUnitData
	local info = self._instrumentUnitData:getConfig()
	local limitLevel = self._instrumentUnitData:getLimit_level()
	local nextLimitLevel = limitLevel
	local templateId1 = self._instrumentUnitData:getAdvacneTemplateId()
	if limitLevel < self._instrumentUnitData:getMaxLimitLevel() and self._instrumentUnitData:getLimitFuncOpened()  then
		nextLimitLevel = limitLevel + 1
	else
		--满级了 找前一级
		local preRankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, limitLevel - 1)
		templateId1 = preRankInfo.rank_size
	end
	local rankInfo = InstrumentDataHelper.getInstrumentRankConfig(info.instrument_rank_1, nextLimitLevel)
	local templateId2 = rankInfo.rank_size
	local talentModule = InstrumentLimitDetailTalentNode.new(instrumentUnitData, templateId1, templateId2)
	return talentModule
end

function PopupInstrumentLimitDetail:_onButtonClose()
	self:close()
end

return PopupInstrumentLimitDetail
