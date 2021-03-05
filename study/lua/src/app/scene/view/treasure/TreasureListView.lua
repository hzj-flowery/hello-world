--
-- Author: Liangxu
-- Date: 2017-05-05 14:20:20
-- 宝物列表
local ViewBase = require("app.ui.ViewBase")
local TreasureListView = class("TreasureListView", ViewBase)
local TreasureListCell = require("app.scene.view.treasure.TreasureListCell")
local TreasureFragListCell = require("app.scene.view.treasure.TreasureFragListCell")
local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
local TreasureConst = require("app.const.TreasureConst")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TabScrollView = require("app.utils.TabScrollView")

function TreasureListView:ctor(index)
	self._selectTabIndex = index or TreasureConst.TREASURE_LIST_TYPE1

	self._tabGroup2 = nil -- 顶部tab

	local UserDataHelper = require("app.utils.UserDataHelper")
	local resName = "TreasureListView"
	--if UserDataHelper.isEnoughBagMergeLevel() then -- 达到调整等级
		--resName = "TreasureListView1"
	--end
	local resource = {
		file = Path.getCSB(resName, "treasure"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonSale = {
				events = {{event = "touch", method = "_onButtonSaleClicked"}}
			}
		}
	}
	TreasureListView.super.ctor(self, resource)
end

function TreasureListView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_baowu")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	self:_initTabGroup()
end

function TreasureListView:onEnter()
	self._signalMerageItemMsg =
		G_SignalManager:add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(self, self._onSyntheticFragments))
	self._signalRedPointUpdate =
		G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))
	self._signalSellObjects =
		G_SignalManager:add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(self, self._onSellFragmentsSuccess))

	self:_updateView()
	self:_refreshRedPoint()
end

function TreasureListView:onExit()
	self._signalMerageItemMsg:remove()
	self._signalMerageItemMsg = nil
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil
	if self._signalSellObjects then
		self._signalSellObjects:remove()
		self._signalSellObjects = nil
	end
end

function TreasureListView:_onEventRedPointUpdate(event, funcId, param)
	if funcId == FunctionConst.FUNC_TREASURE_LIST then
		self:_refreshRedPoint()
	end
end

function TreasureListView:_refreshRedPoint()
	local redPointShow = G_UserData:getFragments():hasRedPoint({fragType = 3})
	if self._nodeTabRoot then
		self._nodeTabRoot:setRedPointByTabIndex(TreasureConst.TREASURE_LIST_TYPE2, redPointShow)
	end
	if self._tabGroup2 then
		self._tabGroup2:setRedPointByTabIndex(TreasureConst.TREASURE_LIST_TYPE2, redPointShow)
	end
end

function TreasureListView:_initTabGroup()
	local scrollViewParam = {
		template = TreasureListCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch)
	}
	if self._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2 then
		scrollViewParam.template = TreasureFragListCell
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
function TreasureListView:_initNodeTab()
	local tabNameList = {}
	table.insert(tabNameList, Lang.get("treasure_list_tab_1"))
	table.insert(tabNameList, Lang.get("treasure_list_tab_2"))

	local param = {
		callback = handler(self, self._onTabSelect),
		textList = tabNameList
	}

	self._nodeTabRoot:recreateTabs(param)
end

-- 顶部tab初始化
function TreasureListView:_initGroupTab()
	local tabNameList = {}
	table.insert(tabNameList, Lang.get("treasure_list_tab_1"))
	table.insert(tabNameList, Lang.get("treasure_list_tab_2"))

	local param2 = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = -2,
		textList = tabNameList
	}
	self._tabGroup2:recreateTabs(param2)
	self._tabGroup2:setTabIndex(1)
end

function TreasureListView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateView()
	self:_refreshRedPoint()
end

function TreasureListView:_updateView()
	self._fileNodeBg:setTitle(Lang.get("treasure_list_title_" .. self._selectTabIndex))
	local count1 = G_UserData:getTreasure():getTreasureTotalCount()
	local count2 = UserDataHelper.getTreasureListLimitCount()
	self._fileNodeBg:setCount(Lang.get("common_list_count", {count1 = count1, count2 = count2}))
	self._fileNodeBg:showCount(self._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE1)
	self._buttonSale:setVisible(self._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2)
	self:_initData()

	if self._count == 0 then
		self._tabListView:hideAllView()
		local emptyType = self:_getEmptyType()
		self._fileNodeEmpty:updateView(emptyType)
		self._fileNodeEmpty:setVisible(true)
	else
		local scrollViewParam = {
			template = TreasureListCell,
			updateFunc = handler(self, self._onItemUpdate),
			selectFunc = handler(self, self._onItemSelected),
			touchFunc = handler(self, self._onItemTouch)
		}
		if self._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2 then
			scrollViewParam.template = TreasureFragListCell
		end
		self._tabListView:updateListView(self._selectTabIndex, self._count, scrollViewParam)
		self._fileNodeEmpty:setVisible(false)
	end
end

function TreasureListView:_getEmptyType()
	local emptyType = nil
	if self._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE1 then
		emptyType = 5 --类型定义在CommonEmptyTipNode.lua
	elseif self._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2 then
		emptyType = 6
	end
	assert(emptyType, string.format("TreasureListView _selectTabIndex is wrong = %d", self._selectTabIndex))
	return emptyType
end

function TreasureListView:_initData()
	self._datas = {}
	if self._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE1 then
		self._datas = G_UserData:getTreasure():getListDataBySort()
	elseif self._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2 then
		self._datas = G_UserData:getFragments():getFragListByType(3, G_UserData:getFragments().SORT_FUNC_COMMON)
	end

	self._count = math.ceil(#self._datas / 2)
end

function TreasureListView:_onItemUpdate(item, index)
	local index = index * 2
	item:update(self._datas[index + 1], self._datas[index + 2])
end

function TreasureListView:_onItemSelected(item, index)
end

function TreasureListView:_onItemTouch(index, t)
	local index = index * 2 + t
	local data = self._datas[index]
	if self._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE1 then
		G_SceneManager:showScene(
			"treasureTrain",
			data,
			TreasureConst.TREASURE_TRAIN_STRENGTHEN,
			TreasureConst.TREASURE_RANGE_TYPE_1
		)
	elseif self._selectTabIndex == TreasureConst.TREASURE_LIST_TYPE2 then
		local itemId = data:getId()
		UIPopupHelper.popupFragmentDlg(itemId)
	end
end

function TreasureListView:_onSyntheticFragments(id, message)
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

function TreasureListView:_onButtonSaleClicked()
	if self._datas and #self._datas == 0 then
		G_Prompt:showTip(Lang.get("lang_sellfragment_fragment_empty"))
		return
	end
	local PopupSellFragment = require("app.scene.view.sell.PopupSellFragment")
	local popupSellFragment = PopupSellFragment.new(PopupSellFragment.TREASURE_FRAGMENT_SELL)
	popupSellFragment:openWithAction()
end

function TreasureListView:_onSellFragmentsSuccess()
	self:_updateView()
	self:_refreshRedPoint()
end

return TreasureListView
