--弹幕系统数据层
local BaseData = import(".BaseData")
local BulletScreenData =  class("BulletScreenData", BaseData)
local DataConst = require("app.const.DataConst")
local RichTextHelper = require("app.utils.RichTextHelper")
local BullectScreenConst  = require("app.const.BullectScreenConst")
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
--更新弹幕消息

--军团战类型为4
BulletScreenData.SN_TYPE_GUILD_WAR = 4
BulletScreenData.SN_TYPE_GOLDGACHA = 5  -- 金将招募
BulletScreenData.SN_TYPE_GUILDCROSWAR = 6  -- 跨服军团战
BulletScreenData.SN_TYPE_GRAIN_CAR = 7  -- 暗度陈仓
BulletScreenData.SN_TYPE_CROSS_BOSS_NORMAL_ATTACK = 8  -- 跨服boss普通攻击
BulletScreenData.SN_TYPE_CROSS_BOSS_CHARGE_ATTACK = 9  -- 跨服boss蓄力攻击
BulletScreenData.SN_TYPE_UNIVERSE_RACE = 10 --真武战神


function BulletScreenData:_s2cBulletNotice(id,message)


	--G_SignalManager:dispatch(SignalConst.EVENT_BULLET_SCREEN_NOTICE, data, message)


	G_SignalManager:dispatch(SignalConst.EVENT_BULLET_SCREEN_NOTICE, message)
end

---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
function BulletScreenData:ctor()
	BulletScreenData.super.ctor(self)
	self._getBulletNotice = G_NetworkManager:add(MessageIDConst.ID_S2C_BulletNotice, handler(self, self._s2cBulletNotice))
	self._bulletType = {}
	self._bulletType[1] = true
	self._bulletType[2] = true
    self._bulletType[4] = true
    self._bulletType[5] = true
    self._bulletType[6] = true
	self:_initCfg()
end


function BulletScreenData:_makeKey( snType, color )
	-- body
	return snType.."k"..color
end


function BulletScreenData:_initCfg( ... )
	-- body
	self._matchList = {}
	local bullet_screen = require("app.config.bullet_screen")

	for i= 1, bullet_screen.length(), 1 do
		local config = bullet_screen.indexOf(i)
		local keyName = self:_makeKey(config.type,config.color)
		self._matchList[keyName] = self._matchList[keyName] or {}
		table.insert( self._matchList[keyName], config )
	end
end

function BulletScreenData:_getMatchList( snType, color )
	local keyName = self:_makeKey(snType,color)
	return self._matchList[keyName] or {}
end


function BulletScreenData:setBulletScreenOpen( bulletType, open )
	self._bulletType[bulletType] = open
	-- body
end
function BulletScreenData:isBulletScreenOpen( bulletType )
	-- body
	return self._bulletType[bulletType]
end
-- 清除
function BulletScreenData:clear()
   self._getBulletNotice:remove()
   self._getBulletNotice = nil
end

-- 重置
function BulletScreenData:reset()

end

function BulletScreenData:parseBulletNotice( message, fontSize )
	-- body
	local snType = message.sn_type
	return self:_parseNotice(message,fontSize)
end

function BulletScreenData:_parseNotice( message, fontSize )
	-- body

	--local osTime = os.clock()

	fontSize = fontSize or 20

	local function getRandomInfo( contentList )
		local index = math.random( 1, #contentList )
		return contentList[index]
	end

	local contentConfig = nil
    local msgColor = message.color
    local msgWay = 0

    if message.sn_type == BulletScreenData.SN_TYPE_GUILD_WAR or
        message.sn_type == BulletScreenData.SN_TYPE_GOLDGACHA or
		message.sn_type == BulletScreenData.SN_TYPE_GUILDCROSWAR or 
		message.sn_type == BulletScreenData.SN_TYPE_CROSS_BOSS_CHARGE_ATTACK or 
		message.sn_type == BulletScreenData.SN_TYPE_GRAIN_CAR or
		message.sn_type == BulletScreenData.SN_TYPE_UNIVERSE_RACE then
		local bullet_screen = require("app.config.bullet_screen")
		contentConfig = bullet_screen.get(message.color)
        msgColor = 1
        msgWay = 0

		if contentConfig then
            msgColor = contentConfig.color
            msgWay = contentConfig.way
		end
		
	else
		local contentList = self:_getMatchList(message.sn_type, message.color)
		if #contentList == 0 then
			return
        end
        local bullet_screen = require("app.config.bullet_screen")
		local config = bullet_screen.get(message.color)
        contentConfig = getRandomInfo(contentList)
        msgColor = message.color
        msgWay = config.way
	end

	if contentConfig == nil then
		return ""
	end

	local serverContentList = rawget(message,"content") or {}
	
	local richContent = nil
	if message.sn_type == BullectScreenConst.GUILD_WAR_TYPE and
		(message.color ~= BullectScreenConst.BULLET_ID_GUILD_WAR_GATE_DEMOLISH and
				message.color ~= BullectScreenConst.BULLET_ID_GUILD_WAR_CRYSTAL_DEMOLISH) 
		then
		local getGuildId = function(value)
			local pairsList =  rawget(value,"content") or {}
			for k,v in ipairs(pairsList) do
				--logWarn(v.key.." ----------- "..v.value)
				if v.key == "guildid" then
					return tonumber(v.value)
				end
			end
		end
		local guildId = G_UserData:getGuild():getMyGuildId()
		if getGuildId(message) == guildId then
			richContent = RichTextHelper.convertRichTextByNoticePairs(contentConfig.text,
			serverContentList,
			fontSize,
			Colors.GUILD_WAR_SAME_GUILD_COLOR,
			Colors.GUILD_WAR_SAME_GUILD_COLOR_OUTLINE,1 )
		else
			richContent = RichTextHelper.convertRichTextByNoticePairs(contentConfig.text,
			serverContentList,
			fontSize,
			Colors.GUILD_WAR_ENEMY_COLOR,
			Colors.GUILD_WAR_ENEMY_COLOR_OUTLINE,1 )
		end
	else
			richContent = RichTextHelper.convertRichTextByNoticePairs(contentConfig.text,
			serverContentList,
			fontSize,
			Colors.getBulletColor(msgColor),
			Colors.getBulletColorOutline(msgColor),1 )
			
	end

	--local runningTime = os.clock() - osTime
	--logWarn( string.format( "BulletScreenData._parseNotice running time [%.4f]", runningTime))
	return richContent,msgColor, msgWay
end

return BulletScreenData
