--
-- Author: hedili
-- Date: 2018-01-24 14:28:49

local PetDetailViewHelper = {}


function PetDetailViewHelper.makeSkillEx( petUnitId, skillId, petUnitData )
    -- body
    local skillDescList = {}
    local petUnit = G_UserData:getPet():getUnitDataWithId(petUnitId)
    if petUnitData then
        petUnit = petUnitData
    end
    local UserDataHelper = require("app.utils.UserDataHelper")
    if petUnit == nil then
        logWarn("can not find petUnit by petId "..petUnitId)
        return
    end

    local PetConst = require("app.const.PetConst")

    local MIN_LEVEL = 0
    local Initial_star = petUnit:getInitial_star()

    if Initial_star > 0 then
        MIN_LEVEL = Initial_star
    else
        MIN_LEVEL = petUnit:getQuality() == PetConst.QUALITY_RED and 1 or 0
    end

     local function getSkillIndex( petUnitId, skillId )
        -- body
        local function findIndex( config ,skillId )
            -- body
            for i =1, 2 do 
                local cfgSkillId =  config["skill"..i]
                if cfgSkillId > 0 and cfgSkillId == skillId then
                    return i
                end
            end
            return 0
        end
        for i=MIN_LEVEL, petUnit:getStarMax() do
           local config = UserDataHelper.getPetStarConfig(petUnit:getBase_id(), i)
           local skillIndex = findIndex(config,skillId)
           if skillIndex > 0 then
               return skillIndex
           end
        end
        return 0
    end

    local skillIndex = getSkillIndex(petUnitId,skillId)

    if skillIndex == 0 then
        return {}
    end
    local skillSameId = {}
    for i=MIN_LEVEL, petUnit:getStarMax() do
        local config = UserDataHelper.getPetStarConfig(petUnit:getBase_id(), i)
        local cfgSkillId = config["skill"..skillIndex]
        if cfgSkillId > 0 then
            local pendingSkill = ""
            if config.skill2 == cfgSkillId then
                pendingSkill = config.chance_description
            end

            skillSameId[cfgSkillId] = true 
            table.insert(skillDescList, { 
                title = Lang.get("pet_skill_detail_title", {star = i}) , 
                skillId = cfgSkillId,
                pendingStr = pendingSkill,
            })
        end
        
    end
    return skillDescList
end


function PetDetailViewHelper.createTalentDes(petUnitData,star,width, posOffset)
    local UserDataHelper = require("app.utils.UserDataHelper")
    local function isActiveWithStar( star)
        -- body
        local starLevel = petUnitData:getStar()
	    return starLevel >= star
    end
	local widget = ccui.Widget:create()

	local isActive = petUnitData:isUserPet() and isActiveWithStar(star)
	local color = isActive and Colors.colorToNumber(Colors.BRIGHT_BG_GREEN) or Colors.colorToNumber(Colors.BRIGHT_BG_TWO)

	local config = UserDataHelper.getPetStarConfig(petUnitData:getBase_id(), star)
	local name = "["..config.talent_name.."] "
	local des = config.talent_description
	local breakDes = isActive and "" or Lang.get("pet_break_txt_break_des", {rank = star})
	local txt = name..des..breakDes
	
	local content = Lang.get("hero_detail_talent_des_1", {
			des = txt,
			color = color,
		})
	
    width = width or 360
    posOffset = posOffset or 24
	local label = ccui.RichText:createWithContent(content)
	label:setAnchorPoint(cc.p(0, 1))
	label:ignoreContentAdaptWithSize(false)
	label:setContentSize(cc.size(width,0))
	label:formatText()

	local height = label:getContentSize().height
	label:setPosition(cc.p(posOffset, height + 10))
	widget:addChild(label)
 
	local size = cc.size(width, height + 10)
	widget:setContentSize(size)

	return widget
end

return PetDetailViewHelper