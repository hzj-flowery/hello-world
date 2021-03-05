--
-- Author: Liangxu
-- Date: 2017-06-20 17:22:21
-- 军团模块数据封装类
local GuildDataHelper = {}
local GuildConst = require("app.const.GuildConst")
local ParameterIDConst = require("app.const.ParameterIDConst")
local TextHelper = require("app.utils.TextHelper")
local DropHelper = require("app.utils.DropHelper")

--获取军团成员上限
function GuildDataHelper.getGuildMaxMember(level)
	local config = require("app.config.guild_base").get(level)
	assert(config, string.format("guild_base config can not find level = %d", level))

	return config.max_member
end

--获取军团升级所需经验
function GuildDataHelper.getGuildLevelUpNeedExp(level)
	local config = require("app.config.guild_base").get(level)
	assert(config, string.format("guild_base config can not find level = %d", level))

	return config.exp
end

--获取创建军团所需元宝
function GuildDataHelper.getCreateGuildNeedMoney()
	local needMoney = require("app.config.parameter").get(ParameterIDConst.GUILD_CREAT_COST_ID).content
	return tonumber(needMoney)
end



--获取军团每日向他人援助碎片次数
function GuildDataHelper.getSupportTimes()
	local BuyCountIDConst = require("app.const.BuyCountIDConst")
	local config = require("app.config.function_cost").get(BuyCountIDConst.GUILD_HELP)
	assert(config,"can not find funcion_cost cfg by id "..BuyCountIDConst.GUILD_HELP)
	return config.free_count
end

--获取某职位是否有某权限
function GuildDataHelper.isHaveJurisdiction(position, jurisdiction)
	local config = require("app.config.guild_purview").get(position)
	assert(config, string.format("guild_purview can not find id = %d", position))

	local purview = config.purview
	local purviewIds = string.split(purview,"|")
	for k, id in pairs(purviewIds) do
		if tonumber(id) == jurisdiction then
			return true
		end
	end
	return false
end

--获取军团领导名字
function GuildDataHelper.getGuildLeaderNames()
	local result = {}
	local members = G_UserData:getGuild():getGuildMemberList()
	for k, data in pairs(members) do
		local position = data:getPosition()
		if position == GuildConst.GUILD_POSITION_1 then
			result.leaderName = data:getName()
		elseif position == GuildConst.GUILD_POSITION_2 then
			result.mateName = data:getName()
		elseif position == GuildConst.GUILD_POSITION_3 then
			if result.elderNames == nil then
				result.elderNames = {}
			end
			table.insert(result.elderNames, data:getName())
		end
	end
	return result
end

--获取军团职务名称
function GuildDataHelper.getGuildDutiesName(position)
	if type(position) == "string" then
		position = tonumber(position)
	end
	local config = require("app.config.guild_purview").get(position)
	assert(config, string.format("guild_purview config can nof find id = %d", position))

	return config.name
end

--检查是否可以退出军团
function GuildDataHelper.checkCanQuitGuild(time)
	assert(type(time) == "number", "Invalid time: "..tostring(time))

	local sec = G_ServerTime:getTime() - time
	local timeLimit = tonumber(require("app.config.parameter").get(ParameterIDConst.GUILD_PROTECT_TIMES_ID).content)
	if sec <= timeLimit then
		local timeDes = G_ServerTime:getDayOrHourOrMinFormat(timeLimit)
		G_Prompt:showTip(Lang.get("guild_tip_can_not_quit", {time = timeDes}))
		return false
	end


