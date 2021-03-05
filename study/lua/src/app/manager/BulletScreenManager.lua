--BulletScreenManager
--弹幕系统界面

local BulletScreenManager = class("BulletScreenManager")
local BulletScreenLayer = require("app.scene.view.bulletScreen.BulletScreenLayer")
local BullectScreenConst = require("app.const.BullectScreenConst")
local scheduler = require("cocos.framework.scheduler")

local MAX_RICH_SIZE = 100
function BulletScreenManager:ctor()
	self._bulletState = {}
	self._bulletState[BullectScreenConst.WORLD_BOSS_TYPE] = false
	self._bulletState[BullectScreenConst.COUNTRY_BOSS_TYPE] = false
    self._bulletState[BullectScreenConst.GUILD_WAR_TYPE] = false
    self._bulletState[BullectScreenConst.GACHA_GOLDENHERO_TYPE] = false
    self._bulletState[BullectScreenConst.GUILDCROSSWAR_TYPE] = false
	self._bulletState[BullectScreenConst.GRAIN_CAR_TYPE] = false
	self._bulletState[BullectScreenConst.CROSS_BOSS_NORMAL_ATTACK] = false
	self._bulletState[BullectScreenConst.CROSS_BOSS_CHARGE_ATTACK] = false
	self._bulletState[BullectScreenConst.UNIVERSE_RACE_TYPE] = false
end


function BulletScreenManager:clear()
	self._richList = {}
	self._bulletState = {}
	self._bulletState[BullectScreenConst.WORLD_BOSS_TYPE] = false
	self._bulletState[BullectScreenConst.COUNTRY_BOSS_TYPE] = false
    self._bulletState[BullectScreenConst.GUILD_WAR_TYPE] = false
    self._bulletState[BullectScreenConst.GACHA_GOLDENHERO_TYPE] = false
    self._bulletState[BullectScreenConst.GUILDCROSSWAR_TYPE] = false
	self._bulletState[BullectScreenConst.GRAIN_CAR_TYPE] = false
	self._bulletState[BullectScreenConst.CROSS_BOSS_NORMAL_ATTACK] = false
	self._bulletState[BullectScreenConst.CROSS_BOSS_CHARGE_ATTACK] = false
	self._bulletState[BullectScreenConst.UNIVERSE_RACE_TYPE] = false

	if self._signalBulletNotice then
		self._signalBulletNotice:remove()
		self._signalBulletNotice = nil
	end
    if self._timer ~= nil then
        scheduler.unscheduleGlobal(self._timer)
        self._timer = nil
    end
	self:_resetBulletLayer(true)
end

function BulletScreenManager:_resetBulletLayer(cleanup)

	if not self._bulletLayer then
		self._bulletLayer = BulletScreenLayer.new()
		self._bulletLayer:retain()
		G_TopLevelNode:addBulletLayer(self._bulletLayer)
		self._bulletLayer:setName("BulletScreenLayer")
	end

	if not cleanup then

	else
		self._bulletLayer:removeFromParent()
		-- 自定义清理方法
		--self._bulletLayer:destroy()
		self._bulletLayer:release()
		self._bulletLayer = nil
	end
end

function BulletScreenManager:clearBulletLayer()
	self._bulletLayer:clear()
	self._richList = {}
	self._bulletState = {}
	self._bulletState[BullectScreenConst.WORLD_BOSS_TYPE] = false
	self._bulletState[BullectScreenConst.COUNTRY_BOSS_TYPE] = false
    self._bulletState[BullectScreenConst.GUILD_WAR_TYPE] = false
    self._bulletState[BullectScreenConst.GACHA_GOLDENHERO_TYPE] = false
    self._bulletState[BullectScreenConst.GUILDCROSSWAR_TYPE] = false
	self._bulletState[BullectScreenConst.GRAIN_CAR_TYPE] = false
	self._bulletState[BullectScreenConst.CROSS_BOSS_NORMAL_ATTACK] = false
	self._bulletState[BullectScreenConst.CROSS_BOSS_CHARGE_ATTACK] = false
	self._bulletState[BullectScreenConst.UNIVERSE_RACE_TYPE] = false
	self:showBulletLayer()
end

function BulletScreenManager:hideBulletLayer(bulleType)
	-- body
	self._bulletLayer:setVisible(false)
end

function BulletScreenManager:showBulletLayer(bulleType)
	-- body
	self._bulletLayer:setVisible(true)
end


function BulletScreenManager:reset( ... )
	-- body

end

