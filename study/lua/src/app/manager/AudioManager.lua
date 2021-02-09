local AudioManager = class("AudioManager")
local SystemSound = require("app.config.system_sound")
local AudioConst = require("app.const.AudioConst")
local AudioHelper = require("app.utils.AudioHelper")
local PrioritySignal = require("yoka.event.PrioritySignal")
local scheduler = require("cocos.framework.scheduler")
--
function AudioManager:ctor()
	self._musicEnabled = true
	self._soundEnabled = true

	self._musicPath = ""
	self._musicId = cc.AUDIO_INVAILD_ID
	self._musicVolume = 1
	self._soundVolume = 1
    self._soundList = {}--音效列表
    self._mainMusicTime = 0
    self._mainMusicID = 0
	self._isOpenMainMusic = false
	self._isSpecifiedBgm = true
    self._curMainBGM = {}

	self._jsonConfig = self:decodeJsonFile("audio.json")

	ccui.Widget.setClickSoundCallback(function (soundID)
		self:playSoundWithId(soundID or AudioConst.SOUND_BUTTON)
    end)
    
    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._update), 1.0)
end

--
function AudioManager:setSoundEnabled(enable)
	if enable ~= self._soundEnabled then
		self._soundEnabled = enable
		self._soundList = {}
		--if not self._soundEnabled then
			--self:stopAllSound()
		--end
	end
end

--
function AudioManager:setMusicEnabled(enable)
	if enable ~= self._musicEnabled then
		self._musicEnabled = enable

		if not self._musicEnabled then
			self:stopMusic(true)
		else
			if self._musicPath ~= "" then
				self:playMusic(self._musicPath)
			else
				self:playMusicWithId(AudioConst.MUSIC_CITY)
			end
		end
	end
end

