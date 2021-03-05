local ServerListDataHelper = {}


function ServerListDataHelper.sortFunc(a,b)
    if a.subNum ~= b.subNum then
        return a.subNum > b.subNum
    end
    return a.server:getServer() > b.server:getServer() 
end

function ServerListDataHelper.sortMyServerListFunc(a,b)
    local aTime = checkint(a.server:getOpentime())
    local bTime = checkint(b.server:getOpentime())
    if aTime ~= bTime then
        return aTime > bTime
    end
    return a.server:getServer() > b.server:getServer() 
end

function ServerListDataHelper.sortReturnServerListFunc(a, b)
	local aTime = checkint(a.server:getOpentime())
	local bTime = checkint(b.server:getOpentime())
	if aTime ~= bTime then
		return aTime > bTime
	end
	return a.server:getServer() > b.server:getServer()
end

function ServerListDataHelper.sortRegionListFunc(a,b)
    if a.minTime ~= b.minTime then
        return a.minTime > b.minTime
    end
    if a.regionName ~= b.regionName then
        return a.regionName > b.regionName
    end

    return a.minNo > b.minNo
end

function ServerListDataHelper.removeEmptyRegion(regionList)
    for k = #regionList,1,-1 do
         local v = regionList[k]
         if not v.list or #v.list <= 0 then
             table.remove(regionList,k)
         end
    end
end

