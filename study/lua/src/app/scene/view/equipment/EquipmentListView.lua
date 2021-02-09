--
-- Author: Liangxu
-- Date: 2017-04-06 15:33:55
--
local ViewBase = require("app.ui.ViewBase")
local EquipmentListView = class("EquipmentListView", ViewBase)
local EquipmentListCell = require("app.scene.view.equipment.EquipmentListCell")
local EquipFragListCell = require("app.scene.view.equipment.EquipFragListCell")
local EquipConst = require("app.const.EquipConst")
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TabScrollView = require("app.utils.TabScrollView")

function EquipmentListView:ctor(index)
	self._selectTabIndex = index or EquipConst.EQUIP_LIST_TYPE1

	local UserDataHelper = require("app.utils.UserDataHelper")
	local resName = "EquipmentListView"
	--if UserDataHelper.isEnoughBagMergeLevel() then -- 达到调整等级
		--resName = "EquipmentListView1"
	--end
	local resource = {
		file = Path.getCSB(resName, "equipment"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonSale = {
				events = {{event = "touch", method = "_onButtonSaleClicked"}}
			}
		}
	}
	EquipmentListView.super.ctor(self, resource)
	self._index = 0
end

function EquipmentListView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_zhuangbei")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	self:_initTabGroup()
end

function EquipmentListView:onEnter()
	self._signalMerageItemMsg =
		G_SignalManager:add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(self, self._onSyntheticFragments))
	self._signalRedPointUpdate =
		G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))
	self._signalSellObjects =
		G_SignalManager:add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(self, self._onSellFragmentsSuccess))

	self:_updateView()

	self:_refreshRedPoint()
end

function EquipmentListView:onExit()
	self._signalMerageItemMsg:remove()
	self._signalMerageItemMsg = nil

	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	if self._signalSellObjects then
		self._signalSellObjects:remove()
		self._signalSellObjects = nil
	end
end

function EquipmentListView:_onEventRedPointUpdate(event, funcId, param)
	if funcId == FunctionConst.FUNC_EQUIP_LIST then
		self:_refreshRedPoint()
	end
end

function EquipmentListView:_refreshRedPoint()
	local redPointShow = G_UserData:getFragments():hasRedPoint({fragType = 2})
	if self._nodeTabRoot then
		self._nodeTabRoot:setRedPointByTabIndex(EquipConst.EQUIP_LIST_TYPE2, redPointShow)
	end
	if self._tabGroup2 then
		self._tabGroup2:setRedPointByTabIndex(EquipConst.EQUIP_LIST_TYPE2, redPointShow)
	end
end

function EquipmentListView:_initTabGroup()
	local scrollViewParam = {
		template = EquipmentListCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch)
	}
	if self._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2 then
		scrollViewParam.template = EquipFragListCell
	end
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam)

	if self._nodeTabRoot then
		self:_initNodeTab()
	end

	if self._tabGroup2 then
		self:_initGroupTab()
	end
end

-- 左边tab初始化
function EquipmentListView:_initNodeTab()
	local tabNameList = {}
	table.insert(tabNameList, Lang.get("equipment_list_tab_1"))
	table.insert(tabNameList, Lang.get("equipment_list_tab_2"))

	local param = {
		callback = handler(self, self._onTabSelect),
		textList = tabNameList
	}

	self._nodeTabRoot:recreateTabs(param)
end

-- 顶部tab初始化
function EquipmentListView:_initGroupTab()
	local tabNameList = {}
	table.insert(tabNameList, Lang.get("equipment_list_tab_1"))
	table.insert(tabNameList, Lang.get("equipment_list_tab_2"))

	local param2 = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = -2,
		textList = tabNameList
	}
	self._tabGroup2:recreateTabs(param2)
	self._tabGroup2:setTabIndex(1)
end

function EquipmentListView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateView()
	self:_refreshRedPoint()
end

