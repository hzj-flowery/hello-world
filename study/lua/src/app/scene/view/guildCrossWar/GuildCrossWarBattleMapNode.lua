local ViewBase = require("app.ui.ViewBase")
local GuildCrossWarBattleMapNode = class("GuildCrossWarBattleMapNode", ViewBase)
local BigImagesNode = require("app.utils.BigImagesNode")
local GuildCrossWarAvatar = import(".GuildCrossWarAvatar")
local GuildCrossWarBosssAvatar = import(".GuildCrossWarBosssAvatar")
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
local GuildCrossWarHelper = import(".GuildCrossWarHelper")
local GuildWarNoticeNode = require("app.scene.view.guildwarbattle.GuildWarNoticeNode")
local GuildCrossWarRebornCDNode = import(".GuildCrossWarRebornCDNode")
local GuildCrossWarGuildRank = import(".GuildCrossWarGuildRank")
local GuildCrossWarMiniMap = import(".GuildCrossWarMiniMap")
local BullectScreenConst = require("app.const.BullectScreenConst")
local EnemyListView = import(".EnemyListView")
local CityNode = import(".CityNode")
local ChamptionAvatar = import(".ChamptionAvatar")
local ObserveView = import(".ObserveView")
local CampNode = require("app.scene.view.guildCrossWar.CampNode")
local warringHurtHP = import(".warringHurtHP")
local WarringLeftPanel = import(".WarringLeftPanel")
local WarringRightPanel = import(".WarringRightPanel")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local RedPointHelper = require("app.data.RedPointHelper")


GuildCrossWarBattleMapNode.CAMERA_SPEED = 2200
GuildCrossWarBattleMapNode.USER_KEY   = "userId_"
GuildCrossWarBattleMapNode.BOSS_KEY   = "bossId_"
GuildCrossWarBattleMapNode.CITY_KEY   = "cityId_"
function GuildCrossWarBattleMapNode:ctor()
    self._scrollView    = nil
    self._panelTouch    = nil
    self._centerNode    = nil
    self._guildRankNode = nil
    self._enemyNode     = nil
    self._tipsParentNode= nil
    self._fightNotice   = nil
    self._guildRank     = nil
    self._countDownHandler  = nil
    self._observeDownHandler= nil
    self._observeDelayHandler= nil
    self._isBulletOpen = true

    self._updateUserListRc = 0
    self._isLockUpdate     = false
    self._isExchangeRole   = false
    self._isPlayingWarring = false
    self._isNeedReborn     = false
    self._isRebornAtk      = false
    self._cacheMessage     = {}

    self._champCellNums = 0
    self._enemyView     = nil
    self._avatarUserMap = {}
    self._avatarBossMap = {}
    self._cityNodeMap   = {}
    self._observerMap   = {}
    self._campMap       = {}
    self._cityNodes     = {}

    local resource = {
        file = Path.getCSB("GuildCrossWarBattleMapNode", "guildCrossWar"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            _btnReport = {
                events = {{event = "touch", method = "_onBtnReport"}}
            },
        }
    }
    GuildCrossWarBattleMapNode.super.ctor(self, resource)
end

function GuildCrossWarBattleMapNode:onCreate()
    local region = GuildCrossWarHelper.getCurActStage()
    self._panelChamp:setVisible(region.stage == 4)
    if region.stage == 4 then
        self._imageTop:setVisible(false)
        self._panelChamp:setLocalZOrder(100)
        self._guildRankNode:setLocalZOrder(101)
    end

    self._imageSpire:setVisible(false)
    self:_createMap()
    self:_initDanmu()
    self:_initInspireSupport()
    self:_registerListenerTouchScroll()

    local _, bJoin = GuildCrossWarHelper.isGuildCrossWarEntry()
    self._btnReport:setVisible(bJoin)
    self._btnReport:updateUI(FunctionConst.FUNC_GUILD_CROSS_REWARDRANK)
    self._panelTouch:setVisible(false)
    self._fightNotice = GuildWarNoticeNode.new(2)
    self._tipsParentNode:addChild(self._fightNotice)

    self._guildRank  = GuildCrossWarGuildRank.new()
    self._guildRankNode:addChild(self._guildRank)
    self._enemyView  = EnemyListView.new(handler(self, self._attackPerson))
    self._enemyNode:addChild(self._enemyView)
    self._miniMapNode = GuildCrossWarMiniMap.new(function(isOpenSmall)
        -- body
        if isOpenSmall then
            self._miniMapNode:updateSelfGuildNumber(self:_getUserList())
        end
    end)
    self._miniNode:addChild(self._miniMapNode)

    self._rebornCDNode = GuildCrossWarRebornCDNode.new()
    self._rebornCDNode:setVisible(false)
    self._nodeRebornCD:addChild(self._rebornCDNode)

    self:makeClickRect()
    self._panelDesign:setSwallowTouches(false)
    self:initExtraNode()

    -- Chamption
    self._scrollChamp:setScrollBarEnabled(false)
	self._scrollChamp:addEventListener(handler(self,self._scrollEventCallback))
end


function GuildCrossWarBattleMapNode:initExtraNode( ... )
    -- Observer
    self._imageObserve:setVisible(false)
    self._observePanel:setVisible(false)
    self._warringBack:setVisible(false)
    self._warringBack:setSwallowTouches(true)
end

function GuildCrossWarBattleMapNode:_registerListenerTouchScroll()
    local listener = cc.EventListenerTouchOneByOne:create()
	listener:setSwallowTouches(false)
	listener:registerScriptHandler(handler(self, self._onTouchBeganEvent), cc.Handler.EVENT_TOUCH_BEGAN)
	listener:registerScriptHandler(handler(self, self._onTouchMoveEvent), cc.Handler.EVENT_TOUCH_MOVED)
	listener:registerScriptHandler(handler(self, self._onTouchEndEvent), cc.Handler.EVENT_TOUCH_ENDED)
	cc.Director:getInstance():getEventDispatcher():addEventListenerWithSceneGraphPriority(listener, self._scrollView)
end

function GuildCrossWarBattleMapNode:_onBtnReport()
    local stage,_ = GuildCrossWarHelper.getCurCrossWarStage()
    if GuildCrossWarConst.ACTIVITY_STAGE_2 ~= stage then
        G_Prompt:showTip(Lang.get("guild_cross_war_fighting_notopen"))
        return
    end
    G_SceneManager:showDialog("app.scene.view.guildCrossWar.PopupGuildCrossWarRank")
end

function GuildCrossWarBattleMapNode:_onTouchBeganEvent(touch, event)
    local selfUnit = G_UserData:getGuildCrossWar():getSelfUnit()
    if selfUnit == nil then
        return
    end

    local selfAvatar = self:_getOwnAvatar()
    if selfAvatar == nil then
        return
    end

    if state == ccui.TouchEventType.ended or not state then
        if G_ServerTime:getLeftSeconds(selfUnit:getMove_cd()) > 0 or selfAvatar:checkMoving() then
            return
        end

        local innerContainer = self._scrollView:getInnerContainer()
        local endPos = innerContainer:convertToNodeSpace(touch:getLocation())
        local gridX = math.ceil(endPos.x/GuildCrossWarConst.GRID_SIZE )
        local gridY = math.ceil(endPos.y/GuildCrossWarConst.GRID_SIZE )
        local grid = GuildCrossWarHelper.getWarMapCfgByGrid(gridX, gridY)
        if grid == nil or GuildCrossWarHelper.isExistBoss(grid.id) then
            return
        end

        if grid.id == selfUnit:getCurGrid() then
            return
        end

        if grid.point_y > 0 and grid.point_y < 17 then
            if grid.point_y ~= G_UserData:getGuildCrossWar():getSelfOriPoint() then
                return
            end  
        end

        ------------------------------------------------------------------
        local actState, __ = GuildCrossWarHelper.getCurCrossWarStage()
        if actState == GuildCrossWarConst.ACTIVITY_STAGE_1 then
            G_Prompt:showTip(Lang.get("guild_cross_war_cannotmove"))
            return
        end

        local path = GuildCrossWarHelper.getFindingpath(selfUnit:getCurGrid(), grid.id)
        if selfUnit:checkCanMoving(grid, path) then
            local needTime = selfUnit:getNeedTime(path)
            G_UserData:getGuildCrossWar():c2sBrawlGuildsMove({key_point_id = grid.point_y, pos = grid.id}, needTime)
        end
    end
