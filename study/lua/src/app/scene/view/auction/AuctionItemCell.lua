--世界boss
local ListViewCellBase = require("app.ui.ListViewCellBase")
local AuctionItemCell = class("AuctionItemCell", ListViewCellBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

local AuctionConst = require("app.const.AuctionConst")
local TextHelper = require("app.utils.TextHelper")

function AuctionItemCell:ctor()
    --
    self._commonResInfo1 = nil  --CommonResourceInfo
	self._resourceNode = nil  --ImageView
	self._textTime = nil  --Text
	self._commonAddPrice = nil  --CommonButtonHighLight
	self._commonIcon = nil  --CommonIconTemplate
	self._commonResInfo2 = nil  --CommonResourceInfo
	self._textDesc = nil  --Text
	self._textItemName = nil  --Text
	self._commonBuy = nil  --CommonButtonNormal

    self._intervalTime = 0
    local resource = {
        file = Path.getCSB("AuctionItemCell", "auction"),
        binding = {
		}
    }
    AuctionItemCell.super.ctor(self, resource)
end


function AuctionItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
    self._commonBuy:updateButton("Button",handler(self,self._onButtonBuy),-500)
    self._commonAddPrice:updateButton("Button",handler(self,self._onButtonAddPrice),-500)
    self:scheduleUpdateWithPriorityLua(handler(self, self._updateTime),0)

    self._commonAddPrice:setString(Lang.get("auction_item_cell_button1"))
    self._commonBuy:setString(Lang.get("auction_item_cell_button2"))

    self._imageDesc:setVisible(false)
end


function AuctionItemCell:onEnter()
   
	
end

function AuctionItemCell:onExit()

end

function AuctionItemCell:updateUI( index, data )
    -- body
    if data == nil or data:getItem() == nil then
        return
    end
    local item = data:getItem()
    if item.type == 0 then
        return
    end

    self._cellValue = data
    local itemParams = TypeConvertHelper.convert(item.type, item.value, item.size)
    if itemParams == nil then
        return
    end
    local nowBuyer = data:getNow_buyer()

    --当前我出价最高
    if nowBuyer == G_UserData:getBase():getId() then
        --self._textDesc:setString(Lang.get("auction_buyer_desc2"))
      --  self._textDesc:setVisible(false)
        --self._imageDesc:setVisible(true)
        self:updateImageView("_imageDesc", { visible = true, texture = Path.getTextSignet("img_paimai02") })
    else
      --  self._textDesc:setString(Lang.get("auction_buyer_desc1"))
      --  self._textDesc:setVisible(true)
       self:updateImageView("_imageDesc", { visible = true, texture = Path.getTextSignet("img_paimai01") })
    end

    self._commonIcon:unInitUI()
    self._commonIcon:initUI(item.type, item.value, item.size)
    self._commonIcon:setImageTemplateVisible(true)
    self._commonIcon:setTouchEnabled(true)
    self._textItemName:setString(itemParams.name)
    self._textItemName:setColor(itemParams.icon_color)

    if itemParams.cfg.color == 7 then    -- 金色物品加描边
        self._textItemName:enableOutline(itemParams.icon_color_outline, 2)
    else
        self._textItemName:disableEffect(cc.LabelEffect.OUTLINE)
    end

    local currPrice = data:getNow_price() 
    if currPrice == 0 then
        currPrice = data:getInit_price()
        self:updateImageView("_imageDesc", { visible = false })
    end
    local moneyType = data:getMoney_type()
    local value
    if moneyType==0 then
        value = DataConst.RES_DIAMOND
    else
        value = DataConst.RES_JADE2
    end
    self._commonResInfo1:updateUI(TypeConvertHelper.TYPE_RESOURCE, value, currPrice)
    self._commonResInfo1:setTextColorToATypeColor()

    local finalPrice = data:getFinal_price()
    self._commonResInfo2:updateUI(TypeConvertHelper.TYPE_RESOURCE, value, finalPrice)
    self._commonResInfo2:setTextColorToATypeColor()
    self:_updateCellTime()
end

function AuctionItemCell:_updateCellTime()
    local data = self._cellValue
    local startTime = data:getStart_time()
    local endTime = data:getEnd_time()
    local timeLeft = G_ServerTime:getLeftSeconds(startTime)
    if timeLeft > 0 then
        local leftTimeStr = G_ServerTime:getLeftSecondsString(startTime)
        self._textTime:setString(leftTimeStr)
        self._textTime:setColor(Colors.SYSTEM_TARGET)
        self._textTimeDesc:setString(Lang.get("auction_cell1"))
    else
        local leftTimeStr = G_ServerTime:getLeftSecondsString(endTime)
        self._textTime:setString(leftTimeStr)
        self._textTime:setColor(Colors.SYSTEM_TARGET_RED)
        self._textTimeDesc:setString(Lang.get("auction_cell2"))
    end
end

function AuctionItemCell:_updateTime(dt)
	if self:isVisible() == false then
		return
	end


	self._intervalTime = self._intervalTime + dt 
	if self._intervalTime >  1.0 and self._cellValue then
        self:_updateCellTime()
		self._intervalTime = 0
	end
	
end

function AuctionItemCell:_onButtonBuy(sender)
	local userId = sender:getTag()
    local itemId = self._cellValue:getId()
    self:dispatchCustomCallback(self._cellValue,2)
end

function AuctionItemCell:_onButtonAddPrice(sender)
	local userId = sender:getTag()
    local itemId = self._cellValue:getId()
    self:dispatchCustomCallback(self._cellValue,1)
end

return AuctionItemCell
