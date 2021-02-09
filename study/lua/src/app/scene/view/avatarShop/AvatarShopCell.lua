--
-- Author: Liangxu
-- Date: 2018-4-27 11:04:02
-- 变身卡商店cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local AvatarShopCell = class("AvatarShopCell", ListViewCellBase)
local AvatarShopCellNode = require("app.scene.view.avatarShop.AvatarShopCellNode")

function AvatarShopCell:ctor()
	local resource = {
		file = Path.getCSB("AvatarShopCell", "avatarShop"),
		binding = {
			
		}
	}
	AvatarShopCell.super.ctor(self, resource)
end

function AvatarShopCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	for i = 1, 5 do
		self["_node"..i] = AvatarShopCellNode.new(self["_item"..i], handler(self, self._onClickButton), i)
	end
end

function AvatarShopCell:update(datas)
	local function updateNode(index, goodId)
		if goodId then
			self["_item"..index]:setVisible(true)
			self["_node"..index]:updateUI(goodId)
		else
			self["_item"..index]:setVisible(false)
		end
	end

	for i = 1, 5 do
		local goodId = datas[i]
		updateNode(i, goodId)
	end
end

function AvatarShopCell:_onClickButton(index)
	self:dispatchCustomCallback(index)
end

return AvatarShopCell