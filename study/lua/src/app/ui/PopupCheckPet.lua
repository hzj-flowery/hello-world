--
-- Author: hedili
-- Date: 2018-02-15 15:34:05
-- 复选神兽通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupCheckPet = class("PopupCheckPet", PopupBase)
local PopupCheckPetCell = require("app.ui.PopupCheckPetCell")
local PopupCheckPetHelper = require("app.ui.PopupCheckPetHelper")

local TITLE = {
	[1] = "pet_check_title_1",
	[2] = "pet_check_title_2",
}

function PopupCheckPet:ctor(parentView)
	self._parentView = parentView
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupCheckPet", "common"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onButtonOK"}}
			},
		}
	}
	self:setName("PopupCheckPet")
	PopupCheckPet.super.ctor(self, resource)
end

function PopupCheckPet:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._buttonOk:setString(Lang.get("hero_upgrade_btn_Ok"))
	for i = 1, 2 do
		self["_nodeDes"..i]:setFontSize(20)
	end
	self._nodeCount:setFontSize(20)
end

function PopupCheckPet:onEnter()
	self:_updateInfo()
end

function PopupCheckPet:onClose()
	if self._clickOk then
		self._clickOk()
	end
end

function PopupCheckPet:onExit()

end
function PopupCheckPet:onShowFinish()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
end
function PopupCheckPet:updateUI(fromType, clickOk)
	self._fromType = fromType
	self._clickOk = clickOk

	self._maxCount = PopupCheckPetHelper.getMaxCount(fromType)
	self._commonNodeBk:setTitle(Lang.get(TITLE[fromType]))

	local helpFunc = PopupCheckPetHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._petsData = helpFunc()
	end
	assert(self._petsData, "self._petsData can not be null")
	self._count = math.ceil(#self._petsData / 2)
	self._listView:setTemplate(PopupCheckPetCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupCheckPet:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2, isAdded1, isAdded2 = nil

	if self._petsData[index + 1] then
		local petdata = self._petsData[index + 1]
		data1 = PopupCheckPetHelper.addPetDataDesc(petdata, self._fromType)
		isAdded1 = self._parentView:checkIsAdded(data1)
	end

	if self._petsData[index + 2] then
		local petdata = self._petsData[index + 2]
		data2 = PopupCheckPetHelper.addPetDataDesc(petdata, self._fromType)
		isAdded2 = self._parentView:checkIsAdded(data2)
	end

	item:update(data1, data2, isAdded1, isAdded2)
end

function PopupCheckPet:_onItemSelected(item, index)

end

function PopupCheckPet:_onItemTouch(index, t, selected, item)
	if selected and self._parentView:checkIsMaxCount() then
		G_Prompt:showTip(Lang.get("hero_upgrade_food_max_tip"))
		item:setCheckBoxSelected(t, false)
		return
	end

	local petData = self._petsData[index * 2 + t]
	if selected then
		for i = 1, self._maxCount do
			if self._parentView:getPetWithIndex(i) == nil then
				self._parentView:insertPet(i, petData)
				break
			end
		end
	else
		self._parentView:deletePetWithPetId(petData:getId())
	end

	self:_updateInfo()
end

function PopupCheckPet:_onButtonClose()
	self:close()
end

function PopupCheckPet:_onButtonOK()
	self:close()
end

function PopupCheckPet:_updateInfo()
	local trainFoodData = self._parentView:getPetData()
	local desValue = PopupCheckPetHelper.getTotalDesInfo(self._fromType, trainFoodData)
	for i = 1, 2 do
		local info = desValue[i]
		if info then
			self["_nodeDes"..i]:updateUI(info.des, info.value)
			self["_nodeDes"..i]:setDesColor(info.colorDes)
			self["_nodeDes"..i]:setValueColor(info.colorValue)
			self["_nodeDes"..i]:setVisible(true)
		else
			self["_nodeDes"..i]:setVisible(false)
		end
	end

	local len = self._parentView:getPetCount()
	local max = self._maxCount
	self._nodeCount:updateUI(Lang.get("hero_check_count_des"), len, max)
	self._nodeCount:setDesColor(Colors.BRIGHT_BG_TWO)
	self._nodeCount:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeCount:setMaxColor(Colors.BRIGHT_BG_ONE)
end


return PopupCheckPet
