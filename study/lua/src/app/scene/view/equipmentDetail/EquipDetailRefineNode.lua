--
-- Author: Liangxu
-- Date: 2017-04-12 17:40:19
-- 装备详情 精炼模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local EquipDetailRefineNode = class("EquipDetailRefineNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local UIHelper = require("yoka.utils.UIHelper")
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
local EquipConst = require("app.const.EquipConst")
local ParameterIDConst = require("app.const.ParameterIDConst")

function EquipDetailRefineNode:ctor(equipData, rangeType, isFromLimitUp)
	self._equipData = equipData
	self._isFromLimitUp = isFromLimitUp or false
	self._rangeType = rangeType or EquipConst.EQUIP_RANGE_TYPE_1

	local resource = {
		file = Path.getCSB("EquipDetailDynamicModule", "equipment"),
		binding = {}
	}
	EquipDetailRefineNode.super.ctor(self, resource)
end

function EquipDetailRefineNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local offset = 0
	if self._equipData:isUserEquip() and not self._isFromLimitUp then
		local btnWidget = self:_createButton()
		self._listView:pushBackCustomItem(btnWidget)
	else
		offset = 10
	end

	local level = self:_createLevelDes()
	self._listView:pushBackCustomItem(level)

	self:_addAttrDes()

	local master, line = self:_createMasterInfo()
	if master then
		self._listView:pushBackCustomItem(master)
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	contentSize.height = contentSize.height + offset
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function EquipDetailRefineNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("equipment_detail_title_refine"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function EquipDetailRefineNode:_createLevelDes()
	local widget = ccui.Widget:create()

	local node = CSHelper.loadResourceNode(Path.getCSB("CommonDesValue", "common"))
	local des = Lang.get("equipment_detail_refine_level")
	local value = self._equipData:getR_level()
	local ratio = require("app.config.parameter").get(ParameterIDConst.MAX_EQUIPMENT_REFINE_LEVEL).content / 1000
	local max = math.floor(G_UserData:getBase():getLevel() * ratio)
	local color = value < max and Colors.BRIGHT_BG_ONE or Colors.BRIGHT_BG_GREEN

	node:setFontSize(20)
	node:updateUI(des, value, max)
	node:setValueColor(color)
	node:setMaxColor(color)
	node:setPosition(24, 20)
	widget:addChild(node)
	widget:setContentSize(cc.size(402, 30))

	return widget
end

function EquipDetailRefineNode:_addAttrDes()
	local attrInfo = UserDataHelper.getEquipRefineAttr(self._equipData)
	for k, value in pairs(attrInfo) do
		local widget = ccui.Widget:create()
		local name, value = TextHelper.getAttrBasicText(k, value)
		name = TextHelper.expandTextByLen(name, 4)
		local node = CSHelper.loadResourceNode(Path.getCSB("CommonDesValue", "common"))
		node:setFontSize(20)
		node:updateUI(name .. "：", value)
		node:setPosition(24, 20)
		widget:addChild(node)
		widget:setContentSize(cc.size(402, 30))
		self._listView:pushBackCustomItem(widget)
	end
end

function EquipDetailRefineNode:_createMasterInfo()
	local pos = self._equipData:getPos()
	local info = UserDataHelper.getMasterEquipRefineInfo(pos)
	local level = info.curMasterLevel
	if level <= 0 then
		return nil
	end

	local widget = ccui.Widget:create()
	local master = CSHelper.loadResourceNode(Path.getCSB("CommonMasterInfoNode", "common"))
	local title = Lang.get("equipment_datail_refine_master", {level = level})
	local attrInfo = info.curAttr
	local line = master:updateUI(title, attrInfo)
	widget:addChild(master)
	local size = master:getContentSize()
	widget:setContentSize(size)
	return widget, line
end

function EquipDetailRefineNode:_createButton()
	local widget = ccui.Widget:create()
	local btn = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel2Highlight", "common"))
	btn:setString(Lang.get("equipment_detail_btn_refine"))
	btn:addClickEventListenerEx(handler(self, self._onButtonRefineClicked))
	widget:addChild(btn)

	local RedPointHelper = require("app.data.RedPointHelper")
	local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, "slotRP", self._equipData)
	btn:showRedPoint(reach)

	btn:setPosition(324, -27)
	widget:setContentSize(cc.size(402, 1))
	return widget
end

function EquipDetailRefineNode:_onButtonRefineClicked()
	if EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2) == false then
		return
	end

	local equipId = self._equipData:getId()
	G_SceneManager:showScene("equipTrain", equipId, EquipConst.EQUIP_TRAIN_REFINE, self._rangeType, true)
end

return EquipDetailRefineNode
