
local ActivityEquipDataHelper = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local CustomActivityConst = require("app.const.CustomActivityConst")

function ActivityEquipDataHelper.getActiveConfig(id)
	local info = require("app.config.equipment_active").get(id)
	assert(info, string.format("equipment_active config can not find id = %d", id))
	return info
end

function ActivityEquipDataHelper.getActiveDropConfig(id)
	local info = require("app.config.equipment_active_drop").get(id)
	assert(info, string.format("equipment_active_drop config can not find order = %d", id))
	return info
end

--转换获奖记录
function ActivityEquipDataHelper.getAwardRecordText(records)
	local result = {}

	for i, record in ipairs(records) do
		local param = TypeConvertHelper.convert(record.type, record.id)
		local text = Lang.get("customactivity_equip_award_single_record", {name = param.name, count = record.num})
		local color = param.cfg.color
		local unit = {text = text, color = color}
		table.insert(result, unit)
	end
	return result
end

--随机一句常规喊话
function ActivityEquipDataHelper.randomCommonChat(batch)
	local info = ActivityEquipDataHelper.getActiveConfig(batch)
	local index = math.random(1, 5)
	local chat = info["chat_"..index]
	return chat
end

--随机一句被击喊话
function ActivityEquipDataHelper.randomHitChat(batch)
	local info = ActivityEquipDataHelper.getActiveConfig(batch)
	local index = math.random(1, 5)
	local chat = info["hit_chat_"..index]
	return chat
end

return ActivityEquipDataHelper