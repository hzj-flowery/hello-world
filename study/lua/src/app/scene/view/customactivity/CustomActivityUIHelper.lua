
local CustomActivityUIHelper = {}

local TimeLimitActivityConst = require("app.const.TimeLimitActivityConst")

local RichTextHelper = require("app.utils.RichTextHelper")

local CustomActivityConst = require("app.const.CustomActivityConst")

function CustomActivityUIHelper.getRichMsgListForHashText(text,highlightColor,highlightOutlineColor,
    defalutColor,defalutOutlineColor,defaultFontSize)
	--local RichTextHelper = require("app.utils.RichTextHelper")
	local subTitles = RichTextHelper.parse2SubTitleExtend(text,true)
	subTitles =  RichTextHelper.fillSubTitleUseColor(subTitles,
		{nil,highlightColor,highlightOutlineColor})
	local richElementList = RichTextHelper.convertSubTitleToRichMsgArr({
		textColor = defalutColor,
        outlineColor = defalutOutlineColor,
		fontSize = defaultFontSize,--跑马灯的默认字体大小
	},subTitles)
	return richElementList
end

function CustomActivityUIHelper.getTabDatas()
    local customActTabData =  G_UserData:getCustomActivity():getShowActUnitDataArr()--重取页签数据
    local tabDatas =  {}

	if G_UserData:getCustomActivity():isAvatarActivityVisible() then
		table.insert( tabDatas, {id = 0, type = TimeLimitActivityConst.ID_TYPE_AVATAR_ACT_INTRO, title = Lang.get("customactivity_avatar_act_intro_title"), srcData = {}} )
	end

    for k,v in ipairs(customActTabData) do
        if v:getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_TEN_JADE_AUCTION then
            --跨服拍卖活动开始才显示tab
            local TenJadeAuctionConfigHelper = import("app.scene.view.tenJadeAuction.TenJadeAuctionConfigHelper")
            local TenJadeAuctionConst  = require("app.const.TenJadeAuctionConst")
            local phase = TenJadeAuctionConfigHelper.getAuctionPhase()
            if phase == TenJadeAuctionConst.PHASE_SHOW or 
                phase == TenJadeAuctionConst.PHASE_ITEM_SHOW or
                phase == TenJadeAuctionConst.PHASE_START then
                table.insert( tabDatas, {id = v:getAct_id(),type = TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT,
                        title = v:getTitle(),srcData = v} )
            end
			
        else
            table.insert( tabDatas, {id = v:getAct_id(),type = TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT,
                    title = v:getTitle(),srcData = v} )
        end
    end


    local sprintUnitList = G_UserData:getTimeLimitActivity():getSprintActUnitList()
    for k,v in pairs(sprintUnitList) do
        local TimeLimitActivityConst = require("app.const.TimeLimitActivityConst")
        if v:isActivityOpen() then
            local data = {id = nil,type = TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT,
                title = nil,srcData = nil}
            data.id = v:getType()
            data.title = v:getName()
            data.srcData = v


            table.insert( tabDatas, data )
        end
    end

    if G_UserData:getCustomActivity():getThreeKindomsData() ~= nil then
        if G_ConfigManager:isDownloadThreeKindoms() and not G_UserData:getCustomActivity():getThreeKindomsData():isActivityFinish() then
            local data = G_UserData:getCustomActivity():getThreeKindomsData()
            local deviceId = G_NativeAgent:getDeviceId()
            if deviceId ~= nil and deviceId ~= "unknown" then
                local startidx, endidx, strnil = string.find(deviceId, "_sn", -3)
                if type(startidx) ~= "number" and type(endidx) ~= "number" then
                    table.insert(tabDatas, {id = 1000, type = TimeLimitActivityConst.ID_TYPE_THREEKINDOMS, 
                                            title = Lang.get("customactivity_threekindoms_title"), srcData = data})
                end
            end
        end
    end

    return tabDatas
end

function CustomActivityUIHelper.getLeftDHMSFormat(t)
     local leftTime = t - G_ServerTime:getTime()
     local day,hour,min,second = G_ServerTime:convertSecondToDayHourMinSecond(leftTime)
     if day >= 1 then
         if hour < 1 then
             hour = 1
         end
        return  string.format(Lang.get("common_time_D"), day, hour)
     end
     local time =  string.format(Lang.get("common_time_DHM"), hour, min,second)
     return time
end

function CustomActivityUIHelper.makeCustomActItemData(actTaskUnitData)
    local CustomActivityConst = require("app.const.CustomActivityConst")
    local consumeItems = actTaskUnitData:getConsumeItems()
    local fixRewards = actTaskUnitData:getRewardItems()
    local selectRewards = actTaskUnitData:getSelectRewardItems()
    local rewardNum = #fixRewards + #selectRewards
    local rewards = {}
    local rewardTypes = {}
    for i = 1,rewardNum,1 do
        if i <= #fixRewards then
            rewards[i] = fixRewards[i]
            rewardTypes[i] = CustomActivityConst.REWARD_TYPE_ALL
            else
            rewards[i] = selectRewards[i-#fixRewards]
            rewardTypes[i] = CustomActivityConst.REWARD_TYPE_SELECT
        end
    end
    local consumeItemTypes = {}
     for i = 1,#consumeItems,1 do
        table.insert( consumeItemTypes, CustomActivityConst.REWARD_TYPE_ALL )
     end
    return consumeItems,consumeItemTypes,rewards,rewardTypes
end

function CustomActivityUIHelper.getParameterConfigById(paramId)
    local ParamConfig = require("app.config.parameter")
	local paramInfo = ParamConfig.get(paramId)
    assert(paramInfo, "parameter.lua can't find id = "..tostring(paramId))
    
	return paramInfo
end

return CustomActivityUIHelper