end

function GuildCrossWarBattleMapNode:_onTouchMoveEvent(touch,event)
end

function GuildCrossWarBattleMapNode:_onTouchEndEvent(touch,event)
end

function GuildCrossWarBattleMapNode:onEnter()
    self._signalEnter       = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_ENTRY, handler(self, self._onEventEnter))             -- 进入
    self._signalSelfMove    = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_SELFMOVE, handler(self, self._onEventSelfMove))       -- 移动
    self._signalUpdateUser  = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_UPDATEPLAYER, handler(self, self._onEventUpdateUser)) -- 更新用户
    self._signalUpdatePoint = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_UPDATEPOINT, handler(self, self._onEventUpdatePoint)) -- 更新据点
    self._signalFight       = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_FIGHT, handler(self, self._onEventFight))             -- 战斗
    self._signalFightNotice = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_OTHER_SEE_BOSSS, handler(self, self._onEventFightNotice)) -- 据点其他玩家打Boss推送
    self._signalFightSelfDie = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_SELFDIE, handler(self, self._onEventFightSelfDie))   -- 自挂
    self._signalFightOtherDie= G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_OTHERDIE, handler(self, self._onEventFightOtherDie)) -- 他挂
    self._signalObserve     = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_OBSERVE, handler(self, self._onEventObserve))         -- 观战
    self._signalWarring     = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_WARRING, handler(self, self._onEventWarring))         -- 对战
    self._signalShowInspire = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_INSPIRE, handler(self, self._onEventShowInspire))     -- 鼓舞支援
    self._signalShowChamp   = G_SignalManager:add(SignalConst.EVENT_GUILDCROSS_WAR_CHAMPTION, handler(self, self._onEventShowChamp))     -- 冠军成员展示
    
    self:_releaseMap()
    self:_updateObserve()
    self:_updateCityList()
    self:_updateUserList(true)
    self:_updateBossList()
    self:_updateActTime()
    self:_isPopupSmallView()
    self:_updateMiniCamera()
    self._rebornCDNode:updateVisible()

    if self._isBulletOpen then
        G_BulletScreenManager:setBulletScreenOpen(BullectScreenConst.GUILDCROSSWAR_TYPE,true)
    end
end

function GuildCrossWarBattleMapNode:onExit()
    self:_endSchedule()
    self:_endObverveSchedule()
    self:_endDelay()
    self._signalEnter:remove()
    self._signalEnter = nil
    self._signalSelfMove:remove()
    self._signalSelfMove = nil
    self._signalUpdateUser:remove()
    self._signalUpdateUser = nil
    self._signalUpdatePoint:remove()
    self._signalUpdatePoint = nil
    self._signalFight:remove()
    self._signalFight = nil
    self._signalFightNotice:remove()
    self._signalFightNotice = nil
    self._signalFightSelfDie:remove()
    self._signalFightSelfDie = nil
    self._signalFightOtherDie:remove()
    self._signalFightOtherDie = nil
    self._signalObserve:remove()
    self._signalObserve = nil
    self._signalWarring:remove()
    self._signalWarring = nil
    self._signalShowInspire:remove()
    self._signalShowInspire = nil
    self._signalShowChamp:remove()
    self._signalShowChamp = nil
    
    local runningScene = G_SceneManager:getTopScene()
	if runningScene and runningScene:getName() ~= "fight" then
        G_BulletScreenManager:clearBulletLayer()
    end
end

function GuildCrossWarBattleMapNode:_initDanmu()
    self._danmuPanel = self._commonChat:getPanelDanmu()
	self._danmuPanel:addClickEventListenerEx(handler(self,self._onBtnDanmu))
    self._danmuPanel:setVisible(true)
    G_BulletScreenManager:setBulletScreenOpen(BullectScreenConst.GUILDCROSSWAR_TYPE,true)
    self:_updateBulletScreenBtn(BullectScreenConst.GUILDCROSSWAR_TYPE)
end

function GuildCrossWarBattleMapNode:_onBtnDanmu()
	local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(BullectScreenConst.GUILDCROSSWAR_TYPE)
	G_UserData:getBulletScreen():setBulletScreenOpen(BullectScreenConst.GUILDCROSSWAR_TYPE, not bulletOpen)
	self:_updateBulletScreenBtn(BullectScreenConst.GUILDCROSSWAR_TYPE)
end

function GuildCrossWarBattleMapNode:_updateBulletScreenBtn(bulletType)
	self._danmuPanel:getSubNodeByName("Node_1"):setVisible(false)
	self._danmuPanel:getSubNodeByName("Node_2"):setVisible(false)
    local bulletOpen = G_UserData:getBulletScreen():isBulletScreenOpen(bulletType)
    
	if bulletOpen == true then
		self._danmuPanel:getSubNodeByName("Node_1"):setVisible(true)
		G_BulletScreenManager:showBulletLayer()
		self._isBulletOpen = true
	else
		self._danmuPanel:getSubNodeByName("Node_2"):setVisible(true)
		G_BulletScreenManager:hideBulletLayer()
		self._isBulletOpen = false
	end
end

function GuildCrossWarBattleMapNode:_createMap()
    local spriteMap = BigImagesNode.new(Path.getStageGuildCross("guild_cross_stage"))
    local spriteSize = spriteMap:getContentSize()
    spriteMap:setAnchorPoint(cc.p(0, 0))
    spriteMap:setPosition(cc.p(0, 0))
    self._scrollView:addChild(spriteMap)
    self._scrollView:setInnerContainerSize(spriteSize)
    self._scrollView:setContentSize(G_ResolutionManager:getDesignCCSize())
end

function GuildCrossWarBattleMapNode:_releaseMap()
    for key, value in pairs(self._avatarUserMap) do
        self:_releaseUserAvatar(key)
    end

    for key, value in pairs(self._avatarBossMap) do
        self:_releaseBossAvatar(key)
    end

    for key, value in pairs(self._cityNodeMap) do
        self:_releaseCityNode(key)
    end
end

-- @Role    Release UserAvatar
function GuildCrossWarBattleMapNode:_releaseUserAvatar(userId)
    local avatarUser = self._avatarUserMap[userId]
    if avatarUser then
        avatarUser:removeFromParent()
        self._avatarUserMap[userId] = nil
    end
end

-- @Role    Release BossAvatar
function GuildCrossWarBattleMapNode:_releaseBossAvatar(pointId)
    local avatarBoss = self._avatarBossMap[pointId]
    if avatarBoss then
        avatarBoss:removeFromParent()
        avatarBoss = nil
        self._avatarBossMap[pointId] = nil
    end
end

-- @Role    Release City
function GuildCrossWarBattleMapNode:_releaseCityNode(pointId)
    local cityNode = self._cityNodeMap[pointId]
    if cityNode then
        cityNode:removeFromParent()
        self._cityNodeMap[pointId] = nil
    end
end

--@Role     IsExistModelFree（暂保留）
function GuildCrossWarBattleMapNode:_isExistModelFree(isOnlyShowName)
    local avatarNode = {}
    local isNeedCreate = false

    for k,value in pairs(self._avatarUserMap) do
        if not self._avatarUserMap[k]:isSelf() then

            if not isOnlyShowName  then -- 1.需模型：先找空闲节点有模型的/否则空闲节点中创建
                if value:isModelCreated() and not value:isModelOccupied() then
                    return value, false
                elseif not value:isVisible() and not value:isModelCreated() then
                    avatarNode = value
                    isNeedCreate = true
                end
            else                        -- 2.无需模型：找空闲节点无模型
                if not value:isVisible() and not value:isModelCreated() then
                    return value, false
                end
            end
        end
    end
    return avatarNode, isNeedCreate
