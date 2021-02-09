
local ViewBase = require("app.ui.ViewBase")
local GuildWarBattleMapNode = class("GuildWarBattleMapNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
local GuildWarConst = require("app.const.GuildWarConst")


GuildWarBattleMapNode.MAX_WHEEL_NODE_NUM = 6


GuildWarBattleMapNode.GRID_WIDTH = 60
GuildWarBattleMapNode.GRID_HEIGHT = 60

GuildWarBattleMapNode.MAX_SCALE = 1
GuildWarBattleMapNode.MIN_SCALE = 0.75

GuildWarBattleMapNode.CAMERA_SPEED = 2200

function GuildWarBattleMapNode:ctor(cityId)
    self._cityId = cityId
    self._scrollView = nil
    self._bgParentNode = nil
    self._pointParentNode = nil
    self._wheelParentNode = nil
    self._moveSignParentNode = nil
    self._pointAndAvatarParentNode = nil
    self._exitParentNode = nil
    self._tipsParentNode = nil
    self._hpParentNode = nil
    self._campEffectParentNode = nil

    self._pointNodeList = {}
    self._hpPointNodeList = {}
    self._moveSignNodeList = {}
    self._hpNodeList = {}
    self._campEffectNodeList = {}

    self._avatarNodeMap = {}
    self._avatarNum = 0
    self._recycledAvatarNodeList = {}
    self._moveSignDataList = {}
    self._pointSlotMap = {}--据点坑位的映射表

    self._currSelectPointId = nil

    self._guildWarExitNode = nil
    self._guildWarWheelNode = nil
    self._mapSize = cc.size(0,0)
    self._mapMinScale = 0
    self._isLockCamera = false    
    self._touchFlag = nil--是否点击了建筑
    self._totalAvatarNum = GuildWarConst.MAP_MAX_AVATAR_NUM 
    self._buildList = {}
   -- self._createAvatarTime = 0
	local resource = {
		file = Path.getCSB("GuildWarBattleMapNode", "guildwarbattle"),
		binding = {
           
		}
	}
	GuildWarBattleMapNode.super.ctor(self, resource)
end

function GuildWarBattleMapNode:onCreate()
    self._pointSlotMap =  GuildWarDataHelper.makePointSlotMap(self._cityId) 
    self._buildList = GuildWarDataHelper.getGuildWarBuildingList(self._cityId)
    self._scrollView:setSwallowTouches(false)
    self._scrollView:addTouchEventListener(handler(self, self._onScrollViewTouchCallBack))
    self:_createBg()
    self:_createPointNodes()
    self:_createCampEffectNodes()
    self:_createMoveSignNodes()
    self:_createHpPointNodes()
    self:_createAvatarNodeList()
    self:_createExitNodes()
    self:_createWheelNode()
end

function GuildWarBattleMapNode:onEnter()
    
    self._signalGuildWarBattleInfoSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN,
         handler(self,self._onEventGuildWarBattleInfoSyn ))
    self._signalGuildWarBattleInfoGet = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET,
         handler(self,self._onEventGuildWarBattleInfoGet ))
    self._signalGuildWarBattleChangeCity = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_CHANGE_CITY,
         handler(self,self._onEventGuildWarBattleChangeCity  ))

    self._signalGuildWarBattleAvatarStateChange = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_AVATAR_STATE_CHANGE,
         handler(self,self._onEventGuildWarBattleAvatarStateChange ))

    self._signalGuildWarBattleGoCampNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_GO_CAMP_NOTICE,
         handler(self,self._onEventGuildWarBattleGoCampNotice))

    self._signalGuildWarAttackNotice = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_ATTACK_NOTICE,
         handler(self,self._onEventGuildWarAttackNotice))

    self._signalGuildWarDoAttack = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_DO_ATTACK,
         handler(self,self._onEventGuildWarDoAttack))

    self._signalGuildWarPointChange = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_POINT_CHANGE,
         handler(self,self._onEventGuildWarPointChange))
     
    self._signalGuildWarBuildingChange = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BUILDING_CHANGE,
        handler(self, self._onEventGuildWarBattleBuildingChange))

    self._signalGuildWarUserChange = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_USER_CHANGE,
        handler(self, self._onEventGuildWarUserChange))



    self:_refreshPointNodes()
    self:_refreshMoveSignNodes()
    self:_refreshHpPointNodes()
    self:_refreshAvatarNodes()

    self:gotoMyPosition(false)

    self:_startTimer()


         