--[[
12点~12点10分军团BOSS
18点~18点05分军团答题
18点10分~18点40分军团试炼
19点~19点10分军团BOSS
21点~21点15分三国战记
]]
	local  isFunctionOpen = function(curFuncId)
		local funcLevelInfo = require("app.config.function_level").get(curFuncId)
		assert(funcLevelInfo, "Invalid function_level can not find funcId "..curFuncId)
		local UserCheck = require("app.utils.logic.UserCheck")
		local timeCheck = true
		if funcLevelInfo.show_day > 0 then
			timeCheck = UserCheck.enoughOpenDay(funcLevelInfo.show_day)
		end
		return timeCheck
	end
	
	local curFuncId, startTime, endTime = G_UserData:getLimitTimeActivity():getCurGuildActivityIcon()
	local currTime =  G_ServerTime:getTime()
	if currTime >= startTime and currTime  <= endTime and isFunctionOpen(curFuncId) then
		local funcName = FunctionConst.getFuncName(curFuncId)
		local actName = Lang.get("activity_names_by_func_id")[funcName]
		G_Prompt:showTip(Lang.get("guild_quit_hint_in_activity", {value = actName}))
		return false
	end


	return true
end

--检查是否可以踢出军团
function GuildDataHelper.checkCanExpelGuild(time)
	local UserDataHelper = require("app.utils.UserDataHelper")
	assert(type(time) == "number", "Invalid time: "..tostring(time))

	local sec = G_ServerTime:getTime() - time
	local timeLimit = tonumber(require("app.config.parameter").get(ParameterIDConst.GUILD_PROTECT_TIMES_ID).content)
	if sec <= timeLimit then
		local timeDes = G_ServerTime:getDayOrHourOrMinFormat(timeLimit)
		G_Prompt:showTip(Lang.get("guild_tip_can_not_expel", {time = timeDes}))
		return false
	end

	local curFuncId, startTime, endTime = G_UserData:getLimitTimeActivity():getCurGuildActivityIcon()
	local currTime =  G_ServerTime:getTime()
	if currTime >= startTime and currTime  <= endTime then
		local funcName = FunctionConst.getFuncName(curFuncId)
		local actName = Lang.get("activity_names_by_func_id")[funcName]
		G_Prompt:showTip(Lang.get("guild_quit_hint_in_activity", {value = actName}))
		return false
	end

		
	local myGuild = G_UserData:getGuild():getMyGuild()
	if myGuild then
		local remainCount =  UserDataHelper.getParameter(ParameterIDConst.GUILD_MAXKICK_TIMES)  - myGuild:getKick_member_cnt()
		if remainCount <= 0 then
			G_Prompt:showTip(Lang.get("guild_kick_remain_count_not_enough"))
			return false
		end
	end

	

	return true
end

--检查是否可以申请入会
function GuildDataHelper.checkCanApplyJoinInGuild()
	local guildInfo = G_UserData:getGuild():getUserGuildInfo()
	local leaveTime = guildInfo:getLeave_time()
	if leaveTime ~= 0 then
		local sec = G_ServerTime:getTime() - leaveTime
		local timeLimit = tonumber(require("app.config.parameter").get(ParameterIDConst.GUILD_QUIT_CD_ID).content)
		if sec <= timeLimit then
			local timeDes = G_ServerTime:getDayOrHourOrMinFormat(timeLimit)
			G_Prompt:showTip(Lang.get("guild_tip_application_time_limit", {time = timeDes}))
			return false
		end
	end
	

	local count = G_UserData:getGuild():getGuildListData():getHasAppliedCount()
	local limitCount = tonumber(require("app.config.parameter").get(ParameterIDConst.GUILD_APPLY_PLAYER_ID).content)
	if count >= limitCount then
		G_Prompt:showTip(Lang.get("guild_tip_application_count_limit", {count = limitCount}))
		return false
	end

	local isGuildWarRunning = G_UserData:getLimitTimeActivity():isActivityOpen(FunctionConst.FUNC_GUILD_WAR)
	if isGuildWarRunning then
		G_Prompt:showTip(Lang.get("guild_tip_application_deny_when_guildwar"))
		return false
	end

	return true
end

