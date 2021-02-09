--
-- Author: Liangxu
-- Date: 2017-07-07 16:17:44
-- 选择宝物 通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupChooseTreasure = class("PopupChooseTreasure", PopupBase)
local PopupChooseTreasureCell = require("app.ui.PopupChooseTreasureCell")
local PopupChooseTreasureHelper = require("app.ui.PopupChooseTreasureHelper")

function PopupChooseTreasure:ctor()
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupChooseTreasure", "common"),
		binding = {
			
		}
	}
	PopupChooseTreasure.super.ctor(self, resource)
end

function PopupChooseTreasure:onCreate()
	self._fromType = nil
	self._callBack = nil
	self._treasureDatas = {}
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
end

function PopupChooseTreasure:onEnter()
	
end

function PopupChooseTreasure:onExit()
	
end

function PopupChooseTreasure:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

-- function PopupChooseTreasure:updateUI(fromType, callBack, treasureDatas, showRP)
function PopupChooseTreasure:updateUI(fromType, callBack, ...)
	self._fromType = fromType
	self._callBack = callBack
	self._param = {...}
	self._showRP = showRP

	local helpFunc = PopupChooseTreasureHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._treasureDatas = helpFunc(self._param)
	end
	assert(self._treasureDatas, "self._treasureDatas can not be null")

	self._count = math.ceil(#self._treasureDatas / 2)
	self._listView:setTemplate(PopupChooseTreasureCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupChooseTreasure:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._treasureDatas[index + 1] then
		local treasureData = self._treasureDatas[index + 1]
		data1 = PopupChooseTreasureHelper.addTreasureDataDesc(treasureData, self._fromType)
		if self._fromType == PopupChooseTreasureHelper.FROM_TYPE2 and self._showRP == true then
			data1.showRP = true
		end
	end

	if self._treasureDatas[index + 2] then
		local treasureData = self._treasureDatas[index + 2]
		data2 = PopupChooseTreasureHelper.addTreasureDataDesc(treasureData, self._fromType)
	end

	item:update(data1, data2, true)
end

function PopupChooseTreasure:_onItemSelected(item, index)
	
end

function PopupChooseTreasure:_onItemTouch(index, t)
	local unitData = self._treasureDatas[index * 2 + t]
	local treasureId = unitData:getId()

	if self._callBack then
		self._callBack(treasureId,self._param,unitData)
	end

	self:close()
end

function PopupChooseTreasure:_onButtonClose()
	self:close()
end

return PopupChooseTreasure