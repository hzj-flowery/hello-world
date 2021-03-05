
-- Author: hedili
-- Date:2018-05-08 14:00:07
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupHomelandMaterialIcon = class("PopupHomelandMaterialIcon", ListViewCellBase)
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")


function PopupHomelandMaterialIcon:ctor(data,index)
	--csb bind var name
	self._data = data
	self._index = index
	local resource = {
		file = Path.getCSB("PopupHomelandMaterialIcon", "homeland"),
		binding = {

		},
	}
	PopupHomelandMaterialIcon.super.ctor(self, resource)
end

function PopupHomelandMaterialIcon:onCreate()

	self:_updateData()

	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	if self._index == 1 then
		self._imageArrow:setVisible(false)
	else
		self._imageArrow:setVisible(true)
	end

	self:setAnchorPoint(cc.p(0,0))
end


function PopupHomelandMaterialIcon:_updateData( ... )
	-- body
	if self._data == nil then
		return
	end

	for i= 1, 3 do 
		self["_item"..i]:setVisible(false)
	end

	self._textLevel:setString(self._data.lv)

	if #self._data.list == 1 then
		local updateIcon = self["_item3"]
		local value = self._data.list[1]
		if updateIcon then
			updateIcon:unInitUI()
			updateIcon:setVisible(true)
			updateIcon:initUI(value.type, value.value, value.size)
		end
	else
		for i, value in ipairs(self._data.list) do
			local updateIcon = self["_item"..i]
			if updateIcon then
				updateIcon:unInitUI()
				updateIcon:setVisible(true)
				updateIcon:initUI(value.type, value.value, value.size)
			end
		end
	end

end

return PopupHomelandMaterialIcon