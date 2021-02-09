
-- Author: zhanglinsen
-- Date:2018-09-07 16:41:20
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupGroupsSelectedCell = class("PopupGroupsSelectedCell", ListViewCellBase)
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")


function PopupGroupsSelectedCell:ctor()
	self._checkView = nil  --CommonCheckBoxAnymoreHint
	self._resourceNode = nil  

	self._textNoShow = nil
	self._checkBox = nil

	local resource = {
		file = Path.getCSB("PopupGroupsSelectedCell", "groups"),

	}
	PopupGroupsSelectedCell.super.ctor(self, resource)
end

function PopupGroupsSelectedCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._textNoShow = ccui.Helper:seekNodeByName(self._checkView, "TextNoShow")
	self._checkBox = ccui.Helper:seekNodeByName(self._checkView, "CheckBox")

	self._textNoShow:setColor(Colors.uiColors.BROWN)

	self._checkBox:setSelected(false)
	self._checkBox:addEventListener(handler(self, self._onCheckBoxClicked))
end


function PopupGroupsSelectedCell:_onCheckBoxClicked(sender)
	local selected = self._checkBox:isSelected()
	if selected == self._data.isSelected then 
		return 
	end
	self:dispatchCustomCallback(self,selected)
end

function PopupGroupsSelectedCell:updateUI(targetData)
	self._data = targetData
	self._textNoShow:setString(targetData.name)
	self._checkBox:setSelected(targetData.isSelected)
end

return PopupGroupsSelectedCell