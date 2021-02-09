--
-- Author: Liangxu
-- Date: 2017-05-09 15:42:31
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local TreasureDetailYokeNode = class("TreasureDetailYokeNode", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function TreasureDetailYokeNode:ctor()
	local resource = {
		file = Path.getCSB("TeamYokeConditionNode", "team"),
		binding = {

		}
	}
	TreasureDetailYokeNode.super.ctor(self, resource)
end

function TreasureDetailYokeNode:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function TreasureDetailYokeNode:setImageBgLength(length)
	local size = self._imageBg:getContentSize()
	self._imageBg:setContentSize(length, size.height)
end

function TreasureDetailYokeNode:updateView(info, heroId, isActivated)
	self._textName:setString(info.name)
	local color = isActivated and Colors.COLOR_ATTR_DES_ACTIVE or Colors.COLOR_ATTR_UNACTIVE
	self._textName:setColor(color)

	local heroIds = {heroId}
	for i = 1, 4 do
		local heroId = heroIds[i]
		if heroId then
			self["_fileNodeIcon"..i]:setVisible(true)
			self["_fileNodeIcon"..i]:initUI(TypeConvertHelper.TYPE_HERO, heroId)
			self["_fileNodeIcon"..i]:setIconMask(not isActivated)
		else
			self["_fileNodeIcon"..i]:setVisible(false)
		end
	end
end

return TreasureDetailYokeNode
