--
-- Author: hedili
-- Date: 2018-01-30 19:43:01
-- 神兽培养帮助类
local PetTrainHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LimitCostConst = require("app.const.LimitCostConst")

PetTrainHelper.CFG_PARAMETER_LIMIT_STAR		= 651 -- 神兽界限突破前星级|突破后星级
PetTrainHelper.CFG_PARAMETER_ITEM			= 652 -- 神兽界限突破消耗的道具id
PetTrainHelper.CFG_PARAMETER_ITEM_CONSUME	= 654 -- 神兽界限突破消耗的道具数量
PetTrainHelper.CFG_PARAMETER_COIN 			= 653 -- 神兽界限突破消耗银币




--升星突然描述
function PetTrainHelper.createBreakDesc(petUnitData)
	local size = cc.size(334, 88)
	local sc = ccui.ScrollView:create()
	sc:setBounceEnabled(true)
	sc:setDirection(ccui.ScrollViewDir.vertical)
	sc:setTouchEnabled(true)
	sc:setSwallowTouches(true)
	sc:setScrollBarEnabled(false)
	sc:setAnchorPoint(cc.p(0.5, 1))
	
	local label = nil
	if UserDataHelper.isReachStarLimit(petUnitData) then
		label = cc.Label:createWithTTF(Lang.get("pet_break_txt_all_unlock"), Path.getCommonFont(), 22)
		label:setMaxLineWidth(size.width)
	else
		local starLevel = petUnitData:getStar() + 1
		local petStarConfig = UserDataHelper.getPetStarConfig(petUnitData:getBase_id(), starLevel)
		local talentName = petStarConfig.talent_name
		local talentDes = petStarConfig.talent_description
		local breakDes = Lang.get("pet_break_txt_break_des", {rank = starLevel})
		local talentInfo =
			Lang.get(
			"pet_break_txt_talent_des",
			{
				name = talentName,
				des = talentDes,
				breakDes = breakDes
			}
		)

		label = ccui.RichText:createWithContent(talentInfo)
		label:ignoreContentAdaptWithSize(false)
		label:setContentSize(cc.size(size.width, 0))
		label:formatText()
	end
	local labelSize = label:getContentSize()
	sc:setContentSize(size)
	sc:setInnerContainerSize(labelSize)
	sc:addChild(label)
	label:setAnchorPoint(cc.p(0,1))
	local height = math.max(size.height, labelSize.height)
	label:setPosition(cc.p(0, height))
	if labelSize.height<=size.height then
		sc:setTouchEnabled(false)
		sc:setSwallowTouches(false)
	end
	return sc
end

-- 获取界限突破消耗材料
function PetTrainHelper.getCurLimitCostInfo()
	local petId = G_UserData:getPet():getCurPetId()
	local petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
	return PetTrainHelper.getLimitCostInfo(petUnitData)
end

function PetTrainHelper.getLimitCostInfo(petUnitData)
	local LimitCostConst = require("app.const.LimitCostConst")
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local costInfo = {}

	local petConfig = petUnitData:getConfig()
	if petConfig.pet_limit_id == 0 then
		--如果不能界限突破 就看突破前的
		petConfig = require("app.config.pet").get(petConfig.potential_before)
	end
	local limitId = petConfig.pet_limit_id
	local petLimitConfig = UserDataHelper.getPetLimitConfig(petConfig.pet_limit_id)
	for i = LimitCostConst.LIMIT_COST_KEY_1, LimitCostConst.LIMIT_COST_KEY_4 do
		costInfo["type_" ..i] = petLimitConfig['type_' .. i]
		costInfo["value_" ..i] = petLimitConfig['value_' .. i]
		costInfo["size_" .. i] = petLimitConfig['size_' .. i]
		costInfo["consume_" .. i] = petLimitConfig['consume_' .. i]
	end
	costInfo["coin_size"] = petLimitConfig.break_size

	return costInfo
end

-- 获取可以用于界限突破的神兽数量
function PetTrainHelper.getCanConsumePetNums(baseId)
	local result = G_UserData:getPet():getSameCardCountWithBaseId(baseId)
	return #result
end

-- 是否可以进行界限突破
-- bAllReady 除了星级等级 还看材料是否齐了
function PetTrainHelper.canLimit(petUnit, bAllReady)
	local PetConst = require("app.const.PetConst")
	local isCan = true
	isCan = isCan and PetTrainHelper.canEnterLimit(petUnit)
	isCan = isCan and (petUnit:getStar() >= PetTrainHelper.getCanLimitMinStar())
	isCan = isCan and petUnit:getQuality() == PetConst.QUALITY_ORANGE
	if bAllReady then
		local function checkIsMaterialFull(petUnit, costKey)
			local curCount = petUnit:getMaterials()[costKey]
			local costInfo = PetTrainHelper.getCurLimitCostInfo()
			return curCount >= costInfo["size_" .. costKey]
		end
		for i = LimitCostConst.LIMIT_COST_KEY_1, LimitCostConst.LIMIT_COST_KEY_4 do
			isCan = isCan and checkIsMaterialFull(petUnit, i)
		end
	end
	return isCan
end

function PetTrainHelper.isPromptPetLimit(petUnit)
	if not PetTrainHelper.canEnterLimit(petUnit) then
		return false
	end
	if (petUnit:getStar() < PetTrainHelper.getCanLimitMinStar()) then
		return false
	end
	
	local PetConst = require("app.const.PetConst")
	if petUnit:getQuality() ~= PetConst.QUALITY_ORANGE then
		return false
	end

	local isAllFull = true
	for key = LimitCostConst.LIMIT_COST_KEY_1, LimitCostConst.LIMIT_COST_KEY_4 do
		local isOk, isFull = PetTrainHelper.isPromptPetLimitWithCostKey(petUnit, key)
		isAllFull = isAllFull and isFull
		if isOk then
			return true
		end
	end
	if isAllFull then
		local info = PetTrainHelper.getCurLimitCostInfo()
		local isOk = require("app.utils.LogicCheckHelper").enoughMoney(info.coin_size)
		if isOk then
			return true
		end
	end

	return false