end

-- @Role    Create UserAvatar
function GuildCrossWarBattleMapNode:_createUserAvatar(userId, isOnlyShowName, isMoveBeforePos) 
    local avatar = GuildCrossWarAvatar.new(userId)
    avatar:updateUI(isOnlyShowName, isMoveBeforePos)
    avatar:setName(GuildCrossWarBattleMapNode.USER_KEY ..userId)
    self._scrollView:addChild(avatar, 10001)
    self._avatarUserMap[userId] = avatar
    return avatar
end

-- @Role    Create BossAvatar
function GuildCrossWarBattleMapNode:_createBossAvatar(pointId)
    local avatar = GuildCrossWarBosssAvatar.new(pointId)
    avatar:updateUI()
    avatar:setName(GuildCrossWarBattleMapNode.BOSS_KEY ..pointId)
    self._scrollView:addChild(avatar, 1000000)
    self._avatarBossMap[pointId] = avatar
    return avatar
end

-- @Role    Create CityNode
function GuildCrossWarBattleMapNode:_createCityNode(pointId, picture)
    local city = CityNode.new(pointId)
    city:updateUI(picture)
    city:setName(GuildCrossWarBattleMapNode.CITY_KEY ..pointId)
    self._scrollView:addChild(city, 10001)
    self._cityNodeMap[pointId] = city
    return city
end

------------------------------------------------------------------------------------------------
-- @Role    Update Occupied-City
function GuildCrossWarBattleMapNode:_updateGuildFlag(pointData, key, value)
    local pointOccupied = self["_imageSpire"]:getChildByName("guildFlag" ..key)
    if pointOccupied == nil then
        pointOccupied = GuildCrossWarHelper.createGuildFlag(key)
        pointOccupied:setName("guildFlag" ..key)
        pointOccupied:setPosition(cc.p(pointData.flag_x, 
                                        pointData.flag_y))
        self["_imageSpire"]:addChild(pointOccupied, 10000)
    end

    if value:getGuild_id() > 0 and value:getGuild_name() ~= "" then
        pointOccupied:setVisible(true)
    else
        pointOccupied:setVisible(false)
    end

    GuildCrossWarHelper.updateGuildFlag(pointOccupied, key, value)
    GuildCrossWarHelper.updateGuildName(pointOccupied, key, value)
    GuildCrossWarHelper.updateServerName(pointOccupied, key, value)
end

-- @Role    Is Show
function GuildCrossWarBattleMapNode:isPopSmall( ... )
    if self._imageSpire:isVisible() then
        self._imageSpire:setVisible(false)
        self["_btnSpire"]:setGlobalZOrder(0)
        self["_btnSupport"]:setGlobalZOrder(0)
        return true
    else
        return false
    end
end

-- @Role    Create Camp 
function GuildCrossWarBattleMapNode:_createCamp(pointMap, i)
    -- body
    if pointMap[i] and rawequal(pointMap[i]:getGuild_id(), 0) then
        local pointData = GuildCrossWarHelper.getWarCfg(i)
        self._campMap[i] = CampNode.new(i)
        self._campMap[i]:setPosition(cc.p(pointData.flag_x, 
                                    pointData.flag_y))
        self._imageSpire:addChild(self._campMap[i], 10000)
    end
end

-- @Role    Create Camp 
function GuildCrossWarBattleMapNode:_checkCreateCamption(pointMap)
    -- body
    local stageInfo = GuildCrossWarHelper.getCurActStage()
    if stageInfo and stageInfo.stage == 1 then
        for i=1, 16 do
            self:_createCamp(pointMap, i)
        end
    end
end

-- @Role    Update Cantonment
function GuildCrossWarBattleMapNode:_updateCantonment( ... )
    local function isCamped(pointMap)
        -- body
        for k, value in pairs(pointMap) do
            if rawequal(value:getGuild_id(), G_UserData:getGuild():getMyGuildId()) then
                return true
            end
        end
        return false
    end

    local pointMap = G_UserData:getGuildCrossWar():getCityMap()
    for i=1, 16 do
        if self._campMap[i] then
            self._campMap[i]:removeFromParent()
            self._campMap[i] = nil
        end
    end

    if not isCamped(pointMap) then
        self:_checkCreateCamption(pointMap)
    end

    for key, value in pairs(pointMap) do
        local pointData = GuildCrossWarHelper.getWarCfg(key)
        self:_updateGuildFlag(pointData, key, value)
    end
end

-- @Role    Pop inspire/support
function GuildCrossWarBattleMapNode:_isPopupSmallView( ... )
    if G_UserData:getGuildCrossWar():isPopSmall() then
        self:_gotoPointCenter(true, function( ... )
            self["_imageSpire"]:setVisible(true)
            self["_btnSpire"]:setGlobalZOrder(1)
            self["_btnSupport"]:setGlobalZOrder(1)
            self:_updateCantonment()
        end)
    else
        self["_btnSpire"]:setGlobalZOrder(0)
        self["_btnSupport"]:setGlobalZOrder(0)
        self:_gotoPointCenter(true)
    end
end

-- @Role    Get  CameraPos
function GuildCrossWarBattleMapNode:_getCameraPos()
    local innerContainer = self._scrollView:getInnerContainer()
    return cc.p(innerContainer:getPosition()), self._scrollView:getContentSize()
end

-- @Role    Get  Userlist
function GuildCrossWarBattleMapNode:_getUserList()
    local selfGuilNumber = {}
    for k,v in pairs(self._avatarUserMap) do
        if type(self._avatarUserMap[k]) == "userdata" and self._avatarUserMap[k]:isSelfGuild() then
            if not self._avatarUserMap[k]:isSelf() then
                if not selfGuilNumber[k] then
                    selfGuilNumber[k] = {}
                end
                selfGuilNumber[k] = self._avatarUserMap[k]
            end
        end
    end

    return selfGuilNumber
end

-- @Role    Move Center Camera action
function GuildCrossWarBattleMapNode:_moveCameraAction(path)
    -- body
    local curveConfigList = path.curLine
    local totalTime = (path.totalTime * 1000)
    local endTime = (G_ServerTime:getMSTime() + path.totalTime * 1000)
    
    local function movingEnd(...)
        self:_loopFollowing()
    end
    local function moveCallback(newPos, oldPos)
        if type(newPos) == "table" and table.nums(newPos) == 2 then
            local scrollX, scrollY = self:_cameraPosConvert(newPos.x, newPos.y)
            scrollX, scrollY = math.floor(scrollX), math.floor(scrollY)
            local innerContainer = self._scrollView:getInnerContainer()
            innerContainer:setPosition(scrollX, scrollY)
        end
    end
    
    local CurveHelper = require("app.scene.view.guildCrossWar.CurveHelper")
    CurveHelper.doCurveMove(self._centerNode,
        movingEnd, nil,
        moveCallback,
        curveConfigList,
        totalTime,
        endTime)
end

-- @Role    Goto Center
function GuildCrossWarBattleMapNode:_gotoPointCenter(isFirstEnter, callBack)
    local function cameraTo(pos)
        local hoelCenter = GuildCrossWarHelper.getWarMapGridCenter(pos)
        if hoelCenter == nil then
            return
        end

        local scrollX, scrollY = self:_cameraPosConvert(hoelCenter.x, hoelCenter.y)
        if isFirstEnter then
            local innerContainer = self._scrollView:getInnerContainer()
            innerContainer:stopAllActions()
            innerContainer:setPosition(scrollX, scrollY)
        else
            self:_cameraMoveToPos(scrollX, scrollY)
        end
    end


    isFirstEnter = isFirstEnter or false
    local selfUnit = G_UserData:getGuildCrossWar():getSelfUnit()
    if selfUnit == nil then
        cameraTo(GuildCrossWarConst.DEFAULT_CARAME_POS)
        if callBack then
            callBack()
        end
        return
    end
    
    local pointHole = selfUnit:getCurPointHole()
    if pointHole == nil or pointHole.pos == nil then
        return
    end
    cameraTo(pointHole.pos)
    if callBack then
        callBack()
    end
