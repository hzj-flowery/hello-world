--
-- Author: Liangxu
-- Date: 2017-06-12 19:49:48
-- 军团成员数据
local BaseData = require("app.data.BaseData")
local GuildMemberData = class("GuildMemberData", BaseData)
local Parameter = require("app.config.parameter")
local ParameterIDConst = require("app.const.ParameterIDConst")
local VipFunctionIDConst = require("app.const.VipFunctionIDConst")
local VipDataHelper = require("app.utils.data.VipDataHelper")
local FunctionConst = require("app.const.FunctionConst")
local FuncLevelInfo = require("app.config.function_level")


local schema = {}
schema["uid"] 				= {"number", 0} --成员id
schema["name"] 				= {"string", ""} --玩家昵称
schema["level"] 			= {"number", 0} --玩家等级
schema["position"] 			= {"number", 0} --职位
schema["contribution"] 		= {"number", 0} --贡献
schema["time"] 				= {"number", 0} --加入时间
schema["offline"] 			= {"number", 0} --离线时间
schema["base_id"] 			= {"number", 0} 
schema["rank_lv"] 			= {"number", 0} 
schema["power"] 			= {"number", 0} --战力
schema["week_contribution"] = {"number", 0} --周贡献
schema["vip"] 				= {"number", 0} --成员的vip
schema["avatar"] 			= {"number", 0}
schema["officer_level"] 	= {"number", 0} --官衔
schema["dungeon_point"] 	= {"number", 0} --副本积分
schema["active_cnt"] 	= {"number", 0} --活动参与次数
schema["player_info"] 	= {"table",nil} --玩家信息（客户端数据）
schema["rankPower"] 	= {"number", 0} --战力排行（客户端数据）
schema["home_tree_level"]		= {"number", 0} --神树等级	
schema["train_daily_count"] = {"number",0} --演武次数
schema["train_daily_acptcount"] = {"number",0}--被演武次数
schema["head_frame_id"] = {"number",0}

GuildMemberData.schema = schema



local TRAIN_TYPE = {
	toSelf = 1,	  -- 可以自己传功
	active = 2,   -- 可以主动传功
	passive = 3,  -- 可以被动传功
	unToSelf = 4,   -- 不可以自己传功
	unActive = 5, -- 不可以主动传功
	unPassive = 6, -- 不可以被动传功
	}

function GuildMemberData:ctor(properties)
	GuildMemberData.super.ctor(self, properties)

	local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId(properties)
	self:setPlayer_info(playerInfo)

	self._myInfo = G_UserData:getGuild():getMyMemberData()
	self._myTrainCount = self._myInfo ~= nil and self._myInfo:getTrain_daily_count() or 0
	self._myAcpCount = self._myInfo ~= nil and self._myInfo:getTrain_daily_acptcount() or 0

	if properties.uid == G_UserData:getBase():getId() then 
		self._myTrainCount = properties.train_daily_count
		self._myAcpCount = properties.train_daily_acptcount
	end
	
	self:setTrainType(properties.level,properties.vip,properties.offline,properties.train_daily_count,properties.train_daily_acptcount)
	self._heros = self:_createHeroList(properties.heros)
end

function GuildMemberData:clear()

end

function GuildMemberData:reset()
	self._myInfo = nil
	self._myTrainCount = 0
end


-- 设置演武的类型
function GuildMemberData:setTrainType( _curLevel,_curVip,_online,_trainCount,_acpCount,properties )
	local myLevel = G_UserData:getBase():getLevel()
	local myVip = G_UserData:getVip():getLevel()

	local difLevel = myLevel - _curLevel

	local maxVip = math.max(myVip,_curVip)
	local levelLimit = VipDataHelper.getVipCfgByTypeLevel(VipFunctionIDConst.VIP_FUNC_ID_TRAIN,maxVip).value

	local limitActive = tonumber(Parameter.get(ParameterIDConst.TRAIN_LIMIT_ACTIVE).content) -- 主动演武上限
	local limitPassive = tonumber(Parameter.get(ParameterIDConst.TRAIN_LIMIT_PASSIVE).content) -- 被动演武上限

	local activeCondition = difLevel >= levelLimit 
	local passiveCondition = difLevel <= -levelLimit
	local unActiveCondition = difLevel < levelLimit and difLevel >= 0
	local unPassiveCondition = difLevel > -levelLimit and difLevel < 0

	if self:isSelf()  then --服务器约定 自己给自己演武 当做被演武处理
		if self._myAcpCount > 0 then 
			self._trainType = TRAIN_TYPE.toSelf
			return
		else
			self._trainType = TRAIN_TYPE.unToSelf
			return
		end 
	end
	
	if _curLevel >= FuncLevelInfo.get(FunctionConst.FUNC_GUILD_TRAIN).show_level then
		if difLevel > 0 then  --主动
			if _online == 0 and activeCondition and self._myTrainCount > 0 and _acpCount > 0  then -- 和服务器配合
				self._trainType = TRAIN_TYPE.active
				return
			else
				self._trainType = TRAIN_TYPE.unActive
				return
			end
		else -- 被动
			if _online == 0 and passiveCondition and self._myAcpCount > 0 and _trainCount > 0 then 
				self._trainType = TRAIN_TYPE.passive
				return
			else
				self._trainType = TRAIN_TYPE.unPassive
				return
			end 
		end
	else
		self._trainType = TRAIN_TYPE.unActive
		return		
	end
end


function GuildMemberData:getTrainType( ... )
	return self._trainType
end


function GuildMemberData:_createHeroList(heros) 
	local newHeros = {}
	for k,v in ipairs(heros) do
		table.insert(newHeros,v)
	end
	return newHeros
end

function GuildMemberData:getHeros()
	return self._heros
end

--是否是自己
function GuildMemberData:isSelf()
	local uid = self:getUid()
	local useId = G_UserData:getBase():getId()
	return uid == useId
end

--是否在线
function GuildMemberData:isOnline()
	local offline = self:getOffline()
	return offline == 0
end

return GuildMemberData