--
-- Author: Liangxu
-- Date: 2017-07-15 15:34:05
-- 武将置换选择
local PopupBase = require("app.ui.PopupBase")
local PopupCheckHeroTransform = class("PopupCheckHeroTransform", PopupBase)
local PopupCheckHeroCell = require("app.ui.PopupCheckHeroCell")
local PopupCheckHeroHelper = require("app.ui.PopupCheckHeroHelper")
local TabScrollView = require("app.utils.TabScrollView")

function PopupCheckHeroTransform:ctor(parentView, onClick, tabIndex)
	self._parentView = parentView
	self._onClick = onClick
	self._tabIndex = tabIndex or 1

	local resource = {
		file = Path.getCSB("PopupCheckHeroTransform", "hero"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onButtonOK"}}
			},
		}
	}
	
	PopupCheckHeroTransform.super.ctor(self, resource)
end

function PopupCheckHeroTransform:onCreate()
	self:_initData()
	self:_initView()
end

function PopupCheckHeroTransform:_initData()
	self._fromType = PopupCheckHeroHelper.FROM_TYPE3
	self._selectTabIndex = 0
	self._herosData = {}
	self._curHerosData = {}
	self._cellCount = 0
	self._selectedHeroIds = {}
end

function PopupCheckHeroTransform:_initView()
	self._tabListView = nil
	self._commonNodeBk:setTitle(Lang.get("hero_transform_choose_tip1"))
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._buttonOk:setString(Lang.get("hero_transform_choose_btn_ok"))
	-- self._nodeCount:setFontSize(22)
	-- self._nodeCount:setDesColor(Colors.DARK_BG_TWO)
	-- self._nodeCount:setValueColor(Colors.DARK_BG_ONE)
	self:_initTab()
	self:_initList()
end

function PopupCheckHeroTransform:_initTab()
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

function PopupCheckHeroTransform:_initList()
	local scrollViewParam = {
		template = PopupCheckHeroCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam)
end

function PopupCheckHeroTransform:onEnter()
	self:_updateData()
	self._nodeTabRoot:setTabIndex(self._tabIndex)
end

function PopupCheckHeroTransform:onExit()
	
end

function PopupCheckHeroTransform:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index
	self:_updateListView(index)
	self:_updateCount()
end

function PopupCheckHeroTransform:_updateData()
	local helpFunc = PopupCheckHeroHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._herosData = helpFunc()
	end
end

function PopupCheckHeroTransform:_updateListView(index)
	self._curHerosData = self._herosData[index] or {}
	self._cellCount = math.ceil(#self._curHerosData / 2)
	self._tabListView:updateListView(self._selectTabIndex, self._cellCount)
end

function PopupCheckHeroTransform:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2, isAdded1, isAdded2 = nil

	if self._curHerosData[index + 1] then
		local heroData = self._curHerosData[index + 1]
		data1 = PopupCheckHeroHelper.addHeroDataDesc(heroData, self._fromType)
		isAdded1 = self:_checkIsAdded(heroData:getId())
	end

	if self._curHerosData[index + 2] then
		local heroData = self._curHerosData[index + 2]
		data2 = PopupCheckHeroHelper.addHeroDataDesc(heroData, self._fromType)
		isAdded2 = self:_checkIsAdded(heroData:getId())
	end

	item:update(data1, data2, isAdded1, isAdded2)
end

function PopupCheckHeroTransform:_onItemSelected(item, index)

end

function PopupCheckHeroTransform:_onItemTouch(index, t, selected, item)
	local heroData = self._curHerosData[index * 2 + t]
	if selected and self:_checkIsMeetCondition(heroData) == false then
		item:setCheckBoxSelected(t, false)
		return
	end

	local heroId = heroData:getId()
	if selected then
		table.insert(self._selectedHeroIds, heroId)
	else
		table.removebyvalue(self._selectedHeroIds, heroId)
	end

	self:_updateCount()
end

function PopupCheckHeroTransform:_checkIsAdded(heroId)
	for i, id in ipairs(self._selectedHeroIds) do
		if id == heroId then
			return true
		end
	end
	return false
end

function PopupCheckHeroTransform:_checkIsMeetCondition(heroData)
	local heroCount = #self._selectedHeroIds
	if heroCount == 0 then
		return true
	end

	local heroTrained = heroData:isDidTrain()
	local heroColor = heroData:getConfig().color
	local firstHeroId = self._selectedHeroIds[1]
	local firstHeroData = G_UserData:getHero():getUnitDataWithId(firstHeroId)
	local trained = firstHeroData:isDidTrain()
	local color = firstHeroData:getConfig().color

	if heroColor ~= color then
		G_Prompt:showTip(Lang.get("hero_transform_condition_tip6"))
		return false
	end

	if trained == false then
		if heroTrained == true then
			G_Prompt:showTip(Lang.get("hero_transform_condition_tip2"))
			return false
		end
	else
		if heroTrained == true then
			G_Prompt:showTip(Lang.get("hero_transform_condition_tip3"))
			return false
		else
			G_Prompt:showTip(Lang.get("hero_transform_condition_tip2"))
			return false
		end
	end
	
	return true
end

function PopupCheckHeroTransform:_updateCount()
	local selectedCount = #self._selectedHeroIds
	self._nodeCount:updateUI(Lang.get("hero_transform_choose_count"), selectedCount)
end

function PopupCheckHeroTransform:_onButtonOK()
	if self._onClick then
		self._onClick(self._selectedHeroIds)
	end
	self:close()
end

function PopupCheckHeroTransform:_onButtonClose()
	self:close()
end

function PopupCheckHeroTransform:setSelectedHeroIds(heroIds)
	self._selectedHeroIds = clone(heroIds)
end

return PopupCheckHeroTransform