end

function GuildWarBattleMapNode:onExit()
    self._signalGuildWarBattleInfoSyn:remove()
    self._signalGuildWarBattleInfoSyn = nil

    self._signalGuildWarBattleInfoGet:remove()
    self._signalGuildWarBattleInfoGet = nil

    self._signalGuildWarBattleChangeCity:remove()
    self._signalGuildWarBattleChangeCity = nil

    self._signalGuildWarBattleAvatarStateChange:remove()
    self._signalGuildWarBattleAvatarStateChange = nil

    self._signalGuildWarBattleGoCampNotice:remove()
    self._signalGuildWarBattleGoCampNotice = nil

    self._signalGuildWarAttackNotice:remove()
    self._signalGuildWarAttackNotice = nil

    self._signalGuildWarDoAttack:remove()
    self._signalGuildWarDoAttack = nil

    self._signalGuildWarPointChange:remove()
    self._signalGuildWarPointChange = nil
    
    self._signalGuildWarBuildingChange:remove()
    self._signalGuildWarBuildingChange = nil

    self._signalGuildWarUserChange:remove()
    self._signalGuildWarUserChange = nil

    self:_endTimer()

     G_ServiceManager:DeleteOneAlarmClock("GuildWarCampEffectRemove")
end

function GuildWarBattleMapNode:_onEventGuildWarBattleInfoSyn(event)
end 

function GuildWarBattleMapNode:_onEventGuildWarBattleInfoGet(event)
end


function GuildWarBattleMapNode:_onEventGuildWarBattleChangeCity(event,pointId)

    local exitCityId = GuildWarDataHelper.getGuildWarExitCityId(self._cityId)
    if exitCityId then
         G_UserData:getGuildWar():c2sEnterGuildWar(exitCityId)
    end
   
end


function GuildWarBattleMapNode:_onEventGuildWarBattleAvatarStateChange(event,userData,newState,oldState,node)
    local GuildWarRunAvatorNode = require("app.scene.view.guildwarbattle.GuildWarRunAvatorNode")
     if userData and userData:isSelf() then
        local showWheel = newState ==  GuildWarRunAvatorNode.STAND_STATE
            or newState ==  GuildWarRunAvatorNode.ATTACK_STATE
        self:_visibleWheelNode(showWheel)
    
     end
   

    
    if oldState == GuildWarRunAvatorNode.RUN_STATE and 
        newState ==  GuildWarRunAvatorNode.STAND_STATE
        then

        if userData and userData:isSelf() then
            self:_refreshMoveSignNodes()
            self:_refreshWheelNode()
        end

    end
    
    if newState == GuildWarRunAvatorNode.RELEASE_STATE then 
        table.insert(self._recycledAvatarNodeList,node)
        self._avatarNum =  self._avatarNum - 1
        self._avatarNodeMap[userData:getUser_id()] = nil
        --print("GuildWarBattleMapNode recycle ", self._avatarNum," ",#self._recycledAvatarNodeList)
    end

     

    --[[
        --EVENT_GUILD_WAR_POINT_CHANGE
    if oldState == GuildWarRunAvatorNode.RUN_STATE then 
        self:_refreshPointNodes()
    end
    ]]
end

function GuildWarBattleMapNode:_onEventGuildWarBattleGoCampNotice(event,userData)
    if userData and userData:isSelf() then
        local popup  = G_SceneManager:getRunningScene():getPopupByName("PopupGuildWarPointDetail")
        if popup then
            popup:setVisible(false)
            local action = cc.CallFunc:create(function()
                   popup:close()
                end)
            popup:runAction( cc.Sequence:create( cc.DelayTime:create(0.001), action))

        end
        self:gotoCamp()
    end
end


function GuildWarBattleMapNode:_onEventGuildWarAttackNotice(event,cityId,unit)
end

function GuildWarBattleMapNode:_onEventGuildWarDoAttack(event)
    local roleAvatar = self:_getMyAvatar()
    if roleAvatar then
         roleAvatar:doAttack()
    end
   
end


function GuildWarBattleMapNode:_onEventGuildWarUserChange(event,cityId,changedUserMap)
    self:_refreshAvatarNodes(changedUserMap)

    local userId = G_UserData:getBase():getId()
    if changedUserMap[userId] then
        -- 一般自己变动才刷新
        self:_refreshMoveSignNodes()
        self:_refreshWheelNode()
    end
  

end

function GuildWarBattleMapNode:_onEventGuildWarPointChange(event,cityId,changedPointMap,changedUserMap)
    self:_refreshPointNodes(changedPointMap)
end


function GuildWarBattleMapNode:_onEventGuildWarBattleBuildingChange(event)
      self:_refreshHpPointNodes()
      self:_refreshMoveSignNodes()
      self:_refreshBuildingPointNodes()
end



function GuildWarBattleMapNode:_startTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),
        math.max(math.ceil(GuildWarConst.CREATE_ROLE_CD/1000) ,1) )
