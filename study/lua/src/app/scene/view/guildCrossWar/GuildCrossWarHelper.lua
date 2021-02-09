
local GuildCrossWarHelper = {}
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
local UIHelper = require("yoka.utils.UIHelper")
local UTF8 = require("app.utils.UTF8")
local AStar = require("app.scene.view.guildCrossWar.AStar")

--============================================================
-- @Role    获取称号（保留）
function GuildCrossWarHelper.getGameTile(titleId)
    local titleInfo = require("app.config.title")
    if titleId >= 1 and titleId < titleInfo.length() then
        return titleInfo.indexOf(titleId).resource
    end
    return nil
end

-- @Role    支援掉落
function GuildCrossWarHelper.getSupportDropItems( ... )
    local items = {}
    local content = GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_SUPPORT_ITEMS)
    local strArr = string.split(content, ",")
    for i, v in ipairs(strArr) do
        local item = string.split(v, "|")
        table.insert(items, {type = tonumber(item[1]), value = tonumber(item[2]), size = tonumber(item[3])})
    end
    return items
end

-- @Role    限时跨服战掉落
function GuildCrossWarHelper.getLimitAwards( ... )
    local items = {}
    local openServerTime = G_UserData:getBase():getOpenServerDayNum()
    local guild_cross_war_award = require("app.config.guild_cross_war_award")
    for i = 1, guild_cross_war_award.length() do
        local indexData = guild_cross_war_award.indexOf(i)
        if indexData.day_min <= openServerTime and openServerTime <= indexData.day_max then
            for i=1, 13 do
                if indexData["type_"..i] and indexData["type_"..i] ~= 0 then
                    table.insert(items, {type = indexData["type_"..i], 
                                        value = indexData["value_"..i], 
                                        size = indexData["size_"..i]})
                end
            end
            break
        end
    end
    return items
end

-- @Role    MapCfg位置信息（新
-- @Param1  据点
function GuildCrossWarHelper.getWarMapCfg(id)
    local holeData = G_UserData:getGuildCrossWar():getWarHoleList()
    local indexData = holeData[id]
    if indexData and indexData.cfg then
        return indexData.cfg
    end
    return nil
    --assert(false, string.format("can not find guild_cross_war_map cfg by Grid[%d]", id))
end

-- @Role    获取个人奖励
-- @Param1  积分
function GuildCrossWarHelper.getPersonAwards(score)
    if score == nil then return nil end
    local guildMerit = require("app.config.guild_cross_war_merit")
    for i = 1, guildMerit.length() do
        local indexData = guildMerit.indexOf(i)
        if indexData.merit_min <= score and score <= indexData.merit_max then
            return indexData
        end
    end
    return nil
end

-- @Role    Is sub-Fuc of isAroundGrid
function GuildCrossWarHelper.getGridExceptNotOri(aroundAtkGrids, newGrid, oriPoint, selfGridData)
    local isCanAtk = cc.pGetDistance(cc.p(newGrid.axis_x, newGrid.axis_y), cc.p(selfGridData.x, selfGridData.y)) == 1 or false
    
    if newGrid.point_y ~= 0 then
        local pointCfg = GuildCrossWarHelper.getWarCfg(newGrid.point_y)
        if pointCfg.type == 1 then
            if rawequal(oriPoint, newGrid.point_y) then -- 初始据点
                table.insert(aroundAtkGrids, {id = newGrid.id, isCanAtk = isCanAtk, isCanArrive = true})
            end
        else
            table.insert(aroundAtkGrids, {id = newGrid.id, isCanAtk = isCanAtk, isCanArrive = true})    
        end
    else
        local bossMap = G_UserData:getGuildCrossWar():getBossMap()
        local selfUnit = G_UserData:getGuildCrossWar():getSelfUnit()
        if rawequal(oriPoint, selfUnit:getCurPointId()) then -- 初始据点存怪
            if not bossMap[oriPoint] or bossMap[oriPoint]:isIs_kill() then
                table.insert(aroundAtkGrids, {id = newGrid.id, isCanAtk = isCanAtk, isCanArrive = true})
            end
        else
            table.insert(aroundAtkGrids, {id = newGrid.id, isCanAtk = isCanAtk, isCanArrive = true})
        end
    end
end

