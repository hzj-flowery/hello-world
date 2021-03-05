--
-- Author: Liangxu
-- Date: 2017-05-09 10:06:57
--
local ViewBase = require("app.ui.ViewBase")
local TreasureDetailBaseView = class("TreasureDetailBaseView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TreasureDetailStrengthenNode = require("app.scene.view.treasureDetail.TreasureDetailStrengthenNode")
local TreasureDetailRefineNode = require("app.scene.view.treasureDetail.TreasureDetailRefineNode")
local TreasureDetailYokeNode = require("app.scene.view.treasureDetail.TreasureDetailYokeNode")
local TreasureDetailBriefNode = require("app.scene.view.treasureDetail.TreasureDetailBriefNode")
local TreasureDetailJadeNode = require("app.scene.view.equipmentJade.TreasureDetailJadeNode")
local TreasureDetailYokeModule = require("app.scene.view.treasureDetail.TreasureDetailYokeModule")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIHelper  = require("yoka.utils.UIHelper")

function TreasureDetailBaseView:ctor(treasureData, rangeType)
	self._textName 			= nil --宝物名称
	self._textFrom			= nil --装备于
	self._textPotential 	= nil --宝物品级
	self._textDetailName 	= nil --宝物详情头部的名称
	self._listView 			= nil --宝物详情列表框

	self._treasureData 		= treasureData
	self._rangeType = rangeType

	local resource = {
		file = Path.getCSB("TreasureDetailBaseView", "treasure"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		
		}
	}
	TreasureDetailBaseView.super.ctor(self, resource)
end

function TreasureDetailBaseView:onCreate()
	
end

function TreasureDetailBaseView:onEnter()
	self:_updateInfo()
end

function TreasureDetailBaseView:onExit()

end

function TreasureDetailBaseView:_updateInfo()
	local treasureData = self._treasureData
	local treasureBaseId = treasureData:getBase_id()
	local treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureBaseId)

	local heroUnitData = UserDataHelper.getHeroDataWithTreasureId(treasureData:getId())

	if heroUnitData == nil then
		self._textFrom:setVisible(false)
	else
		local baseId = heroUnitData:getBase_id()
		local limitLevel = heroUnitData:getLimit_level()
		local limitRedLevel = heroUnitData:getLimit_rtg()
		self._textFrom:setVisible(true)
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)
		self._textFrom:setString(Lang.get("treasure_detail_from", {name = heroParam.name}))
	end

	--名字
	local treasureName = treasureParam.name
	local rLevel = treasureData:getRefine_level()
	if rLevel > 0 then
		treasureName = treasureName.."+"..rLevel
	end
	self._textName:setString(treasureName)
	self._textName:setColor(treasureParam.icon_color)
	-- self._textName:enableOutline(treasureParam.icon_color_outline, 2)
	self._textDetailName:setString(treasureName)
	self._textDetailName:setColor(treasureParam.icon_color)
	
	UIHelper.updateTextOutline(self._textDetailName, treasureParam)

	--品级
	self._textPotential:setString(Lang.get("treasure_detail_txt_potential", {value = treasureParam.potential}))
	self._textPotential:setColor(treasureParam.icon_color)
	self._textPotential:enableOutline(treasureParam.icon_color_outline, 2)

	--详情列表
	self:_updateListView()
end

function TreasureDetailBaseView:_buildAttrModule()
	--强化属性
	local treasureData = self._treasureData

	local treasureDetailStrengthenNode = TreasureDetailStrengthenNode.new(treasureData, self._rangeType)
	self._listView:pushBackCustomItem(treasureDetailStrengthenNode)
end

function TreasureDetailBaseView:_buildRefineModule()
	--精炼属性
	local treasureData = self._treasureData

	local treasureDetailRefineNode = TreasureDetailRefineNode.new(treasureData, self._rangeType)
	self._listView:pushBackCustomItem(treasureDetailRefineNode)
end

function TreasureDetailBaseView:_buildYokeModule()
	--羁绊
	local treasureData = self._treasureData
	local yokeInfo = UserDataHelper.getTreasureYokeInfo(treasureData:getBase_id())
	if #yokeInfo > 0 then
		local treasureId = treasureData:getId()
		local treasureDetailYokeModule = TreasureDetailYokeModule.new(yokeInfo, treasureId)
		self._listView:pushBackCustomItem(treasureDetailYokeModule)
	end
end

function TreasureDetailBaseView:_buildBriefModule()
	--描述
	local treasureData = self._treasureData

	local treasureDetailBriefNode = TreasureDetailBriefNode.new(treasureData)
	self._listView:pushBackCustomItem(treasureDetailBriefNode)
end

function TreasureDetailBaseView:_buildJadeModule()
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	if FunctionCheck.funcIsShow(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) then
		local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
		if self._treasureData:getJadeSlotNums() > 0 then
			local equipData = self._treasureData
			local treasureDetailJadeNode = TreasureDetailJadeNode.new(equipData, self._rangeType)
			self._listView:pushBackCustomItem(treasureDetailJadeNode)
		end
	end
end


function TreasureDetailBaseView:_updateListView()
	--详情List开始
	self._listView:removeAllChildren()
	
	if self._treasureData:isCanTrain() then
		--强化属性
		self:_buildAttrModule()

		--精炼属性
		self:_buildRefineModule()
	end
	--玉石
	self:_buildJadeModule()
	--羁绊
	self:_buildYokeModule()
	--简介
	self:_buildBriefModule()

	self._listView:doLayout()
end

return TreasureDetailBaseView