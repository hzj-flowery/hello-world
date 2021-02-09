--
-- Author: Liangxu
-- Date: 2017-9-19 14:53:14
-- 复选神兵通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupCheckInstrument = class("PopupCheckInstrument", PopupBase)
local PopupCheckInstrumentCell = require("app.ui.PopupCheckInstrumentCell")
local PopupCheckInstrumentHelper = require("app.ui.PopupCheckInstrumentHelper")

local TITLE = {
	[1] = "instrument_check_title_1",
}

function PopupCheckInstrument:ctor(parentView)
	self._parentView = parentView
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupCheckInstrument", "common"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onButtonOK"}}
			},
		}
	}
	PopupCheckInstrument.super.ctor(self, resource)
end

function PopupCheckInstrument:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._buttonOk:setString(Lang.get("hero_upgrade_btn_Ok"))
	for i = 1, 2 do
		self["_nodeDes"..i]:setFontSize(20)
	end
	self._nodeCount:setFontSize(20)
end

function PopupCheckInstrument:onEnter()
	self:_updateInfo()
end

function PopupCheckInstrument:onExit()
	
end

function PopupCheckInstrument:onClose()
	if self._clickOk then
		self._clickOk()
	end
end

function PopupCheckInstrument:updateUI(fromType, clickOk)
	self._fromType = fromType
	self._clickOk = clickOk

	self._maxCount = PopupCheckInstrumentHelper.getMaxCount(fromType)
	self._commonNodeBk:setTitle(Lang.get(TITLE[fromType]))

	local helpFunc = PopupCheckInstrumentHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._instrumentData = helpFunc()
	end
	assert(self._instrumentData, "self._instrumentData can not be null")
	self._count = math.ceil(#self._instrumentData / 2)
	self._listView:setTemplate(PopupCheckInstrumentCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupCheckInstrument:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2, isAdded1, isAdded2 = nil

	if self._instrumentData[index + 1] then
		local data = self._instrumentData[index + 1]
		data1 = PopupCheckInstrumentHelper.addInstrumentDataDesc(data, self._fromType)
		isAdded1 = self._parentView:checkIsAdded(data1)
	end

	if self._instrumentData[index + 2] then
		local data = self._instrumentData[index + 2]
		data2 = PopupCheckInstrumentHelper.addInstrumentDataDesc(data, self._fromType)
		isAdded2 = self._parentView:checkIsAdded(data2)
	end

	item:update(data1, data2, isAdded1, isAdded2)
end

function PopupCheckInstrument:_onItemSelected(item, index)
	
end

function PopupCheckInstrument:_onItemTouch(index, t, selected, item)
	if selected and self._parentView:checkIsMaxCount() then
		G_Prompt:showTip(Lang.get("hero_upgrade_food_max_tip"))
		item:setCheckBoxSelected(t, false)
		return
	end
	
	local data = self._instrumentData[index * 2 + t]
	if selected then
		for i = 1, self._maxCount do
			if self._parentView:getInstrumentWithIndex(i) == nil then
				self._parentView:insertInstrument(i, data)
				break
			end
		end
	else
		self._parentView:deleteInstrumentWithId(data:getId())
	end
	
	self:_updateInfo()
end

function PopupCheckInstrument:_onButtonClose()
	self:close()
end

function PopupCheckInstrument:_onButtonOK()
	self:close()
end

function PopupCheckInstrument:_updateInfo()
	local trainFoodData = self._parentView:getInstrumentCount()
	local desValue = PopupCheckInstrumentHelper.getTotalDesInfo(self._fromType, trainFoodData)
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

	local len = self._parentView:getInstrumentCount()
	local max = self._maxCount
	self._nodeCount:updateUI(Lang.get("hero_check_count_des"), len, max)
	self._nodeCount:setDesColor(Colors.BRIGHT_BG_TWO)
	self._nodeCount:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeCount:setMaxColor(Colors.BRIGHT_BG_ONE)
end

return PopupCheckInstrument