-- @Role    格子是哪个是否有怪
-- @Param1  当前格子
function GuildCrossWarHelper.isExistBoss(curGrid)
    local bossMap = G_UserData:getGuildCrossWar():getBossMap()
    for k,v in pairs(bossMap) do
        if v and v:getConfig() then
            if v:getConfig().boss_place == curGrid and not v:isIs_kill() then
                return true
            end
        end
    end
    return false
end

-- @Role    是否城池周围格子
-- @Param1  据点
-- @Param1  当前格子
function GuildCrossWarHelper.isAroundGrid(curGrid, pointId)
    local aroundAtkGrids = {}
    local gridData = pointId and GuildCrossWarHelper.getWarMapCfg(GuildCrossWarHelper.getWarCfg(pointId).boss_place)
                              or GuildCrossWarHelper.getWarMapCfg(curGrid)
    
    local selfUnit = G_UserData:getGuildCrossWar():getSelfUnit()
    local oriPoint = G_UserData:getGuildCrossWar():getSelfOriPoint()
    local retList = G_UserData:getGuildCrossWar():getWarHoleList()
    local curGridData = retList[curGrid]
    oriPoint = oriPoint > 0 and oriPoint or selfUnit:getCurPointId() -- 观战者

    local newAroundAtkGrids = {}
    local oriX = (gridData.axis_x - GuildCrossWarConst.MAX_GRID_NUMSATK)
    local oriY = (gridData.axis_y - GuildCrossWarConst.MAX_GRID_NUMSATK)
    local maxNums = (GuildCrossWarConst.MAX_GRID_NUMSATK * 2 + 1)

    for x=0, maxNums do
        for y=0, maxNums do
            local newGrid = GuildCrossWarHelper.getWarMapCfgByGrid(oriX + x, oriY + y)
            if newGrid then
                if newGrid.is_move == 1 or pointId then
                    GuildCrossWarHelper.getGridExceptNotOri(newAroundAtkGrids, newGrid, oriPoint, curGridData)
                end
            end
        end
    end

    -- body    
    for i, v in ipairs(newAroundAtkGrids) do
        if v then
            local distance =  cc.pGetDistance(cc.p(curGridData.x, curGridData.y), cc.p(retList[newAroundAtkGrids[i].id].x, retList[newAroundAtkGrids[i].id].y))
            if distance > GuildCrossWarConst.MAX_GRID_NUMSATK then
                v.isCanArrive = false
            else
                local path = GuildCrossWarHelper.getFindingpath(curGridData.id, v.id)
                if not path or table.nums(path) <= 0 then
                    v.isCanArrive = false
                elseif table.nums(path) > (GuildCrossWarConst.MAX_GRID_NUMSATK + 1) then
                    v.isCanArrive = false
                elseif GuildCrossWarHelper.isExistBoss(v.id) then
                    v.isCanArrive = false
                end
            end
        end
    end

    return newAroundAtkGrids
end

-- @Role    MapCfg位置信息（新
-- @Param1  横坐标
-- @Param2  众坐标
function GuildCrossWarHelper.getWarMapCfgByGrid(gridX, gridY)
    local data = G_UserData:getGuildCrossWar():getWarHolegMap()
    if not data then
        return nil
    end
    return data[gridX .."_" ..gridY]
end

-- @Role    格子中心（新
-- @Param1  横坐标
-- @Param2  众坐标
function GuildCrossWarHelper.getWarMapGridCenter(gridId)
    local warMapCfg = GuildCrossWarHelper.getWarMapCfg(gridId)
    if warMapCfg then
        return cc.p((warMapCfg.axis_x - 0.5) * GuildCrossWarConst.GRID_SIZE, 
                    (warMapCfg.axis_y - 0.5) * GuildCrossWarConst.GRID_SIZE)
    end
    return nil
end

-- @Role    Get GridId by position
function GuildCrossWarHelper.getGridIdByPosition(x, y)
    local gridX = math.ceil((x / GuildCrossWarConst.GRID_SIZE))
    local gridY = math.ceil((y / GuildCrossWarConst.GRID_SIZE))
    local holeCfg = GuildCrossWarHelper.getWarMapCfgByGrid(gridX, gridY)
    if holeCfg == nil then
        return 0
    end
    return holeCfg.id
end

