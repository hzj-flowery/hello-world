
local ActivitySubView = require("app.scene.view.activity.ActivitySubView")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local MonthCardNode = import(".MonthCardNode")
local MonthlyCardView = class("MonthlyCardView", ActivitySubView)

function MonthlyCardView:ctor(mainView,activityId)
	self._mainView = mainView
	self._activityId = activityId
	--self._textTitle = nil
	self._fileNode1 = nil
	self._fileNode2 = nil
	self._cardNodeList = {}
	self._cardDataList = G_UserData:getActivityMonthCard():getMonthCardCfgList()
	self._reqSequence = nil--支付请求的记号
    local resource = {
        file = Path.getCSB("MonthlyCardView", "activity/monthlycard"),
        binding = {

		}
    }
    MonthlyCardView.super.ctor(self, resource)
end

function MonthlyCardView:_pullData()
	local hasActivityServerData = G_UserData:getActivity():hasActivityData(self._activityId)
	if not hasActivityServerData  then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end
	return hasActivityServerData
end

function MonthlyCardView:onCreate()
--	local actCfg = G_UserData:getActivityMonthCard():getBaseActivityData():getConfig()
--	self._textTitle:setString(actCfg.name)


	self._cardNodeList[1] =  MonthCardNode.new(self._fileNode1,1,handler(self,self._onBtnClick))
	self._cardNodeList[2] =  MonthCardNode.new(self._fileNode2,2,handler(self,self._onBtnClick))
end

function MonthlyCardView:onEnter()
	self._signalWelfareMonthCardGetReward = G_SignalManager:add(SignalConst.EVENT_WELFARE_MONTH_CARD_GET_REWARD, handler(self, self._onEventWelfareMonthCardGetReward))
	self._signalRechargeGetInfo = G_SignalManager:add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(self, self._onEventRechargeGetInfo))
	

	local hasServerData = self:_pullData()
	if hasServerData and G_UserData:getActivityMonthCard():isExpired() then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end

	if hasServerData then
		self:refreshCardInfo()
	end
end

function MonthlyCardView:onExit()
	self._signalWelfareMonthCardGetReward:remove()
	self._signalWelfareMonthCardGetReward = nil

	self._signalRechargeGetInfo:remove()
	self._signalRechargeGetInfo = nil

end

function MonthlyCardView:enterModule()

end

function MonthlyCardView:_onEventWelfareMonthCardGetReward(event,id,message)
	local awards = rawget(message, "reward")
	if awards then
		G_Prompt:showAwards(awards)
		-- local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		-- PopupGetRewards:showRewards(awards)
	end
end

function MonthlyCardView:_onEventRechargeGetInfo(event,id,message)
	--购买月卡后刷新
	self:refreshCardInfo()
end

function MonthlyCardView:_onEventRechargeNotice(event,id,message)
	if not self._reqSequence or self._reqSequence ~= message.product_id then
		--不是购买月卡的支付通知
		return
	end
	self._reqSequence = nil

	--[[ --统一在GameScene处理
	local awards  = {
		{type = TypeConvertHelper.TYPE_RESOURCE ,value = DataConst.RES_DIAMOND,size = message.gold}
	}
	if awards then
		G_Prompt:showAwards(awards)
	end
	]]
end

function MonthlyCardView:refreshCardInfo()
	for k,v in ipairs(self._cardNodeList) do
		v:refreshUI(self._cardDataList[k])
	end
end

function MonthlyCardView:_onBtnClick(sender,data)
    if not data then
        return
    end
	local payCfg = data
	local payId = payCfg.id

	local monthlyCardData = G_UserData:getActivityMonthCard()
	local cardData = monthlyCardData:getMonthCardDataById(payId)
	if cardData and  cardData:isCanReceive() then
		G_UserData:getActivityMonthCard():c2sUseMonthlyCard(payId)
	else
		self._reqSequence = payCfg.product_id
		G_GameAgent:pay(payCfg.id, 
					payCfg.rmb, 
					payCfg.product_id, 
					payCfg.name, 
					payCfg.name)
	end
end


return MonthlyCardView
