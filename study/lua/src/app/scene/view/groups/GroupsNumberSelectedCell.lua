
-- Author: zhanglinsen
-- Date:2018-10-17 11:09:51
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local GroupsNumberSelectedCell = class("GroupsNumberSelectedCell", ListViewCellBase)

function GroupsNumberSelectedCell:ctor()
	self._textNum = nil  --Text

	local resource = {
		file = Path.getCSB("GroupsNumberSelectedCell", "groups"),

	}
	GroupsNumberSelectedCell.super.ctor(self, resource)
end

function GroupsNumberSelectedCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function GroupsNumberSelectedCell:updateUI(data)
	self._data = data
	self._textNum:setString(data)
end

function GroupsNumberSelectedCell:getData()
	return self._data
end

-- local State = {
--     normal = {alpha=1.0,fontSize=30},        -- 正常 normal
--     state1 = {alpha=0.8,fontSize=26},        -- 缩放状态 1
--     state2 = {alpha=0.7,fontSize=24},        -- 缩放状态 2
--     state3 = {alpha=0.6,fontSize=22},        -- 缩放状态 3
--     state4 = {alpha=0.5,fontSize=20},        -- 缩放状态 4
-- }
function GroupsNumberSelectedCell:updateState(stateData)
	if not stateData then 
		return 
	end
	self._textNum:setOpacity( stateData.alpha * 255 )
	self._textNum:setFontSize( stateData.fontSize )
end

return GroupsNumberSelectedCell