-- 
-- Author: JerryHe
-- Date: 2019-02-22
-- Desc: 角色/神兽
-- 

local ReportParseRoleHelper     = {}

local ReportParseStatistics     = require("app.fight.reportParse.ReportParseStatistics")

local function sortUnitByCell(a,b)
    if not a or not b then
        return false
    end

    if a.cell < b.cell then
        return true
    end

    return false
end

local function getCampUnits(units,camp)
    local result = {}
    for i, v in ipairs(units) do
        if v.country == camp then
            table.insert(result,v)
        end
    end

    table.sort(result,sortUnitByCell)

    return result
end

local function getCampPets(pets,camp)
    local result = {}
    for i, v in ipairs(pets) do
        if v.country == camp then
            table.insert(result,v)
        end
    end

    return result
end


function ReportParseRoleHelper.convertObjectByParam(paramType,param)
    local _temp = ReportParseRoleHelper._buildConvertData(paramType,param)
    assert(_temp ~= nil,"Report analyse type error,type name is "..tostring(paramType))

    return _temp
end

function ReportParseRoleHelper._buildConvertData(paramType,params)
    for key, value in pairs(ReportParseRoleHelper) do
        local retfunc = ReportParseRoleHelper["_convert_"..paramType]
        if type(retfunc) == "function" then
            return retfunc(params)
        end
    end
    return {}
end

function ReportParseRoleHelper.getObjectConfig(objectId,objectType)
    local Object = require(OBJECT_REQUIRE[objectType])
    return Object.get(objectId)
end

function ReportParseRoleHelper._convert_members(params,final)
    local object    = {}
    object.units    = {}
    object.members  = {}
    object.final    = final

    for i, v in ipairs(params.data) do
        local temp      = {}
        temp.anger      = v.anger
        temp.country    = v.camp
        temp.level      = v.rank_lv                 -- 突破等级
        temp.limitLv    = v.limit_lv                -- 界限等级
        temp.limitRedLv = v.rtg_lv                  -- 红升金界限等级
        temp.hp         = v.hp
        temp.maxHp      = v.max_hp
        temp.cell       = v.pos
        temp.id         = v.knight_id
        temp.monsterId  = v.monster_id
        temp.stageId    = 100 * v.camp + v.pos
        temp.isLeader   = v.is_leader
        
        local config    = nil
        if v.monster_id == 0 then
            config = require("app.config.hero").get(v.knight_id)
            if v.is_leader then
                if v.camp == 1 then
                    temp.name   = params.leftName
                else
                    temp.name   = params.rightName
                end
            else
                temp.name   = config.name
            end
        else
            config = require("app.config.monster").get(v.monster_id)
            temp.name   = config.name
        end
        temp.config     = config

        table.insert(object.units,temp)

        object.members[temp.stageId] = temp 
    end

    if not final then
        ReportParseStatistics.initStates(object.units)
    end

    object.printObjectInfo = function(self,result)
        local function printUnitInfo(country)
            local param = {country = country}
            table.insert(result,{key = "txt_report_fight_units",param = param})
            
            local unitsCountry = getCampUnits(self.units,country)
            for index, unit in ipairs(unitsCountry) do
                local param     = {
                    unitName = unit.name,unitCell = unit.cell,
                    unitAnger = unit.anger,unitHp = unit.hp,unitLevel = unit.level,maxHp = unit.maxHp,
                    limitLevel = unit.limitLv,limitRedLevel = unit.limitRedLv,changeName = unit.config.name
                }

                local key   = "txt_report_fight_unit_init_info"
                if self.final then
                    key     = "txt_report_fight_unit_final_info"
                    if unit.isLeader then
                        if unit.id > 100 then
                            key = "txt_report_fight_unit_final_info_main_2"
                        else
                            key = "txt_report_fight_unit_final_info_main_1"
                        end
                    end
                else
                    if unit.isLeader then
                        -- 是主角，默认主角id < 100，武将id > 100
                        if unit.id > 100 then
                            -- 有变身卡
                            key = "txt_report_fight_unit_init_info_main_2"
                        else
                            -- 没有变身卡
                            key = "txt_report_fight_unit_init_info_main_1"
                        end
                    end
                end

                table.insert(result,{key = key,param = param})
            end
        end

        printUnitInfo(1)
        printUnitInfo(2)
    end

    return object
end

function ReportParseRoleHelper._convert_members_final(params)
    local object = ReportParseRoleHelper._convert_members(params,true)

    return object
end

function ReportParseRoleHelper._convert_pets(params)
    local object    = {}
    object.pets     = {}
    object.members  = {{},{}}

    for i, v in ipairs(params.data) do
        local pet       = {}
        pet.id         = v.pet_base_id
        pet.country    = v.camp
        pet.level      = v.pet_star
        pet.config     = require("app.config.pet").get(v.pet_base_id)
        table.insert(object.pets,pet)

        object.members[pet.country][pet.id] = pet

        -- object.members[pet.id] = pet
    end
    
    object.printObjectInfo = function(self,result)
        if self.pets == nil or #self.pets <= 0 then
            -- 场上没有神兽
            table.insert(result,{key = "txt_report_fight_no_pet"})
            return
        end

        table.insert(result,{key = "txt_report_fight_have_pet"})

        local function printPetInfo(country)
            local petsCountry = getCampPets(self.pets,country)
            if #petsCountry <= 0 then
                -- 某一方没有神兽
                local param = {country = country}
                table.insert(result,{key = "txt_report_fight_no_pet_country",param = param})
            else
                local param = {country = country}
                table.insert(result,{key = "txt_report_fight_pets",param = param})
            end

            for index, datas in ipairs(petsCountry) do
                local param     = {
                    petIndex = index,petName = datas.config.name,petId = datas.id,petLevel = datas.level
                }

                table.insert(result,{key = "txt_report_fight_pet_init_info",param = param})
            end
        end

        printPetInfo(1)
        printPetInfo(2)
    end

    return object
end

return ReportParseRoleHelper