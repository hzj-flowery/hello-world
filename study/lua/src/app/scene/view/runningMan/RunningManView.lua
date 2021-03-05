
-- Author: hedili
-- Date:2018-04-19 14:10:14
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local RunningManView = class("RunningManView", ViewBase)
local RunningManScrollView = import(".RunningManScrollView")
local PopupRunningManResult = import(".PopupRunningManResult")
local RunningManHelp = require("app.scene.view.runningMan.RunningManHelp")
local RunningManMiniMap = require("app.scene.view.runningMan.RunningManMiniMap")
local RunningManConst = require("app.const.RunningManConst")
local AudioConst = require("app.const.AudioConst")
local UTF8 = require("app.utils.UTF8")
local MAX_TIME = 3


function RunningManView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end

	local currState = RunningManHelp.getRunningState()
	--过了投注阶段，可以拉取比赛结果数据
	if currState >= RunningManConst.RUNNING_STATE_WAIT then
		--跑步结果信息
		G_UserData:getRunningMan():c2sPlayHorseInfo()
		--G_UserData:getRunningMan():c2sPlayHorseResult()
    	local signal = G_SignalManager:add(SignalConst.EVENT_PLAY_HORSE_RESULT_SUCCESS, onMsgCallBack)
		return signal
	else
		--赌注信息
		G_UserData:getRunningMan():c2sPlayHorseInfo()
	    local signal = G_SignalManager:add(SignalConst.EVENT_PLAY_HORSE_INFO_SUCCESS, onMsgCallBack)
		return signal
	end

end


function RunningManView:ctor()

	--csb bind var name
	self._commonChat = nil  --CommonMiniChat
	self._commonHelp = nil  --CommonHelp
	self._panelbk = nil  --Panel
	self._topbarBase = nil  --CommonTopbarBase
	self._betIcon = nil 	--投注按钮
	self._commonCountDown = nil

	self._gfxEffect = nil -- 特效对象
	self._popupResult = nil --弹出结束界面
	self._interVal = 0 --UI更新时间
	self._runningEndEventTimes = 0 --跑步结束事件
	local resource = {
		file = Path.getCSB("RunningManView", "runningMan"),
		size = G_ResolutionManager:getDesignSize(),
	}
	RunningManView.super.ctor(self, resource)
end

-- Describle：

function RunningManView:onCreate()
	--G_UserData:getRunningMan():makePlayHourseInfo()
	G_UserData:getRunningMan():resetTalkList()
	--
	self._topbarBase:setImageTitle("txt_sys_com_run")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_RUNNING_MAN)

	--初始化跑道
	local scrollView = RunningManScrollView.new()
	self._scrollView = scrollView
	self._nodeScroll:addChild(scrollView)
	
	self._betIcon:updateUI(FunctionConst.FUNC_RUNNING_BET)
	self._betIcon:addClickEventListenerEx(handler(self, self._onClickIcon))

	--初始化小地图
	local miniMap = RunningManMiniMap.new()
	self._nodeMiniMap:addChild(miniMap)
	self._nodeMiniMap:setVisible(false)
	self._miniMap = miniMap
	self._commonHelp:updateUI(FunctionConst.FUNC_RUNNING_MAN)

    self._timeOriginPosX = self._topTime:getPositionX()
    self._descOriginPosX = self._topDesc:getPositionX()
    
	self._runningResult = nil
end

-- Describle：
function RunningManView:onExit()
	self._signalPlayHorseResult:remove()
	self._signalPlayHorseResult = nil
	self._signalPlayHorseGfxEvent:remove()
	self._signalPlayHorseGfxEvent = nil
	self._signalPlayHorseRunningEnd:remove()
	self._signalPlayHorseRunningEnd = nil
	self._signalPlayHorseInfo:remove()
	self._signalPlayHorseInfo = nil

	self._signalPlayHorseBetSuccess:remove()
	self._signalPlayHorseBetSuccess = nil
end

