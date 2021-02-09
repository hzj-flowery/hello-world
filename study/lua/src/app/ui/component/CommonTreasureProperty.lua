local UserDataHelper = require("app.utils.UserDataHelper")
local EquipDetailStrengthenNode = require("app.scene.view.equipmentDetail.EquipDetailStrengthenNode")
local EquipDetailSuitNode = require("app.scene.view.equipmentDetail.EquipDetailSuitNode")
local EquipDetailRefineNode = require("app.scene.view.equipmentDetail.EquipDetailRefineNode")
local EquipDetailBriefNode = require("app.scene.view.equipmentDetail.EquipDetailBriefNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local TreasureDetailStrengthenNode = require("app.scene.view.treasureDetail.TreasureDetailStrengthenNode")
local TreasureDetailRefineNode = require("app.scene.view.treasureDetail.TreasureDetailRefineNode")
local TreasureDetailYokeNode = require("app.scene.view.treasureDetail.TreasureDetailYokeNode")
local TreasureDetailBriefNode = require("app.scene.view.treasureDetail.TreasureDetailBriefNode")
local TreasureDetailYokeModule = require("app.scene.view.treasureDetail.TreasureDetailYokeModule")
local UIHelper  = require("yoka.utils.UIHelper")

local CommonTreasureProperty = class("CommonTreasureProperty")

local EXPORTED_METHODS = {
    "updateUI",
}

function CommonTreasureProperty:ctor()
	self._target = nil
    self._name2 = nil
end

function CommonTreasureProperty:_init()
    self._name2 = ccui.Helper:seekNodeByName(self._target, "Name2")
    self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
    self._listView:setScrollBarEnabled(false)
    cc.bind(self._target, "CommonDetailWindow")

    -- if cc.isRegister("CommonTreasureName") then
	-- 	cc.bind(self._name2, "CommonTreasureName")
	-- end

end

function CommonTreasureProperty:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTreasureProperty:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonTreasureProperty:_buildAttrModule()
	--强化属性
	local treasureData = self._treasureData

	local treasureDetailStrengthenNode = TreasureDetailStrengthenNode.new(treasureData, self._rangeType)
	self._listView:pushBackCustomItem(treasureDetailStrengthenNode)
end


function CommonTreasureProperty:_buildYokeModule()
	--羁绊
	local treasureData = self._treasureData
	local yokeInfo = UserDataHelper.getTreasureYokeInfo(treasureData:getBase_id())
	if #yokeInfo > 0 then
		local treasureId = treasureData:getId()
		local width = 402 -- 适配不同地方的长度
		local treasureDetailYokeModule = TreasureDetailYokeModule.new(yokeInfo, treasureId, width)
		self._listView:pushBackCustomItem(treasureDetailYokeModule)
	end
end

function CommonTreasureProperty:_buildBriefModule()
	--描述
	local treasureData = self._treasureData

	local treasureDetailBriefNode = TreasureDetailBriefNode.new(treasureData)
	self._listView:pushBackCustomItem(treasureDetailBriefNode)
end


function CommonTreasureProperty:_updateListView()
	--详情List开始
	self._listView:removeAllChildren()
	if self._treasureData:isCanTrain() then
		--强化属性
		self:_buildAttrModule()

	end

	--羁绊
	self:_buildYokeModule()
	--简介
	self:_buildBriefModule()
end

function CommonTreasureProperty:updateUI(treasureData)
    self._treasureData = treasureData

    self:_updateListView()


    local treasureBaseId = treasureData:getBase_id()
    local rLevel = treasureData:getRefine_level()
    self:setName(treasureBaseId,rLevel)
end

function CommonTreasureProperty:setName(treasureBaseId,rLevel)
	local treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureBaseId)

	local treasureName = treasureParam.name
	if rLevel and rLevel > 0 then
		treasureName = treasureName.."+"..rLevel
	end

	self._name2:setString(treasureName)
	self._name2:setColor(treasureParam.icon_color)
	self._name2:setFontSize(20)
	UIHelper.updateTextOutline(self._name2, treasureParam)
end




return CommonTreasureProperty