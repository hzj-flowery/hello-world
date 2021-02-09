--
-- Author: Liangxu
-- Date: 2017-04-28 15:05:05
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local RecoveryPreviewCell = class("RecoveryPreviewCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function RecoveryPreviewCell:ctor()
	local resource = {
		file = Path.getCSB("RecoveryPreviewCell", "recovery"),
		binding = {
			
		}
	}
	RecoveryPreviewCell.super.ctor(self, resource)
end

function RecoveryPreviewCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function RecoveryPreviewCell:update(data1, data2, data3, data4)
	local function updateCell(index, data)
		if data then
			self["_itemInfo"..index]:setVisible(true)
			self["_itemInfo"..index]:updateUI(data.type, data.value, data.size)
		else
			self["_itemInfo"..index]:setVisible(false)
		end
	end
	
	updateCell(1, data1)
	updateCell(2, data2)
	updateCell(3, data3)
	updateCell(4, data4)
end

return RecoveryPreviewCell