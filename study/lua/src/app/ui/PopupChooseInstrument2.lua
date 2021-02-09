
local PopupBase = require("app.ui.PopupBase")
local PopupChooseInstrument2 = class("PopupChooseInstrument2", PopupBase)
local PopupChooseInstrumentCell = require("app.ui.PopupChooseInstrumentCell")
local TabScrollView = require("app.utils.TabScrollView")
local PopupChooseInstrumentHelper = require("app.ui.PopupChooseInstrumentHelper")

function PopupChooseInstrument2:ctor()
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupChooseInstrument2", "common"),
		binding = {

		}
	}
	PopupChooseInstrument2.super.ctor(self, resource)
end

function PopupChooseInstrument2:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChooseInstrument2:onCreate()
	self:_initData()
	self:_initView()
end

function PopupChooseInstrument2:_initData()
	self._selectTabIndex = 0
	self._curInstrumentsData = {}
end

function PopupChooseInstrument2:_initView()
	self._tabListView = nil
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self:_initTab()
	self:_initList()
end

function PopupChooseInstrument2:_initTab()
	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		textList = {
			Lang.get("hero_transform_country_tab1"),
			Lang.get("hero_transform_country_tab2"),
			Lang.get("hero_transform_country_tab3"),
			Lang.get("hero_transform_country_tab4"),
		}
	}

	self._nodeTabRoot:recreateTabs(param)
end

function PopupChooseInstrument2:_initList()
	local scrollViewParam = {
		template = PopupChooseInstrumentCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam)
end

function PopupChooseInstrument2:onEnter()
	self._nodeTabRoot:setTabIndex(1)
end

function PopupChooseInstrument2:onExit()
	
end

function PopupChooseInstrument2:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index
	self:_updateListView(index)
end

function PopupChooseInstrument2:_updateListView(index)
	self._curInstrumentsData = self._instrumentsData[index] or {}
	local cellCount = math.ceil(#self._curInstrumentsData / 2)
	self._tabListView:updateListView(self._selectTabIndex, cellCount)
end

function PopupChooseInstrument2:updateUI(fromType, callBack, ...)
	self._fromType = fromType
	self._callBack = callBack
	self._param = {...}

	local helpFunc = PopupChooseInstrumentHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._instrumentsData = helpFunc(self._param)
	end
end

function PopupChooseInstrument2:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._curInstrumentsData[index + 1] then
		local instrumentData = self._curInstrumentsData[index + 1]
		data1 = PopupChooseInstrumentHelper.addInstrumentDataDesc(instrumentData, self._fromType, index, 1)
	end

	if self._curInstrumentsData[index + 2] then
		local instrumentData = self._curInstrumentsData[index + 2]
		data2 = PopupChooseInstrumentHelper.addInstrumentDataDesc(instrumentData, self._fromType, index, 2)
	end

	item:update(data1, data2)
end

function PopupChooseInstrument2:_onItemSelected(item, index)
	
end

function PopupChooseInstrument2:_onItemTouch(index, t)
	local instrumentData = self._curInstrumentsData[index * 2 + t]
	local instrumentId = instrumentData:getId()

	if self._callBack then
		self._callBack(heroId, self._param, instrumentData)
	end

	self:close()
end

function PopupChooseInstrument2:_onButtonClose()
	self:close()
end

return PopupChooseInstrument2