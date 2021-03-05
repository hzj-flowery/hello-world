-- 选择武将 通用界面
local PopupChooseHeroHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")

PopupChooseHeroHelper.FROM_TYPE1 = 1 --从“加号”点进来
PopupChooseHeroHelper.FROM_TYPE2 = 2 --从“更换”点进来
PopupChooseHeroHelper.FROM_TYPE3 = 3 --从“援军+”点进来
PopupChooseHeroHelper.FROM_TYPE4 = 4 --从“援军Icon”点进来
PopupChooseHeroHelper.FROM_TYPE5 = 5 --从驻地“加号”点进来
PopupChooseHeroHelper.FROM_TYPE6 = 6 --从“请求增援”点进来
PopupChooseHeroHelper.FROM_TYPE7 = 7 --从“武将重生”点进来
PopupChooseHeroHelper.FROM_TYPE8 = 8 --从“武将置换”点进来

local BTN_DES = {
	[1] = "hero_replace_btn_battle",
	[2] = "hero_replace_btn_replace",
	[3] = "hero_replace_btn_battle",
	[4] = "hero_replace_btn_replace",
	[5] = "lang_territory_choose",
	[6] = "guild_help_btn_help",
	[7] = "lang_territory_choose",
	[8] = "lang_territory_choose",
}

PopupChooseHeroHelper._beReplacedPos = nil --要被替换的武将阵位索引

function PopupChooseHeroHelper._getHeroDataYoKeDesc(heroData, fromType)
	local beReplacedId = nil --要被替换的武将basdId
	if PopupChooseHeroHelper._beReplacedPos then
		local heroId = nil
		if fromType == PopupChooseHeroHelper.FROM_TYPE2 then
			heroId = G_UserData:getTeam():getHeroIdWithPos(PopupChooseHeroHelper._beReplacedPos)
		elseif fromType == PopupChooseHeroHelper.FROM_TYPE4 then
			heroId = G_UserData:getTeam():getHeroIdInReinforcementsWithPos(PopupChooseHeroHelper._beReplacedPos)
		end
		assert(heroId, string.format("PopupChooseHeroHelper._getHeroDataYoKeDesc, fromType is wrong = %d", fromType))
		local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
		beReplacedId = unitData:getBase_id()
	end
	
	local des = ""
	local yokeCount = 0
	if fromType == PopupChooseHeroHelper.FROM_TYPE3 or fromType == PopupChooseHeroHelper.FROM_TYPE4 then
		yokeCount = UserDataHelper.getWillActivateYokeCount(heroData:getBase_id(), beReplacedId, true)
	elseif fromType == PopupChooseHeroHelper.FROM_TYPE7 then

	else
		yokeCount = UserDataHelper.getWillActivateYokeCount(heroData:getBase_id(), beReplacedId)
	end
	if yokeCount > 0 then
		des = des..Lang.get("hero_replace_yoke_des", {count = yokeCount}).."\n"
	end

	if fromType ~= PopupChooseHeroHelper.FROM_TYPE3 and fromType ~= PopupChooseHeroHelper.FROM_TYPE4 then --援军选择列表不显示合击信息
		if heroData:isActiveJoint(beReplacedId) then
			local heroConfig = heroData:getConfig()
			local name = require("app.config.hero").get(heroConfig.skill_3_partner).name
			des = des..Lang.get("hero_replace_joint_des", {name = name})
		end
	end

	return des
end



function PopupChooseHeroHelper.addHeroDataDesc(heroData, fromType, index, t)
	if heroData == nil then
		return nil
	end

	local cellData = clone(heroData)
	--选择英雄，领地界面
	if fromType == PopupChooseHeroHelper.FROM_TYPE5  then
		local heroConfig = heroData:getConfig()
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local fragNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, heroConfig.fragment_id)
		cellData.richTextDesc = {Lang.get("lang_territory_choose_hero_fragment", {num = fragNum})}
	elseif fromType == PopupChooseHeroHelper.FROM_TYPE7 or fromType == PopupChooseHeroHelper.FROM_TYPE8 then
		local awakeStar, awakeLevel = UserDataHelper.convertAwakeLevel(heroData:getAwaken_level())
		cellData.richTextDesc = {
			Lang.get("reborn_hero_list_rich_text1", {level = heroData:getLevel()}),
			Lang.get("reborn_hero_list_rich_text2", {awakeStar = awakeStar, awakeLevel = awakeLevel}),
		}
	elseif fromType == PopupChooseHeroHelper.FROM_TYPE6 then
		local heroConfig = heroData:getConfig()
		local TypeConvertHelper = require("app.utils.TypeConvertHelper")
		local fragNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, heroConfig.fragment_id)
		cellData.richTextDesc = {Lang.get("lang_territory_choose_hero_fragment", {num = fragNum})}
		cellData.textDesc = ""--不显示
	else
		--加入缘分or羁绊描述
		cellData.textDesc = PopupChooseHeroHelper._getHeroDataYoKeDesc(heroData, fromType)
	end
	cellData = PopupChooseHeroHelper._PROC_BTN_DESC(cellData, fromType, index, t)

	return cellData
