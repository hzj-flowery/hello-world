local PopupBase = require("app.ui.PopupBase")
local PopupChooseHero2 = class("PopupChooseHero2", PopupBase)
local PopupChooseHeroCell = require("app.ui.PopupChooseHeroCell")
local TabScrollView = require("app.utils.TabScrollView")
local PopupChooseHeroHelper = require("app.ui.PopupChooseHeroHelper")

function PopupChooseHero2:ctor()
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupChooseHero2", "common"),
		binding = {

		}
	}
	PopupChooseHero2.super.ctor(self, resource)
end

function PopupChooseHero2:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChooseHero2:onCreate()
	self:_initData()
	self:_initView()
end

function PopupChooseHero2:_initData()
	self._selectTabIndex = 0
	self._curHerosData = {}
end

function PopupChooseHero2:_initView()
	self._tabListView = nil
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self:_initTab()
	self:_initList()
end

function PopupChooseHero2:_initTab()
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

function PopupChooseHero2:_initList()
	local scrollViewParam = {
		template = PopupChooseHeroCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam)
end

function PopupChooseHero2:onEnter()
	self._nodeTabRoot:setTabIndex(1)
end

function PopupChooseHero2:onExit()
	
end

function PopupChooseHero2:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index
	self:_updateListView(index)
end

function PopupChooseHero2:_updateListView(index)
	self._curHerosData = self._herosData[index] or {}
	local cellCount = math.ceil(#self._curHerosData / 2)
	self._tabListView:updateListView(self._selectTabIndex, cellCount)
end

function PopupChooseHero2:updateUI(fromType, callBack, ...)
	self._fromType = fromType
	self._callBack = callBack
	self._param = {...}

	local helpFunc = PopupChooseHeroHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._herosData = helpFunc(self._param)
	end
end

function PopupChooseHero2:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._curHerosData[index + 1] then
		local herodata = self._curHerosData[index + 1]
		data1 = PopupChooseHeroHelper.addHeroDataDesc(herodata, self._fromType, index, 1)
	end

	if self._curHerosData[index + 2] then
		local herodata = self._curHerosData[index + 2]
		data2 = PopupChooseHeroHelper.addHeroDataDesc(herodata, self._fromType, index, 2)
	end

	item:update(data1, data2)
end

function PopupChooseHero2:_onItemSelected(item, index)
	
end

function PopupChooseHero2:_onItemTouch(index, t)
	local heroData = self._curHerosData[index * 2 + t]
	local heroId = heroData:getId()

	if self._callBack then
		self._callBack(heroId, self._param, heroData)
	end

	self:close()
end

function PopupChooseHero2:_onButtonClose()
	self:close()
end

return PopupChooseHero2