function ServerListDataHelper.getServerDataList()
    local serverlist = G_ServerListManager:getList()
    local roleList = G_RoleListManager:getList()
    --分区
    local newMap = {}
    local myServerList = {}
	local returnList = {} --回归服分组
	
    for k,v in ipairs(serverlist) do
        local data = {server = v,role = nil,subNum = 0,regionName = nil,regionNameHead = nil,regionNameTail = nil} 
        local serverName = data.server:getName()
		local isBackServer = data.server:isBackserver()
		
        if isBackServer then --回归服
			table.insert(returnList, data)
		else
			--  logWarn("decode servername "..tostring(serverName))
			local group1,group2 = string.match(serverName,"^([%a]*)([%d]+).*")
			if not group1 or not group2 then--H(0-1)  先锋服
				local a,b,c = string.match(serverName,"([^%d]*)([%d]*)([^%d]*)")
				data.regionName = a..c
				data.subNum = b == "" and 1 or tonumber(b)
				data.regionNameHead = a
				data.regionNameTail = c
				-- logWarn(tostring(a).."-------"..tostring(data.subNum).."------ "..tostring(c))
			else--S12暗渡陈仓
				-- logWarn(tostring(group1).."------------- "..tostring(group2))
				data.regionName = group1
				data.subNum = tonumber(group2)
			end

			if not newMap[data.regionName] then
				newMap[data.regionName] = {}
			end

			table.insert(newMap[data.regionName],data)
		end
      	

        for k2,v2 in ipairs(roleList) do
            if v:getServer() == v2:getServer_id() then
                if not data.role then
                    data.role = v2
                elseif v2:getRole_lv()  > data.role:getRole_lv() then
                     data.role = v2
                end
                
            end
        end
        if data.role then
            table.insert( myServerList,  data)
        end
    end


    table.sort(myServerList,ServerListDataHelper.sortMyServerListFunc)
	table.sort(returnList, ServerListDataHelper.sortReturnServerListFunc)
    for k,v in pairs(newMap) do
        table.sort(v,ServerListDataHelper.sortFunc)
    end

   

    --10个服一个区,服务器首字母不同则不同区
    local maxCount =  10
    local regionList = {}
    local currLen  = 0 
    for k,v in pairs(newMap) do--遍历所有区
        local count = #v--区里服务器数量
        local endSubNum  = v[1].subNum--最大的编号
        local startSubNum = v[#v].subNum--最小的编号

       -- logWarn(k.." "..startSubNum.."xxxxxxxx"..endSubNum)

        local subRegionNum = math.ceil( (endSubNum - startSubNum + 1)/maxCount ) 
        
     --   logWarn("bbbbbbbbbbbbb"..subRegionNum)
   
        --[[
              local currLen  = #regionList
        for i = 1,subRegionNum,1 do
            local regionData  = {minTime = 0 ,minNo = startSubNum + (i-1)*maxCount,regionName =  v[1].regionName,list = {},
                    regionNameHead = v[1].regionNameHead,regionNameTail = v[1].regionNameTail,showNo = true,
                }

          --  logWarn(regionData.regionName.."yyyyyyyyyyy"..regionData.minNo)


            table.insert(regionList,regionData)
        end
     ]]
       
        for i = 1,#v,1 do--遍历区里服务器
            local data = v[i]
            local index = math.floor( (data.subNum-startSubNum ) /maxCount) + 1
            local regionData = regionList[currLen +  index ]
            if not regionData then
                   regionData  = {minTime = 0 ,minNo = startSubNum + (index-1)*maxCount,regionName =  v[1].regionName,list = {},
                    regionNameHead = v[1].regionNameHead,regionNameTail = v[1].regionNameTail,showNo = true,
                  }
                  regionList[currLen +  index ] = regionData
            end

          --  logWarn("------------- "..index)

            if data.server:getServer() == 10060000 then--大蓝运营平台
                regionData.showNo = false
            end

            if  regionData.minTime and regionData.minTime ~= 0  then
                regionData.minTime = math.min(regionData.minTime,checkint(data.server:getOpentime()))
            else
                regionData.minTime =   checkint(data.server:getOpentime())
            end
            table.insert(regionData.list,data)
        end

         currLen  = currLen + subRegionNum
        
    end


    --ServerListDataHelper.removeEmptyRegion(regionList)
    local newRegionList = {}
    for k,v in pairs(regionList) do
        table.insert(newRegionList,v)
    end
    table.sort(newRegionList,ServerListDataHelper.sortRegionListFunc)

   	if #returnList > 0 then
		local regionData = {minTime = -2,minNo = 0 ,regionName = "",list = returnList}
		table.insert( newRegionList,1,regionData )   	
	end

    if #myServerList > 0 then
        local regionData = {minTime = -1,minNo = 0 ,regionName = "",list = myServerList}
        table.insert( newRegionList,1,regionData )
    end


    local pageDataList = {}
    local titles = {}
    for k,v in ipairs(newRegionList) do
        if v.minTime == -1 then
             table.insert( titles,
             Lang.get("login_select_server_first_page_title") )
		elseif v.minTime == -2 then
			table.insert( titles,
				Lang.get("login_select_server_return_page_title") )
        else
           -- logWarn(string.format("^^^^^^%s %d  %d",v.regionName,v.minNo,v.minTime))
            if v.showNo == false then
                if v.regionNameHead then
                    table.insert( titles, tostring(v.regionNameHead)..tostring(v.regionNameTail) )  
                else
                    table.insert( titles, v.regionName )  
                end
            elseif v.regionNameHead then
                   table.insert( titles, 
                Lang.get("login_select_server_page_title2",{name1 = v.regionNameHead,name2 = v.regionNameTail,min = v.minNo,max = v.minNo + maxCount -1 }) )  
            else
                 table.insert( titles, 
                Lang.get("login_select_server_page_title",{region = v.regionName,min = v.minNo,max = v.minNo + maxCount -1 }) )    
            end
           
        end
        table.insert( pageDataList, v.list )
    end 
    
  
    return pageDataList,titles
end

--创建Group单元结构
function ServerListDataHelper._makeGroupUnit(groupData)
    local unit = {
        groupId = groupData:getGroupid(),
        groupName = groupData:getGroupname(),
        openTime = 0, --整个组的开始时间，是服务器中最晚开服的时间
        list = {}
    }
    local serverIds = groupData:getServerIds()
    for i, strServerId in ipairs(serverIds) do
        local serverId = tonumber(strServerId)
        unit.list[serverId] = true
    end
    return unit
end

--检查服务器是否要放入分组里
function ServerListDataHelper._checkNeedInGroup(serverData)
    local serverId = serverData:getServer()
    local status = serverData:getStatus()
    local openTime = tonumber(serverData:getOpentime())
    local curTime = G_ServerTime:getTime()
    if status == 7 or curTime < openTime then
        return false
    else
        return true
    end
end

--将服务器数据填充进分组信息中
--返回：是否放进组中了
function ServerListDataHelper._formatGroupData(groupList, serverData)
    local isIn = false
    local needIn = ServerListDataHelper._checkNeedInGroup(serverData)
    local serverId = serverData:getServer()
    for groupId, unit in pairs(groupList) do
        if unit.list[serverId] == true then --找到了对应信息
            if needIn then
                unit.list[serverId] = {}
                unit.list[serverId].server = serverData
                unit.list[serverId].role = G_RoleListManager:getMaxLevelRoleInServer(serverId)
                local openTime = tonumber(serverData:getOpentime())
                if openTime > unit.openTime then
                    unit.openTime = openTime
                end
                isIn = true
            else
                unit.list[serverId] = nil
                isIn = false
            end
        end
    end
    return isIn
end

--创建回归服单元结构
function ServerListDataHelper._makeReturnUnit()
	local unit = {
		groupId = "return",
		groupName = Lang.get("login_select_server_return_page_title"),
		openTime = 0,
		list = {}
	}
	return unit
end

function ServerListDataHelper._formatReturnData(returnUnit, serverData)
	if serverData:isBackserver() then
		local serverId = serverData:getServer()
		local openTime = tonumber(serverData:getOpentime())
		if openTime > returnUnit.openTime then
			returnUnit.openTime = openTime
		end
		returnUnit.list[serverId] = {}
		returnUnit.list[serverId].server = serverData
		returnUnit.list[serverId].role = G_RoleListManager:getMaxLevelRoleInServer(serverId)
	end
end

--创建默认Group单元结构
function ServerListDataHelper._makeDefaultUnit()
    local unit = {
        groupId = "default",
        groupName = Lang.get("login_select_server_default_page_title"),
        openTime = 0,
        list = {}
    }
    return unit
end

function ServerListDataHelper._formatDefaultData(defaultUnit, serverData)
    local serverId = serverData:getServer()
    local openTime = tonumber(serverData:getOpentime())
    if openTime > defaultUnit.openTime then
        defaultUnit.openTime = openTime
    end
    defaultUnit.list[serverId] = {}
    defaultUnit.list[serverId].server = serverData
    defaultUnit.list[serverId].role = G_RoleListManager:getMaxLevelRoleInServer(serverId)
end

--创建已有角色单元结构
function ServerListDataHelper._makeMyUnit()
    local unit = {
        groupId = "my",
        groupName = Lang.get("login_select_server_first_page_title"),
        openTime = 0,
        list = {}
    }
    return unit
end

function ServerListDataHelper._formatMyData(myUnit, serverData)
    local serverId = serverData:getServer()
    local role = G_RoleListManager:getMaxLevelRoleInServer(serverId)
    if role == nil then
        return
    end
    local openTime = tonumber(serverData:getOpentime())
    if openTime > myUnit.openTime then
        myUnit.openTime = openTime
    end
    myUnit.list[serverId] = {}
    myUnit.list[serverId].server = serverData
    myUnit.list[serverId].role = role
end

--删除group数据中无用的server信息
function ServerListDataHelper._removeUselessServerIdInGroup(groupList)
    for groupId, unit in pairs(groupList) do
        for serverId, v in pairs(unit.list) do
            if v == true then
                unit.list[serverId] = nil
            end
        end
    end
end

--获取服务器列表信息（按照分组规则）
function ServerListDataHelper.getServerDataListForGroup()
    local groupList = {}
    local serverGroup = G_ServerListManager:getServerGroup()
    for i, groupData in ipairs(serverGroup) do
        local unit = ServerListDataHelper._makeGroupUnit(groupData)
        groupList[unit.groupId] = unit
    end

    local myUnit = ServerListDataHelper._makeMyUnit()
	local returnUnit = ServerListDataHelper._makeReturnUnit()
    local defaultUnit = ServerListDataHelper._makeDefaultUnit() 
    local serverlist = G_ServerListManager:getList()
    for i, serverData in ipairs(serverlist) do
        local isIn = ServerListDataHelper._formatGroupData(groupList, serverData)
        if isIn == false then --没有分组的服务器，单独放在一个标签下
            ServerListDataHelper._formatDefaultData(defaultUnit, serverData)
        end
        ServerListDataHelper._formatMyData(myUnit, serverData)
		ServerListDataHelper._formatReturnData(returnUnit, serverData)
    end
    ServerListDataHelper._removeUselessServerIdInGroup(groupList)

    local sortData = {}
    for groupId, unit in pairs(groupList) do
        table.insert(sortData, unit)
    end
    table.sort(sortData, function(a, b)
        return a.openTime > b.openTime
    end)

    local listData = {}
    if G_RoleListManager:isNewPlayer() then --新玩家，只显示最新的一组
        if sortData[1] then
            table.insert(listData, sortData[1])
        end
    else --有角色的，找创角最早的服务器和此后开的服务器
        local serverId = G_RoleListManager:getEarliestServerId()
        local serverData = G_ServerListManager:getServerById(serverId)
        local openTime = tonumber(serverData:getOpentime())
        for i, unit in ipairs(sortData) do
            if unit.openTime >= openTime then
                table.insert(listData, unit)
            end
        end
    end

    table.insert(listData, 1, myUnit)
    local defaultServerCount = 0
    for k, v in pairs(defaultUnit.list) do
        defaultServerCount = defaultServerCount + 1
    end
    if defaultServerCount > 0 then
        table.insert(listData, defaultUnit)
    end

    local pageDataList = {}
    local titles = {}
    for i, unit in ipairs(listData) do
        local list = {}
        for serverId, data in pairs(unit.list) do
            table.insert(list, data)
        end
        table.sort(list, ServerListDataHelper.sortMyServerListFunc)
        table.insert(pageDataList, list)
        table.insert(titles, unit.groupName)
    end

    return pageDataList, titles
end

return ServerListDataHelper