end

-------------------------------------------------------------------------------------
-- @Role    Own Avatar
function GuildCrossWarBattleMapNode:_getOwnAvatar()
    local mySelfId = G_UserData:getGuildCrossWar():getSelfUserId()
    if mySelfId and mySelfId > 0 then
        return self._avatarUserMap[mySelfId]
    end
    return nil
end

-- @Role    City
function GuildCrossWarBattleMapNode:_getCity(pointId)
    if pointId and pointId > 0 then
        return self._cityNodeMap[pointId]
    end
    return nil
end

-- @Role    User's Avatar
function GuildCrossWarBattleMapNode:_getUserAvatar(userId)
    if userId and userId > 0 then
        return self._avatarUserMap[userId]
    end
    return nil
end

-- @Role    Boss's Avatar
function GuildCrossWarBattleMapNode:_getBossvatar(pointId)
    if pointId and pointId > 0 then
        return self._avatarBossMap[pointId]
    end
    return nil
end

-- @Role    Set Boss's Avatar
function GuildCrossWarBattleMapNode:_setBossvatar(pointId)
    if pointId == nil or pointId <= 0 then
        return
    end

    local bossAvatar = self:_getBossvatar(pointId)
    if bossAvatar ~= nil then
        bossAvatar:updateUI(function( ... )
            -- body
            bossAvatar:removeFromParent()
            bossAvatar = nil
            self._avatarBossMap[pointId] = nil
        end)
    end
end

-- @Role    Get Self‘s Positioin
function GuildCrossWarBattleMapNode:_getSelfPosition()
    local userAvatar = self:_getOwnAvatar()
    if userAvatar == nil then
        return
    end
    return userAvatar:getPosition()
end

-- @Role    Check CityNode & Create
function GuildCrossWarBattleMapNode:_checkCreateCity(id, picture)
    local cityNode = self:_getCity(id)
    if cityNode == nil then
        cityNode = self:_createCityNode(id, picture)
    end
    return cityNode
end

-- @Role    Check BossAvatar & Create
function GuildCrossWarBattleMapNode:_checkCreateBossAvatar(id)
    local bossAvatar = self:_getBossvatar(id)
    if bossAvatar == nil then
        bossAvatar = self:_createBossAvatar(id)
    end
    return bossAvatar
end 

-- @Role    Check UserAvatar & Create
function GuildCrossWarBattleMapNode:_checkCreateUserAvatar(userId, isOnlyShowName, isMoveBeforePos, isntChange)
    local userAvatar = self:_getUserAvatar(userId)
    if type(userAvatar) ~= "userdata" then
        userAvatar = self:_createUserAvatar(userId, isOnlyShowName, isMoveBeforePos)
    end
    return userAvatar
end

-- @Role    Update The Grid's UserAvatarList
function GuildCrossWarBattleMapNode:_isNeedCreateAvatar(holeMap, unitData)
    -- body
    local holeKey = ("hole"..unitData:getCurGrid())
    if not holeMap[holeKey] then
        holeMap[holeKey] = 0
    end

    holeMap[holeKey] = unitData:isSelf() and holeMap[holeKey] or (holeMap[holeKey] + 1)
    local isVisible = (unitData:isSelf() or holeMap[holeKey] <= 1)
    return isVisible
end

-- @Role    Render
function GuildCrossWarBattleMapNode:_RenderAvatar(holeMap, value, uid, isChangeRole)
    -- body
    if self:_isNeedCreateAvatar(holeMap, value) then
        local userAvatar = self:_checkCreateUserAvatar(uid)
        if type(userAvatar) == "userdata" then

            if not userAvatar:isModelCreated() then
                userAvatar:updateUI()
            end
            userAvatar:updateAvatarHp(false, isChangeRole)
            userAvatar:setVisible(true)
            userAvatar:setRoleVisible(true)
            userAvatar:setNameVisible(true)
            if not userAvatar:isSelf() and not userAvatar:checkMoving() then
                userAvatar:synServerPos()
            end
        end
    else
        local userAvatar = self:_checkCreateUserAvatar(uid, true, false, true)
        if type(userAvatar) == "userdata" then
            userAvatar:removeAvatar()
            userAvatar:setVisible(true)
            userAvatar:setRoleVisible(false)
            userAvatar:setNameVisible(true)
        end

        if userAvatar and not userAvatar:checkMoving() then
            userAvatar:synServerPos()
        end
    end
end

-- @Role    Update UserAvatarList
function GuildCrossWarBattleMapNode:_updateUserList(isChangeRole)
    local selfUnit = G_UserData:getGuildCrossWar():getSelfUnit()
    if not selfUnit then
        return
    end

    self._updateUserListRc = (self._updateUserListRc + 1)
    local selfAvatar = self:_getOwnAvatar()
    if selfAvatar and selfAvatar:checkMoving() then
        self._isExchangeRole = isChangeRole
        return
    end

    if self._updateUserListRc > 1 then
        self._isExchangeRole = isChangeRole
        return
    end
    
    local function releaseAndCleanUpAvatar(uid)
        self._avatarUserMap[uid]:removeAvatar()
        self._avatarUserMap[uid]:setVisible(false)
    end

    self._isLockUpdate = true
    local holeMap = {}
    local selfAroundGrids = selfUnit:getVisibleScreenGrid()
    local userList = G_UserData:getGuildCrossWar():getUserMap()

    for k, value in pairs(userList) do
        if value ~= nil then
            local uid = value:getUid()
            if not selfAroundGrids["K" ..value:getCurGrid()] then
                local avatar = self:_getUserAvatar(uid)
                if type(avatar) == "userdata" and avatar:isVisible() then
                    releaseAndCleanUpAvatar(uid)
                end

            elseif not GuildCrossWarHelper.isExitCurAround(uid) and not value:isSelf() then
                local avatar = self:_getUserAvatar(uid)
                if type(avatar) == "userdata" then
                    releaseAndCleanUpAvatar(uid)
                end
            else

                self:_RenderAvatar(holeMap, value, uid, isChangeRole)
            end
        end
    end

    self._isLockUpdate = false
    self._updateUserListRc = (self._updateUserListRc - 1)
end

-- @Role    Update BossList
function GuildCrossWarBattleMapNode:_updateBossList()
    local bossList = G_UserData:getGuildCrossWar():getBossMap()
    for k,v in pairs(bossList) do
        if v:isIs_kill() then
            self:_setBossvatar(v:getId())
        else
            local bossAvatar = self:_checkCreateBossAvatar(v:getId())
            bossAvatar:updateUI()       
        end
    end
end

-- @Role    Update CityList
function GuildCrossWarBattleMapNode:_updateCityList()
    local cityList = G_UserData:getGuildCrossWar():getWarKeyMap()
    for key, value in pairs(cityList) do
        if value and value.cityPicture ~= "" then
            local cityNode = self:_checkCreateCity(value.cfg.id, value.cityPicture)
            cityNode:updatePossession()
        end
    end
end

function GuildCrossWarBattleMapNode:_startObserve()
    self:_endObverveSchedule()
    self._observeDownHandler = SchedulerHelper.newScheduleOnce(function()
        G_UserData:getGuildCrossWar():c2sBrawlGuildsObserve()
    end, 5.0)
end

