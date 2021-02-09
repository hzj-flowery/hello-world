--世界boss帮助类
local AuctionConst = require("app.const.AuctionConst")
local AuctionHelper = {}


--构建树结构，主节点
function AuctionHelper.makeMainData( groupList,auctionType )
    local groupData = {}


    local function checkCfgIdOpen(auctionId)
        local subTab = G_UserData:getAuction():isAuctionShow(auctionId)
        local subTabList =  G_UserData:getAuction():getAuctionData(auctionId)
        if subTab and #subTabList > 0 then 
            return true
        end
        return false
    end
    --军团
    if auctionType == AuctionConst.AC_TYPE_GUILD then
        groupData.name = Lang.get("auction_main_tab1")
        groupData.cfgId = AuctionConst.AC_TYPE_GUILD_ID
        groupData.type = auctionType
        groupData.rootCfgId = AuctionConst.AC_TYPE_GUILD_ID
        groupData.isMain = true
    end
    --世界
    if auctionType == AuctionConst.AC_TYPE_WORLD then
        groupData.name = Lang.get("auction_main_tab2")
        groupData.cfgId = AuctionConst.AC_TYPE_WORLD_ID
        groupData.rootCfgId = AuctionConst.AC_TYPE_WORLD_ID
        groupData.type = auctionType
		groupData.isMain = true
    end
    --阵营竞技
    if auctionType == AuctionConst.AC_TYPE_ARENA then
        groupData.name = Lang.get("auction_main_tab3")
        groupData.cfgId = AuctionConst.AC_TYPE_ARENA_ID
        groupData.rootCfgId = AuctionConst.AC_TYPE_ARENA_ID
        groupData.type = auctionType
		groupData.isMain = true
        --阵营竞技未开启，按钮不显示
        if checkCfgIdOpen(groupData.cfgId) == false then
            return
        end
    end
    --军团行商
    if auctionType == AuctionConst.AC_TYPE_TRADE then
        groupData.name = Lang.get("auction_main_tab4")
        groupData.cfgId = AuctionConst.AC_TYPE_WAR_TRADE_ID
        groupData.rootCfgId = AuctionConst.AC_TYPE_WAR_TRADE_ID
        groupData.type = auctionType
		groupData.isMain = true
        --军团行商未开启，按钮不显示
        if checkCfgIdOpen(groupData.cfgId) == false then
            return
        end
    end
    --更新拍卖
    if auctionType == AuctionConst.AC_TYPE_GM then
        groupData.name = Lang.get("auction_main_tab5")
        groupData.cfgId = AuctionConst.AC_TYPE_GM_ID
        groupData.rootCfgId = AuctionConst.AC_TYPE_GM_ID
        groupData.type = auctionType
		groupData.isMain = true
        --更新拍卖，按钮不显示
        if checkCfgIdOpen(groupData.cfgId) == false then
            return
        end
    end

    --更新拍卖
    if auctionType == AuctionConst.AC_TYPE_PERSONAL_ARENA then
        groupData.name = Lang.get("auction_main_tab6")
        groupData.cfgId = AuctionConst.AC_TYPE_PERSONAL_ARENA_ID
        groupData.rootCfgId = AuctionConst.AC_TYPE_PERSONAL_ARENA_ID
        groupData.type = auctionType
		groupData.isMain = true
        --更新拍卖，按钮不显示
        if checkCfgIdOpen(groupData.cfgId) == false then
            return
        end
    end

     --更新拍卖
     --[[if auctionType == AuctionConst.AC_TYPE_GUILDCROSS_WAR then
        groupData.name = Lang.get("auction_main_tab7")
        groupData.cfgId = AuctionConst.AC_TYPE_GUILDCROSSWAR_ID
        groupData.rootCfgId = AuctionConst.AC_TYPE_GUILDCROSSWAR_ID
        groupData.type = auctionType
		groupData.isMain = true
        --更新拍卖，按钮不显示
        if checkCfgIdOpen(groupData.cfgId) == false then
            return
        end
    end]]

    if groupData then
        groupList[auctionType] = groupData
    end
    --table.insert( groupList, groupData )