function EquipmentListView:_updateView()
	self._fileNodeBg:setTitle(Lang.get("equipment_list_title_" .. self._selectTabIndex))
	local count1 = G_UserData:getEquipment():getEquipTotalCount()
	local count2 = UserDataHelper.getEquipListLimitCount()
	self._fileNodeBg:setCount(Lang.get("common_list_count", {count1 = count1, count2 = count2}))
	self._fileNodeBg:showCount(self._selectTabIndex == EquipConst.EQUIP_LIST_TYPE1)
	self._buttonSale:setVisible(self._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2)
	self:_initData()

	if self._count == 0 then
		self._tabListView:hideAllView()
		local emptyType = self:_getEmptyType()
		self._fileNodeEmpty:updateView(emptyType)
		self._fileNodeEmpty:setVisible(true)
	else
		local scrollViewParam = {
			template = EquipmentListCell,
			updateFunc = handler(self, self._onItemUpdate),
			selectFunc = handler(self, self._onItemSelected),
			touchFunc = handler(self, self._onItemTouch)
		}
		if self._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2 then
			scrollViewParam.template = EquipFragListCell
		end
		self._tabListView:updateListView(self._selectTabIndex, self._count, scrollViewParam)
		self._fileNodeEmpty:setVisible(false)
	end
end

function EquipmentListView:_getEmptyType()
	local emptyType = nil
	if self._selectTabIndex == EquipConst.EQUIP_LIST_TYPE1 then
		emptyType = 3 --类型定义在CommonEmptyTipNode.lua
	elseif self._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2 then
		emptyType = 4
	end
	assert(emptyType, string.format("EquipmentListView _selectTabIndex is wrong = %d", self._selectTabIndex))
	return emptyType
end

function EquipmentListView:_initData()
	self._datas = {}
	if self._selectTabIndex == EquipConst.EQUIP_LIST_TYPE1 then
		self._datas = G_UserData:getEquipment():getListDataBySort()
	elseif self._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2 then
		self._datas = G_UserData:getFragments():getFragListByType(2, G_UserData:getFragments().SORT_FUNC_COMMON)
	end

	self._count = math.ceil(#self._datas / 2)
end

function EquipmentListView:_onItemUpdate(item, index)
	local index = index * 2
	item:update(self._datas[index + 1], self._datas[index + 2])
end

function EquipmentListView:_onItemSelected(item, index)
end

function EquipmentListView:_onItemTouch(index, t)
	local index = index * 2 + t
	local data = self._datas[index]
	if self._selectTabIndex == EquipConst.EQUIP_LIST_TYPE1 then
		if EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1) == false then
			return
		end
		G_SceneManager:showScene("equipTrain", data, EquipConst.EQUIP_TRAIN_STRENGTHEN, EquipConst.EQUIP_RANGE_TYPE_1)
	elseif self._selectTabIndex == EquipConst.EQUIP_LIST_TYPE2 then
		local itemId = data:getId()
		UIPopupHelper.popupFragmentDlg(itemId)
	end
end

function EquipmentListView:_onSyntheticFragments(id, message)
	if not self:isVisible() then
		return
	end

	local fragId = rawget(message, "id")
	local itemSize = rawget(message, "num")
	if fragId and fragId > 0 then
		local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragId)
		local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		local awards = {
			[1] = {
				type = itemParam.cfg.comp_type,
				value = itemParam.cfg.comp_value,
				size = itemSize
			}
		}
		PopupGetRewards:showRewards(awards)

		self:_updateView()
	end
end

function EquipmentListView:_onButtonSaleClicked()
	if self._datas and #self._datas == 0 then
		G_Prompt:showTip(Lang.get("lang_sellfragment_fragment_empty"))
		return
	end
	local PopupSellFragment = require("app.scene.view.sell.PopupSellFragment")
	local popupSellFragment = PopupSellFragment.new(PopupSellFragment.EQUIPMENT_FRAGMENT_SELL)
	popupSellFragment:openWithAction()
end

function EquipmentListView:_onSellFragmentsSuccess()
	self:_updateView()
	self:_refreshRedPoint()
end

return EquipmentListView