end

function PetTrainHelper.isPromptPetLimitWithCostKey(petUnit, key)
	local info = PetTrainHelper.getLimitCostInfo(petUnit)
	local curCount = petUnit:getCurLimitCostCountWithKey(key)
	local maxSize = info["size_" .. key]

	local isFull = curCount >= maxSize
	if not isFull then
		if key == LimitCostConst.LIMIT_COST_KEY_1 then
			local ownExp = curCount
			for j = 1, 4 do
				local count =
					require("app.utils.UserDataHelper").getNumByTypeAndValue(
					TypeConvertHelper.TYPE_ITEM,
					DataConst["ITEM_PET_LEVELUP_MATERIAL_" .. j]
				)
				local itemValue = require("app.config.item").get(DataConst["ITEM_PET_LEVELUP_MATERIAL_" .. j]).item_value
				local itemExp = count * itemValue
				ownExp = ownExp + itemExp
				if ownExp >= maxSize then
					return true, isFull
				end
			end
		else
			local count =
				require("app.utils.UserDataHelper").getNumByTypeAndValue(info["type_" .. key], info["value_" .. key]) + curCount
			if count >= maxSize then
				return true, isFull
			end
		end
	end
	return false, isFull
end

--是否显示界限突破按钮
function PetTrainHelper.canShowLimitBtn(petUnit)
	local PetConst = require("app.const.PetConst")
	local isCan = true
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local isShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_PET_TRAIN_TYPE3)
	isCan = isCan and isShow
	isCan = isCan and (petUnit:getQuality() == PetConst.QUALITY_ORANGE and 
			petUnit:getConfig().potential_after > 0 and
			petUnit:getStar() >= PetTrainHelper.getCanLimitMinStar() or 
			(petUnit:getQuality() == PetConst.QUALITY_RED and petUnit:getInitial_star() == 0))
	return isCan
end

-- 突破的星级条件是否满足
function PetTrainHelper.petStarCanLimit(petUnit)
	return petUnit:getStar() >= PetTrainHelper.getCanLimitMinStar()
end

-- 是否可以进入界限突破
function PetTrainHelper.canEnterLimit(petUnit)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PET_TRAIN_TYPE3)
	local config = petUnit:getConfig()
	return (config.potential_after > 0 or config.potential_before > 0) and isOpen
end

-- 界限突破之后的等级(等级不变)
function PetTrainHelper.limitAfterLevel(petUnit)
	return petUnit:getLevel()
	-- local curLevel = petUnit:getLevel()
	-- local color = petUnit:getConfig().color
	-- local curAllExp = 0
	-- for lv = 1, curLevel - 1 do
	-- 	local exp = require("app.config.pet_exp").get(lv, color).exp
	-- 	assert(exp, "pet_exp not found exp by " .. lv .. " " .. color)
	-- 	curAllExp = curAllExp + exp
	-- end
	-- local afterLevel = 1
	-- local afterColor = color + 1
	-- while true do
	-- 	local exp = require("app.config.pet_exp").get(afterLevel, afterColor).exp
	-- 	assert(exp, "pet_exp not found exp by " .. afterLevel .. " " .. afterColor)
	-- 	if curAllExp > exp then
	-- 		curAllExp = curAllExp - exp
	-- 		afterLevel = afterLevel + 1
	-- 	else
	-- 		break
	-- 	end
	-- end
	-- return afterLevel
end

-- 可以界限突破的最小星级
function PetTrainHelper.getCanLimitMinStar()
	local Paramter = require("app.config.parameter")
	local config = Paramter.get(650)
	assert(config, "paramter not found config by " .. 650)
	return tonumber(config.content)
end

-- 界限突破降星度
function PetTrainHelper.limitReduceStar(curStar)
	local Paramter = require("app.config.parameter")
	local config = Paramter.get(PetTrainHelper.CFG_PARAMETER_LIMIT_STAR)
	assert(config, "paramter not found config by " .. PetTrainHelper.CFG_PARAMETER_LIMIT_STAR)
	local content = string.split(config.content, ",")
	local step = {}
	for i, value in ipairs(content) do
		step[i] = string.split(value, "|")
	end

	for i, value in ipairs(step) do
		if tonumber(step[i][1]) == curStar then
			return tonumber(step[i][2])
		end
	end
	return 0
end

function PetTrainHelper.getLimitCostItemMaxNums()
	local Paramter = require("app.config.parameter")
	local config = Paramter.get(PetTrainHelper.CFG_PARAMETER_ITEM_CONSUME)
	assert(config, "paramter not found config by " .. PetTrainHelper.CFG_PARAMETER_ITEM_CONSUME)
	return tonumber(config.content)
end

-- 获取当前正在界限突破的神兽数据
function PetTrainHelper.getCurLimitPetUnit()
	local petId = G_UserData:getPet():getCurPetId()
	local petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
	return petUnitData
end

function PetTrainHelper.getCurTabSize()
	local PetConst = require("app.const.PetConst")
	local curHeroId = G_UserData:getPet():getCurPetId()
	local curPetData = G_UserData:getPet():getUnitDataWithId(curHeroId)
	local canEnter = PetTrainHelper.canShowLimitBtn(curPetData)
	local tabsize = PetConst.MAX_TRAIN_TAB - 1
	if canEnter then
		tabsize = PetConst.MAX_TRAIN_TAB
	end
	return tabsize
end

return PetTrainHelper
