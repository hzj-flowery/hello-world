--秦皇陵地图
local ViewBase = require("app.ui.ViewBase")
local QinTombBattleMapNode = class("QinTombBattleMapNode", ViewBase)
local BigImagesNode = require("app.utils.BigImagesNode")
local QinTombTeamAvatar = import(".QinTombTeamAvatar")
local QinTombMonsterAvatar = import(".QinTombMonsterAvatar")
local QinTombConst = require("app.const.QinTombConst")
local CurveHelper = require("app.utils.CurveHelper")
local QinTombHelper = import(".QinTombHelper")

QinTombBattleMapNode.MAX_WHEEL_NODE_NUM = 6
QinTombBattleMapNode.GRID_WIDTH = 60
QinTombBattleMapNode.GRID_HEIGHT = 60
QinTombBattleMapNode.MAX_SCALE = 1
QinTombBattleMapNode.MIN_SCALE = 0.7
QinTombBattleMapNode.CAMERA_SPEED = 2200
QinTombBattleMapNode.TEAM_KEY = "team"

QinTombBattleMapNode.MONSTER_KEY = "monster"

function QinTombBattleMapNode:ctor(cityId)
    self._cityId = cityId
    self._scrollView = nil
    self._panelTouch = nil --秦皇陵，touch
	local resource = {
		file = Path.getCSB("QinTombBattleMapNode", "qinTomb"),
		binding = {

		}
	}
    self:setName("QinTombBattleMapNode")
	QinTombBattleMapNode.super.ctor(self, resource)
end

function QinTombBattleMapNode:onCreate()
    self._avatarTeamMap = {}
    self._avatarMonsterMap = {}
    self._panelTouch:setSwallowTouches(false)
    self._panelTouch:addTouchEventListener(handler(self, self._onScrollViewTouchCallBack))
    self:_createMap()

    self:_createMoveSignNodes()
end

function QinTombBattleMapNode:onEnter()

   	self._signalUpdateGrave = G_SignalManager:add(SignalConst.EVENT_UPDATE_GRAVE, handler(self, self._onEventUpdateGrave))

    self._signalDeleteGrave = G_SignalManager:add(SignalConst.EVENT_DELETE_GRAVE, handler(self, self._onEventDeleteGrave))

    self._signalGraveSyncAttackPlayer = G_SignalManager:add(SignalConst.EVENT_GRAVE_SYNC_ATTCK_PLAYER, handler(self, self._onEventGraveSyncAttackPlayer))

    self._signalQinTeamAvatarStateChange = G_SignalManager:add(SignalConst.EVENT_GRAVE_TEAM_AVATAR_STATE_CHANGE,
    handler(self,self._onEventQinTeamAvatarStateChange ))

    self._signalQinSelfTeamMoveEnd = G_SignalManager:add(SignalConst.EVENT_GRAVE_SELF_TEAM_MOVE_END, handler(self,self._onEventQinSelfTeamMoveEnd))

    self._signalEnterGraveScene = G_SignalManager:add(SignalConst.EVENT_GRAVE_ENTER_SCENE, handler(self, self._onEventEnterGraveScene))

    self:_updateTeamList()
    self:_updateMonsterList()
    self:_refreshMoveSignNodes()
    self:updateUI()
    -- self:_testMove()
end


function QinTombBattleMapNode:_onEventEnterGraveScene( ... )
    -- body
    for key, value in pairs(self._avatarTeamMap) do
        self:_releaseAvatar(key)
    end

    self._avatarTeamMap = {}
    self:_updateTeamList()
    self:_updateMonsterList()
    self._cameraKey = nil
    self:updateUI()
end

function QinTombBattleMapNode:onExit()
    self:unscheduleUpdate() 
    self._signalUpdateGrave:remove()
    self._signalUpdateGrave = nil
    self._signalDeleteGrave:remove()
    self._signalDeleteGrave = nil
    self._signalGraveSyncAttackPlayer:remove()
    self._signalGraveSyncAttackPlayer =nil
    self._signalQinTeamAvatarStateChange:remove()
    self._signalQinTeamAvatarStateChange =nil
    self._signalQinSelfTeamMoveEnd:remove()
    self._signalQinSelfTeamMoveEnd =nil
    self._signalEnterGraveScene:remove()
    self._signalEnterGraveScene = nil
end

