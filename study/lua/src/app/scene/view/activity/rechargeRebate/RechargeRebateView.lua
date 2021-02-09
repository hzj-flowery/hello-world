
-- Author: nieming
-- Date:2018-02-13 14:02:27
-- Describle：
local ActivitySubView = require("app.scene.view.activity.ActivitySubView")
local RechargeRebateView = class("RechargeRebateView", ActivitySubView)
local ParamConfig = require("app.config.parameter")
local UIHelper = require("yoka.utils.UIHelper")
function RechargeRebateView:ctor()

	--csb bind var name
	self._actTitle = nil  --CommonFullScreen
	self._btnGotoRecharge = nil  --CommonButtonHighLight
	self._curRecharge = nil  --Text
	self._nextGet = nil  --Text
	self._textParent = nil  --SingleNode

	local resource = {
		file = Path.getCSB("RechargeRebate", "activity/rechargeRebate"),
		binding = {
			_btnGotoRecharge = {
				events = {{event = "touch", method = "_onBtnGotoRecharge"}}
			},
		},
	}
	RechargeRebateView.super.ctor(self, resource)
end

function RechargeRebateView:_setDetails()
	local config = ParamConfig.get(154)
	assert(config ~= nil, "can not find ParamConfig id = 154")
	local textArr = string.split(config.content, "|")
	local textContentArr = {}
	for k, v in  ipairs(textArr) do
		if v == "" then
			table.insert(textContentArr, {type = "empty", content = 20})
		else
			table.insert(textContentArr, {type = "text", content = v})
			table.insert(textContentArr, {type = "empty", content = 15})
		end
	end

	local curHeight = 0
	for k, v in ipairs(textContentArr) do
		if v.type == "text" then
			local text = UIHelper.createLabel({ text = v.content, fontSize = 20, color = Colors.BRIGHT_BG_TWO})
			local renderLabel = text:getVirtualRenderer()
			renderLabel:setWidth(564)
			renderLabel:setLineSpacing(3)
			text:setAnchorPoint(cc.p(0, 1))
			text:setPositionY(curHeight)
			self._textParent:addChild(text)
			local size = renderLabel:getContentSize()
			curHeight = curHeight - size.height
		elseif v.type == "empty" then
			curHeight = curHeight - v.content
		end
	end
end

-- Describle：
function RechargeRebateView:onCreate()
	self._btnGotoRecharge:setString(Lang.get("common_btn_to_recharge"))
	self:_setDetails()
	self:_requestChargeInfo()
	self:_refreshChargeInfo()
end

-- Describle：
function RechargeRebateView:onEnter()
	self._signalRefreshView = G_SignalManager:add(SignalConst.EVENT_GET_CURRENT_RECHARGE_REBATE_SUCCESS, handler(self, self._refreshChargeInfo))
	self._signalRecharge = G_SignalManager:add(SignalConst.EVENT_RECHARGE_NOTICE, handler(self, self._requestChargeInfo))
end

function RechargeRebateView:_requestChargeInfo()
	G_UserData:getRechargeRebate():getCurRechargeNum(true)
end

function RechargeRebateView:_refreshChargeInfo()
	local info = G_UserData:getRechargeRebate():getCurRechargeNum()
	if info then
		self._curRecharge:setString(Lang.get("lang_activity_recharge_rebate_yuan", {money = math.floor(info.money)}))
		self._nextGet:setString(Lang.get("lang_activity_recharge_rebate_return", {money = info.returnMoney, vip = info.returnVipExp}))
	end
end
-- Describle：
function RechargeRebateView:onExit()
	self._signalRefreshView:remove()
	self._signalRefreshView = nil

	self._signalRecharge:remove()
	self._signalRecharge = nil
end
-- Describle：
function RechargeRebateView:_onBtnGotoRecharge()
	-- body
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE )
end

return RechargeRebateView
