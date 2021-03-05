-- 三国战纪帮助
local CountryBossHelper = {}
local ParamConfig = require("app.config.parameter")
local CountryBossConst = require("app.const.CountryBossConst")

function CountryBossHelper.getOpenServerLimit()
    local FunctionLevelConfig = require("app.config.function_level")
    local cfg = FunctionLevelConfig.get(FunctionConst.FUNC_COUNTRY_BOSS)
    assert(cfg ~= nil, "can not get function id ".. FunctionConst.FUNC_COUNTRY_BOSS)
    return cfg.day
end

function CountryBossHelper.getOpenDays()
    local config = ParamConfig.get(231)
    assert(config ~= nil, "can not find ParamConfig id = 231")
    local daysString = string.split(config.content, "|")
    local days = {}
    for k , v in pairs(daysString) do
        local curDay = tonumber(v)
        assert(curDay ~= nil, "ParamConfig  error id = 231")
        curDay = curDay + 1
        if curDay > 7 then
            curDay = 1
        end
        days[curDay] = true
        -- table.insert(days, v)
    end

    return days
end

--阶段1 时间
function CountryBossHelper.getStage1Time()
    local config = ParamConfig.get(232)
    assert(config ~= nil, "can not find ParamConfig id = 232")
    return tonumber(config.content)
end

--阶段2 时间
function CountryBossHelper.getStage2Time()
    local config = ParamConfig.get(233)
    assert(config ~= nil, "can not find ParamConfig id = 233")
    return tonumber(config.content)
end

--阶段3 时间
function CountryBossHelper.getStage3Time()
    local config = ParamConfig.get(234)
    assert(config ~= nil, "can not find ParamConfig id = 234")
    return tonumber(config.content)
end

function CountryBossHelper.getParamStartTime()
    local config = ParamConfig.get(246)
    assert(config ~= nil, "can not find ParamConfig id = 234")
    return tonumber(config.content)
end

function CountryBossHelper.getStartTime()
    if CountryBossHelper.isTodayOpen() then
        local startTime =  CountryBossHelper.getParamStartTime()
        return startTime + G_ServerTime:secondsFromZero()
    end
    return 0
end

function CountryBossHelper.getEndTime()
    if CountryBossHelper.isTodayOpen() then
        local _, endTime = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE3)
        return endTime + 1
    end
    return 0
end



function CountryBossHelper.isTodayOpen(zeroTimeSecond)
    local date =  G_ServerTime:getDateObject(nil,zeroTimeSecond)


    local days = CountryBossHelper.getOpenDays()
    if days[date.wday] then
        return true
    end
    return false
end


function CountryBossHelper.isLastDayOpen()
    local t = G_ServerTime:getTime() - 24 * 3600
    local date = G_ServerTime:getDateObject(t)
    local days = CountryBossHelper.getOpenDays()
    if days[date.wday] then
        return true
    end
    return false
end

-- 显示 true 今日活动已结束  false 距离下一次开启
function CountryBossHelper.isShowTodayEndOrNextOpen()
    local TimeConst = require("app.const.TimeConst")
    local _, endTime = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE3)

    local curTime = G_ServerTime:getTime()
    local zeroTime = G_ServerTime:secondsFromToday()
    if CountryBossHelper.isTodayOpen() and curTime > endTime then
        return true
    elseif CountryBossHelper.isLastDayOpen() and zeroTime < TimeConst.RESET_TIME * 3600 then
        return true
    end

    return false
end



