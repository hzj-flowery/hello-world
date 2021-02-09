-- @Author panhoa
-- @Date 8.17.2018
-- @Role 

local Hero = require("app.config.hero")
local HeroConst = require("app.const.HeroConst")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = {}


-- @Role    可配置锦囊坑位数量
function SeasonSportHelper.getCurSlotNum()
    local paramId = SeasonSportConst.SEASON_ROOKIE_SILKCOUNT
    local curStage = G_UserData:getSeasonSport():getSeason_Stage()
    
    if curStage == SeasonSportConst.SEASON_STAGE_ROOKIE then
        paramId = SeasonSportConst.SEASON_ROOKIE_SILKCOUNT
    elseif curStage == SeasonSportConst.SEASON_STAGE_ADVANCED then
        paramId = SeasonSportConst.SEASON_ADVANCED_SILKCOUNT
    elseif curStage == SeasonSportConst.SEASON_STAGE_HIGHT then
        paramId = SeasonSportConst.SEASON_HIGHT_SILKCOUNT
    end

    return tonumber(SeasonSportHelper.getParameterConfigById(paramId).content)
end

-- @Role   根据Id判断是否是武将
-- @Param   heroId 武将ID
function SeasonSportHelper.isHero(heroId)
    local heroConfig = Hero.get(heroId)
    local bRet = (heroConfig ~= nil)
    return bRet
end

-- @Role   根据Id判断武将是否存在
-- @Param   heroId 武将ID
function SeasonSportHelper.isExistHeroById(heroId)
    local heroConfig = Hero.get(heroId)
    --assert(heroConfig, "can not get hero info id: "..tostring(heroId))

    local bRet = heroConfig ~= nil or false
    return bRet, heroConfig
end

-- @Role    根据星数获得段位信息
-- @Param star 星数
function SeasonSportHelper.getDanInfoByStar(star)
    if star == nil or star == 0 then
        star = 1
    end
    local ParamConfig = require("app.config.fight_star")
    if ParamConfig.length() <= star then
        star = ParamConfig.length()
    end

    local danInfo = ParamConfig.get(star)
    assert(danInfo, "fight_star.lua Can't find the star: "..tostring(star))

    return danInfo
end

-- @Role    提取锦囊组免费开放段位
function SeasonSportHelper.getFreeDan()
    local defaultFreeCount = tonumber(SeasonSportHelper.getParameterConfigById(365).content)
    assert(defaultFreeCount, "parameter.lua can't find content of "..tostring(365))

    local silkFreeContent = SeasonSportHelper.getParameterConfigById(393).content
    assert(silkFreeContent, "parameter.lua can't find content of "..tostring(393))

    local silkIdData = string.split(silkFreeContent, "|")
    local data = {}
    for index = 1, defaultFreeCount do
        table.insert(data, 1)
    end

    for index, value in ipairs(silkIdData) do
        local silkIds = string.split(value, ":")
        for key, id in ipairs(silkIds) do
            if key == 2 then
                table.insert(data, tonumber(id))
            end
        end
    end
    return data
end

-- @Role    获取上阵最大阶段 
function SeasonSportHelper.getMaxFightStage()
    local ParamConfig = require("app.config.fight_stage")
    local stageInfo = ParamConfig.index()
    assert(stageInfo, "fight_stage.lua Can't find the star: ")

    local maxStage = table.nums(stageInfo)
    return maxStage
end

-- @Role   根据阶段Id获取相应信息
-- @Param   stageId 布阵阶段
function SeasonSportHelper.getSquadStageInfo(stageId)
    if stageId == 0 or stageId == nil then
        stageId = 1
    end

    local ParamConfig = require("app.config.fight_stage")
    local stageInfo = ParamConfig.get(stageId)
    assert(stageInfo, "fight_stage.lua Can't find the stage: "..tostring(stageId))
    
    return stageInfo
end

-- @Role    根据paramId获取对应配置信息
-- @Param id    配置Id
function SeasonSportHelper.getParameterConfigById(paramId)
    local ParamConfig = require("app.config.parameter")
	local paramInfo = ParamConfig.get(paramId)
    assert(paramInfo, "parameter.lua can't find id = "..tostring(paramId))
    
	return paramInfo
end

