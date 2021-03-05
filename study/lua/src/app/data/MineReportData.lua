--矿战report
local BaseData = require("app.data.BaseData")
local MineReportData = class("MineReportData", BaseData)

local schema = {}
schema["base_id"] = {"number", 0}
schema["avatar_base_id"] = {"number", 0}
schema["level"] = {"number", 0}
schema["fight_time"] = {"number", 0}
schema["name"] = {"string", ""}
schema["officer_level"] = {"number", 0}
schema["power"] = {"number", 0}
schema["uid"] = {"number", 0}
schema["win_type"] = {"number", 0}
schema["self_dec_army"] = {"number", 0}
schema["tar_dec_army"] = {"number", 0}
schema["self_is_die"] = {"boolean", false}
schema["tar_is_die"] = {"boolean", false}
schema["report_id"] = {"number", 0}
schema["report_type"] = {"number", 0}
schema["self_army"] = {"number", 0}
schema["tar_army"] = {"number", 0}
schema["self_is_privilege"] = {"boolean", false}
schema["tar_is_privilege"] = {"boolean", false}
schema["self_infamy_add"] = {"number", 0}
schema["tar_infamy_add"] = {"number", 0}
MineReportData.schema = schema

function MineReportData:ctor(properties)
    MineReportData.super.ctor(self, properties)
end

function MineReportData:clear()
end

function MineReportData:reset()
end

function MineReportData:updateDataFromMineFight(mineFight, mineUser)
    
    local targetUser = mineUser
    self:setBase_id(targetUser.base_id)
    self:setAvatar_base_id(targetUser.avatar_base_id)
    self:setName(targetUser.user_name)
    self:setOfficer_level(targetUser.officer_level)
    self:setPower(targetUser.power)
    self:setUid(targetUser.user_id)

    self:setWin_type(mineFight.self_star)
    self:setSelf_dec_army(mineFight.self_red_army)
    self:setTar_dec_army(mineFight.tar_red_army)
    self:setSelf_is_die(mineFight.self_is_die)
    self:setTar_is_die(mineFight.tar_is_die)
    self:setSelf_army(mineFight.self_begin_army - mineFight.self_red_army)
    self:setTar_army(mineFight.tar_begin_army - mineFight.tar_red_army)
    self:setTar_is_privilege(rawget(mineFight, "tar_is_privilege") or false)
    self:setSelf_infamy_add(mineFight.self_infamy_add)
    self:setTar_infamy_add(-math.abs(mineFight.tar_infamy_desc))
end

return MineReportData