function GuildCrossWarBattleMapNode:_endObverveSchedule()
    if self._observeDownHandler then
        SchedulerHelper.cancelSchedule(self._observeDownHandler)
        self._observeDownHandler = nil
    end
end

function GuildCrossWarBattleMapNode:_startDelay()
    self:_endDelay()
    self._observeDelayHandler = SchedulerHelper.newScheduleOnce(function()
        G_UserData:getGuildCrossWar():c2sBrawlGuildsPushChampion()
    end, 2.0)
end

function GuildCrossWarBattleMapNode:_endDelay()
    if self._observeDelayHandler then
        SchedulerHelper.cancelSchedule(self._observeDelayHandler)
        self._observeDelayHandler = nil
    end
end

-- @Role    Update Cur's Act time
function GuildCrossWarBattleMapNode:_updateActTime()
    local AudioConst = require("app.const.AudioConst")
    local function changeMusic(stage)
        if stage == 3 then
            G_AudioManager:playMusicWithId(AudioConst.SOUND_GUILDCROSSWAR_FIGHT)
        else
            G_AudioManager:playMusicWithId(AudioConst.SOUND_GUILDCROSSWAR_WAITINGFIGHT)
        end
    end

    
    local region = GuildCrossWarHelper.getCurActStage()
    if region.stage == 5 or region.endTime == 0 then
        return
    elseif region.stage == 4 then
        G_UserData:getGuildCrossWar():c2sBrawlGuildsPushChampion()
    end
    changeMusic(region.stage)

    local function endCallback()
        self:_initInspireSupport()
        local region = GuildCrossWarHelper.getCurActStage()
        if region.stage == 5 then
            G_SignalManager:dispatch(SignalConst.EVENT_GUILDCROSS_WAR_EXIT)
        elseif region.endTime ~= 0 then
            self._commonCountDown:startCountDown(region.desc, region.endTime)
            if region.stage == 3 then
                self:isPopSmall()
                local _, bJoin = GuildCrossWarHelper.isGuildCrossWarEntry()
                if bJoin then
                    G_UserData:getGuildCrossWar():c2sBrawlGuildsEntry()
                else
                    self:_startObserve()
                end
            elseif region.stage == 4 then
                self:_startDelay()
            end
        end
        changeMusic(region.stage)
    end

    self._commonCountDown:setCountdownTimeParam({color = Colors.WHITE, outlineColor = Colors.DEFAULT_OUTLINE_COLOR})
    self._commonCountDown:startCountDown(region.desc, region.endTime, endCallback)
    self._commonCountDown:setCustomColor(Colors.getSummaryStarColor(), Colors.BRIGHT_BG_RED)
end

----------------------------------------------------------------------------------
-- @Role    Camera Moving
function GuildCrossWarBattleMapNode:_cameraMoveToPos(targetX, targetY)
    local innerContainer = self._scrollView:getInnerContainer()
    innerContainer:stopAllActions()
    local startX, startY = innerContainer:getPosition()
    local dstX, dstY = targetX, targetY
    
    local distance = cc.pGetDistance(cc.p(startX, startY), cc.p(dstX, dstY))
    local time = distance / GuildCrossWarBattleMapNode.CAMERA_SPEED
    local moveAction = cc.MoveTo:create(time, cc.p(dstX, dstY))
    local callFuncAction = cc.CallFunc:create(function()
    end)
    local action = cc.Sequence:create(moveAction, callFuncAction)
    innerContainer:runAction(action)
end

-- @Role    Convert to Screen coordinates
function GuildCrossWarBattleMapNode:_cameraPosConvert(startX, startY)
    -- body
    local x, y = startX, startY
    local innerContainer = self._scrollView:getInnerContainer()
    local currScale = innerContainer:getScale()
    local size = innerContainer:getContentSize()
    local scrollX = -(x * currScale - G_ResolutionManager:getDesignWidth() * 0.5)
    local scrollY = -(y * currScale - G_ResolutionManager:getDesignHeight() * 0.5)
    scrollX = math.max(math.min(scrollX, 0), -(size.width - G_ResolutionManager:getDesignWidth()))
    scrollY = math.max(math.min(scrollY, 0), -(size.height - G_ResolutionManager:getDesignHeight()))
    return scrollX, scrollY
end

-----------------------------------------------------------------------
-- @Role    Enter
function GuildCrossWarBattleMapNode:_onEventEnter()
    self._fightNotice:clear()
    self:_updateUserList(true)
    self:_updateBossList()
    self:_gotoPointCenter(true)
end

-- @Role    Update CurP's
function GuildCrossWarBattleMapNode:_updateCurPoint(isNeedUpdateEfc)
    self:_updateUserList(false)
end

-- @Role    移动
function GuildCrossWarBattleMapNode:_onEventSelfMove(id, needTime)
    local selfAvatar = self:_getOwnAvatar()
    if selfAvatar == nil then
        return
    end
    selfAvatar:moving(handler(self, self._cameraFollow), handler(self, self._updateCurPoint))
end

-- @Role    相机跟随
function GuildCrossWarBattleMapNode:_cameraFollow(allPath)
    self._movingpathList = {}
    self._movingpathList  = allPath
    self:_loopFollowing()
end

-- @Role    寻路
function GuildCrossWarBattleMapNode:_loopFollowing()
    if self._movingpathList and #self._movingpathList > 0 then
        local path = self._movingpathList[1]
        self:_moveCameraAction(path)
        table.remove(self._movingpathList, 1)
    end
end

-- @Role    用户更新
function GuildCrossWarBattleMapNode:_onEventUpdateUser(id, message)    
    local uid = message.player.uid
    if message.action == GuildCrossWarConst.UPDATE_ACTION_0 then                --0. 移动据点
        local userAvatar = self:_checkCreateUserAvatar(uid, true, true, true)
        if type(userAvatar) ~= "userdata" then
            return
        end
        if userAvatar:isSelf() then -- 0.1: 观战（奇葩~！
            userAvatar:moving(handler(self, self._cameraFollow), handler(self, self._updateCurPoint))
        else                        -- 0.2: 正常行走
            userAvatar:moving(nil, handler(self, self._updateCurPoint))
        end
        
    elseif message.action == GuildCrossWarConst.UPDATE_ACTION_1 then            --1. 复活回到源点
        local userAvatar = self:_checkCreateUserAvatar(uid, true, true, true)
        if type(userAvatar) ~= "userdata" then
            return
        end
        if userAvatar:isSelf() then -- 1.1: 观战（奇葩~！
            userAvatar:playRebornAction(handler(self, self._gotoPointCenter),  handler(self, self._updateCurPoint))
        else                        -- 1.2: 正常复活到源点
            userAvatar:playRebornAction(nil, handler(self, self._updateCurPoint))
        end
        
    elseif message.action == GuildCrossWarConst.UPDATE_ACTION_2 then            --2. 血量更新
        local userAvatar = self:_checkCreateUserAvatar(uid, true, false, true)
        if type(userAvatar) ~= "userdata" then
            return
        end
        userAvatar:updateAvatarHp(true)

    elseif message.action == GuildCrossWarConst.UPDATE_ACTION_3 then            --3. 出生点刷新
        self:_updateCurPoint()
    end
end

function GuildCrossWarBattleMapNode:_startCountDown(callback)
    self:_endSchedule()
    self._countDownHandler = SchedulerHelper.newScheduleOnce(function()
        self:_updateBossList()
        if callback then
            callback()
        end
    end, 2.0)
end

function GuildCrossWarBattleMapNode:_endSchedule()
    if self._countDownHandler then
        SchedulerHelper.cancelSchedule(self._countDownHandler)
        self._countDownHandler = nil
    end
end

