
-- Author: �û�����
-- Date:2018-07-19 15:24:48
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildWarRunAvatorNode = class("GuildWarRunAvatorNode", ViewBase)
local CurveHelper = require("app.scene.view.guildwarbattle.CurveHelper")
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
local GuildWarConst = require("app.const.GuildWarConst")
local GuildWarUser = require("app.data.GuildWarUser")
local GuildWarUserBuffNode = require("app.scene.view.guildwarbattle.GuildWarUserBuffNode")

GuildWarRunAvatorNode.CREATE_STATE = "Create"
GuildWarRunAvatorNode.INIT_STATE = "Init"
GuildWarRunAvatorNode.STAND_STATE = "Stand"
GuildWarRunAvatorNode.RUN_STATE = "Run"
GuildWarRunAvatorNode.ATTACK_STATE = "Attack"
GuildWarRunAvatorNode.RELEASE_STATE = "Release"
GuildWarRunAvatorNode.GOHOME_STATE = "GoHome"
GuildWarRunAvatorNode.FINISH_STATE = "Finish"
GuildWarRunAvatorNode.REBORN_STATE = "ReBorn"

GuildWarRunAvatorNode.SCALE_AVATAR = 0.5
GuildWarRunAvatorNode.AVATAR_RUN_TIME_SCALE = 1.5--跑步时，加速Avatar速度

GuildWarRunAvatorNode.HIDE_POS = cc.p(-4000,-4000)

function GuildWarRunAvatorNode:ctor(slotDistributor,zorderHelepr,avatarDistributor,userData,isTest)
	self._slotDistributor = slotDistributor
	self._zorderHelepr = zorderHelepr
	self._avatarDistributor = avatarDistributor
	self._userData = GuildWarUser.new(userData)
	self._commonHeroAvatar = nil  --CommonHeroAvatar
	self._nodeAlpha = nil
	self._textName = nil
	self._slotIndex = nil
	self._slotData = { pointId = 0,faceIndex = 0,slotIndex = nil}
	self._hpNode = nil
	self._buffNode = nil
	self._textGuildName = nil
	self._isTest = isTest
	self._finishFunc = nil
	
	

	local resource = {
		file = Path.getCSB("GuildWarRunAvatorNode", "guildwarbattle"),

	}
	GuildWarRunAvatorNode.super.ctor(self, resource)
end

function GuildWarRunAvatorNode:onCreate()
	self:_initStateMachine()

	self:switchState(GuildWarRunAvatorNode.INIT_STATE)
end

function GuildWarRunAvatorNode:onEnter()
end

function GuildWarRunAvatorNode:onExit()
end

function GuildWarRunAvatorNode:_initStateMachine(defaultState)
	if self._stateMachine then
		return
	end
	local cfg = {
	    ["defaultState"] = GuildWarRunAvatorNode.CREATE_STATE,
		["stateChangeCallback"] = handler(self, self._stateChangeCallback),
	    ["state"] = {
			[GuildWarRunAvatorNode.CREATE_STATE] = {
				["nextState"] = {
					[GuildWarRunAvatorNode.INIT_STATE] = {
					},
				},
	        },
			[GuildWarRunAvatorNode.INIT_STATE] = {
				["nextState"] = {
					[GuildWarRunAvatorNode.STAND_STATE] = {
					},
					[GuildWarRunAvatorNode.RUN_STATE] = {		
					},
					[GuildWarRunAvatorNode.REBORN_STATE] = {
					},
				},
				["didEnter"] = handler(self, self._didEnterInit)
	        },
	        [GuildWarRunAvatorNode.STAND_STATE] = {
				["nextState"] = {
					[GuildWarRunAvatorNode.RUN_STATE] = {
					},
					[GuildWarRunAvatorNode.ATTACK_STATE] = {
					},
					[GuildWarRunAvatorNode.RELEASE_STATE] = {
					},
					[GuildWarRunAvatorNode.GOHOME_STATE]  = {
					},
					[GuildWarRunAvatorNode.FINISH_STATE] = {
					},
					[GuildWarRunAvatorNode.REBORN_STATE] = {
					},
				},
				["didEnter"] = handler(self, self._didEnterStand),
				["didExit"] = handler(self, self._didWillExitStand)
	        },
	        [GuildWarRunAvatorNode.RUN_STATE] = {
				["nextState"] = {
					[GuildWarRunAvatorNode.STAND_STATE] = {
						["transition"] = handler(self, self._transitionRunToStand),
						["stopTransition"] = handler(self, self._stopTransitionRunToStand),
					},
					[GuildWarRunAvatorNode.RELEASE_STATE] = {
					},
					[GuildWarRunAvatorNode.FINISH_STATE] = {
					},
					[GuildWarRunAvatorNode.REBORN_STATE] = {
					},
					
				},
			
				["didEnter"] = handler(self, self._didEnterRun),
				["willExit"] = handler(self, self._didWillExitRun),
				["didExit"] = handler(self, self._didExitRun),
				["stopExit"] = handler(self, self._didStopExitRun),
		
	        },
	        [GuildWarRunAvatorNode.ATTACK_STATE] = {
				["nextState"] = {
					[GuildWarRunAvatorNode.STAND_STATE] = {
					},
					[GuildWarRunAvatorNode.RUN_STATE] = {
					},
					[GuildWarRunAvatorNode.RELEASE_STATE] = {
					},
					[GuildWarRunAvatorNode.FINISH_STATE] = {
					},
					[GuildWarRunAvatorNode.REBORN_STATE] = {
					},
				},
				["didEnter"] = handler(self, self._didEnterAttack),
				["willExit"] = handler(self, self._didWillExitAttack),
	        },
			[GuildWarRunAvatorNode.RELEASE_STATE] = {
				["nextState"] = {
					[GuildWarRunAvatorNode.INIT_STATE] = {
						["transition"] = handler(self, self._transitionReleaseToInit),
					},
				},
				["didEnter"] = handler(self, self._didEnterRelease)
	        },

			[GuildWarRunAvatorNode.GOHOME_STATE] = {
				["nextState"] = {
					[GuildWarRunAvatorNode.RELEASE_STATE] = {
					},
					[GuildWarRunAvatorNode.FINISH_STATE] = {
					},
				},
				["didEnter"] = handler(self, self._didEnterGoHome),
				["willExit"] = handler(self, self._didWillExitGoHome),
	        },

			[GuildWarRunAvatorNode.FINISH_STATE] = {
				["nextState"] = {
				},
				["didEnter"] = handler(self, self._didEnterFinish)
	        },

			[GuildWarRunAvatorNode.REBORN_STATE] = {
				["nextState"] = {
					[GuildWarRunAvatorNode.STAND_STATE] = {
						["transition"] = handler(self, self._transitionRebornToStand),
						["stopTransition"] = handler(self, self._stopTransitionRebornToStand),
					},
				},
				["didEnter"] = handler(self, self._didEnterReborn),
				["willExit"] = handler(self, self._didWillExitReborn),
				
	        },

	    }
	}

	local StateMachine = require("app.scene.view.countrybossbigboss.StateMachine")
	self._stateMachine = StateMachine.new(cfg)
