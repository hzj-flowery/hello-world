--
-- Author: Liangxu
-- Date: 2018-8-31
-- 复选战马通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupCheckHorse = class("PopupCheckHorse", PopupBase)
local PopupCheckHorseCell = require("app.ui.PopupCheckHorseCell")
local PopupCheckHorseHelper = require("app.ui.PopupCheckHorseHelper")

local TITLE = {
	[1] = "horse_check_title_1",
}

function PopupCheckHorse:ctor(parentView)
	self._parentView = parentView
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupCheckHorse", "common"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onButtonOK"}}
			},
		}
	}
	PopupCheckHorse.super.ctor(self, resource)
end

function PopupCheckHorse:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._buttonOk:setString(Lang.get("hero_upgrade_btn_Ok"))
	for i = 1, 2 do
		self["_nodeDes"..i]:setFontSize(20)
	end
	self._nodeCount:setFontSize(20)
end

function PopupCheckHorse:onEnter()
	self:_updateInfo()
end

function PopupCheckHorse:onExit()
	
end

function PopupCheckHorse:onClose()
	if self._clickOk then
		self._clickOk()
	end
end

function PopupCheckHorse:updateUI(fromType, clickOk)
	self._fromType = fromType
	self._clickOk = clickOk

	self._maxCount = PopupCheckHorseHelper.getMaxCount(fromType)
	self._commonNodeBk:setTitle(Lang.get(TITLE[fromType]))

	local helpFunc = PopupCheckHorseHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._horseData = helpFunc()
	end
	assert(self._horseData, "self._horseData can not be null")
	self._count = math.ceil(#self._horseData / 2)
	self._listView:setTemplate(PopupCheckHorseCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupCheckHorse:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2, isAdded1, isAdded2 = nil

	if self._horseData[index + 1] then
		local data = self._horseData[index + 1]
		data1 = PopupCheckHorseHelper.addHorseDataDesc(data, self._fromType)
		isAdded1 = self._parentView:checkIsAdded(data1)
	end

	if self._horseData[index + 2] then
		local data = self._horseData[index + 2]
		data2 = PopupCheckHorseHelper.addHorseDataDesc(data, self._fromType)
		isAdded2 = self._parentView:checkIsAdded(data2)
	end

	item:update(data1, data2, isAdded1, isAdded2)
end

function PopupCheckHorse:_onItemSelected(item, index)
	
end

function PopupCheckHorse:_onItemTouch(index, t, selected, item)
	if selected and self._parentView:checkIsMaxCount() then
		G_Prompt:showTip(Lang.get("horse_check_count_max_tip"))
		item:setCheckBoxSelected(t, false)
		return
	end
	
	local data = self._horseData[index * 2 + t]
	if selected then
		for i = 1, self._maxCount do
			if self._parentView:getHorseWithIndex(i) == nil then
				self._parentView:insertHorse(i, data)
				break
			end
		end
	else
		self._parentView:deleteHorseWithId(data:getId())
	end
	
	self:_updateInfo()
end

function PopupCheckHorse:_onButtonClose()
	self:close()
end

function PopupCheckHorse:_onButtonOK()
	self:close()
end

function PopupCheckHorse:_updateInfo()
	local trainFoodData = self._parentView:getHorseCount()
	local desValue = PopupCheckHorseHelper.getTotalDesInfo(self._fromType, trainFoodData)
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

	local len = self._parentView:getHorseCount()
	local max = self._maxCount
	self._nodeCount:updateUI(Lang.get("horse_check_count_des"), len, max)
	self._nodeCount:setDesColor(Colors.BRIGHT_BG_TWO)
	self._nodeCount:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeCount:setMaxColor(Colors.BRIGHT_BG_ONE)
end

return PopupCheckHorse