-- Describle：
function RunningManView:onEnter()
	logWarn("RunningManView")
	self._runningEndEventTimes = 0
	self._interVal = 0
	G_AudioManager:playMusicWithId(AudioConst.MUSIC_RUNNING)
	self._commonCountDown:setVisible(false)

	self._signalPlayHorseInfo = G_SignalManager:add(SignalConst.EVENT_PLAY_HORSE_INFO_SUCCESS, handler(self, self._onEventPlayHorseInfo))

	self._signalPlayHorseResult = G_SignalManager:add(SignalConst.EVENT_PLAY_HORSE_RESULT_SUCCESS, handler(self, self._onEventPlayHorseResult))

	self._signalPlayHorseGfxEvent = G_SignalManager:add(SignalConst.EVENT_PLAY_HORSE_POST_RUNNING_START, handler(self,
	self._onEventGfxCountDown))

	self._signalPlayHorseRunningEnd = G_SignalManager:add(SignalConst.EVENT_PLAY_HORSE_HERO_RUNNING_END, handler(self, self._onEventRunningEnd))


	self._signalPlayHorseBetSuccess = G_SignalManager:add(SignalConst.EVENT_PLAY_HORSE_BET_SUCCESS, handler(self, self._onEventPlayHorseBetSuccess))


	self:scheduleUpdateWithPriorityLua(handler(self, self._update),0)

	--初始状态处理
	self:_procEnterState()
	self:_updateTime(0)
	self:_updateRedPoint()

end



--更新
function RunningManView:_update( dt )

	--状态切换时，调用函数
	self:_updateStateChange()

	--更新时间
	self:_updateTime(dt)

	--跑步状态时，同步跑男数据
	if  self._currState == RunningManConst.RUNNING_STATE_RUNNING then
		--更新avatar
		local list = G_UserData:getRunningMan():getMatch_info()
		if list and #list >= 0 then
			self._scrollView:updateRunning(dt)
			--更新miniMap
			self._miniMap:updateUI()
		end
	end


	--反复拉取数据
	if self._currState == RunningManConst.RUNNING_STATE_WAIT then
		if self._interVal > 1 then
			local matchList = G_UserData:getRunningMan():getMatch_info()
			if matchList and #matchList == 0 then
				--G_UserData:getRunningMan():c2sPlayHorseResult()
			end
			self._interVal = 0
		end
		self._interVal = self._interVal + dt
	end
	
end






function RunningManView:_onClickIcon( sender )
	-- body

	local runningState = RunningManHelp.getRunningState()
	if runningState == RunningManConst.RUNNING_STATE_PRE_START then
		G_Prompt:showTip(Lang.get("runningman_tip1"))
		return
	end

	local WayFuncDataHelper	= require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RUNNING_BET)
end

--刚进入时状态，做初始化用
function RunningManView:_procEnterState( ... )
	-- body
	local state = RunningManHelp.getRunningState()
	local oldState = 0
	self._currState = state
	local stateName = RunningManConst.getStateName(state)
	local stateFunc = RunningManView["_"..stateName]
	if stateFunc then
		stateFunc(self, oldState,state)
	end
	self:_updateTimeStateChange()
end

--当状态变化时，更新时间描述
function RunningManView:_updateTimeStateChange( ... )
	local state = self._currState
	--活动暂未开启
	if state == RunningManConst.RUNNING_STATE_PRE_START then
		self._topDesc:setString(Lang.get("runningman_top_desc4"))
		self._topDesc:setColor(Colors.DARK_BG_THREE)
		self._topTime:setColor(Colors.DARK_BG_THREE)
	end
	if state == RunningManConst.RUNNING_STATE_BET then
		self._topDesc:setString(Lang.get("runningman_top_desc5"))
		self._topDesc:setColor(Colors.DARK_BG_THREE)
		self._topTime:setColor(Colors.DARK_BG_THREE)
	elseif state == RunningManConst.RUNNING_STATE_WAIT then
		self._topDesc:setString(Lang.get("runningman_top_desc1"))
		self._topDesc:setColor(Colors.DARK_BG_THREE)
		self._topTime:setColor(Colors.DARK_BG_THREE)
	elseif state == RunningManConst.RUNNING_STATE_RUNNING  then
		self._topDesc:setString(Lang.get("runningman_top_desc2"))
		self._topDesc:setColor(Colors.DARK_BG_THREE)
		self._topTime:setColor(Colors.DARK_BG_GREEN)
	elseif state == RunningManConst.RUNNING_STATE_END then
		self._topDesc:setString(Lang.get("runningman_top_desc2"))
		self._topDesc:setColor(Colors.DARK_BG_THREE)
		self._topTime:setString(Lang.get("runningman_top_desc3"))
		self._topTime:setColor(Colors.DARK_BG_GREEN)
	end		
    self:_centerTime()
