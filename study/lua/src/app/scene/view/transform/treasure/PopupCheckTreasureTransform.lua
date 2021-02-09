
-- Author: zhanglinsen
-- Date:2018-06-29 19:04:13
-- Describle：宝物置换

local PopupBase = require("app.ui.PopupBase")
local PopupCheckTreasureCell = require("app.ui.PopupCheckTreasureCell")
local PopupCheckTreasureHelper = require("app.ui.PopupCheckTreasureHelper")
local TabScrollView = require("app.utils.TabScrollView")
local PopupCheckTreasureTransform = class("PopupCheckTreasureTransform", PopupBase)


function PopupCheckTreasureTransform:ctor(parentView, onClick, tabIndex)
	self._parentView = parentView
	self._onClick = onClick
	self._tabIndex = tabIndex or 1

	--csb bind var name
	self._buttonOk = nil  --CommonButtonHighLight
	self._commonNodeBk = nil  --CommonNormalSmallPop
	self._listView = nil  --ScrollView
	self._nodeCount = nil  --CommonDesValue

	local resource = {
		file = Path.getCSB("PopupCheckTreasureTransform", "transform/treasure"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onButtonOk"}}
			},
		},
	}
	PopupCheckTreasureTransform.super.ctor(self, resource)
end

function PopupCheckTreasureTransform:onCreate()
	self:_initData()
	self:_initView()
end

function PopupCheckTreasureTransform:_initData()
	self._fromType = PopupCheckTreasureHelper.FROM_TYPE2
	self._itemData = {}
	self._curItemData = {}
	self._cellCount = 0
	self._selectedItemIds = {}
end

function PopupCheckTreasureTransform:_initView()
	self._commonNodeBk:setTitle(Lang.get("transform_choose_tip1",{name = Lang.get("transform_tab_icon_2")}))
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._buttonOk:setString(Lang.get("transform_choose_btn_ok"))
	-- self._nodeCount:setFontSize(22)
	-- self._nodeCount:setDesColor(Colors.DARK_BG_TWO)
	-- self._nodeCount:setValueColor(Colors.DARK_BG_ONE)
	self:_initList()
end

function PopupCheckTreasureTransform:_initList()
	local scrollViewParam = {
		template = PopupCheckTreasureCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam)
end

function PopupCheckTreasureTransform:onEnter()
	self:_updateData()
	self:_updateListView()
	self:_updateCount()
end

function PopupCheckTreasureTransform:onExit()
	
end

-- function PopupCheckTreasureTransform:_onTabSelect(index, sender)
-- 	self:_updateListView(index)
-- 	self:_updateCount()
-- end

function PopupCheckTreasureTransform:_updateData()
	local helpFunc = PopupCheckTreasureHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._itemData = helpFunc()
	end
end

function PopupCheckTreasureTransform:_updateListView()
	self._curItemData = self._itemData or {}
	self._cellCount = math.ceil(#self._curItemData / 2)
	self._tabListView:updateListView(1, self._cellCount)
end

function PopupCheckTreasureTransform:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2, isAdded1, isAdded2 = nil

	if self._curItemData[index + 1] then
		local itemData = self._curItemData[index + 1]
		data1 = PopupCheckTreasureHelper.addTreasureDataDesc(itemData, self._fromType)
		isAdded1 = self:_checkIsAdded(itemData:getId())
	end

	if self._curItemData[index + 2] then
		local itemData = self._curItemData[index + 2]
		data2 = PopupCheckTreasureHelper.addTreasureDataDesc(itemData, self._fromType)
		isAdded2 = self:_checkIsAdded(itemData:getId())
	end

	item:update(data1, data2, isAdded1, isAdded2)
end

function PopupCheckTreasureTransform:_onItemSelected(item, index)

end

function PopupCheckTreasureTransform:_onItemTouch(index, t, selected, item)
	local itemData = self._curItemData[index * 2 + t]
	if selected and self:_checkIsMeetCondition(itemData) == false then
		item:setCheckBoxSelected(t, false)
		return
	end

	local heroId = itemData:getId()
	if selected then
		table.insert(self._selectedItemIds, heroId)
	else
		table.removebyvalue(self._selectedItemIds, heroId)
	end

	self:_updateCount()
end

function PopupCheckTreasureTransform:_checkIsAdded(heroId)
	for i, id in ipairs(self._selectedItemIds) do
		if id == heroId then
			return true
		end
	end
	return false
end

function PopupCheckTreasureTransform:_checkIsMeetCondition(itemData)
	local heroCount = #self._selectedItemIds
	if heroCount == 0 then
		return true
	end

	local itemTrained = itemData:isDidTrain()
	local itemColor = itemData:getConfig().color
	local firstItemId = self._selectedItemIds[1]
	local firstItemData = G_UserData:getTreasure():getTreasureDataWithId(firstItemId)
	local trained = firstItemData:isDidTrain()
	local color = firstItemData:getConfig().color

	if itemColor ~= color then
		G_Prompt:showTip(Lang.get("transform_condition_tip6"))
		return false
	end

	if trained == false then
		if itemTrained == true then
			G_Prompt:showTip(Lang.get("transform_condition_tip2",{name = Lang.get("transform_tab_icon_2")}))
			return false
		end
	else
		if itemTrained == true then
			G_Prompt:showTip(Lang.get("transform_condition_tip3",{name = Lang.get("transform_tab_icon_2")}))
			return false
		else
			G_Prompt:showTip(Lang.get("transform_condition_tip2",{name = Lang.get("transform_tab_icon_2")}))
			return false
		end
	end
	
	return true
end

function PopupCheckTreasureTransform:_updateCount()
	local selectedCount = #self._selectedItemIds
	self._nodeCount:updateUI(Lang.get("treasure_transform_choose_count"), selectedCount)
end

function PopupCheckTreasureTransform:_onButtonOk()
	if self._onClick then
		logWarn("--- PopupCheckTreasureTransform  _onButtonOk:".. #self._selectedItemIds)
		self._onClick(self._selectedItemIds)
	end
	self:close()
end

function PopupCheckTreasureTransform:_onButtonClose()
	self:close()
end

function PopupCheckTreasureTransform:setSelectedItemIds(itemIds)
	self._selectedItemIds = clone(itemIds)
end



return PopupCheckTreasureTransform