
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HomelandPrayHandbookCell = class("HomelandPrayHandbookCell", ListViewCellBase)
local HomelandPrayHandbookNode = require("app.scene.view.homeland.HomelandPrayHandbookNode")

function HomelandPrayHandbookCell:ctor()
	local resource = {
		file = Path.getCSB("HomelandPrayHandbookCell", "homeland"),
		binding = {
			
		}
	}
	HomelandPrayHandbookCell.super.ctor(self, resource)
end

function HomelandPrayHandbookCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	for i = 1, 4 do
		self["_buff"..i] = HomelandPrayHandbookNode.new(self["_node"..i])
	end
end

function HomelandPrayHandbookCell:update(data1, data2, data3, data4)
    local function updateCell(data, index)
        if data then
            self["_node"..index]:setVisible(true)
            self["_buff"..index]:updateUI(data)
        else
            self["_node"..index]:setVisible(false)
        end
    end
    updateCell(data1, 1)
    updateCell(data2, 2)
    updateCell(data3, 3)
    updateCell(data4, 4)
end

return HomelandPrayHandbookCell