-- @Role    根据赛季类型获取赛季默认锦囊组锦囊Ids
-- @Param seasonId  赛季类别
function SeasonSportHelper.getSeasonDefaultSilkIdsById(seasonId)
    local silkContent = SeasonSportHelper.getParameterConfigById(seasonId).content
    assert(silkContent, "parameter.lua can't find content of "..tostring(seasonId))

    local silkIdData = string.split(silkContent, "|")
    local data = {}
    for index, value in ipairs(silkIdData) do
        table.insert(data, tonumber(value))
    end
    return data
end

-- @Role    根据星数获取当前免费开启的锦囊组 (弃用)
-- @Param star  星数
function SeasonSportHelper.getFreeSilkGroupByStar(star)
    local freeSilk = SeasonSportHelper.getDanInfoByStar(star).free_silk
    if freeSilk == nil or not freeSilk then
        return nil
    end
    local freedData = string.split(freeSilk, "|")
    local data = {}
    for index, value in ipairs(freedData) do
        table.insert(data, tonumber(value))
    end 
    return data
end

-- @Role    根据星数获取当前赛季奖励
-- @Param star  星数
function SeasonSportHelper.getFightAwardsByStar(searchStar)
    local awardsConfig = require("app.config.fight_award")
    for index = 1, awardsConfig.length() do
        local awardsData = awardsConfig.indexOf(index)
        if tonumber(awardsData.star) <= searchStar and searchStar <= tonumber(awardsData.star_max) then
            return tonumber(awardsData.type), tonumber(awardsData.value), tonumber(awardsData.size)
        end
    end 
    return nil, nil, nil
end

-- @Role    titleId（暂弃用）
function SeasonSportHelper.getOfficiaColorByTitleId(titleId)
    local officialInfo = require("app.config.official_rank").get(titleId)
    assert(officialInfo, "parameter.lua can't find content of "..tostring(titleId))

    return tonumber(officialInfo.color)
end

-- @Role    赛季是否开始
function SeasonSportHelper.isTodayOpen()
    local seasonIntervalDay = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STAGE_DURATION).content)
    local seasonEndTime = G_UserData:getSeasonSport():getSeasonEndTime()
    local seasonStartTime = G_UserData:getSeasonSport():getSeasonStartTime()
    if seasonStartTime <= G_ServerTime:getTime() and seasonEndTime >= G_ServerTime:getTime() then
        return true
    end
    return false
end

-- @Role    获取赛季起始时间段
function SeasonSportHelper.getSeasonOpenTime()
    local timeContent = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_INTERVAL_TIME).content
    local sectionsData = string.split(timeContent, "|")
    local date = {}
    for index, value in ipairs(sectionsData) do
        local section = {}
        local sectionData = string.split(value, ":")
        for sectionIndex, sectionValue in ipairs(sectionData) do
            table.insert(section, tonumber(sectionValue))
        end
        table.insert(date, section)
    end
    return date
end

-- @Role    开始时间
function SeasonSportHelper.getStartTime()
    if SeasonSportHelper.isTodayOpen() then
        local date = SeasonSportHelper.getSeasonOpenTime()
        local todaySeconds = G_ServerTime:getTodaySeconds()
        
        for index = 1, #date do
            if date[index][1] * 3600 <= todaySeconds and todaySeconds <= date[index][2] * 3600 then
                local startTime = date[index][1] * 3600
                return startTime + G_ServerTime:secondsFromZero()
            end    
        end
        return 0
    end
    return 0
end

-- @Role    结束时间
function SeasonSportHelper.getEndTime()
    if SeasonSportHelper.isTodayOpen() then
        local date = SeasonSportHelper.getSeasonOpenTime()
        local todaySeconds = G_ServerTime:getTodaySeconds()

        for index = 1, #date do
            if todaySeconds <= date[index][2] * 3600 then
                local endTime = date[index][2] * 3600
                return endTime + G_ServerTime:secondsFromZero()
            end    
        end
        return 0
    end
    return 0
end

-- @Role    当前时间段剩余时间
function SeasonSportHelper.getRemainingTime()
    if SeasonSportHelper.isTodayOpen() then
        local date = SeasonSportHelper.getSeasonOpenTime()
        local todaySeconds = G_ServerTime:getTodaySeconds()

        for index = 1, #date do
            if date[index][1] * 3600 < todaySeconds and todaySeconds < date[index][2] * 3600 then
                local remianTime = date[index][2] * 3600 + G_ServerTime:secondsFromZero()
                return remianTime
            end    
        end
    end
    return 0