-- @Role    据点更新
function GuildCrossWarBattleMapNode:_onEventUpdatePoint(id, action)
    if action == GuildCrossWarConst.UPDATE_BOSS then        -- 304：击杀Boss
        self:_startCountDown(function( ... )
            -- body
        end)

    elseif action == GuildCrossWarConst.UPDATE_CITY1 or     -- 302：占领城池
           action == GuildCrossWarConst.UPDATE_CITY2 or     -- 303：抢夺城池
           action == GuildCrossWarConst.UPDATE_CITY3 then   -- 1：攻击城池
        self:_updateCityList()
    elseif action == GuildCrossWarConst.UPDATE_CITY4 then   -- 2: 军团驻扎
        self:_updateCantonment()
    end
end

-- @Role    Attack User
function GuildCrossWarBattleMapNode:_attackPerson(gridId)
    if not gridId or gridId == 0 then
        return
    end

    local selfAvatar = self:_getOwnAvatar()
    if selfAvatar == nil then
        return
    end

    selfAvatar:playAttackAction(nil, GuildCrossWarConst.ATTACK_TYPE_2, gridId)
end

-- @Role    
function GuildCrossWarBattleMapNode:isPlayingWarring( ... )
    return self._isPlayingWarring
end

-- @Role    Play WarringAnimation
function GuildCrossWarBattleMapNode:_palyWarringAnimation(message, callBack)
    local own_hp = rawget(message, "own_hp") or 0
    local target_hp = rawget(message, "target_hp") or 0
    local target_id = rawget(message, "target_id") or 0
    local targetData = G_UserData:getGuildCrossWar():getUnitById(target_id) or {}

    local function effectFunction(effect)
		if effect == "wanjia1" then
			local node1 = WarringLeftPanel.new()
			node1:updateUI(own_hp)
            return node1
		elseif effect == "wanjia2" then
			local node2 = WarringRightPanel.new()
			node2:updateUI(targetData, target_hp)
            return node2

        elseif effect == "hit1" then
			local node = warringHurtHP.new()
			node:updateUI(own_hp)
            return node

        elseif effect == "hit2" then
			local node = warringHurtHP.new()
			node:updateUI(target_hp)
            return node
		end
    end
    local function eventFunction(event)
        if event == "finish" then
            self._warringBack:setVisible(false)
            self._warringNode:setVisible(false)
            if callBack then
                callBack()
            end
            self._isPlayingWarring = false
        end
    end

    self._isPlayingWarring = true
    self._warringBack:setVisible(true)
    self._warringNode:setVisible(true)
    self._warringNode:removeAllChildren()
    G_EffectGfxMgr:createPlayMovingGfx(self._warringNode, "moving_kuafujuntuanzhan", effectFunction, eventFunction , false)
end

-- @Role    Warring
function GuildCrossWarBattleMapNode:_onEventWarring(id, message)
    self:_palyWarringAnimation(message)
end

-- @Role    Atk Other's Tip
function GuildCrossWarBattleMapNode:_atkOtherTip(attackType, message)
    -- body
    local data = {}
    local TextHelper = require("app.utils.TextHelper")
    local type = (attackType == GuildCrossWarConst.ATTACK_TYPE_1 and 8 or 7)
    local point = G_UserData:getGuildCrossWar():getSelfUnit():getCurPointId()
    if attackType == GuildCrossWarConst.ATTACK_TYPE_1 then          -- 1. boss
        local bossUnit = G_UserData:getGuildCrossWar():getBossMap()[point]
        if bossUnit then
            data = {
                name = bossUnit:getConfig().name,
                city = "",
                hurt = TextHelper.getAmountText(message.hurt),
            }
            self:_createTipUnit(type, data, true)
        end
    elseif attackType == GuildCrossWarConst.ATTACK_TYPE_3 then      -- 3. 城池
        local cityUnit = G_UserData:getGuildCrossWar():getCityMap()[point]
        if cityUnit then
            local pointData = GuildCrossWarHelper.getWarCfg(point)
            data = {
                name = cityUnit:getGuild_name(),
                city = pointData.point_name,
                hurt = message.hurt,
            }
            self:_createTipUnit(type, data, true)
        end
    end
end

-- @Role    Fight
function GuildCrossWarBattleMapNode:_onEventFight(id, message)
    -- body
    local selfAvatar = self:_getOwnAvatar()
    if selfAvatar == nil then
        return
    end

    if not message.fight_type then  --1.战斗：打Boss 
        local attackType = rawget(message, "hurt") and GuildCrossWarConst.ATTACK_TYPE_1 or GuildCrossWarConst.ATTACK_TYPE_3 
        selfAvatar:playAttackAction(function()
            local bossAvatar = self:_getBossvatar(selfAvatar:getCurPointId())
            if bossAvatar ~= nil then
                bossAvatar:updateUI()
            end

            self:_atkOtherTip(attackType, message)
        end, attackType)  
    else                            --2 战斗：打人

        if rawget(message, "battle_result") == nil then
            return
        end

        local type = 0
        local bKill = rawget(message, "is_attacker")
        if bKill then
            type = message.battle_result and 1 or 2
        else
            type = message.battle_result and 3 or 4
        end
        self:_createTipUnit(type, message)
    end
end

-- @Role    Create Tips
function GuildCrossWarBattleMapNode:_createTipUnit(typeValue, message, isntPerson)
    local GuildWarNotice = require("app.data.GuildWarNotice")
    local unit = GuildWarNotice.new()
    unit:setId(typeValue)
    local ownHp = typeValue == 6 and 0 or rawget(message, "own_hp")
    local otherHp = typeValue == 5 and 0 or rawget(message, "target_hp")

    -- person
    unit:setValue("name", rawget(message, "target_name") or "")
    unit:setValue("selfhp", ownHp)
    unit:setValue("otherhp", otherHp)

    -- boss/city
    if isntPerson then
        unit:setValue("name", rawget(message, "name") or "")
    end
    unit:setValue("city1", rawget(message, "city") or "")
    unit:setValue("city2", rawget(message, "city") or "")
    unit:setValue("hurt", rawget(message, "hurt") or 0)
    self._fightNotice:showMsg(unit)

    local selfAvatar = self:_getOwnAvatar()
    if typeValue ~= 6 and selfAvatar ~= nil then
        selfAvatar:updateAvatarHp(true)
    end
end

function GuildCrossWarBattleMapNode:_playAttackAnimation(selfAvatar)
    -- body
    self._isNeedReborn = false
    if self._isRebornAtk then
        self._isRebornAtk  = false
        self:_palyWarringAnimation(self._cacheMessage, function()
            self._rebornCDNode:startCD()
            selfAvatar:playRebornAction(handler(self, self._gotoPointCenter),  handler(self, self._updateCurPoint))    
        end)
    else
        self._isRebornAtk  = false
        self._rebornCDNode:startCD()
        selfAvatar:playRebornAction(handler(self, self._gotoPointCenter),  handler(self, self._updateCurPoint))
    end
    self._cacheMessage = {}
end

-- @Role    SelfDeath
function GuildCrossWarBattleMapNode:_onEventFightSelfDie(id, message)
    self:_createTipUnit(6, message)

    local userUnit = G_UserData:getGuildCrossWar():getSelfUnit()
    if userUnit == nil then
        return
    end

    local selfAvatar = self:_checkCreateUserAvatar(G_UserData:getGuildCrossWar():getSelfUserId())
    self._isRebornAtk = rawget(message, "is_attacker") or false
    self._cacheMessage = message or {}
    if selfAvatar:checkMoving() then
        self._isNeedReborn = true
        return
    end

    self:_playAttackAnimation(selfAvatar)
end

-- @Role    OtherDeath
function GuildCrossWarBattleMapNode:_onEventFightOtherDie(id, message)
    self:_createTipUnit(5, message)
end

-- @Role    打Boss推送
function GuildCrossWarBattleMapNode:_onEventFightNotice(id, message)
    if rawget(message, "uid") == nil then
        return
    end

    local userAvatar = self:_getUserAvatar(message.uid)
    if type(userAvatar) ~= "userdata" then
        return
    end
    userAvatar:playAttackAction(function()
        -- body
        local bossAvatar = self:_getBossvatar(message.key_point_id)
        if bossAvatar ~= nil then
            bossAvatar:updateUI()
        end
    end)
