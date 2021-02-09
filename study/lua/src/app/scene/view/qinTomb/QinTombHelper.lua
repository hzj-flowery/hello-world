
local QinTombHelper = {}
local QinTombConst = require("app.const.QinTombConst")
local UIHelper = require("yoka.utils.UIHelper")


--============================================================
--配置读取处理
--获取所有可移动Key
function QinTombHelper.getMoveSignKeyList(...)
    local retList = {}
    local qin_point = require("app.config.qin_point")
    for i = 1, qin_point.length() do
        local data = qin_point.indexOf(i)
        if data.point_type <= 3 then
            table.insert(retList, data)
        end
    end
    return retList
end

--根据所在位置，获取所有可移动的点
function QinTombHelper.getMoveSignKey(keyPoint)
    local qin_point_time = require("app.config.qin_point_time")
    local keyList = {}
    for loop = 1, qin_point_time.length() do
        local cfgData = qin_point_time.indexOf(loop)
        if cfgData.point_id_1 == keyPoint then
            local data = QinTombHelper.getPointCfg(cfgData.point_id_2)
            table.insert(keyList, data)
        end
    end
    return keyList
end

function QinTombHelper.getQinInfo(key)
    -- body
    local qin_info = require("app.config.qin_info")
    local infoData = qin_info.get(1)
    return infoData[key]
end

function QinTombHelper._decodeNums(str)
    local strArr = string.split(str, "|")
    local nums = {}
    for k, v in ipairs(strArr) do
        nums[k] = tonumber(v)
    end
    return nums, cc.p(nums[1], nums[2])
end

function QinTombHelper.getPointCfg(pointId)
    -- body
    local pointData = require("app.config.qin_point").get(pointId)
    assert(pointData, "can not find qin_point cfg by id " .. pointId)
    return pointData
end


--根据点id 获得
function QinTombHelper.getOffsetPoint(pointId, index)
    -- body
    local pointData = QinTombHelper.getPointCfg(pointId)
    local offsetArray, offsetPoint = QinTombHelper._decodeNums(pointData["offset_mid" .. index])
    
    local midPoint = QinTombHelper.getMidPoint(pointId)
    
    midPoint = cc.p(offsetPoint.x, offsetPoint.y)
    return midPoint
end


function QinTombHelper.getRandomRangePoint(midPoint, rangeSize)
    -- body
    local rangeRect = cc.rect(midPoint.x - rangeSize.width * 0.5,
        midPoint.y - rangeSize.height * 0.5,
        rangeSize.width,
        rangeSize.height)
    
    
    local clickX = rangeRect.x + math.random(0, rangeRect.width)
    local clickY = rangeRect.y + math.random(0, rangeRect.height)
    return cc.p(clickX, clickY)
end


--根据偏移量+pointId，范围-》获得随机点
function QinTombHelper.getOffsetPointRange(pointId, index)
    -- body
    local pointData = QinTombHelper.getPointCfg(pointId)
    local offsetPoint = QinTombHelper.getOffsetPoint(pointId, index)
    local b, range = QinTombHelper._decodeNums(pointData["range"])
    return QinTombHelper.getRandomRangePoint(offsetPoint, cc.size(range.x, range.y))
end


function QinTombHelper.getMidPoint(pointId, currPos)
    local pointData = QinTombHelper.getPointCfg(pointId)
    local pointValue = pointData["mid_point"]
    local offsetArray, offsetPoint = QinTombHelper._decodeNums(pointValue)
    return offsetPoint, pointValue
end

function QinTombHelper.getClickRect(pointId)
    -- body
    local pointData = QinTombHelper.getPointCfg(pointId)
    local clickRect = cc.rect(0, 0, 0, 0)
    if pointData.mid_point ~= "" and pointData.click_region ~= "" then
        local pos = QinTombHelper._decodeNums(pointData.mid_point)
        local range = QinTombHelper._decodeNums(pointData.click_region)
        clickRect = cc.rect(pos[1] - range[1] * 0.5, pos[2] - range[2] * 0.5, range[1], range[2])
    end
    return clickRect