function BulletScreenManager:start()
	self._richList = {}
	self._bulletState = {}
	self._bulletState[BullectScreenConst.WORLD_BOSS_TYPE] = false
	self._bulletState[BullectScreenConst.COUNTRY_BOSS_TYPE] = false
    self._bulletState[BullectScreenConst.GUILD_WAR_TYPE] = false
    self._bulletState[BullectScreenConst.GACHA_GOLDENHERO_TYPE] = false
    self._bulletState[BullectScreenConst.GUILDCROSSWAR_TYPE] = false
	self._bulletState[BullectScreenConst.GRAIN_CAR_TYPE] = false
	self._bulletState[BullectScreenConst.CROSS_BOSS_NORMAL_ATTACK] = false
	self._bulletState[BullectScreenConst.CROSS_BOSS_CHARGE_ATTACK] = false
	self._bulletState[BullectScreenConst.UNIVERSE_RACE_TYPE] = false
	if self._signalBulletNotice then
		self._signalBulletNotice:remove()
		self._signalBulletNotice = nil
	end

	self:_resetBulletLayer(false)

	if self._timer == nil then
        self._timer = scheduler.scheduleGlobal(handler(self, self._onUpdateNotice), 0.0333)
    end

	self._signalBulletNotice   = G_SignalManager:add(SignalConst.EVENT_BULLET_SCREEN_NOTICE, handler(self, self._onEventBulletNotice))

	self._richList = {}
end


function BulletScreenManager:setBulletScreenOpen(bulletType, open)
	self._bulletState[bulletType] = open
end

function BulletScreenManager:isBulletScreenOpen(bulletType)
	return self._bulletState[bulletType]
end

-- 每间隔一段时间，清理_richList
function BulletScreenManager:_onUpdateNotice()
	--print("BulletScreenManager:_onUpdateNotice")
    --一次处理6条数据
    local function changeFontSize( richContent, fntSize )
	   -- body
	   if richContent == nil then
			return ""
	   end

	   if type(richContent) == "table" and #richContent > 0 then
			for i, value in pairs(richContent) do
				value.fontSize = fntSize
			end
	   end

	   return richContent
   end
   local size = #self._richList


   if #self._richList > 0 then
		--dump(self._richList)
		local index = 0
        for i, rich in ipairs(self._richList) do
			local richContent, noticeColor, message, bulletWay = unpack(rich)
			local delayTime = 0

			if self._bulletLayer:pushTopRichText(richContent,delayTime,noticeColor, bulletWay) == true then
				--post event
				--dump(message)
				G_SignalManager:dispatch(SignalConst.EVENT_BULLET_SCREEN_POST, message)
				--table.remove( self._richList, i )

				--print("index "..index)
				delayTime = math.floor( index / 3 ) * 97 / 30

                if bulletWay and bulletWay > 0 then         -- 1. 新控制模式
					if rawequal(bulletWay, BullectScreenConst.SHOWTYPE_POPUP_CENTER) then
						index = index + 1
                        self._bulletLayer:pushMiddleRichText(changeFontSize(richContent,26),delayTime, message.sn_type)
                    end
                else                                        -- 0. 旧版控制模式
					if noticeColor and  noticeColor >= BullectScreenConst.COLOR_TYPE_4 then
						index = index + 1
                        self._bulletLayer:pushMiddleRichText(changeFontSize(richContent,26),delayTime, message.sn_type)
                    end

                    if message.sn_type == BullectScreenConst.GUILD_WAR_TYPE and
                        (message.color == BullectScreenConst.BULLET_ID_GUILD_WAR_GATE_DEMOLISH or 
						message.color == BullectScreenConst.BULLET_ID_GUILD_WAR_CRYSTAL_DEMOLISH) then --军团战攻破城门和龙柱特效
						index = index + 1
                        self._bulletLayer:pushMiddleRichText(changeFontSize(richContent,26),1, message.sn_type)
                        self._bulletLayer:pushMiddleRichText(changeFontSize(richContent,26),2, message.sn_type)
                    end
                end
			end
		end

		self._richList = {}
   end
end
--[[
	required uint32 sn_type = 1; //1:世界boss
	required uint32 color = 2; //弹幕品质
	repeated NoticePair content =3;
]]
function BulletScreenManager:_checkCanAdd(tp, value)
	if not self._bulletState[tp] then
		print("tp "..tp)
		dump(self._bulletState)
		return false
	end
	--
	if tp == BullectScreenConst.COUNTRY_BOSS_TYPE then
		if value and value.content then
			local bossInfo = value.content[3]
			if bossInfo and bossInfo.key == "bossid" then
				local final_vote = G_UserData:getCountryBoss():getFinal_vote()
				local contentBossId = tonumber(bossInfo.value or -1)
				if final_vote == contentBossId then
					return true
				end
			end
		end
		return false
	end

	return true
end
function BulletScreenManager:_onEventBulletNotice( id, message )
	--dump(message)
	-- body
	local pasreList = rawget(message, "content") or {}
	--dump(pasreList)
	--批量处理弹幕消息
	for i, value in ipairs(pasreList) do
		--dump(value)
		local userId = value.user.user_id
		if userId then
			local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(value.sn_type)
			--超过上限后，不做缓存处理，保证安卓机稳定
			if #self._richList <= MAX_RICH_SIZE then
				-- local noticeColor = value.color
				if self:_checkCanAdd(value.sn_type, value) then
                    local richContent, messageColor, way = G_UserData:getBulletScreen():parseBulletNotice(value)                    
					table.insert( self._richList, {richContent, messageColor, value, way} )
					--dump({richContent, messageColor, value, way})
				end
			end
		end
	end
end



return BulletScreenManager
