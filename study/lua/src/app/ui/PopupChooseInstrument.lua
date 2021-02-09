--
-- Author: Liangxu
-- Date: 2017-9-15 10:08:06
-- 选择神兵 通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupChooseInstrument = class("PopupChooseInstrument", PopupBase)
local PopupChooseInstrumentCell = require("app.ui.PopupChooseInstrumentCell")
local PopupChooseInstrumentHelper = require("app.ui.PopupChooseInstrumentHelper")

function PopupChooseInstrument:ctor()
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupChooseInstrument", "common"),
		binding = {
			
		}
	}
	
	PopupChooseInstrument.super.ctor(self, resource)
end

function PopupChooseInstrument:onCreate()
	self._fromType = nil
	self._callBack = nil
	self._instrumentDatas = {}
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
end

function PopupChooseInstrument:onEnter()
	
end

function PopupChooseInstrument:onExit()
	
end

function PopupChooseInstrument:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChooseInstrument:updateUI(fromType, callBack, instrumentDatas, showRP, curInstrumentData)
	self._fromType = fromType
	self._callBack = callBack
	self._showRP = showRP
	self._curInstrumentData = curInstrumentData

	local helpFunc = PopupChooseInstrumentHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._instrumentDatas = helpFunc(instrumentDatas)
	end
	assert(self._instrumentDatas, "self._instrumentDatas can not be null")

	self._count = math.ceil(#self._instrumentDatas / 2)
	self._listView:setTemplate(PopupChooseInstrumentCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupChooseInstrument:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._instrumentDatas[index + 1] then
		local instrumentdata = self._instrumentDatas[index + 1]
		data1 = PopupChooseInstrumentHelper.addInstrumentDataDesc(instrumentdata, self._fromType, self._showRP, self._curInstrumentData)
	end

	if self._instrumentDatas[index + 2] then
		local instrumentdata = self._instrumentDatas[index + 2]
		data2 = PopupChooseInstrumentHelper.addInstrumentDataDesc(instrumentdata, self._fromType, self._showRP, self._curInstrumentData)
	end

	item:update(data1, data2)
end

function PopupChooseInstrument:_onItemSelected(item, index)
	
end

function PopupChooseInstrument:_onItemTouch(index, t)
	local unitData = self._instrumentDatas[index * 2 + t]
	local instrumentId = unitData:getId()

	if self._callBack then
		self._callBack(instrumentId)
	end

	self:close()
end

function PopupChooseInstrument:_onButtonClose()
	self:close()
end


return PopupChooseInstrument