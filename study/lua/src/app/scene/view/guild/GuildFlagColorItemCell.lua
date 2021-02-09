
-- Author: 
-- Date:2018-04-19 16:37:43
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildFlagColorItemCell = class("GuildFlagColorItemCell", ListViewCellBase)
local ShaderHelper = require("app.utils.ShaderHelper")
local PopUpGuildFlagSettingHelper = require("app.scene.view.guild.PopupGuildFlagSettingHelper")

function GuildFlagColorItemCell:ctor()
	self._imageColor = nil
	self._imageSelect = nil
	self._resourceNode = nil

	self._selectCallback = nil
	self._index = 0

	local resource = {
		file = Path.getCSB("GuildFlagColorItemCell", "guild"),
	
		binding = {
			_imageColor1 = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
			},
			_imageColor2 = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
            },
            _imageColor3 = {
                events = {{event = "touch", method = "_onTouchCallBack"}}
            },
		}
	}
	GuildFlagColorItemCell.super.ctor(self, resource)
end

function GuildFlagColorItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._flag1:setVisible(false)
	self._flag2:setVisible(false)
	self._flag3:setVisible(false)
end

function GuildFlagColorItemCell:updateUI(index, dataList, selectCallback)
	self._index = index

	if dataList == nil then
		return
	end

	for i = 1, 3 do
		local localIndex = (index - 1) * 3 + i
		local data = dataList[localIndex]

		if data then
			self["_flag"..i]:setVisible(true)

			if data.cfg.id == PopUpGuildFlagSettingHelper.getCurrentTouchIndex() then
				self["_imageSelect"..i]:setVisible(true)
			else
				self["_imageSelect"..i]:setVisible(false)
			end

			--self["_imageMask"..i]:setVisible(not data.isUnLock)
			--ShaderHelper.filterNode(self["_imageColor"..i], "color", not data.isUnLock)
			if not data.isUnLock then
				self["_imageColor"..i]:setColor(cc.c3b(100, 100, 100))
			else
				self["_imageColor"..i]:setColor(cc.c3b(255, 255, 255))
			end

			self["_imageColor"..i]:setTag(data.cfg.id)
			self["_imageColor"..i]:loadTexture(Path.getGuildRes(data.cfg.origin_res))
			self["_imageColor"..i]:ignoreContentAdaptWithSize(true)
			self["_imageColor"..i]:setSwallowTouches(false)
		else
			self["_flag"..i]:setVisible(false)
		end
	end
end

function GuildFlagColorItemCell:setSelect(select, localIndex)
	if self["_imageSelect"..localIndex] then
		self["_imageSelect"..localIndex]:setVisible(select)
	end
end

function GuildFlagColorItemCell:_onTouchCallBack( sender, param )
    PopUpGuildFlagSettingHelper.setCurrentTouchIndex(tonumber(sender:getTag()))

	print(sender:getTag())
    if self._callBack then 
        self._callBack(tonumber(sender:getTag()))
    end
end

function GuildFlagColorItemCell:setItemTouchCallBack( callback )
    if callback then 
        self._callBack = callback
    end
end

return GuildFlagColorItemCell