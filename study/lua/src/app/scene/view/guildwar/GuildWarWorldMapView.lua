

local ViewBase = require("app.ui.ViewBase")
local GuildWarWorldMapView = class("GuildWarWorldMapView", ViewBase)
local CurveHelper = require("app.scene.view.guildwarbattle.CurveHelper")


local GuildWarCityNode = require("app.scene.view.guildwar.GuildWarCityNode")
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
local AudioConst = require("app.const.AudioConst")

function GuildWarWorldMapView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	local msgReg = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_CITY_INFO_GET, onMsgCallBack)
	G_UserData:getGuildWar():c2sGetGuildWarWorld()
	return msgReg
end


function GuildWarWorldMapView:ctor()
    self._nodeCityParent = nil
    self._nodeCitys = {}
	local resource = {
		file = Path.getCSB("GuildWarWorldMapView", "guildwar"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
            
        }
	}
	GuildWarWorldMapView.super.ctor(self, resource)
end

function GuildWarWorldMapView:onCreate()

	self._topbarBase:setImageTitle("txt_sys_com_guildwar")
 	local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

 	self._commonHelp:updateUI(FunctionConst.FUNC_GUILD_WAR)

    self:_createCityNodes()

end

function GuildWarWorldMapView:onEnter()
	G_AudioManager:playMusicWithId(AudioConst.MUSIC_GUILD_WAR_MAP)
    self._signalGuildWarCityInfoGet = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_CITY_INFO_GET, handler(self,self._onEventGuildWarCityInfoGet ))
	self._signalGuildWarCityDeclareSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_DECLARE_SYN, handler(self,self._onEventGuildWarCityDeclareSyn ))
	self._signalGuildWarBattleInfoGet = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET,
         handler(self,self._onEventGuildWarBattleInfoGet ))
 	self._signalLoginSuccess = G_SignalManager:add(SignalConst.EVENT_LOGIN_SUCCESS, handler(self, self._onEventLoginSuccess))

    self:_startTimer()
	self:_startRefreshCityTimer()
	self:_refreshTimeView()
    self:_refreshCityNodes()

	

end	

function GuildWarWorldMapView:onExit()
    self:_endTimer()
	self:_endRefreshCityTimer()

	self._signalGuildWarCityInfoGet:remove()
    self._signalGuildWarCityInfoGet = nil

    self._signalGuildWarBattleInfoGet:remove()
    self._signalGuildWarBattleInfoGet = nil

	self._signalGuildWarCityDeclareSyn:remove()
	self._signalGuildWarCityDeclareSyn = nil

	self._signalLoginSuccess:remove()
    self._signalLoginSuccess = nil
end


function GuildWarWorldMapView:_onEventGuildWarBattleInfoGet(event,cityId)
	G_SceneManager:showScene("guildwarbattle",cityId)	
end

function GuildWarWorldMapView:_onEventGuildWarCityInfoGet(event)
    self:_refreshCityNodes()
end


function GuildWarWorldMapView:_onEventGuildWarCityDeclareSyn(event)
	self:_refreshCityNodes()
end

function GuildWarWorldMapView:_onEventLoginSuccess()
	G_UserData:getGuildWar():clearBattleData()
    G_UserData:getGuildWar():c2sGetGuildWarWorld()
end

function GuildWarWorldMapView:_startTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
end

function GuildWarWorldMapView:_endTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function GuildWarWorldMapView:_startRefreshCityTimer()
	local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
    local timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion()
	local curTime = G_ServerTime:getTime()
    local time = curTime < timeData.startTime and  timeData.startTime or  timeData.endTime
	G_ServiceManager:registerOneAlarmClock("GuildWarWorldMapView_endtime",time, function()
		self:_refreshCityNodes()
		self:_startRefreshCityTimer()
	end)
end

function GuildWarWorldMapView:_endRefreshCityTimer()
	  G_ServiceManager:DeleteOneAlarmClock("GuildWarWorldMapView_endtime")
end

function GuildWarWorldMapView:_createCityNodes()
	local GuildWarCity = require("app.config.guild_war_city")
    local cityList = G_UserData:getGuildWar():getCityList()
    for k,v in pairs(cityList) do
         local cityId = v:getCity_id()
         local config = GuildWarCity.get(cityId)
         assert(config,"guild_war_city can not find id "..tostring(cityId))
         local cityNode = GuildWarCityNode.new(config)
         self._nodeCityParent:addChild(cityNode)
         table.insert(  self._nodeCitys, cityNode )
    end 
end

function GuildWarWorldMapView:_refreshCityNodes()
    for k,v in ipairs(self._nodeCitys) do
        v:updateUI()
    end
end

function GuildWarWorldMapView:_onRefreshTick(dt)
	self:_refreshTimeView()
end

function GuildWarWorldMapView:_refreshTimeView() 
	local timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion()
    local curTime = G_ServerTime:getTime()
    
    local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")
    local bQualification,_ = GuildCrossWarHelper.isGuildCrossWarEntry()
    local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()
    local bGuildCrosShow = bQualification and bOpenToday

    if curTime >= timeData.startTime and curTime < timeData.time1 then
        local time =  bGuildCrosShow and (timeData.time1 + 7 * 24 * 3600) or timeData.time1
		local txt = G_ServerTime:getLeftSecondsString(time, "00:00:00")
		self._textTimeTitle:setString(Lang.get("guildwar_prepare_downtime"))
		self._textTime:setString(txt)
    elseif curTime >= timeData.time1 and curTime < timeData.endTime then
        local time = bGuildCrosShow and (timeData.endTime + 7 * 24 * 3600) or timeData.endTime
		local txt = G_ServerTime:getLeftSecondsString(time, "00:00:00")
		self._textTimeTitle:setString(Lang.get("guildwar_close_downtime"))	
		self._textTime:setString(txt)
    else
        local time = bGuildCrosShow and (timeData.startTime + 7 * 24 * 3600) or timeData.startTime
		local txt = G_ServerTime:getLeftSecondsString(time, "00:00:00")
		self._textTimeTitle:setString(Lang.get("guildwar_open_downtime"))
		self._textTime:setString(txt)
    end
end

return GuildWarWorldMapView