end

function GuildWarBattleMapNode:_endTimer()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end



function GuildWarBattleMapNode:printPointSlot()
    for k,v in pairs(self._pointSlotMap) do
        for k1,v1 in pairs(v) do
            for k2,v2 in pairs(v1) do
               -- print(k.." "..k1.." "..k2.." "..tostring(v2))
            end    
        end
    end
end

function GuildWarBattleMapNode:retainPointSlot(pointId,faceIndex)
    local slots = self._pointSlotMap[pointId][faceIndex]
    if not slots then
        return nil
    end
    local index = nil
    for k,v in pairs(slots) do
        if v then
            index = k
            slots[k] = false
            break
        end
    end
    return index
end

function GuildWarBattleMapNode:releasePointSlot(pointId,faceIndex,index)
    local slots = self._pointSlotMap[pointId][faceIndex]
    if slots[index] == false then
         slots[index] = true
    end
    --[[
    for k,v in pairs(slots) do
        if index == k and (not v) then
            slots[k] = true
            break
        end
    end
    ]]
end

function GuildWarBattleMapNode:retainAvatar()
    if self._totalAvatarNum <= 0 then
        return false
    end
    self._totalAvatarNum = self._totalAvatarNum - 1
    return true
end

function GuildWarBattleMapNode:releaseAvatar()
    self._totalAvatarNum = self._totalAvatarNum + 1
end

function GuildWarBattleMapNode:getZOrder(x,y)
    local size = self._scrollView:getInnerContainerSize()
    local verticalGridNo = math.ceil((size.height-y)/GuildWarBattleMapNode.GRID_HEIGHT)
    return math.max(verticalGridNo,0)
end



function GuildWarBattleMapNode:_createBg()
    local cityConfig = GuildWarDataHelper.getGuildWarCityConfig(self._cityId)
    local sceneId = cityConfig.scene
    local sceneConfig =  GuildWarDataHelper.getGuildWarBgConfig(sceneId)
    local imgNum = sceneConfig.infeed_num * sceneConfig.endwise_num
    local name = sceneConfig.pic_name
    local x,y = 0,0
    local mapSize = cc.size(0, 0)
    for i = 1,imgNum,1 do
         local imgName = string.format("%s_%d",name,i)
         local sprite = cc.Sprite:create( Path.getBackground(imgName))
         local size = sprite:getContentSize()
         sprite:setPosition(x,y)
         sprite:setAnchorPoint(cc.p(0, 1))
         x = x + size.width
         if i %  sceneConfig.infeed_num == 0 then
            mapSize.width =  math.max(mapSize.width,x)
            mapSize.height =  mapSize.height +  size.height
            x = 0
            y = y -size.height
         end
       
         self._bgParentNode:addChild(sprite)
    end
    local designSize = G_ResolutionManager:getDesignSize()
    --logWarn(mapSize.width.." GuildWarBattleMapNode   _createBg "..mapSize.height)
   


    self._scrollView:setContentSize(cc.size(designSize[1],designSize[2]))
    self._scrollView:setInnerContainerSize(mapSize)


    
    self._mapSize = mapSize

    local scaleX  = designSize[1] / mapSize.width
    local scaleY  = designSize[2] / mapSize.height
    self._mapMinScale = math.min(scaleX,scaleY)

    self._bgParentNode:setPosition(0,mapSize.height)

