-- @Author panhoa
-- @Date 8.17.2018
-- @Role 

local BaseData = import(".BaseData")
local SeasonSportData = class("SeasonSportData", BaseData)
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")

local schema = {}
schema["curSeason"]		= {"number",  0}		-- 当前第几赛季
schema["season_Stage"]	= {"number",  0}		-- 赛季类别
schema["inHerit"]	    = {"boolean",  false}	-- 是否赛季继承
schema["seasonStartTime"] = {"number",  0}		-- 赛季开始时间
schema["seasonEndTime"] = {"number",  0}		-- 赛季剩余时间
schema["lastSeason_Star"]= {"number",  0}		-- 上赛季星数
schema["curSeason_Star"]= {"number",  0}		-- 本赛季星数
schema["serverId"] 		= {"number",  0}		-- 服务器ID
schema["prior"]			= {"number",  0}		-- 是否先手（1 是先手/2不是
schema["suspendTime"]	= {"number",  0}		-- 禁赛时间
schema["silkGroupInfo"]	= {"table",  {}}		-- 锦囊组信息
schema["receivedRewards"]	= {"boolean", false}-- 赛季奖励是否已领取
schema["bindedSilkGroups"]	= {"table",  {}}	-- 已经绑定的锦囊组信息
schema["onGoing"]		= {"boolean", false}	-- 上阵继续
schema["season_Fight_Num"]={"number", 0}		-- 赛季战斗次数
schema["season_Win_Num"]  ={"number", 0}		-- 赛季胜利次数

--------------------------------------------------------
schema["ownRank"]		= {"number",  0}		-- 我的排名：0表示未上榜
schema["ownFightCount"]	= {"number",  0}		-- 我的战斗场数
schema["ownWinCount"]	= {"number",  0}		-- 我的胜利场次

--------------------------------------------------------
schema["ownFightReport"] 	= {"table", {}}		-- 我的战报
schema["own_DanInfo"]	= {"table",  {}}		-- 本方段位信息
schema["other_DanInfo"]	= {"table",  {}}		-- 对方段位信息
schema["currentRound"]	= {"number",  0}		-- 当前回合
schema["currentRound_EndTime"]	= {"number",  0}-- 当前回合结束时间
schema["own_SquadInfo"]	 = {"table",  {}}		-- 本方阵容信息
schema["own_SquadType"]	 = {"table",  {}}		-- 本方武将类型
schema["other_SquadInfo"]= {"table", {}}		-- 对方阵容信息
schema["timeOutCD"]		 = {"number", 0}		-- CD超时：1本方超时/2对方
schema["squadOffline"]	 = {"boolean", false}	-- 上阵阶段断线（内部重连）
schema["squadReconnect"] = {"boolean", false}	-- 是否是重连上线
schema["inSquadSelectView"] = {"boolean", false}-- 是否在上阵界面 

---------------------------------------------------------
schema["dailyFightReward"] = {"table", {}}		-- 每日奖励:战斗奖励
schema["dailyWinReward"]   = {"table", {}}		-- 每日奖励:胜利奖励
schema["fightNum"]		   = {"number", 0}		-- 每日战斗次数
schema["winNum"]		   = {"number", 0}		-- 每日胜利次数
schema["seasonPets"]	   = {"table", {}}		-- 神兽
schema["seasonPetsStar"]   = {"number", 0}		-- 神兽星级
schema["banHeros"]	   	   = {"table", {}}		-- 搬选武将
schema["banPets"]	   	   = {"table", {}}		-- 搬选神兽
schema["banPick"]	 	   = {"boolean", false}	-- 是否搬选
schema["playReport"]	   = {"boolean", false}	-- 是否重新播放战报


