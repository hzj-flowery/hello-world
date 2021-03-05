local ListViewCellBase = require("app.ui.ListViewCellBase")
local UIDebugViewCell = class("UIDebugViewCell", ListViewCellBase)

local LOG_COLOR = {
    INTESITY_WHITE =1, --加强白色
    RED = 2,
    YELLOW = 3,
    GREEN = 4,
    BLUE = 5,
    PURPLE =6, --紫色
}

function UIDebugViewCell:ctor()

	local resource = {
		file = Path.getCSB("UIDebugViewCell", "uicontrol"),
	}

	UIDebugViewCell.super.ctor(self, resource)

end


function UIDebugViewCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end




function UIDebugViewCell:updateUI( index,  data )
    -- body

    local logType = data.logType
    local logStr = data.logStr

    
    if logStr ~= "" then
        self._textLog:setString(logStr)
    end
    if logType == LOG_COLOR.YELLOW then
        self._textLog:setColor(Colors.getColor(5))
    end
    if logType == LOG_COLOR.RED then
        self._textLog:setColor(Colors.getColor(6))
    end
    if logType == LOG_COLOR.PURPLE then
        self._textLog:setColor(Colors.getColor(4))
    end
    if logType == LOG_COLOR.BLUE then
        self._textLog:setColor(Colors.getColor(3))
    end
end



return UIDebugViewCell