end


function GuildWarBattleMapNode:_createCampEffectNodes()
    local timeData = GuildWarDataHelper.getGuildWarNextOpeningTimeRegion()
	local curTime = G_ServerTime:getTime()
    if curTime >= timeData.startTime and curTime < timeData.time1 then
        local pointList = GuildWarDataHelper.getGuildWarCampList(self._cityId)
        logWarn("GuildWarBattleMapNode -------------- createCampEffectNodes")
        --dump(pointList)
        for k,v in ipairs(pointList) do
            local subEffect = G_EffectGfxMgr:createPlayMovingGfx(  self._campEffectParentNode, "moving_juntuanzhan_chengchiguang", nil, nil, false )
            subEffect:setName("EffectGfxNode")
            subEffect:setPosition(v.clickPos.x,v.clickPos.y)
            subEffect:setVisible(true)
            subEffect:setScale(0.7)
            self._campEffectNodeList[v.point_id] = subEffect

            -- logWarn("GuildWarBattleMapNode -------------- createCampEffectNodes 1")
        end   

        G_ServiceManager:registerOneAlarmClock("GuildWarCampEffectRemove",timeData.time1, function()
			self:_showCampEffectNodes(false)
        end)
    end
  
end

function GuildWarBattleMapNode:_showCampEffectNodes(show)
    for k,v in pairs( self._campEffectNodeList) do
        v:setVisible(show)
    end
end


function GuildWarBattleMapNode:_createPointNodes()
    local pointList = GuildWarDataHelper.getGuildWarSeekPointList(self._cityId)
    for k,v in ipairs(pointList) do
        local GuildWarPointNode = require("app.scene.view.guildwarbattle.GuildWarPointNode")
        local node = GuildWarPointNode.new(self._cityId,v)
         node:setOnPointClickListener(handler(self,self._onPointClick))
        self._pointParentNode:addChild(node)
        --table.insert( self._pointNodeList,node)

        self._pointNodeList[node:getPointId()] = node
    end   
    
end

function GuildWarBattleMapNode:_onPointClick(cityId,pointId)

     self._touchFlag = true

	local GuildWarCheck = require("app.utils.logic.GuildWarCheck")
	local success = GuildWarCheck.guildWarCanAttackPoint(cityId,pointId,false,true)
	if success then
		G_UserData:getGuildWar():c2sGuildWarBattleWatch(pointId)
	end

end 


--人口 和 血量
function GuildWarBattleMapNode:_refreshPointNodes(changedPointMap)
    if changedPointMap then
        for k,v in pairs(changedPointMap) do
            local node = self._pointNodeList[k]
            if node then
                node:updateInfo()
            end
        end 
    else
        for k,v in pairs( self._pointNodeList) do
            v:updateInfo()
        end
    end

   
end


function GuildWarBattleMapNode:_refreshBuildingPointNodes()
    for k,v in ipairs(self._buildList) do
        local node = self._pointNodeList[v]
        if node then
            node:updateInfo()
        end
    end
end