--创建秦皇陵地图
function QinTombBattleMapNode:_createMap( ... )
    -- body   
	local spriteMap = BigImagesNode.new(Path.getStageBG("qin_bk_stage"))
    local spriteSize = spriteMap:getContentSize()
	spriteMap:setAnchorPoint(cc.p(0, 0))
	spriteMap:setPosition(cc.p(0, 0))
    self._scrollView:addChild(spriteMap)
	self._scrollView:setInnerContainerSize(spriteSize)
    self._scrollView:setContentSize( G_ResolutionManager:getDesignCCSize() )
   



    local effectNode = cc.Node:create()
    effectNode:setName("effectNode")

    --该坐标写死-->特效就这样的，没办法
    effectNode:setPosition(cc.p(2100,1206))    

    self._scrollView:addChild(effectNode)
    G_EffectGfxMgr:createPlayMovingGfx(effectNode, 
    "moving_xianqinhuangling_mapeffect", nil, nil , false)

    self._panelTouch:setContentSize( G_ResolutionManager:getDesignCCSize() )
end


function QinTombBattleMapNode:_createTeamAvatar( teamId )
    -- body
    local avatar = QinTombTeamAvatar.new(teamId, self._scrollView)
    avatar:updateUI()
    avatar:setName(QinTombBattleMapNode.TEAM_KEY..teamId)
    self._scrollView:addChild(avatar)
    self._avatarTeamMap[teamId] = avatar
    return avatar
end

--点击区域显示,配合策划配坐标用的
--上线后会关闭
function QinTombBattleMapNode:makeClickRect( ... )
    -- body
    local retList = G_UserData:getQinTomb():getPointRectList()
    for i, value in ipairs(retList) do
        local clickRectWidget = cc.LayerColor:create(cc.c4b(255, 0, 0, 60), value.width, value.height)
        clickRectWidget:setPosition(cc.p(value.x,value.y))
        self._scrollView:addChild(clickRectWidget)
    end
end

function QinTombBattleMapNode:_createMonsterAvatar( monsterPoint )
    -- body
    local avatar = QinTombMonsterAvatar.new(monsterPoint, self._scrollView)
    avatar:updateUI()
    avatar:setName(QinTombBattleMapNode.MONSTER_KEY..monsterPoint)
    return avatar
end


function QinTombBattleMapNode:_onScrollViewTouchCallBack(sender,state)

	 if state == ccui.TouchEventType.ended or not state then
        local innerContainer = self._scrollView:getInnerContainer() 
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			local endPos = innerContainer:convertToNodeSpace( sender:getTouchEndPosition() )
	
			local clickPoint = G_UserData:getQinTomb():findPointKey(endPos)

            dump(clickPoint)
			local selfTeam = G_UserData:getQinTomb():getSelfTeam()
            if QinTombHelper.checkTeamLeaveBattle(selfTeam, clickPoint) then
                --G_Prompt:showTip(Lang.get("qin_tomb_error2"))
                return
            end

			--检查是否可以移动
			if QinTombHelper.checkTeamCanMoving(selfTeam,clickPoint) then
				QinTombHelper.movingTeam(selfTeam:getTeamId(), clickPoint)
			end
      
		end
	end
end


function QinTombBattleMapNode:_releaseAvatar( teamId )
    logWarn("QinTombData:_releaseAvatar"..teamId)
    local avatarTeam = self._avatarTeamMap[teamId]
    if avatarTeam then
        avatarTeam:releaseSelf()
        self._avatarTeamMap[teamId] = nil
        logWarn("QinTombData:deleta avatar  "..QinTombBattleMapNode.TEAM_KEY..teamId)
    end
end


function QinTombBattleMapNode:getTeamAvatar( teamId )
    -- body
    if teamId and teamId > 0 then
        local teamAvatar = self._avatarTeamMap[teamId]
        return teamAvatar
    end
    return nil
end

function QinTombBattleMapNode:getMonsterAvatar( point )
    -- body
    local monsterAvatar = self._avatarMonsterMap[point]
    if monsterAvatar == nil then
        monsterAvatar = self:_createMonsterAvatar(point)
        self._scrollView:addChild(monsterAvatar)
        self._avatarMonsterMap[point] = monsterAvatar
    end
    return monsterAvatar
end

--刚进入地图时，刷新所有怪物
function QinTombBattleMapNode:_updateMonsterList( ... )
    -- body
    local monsterList = G_UserData:getQinTomb():getMonsterList()
    for i, value in ipairs(monsterList) do
        local monster = self:getMonsterAvatar(value:getPoint_id())
        if monster then
            monster:synServerInfo()
        end
    end
