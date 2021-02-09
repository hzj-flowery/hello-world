--
-- 选择神兽cell 通用界面

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupChoosePetCell = class("PopupChoosePetCell", ListViewCellBase)



function PopupChoosePetCell:ctor()
	local resource = {
		file = Path.getCSB("PopupChoosePetCell", "common"),
		binding = {
			_buttonChoose1 = {
				events = {{event = "touch", method = "_onButtonClicked1"}}
			},
			_buttonChoose2 = {
				events = {{event = "touch", method = "_onButtonClicked2"}}
			},
		}
	}
	PopupChoosePetCell.super.ctor(self, resource)
end

function PopupChoosePetCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	--for i = 1, 2 do
	--	local render = self["_textDes"..i]:getVirtualRenderer()
	--	render:setLineHeight(24)
	--end
end

function PopupChoosePetCell:update(data1, data2)

	local function updateCell(index, data)

		if data then
			local TypeConvertHelper = require("app.utils.TypeConvertHelper")
			local type = TypeConvertHelper.TYPE_PET

			local baseId = data:getBase_id()
			self["_item"..index]:setVisible(true)
			self["_item"..index]:updateUI(type,baseId)
			local commonIcon = self["_item"..index]:getCommonIcon()

			if data.topImagePath and data.topImagePath ~="" then
				commonIcon:setTopImage(data.topImagePath)
			end

			local params = commonIcon:getItemParams()
			local starLevel = data:getStar()
			self["_item"..index]:setName(params.name)

			self["_nodeLevel"..index]:updateUI(Lang.get("pet_list_cell_level_des"), Lang.get("pet_txt_level", {level = data:getLevel()}))

			self["_nodeStar"..index]:setCount(starLevel)

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

function PopupChoosePetCell:_onButtonClicked1()
	self:dispatchCustomCallback(1)
end

function PopupChoosePetCell:_onButtonClicked2()
	self:dispatchCustomCallback(2)
end

return PopupChoosePetCell
