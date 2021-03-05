-- 选择武将 通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupChooseHero = class("PopupChooseHero", PopupBase)
local PopupChooseHeroCell = require("app.ui.PopupChooseHeroCell")
local PopupChooseHeroHelper = require("app.ui.PopupChooseHeroHelper")

--------------------------------------------------------------------------------
function PopupChooseHero:ctor()
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupChooseHero", "common"),
		binding = {

		}
	}
	self:setName("PopupChooseHero")
	PopupChooseHero.super.ctor(self, resource)
end

function PopupChooseHero:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChooseHero:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
end

function PopupChooseHero:onEnter()
	
end

function PopupChooseHero:onExit()
	
end

function PopupChooseHero:onShowFinish()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
end

function PopupChooseHero:updateUI(fromType, callBack, ...)
	self._fromType = fromType
	self._callBack = callBack
	self._param = {...}

	local helpFunc = PopupChooseHeroHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._herosData = helpFunc(self._param)
	end
	assert(self._herosData, "self._herosData can not be null")
	self._count = math.ceil(#self._herosData / 2)
	self._listView:setTemplate(PopupChooseHeroCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupChooseHero:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._herosData[index + 1] then
		local herodata = self._herosData[index + 1]
		data1 = PopupChooseHeroHelper.addHeroDataDesc(herodata, self._fromType, index, 1)
	end

	if self._herosData[index + 2] then
		local herodata = self._herosData[index + 2]
		data2 = PopupChooseHeroHelper.addHeroDataDesc(herodata, self._fromType, index, 2)
	end

	item:update(data1, data2)
end

function PopupChooseHero:_onItemSelected(item, index)
	
end

function PopupChooseHero:_onItemTouch(index, t)
	local heroData = self._herosData[index * 2 + t]
	local heroId = heroData:getId()

	if self._callBack then
		self._callBack(heroId, self._param, heroData)
	end

	self:close()
end

function PopupChooseHero:_onButtonClose()
	self:close()
end

return PopupChooseHero