function CountryBossHelper.getTimeByStage(stage)
    local curTime = G_ServerTime:getTime()
    local todayZeroTime = G_ServerTime:secondsFromZero()
    -- local startTime, endTime

    local stage1Time = CountryBossHelper.getStage1Time() -- 第一阶段持续时间 可能会提早结束
    local stage2Time = CountryBossHelper.getStage2Time() -- 第二阶段持续时间 可能会提早结束
    local stage3Time = CountryBossHelper.getStage3Time() -- 第三阶段持续时间 可能会提早结束

    local startTime =  CountryBossHelper.getParamStartTime() + todayZeroTime -- 三国战记开启时间

    --第一阶段提前结束时间
    local stage1EarlyEndTime =  G_UserData:getCountryBoss():getAhead_time1() or 0
    --第三阶段提前结束时间
    local stage3EarlyEndTime =  G_UserData:getCountryBoss():getAhead_time3() or 0

    local stage2BeginTime = startTime + stage1Time
    if stage1EarlyEndTime ~= 0 then
        stage2BeginTime = stage1EarlyEndTime
    end
    local stage1EndTime = stage2BeginTime - 1

    local stage3BeginTime = stage2BeginTime + stage2Time
    local stage2EndTime = stage3BeginTime -1

    local stage3EndTime = stage3BeginTime + stage3Time -1
    if stage3EarlyEndTime ~= 0 and stage3EarlyEndTime > startTime  then
        stage3EndTime = stage3EarlyEndTime - 1
    end

    if CountryBossConst.STAGE1 == stage then
        return startTime, stage1EndTime
    elseif CountryBossConst.STAGE2 == stage then
        return stage2BeginTime, stage2EndTime
    elseif CountryBossConst.STAGE3 == stage then
        return stage3BeginTime, stage3EndTime
    else
        return startTime, stage1EndTime, stage2BeginTime, stage2EndTime, stage3BeginTime, stage3EndTime
    end

end
-- 计算下一个开发时间
function CountryBossHelper.getNextOpenTime()
    local curTime = G_ServerTime:getTime()
    local startTime = CountryBossHelper.getParamStartTime() + G_ServerTime:secondsFromZero()
    if CountryBossHelper.isTodayOpen() then
        if curTime < startTime then
            return startTime
        end
    end

    local date = G_ServerTime:getDateObject()
    local days = CountryBossHelper.getOpenDays()
    local nextDayNum = 1
    for i = 1, 7 do
        local wDay = date.wday + i
        if wDay > 7 then
            wDay = 1
        end
        if days[wDay] then
            nextDayNum = i
            break
        end
    end

    local t = nextDayNum * 24*60*60 + startTime
    --logError("========================= nextDayNum "..G_ServerTime:getTimeString(t))
    return t
end



function CountryBossHelper.getStage()
    if CountryBossHelper.isTodayOpen() then
        local stage1BeginTime, stage1EndTime, stage2BeginTime, stage2EndTime,
            stage3BeginTime, stage3EndTime = CountryBossHelper.getTimeByStage()
        logWarn(string.format("time: %s  %s\n%s  %s\n%s  %s\n%s  %s",stage1BeginTime, stage1EndTime, stage2BeginTime, stage2EndTime,
            stage3BeginTime, stage3EndTime, G_UserData:getCountryBoss():getAhead_time1(), G_UserData:getCountryBoss():getAhead_time3()))
        local curTime = G_ServerTime:getTime()
        --优先判断 是否已提前结束
        if curTime > stage3EndTime then
            return CountryBossConst.NOTOPEN
        end

        if curTime >= stage1BeginTime  and curTime <= stage1EndTime then
            return CountryBossConst.STAGE1
        elseif curTime >= stage2BeginTime  and curTime <= stage2EndTime then
            return CountryBossConst.STAGE2
        elseif curTime >= stage3BeginTime  and curTime <= stage3EndTime then
            return CountryBossConst.STAGE3
        end
    end
    return CountryBossConst.NOTOPEN
end

function CountryBossHelper.checkOpen()
    if CountryBossConst.NOTOPEN == CountryBossHelper.getStage() then
        G_Prompt:showTip(Lang.get("country_boss_open_tip"))
        return false
    end
    return true
end

-- 获取同组 ids
function CountryBossHelper.getChildGroupIds(groupId)
    local GuildBossInfoConfig = require("app.config.guild_boss_info")
    local indexs = GuildBossInfoConfig.index()
    local groups = {}
	for k in pairs(indexs) do
		local cfg = GuildBossInfoConfig.get(k)
		if cfg.group == groupId then
            if cfg.type ~= 2 then
                table.insert(groups, cfg.id)
            end
        end
	end
    return groups
end

-- 获取大boss 列表
function CountryBossHelper.getBossConfigListByType(tp)
    if not tp then
        tp = 2
    end
    local GuildBossInfoConfig = require("app.config.guild_boss_info")
    local indexs = GuildBossInfoConfig.index()
    local groups = {}
	for k in pairs(indexs) do
		local cfg = GuildBossInfoConfig.get(k)
        if cfg.type == tp then
            table.insert(groups, cfg)
        end
	end
    table.sort(groups, function(a, b)
        return a.id < b.id
    end)
    return groups
