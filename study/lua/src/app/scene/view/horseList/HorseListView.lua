--
-- Author: Liangxu
-- Date: 2018-8-29
-- 战马列表
local ViewBase = require("app.ui.ViewBase")
local HorseListView = class("HorseListView", ViewBase)
local HorseListCell = require("app.scene.view.horseList.HorseListCell")
local HorseFragListCell = require("app.scene.view.horseList.HorseFragListCell")
local HorseEquipListCell = require("app.scene.view.horseList.HorseEquipListCell")
local HorseEquipFragListCell = require("app.scene.view.horseList.HorseEquipFragListCell")
local HorseConst = require("app.const.HorseConst")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local TabScrollView = require("app.utils.TabScrollView")
local RedPointHelper = require("app.data.RedPointHelper")

function HorseListView:ctor(index)
	self._selectTabIndex = index or HorseConst.HORSE_LIST_TYPE1

	local resource = {
		file = Path.getCSB("HorseListView", "horse"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonSale = {
				events = {{event = "touch", method = "_onButtonSaleClicked"}}
			}
		},
	}
	HorseListView.super.ctor(self, resource)
end

function HorseListView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_horse")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	self:_initTabGroup()
end

function HorseListView:onEnter()
	self._signalMerageItemMsg = G_SignalManager:add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(self, self._onSyntheticFragments))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	self._signalSellObjects = G_SignalManager:add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(self, self._onSellFragmentsSuccess))

	self:_updateView()
	self:_refreshRedPoint()
end

function HorseListView:onExit()
	self._signalMerageItemMsg:remove()
	self._signalMerageItemMsg = nil
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	if self._signalSellObjects then
		self._signalSellObjects:remove()
		self._signalSellObjects = nil
	end
end

function HorseListView:_onEventRedPointUpdate(event,funcId,param)
	if funcId == FunctionConst.FUNC_HORSE_LIST then
		self:_refreshRedPoint()
    end
end

function HorseListView:_refreshRedPoint()
	-- local redPointShow1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_LIST, "list")
    local redPointShow2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_LIST, "fraglist")
    local redPointShow4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_LIST, "equipFraglist")
	-- self._nodeTabRoot:setRedPointByTabIndex(HorseConst.HORSE_LIST_TYPE1, redPointShow1)
    self._nodeTabRoot:setRedPointByTabIndex(HorseConst.HORSE_LIST_TYPE2, redPointShow2)
    self._nodeTabRoot:setRedPointByTabIndex(HorseConst.HORSE_LIST_TYPE4, redPointShow4)
end

function HorseListView:_initTabGroup()
	local scrollViewParam = {
		template = HorseListCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	if self._selectTabIndex == HorseConst.HORSE_LIST_TYPE2 then
        scrollViewParam.template = HorseFragListCell            --战马碎片
    elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE3 then
        scrollViewParam.template = HorseEquipListCell           --战马装备
    elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE3 then
        scrollViewParam.template = HorseEquipFragListCell       --战马装备碎片
	end
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam)

	local tabNameList = {}
	table.insert(tabNameList, Lang.get("horse_list_tab_1"))
    table.insert(tabNameList, Lang.get("horse_list_tab_2"))
    table.insert(tabNameList, Lang.get("horse_list_tab_3"))
    table.insert(tabNameList, Lang.get("horse_list_tab_4"))

	local param = {
		callback = handler(self, self._onTabSelect),
		textList = tabNameList,
	}

	self._nodeTabRoot:recreateTabs(param)
end

function HorseListView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateView()
	self:_refreshRedPoint()
end

function HorseListView:_updateView()
	self._fileNodeBg:setTitle(Lang.get("horse_list_title_"..self._selectTabIndex))
	local count1 = G_UserData:getHorse():getHorseTotalCount()
	local count2 = HorseDataHelper.getHorseListLimitCount()
	self._fileNodeBg:setCount(Lang.get("common_list_count", {count1 = count1, count2 = count2}))
    self._fileNodeBg:showCount(self._selectTabIndex == HorseConst.HORSE_LIST_TYPE1)
    self._buttonSale:setVisible(self._selectTabIndex == HorseConst.HORSE_LIST_TYPE4 or self._selectTabIndex == HorseConst.HORSE_LIST_TYPE2)
	self:_initData()

	if self._count == 0 then
		self._tabListView:hideAllView()
		local emptyType = self:_getEmptyType()
		self._fileNodeEmpty:updateView(emptyType)
		self._fileNodeEmpty:setVisible(true)
	else
		local scrollViewParam = {
			template = HorseListCell,
			updateFunc = handler(self, self._onItemUpdate),
			selectFunc = handler(self, self._onItemSelected),
			touchFunc = handler(self, self._onItemTouch),
		}
		if self._selectTabIndex == HorseConst.HORSE_LIST_TYPE2 then
            scrollViewParam.template = HorseFragListCell
        elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE3 then
            scrollViewParam.template = HorseEquipListCell
        elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE4 then
            scrollViewParam.template = HorseEquipFragListCell
		end
		self._tabListView:updateListView(self._selectTabIndex, self._count, scrollViewParam)
		self._fileNodeEmpty:setVisible(false)
	end