--检查是否可以发起弹劾
function GuildDataHelper.checkCanImpeach(offlineTime)
	local myGuild = G_UserData:getGuild():getMyGuild()
	if myGuild then
		local impeachTime = myGuild:getImpeach_time()
		if impeachTime ~= 0 then
			G_Prompt:showTip(Lang.get("guild_tip_impeaching"))
			return false
		end
	end

	local sec = G_ServerTime:getTime() - offlineTime
	local limitTime = tonumber(require("app.config.parameter").get(ParameterIDConst.GUILD_IMPEACH_TIME_ID).content)
	if offlineTime == 0 or sec < limitTime then
		local timeStr = G_ServerTime:getDayOrHourOrMinFormat(limitTime)
		G_Prompt:showTip(Lang.get("guild_tip_impeach_limit", {time = timeStr}))
		return false
	end

	return true
end

--格式化军团日志内容
function GuildDataHelper.formatNotify(notifyDatas)
	local function convertValue(snType,content)
		for j, one in ipairs(content) do
			local key = rawget(one,"key")
			if key and key == "position" then
				local value = rawget(one,"value")
				local name = GuildDataHelper.getGuildDutiesName(value)
				rawset(one, "value", name)
			elseif key and key == "id" then--军团贡献类型,按道理不应该取相同的字段
				local value = rawget(one,"value")
				local name = GuildDataHelper.getGuildContributionName(value)
				rawset(one, "value", name)
			end
		end
		return content
	end

	local function sortFun(a, b)
		return a:getTime() > b:getTime()
	end
	local temp = clone(notifyDatas)
	table.sort(temp, sortFun)

	local result = {}
	local dateList = {}
	local count = 0
	for i, data in ipairs(temp) do
		local snType = data:getSn_type()
		local content = convertValue(snType,data:getContent())
		
		local time = data:getTime()
		local timeStr1, timeStr2 = G_ServerTime:getDateAndTime(time)
		if dateList[timeStr1] == nil then
			count = count + 1
			result[count] = {}
			dateList[timeStr1] = count
		end

		local config = require("app.config.guild_news").get(snType)
		assert(config, string.format("guild_news config can not find id = %d", snType))
		local source = config.news
		local RichTextHelper = require("app.utils.RichTextHelper")
		local text = RichTextHelper.convertRichTextByNoticePairs(source,content,20,Colors.NORMAL_BG_ONE)
		--local text = TextHelper.convertKeyValuePairs(source, content)
		local unit = {
			date = timeStr1,
			time = timeStr2,
			text = text,
		}
		table.insert(result[count], unit)

	end
	return result
end

--获取官衔的描述
function GuildDataHelper.getOfficialInfo(official)
	local officialInfo = require("app.config.official_rank").get(official)
	assert(officialInfo, string.format("official_rank config can not find id = %d", official))

	local name = officialInfo.name
	local color = Colors.getOfficialColor(official)
	return name, color, officialInfo
end

--检查是否可以援助别人
function GuildDataHelper.checkCanGuildHelpOther(fragmentId)
	local UserDataHelper = require("app.utils.UserDataHelper")
	local cdCountDownTime,isForbitHelp = UserDataHelper.getGuildHelpCdCountDownTime()
	if isForbitHelp then
		G_Prompt:showTip(Lang.get("guild_help_tip_in_cd"))
		return false
	end

	local limitMax = GuildDataHelper.getSupportTimes()
	local count = G_UserData:getGuild():getUserGuildInfo():getAsk_help_cnt()
	if count > 0 then--有剩余次数		
		return true
	end

	local buyCount = G_UserData:getGuild():getUserGuildInfo():getAsk_help_buy() 

	local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
	local VipFunctionIDConst = require("app.const.VipFunctionIDConst")
	local timesOut = LogicCheckHelper.vipTimesOutCheck(VipFunctionIDConst.GUILD_HELP_GOLD_BUY_COUNT, 
			buyCount,Lang.get("lang_activity_moneytree_shake_max_time"))
	if timesOut then
		return false
	end	

	local needGold = UserDataHelper.getPriceAdd(10002,buyCount + 1)--价格ID
	local success = LogicCheckHelper.enoughCash(needGold,true)
	if not success then
		return false
	end

	--最大元宝购买次数 VIP弹窗
	--元宝不够 --充值
	--元宝购买
	
	--local haveCount = G_UserData:getFragments():getFragNumByID(fragmentId)
	--if haveCount <= 0 then
	--	logError(string.format("my fragment's count is zero, fragmentId = %d", fragmentId))
	--	return false
	--end

	--G_Prompt:showTip(Lang.get("guild_help_tip_no_help_count"))

	return true
