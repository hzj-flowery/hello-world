--
-- Author: Liangxu
-- Date: 2017-07-07 11:21:23
-- 选择装备 通用界面2
local PopupBase = require("app.ui.PopupBase")
local PopupChooseEquip2 = class("PopupChooseEquip2", PopupBase)
local PopupChooseEquipCell = require("app.ui.PopupChooseEquipCell")
local PopupChooseEquipHelper = require("app.ui.PopupChooseEquipHelper")

function PopupChooseEquip2:ctor()
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupChooseEquip2", "common"),
		binding = {
			
		}
	}
	self:setName("PopupChooseEquip2")
	PopupChooseEquip2.super.ctor(self, resource)
end

function PopupChooseEquip2:onCreate()
	self._hideWear = G_UserData:getUserSetting():getHideWearEquip()
	self._fromType = nil
	self._callBack = nil
	self._totalDatas = {} --全体数据
	self._noWearDatas = {} --未穿戴的数据
	self._equipDatas = {} --最终使用的数据
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._checkBox:addEventListener(handler(self, self._onCheckBoxClicked))
	self._checkBox:setSelected(self._hideWear)
	self._textTip:setString(Lang.get("equipment_hide_tip"))

	self._listView:setTemplate(PopupChooseEquipCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end


function PopupChooseEquip2:onShowFinish()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
end

function PopupChooseEquip2:onEnter()
	
end

function PopupChooseEquip2:onExit()
	
end

function PopupChooseEquip2:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChooseEquip2:updateUI(fromType, callBack, totalDatas, showRP, curEquipUnitData, noWearDatas, pos)
	self._fromType = fromType
	self._callBack = callBack
	self._totalDatas = totalDatas
	self._showRP = showRP
	self._curEquipUnitData = curEquipUnitData
	self._noWearDatas = noWearDatas
	self._pos = pos

	self:_refreshList()
end

function PopupChooseEquip2:_refreshList()
	local helpFunc = PopupChooseEquipHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		if self._hideWear then
			self._equipDatas = helpFunc(self._noWearDatas)
		else
			self._equipDatas = helpFunc(self._totalDatas)
		end
		
	end
	assert(self._equipDatas, "self._equipDatas can not be null")

	self._listView:clearAll()
	self._count = math.ceil(#self._equipDatas / 2)
	self._listView:resize(self._count)
end

function PopupChooseEquip2:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._equipDatas[index + 1] then
		local equipdata = self._equipDatas[index + 1]
		data1 = PopupChooseEquipHelper.addEquipDataDesc(equipdata, self._fromType, self._showRP, self._curEquipUnitData, self._pos)
	end

	if self._equipDatas[index + 2] then
		local equipdata = self._equipDatas[index + 2]
		data2 = PopupChooseEquipHelper.addEquipDataDesc(equipdata, self._fromType, self._showRP, self._curEquipUnitData, self._pos)
	end

	item:update(data1, data2)
end

function PopupChooseEquip2:_onItemSelected(item, index)
	
end

function PopupChooseEquip2:_onItemTouch(index, t)
	local unitData = self._equipDatas[index * 2 + t]
	local equipId = unitData:getId()

	if self._callBack then
		self._callBack(equipId)
	end

	self:close()
end

function PopupChooseEquip2:_onButtonClose()
	self:close()
end

function PopupChooseEquip2:_onCheckBoxClicked(sender)
	self._hideWear = self._checkBox:isSelected()
	G_UserData:getUserSetting():setHideWearEquip(self._hideWear)
	self:_refreshList()
end

return PopupChooseEquip2