-- @Role    坑点位置上的随机点（实际位置）
-- @Param1  据点
-- @Param2  坑位
function GuildCrossWarHelper.getOffsetPointRange(holeId, isSelf)
    local randomRegion = isSelf and 59 or 20    
    local holeData = GuildCrossWarHelper.getWarMapCfg(holeId)
    local holeX = ((holeData.axis_x - 1) * GuildCrossWarConst.GRID_SIZE)
    local holeY = ((holeData.axis_y - 1) * GuildCrossWarConst.GRID_SIZE)
    local holePos = cc.p(holeX, holeY)
    local randomOffsetX = math.random(randomRegion, GuildCrossWarConst.GRID_SIZE - randomRegion)
    local randomOffsetY = math.random(randomRegion, GuildCrossWarConst.GRID_SIZE - randomRegion)

    local resultPoint = cc.pAdd(holePos, cc.p(randomOffsetX, randomOffsetY))
    return resultPoint
end

-- @Role    获得移动路径 (（据点+坑点）+ (midp1+ midp2+...) （下一个据点+坑点）
-- @Param1  起始坑位
-- @Param2  终点坑位
function GuildCrossWarHelper.getMovingLine(slot1, slot2, isSelf)
    local starPos = GuildCrossWarHelper.getOffsetPointRange(slot1)
    local endPos = GuildCrossWarHelper.getOffsetPointRange(slot2, isSelf)
    return starPos, endPos
end

-- @Role    Get Guild_Cross_War Config
function GuildCrossWarHelper.getSupportCfg(num)
    local guild_cross_war_support = require("app.config.guild_cross_war_support")
    for i = 1, guild_cross_war_support.length() do
        local indexData = guild_cross_war_support.indexOf(i)
        if num < indexData.support then
            return indexData.soldiers
        end
    end
    return 0
end

-- @Role    Get Guild_Cross_War Config
function GuildCrossWarHelper.getWarCfg(point)
    local guild_cross_war = require("app.config.guild_cross_war")
    return guild_cross_war.indexOf(point)
end

-- @Role    是否是当前可移动到的点
-- @Param   point 当前点(只判断相邻格子)
function GuildCrossWarHelper.checkCanMovedPoint(selfPoint, targetGrid)
    if selfPoint == nil or table.nums(selfPoint) < 2 then
        return false
    end

    local oriPoint = G_UserData:getGuildCrossWar():getSelfOriPoint()
    local warMap = GuildCrossWarHelper.getWarMapCfg(selfPoint.pos)
    if not warMap then
        return false
    end

    if targetGrid.point_y == 0 then         -- 1. 通道内移动
        if rawequal(warMap.axis_x, targetGrid.axis_x) and math.abs(warMap.axis_y - targetGrid.axis_y) == 1 then
            return true
        elseif rawequal(warMap.axis_y, targetGrid.axis_y) and math.abs(warMap.axis_x - targetGrid.axis_x) == 1 then
            return true
        end
        return false
    end

                                            -- 2. 据点内移动
    local targetData = GuildCrossWarHelper.getWarCfg(targetGrid.point_y)
    if rawequal(warMap.axis_x, targetGrid.axis_x) and math.abs(warMap.axis_y - targetGrid.axis_y) == 1 then
        return not (targetData.type == 1 and targetGrid.point_y ~= oriPoint)
    elseif rawequal(warMap.axis_y, targetGrid.axis_y) and math.abs(warMap.axis_x - targetGrid.axis_x) == 1 then
        return not (targetData.type == 1 and targetGrid.point_y ~= oriPoint)
    end
    return false
end

-- @Role    isExitCurAround
function GuildCrossWarHelper.isExitCurAround(uid)
    -- body
    local curAroundUids = G_UserData:getGuildCrossWar():getAroundUids()
    if not curAroundUids or table.nums(curAroundUids) <= 0 then
        return false
    end
    if not curAroundUids[uid] or curAroundUids[uid] == 0 then
        return false
    end
    return true
end

--------------------------------------------------------------
-- @Role    获取Parameter
function GuildCrossWarHelper.getParameterContent(constId)
    local UserDataHelper = require("app.utils.UserDataHelper")
    return UserDataHelper.getParameter(constId)
end

-- 时间处理
-- @Role    是否今日开启
function GuildCrossWarHelper.isTodayOpen()
    -- body
    local function canOpenToday(day)
        -- body
        local openDay = tonumber(GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_OPEN_WEEK))
        openDay = (openDay + 1)
        openDay = (openDay > 7 and (openDay - 7) or openDay)
        return (openDay == day)
    end

    local curTime = G_ServerTime:getTime()
    local date = G_ServerTime:getDateObject(nil, 0)
    local openAct = tonumber(GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_OPEN_ACT)) -- 2
    local zeroTime = G_ServerTime:secondsFromZero()
    local champClose = (zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_SHOW_CLOSE))  -- 20:00

    if date.wday == 1 then
            return curTime < champClose, false
    elseif date.wday == 2 then
        return false, false
    elseif date.wday == (openAct + 1) then  -- Tuesday
        local openActTime = tonumber(GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_ACT_START))    -- 21:30
        local endTime = (zeroTime + openActTime)
        if curTime < endTime then
            return false, false
        else
            return true, false
        end
    else
        return true, canOpenToday(date.wday) -- wday (weekday, Sunday is 1)
    end