function GuildWarBattleMapNode:_createHpPointNodes()
    local pointList = GuildWarDataHelper.getGuildWarBuildingConfigListByCityId(self._cityId)
    for k,v in ipairs(pointList) do
        local GuildWarBuildingNode = require("app.scene.view.guildwarbattle.GuildWarBuildingNode")
        local node = GuildWarBuildingNode.new(self,self._cityId,v)
        self._pointAndAvatarParentNode:addChild(node)
        table.insert( self._hpPointNodeList,node)

        local GuildWarBuildingHpNode = require("app.scene.view.guildwarbattle.GuildWarBuildingHpNode")
	    local hpNode = GuildWarBuildingHpNode.new(self._cityId,v)
        self._hpParentNode:addChild(hpNode)
        table.insert( self._hpNodeList,hpNode)
    end   



  
end

--刷新受击动作和破损图片
function GuildWarBattleMapNode:_refreshHpPointNodes()
    for k,v in ipairs( self._hpPointNodeList) do
        v:syn()
    end

     for k,v in ipairs( self._hpNodeList) do
         v:syn()
     end
end

function GuildWarBattleMapNode:_createAvatarNodeList()
--self._createAvatarTime = timer:getms()
    local userList = G_UserData:getGuildWar():getShowWarUserList(self._cityId,nil,GuildWarConst.INIT_CREATE_ROLE_NUM )
    for k,v in ipairs(userList) do
        self:_createAvatarNode(v)
    end   
   -- print("GuildWarBattleMapNode createAvatar ", self._avatarNum," ",#self._recycledAvatarNodeList)
end

function GuildWarBattleMapNode:_createAvatarNode(v,isTest)
    local GuildWarRunAvatorNode = require("app.scene.view.guildwarbattle.GuildWarRunAvatorNode")
    local node = GuildWarRunAvatorNode.new(self,self,self,v,isTest)
    self._pointAndAvatarParentNode:addChild(node)
    local userId = v:getUser_id()
    self._avatarNodeMap[userId] = node
    self._avatarNum = self._avatarNum + 1
    return node
end


function GuildWarBattleMapNode:finishBattle()
    local guildId = G_UserData:getGuildWar():getBattleDefenderGuildId(self._cityId)
    for k,v in pairs( self._avatarNodeMap) do
        if not v:isInRelease() then
            v:doFinish(guildId)
        end
    end 
end

function GuildWarBattleMapNode:_refreshAvatarNodes(changedUserMap)
    --刷新现有角色
  
    --local activeUserMap = {}
    if changedUserMap then
        for k,v1 in pairs(changedUserMap) do
            local v = self._avatarNodeMap[k]
            if v and not v:isInRelease()   then --and not v._isTest

                local guildWarUser = v:getGuildWarUser()
                local nowGuildWarUser = G_UserData:getGuildWar():getWarUserById(
                    guildWarUser:getCity_id(), guildWarUser:getUser_id()
                )
                v:syn(nowGuildWarUser)
               -- activeUserMap[guildWarUser:getUser_id()] = true

            end
        end
    else
        for k,v in pairs( self._avatarNodeMap) do
            if not v:isInRelease() and not v._isTest  then
                local guildWarUser = v:getGuildWarUser()
                local nowGuildWarUser = G_UserData:getGuildWar():getWarUserById(
                    guildWarUser:getCity_id(), guildWarUser:getUser_id()
                )
                v:syn(nowGuildWarUser)
               -- activeUserMap[guildWarUser:getUser_id()] = true
            end
        end
    end

    if not self._refreshHandler then
        self:_checkAddAvatarNodes()
    end
    
end


function GuildWarBattleMapNode:_onRefreshTick(dt)
	local createNum = self:_checkAddAvatarNodes()
    --logWarn("GuildWarBattleMapNode _onRefreshTick -------------- "..tostring(createNum))
    if not createNum or createNum <= 0 then
        self:_endTimer()
    end
end


function GuildWarBattleMapNode:_popReleaseAvatarNode()
    --优先弹出有Avatar的node isShowAvatar
    for k,v in pairs( self._recycledAvatarNodeList) do
        if v:isInRelease() and v:isShowAvatar() then
            table.remove(self._recycledAvatarNodeList,k)
            return v
        end
    end

    for k,v in pairs( self._recycledAvatarNodeList) do
        if v:isInRelease() then
            table.remove(self._recycledAvatarNodeList,k)
            return v
        end
    end
    return nil
end

function GuildWarBattleMapNode:_checkAddAvatarNodes()
     local nowActiveNum = self._avatarNum 
    --logWarn("GuildWarBattleMapNode _refreshAvatarNodes -------------- "..nowActiveNum)
    if nowActiveNum < GuildWarConst.MAP_MAX_ROLE_NUM then
        --and ( timer:getms() - self._createAvatarTime ) >= GuildWarConst.CREATE_ROLE_CD  then
       -- self._createAvatarTime = timer:getms()

        local addUserList = G_UserData:getGuildWar():getShowWarUserList(self._cityId, self._avatarNodeMap,
           math.min(GuildWarConst.ONCE_CREATE_ROLE_NUM,GuildWarConst.MAP_MAX_ROLE_NUM-nowActiveNum) )
      --  logWarn("GuildWarBattleMapNode addUserList -------------- "..#addUserList)
        self:_addAvatarNodes(addUserList)

        return #addUserList
    end

end

function GuildWarBattleMapNode:_addAvatarNodes(addUserList)
    local needCreate = false
    local num = #addUserList
    for k,v in ipairs(addUserList) do
        local avatarNode = nil
        if not needCreate then 
             avatarNode =  self:_popReleaseAvatarNode()
        end
        
        if not avatarNode then
            needCreate = true
            avatarNode = self:_createAvatarNode(v)
        else
            local userId = v:getUser_id()
            self._avatarNum = self._avatarNum + 1
            self._avatarNodeMap[userId] = avatarNode
            avatarNode:use(v)

            --print("GuildWarBattleMapNode reuse ", self._avatarNum," ",#self._recycledAvatarNodeList)
        end
    end
   
end

function GuildWarBattleMapNode:_refreshMoveSignNodes()

    local warUser = G_UserData:getGuildWar():getMyWarUser(self._cityId)
    local currPointId = warUser:getStartPoint()--自己当前的位置
    local movePointList  = GuildWarDataHelper.findShowMoveSignPointList(self._cityId,currPointId)
    self._moveSignDataList = movePointList 
  
    for k,v in ipairs(self._moveSignNodeList) do
        local data = movePointList[k]
        if data then
            v:setVisible(true)
            v:updateInfo(data )
        else
            v:setVisible(false)
        end
    end

end

function GuildWarBattleMapNode:_createMoveSignNodes()
    for i = 1, GuildWarBattleMapNode.MAX_WHEEL_NODE_NUM ,1 do
        local GuildWarMoveSignNode = require("app.scene.view.guildwarbattle.GuildWarMoveSignNode")
        local node = GuildWarMoveSignNode.new()
        node:setVisible(false)
        self._moveSignParentNode:addChild(node)
        table.insert( self._moveSignNodeList,node)
    end
end


function GuildWarBattleMapNode:_createExitNodes()
  --[[
    local pointId = GuildWarDataHelper.getExitPoint( self._cityId)
    if pointId then
        local GuildWarExitNode = require("app.scene.view.guildwarbattle.GuildWarExitNode")
        local node = GuildWarExitNode.new(self._cityId,pointId)
        self._exitParentNode:addChild(node)
        self._guildWarExitNode = node
    end
    ]]
end

function GuildWarBattleMapNode:_createWheelNode()

    local GuildWarPointWheelNode = require("app.scene.view.guildwarbattle.GuildWarPointWheelNode")
    local node = GuildWarPointWheelNode.new()
    node:setVisible(false)
    node:setCloseListener(handler(self,self.clearWheelPos))
    self._wheelParentNode:addChild(node)
    self._guildWarWheelNode = node

end


function GuildWarBattleMapNode:_setWheelPos(cityId,pointId)
    if pointId == self._currSelectPointId then
        return 
    end
    self._currSelectPointId = pointId
    self._guildWarWheelNode:setVisible(true)
    self._guildWarWheelNode:updateInfo({cityId = cityId,pointId = pointId})
  --  logWarn("GuildWarBattleMapNode "..tostring(self._currSelectPointId) )
end

function GuildWarBattleMapNode:clearWheelPos()
    if self._currSelectPointId then
        self._currSelectPointId = nil
        self._guildWarWheelNode:setVisible(false)
    end
end


function GuildWarBattleMapNode:_refreshWheelNode()
    if self._guildWarWheelNode:isVisible() then
        self._guildWarWheelNode:refreshView()
    end
end


function GuildWarBattleMapNode:_visibleWheelNode(show)
     self._moveSignParentNode:setVisible(show)
     self._wheelParentNode:setVisible(show)
     if not show then
        self:clearWheelPos()
     end
end


function GuildWarBattleMapNode:_getMyAvatar()
    local userId = G_UserData:getBase():getId()
    return self._avatarNodeMap[userId]
    --[[
    for k,v in pairs( self._avatarNodeMap) do
        if v:isSelf() then
            return v
        end
    end 
     return nil
     ]]
end





function GuildWarBattleMapNode:gotoMyPosition(useCamera)
     if self._isLockCamera then
        return
    end
    local avatar = self:_getMyAvatar()
    if avatar then
        local x,y = avatar:getPosition()
        local innerContainer = self._scrollView:getInnerContainer()
        local currScale = innerContainer:getScale()
        local size = innerContainer:getContentSize()
        local scrollX = - (x * currScale - G_ResolutionManager:getDesignWidth() * 0.5)
	    local scrollY = - (y * currScale - G_ResolutionManager:getDesignHeight() * 0.5)
        scrollX = math.max(math.min(scrollX,0),-(size.width-G_ResolutionManager:getDesignWidth()))
        scrollY = math.max(math.min(scrollY,0),-(size.height-G_ResolutionManager:getDesignHeight()))

        if useCamera == nil then
            useCamera = true
        end   
        if useCamera then
            self:_cameraMoveToPos(scrollX,scrollY)
        else
            innerContainer:setPosition(scrollX,scrollY)
        end
        
    end
end

function GuildWarBattleMapNode:gotoCamp()
    self:gotoMyPosition(true)
end

function GuildWarBattleMapNode:doScaleAnim(ePercent)
    local innerContainer = self._scrollView:getInnerContainer()
    local startTime = G_ServerTime:getMSTime()
    local duration =  400
    local sPercent = self:getCurrScalePercent()
    sPercent = math.min(100,math.max(0,sPercent))
    local UIActionHelper = require("app.utils.UIActionHelper")
    local action = UIActionHelper.createUpdateAction(function()
        local time = G_ServerTime:getMSTime()
        local t = time - startTime
        if t >= duration then
            t = duration
            innerContainer:stopAllActions()
            self:_cameraLock(false)
        end
        local percent =  (ePercent-sPercent) * t / duration +sPercent
        self:doScale(percent)
       
    end, 0.01)
    innerContainer:stopAllActions()
    innerContainer:runAction(action)
    self:_cameraLock(true)
end

function GuildWarBattleMapNode:getCurrScalePercent()
    local innerContainer = self._scrollView:getInnerContainer()
    local scaleDiff = GuildWarBattleMapNode.MAX_SCALE - math.max(self._mapMinScale,GuildWarBattleMapNode.MIN_SCALE )
    local currScale = innerContainer:getScale()
    local percent = (currScale - math.max(self._mapMinScale,GuildWarBattleMapNode.MIN_SCALE ) ) *100 / scaleDiff 
    return percent
end

function GuildWarBattleMapNode:doScale(percent)
   -- logWarn("doScale -------------  "..percent)

    local scaleDiff = GuildWarBattleMapNode.MAX_SCALE - math.max(self._mapMinScale,GuildWarBattleMapNode.MIN_SCALE )
    local scale =  math.max(self._mapMinScale,GuildWarBattleMapNode.MIN_SCALE )  + scaleDiff * percent / 100
    
   -- logWarn(string.format("doScale -------------dst scale  %f ",scale))


    local innerContainer = self._scrollView:getInnerContainer()
    local oldX,oldY = innerContainer:getPosition()

   -- logWarn(string.format("doScale -------------oldX  %d  oldX %d ",oldX,oldY))

    --local avatar = self:_getMyAvatar()
    --local x,y = avatar:getPosition()


    local currScale = innerContainer:getScale()

    local centerX = (-oldX + G_ResolutionManager:getDesignWidth() * 0.5 )/currScale
    local centerY = (-oldY + G_ResolutionManager:getDesignHeight() * 0.5 )/currScale

    
  --  logWarn(string.format("doScale -------------centerX %d  centerY %d ",centerX,centerX))
    --logWarn(string.format("doScale -------------avatarX %d  avatarY %d ",x,y))

    local focus = cc.p(centerX,centerY)
    local worldPos = innerContainer:convertToWorldSpaceAR(focus)


   -- logWarn(string.format("doScale -------------worldPos1 %d %d ",worldPos.x,worldPos.y))

    innerContainer:setScale(scale)
    innerContainer:setContentSize(cc.size(self._mapSize.width *scale ,
        self._mapSize.height *scale
    ))


   -- local newFocus = cc.p(focus.x * scale,focus.y *scale)
    local newWorldPos = innerContainer:convertToWorldSpaceAR(focus)

   -- logWarn(string.format("doScale -------------newWorldPos %d %d ",newWorldPos.x,newWorldPos.y))


    local scrollX = oldX + worldPos.x - newWorldPos.x 
    local scrollY = oldY + worldPos.y - newWorldPos.y 


    local size = innerContainer:getContentSize()
    scrollX = math.max(math.min(scrollX,0),-(size.width-G_ResolutionManager:getDesignWidth()))
    scrollY = math.max(math.min(scrollY,0),-(size.height-G_ResolutionManager:getDesignHeight()))
    

  --  logWarn(string.format("doScale -------------newX %d  newY %d ",scrollX,scrollY))

    innerContainer:setPosition(scrollX,scrollY)
end  

function GuildWarBattleMapNode:_cameraMoveToPos(x,y)
    if self._isLockCamera then
        return
    end
    local innerContainer = self._scrollView:getInnerContainer()
    innerContainer:stopAllActions()

    local innerContainer = self._scrollView:getInnerContainer()
    local startX,startY = innerContainer:getPosition()
    local dstX,dstY = x,y

    local distance = cc.pGetDistance(cc.p(startX,startY),cc.p(dstX,dstY))
    local time = distance/GuildWarBattleMapNode.CAMERA_SPEED
    local moveAction = cc.MoveTo:create(time, cc.p(dstX, dstY))
    local callFuncAction = cc.CallFunc:create(function()
        self:_cameraLock(false)
	end)
    local action = cc.Sequence:create(moveAction,callFuncAction)
    innerContainer:runAction(action)

    self:_cameraLock(true)
end



function GuildWarBattleMapNode:_cameraLock(lock)
    if lock then
        self._scrollView:setTouchEnabled(false)
        self._isLockCamera = true   
        G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_MOVE_CAMERA,true)
    else
        self._isLockCamera = false
        self._scrollView:setTouchEnabled(true)
        G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_MOVE_CAMERA,false)     
    end
end



function GuildWarBattleMapNode:_onScrollViewTouchCallBack(sender,state)

	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
           -- logWarn("GuildWarBattleMapNode -------------- onClickMap ok")
            if not self._touchFlag then
              --  logWarn("GuildWarBattleMapNode -------------- clearWheelPos ok")
                --self:clearWheelPos()
            end
		end
	end

	if state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		self._touchFlag = false
	end
end

return GuildWarBattleMapNode
