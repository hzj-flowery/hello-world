--
-- Author: Liangxu
-- Date: 2017-9-7 14:22:33
-- 神兵列表
local ViewBase = require("app.ui.ViewBase")
local InstrumentListView = class("InstrumentListView", ViewBase)
local InstrumentListCell = require("app.scene.view.instrument.InstrumentListCell")
local InstrumentFragListCell = require("app.scene.view.instrument.InstrumentFragListCell")
local InstrumentConst = require("app.const.InstrumentConst")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TabScrollView = require("app.utils.TabScrollView")

function InstrumentListView:ctor(index)
	self._selectTabIndex = index or InstrumentConst.INSTRUMENT_LIST_TYPE1

	self._tabGroup2 = nil -- 顶部tab

	local UserDataHelper = require("app.utils.UserDataHelper")
	local resName = "InstrumentListView"
	--if UserDataHelper.isEnoughBagMergeLevel() then -- 达到调整等级
		--resName = "InstrumentListView1"
	--end
	local resource = {
		file = Path.getCSB(resName, "instrument"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonSale = {
				events = {{event = "touch", method = "_onButtonSaleClicked"}}
			}
		}
	}
	InstrumentListView.super.ctor(self, resource)
end

function InstrumentListView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_shenbing")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	self:_initTabGroup()
end

function InstrumentListView:onEnter()
	self._signalMerageItemMsg =
		G_SignalManager:add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(self, self._onSyntheticFragments))
	self._signalRedPointUpdate =
		G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))
	self._signalSellObjects =
		G_SignalManager:add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(self, self._onSellFragmentsSuccess))

	self:_updateView()
	self:_refreshRedPoint()
end

function InstrumentListView:onExit()
	self._signalMerageItemMsg:remove()
	self._signalMerageItemMsg = nil
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	if self._signalSellObjects then
		self._signalSellObjects:remove()
		self._signalSellObjects = nil
	end
end

function InstrumentListView:_onEventRedPointUpdate(event, funcId, param)
	if funcId == FunctionConst.FUNC_INSTRUMENT_LIST then
		self:_refreshRedPoint()
	end
end

function InstrumentListView:_refreshRedPoint()
	local redPointShow = G_UserData:getFragments():hasRedPoint({fragType = 4})
	if self._nodeTabRoot then
		self._nodeTabRoot:setRedPointByTabIndex(InstrumentConst.INSTRUMENT_LIST_TYPE2, redPointShow)
	end
	if self._tabGroup2 then
		self._tabGroup2:setRedPointByTabIndex(InstrumentConst.INSTRUMENT_LIST_TYPE2, redPointShow)
	end
end

function InstrumentListView:_initTabGroup()
	local scrollViewParam = {
		template = InstrumentListCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch)
	}
	if self._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2 then
		scrollViewParam.template = InstrumentFragListCell
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
function InstrumentListView:_initNodeTab()
	local tabNameList = {}
	table.insert(tabNameList, Lang.get("instrument_list_tab_1"))
	table.insert(tabNameList, Lang.get("instrument_list_tab_2"))

	local param = {
		callback = handler(self, self._onTabSelect),
		textList = tabNameList
	}

	self._nodeTabRoot:recreateTabs(param)
	self._nodeTabRoot:setTabIndex(1)
end

-- 顶部tab初始化
function InstrumentListView:_initGroupTab()
	local tabNameList = {}
	table.insert(tabNameList, Lang.get("instrument_list_tab_1"))
	table.insert(tabNameList, Lang.get("instrument_list_tab_2"))

	local param2 = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = -2,
		textList = tabNameList
	}
	self._tabGroup2:recreateTabs(param2)
	self._tabGroup2:setTabIndex(1)
end

function InstrumentListView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateView()
	self:_refreshRedPoint()
end

function InstrumentListView:_updateView()
	self._fileNodeBg:setTitle(Lang.get("instrument_list_title_" .. self._selectTabIndex))
	local count1 = G_UserData:getInstrument():getInstrumentTotalCount()
	local count2 = UserDataHelper.getInstrumentListLimitCount()
	self._fileNodeBg:setCount(Lang.get("common_list_count", {count1 = count1, count2 = count2}))
	self._fileNodeBg:showCount(self._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE1)
	self._buttonSale:setVisible(self._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2)
	self:_initData()

	if self._count == 0 then
		self._tabListView:hideAllView()
		local emptyType = self:_getEmptyType()
		self._fileNodeEmpty:updateView(emptyType)
		self._fileNodeEmpty:setVisible(true)
	else
		local scrollViewParam = {
			template = InstrumentListCell,
			updateFunc = handler(self, self._onItemUpdate),
			selectFunc = handler(self, self._onItemSelected),
			touchFunc = handler(self, self._onItemTouch)
		}
		if self._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2 then
			scrollViewParam.template = InstrumentFragListCell
		end
		self._tabListView:updateListView(self._selectTabIndex, self._count, scrollViewParam)
		self._fileNodeEmpty:setVisible(false)
	end
end

function InstrumentListView:_getEmptyType()
	local emptyType = nil
	if self._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE1 then
		emptyType = 7 --类型定义在CommonEmptyTipNode.lua
	elseif self._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2 then
		emptyType = 8
	end
	assert(emptyType, string.format("InstrumentListView _selectTabIndex is wrong = %d", self._selectTabIndex))
	return emptyType
end

function InstrumentListView:_initData()
	self._datas = {}
	if self._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE1 then
		self._datas = G_UserData:getInstrument():getListDataBySort()
	elseif self._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2 then
		self._datas = G_UserData:getFragments():getFragListByType(4, G_UserData:getFragments().SORT_FUNC_COMMON) --神兵碎片
	end

	self._count = math.ceil(#self._datas / 2)
end

function InstrumentListView:_onItemUpdate(item, index)
	local index = index * 2
	item:update(self._datas[index + 1], self._datas[index + 2])
end

function InstrumentListView:_onItemSelected(item, index)
end

function InstrumentListView:_onItemTouch(index, t)
	local index = index * 2 + t
	local data = self._datas[index]
	if self._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE1 then
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1)
		if not isOpen then
			G_Prompt:showTip(des)
			return
		end

		G_SceneManager:showScene("instrumentDetail", data, InstrumentConst.INSTRUMENT_RANGE_TYPE_1)
	elseif self._selectTabIndex == InstrumentConst.INSTRUMENT_LIST_TYPE2 then
		local itemId = data:getId()
		UIPopupHelper.popupFragmentDlg(itemId)
	end
end

function InstrumentListView:_onSyntheticFragments(id, message)
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

function InstrumentListView:_onButtonSaleClicked()
	if self._datas and #self._datas == 0 then
		G_Prompt:showTip(Lang.get("lang_sellfragment_fragment_empty"))
		return
	end
	local PopupSellFragment = require("app.scene.view.sell.PopupSellFragment")
	local popupSellFragment = PopupSellFragment.new(PopupSellFragment.INSTRUMENT_FRAGMENT_SELL)
	popupSellFragment:openWithAction()
end

function InstrumentListView:_onSellFragmentsSuccess()
	self:_updateView()
	self:_refreshRedPoint()
end

return InstrumentListView