end

-- @Role    当前阶段所需等待时间
function SeasonSportHelper.getWaitingTime()
    if SeasonSportHelper.getRemainingTime() <= 0 then
        if SeasonSportHelper.isTodayOpen() then
            local date = SeasonSportHelper.getSeasonOpenTime()
            local todaySeconds = G_ServerTime:getTodaySeconds()

            local lastTime = #date
            if todaySeconds > date[lastTime][2] * 3600 then
                local waitingStr = (date[1][1] ..":00-" ..date[1][2] ..":00")
                return true, waitingStr
            else
                for index = 1, #date do
                    if todaySeconds <= date[index][1] * 3600 then
                        local waitingStr = (date[index][1] ..":00-" ..date[index][2] ..":00")
                        return true, waitingStr
                    end        
                end
            end
        end
    else
        return false, SeasonSportHelper.getRemainingTime()
    end
end

-- @Role    游戏主界面当前阶段所需等待时间
function SeasonSportHelper.getMianWaitingTime()
    local date = SeasonSportHelper.getSeasonOpenTime()
    local todaySeconds = G_ServerTime:getTodaySeconds()

    local lastTime = #date
    if todaySeconds > date[lastTime][2] * 3600 then
        local waitingStr = date[1][1] ..":00"
        return waitingStr
    else
        for index = 1, #date do
            if todaySeconds <= date[index][1] * 3600 then
                local waitingStr = date[index][1] ..":00"
                return waitingStr
            end        
        end
    end
end

-- @Role    每日奖励：战斗奖励
function SeasonSportHelper.getSeasonDailyFightReward()
    local fightContent = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_DAILYREWARDS_FIGHT).content

    local fightData = string.split(fightContent, "|")
    local data = {}
    for index, value in ipairs(fightData) do
        local valueData = string.split(value, ":")
        local subData = {}
        subData.type = 1
        subData.idx = tonumber(index)
        subData.num = tonumber(valueData[1])
        subData.size = tonumber(valueData[2])
        table.insert(data, subData)
    end
    return data
end

-- @Role    每日奖励：胜利奖励
function SeasonSportHelper.getSeasonDailyWinReward()
    local fightContent = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_DAILYREWARDS_WIN).content

    local fightData = string.split(fightContent, "|")
    local data = {}
    for index, value in ipairs(fightData) do
        local valueData = string.split(value, ":")
        local subData = {}
        subData.type = 2
        subData.idx = tonumber(index)
        subData.num = tonumber(valueData[1])
        subData.size = tonumber(valueData[2])
        table.insert(data, subData)
    end
    return data
end

-- @Role    所有橙将
function SeasonSportHelper.getOrangeHeroList(group)
	local heroInfo = require("app.config.hero")
    local orangeHeroListInfo = {}
    local redLimit = SeasonSportHelper.getLimitBreak()

    for loopi = 1, heroInfo.length()  do 
        local heroData = heroInfo.indexOf(loopi)
		local heroCountry = heroData.country
        local heroColor = heroData.color
        local heroLimit = heroData.limit
        if heroData.is_fight > 0 and heroData.is_fight <= group then
            if heroColor == SeasonSportConst.HERO_SCOP_LOWERLIMIT then
                if heroLimit ~= SeasonSportConst.HERO_SCOP_LIMIT and redLimit ~= SeasonSportConst.HERO_RED_LINEBREAK then
                    orangeHeroListInfo[heroCountry] =  orangeHeroListInfo[heroCountry] or {}
                    if orangeHeroListInfo[heroCountry] == nil then
                        orangeHeroListInfo[heroCountry] = {}
                    end

                    table.insert(orangeHeroListInfo[heroCountry], {cfg = heroData})
                    table.sort(orangeHeroListInfo[heroCountry], function(item1, item2)
                        return item1.cfg.id < item2.cfg.id
                    end)
                end
            end
        end
    end
    return orangeHeroListInfo
end

