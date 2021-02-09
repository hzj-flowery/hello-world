--
-- Author: Liangxu
-- Date: 2017-05-27 17:32:04
-- 阵容界面帮助类
local TeamViewHelper = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIConst = require("app.const.UIConst")

function TeamViewHelper.getFirstEquipIdWithPos(pos)
	local equipInfo = G_UserData:getBattleResource():getEquipInfoWithPos(pos)
	for k, id in pairs(equipInfo) do
		return id
	end
	return nil
end

--创建一条线
function TeamViewHelper.createLine(width, posX)
	local width = width or 480
	local posX = posX or 0
	local node = cc.Node:create()
	local image = ccui.ImageView:create()
	image:loadTexture(Path.getUICommon("img_com_line01_board"))
	image:setScale9Enabled(true)
	image:setCapInsets(cc.rect(10,10,1,1))
	image:setContentSize(540,5)
	image:setAnchorPoint(cc.p(0, 0))
	image:setPosition(cc.p(posX, 0))
	node:addChild(image)
	node:setContentSize(cc.size(width, 25))

	return node
end

--播放倾斜的浮动动画 kaka
function TeamViewHelper.playSkewFloatEffect(img)
	-- body
	if not img then return end

	img:stopAllActions()

	--不需要重复执行
	if img:getActionByTag(789) then
		return
	end

	local action1 = cc.MoveBy:create(0.75, cc.p(10, -10))
	local action2 = cc.MoveBy:create(0.75, cc.p(-10, 10))
	local seq = cc.Sequence:create(action1,action2)
	local rep = cc.RepeatForever:create(seq)
	rep:setTag(789)

	img:runAction(rep)
end

--播放倾斜的浮动动画 kaka
function TeamViewHelper.playSkewFloatSwitchEffect(img, res1, res2)
	-- body
	if not img then return end

	img:stopAllActions()

	--不需要重复执行
	if img:getActionByTag(678) then
		return
	end

	local action1 = cc.MoveBy:create(0.75, cc.p(10, -10))
	local action2 = cc.MoveBy:create(0.75, cc.p(-10, 10))
	local fun = function(res)
		img:loadTexture(res)
	end

	local seq = cc.Sequence:create(
		cc.CallFunc:create(function()
                    fun(res1)
                end),
		action1,
		action2,
		cc.CallFunc:create(function()
                    fun(res2)
                end),
		action1,
		action2
	)

	local rep = cc.RepeatForever:create(seq)
	rep:setTag(678)

	img:runAction(rep)
end

function TeamViewHelper.getHeroIconData()
	local result = {}

	local heroIds = G_UserData:getTeam():getHeroIds()
	for i, heroId in ipairs(heroIds) do
		local baseId = 0
		local limitLevel = 0
		local limitRedLevel = 0
		if heroId > 0 then
			local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData)
			baseId = heroBaseId
			limitLevel = avatarLimitLevel or unitData:getLimit_level()
			limitRedLevel = arLimitLevel or unitData:getLimit_rtg()
		end
		local info = {
			type = TypeConvertHelper.TYPE_HERO, 
			value = baseId, 
			funcId = FunctionConst["FUNC_TEAM_SLOT"..i],
			id = heroId,
			limitLevel = limitLevel,
			limitRedLevel = limitRedLevel
		}
		table.insert(result, info)
	end

	return result
end

function TeamViewHelper.getPetIconData()
	local result = {}
	local isShow = require("app.utils.logic.FunctionCheck").funcIsShow(FunctionConst.FUNC_PET_HOME)
	if not isShow then
		return result
	end

	local baseId = 0
	local petId = G_UserData:getBase():getOn_team_pet_id()
	if petId > 0 then
		local unitData = G_UserData:getPet():getUnitDataWithId(petId)
		baseId = unitData:getBase_id()
	end
	local info = {
		type = TypeConvertHelper.TYPE_PET, 
		value = baseId, 
		funcId = FunctionConst.FUNC_PET_HOME,
		id = petId,
	}
	table.insert(result, info)
	
	return result
end

--组织数据，用于阵容界面显示武将和神兽Icon
function TeamViewHelper.getHeroAndPetIconData()
	local result = {}

	local heroIconData = TeamViewHelper.getHeroIconData()
	local petIconData = TeamViewHelper.getPetIconData()	
	table.insertto(result, heroIconData, 0)
	table.insertto(result, petIconData, 0)

	return result
end

--组织数据，用于阵容界面显示武将和神兽
function TeamViewHelper.getHeroAndPetShowData()
	local heroIds = G_UserData:getTeam():getHeroIdsInBattle()
   	local petIds = G_UserData:getTeam():getPetIdsInBattle()

	local result = {}
	for i, heroId in ipairs(heroIds) do
		local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
		local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData)
		local baseId = heroBaseId
		local limitLevel = avatarLimitLevel or unitData:getLimit_level()
		local limitRedLevel = arLimitLevel or unitData:getLimit_rtg()
		local info = {
			type = TypeConvertHelper.TYPE_HERO, 
			value = baseId,
			id = heroId,
			isEquipAvatar = isEquipAvatar,
			limitLevel = limitLevel,
			limitRedLevel = limitRedLevel
		}
		table.insert(result, info)
	end

	local petId = petIds[1] --认为只有1个神兽
	if petId then
		local unitData = G_UserData:getPet():getUnitDataWithId(petId)
		local baseId = unitData:getBase_id()
		local info = {
			type = TypeConvertHelper.TYPE_PET, 
			value = baseId,
			id = petId,
		}
		table.insert(result, info)
	end

	return result