end

function QinTombBattleMapNode:updateUI( monsterKey )
    -- body
    self:_updateMonsterHp(monsterKey)
    self:_updateAvatarInTheCamera()
    --self:_updateAvatarName()

    local selfTeam = G_UserData:getQinTomb():getSelfTeam()
    if selfTeam == nil then
        return
    end
    if selfTeam:getCurrState() ~= QinTombConst.TEAM_STATE_DEATH then
        if self:_isInMonsterPoint() == false then
            self:gotoMyPosition(false)
        end
    end

   
end


--刷新地图怪物
function QinTombBattleMapNode:_updateMonsterHp( monsterKey )
    -- body
    if monsterKey == nil then
        return
    end

    local monsterList = G_UserData:getQinTomb():getMonsterList()
    for i, value in ipairs(monsterList) do
        local monster = self:getMonsterAvatar(value:getPoint_id())
        if monster then
            monster:setMonsterVisible(false)
            if value:getPoint_id() == monsterKey then
                 monster:updateHp()
                 monster:setMonsterVisible(true)
            end
        end
    end
end

--只在相机
function QinTombBattleMapNode:_updateAvatarInTheCamera(  )
    local cameraPos, cameraSize = self:getCameraPos()

    local teamList = G_UserData:getQinTomb():getTeamListEx()
    local maxViewSize = 30
    for i, value in ipairs(teamList) do
        local teamAvatar = self:getTeamAvatar(value:getTeamId())
        if teamAvatar then
            teamAvatar:setAvatarModelVisible(false)
            if teamAvatar:isStateVisible() then
                local teamPos = cc.p( teamAvatar:getPosition() )
                local cameraRect = cc.rect(-cameraPos.x,-cameraPos.y,cameraSize.width,cameraSize.height)
                if cc.rectContainsPoint(cameraRect, teamPos) and maxViewSize > 0 then
                    teamAvatar:setAvatarModelVisible(true)
                    maxViewSize = maxViewSize -1
                end
            end
        end
    end
end

function QinTombBattleMapNode:getMonsterInTheCamera( cameraPos, cameraSize )
    -- body
    local monsterList = G_UserData:getQinTomb():getMonsterList()
    for i, value in ipairs(monsterList) do
        local monster = self:getMonsterAvatar(value:getPoint_id())
        if monster then
            local monsterPos = cc.p( monster:getPosition() )
            local cameraRect = cc.rect(-cameraPos.x,-cameraPos.y,cameraSize.width,cameraSize.height)

            if cc.rectContainsPoint(cameraRect, monsterPos) then
                return value:getPoint_id()
            end
        end
    end
    return nil
end

function QinTombBattleMapNode:_updateTeamList( ... )
    -- body
    local teamList = G_UserData:getQinTomb():getTeamList()
    for i, value in ipairs(teamList) do
        local teamAvatar = self:getTeamAvatar(value:getTeamId())
        if teamAvatar == nil then
            teamAvatar = self:_createTeamAvatar(value:getTeamId())
        end
        if teamAvatar then
            teamAvatar:synServerInfo()
        end
    end
end

function QinTombBattleMapNode:_getMyAvatar()
    local myTeamId = G_UserData:getQinTomb():getSelfTeamId()
    return self._avatarTeamMap[myTeamId]
end


function QinTombBattleMapNode:_cameraLock(lock)
    if lock then
        --self._panelTouch:setTouchEnabled(false)
        self._isLockCamera = true   
    else
        self._isLockCamera = false
        --self._panelTouch:setTouchEnabled(true)
    end
end

function QinTombBattleMapNode:_cameraMoveToPos(x,y)
    if self._isLockCamera then
        return
    end
    local innerContainer = self._scrollView:getInnerContainer()
    innerContainer:stopAllActions()

    local innerContainer = self._scrollView:getInnerContainer()
    local startX,startY = innerContainer:getPosition()
    local dstX,dstY = x,y

    local distance = cc.pGetDistance(cc.p(startX,startY),cc.p(dstX,dstY))
    local time = distance / QinTombBattleMapNode.CAMERA_SPEED
    local moveAction = cc.MoveTo:create(time, cc.p(dstX, dstY))
    local callFuncAction = cc.CallFunc:create(function()
        logWarn("QinTombBattleMapNode:_cameraMoveToPos")
        self:_cameraLock(false)
	end)
    local action = cc.Sequence:create(moveAction,callFuncAction)
    innerContainer:runAction(action)

    self:_cameraLock(true)