end

function GuildWarRunAvatorNode:_stateChangeCallback(newState, oldState)

	--logWarn(string.format("GuildWarRunAvatorNode  stateChangeCallback %s %s ",oldState,newState))

--[[
	if ( (oldState == GuildWarRunAvatorNode.STAND_STATE and  
		newState ~= GuildWarRunAvatorNode.ATTACK_STATE) 
		or 
		(oldState == GuildWarRunAvatorNode.ATTACK_STATE and  
		newState ~= GuildWarRunAvatorNode.STAND_STATE)
	)
	then
		self:_releaseSlotIndex()
	end
]]
	
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_AVATAR_STATE_CHANGE,self._userData,newState,oldState,self)
	if oldState == GuildWarRunAvatorNode.RUN_STATE and self._userData then
		local oldPointId = self._userData:getOld_point()
		local nowPointId = self._userData:getNow_point()
		local userId = self._userData:getUser_id()
		local changedPointMap = {} 
		local changedUserMap = {} 
		changedPointMap[oldPointId] = true
		changedPointMap[nowPointId] = true
		changedUserMap[userId] =  true
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_POINT_CHANGE,self._userData:getCity_id(),
			changedPointMap,changedUserMap)
	end


	if newState == GuildWarRunAvatorNode.INIT_STATE then
		local isSelfBorn = self._userData:isInBorn() and self._userData:isSelf()
		if isSelfBorn then	-- 自己复活
			self:switchState(GuildWarRunAvatorNode.REBORN_STATE)
		else
			local isRun = self._userData:getCurrPoint() == 0
			self:switchState(isRun and GuildWarRunAvatorNode.RUN_STATE or 
				GuildWarRunAvatorNode.STAND_STATE
			)
		end
		
	end


	--测试代码
	if (oldState == GuildWarRunAvatorNode.RUN_STATE or  oldState == GuildWarRunAvatorNode.REBORN_STATE) and 
		newState == GuildWarRunAvatorNode.STAND_STATE and self._isTest == true then

		local oldPoint = self._userData:getNow_point()
		local movePointList = GuildWarDataHelper.findShowMoveSignPointList(self._userData:getCity_id(),oldPoint)
		local index = math.random(1,#movePointList)
		local destPointId = movePointList[index].pointId
		local cityId =  self._userData:getCity_id() 
		--logWarn("-------------------goHome  "..cityId.."  "..tostring(oldPoint))
		local  nowPoint = destPointId
		local  moveTime = G_ServerTime:getTime() + 3--TODO读取配置


		self._userData:setOld_point(oldPoint)
		self._userData:setNow_point(nowPoint)
		self._userData:setMove_time(moveTime)

		self:switchState(GuildWarRunAvatorNode.RUN_STATE)

	end

end

function GuildWarRunAvatorNode:_didEnterInit()
	local function getAvatarLimit(avatarBaseId)
		local limit = 0
		if avatarBaseId > 0 then
			local HeroConst = require("app.const.HeroConst")
			limit = tonumber(require("app.config.avatar").get(avatarBaseId).limit) > 0 and HeroConst.HERO_LIMIT_RED_MAX_LEVEL or 0
		end
		return limit
	end

	if not self._commonHeroAvatar then
		local cityId =  self._userData:getCity_id() 
		local guildId = GuildWarDataHelper.getMyGuildWarGuildId(cityId)
		local isSameGuild = self._userData:getGuild_id() == guildId
		local showAvatar = true--math.random(isSameGuild and 20 or 1,60) > 30
		if showAvatar then
			showAvatar = self._avatarDistributor:retainAvatar()
		end
		--logWarn("didEnterInit-------------- "..tostring(showAvatar))
		if showAvatar or self._userData:isSelf() then
			local CSHelper = require("yoka.utils.CSHelper")
			self._commonHeroAvatar = CSHelper.loadResourceNode(Path.getCSB("CommonSimpleHeroAvatar", "common"))
			self:addChild(self._commonHeroAvatar)
			--self._commonHeroAvatar:updateUserName(self._userData:getUser_name(), self._userData:getOfficer_level())
			--self._commonHeroAvatar:updateNameHeight(123)
			--self._commonHeroAvatar:setNameSize(18)
		end
	end

	if self._commonHeroAvatar then
		local avatarId =  G_UserData:getBase():getAvatar_base_id()
		if self._userData:isSelf() and avatarId ~= self._userData._playerInfo.avatarBaseId then
			local limit = getAvatarLimit(avatarId)
			local myHeroId = G_UserData:getHero():getRoleBaseId()
			local playerBaseId = G_UserData:getBase():getPlayerBaseId()
			myHeroId = (playerBaseId > 0 and playerBaseId or myHeroId)
			self._commonHeroAvatar:updateUI(myHeroId, "", false, limit)
		else
			self._commonHeroAvatar:updateUI(self._userData._playerInfo.covertId, "", false, getAvatarLimit(self._userData._playerInfo.avatarBaseId))
		end
		self._commonHeroAvatar:setScale(GuildWarRunAvatorNode.SCALE_AVATAR)
	end

	self._textGuildName:setString(self._userData:getGuild_name())
	self._textName:setString(self._userData:getUser_name())


	self:_refreshColor()

	
	if self._hpNode then
		self._hpNode:setVisible(false)
	end

	if self._userData:isSelf() then
		if not self._hpNode  then
			local GuildWarUserHpNode = require("app.scene.view.guildwarbattle.GuildWarUserHpNode")
			self._hpNode = GuildWarUserHpNode.new()	
			self._hpNode:setPosition(0,100)
			self:addChild(self._hpNode)
		end
		self._hpNode:setVisible(true)
	end

	self:_refreshUserHp()

	if not self._buffNode then
		self._buffNode = GuildWarUserBuffNode.new()
		self._buffNode:setPosition(0,115)
		self:addChild(self._buffNode)
	end
	self:_updateUserBuff()

end






function GuildWarRunAvatorNode:_didEnterStand()
	--获取一个站位点
	self:_retainSlotIndex()
	

	if self._commonHeroAvatar then
		local pointId = self._userData:getNow_point()
		local faceIndex = self:_getFaceId(pointId)

		self._commonHeroAvatar:setAction("idle", true)
		self._commonHeroAvatar:showShadow(true)
		self._commonHeroAvatar:turnBack(faceIndex == 2)
		self._commonHeroAvatar:setAniTimeScale(1)
	end
	self:_refreshUserHp()
	self:_updateUserBuff()
end


function GuildWarRunAvatorNode:_didWillExitStand(nextState)
	if nextState ~= GuildWarRunAvatorNode.ATTACK_STATE then
		self:_releaseSlotIndex()
	end
end


function GuildWarRunAvatorNode:_didEnterRun()
	if self._commonHeroAvatar then
		self._commonHeroAvatar:setAction("run", true)
		self._commonHeroAvatar:showShadow(true)
		self._commonHeroAvatar:setAniTimeScale(GuildWarRunAvatorNode.AVATAR_RUN_TIME_SCALE)
	end

	local finishCallback = function() 
		local currPoint = self._userData:getCurrPoint()
		--assert(currPoint ~= 0 , "GuildWarRunAvatorNode move action end but currPoint equal 0 ")

		--自己不要回收
		--if not self._userData:isSelf() and self._isTest == false and math.random(1,100) > 99 then --一定概率回收
			--logWarn("  GuildWarRunAvatorNode  recycle")
		--	self:switchState(GuildWarRunAvatorNode.RELEASE_STATE)
		--else	
			self:switchState(GuildWarRunAvatorNode.STAND_STATE,nil,true)--changeRunPath需要强制刷成STAND_STATE
		--end
	end

	self:_doCurveMove(finishCallback)
end


function GuildWarRunAvatorNode:_transitionRunToStand(finishFunc)
	local isSelf = self._userData:isSelf() 
	if not isSelf  then
		--做消失动画
		if self._commonHeroAvatar then
			self._commonHeroAvatar:setAniTimeScale(1)
			self._commonHeroAvatar:setAction("idle", true)
		end
		--self._finishFunc = finishFunc
		--print("_transitionRunToStand ")
		self._nodeAlpha:stopAllActions()
		self._nodeAlpha:setOpacity(255)

		local fadeOut = cc.FadeTo:create(0.75,0)
		local seq = cc.Sequence:create(fadeOut,cc.DelayTime:create(0.2),
			cc.CallFunc:create(function(actionNode)
				--print("_transitionRunToStand ok")
				self._nodeAlpha:setOpacity(255)
				finishFunc()
			end)
		)
		self._nodeAlpha:runAction(seq)
	
	else
		finishFunc()	
	end
		
end

function GuildWarRunAvatorNode:_stopTransitionRunToStand()
	local isSelf = self._userData:isSelf() 
	if not isSelf then
		--print("_transitionRunToStand fail")
		self._nodeAlpha:stopAllActions()
		self._nodeAlpha:setOpacity(255)
	
	end
end

function GuildWarRunAvatorNode:_didWillExitRun()
	CurveHelper.stopCurveMove(self)
end

function GuildWarRunAvatorNode:_didExitRun()
end

function GuildWarRunAvatorNode:_didStopExitRun()
end



function GuildWarRunAvatorNode:_didEnterGoHome()
	if self._commonHeroAvatar then
		self._commonHeroAvatar:setAction("run", true)
		self._commonHeroAvatar:showShadow(true)
		self._commonHeroAvatar:setAniTimeScale(GuildWarRunAvatorNode.AVATAR_RUN_TIME_SCALE)
	end
	local finishCallback = function() 
		local cityId = self._userData:getCity_id()
		local exitCityId = GuildWarDataHelper.getGuildWarExitCityId(cityId)
		--logWarn("GuildWarRunAvatorNode  didEnterGoHome "..tostring(exitCityId))
		G_UserData:getGuildWar():c2sEnterGuildWar(exitCityId)
		self:switchState(GuildWarRunAvatorNode.RELEASE_STATE)

	end

	self:_doCurveMove(finishCallback)
end

function GuildWarRunAvatorNode:_didWillExitGoHome()
	CurveHelper.stopCurveMove(self)
end


function GuildWarRunAvatorNode:_didEnterAttack()
--	logWarn("didEnterAttack------------start")

	if self._commonHeroAvatar then
		self._spineCallback = function()
		--	logWarn("didEnterAttack------------call")
			self._spineCallback = nil		
			self:switchState(GuildWarRunAvatorNode.STAND_STATE)
		end

		self._commonHeroAvatar:setAction("skill1", false)
		self._commonHeroAvatar:addSpineLoadHandler(self._spineCallback)
		
		self._commonHeroAvatar:showShadow(true)
		self._commonHeroAvatar:setAniTimeScale(1)

	end
	self:_refreshUserHp()
	self:_updateUserBuff()
end

function GuildWarRunAvatorNode:_didWillExitAttack(nextState)
	--logWarn("didEnterAttack------------end")

	if nextState ~= GuildWarRunAvatorNode.STAND_STATE then
		self:_releaseSlotIndex()
	end


	if self._commonHeroAvatar then
		if self._spineCallback then
			self._commonHeroAvatar:removeSpineLoadHandler(self._spineCallback)
			self._spineCallback = nil
		end
	end


end

function  GuildWarRunAvatorNode:_didEnterRelease()
	self:setVisible(false)
	self._isTest = false
end

function GuildWarRunAvatorNode:_didEnterFinish(isWinner)
	if self._commonHeroAvatar then
		self._commonHeroAvatar:setAction(isWinner and "win" or "dizzy", true)
		self._commonHeroAvatar:showShadow(true)
		self._commonHeroAvatar:setAniTimeScale(1)
	end


end

function GuildWarRunAvatorNode:_transitionReleaseToInit(finishFunc)
	self:setVisible(true)
	finishFunc()
end

function GuildWarRunAvatorNode:_didEnterReborn()
	self:_goCamp()
	self:setVisible(false)

	self:_retainSlotIndex()

	--logWarn("GuildWarRunAvatorNode ----------------  _didEnterReborn")
	local callback = function()
		self:switchState(GuildWarRunAvatorNode.STAND_STATE)
	end
	local curTime = G_ServerTime:getTime()
	local time = self._userData:getRelive_time()
	local leftTime = math.max(0.01, time -  curTime)
	
	local seq = cc.Sequence:create(cc.DelayTime:create(leftTime),
		cc.CallFunc:create(callback)
	)
	self._nodeAlpha:stopAllActions()
	self._nodeAlpha:runAction(seq)
end

function GuildWarRunAvatorNode:_transitionRebornToStand(finishFunc)
	self:setVisible(true)
	--播放特效
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

	logWarn("GuildWarRunAvatorNode ----------------  _transitionRebornToStand")
end

function GuildWarRunAvatorNode:_stopTransitionRebornToStand()
	if self._gfxEffect1 then
		self._gfxEffect1:removeFromParent()
	end
	if self._gfxEffect2 then
		self._gfxEffect2:removeFromParent()
	end
	self._gfxEffect1 = nil
	self._gfxEffect2 = nil
end

function GuildWarRunAvatorNode:_didWillExitReborn(nextState)
	if nextState ~= GuildWarRunAvatorNode.STAND_STATE then
		self:_releaseSlotIndex()
	end

	self._nodeAlpha:stopAllActions()
	self:setVisible(true)
end

function GuildWarRunAvatorNode:getCurState()
	return self._stateMachine:getCurState()
end

function GuildWarRunAvatorNode:canSwitchToState(nextState,isForceStop)
	return self._stateMachine:canSwitchToState(nextState,isForceStop)
end

function GuildWarRunAvatorNode:switchState(state, params, isForceStop)
	self._stateMachine:switchState(state, params, isForceStop)
end

function GuildWarRunAvatorNode:_saveSwitchState(userData,state,params)
	if self:canSwitchToState(state,isForceStop) then
		if state ~= GuildWarRunAvatorNode.RELEASE_STATE then
			self._userData:updateUser(userData) 
		end
		self._stateMachine:switchState(state, params, true)
	end
end

function GuildWarRunAvatorNode:getGuildWarUser()
	return self._userData
end

function GuildWarRunAvatorNode:isInRelease()
	return  self:getCurState() == GuildWarRunAvatorNode.RELEASE_STATE 
end


function GuildWarRunAvatorNode:_getFaceId(pointId)
	--[[
	local faceId = 1
	local user = G_UserData:getGuildWar():getMyWarUser(self._userData:getCity_id())
	if user:getPk_type() == GuildWarConst.CAMP_TYPE_DEFENDER then
		faceId = 2
	end
	if self._userData:getGuild_id() ~= user:getGuild_id() then
		if faceId == 1 then
			faceId = 2
		else
			faceId = 1
		end
	end
]]


	local faceId = 1
	if self._userData:getPk_type() == GuildWarConst.CAMP_TYPE_DEFENDER then
		faceId = 2
	end

	local oldPoint = self._userData:getOld_point()
	local nowPoint = self._userData:getNow_point()
	local cityId = self._userData:getCity_id()
	
	if oldPoint ~= nowPoint and oldPoint ~= 0 then
		local oldPointConfig = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,oldPoint)
		local nowPointConfig = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId,nowPoint)
		if oldPointConfig.clickPos.x < nowPointConfig.clickPos.x then
			faceId = 1		
		else
			faceId = 2
		end

		
	end
