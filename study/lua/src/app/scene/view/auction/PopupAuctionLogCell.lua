
-- Author: hedili
-- Date:2017-10-11 20:47:43
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupAuctionLogCell = class("PopupAuctionLogCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

function PopupAuctionLogCell:ctor()

	--csb bind var name
	self._textTime = nil  --Text
	self._textItemName = nil  --Text
	self._comItemPrice = nil  --CommonResourceInfo
	self._textPayDesc = nil  --Text
	self._panelBase = nil  --Panel
	self._imageBG = nil  --ImageView

	local resource = {
		file = Path.getCSB("PopupAuctionLogCell", "auction"),

	}
	PopupAuctionLogCell.super.ctor(self, resource)
end

function PopupAuctionLogCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function PopupAuctionLogCell:updateUI(index, data)
	-- body
	self._cellValue = data
	--dump(data)

	local passTimeStr = self:getDHMS(data.deal_time)
	self._textTime:setString(passTimeStr)

	local item = data.item
    local itemParams = TypeConvertHelper.convert(item.type, item.value, item.size)
    if itemParams == nil then
        return
    end

	self._textItemName:setString(itemParams.name)
	self._textItemName:setColor(itemParams.icon_color)
	
    if itemParams.cfg.color == 7 then    -- 金色物品加描边
        self._textItemName:enableOutline(itemParams.icon_color_outline, 2)
    else
        self._textItemName:disableEffect(cc.LabelEffect.OUTLINE)
    end


	--竞拍价
	self._comItemPrice:setVisible(false)
	self._textPayDesc:setString(Lang.get("auction_log_des"..data.price_type))
	if data.price_type == 1 or data.price_type == 2 then
		local currPrice = data.price
		self._comItemPrice:setVisible(true)
		if data.money_type and data.money_type==1 then
			self._comItemPrice:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2, currPrice)
		else
			self._comItemPrice:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, currPrice)
		end
		self._textPayDesc:setAnchorPoint(cc.p(0, 0.5))
		self._textPayDesc:setPositionX(407)
	else
		self._textPayDesc:setAnchorPoint(cc.p(0.5, 0.5))
		self._textPayDesc:setPositionX(500)
	end


	if index % 2 == 1 then
		self:updateImageView("_imageBG", { visible = true, texture = Path.getCommonImage("img_com_board_list01a") })
	elseif index % 2 == 0 then
		self:updateImageView("_imageBG", { visible = true, texture = Path.getCommonImage("img_com_board_list01b")})
	end
end

--根据时间获取描述内容
function PopupAuctionLogCell:getDHMS(t)
    --需要根据时区计算
    local localdate = os.date('*t',t)
	local localdate2 = os.date('*t', G_ServerTime:getTime() )
	if localdate.day ~= localdate2.day then
		return  string.format(Lang.get("auction_layday_DHMS"), localdate.hour, localdate.min)
	end
	return string.format(Lang.get("auction_today_DHMS"), localdate.hour, localdate.min)
end
return PopupAuctionLogCell
