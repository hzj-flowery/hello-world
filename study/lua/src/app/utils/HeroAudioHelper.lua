local HeroAudioHelper = {}
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")

function HeroAudioHelper.getVoiceResNames(id)
	local heroInfo = HeroDataHelper.getHeroConfig(id)
	local resId = heroInfo.res_id
	
	local names = HeroAudioHelper.getVoiceResNamesWithResId(resId)
	return names
end

function HeroAudioHelper.getVoiceResNamesWithResId(resId)
	local resInfo = require("app.config.hero_res").get(resId)
	assert(resInfo, string.format("hero_res config can not find id = %d", resId))
	
	local names = {}
	local voice = resInfo.voice
	if voice ~= "" and voice ~= "0" then
		names = string.split(voice,"|")
	end
	return names
end

function HeroAudioHelper.getRandomVoiceName(id)
	local names = HeroAudioHelper.getVoiceResNames(id)
	local index = math.random(#names)
	return names[index]
end

function HeroAudioHelper.getVoiceRes(id)
	local res = nil
	local name = HeroAudioHelper.getRandomVoiceName(id)
	if name then
		res = Path.getHeroVoice(name)
	end
	return res
end

return HeroAudioHelper