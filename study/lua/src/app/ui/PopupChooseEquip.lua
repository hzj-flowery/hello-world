--
-- Author: Liangxu
-- Date: 2017-07-07 11:21:23
-- 选择装备 通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupChooseEquip = class("PopupChooseEquip", PopupBase)
local PopupChooseEquipCell = require("app.ui.PopupChooseEquipCell")
local PopupChooseEquipHelper = require("app.ui.PopupChooseEquipHelper")

function PopupChooseEquip:ctor()
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupChooseEquip", "common"),
		binding = {}
	}

	PopupChooseEquip.super.ctor(self, resource)
end

function PopupChooseEquip:onCreate()
	self._fromType = nil
	self._callBack = nil
	self._equipDatas = {}
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
end

function PopupChooseEquip:onShowFinish()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function PopupChooseEquip:onEnter()
end

function PopupChooseEquip:onExit()
end

function PopupChooseEquip:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChooseEquip:updateUI(fromType, callBack, equipDatas, showRP, curEquipUnitData)
	self._fromType = fromType
	self._callBack = callBack
	self._showRP = showRP
	self._curEquipUnitData = curEquipUnitData

	local helpFunc = PopupChooseEquipHelper["_FROM_TYPE" .. self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._equipDatas = helpFunc(equipDatas)
	end
	assert(self._equipDatas, "self._equipDatas can not be null")

	self._count = math.ceil(#self._equipDatas / 2)
	self._listView:setTemplate(PopupChooseEquipCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupChooseEquip:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._equipDatas[index + 1] then
		local equipdata = self._equipDatas[index + 1]
		data1 = PopupChooseEquipHelper.addEquipDataDesc(equipdata, self._fromType, self._showRP, self._curEquipUnitData)
	end

	if self._equipDatas[index + 2] then
		local equipdata = self._equipDatas[index + 2]
		data2 = PopupChooseEquipHelper.addEquipDataDesc(equipdata, self._fromType, self._showRP, self._curEquipUnitData)
	end

	item:update(data1, data2, true)
end

function PopupChooseEquip:_onItemSelected(item, index)
end

function PopupChooseEquip:_onItemTouch(index, t)
	local unitData = self._equipDatas[index * 2 + t]
	local equipId = unitData:getId()

	if self._callBack then
		self._callBack(equipId)
	end

	self:close()
end

function PopupChooseEquip:_onButtonClose()
	self:close()
end

return PopupChooseEquip