--[[
	local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(self._userData:getCity_id(),
        pointId)
	if config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK then
		faceId = 1
	elseif config.point_type == GuildWarConst.POINT_TYPE_CAMP_DEFENDER  then
		faceId = 2
	end
]]
	return  faceId
end

function GuildWarRunAvatorNode:_setSlotPosition(pointId,faceIndex,newSlot)
	self._slotIndex = newSlot
	self._slotData.pointId = pointId
	self._slotData.faceIndex = faceIndex
	self._slotData.slotIndex = newSlot

	local cityId =  self._userData:getCity_id() 

	--据点ID，和槽ID，读取出位置
	local x,y = GuildWarDataHelper.getSlotPosition(cityId,pointId,faceIndex,newSlot)
	--logWarn(pointId.."-------GuildWarRunAvatorNode-------"..newSlot)
	self:setPosition(x,y)

	self:_adjustZOrder()

	
end

function GuildWarRunAvatorNode:_retainSlotIndex()
	--logWarn("GuildWarRunAvatorNode  retainSlotIndex")
	if not self._slotIndex  then
		local isSelf = self._userData:isSelf() 
		local pointId = self._userData:getNow_point()
		local faceIndex = self:_getFaceId(pointId)

		local newSlot = nil
		if isSelf then
			newSlot = GuildWarConst.SELF_SLOT_INDEX 
		else
			local show = true
			local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(self._userData:getCity_id(),
						pointId)
			if config.point_type == GuildWarConst.POINT_TYPE_CAMP_ATTACK then
				local user = G_UserData:getGuildWar():getMyWarUser(self._userData:getCity_id())
				if self._userData:getGuild_id() ~= user:getGuild_id() and  user:getBorn_point_id() == pointId then --只有在主角大本营才不显示
					show = false
				end
			end
			if show then
				newSlot = self._slotDistributor:retainPointSlot(pointId,faceIndex)
			end
			
		end

		--logWarn(
		--		string.format("GuildWarRunAvatorNode  retainSlotIndex %s %s %s",tostring(pointId),tostring(faceIndex),tostring(newSlot))
		--)
		if newSlot then
			self:_setSlotPosition(pointId,faceIndex,newSlot)
		else
			self:setPosition(GuildWarRunAvatorNode.HIDE_POS)	
		end
	end