end

--构建树结构，子节点
function AuctionHelper.makeSubData( subList, auctionType )
    -- body
    local guildCfgId = 0
    local function checkCfgIdOpen(auctionId)
        local subTab = G_UserData:getAuction():isAuctionShow(auctionId)
        local subTabList =  G_UserData:getAuction():getAuctionData(auctionId)
        if subTab and #subTabList > 0 then 
            return true
        end
        return false
    end
    --构建军团拍卖子节点
    if auctionType == AuctionConst.AC_TYPE_GUILD then
        for auctionId = AuctionConst.AC_TYPE_GUILD_ID , AuctionConst.AC_TYPE_GUILD_MAX do
            if checkCfgIdOpen(auctionId) then
                local groupData = {}
                local index = auctionId - 100
                groupData.cfgId = auctionId
                groupData.name = Lang.get("auction_sub_tab"..index)
                groupData.type = auctionType
                groupData.rootCfgId = auctionId
                groupData.isMain = false
                guildCfgId = auctionId
                table.insert( subList, groupData )
            end
        end
    end

    local function makeSubAuctionList(auctionType)
        local auctionId = 0
        if auctionType == AuctionConst.AC_TYPE_WORLD then
            auctionId = AuctionConst.AC_TYPE_WORLD_ID
        end
        if auctionType == AuctionConst.AC_TYPE_ARENA then
            auctionId = AuctionConst.AC_TYPE_ARENA_ID
        end
        if auctionType == AuctionConst.AC_TYPE_TRADE then
            auctionId = AuctionConst.AC_TYPE_WAR_TRADE_ID
        end
        if auctionType == AuctionConst.AC_TYPE_GM then
            auctionId = AuctionConst.AC_TYPE_GM_ID
        end
        if auctionType == AuctionConst.AC_TYPE_PERSONAL_ARENA then
            auctionId = AuctionConst.AC_TYPE_PERSONAL_ARENA_ID
        end
        if auctionType == AuctionConst.AC_TYPE_GUILDCROSS_WAR then
            auctionId = AuctionConst.AC_TYPE_GUILDCROSSWAR_ID
        end
        local allSubTabList,itemList = AuctionHelper.getAllSubTabList(auctionId)
        local tempList = {}
        if checkCfgIdOpen(auctionId) and #itemList > 0 then 
            for i, value in pairs(allSubTabList) do
                if value ~= "" then
                    local groupData = {}
                    groupData.cfgId = i
                    groupData.name = value
                    groupData.type = auctionType
                    groupData.rootCfgId = auctionId
                    groupData.isMain = false
                    table.insert( tempList, groupData )
                end
            end

            table.sort(tempList, function(item1, item2 )
                return item1.cfgId < item2.cfgId
            end)
            for i, value in ipairs(tempList) do
                table.insert(subList, value)
            end 
        end
    end
    makeSubAuctionList(auctionType)
    return guildCfgId
end

function AuctionHelper.getAuctionTextListEx()
    local textList = {}
    local groupList = {}
    
    --构建拍卖数据
    for auctionType = AuctionConst.AC_TYPE_GUILD, AuctionConst.AC_TYPE_MAX do
        AuctionHelper.makeMainData( groupList, auctionType )
        if groupList[auctionType] then
            groupList[auctionType].subList = {}
            local guildCfgId = AuctionHelper.makeSubData( groupList[auctionType].subList, auctionType )

            --军团拍卖比较特殊，主标签页需要返回个活动标签页id
            if auctionType == AuctionConst.AC_TYPE_GUILD then
                groupList[auctionType].cfgId = guildCfgId
                groupList[auctionType].rootCfgId = guildCfgId
            end
        end
    end

    
    for i, mainData in pairs(groupList) do
        table.insert(textList, mainData.name)
        mainData.tabIndex = #textList
        if mainData.subList then
            for j, subData in ipairs(mainData.subList) do
                table.insert(textList, subData.name)
                subData.tabIndex = #textList
            end
        end
    end

    return textList, groupList
end


