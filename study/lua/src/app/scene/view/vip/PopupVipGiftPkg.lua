
local PopupBase = require("app.ui.PopupBase")
local PopupVipGiftPkg = class("PopupVipGiftPkg", PopupBase)
local VipGiftPkgItemCell = require("app.scene.view.vip.VipGiftPkgItemCell")
local UserDataHelper = require("app.utils.UserDataHelper")

function PopupVipGiftPkg:ctor()
	local resource = {
		file = Path.getCSB("PopupVipGiftPkg", "vip"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			}
		}
	}
	PopupVipGiftPkg.super.ctor(self, resource,true)
end

function PopupVipGiftPkg:onCreate()
    self._listItemSource:setTemplate(VipGiftPkgItemCell)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))
end


function PopupVipGiftPkg:onEnter()
    self._signalVipGetVipGiftItems = G_SignalManager:add(SignalConst.EVENT_VIP_GET_VIP_GIFT_ITEMS, handler(self, self._onEventGetVipGift))
	self._signalRechargeGetInfo = G_SignalManager:add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(self, self._onEventRechargeGetInfo ))
    self:_updateList()
	self:_updateListPos()
	logWarn("PopupVipGiftPkg ---------------- onEnter")
end

function PopupVipGiftPkg:onExit()

	self._signalVipGetVipGiftItems:remove()
	self._signalVipGetVipGiftItems = nil

	self._signalRechargeGetInfo:remove()
	self._signalRechargeGetInfo = nil
end

function PopupVipGiftPkg:_onEventGetVipGift(id, message)
	--显示奖励
	local awards = rawget(message, "reward") or {}
	local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	PopupGetRewards:showRewards(awards)
	 
    self:_updateList()
end

function PopupVipGiftPkg:_onEventRechargeGetInfo(id, message)
	self:_updateList()
end



function PopupVipGiftPkg:_onItemUpdate(item, index)
	if self._listData[index + 1] then
		item:updateUI(self._listData[index + 1] )
	end
end

function PopupVipGiftPkg:_onItemSelected(item, index)
    
end

function PopupVipGiftPkg:_onItemTouch(lineIndex,index)
	local vipItemData = self._listData[index + 1]
	if not vipItemData then
		return
	end
	
	local vipLevel = vipItemData:getId()
	local playerVipLevel = G_UserData:getVip():getLevel()
	if playerVipLevel < vipLevel then	
		local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE)    
		return
	end

    local config = vipItemData:getInfo()
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local success,popFunc = LogicCheckHelper.enoughCash(config.price)
	if success == true then
        G_NetworkManager:send(MessageIDConst.ID_C2S_GetVipReward, {
		    vip_level = vipItemData:getId(),
	    })
	elseif popFunc then
		popFunc()			
	end
end

function PopupVipGiftPkg:_onBtnClose()
	self:close()
end



function PopupVipGiftPkg:_updateList()
	self._listData = UserDataHelper.getVipGiftPkgList() 
	self._listItemSource:clearAll()
	self._listItemSource:resize(#self._listData)


end

function PopupVipGiftPkg:_updateListPos()
	local index = UserDataHelper.findFirstCanReceiveGiftPkgIndex(self._listData)
	if not index then
		index = UserDataHelper.findFirstUnReceiveGiftPkgIndex(self._listData)
	end
	if not index then
		index = #self._listData
	end
	self._listItemSource:setLocation(index)
end

return PopupVipGiftPkg