end

--释放站位位置
function GuildWarRunAvatorNode:_releaseSlotIndex()
	if self._slotIndex  then
		if self._slotIndex  > GuildWarConst.SELF_SLOT_INDEX  then

			local pointId = self._slotData.pointId
			local faceIndex = self._slotData.faceIndex
		
			self._slotDistributor:releasePointSlot(pointId,faceIndex,self._slotIndex )
		end
		self._slotIndex = nil
	end
end

--切换据点（被打回大本营）
function GuildWarRunAvatorNode:_changePoint(nowUserData)
	logWarn("GuildWarRunAvatorNode changePoint")


	local oldPointId = self._userData:getNow_point()
	local nowPointId = nowUserData:getNow_point()
	local userId = self._userData:getUser_id()


	self:_releaseSlotIndex()
	self._userData:updateUser(nowUserData)
	self:_retainSlotIndex()

	if self._commonHeroAvatar then	

		local pointId = self._userData:getNow_point()
		local faceIndex = self:_getFaceId(pointId)

		self._commonHeroAvatar:setAction("idle", true)
		self._commonHeroAvatar:showShadow(true)
		self._commonHeroAvatar:turnBack(faceIndex == 2)
		self._commonHeroAvatar:setAniTimeScale(1)
	end

	self:_refreshUserHp()
	self:_updateUserBuff()


	local changedPointMap = {} 
	local changedUserMap = {} 
	changedPointMap[oldPointId] = true
	changedPointMap[nowPointId] = true
	changedUserMap[userId] =  true
	dump(changedPointMap)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_POINT_CHANGE,self._userData:getCity_id(),
		changedPointMap,changedUserMap)

