local ExploreUIHelper = {}


function ExploreUIHelper.makeRewards(param)
    local cfg = param.cfg
    local maxNum = param.maxNum or 4
    local typeFormatStr = param.typeFormatStr
    local valueFormatStr = param.valueFormatStr
    local sizeFormatStr = param.sizeFormatStr
   

	local rewardList = {}
    for i = 1,maxNum,1 do
        if  i == 1  and param.firstRewardTypeFormatStr and param.firstRewardValueFormatStr and param.firstRewardSizeFormatStr then
            if cfg[param.firstRewardTypeFormatStr] ~= 0 then
                local reward = {
                    type = cfg[param.firstRewardTypeFormatStr],
                    value = cfg[param.firstRewardValueFormatStr],
                    size = cfg[param.firstRewardSizeFormatStr]
                }

                table.insert( rewardList,reward )
            end
        else
            if cfg[string.format(typeFormatStr,i)] ~= 0 then
                local reward = {
                    type = cfg[string.format(typeFormatStr,i)],
                    value = cfg[string.format(valueFormatStr,i)],
                    size = cfg[string.format(sizeFormatStr,i)]
                }

                table.insert( rewardList,reward )
            end

        end
        
      
	end
	return rewardList
end

function ExploreUIHelper.makeExploreRebelRewards(cfg)
    dump(cfg)
    local param = {cfg = cfg,maxNum = 2,typeFormatStr = "kill%d_type",valueFormatStr = "kill%d_resource",sizeFormatStr = "kill%d_size",
            firstRewardTypeFormatStr = "kill_type",firstRewardValueFormatStr = "kill_resource",firstRewardSizeFormatStr = "kill_size"
    }
    local rewards =  ExploreUIHelper.makeRewards(param)
     dump(rewards)
     return rewards
end


return ExploreUIHelper