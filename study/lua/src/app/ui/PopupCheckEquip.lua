--
-- Author: Liangxu
-- Date: 2017-07-17 13:32:51
-- 复选装备通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupCheckEquip = class("PopupCheckEquip", PopupBase)
local PopupCheckEquipCell = require("app.ui.PopupCheckEquipCell")
local PopupCheckEquipHelper = require("app.ui.PopupCheckEquipHelper")

local TITLE = {
	[1] = "equip_check_title_1",
}

function PopupCheckEquip:ctor(parentView)
	self._parentView = parentView
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupCheckEquip", "common"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onButtonOK"}}
			},
		}
	}
	PopupCheckEquip.super.ctor(self, resource)
end

function PopupCheckEquip:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._buttonOk:setString(Lang.get("hero_upgrade_btn_Ok"))
	for i = 1, 2 do
		self["_nodeDes"..i]:setFontSize(20)
	end
	self._nodeCount:setFontSize(20)
end

function PopupCheckEquip:onEnter()
	self:_updateInfo()
end

function PopupCheckEquip:onClose()
	if self._clickOk then
		self._clickOk()
	end
end

function PopupCheckEquip:onExit()

end

function PopupCheckEquip:updateUI(fromType, clickOk)
	self._fromType = fromType
	self._clickOk = clickOk

	self._maxCount = PopupCheckEquipHelper.getMaxCount(fromType)
	self._commonNodeBk:setTitle(Lang.get(TITLE[fromType]))

	local helpFunc = PopupCheckEquipHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._equipsData = helpFunc()
	end
	assert(self._equipsData, "self._equipsData can not be null")
	self._count = math.ceil(#self._equipsData / 2)
	self._listView:setTemplate(PopupCheckEquipCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupCheckEquip:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2, isAdded1, isAdded2 = nil

	if self._equipsData[index + 1] then
		local data = self._equipsData[index + 1]
		data1 = PopupCheckEquipHelper.addEquipDataDesc(data, self._fromType)
		isAdded1 = self._parentView:checkIsAdded(data1)
	end

	if self._equipsData[index + 2] then
		local data = self._equipsData[index + 2]
		data2 = PopupCheckEquipHelper.addEquipDataDesc(data, self._fromType)
		isAdded2 = self._parentView:checkIsAdded(data2)
	end

	item:update(data1, data2, isAdded1, isAdded2)
end

function PopupCheckEquip:_onItemSelected(item, index)

end

function PopupCheckEquip:_onItemTouch(index, t, selected, item)
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

function PopupCheckEquip:_onButtonClose()
	self:close()
end

function PopupCheckEquip:_onButtonOK()
	self:close()
end

function PopupCheckEquip:_updateInfo()
	local trainFoodData = self._parentView:getEquipCount()
	local desValue = PopupCheckEquipHelper.getTotalDesInfo(self._fromType, trainFoodData)
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

return PopupCheckEquip
