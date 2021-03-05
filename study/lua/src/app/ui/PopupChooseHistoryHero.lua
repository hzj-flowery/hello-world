
local PopupBase = require("app.ui.PopupBase")
local PopupChooseHistoryHero = class("PopupChooseHistoryHero", PopupBase)
local PopupChooseHistoryHeroCell = require("app.ui.PopupChooseHistoryHeroCell")
local PopupChooseHistoryHeroHelper = require("app.ui.PopupChooseHistoryHeroHelper")


function PopupChooseHistoryHero:ctor()
	self._commonNodeBk = nil 
    self._listData = nil
	local resource = {
		file = Path.getCSB("PopupChooseHistoryHero", "common"),
		binding = {

		}
	}
	self:setName("PopupChooseHistoryHero")
	PopupChooseHistoryHero.super.ctor(self, resource)
end

function PopupChooseHistoryHero:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChooseHistoryHero:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
end

function PopupChooseHistoryHero:onEnter()
	
end

function PopupChooseHistoryHero:onExit()
	
end

function PopupChooseHistoryHero:onShowFinish()

end

function PopupChooseHistoryHero:updateUI(fromType, callBack, ...)
	self._fromType = fromType
	self._callBack = callBack
	self._param = {...}

	local helpFunc = PopupChooseHistoryHeroHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._listData = helpFunc(self._param)
	end
	assert(self._listData, "listData can not be null")
	self._count = math.ceil(#self._listData / 2)
	self._listView:setTemplate(PopupChooseHistoryHeroCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupChooseHistoryHero:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._listData[index + 1] then
		local srcData = self._listData[index + 1]
		data1 = PopupChooseHistoryHeroHelper.addDataDesc(srcData, self._fromType, index, 1)
	end

	if self._listData[index + 2] then
		local srcData = self._listData[index + 2]
		data2 = PopupChooseHistoryHeroHelper.addDataDesc(srcData, self._fromType, index, 2)
	end

	item:update(data1, data2)
end

function PopupChooseHistoryHero:_onItemSelected(item, index)
	
end

function PopupChooseHistoryHero:_onItemTouch(index, t)
	local data = self._listData[index * 2 + t]
	local id = data:getId()

	if self._callBack then
		self._callBack(id, self._param, data)
	end

	self:close()
end

function PopupChooseHistoryHero:_onButtonClose()
	self:close()
end

return PopupChooseHistoryHero