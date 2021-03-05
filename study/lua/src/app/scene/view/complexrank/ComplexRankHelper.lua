--complex view帮助类

local ComplexRankHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")

function ComplexRankHelper.getComplexTab()
	local ComplexRankConst = require("app.const.ComplexRankConst")
	
	local list = {}
	local indexlist = {}
	for i, info in ipairs(ComplexRankConst.RANK_TAB_LIST) do
		local functionId = info[2]
		if ComplexRankHelper._checkIsOpen(functionId) then
			table.insert(list, Lang.get("complex_rank_tab"..i))
			table.insert(indexlist, {Lang.get("complex_rank_tab"..i), info[1]})
		end
	end

	return list, indexlist
end

function ComplexRankHelper._checkIsOpen(functionId)
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	if functionId then
		return FunctionCheck.funcIsOpened(functionId)
	else
		return true --默认打开
	end
end

function ComplexRankHelper.getRankTypeByTabIndex(index)
	local complexList, indexlist = ComplexRankHelper.getComplexTab()
	local tabName = complexList[index]
	for i, value in ipairs(indexlist) do
		local name, constIndex = unpack(value)
		if name == tabName then
			return constIndex
		end
	end
	return 1
end

function ComplexRankHelper.getTabIndexByRankType(index)
	local complexList, indexlist = ComplexRankHelper.getComplexTab()
	for i, value in ipairs(indexlist) do
		local name, constIndex = unpack(value)
		if constIndex == index then
			return i
		end
	end
	return 1
end

function ComplexRankHelper.makeUserRank(id, serverData)
	local userData = {}

	userData.userId = rawget(serverData, "user_id")
	userData.name = rawget(serverData, "name")
	userData.rank = rawget(serverData, "rank")
	userData.baseId = rawget(serverData, "base_id")
	userData.avatarBaseId = rawget(serverData, "avatar_base_id")

	local baseId, playerHeadInfo = UserDataHelper.convertAvatarId(serverData)
	userData.baseId = baseId
	userData.playerHeadInfo = playerHeadInfo
	userData.power = rawget(serverData, "power")
	userData.officialLv = rawget(serverData, "officer_level") or rawget(serverData, "office_level")
	if userData.officialLv == nil then
		userData.officialLv = 0
	end

	userData.guildName = rawget(serverData, "guild_name") or rawget(serverData, "guild") or ""
	if id == SignalConst.EVENT_COMPLEX_GUILD_RANK then
		userData.guildName = rawget(serverData, "name")
		userData.guildIconId = rawget(serverData, "base_id") or 1
		userData.baseId = 1
	end
	if userData.guildName == "" then
		userData.guildName = Lang.get("complex_rank_no_guild")
	end
	userData.level = rawget(serverData, "level")
	userData.leaderName = rawget(serverData, "leader_name")
	userData.leaderOfficialLv = rawget(serverData, "leader_office_level") or 0

	userData.memberCount = rawget(serverData, "member_count")
	userData.chapter = rawget(serverData, "chapter")
	userData.star = rawget(serverData, "star")
	userData.layer = rawget(serverData, "layer")
	userData.titleId = rawget(serverData, "title") or 0
	userData.photo_count = rawget(serverData, "photo_count") or 0
	userData.head_frame_id = rawget(serverData,"head_frame_id") or 0
	userData.avaterNum = rawget(serverData,"avater_num") or 0
	return userData
end
-- message UserPhotoRankInfo {
--   required uint64 user_id = 1;
--   optional string name = 2;  //名字
--   optional uint32 photo_count = 3;  //激活名将册个数
--   optional uint32 base_id = 4;
--   optional uint32 avatar_base_id = 5;
--   optional uint32 office_level = 6;
--   optional uint32 rank = 7;  //排名
--   optional string guild = 8;  //工会
--   optional uint32 title = 9;  //称号
-- }

-- message C2S_GetUserActivePhotoRank{
-- }

-- message S2C_GetUserActivePhotoRank{
--   required uint32 ret = 1;
--   repeated UserPhotoRankInfo rank_list = 2;
--   optional uint32 user_photocount = 3;
--   optional uint32 user_rank = 4;
-- }
function ComplexRankHelper.covertServerData(id, message)
	local userData = {}
	local list = {}
	local myData = {}
	myData.myRank = rawget(message, "user_rank")
	if myData.myRank == nil or myData.myRank <= 0 then
		myData.myRank = rawget(message, "self_rank") or 0
	end

	myData.myLevel = rawget(message, "user_level") or 0
	myData.myPower = rawget(message, "user_power") or rawget(message, "power") or 0
	myData.myGuildLevel = rawget(message, "guild_level") or Lang.get("complex_rank_no_guild")
	myData.myStar = rawget(message, "star") or 0
	myData.user_photocount = rawget(message, "user_photocount") or 0
	myData.avaterNum = rawget(message, "avater_num") or 0

	local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")
	local myTitle = PopupHonorTitleHelper.getEquipedTitle()
	myData.titleId = myTitle and myTitle:getId() or 0

	myData.baseId = G_UserData:getBase():getPlayerBaseId()

	--myData.myLevel = rawget(message, "user_level") or 0

	if id == SignalConst.EVENT_COMPLEX_ARENA_RANK then
		myData.myRank = rawget(message, "user_arena_rank") or 0
		local serverList = rawget(message, "user_list") or {}
		for i, value in ipairs(serverList) do
			local userData = ComplexRankHelper.makeUserRank(id, value)
			table.insert(list, userData)
		end
	end

	if
		id == SignalConst.EVENT_COMPLEX_STAGE_STAR_RANK or id == SignalConst.EVENT_COMPLEX_ELITE_STAR_RANK or
			id == SignalConst.EVENT_COMPLEX_TOWER_STAR_RANK
	 then
		local serverList = rawget(message, "ranks") or {}
		for i, value in ipairs(serverList) do
			local userData = ComplexRankHelper.makeUserRank(id, value)
			table.insert(list, userData)
		end
	end

	if
		id == SignalConst.EVENT_COMPLEX_POWER_RANK or id == SignalConst.EVENT_COMPLEX_LEVEL_RANK or
			id == SignalConst.EVENT_COMPLEX_GUILD_RANK or
			id == SignalConst.EVENT_COMPLEX_ACTIVE_PHOTO_RANK or 
			id == SignalConst.EVENT_COMPLEX_USER_AVATAR_PHOTO_RANK
	 then
		local serverList = rawget(message, "rank_list") or {}
		for i, value in ipairs(serverList) do
			local userData = ComplexRankHelper.makeUserRank(id, value)
			table.insert(list, userData)
		end
	end

	if myData.myRank == nil or myData.myRank == 0 then
		myData.myRank = Lang.get("complex_rank_no_guild")
	end

	local sortFunc = function(obj1, obj2)
		return obj1.rank < obj2.rank
	end

	table.sort(list, sortFunc)

	return list, myData
end

return ComplexRankHelper
