--
-- Author: Liangxu
-- Date: 2017-04-12 17:18:10
-- 武将详情 强化等级模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local EquipDetailStrengthenNode = class("EquipDetailStrengthenNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local UIHelper = require("yoka.utils.UIHelper")
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
local EquipConst = require("app.const.EquipConst")

function EquipDetailStrengthenNode:ctor(equipData, rangeType, isFromLimit)
	self._equipData = equipData
	self._rangeType = rangeType or EquipConst.EQUIP_RANGE_TYPE_1
	self._isFromLimit = isFromLimit or false -- 是否来自界限突破详情界面

	local resource = {
		file = Path.getCSB("EquipDetailDynamicModule", "equipment"),
		binding = {}
	}
	self:setName("EquipDetailStrengthenNode")
	EquipDetailStrengthenNode.super.ctor(self, resource)
end

function EquipDetailStrengthenNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local offset = 0
	if self._equipData:isUserEquip() and not self._isFromLimit then
		local btnWidget = self:_createButton()
		self._listView:pushBackCustomItem(btnWidget)
	else
		offset = 10
	end

	local level = self:_createLevelDes()
	self._listView:pushBackCustomItem(level)

	local attr = self:_createAttrDes()
	self._listView:pushBackCustomItem(attr)

	if not self._isFromLimit then
		local master, line = self:_createMasterDes()
		if master then
			self._listView:pushBackCustomItem(master)
		end
	end

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	contentSize.height = contentSize.height + offset
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function EquipDetailStrengthenNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("equipment_detail_title_strengthen"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function EquipDetailStrengthenNode:_createLevelDes()
	local widget = ccui.Widget:create()

	local node = CSHelper.loadResourceNode(Path.getCSB("CommonDesValue", "common"))
	local des = Lang.get("equipment_detail_strengthen_level")
	local value = self._equipData:getLevel()
	local ratio = require("app.config.parameter").get(12).content / 1000
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

function EquipDetailStrengthenNode:_createAttrDes()
	local widget = ccui.Widget:create()

	local attrInfo = UserDataHelper.getEquipStrengthenAttr(self._equipData)
	for k, value in pairs(attrInfo) do
		local name, value = TextHelper.getAttrBasicText(k, value)
		name = TextHelper.expandTextByLen(name, 4)
		local node = CSHelper.loadResourceNode(Path.getCSB("CommonDesValue", "common"))
		node:setFontSize(20)
		node:updateUI(name .. "：", value)
		node:setPosition(24, 20)
		widget:addChild(node)
		break
	end
	widget:setContentSize(cc.size(402, 30))
	return widget
end

function EquipDetailStrengthenNode:_createMasterDes()
	local pos = self._equipData:getPos()
	local info = UserDataHelper.getMasterEquipStrengthenInfo(pos)
	local level = info.curMasterLevel
	if level <= 0 then
		return nil
	end

	local widget = ccui.Widget:create()
	local master = CSHelper.loadResourceNode(Path.getCSB("CommonMasterInfoNode", "common"))
	local title = Lang.get("equipment_datail_strengthen_master", {level = level})
	local attrInfo = info.curAttr
	local line = master:updateUI(title, attrInfo)
	widget:addChild(master)
	local size = master:getContentSize()
	widget:setContentSize(size)

	return widget, line
end

function EquipDetailStrengthenNode:_createButton()
	local widget = ccui.Widget:create()
	local btn = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel2Highlight", "common"))
	btn:setString(Lang.get("equipment_detail_btn_strengthen"))
	btn:addClickEventListenerEx(handler(self, self._onButtonStrengthenClicked))
	btn:setButtonName("ButtonStrengthen")
	widget:addChild(btn)

	local RedPointHelper = require("app.data.RedPointHelper")
	local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1, "slotRP", self._equipData)
	btn:showRedPoint(reach)

	btn:setPosition(324, -27)
	widget:setContentSize(cc.size(402, 1))
	return widget
end

function EquipDetailStrengthenNode:_onButtonStrengthenClicked()
	if EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1) == false then
		return
	end

	local equipId = self._equipData:getId()
	G_SceneManager:showScene("equipTrain", equipId, EquipConst.EQUIP_TRAIN_STRENGTHEN, self._rangeType, true)
end

return EquipDetailStrengthenNode