end

-- @Role    时间集合(开始时间、集结结束时间、活动结束)
function GuildCrossWarHelper.getConfigTimeRegion()
    local zeroTime = G_ServerTime:secondsFromZero()
    local startTime = zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_OPEN_TIME)

    local timeLen1 = GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_READY_TIME)
    local timeLen2 = GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_CONDUCTING_TIME)
    local endTime = (startTime + timeLen1 + timeLen2)

    return {startTime = startTime, readyEndTime = (startTime + timeLen1), endTime = endTime}
end

-- @Role    活动当前阶段
function GuildCrossWarHelper.getCurCrossWarStage()
    local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()
    if not bOpenToday then
        return GuildCrossWarConst.ACTIVITY_STAGE_3, 0
    end

    local curTime = G_ServerTime:getTime()
    local timeData = GuildCrossWarHelper.getConfigTimeRegion()

    if timeData.startTime <= curTime and timeData.readyEndTime > curTime then
        return GuildCrossWarConst.ACTIVITY_STAGE_1, timeData.readyEndTime
    elseif timeData.readyEndTime <= curTime and timeData.endTime > curTime then
        return GuildCrossWarConst.ACTIVITY_STAGE_2, timeData.endTime
    else
        return GuildCrossWarConst.ACTIVITY_STAGE_3, 0
    end
end

-- @Role    Is Fighting
function GuildCrossWarHelper.isFightingStage()
    local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()
    if not bOpenToday then
        return GuildCrossWarConst.ACTIVITY_STAGE_3, 0
    end

    local curTime = G_ServerTime:getTime()
    local timeData = GuildCrossWarHelper.getConfigTimeRegion()

    if timeData.readyEndTime <= curTime and timeData.endTime > curTime then
        return true
    else
        return false
    end
end

--============================================================
-- @Role    大地图坐标转换成小地图
function GuildCrossWarHelper.convertToSmallMapPos(pos, isMini)
    pos.x = pos.x * GuildCrossWarConst.CAMERA_SCALE_SMALL
    pos.y = pos.y * GuildCrossWarConst.CAMERA_SCALE_SMALL
    return pos
end

-- @Role    Create Flag In Mini/Small Map
function GuildCrossWarHelper.createFlagInMap()
    local flagNode = cc.Node:create()
    local flagImg = UIHelper.createImage({texture = Path.getQinTomb("img_qintomb_map03a")})
    flagNode:addChild(flagImg)
    return flagNode
end

-- @Role    Create MoveGrid-Green
function GuildCrossWarHelper.createMoveGrid()
    local flagNode = cc.Node:create()
    local flagImg = UIHelper.createImage({texture = Path.getGuildCrossImage("img_guild_cross_war_green")})
    flagImg:setSwallowTouches(false)
    flagNode:addChild(flagImg)
    local UIActionHelper = require("app.utils.UIActionHelper")
	UIActionHelper.playBlinkEffect(flagImg, {opacity1 = 50, opacity2 = 125})
    return flagNode
end

-- @Role    Create CouldMoveGrid
function GuildCrossWarHelper.createCouldMoveGrid()
    local flagNode = cc.Node:create()
    local flagImg = UIHelper.createImage({texture = Path.getGuildCrossImage("img_guild_cross_war_green1")})
    flagImg:setSwallowTouches(false)
    flagNode:addChild(flagImg)
    return flagNode
end