end

function GuildWarRunAvatorNode:_changeRunPath(nowUserData)
	--logWarn("didEnterAttack------------_changeRunPath")
	
	CurveHelper.stopCurveMove(self)
	self:_stopTransitionRunToStand()
	self._userData:updateUser(nowUserData) 
	self:_didEnterRun()
end

function GuildWarRunAvatorNode:_doCurveMove(finishCallback)
	local isSelf = self._userData:isSelf() 
	local slotIndex = self._slotIndex--此时还有被释放

	
	local cityId =  self._userData:getCity_id() 
	local startPointId = self._userData:getOld_point()--开始据点id 
	local endPointId = self._userData:getNow_point()--终点据点id 
	local faceIndex = self:_getFaceId(startPointId)



	if not slotIndex then
		if isSelf then
			slotIndex = GuildWarConst.SELF_SLOT_INDEX 
		else
			slotIndex = math.random( GuildWarConst.SELF_SLOT_INDEX  + 1,
				GuildWarDataHelper.getStandPointNum(cityId,startPointId,faceIndex))	
		end
	end


	--logWarn(string.format("doCurveMove ss %d %d %d",cityId,startPointId,endPointId))
	
	local time = G_ServerTime:getTime()
	local curveConfigList = GuildWarDataHelper.getCurveConfigList(cityId,startPointId,endPointId,faceIndex,slotIndex)
	local totalTime = GuildWarDataHelper.getPathRunTime(cityId,startPointId,endPointId)
	local startPointPos = curveConfigList[1][1]
	local endPointPos = curveConfigList[#curveConfigList][4]
--	logWarn(string.format("doCurveMove %d %d %d",totalTime,time,self._userData:getMove_time()))
	CurveHelper.doCurveMove(self,
		finishCallback,
		function(angle,oldPos,newPos) 
			--logWarn(string.format("GuildWarRunAvatorNode angle %d %d %d ",angle,oldPos.x,newPos.x))
			if self._commonHeroAvatar then
				if math.floor(math.abs(newPos.x - oldPos.x) ) <= 1 then
					--logWarn(string.format("GuildWarRunAvatorNode angle xx %d %d %d ",angle,startPointPos.x,endPointPos.x))
					self._commonHeroAvatar:turnBack(endPointPos.x < startPointPos.x)
				else
					self._commonHeroAvatar:turnBack(newPos.x < oldPos.x)
				end
			end

		end,
		handler(self,self._adjustZOrder),
		curveConfigList,totalTime * 1000,self._userData:getMove_time()*1000)	
end

function GuildWarRunAvatorNode:use(userData)
	local curstate = self:getCurState()
	if curstate == GuildWarRunAvatorNode.RELEASE_STATE then
		self._userData:updateUser(userData)
		self:switchState(GuildWarRunAvatorNode.INIT_STATE)
	end
	
end


function GuildWarRunAvatorNode:goHome(pointId)
	local curstate = self:getCurState()
	if curstate == GuildWarRunAvatorNode.STAND_STATE then
	
		local oldPoint = self._userData:getNow_point()
		local cityId =  self._userData:getCity_id() 
		--logWarn("-------------------goHome  "..cityId.."  "..tostring(oldPoint))
		local  nowPoint = pointId
		local  moveTime = G_ServerTime:getTime() + 14--TODO读取配置

		self._userData:setOld_point(oldPoint)
		self._userData:setNow_point(nowPoint)
		self._userData:setMove_time(moveTime)

	
		self:switchState(GuildWarRunAvatorNode.GOHOME_STATE)
	end
	
end

function GuildWarRunAvatorNode:doFinish(guildId)
	local isWinner = self._userData:getGuild_id() == guildId
	self:switchState(GuildWarRunAvatorNode.FINISH_STATE,isWinner)
end

function GuildWarRunAvatorNode:doAttack()
	self:switchState(GuildWarRunAvatorNode.ATTACK_STATE)
end

function GuildWarRunAvatorNode:_goCamp()
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_GO_CAMP_NOTICE,self._userData)
end

