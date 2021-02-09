--
-- Author: JerryHe
-- Date: 2019-01-29
-- 复选战马装备通用界面
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupCheckHorseEquip = class("PopupCheckHorseEquip", PopupBase)
local PopupCheckHorseEquipCell = require("app.ui.PopupCheckHorseEquipCell")
local PopupCheckHorseEquipHelper = require("app.ui.PopupCheckHorseEquipHelper")

local TITLE = {
	[1] = "equip_check_title_1",
}

function PopupCheckHorseEquip:ctor(parentView)
	self._parentView = parentView
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupCheckHorseEquip", "common"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onButtonOK"}}
			},
		}
	}
	PopupCheckHorseEquip.super.ctor(self, resource)
end

function PopupCheckHorseEquip:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._buttonOk:setString(Lang.get("hero_upgrade_btn_Ok"))
	for i = 1, 2 do
		self["_nodeDes"..i]:setFontSize(20)
	end
	self._nodeCount:setFontSize(20)
end

function PopupCheckHorseEquip:onEnter()
	self:_updateInfo()
end

function PopupCheckHorseEquip:onClose()
	if self._clickOk then
		self._clickOk()
	end
end

function PopupCheckHorseEquip:onExit()

end

function PopupCheckHorseEquip:updateUI(fromType, clickOk)
	self._fromType = fromType
	self._clickOk = clickOk

	self._maxCount = PopupCheckHorseEquipHelper.getMaxCount(fromType)
	self._commonNodeBk:setTitle(Lang.get(TITLE[fromType]))

	local helpFunc = PopupCheckHorseEquipHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._equipsData = helpFunc()
	end
	assert(self._equipsData, "self._equipsData can not be null")
	self._count = math.ceil(#self._equipsData / 2)
	self._listView:setTemplate(PopupCheckHorseEquipCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupCheckHorseEquip:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2, isAdded1, isAdded2 = nil

	if self._equipsData[index + 1] then
		local data = self._equipsData[index + 1]
		data1 = PopupCheckHorseEquipHelper.addEquipDataDesc(data, self._fromType)
		isAdded1 = self._parentView:checkIsAdded(data1)
	end

	if self._equipsData[index + 2] then
		local data = self._equipsData[index + 2]
		data2 = PopupCheckHorseEquipHelper.addEquipDataDesc(data, self._fromType)
		isAdded2 = self._parentView:checkIsAdded(data2)
	end

	item:update(data1, data2, isAdded1, isAdded2)
end

function PopupCheckHorseEquip:_onItemSelected(item, index)

end

function PopupCheckHorseEquip:_onItemTouch(index, t, selected, item)
	if selected and self._parentView:checkIsMaxCount() then
		G_Prompt:showTip(Lang.get("hero_upgrade_food_max_tip"))
		item:setCheckBoxSelected(t, false)
		return
	end

	local data = self._equipsData[index * 2 + t]
	if selected then
		for i = 1, self._maxCount do
			if self._parentView:getEquipWithIndex(i) == nil then
				self._parentView:insertEquip(i, data)
				break
			end
		end
	else
		self._parentView:deleteEquipWithId(data:getId())
	end

	self:_updateInfo()
end

function PopupCheckHorseEquip:_onButtonClose()
	self:close()
end

function PopupCheckHorseEquip:_onButtonOK()
	self:close()
end

function PopupCheckHorseEquip:_updateInfo()
	local trainFoodData = self._parentView:getEquipCount()
	local desValue = PopupCheckHorseEquipHelper.getTotalDesInfo(self._fromType, trainFoodData)
	for i = 1, 2 do
		local info = desValue[i]
		if info then
			self["_nodeDes"..i]:updateUI(info.des, info.value)
			self["_nodeDes"..i]:setDesColor(info.colorDes)
			self["_nodeDes"..i]:setValueColor(info.colorValue)
			self["_nodeDes"..i]:setVisible(true)
		else
			self["_nodeDes"..i]:setVisible(false)
		end
	end

	local len = self._parentView:getEquipCount()
	local max = self._maxCount
	self._nodeCount:updateUI(Lang.get("hero_check_count_des"), len, max)
	self._nodeCount:setDesColor(Colors.BRIGHT_BG_TWO)
	self._nodeCount:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeCount:setMaxColor(Colors.BRIGHT_BG_ONE)
end

return PopupCheckHorseEquip
