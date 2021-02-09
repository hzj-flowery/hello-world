local UserDetailViewHelper = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

function UserDetailViewHelper.getHeroAndPetShowData(detailData)
	local heroDatas = detailData:getHeroDataInBattle()

	local result = {}
	for i, unitData in ipairs(heroDatas) do
		local avatarBaseId = detailData:getAvatarBaseId()
		local limitLevel = unitData:getLimit_level()
		local limitRedLevel = unitData:getLimit_rtg()
		local heroBaseId = nil
		if avatarBaseId > 0 and unitData:isLeader() then
			local info = AvatarDataHelper.getAvatarConfig(avatarBaseId)
			heroBaseId = info.hero_id
			if info.limit == 1 then
				limitLevel = require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
			end
		else
			heroBaseId = unitData:getBase_id()
		end
		local baseId = heroBaseId
		local info = {
			type = TypeConvertHelper.TYPE_HERO, 
			value = baseId,
			id = unitData:getId(),
			limitLevel = limitLevel,
			limitRedLevel = limitRedLevel
		}
		table.insert(result, info)
	end

	local petId = detailData:getOnTeamPetId()
	if petId > 0 then
		local unitData = detailData:getPetUnitDataWithId(petId)
		local baseId = unitData:getBase_id()
		local info = {
			type = TypeConvertHelper.TYPE_PET, 
			value = baseId,
			id = unitData:getId(),
		}
		table.insert(result, info)
	end

	return result
end

function UserDetailViewHelper.getHeroAndPetIconData(detailData)
	local result = {}

	local heroIds = detailData:getFormation()
	for i, heroId in ipairs(heroIds) do
		local baseId = 0
		local limitLevel = 0
		local limitRedLevel = 0
		if heroId > 0 then
			local unitData = detailData:getHeroDataWithId(heroId)
			limitLevel = unitData:getLimit_level()
			limitRedLevel = unitData:getLimit_rtg()
			local avatarBaseId = detailData:getAvatarBaseId()
			if avatarBaseId > 0 and unitData:isLeader() then
				local info = AvatarDataHelper.getAvatarConfig(avatarBaseId)
				baseId = info.hero_id
				if info.limit == 1 then
					limitLevel = require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
				end
			else
				baseId = unitData:getBase_id()
			end
		end
		local info = {
			type = TypeConvertHelper.TYPE_HERO, 
			value = baseId,
			id = heroId,
			limitLevel = limitLevel,
			limitRedLevel = limitRedLevel
		}
		table.insert(result, info)
	end

	local petIsShow = detailData:funcIsShow(FunctionConst.FUNC_PET_HOME)
	if petIsShow then
		local petBaseId = 0
		local petId = detailData:getOnTeamPetId()
		if petId > 0 then
			local unitData = detailData:getPetUnitDataWithId(petId)
			petBaseId = unitData:getBase_id()
		end
		local petInfo = {
			type = TypeConvertHelper.TYPE_PET, 
			value = petBaseId,
			id = petId,
		}
		table.insert(result, petInfo)
	end
	
	return result
end

function UserDetailViewHelper.getIconPosWithPageIndex(pageIndex, detailData)
	local showDatas = UserDetailViewHelper.getHeroAndPetShowData(detailData)
	local showData = showDatas[pageIndex]
	if showData then
		local iconDatas = UserDetailViewHelper.getHeroAndPetIconData(detailData)
		for i, data in ipairs(iconDatas) do
			if showData.type == data.type and showData.id == data.id then
				return i
			end
		end
	end
	return 0
end

function UserDetailViewHelper.getPageIndexWithIconPos(iconPos, detailData)
	local iconDatas = UserDetailViewHelper.getHeroAndPetIconData(detailData)
	local iconData = iconDatas[iconPos]
	if iconData then
		local showDatas = UserDetailViewHelper.getHeroAndPetShowData(detailData)
		for i, data in ipairs(showDatas) do
			if iconData.type == data.type and iconData.id == data.id then
				return i
			end
		end
	end
	return 0
end

return UserDetailViewHelper