-- @Role    所有金将
-- @Param   group 赛区：1新手/2进阶
function SeasonSportHelper.getGoldenHeroList(group)
	local heroInfo = require("app.config.hero")
    local goldenHeroListInfo = {}

    for loopi = 1, heroInfo.length()  do 
        local heroData = heroInfo.indexOf(loopi)
		local heroCountry = heroData.country
        local heroColor = heroData.color
        local heroLimit = heroData.limit

        if heroData.is_fight == group then
            if heroColor == SeasonSportConst.HERO_SCOP_GOLDENLIMIT and heroData.is_show == SeasonSportConst.HERO_SCOP_INHANDBOOK then
                goldenHeroListInfo[heroCountry] = goldenHeroListInfo[heroCountry] or {}
                table.insert(goldenHeroListInfo[heroCountry], {cfg = heroData})
            end
        end
    end
    for k,v in pairs(goldenHeroListInfo) do
        table.sort(v, function(item1, item2)
            return item1.cfg.id < item2.cfg.id
        end)
    end
    return goldenHeroListInfo
end

-- @Role 	是否金将
-- @Param   heroId 武将id
function SeasonSportHelper._isGoldenHero(heroId)
    local heroInfo = require("app.config.hero")
    local info = heroInfo.get(heroId)
    if info and info.color == SeasonSportConst.HERO_SCOP_GOLDENLIMIT then
        return true
    end
    return false
end

-- @Role    所有红将
-- @Param   group 赛区：1新手/2进阶
function SeasonSportHelper.getRedHeroList(group)
	local heroInfo = require("app.config.hero")
    local redHeroListInfo = {}
    local redLimit = SeasonSportHelper.getLimitBreak()

    for loopi = 1, heroInfo.length()  do 
        local heroData = heroInfo.indexOf(loopi)
		local heroCountry = heroData.country
        local heroColor = heroData.color
        local heroLimit = heroData.limit

        if heroData.is_fight > 0 and heroData.is_fight <= group then
            if heroColor == SeasonSportConst.HERO_SCOP_REDIMIT and heroData.is_show == SeasonSportConst.HERO_SCOP_INHANDBOOK then
                redHeroListInfo[heroCountry] = redHeroListInfo[heroCountry] or {}
                if redHeroListInfo[heroCountry] == nil then
                    redHeroListInfo[heroCountry] = {}
                end
                table.insert(redHeroListInfo[heroCountry], {cfg = heroData})
                table.sort(redHeroListInfo[heroCountry], function(item1, item2)
                    local ret = nil
                    if item1.cfg.color == item2.cfg.color then
                        ret = item1.cfg.id < item2.cfg.id
                    else
                        ret = item1.cfg.color > item2.cfg.color
                    end
                    return ret
                end)
            elseif heroColor == SeasonSportConst.HERO_SCOP_LOWERLIMIT and heroData.is_show == SeasonSportConst.HERO_SCOP_INHANDBOOK then
                if heroLimit == SeasonSportConst.HERO_SCOP_LIMIT and redLimit == SeasonSportConst.HERO_RED_LINEBREAK then
                    redHeroListInfo[heroCountry] = redHeroListInfo[heroCountry] or {}
                    if redHeroListInfo[heroCountry] == nil then
                        redHeroListInfo[heroCountry] = {}
                    end
                    table.insert(redHeroListInfo[heroCountry], {cfg = heroData})
                    table.sort(redHeroListInfo[heroCountry], function(item1, item2)
                        local ret = nil
                        if item1.cfg.color == item2.cfg.color then
                            ret = item1.cfg.id < item2.cfg.id
                        else
                            ret = item1.cfg.color > item2.cfg.color
                        end
                        return ret
                    end)
                end
            end
        end
    end
    return redHeroListInfo
end

-- @Role    橙红将
function SeasonSportHelper.getHeroList(group)
	local heroInfo = require("app.config.hero")
	local heroListInfo = {}

    for loopi = 1, heroInfo.length()  do 
        local heroData = heroInfo.indexOf(loopi)
		local heroCountry = heroData.country
        local heroColor = heroData.color
        if heroData.is_fight > 0 and heroData.is_fight <= group then
            if heroColor >= SeasonSportConst.HERO_SCOP_LOWERLIMIT then
                heroListInfo[heroCountry] = heroListInfo[heroCountry] or {}
                if heroListInfo[heroCountry] == nil then
                    heroListInfo[heroCountry] = {}
                end

                table.insert(heroListInfo[heroCountry], {cfg = heroData})
                table.sort(heroListInfo[heroCountry], function(item1, item2)
                    local ret = nil
                    if item1.cfg.color == item2.cfg.color then
                        if item1.cfg.limit == item2.cfg.limit then
                            ret = item1.cfg.id < item2.cfg.id 
                        else
                            ret = item1.cfg.limit > item2.cfg.limit
                        end
                    else
                        ret = item1.cfg.color > item2.cfg.color
                    end
                    return ret
                end)
            end
		end
    end

    return heroListInfo