end

--根据中间点+宽高 -》 得到随即范围点
function QinTombHelper.getRangePoint(pointId)
    -- body
    local pointData = QinTombHelper.getPointCfg(pointId)
    local a, midPoint = QinTombHelper._decodeNums(pointData["mid_point"])
    if pointData["range"] ~= "" then
        local b, range = QinTombHelper._decodeNums(pointData["range"])
        return QinTombHelper.getRandomRangePoint(midPoint, cc.size(range.x, range.y))
    end
    return cc.p(0, 0)
end


--============================================================
--逻辑处理
function QinTombHelper.convertToSmallMapPos(pos)
    -- body
    pos.x = pos.x * QinTombConst.CAMERA_SCALE_MIN
    pos.y = pos.y * QinTombConst.CAMERA_SCALE_MIN
    return pos
end

function QinTombHelper.isMonsterPoint(pointId)
    -- body
    logWarn("QinTombHelper.isMonsterPoint ")
    local qin_monster = require("app.config.qin_monster")
    for i = 1, qin_monster.length() do
        local qinMonster = qin_monster.indexOf(i)
        if qinMonster.point_id_1 == pointId or
            qinMonster.point_id_3 == pointId or
            qinMonster.point_id_4 == pointId then
            return true
        end
    end
    return false
end
function QinTombHelper.checkTeamCanMoving(team, clickPoint)
    -- body
    if team == nil then
        return false
    end
    if clickPoint == nil then
        return false
    end
    
    --点中怪物，不需要移动过去
    if QinTombHelper.isMonsterPoint(clickPoint) then
        return false
    end
    --玩家自己不是队长
    if team:isSelfTeamLead() == false then
        G_Prompt:showTip(Lang.get("qin_tomb_error3"))
        return false
    end
    --正在移动状态，缓存下来下一个目标点
    if team:getCurrState() == QinTombConst.TEAM_STATE_MOVING then
        G_UserData:getQinTomb():cacheNextKey(clickPoint)
        return false
    end
    
    --idle, hook, pk 都可以移动
    if team:getCurrState() == QinTombConst.TEAM_STATE_IDLE or
        team:getCurrState() == QinTombConst.TEAM_STATE_HOOK or
        team:getCurrState() == QinTombConst.TEAM_STATE_PK then
        return true
    end
    
    
    return false
end

