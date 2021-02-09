--
-- Author: Liangxu
-- Date: 2018-8-28
-- 选择战马 通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupChooseHorse = class("PopupChooseHorse", PopupBase)
local PopupChooseHorseCell = require("app.ui.PopupChooseHorseCell")
local PopupChooseHorseHelper = require("app.ui.PopupChooseHorseHelper")

function PopupChooseHorse:ctor()
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupChooseHorse", "common"),
		binding = {
			
		}
	}
	
	PopupChooseHorse.super.ctor(self, resource)
end

function PopupChooseHorse:onCreate()
	self._fromType = nil
	self._callBack = nil
	self._horseDatas = {}
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
end

function PopupChooseHorse:onEnter()
	
end

function PopupChooseHorse:onExit()
	
end

function PopupChooseHorse:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChooseHorse:updateUI(fromType, callBack, horseDatas, showRP)
	self._fromType = fromType
	self._callBack = callBack
	self._showRP = showRP

	local helpFunc = PopupChooseHorseHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._horseDatas = helpFunc(horseDatas, chooseHeroBaseId)
	end
	assert(self._horseDatas, "self._horseDatas can not be null")

	self._count = math.ceil(#self._horseDatas / 2)
	self._listView:setTemplate(PopupChooseHorseCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupChooseHorse:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._horseDatas[index + 1] then
		local horseData = self._horseDatas[index + 1]
		data1 = PopupChooseHorseHelper.addHorseDataDesc(horseData, self._fromType)
	end

	if self._horseDatas[index + 2] then
		local horseData = self._horseDatas[index + 2]
		data2 = PopupChooseHorseHelper.addHorseDataDesc(horseData, self._fromType)
	end

	item:update(data1, data2)
end

function PopupChooseHorse:_onItemSelected(item, index)
	
end

function PopupChooseHorse:_onItemTouch(index, t)
	local unitData = self._horseDatas[index * 2 + t]
	local horseId = unitData:getId()

	if self._callBack then
		self._callBack(horseId)
	end

	self:close()
end

function PopupChooseHorse:_onButtonClose()
	self:close()
end

return PopupChooseHorse
