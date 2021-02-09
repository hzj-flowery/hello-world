local PopupBase = require("app.ui.PopupBase")
local ViewBase = require("app.ui.ViewBase")

local FirstPayView = class("FirstPayView", PopupBase)


function FirstPayView:ctor()
    self._commonButtonLargeNormal3 = nil
    self._commonIconTemplate = nil
    self._commonIconTemplate_0 = nil
    self._commonIconTemplate_1 = nil
    self._commonIconTemplate_2 = nil
    self._commonIconTemplateArr = {}
    local resource = {
        file = Path.getCSB("FirstPayView", "firstpay"),
        binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onClickClose"}}
			}
		},
    }
    FirstPayView.super.ctor(self, resource)
end

function FirstPayView:onCreate()
    self._commonButtonLargeNormal3:addClickEventListenerEx(handler(self,self._onBtnClick))
	self._commonButtonLargeNormal3:setString(Lang.get("lang_activity_firstpay_recharge"))
    --self._commonButtonLargeNormal3:setString(Lang.get("lang_activity_firstpay_receive"))

    self._commonIconTemplateArr = {self._commonIconTemplate,self._commonIconTemplate_0,
        self._commonIconTemplate_1,self._commonIconTemplate_2}
        
    
    self:_initRewardView()
end

function FirstPayView:_pullData()
	local hasActivityServerData = G_UserData:getActivityFirstPay():isHasData()
	if not hasActivityServerData  then
		G_UserData:getActivityFirstPay():pullData()
	end
	return hasActivityServerData
end


function FirstPayView:onEnter()
    local hasServerData = self:_pullData()
    if hasServerData then
        self:refreshData()
    end
    self._signalActivityRechargeAwardUpdate = G_SignalManager:add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_UPDATE, 
        handler(self, self._onEventActivityRechargeAwardUpdate))  

    self._signalActivityRechargeAwardGetInfo = G_SignalManager:add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_GET_INFO, 
        handler(self, self._onEventActivityRechargeAwardGetInfo))

    self:_playGfx()
end

--播放特效
function FirstPayView:_playGfx()
    self._nodeEffectA:removeAllChildren()
    G_EffectGfxMgr:createPlayGfx(self._nodeEffectA,"effect_shouchong_wuqi")

    self._nodeEffectB:removeAllChildren()
    G_EffectGfxMgr:createPlayGfx(self._nodeEffectB,"effect_shouchong_wuqi_b")
end

function FirstPayView:onExit()
	self._signalActivityRechargeAwardUpdate:remove()
	self._signalActivityRechargeAwardUpdate = nil

    self._signalActivityRechargeAwardGetInfo:remove()
    self._signalActivityRechargeAwardGetInfo = nil
end

function FirstPayView:_onEventActivityRechargeAwardGetInfo(event,id,message)
     self:refreshData()
end

function FirstPayView:_onEventActivityRechargeAwardUpdate(event,id,message)
    self:refreshData()
    self:_showRewardsPopup()
end

function FirstPayView:_showRewardsPopup()
    local awards = G_UserData:getActivityFirstPay():getRewardList()
    if awards then
		local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		PopupGetRewards:showRewards(awards)
		 
	end
end

function FirstPayView:_initRewardView()
    local rewardList = G_UserData:getActivityFirstPay():getRewardList()
    for k,commonIconTemplate in ipairs(self._commonIconTemplateArr) do
        local data = rewardList[k]
        self:_refreshRewardItemView(commonIconTemplate,data)
    end
    
end

function FirstPayView:_refreshRewardItemView(node,data)
    if not data then
        node:setVisible(false)
        return 
    end
    node:setVisible(true)

    local commonIconTemplateArr = node
    commonIconTemplateArr:unInitUI()
	commonIconTemplateArr:initUI( data.type, data.value, data.size)
	commonIconTemplateArr:setTouchEnabled(true)

end

function FirstPayView:_onClickClose(sender)
    self:close()
end

function FirstPayView:_onBtnClick(sender)
    local firstPayData = G_UserData:getActivityFirstPay()
    if firstPayData:canReceive() then--点领取
        G_UserData:getActivityFirstPay():c2sActRechargeAward()
    elseif firstPayData:hasReceive() then--已领取
        
    else--去充值
        self:close()
        local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE)
    end 
end

function FirstPayView:refreshData()
    local firstPayData = G_UserData:getActivityFirstPay()
    if firstPayData:canReceive() then
        self._commonButtonLargeNormal3:setEnabled(true)
        self._commonButtonLargeNormal3:setString(Lang.get("lang_activity_firstpay_receive"))
    elseif firstPayData:hasReceive() then
        self._commonButtonLargeNormal3:setString(Lang.get("lang_activity_firstpay_received"))
        self._commonButtonLargeNormal3:setEnabled(false)
    else
        self._commonButtonLargeNormal3:setEnabled(true)
        self._commonButtonLargeNormal3:setString(Lang.get("lang_activity_firstpay_recharge"))
    end 
    
    
end

return FirstPayView
