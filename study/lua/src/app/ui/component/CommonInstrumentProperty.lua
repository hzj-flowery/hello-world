local InstrumentDetailAttrNode = require("app.scene.view.instrumentDetail.InstrumentDetailAttrNode")
local InstrumentDetailBriefNode = require("app.scene.view.instrumentDetail.InstrumentDetailBriefNode")
local InstrumentDetailYokeNode = require("app.scene.view.instrumentDetail.InstrumentDetailYokeNode")
local InstrumentDetailFeatureNode = require("app.scene.view.instrumentDetail.InstrumentDetailFeatureNode")
local InstrumentDetailTalentNode = require("app.scene.view.instrumentDetail.InstrumentDetailTalentNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIHelper  = require("yoka.utils.UIHelper")


local CommonInstrumentProperty = class("CommonInstrumentProperty")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonInstrumentProperty:ctor()
	self._target = nil
    self._name2 = nil
end

function CommonInstrumentProperty:_init()
    self._name2 = ccui.Helper:seekNodeByName(self._target, "Name2")
    self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
    self._listView:setScrollBarEnabled(false)
    cc.bind(self._target, "CommonDetailWindow")

    -- if cc.isRegister("CommonInstrumentName") then
	-- 	cc.bind(self._name2, "CommonInstrumentName")
	-- end

end

function CommonInstrumentProperty:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonInstrumentProperty:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonInstrumentProperty:_buildAttrModule()
	local item = InstrumentDetailAttrNode.new(self._instrumentData, self._rangeType)
	self._listView:pushBackCustomItem(item)

    
end

function CommonInstrumentProperty:_buildYokeModule()
	local item = InstrumentDetailYokeNode.new(self._instrumentData)
	self._listView:pushBackCustomItem(item)
end

function CommonInstrumentProperty:_buildFeatureModule()
	local item = InstrumentDetailFeatureNode.new(self._instrumentData)
	self._listView:pushBackCustomItem(item)
end

function CommonInstrumentProperty:_buildTalentModule()
	local item = InstrumentDetailTalentNode.new(self._instrumentData)
	self._listView:pushBackCustomItem(item)
end

function CommonInstrumentProperty:_buildBriefModule()
	local item = InstrumentDetailBriefNode.new(self._instrumentData)
	self._listView:pushBackCustomItem(item)
end


function CommonInstrumentProperty:_updateListView()
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

function CommonInstrumentProperty:updateUI(instrumentData)
    self._instrumentData = instrumentData 
    self:_updateListView()
	self:setName( instrumentData:getBase_id(), instrumentData:getLevel())
end

function CommonInstrumentProperty:setName(instrumentId, rank)
	local instrumentParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, instrumentId)

	local instrumentName = instrumentParam.name
	if rank and rank > 0 then
		instrumentName = instrumentName.."+"..rank
	end

	self._name2:setString(instrumentName)
	self._name2:setColor(instrumentParam.icon_color)
	UIHelper.updateTextOutline(self._name2, instrumentParam)
end



return CommonInstrumentProperty