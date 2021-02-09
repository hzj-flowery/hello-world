
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupAwakePreviewCell = class("PopupAwakePreviewCell", ListViewCellBase)
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local PopupItemGuider = require("app.ui.PopupItemGuider")

function PopupAwakePreviewCell:ctor()
	local resource = {
		file = Path.getCSB("PopupAwakePreviewCell", "hero"),
		binding = {
			
		}
	}
	PopupAwakePreviewCell.super.ctor(self, resource)
end

function PopupAwakePreviewCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._nodeTitle:setFontSize(24)
	for i = 1, 4 do
		self["_icon"..i]:setCallBack(handler(self, self._onClick))
		self["_icon"..i]:setTouchEnabled(true)
	end
end

function PopupAwakePreviewCell:update(data)
	local function updateItem(index, item)
		if item then
			self["_icon"..index]:setVisible(true)
			self["_icon"..index]:updateUI(item.value, item.size)
			local ownCount = HeroDataHelper.getOwnCountOfAwakeGemstone(item.type, item.value)
			self["_textCount"..index]:setString(ownCount)
			local needCount = item.size
			if ownCount >= needCount then
				self["_icon"..index]:setIconMask(false)
			else
				self["_icon"..index]:setIconMask(true)
			end
		else
			self["_icon"..index]:setVisible(false)
		end
	end
	
	local awakeStar, awakeLevel = HeroDataHelper.convertAwakeLevel(data.level)
	local strLevel = Lang.get("hero_awake_star_level", {star = awakeStar, level = awakeLevel})
	self._nodeTitle:setTitle(strLevel)
	local items = data.items
	for i, item in ipairs(items) do
		updateItem(i, item)
	end
end

function PopupAwakePreviewCell:_onClick(sender, itemParams)
	local popup = PopupItemGuider.new()
	popup:updateUI(itemParams.item_type, itemParams.cfg.id)
	popup:openWithAction()
end

return PopupAwakePreviewCell