function GuildWarRunAvatorNode:_adjustZOrder()
	local x,y = self:getPosition()
	self:setLocalZOrder(self._zorderHelepr:getZOrder(x,y))
end

function GuildWarRunAvatorNode:isSelf()
	local curstate = self:getCurState()
	if curstate == GuildWarRunAvatorNode.RELEASE_STATE then
		return false
	end
	return self._userData:isSelf()
end

function GuildWarRunAvatorNode:_refreshUserHp()
	if self._hpNode and self._userData:isSelf()  then
		local maxHp = GuildWarDataHelper.getGuildWarHp(self._userData)
		local hp = self._userData:getWar_value()
	--	logWarn(hp.." GuildWarRunAvatorNode "..maxHp)
		self._hpNode:updateInfo(hp,maxHp)
	end
end

function GuildWarRunAvatorNode:_updateUserBuff()
	if self._buffNode then
		local buffBaseIds = self._userData:getTree_buff()
		self._buffNode:updateUI(buffBaseIds)
	end
end

function GuildWarRunAvatorNode:_refreshColor()
	local isSelf = self._userData:isSelf()
	local cityId =  self._userData:getCity_id() 
	local guildId = GuildWarDataHelper.getMyGuildWarGuildId(cityId)
	local isSameGuild = self._userData:getGuild_id() == guildId
	if isSelf then
		self._textGuildName:setColor(Colors.GUILD_WAR_MY_COLOR)
		self._textGuildName:enableOutline(Colors.GUILD_WAR_MY_COLOR_OUTLINE , 2)
		self._textName:setColor(Colors.GUILD_WAR_MY_COLOR)
		self._textName:enableOutline(Colors.GUILD_WAR_MY_COLOR_OUTLINE , 2)
	elseif isSameGuild then
		self._textGuildName:setColor(Colors.GUILD_WAR_SAME_GUILD_COLOR)
		self._textGuildName:enableOutline(Colors.GUILD_WAR_SAME_GUILD_COLOR_OUTLINE , 2)
		self._textName:setColor(Colors.GUILD_WAR_SAME_GUILD_COLOR)
		self._textName:enableOutline(Colors.GUILD_WAR_SAME_GUILD_COLOR_OUTLINE , 2)
	else
		self._textGuildName:setColor(Colors.GUILD_WAR_ENEMY_COLOR)
		self._textGuildName:enableOutline(Colors.GUILD_WAR_ENEMY_COLOR_OUTLINE , 2)
		self._textName:setColor(Colors.GUILD_WAR_ENEMY_COLOR)
		self._textName:enableOutline(Colors.GUILD_WAR_ENEMY_COLOR_OUTLINE , 2)
		
	end
	if self._commonHeroAvatar then
		if isSameGuild then
			--self._commonHeroAvatar:setNameColor(Colors.GUILD_WAR_MY_COLOR,Colors.GUILD_WAR_MY_COLOR_OUTLINE)
		else
			--self._commonHeroAvatar:setNameColor(Colors.GUILD_WAR_ENEMY_COLOR,Colors.GUILD_WAR_ENEMY_COLOR_OUTLINE)
		end
	end
