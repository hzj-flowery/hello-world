--
-- Author: hedl
-- Date: 2017-5-2 13:50:59
--
local ViewBase = require("app.ui.ViewBase")
local VipRechargeView = class("VipRechargeView", ViewBase)

local VipRechargePageView = require("app.scene.view.vip.VipRechargePageView")
local VipRechargeJadePageView = require("app.scene.view.vip.VipRechargeJadePageView")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local DataConst = require("app.const.DataConst")

function VipRechargeView:ctor(parent, itemType)
	--数据
	self._itemList = {}
	self._itemType = itemType
	
	self._parentView = parent
	self._listItemSource = nil

    local resource = {
        file = Path.getCSB("VipRechargeView", "vip"),
        size = {1136, 640},
       
    }
    VipRechargeView.super.ctor(self, resource)
end

function VipRechargeView:onCreate()
	local template = nil
	local jadeTipShow = false
	if self._itemType == DataConst.RES_JADE2 then
		template = VipRechargeJadePageView
		jadeTipShow = true
	else
		template = VipRechargePageView
		jadeTipShow = false
	end
	self._listItemSource:setTemplate(template)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))
	self._textJadeTip:setVisible(false)--jadeTipShow)
end

function VipRechargeView:_updateItemData()
	if self._itemType == DataConst.RES_JADE2 then
		self._rechargeList = G_UserData:getVipPay():getJadeRechargeList()
	else
		self._rechargeList = G_UserData:getVipPay():getRechargeList()
	end
	local pageSize = math.ceil( #self._rechargeList / 4 )

	local itemList = {}
	for i=1, pageSize do
		itemList[i] = itemList[i] or {}
		for j=1, 4 do
			local index = (i-1)*4+j
			local item = self._rechargeList[index]
			if item then
				table.insert( itemList[i], item)
			end
		end
	end
	self._itemList = itemList
end

function VipRechargeView:_updateListView()
	self:_updateItemData()

	self._listItemSource:resize(#self._itemList)
end


function VipRechargeView:_onItemUpdate(item, index)
	if self._itemList[index + 1] then
		item:updateUI(self._itemList[index + 1])
	end
end


function VipRechargeView:_onItemSelected(item, index)

end
--
function VipRechargeView:_onItemTouch(index,itemTag)
	logWarn(" VipRechargeView:_onItemTouch "..itemTag)

	--发送充值购买请求
	local vipPayData = require("app.config.vip_pay").get(itemTag)
	assert(vipPayData, "can not find item in vip pay config by id "..itemTag)

	G_GameAgent:pay(vipPayData.id, vipPayData.rmb, vipPayData.product_id, vipPayData.name, vipPayData.name)
end


function VipRechargeView:isRootScene()
	return true
end

--
function VipRechargeView:onEnter()
	self._signalGetRecharge 	= G_SignalManager:add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(self, self._onEventGetRecharge))
	self._signalGetRechargeNotice = G_SignalManager:add(SignalConst.EVENT_RECHARGE_NOTICE, handler(self, self._onEventGetRechargeNotice))
	self._signalGetRechargeFirstBuyReset = G_SignalManager:add(SignalConst.EVENT_RECHARGE_FIRST_BUY_RESET, handler(self, self._onEventGetRechargeFirstBuyReset))
	self._signalVipExpChange = G_SignalManager:add(SignalConst.EVENT_VIP_EXP_CHANGE, handler(self,self._onEventVipExpChange))

	self:_updateListView()
end


function VipRechargeView:onExit()
	self._signalGetRechargeNotice:remove()
	self._signalGetRechargeNotice = nil
	self._signalGetRecharge:remove()
	self._signalGetRecharge = nil

	self._signalGetRechargeFirstBuyReset:remove()
	self._signalGetRechargeFirstBuyReset = nil

    self._signalVipExpChange:remove()
	self._signalVipExpChange = nil
end

function VipRechargeView:_onEventGetRecharge(id, message)
	dump(message)
	
	self:_updateListView()
	if self._parentView and self._parentView.updateView then
		self._parentView:updateView()
	end
end



function VipRechargeView:_onEventGetRechargeNotice(id, message)
	dump(message)
	G_Prompt:showTip("充值成功")
end

function VipRechargeView:_onEventGetRechargeFirstBuyReset(id, message)
	self:_updateListView()
end


function VipRechargeView:_onEventVipExpChange(event)
	self:_updateListView()
end

return VipRechargeView