end

-----------------------------------------------------------------------
-- Chamption（Look~!, Shaking u e((don't want to see again
function GuildCrossWarBattleMapNode:_createMapView(champList)
	local innerContainer = self._scrollChamp:getInnerContainer()
	local oldContainerPosY = innerContainer:getPositionY()
    innerContainer:removeAllChildren()
	self._cityNodes = {}

    local GuildCrossShow = require("app.config.guild_cross_war_show")
    local maxY, minY = 0, 0
    
    for k,v in ipairs(champList) do
        if k ~= nil then
            local config = GuildCrossShow.get(k)
            if config then
                local icon = ChamptionAvatar.new()
                icon:updateUI(v)
                icon:setConfig(config)
                innerContainer:addChild(icon, 10 + k)
                table.insert(self._cityNodes,icon)

                maxY = math.max(maxY,config.y_position)
                minY = minY == 0 and config.y_position or math.min(minY,config.y_position)
            end
        end
	end

	self._maxY = maxY
	local scrollHeight  = maxY-minY + GuildCrossWarConst.FIRST_ENTER_BOTTOM_BOAT_TO_SCREEN_DISTANCE
	scrollHeight = math.max(scrollHeight,math.max(GuildCrossWarConst.MAP_MIN_HEIGHT,G_ResolutionManager:getDesignHeight()))
    self._scrollHeight = scrollHeight
    

    local nodeBG = cc.Node:create()
    nodeBG:setPosition(cc.p(GuildCrossWarConst.MAP_WIDTH/2,0))
    local bgNums = math.ceil(scrollHeight / GuildCrossWarConst.MAP_TAI_HEIGHT) + 1
    bgNums = scrollHeight <= 640 and 2 or bgNums

    for i=1, bgNums do
        local map = cc.Sprite:create(Path.getGuildCrossImage("champ_bgbottom2"))
        map:setAnchorPoint(cc.p(0.5, 0))
        map:setPosition(cc.p(0, (i - 1) * GuildCrossWarConst.MAP_TAI_HEIGHT))
        nodeBG:addChild(map, bgNums - i)
    end
    innerContainer:addChild(nodeBG, 1)
    
	for k,icon in ipairs(self._cityNodes) do
         local config = icon:getConfig()
         if bgNums <= 2 then
            icon:setPosition(cc.p(config.x_position, config.y_position))
         else
            icon:setPosition(cc.p(config.x_position,scrollHeight + config.y_position - self._maxY))
         end
	end

	local size = cc.size(GuildCrossWarConst.MAP_WIDTH, math.max(bgNums * GuildCrossWarConst.MAP_TAI_HEIGHT, 640))
    self._scrollChamp:setInnerContainerSize(size)
	self._scrollChamp:getInnerContainer():setPositionY(0)
    self:_updatePerspective()
    
    -- 
    G_UserData:getGuildCrossWar():c2sBrawlGuildsLadder(0)
end

-- @Role    Sroll Chamption
function GuildCrossWarBattleMapNode:_scrollEventCallback(sender, eventType)
    if eventType == ccui.ScrollviewEventType.containerMoved then
		self:_updatePerspective()
    end
end

function GuildCrossWarBattleMapNode:_updatePerspective()
    local innerSize = self._scrollChamp:getInnerContainerSize()
    local currScrollDis = -self._scrollChamp:getInnerContainer():getPositionY()
    local maxScrollDis = innerSize.height - G_ResolutionManager:getDesignHeight()
    local mapScale = 1 + (GuildCrossWarConst.DST_SCALE - 1) * currScrollDis / maxScrollDis

    for k,v in ipairs(self._cityNodes) do
        local config = v:getConfig()
        
        local distance = (self._scrollHeight + config.y_position - self._maxY )* mapScale
        if (distance - currScrollDis < 1200 and distance- currScrollDis > -170 ) then
            local scaleValue =  1- (distance - currScrollDis) *  GuildCrossWarConst.SCALE_VALUE_PER_PIXEL
            local xPosScaleValue = 1- (distance - currScrollDis) *  GuildCrossWarConst.X_POS_SCALE_VALUE_PER_PIXEL
            local yPosScaleValue = 1- (distance - currScrollDis) *  GuildCrossWarConst.Y_POS_SCALE_VALUE_PER_PIXEL

            local newW = xPosScaleValue  * GuildCrossWarConst.MAP_WIDTH
            local x = config.x_position /GuildCrossWarConst.MAP_WIDTH   * newW +  (GuildCrossWarConst.MAP_WIDTH-newW)/2
            local y = currScrollDis + (distance - currScrollDis) * yPosScaleValue

            if (y - currScrollDis < 820 and y- currScrollDis > -170 ) then
                --v:setScale( scaleValue)
                --v:setPositionX(x)
                --v:setPositionY(y)
                v:setVisible(true)
            else
                v:setVisible(false)
            end
        else
            v:setVisible(false)	
        end
    end
end

-- @Role    ShowChaption
function GuildCrossWarBattleMapNode:_onEventShowChamp(id, message)
    local champtions = rawget(message, "players") or {}
    if table.nums(champtions) <= 0 then
        self._panelChamp:setVisible(false)
        return
    end

    self._imageTop:setVisible(false)
    self._panelChamp:setVisible(true)
    self._panelChamp:setLocalZOrder(100)
    self._guildRankNode:setLocalZOrder(101)
    table.sort(champtions, function(champ1, champ2)
        if champ1.guild_pos == champ2.guild_pos then
            return champ1.power > champ2.power
        else
            return champ1.guild_pos < champ2.guild_pos
        end
    end)

    self._txtGuildName:setString(champtions[1].guild_name)
    self._txtServerId:setString(champtions[1].sname)
    self:_createMapView(champtions)
end

----------------------------------------------------------------------------------------
-- @Role    初始小据点
function GuildCrossWarBattleMapNode:_onEventShowInspire(id, message)
    self._panelChamp:setVisible(false)
end

----------------------------------------------------------------------------------------
-- @Role    观战
function GuildCrossWarBattleMapNode:_onEventObserve(id, message)
    local bChangeRole = rawget(message, "exchangeRole") or false
    self._panelChamp:setVisible(false)
    self:_updateObserve(bChangeRole)

    -- Exchange Role
    if bChangeRole then
        self:_gotoPointCenter(false, function( ... )
            self:_updateUserList(true)
            self:_updateBossList()
            self:_updateMiniCamera()
        end)
    end
end

-- @Role    Update Observer
function GuildCrossWarBattleMapNode:_updateObserve(isChange)
    local bAct, bJoin = GuildCrossWarHelper.isGuildCrossWarEntry()
    if not bAct or bJoin then
        return
    end
    
    --- 分组
    local userList = G_UserData:getGuildCrossWar():getObserverList()
    local guildId = self:_updateObserverName(userList)
    G_UserData:getGuildCrossWar():setObserverGuildId(guildId)

    self._observerList = {}
    for i, v in ipairs(userList) do
        if not self._observerList[v.guild_id] then
            self._observerList[v.guild_id] = {}
        end 
        table.insert(self._observerList[v.guild_id], v)
    end

    local listNums = table.nums(self._observerList)
    self["_observePanel"]:setVisible(listNums > 0)
    self["_imageObserve"]:setVisible(listNums > 0)
    self._enemyView:setVisible(false)

    local index = 0
    local placeType = (listNums % 2) == 0 and 2 or 1  -- 偶奇位
    for key, value in pairs(self._observerList) do
        local observeView = self["_observePanel"]:getChildByName("observe" ..key)
        if observeView == nil then
            observeView = ObserveView.new(handler(self, self._selectObserveGuild))
            observeView:setName("observe" ..key)
            self["_observePanel"]:addChild(observeView, 10000)
            self._observerMap[key] = observeView
        end
        index = (index + 1)
        observeView:updateUI(value)
        observeView:updateSelected(rawequal(key, guildId), isChange)
        observeView:setPosition(GuildCrossWarConst.GUESS_GUILD_OBSERVER_PANELPOS[placeType][index])
    end
end

-- @Role    Update Observer's Name
function GuildCrossWarBattleMapNode:_updateObserverName(userList)
    local data = {}
    local roleId = G_UserData:getGuildCrossWar():getObserverId()
    for k,v in pairs(userList) do
        if type(v) == "table" and rawequal(v.user_id, roleId) then
            data = v
            break
        end
    end

    if not data or table.nums(data) <= 0 then
        return 0
    end

    local color = Colors.getOfficialColor(data.officer_level)
    self._observeNode:removeAllChildren()
    local richText = ccui.RichText:createRichTextByFormatString(
        Lang.get("guild_cross_war_observer", {name = data.user_name}),
        {defaultColor = color, defaultSize = 20, other ={[1] = {color = Colors.getSummaryStarColor()}, [2] = {color = color}}})

    richText:setAnchorPoint(cc.p(0.5, 0.5))
    self._observeNode:addChild(richText)
    return data.guild_id
end

-- @Role    When Slect ObserverGuild
function GuildCrossWarBattleMapNode:_selectObserveGuild(guildId, isTouch)
    if not guildId then
        return
    end
    for key, value in pairs(self._observerMap) do
        value:updateSelected(rawequal(guildId, key), isTouch)
    end
end

-- @Role    Register InspireView/Support
function GuildCrossWarBattleMapNode:_registerInspire( ... )
    self["_btnSpire"]:addClickEventListenerEx(function( ... )
        -- body
        self["_btnSpire"]:setGlobalZOrder(0)
        self["_btnSupport"]:setGlobalZOrder(0)
        G_SceneManager:showDialog("app.scene.view.guildCrossWarGuess.PopupInspireView", nil,
        function( ... )
            if self._imageSpire:isVisible() then
                self["_btnSpire"]:setGlobalZOrder(1)
                self["_btnSupport"]:setGlobalZOrder(1)
            end
        end)
    end)

    self["_btnSupport"]:addClickEventListenerEx(function( ... )
        -- body
        self["_btnSpire"]:setGlobalZOrder(0)
        self["_btnSupport"]:setGlobalZOrder(0)
        G_SceneManager:showDialog("app.scene.view.guildCrossWarGuess.PopupSupportView", nil, 
        function( ... )
            if self._imageSpire:isVisible() then
                self["_btnSpire"]:setGlobalZOrder(1)
                self["_btnSupport"]:setGlobalZOrder(1)
            end
        end)
    end)
end

-- @Role    Init InspireView/Support
function GuildCrossWarBattleMapNode:_initInspireSupport( ... )
    self["_btnSpire"]:updateUI(FunctionConst.FUNC_GUILD_CROSS_INSPIRE)
    self["_btnSupport"]:updateUI(FunctionConst.FUNC_GUILD_CROSS_SUPPORT)

    local function updateVisible(isJoin)
        if isJoin then
            self["_btnSpire"]:setVisible(true)
            self["_btnSupport"]:setVisible(true)
        else
            self["_btnSpire"]:setVisible(false)
            self["_btnSupport"]:setVisible(true)
        end
    end

    local _, bShowInspire, _ = GuildCrossWarHelper.isInspireTime()
    local _, bJoin = GuildCrossWarHelper.isGuildCrossWarEntry()
    local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()
    local region = GuildCrossWarHelper.getCurActStage()
    if bOpenToday then
        if bShowInspire then
            updateVisible(bJoin)
        else
            self["_btnSpire"]:setVisible(false)
            self["_btnSupport"]:setVisible(false)
        end
    else
        updateVisible(bJoin)
    end
    
    self:_registerInspire()
    if region.stage == 3 then
        if not self["_btnSpire"]:isVisible() then
            self["_btnSupport"]:setPositionX(167.16)
        else
            self["_btnSpire"]:setPositionX(167.16)
            self["_btnSupport"]:setPositionX(273.26)
        end
    else
        if not self["_btnSpire"]:isVisible() then
            self["_btnSupport"]:setPositionX(61.00)
        else
            self["_btnSpire"]:setPositionX(61)
            self["_btnSupport"]:setPositionX(167.16)
        end
    end
end

-- @Role    Update InspireView/Support's RP
function GuildCrossWarBattleMapNode:_updateInspireRP( ... )
    if self["_btnSpire"]:isVisible() then
        local show = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GUILD_CROSS_WAR, "inspireSupport")
        self["_btnSpire"]:showRedPoint(show)
    end

    local _, bJonin = GuildCrossWarHelper.isGuildCrossWarEntry()
    if self["_btnSupport"]:isVisible() and not bJonin then
        local show = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_GUILD_CROSS_WAR, "inspireSupport")
        self["_btnSupport"]:showRedPoint(show)
    end
