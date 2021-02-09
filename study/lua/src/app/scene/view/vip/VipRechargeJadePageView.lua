--
-- Author: Wangyu
-- Date: 2020-04-03 15:55:59
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local VipRechargeJadePageView = class("VipRechargeJadePageView", ListViewCellBase)


local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")

local JADE_NUM_LIST = {
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

function VipRechargeJadePageView:ctor(callBack)

	self._fileNode1 = nil
	self._callback = callBack
    local resource = {
        file = Path.getCSB("VipRechargeJadePageView", "vip"),
        size = {1136, 640},
       
    }
    VipRechargeJadePageView.super.ctor(self, resource)
end

function VipRechargeJadePageView:onCreate()
	local contentSize = self._panelRoot:getContentSize()
	self:setContentSize(contentSize)

	--self._rechargeList = G_UserData:getVipPay():getRechargeList()
end

function VipRechargeJadePageView:updateUI(itemList)
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


function VipRechargeJadePageView:_updateRechargeItem(itemNode, vipPayData)
	local vipPayCfg = vipPayData.cfg

	if vipPayCfg.effect and vipPayCfg.effect ~= "" then
		dump(vipPayCfg.effect)
		local node = itemNode:getSubNodeByName("Node_effect")
		node:removeAllChildren()
		G_EffectGfxMgr:createPlayMovingGfx(node,vipPayCfg.effect)
	end

	local itemInfo = itemNode:getSubNodeByName("_resource")
	itemInfo:getSubNodeByName("Image_down"):setVisible(false)

	itemInfo:setTag(vipPayCfg.id)
    itemInfo:addTouchEventListener(handler(self,self._onTouchCallBack))
    itemInfo:setTouchEnabled(true)
    itemInfo:setSwallowTouches(false)
    
	local index = JADE_NUM_LIST[vipPayCfg.rmb] or 1

	local path = Path.getVipImage(string.format("txt_yubi_%02d", index))

	itemInfo:updateImageView( "Image_jade_num", { texture = path  })
	-- itemInfo:updateImageView( "Image_jade", { texture = Path.getVipImage("icon_yubi0" .. index)  })
	local vipIconPath = Path.getCommonIcon("vip",vipPayCfg.icon_id) 
	itemInfo:updateImageView( "Image_jade", { texture = vipIconPath  })

	itemInfo:updateLabel( "Text_rmb", { text = Lang.get("lang_recharge_money", {num = vipPayCfg.rmb})  })
end

function VipRechargeJadePageView:_onTouchCallBack(sender,state)
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

function VipRechargeJadePageView:onEnter()

end

function VipRechargeJadePageView:onExit()

end


return VipRechargeJadePageView
