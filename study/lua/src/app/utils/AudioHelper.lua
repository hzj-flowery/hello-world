local AudioHelper = {}
local mode = 1
if audiomode then
	mode = audiomode()
end

--
function AudioHelper.playMusic(path, loop, volume)
	if mode == 1 then
		return ccexp.AudioEngine:play2d(path, loop or false, volume or 1)
	else
		audio.setMusicVolume(volume or 1)
		audio.playMusic(path, loop or false)
		return 0
	end
end

--
function AudioHelper.stopMusic(musicId, release, path)
	if mode == 1 then
		ccexp.AudioEngine:stop(musicId)
		if release then
			ccexp.AudioEngine:uncache(path)
		end
	else
		audio.stopMusic(release or false)
	end
end

--
function AudioHelper.setMusicVolume(musicId, volume)
	if mode == 1 then
		ccexp.AudioEngine:setVolume(musicId, volume or 1)
	else
		audio.setMusicVolume(volume or 1)
	end
end


function AudioHelper.setSoundVolume(musicId, volume)
	if mode == 1 then
		ccexp.AudioEngine:setVolume(musicId, volume or 1)
	else
		audio.setSoundsVolume(volume or 1)
	end
end

--
function AudioHelper.playSound(path, loop, volume, pitch)
	if mode == 1 then
		-- ccexp.AudioEngine:preload(path)
		local musicId = ccexp.AudioEngine:play2d(path, loop or false, volume or 1)
		ccexp.AudioEngine:setFinishCallback(musicId, function()
			G_SignalManager:dispatch(SignalConst.EVENT_SOUND_END, musicId)
		end)
		return musicId
	else
		audio.setSoundsVolume(volume or 1)
		return audio.playSound(path, loop or false, pitch or 1)
	end
end

--
function AudioHelper.stopSound(musicId)
	if mode == 1 then
		ccexp.AudioEngine:stop(musicId)
	else
		audio.stopSound(musicId)
	end
end

--
function AudioHelper.uncacheSound(path)
	if mode == 1 then
		ccexp.AudioEngine:uncache(path)
	else
		audio.unloadSound(path)
	end
end

--
function AudioHelper.stopAll()
	if mode == 1 then
		ccexp.AudioEngine:stopAll()
	else
		audio.stopMusic(true)
		audio.stopAllSounds()
	end
end

--
function AudioHelper.clear()
	if mode == 1 then
		ccexp.AudioEngine:stopAll()
		ccexp.AudioEngine:uncacheAll()
	else
		audio.stopMusic(true)
		audio.stopAllSounds()
	end
end

function AudioHelper.setCallback(musicId, callback)
    if mode == 1 then
        ccexp.AudioEngine:setFinishCallback(G_AudioManager:getMusicId(), function()
			G_SignalManager:dispatch(SignalConst.EVENT_SOUND_END)
		end)
	end
end

--
function AudioHelper.cacheSound(path)
	if mode == 1 then 

	else 
		audio.preloadSound(path)
	end
end

return AudioHelper