end
function RunningManView:_updateStateChange( ... )
	-- body
	local currState = RunningManHelp.getRunningState()
	if self._currState ~= currState then
		local stateName = RunningManConst.getStateName(currState)
		local stateFunc = RunningManView["_"..stateName]
		local oldState = self._currState
		if stateFunc then
			stateFunc(self,oldState,currState)
		end
		self._currState = currState
		self:_updateTimeStateChange()
	end
end
function RunningManView:_updateTime( dt )
	-- body
	local state = self._currState

	--活动暂未开启
	if state == RunningManConst.RUNNING_STATE_PRE_START then
		local startTime = G_UserData:getRunningMan():getStart_time()
		self._topTime:setString(G_ServerTime:getLeftSecondsString(startTime))
	end

	if state == RunningManConst.RUNNING_STATE_BET then
		local betEnd = G_UserData:getRunningMan():getBet_end()
		self._topTime:setString(G_ServerTime:getLeftSecondsString(betEnd))
		self._scrollView:updateWait()
	elseif state == RunningManConst.RUNNING_STATE_WAIT then
		local matchStart = G_UserData:getRunningMan():getMatch_start()
		self:_postCountDownEvent()
		self._topTime:setString(G_ServerTime:getLeftSecondsString(matchStart))
		self._scrollView:updateWait()
	elseif state == RunningManConst.RUNNING_STATE_RUNNING  then
		local currTime, elapsed = G_ServerTime:getTime()
		local runningTime,elapsed = G_UserData:getRunningMan():getRunningTime()
		self._topTime:setString(string.format( "%0.2f", runningTime ))
	elseif state == RunningManConst.RUNNING_STATE_END then
		self._topTime:setString(Lang.get("runningman_top_desc3"))
	end		
	
end

function RunningManView:_RUNNING_STATE_PRE_START( oldState, currState )
	-- body
	logWarn("RunningManView:_RUNNING_STATE_PRE_START")
	self._runningEndEventTimes = 0
	self._scrollView:reset()
	self._nodeMiniMap:setVisible(false)
	local openTimes = G_UserData:getRunningMan():getOpen_times()
	if openTimes > 1 then
		if self._popupResult == nil then
			self._popupResult = PopupRunningManResult.new()
			self._popupResult:open()
		end
		self._popupResult:updateUI()
	end

end

function RunningManView:_RUNNING_STATE_BET( oldState, currState )
	-- body
	logWarn("RunningManView:_RUNNING_STATE_BET")


	self:_updateRedPoint()

	if self._popupResult then
		self._popupResult:close()
		self._popupResult = nil
	end

	local betEnd = G_UserData:getRunningMan():getBet_end()

	self._scrollView:buildAvatar()
	if G_ServerTime:getLeftSeconds(betEnd) <= 2 then
		self._scrollView:resetAvatar()
		self._scrollView:playIdle()
	else
		self._scrollView:resetAvatar()
		self._scrollView:playRunningAndIdle()
	end
	
	self._miniMap:reset()
	self._nodeMiniMap:setVisible(true)

end

function RunningManView:_RUNNING_STATE_WAIT( oldState,currState )
	-- body
	--播放特效
	
	self:_updateRedPoint()

	logWarn("RunningManView:_RUNNING_STATE_WAIT")
	self._scrollView:buildAvatar()
	self._scrollView:resetAvatar()
	self._scrollView:playIdle()
	self._miniMap:reset()
	self._nodeMiniMap:setVisible(true)
	--G_UserData:getRunningMan():makePlayHourseResult()
	--G_UserData:getRunningMan():c2sPlayHorseResult()
end


-- 跑步状态
function RunningManView:_RUNNING_STATE_RUNNING( ... )
	-- body
	
	G_AudioManager:playSoundWithId(AudioConst.SOUND_RUNNING_STATE)

	self._nodeMiniMap:setVisible(true)
	logWarn("RunningManView:_RUNNING_STATE_RUNNING")
	self._scrollView:buildAvatar()
	
	G_UserData:getRunningMan():resumeRunning()
	self._scrollView:playRunning()
	self._scrollView:syncRuningPos()
	self:_procRunningEndDlg()