end



function QinTombBattleMapNode:getSelfTeamPos( ... )
    -- body
    local selfTeam = G_UserData:getQinTomb():getSelfTeamId()
    local teamAvatar = self:getTeamAvatar(selfTeam)
    if teamAvatar then
        return teamAvatar:getPosition()
    end
    return nil
end

function QinTombBattleMapNode:getCameraPos( ... )
    -- body
    local innerContainer = self._scrollView:getInnerContainer() 
    return cc.p(innerContainer:getPosition()),self._scrollView:getContentSize()
end

--到达boss点时，相机需要切换boss位置
function QinTombBattleMapNode:_isInMonsterPoint( ... )
    -- body
    local selfTeam = G_UserData:getQinTomb():getSelfTeam()
    if selfTeam == nil then
        return
    end
    local cameraKey = selfTeam:getCameraKey()
    if cameraKey and cameraKey > 0 then
        local position = QinTombHelper.getMidPoint(cameraKey+100)
        local cameraPos = self:getCameraPos()
        local scrollX, scrollY = self:_cameraPosConvert(position.x,position.y)
        --移动到怪物位置
        if cameraPos.x ~= scrollX or cameraPos.y ~= scrollY then
            self:_cameraMoveToPos(scrollX,scrollY)
        end
        self._cameraKey = cameraKey
        return true
    else
        if self._cameraKey and self._cameraKey > 0 then
            local cameraPos = self:getCameraPos()
            local avatar = self:_getMyAvatar()
            local avatarX,avatarY = avatar:getPosition()
            self:gotoMyPosition(true)
            self._cameraKey = nil
            return true
        end
    end
    return false
end

function QinTombBattleMapNode:_cameraPosConvert( startX,startY )
    -- body
    local x,y = startX, startY
    local innerContainer = self._scrollView:getInnerContainer()
    local currScale = innerContainer:getScale()
    local size = innerContainer:getContentSize()
    local scrollX = - (x * currScale - G_ResolutionManager:getDesignWidth() * 0.5)
    local scrollY = - (y * currScale - G_ResolutionManager:getDesignHeight() * 0.5)
    scrollX = math.max(math.min(scrollX,0),-(size.width-G_ResolutionManager:getDesignWidth()))
    scrollY = math.max(math.min(scrollY,0),-(size.height-G_ResolutionManager:getDesignHeight()))
    --去除小数点
   -- scrollX = math.floor( scrollX )
   -- scrollY = math.floor( scrollY )
    return scrollX, scrollY
end

function QinTombBattleMapNode:gotoMyPosition(useCamera)
     if self._isLockCamera then
        return
    end

    local avatar = self:_getMyAvatar()
    if avatar then
        local myTeam = G_UserData
       
        local x,y = avatar:getPosition()
        local scrollX, scrollY = self:_cameraPosConvert(x,y)

        local innerContainer = self._scrollView:getInnerContainer()
        if useCamera == nil then
            useCamera = true
        end
        if useCamera then
            self:_cameraMoveToPos(scrollX,scrollY)
        else
            local cameraPosX , cameraPosY = math.floor( scrollX ),math.floor( scrollY )

            innerContainer:setPosition(cameraPosX,cameraPosY)
        end
        
    end
end


function QinTombBattleMapNode:_hideSignNodes( ... )
    -- body

    if self._moveSignNodeList then
        for key,node in pairs(self._moveSignNodeList) do
            node:setVisible(false)
        end
    end

end

function QinTombBattleMapNode:_refreshMoveSignNodes()
   
    local selfTeam = G_UserData:getQinTomb():getSelfTeam()
    if selfTeam == nil then
        return
    end
    local currKey = selfTeam:getCurrPointKey()
    if currKey == nil then
        return
    end
    for key,node in pairs(self._moveSignNodeList) do
        node:setVisible(false)
    end

    local pointList = QinTombHelper.getMoveSignKey(currKey)
    for i = 1, #pointList do
        local pointCfg  = pointList[i]
        local effectNode = self._moveSignNodeList["k"..pointCfg.point_id]
        if effectNode then
            effectNode:setVisible(true)
        end
        --table.insert( self._moveSignNodeList, node)
    end
end