end

--随机获取一句说话文本
function GuildDataHelper.getGuildRandomTalkText()
	local TalkConfig = require("app.config.guild_support_talks")
	local length = TalkConfig.length()
	local id = math.random(1, length)
	local info = TalkConfig.get(id)
	return info.talks
end

--获取完成奖励的内容
function GuildDataHelper.getGuildRewardInfo()
	local dropId = tonumber(require("app.config.parameter").get(ParameterIDConst.GUILD_RECOURSE_FINISH_ID).content)
	local info = DropHelper.getDropReward(dropId)
	return info
end

--获取已经申请增援的武将BaseId表
function GuildDataHelper.getGuildRequestedFilterIds()
	local result = {}
	local helpBases = G_UserData:getGuild():getMyRequestHelp():getHelp_base()
	assert(helpBases,"GuildDataHelper getGuildRequestedFilterIds helpBases nil")
	for k, base in pairs(helpBases) do
		local helpId = base:getHelp_id()
		local config = require("app.config.fragment").get(helpId)
		assert(config, string.format("fragment config can not find id = %d", helpId))
		local filterId = config.comp_value
		table.insert(result, filterId)
	end
	return result
end


--获取请求援助的武将列表
--filterIds:已经申请增援的武将id，需要过滤掉
function GuildDataHelper.getGuildRequestHelpHeroList(filterIds)
	--名将册＞羁绊＞上阵中，相同层级下按照品质从高到低排列
	local CommonConst = require("app.const.CommonConst")
	local orderArr = {
		[CommonConst.HERO_TOP_IMAGE_TYPE_INBATTLE] = 1,
		[CommonConst.HERO_TOP_IMAGE_TYPE_KARMA] = 3,
		[CommonConst.HERO_TOP_IMAGE_TYPE_YOKE] = 2,
		[0] = 0,
	}


	local function sortFun(a, b)
		if orderArr[a.topImageType] ~= orderArr[b.topImageType] then
			return  orderArr[a.topImageType] > orderArr[b.topImageType] 
		elseif a.data:getConfig().color ~= b.data:getConfig().color then
			return a.data:getConfig().color > b.data:getConfig().color
		elseif a.data:getLevel() ~= b.data:getLevel() then
			return a.data:getLevel() > b.data:getLevel()
		elseif a.data:getRank_lv() ~= b.data:getRank_lv() then
			return a.data:getRank_lv() > b.data:getRank_lv()
		else
			return a.data:getBase_id() < b.data:getBase_id()
		end
	end

	local function checkFun(filterIds, baseId)
		for i, id in ipairs(filterIds) do
			if id == baseId then
				return false
			end
		end
		return true
	end

	local colorCountMap = {}	
	for i, baseId in ipairs(filterIds) do
		 local heroConfig = require("app.config.hero").get(baseId)
		assert(heroConfig,"can not find hero id "..tostring(baseId))
		 if colorCountMap[heroConfig.color] then
		 	colorCountMap[heroConfig.color] = colorCountMap[heroConfig.color] + 1
		 else
		 	 colorCountMap[heroConfig.color] = 1
		 end
		 
	end

	dump(colorCountMap)

	local guildLevel = G_UserData:getGuild():getMyGuildLevel()

	local function checkColor(color)
		local GuildSupport = require("app.config.guild_support")
		for k = 1,GuildSupport.length(),1 do
			local config = GuildSupport.indexOf(k)
			local colorNum = colorCountMap[color] or 0
			if config.color == color and config.guild_lv <= guildLevel 
				and  config.launch_max > colorNum 
				then
				return true
			end
		end
		return false	
	end
	
	local result = {}
	local temp = {} --保存符合条件的武将数据
	local allHeros = G_UserData:getHero():getAllHeros()
	local fragments = G_UserData:getFragments():getFragListByType(1)--碎片
	local heroData = G_UserData:getHero()
	local newAllHeros = {}
	for k,hero in pairs(allHeros) do
		table.insert(newAllHeros,hero)
	end

	for k,data in ipairs(fragments) do
		local heroId = data:getConfig().comp_value
		local tempData = {baseId = heroId}
		local heroUnitData = heroData:createTempHeroUnitData(tempData)
		table.insert(newAllHeros,heroUnitData)
	end

	--local Hero = require("app.config.Hero")
	for k, hero in pairs(newAllHeros) do
		local baseId = hero:getBase_id()
		local config = hero:getConfig()
		local color = config.color
		local type = config.type
		if type == 2 and checkColor(color) and checkFun(filterIds, baseId) then --武将卡，品质为紫、橙、红，通过过滤
			if temp[baseId] == nil then
				temp[baseId] = hero
			end
			local tempHero = temp[baseId]
			if hero:getLevel() > tempHero:getLevel() or hero:getRank_lv() > tempHero:getRank_lv() then --只保留等级或突破等级高的一个
				temp[baseId] = hero
			end
		end
	end
	local UserDataHelper = require("app.utils.UserDataHelper")
	for k, hero in pairs(temp) do
		local topImagePath,topImageType = UserDataHelper.getHeroTopImage(hero:getBase_id())
		topImageType = topImageType or 0
		table.insert(result, {data = hero,topImagePath = topImagePath,topImageType = topImageType})
	end

	table.sort(result, sortFun)

	local heroDataList = {}
	for k, v in ipairs(result) do
		table.insert(heroDataList,v.data)
	end
	return heroDataList
