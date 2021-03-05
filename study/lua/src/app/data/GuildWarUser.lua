local BaseData = require("app.data.BaseData")
local GuildWarUser = class("GuildWarUser", BaseData)


local schema = {}
schema["city_id"] = {"number", 0} --城池id
schema["user_id"] = {"number", 0} 
schema["user_name"] = {"string", ""} 
schema["guild_id"] = {"number", 0} 
schema["guild_name"] = {"string", ""}
schema["old_point"] = {"number", 0} --旧的据地id
schema["now_point"] = {"number", 0} --现在的据点id
schema["move_time"] = {"number", 0} --移动时间
schema["challenge_time"] = {"number", 0} --挑战时间
schema["challenge_cd"] = {"number", 0} --挑战CD
schema["officer_level"] = {"number", 0} --官衔
schema["power"] = {"number", 0} --战力
schema["base_id"] = {"number", 0} 
schema["avatar_base_id"] = {"number", 0} 
schema["war_value"] = {"number", 0} --体力值
schema["guild_icon"] = {"number", 0} 
schema["pk_type"] = {"number", 0} --1 攻击  2 防守
schema["born_point_id"] = {"number", 0} 
schema["relive_time"] = {"number", 0} --重生时间
schema["tree_buff"] = {"table", {}} --祈福buff
schema["lastTreeBuff"] = {"table", {}} --记录之前的buff

GuildWarUser.schema = schema

function GuildWarUser:ctor(user)
    self._playerInfo = {}
	GuildWarUser.super.ctor(self)

    if user then
        self:updateUser(user)
    end
end

-- 清除
function GuildWarUser:clear()
end

-- 重置
function GuildWarUser:reset()
end

function GuildWarUser:initData(data)
    self:setProperties(data)
    local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId(data)
	self._playerInfo = playerInfo
end


function GuildWarUser:getCurrPoint()
    local oldPoint = self.old_point_  --self:getOld_point()
    local nowPoint = self.now_point_
    if oldPoint == 0 or oldPoint == nowPoint then
        return nowPoint
    end
  
    local moveTime = self.move_time_
    local time = G_ServerTime:getTime()
    if time >= moveTime then
        return nowPoint
    end
    return 0
end

function GuildWarUser:getStartPoint()
    local currPoint =  self:getCurrPoint()
    if currPoint == 0 then
        return self.old_point_ 
    end
    return currPoint
end

function GuildWarUser:getPlayerInfo()
    return self._playerInfo
end


function GuildWarUser:isSelf()
    local userId = G_UserData:getBase():getId()
    return userId == self.user_id_
end

function GuildWarUser:isInBorn()
    local time = G_ServerTime:getTime()
    logWarn("-----------  "..time.." "..self.relive_time_)
    if time > self.relive_time_ then
        return false
    end
    return true
end

--是否因为buff复活
function GuildWarUser:isInBornForBuff()
    local HomelandConst = require("app.const.HomelandConst")
    local buffBaseId = HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_8
    if self:isInBorn() and self:isHaveBuff(buffBaseId) or self:isHaveLastBuff(buffBaseId) then --现在有复活buff或者上次有复活buff
        return true
    else
        return false
    end
end

function GuildWarUser:updateData(msg)
    self.city_id_ = msg.city_id
    self.user_id_  = msg.user_id
    self.user_name_ = msg.user_name
    self.guild_id_ = msg.guild_id
    self.guild_name_ = msg.guild_name
    self.old_point_ = msg.old_point
    self.now_point_ = msg.now_point
    self.move_time_ = msg.move_time
    self.challenge_time_  = msg.challenge_time
    self.challenge_cd_ = msg.challenge_cd
    self.officer_level_ = msg.officer_level
    self.power_ = msg.power
    self.avatar_base_id_ = msg.avatar_base_id
    self.war_value_ = msg.war_value
    self.base_id_ = msg.base_id
    self.guild_icon_ = msg.guild_icon
    self.pk_type_ = msg.pk_type
    self.born_point_id_= msg.born_point_id
    self.relive_time_ = msg.relive_time
    self:setLastTreeBuff(self.tree_buff_)
    self.tree_buff_ = msg.tree_buff

    local covertId,playerInfo = require("app.utils.UserDataHelper").convertAvatarId(msg)
	self._playerInfo = playerInfo

end

function GuildWarUser:updateUser(warUser)
    self.city_id_ = warUser.city_id_
    self.user_id_  = warUser.user_id_
    self.user_name_ = warUser.user_name_
    self.guild_id_ = warUser.guild_id_
    self.guild_name_ = warUser.guild_name_
    self.old_point_ = warUser.old_point_
    self.now_point_ = warUser.now_point_
    self.move_time_ = warUser.move_time_
    self.challenge_time_  = warUser.challenge_time_
    self.challenge_cd_ = warUser.challenge_cd_
    self.officer_level_ = warUser.officer_level_
    self.power_ = warUser.power_
    self.avatar_base_id_ = warUser.avatar_base_id_
    self.war_value_ = warUser.war_value_
    self.base_id_ = warUser.base_id_
    self.guild_icon_ = warUser.guild_icon_
    self.pk_type_ = warUser.pk_type_
    self.born_point_id_= warUser.born_point_id_
    self.relive_time_ = warUser.relive_time_
    self:setLastTreeBuff(self.tree_buff_)
    self.tree_buff_ = warUser.tree_buff_

    self._playerInfo.baseId = warUser._playerInfo.baseId
	self._playerInfo.avatarBaseId = warUser._playerInfo.avatarBaseId 
	self._playerInfo.covertId= warUser._playerInfo.covertId
end

function GuildWarUser:isHaveBuff(buffBaseId)
    local buffBaseIds = self:getTree_buff()
    for i, baseId in ipairs(buffBaseIds) do
        if baseId == buffBaseId then
            return true
        end
    end
    return false
end

function GuildWarUser:isHaveLastBuff(buffBaseId)
    local lastBuffBaseIds = self:getLastTreeBuff()
    for i, baseId in ipairs(lastBuffBaseIds) do
        if baseId == buffBaseId then
            return true
        end
    end
    return false
end

return GuildWarUser