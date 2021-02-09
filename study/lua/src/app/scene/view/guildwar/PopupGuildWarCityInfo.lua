-- Author: conley
-- Date:2018-07-13 14:15:30
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupGuildWarCityInfo = class("PopupGuildWarCityInfo", PopupBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")

function PopupGuildWarCityInfo:ctor(cityId)

    self._cityId = cityId

	--csb bind var name
	self._buttonProclaim = nil  --CommonButtonNormal
	self._panelBg = nil  --CommonNormalSmallPop
	self._textGuildName = nil  --Text
	self._textProclaimNum = nil  --Text

	local resource = {
		file = Path.getCSB("PopupGuildWarCityInfo", "guildwar"),
		binding = {
			_buttonProclaim = {
				events = {{event = "touch", method = "_onButtonProclaim"}}
			},
		},
	}
	PopupGuildWarCityInfo.super.ctor(self, resource)
end

-- Describle：
function PopupGuildWarCityInfo:onCreate()
	self._panelBg:setTitle(Lang.get("popupTitle"))
	self._panelBg:addCloseEventListener(handler(self, self._onCloseClick))

	self._buttonProclaim:setString(Lang.get("guildwar_button_proclaim"))


    self:_refreshCityName()
end

-- Describle：
function PopupGuildWarCityInfo:onEnter()
	self._signalGuildWarDeclareSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_DECLARE_SUCCESS,
         handler(self,self._onEventGuildWarDeclareSuccess))

	self._signalGuildWarDeclareSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_DECLARE_SYN,
         handler(self,self._onEventGuildWarDeclareSyn  ))
	
	
	local guildWarCity = G_UserData:getGuildWar():getCityById( self._cityId )
	if not guildWarCity then
		return
	end

    self:_refreshGuildName(guildWarCity)
    self:_refreshProclaimNum(guildWarCity)
	self:_updateBtnState(guildWarCity)
end

-- Describle：
function PopupGuildWarCityInfo:onExit()
	self._signalGuildWarDeclareSuccess:remove()
    self._signalGuildWarDeclareSuccess = nil

	self._signalGuildWarDeclareSyn:remove()
	self._signalGuildWarDeclareSyn = nil
end


function PopupGuildWarCityInfo:_onEventGuildWarDeclareSuccess(event)
	--给出tips
	G_Prompt:showTip(Lang.get("guildwar_tips_proclaim_success"))

end

function PopupGuildWarCityInfo:_onEventGuildWarDeclareSyn(event)
	local guildWarCity = G_UserData:getGuildWar():getCityById( self._cityId )
	if not guildWarCity then
		return
	end
	self:_refreshGuildName(guildWarCity)
    self:_refreshProclaimNum(guildWarCity)
	self:_updateBtnState(guildWarCity)
end

function PopupGuildWarCityInfo:_onCloseClick()
    self:closeWithAction()
end


function PopupGuildWarCityInfo:_onButtonProclaim()
	local declareCallback = function()
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		local success = LogicCheckHelper.guildWarCanProclaim(self._cityId)	
		if success then
			G_UserData:getGuildWar():c2sGuildWarDeclareCity(self._cityId)
		end
		
	end
	local guild = G_UserData:getGuild():getMyGuild()
    local lastDeclareTime = guild and guild:getWar_declare_time() or 0 
	if lastDeclareTime > 0 then
		local money =  GuildWarDataHelper.getGuildWarProclaimCD()
		local UIPopupHelper = require("app.utils.UIPopupHelper")
		UIPopupHelper.popupConfirm(Lang.get("guildwar_declare_alert_content",{value = money}),function()
			declareCallback()
		end)
		return 
	else
		declareCallback()	
	end

  
end

function PopupGuildWarCityInfo:_refreshCityName()
    local config = GuildWarDataHelper.getGuildWarCityConfig(self._cityId)
    self._panelBg:setTitle(config.name)
end

function PopupGuildWarCityInfo:_refreshGuildName(guildWarCity)
	if guildWarCity:getOwn_guild_id() ~= 0 then
		 self._textGuildName:setString(guildWarCity:getOwn_guild_name())
	else
		 self._textGuildName:setString(Lang.get("guildwar_no_owner"))	 
	end
   
end

function PopupGuildWarCityInfo:_refreshProclaimNum(guildWarCity)
    self._textProclaimNum:setString(tostring(
        guildWarCity:getDeclare_guild_num()
    ))
end





function PopupGuildWarCityInfo:_updateBtnState(guildWarCity)
	local haveDeclarePermission  = false
	if G_UserData:getGuild():isInGuild() then
		local GuildConst = require("app.const.GuildConst")
		local UserDataHelper = require("app.utils.UserDataHelper")
		haveDeclarePermission = UserDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_15)
	end
	local isDeclare = guildWarCity:isIs_declare() and  G_UserData:getGuild():isInGuild()
	local canDeclare = GuildWarDataHelper.isCityCanBeAttack(guildWarCity:getCity_id(), GuildWarDataHelper.getOwnCityId())

	self._buttonProclaim:setEnabled(haveDeclarePermission and not isDeclare and canDeclare )


	local guildHasDeclare = GuildWarDataHelper.guildHasDeclare()
	if isDeclare then
		self._buttonProclaim:setString(Lang.get("guildwar_button_already_proclaim"))
	elseif guildHasDeclare then	
		self._buttonProclaim:setString(Lang.get("guildwar_button_change_proclaim"))
	else	
		self._buttonProclaim:setString(Lang.get("guildwar_button_proclaim"))
	end
	
end

return PopupGuildWarCityInfo