function QinTombBattleMapNode:_createMoveSignNodes()
    self._moveSignNodeList = {}
    local pointList = QinTombHelper.getMoveSignKeyList()
    for i = 1, #pointList do
        local effectNode = G_EffectGfxMgr:createPlayMovingGfx( self._scrollView,
             "moving_xianqinhuangling_jiantou", nil, nil, false )
        effectNode:setVisible(false)
        local pointCfg  = pointList[i]
        local midPoint = QinTombHelper.getMidPoint(pointCfg.point_id)
        effectNode:setPosition(midPoint)
        effectNode:setName("jiantou"..pointCfg.point_id)
        self._moveSignNodeList["k"..pointCfg.point_id] = effectNode
    end
end



---------------------------------------------------------------------------------------------------------------
--网络事件部分

function QinTombBattleMapNode:_onEventGuildWarBattleGoCampNotice(event,userData)
    if userData and userData:isSelf() then
        self:gotoMyPosition(true)
    end
end


function QinTombBattleMapNode:_onEventDeleteGrave( id , teamId )
    -- body
    if teamId and teamId > 0 then
        logWarn("QinTombBattleMapNode:_onEventDeleteGrave")
        self:_releaseAvatar(teamId)
    end
end


function QinTombBattleMapNode:_syncTeamServerInfo( teamId )
    -- body
    if teamId and teamId > 0 then
        --队伍已被删除的话，则不需要同步了
        local teamData = G_UserData:getQinTomb():getTeamById(teamId)
        if teamData == nil then
            return
        end
        local teamAvatar = self:getTeamAvatar(teamId)
        if teamAvatar == nil then
            teamAvatar = self:_createTeamAvatar(teamId)
        end
        if teamAvatar then
            teamAvatar:updateUI()
            teamAvatar:synServerInfo()
        end
    end
end

function QinTombBattleMapNode:_onEventGraveSyncAttackPlayer( id, syncTable )
    -- body
    if syncTable.oldTeamId > 0 then
        self:_syncTeamServerInfo(syncTable.oldTeamId)
    end

    if syncTable.oldBattleId > 0 then
        self:_syncTeamServerInfo(syncTable.oldBattleId)
    end

    if syncTable.newTeamId > 0 then
        self:_syncTeamServerInfo(syncTable.newTeamId)
    end

    if syncTable.newBattleId > 0 then
        self:_syncTeamServerInfo(syncTable.newBattleId)
    end
end

function QinTombBattleMapNode:_onEventUpdateGrave( id, teamId, monsterId )
    -- body
    logWarn("QinTombBattleMapNode:_onEventUpdateGrave teamId: "..teamId)
    if teamId and teamId > 0 then
        self:_syncTeamServerInfo(teamId)
    end

    -- 刷新monster
    if monsterId and monsterId > 0 then
        local monsterAvatar = self:getMonsterAvatar(monsterId)
        if monsterAvatar then
            logWarn("QinTombBattleMapNode:_onEventUpdateGrave monsterAvatar: "..monsterId)
            monsterAvatar:updateUI()
            monsterAvatar:synServerInfo()
        end
    end

end

function QinTombBattleMapNode:_onEventQinTeamAvatarStateChange(event,userData,newState,oldState,node )
    -- body
    logWarn("QinTombBattleMapNode:_onEventQinTeamAvatarStateChange")
    dump(newState)
    dump(oldState)
    local QinTombTeamAvatar = require("app.scene.view.qinTomb.QinTombTeamAvatar")
    if oldState == QinTombTeamAvatar.RUN_STATE and newState ==  QinTombTeamAvatar.STAND_STATE then
        if userData and userData:isSelf() then
            self:_refreshMoveSignNodes()
        end
    else
        logWarn("QinTombBattleMapNode:_hideSignNodes")
        if userData and userData:isSelf() then
            self:_hideSignNodes()
        end
    end

end

function QinTombBattleMapNode:_onEventQinSelfTeamMoveEnd(event, id )
    -- body
    local cacheKey = G_UserData:getQinTomb():getCacheNextKey()
    if cacheKey then
        local selfTeam = G_UserData:getQinTomb():getSelfTeam()
        --检查是否可以移动
        if QinTombHelper.checkTeamCanMoving(selfTeam,cacheKey) then
            QinTombHelper.movingTeam(selfTeam:getTeamId(), cacheKey)
        end
        G_UserData:getQinTomb():clearCacheNextKey()
    end
end
---------------------------------------------------------------------------------------------------------------

return QinTombBattleMapNode