-- @Role    Create GuildFlag
function GuildCrossWarHelper.createGuildFlag(pointId)
    local flagNode = cc.Node:create()
    local flagImg = UIHelper.createImage({texture = Path.getGuildRes("img_flag_colour03"), scale = 0.45})
    local serverBg = UIHelper.createImage({texture = Path.getCommonImage("img_com_txtbg12"), scale = 0.9})
    local flagName = UIHelper.createLabel({fontSize = 18, fontName = Path.getFontW8()})
    local serverName = UIHelper.createLabel({fontSize = 18, fontName = Path.getFontW8()})
    flagName:setName("guildName" ..pointId)
    flagImg:setName("guildFlag" ..pointId)
    serverName:setName("serverName" ..pointId)
    flagName:setAnchorPoint(cc.p(0.5, 0.5))
    serverName:setAnchorPoint(cc.p(0.5, 0.5))
    flagNode:addChild(serverName, 20)
    flagNode:addChild(flagImg)
    flagNode:addChild(flagName)
    flagNode:addChild(serverBg, 10)
    serverBg:setPositionY(30)
    serverName:setPositionY(30)
    return flagNode
end

-- @Role    Create FightFlag
function GuildCrossWarHelper.createFightFlag(pointId)
    local effectNode = cc.Node:create()
    local flagNode = cc.Node:create()
    local flagImg = UIHelper.createImage({texture = Path.getTextGuildCross("img_guild_cross_war_fighting")})
    flagImg:setPositionY(-20)
    flagNode:addChild(flagImg)

    -- Effect
    local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_shuangjian"then
            local subEffect = EffectGfxNode.new("effect_shuangjian")
            subEffect:play()
            return subEffect 
        end
    end

    effectNode:removeAllChildren()
    local swordEffect = G_EffectGfxMgr:createPlayMovingGfx(effectNode, "moving_shuangjian", effectFunction, nil, false )
	swordEffect:setPosition(0, 20)
    swordEffect:setAnchorPoint(cc.p(0.5, 0.5))
    swordEffect:setScale(0.4)
    flagNode:addChild(effectNode, 100000)
    return flagNode
end

-- @Role    同步更新用户小地图坐标
-- @Param1  RootNode
-- @Param2  大地图横向坐标
-- @Param3  大地图纵向坐标
function GuildCrossWarHelper.updateSelfNode(rootNode, selfPosX, selfPosY, isMini)
    -- body
    if G_UserData:getGuildCrossWar():getSelfUnit() == nil then
        return
    end

    -- Update Flag's pos
    local selfNode = rootNode:getChildByName("self_node")
    if selfNode == nil then
        selfNode = GuildCrossWarHelper.createFlagInMap()
        if selfNode then
            selfNode:setName("self_node")
            rootNode:addChild(selfNode, 10000)
        end
    end

    -- Synchro Pos
    local tempPosition = GuildCrossWarHelper.convertToSmallMapPos(cc.p(selfPosX, selfPosY), isMini)
    selfNode:setPosition(tempPosition)
end


-- @Role    当前位置点
function GuildCrossWarHelper.createGuildNumFlag()
    local flagNode = cc.Node:create()
    local flagImg = UIHelper.createImage({texture = Path.getGuildCrossImage("img_unit02")})
    flagNode:addChild(flagImg)
    return flagNode
end

-- @Role    同步更新同工会小地图坐标
-- @Param1  RootNode
function GuildCrossWarHelper.updateSelfGuildMemeber(rootNode, users)
    users = users or {}
    for k,v in pairs(users) do
        local guildNumber = rootNode:getChildByName("guildNumber_" ..k)
        if guildNumber == nil then
            guildNumber = GuildCrossWarHelper.createGuildNumFlag()
            guildNumber:setName("guildNumber_" ..k)
            rootNode:addChild(guildNumber, 10000)
        end

        local x, y = v:getPosition()
        local tempPosition = GuildCrossWarHelper.convertToSmallMapPos(cc.p(x, y), false)
        guildNumber:setPosition(tempPosition)
    end
end

-- @Role    Update GuildFlag
-- @Param   
function GuildCrossWarHelper.updateGuildFlag(pointOccupied, key, value)
    pointOccupied:enumerateChildren("guildFlag" ..key, function(node)
        if node and value:getGuild_name() ~= "" then
            node:loadTexture(Path.getGuildFlagImage(value:getGuild_level()))
        end
    end)
end

