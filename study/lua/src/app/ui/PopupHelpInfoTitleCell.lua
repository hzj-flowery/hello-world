
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupHelpInfoTitleCell = class("PopupHelpInfoTitleCell", ListViewCellBase)

function PopupHelpInfoTitleCell:ctor()
    self._text = nil
	local resource = {
		file = Path.getCSB("PopupHelpInfoTitleCell", "common"),
	}
	PopupHelpInfoTitleCell.super.ctor(self, resource)
end

function PopupHelpInfoTitleCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end


function PopupHelpInfoTitleCell:updateUI(msg)
    local resourceNodeSize = self._resourceNode:getContentSize()
    local render = self._text:getVirtualRenderer()
    render:setMaxLineWidth(616)
    self._text:setString(msg)
    local size = render:getContentSize()
    self:setContentSize(resourceNodeSize.width,size.height)
    self._resourceNode:setPositionY(size.height-resourceNodeSize.height)
end



return PopupHelpInfoTitleCell