end


function CountryBossHelper.getBossConfigById(id)
    local GuildBossInfoConfig = require("app.config.guild_boss_info")
    local cfg = GuildBossInfoConfig.get(id)
    assert(cfg ~= nil, "can not get boss config id = "..(id or "nil"))
    return cfg
end


function CountryBossHelper.getPreviewRankRewards(bossId)
    if not bossId then
        bossId = 0
    end
	local allAwards = {}
	local openServerDayNum = G_UserData:getBase():getOpenServerDayNum()
	--logWarn("1111111111111111  "..openServerDayNum)
	local GuildAnswerAward = require("app.config.guild_boss_award")
    local indexs = GuildAnswerAward.index()
    local bossConfig = {}
    local rewardConfig = nil
    for k ,v in pairs(indexs) do
        local cfg = GuildAnswerAward.get(k)
        if cfg.boss_id == bossId then
            if openServerDayNum >= cfg.day_min and openServerDayNum <= cfg.day_max then
                 rewardConfig = cfg
                 break
            end
        end
    end
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local rewardList = {}
	if rewardConfig ~= nil then
		 local UserDataHelper = require("app.utils.UserDataHelper")
		 rewardList = UserDataHelper.makeRewards(rewardConfig,13)--最多配置5个奖励
	end

	for k ,v in pairs(rewardList) do
		table.insert(allAwards, v)
	end
	return allAwards
end
--
function CountryBossHelper.getStage1AttackCd()
    local config = ParamConfig.get(235)
    assert(config ~= nil, "can not find ParamConfig id = 235")
    return tonumber(config.content)
end

function CountryBossHelper.getStage3AttackCd()
    local config = ParamConfig.get(236)
    assert(config ~= nil, "can not find ParamConfig id = 236")
    return tonumber(config.content)
end
--拦截 cd
function CountryBossHelper.getStage3InterceptCd()
    local config = ParamConfig.get(237)
    assert(config ~= nil, "can not find ParamConfig id = 237")
    return tonumber(config.content)
end


function CountryBossHelper.getKillTip(bossId)
	local cfg = CountryBossHelper.getBossConfigById(bossId)
	local bossData = G_UserData:getCountryBoss():getBossDataById(bossId)
	if not bossData then
		return Lang.get("country_boss_is_die_tip")
	end
	local rankData = bossData:getRankFirst()
	if not rankData then
		return Lang.get("country_boss_is_die_tip")
	end
	local guildName = rankData:getGuild_name()
	return Lang.get("country_boss_is_die_tip2", {city = "", name = cfg.name, guild = guildName})
end

function CountryBossHelper.getLockString(bossCfg)
    local childIds = CountryBossHelper.getChildGroupIds(bossCfg.group)
    local cityNames = {}
    for _, childId in pairs(childIds) do
        local tempData =  G_UserData:getCountryBoss():getBossDataById(childId)
        if not (tempData and tempData:isBossDie()) then
            local tempCfg = CountryBossHelper.getBossConfigById(childId)
            table.insert(cityNames, tempCfg.city_name)
        end
    end
    local isUnlock = false
    local lockStr = ""
    if #cityNames == 0 then
        isUnlock = true
    else
        isUnlock = false
        lockStr = cityNames[1]
        for i = 2, #cityNames  do
            lockStr = lockStr..","..cityNames[i]
        end
        lockStr = Lang.get("country_boss_lock_str",{name = lockStr})
    end
    return isUnlock, lockStr
end

function CountryBossHelper.anyoneBossUnlock()
    local configList = CountryBossHelper.getBossConfigListByType(2)
    for k ,v in pairs(configList)do
        if CountryBossHelper.getLockString(v) then
            return true
        end
    end
    return false
end

function CountryBossHelper.enterCountryBossView()
    if CountryBossHelper.getStage()  == CountryBossConst.STAGE3 then
        local final_vote = G_UserData:getCountryBoss():getFinal_vote()
    	if final_vote and final_vote ~= 0 then
    		G_SceneManager:showScene("countrybossbigboss", final_vote, true)
        else
            G_SceneManager:showScene("countryboss")
    	end
    else
        G_SceneManager:showScene("countryboss")
    end
