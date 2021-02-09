--@Author:Conley
local ActivitySubView = require("app.scene.view.activity.ActivitySubView")
local LuxuryGiftPkgItemCell = import(".LuxuryGiftPkgItemCell")
local ActivityConst = require("app.const.ActivityConst")
local LuxuryGiftPkgView = class("LuxuryGiftPkgView", ActivitySubView)

function LuxuryGiftPkgView:ctor(mainView,activityId)
	self._mainView = mainView
	self._activityId = activityId
	self._textTitle = nil
	self._commonBubble = nil--NPC对话
	self._listView = nil
	self._btnBuy7Day = nil

	self._listDatas = nil
    local resource = {
        file = Path.getCSB("LuxuruGiftPkgView", "activity/luxurygiftpkg"),
        binding = {
			_btnBuy7Day = {events = {{event = "touch", method = "_onBuy7Day"}}}
		}
    }
    LuxuryGiftPkgView.super.ctor(self, resource)
end

function LuxuryGiftPkgView:_pullData()
	local hasActivityServerData = G_UserData:getActivity():hasActivityData(self._activityId)
	if not hasActivityServerData  then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end
	return hasActivityServerData
end

function LuxuryGiftPkgView:onCreate()
	self:_initListView(self._listView)

	--local imgPath = Path.getChatRoleRes("216")
	--self._imageJc:loadTexture(imgPath)
	local payCfg =  G_UserData:getActivityLuxuryGiftPkg():getBuy7DaysPayConfig()
	self._btnBuy7Day:setString(Lang.get("lang_activity_luxurygiftpkg_buy_7day",{value = payCfg.rmb}))
	G_EffectGfxMgr:createPlayGfx( self._btnBuy7Day, "effect_anniufaguang_big2" )
	self._commonBubble:setBubbleColor(Colors.BRIGHT_BG_ONE)
	self._commonBubble:setString(Lang.get("lang_activity_luxurygiftpkg_bubble"),363,true,363,87)
end

function LuxuryGiftPkgView:_updateBtnBuy7DayVisible(visible)
	if visible then
		local vipLevel = G_UserData:getVip():getLevel()
		local vipLimit = G_UserData:getActivityLuxuryGiftPkg():getBuy7DayVipLimit()
		if vipLevel < vipLimit then
			self._btnBuy7Day:setVisible(false)
		else
			self._btnBuy7Day:setVisible(true)
		end
	else
		self._btnBuy7Day:setVisible(false)
	end

end

function LuxuryGiftPkgView:onEnter()
	self._signalWelfareGiftPkgGetInfo = G_SignalManager:add(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_INFO, handler(self, self._onEventWelfareGiftPkgGetInfo))
	self._signalWelfareGiftPkgGetReward = G_SignalManager:add(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_REWARD, handler(self, self._onEventWelfareGiftPkgGetReward))

	local hasServerData = self:_pullData()
	if hasServerData and G_UserData:getActivityLuxuryGiftPkg():isExpired() then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end
	if hasServerData then
		self:refreshData()
	end
end

function LuxuryGiftPkgView:onExit()
	self._signalWelfareGiftPkgGetInfo:remove()
	self._signalWelfareGiftPkgGetInfo = nil

	self._signalWelfareGiftPkgGetReward:remove()
	self._signalWelfareGiftPkgGetReward = nil


end


function LuxuryGiftPkgView:_onEventWelfareGiftPkgGetInfo(event,id,message)
	if message.discount_type ~= ActivityConst.GIFT_PKG_TYPE_LUXURY then
		return
	end
    self:refreshData()
end

function LuxuryGiftPkgView:_onEventWelfareGiftPkgGetReward(event,id,message)
	if message.discount_type ~= ActivityConst.GIFT_PKG_TYPE_LUXURY then
		return
	end
	local ids = rawget(message,"id") or {}

	local unitData = G_UserData:getActivityLuxuryGiftPkg():getUnitData(ids[1])
	assert(unitData,"LuxuryGiftPkgView _onEventWelfareGiftPkgGetReward unitData nil")
	if not unitData then
		return
	end
	local index = unitData:getPayType()

	if index then
		self:_refreshItemNodeByIndex(index)
	end

    self:_onShowRewardItems(message)
end

function LuxuryGiftPkgView:_onShowRewardItems(message)
	--local ids = rawget(message,"id") or {}
	--local awards = G_UserData:getActivityLuxuryGiftPkg():getRewards(ids)

	local awards = rawget(message,"awards") or nil
	local randomAwards = rawget(message,"random_awards") or nil
	if awards then
		G_Prompt:showAwards(awards)
	end

	if randomAwards then
	--[[
		local scheduler = require("cocos.framework.scheduler")
		scheduler.performWithDelayGlobal(function()
			local popupGetRewards = require("app.ui.PopupGetRewards").new()
			popupGetRewards:show(randomAwards,nil,nil,nil)
		end, 0.8)
		]]
		self:runAction(cc.Sequence:create(
			cc.DelayTime:create(1.5),
			cc.CallFunc:create(function()
					local popupGetRewards = require("app.ui.PopupGetRewards").new()
					popupGetRewards:show(randomAwards,nil,nil,nil)
			end)
		) )
	end