function QinTombHelper.checkTeamLeaveBattle(selfTeam, clickPoint)
    if selfTeam == nil then
        return false
    end
    if clickPoint == nil then
        return false
    end
    --玩家自己不是队长
    if selfTeam:isSelfTeamLead() == false then
        G_Prompt:showTip(Lang.get("qin_tomb_error3"))
        return true
    end
    
    if selfTeam:getCurrState() == QinTombConst.TEAM_STATE_HOOK or
        selfTeam:getCurrState() == QinTombConst.TEAM_STATE_PK then
        local pathList = selfTeam:getPath()
        local currKey = pathList[#pathList]
        if currKey == clickPoint then
            G_UserData:getQinTomb():c2sGraveLeaveBattle()
            return true
        end
    end
    return false
end


--跟新自我节点在小地图上
function QinTombHelper.updateSelfNode(rootNode, selfPosX, selfPosY)
    -- body
    if rootNode == nil then
        return
    end
    
    local selfNode = rootNode:getChildByName("self_node")
    if selfNode == nil then
        selfNode = QinTombHelper.makeMiniMapSelfTeam()
        if selfNode then
            selfNode:setName("self_node")
            rootNode:addChild(selfNode, 100000)
        end
    end
    if selfNode then
        QinTombHelper.updateMiniMapSelfTeam(selfNode)
        local selfTeam = G_UserData:getQinTomb():getSelfTeam()
        if selfTeam == nil then
            return
        end
        
        local selfMidPos = selfTeam:getCurrPointKeyMidPos()
        local teamPos = QinTombHelper.convertToSmallMapPos(cc.p(selfPosX, selfPosY))
        
        --只有待机状态，移动状态才可见
        if selfTeam:getCurrState() == QinTombConst.TEAM_STATE_IDLE or
            selfTeam:getCurrState() == QinTombConst.TEAM_STATE_MOVING then
            selfNode:setVisible(true)
        else
            selfNode:setVisible(false)
        end
        selfNode:setPosition(teamPos)
    end

end

--更新目标点在小地图上
function QinTombHelper.updateTargetNode(rootNode)
    -- body
    local selfTeam = G_UserData:getQinTomb():getSelfTeam()
    if selfTeam then
        local targetNode = rootNode:getChildByName("target_node")
        if targetNode == nil then
            targetNode = cc.Node:create()
            local qizi = UIHelper.createImage({texture = Path.getQinTomb("img_qintomb_map03d")})
            local kuang = UIHelper.createImage({texture = Path.getQinTomb("img_qintomb_map03e")})
            targetNode:addChild(kuang)
            targetNode:addChild(qizi)
            targetNode:setName("target_node")
            rootNode:addChild(targetNode)
        end
        local targetPos = selfTeam:getTargetPointPos()
        if targetPos then
            targetNode:setPosition(QinTombHelper.convertToSmallMapPos(targetPos))
            targetNode:setVisible(true)
        else
            targetNode:setVisible(false)
        end
    end
end


function QinTombHelper.movingTeam(teamId, targetPoint)
    -- body
    local teamUnit = G_UserData:getQinTomb():getTeamById(teamId)
    if teamUnit then
        local currKey = teamUnit:getCurrPointKey()
        if currKey == targetPoint then
            return
        end
        local function getPathTime(path)
            -- body
            local totalTime = 0
            for i, value in ipairs(path) do
                totalTime = value.time + totalTime
            end
            return totalTime
        end
        
        dump(currKey)
        dump(targetPoint)
        local keyList, needTime = G_UserData:getQinTomb():getMovingKeyList(currKey, targetPoint)
        if keyList and #keyList > 0 then
            dump(needTime)
            G_UserData:getQinTomb():c2sGraveMove(keyList, needTime)
        --G_UserData:getQinTomb():getTest():s2cUpdateMovingGrave(1, keyList,needTime)
        end
    end
end


function QinTombHelper.makeMiniMapSelfTeam(...)
    -- body
    local targetNode = cc.Node:create()
    
    for i = 1, 3 do
        local tempNode = UIHelper.createImage({texture = Path.getQinTomb("img_qintomb_map03a")})
        tempNode:setName("teamNode" .. i)
        targetNode:addChild(tempNode)
    end
    return targetNode
end

--构建小地图队伍原点
function QinTombHelper.updateMiniMapSelfTeam(targetNode)
    -- body
    local teamUnit = G_UserData:getQinTomb():getSelfTeam()
    if teamUnit == nil then
        return nil
    end
    if targetNode == nil then
        return
    end
    
    for i = 1, 3 do
        local tempNode = targetNode:getChildByName("teamNode" .. i)
        if tempNode then
            tempNode:setVisible(false)
        end
    end
    
    local function isUserSelf(teamUserId)
        -- body
        return teamUserId == G_UserData:getBase():getId()
    end
    
    local teamUsers = teamUnit:getTeamUsers()
    for i, value in ipairs(teamUsers) do
        if isUserSelf(value.user_id) == true then
            local tempNode = targetNode:getChildByName("teamNode" .. i)
            tempNode:loadTexture(Path.getQinTomb("img_qintomb_map03a"))
            tempNode:setVisible(true)
        end
    end
    return targetNode
end

--构建小地图抢夺状态
function QinTombHelper.makeMiniMapRape(...)
    -- body
    local tempNode = UIHelper.createImage({texture = Path.getQinTomb("img_qintomb_map03F")})
    local tempNode = UIHelper.createImage({texture = Path.getQinTomb("img_qintomb_map03F")})
end

function QinTombHelper.updateMiniMapMonsterFight(rootNode)
    -- body
    local function updateMonsterFight(rootNode, monsterUnit)
        -- body
        local monsterKey = monsterUnit:getPoint_id()
        local monsterNode = rootNode:getChildByName("monster_pk" .. monsterKey)
        if monsterNode == nil then
            monsterNode = cc.Node:create()
            monsterNode:setVisible(false)
            monsterNode:setName("monster_pk" .. monsterKey)
            local miniMapPos = QinTombHelper.convertToSmallMapPos(monsterUnit:getPosition())
            monsterNode:setPosition(miniMapPos)
            rootNode:addChild(monsterNode, 0)
            G_EffectGfxMgr:createPlayGfx(monsterNode, "effect_xianqinhuangling_zhengduofaguang", nil, true)
        end
        --monsterNode:setVisible(false)
        --if monsterUnit:getBattle_team_id() > 0 then
        monsterNode:setVisible(true)
    --end
    end
    
    local monsterList = G_UserData:getQinTomb():getMonsterList()
    for i, value in ipairs(monsterList) do
        if value then
            updateMonsterFight(rootNode, value)
        end
    end

end

--构建小地图攻击状态队伍
function QinTombHelper.updateMiniMapAttackTeam(rootNode, monsterKey)
    -- body
    --判定boss是否在可是范围
    if monsterKey == nil then
        return
    end
    
    local function isUserSelf(teamUserId)
        -- body
        return teamUserId == G_UserData:getBase():getId()
    end
    
    local selfTeamId = G_UserData:getQinTomb():getSelfTeamId()
    local teamUnit = G_UserData:getQinTomb():getTeamById(selfTeamId)
    local monsterUnit = G_UserData:getQinTomb():getMonster(monsterKey)
    if monsterUnit == nil then
        return
    end
    
    --创建地图小点
    local monsterNode = rootNode:getChildByName("monster_node" .. monsterKey)
    if monsterNode == nil then
        monsterNode = cc.Node:create()
        monsterNode:setVisible(false)
        monsterNode:setName("monster_node" .. monsterKey)
        rootNode:addChild(monsterNode, 100000)
        for i = 1, 3 do
            local tempNode = UIHelper.createImage({texture = Path.getQinTomb("img_qintomb_map03c")})
            tempNode:setName("monsterOwner" .. i)
            tempNode:setVisible(false)
            monsterNode:addChild(tempNode)
        end
    
    end
    
    monsterNode:setVisible(false)
    --初始化小点
    if monsterUnit:getOwn_team_id() > 0 or monsterUnit:getBattle_team_id() > 0 then
        monsterNode:setVisible(true)
        for i = 1, 3 do
            local tempNode = monsterNode:getChildByName("monsterOwner" .. i)
            tempNode:setVisible(false)
        end
    end
    
    --挂机队伍小红点
    if monsterUnit:getOwn_team_id() > 0 then
        
        local function updateNode(index, imageName)
            local tempNode = monsterNode:getChildByName("monsterOwner" .. index)
            tempNode:loadTexture(Path.getQinTomb(imageName))
            tempNode:setPosition(QinTombHelper.convertToSmallMapPos(monsterUnit:getPosition()))
            tempNode:setVisible(true)
        end
        local ownUnit = G_UserData:getQinTomb():getTeamById(monsterUnit:getOwn_team_id())
        if monsterUnit:getOwn_team_id() == selfTeamId then
            for i, value in ipairs(ownUnit:getTeamUsers()) do
                if isUserSelf(value.user_id) == true then
                    updateNode(i, "img_qintomb_map03a")
                end
            end
        end
    end
end


--玩家在idle状态，并且在boss可攻击站台上
function QinTombHelper.checkMyTeamInBossPoint(bossId)
    -- body
    local selfTeamId = G_UserData:getQinTomb():getSelfTeamId()
    local teamUnit = G_UserData:getQinTomb():getTeamById(selfTeamId)
    if teamUnit == nil then
        return false
    end
    
    local currKey = teamUnit:getCurrPointKey()
    local monsterUnit = G_UserData:getQinTomb():getMonster(bossId)
    if currKey and monsterUnit:getConfig().point_id_2 == currKey then
        return true
    end
    return false
end



function QinTombHelper.getPlayerColor(userId, teamId)
    -- body
    local selfTeam = G_UserData:getQinTomb():getSelfTeam()
    if selfTeam == nil then
        return Colors.getColor(6)
    end
    
    local selfTeamId = selfTeam:getTeamId()
    
    if userId == G_UserData:getBase():getId() then
        return Colors.getColor(2)
    end
    if selfTeamId == teamId then
        return Colors.getColor(3)
    end
    
    local battelTeamId = selfTeam:getBatteTeamId()
    if battelTeamId > 0 and battelTeamId == teamId then
        return Colors.getColor(6)
    end
    
    return Colors.getColor(6)
end


function QinTombHelper.checkAttackMonster(pointKey)
    -- body
    local retFunc = function(...)
        G_Prompt:showTip(Lang.get("qin_tomb_error1"))
    end
    
    local selfTeamId = G_UserData:getQinTomb():getSelfTeamId()
    local teamUnit = G_UserData:getQinTomb():getTeamById(selfTeamId)
    if teamUnit == nil then
        return false
    end
    
    local monsterUnit = G_UserData:getQinTomb():getMonster(pointKey)
    
    --玩家自己不是队长
    if teamUnit:isSelfTeamLead() == false then
        retFunc = function(...)
            G_Prompt:showTip(Lang.get("qin_tomb_error3"))
        end
        return false, retFunc
    end
    
    
    if QinTombHelper.checkMyTeamInBossPoint(pointKey) then
        if monsterUnit:getOwn_team_id() == 0 or monsterUnit:getBattle_team_id() == 0 then
            return true
        end
        retFunc = function(...)
            G_Prompt:showTip(Lang.get("qin_tomb_error2"))
        end
    end
    return false, retFunc
end

function QinTombHelper.getOpenTime(openTime)
    -- body
    local hour = math.floor(openTime / 3600)
    local min = math.floor((openTime - hour * 3600) / 60)
    if min == 0 then
        min = "00"
    end
    return hour, min
end
--获取秦皇陵外部icon的文字
function QinTombHelper.getOpeningTable()
    -- body
    local retTable = {
        show = false,
        showEffect = false,
        countDown = nil,
        labelStr = "",
        isFighting = false,
        isInTeam = false,
    }
    local qinCfg = require("app.config.qin_info").get(1)
    local openTime = tonumber(qinCfg.open_time)
    local closeTime = tonumber(qinCfg.close_time)
    local time = G_ServerTime:getTodaySeconds()
    if time > closeTime then
        local hour = QinTombHelper.getOpenTime(openTime)
        retTable.show = true
        retTable.labelStr = Lang.get("season_maintime_tomorrow", {time = hour})
        return retTable
    end
    
    retTable.show = true
    if time < openTime then
        local leftTime = openTime - time
        retTable.refreshTime = leftTime + G_ServerTime:getTime()
        if leftTime <= 900 then --15分钟倒计时
            retTable.countDown = leftTime + G_ServerTime:getTime()
            return retTable
        end
        local hour = math.floor(openTime / 3600)
        local min = math.floor((openTime - hour * 3600) / 60)
        if min == 0 then
            min = "00"
        end
        
        local timeStr = Lang.get("hour_min", {hour = hour, min = min})
        retTable.labelStr = Lang.get("qin_tomb_open", {time = timeStr})
        return retTable --xx时开启
    end
    if G_UserData:getQinTomb():isQinOpen() then
        local leftTime = closeTime - time
        retTable.refreshTime = leftTime + G_ServerTime:getTime()
        retTable.showEffect = true
        if G_UserData:getGroups():getMyGroupData() then --在队伍里
            retTable.labelStr = "" --Lang.get("qin_tomb_in_group")
            retTable.isInTeam = true
            return retTable
        else
            retTable.labelStr = "" --Lang.get("qin_fighting")
            retTable.isFighting = true
            return retTable
        end
    end
    return retTable
end

return QinTombHelper
