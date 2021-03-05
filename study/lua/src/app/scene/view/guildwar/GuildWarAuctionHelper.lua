
local GuildWarAuctionHelper = class("GuildWarAuctionHelper")


function GuildWarAuctionHelper:ctor(cityId)
    self._cityId = cityId
end

function GuildWarAuctionHelper:onEnter()
    self._signalGetAuctionInfo = G_SignalManager:add(SignalConst.EVENT_GET_ALL_AUCTION_INFO,
        handler(self,self.onEventGetAuctionInfo) )

    --拍卖开始倒计时,开始时重新请求下数据以便统计
    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local timeRegion = GuildWarDataHelper.getGuildWarTimeRegion()
    local endTime = timeRegion.endTime
    if endTime > G_ServerTime:getTime() then
        G_ServiceManager:registerOneAlarmClock("GuildWarAuctionHelper_Aution", endTime + 2, function()
			G_UserData:getAuction():c2sGetAllAuctionInfo()
        end)
    end

   -- self:checkShowDlg()
	--G_UserData:getAuction():c2sGetAllAuctionInfo()
end


function GuildWarAuctionHelper:onExit()
    self._signalGetAuctionInfo:remove()
	self._signalGetAuctionInfo = nil

    G_ServiceManager:DeleteOneAlarmClock("GuildWarAuctionHelper_Aution")
end

function GuildWarAuctionHelper:onEventGetAuctionInfo(id, message)
	--self:checkShowDlg()
end


function GuildWarAuctionHelper:setCityId(cityId)
      self._cityId = cityId
end

--进入时，检查是否需要弹出跳转提示框
function GuildWarAuctionHelper:checkShowDlg()
	--是否显示弹框
	logWarn("GuildWarAuctionHelper:_showGuildDlg show !!!!!!!!!!! start")
	--军团战拍卖活动是否结束
	local AuctionConst = require("app.const.AuctionConst")
	local isAuctionWorldEnd = G_UserData:getAuction():isAuctionShow(AuctionConst.AC_TYPE_GUILD_WAR_ID)
	if isAuctionWorldEnd == false then
		logWarn("GuildWarAuctionHelper:_showGuildDlg  isAuctionShow = false ")
		return
	end

	if GuildWarAuctionHelper.needShowAutionDlg() == true then
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild then
			self:_showGuildDlg()
		end
	else
		logWarn("GuildWarAuctionHelper:_showGuildDlg needShowAutionDlg false")	
	end	
end


function GuildWarAuctionHelper:_showGuildDlg()
    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
  
    local personDlg = ""
    local AuctionConst = require("app.const.AuctionConst")
    local GuildWarConst = require("app.const.GuildWarConst")
    local itemList,bouns = G_UserData:getAuction():getAuctionData(AuctionConst.AC_TYPE_GUILD_WAR_ID)
    if #itemList <= 0 then
         personDlg = Lang.get("guildwar_auction_content3")
    else
        local state,cityId = GuildWarDataHelper.getBattleResultState(self._cityId)
        local config = GuildWarDataHelper.getGuildWarCityConfig(cityId)
        if state == GuildWarConst.BATTLE_RESULT_ATTACK_SUCCESS then
            personDlg = Lang.get("guildwar_auction_content1",{name = config.name})
        elseif state == GuildWarConst.BATTLE_RESULT_ATTACK_FAIL then
            personDlg = Lang.get("guildwar_auction_content2")
        elseif state == GuildWarConst.BATTLE_RESULT_DEFENDER_SUCCESS then
            personDlg = Lang.get("guildwar_auction_content1",{name = config.name})
        else
            personDlg = Lang.get("guildwar_auction_content2")
        end
        logWarn("ddddddd "..state.." "..tostring(cityId))
    end 

    
          
  
	--跳转到拍卖界面
	local function onBtnGo()
        G_SceneManager:popScene()

        local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION)
	end	



	local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("worldboss_popup_title1"), personDlg,onBtnGo)
	PopupSystemAlert:setCheckBoxVisible(false)
	PopupSystemAlert:showGoButton(Lang.get("worldboss_go_btn2"))
	PopupSystemAlert:setCloseVisible(true)
	PopupSystemAlert:openWithAction()
end





--是否需要显示拍卖对话框
function GuildWarAuctionHelper:needShowAutionDlg()
    local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local oldEndTime = G_UserData:getGuildWar():getAutionDlgTime()
    local timeRegion = GuildWarDataHelper.getGuildWarTimeRegion()
    local endTime = timeRegion.endTime
    local curTime = G_ServerTime:getTime()
    --活动未结束不会弹框
   if curTime >= timeRegion.startTime and curTime < timeRegion.endTime then
        --存下当前活动时间
        logWarn(" GuildDungeonDataHelper:needShopPromptDlg is open  ret false")
        return false
    end
    if oldEndTime == 0 then
        G_UserData:getGuildWar():saveAutionDlgTime(endTime)
        logWarn(" GuildDungeonDataHelper:needShopPromptDlg  oldEndTime = 0 ret true")
        return true
    end
    --老的结束时间小于当前结束时间
    if oldEndTime < endTime then
        --弹出界面，并存下当前时间，下次就不会再弹出界面了
        G_UserData:getGuildWar():saveAutionDlgTime(endTime)
        logWarn(" GuildDungeonDataHelper:needShopPromptDlg  oldEndTime < endTime ret true")
        return true
    end

    dump(oldEndTime)
    dump(endTime)
    return false
end





return GuildWarAuctionHelper