end


--返回军团援助CD倒计时，返回是否不能援助
function GuildDataHelper.getGuildHelpCdCountDownTime()
	local UserDataHelper = require("app.utils.UserDataHelper")
	local maxCdTime = UserDataHelper.getParameter(ParameterIDConst.GUILD_SUPPORT_CDMAX)
	local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
	assert(userGuildInfo,"GuildDataHelper getGuildHelpCdCountDownTime userGuildInfo nil")
	local askHelpTime = userGuildInfo:getAsk_help_time()
	local askHelpCdSec = userGuildInfo:getAsk_help_cd_sec()

	local nextHelpTime = askHelpTime + askHelpCdSec
	local countDownTime = nextHelpTime - G_ServerTime:getTime() 
	countDownTime = math.max(countDownTime,0)
	return countDownTime,countDownTime > 0 and askHelpCdSec >= maxCdTime
end

function GuildDataHelper.getGuildHelpNeedGold()
	local count = G_UserData:getGuild():getUserGuildInfo():getAsk_help_cnt()
	if count > 0 then
		return 0
	end
	local UserDataHelper = require("app.utils.UserDataHelper")
	local buyCount = G_UserData:getGuild():getUserGuildInfo():getAsk_help_buy() 
	local needGold = UserDataHelper.getPriceAdd(10002,buyCount + 1)--价格ID
	return needGold
end


function GuildDataHelper.getGuildAnnouncement()
	local announcement = G_UserData:getGuild():getMyGuild():getAnnouncement()
	if announcement == "" then
		announcement = Lang.get("guild_txt_announcement_none")
	end
	return announcement
end

function GuildDataHelper.getGuildDeclaration(guild)
	guild = guild or G_UserData:getGuild():getMyGuild()
	local announcement = guild:getDeclaration()
	if announcement == "" then
		announcement = Lang.get("guild_txt_declaration_none")
	end
	return announcement
end