end

function HorseListView:_getEmptyType()
	local emptyType = nil
	if self._selectTabIndex == HorseConst.HORSE_LIST_TYPE1 then
		emptyType = 11 --类型定义在CommonEmptyTipNode.lua
	elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE2 then
        emptyType = 12
    elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE3 then
        emptyType = 18
    elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE4 then
        emptyType = 19
	end
	assert(emptyType, string.format("HorseListView _selectTabIndex is wrong = %d", self._selectTabIndex))
	return emptyType
end

function HorseListView:_initData()
	self._datas = {}
	if self._selectTabIndex == HorseConst.HORSE_LIST_TYPE1 then
		self._datas = G_UserData:getHorse():getListDataBySort()
	elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE2 then
        self._datas = G_UserData:getFragments():getFragListByType(TypeConvertHelper.TYPE_HORSE, G_UserData:getFragments().SORT_FUNC_COMMON)
    elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE3 then
        self._datas = G_UserData:getHorseEquipment():getListDataBySort()
    elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE4 then
        self._datas = G_UserData:getFragments():getFragListByType(TypeConvertHelper.TYPE_HORSE_EQUIP, G_UserData:getFragments().SORT_FUNC_COMMON)
	end

	self._count = math.ceil(#self._datas / 2)
end

function HorseListView:_onItemUpdate(item, index)
	local index = index * 2
	item:update(self._datas[index + 1], self._datas[index + 2])
end

function HorseListView:_onItemSelected(item, index)

end

function HorseListView:_onItemTouch(index, t)
	local index = index * 2 + t
	local data = self._datas[index]
	if self._selectTabIndex == HorseConst.HORSE_LIST_TYPE1 then
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		local isOpen, des = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HORSE_TRAIN)
		if not isOpen then
			G_Prompt:showTip(des)
			return
		end

		G_SceneManager:showScene("horseTrain", data, HorseConst.HORSE_RANGE_TYPE_1)
	elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE2 then
		local itemId = data:getId()
        UIPopupHelper.popupFragmentDlg(itemId)
    elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE3 then
        -- 
    elseif self._selectTabIndex == HorseConst.HORSE_LIST_TYPE4 then
        local itemId = data:getId()
		UIPopupHelper.popupFragmentDlg(itemId)
	end
end

function HorseListView:_onSyntheticFragments(id, message)
	local fragId = rawget(message,"id")
	local itemSize = rawget(message,"num")
	if fragId and fragId > 0 then
		local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragId)
		local popup = require("app.ui.PopupGetRewards").new()
		local awards = {
			[1] = {
				type = itemParam.cfg.comp_type,
				value =  itemParam.cfg.comp_value,
				size = itemSize
			}
		}
		popup:showRewards(awards)

		self:_updateView()
	end
end

function HorseListView:_onSellFragmentsSuccess()
	self:_updateView()
	self:_refreshRedPoint()
end

-- 新增出售按钮
function HorseListView:_onButtonSaleClicked()
    if self._datas and #self._datas == 0 then
		G_Prompt:showTip(Lang.get("lang_sellfragment_fragment_empty"))
		return
    end
    
    local PopupSellFragment = require("app.scene.view.sell.PopupSellFragment")
    local sellType = PopupSellFragment.HORSE_FRAGMENT_SELL
    if self._selectTabIndex == HorseConst.HORSE_LIST_TYPE4 then
        sellType = PopupSellFragment.HORSE_EQUIP_FRAGMENT_SELL
    end
	local popupSellFragment = PopupSellFragment.new(sellType)
	popupSellFragment:openWithAction()
end

return HorseListView