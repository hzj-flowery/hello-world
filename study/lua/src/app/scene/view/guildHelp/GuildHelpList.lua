--
-- Author: Liangxu
-- Date: 2017-06-29 16:57:45
-- 军团援助列表
local ViewBase = require("app.ui.ViewBase")
local GuildHelpList = class("GuildHelpList", ViewBase)
local GuildHelpListCell = require("app.scene.view.guildHelp.GuildHelpListCell")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local VipFunctionIDConst = require("app.const.VipFunctionIDConst")

function GuildHelpList:ctor()
	local resource = {
		file = Path.getCSB("GuildHelpList", "guild"),
		binding = {
			
		}
	}
	GuildHelpList.super.ctor(self, resource)
end

function GuildHelpList:onCreate()
	self._listItemSource:setTemplate(GuildHelpListCell)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))

	--不显示CD时间
	self._textCdTime:setVisible(false)
end

function GuildHelpList:onEnter()
	self._signalGuildGetHelpList = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_HELP_LIST_SUCCESS, handler(self, self._onEventGuildGetHelpList))
	self._signalGuildSurHelpSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_SUR_HELP_SUCCESS, handler(self, self._surHelpSuccess))
	self._signalCommonCountChange = G_SignalManager:add(SignalConst.EVENT_COMMON_COUNT_CHANGE, handler(self, self._onEventCommonCountChange))
	self:_startRefreshHandler()
end

function GuildHelpList:onExit()
	self._signalGuildGetHelpList:remove()
	self._signalGuildGetHelpList = nil
	self._signalGuildSurHelpSuccess:remove()
	self._signalGuildSurHelpSuccess = nil
	self._signalCommonCountChange:remove()
	self._signalCommonCountChange = nil
	self:_endRefreshHandler()
end

function GuildHelpList:_startRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return 
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
end

function GuildHelpList:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function GuildHelpList:_onRefreshTick(dt)
	self:_updateCDTime()
end

function GuildHelpList:updateView()
	G_UserData:getGuild():c2sGetGuildHelp()
end

function GuildHelpList:_updateInfo()
	self:_updateList()

	local count = G_UserData:getGuild():getUserGuildInfo():getAsk_help_cnt()
	local buyCount = G_UserData:getGuild():getUserGuildInfo():getAsk_help_buy()
	local showFreeCount = count > 0 and buyCount <= 0
	if showFreeCount then
		local times = UserDataHelper.getSupportTimes()
		self._textCount:setString(count.." / "..times)
		self._textHelpTitle:setString(Lang.get("guild_help_free_count_title"))
	else
		local VipFunctionIDConst = require("app.const.VipFunctionIDConst")
		local currentValue, maxValue = G_UserData:getVip():getVipTimesByFuncId(VipFunctionIDConst.GUILD_HELP_GOLD_BUY_COUNT)
		self._textCount:setString( (currentValue-buyCount).." / "..currentValue)
		self._textHelpTitle:setString(Lang.get("guild_help_gold_count_title"))
	end
	local countSize = self._textCount:getContentSize()
	self._textCdTime:setPositionX(countSize.width + self._textCount:getPositionX() + 6)

	self:_updateCDTime()


end

function GuildHelpList:_updateCDTime()
	
--[[
	local cdCountDownTime,isForbitHelp = UserDataHelper.getGuildHelpCdCountDownTime()
	self._textCdTime:setColor(isForbitHelp and Colors.DARK_BG_RED or Colors.DARK_BG_GREEN)
	self._textCdTime:setVisible(cdCountDownTime > 0)
	self._textCdTime:setString( Lang.get("common_cd",{time = G_ServerTime:_secondToString(cdCountDownTime)})
	)
	]]
end

function GuildHelpList:_updateList()
	self._guildHelpList = G_UserData:getGuild():getGuildHelpListBySort()
	
	self._listItemSource:clearAll()
	self._listItemSource:resize( math.ceil(#self._guildHelpList/GuildHelpListCell.LINE_ITEM_NUM) )

	self._nodeEmpty:setVisible(#self._guildHelpList <= 0 )
end

function GuildHelpList:_onItemUpdate(item, index)
	if self._guildHelpList[index*2 + 1] then
		item:update(self._guildHelpList[index*2 + 1],self._guildHelpList[index*2 + 2])
	end
end

function GuildHelpList:_onItemSelected(item, index)
	
end


function GuildHelpList:_onItemTouch(index, subIndex,fragmentId)
	local data = self._guildHelpList[index*2 + subIndex]
	if data then
		if not UserDataHelper.checkCanGuildHelpOther(fragmentId) then
			return
		end
		local count = G_UserData:getGuild():getUserGuildInfo():getAsk_help_cnt()
		if count <= 0 then--有剩余次数	
			--[[
			local buyCount = G_UserData:getGuild():getUserGuildInfo():getAsk_help_buy() 	
			local needGold = UserDataHelper.getPriceAdd(10002,buyCount + 1)--价格ID
			local currentValue, maxValue = G_UserData:getVip():getVipTimesByFuncId(	VipFunctionIDConst.GUILD_HELP_GOLD_BUY_COUNT)
			UIPopupHelper.popupConfirm(Lang.get("guild_buy_help_count",{value = needGold,count = currentValue-buyCount}),function() 
				self._reqData = data
				G_UserData:getGuild():c2sBuyCommonCount()
			end)
			]]
			self._reqData = data
			G_UserData:getGuild():c2sBuyCommonCount()
			return 
		end	
		local uid = data:getMember():getUid()
		local helpNo = data:getHelp_base():getHelp_no()
		G_UserData:getGuild():c2sSurGuildHelp(uid, helpNo)
	end
end

--援助成功回调
function GuildHelpList:_surHelpSuccess(eventName, award)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateInfo()
	
	-- local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	-- PopupGetRewards:showRewards(award)
	
	G_Prompt:showAwards(award)
end

function GuildHelpList:_onEventCommonCountChange(eventName, countFunctionId)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	local BuyCountIDConst = require("app.const.BuyCountIDConst")
	if countFunctionId == BuyCountIDConst.GUILD_HELP and self._reqData then
		local data = self._reqData
		self._reqData = nil
		local uid = data:getMember():getUid()
		local helpNo = data:getHelp_base():getHelp_no()
		G_UserData:getGuild():c2sSurGuildHelp(uid, helpNo)
	end
end

function GuildHelpList:_onEventGuildGetHelpList(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateInfo()
end


return GuildHelpList