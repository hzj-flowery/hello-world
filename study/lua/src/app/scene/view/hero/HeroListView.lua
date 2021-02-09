--
-- Author: Liangxu
-- Date: 2017-02-21 13:32:07
--
local ViewBase = require("app.ui.ViewBase")
local HeroListView = class("HeroListView", ViewBase)
local HeroListCell = require("app.scene.view.hero.HeroListCell")
local HeroFragListCell = require("app.scene.view.hero.HeroFragListCell")
local HeroConst = require("app.const.HeroConst")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TabScrollView = require("app.utils.TabScrollView")

function HeroListView:ctor(index)
	self._fileNodeEmpty = nil --空置控件

	self._selectTabIndex = index or HeroConst.HERO_LIST_TYPE1

	local resource = {
		file = Path.getCSB("HeroListView", "hero"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonSale = {
				events = {{event = "touch", method = "_onButtonSaleClicked"}}
			},
		},
	}
	HeroListView.super.ctor(self, resource)
end

function HeroListView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_wujiang")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	self:_initTabGroup()
end

function HeroListView:onEnter()
	self._signalMerageItemMsg = G_SignalManager:add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(self, self._onSyntheticFragments))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	self._signalSellObjects = G_SignalManager:add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(self, self._onSellFragmentsSuccess))
	
	self._nodeTabRoot:setTabIndex(self._selectTabIndex)
	self:_updateView()
	self:_refreshRedPoint()
end

function HeroListView:onExit()
	self._signalMerageItemMsg:remove()
	self._signalMerageItemMsg = nil

	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	if self._signalSellObjects then
		self._signalSellObjects:remove()
		self._signalSellObjects = nil
	end
end

function HeroListView:_onEventRedPointUpdate(event,funcId,param)
	if funcId == FunctionConst.FUNC_HERO_LIST then
		self:_refreshRedPoint()
    end
end


function HeroListView:_refreshRedPoint()
	local redPointShow = G_UserData:getFragments():hasRedPoint({fragType = 1})
	self._nodeTabRoot:setRedPointByTabIndex(HeroConst.HERO_LIST_TYPE2,redPointShow)
end

function HeroListView:_initTabGroup()
	local scrollViewParam = {
		template = HeroListCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	if self._selectTabIndex == HeroConst.HERO_LIST_TYPE2 then
		scrollViewParam.template = HeroFragListCell
	end
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam, self._selectTabIndex)

	local tabNameList = {}
	table.insert(tabNameList, Lang.get("hero_list_tab_1"))
	table.insert(tabNameList, Lang.get("hero_list_tab_2"))

	local param = {
		callback = handler(self, self._onTabSelect),
		textList = tabNameList,
	}

	self._nodeTabRoot:recreateTabs(param)
end

function HeroListView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateView()
	self:_refreshRedPoint()
end

function HeroListView:_updateView()
	self._fileNodeBg:setTitle(Lang.get("hero_list_title_"..self._selectTabIndex))
	local count1 = G_UserData:getHero():getHeroTotalCount()
	local count2 = UserDataHelper.getHeroListLimitCount()
	self._fileNodeBg:setCount(Lang.get("common_list_count", {count1 = count1, count2 = count2}))
	self._fileNodeBg:showCount(self._selectTabIndex == HeroConst.HERO_LIST_TYPE1)
	self._buttonSale:setVisible(self._selectTabIndex == HeroConst.HERO_LIST_TYPE2)
	self:_initData()
	
	if self._count == 0 then
		self._tabListView:hideAllView()
		local emptyType = self:_getEmptyType()
		self._fileNodeEmpty:updateView(emptyType)
		self._fileNodeEmpty:setVisible(true)
	else
		local scrollViewParam = {
			template = HeroListCell,
			updateFunc = handler(self, self._onItemUpdate),
			selectFunc = handler(self, self._onItemSelected),
			touchFunc = handler(self, self._onItemTouch),
		}
		if self._selectTabIndex == HeroConst.HERO_LIST_TYPE2 then
			scrollViewParam.template = HeroFragListCell
		end
		
		self._tabListView:updateListView(self._selectTabIndex, self._count, scrollViewParam)
		self._fileNodeEmpty:setVisible(false)
	end
end

function HeroListView:_getEmptyType()
	local emptyType = nil
	if self._selectTabIndex == HeroConst.HERO_LIST_TYPE1 then
		emptyType = 1 --类型定义在CommonEmptyTipNode.lua
	elseif self._selectTabIndex == HeroConst.HERO_LIST_TYPE2 then
		emptyType = 2
	end
	assert(emptyType, string.format("HeroListView _selectTabIndex is wrong = %d", self._selectTabIndex))
	return emptyType
end

function HeroListView:_initData()
	self._datas = {}
	if self._selectTabIndex == HeroConst.HERO_LIST_TYPE1 then
		self._datas = G_UserData:getHero():getListDataBySort()
	elseif self._selectTabIndex == HeroConst.HERO_LIST_TYPE2 then
		self._datas = G_UserData:getFragments():getFragListByType(1, G_UserData:getFragments().SORT_FUNC_HEROLIST)
	end

	self._count = math.ceil(#self._datas / 2)
end

function HeroListView:_onItemUpdate(item, index)
	logWarn("HeroListView:_onItemUpdate "..(index+1))
	local index = index * 2
	item:update(self._datas[index + 1], self._datas[index + 2])
end

function HeroListView:_onItemSelected(item, index)

end

function HeroListView:_onItemTouch(index, t)
	local index = index * 2 + t
	local data = self._datas[index]
	if self._selectTabIndex == HeroConst.HERO_LIST_TYPE1 then
		G_SceneManager:showScene("heroDetail", data, HeroConst.HERO_RANGE_TYPE_1)
	elseif self._selectTabIndex == HeroConst.HERO_LIST_TYPE2 then
		local itemId = data:getId()
		UIPopupHelper.popupFragmentDlg(itemId)
	end
end

function HeroListView:_onSyntheticFragments(id, message)
	local fragId = rawget(message,"id")
	local itemSize = rawget(message,"num")
	if fragId and fragId > 0 then
		local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragId)
		-- local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		-- local awards = {
		-- 	[1] = {
		-- 		type = itemParam.cfg.comp_type,
		-- 		value =  itemParam.cfg.comp_value,
		-- 		size = itemSize
		-- 	}
		-- }
		-- PopupGetRewards:showRewards(awards)
		local heroId = itemParam.cfg.comp_value
		local count = itemSize
		-- require("app.scene.view.heroMerge.HeroMerge").create(heroId, count)
		G_SceneManager:showScene("heroMerge", heroId, count)

		self:_updateView()
	end
end

function HeroListView:_onButtonSaleClicked()
	if self._datas and #self._datas == 0 then
		G_Prompt:showTip(Lang.get("lang_sellfragment_fragment_empty"))
		return
	end
	local PopupSellFragment = require("app.scene.view.sell.PopupSellFragment")
	local popupSellFragment = PopupSellFragment.new(PopupSellFragment.HERO_FRAGMENT_SELL)
	popupSellFragment:openWithAction()
end

function HeroListView:_onSellFragmentsSuccess()
	self:_updateView()
	self:_refreshRedPoint()
end

return HeroListView
