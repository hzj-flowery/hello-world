
-- Author: hedili
-- Date:2018-04-19 14:10:18
-- Describle：秦皇陵队伍系统

local ViewBase = require("app.ui.ViewBase")
local QinTombTeamAvatar = class("QinTombTeamAvatar", ViewBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local StateMachine = require("app.utils.StateMachine")
local CurveHelper = require("app.utils.CurveHelper")
local QinTombAvatar = import(".QinTombAvatar")
local QinTombConst = require("app.const.QinTombConst")


QinTombTeamAvatar.CREATE_STATE = "Create"
QinTombTeamAvatar.INIT_STATE = "Init"
QinTombTeamAvatar.STAND_STATE = "Stand"
QinTombTeamAvatar.RUN_STATE = "Run"
QinTombTeamAvatar.ATTACK_STATE = "Attack" --打boss，与掠夺
QinTombTeamAvatar.REBORN_STATE = "ReBorn"--死亡状态

QinTombTeamAvatar.AVATAR_RUN_TIME_SCALE = 1.5--跑步时，加速Avatar速度
QinTombTeamAvatar.MAX_AVATAR_SIZE = 3
function QinTombTeamAvatar:ctor(teamId, mapNode)
	--csb bind var name
	dump(teamId)

	self._panelbk = nil  --Panel
	self._avatarName = nil
	self._teamId = teamId
	self._mapNode = mapNode  --

	local resource = {
		file = Path.getCSB("QinTombTeamAvatar", "qinTomb"),

	}
	QinTombTeamAvatar.super.ctor(self, resource)
end

function QinTombTeamAvatar:_initStateMachine(defaultState)
	if self._stateMachine then
		return
	end
	local cfg = {
	    ["defaultState"] = QinTombTeamAvatar.CREATE_STATE,
		["stateChangeCallback"] = handler(self, self._stateChangeCallback),
	    ["state"] = {
			[QinTombTeamAvatar.CREATE_STATE] = {
				["nextState"] = {
					[QinTombTeamAvatar.INIT_STATE] = {
					},
				},
	        },
			[QinTombTeamAvatar.INIT_STATE] = {
				["nextState"] = {
					[QinTombTeamAvatar.STAND_STATE] = {
					},
					[QinTombTeamAvatar.RUN_STATE] = {		
					},
					[QinTombTeamAvatar.REBORN_STATE] = {
					},
					[QinTombTeamAvatar.ATTACK_STATE] = {
					},
				},
				["didEnter"] = handler(self, self._didEnterInit)
	        },
	        [QinTombTeamAvatar.STAND_STATE] = {
				["nextState"] = {
					[QinTombTeamAvatar.RUN_STATE] = {
					},
					[QinTombTeamAvatar.ATTACK_STATE] = {
					},
				},
				["didEnter"] = handler(self, self._didEnterStand),
				["didExit"] = handler(self, self._didWillExitStand)
	        },
	        [QinTombTeamAvatar.RUN_STATE] = {
				["nextState"] = {
					[QinTombTeamAvatar.STAND_STATE] = {
						["transition"] = handler(self, self._transitionRunToStand),
						["stopTransition"] = handler(self, self._stopTransitionRunToStand),
					},
				},
				["didEnter"] = handler(self, self._didEnterRun),
				["willExit"] = handler(self, self._didWillExitRun),
				["didExit"] = handler(self, self._didExitRun),
				["stopExit"] = handler(self, self._didStopExitRun),
	        },

	        [QinTombTeamAvatar.ATTACK_STATE] = {
				["nextState"] = {
					[QinTombTeamAvatar.STAND_STATE] = {
					},
					[QinTombTeamAvatar.RUN_STATE] = {
					},
					[QinTombTeamAvatar.REBORN_STATE] = {
					},
				},
				["didEnter"] = handler(self, self._didEnterAttack),
				["willExit"] = handler(self, self._didWillExitAttack),
	        },
			[QinTombTeamAvatar.REBORN_STATE] = {
				["nextState"] = {
					[QinTombTeamAvatar.STAND_STATE] = {
						["transition"] = handler(self, self._transitionRebornToStand),
						["stopTransition"] = handler(self, self._stopTransitionRebornToStand),
					},
				},
				["didEnter"] = handler(self, self._didEnterReborn),
				["willExit"] = handler(self, self._didWillExitReborn),
	        },

	    }
	}

	self._stateMachine = StateMachine.new(cfg)
end

-- Describle：
function QinTombTeamAvatar:onCreate()
	self:_initStateMachine()

	self:switchState(QinTombTeamAvatar.INIT_STATE)
end

function QinTombTeamAvatar:clearAvatarState( ... )
	-- body
	
	for i= 1, QinTombTeamAvatar.MAX_AVATAR_SIZE do 
		local avatar = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		if avatar then
			avatar:removeFromParent()
		end
	end

	for i= 1, QinTombTeamAvatar.MAX_AVATAR_SIZE do 
		local avatar = QinTombAvatar.new(self._mapNode)
		avatar:syncVisible(false)
		avatar:setPosition(QinTombConst.TEAM_AVATAR_IDLE_POS[i])
		self._nodeRole:addChild(avatar)
		avatar:setName("_commonHeroAvatar"..i)
	end


end

function QinTombTeamAvatar:_enterRunAction( ... )
	-- body
	logWarn("QinTombTeamAvatar:_enterRunAction")
	for i=1, QinTombTeamAvatar.MAX_AVATAR_SIZE do
		local avatarNode = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		avatarNode:setAction("run", true)
		avatarNode:showShadow(true)
		avatarNode:setAniTimeScale(QinTombTeamAvatar.AVATAR_RUN_TIME_SCALE)
		avatarNode:setPosition(QinTombConst.TEAM_AVATAR_RUN_POS[i])
	end
end
function QinTombTeamAvatar:updatePosition( pos )
	-- body
	self:setPosition(pos)
	--for i= 1, QinTombTeamAvatar.MAX_AVATAR_SIZE do 
	--	local avatar = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
	--	if avatar then
	--		local currPosX,currPosY = avatar:getPosition()
	--		local currPos = cc.p(currPosX,currPosY)
			--avatar:syncPosition( cc.pAdd(pos, currPos) )
	--	end
	--end
end


function QinTombTeamAvatar:_didEnterInit()
	logWarn("QinTombTeamAvatar _didEnterInit")

	self:updateTeamData()
	--更新初始位置
	local currPos = self._userData:getCurrPointKeyPos()
	if currPos then
		self:updatePosition(currPos)
	end
end

function QinTombTeamAvatar:_stateChangeCallback(newState, oldState)
	logWarn(string.format("QinTombTeamAvatar _stateChangeCallback newState[%s], oldState[%s]",newState, oldState))

	G_SignalManager:dispatch(SignalConst.EVENT_GRAVE_TEAM_AVATAR_STATE_CHANGE,self._userData,newState,oldState,self)
end

function QinTombTeamAvatar:setAction( animation )
	-- body
	
	for i=1, QinTombTeamAvatar.MAX_AVATAR_SIZE do
		local avatarNode = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		avatarNode:setAction(animation, true)
	end

end


function QinTombTeamAvatar:_didEnterStand()
	logWarn("QinTombTeamAvatar:_didEnterStand")

	for i=1, QinTombTeamAvatar.MAX_AVATAR_SIZE do
		local avatarNode = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		avatarNode:setAction("idle", true)

		avatarNode:setPosition(QinTombConst.TEAM_AVATAR_IDLE_POS[i])
		avatarNode:showShadow(true)
		avatarNode:setAniTimeScale(1)
	end

end

function QinTombTeamAvatar:_didWillExitStand(nextState)
	logWarn(" QinTombTeamAvatar:_didWillExitStand")
end


function QinTombTeamAvatar:_transitionRunToStand(finishFunc)

	finishFunc()
end


function QinTombTeamAvatar:_stopTransitionRunToStand()

end


function QinTombTeamAvatar:_didEnterRun()
	for i=1, QinTombTeamAvatar.MAX_AVATAR_SIZE do
		local avatarNode = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		avatarNode:setAction("run", true)
		avatarNode:showShadow(true)
		avatarNode:setAniTimeScale(QinTombTeamAvatar.AVATAR_RUN_TIME_SCALE)
		avatarNode:setPosition(QinTombConst.TEAM_AVATAR_RUN_POS[i])
	end
	self:_doMoveAvatar()

end


function QinTombTeamAvatar:_didWillExitRun()
	CurveHelper.stopCurveMove(self)
end

function QinTombTeamAvatar:_didExitRun()

end

function QinTombTeamAvatar:_didStopExitRun()

end

function QinTombTeamAvatar:_didEnterAttack()
	logWarn("QinTombTeamAvatar:_didEnterAttack")
	self:syncVisible(false)
end

function QinTombTeamAvatar:_didWillExitAttack( ... )
	-- body
	logWarn("QinTombTeamAvatar:_didWillExitAttack")
	self:syncVisible(true)
end

function QinTombTeamAvatar:_didEnterRelease( ... )
	-- body
	
end

function QinTombTeamAvatar:_didEnterFinish(isWinner)

	for i=1, QinTombTeamAvatar.MAX_AVATAR_SIZE do
		local avatarNode = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		avatarNode:setAction(isWinner and "win" or "dizzy", true)
		avatarNode:showShadow(true)
		avatarNode:setAniTimeScale(1)
	end

end

function QinTombTeamAvatar:_transitionReleaseToInit(finishFunc)
	
	finishFunc()
end

function QinTombTeamAvatar:_didEnterReborn()
	self:syncVisible(false)

	for i=1, QinTombTeamAvatar.MAX_AVATAR_SIZE do
		local avatarNode = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		--avatarNode:setAction("die", false)
	end

	--logWarn("GuildWarRunAvatorNode ----------------  _didEnterReborn")
	local callback = function()
		self:switchState(QinTombTeamAvatar.STAND_STATE)
	end
	local curTime = G_ServerTime:getTime()
	local time = self._userData:getReborn_time()
	local leftTime = math.max(0.01, time -  curTime)
	
	local seq = cc.Sequence:create(cc.DelayTime:create(leftTime),
		cc.CallFunc:create(callback)
	)
	self._nodeRole:stopAllActions()
	self._nodeRole:runAction(seq)

end

function QinTombTeamAvatar:_transitionRebornToStand(finishFunc)
	

	--更新初始位置
	local currPos = self._userData:getCurrPointKeyPos()
	if currPos then
		self:updatePosition(currPos)
		--self:setLocalZOrder(-currPos.y)
	end

	local function eventFunction(event)
		if event == "finish" then
			self._gfxEffect1 = nil
			self._gfxEffect2 = nil
			finishFunc()
		end
	end
	local gfxEffect1 = G_EffectGfxMgr:createPlayGfx(self,"effect_juntuan_chuxian",eventFunction)
	local gfxEffect2 = G_EffectGfxMgr:applySingleGfx(self,"smoving_juntuan_chuxian")
	self._gfxEffect1 = gfxEffect1
	self._gfxEffect2 = gfxEffect2
end

function QinTombTeamAvatar:_stopTransitionRebornToStand()

end

function QinTombTeamAvatar:_didWillExitReborn()
	self:syncVisible(true)
end

function QinTombTeamAvatar:getCurState()
	return self._stateMachine:getCurState()
end



function QinTombTeamAvatar:switchState(state, params, isForceStop)
	self._stateMachine:switchState(state, params, isForceStop)
end

-- Describle：
function QinTombTeamAvatar:onEnter()

end

-- Describle：
function QinTombTeamAvatar:onExit()

end

function QinTombTeamAvatar:updateTeamData( ... )
	-- body
	local teamId = self._teamId
	if teamId then
		local teamUnit = G_UserData:getQinTomb():getTeamById(teamId)
		self._userData = teamUnit
	end
	return nil
end




function QinTombTeamAvatar:updateUI( )
	-- body
	self:clearAvatarState()
	self:updateAvatar()
	--更新初始位置
	local currPos = self._userData:getCurrPointKeyPos()
	if currPos then
		self:updatePosition(currPos)
	end

	--跑步状态则重置成跑步
	if self:getCurState() == QinTombTeamAvatar.RUN_STATE then
		self:_enterRunAction()
	end
end

function QinTombTeamAvatar:updateAvatar( ... )
	-- body
	logWarn("QinTombTeamAvatar:updateAvatar")

	for i=1, QinTombTeamAvatar.MAX_AVATAR_SIZE do
		local avatarNode = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		if avatarNode then
			avatarNode:syncVisible(false)
		end
	end
	self:updateTeamData()

	local teamList = self._userData:getTeamUsers()
	for i ,value in ipairs(teamList) do
		local avatarNode = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		if avatarNode then
			avatarNode:syncVisible(true)
			if value.user_id == G_UserData:getBase():getId() then
				avatarNode:setLocalZOrder(100)
			else
				avatarNode:setLocalZOrder(i)
			end
			avatarNode:updateUI(value, self._userData:getTeamId(), self._userData:getTeamLeaderId())
		end
	end
	

	
end





function QinTombTeamAvatar:_doMoveAvatar(  )
    -- body
	self:updateTeamData()
	local selfPosX,selfPosY = self:getPosition()
	local finalPath = self._userData:getMovingPath(selfPosX,selfPosY)
	if type(finalPath) == "number" then
		return
	end
	--dump( finalPath )
    self._movePathList = finalPath

    self._doingMoving = true  

    self:_loopMoveAvatar()
end

--
function QinTombTeamAvatar:_loopMoveAvatar( ... )
    -- body
    if self._doingMoving == false then
        return
    end

    if self._movePathList and #self._movePathList > 0 then
        local path = self._movePathList[1]
        self:_moveAvatar(path)
        table.remove( self._movePathList, 1)
	else
		if self._userData:isSelfTeamLead() then
			G_SignalManager:dispatch(SignalConst.EVENT_GRAVE_SELF_TEAM_MOVE_END)
		end
		self:switchState(QinTombTeamAvatar.STAND_STATE)
    end
end

function QinTombTeamAvatar:_moveAvatar( path )
    -- body
    local curveConfigList = path.curveLine
    local totalTime = path.time 
	local endTime = path.totalTime


    local function movingEnd( ... )
        logWarn("moving end")
        self:_loopMoveAvatar()
    end

    local function rotateCallback(angle,oldPos,newPos)
		for i=1, QinTombTeamAvatar.MAX_AVATAR_SIZE do
			local avatarNode = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
			if avatarNode then
				if math.floor(math.abs(newPos.x - oldPos.x) ) <= 1 then
					avatarNode:turnBack(false)
				else
					avatarNode:turnBack(newPos.x < oldPos.x)
				end
			end

			local posY = self:getPositionY()
			self:setLocalZOrder(QinTombConst.TEAM_ZORDER-posY)
		end
    end

    local function moveCallback( newPos, oldPos )
        -- body
		self:updatePosition(newPos)
    end

	
    --logWarn(string.format("doCurveMove %d %d",totalTime,endTime))

    --dump(curveConfigList)
    
    CurveHelper.doCurveMove(self,
    movingEnd,
    rotateCallback,
    moveCallback,
    curveConfigList,
    totalTime,
    endTime)
end


function QinTombTeamAvatar:canSwitchToState(nextState,isForceStop)
	return self._stateMachine:canSwitchToState(nextState,isForceStop)
end

function QinTombTeamAvatar:_saveSwitchState(state,params)
	logWarn(" QinTombTeamAvatar:_saveSwitchState   " ..state)
	if self:canSwitchToState(state,false) then
		self._stateMachine:switchState(state, params, true)
	end
end

--是否在可见状态
function QinTombTeamAvatar:isStateVisible( ... )
	local serverState = self._userData:getCurrState()
	if serverState == QinTombConst.TEAM_STATE_MOVING then
		return true
	end
	if serverState == QinTombConst.TEAM_STATE_IDLE then
		return true
	end
	return false
end

--隐藏avatar模型
function QinTombTeamAvatar:setAvatarModelVisible(needVisible)
	-- body
	if needVisible == nil then
		needVisible = false
	end

	for i=1, QinTombTeamAvatar.MAX_AVATAR_SIZE do
		local avatarNode = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		avatarNode:setAvatarModelVisible(needVisible)
	end
end

--同步服务器信息
function QinTombTeamAvatar:synServerInfo(  )
	-- body
	logWarn("QinTombTeamAvatar:synServerInfo")
	local curstate = self:getCurState() --self:getCurState()
	dump(curstate)
	self:updateTeamData()
	local serverState = self._userData:getCurrState()
	dump(serverState)

	local function switchRunningState( serverState )
		local selfPosX,selfPosY = self:getPosition()
		local finalPath = self._userData:getMovingPath(selfPosX, selfPosY)
		if type(finalPath) == "number" then
			return false
		end
		if #finalPath > 0 and serverState == QinTombConst.TEAM_STATE_MOVING then
			logWarn("QinTombTeamAvatar:RUN_STATE xxxxxxxxxxxxxxxxxxxx")
			self:_saveSwitchState(QinTombTeamAvatar.RUN_STATE)
			return true
		end
	end

	local function switchAttackState(serverState)
		--logWarn("QinTombTeamAvatar:switchAttackState")
		if serverState == QinTombConst.TEAM_STATE_HOOK or serverState == QinTombConst.TEAM_STATE_PK then
			logWarn("QinTombTeamAvatar:ATTACK_STATE xxxxxxxxxxxxxxxxxxxx")
			self:_saveSwitchState(QinTombTeamAvatar.ATTACK_STATE)
			return true
		end
		return false
	end

	--切换到死亡状态
	local function switchRebornState(serverState)
		if serverState == QinTombConst.TEAM_STATE_DEATH then
			self:_saveSwitchState(QinTombTeamAvatar.REBORN_STATE)
		end
	end

	local function switchIdleState( serverState )
		if serverState == QinTombConst.TEAM_STATE_IDLE then
			self:_saveSwitchState(QinTombTeamAvatar.STAND_STATE)
		end
	end


	if curstate == QinTombTeamAvatar.STAND_STATE or curstate == QinTombTeamAvatar.INIT_STATE then
		if switchRunningState(serverState) then
			return
		end
		if switchAttackState(serverState) then
			return
		end
	end

	if curstate == QinTombTeamAvatar.ATTACK_STATE or curstate == QinTombTeamAvatar.INIT_STATE then
		if switchRebornState(serverState) then
			return
		end
		if switchIdleState(serverState) then
			return
		end
		if switchRunningState(serverState) then
			return
		end
	end

end


--删除自己时，需要删除玩家头上的文字
function QinTombTeamAvatar:releaseSelf( ... )
	-- body
	for i= 1, QinTombTeamAvatar.MAX_AVATAR_SIZE do 
		local node = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		if node then
			node:releaseSelf()
		end
	end

    self:removeFromParent()
end


function QinTombTeamAvatar:syncVisible( visilbe )
	-- body
	self:setVisible(visilbe)

	for i=1, QinTombTeamAvatar.MAX_AVATAR_SIZE do
		local avatarNode = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		if avatarNode then
			avatarNode:syncVisible(false)
		end
	end

	local teamList = self._userData:getTeamUsers()
	for i, value in ipairs(teamList) do 
		local node = self._nodeRole:getChildByName("_commonHeroAvatar"..i)
		if node then
			node:syncVisible(visilbe)
		end
	end
end


return QinTombTeamAvatar