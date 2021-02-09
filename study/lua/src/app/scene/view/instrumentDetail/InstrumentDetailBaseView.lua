--
-- Author: Liangxu
-- Date: 2017-9-16 10:22:34
--
local ViewBase = require("app.ui.ViewBase")
local InstrumentDetailBaseView = class("InstrumentDetailBaseView", ViewBase)
local InstrumentDetailAttrNode = require("app.scene.view.instrumentDetail.InstrumentDetailAttrNode")
local InstrumentDetailBriefNode = require("app.scene.view.instrumentDetail.InstrumentDetailBriefNode")
local InstrumentDetailYokeNode = require("app.scene.view.instrumentDetail.InstrumentDetailYokeNode")
local InstrumentDetailFeatureNode = require("app.scene.view.instrumentDetail.InstrumentDetailFeatureNode")
local InstrumentDetailTalentNode = require("app.scene.view.instrumentDetail.InstrumentDetailTalentNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIHelper = require("yoka.utils.UIHelper")

function InstrumentDetailBaseView:ctor(instrumentData, rangeType)
	self._textName 			= nil --神兵名称
	self._textFrom			= nil --装备于
	self._textDetailName 	= nil --神兵详情头部的名称
	self._listView 			= nil --神兵详情列表框

	self._instrumentData 		= instrumentData
	self._rangeType = rangeType

	local resource = {
		file = Path.getCSB("InstrumentDetailBaseView", "instrument"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		
		}
	}
	InstrumentDetailBaseView.super.ctor(self, resource)
end

function InstrumentDetailBaseView:onCreate()
	
end

function InstrumentDetailBaseView:onEnter()
	self:_updateInfo()
end

function InstrumentDetailBaseView:onExit()

end

function InstrumentDetailBaseView:_updateInfo()
	local instrumentData = self._instrumentData
	local instrumentBaseId = instrumentData:getBase_id()
	local limitLevel = instrumentData:getLimit_level()
	local instrumentParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, instrumentBaseId, nil, nil, limitLevel)

	local heroBaseId = UserDataHelper.getHeroBaseIdWithInstrumentId(instrumentData:getId())
	if heroBaseId == nil then
		self._textFrom:setVisible(false)
	else
		self._textFrom:setVisible(true)
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)
		self._textFrom:setString(Lang.get("instrument_detail_from", {name = heroParam.name}))
	end

	--名字
	local instrumentName = instrumentParam.name
	local level = instrumentData:getLevel()
	if level > 0 then
		instrumentName = instrumentName.."+"..level
	end
	self._textName:setString(instrumentName)
	self._textName:setColor(instrumentParam.icon_color)
	self._textName:setFontSize(20)
	-- self._textName:enableOutline(instrumentParam.icon_color_outline, 2)
	self._textDetailName:setString(instrumentName)
	self._textDetailName:setColor(instrumentParam.icon_color)
	self._textDetailName:setFontSize(22)
	UIHelper.updateTextOutline(self._textDetailName, instrumentParam)
	-- self._textDetailName:enableOutline(instrumentParam.icon_color_outline, 2)

	--详情列表
	self:_updateListView()
end

function InstrumentDetailBaseView:_updateListView()
	--详情List开始
	self._listView:removeAllChildren()
	--属性
	self:_buildAttrModule()
	--羁绊
	self:_buildYokeModule()
	--特性
	self:_buildFeatureModule()
	--天赋
	self:_buildTalentModule()
	--简介
	self:_buildBriefModule()
end

function InstrumentDetailBaseView:_buildAttrModule()
	local item = InstrumentDetailAttrNode.new(self._instrumentData, self._rangeType)
	self._listView:pushBackCustomItem(item)
end

function InstrumentDetailBaseView:_buildYokeModule()
	local item = InstrumentDetailYokeNode.new(self._instrumentData)
	self._listView:pushBackCustomItem(item)
end

function InstrumentDetailBaseView:_buildFeatureModule()
	local item = InstrumentDetailFeatureNode.new(self._instrumentData)
	self._listView:pushBackCustomItem(item)
end

function InstrumentDetailBaseView:_buildTalentModule()
	local item = InstrumentDetailTalentNode.new(self._instrumentData)
	self._listView:pushBackCustomItem(item)
end

function InstrumentDetailBaseView:_buildBriefModule()
	local item = InstrumentDetailBriefNode.new(self._instrumentData)
	self._listView:pushBackCustomItem(item)
end

return InstrumentDetailBaseView