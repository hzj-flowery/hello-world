local PopupBase = require("app.ui.PopupBase")
local PopupFirstPayView = class("PopupFirstPayView", PopupBase)
local FirstPayItenCell = require("app.scene.view.firstpay.FirstPayItenCell")
local UserDataHelper =  require("app.utils.UserDataHelper")

function PopupFirstPayView:ctor()
    local resource = {
        file = Path.getCSB("PopupFirstPayView", "firstpay"),
        binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			}
		},
    }
    PopupFirstPayView.super.ctor(self, resource)
end

function PopupFirstPayView:onCreate()
    self._listItemSource:setTemplate(FirstPayItenCell)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))
    

    self._commonStoryAvator:updateUI(302)--小乔
    self._commonStoryAvator:setScale(0.8)
end

function PopupFirstPayView:_pullData()
	local hasActivityServerData = G_UserData:getActivityFirstPay():isHasData()
	if not hasActivityServerData  then
		G_UserData:getActivityFirstPay():pullData()
	end
	return hasActivityServerData
end

function PopupFirstPayView:onEnter()
    local hasServerData = self:_pullData()
    if hasServerData then
        self:refreshData()
    end
    self._signalActivityRechargeAwardUpdate = G_SignalManager:add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_UPDATE, 
        handler(self, self._onEventActivityRechargeAwardUpdate))  

    self._signalActivityRechargeAwardGetInfo = G_SignalManager:add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_GET_INFO, 
        handler(self, self._onEventActivityRechargeAwardGetInfo))
    
    self._signalRecvRoleInfo = G_SignalManager:add(SignalConst.EVENT_RECV_ROLE_INFO, 
        handler(self, self._onEventRecvRoleInfo))

    

	logWarn("PopupFirstPayView ---------------- onEnter")
end

function PopupFirstPayView:onExit()
	self._signalActivityRechargeAwardUpdate:remove()
	self._signalActivityRechargeAwardUpdate = nil

    self._signalActivityRechargeAwardGetInfo:remove()
    self._signalActivityRechargeAwardGetInfo = nil

    self._signalRecvRoleInfo:remove()
    self._signalRecvRoleInfo  = nil
end

function PopupFirstPayView:_onEventActivityRechargeAwardGetInfo(event,id,message)
     self:refreshData()
end

function PopupFirstPayView:_onEventActivityRechargeAwardUpdate(event,id,message)
    self:refreshData()

    self:_showRewardsPopup(rawget(message,"rewrad"))
end

function PopupFirstPayView:_onEventRecvRoleInfo(event,id)
    self:refreshData()
end

function PopupFirstPayView:_showRewardsPopup(awards)
    if awards then
		local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		PopupGetRewards:showRewards(awards)
	end
end

function PopupFirstPayView:_onBtnClose()
	self:close()
end

function PopupFirstPayView:_onItemUpdate(item, index)
	if self._listData[index + 1] then
		item:updateUI(self._listData[index + 1] )
	end
end

function PopupFirstPayView:_onItemSelected(item, index)
end

function PopupFirstPayView:_onItemTouch(lineIndex,index)
	local itemData = self._listData[index + 1]
	if not itemData then
		return
	end
	
	local firstPayData = G_UserData:getActivityFirstPay()
    if firstPayData:canReceive(itemData.id) then
          local rewards = UserDataHelper.makeRewards(itemData,3)--最多配置3个道具
          local UserCheck = require("app.utils.logic.UserCheck")
          local full = UserCheck.checkPackFullByAwards(rewards)
          if full then    
            return 
          end
            
          G_UserData:getActivityFirstPay():c2sActRechargeAward(itemData.id)
    elseif firstPayData:hasReceive(itemData.id) then
    else
        local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE)
    end

end

function PopupFirstPayView:_updateList()
	self._listData = G_UserData:getActivityFirstPay():getFirstPayList() 
	self._listItemSource:clearAll()
	self._listItemSource:resize(#self._listData)
    self._listItemSource:setTouchEnabled(false)
end

function PopupFirstPayView:refreshData()
    self:_updateList()
end

return PopupFirstPayView