SeasonSportData.schema = schema
function SeasonSportData:ctor(properties)
	SeasonSportData.super.ctor(self, properties)
	self._heroListInfo = {}			-- 所有橙红武将
	self._orangeHeroListInfo = {}	-- 橙色武将
	self._redHeroListInfo 	 = {}	-- 红将
	self._goldenHeroListInfo = {} 	-- 金将
	self._freeOpenSilkGroup  = {}	-- 免费开放的锦囊组
	self._transformCards	 = {} 	-- 变身卡武将
	self._petListInfo		 = {} 	-- 神兽列表
	self._isInSeasonSilkView = false-- 是否在赛季锦囊界面中
	self._isModifySilkGroupName = false -- 标记锦囊组改名
	self._isCancelMatch      = true	-- 只作显示取消UI的显示状态
	self._isMatchSuccess 	 = false -- 匹配成功瞬间不能点击取消匹配
	self._isOtherCDOut 		 = false -- 对方CD过提示
	self._ownCDOutAndDropStar = 0 -- 己方CD过并扣星

	self._fightInfo 	 = G_NetworkManager:add(MessageIDConst.ID_S2C_GetFightInfo, handler(self, self._s2cFightInfo))			-- 赛季开始、结束时间
	self._fightsEntrance = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsEntrance, handler(self, self._s2cFightsEntrance))	-- 开始赛季
	self._fightsLadder 	 = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsLadder, handler(self, self._s2cFightsLadder))		-- 赛季排行
	self._fightsBonus 	 = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsBonus, handler(self, self._s2cFightsBonus))			-- 赛季奖励	
	self._fightsInitiate = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsInitiate, handler(self, self._s2cFightsInitiate))	-- 匹配
	self._fightsCancel   = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsCancel,   handler(self, self._s2cFightsCancel))		-- 取消匹配
	
	self._fightsReport   = G_NetworkManager:add(MessageIDConst.ID_S2C_CommonGetReport, handler(self, self._s2cFightsReport))	-- 战报
	self._playReport     = G_NetworkManager:add(MessageIDConst.ID_S2C_GetBattleReport, handler(self, self._s2cPlayFightsReport))-- 播放战报
	
	self._fightsBan  		  	  = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsBan,   handler(self, self._s2cFightsBan))	     -- 正在搬选
	self._fightsBanCheck  		  = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsBanCheck, handler(self, self._s2cFightsBanCheck))	-- 搬选武将
	self._fightsBanPick  		  = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsBanPick,   handler(self, self._s2cFightsBanPick))	-- 选择上阵武将
	self._fightsReconnect		  = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsReconnection, handler(self, self._s2cFightsReconnection))-- 战斗重连
	self._fightsSilkbagBinding    = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsSilkbagBinding,   handler(self, self._s2FightsSilkbagBinding))		-- 绑定锦囊
	self._fightsSilkbagSetting 	  = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsSilkbagSetting, handler(self, self._s2cFightsSilkbagSetting))		-- 装备锦囊
	self._fightsMatchedOpponent   = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsMatchedOpponent,   handler(self, self._s2cFightsMatchedOpponent))	-- 匹配到玩家
end

function SeasonSportData:clear()
	self._fightInfo:remove()
	self._fightsEntrance:remove()
	self._fightsLadder:remove()
	self._fightsBonus:remove()
	self._fightsInitiate:remove()
	self._fightsCancel:remove()
	self._fightsBan:remove()
	self._fightsBanCheck:remove()
	self._fightsBanPick:remove()
	self._fightsReport:remove()
	self._playReport:remove()
	self._fightsReconnect:remove()
	self._fightsSilkbagBinding:remove()
	self._fightsSilkbagSetting:remove()
	self._fightsMatchedOpponent:remove()
	
	self._fightInfo		 = nil
	self._fightsEntrance = nil
	self._fightsLadder	 = nil
	self._fightsBonus	 = nil
	self._fightsInitiate = nil
	self._fightsCancel 	 = nil
	self._fightsBan		 = nil
	self._fightsBanCheck = nil
	self._fightsBanPick	 = nil
	self._fightsReport	 = nil
	self._playReport	 = nil
	self._fightsReconnect= nil
	self._fightsSilkbagBinding = nil
	self._fightsSilkbagSetting = nil
	self._fightsMatchedOpponent= nil
end

--
function SeasonSportData:reset()
end

-------------------------------------------------------------------
-- @Role Response Require N赛季结束时间(游戏主界面Icon监听))
function SeasonSportData:_s2cFightInfo(id, message)
	self:setSeasonStartTime(message.season_start)
	self:setSeasonEndTime(message.season_end)

	if G_ServerTime:getTime() == self:getSeasonEndTime() then
		G_ServiceManager:registerOneAlarmClock("SeasonMainBtn3",message.season_end, function()
			G_NetworkManager:send(MessageIDConst.ID_C2S_GetFightInfo, {})	
		end)
	elseif G_ServerTime:getTime() < self:getSeasonStartTime() then
		G_ServiceManager:registerOneAlarmClock("SeasonMainBtn1",message.season_start, function()
			G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SEASONSOPRT)
			G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_START)
		end)
	elseif G_ServerTime:getTime() < self:getSeasonEndTime() then
		G_ServiceManager:registerOneAlarmClock("SeasonMainBtn2",message.season_end+1, function()
			G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SEASONSOPRT)
			G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_END)
		end)		
	end
