--
-- Author: Liangxu
-- Date: 2017-07-07 16:17:44
-- 选择宝物 通用界面
local PopupBase = require("app.ui.PopupBase")
local PopupChooseTreasure2 = class("PopupChooseTreasure2", PopupBase)
local PopupChooseTreasureCell = require("app.ui.PopupChooseTreasureCell")
local PopupChooseTreasureHelper = require("app.ui.PopupChooseTreasureHelper")

function PopupChooseTreasure2:ctor()
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupChooseTreasure2", "common"),
		binding = {
			
		}
	}
	self:setName("PopupChooseTreasure2")
	PopupChooseTreasure2.super.ctor(self, resource)
end

function PopupChooseTreasure2:onCreate()
	self._hideWear = G_UserData:getUserSetting():getHideWearTreasure()
	self._fromType = nil
	self._callBack = nil
	self._treasureDatas = {}
	self._totalDatas = {} --全体数据
	self._noWearDatas = {} --未穿戴的数据
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
	self._checkBox:addEventListener(handler(self, self._onCheckBoxClicked))
	self._checkBox:setSelected(self._hideWear)
	self._textTip:setString(Lang.get("treasure_hide_tip"))

	self._listView:setTemplate(PopupChooseTreasureCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupChooseTreasure2:onEnter()
	
end

function PopupChooseTreasure2:onExit()
	
end

function PopupChooseTreasure2:onShowFinish()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
end

function PopupChooseTreasure2:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChooseTreasure2:updateUI(fromType, callBack, totalDatas, showRP, curTreasureUnitData, noWearDatas, pos)
	self._fromType = fromType
	self._callBack = callBack
	self._showRP = showRP
	self._totalDatas = totalDatas
	self._curTreasureUnitData = curTreasureUnitData
	self._noWearDatas = noWearDatas
	self._pos = pos

	self:_refreshList()
end

function PopupChooseTreasure2:_refreshList()
	local helpFunc = PopupChooseTreasureHelper["_FROM_TYPE"..self._fromType]
	if helpFunc and type(helpFunc) == "function" then
		if self._hideWear then
			self._treasureDatas = helpFunc(self._noWearDatas)
		else
			self._treasureDatas = helpFunc(self._totalDatas)
		end
		
	end
	assert(self._treasureDatas, "self._treasureDatas can not be null")

	self._listView:clearAll()
	self._count = math.ceil(#self._treasureDatas / 2)
	self._listView:resize(self._count)
end

function PopupChooseTreasure2:_onItemUpdate(item, index)
	local index = index * 2
	local data1, data2 = nil

	if self._treasureDatas[index + 1] then
		local treasureData = self._treasureDatas[index + 1]
		data1 = PopupChooseTreasureHelper.addTreasureDataDesc(treasureData, self._fromType, self._showRP, self._curTreasureUnitData, self._pos)
	end

	if self._treasureDatas[index + 2] then
		local treasureData = self._treasureDatas[index + 2]
		data2 = PopupChooseTreasureHelper.addTreasureDataDesc(treasureData, self._fromType, self._showRP, self._curTreasureUnitData, self._pos)
	end

	item:update(data1, data2)
end

function PopupChooseTreasure2:_onItemSelected(item, index)
	
end

function PopupChooseTreasure2:_onItemTouch(index, t)
	local unitData = self._treasureDatas[index * 2 + t]
	local treasureId = unitData:getId()

	if self._callBack then
		self._callBack(treasureId)
	end

	self:close()
end

function PopupChooseTreasure2:_onButtonClose()
	self:close()
end

function PopupChooseTreasure2:_onCheckBoxClicked(sender)
	self._hideWear = self._checkBox:isSelected()
	G_UserData:getUserSetting():setHideWearTreasure(self._hideWear)
	self:_refreshList()
end

return PopupChooseTreasure2