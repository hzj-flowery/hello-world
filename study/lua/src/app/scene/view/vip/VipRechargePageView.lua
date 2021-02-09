--
-- Author: hedl
-- Date: 2017-5-2 13:50:59
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local VipRechargePageView = class("VipRechargePageView", ListViewCellBase)


local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")

local DIAMOND_NUM_LIST = {
	[6] = 1,
	[30] = 2,
	[68] = 3,
	[98] = 4,
	[198] = 5,
	[298] = 6,
	[488] = 7,
	[648] = 8,
	[2000] = 9,
	[5000] = 10,
	[8000] = 11,
	[10000] = 12,
}

function VipRechargePageView:ctor(callBack)

	self._fileNode1 = nil
	self._callback = callBack
    local resource = {
        file = Path.getCSB("VipRechargePageView", "vip"),
        size = {1136, 640},
       
    }
    VipRechargePageView.super.ctor(self, resource)
end

function VipRechargePageView:onCreate()
	local contentSize = self._panelRoot:getContentSize()
	self:setContentSize(contentSize)

	--self._rechargeList = G_UserData:getVipPay():getRechargeList()
end

function VipRechargePageView:updateUI(itemList)
	self._itemList = itemList
	dump(itemList)
	for i=1, 8 do 
		local fileNode = self["_fileNode"..i]
		if fileNode then
			fileNode:setVisible(false)
		end
	end
	for i, itemValue in ipairs(itemList) do
		local fileNode = self["_fileNode"..i]
		if fileNode then
			fileNode:setVisible(true)
			self:_updateRechargeItem(fileNode, itemValue )
		end
	end

end


function VipRechargePageView:_updateRechargeItem(itemNode, vipPayData)
	local isFirstRecharge = not vipPayData.isBuyed
	local firstBuyResetTime = G_UserData:getVipPay():getFirstBuyResetTime()
	local vipPayCfg = vipPayData.cfg

	-- 大额充值不送
	isFirstRecharge = vipPayCfg.large_amount ~= 1 and (vipPayData.buyTime == 0 or vipPayData.buyTime < firstBuyResetTime)

	if vipPayCfg.effect and vipPayCfg.effect ~= "" then
		dump(vipPayCfg.effect)
		local node = itemNode:getSubNodeByName("Node_effect")
		node:removeAllChildren()
		G_EffectGfxMgr:createPlayMovingGfx(node,vipPayCfg.effect)
	end
	--itemNode:setVisible(true)

	local itemInfo = itemNode:getSubNodeByName("ItemInfo")
	itemInfo:getSubNodeByName("Image_down"):setVisible(false)
	itemInfo:addTouchEventListener(handler(self,self._onTouchCallBack))
	itemInfo:setSwallowTouches(false)
	--itemInfo:getSubNodeByName("Image_first_time"):setVisible(isFirstRecharge)
    --itemInfo:getSubNodeByName("Image_first_time_bk"):setVisible(isFirstRecharge)

	local vipIconPath = Path.getCommonIcon("vip",vipPayCfg.icon_id) 
	dump(vipIconPath)

	itemInfo:updateImageView( "Image_gold_icon", { texture = vipIconPath  })

	local num = DIAMOND_NUM_LIST[vipPayCfg.rmb] or 1
	local path = string.format("txt_yuanbao_%02d", num)
	local vipNumPath = Path.getVipImage(path)
	itemInfo:updateImageView( "Image_gold_num", { texture = vipNumPath})

	itemInfo:setTag(vipPayCfg.id)
	local sendValue = vipPayCfg.gold_rebate_2
	if isFirstRecharge == true then
		sendValue = vipPayCfg.gold_rebate_1
	end

	if isFirstRecharge then
		-- 首冲双倍
		itemInfo:updateImageView("Image_tip", { texture = Path.getVipImage("img_vip_board01c") } )
		itemInfo:updateLabel("Text_send_value", {visible = false })
	elseif sendValue<=0 then
		itemInfo:updateImageView("Image_tip", { visible = false} )
	else
		-- 赠元宝×60
		itemInfo:updateImageView("Image_tip", { visible = true, texture = Path.getVipImage("img_vip_board01b")} )
		itemInfo:updateLabel("Text_send_value", {text = sendValue, visible = true })
	end
	
	itemInfo:updateLabel( "Text_rmb_num", { text = Lang.get("lang_recharge_money", {num=vipPayCfg.rmb})} )
	
	itemInfo:updateImageView("Image_rmb_num", {visible = false})
	-- itemInfo:updateImageView("Image_rmb_num", { texture = Path.getVipImage("rmb_" .. vipPayCfg.rmb)} )
	-- if vipPayCfg.rmb>=999 then
	-- 	itemInfo:updateImageView("Image_rmb_num", { position = cc.p(116, 30)})
	-- else
	-- 	itemInfo:updateImageView("Image_rmb_num", { position = cc.p(116, 22)})
	-- end
end

function VipRechargePageView:_onTouchCallBack(sender,state)
	if state == ccui.TouchEventType.began then
		sender:getSubNodeByName("Image_down"):setVisible(true)
	end
	if state == ccui.TouchEventType.ended then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)

		sender:getSubNodeByName("Image_down"):setVisible(false)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			local vipIndex = sender:getTag()
			--[[
			if self._callback and type(self._callback) == "function" then
				self._callback(vipIndex)
			end
			]]
			logWarn("VipRechargePageView ------------  "..tostring(vipIndex))
			self:dispatchCustomCallback(vipIndex)
		end
		
	end

	if state == ccui.TouchEventType.canceled then
		sender:getSubNodeByName("Image_down"):setVisible(false)
	end
end

function VipRechargePageView:onEnter()

end

function VipRechargePageView:onExit()

end


return VipRechargePageView