-- @Role    Update GuildName
-- @Param   
function GuildCrossWarHelper.updateGuildName(pointOccupied, key, value)
    pointOccupied:enumerateChildren("guildName" ..key, function(node)
        if node and value:getGuild_name() ~= "" then
            node:setString(UTF8.utf8sub(value:getGuild_name(), 1, 2))
            node:setColor(Colors.getGuildFlagColor(value:getGuild_level()))
            node:enableOutline(Colors.getGuildFlagColorOutline(value:getGuild_level()))
        end
    end)
end

-- @Role    Update ServerName
-- @Param   
function GuildCrossWarHelper.updateServerName(pointOccupied, key, value)
    pointOccupied:enumerateChildren("serverName" ..key, function(node)
        if node and value:getSname() ~= "" then
            node:setString(value:getSname())
            node:setColor(cc.c3b(0xf7, 0xed, 0xd6))
        end
    end)
end

-- @Role   Get Color For User
-- @Param   用户Id
function GuildCrossWarHelper.getPlayerColor(userId)
    -- body
    local unitData = G_UserData:getGuildCrossWar():getUnitById(userId)
    if unitData == nil then
        return Colors.getColor(6)
    end
    if unitData:isSelf() then
        return Colors.getColor(2)--自己
    end
    if unitData:isSelfGuild() then
        return Colors.getColor(3)--自己军团
    end
    --非本军团
    return Colors.getColor(6)
end

-- @Role    获取Boss配置
function GuildCrossWarHelper.isExistBossInPoint(pointId)
    local warKeyMap = G_UserData:getGuildCrossWar():getWarKeyMap()
    for i,v in ipairs(warKeyMap) do
        if v.cfg and v.cfg.boss_res > 0 and v.cfg.id == pointId then
            return true, v.cfg
        end
    end
    return false, nil
end

-- @Role    是否可进行跨服军团战（0：整个服无资格；1：观战；2：参战）
function GuildCrossWarHelper.isGuildCrossWarEntry()
    local roleQualification = G_UserData:getBase():getBrawlguilds_role()
    return (not rawequal(roleQualification, 0)), rawequal(roleQualification, 2)
end

-- @Role    是否自身
function GuildCrossWarHelper.isSelf(userId)
    local observerId = G_UserData:getGuildCrossWar():getObserverId() or 0
    return userId == (observerId > 0 and observerId
                                     or  G_UserData:getBase():getId())
end

-- @Role    是否回到原始据点
function GuildCrossWarHelper.isOriPoint(point)
    return rawequal(point, G_UserData:getGuildCrossWar():getSelfOriPoint())
end

-- @Role    GuildRank's GuildName Color
function GuildCrossWarHelper.getGuildNameColor(rank)
    if rank <=3 and rank > 0  then
        return Colors["GUILD_DUNGEON_RANK_COLOR"..rank]
    end
    return Colors["DARK_BG_ONE"]
end

-- @Role    Get Path
function GuildCrossWarHelper.getFindingpath(selfPos, destPos)
    local retList = G_UserData:getGuildCrossWar():getWarHoleList()
    local valid_node_func = function (node, neighbor) 

        local MAX_SZIE = 2
        if neighbor.isMove == node.isMove and neighbor.isMove == 1 then
            if --[[cc.pGetDistance(cc.p(node.x, node.y), cc.p(neighbor.x, neighbor.y)) ~= GuildCrossWarConst.CROSS_GRID_DISTANCE and]] 
                cc.pGetDistance(cc.p(node.x, node.y), cc.p(neighbor.x, neighbor.y)) < MAX_SZIE then
                return true
            end 
            return false
        end
        return false
    end
    local path = AStar.path(retList[selfPos], retList[destPos], retList, true, valid_node_func) or {}
    return path
end

-------------------------------------------------------------------------------
--- @Role   Guess Region
function GuildCrossWarHelper.getGuessRegionTime( ... )
    local zeroTime = G_ServerTime:secondsFromZero()
    local guessStartTime = zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_GUESS_START)-- 4:00
    local guessEndTime = zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_GUESS_END)    -- 21:00

    local readyTime = GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_READY_TIME)                 -- Ready：60's
    local reaminTime = GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_CONDUCTING_TIME)           -- Remain：900's
    local todayLast = (zeroTime + guessEndTime + readyTime + reaminTime)                                                -- 21:16
    return {isTodayOpen = GuildCrossWarHelper.isTodayOpen(), gusStartTime = guessStartTime, gusEndTime = guessEndTime, endTime = todayLast}
