
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupHelpInfoCell = class("PopupHelpInfoCell", ListViewCellBase)

function PopupHelpInfoCell:ctor()
    self._text = nil
	local resource = {
		file = Path.getCSB("PopupHelpInfoCell", "common"),
	}
	PopupHelpInfoCell.super.ctor(self, resource)
end

function PopupHelpInfoCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end


function PopupHelpInfoCell:updateUI(msg,maxLine)
    local resourceNodeSize = self._resourceNode:getContentSize()
    local render = self._text:getVirtualRenderer()
    maxLine = maxLine or 616
    render:setMaxLineWidth(maxLine)
    self._text:setString(msg)
    local size = render:getContentSize()
    self:setContentSize(resourceNodeSize.width,size.height)
    self._resourceNode:setPositionY(size.height-resourceNodeSize.height)
end


return PopupHelpInfoCell