end

function GuildWarRunAvatorNode:isShowAvatar()
	if self._commonHeroAvatar and self._commonHeroAvatar:isVisible() then
		return true
	end
	return false
end

function GuildWarRunAvatorNode:syn(nowUserData)
	local curstate = self._stateMachine:getCurState() --self:getCurState()
	if curstate == GuildWarRunAvatorNode.RELEASE_STATE then
		return
	end
--[[
	if nowUserData then
		local hp = self._userData.war_value_--self._userData:getWar_value() 
		local newHp = nowUserData.war_value_--nowUserData:getWar_value()
		if hp ~= newHp then
			self._userData:setWar_value(newHp) 
			self:_refreshUserHp()
		end
	end
	]]

	--这里不用处理INIT_STATE状态，设置INIT_STATE后马上切到STAND_STATE or RUN_STATE
	if curstate == GuildWarRunAvatorNode.STAND_STATE or 
		curstate == GuildWarRunAvatorNode.ATTACK_STATE  then
		local isChangeCity = not nowUserData or  (self._userData.city_id_ ~= nowUserData.city_id_ )

		 if isChangeCity then	
		 	--其他玩家直接消失掉
			self:_saveSwitchState(nowUserData,GuildWarRunAvatorNode.RELEASE_STATE)
		elseif nowUserData:isInBorn() and nowUserData:isSelf() then
			logWarn("GuildWarRunAvatorNode REBORN_STATE")
			self:_saveSwitchState(nowUserData,GuildWarRunAvatorNode.REBORN_STATE)	
		elseif not nowUserData:isSelf() and nowUserData:isInBornForBuff() then --别人因为buff复活 
			logWarn("GuildWarRunAvatorNode REBORN_STATE BUFF")
			self:_saveSwitchState(nowUserData,GuildWarRunAvatorNode.REBORN_STATE)	
		 else

		 	local a = self._userData:getCurrPoint() 
			local aStartPoint = self._userData.old_point_--self._userData:getOld_point() 
			local aEndPoint = self._userData.now_point_ --self._userData:getNow_point() 
		
			local b = nowUserData:getCurrPoint() 
			local bStartPoint = nowUserData.old_point_--nowUserData:getOld_point() 
			local bEndPoint = nowUserData.now_point_--nowUserData:getNow_point() 
	
			local bornPointId = nowUserData.born_point_id_--nowUserData:getBorn_point_id()
			
			--logWarn(string.format("changePoint syn %d  %d %d %d %d",b,aEndPoint,bEndPoint,aStartPoint,bStartPoint))
			--1.据点跑出  2.据点切换

			if b ~= 0 then 
				if bEndPoint ~= aEndPoint then--据点切换
					
					self:_changePoint(nowUserData)
