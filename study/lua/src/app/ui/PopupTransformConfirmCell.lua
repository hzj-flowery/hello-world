local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupTransformConfirmCell = class("PopupTransformConfirmCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function PopupTransformConfirmCell:ctor()
	local resource = {
		file = Path.getCSB("PopupTransformConfirmCell", "common"),
		binding = {
			_buttonOk = {
				events = {{event = "touch", method = "_onClickButtonOk"}}
			},
		}
	}
	PopupTransformConfirmCell.super.ctor(self, resource)
end

function PopupTransformConfirmCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	
	self._buttonOk:setString(Lang.get("common_btn_exchange"))
end

-- info = {
-- 	data1,
-- 	data2,
-- 	shopId,
-- 	goodId,
-- }
function PopupTransformConfirmCell:update(info)
	local data1 = info.data1
	local data2 = info.data2
	local shopId = info.shopId
	local goodId = info.goodId
	local param1 = TypeConvertHelper.convert(data1.type, data1.value)
	local param2 = TypeConvertHelper.convert(data2.type, data2.value)

	self._icon1:initUI(data1.type, data1.value, data1.size)
	self._textName1:setString(param1.name)
	self._textName1:setColor(param1.icon_color)

	self._icon2:initUI(data2.type, data2.value, data2.size)
	self._textName2:setString(param2.name)
	self._textName2:setColor(param2.icon_color)
end

function PopupTransformConfirmCell:_onClickButtonOk()
	self:dispatchCustomCallback(1)
end

return PopupTransformConfirmCell