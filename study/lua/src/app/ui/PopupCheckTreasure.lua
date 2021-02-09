--
-- Author: Liangxu
-- Date: 2017-07-17 14:45:48
-- 宝物复选框
local PopupBase = require("app.ui.PopupBase")
local PopupCheckTreasure = class("PopupCheckTreasure", PopupBase)
local PopupCheckTreasureCell = require("app.ui.PopupCheckTreasureCell")
local PopupCheckTreasureHelper = require("app.ui.PopupCheckTreasureHelper")

local TITLE = {
	[1] = "treasure_check_title_1",
}

function PopupCheckTreasure:ctor(parentView)
	self._parentView = parentView
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupCheckTreasure", "common"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onButtonOK"}}
			},
		}
	}
	PopupCheckTreasure.super.ctor(self, resource)
end

function PopupCheckTreasure:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._buttonOk:setString(Lang.get("hero_upgrade_btn_Ok"))
	self._nodeCount:setFontSize(20)
end

function PopupCheckTreasure:onEnter()
	self:_updateInfo()
end

function PopupCheckTreasure:onExit()
	
end

function PopupCheckTreasure:onClose()
	if self._clickOk then
		self._clickOk()
	end
end

function PopupCheckTreasure:updateUI(fromType, clickOk)
	self._fromType = fromType
	self._clickOk = clickOk

	self._maxCount = PopupCheckTreasureHelper.getMaxCount(fromType)
	self._commonNodeBk:setTitle(Lang.get(TITLE[fromType]))

	local helpFunc = PopupCheckTreasureHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._datas = helpFunc()
	end
	assert(self._datas, "self._datas can not be null")
	self._count = math.ceil(#self._datas / 2)
	self._listView:setTemplate(PopupCheckTreasureCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupCheckTreasure:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2, isAdded1, isAdded2 = nil

	if self._datas[index + 1] then
		local data = self._datas[index + 1]
		data1 = PopupCheckTreasureHelper.addTreasureDataDesc(data, self._fromType)
		isAdded1 = self._parentView:checkIsAdded(data1)
	end

	if self._datas[index + 2] then
		local data = self._datas[index + 2]
		data2 = PopupCheckTreasureHelper.addTreasureDataDesc(data, self._fromType)
		isAdded2 = self._parentView:checkIsAdded(data2)
	end

	item:update(data1, data2, isAdded1, isAdded2)
end

function PopupCheckTreasure:_onItemSelected(item, index)
	
end

function PopupCheckTreasure:_onItemTouch(index, t, selected, item)
	if selected and self._parentView:checkIsMaxCount() then
		G_Prompt:showTip(Lang.get("hero_upgrade_food_max_tip"))
		item:setCheckBoxSelected(t, false)
		return
	end
	
	local data = self._datas[index * 2 + t]
	if selected then
		for i = 1, self._maxCount do
			if self._parentView:getTreasureWithIndex(i) == nil then
				self._parentView:insertTreasure(i, data)
				break
			end
		end
	else
		self._parentView:deleteTreasureWithTreasureId(data:getId())
	end
	
	self:_updateInfo()
end

function PopupCheckTreasure:_onButtonClose()
	self:close()
end

function PopupCheckTreasure:_onButtonOK()
	self:close()
end

function PopupCheckTreasure:_updateInfo()
	local len = self._parentView:getTreasureCount()
	local max = self._maxCount
	self._nodeCount:updateUI(Lang.get("hero_check_count_des"), len, max)
	self._nodeCount:setDesColor(Colors.BRIGHT_BG_TWO)
	self._nodeCount:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeCount:setMaxColor(Colors.BRIGHT_BG_ONE)
end

return PopupCheckTreasure