function GuildDataHelper.getOpenRedPacketData(redPacketData,openRedBagUserList)
	local myRedBagUser = nil
	local maxRedBagMoneyNum = 0
	local newOpenRedBagUserList = {}
	for k,data in ipairs(openRedBagUserList) do
		table.insert( newOpenRedBagUserList, data )
		if data:getUser_id() == G_UserData:getBase():getId() then
			myRedBagUser = data
		end
		if data:getGet_money() > maxRedBagMoneyNum then
			maxRedBagMoneyNum = data:getGet_money()
		end
	end

	--如果红包没抢完，排序按照抢的时间进行排序			
	--如果这个红包被抢完了，把手气最佳的排到最上面	
	local isFinish = false
	local redPacketCfg = redPacketData:getConfig()
	if #newOpenRedBagUserList >= redPacketCfg.number and maxRedBagMoneyNum > 0 then
		--红包抢完了
		isFinish = true
	end
	local newList = {}
	for k,v in ipairs(newOpenRedBagUserList) do
		if isFinish and v:getGet_money() == maxRedBagMoneyNum then
			v:setIs_best(true)
			table.insert(newList,v)
		end
	end
	for k,v in ipairs(newOpenRedBagUserList) do
		if isFinish and v:getGet_money() == maxRedBagMoneyNum then
		else
			table.insert(newList,v)
		end
	end

	return { redPacketData = redPacketData,list = newList,myRedBagUser = myRedBagUser,isFinish = isFinish}
end

--军团任务数据
function GuildDataHelper.getGuildMissionData()
	local CommonConst = require("app.const.CommonConst")
	local GuildMission = require("app.config.guild_mission")
	local DropHelper = require("app.utils.DropHelper")
	local myGuild = G_UserData:getGuild():getMyGuild()
	local level = G_UserData:getGuild():getMyGuildLevel()
	local exp = myGuild:getDaily_total_exp()
	local configList = {}
	for index = 1,GuildMission.length(),1 do
		local config = GuildMission.indexOf(index)
		if config.guild_level == level then
			table.insert(configList,config)
		end
	end
	local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
	local boxDataList = {}
	for k,v in ipairs(configList) do	
		local data = {status = CommonConst.BOX_STATUS_NOT_GET,config = v,dropList = nil,exp = 0}
		local isReceived = userGuildInfo:isBoxReceived(k)
		if isReceived then
			data.status = CommonConst.BOX_STATUS_ALREADY_GET
		elseif v.need_exp <= exp then
			data.status = CommonConst.BOX_STATUS_CAN_GET
		end
		data.dropList = DropHelper.getDropReward(v.drop)
		data.exp = v.need_exp
		table.insert(boxDataList,data)
	end
	  
	--CommonConst.BOX_STATUS_NOT_GET = 0--不可领
     --CommonConst.BOX_STATUS_CAN_GET = 1--可领取
    --CommonConst.BOX_STATUS_ALREADY_GET = 2--已领取
	return boxDataList
end


function GuildDataHelper.getGuildTotalActivePercent()
	local myGuild = G_UserData:getGuild():getMyGuild()
	local taskDataList = myGuild:getTaskDataList()
	local progress = 0
	local max = 0 
	for k,taskData in pairs(taskDataList) do
		local config = taskData:getConfig()
		if config.is_open == 1 then
			local people = taskData:getPeople()
			local maxPeople = config.max_active

			progress = progress + people
			max = max + maxPeople
		end
	end
	return math.floor(progress*100/max)
end

function GuildDataHelper.getGuildTotalActiveColor()
	--[[
	local getTaskActiveColor  = function(taskData)
		local config = taskData:getConfig()
		local people = taskData:getPeople()
		local maxPeople = config.max_active
		local actColor = 1
		for k = 5, 1 ,-1 do
			if people >= config["color"..k]  then
				actColor = k
				break
			end
		end
		return actColor
	end
	local myGuild = G_UserData:getGuild():getMyGuild()
	local taskDataList = myGuild:getTaskDataList()
	local taskActiveColorData = {}
	for k,taskData in pairs(taskDataList) do
		if taskData:getConfig().is_open == 1 then
			local activeColor = getTaskActiveColor(taskData)
			taskActiveColorData[activeColor] = taskActiveColorData[activeColor] or 0
			taskActiveColorData[activeColor] = taskActiveColorData[activeColor] + 1
		end
	end
	local maxColorNum = 0
	local activeColor = 1
	for k,v in pairs(taskActiveColorData) do
		if v  > maxColorNum then
			maxColorNum = v
			activeColor = k
		end
	end
	return activeColor
	]]
	local activeColor = 1
	local percent = GuildDataHelper.getGuildTotalActivePercent()
	local colorPercentList = {20,40,60,80,100}
	for i = 1,#colorPercentList,1 do
		if percent <= colorPercentList[i] then
			activeColor = i
			break
		end
	end

	return activeColor