function AudioManager:_getAudioId( ... )
    -- body
    if table.nums(self._curMainBGM) <= 0 then
        self._curMainBGM = clone(AudioConst.MUSIC_BGM_MAINcITY)
	end
	if self._isSpecifiedBgm then
		self._isSpecifiedBgm = false
		local content = require("app.utils.UserDataHelper").getParameter(G_ParameterIDConst.BGM_SPECIFIED)
		if content and tonumber(content) > 0 then
			for index, value in ipairs(self._curMainBGM) do

				-- 节日音乐特定
				if rawequal(tonumber(content), value) then
					table.remove(self._curMainBGM, index)
					return value, SystemSound.get(value).time
				end
			end
		end
	end

    local randomIdx = math.random(1, #self._curMainBGM)
    local randomAudioId = self._curMainBGM[randomIdx]
    table.remove(self._curMainBGM, randomIdx)

    -- 循环时相同
    if rawequal(self._lastMusicId, randomAudioId) then
        if table.nums(self._curMainBGM) <= 0 then
            self._curMainBGM = clone(AudioConst.MUSIC_BGM_MAINcITY)
        end
        randomIdx = math.random(1, #self._curMainBGM)
        randomAudioId = self._curMainBGM[randomIdx]
        table.remove(self._curMainBGM, randomIdx)
    end
    return randomAudioId, SystemSound.get(randomAudioId).time-- table.keyof(AudioConst.MUSIC_BGM_MAINcITY, randomAudioId)
end

function AudioManager:openMainMusic(isOpen)
    -- body
    self._isOpenMainMusic = isOpen
end

function AudioManager:_update(dt)
    -- body
    if not self._isOpenMainMusic then
        return
    end

    self._mainMusicTime = (self._mainMusicTime - dt)
    if self._mainMusicTime <= 0 then
        self._mainMusicID, self._mainMusicTime = self:_getAudioId()
        G_AudioManager:playMusicWithId(self._mainMusicID, true)
    end
end

--
function AudioManager:playMusicWithId(id, isntLoop)
	local audioInfo = SystemSound.get(id)
	assert(audioInfo, "Could not find the autio info with id: "..tostring(id))
    local convertStr = self:getConvertPath(audioInfo.file_name)
    self:playMusic(convertStr, isntLoop, id)
end

function AudioManager:getLastMusicId( ... )
    -- body
    return self._lastMusicId or 0
end

function AudioManager:getMusicId( ... )
    -- body
    return self._musicId
end

--
function AudioManager:playMusic(path, isntLoop, id)
    if self._musicEnabled then
		--音乐id有效，并且路径一致，则代表播放同一个背景音乐，则返回
		if self._musicId ~= cc.AUDIO_INVAILD_ID and self._musicPath == path then
			return
		end
        
        self:stopMusic(true)
        if not isntLoop then
            self._isOpenMainMusic = false
            self._mainMusicID = 0
            self._mainMusicTime = 0
        else
            self._lastMusicId = id
        end
        local convertStr = self:getConvertPath(path)
        self._musicId = AudioHelper.playMusic(convertStr, not isntLoop, self._musicVolume)
		self._musicPath = convertStr
	end
end

--
function AudioManager:stopMusic(release)
	if self._musicId ~= cc.AUDIO_INVAILD_ID then
		AudioHelper.stopMusic(self._musicId, release, self._musicPath)
		self._musicId = cc.AUDIO_INVAILD_ID
	end
end

--
function AudioManager:getMusicVolume()
    return self._musicVolume
end

--
function AudioManager:setMusicVolume(volume)
	self._musicVolume = volume
    if self._musicId ~= cc.AUDIO_INVAILD_ID then
    	AudioHelper.setMusicVolume(self._musicId, volume)
	end
end

--
function AudioManager:getSoundVolume()
    return self._soundVolume
end

--
function AudioManager:setSoundVolume(volume,needSetPlayingSound)
	self._soundVolume = volume
	if needSetPlayingSound then--需要设置正在播放的音效
		local time = G_ServerTime:getTime()
		for k,v in pairs(self._soundList) do
			if v.isRun and (time-v.startPlayTime) < 20 then
				AudioHelper.setSoundVolume(k, volume)
			else
				self._soundList[k] = nil
			end
		end

	end
end

--
function AudioManager:playSoundWithId(id, p)
	local pitch = p or 1
	local audioInfo = SystemSound.get(id)
	assert(audioInfo, "Could not find the autio info with id: "..tostring(id))
	local convertStr = self:getConvertPath(audioInfo.file_name)
	local soundId = self:playSound(convertStr, pitch)
	return soundId
end

--
function AudioManager:playSound(path, pitch)
	--
	if self._soundEnabled then
		local convertStr = self:getConvertPath(path)
    	local soundId = AudioHelper.playSound(convertStr, false, self._soundVolume, pitch or 1)

		self._soundList[soundId] = {isRun = true,startPlayTime = G_ServerTime:getTime()}

		self:_clearExpiredSoundData()

		return soundId
    end

    return nil
end

function AudioManager:playSoundWithIdExt(id, p, isLoop)
	local pitch = p or 1
	local audioInfo = SystemSound.get(id)
	assert(audioInfo, "Could not find the autio info with id: "..tostring(id))
	local convertStr = self:getConvertPath(audioInfo.file_name)
	local soundId = self:playSoundExt(convertStr, pitch, isLoop)
	return soundId
end

function AudioManager:playSoundExt(path, pitch, isLoop)
	--
	if self._soundEnabled then
		local convertStr = self:getConvertPath(path)
    	local soundId = AudioHelper.playSound(convertStr, isLoop, self._soundVolume, pitch or 1)

		return soundId
    end

    return nil
end


function AudioManager:_clearExpiredSoundData()
	local time = G_ServerTime:getTime()
	for k,v in pairs(self._soundList) do
		if v.isRun and (time-v.startPlayTime) >= 20 then
			self._soundList[k] = nil
		end
	end
end

function AudioManager:stopAllSound()
	for k, v in pairs(self._soundList) do
		AudioHelper.stopSound(k)
	end
end

--
function AudioManager:stopSound(handler)
	AudioHelper.stopSound(handler)
end


function AudioManager:_unSchedulerCountDown( ... )
    -- body
    if self._countDownScheduler then
		scheduler.unscheduleGlobal(self._countDownScheduler)
		self._countDownScheduler = nil
	end
end

--
function AudioManager:stopAll()
    AudioHelper.stopAll()
    self:_unSchedulerCountDown()
end

--
function AudioManager:clear()
    AudioHelper.clear()
    self:_unSchedulerCountDown()
end

function AudioManager:setCallback(soundID, callback)
	AudioHelper.setCallback(soundID, callback)
end

function AudioManager:isSoundEnable()
	return self._soundEnabled
end


function AudioManager:preLoadSoundWithId(id)
	local audioInfo = SystemSound.get(id)
	assert(audioInfo, "Could not find the autio info with id: "..tostring(id))
	local convertStr = self:getConvertPath(audioInfo.file_name)
	self:preLoadSound(convertStr)
end

function AudioManager:unLoadSoundWithId(id)
	local audioInfo = SystemSound.get(id)
	assert(audioInfo, "Could not find the autio info with id: "..tostring(id))
	local convertStr = self:getConvertPath(audioInfo.file_name)
	AudioHelper.uncacheSound(convertStr)	
end

function AudioManager:preLoadSound(path)
	local convertStr = self:getConvertPath(path)
	AudioHelper.cacheSound(convertStr)
end

function AudioManager:unLoadSound(path)
	local convertStr = self:getConvertPath(path)
	AudioHelper.uncacheSound(convertStr)
end


function AudioManager:decodeJsonFile(jsonFileName)
	local fileUtils = cc.FileUtils:getInstance()
    if fileUtils:isFileExist(jsonFileName) then
		local jsonString = fileUtils:getStringFromFile(jsonFileName)
	    return json.decode(jsonString)
    end
    
    return nil
end


function AudioManager:getConvertPath(key)
	if self._jsonConfig then
		local realPath = self._jsonConfig[key]
		if realPath then
			return realPath
		end
	end
	return key
end


return AudioManager
