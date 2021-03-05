--
-- Author: Liangxu
-- Date: 2017-07-15 15:34:05
-- 复选武将通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupCheckHero = class("PopupCheckHero", PopupBase)
local PopupCheckHeroCell = require("app.ui.PopupCheckHeroCell")
local PopupCheckHeroHelper = require("app.ui.PopupCheckHeroHelper")

local TITLE = {
	[1] = "hero_check_title_1",
	[2] = "hero_check_title_2",
}

function PopupCheckHero:ctor(parentView)
	self._parentView = parentView
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupCheckHero", "common"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onButtonOK"}}
			},
		}
	}
	self:setName("PopupCheckHero")
	PopupCheckHero.super.ctor(self, resource)
end

function PopupCheckHero:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._buttonOk:setString(Lang.get("hero_upgrade_btn_Ok"))
	for i = 1, 2 do
		self["_nodeDes"..i]:setFontSize(20)
	end
	self._nodeCount:setFontSize(20)
end

function PopupCheckHero:onEnter()
	self:_updateInfo()
end

function PopupCheckHero:onClose()
	if self._clickOk then
		self._clickOk()
	end
end

function PopupCheckHero:onExit()

end
function PopupCheckHero:onShowFinish()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
end
function PopupCheckHero:updateUI(fromType, clickOk)
	self._fromType = fromType
	self._clickOk = clickOk

	self._maxCount = PopupCheckHeroHelper.getMaxCount(fromType)
	self._commonNodeBk:setTitle(Lang.get(TITLE[fromType]))

	local helpFunc = PopupCheckHeroHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		self._herosData = helpFunc()
	end
	assert(self._herosData, "self._herosData can not be null")
	self._count = math.ceil(#self._herosData / 2)
	self._listView:setTemplate(PopupCheckHeroCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self._listView:resize(self._count)
end

function PopupCheckHero:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2, isAdded1, isAdded2 = nil

	if self._herosData[index + 1] then
		local herodata = self._herosData[index + 1]
		data1 = PopupCheckHeroHelper.addHeroDataDesc(herodata, self._fromType)
		isAdded1 = self._parentView:checkIsAdded(data1)
	end

	if self._herosData[index + 2] then
		local herodata = self._herosData[index + 2]
		data2 = PopupCheckHeroHelper.addHeroDataDesc(herodata, self._fromType)
		isAdded2 = self._parentView:checkIsAdded(data2)
	end

	item:update(data1, data2, isAdded1, isAdded2)
end

function PopupCheckHero:_onItemSelected(item, index)

end

function PopupCheckHero:_onItemTouch(index, t, selected, item)
	if selected and self._parentView:checkIsMaxCount() then
		G_Prompt:showTip(Lang.get("hero_upgrade_food_max_tip"))
		item:setCheckBoxSelected(t, false)
		return
	end

	local heroData = self._herosData[index * 2 + t]
	if selected then
		for i = 1, self._maxCount do
			if self._parentView:getHeroWithIndex(i) == nil then
				self._parentView:insertHero(i, heroData)
				break
			end
		end
	else
		self._parentView:deleteHeroWithHeroId(heroData:getId())
	end

	self:_updateInfo()
end

function PopupCheckHero:_onButtonClose()
	self:close()
end

function PopupCheckHero:_onButtonOK()
	self:close()
end

function PopupCheckHero:_updateInfo()
	local trainFoodData = self._parentView:getHeroData()
	local desValue = PopupCheckHeroHelper.getTotalDesInfo(self._fromType, trainFoodData)
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

	local len = self._parentView:getHeroCount()
	local max = self._maxCount
	self._nodeCount:updateUI(Lang.get("hero_check_count_des"), len, max)
	self._nodeCount:setDesColor(Colors.BRIGHT_BG_TWO)
	self._nodeCount:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeCount:setMaxColor(Colors.BRIGHT_BG_ONE)
end


return PopupCheckHero