end

--- @Role   Is In Guess
function GuildCrossWarHelper.isInspireTime( ... )
    local curTime = G_ServerTime:getTime()
    local regionData = GuildCrossWarHelper.getGuessRegionTime()
    local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()

    if bOpenToday then
        if curTime <= regionData.gusStartTime then
            return true, true, true 
        elseif curTime > regionData.gusStartTime and curTime < regionData.endTime then
            if curTime < regionData.gusEndTime then
                return true, true, false
            end
            return true, false, false
        end
    end
    return false, false, true
end

--- @Role   Guess Region
function GuildCrossWarHelper.getCurActStage()
    local curTime = G_ServerTime:getTime()
    local zeroTime = G_ServerTime:secondsFromZero()
    local today = G_ServerTime:getDateObject(nil, 0).wday

    local open1 = (zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_GUESS_START)) -- 4:00
    local open2 = (zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_GUESS_END))   -- 21:00                                                                -- 21:00
    local open4 = (zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_ACT_START))   -- 21:30
    local open5 = (zeroTime + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_SHOW_CLOSE))  -- 20:00

    local reaminTime = GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_CONDUCTING_TIME)     -- 900's
    local ready1 = (open2 + GuildCrossWarHelper.getParameterContent(G_ParameterIDConst.GUILDCROSS_READY_TIME))    -- 21:01
    local open3 = (ready1 + reaminTime)                                                                           -- 21:01 + remaining


    -- stage 1:准备阶段 2:鼓舞支援阶段 3:战斗阶段  4:结算展示阶段 5:关闭阶段
    local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()
    if bOpenToday then
        if curTime < open1 then
            return {stage = 1, endTime = open1, fightStartTime = open2, fightEndTime = open3, desc = Lang.get("guild_cross_war_reday_time_last")}
        elseif open1 <= curTime and curTime < open2 then
            return {stage = 2, endTime = open2, fightStartTime = open2, fightEndTime = open3, desc = Lang.get("guild_cross_war_reday_support_last")}
        elseif open2 <= curTime and curTime < open3 then
            if curTime <= ready1 then
                return {stage = 3, endTime = open3,fightStartTime = open2, fightEndTime = ready1, desc = Lang.get("guild_cross_war_reday_ready_last")}
            else
                return {stage = 3, endTime = open3,fightStartTime = open2, fightEndTime = open3, desc = Lang.get("guild_cross_war_reday_fight_last")}
            end
        elseif curTime >= open3 then
            return {stage = 4, endTime = (1 * 24 * 3600 + open5), 
                               fightStartTime = (1 * 24 * 3600 + open3), 
                               fightEndTime = (1 * 24 * 3600 + open3), desc = Lang.get("guild_cross_war_reday_fighted_last")}
        end
    else
        if today == 1 then
            if curTime < open5 then
                return {stage = 4, endTime = open5,
                                fightStartTime = open5, 
                                fightEndTime = open5, desc = Lang.get("guild_cross_war_reday_fighted_last")}
            else
                return {stage = 5, endTime = (2 * 24 *3600 + open4),
                                fightStartTime = (2 * 24 *3600 + open4), 
                                fightEndTime = (2 * 24 *3600 + open4)}
            end
        elseif today == 2 then
            return {stage = 5, endTime = (1 * 24 * 3600 + open4),
                                fightStartTime = (1 * 24 * 3600 + open4), 
                                fightEndTime = (1 * 24 * 3600 + open4)}
        elseif today == 3 then
            if curTime < open4 then
                return {stage = 5, endTime = open4,
                                fightStartTime = open4,
                                fightEndTime = open4}
            elseif curTime >= open4 then
                return {stage = 1, endTime = (4 * 24 * 3600 + open1),
                                fightStartTime = ((7 - today) * 24 * 3600 + open2),
                                fightEndTime = ((7 - today) * 24 * 3600 + open3),
                                desc = Lang.get("guild_cross_war_reday_time_last")}
            end
        elseif 4 <= today and today <= 6 then
            return {stage = 1, endTime = ((7 - today) * 24 * 3600 + open1),
                                fightStartTime = ((7 - today) * 24 * 3600 + open2), 
                                fightEndTime = ((7 - today) * 24 * 3600 + open3),
                                desc = Lang.get("guild_cross_war_reday_time_last")}
        end
    end
end


return GuildCrossWarHelper
