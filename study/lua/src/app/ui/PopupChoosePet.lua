-- 选择神兽 通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupChoosePet = class("PopupChoosePet", PopupBase)
local PopupChoosePetCell = require("app.ui.PopupChoosePetCell")
local PopupChoosePetHelper = require("app.ui.PopupChoosePetHelper")

--------------------------------------------------------------------------------
function PopupChoosePet:ctor()
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupChoosePet", "common"),
		binding = {

		}
	}
	self:setName("PopupChoosePet")
	PopupChoosePet.super.ctor(self, resource)
end

function PopupChoosePet:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChoosePet:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
end

function PopupChoosePet:onEnter()
	
end

function PopupChoosePet:onExit()
	
end

function PopupChoosePet:onShowFinish()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
end

function PopupChoosePet:updateUI(fromType, callBack, ...)
	self._fromType = fromType
	self._callBack = callBack
	self._param = {...}

	local helpFunc = PopupChoosePetHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._petListData = helpFunc(self._param)
	end
	assert(self._petListData, "self._petListData can not be null")
	self._count = math.ceil(#self._petListData / 2)
	self._listView:setTemplate(PopupChoosePetCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupChoosePet:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._petListData[index + 1] then
		local petData = self._petListData[index + 1]
		data1 = PopupChoosePetHelper.addPetDataDesc(petData, self._fromType, index, 1)
	end

	if self._petListData[index + 2] then
		local petData = self._petListData[index + 2]
		data2 = PopupChoosePetHelper.addPetDataDesc(petData, self._fromType, index, 2)
	end

	item:update(data1, data2)
end

function PopupChoosePet:_onItemSelected(item, index)
	
end

function PopupChoosePet:_onItemTouch(index, t)
	local petData = self._petListData[index * 2 + t]
	local petId = petData:getId()

	if self._callBack then
		self._callBack(petId, self._param, petData)
	end

	self:close()
end

function PopupChoosePet:_onButtonClose()
	self:close()
end

return PopupChoosePet