end

--处理cell的button属性
function PopupChooseHeroHelper._PROC_BTN_DESC(cellData,fromType,index,t)
	cellData.btnIsHightLight = false
	cellData.btnShowRP = false
	if fromType ~= PopupChooseHeroHelper.FROM_TYPE5 then
		cellData.btnDesc = Lang.get(BTN_DES[fromType])
		if fromType == PopupChooseHeroHelper.FROM_TYPE4 and index == 0 and t == 1 then --从援军Icon点进来的，排在第一位的一定是“下阵”
			cellData.btnDesc = Lang.get("hero_replace_btn_down")
			cellData.btnIsHightLight = true
		end
		cellData.btnEnable = true
	end



	--类型, 领地系统
	if fromType == PopupChooseHeroHelper.FROM_TYPE5 then
		local inPartolHeros = G_UserData:getTerritory():getHeroIds()
		local heroId = cellData:getBase_id()
		local inPartol = inPartolHeros[heroId] or false
		cellData.btnDesc = Lang.get(BTN_DES[fromType])
		cellData.btnEnable = not inPartol
		--上阵图片
		if G_UserData:getTeam():isInBattleWithBaseId(heroId) then
			cellData.topImagePath = Path.getTextSignet("img_iconsign_shangzhen")
		end
		if cellData.btnEnable == false then
			cellData.topImagePath = Path.getTextSign("img_iconsign_patrol")
		end
	elseif fromType == PopupChooseHeroHelper.FROM_TYPE6 then
		local heroId = cellData:getBase_id()
		cellData.topImagePath = UserDataHelper.getHeroTopImage(heroId)
	end

	--武将更换红点
	if fromType == PopupChooseHeroHelper.FROM_TYPE2 then
		if UserDataHelper.isReachCheckBetterColorHeroRP(cellData) and PopupChooseHeroHelper._beReplacedPos then
			local heroId = G_UserData:getTeam():getHeroIdWithPos(PopupChooseHeroHelper._beReplacedPos)
			local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local reach = cellData:getConfig().color > unitData:getConfig().color
			cellData.btnShowRP = reach
		end
	end
	return cellData
end


function PopupChooseHeroHelper._FROM_TYPE1(param)
	PopupChooseHeroHelper._beReplacedPos = nil
	local heroData = G_UserData:getHero():getReplaceDataBySort()
	return heroData
end


function PopupChooseHeroHelper._FROM_TYPE2(param)
	PopupChooseHeroHelper._beReplacedPos = unpack(param)
	local heroId = G_UserData:getTeam():getHeroIdWithPos(PopupChooseHeroHelper._beReplacedPos)
	local unitHeroData = G_UserData:getHero():getUnitDataWithId(heroId)
 	local heroBaseId = unitHeroData:getBase_id()
	local heroData = G_UserData:getHero():getReplaceDataBySort(heroBaseId)

	return heroData
end
function PopupChooseHeroHelper._FROM_TYPE3(param)
	PopupChooseHeroHelper._beReplacedPos = nil
	local heroData = G_UserData:getHero():getReplaceReinforcementsDataBySort()

	return heroData
end
function PopupChooseHeroHelper._FROM_TYPE4(param)
	PopupChooseHeroHelper._beReplacedPos = unpack(param)
	local heroId = G_UserData:getTeam():getHeroIdInReinforcementsWithPos(PopupChooseHeroHelper._beReplacedPos)
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local beReplacedId = heroUnitData:getBase_id()
	local heroData = G_UserData:getHero():getReplaceReinforcementsDataBySort(heroId, beReplacedId)

	return heroData
end


function PopupChooseHeroHelper._FROM_TYPE5(param)
	PopupChooseHeroHelper._beReplacedPos = nil
	local heroData  = G_UserData:getTerritory():getAllHeros()

	return heroData
end

function PopupChooseHeroHelper._FROM_TYPE6(param)
	PopupChooseHeroHelper._beReplacedPos = nil
	local filterIds = UserDataHelper.getGuildRequestedFilterIds()
	local heroData = UserDataHelper.getGuildRequestHelpHeroList(filterIds)
	return heroData
end

function PopupChooseHeroHelper._FROM_TYPE7(param)
	PopupChooseHeroHelper._beReplacedPos = nil
	local heroData = G_UserData:getHero():getRebornList()
	return heroData
end

function PopupChooseHeroHelper._FROM_TYPE8(param)
	local filterIds, tempData = unpack(param)
	local heroData = UserDataHelper.getHeroTransformTarList(filterIds, tempData)
	return heroData
end

function PopupChooseHeroHelper.checkIsEmpty(fromType, param)
	local func = PopupChooseHeroHelper["_FROM_TYPE"..fromType]
	if func and type(func) == "function" then
		local herosData = func(param)
		return #herosData == 0
	end
	return true
end

return PopupChooseHeroHelper