end


-- @Role   神兽
function SeasonSportHelper.getPetList()
	local petInfo = require("app.config.pet")
	local petListInfo = {}

    for loopi = 1, petInfo.length()  do 
        local petData = petInfo.indexOf(loopi)
		if tonumber(petData.is_fight) == 1 then
            petListInfo = petListInfo or {}

			table.insert(petListInfo, {cfg = petData})
			table.sort(petListInfo, function(item1, item2)
				local ret = nil
				if item1.cfg.color == item2.cfg.color then
					ret = item1.cfg.id < item2.cfg.id
				else
					ret = item1.cfg.color > item2.cfg.color
				end
				return ret
			end)
		end
    end

    return petListInfo
end

-- @Role    获取变身卡武将（本应该在avatar中加入country、limit字段，由于...，
--          目前拉取/刷新主界面会增加额外卡顿O(n^2)/2，后续维护人员可重构)
function SeasonSportHelper.getTransformCards(group)
    local avatar = {}
    local length = require("app.config.avatar").length()
	for i = 1, length do
        local info = require("app.config.avatar").indexOf(i)
        if group >= 3 then
            if info.color == 6 and info.limit == 0 then
                local bHero, heroCfg = SeasonSportHelper.isExistHeroById(info.hero_id)
                info.country = heroCfg.country
                info.limit = SeasonSportHelper.getLimitBreak()--(heroCfg.limit > 0 and SeasonSportHelper.getLimitBreak() or heroCfg.limit)
                table.insert(avatar, {cfg = info})
            end            
        end

        if info.color == 5 then
            local bHero, heroCfg = SeasonSportHelper.isExistHeroById(info.hero_id)
            info.country = heroCfg.country
            info.limit = (heroCfg.limit > 0 and SeasonSportHelper.getLimitBreak() or heroCfg.limit)
            table.insert(avatar, {cfg = info})
        end
    end

    table.sort(avatar, function(item1, item2)
        if item1.cfg.country == item2.cfg.country then
            if item1.cfg.color == item2.cfg.color then
                return item1.cfg.hero_id < item2.cfg.hero_id
            else
                return item1.cfg.color > item2.cfg.color
            end
        else
            return item1.cfg.country < item2.cfg.country
        end
    end)
    return avatar
end

-- @Export  获取变身卡Id
-- @Param   heroId 武将ID
function SeasonSportHelper.getTransformCardId(heroId)
    local avatar = {}
    local length = require("app.config.avatar").length()
	for i = 1, length do
        local info = require("app.config.avatar").indexOf(i)
        if tonumber(info.hero_id) == heroId then
            return info.id
        end
    end
    return nil
end

-- @Role    根据avatarid获取资源id
function SeasonSportHelper.getTransformCardsResId(baseId)
    local iconId = tonumber(require("app.config.avatar").get(baseId).icon)
    assert(iconId, "avatar.lua Can't find the id: "..baseId)
    return iconId
end

-- @Role    根据avatarid获取hero_id
function SeasonSportHelper.getTransformCardsHeroId(baseId)
    local heroId = tonumber(require("app.config.avatar").get(baseId).hero_id)
    assert(heroId, "avatar.lua Can't find the id: "..baseId)
    return heroId
end

-- @Role    主界面距离开始战斗倒计时
function SeasonSportHelper.getActTimeRegion()
    local date = SeasonSportHelper.getSeasonOpenTime()
    local todaySeconds = G_ServerTime:getTodaySeconds()
    
    for index = 1, #date do
        if todaySeconds <= date[index][2] * 3600 then
            local startTime = date[index][1] * 3600
            local endTime = date[index][2] * 3600
            local zeroTime = G_ServerTime:secondsFromZero()
            return false, startTime + zeroTime,endTime + zeroTime
        end    
    end
     local zeroTime = G_ServerTime:secondsFromZero()
    if #date <= 0 then --全天
         return false, 0 + zeroTime,3600*24 + zeroTime
    end
    --第二天第一次活动时间段
    local index = 1
    local startTime = date[index][1] * 3600
    local endTime = date[index][2] * 3600
     zeroTime = zeroTime + 3600 * 24
    return true, startTime + zeroTime,endTime + zeroTime
