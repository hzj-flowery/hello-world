--
-- Author: hedili
-- Date: 2018-01-23 13:32:07
--
local ViewBase = require("app.ui.ViewBase")
local PetListView = class("PetListView", ViewBase)
local PetListCell = require("app.scene.view.pet.PetListCell")
local PetFragListCell = require("app.scene.view.pet.PetFragListCell")
local PetConst = require("app.const.PetConst")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TabScrollView = require("app.utils.TabScrollView")

function PetListView:ctor(index)
	self._fileNodeEmpty = nil --空置控件

	self._selectTabIndex = index or PetConst.PET_LIST_TYPE1

	local resource = {
		file = Path.getCSB("PetListView", "pet"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonSale = {
				events = {{event = "touch", method = "_onButtonSaleClicked"}}
			},
		},
	}
	PetListView.super.ctor(self, resource)
end

function PetListView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_shenshou")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	self:_initTabGroup()
end

function PetListView:onEnter()
	self._signalMerageItemMsg = G_SignalManager:add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(self, self._onSyntheticFragments))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	self._signalSellObjects = G_SignalManager:add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(self, self._onSellFragmentsSuccess))

	self:_updateView()
	self:_refreshRedPoint()
end

function PetListView:onExit()
	self._signalMerageItemMsg:remove()
	self._signalMerageItemMsg = nil

	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	if self._signalSellObjects then
		self._signalSellObjects:remove()
		self._signalSellObjects = nil
	end
end

function PetListView:_onEventRedPointUpdate(event,funcId,param)
	if funcId == FunctionConst.FUNC_PET_LIST then
		self:_refreshRedPoint()
    end
end


function PetListView:_refreshRedPoint()
	local redPointShow = G_UserData:getFragments():hasRedPoint({fragType = TypeConvertHelper.TYPE_PET}) --10为神兽
	self._nodeTabRoot:setRedPointByTabIndex(PetConst.PET_LIST_TYPE2,redPointShow)
end

function PetListView:_initTabGroup()
	local scrollViewParam = {
		template = PetListCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	if self._selectTabIndex == PetConst.PET_LIST_TYPE2 then
		scrollViewParam.template = PetFragListCell
	end
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam)

	local tabNameList = {}
	table.insert(tabNameList, Lang.get("pet_list_tab_1"))
	table.insert(tabNameList, Lang.get("pet_list_tab_2"))

	local param = {
		callback = handler(self, self._onTabSelect),
		textList = tabNameList,
	}

	self._nodeTabRoot:recreateTabs(param)
end

function PetListView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateView()
	self:_refreshRedPoint()
end

function PetListView:_updateView()
	self._fileNodeBg:setTitle(Lang.get("pet_list_title_"..self._selectTabIndex))
	local count1 = G_UserData:getPet():getPetTotalCount()
	local count2 = UserDataHelper.getPetListLimitCount()
	self._fileNodeBg:setCount(Lang.get("common_list_count", {count1 = count1, count2 = count2}))
	self._fileNodeBg:showCount(self._selectTabIndex == PetConst.PET_LIST_TYPE1)
	self._buttonSale:setVisible(self._selectTabIndex == PetConst.PET_LIST_TYPE2)
	self:_initData()

	if self._count == 0 then
		self._tabListView:hideAllView()
		local emptyType = self:_getEmptyType()
		self._fileNodeEmpty:updateView(emptyType)
		self._fileNodeEmpty:setVisible(true)
	else
		local scrollViewParam = {
			template = PetListCell,
			updateFunc = handler(self, self._onItemUpdate),
			selectFunc = handler(self, self._onItemSelected),
			touchFunc = handler(self, self._onItemTouch),
		}
		if self._selectTabIndex == PetConst.PET_LIST_TYPE2 then
			scrollViewParam.template = PetFragListCell
		end
		self._tabListView:updateListView(self._selectTabIndex, self._count, scrollViewParam)
		self._fileNodeEmpty:setVisible(false)
	end
end

function PetListView:_getEmptyType()
	local emptyType = nil
	if self._selectTabIndex == PetConst.PET_LIST_TYPE1 then
		emptyType = 10 --类型定义在CommonEmptyTipNode.lua
	elseif self._selectTabIndex == PetConst.PET_LIST_TYPE2 then
		emptyType = 10 
	end
	assert(emptyType, string.format("PetListView _selectTabIndex is wrong = %d", self._selectTabIndex))
	return emptyType
end

function PetListView:_initData()
	self._datas = {}
	if self._selectTabIndex == PetConst.PET_LIST_TYPE1 then

		self._datas = G_UserData:getPet():getListDataBySort()

	elseif self._selectTabIndex == PetConst.PET_LIST_TYPE2 then

		self._datas = G_UserData:getFragments():getFragListByType(
			TypeConvertHelper.TYPE_PET, 
			G_UserData:getFragments().SORT_FUNC_PETLIST)
	end

	self._count = math.ceil(#self._datas / 2)
end

function PetListView:_onItemUpdate(item, index)
	logWarn("PetListView:_onItemUpdate "..(index+1))
	local index = index * 2
	item:update(self._datas[index + 1], self._datas[index + 2])
end

function PetListView:_onItemSelected(item, index)

end

function PetListView:_onItemTouch(index, t)
	local index = index * 2 + t
	local data = self._datas[index]
	if self._selectTabIndex == PetConst.PET_LIST_TYPE1 then
		G_SceneManager:showScene("petDetail", data, PetConst.PET_RANGE_TYPE_1)
	elseif self._selectTabIndex == PetConst.PET_LIST_TYPE2 then
		local itemId = data:getId()
		UIPopupHelper.popupFragmentDlg(itemId)
	end
end

function PetListView:_onSyntheticFragments(id, message)
	local fragId = rawget(message,"id")
	local itemSize = rawget(message,"num")
	if fragId and fragId > 0 then
		local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragId)
		local petId = itemParam.cfg.comp_value
		local count = itemSize

				-- require("app.scene.view.heroMerge.HeroMerge").create(heroId, count)
		G_SceneManager:showScene("petMerge", petId, count)
		--require("app.scene.view.petMerge.PetMerge").create(petId, count)

		self:_updateView()
	end
end

function PetListView:_onButtonSaleClicked()
	if self._datas and #self._datas == 0 then
		G_Prompt:showTip(Lang.get("lang_sellfragment_fragment_empty"))
		return
	end
	local PopupSellFragment = require("app.scene.view.sell.PopupSellFragment")
	local popupSellFragment = PopupSellFragment.new(PopupSellFragment.PET_FRAGMENT_SELL)
	popupSellFragment:openWithAction()
end

function PetListView:_onSellFragmentsSuccess()
	self:_updateView()
	self:_refreshRedPoint()
end

return PetListView
