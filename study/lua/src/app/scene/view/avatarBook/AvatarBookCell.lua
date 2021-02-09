--
-- Author: Liangxu
-- Date: 2017-02-21 13:50:59
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local AvatarBookCell = class("AvatarBookCell", ListViewCellBase)
local AvatarBookDrawNode = require("app.scene.view.avatarBook.AvatarBookDrawNode")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local TextHelper = require("app.utils.TextHelper")

function AvatarBookCell:ctor()
	local resource = {
		file = Path.getCSB("AvatarBookCell", "avatar"),
		binding = {
			
		}
	}
	AvatarBookCell.super.ctor(self, resource)
end

function AvatarBookCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._draw1 = AvatarBookDrawNode.new(self._item1, handler(self, self._onClickActive1))
	self._draw2 = AvatarBookDrawNode.new(self._item2, handler(self, self._onClickActive2))
	self._draw3 = AvatarBookDrawNode.new(self._item3, handler(self, self._onClickActive3))
end

function AvatarBookCell:update(bookId1, bookId2, bookId3)
	local function updateCell(bookId, index)
		if bookId then
			self["_item"..index]:setVisible(true)
			self["_draw"..index]:updateUI(bookId)
		else
			self["_item"..index]:setVisible(false)
		end
	end
	
	updateCell(bookId1, 1)
	updateCell(bookId2, 2)
	updateCell(bookId3, 3)
end

function AvatarBookCell:_onClickActive1()
	self:dispatchCustomCallback(1)
end

function AvatarBookCell:_onClickActive2()
	self:dispatchCustomCallback(2)
end

function AvatarBookCell:_onClickActive3()
	self:dispatchCustomCallback(3)
end

return AvatarBookCell