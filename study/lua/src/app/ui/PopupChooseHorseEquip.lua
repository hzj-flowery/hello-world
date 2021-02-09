--
-- Author: JerryHe
-- Date: 2018-01-28
-- 选择战马装备 通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupChooseHorseEquip = class("PopupChooseHorseEquip", PopupBase)
local PopupChooseHorseEquipCell = require("app.ui.PopupChooseHorseEquipCell")
local PopupChooseHorseEquipHelper = require("app.ui.PopupChooseHorseEquipHelper")

function PopupChooseHorseEquip:ctor(parent)
    self._commonNodeBk = nil --弹框背景
    self._parent = parent
	local resource = {
		file = Path.getCSB("PopupChooseHorseEquip", "common"),
		binding = {
			
		}
	}
	self:setName("PopupChooseHorseEquip")
	PopupChooseHorseEquip.super.ctor(self, resource)
end

function PopupChooseHorseEquip:onCreate()
	self._hideWear = G_UserData:getUserSetting():getHideWearHorseEquip()
	self._fromType = nil
	self._callBack = nil
	self._totalDatas = {} --全体数据
	self._noWearDatas = {} --未穿戴的数据
	self._equipDatas = {} --最终使用的数据
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._checkBox:addEventListener(handler(self, self._onCheckBoxClicked))
	self._checkBox:setSelected(self._hideWear)
	self._textTip:setString(Lang.get("equipment_hide_tip"))

	self._listView:setTemplate(PopupChooseHorseEquipCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end


function PopupChooseHorseEquip:onShowFinish()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
end

function PopupChooseHorseEquip:onEnter()
	
end

function PopupChooseHorseEquip:onExit()
	
end

function PopupChooseHorseEquip:open()
    PopupChooseHorseEquip.super.open(self)
    if not self._parent then
        return
    end
    self:removeFromParent()
    self._parent:addChild(self)
end

function PopupChooseHorseEquip:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChooseHorseEquip:updateUI(fromType, callBack, totalDatas, curEquipUnitData, noWearDatas, pos)
	self._fromType = fromType
	self._callBack = callBack
	self._totalDatas = totalDatas
	self._curEquipUnitData = curEquipUnitData
	self._noWearDatas = noWearDatas
	self._pos = pos

	self:_refreshList()
end

function PopupChooseHorseEquip:_refreshList()
	local helpFunc = PopupChooseHorseEquipHelper["_FROM_TYPE"..self._fromType]
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

function PopupChooseHorseEquip:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._equipDatas[index + 1] then
		local equipdata = self._equipDatas[index + 1]
		data1 = PopupChooseHorseEquipHelper.addEquipDataDesc(equipdata, self._fromType, self._curEquipUnitData, self._pos)
	end

	if self._equipDatas[index + 2] then
		local equipdata = self._equipDatas[index + 2]
		data2 = PopupChooseHorseEquipHelper.addEquipDataDesc(equipdata, self._fromType, self._curEquipUnitData, self._pos)
	end

	item:update(data1, data2)
end

function PopupChooseHorseEquip:_onItemSelected(item, index)
	
end

function PopupChooseHorseEquip:_onItemTouch(index, t)
	local unitData = self._equipDatas[index * 2 + t]

	if self._callBack then
		self._callBack(unitData)
	end

	self:close()
end

function PopupChooseHorseEquip:_onButtonClose()
	self:close()
end

function PopupChooseHorseEquip:_onCheckBoxClicked(sender)
	self._hideWear = self._checkBox:isSelected()
	G_UserData:getUserSetting():setHideWearHorseEquip(self._hideWear)
	self:_refreshList()
end

return PopupChooseHorseEquip