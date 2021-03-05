--武将语音管理
local AudioManager = require("app.manager.AudioManager")
local HeroVoiceManager = class("HeroVoiceManager")
local HeroAudioHelper = require("app.utils.HeroAudioHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")

function HeroVoiceManager:ctor()
	self._curHeroVoice = nil
	self._curHeroId = 0
	self._isInMainMenu = false
	self._mainMenuScheduler = nil
end

function HeroVoiceManager:clear()
	self._curHeroVoice = nil
	self._curHeroId = 0
end

function HeroVoiceManager:setIsInMainMenu(isIn)
	self._isInMainMenu = isIn
end

function HeroVoiceManager:playVoiceWithHeroId(heroId, must)
	local res = HeroAudioHelper.getVoiceRes(heroId)

	local function play()
		if self._curHeroVoice then
			G_AudioManager:stopSound(self._curHeroVoice)
		end
		local voice = nil
		if res then
			voice = G_AudioManager:playSound(res)
		end
		
		self._curHeroVoice = voice
		self._curHeroId = heroId
	end

	if must then --一定播
		play()
	elseif heroId ~= self._curHeroId then
		play()
	end
end

--播放当前主角语音
function HeroVoiceManager:playCurRoleVoice()
	local roleId = G_UserData:getHero():getRoleBaseId()
	self:playVoiceWithHeroId(roleId)
end

--播放男\女主角语音
function HeroVoiceManager:playRoleVoiceWithSex(sex)
	local heroId = 1
	if sex == 1 then
		heroId = 1 --男
	else
		heroId = 11 --女
	end

	self:playVoiceWithHeroId(heroId)
end

function HeroVoiceManager:createScheduler(callbcak, interval)
	
end

function HeroVoiceManager:stopScheduler(scheduleHandler)
	if scheduleHandler then
		SchedulerHelper.cancelSchedule(scheduleHandler)
	end
	scheduleHandler = nil
end

function HeroVoiceManager:startPlayMainMenuVoice()
	local heroIds = G_UserData:getTeam():getHeroBaseIdsInBattle()

	local function getInterval()
		return math.random(15, 20)
	end

	local function playHeroVoice()
		if self._isInMainMenu then
    		local index = math.random(#heroIds)
    		local heroId = heroIds[index]
			self:playVoiceWithHeroId(heroId)
    	end
	end

	local function playLoop()
		local interval = getInterval()
		self._mainMenuScheduler = SchedulerHelper.newScheduleOnce(function()
			playHeroVoice()
			if self._isInMainMenu then
				playLoop()
			end
    	end, interval)
	end

	self:playCurRoleVoice()
	playLoop()
end

function HeroVoiceManager:stopPlayMainMenuVoice()
	if self._mainMenuScheduler then
		SchedulerHelper.cancelSchedule(self._mainMenuScheduler)
		self._mainMenuScheduler = nil
	end
end

return HeroVoiceManager