end

function LuxuryGiftPkgView:_initListView(listView)
	listView:setTemplate(LuxuryGiftPkgItemCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))
end

function LuxuryGiftPkgView:_refreshListView(listView,itemList)
	local lineCount = #itemList
	listView:clearAll()
	listView:resize(lineCount)
end

function LuxuryGiftPkgView:_refreshItemNodeByIndex(index)
	local itemNode = self:_findItemNodeByIndex(index)
	if itemNode then
		local data = self._listDatas[index]
		itemNode:updateUI(data,index)
	end
end

function LuxuryGiftPkgView:_findItemNodeByIndex(index)
	local items = self._listView:getItems()
	if not items then
		return nil
	end
	for k,v in ipairs(items) do
		if v:getTag() + 1 == index then
			return v
		end
	end
	return nil
end

function LuxuryGiftPkgView:_getListDatas()
	return  self._listDatas
end

function LuxuryGiftPkgView:_onItemUpdate(item, index)
	logWarn("LuxuryGiftPkgView:_onItemUpdate  "..index)
	local itemList = self:_getListDatas()
	local itemData = itemList[index+1]
	item:updateUI(itemData,index+1)
end

function LuxuryGiftPkgView:_onItemSelected(item, index)
	logWarn("LuxuryGiftPkgView:_onItemSelected ")
end

function LuxuryGiftPkgView:_onItemTouch(index, itemPos)
	logWarn("LuxuryGiftPkgView:_onItemTouch "..tostring(index).." "..tostring(itemPos))
	local payType = itemPos+1
	--local rewards = G_UserData:getActivityLuxuryGiftPkg():getRewardsByPayType(payType)
	--local UserCheck = require("app.utils.logic.UserCheck")
	--local full = UserCheck.checkPackFullByAwards(rewards)
	--if not full then
		  	if G_UserData:getActivityLuxuryGiftPkg():isCanReceiveGiftPkg() then
		  	 	G_UserData:getActivityLuxuryGiftPkg():c2sActDiscount(payType)
		  	else
			 

			local vipLevel = G_UserData:getVip():getLevel()
			local unitDataList = G_UserData:getActivityLuxuryGiftPkg():getUnitDatasByPayType(payType)
			local actLuxuryGiftPkgUnitData = unitDataList[1]
			local cfg = actLuxuryGiftPkgUnitData:getConfig()
			local vipLimit = cfg.vip_limit or 0
			if vipLevel < vipLimit then
				G_Prompt:showTip({str = Lang.get("lang_activity_luxurygiftpkg_vip_limit", {num = vipLimit})})
				return
			end
			local payCfg = G_UserData:getActivityLuxuryGiftPkg():getGiftPkgPayCfgByIndex(payType)

		  	G_GameAgent:pay(payCfg.id,
					payCfg.rmb,
					payCfg.product_id,
					payCfg.name,
					payCfg.name)
		  end


	--end

end


function LuxuryGiftPkgView:refreshData()
    local allData =  G_UserData:getActivityLuxuryGiftPkg():getGiftPkgPayCfgList()
	self._listDatas  = allData--数据重置
	self:_refreshListView(self._listView,self._listDatas)

	self:_refreshBuy7DaysView()
end

function LuxuryGiftPkgView:enterModule()
	self._commonBubble:doAnim()
end

function LuxuryGiftPkgView:_refreshBuy7DaysView()
	local showBuyBtn,remainDayNum = G_UserData:getActivityLuxuryGiftPkg():isNeedBuy7Days()
	self._panelRemainDay:setVisible((not showBuyBtn) and remainDayNum ~= 0)

	self:_updateBtnBuy7DayVisible(showBuyBtn)
	self._remainDay:setString(tostring(remainDayNum))
end


function LuxuryGiftPkgView:_onBuy7Day(sender)
	if G_ConfigManager:isAppstore() == false then
		if G_UserData:getActivityLuxuryGiftPkg():hasBuyGoods() then
			G_Prompt:showTip({str = Lang.get("lang_activity_luxurygiftpkg_tomorrow_buy")})
			return
		end

		local vipLevel = G_UserData:getVip():getLevel()
		local vipLimit = G_UserData:getActivityLuxuryGiftPkg():getBuy7DayVipLimit()
		if vipLevel < vipLimit then
			G_Prompt:showTip({str = Lang.get("lang_activity_luxurygiftpkg_vip_limit", {num = vipLimit})})
			return
		end
	end

	local payCfg =  G_UserData:getActivityLuxuryGiftPkg():getBuy7DaysPayConfig()
	G_GameAgent:pay(payCfg.id,
					payCfg.rmb,
					payCfg.product_id,
					payCfg.name,
					payCfg.name)
end

return LuxuryGiftPkgView