end

function GuildDataHelper.isHaveGuildPermission(permissionType)
	local UserDataHelper = require("app.utils.UserDataHelper")
	local userMemberData = G_UserData:getGuild():getMyMemberData()
	local userPosition = userMemberData:getPosition()
	local isHave = GuildDataHelper.isHaveJurisdiction(userPosition,permissionType)
	return isHave
end


function GuildDataHelper.getGuildContributionList()
	local GuildDonate = require("app.config.guild_donate")
	local contributionList = {}
	for i = 1,GuildDonate.length(),1 do
		local config = GuildDonate.indexOf(i)
		table.insert( contributionList,config)
	end
	return contributionList
end

--军团捐献宝箱数据
function GuildDataHelper.getGuildContributionBoxData()
	local CommonConst = require("app.const.CommonConst")
	local GuildDonateBox = require("app.config.guild_donate_box")
	local DropHelper = require("app.utils.DropHelper")
	local myGuild = G_UserData:getGuild():getMyGuild()
	local level = G_UserData:getGuild():getMyGuildLevel()
	local exp = myGuild:getDonate_point()
	local configList = {}
	for index = 1,GuildDonateBox.length(),1 do
		local config = GuildDonateBox.indexOf(index)
		if config.guild_level == level then
			table.insert(configList,config)
		end
	end
	local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
	local boxDataList = {}
	for k,v in ipairs(configList) do	
		local data = {status = CommonConst.BOX_STATUS_NOT_GET,config = v,dropList = nil,exp = 0}
		local isReceived = userGuildInfo:isContributionBoxReceived(k)
		if isReceived then
			data.status = CommonConst.BOX_STATUS_ALREADY_GET
		elseif v.need_score <= exp then
			data.status = CommonConst.BOX_STATUS_CAN_GET
		end
		data.dropList = DropHelper.getDropReward(v.drop)
		data.exp = v.need_score
		table.insert(boxDataList,data)
	end

	local maxExp = 32--最大经验32
	exp = math.min(exp,maxExp)

	return boxDataList,exp,maxExp
end

function GuildDataHelper.getGuildContributionRemainCount()
	local maxDonateCount = 1
	local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
	if userGuildInfo then
		local donate = userGuildInfo:getDonate()
		return donate > 0 and 0 or 1--最大次数1
	end
	return 0
end

--获取捐献名称
function GuildDataHelper.getGuildContributionName(id)
	if type(id) == "string" then
		id = tonumber(id)
	end
	local config = require("app.config.guild_donate").get(id)
	assert(config, string.format("guild_donate config can nof find id = %d", id))

	return config.name
end

function GuildDataHelper.isGuildTaskHasComplete(taskId)
	--local myGuild = G_UserData:getGuild():getMyGuild()
	local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
	local taskDataList = userGuildInfo:getTaskDataList() 
	return taskDataList[taskId] and  taskDataList[taskId] > 0
end

function GuildDataHelper.getCanSnatchRedPacketNum()
	local UserDataHelper = require("app.utils.UserDataHelper")
	local userGuildInfo = G_UserData:getGuild():getUserGuildInfo()
	local alreadySnatchNum = userGuildInfo:getGet_red_bag_cnt()
	local totalNum = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_REDPACKET_OPENTIMES)
	return math.max(0,totalNum - alreadySnatchNum)
end

