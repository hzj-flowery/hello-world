
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildReceiveRecordItemCell = class("GuildReceiveRecordItemCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst =  require("app.const.DataConst")

function GuildReceiveRecordItemCell:ctor()
    self._resourceNode = nil
    self._textName = nil
    self._imageBest = nil
    self._resInfo = nil
	local resource = {
		file = Path.getCSB("GuildReceiveRecordItemCell", "guild"),
		binding = {
		}
	}
	GuildReceiveRecordItemCell.super.ctor(self, resource)
end

function GuildReceiveRecordItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end


function GuildReceiveRecordItemCell:update(data)
	self._data = data
    local money = data:getGet_money()
    local userName = data:getUser_name()
    local showBestImg = data:isIs_best()
    self._textName:setString(userName)
    self._imageBest:setVisible(showBestImg)
    self._resInfo:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND,money)
    self._resInfo:setTextColor(Colors.BRIGHT_BG_ONE)
    self._resInfo:setTextCountSize(24)
    self._resInfo:showResName(false)
end

return GuildReceiveRecordItemCell