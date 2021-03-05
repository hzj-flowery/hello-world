local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ViewBase = require("app.ui.ViewBase")
local VipTestView = class("VipTestView",ViewBase)


function VipTestView:ctor()
    logWarn("VipTestView")
    local resource = {
		file = Path.getCSB("VipTestView", "vip"),
 		size =  G_ResolutionManager:getDesignSize(),
	}
    VipTestView.super.ctor(self, resource)
end

function VipTestView:onCreate()
    -- self:_initList()
    self._topbarBase:setImageTitle(" ")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
    
    self._btnNode = cc.Node:create()
    self._panelBk:addChild(self._btnNode)

    self:_updateItemData()  
end 
 
function VipTestView:_onButtonClick(sender)
	local itemTag = sender:getTag()

	--发送充值购买请求
	local vipPayData = require("app.config.vip_pay").get(itemTag)
	assert(vipPayData, "can not find item in vip pay config by id "..itemTag)

	G_GameAgent:pay(vipPayData.id, vipPayData.rmb, vipPayData.product_id, vipPayData.name, vipPayData.name)
end


function VipTestView:onEnter()
	self._signalGetRecharge 	= G_SignalManager:add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(self, self._onEventGetRecharge))
	self._signalGetRechargeNotice = G_SignalManager:add(SignalConst.EVENT_RECHARGE_NOTICE, handler(self, self._onEventGetRechargeNotice))
	self._signalGetRechargeFirstBuyReset = G_SignalManager:add(SignalConst.EVENT_RECHARGE_FIRST_BUY_RESET, handler(self, self._onEventGetRechargeFirstBuyReset))
	self._signalVipExpChange = G_SignalManager:add(SignalConst.EVENT_VIP_EXP_CHANGE, handler(self,self._onEventVipExpChange))

end


function VipTestView:onExit()
	self._signalGetRechargeNotice:remove()
	self._signalGetRechargeNotice = nil
	self._signalGetRecharge:remove()
	self._signalGetRecharge = nil
	self._signalGetRechargeFirstBuyReset:remove()
	self._signalGetRechargeFirstBuyReset = nil
    self._signalVipExpChange:remove()
	self._signalVipExpChange = nil
end


function VipTestView:_updateItemData()
	self._rechargeList = G_UserData:getVipPay():getRechargeList()
    
    self._btnNode:setPositionX(display.cx - 200)
    for i, value in ipairs(self._rechargeList) do
        local CSHelper = require("yoka.utils.CSHelper")
        local vipPayCfg = value.cfg
        local btn = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel0Highlight", "common"))
        btn:setString(vipPayCfg.name)
        btn:setButtonTag(vipPayCfg.id)

        local rowNum = (i-1)/6 - (i-1)/6%1
        local colNum = (i-1) - rowNum*6

        btn:setPosition(150+rowNum*250,500-80*colNum) 
        btn:addClickEventListenerEx(handler(self, self._onButtonClick))
        self._btnNode:addChild(btn)
    end
    
end

function VipTestView:_onEventGetRecharge(id, message)
	dump(message)

end

function VipTestView:_onEventGetRechargeNotice(id, message)
	
	G_Prompt:showTip("充值成功")
end

function VipTestView:_onEventGetRechargeFirstBuyReset(id, message)
	
end

function VipTestView:_onEventVipExpChange(event)

end


return VipTestView