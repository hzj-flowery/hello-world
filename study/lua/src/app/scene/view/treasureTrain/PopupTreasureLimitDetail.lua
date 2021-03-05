--
-- Author: Liangxu
-- Date: 2018-12-27
-- 宝物界限详情弹框
local PopupBase = require("app.ui.PopupBase")
local PopupTreasureLimitDetail = class("PopupTreasureLimitDetail", PopupBase)
local TreasureLimitDetailStrNode = require("app.scene.view.treasureTrain.TreasureLimitDetailStrNode")
local TreasureLimitDetailRefineNode = require("app.scene.view.treasureTrain.TreasureLimitDetailRefineNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TreasureDataHelper = require("app.utils.data.TreasureDataHelper")
local TreasureConst = require("app.const.TreasureConst")

function PopupTreasureLimitDetail:ctor(treasureUnitData)
	self._treasureUnitData = treasureUnitData

	local resource = {
		file = Path.getCSB("PopupLimitDetail", "hero"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onButtonClose"}}
			},
		}
	}
	PopupTreasureLimitDetail.super.ctor(self, resource)
end

function PopupTreasureLimitDetail:onCreate()
	self._textTitle:setString(Lang.get("limit_break_title"))
end

function PopupTreasureLimitDetail:onEnter()
	local limitLevel = self._treasureUnitData:getLimit_cost()
	local baseId1 = self._treasureUnitData:getBase_id()
	local baseId2 = TreasureDataHelper.getTreasureConfig(baseId1).limit_up_id

	-- 到顶了或者当前显示到顶了，左边内容降级，右边内容为当前界限突破等级
	if (limitLevel==TreasureConst.TREASURE_LIMIT_RED_LEVEL and self._treasureUnitData:isLimitShowTop())
		or baseId2==0 then
		baseId2 = baseId1
		baseId1 = G_UserData:getTreasure():getLimitOrgSrcId(baseId1)
	end
	
	local param1 = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, baseId1)
	local param2 = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, baseId2)
	self._textName1:setString(param1.name)
	self._textName2:setString(param2.name)
	self._textName1:setColor(param1.icon_color)
	self._textName2:setColor(param2.icon_color)

	local baseColor1 = TreasureDataHelper.getTreasureConfig(baseId1).color
	if baseColor1==7 then
		local baseOutlineColor1 = Colors.getColorOutline(baseColor1)
		self._textName1:enableOutline(baseOutlineColor1,2)
	end

	local baseColor2 = TreasureDataHelper.getTreasureConfig(baseId2).color
	if baseColor2==7 then
		local baseOutlineColor2 = Colors.getColorOutline(baseColor2)
		self._textName2:enableOutline(baseOutlineColor2,2)
	end

	self:_updateList()
end

function PopupTreasureLimitDetail:onExit()
	
end

function PopupTreasureLimitDetail:_updateList()
	self._listView:removeAllChildren()
	local module1 = self:_buildStrAttrModule()
	local module2 = self:_buildRefineAttrModule()
	self._listView:pushBackCustomItem(module1)
	self._listView:pushBackCustomItem(module2)
	self._listView:doLayout()
end

function PopupTreasureLimitDetail:_buildStrAttrModule()
	local attrModule = TreasureLimitDetailStrNode.new(self._treasureUnitData)
	return attrModule
end

function PopupTreasureLimitDetail:_buildRefineAttrModule()
	local talentModule = TreasureLimitDetailRefineNode.new(self._treasureUnitData)
	return talentModule
end

function PopupTreasureLimitDetail:_onButtonClose()
	self:close()
end

return PopupTreasureLimitDetail
