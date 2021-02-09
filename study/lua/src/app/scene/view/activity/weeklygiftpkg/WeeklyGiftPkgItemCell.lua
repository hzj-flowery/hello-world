-- Author: conley
local ListViewCellBase = require("app.ui.ListViewCellBase")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local WeeklyGiftPkgItemCell = class("WeeklyGiftPkgItemCell", ListViewCellBase)

WeeklyGiftPkgItemCell.DISCOUNT_IMGS = {"","","","img_zhoulibao_si","img_zhoulibao_wu","","","","",""}

function WeeklyGiftPkgItemCell:ctor()
	self._resourceNode  = nil
	self._commonIconTemplate  = nil --道具Item
	self._commonButtonMediumNormal  = nil --购买按钮

    self._imageDiscount = nil--折扣背景
    self._textDiscount = nil--折扣文字
	self._textItemName  = nil --道具名称
	self._nodeCondition = nil--富文本父节点
	self._imageReceive = nil--已接收图片
    self._conditionRichText = nil--条件富文本
    self._textCondition = nil--VIP条件

    self._textPrePrice = nil
    self._textNowPrice = nil

	local resource = {
		file = Path.getCSB("WeeklyGiftPkgItemCell", "activity/weeklygiftpkg"),
		binding = {
			_commonButtonMediumNormal = {
				events = {{event = "touch", method = "_onItemClick"}}
			}
		},
	}
	WeeklyGiftPkgItemCell.super.ctor(self,resource)
end

function WeeklyGiftPkgItemCell:onCreate()
    local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

    self._commonButtonMediumNormal:setString(Lang.get("lang_activity_weeklygiftpkg_btn"))
    self._commonButtonMediumNormal:setSwallowTouches(false)
end

function WeeklyGiftPkgItemCell:_onItemClick(sender,state)

    if state == ccui.TouchEventType.ended or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
        	local curSelectedPos = self:getTag()
            logWarn("WeeklyGiftPkgItemCell:_onIconClicked  "..curSelectedPos)
            self:dispatchCustomCallback(curSelectedPos)
		end
	end
end

--创建领取条件富文本
function WeeklyGiftPkgItemCell:_createConditionRichText(richText)
    if self._conditionRichText then
		self._conditionRichText:removeFromParent()
	end
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0,0.5))
    self._nodeCondition:addChild(widget)
	self._conditionRichText =  widget

end

function WeeklyGiftPkgItemCell:updateInfo(actWeeklyGiftPkgUnitData)
	local cfg = actWeeklyGiftPkgUnitData:getConfig()
    local buyTime = actWeeklyGiftPkgUnitData:getRemainBuyTime()
    local enabled =  buyTime > 0
    local vipEnough = actWeeklyGiftPkgUnitData:checkVip()
    local hasDiscount = cfg.price_show > 0

	self._commonIconTemplate:unInitUI()
	self._commonIconTemplate:initUI( cfg.type, cfg.value, cfg.size)
	self._commonIconTemplate:setTouchEnabled(true)
    self._commonIconTemplate:showCount(true)

    local itemParam = self._commonIconTemplate:getItemParams()

    --礼包名字
	self._textItemName:setString(cfg.name)
    self._textItemName:setColor(itemParam.icon_color)

    --价格
	self._textPrePrice:showDiscountLine(true)
    self._textPrePrice:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND,cfg.price_show)
    self._textPrePrice:showResName(true, Lang.get("lang_activity_weeklygiftpkg_cell_old_price"))
    self._textNowPrice:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND,cfg.price)
    self._textNowPrice:showResName(true, Lang.get("lang_activity_weeklygiftpkg_cell_now_price"))

    self._imageReceive:setVisible(not enabled)
    self._commonButtonMediumNormal:setVisible(enabled)

    local conditionStr = Lang.get("lang_activity_weeklygiftpkg_vip_condition",
    {
        value = cfg.vip,
    })

   -- self._textCondition:setVisible(not vipEnough)
   -- self._textCondition:setString(conditionStr)

    self._textVip:setString(tostring(cfg.vip))
	if cfg.vip >= 10 then
		self._vipDes2:setPositionX(109)
	else
		self._vipDes2:setPositionX(98)
	end

    if hasDiscount then
        local discount = UserDataHelper.calcDiscount(cfg.price_show,cfg.price)
        self._imageDiscount:setVisible(true)
        self._textDiscount:setString(Lang.get("lang_activity_weeklygiftpkg_dsicount",{discount = discount}))

        if WeeklyGiftPkgItemCell.DISCOUNT_IMGS[math.floor(discount)] then
            local img = WeeklyGiftPkgItemCell.DISCOUNT_IMGS[math.floor(discount)]
            self._imageDiscountNum:loadTexture(Path.getActivityTextRes(img))
        end
    else
        self._imageDiscount:setVisible(false)
    end

end

return WeeklyGiftPkgItemCell