end

-------------------------------------------------------------------
-- @Role Entry Require 进入赛季
function SeasonSportData:c2sFightsEntrance()
	G_NetworkManager:send(MessageIDConst.ID_C2S_FightsEntrance, {})
end

-- @Role Entry Response
function SeasonSportData:_s2cFightsEntrance(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self._isMatchSuccess = false

	-- 锦囊信息
	self._freeOpenSilkGroup = SeasonSportHelper.getFreeDan()
	G_UserData:getSeasonSilk():initOrangeSilkInfo(message.group)
    G_UserData:getSeasonSilk():initRedSilkInfo(message.group)
    G_UserData:getSeasonSilk():initGoldSilkInfo(message.group)
	self._ownCDOutAndDropStar = rawget(message, "reduce_star") ~= nil and 
								message.reduce_star or 0

	if self:isSquadReconnect() == false then		-- 此位置顺序不要轻易改动
		self:setTimeOutCD(0)
	end

    --[[self:setSeason_Stage(3)
    self:setPrior(2)
    self:setCurrentRound(3)
    self:setBanPick(false)]]

	self:setServerId(message.sid)
	self:setInHerit(message.is_inherit or false)
	self:setLastSeason_Star(message.history_star ~= 0 and message.history_star or 1)
	if type(message.history_star) == "table" then 	-- 瞎搞（只能等待服务器找到bug
		self:setLastSeason_Star(1)					-- 玩家肯定会骂四）
	end

	self:setCurSeason_Star(message.now_star > 0 and message.now_star or 1)
	self:setSeason_Stage(message.group)
	self:setSuspendTime(message.no_entry_end_time or 0)
	self:setSilkGroupInfo(message.silkbag_config)
	self:setSeasonEndTime(message.season_end_time)
	self:setCurSeason(message.season)
	self:setBindedSilkGroups(message.unit_silkbag_binding)
	self:setReceivedRewards(message.is_history_bonus_recved == 0 and true or false)
	self:setOnGoing(message.be_ongoing)

	local dailyFight = bit.tobits(message.daily_fight_reward)
	local dailyWin = bit.tobits(message.daily_win_reward)
	self:setDailyFightReward(dailyFight)
	self:setDailyWinReward(dailyWin)
	self:setFightNum(message.fight_num)
	self:setWinNum(message.win_num)
	self:setSeason_Fight_Num(message.season_fight_num)
	self:setSeason_Win_Num(message.season_win_num)
	self:setSeasonPets(rawget(message, "pets"))

	-- silkGroup sort
	table.sort(self:getSilkGroupInfo(), function(item1, item2)
		return item1.idx < item2.idx
	end)

	-- Pets' Star
	if message.group == SeasonSportConst.SEASON_STAGE_ROOKIE then
		self:setSeasonPetsStar(tonumber(SeasonSportHelper.getParameterConfigById(
										SeasonSportConst.SEASON_PET_ROOKIE_STARMAX).content))
	elseif message.group == SeasonSportConst.SEASON_STAGE_ADVANCED then
		self:setSeasonPetsStar(tonumber(SeasonSportHelper.getParameterConfigById(
                                        SeasonSportConst.SEASON_PET_ADVANC_STARMAX).content))
    elseif message.group == SeasonSportConst.SEASON_STAGE_HIGHT then
        self:setSeasonPetsStar(tonumber(SeasonSportHelper.getParameterConfigById(
                                    SeasonSportConst.SEASON_PET_HIGHT_STARMAX).content))
	end

	-- 武将信息
	self._orangeHeroListInfo = SeasonSportHelper.getOrangeHeroList(message.group)
	self._redHeroListInfo = SeasonSportHelper.getRedHeroList(message.group)
	self._goldenHeroListInfo = SeasonSportHelper.getGoldenHeroList(message.group)
	self._heroListInfo = SeasonSportHelper.getHeroList(message.group)
	self._transformCards = SeasonSportHelper.getTransformCards(message.group)
	self._petListInfo = SeasonSportHelper.getPetList()

	if self:isOnGoing() then
		self:setSquadReconnect(true)
		self:c2sFightsReconnection()
	else
		self:setSquadReconnect(false)
		G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, message)
	end
end

---------------------------------------------------------------------
-- @Role 	Require Reconnect 请求重连
function SeasonSportData:c2sFightsReconnection()
	G_NetworkManager:send(MessageIDConst.ID_C2S_FightsReconnection, {})