end

function TeamViewHelper.getIconPosWithPageIndex(pageIndex)
	local showDatas = TeamViewHelper.getHeroAndPetShowData()
	local showData = showDatas[pageIndex]
	if showData then
		local iconDatas = TeamViewHelper.getHeroAndPetIconData()
		for i, data in ipairs(iconDatas) do
			if showData.type == data.type and showData.id == data.id then
				return i
			end
		end
	end
	return 0
end

function TeamViewHelper.getPageIndexWithIconPos(iconPos)
	local iconDatas = TeamViewHelper.getHeroAndPetIconData()
	local iconData = iconDatas[iconPos]
	if iconData then
		local showDatas = TeamViewHelper.getHeroAndPetShowData()
		for i, data in ipairs(showDatas) do
			if iconData.type == data.type and iconData.id == data.id then
				return i
			end
		end
	end
	return 0
end

function TeamViewHelper.makeLevelDiffData(summary, unitData, lastLevel, targetNode, finishCallback)
	-- body
	local function makeShowDataTable( unitData )
		local showData = {}
		showData.langStr = "summary_hero_level_add"
		if unitData:getType() == TypeConvertHelper.TYPE_PET then
			showData.langStr = "summary_pet_level_add"
		end
		showData.nowLevel = unitData:getLevel()
		showData.targetNode = targetNode
		showData.lastLevel = lastLevel
		showData.finishCallback = finishCallback
		return showData
	end

	local showData = makeShowDataTable(unitData)
	if showData.nowLevel > showData.lastLevel then
		local content1 = Lang.get(showData.langStr, {level = showData.nowLevel - showData.lastLevel})
		local param1 = {
			content = content1,
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
			dstPosition = showData.targetNode,
			finishCallback = showData.finishCallback
		}
		table.insert(summary, param1)
	end

end

function TeamViewHelper.makeBreakDiffData(summary, unitData, lastRank,finishCallback )
	-- body
	-- 提示可以突破
	local function makeShowDataTable( unitData )
		-- body
		local showData = {}
		showData.rankMax =  0 
		showData.currRank = 0 
		showData.baseId = unitData:getBase_id()
		showData.langStr = ""
		showData.lastRank = lastRank
		showData.finishCallback = finishCallback
		if unitData:getType() == TypeConvertHelper.TYPE_HERO then
			showData.rankMax = UserDataHelper.getHeroBreakMaxLevel(unitData)
			showData.currRank = unitData:getRank_lv()
			showData.langStr = "summary_hero_can_break"
			showData.langStr2 = "summary_hero_break_add"
		else
			showData.rankMax = UserDataHelper.getPetBreakMaxLevel(unitData)
			showData.currRank = unitData:getStar()
			showData.langStr = "summary_pet_can_break"
			showData.langStr2 = "summary_pet_break_add"
			
		end
		return showData
	end

	local showData = makeShowDataTable(unitData)

	if showData.currRank < showData.rankMax then
		local unitParam = TypeConvertHelper.convert(unitData:getType(), showData.baseId)
		local content2 = Lang.get(showData.langStr, {
				name = unitParam.name,
				color = Colors.colorToNumber(unitParam.icon_color),
				outlineColor = Colors.colorToNumber(unitParam.icon_color_outline),
				value = showData.rankMax,
			})
    	local param2 = {
    		content = content2,
    		startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
    	} 
		table.insert(summary, param2)
	end


	if showData.currRank > showData.lastRank then
		local content = Lang.get(showData.langStr2, {level = showData.currRank - showData.lastRank})
		local param = {
			content = content,
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
			finishCallback = showData.finishCallback
		}
		table.insert(summary, param)
	end

end


function TeamViewHelper.makeAwakeDiffData(summary,unitData,lastAwake)

	local nowAwake = unitData:getAwaken_level()
	if nowAwake > lastAwake then
		local content = Lang.get("summary_hero_awake_add", {level = nowAwake - lastAwake})
		local param = {
			content = content,
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
		}
		table.insert(summary, param)
	end

end

function TeamViewHelper.makeLimitDiffData(summary,unitData,lastLimit, lastRedLimit, finishCallback)

	local nowLimit = unitData:getLimit_level()
	local nowRedLimit = unitData:getLimit_rtg()
	local offset = 0
	if nowLimit>lastLimit then
		offset = offset + nowLimit - lastLimit
	end
	if nowRedLimit>lastRedLimit then
		offset = offset + nowRedLimit - lastRedLimit
	end
	if offset>0 then
		local content = Lang.get("summary_hero_limit_add", {level = offset})
		local param = {
			content = content,
			startPosition = {x = UIConst.SUMMARY_OFFSET_X_TEAM},
			finishCallback = finishCallback
		}
		table.insert(summary, param)
	end

end

return TeamViewHelper