
local PopupBase = require("app.ui.PopupBase")
local PopupCheckInstrumentTransform = class("PopupCheckInstrumentTransform", PopupBase)
local PopupCheckInstrumentCell = require("app.ui.PopupCheckInstrumentCell")
local PopupCheckInstrumentHelper = require("app.ui.PopupCheckInstrumentHelper")
local TabScrollView = require("app.utils.TabScrollView")

function PopupCheckInstrumentTransform:ctor(parentView, onClick, tabIndex)
	self._parentView = parentView
	self._onClick = onClick
	self._tabIndex = tabIndex or 1

	local resource = {
		file = Path.getCSB("PopupCheckInstrumentTransform", "transform/instrument"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onButtonOK"}}
			},
		}
	}
	
	PopupCheckInstrumentTransform.super.ctor(self, resource)
end

function PopupCheckInstrumentTransform:onCreate()
	self:_initData()
	self:_initView()
end

function PopupCheckInstrumentTransform:_initData()
	self._fromType = PopupCheckInstrumentHelper.FROM_TYPE2
	self._selectTabIndex = 0
	self._instrumentsData = {}
	self._curInstrumentsData = {}
	self._cellCount = 0
	self._selectedItemIds = {}
end

function PopupCheckInstrumentTransform:_initView()
	self._tabListView = nil
	self._commonNodeBk:setTitle(Lang.get("transform_choose_tip1", {name = Lang.get("transform_tab_icon_3")}))
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._buttonOk:setString(Lang.get("transform_choose_btn_ok"))
	-- self._nodeCount:setFontSize(22)
	-- self._nodeCount:setDesColor(Colors.DARK_BG_TWO)
	-- self._nodeCount:setValueColor(Colors.DARK_BG_ONE)
	self:_initTab()
	self:_initList()
end

function PopupCheckInstrumentTransform:_initTab()
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

function PopupCheckInstrumentTransform:_initList()
	local scrollViewParam = {
		template = PopupCheckInstrumentCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam)
end

function PopupCheckInstrumentTransform:onEnter()
	self:_updateData()
	self._nodeTabRoot:setTabIndex(self._tabIndex)
end

function PopupCheckInstrumentTransform:onExit()
	
end

function PopupCheckInstrumentTransform:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index
	self:_updateListView(index)
	self:_updateCount()
end

function PopupCheckInstrumentTransform:_updateData()
	local helpFunc = PopupCheckInstrumentHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._instrumentsData = helpFunc()
	end
end

function PopupCheckInstrumentTransform:_updateListView(index)
	self._curInstrumentsData = self._instrumentsData[index] or {}
	self._cellCount = math.ceil(#self._curInstrumentsData / 2)
	self._tabListView:updateListView(self._selectTabIndex, self._cellCount)
end

function PopupCheckInstrumentTransform:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2, isAdded1, isAdded2 = nil

	if self._curInstrumentsData[index + 1] then
		local instrumentData = self._curInstrumentsData[index + 1]
		data1 = PopupCheckInstrumentHelper.addInstrumentDataDesc(instrumentData, self._fromType)
		isAdded1 = self:_checkIsAdded(instrumentData:getId())
	end

	if self._curInstrumentsData[index + 2] then
		local instrumentData = self._curInstrumentsData[index + 2]
		data2 = PopupCheckInstrumentHelper.addInstrumentDataDesc(instrumentData, self._fromType)
		isAdded2 = self:_checkIsAdded(instrumentData:getId())
	end

	item:update(data1, data2, isAdded1, isAdded2)
end

function PopupCheckInstrumentTransform:_onItemSelected(item, index)

end

function PopupCheckInstrumentTransform:_onItemTouch(index, t, selected, item)
	local instrumentData = self._curInstrumentsData[index * 2 + t]
	if selected and self:_checkIsMeetCondition(instrumentData) == false then
		item:setCheckBoxSelected(t, false)
		return
	end

	local heroId = instrumentData:getId()
	if selected then
		table.insert(self._selectedItemIds, heroId)
	else
		table.removebyvalue(self._selectedItemIds, heroId)
	end

	self:_updateCount()
end

function PopupCheckInstrumentTransform:_checkIsAdded(heroId)
	for i, id in ipairs(self._selectedItemIds) do
		if id == heroId then
			return true
		end
	end
	return false
end

function PopupCheckInstrumentTransform:_checkIsMeetCondition(instrumentData)
	local heroCount = #self._selectedItemIds
	if heroCount == 0 then
		return true
	end

	local instrumentTrained = instrumentData:isDidTrain()
	local instrumentColor = instrumentData:getConfig().color
	local firstHeroId = self._selectedItemIds[1]
	local firstInstrumentData = G_UserData:getInstrument():getInstrumentDataWithId(firstHeroId)
	local trained = firstInstrumentData:isDidTrain()
	local color = firstInstrumentData:getConfig().color

	if instrumentColor ~= color then
		G_Prompt:showTip(Lang.get("instrument_transform_condition_tip6"))
		return false
	end

	if trained == false then
		if instrumentTrained == true then
			G_Prompt:showTip(Lang.get("instrument_transform_condition_tip2"))
			return false
		end
	else
		if instrumentTrained == true then
			G_Prompt:showTip(Lang.get("instrument_transform_condition_tip3"))
			return false
		else
			G_Prompt:showTip(Lang.get("instrument_transform_condition_tip2"))
			return false
		end
	end
	
	return true
end

function PopupCheckInstrumentTransform:_updateCount()
	local selectedCount = #self._selectedItemIds
	self._nodeCount:updateUI(Lang.get("hero_transform_choose_count"), selectedCount)
end

function PopupCheckInstrumentTransform:_onButtonOK()
	if self._onClick then
		self._onClick(self._selectedItemIds)
	end
	self:close()
end

function PopupCheckInstrumentTransform:_onButtonClose()
	self:close()
end

function PopupCheckInstrumentTransform:setSelectedItemIds(itemIds)
	self._selectedItemIds = clone(itemIds)
end

return PopupCheckInstrumentTransform