local function sortFunByOfficer(a, b)
	if a:getOfficer_level() ~= b:getOfficer_level() then
		return a:getOfficer_level() < b:getOfficer_level()
	end
	return a:getUid() < b:getUid()
end

local function sortFunByLevel(a, b)
	if a:getLevel() ~= b:getLevel() then
		return a:getLevel() < b:getLevel()
	end
	return a:getUid() < b:getUid()
end

local function sortFunByPower(a, b)
	if a:getPower() ~= b:getPower() then
		return a:getPower() < b:getPower()
	end
	return a:getUid() < b:getUid()
end

local function sortFunByPosition(a, b)
	if a:getPosition() ~= b:getPosition() then
		return a:getPosition() > b:getPosition()
	end
	return a:getUid() < b:getUid()
end

local function sortFunByWeekContribution(a, b)
	if a:getWeek_contribution() ~= b:getWeek_contribution() then
		return a:getWeek_contribution() < b:getWeek_contribution()
	end
	return a:getUid() < b:getUid()
end

local function sortFunByContribution(a, b)
	if a:getContribution() ~= b:getContribution() then
		return a:getContribution() < b:getContribution()
	end
	return a:getUid() < b:getUid()
end

local function sortFunByOffline(a, b)
	local onlineA = a:isOnline() and 1 or 0
	local onlineB = b:isOnline() and 1 or 0
	if onlineA ~= onlineB then
		return onlineA > onlineB
	end
		
	if a:getOffline() ~= b:getOffline() then
		return a:getOffline() > b:getOffline()
	end
	return a:getUid() < b:getUid()
end

local function sortFunByDefault(a, b)
	local selfA = a:isSelf() and 1 or 0
	local selfB = b:isSelf() and 1 or 0
	if selfA ~= selfB then
		return selfA > selfB
	end

	if a:getPosition() ~= b:getPosition() then
		return a:getPosition() < b:getPosition()
	end
			
	local onlineA = a:isOnline() and 1 or 0
	local onlineB = b:isOnline() and 1 or 0
	if onlineA ~= onlineB then
		return onlineA > onlineB
	end
		
	return a:getOffline() > b:getOffline()
end

local function sortFunByActiveRate(a, b)
	if a:getActive_cnt() ~= b:getActive_cnt() then
		return a:getActive_cnt() < b:getActive_cnt()
	end
	return a:getUid() < b:getUid()
end

local function sortFunByTrainType( a,b )
	local selfA = a:isSelf() and 1 or 0
	local selfB = b:isSelf() and 1 or 0
	if selfA ~= selfB then
		return selfA > selfB
	end
	if a:getTrainType() == b:getTrainType() then
		return a:getLevel() < b:getLevel()
	else
		return a:getTrainType() < b:getTrainType()
	end
end 


function GuildDataHelper.getGuildMemberListBySort(category,isAscendOrder)
logWarn(tostring(category).." &&&&&&&&&&&&&&& getGuildMemberListBySort "..tostring(isAscendOrder))
	local result = {}
	local sortFunList = {sortFunByOfficer,sortFunByLevel,sortFunByPower,sortFunByPosition,
		sortFunByActiveRate,sortFunByOffline,sortFunByTrainType}

	local guildMemberList = G_UserData:getGuild():getGuildMemberList()
	for k, unit in pairs(guildMemberList) do
		table.insert(result, unit)
	end

	if category and sortFunList[category] then
		table.sort(result,sortFunList[category] )
	else
		table.sort(result,sortFunByDefault)
	end

	if isAscendOrder == false then
	logWarn(" &&&&&&&&&&&&&&& getGuildMemberListBySort")
		local newResult = {}
		if category == 7 then
			table.insert( newResult,result[1] )
			if #result>1 then
				for k =#result,2,-1 do
					table.insert( newResult,result[k] )
				end
			end
		else
			for k =#result,1,-1 do
				table.insert( newResult,result[k] )
			end
		end
		return newResult
	end
	return result
end


return GuildDataHelper 