end

-- @Role    Update Mini Camera
function GuildCrossWarBattleMapNode:_updateMiniCamera( ... )
    -- body
    local scaleFator = GuildCrossWarConst.CAMERA_SCALE_SMALL
    local cameraPos, cameraSize = self:_getCameraPos()
    local selfPosX, selfPosY = self:_getSelfPosition()
    if selfPosX and selfPosY then
        self._miniMapNode:updateCamera(cameraPos.x * scaleFator, cameraPos.y * scaleFator)
        self._miniMapNode:updateSelf(selfPosX, selfPosY)
    end 
end

-- @Role    Update
function GuildCrossWarBattleMapNode:update(dt)
    if self._enemyView then
        self._enemyView:updateCountDown()
    end
    self:_updateInspireRP()

    local selfAvatar = self:_getOwnAvatar()
    if selfAvatar ~= nil and selfAvatar:checkMoving() then
        self:_updateMiniCamera()    
    end

    if selfAvatar ~= nil and not selfAvatar:checkMoving() then
        if self._isNeedReborn then
            self:_playAttackAnimation(selfAvatar)
        end
    end
    
    if self._rebornCDNode:isInReborn() then
        self._rebornCDNode:refreshCdTimeView()
    end

    if self._updateUserListRc > 1 and not self._isLockUpdate then
        self._updateUserListRc = 0
        self:_updateUserList(self._isExchangeRole)
    end
end

-- @Role    Update
function GuildCrossWarBattleMapNode:updateInterval2(dt)
    if not GuildCrossWarHelper.isFightingStage() then
        return
    end
    if self._enemyView then
        self._enemyView:updateScrollView()
    end
end

----------------------------------------------------------------------------------------------
-- @Role  Init Gride
function GuildCrossWarBattleMapNode:makeClickRect()
    -- body
    local function createGride(value)
        local gridNode = self._scrollView:getChildByName("gridNode_" ..value.id)
        if gridNode == nil then
            gridNode = GuildCrossWarHelper.createCouldMoveGrid()
            gridNode:setName("gridNode_"..value.id)
            self._scrollView:addChild(gridNode, 10000)
        end

        local pos = GuildCrossWarHelper.getWarMapGridCenter(value.id)
        if pos then
            gridNode:setPosition(pos)
        end
    end

    local oriPoint = G_UserData:getGuildCrossWar():getSelfOriPoint()
    local retList = G_UserData:getGuildCrossWar():getWarHoleList()
    for i, value in ipairs(retList) do
        if value.isMove == 1 then
            if value.point ~= 0 and GuildCrossWarHelper.getWarCfg(value.point).type == 1 then
                if rawequal(value.point, oriPoint) then
                    createGride(value)
                end
            else
                createGride(value)
            end
        end
    end
end


return GuildCrossWarBattleMapNode
