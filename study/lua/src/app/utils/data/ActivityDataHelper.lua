local ActivityConst = require("app.const.ActivityConst")

local ActivityDataHelper = {}

 function ActivityDataHelper.checkPackBeforeGetActReward(data)
    --检查背包是否已满
    local cfg = data:getConfig()
    dump(cfg)
    local UserCheck = require("app.utils.logic.UserCheck")
    local rewardType = cfg.type 
    local rewardValue = cfg.value
    local isFull,leftCapacity = UserCheck.isPackFull(rewardType, rewardValue)
    if isFull then
        return false
    end
    return true
end

 function ActivityDataHelper.checkPackBeforeGetActReward2(data)
    --检查背包是否已满
    local cfg = data:getConfig()
    dump(cfg)
    local UserCheck = require("app.utils.logic.UserCheck")
    local rewardType =  cfg.reward_type
    local rewardValue =  cfg.reward_value
    local isFull,leftCapacity = UserCheck.isPackFull(rewardType, rewardValue)
    if isFull then
        return false
    end
    return true
end

function ActivityDataHelper.getFundGroupByFundActivityId(actId)
   if actId <= ActivityConst.ACT_ID_OPEN_SERVER_FUND then
        return nil
   end
   return actId-ActivityConst.ACT_ID_OPEN_SERVER_FUND
end

return ActivityDataHelper