end

function CountryBossHelper.isTodayShowEndDialog()
	local time = tonumber(G_UserData:getUserConfig():getConfigValue("countryBoss")) or 0
	local date1 = G_ServerTime:getDateObject(time)
	local date2 = G_ServerTime:getDateObject()
	if date1.day == date2.day then
		return true
	end
	return false
end

function CountryBossHelper.setTodayShowDialogTime()
	local curTime = G_ServerTime:getTime()
	G_UserData:getUserConfig():setConfigValue("countryBoss",curTime)
end

function CountryBossHelper.popGoAuction()
	if CountryBossHelper.isTodayShowEndDialog() then
		logWarn("====================today is show")
		return
	end
	local AuctionConst = require("app.const.AuctionConst")
	local isAuctionWorldEnd = G_UserData:getAuction():isAuctionShow(AuctionConst.AC_TYPE_COUNTRY_BOSS_ID)
	if isAuctionWorldEnd == false then
		logWarn("====================Auction not open")
		return
	end
	local isInGuild = G_UserData:getGuild():isInGuild()
	if not isInGuild then
		logWarn("====================not in guild")
		return
	end
	local function onBtnGo()
        -- G_SceneManager:popScene()
        G_SceneManager:popToRootScene()
		local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION)
	end
	local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("country_boss_popup_acution_title1"), nil,onBtnGo)
	local content = Lang.get("country_boss_acution_tip")
	CountryBossHelper.setTodayShowDialogTime()
	PopupSystemAlert:setContentWithRichTextType2(content, Colors.BRIGHT_BG_TWO, 22, 10, 2)
	PopupSystemAlert:setCheckBoxVisible(false)
	PopupSystemAlert:showGoButton(Lang.get("country_boss_popup_acution_goto"))
	PopupSystemAlert:setCloseVisible(true)
	PopupSystemAlert:openWithAction()
end

function CountryBossHelper.popGoFightBigBoss()
	-- local final_vote = G_UserData:getCountryBoss():getFinal_vote()
	-- if not (final_vote and final_vote ~= 0) then
	-- 	logError("================== final_vote = "..final_vote)
	-- 	return
	-- end

	local function onBtnGo()
        local curStage = CountryBossHelper.getStage()
        if CountryBossConst.STAGE3 ~= curStage then
            return
        end
        local final_vote = G_UserData:getCountryBoss():getFinal_vote()
    	if final_vote and final_vote ~= 0 then
    		G_SceneManager:showScene("countrybossbigboss", final_vote)
    	end
	end
    onBtnGo()
	-- local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("country_boss_goto_fight_big_boss_title"), nil,onBtnGo)
	-- local content = Lang.get("country_boss_goto_fight_big_boss_content")
    --
	-- PopupSystemAlert:setContentWithRichTextType3(content, Colors.BRIGHT_BG_TWO, 22, 10)
	-- PopupSystemAlert:setCheckBoxVisible(false)
	-- PopupSystemAlert:showGoButton(Lang.get("country_boss_goto_fight_btn_name"))
	-- PopupSystemAlert:setCloseVisible(true)
	-- PopupSystemAlert:openWithAction()
end


function CountryBossHelper.createSwordEft(parentNode)
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_shuangjian"then
            local subEffect = EffectGfxNode.new("effect_shuangjian")
            subEffect:play()
            return subEffect
        end
    end
    return G_EffectGfxMgr:createPlayMovingGfx( parentNode, "moving_shuangjian", effectFunction, nil, false )
end

function CountryBossHelper.createFireEft(parentNode)
    local EffectGfxNode = require("app.effect.EffectGfxNode")

	-- local function effectFunction(effect)
    --     if effect == "effect_shuangjian"then
    --         local subEffect = EffectGfxNode.new("effect_shuangjian")
    --         subEffect:play()
    --         return subEffect
    --     end
    -- end
    return G_EffectGfxMgr:createPlayMovingGfx( parentNode, "moving_sanguozhanji", nil, nil, false )
end


function CountryBossHelper.isBossDie(id)
    local data = G_UserData:getCountryBoss():getBossDataById(id)
	if not data then
		return true
	end

    return data:isBossDie()
end
return CountryBossHelper