end

-- @Role    一天第一个时间段
function SeasonSportHelper.getFirstStartOpenTime()
    local date = SeasonSportHelper.getSeasonOpenTime()
    local oneFirstOpenTime = date[1][1]
    return oneFirstOpenTime
end

-------------------------------------------------------
-- Check
-- @Role    是否赛季红将包含橙升红
function SeasonSportHelper.checkSeasonRedHero(heroId)
    local redHeroListInfo = G_UserData:getSeasonSport():getRedHeroListInfo()
    for index = 1, table.nums(redHeroListInfo) do
        for indexj = 1, table.nums(redHeroListInfo[index]) do
            if redHeroListInfo[index][indexj] and redHeroListInfo[index][indexj].cfg.id == heroId then
                return true
            end
        end
    end
    return false
end

-- @Role    武将界限突破
function SeasonSportHelper.getORedHeroLimitLevelById(heroId)
    local redHeroListInfo = G_UserData:getSeasonSport():getRedHeroListInfo()
    for index = 1, table.nums(redHeroListInfo) do
        for indexj = 1, table.nums(redHeroListInfo[index]) do
            if redHeroListInfo[index][indexj] and redHeroListInfo[index][indexj].cfg.id == heroId then
                if redHeroListInfo[index][indexj].cfg.color == SeasonSportConst.HERO_SCOP_LOWERLIMIT then
                    return HeroConst.HERO_LIMIT_RED_MAX_LEVEL
                end
            end
        end
    end
    return 0
end

-- @Role    获取当前赛区的界限突破
function SeasonSportHelper.getLimitBreak()
    local redLimit = 0
    local group = G_UserData:getSeasonSport():getSeason_Stage()
    if group == SeasonSportConst.SEASON_STAGE_ROOKIE then
        redLimit = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_REDLIMIT_ROOKIE).content)
    elseif group == SeasonSportConst.SEASON_STAGE_ADVANCED then
        redLimit = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_REDLIMIT_ADVANCED).content)
    elseif group == SeasonSportConst.SEASON_STAGE_HIGHT then
        redLimit = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_REDLIMIT_HIGHT).content)
    end
    return redLimit
end

-- @Role    推荐锦囊组数据
function SeasonSportHelper.getSileRecommand()
    local silkBagConfig = require("app.config.fight_silkbag")
    local group = G_UserData:getSeasonSport():getSeason_Stage()
    local list = {}
    local length = silkBagConfig.length()
	for i = 1, length do
        local info = silkBagConfig.indexOf(i)
        if info.area==group then
            table.insert(list, info)
        end
    end
    return list
end

-- @Role    每日任务数据
function SeasonSportHelper.getSeasonDailyData()
    local dailyFightResult = G_UserData:getSeasonSport():getDailyFightReward()
    local dailyWinResult = G_UserData:getSeasonSport():getDailyWinReward()
    local ownDailyData = SeasonSportHelper.getSeasonDailyFightReward()
    local ownDailyWinData = SeasonSportHelper.getSeasonDailyWinReward()
    local fightNum = G_UserData:getSeasonSport():getFightNum()
    local winNum   = G_UserData:getSeasonSport():getWinNum()
    
    for index, value in ipairs(ownDailyData) do
        value.gotstate = dailyFightResult[index] ~= nil and dailyFightResult[index] or 0
        value.achievestate  = value.num <= fightNum and 1 or 0
    end

    for index, value in ipairs(ownDailyWinData) do
        value.gotstate = dailyWinResult[index] ~= nil and dailyWinResult[index] or 0
        value.achievestate  = value.num <= winNum and 1 or 0
    end
    
    for index, value in ipairs(ownDailyWinData) do
        table.insert(ownDailyData, value)
    end

    for index, value in ipairs(ownDailyData) do
        if value.gotstate == 0 and value.achievestate == 1 then
            value.state = 0
        elseif value.gotstate == 1 then
            value.state = 2
        else
            value.state = 1
        end
    end

    table.sort(ownDailyData, function(a, b)
        -- body
        if a.state == b.state then
            return a.idx < b.idx
        else
            return a.state < b.state
        end
    end)

    return ownDailyData
end


return SeasonSportHelper