end

-- @Role 	Response Response
function SeasonSportData:_s2cFightsReconnection(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_RECONNECT_OVER, message)
		return
	end

	self._isMatchSuccess = true
	local maxStage = SeasonSportHelper.getMaxFightStage()
	local ownDanInfo = {
		isOwn 	= true,
		baseId 	= G_UserData:getBase():getPlayerBaseId(), -- base_id/avatar_base_id转换过
		sid   	= G_UserData:getBase():getServer_name(),
		star	= self:getCurSeason_Star(),
		name	= G_UserData:getBase():getName(),
		isProir = message.is_first == 1 and true or false,
		officialLevel = G_UserData:getBase():getOfficialLevel()
	}
	self:setOwn_DanInfo(ownDanInfo)
	local otherDanInfo = {
		isOwn 	= false,
		sid   	= message.sname,
		name  	= message.uname,
		star  	= message.star,
		isProir = message.is_first == 2 and true or false,
		officialLevel = message.title
	}
	local round = rawget(message, "round") or 0
	
	self:setOnGoing(true)
	self:setOther_DanInfo(otherDanInfo)
	self:setCurrentRound(message.round > maxStage and maxStage or message.round)-- 当前第n回合
	self:setCurrentRound_EndTime(message.round_end_time) 	 -- 当前回合结束时间
	self:setOwn_SquadInfo(message.own_side)					 -- 本方阵容
	self:setOwn_SquadType(message.own_side_avater)			 -- 本方上阵类型
	self:setOther_SquadInfo(message.other_side) 			 -- 对方阵容
    self:setBanHeros(rawget(message, "ban_units"))			 -- ban人阵容
    self:setBanPets(rawget(message, "ban_pets"))             -- ban神兽
	self:setPrior(message.is_first)							 -- 是否先手
	self:setSquadOffline(false)								 -- 上阵阶段是否断线：默认不断开
	self:setBanPick(false)									 -- 是否要搬选武将

	local banNeedStar = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NEEDSTAR).content)
	if not (ownDanInfo.star < banNeedStar and otherDanInfo.star < banNeedStar) then
		self:setBanPick(true)
	end

	if self:isInSquadSelectView() == false then
		G_SceneManager:showScene("seasonCompetitive")
	end
	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_RECONNECT, message)
end

---------------------------------------------------------------------
-- @Role 	Setting silk Require 装备锦囊
-- @Param	groupPos 锦囊组号
-- @Param	groupName锦囊组名
-- @Param	silkbags 锦囊
function SeasonSportData:c2sFightsSilkbagSetting(groupPos, groupName, groupsSilks)
	local silkbag_config = {
		idx = groupPos,
		name = groupName,
		silkbag = groupsSilks or {}
	}
	G_NetworkManager:send(MessageIDConst.ID_C2S_FightsSilkbagSetting, {silkbag_config = silkbag_config})
end

-- @Role Setting silk Response
function SeasonSportData:_s2cFightsSilkbagSetting(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_SILKEQUIP_SUCCESS, message)
end

---------------------------------------------------------------------
-- @Role Match Require 排行榜
function SeasonSportData:c2sFightsLadder()
	G_NetworkManager:send(MessageIDConst.ID_C2S_FightsLadder, {})
end

-- @Role Match Response
function SeasonSportData:_s2cFightsLadder(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	--self:setSeasonRank(message.ladder or nil)
	self:setCurSeason_Star(message.star > 0 and message.star or 1)
	self:setOwnRank(message.rank or 0)
	self:setOwnFightCount(message.fight_count or 0)
	self:setOwnWinCount(message.win_count or 0)
	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_RANK, message)
end

---------------------------------------------------------------------
-- @Role Match Require 赛季奖励
function SeasonSportData:c2sFightsBonus(type, idx)
	G_NetworkManager:send(MessageIDConst.ID_C2S_FightsBonus, {bonus_type = type, idx = idx})
end

-- @Role Match Response
function SeasonSportData:_s2cFightsBonus(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_UserData:getSeasonSport():setReceivedRewards(message.reward_state == 0 or false)
	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_REWARDS, message)
end

----------------------------------------------------------------------
-- @Role Match Require 匹配
function SeasonSportData:c2sFightsInitiate()
	G_NetworkManager:send(MessageIDConst.ID_C2S_FightsInitiate, {})
end

