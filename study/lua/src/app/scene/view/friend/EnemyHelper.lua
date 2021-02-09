local EnemyHelper = {}
local ParamConfig = require("app.config.parameter")
-- 每日最大复仇次数
function EnemyHelper.getDayMaxRevengeNum()
	local config = ParamConfig.get(222)
	assert(config ~= nil, "can not find ParamConfig id = 222")
	return tonumber(config.content)
end
-- 复仇成功获取的精力点
function EnemyHelper.getFightSuccessEnergy()
	local config = ParamConfig.get(225)
	assert(config ~= nil, "can not find ParamConfig id = 225")
	return tonumber(config.content)
end

-- 复仇胜利 减仇恨值
function EnemyHelper.getFightWinVaule()
	local config = ParamConfig.get(217)
	assert(config ~= nil, "can not find ParamConfig id = 217")
	return tonumber(config.content)
end

function EnemyHelper.getFightLoseVaule()
	local config = ParamConfig.get(219)
	assert(config ~= nil, "can not find ParamConfig id = 219")
	return tonumber(config.content)
end
-- 仇人上限
function EnemyHelper.getMaxEnemyNum()
	local config = ParamConfig.get(221)
	assert(config ~= nil, "can not find ParamConfig id = 221")
	return tonumber(config.content)
end




return EnemyHelper
