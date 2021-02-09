
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupChooseHistoryHeroCell = class("PopupChooseHistoryHeroCell", ListViewCellBase)

function PopupChooseHistoryHeroCell:ctor()
	local resource = {
		file = Path.getCSB("PopupChooseHistoryHeroCell", "common"),
		binding = {
			_buttonChoose1 = {
				events = {{event = "touch", method = "_onButtonClicked1"}}
			},
			_buttonChoose2 = {
				events = {{event = "touch", method = "_onButtonClicked2"}}
			},
		}
	}
	PopupChooseHistoryHeroCell.super.ctor(self, resource)
end

function PopupChooseHistoryHeroCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	
end

function PopupChooseHistoryHeroCell:update(data1, data2)

	local function updateCell(index, data)

		if data then
			local TypeConvertHelper = require("app.utils.TypeConvertHelper")
			local type = TypeConvertHelper.TYPE_HISTORY_HERO

			local baseId = data:getBase_id()
			self["_item"..index]:setVisible(true)
			self["_item"..index]:updateUI(type,baseId)
			local commonIcon = self["_item"..index]:getCommonIcon()

			if data.topImagePath and data.topImagePath ~="" then
				commonIcon:setTopImage(data.topImagePath)
			end

			local params = commonIcon:getItemParams()
			
			self["_item"..index]:setName(params.name)


			self["_buttonChoose"..index]:setString(data.btnDesc)
			if data.btnIsHightLight == false then
				self["_buttonChoose"..index]:switchToNormal()
			else
				self["_buttonChoose"..index]:switchToHightLight()
			end
			
			self["_buttonChoose"..index]:setEnabled(data.btnEnable)
			self["_buttonChoose"..index]:showRedPoint(data.btnShowRP)
		else
			self["_item"..index]:setVisible(false)
		end
	end

	updateCell(1, data1)
	updateCell(2, data2)
end

function PopupChooseHistoryHeroCell:_onButtonClicked1()
	self:dispatchCustomCallback(1)
end

function PopupChooseHistoryHeroCell:_onButtonClicked2()
	self:dispatchCustomCallback(2)
end

return PopupChooseHistoryHeroCell