-- @Role Match Response
function SeasonSportData:_s2cFightsInitiate(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_MATCHING, message)
end

-- @Role Match Response Result 匹配到结果
function SeasonSportData:_s2cFightsMatchedOpponent(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		if message.ret == MessageErrorConst.RET_FIGHTS_MATCH_TIMEOUT then
			G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_MATCH_TIMEOUT, message)
		end
		return
	end

    self._isMatchSuccess = true
    self:setCurSeason_Star(message.own_star > 0 and message.own_star or 1)
	local ownDanInfo = {
		isOwn 	= true,
		baseId 	= G_UserData:getBase():getPlayerBaseId(), -- base_id/avatar_base_id转换过
		sid   	= G_UserData:getBase():getServer_name(),
		star	= message.own_star,--self:getCurSeason_Star(),
		name	= G_UserData:getBase():getName(),
		isProir = message.is_first == 1,
		officialLevel = G_UserData:getBase():getOfficialLevel(),
		head_frame_id = G_UserData:getBase():getHead_frame_id()
	}
	self:setOwn_DanInfo(ownDanInfo)
	local otherDanInfo = {
		isOwn 	= false,
		sid   	= message.sname,
		name  	= message.uname,
		star  	= message.star,
		baseId	= message.base_id,
		avatarId= message.avatar_base_id,
		isProir = message.is_first == 2,
		officialLevel = message.title,
		head_frame_id = rawget(message,"head_icon_id")
	}
	
	self:setOther_DanInfo(otherDanInfo)
	self:setCurrentRound(1) 									-- 第一回合
	self:setPrior(message.is_first) 							-- 本方是否先手1是/2不是
	self:setCurrentRound_EndTime(message.round_end_time) 		-- 第一回合结束时间
	self:setSquadOffline(false)									-- 上阵阶段是否断线：默认不断开
	self:setBanPick(false)										-- 是否要搬选武将
    self:setBanHeros(nil)
    self:setBanPets(nil)

	local banNeedStar = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NEEDSTAR).content)
	if not (ownDanInfo.star < banNeedStar and otherDanInfo.star < banNeedStar) then
		self:setCurrentRound(0)
		self:setBanPick(true)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_FIGHT_MATCH, message)
end

----------------------------------------------------------------------
-- @Role Cancel Match Require 取消匹配
function SeasonSportData:c2sFightsCancel()
	G_NetworkManager:send(MessageIDConst.ID_C2S_FightsCancel, {})
end

-- @Role Cancel Match Response
function SeasonSportData:_s2cFightsCancel(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setCancelMatch(true)
	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_CANCEL_MATCH, message)
end

----------------------------------------------------------------------
-- @Role 	Bind to hero Require 锦囊绑定到武将
function SeasonSportData:c2sFightsSilkbagBinding(data, pets)
	G_NetworkManager:send(MessageIDConst.ID_C2S_FightsSilkbagBinding, {skb = data, pets = pets})
end

-- @Role 	Bind to hero Require
function SeasonSportData:_s2FightsSilkbagBinding(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_BINDINGOK)
end

------------------------------------------------------------------------
-- @Role 	搬选武将
-- @Param 	data 武将id列表
function SeasonSportData:c2sFightsBan(data, pets)
	G_NetworkManager:send(MessageIDConst.ID_C2S_FightsBan, {units = data, pets = pets})
end

-- @Role 	Response Baning
function SeasonSportData:_s2cFightsBan(id, message)
	--[[if message.ret ~= MessageErrorConst.RET_OK then
		return
	end]]

	self:setBanPick(false)
	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_WAITING_BAN, message)
end

-- @Role 	Response Baned Heros	
function SeasonSportData:_s2cFightsBanCheck(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	self:setBanPick(false)
	self:setCurrentRound(1)
    self:setBanHeros(rawget(message, "units"))
    self:setBanPets(rawget(message, "pets"))
	self:setCurrentRound_EndTime(message.round_end_time)

	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_HEROS_BAN, message)
end

------------------------------------------------------------------------
-- @Role  BanHero 选择上阵武将
-- @param heroId  武将ID
-- @Param pos	  坑位
function SeasonSportData:c2sFightsBanPick(data)
	G_NetworkManager:send(MessageIDConst.ID_C2S_FightsBanPick, {bp = data})
end

