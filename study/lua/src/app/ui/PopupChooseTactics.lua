--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法装配选择界面
local PopupBase = require("app.ui.PopupBase")
local PopupChooseTactics = class("PopupChooseTactics", PopupBase)
local PopupChooseTacticsCell = require("app.ui.PopupChooseTacticsCell")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupChooseTactics:ctor()
	self._commonNodeBk = nil --弹框背景
	local resource = {
		file = Path.getCSB("PopupChooseTactics", "common"),
		binding = {
			
		}
	}
	PopupChooseTactics.super.ctor(self, resource)
end

function PopupChooseTactics:onCreate()
	self._callBack = nil
	self._tacticsIds = {}
	self._commonNodeBk:addCloseEventListener(handler(self, self._onButtonClose))
end

function PopupChooseTactics:onEnter()
	if self._callBack then
		self:refresh()
	end
end

function PopupChooseTactics:onExit()
	
end

function PopupChooseTactics:setTitle(title)
	self._commonNodeBk:setTitle(title)
end

function PopupChooseTactics:refresh()
	self:updateUI(self._pos, self._slot, self._callBack)
end

function PopupChooseTactics:updateUI(pos, slot, callBack)
    self._pos = pos
    self._slot = slot
    self._callBack = callBack
    self._tacticsIds = G_UserData:getTactics():getTacticsListByPos(pos, slot)


	self._count = math.ceil(#self._tacticsIds / 3)

	if self._count==0 then
		self._listView:setVisible(false)
		local emptyType = TypeConvertHelper.TYPE_TACTICS
		self._fileNodeEmpty:updateView(emptyType)
		self._fileNodeEmpty:setButtonString(Lang.get("tactics_choose_empty_button"))
		self._fileNodeEmpty:setVisible(true)
	else
		self._listView:setVisible(true)
		self._listView:setTemplate(PopupChooseTacticsCell)
		self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		self._listView:setCustomCallback(handler(self, self._onItemTouch))
		self._listView:resize(self._count)
		self._fileNodeEmpty:setVisible(false)
	end
end

function PopupChooseTactics:_onItemUpdate(item, index)
    local index = index * 3
    local dataList = {}

    for i=1,3 do
        local tacticsId = self._tacticsIds[index + i]
        dataList[i] = tacticsId
    end

	item:update(self._pos, self._slot, dataList, true)
end

function PopupChooseTactics:_onItemSelected(item, index)
	
end

function PopupChooseTactics:_onItemTouch(index, t)
	local tacticsId = self._tacticsIds[index * 3 + t]

	if self._callBack then
		self._callBack(tacticsId)
	end

	self:close()
end

function PopupChooseTactics:_onButtonClose()
	self:close()
end

return PopupChooseTactics