--获取全服拍卖子标签列表
function AuctionHelper.getAllSubTabList(configId)
    local itemList = AuctionHelper.getConfigIdByIndex(configId)
    local tabList = {}

    if #itemList > 0 then
        tabList[AuctionConst.AC_ALLSERVER_OFFICIAL] = ""
        tabList[AuctionConst.AC_ALLSERVER_HEROS] = ""
        tabList[AuctionConst.AC_ALLSERVER_TREASURE] = ""
        tabList[AuctionConst.AC_ALLSERVER_INSTRUMENT] = ""
        tabList[AuctionConst.AC_ALLSERVER_SILKBAG] = ""
        tabList[AuctionConst.AC_ALLSERVER_HISTORYHERO] = ""
        tabList[AuctionConst.AC_ALLSERVER_OTHERS] = ""
    end
	--全服拍卖子标签类型
    for i , value in ipairs(itemList) do

        if value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_OFFICIAL then
            local index = AuctionConst.AC_ALLSERVER_OFFICIAL
            tabList[index] = Lang.get("auction_all_server_sub"..index)
        end
        if value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_HEROS then
            local index = AuctionConst.AC_ALLSERVER_HEROS
            tabList[index] = Lang.get("auction_all_server_sub"..index)
        end
		if value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_TREASURE then
			local index = AuctionConst.AC_ALLSERVER_TREASURE
			tabList[index] = Lang.get("auction_all_server_sub"..index)
		end

		if value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_INSTRUMENT then
			local index = AuctionConst.AC_ALLSERVER_INSTRUMENT
			tabList[index] = Lang.get("auction_all_server_sub"..index)
		end

		if value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_SILKBAG then
			local index = AuctionConst.AC_ALLSERVER_SILKBAG
			tabList[index] = Lang.get("auction_all_server_sub"..index)
        end
        
        if value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_HISTORYHERO then
			local index = AuctionConst.AC_ALLSERVER_HISTORYHERO
			tabList[index] = Lang.get("auction_all_server_sub"..index)
		end

        if value.cfg.auction_full_tab == AuctionConst.AC_ALLSERVER_OTHERS then
            local index = AuctionConst.AC_ALLSERVER_OTHERS
            tabList[index] = Lang.get("auction_all_server_sub"..index)
        end
    end

    return tabList,itemList
end

function AuctionHelper.getConfigIdByIndex(configId,subIndex)
    -- local inSubTab = AuctionHelper.isInTheSubTab(tabIndex)

	--过滤掉 已经结束的物品
	local function filter(dataList)
		if not dataList then
			dataList = {}
		end
		local filterData = {}
		for k ,v in pairs(dataList) do
			local endTime = v:getEnd_time()
		    local timeLeft = G_ServerTime:getLeftSeconds(endTime)
			if timeLeft >= 0 then
				table.insert(filterData, v)
			end
		end
		return filterData
	end

     if configId and configId > 0 then
        local itemList,bouns = G_UserData:getAuction():getAuctionData(configId)
        if subIndex and subIndex > 0 and subIndex < 100 then
            local retList = {}
            for i , value in ipairs(itemList) do
                if value.cfg.auction_full_tab == subIndex then
                    table.insert(retList, value)
                end
            end
            return filter(retList)
        end
        return filter(itemList), bouns
     end
     return {},nil
end

function AuctionHelper.getAuctionDataByTabIndex(tabIndex)
   -- local inSubTab = AuctionHelper.isInTheSubTab(tabIndex)


end

function AuctionHelper.getMoneyInfoByData(unitData)
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local DataConst = require("app.const.DataConst")
    local moneyType = unitData:getMoney_type()
	local moneyParams
	if moneyType==1 then
		moneyParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
	else
		moneyParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND)
    end
    return moneyParams
end

function AuctionHelper.getParameterValue(keyIndex)
    local parameter = require("app.config.parameter")
    for i=1, parameter.length() do
        local value = parameter.indexOf(i)
        if value.key == keyIndex then
            return tonumber(value.content)
        end
    end
    assert(false," can't find key index in parameter "..keyIndex)
end
return AuctionHelper