-- @Role  BanHero Response
function SeasonSportData:_s2cFightsBanPick(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local maxStage = SeasonSportHelper.getMaxFightStage()
	self:setCurrentRound(message.round > maxStage and maxStage or message.round)-- 当前第n回合
	self:setCurrentRound_EndTime(message.round_end_time) 	 -- 当前回合结束时间
	self:setOwn_SquadInfo(message.own_side)					 -- 本方阵容
	self:setOwn_SquadType(message.own_side_avater)			 -- 本方上阵类型
	self:setOther_SquadInfo(message.other_side) 			 -- 对方阵容
	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_HEROS_PITCH, message)
end

----------------------------------------------------------------------
-- @Role Fight Require 战斗
function SeasonSportData:c2sFightsFight()
	G_NetworkManager:send(MessageIDConst.ID_C2S_FightsFight, {})
end
----------------------------------------------------------------------
-- @Role FightReport Require 战报列表
function SeasonSportData:c2scFightsReport()
	G_NetworkManager:send(MessageIDConst.ID_C2S_CommonGetReport, {report_type = 6})
end

-- @Role FightReport Response
function SeasonSportData:_s2cFightsReport(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	if rawget(message, "report_type") ~= 6 then
		return
	end

	self:setOwnFightReport(message.fights_reports)
	table.sort(self:getOwnFightReport(), function(item1, item2)
		return item1.report_time > item2.report_time
	end)

	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_OWNFIGHTREPORT, message)
end

----------------------------------------------------------------------
-- @Role PlayFightReport Require 播放战报
function SeasonSportData:c2scPlayFightsReport(reportId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetBattleReport, {id = reportId})
end

-- @Role PlayFightReport Response
function SeasonSportData:_s2cPlayFightsReport(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_PLAYFIGHTREPORT, message)
end

------------------------------------------------------------------------
-- @Role 	设置Flag
function SeasonSportData:setInSeasonSilkView(bIn)
	self._isInSeasonSilkView = bIn
end

function SeasonSportData:getInSeasonSilkView()
	return self._isInSeasonSilkView
end

------------------------------------------------------------------------
-- @Role 	设置Flag
function SeasonSportData:setModifySilkGroupName(bModify)
	self._isModifySilkGroupName = bModify
end

function SeasonSportData:getModifySilkGroupName()
	return self._isModifySilkGroupName
end

------------------------------------------------------------------------
-- @Role 	设置Flag
function SeasonSportData:setCancelMatch(bCancel)
	self._isCancelMatch  = bCancel
end

function SeasonSportData:getCancelMatch()
	return self._isCancelMatch
end

------------------------------------------------------------------------
-- @Role 	设置Flag
function SeasonSportData:setMatchSuccess(bSuccess)
	self._isMatchSuccess  = bSuccess
end

function SeasonSportData:getMatchSuccess()
	return self._isMatchSuccess
end

------------------------------------------------------------------------
-- @Role 	设置Flag
function SeasonSportData:setOwnCDOutAndDropStar(bCDOutAndDropStar)
	self._ownCDOutAndDropStar  = bCDOutAndDropStar
end

function SeasonSportData:getOwnCDOutAndDropStar()
	return self._ownCDOutAndDropStar
end

------------------------------------------------------------------------
-- @Role 	设置Flag
function SeasonSportData:setOtherCDOut(bOtherCDOut)
	self._isOtherCDOut  = bOtherCDOut
end

function SeasonSportData:getOtherCDOut()
	return self._isOtherCDOut
end
------------------------------------------------------------------------
-- @Role 	获取免费开放的锦囊组（表）
function SeasonSportData:getFreeOpenSilkGroup()
	return self._freeOpenSilkGroup
end

------------------------------------------------------------------------
-- @Role 	获取所有橙将（预留）
function SeasonSportData:getOrangeHeroListInfo()
	return self._orangeHeroListInfo
end

------------------------------------------------------------------------
-- @Role 	获取所有红将
function SeasonSportData:getRedHeroListInfo()
	return self._redHeroListInfo
end

------------------------------------------------------------------------
-- @Role 	获取所有金将
function SeasonSportData:getGoldenHeroListInfo()
	return self._goldenHeroListInfo
end


------------------------------------------------------------------------
-- @Role 	获取所有橙色以上武将
function SeasonSportData:getHeroListInfo()
	return self._heroListInfo
end

------------------------------------------------------------------------
-- @Role 	获取变身卡武将
function SeasonSportData:getTransformCardHeros()
	return self._transformCards
end

------------------------------------------------------------------------
-- @Role 	获取神兽
function SeasonSportData:getPetListInfo()
	return self._petListInfo
end


return SeasonSportData