--[[
					if bornPointId == bEndPoint then--回到大本营
						self:_goCamp()
					end
]]
				end
			else 
				--[[
				if bStartPoint == aEndPoint then --从当前站立点起跑
				else--从其他点起跑
				end
				]]
				--从据点跑出
				 self:_saveSwitchState(nowUserData,GuildWarRunAvatorNode.RUN_STATE)
			end

		 end
		
	elseif curstate == GuildWarRunAvatorNode.RUN_STATE then
		local isChangeCity = not nowUserData or  (self._userData.city_id_ ~= nowUserData.city_id_ )
		if isChangeCity then
			self:_saveSwitchState(nowUserData,GuildWarRunAvatorNode.RELEASE_STATE)
		elseif nowUserData:isInBorn() and nowUserData:isSelf() then 
			self:_saveSwitchState(nowUserData,GuildWarRunAvatorNode.REBORN_STATE)
		else
			local a = self._userData:getCurrPoint() -- 有可能不等于0，也就是说跑到了目标点（因为action那里有刷新间隔） 
			local aStartPoint = self._userData.old_point_ --self._userData:getOld_point() 
			local aEndPoint = self._userData.now_point_  --self._userData:getNow_point() 

			local b = nowUserData:getCurrPoint() 
			local bStartPoint = nowUserData.old_point_--nowUserData:getOld_point() 
			local bEndPoint = nowUserData.now_point_--nowUserData:getNow_point() 
			local bornPointId = nowUserData.born_point_id_--nowUserData:getBorn_point_id()
			--1.在其他据点  2.提前跑到目标点 3.跑其他路径 4.跑同一条路径  

			--logWarn(string.format("changePoint syn %d  %d %d %d %d",b,aEndPoint,bEndPoint,aStartPoint,bStartPoint))

			if b == 0 then	--最新数据表明此角色在跑图
				if bStartPoint ~= aStartPoint  or bEndPoint ~= aEndPoint then--跑其他路径
					--TODO 直接切换跑图路径，还是等待上一个路径跑完
					self:_changeRunPath(nowUserData)
				else--跑同一条路径
				end
			else --最新数据表明此角色在据点上
				if bEndPoint ~= aEndPoint then --在其他据点 
					
					self:_saveSwitchState(nowUserData,GuildWarRunAvatorNode.STAND_STATE)
--[[
					if bornPointId == bEndPoint then--回到大本营
						self:_goCamp()
					end
					]]
				else--提前跑到目标点

				end
			end

		
		end
	end

	local newstate = self._stateMachine:getCurState()
	--logWarn("GuildWarRunAvatorNode ---------------- "..newstate)
	if newstate == GuildWarRunAvatorNode.STAND_STATE or 
		newstate ==	GuildWarRunAvatorNode.ATTACK_STATE  then

		if nowUserData then
			local hp = self._userData.war_value_--self._userData:getWar_value() 
			local newHp = nowUserData.war_value_--nowUserData:getWar_value()
			if hp ~= newHp then
				self._userData:setWar_value(newHp) 
				self:_refreshUserHp()
			end
		end
		
		self:_updateUserBuff()
	end

end

return GuildWarRunAvatorNode