end



--dlg框关闭事件
function RunningManView:_onPopupResultClose(event)
    if event == "close" then
        self._popupResult = nil
		if self._popupResultSignal then
			self._popupResultSignal:remove()
			self._popupResultSignal = nil
		end
    end
end


function RunningManView:_procRunningEndDlg( ... )
	-- body
	if self._currState == RunningManConst.RUNNING_STATE_RUNNING or 
		self._currState == RunningManConst.RUNNING_STATE_END then
		
		local finishList = RunningManHelp.getRunningFinishList()
		if finishList and #finishList > 0 then
			if self._popupResult == nil then
				self._popupResult = PopupRunningManResult.new()
				self._popupResultSignal = self._popupResult.signal:add(handler(self, self._onPopupResultClose))
				self._popupResult:open()
				self._popupResult:updateUI()
			else
				self._popupResult:updateUI()
			end
		end
	end
	
end

function RunningManView:_RUNNING_STATE_END( ... )
	-- body

	self._nodeMiniMap:setVisible(true)
	self:_procRunningEndDlg()

	self._scrollView:reset()
	self._miniMap:reset()
end


function RunningManView:_updateRedPoint( ... )
	-- body
	local redPoint = G_UserData:getRunningMan():hasRedPoint()
	self._betIcon:showRedPoint(redPoint)
end

--处理是否抛出倒计时逻辑
function RunningManView:_postCountDownEvent( ... )
	-- body
	if self._currState ~= RunningManConst.RUNNING_STATE_WAIT then
		return
	end

	local matchStart = G_UserData:getRunningMan():getMatch_start()
	local leftTime = G_ServerTime:getLeftSeconds(matchStart)
	--在最后4秒，并且特效没创建
	if leftTime <= MAX_TIME and self._commonCountDown:isVisible() == false then
		G_SignalManager:dispatch(SignalConst.EVENT_PLAY_HORSE_POST_RUNNING_START,leftTime)
	end
end

--居中倒计时
function RunningManView:_centerTime()
    local desc = self._topDesc:getString()
    local length = UTF8.utf8len(desc)
    local delta = (length - 8) * 10
    self._topDesc:setPositionX(self._descOriginPosX + delta)
    self._topTime:setPositionX(self._timeOriginPosX + delta)
end


function RunningManView:_onEventPlayHorseInfo( id, message )

end

function RunningManView:_onEventPlayHorseResult( id, message )
	
end


--跑步结束
function RunningManView:_onEventRunningEnd( id, heroId )
	-- body
	logWarn("RunningManView:_onEventRunningEnd")

	self._scrollView:stopRunningByHeroId(heroId)
	if self._runningEndEventTimes == 0 then
		--第一次播放跑步,播放到达终点动画
		local function callback()
			self:_procRunningEndDlg()
		end
		--延迟1秒播放弹框
		local delay = cc.DelayTime:create(1.0)
		local sequence = cc.Sequence:create(delay, cc.CallFunc:create(callback))
		self._scrollView:runAction(sequence)
		self._scrollView:playOverRunning()

		G_AudioManager:playSoundWithId(AudioConst.SOUND_RUNNING_OVER)
	else
		self:_procRunningEndDlg()
	end
	self._runningEndEventTimes = self._runningEndEventTimes + 1

end

function RunningManView:_onEventPlayHorseBetSuccess( id, message )
	self:_updateRedPoint()
end

function RunningManView:_onEventGfxCountDown( id, leftTime )
	-- body
	logWarn("SignalConst.EVENT_PLAY_HORSE_POST_RUNNING_START")
	if self._commonCountDown:isVisible() == false and leftTime > 0 then
		self._commonCountDown:setVisible(true)
		local textureList = {
			"img_runway_star.png",
			"img_runway_star1.png",
			"img_runway_star2.png",
			"img_runway_star3.png",
		}

		G_AudioManager:playSoundWithId(AudioConst.SOUND_RUNNING_COUNTDOWN)
		self._commonCountDown:setTextureList(textureList)
		self._commonCountDown:playAnimation(leftTime+1, 1, function()
			self._commonCountDown:setVisible(false)
		end)
		--self._gfxEffect = G_EffectGfxMgr:createPlayGfx(self,"effect_saipaojishi",eventFunction)
	end
end

return RunningManView