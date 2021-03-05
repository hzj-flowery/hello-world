--跨服拍卖
local ListViewCellBase = require("app.ui.ListViewCellBase")
local TenJadeAuctionCell = class("TenJadeAuctionCell", ListViewCellBase)
local TenJadeAuctionConfigHelper = import("app.scene.view.tenJadeAuction.TenJadeAuctionConfigHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local TextHelper = require("app.utils.TextHelper")
local TenJadeAuctionConst  = require("app.const.TenJadeAuctionConst")



local PRICE_COLOR = {
    normal = cc.c3b(0xb1, 0x53, 0x16),
    forcus = cc.c3b(0xff, 0xff, 0xff),
    outline = cc.c3b(0xd2, 0x47, 0x23),
}

local TIME_COLOR = {
    normal = cc.c3b(0xdd, 0x4e, 0x15),
    forcus = cc.c3b(0x93, 0x07, 0x00),
}

function TenJadeAuctionCell:ctor()
    self._commonResInfo1 = nil  --CommonResourceInfo
	self._textTime = nil  --Text
	self._commonIcon = nil  --CommonIconTemplate
	self._textItemName = nil  --Text
    self._isFocused = 1
    self._intervalTime = 0
    local resource = {
        file = Path.getCSB("TenJadeAuctionCell", "tenJadeAuction"),
        binding = {
            _panelItem = {
                events = {{event = "touch", method = "_onItemTouched"}}
            }, 
            _addFocusTouchPanel = {
                events = {{event = "touch", method = "_onAddFocusTouched"}}
            },
		}
    }
    TenJadeAuctionCell.super.ctor(self, resource)
end


function TenJadeAuctionCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
    self:scheduleUpdateWithPriorityLua(handler(self, self._updateTime), 1)
    
    --self._addFocusTouchPanel:setSwallowTouches(true)

    self._imageDesc:setVisible(false)
end

function TenJadeAuctionCell:onEnter()
end

function TenJadeAuctionCell:onExit()
end

--是否选中
function TenJadeAuctionCell:setSelected(bSelected)
    self._selectedBg:setVisible(bSelected)
    
    local item = self._data:getItem()
    if item.type == 0 then
        return
    end
    local itemParams = TypeConvertHelper.convert(item.type, item.value, item.size)
    
    if bSelected then
        self._textPrice:setColor(PRICE_COLOR.forcus)
        self._textTime:setColor(TIME_COLOR.forcus)
        self._textPrice:enableOutline(PRICE_COLOR.outline, 1)
        if itemParams and itemParams.cfg.color == 6 then    -- 选中状态  如果是 红色品质字体加描边
            self._textItemName:enableOutline(cc.c3b(0x70, 0x03, 0x00), 2)
        end
    else
        self._textPrice:disableEffect()
        self._textPrice:setColor(PRICE_COLOR.normal)
        self._textTime:setColor(TIME_COLOR.normal)
        if itemParams and itemParams.cfg.color == 6 then    
            self._textItemName:disableEffect()
        end
    end
end

function TenJadeAuctionCell:updateUI(index, data)
    self:setTag(index)
    self._data = data.unitData
    self._viewData = data.viewData
    local data = self._data
    if data == nil or data:getItem() == nil then
        return
    end
    local item = data:getItem()
    if item.type == 0 then
        return
    end

    local itemParams = TypeConvertHelper.convert(item.type, item.value, item.size)
    if itemParams == nil then
        return
    end
    
    --当前我出价最高
    local nowBuyer = data:getNow_buyer()
    self._imageDesc:setVisible(nowBuyer == G_UserData:getBase():getId())

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
        self._imageDesc:setVisible(false)
    end
    local moneyType = data:getMoney_type()
    local value
    if moneyType==0 then
        value = DataConst.RES_DIAMOND
    else
        value = DataConst.RES_JADE2
    end
    
    self._textPrice:setString(currPrice)
    --self._commonResInfo1:updateUI(TypeConvertHelper.TYPE_RESOURCE, value, currPrice)
    --self._commonResInfo1:setTextColorToATypeColor()

    self:_updateFocus()
    self:_updateSelected()
    
    local finalPrice = data:getFinal_price()
    self:_updateCellTime()
end

-----------------------------------------------------------
----------------------方法---------------------------------
-----------------------------------------------------------
--更新关注状态
function TenJadeAuctionCell:_updateFocus()
    if self._data:getFocused() == 1 then
       self:_focused()
    else
        self:_notFocused()
    end
end

--更新选中状态
function TenJadeAuctionCell:_updateSelected()
    self:setSelected(self._viewData.selected == 1)
end

--关注了
function TenJadeAuctionCell:_focused()
    self._iconFocus:setVisible(true)
end

--没关注
function TenJadeAuctionCell:_notFocused()
    self._iconFocus:setVisible(false)
end


--更新时间
function TenJadeAuctionCell:_updateCellTime()
    local data = self._data
    local startTime = data:getStart_time()
    local endTime = data:getEnd_time()
    local curTime = G_ServerTime:getTime()
    local phase = TenJadeAuctionConfigHelper.getAuctionPhase()
    if phase == TenJadeAuctionConst.PHASE_SHOW then
        self._textTime:setString("")
    elseif phase == TenJadeAuctionConst.PHASE_ITEM_SHOW then
        local startTime = G_UserData:getTenJadeAuction():getCurAuctionStartTime()
        local countDown = TenJadeAuctionConfigHelper.getCountDown()
        self._textTime:setString(G_ServerTime:getLeftMinSecStr(startTime + countDown))
    else
        local timeLeft = G_ServerTime:getLeftSeconds(startTime)
        if timeLeft > 0 then
            local leftTimeStr = G_ServerTime:getLeftMinSecStr(startTime)
            self._textTime:setString(leftTimeStr)
        else
            local leftTimeStr = G_ServerTime:getLeftMinSecStr(endTime)
            self._textTime:setString(leftTimeStr)
        end
    end
end


-----------------------------------------------------------
----------------------回调---------------------------------
-----------------------------------------------------------

function TenJadeAuctionCell:_updateTime(dt)
	if self:isVisible() == false then
		return
	end

	self._intervalTime = self._intervalTime + dt 
	if self._intervalTime >  1.0 and self._data then
        self:_updateCellTime()
		self._intervalTime = 0
	end
end

--按下关注
function TenJadeAuctionCell:_onAddFocusTouched(sender, event)
    local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
    local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
    if moveOffsetX < 20 and moveOffsetY < 20 then
        local curAuctionInfo = G_UserData:getTenJadeAuction():getCurAuctionInfo()
        G_UserData:getTenJadeAuction():c2sCrossAuctionAddFocus(
            curAuctionInfo:getAuction_id(),
            self._data:getId(),
            self._data:getFocused() == 1 and 0 or 1
        )
        self:_updateFocus()
    end
end

--按下item
function TenJadeAuctionCell:_onItemTouched(sender, event)
    local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
    local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
    if moveOffsetX < 20 and moveOffsetY < 20 then
        self:dispatchCustomCallback(self, self._data, 1)
    end
end


return TenJadeAuctionCell
