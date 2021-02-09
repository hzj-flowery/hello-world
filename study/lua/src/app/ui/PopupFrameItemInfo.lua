-- 头像框点击弹出页
local PopupBase = require("app.ui.PopupBase")
local PopupFrameItemInfo = class("PopupFrameItemInfo", PopupBase)
local Path = require("app.utils.Path")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper	= require("app.utils.UserDataHelper")

function PopupFrameItemInfo:ctor(title, callback )
	--
	self._title = title or Lang.get("common_title_item_info")
	self._callback = callback
	self._itemId = nil
	self._useNum = 1
	--control init
	self._btnOk = nil --
	self._itemName = nil -- 物品名称
	self._itemDesc = nil -- 物品描述
	self._itemIcon = nil -- CommonItemIcon

	local resource = {
		file = Path.getCSB("PopupFrameItemInfo", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onBtnOk"}}
			}
		}
	}
	PopupFrameItemInfo.super.ctor(self, resource, true)
end

--
function PopupFrameItemInfo:onCreate()
	-- button
	self._btnOk:setString(Lang.get("common_btn_sure"))

	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonNodeBk:setTitle(self._title)
	self._commonNodeBk:hideCloseBtn()

end



function PopupFrameItemInfo:updateUI(itemId )
	assert(itemId, "PopupFrameItemInfo's itemId can't be empty!!!")
	self._itemIcon:setTouchEnabled(false)
	self._itemIcon:updateUI(itemId,0.9)

	local itemParams = self._itemIcon:getItemParams()
	self._itemName:setString(itemParams.name)
	self._itemName:setColor(itemParams.icon_color)

	if itemParams.cfg.color == 7 then
		self._itemName:enableOutline(itemParams.icon_color_outline, 2)
	end

	self._itemDesc:setString(itemParams.cfg.des)

	self._itemId = itemId
end



function PopupFrameItemInfo:_onInit()
end


function PopupFrameItemInfo:onEnter()

end

function PopupFrameItemInfo:onExit()

end

--
function PopupFrameItemInfo:onBtnOk()
	local isBreak = nil
	if self._callback then
		isBreak = self._callback(self._itemId)
	end
	if not isBreak then
		self:close()
	end
end


function PopupFrameItemInfo:onBtnCancel()
	self:close()
end


return PopupFrameItemInfo
