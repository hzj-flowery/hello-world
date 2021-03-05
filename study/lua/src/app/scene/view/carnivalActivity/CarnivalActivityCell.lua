
-- Author: nieming
-- Date:2018-01-12 18:10:10
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local CarnivalActivityCell = class("CarnivalActivityCell", ListViewCellBase)


function CarnivalActivityCell:ctor()

	--csb bind var name
	self._commonActivityCell = nil  --

	local resource = {
		file = Path.getCSB("CarnivalActivityCell", "carnivalActivity"),

	}
	CarnivalActivityCell.super.ctor(self, resource)
end

function CarnivalActivityCell:onCreate()
	-- body
	local size = self._commonActivityCell:getContentSize()
	self:setContentSize(size.width, size.height)

end

function CarnivalActivityCell:updateUI(activityData)
	-- body
	self._commonActivityCell:updateUI(activityData, handler(self, self.dispatchCustomCallback))
end



return CarnivalActivityCell
