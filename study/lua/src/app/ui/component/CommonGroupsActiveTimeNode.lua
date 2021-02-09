--组队活动时间显示控件
local CommonGroupsActiveTimeNode = class("CommonGroupsActiveTimeNode")

local EXPORTED_METHODS = {
    "updateUIOfStatic",
	"updateQinTomb",
	"setAddTouchCallback",
}

function CommonGroupsActiveTimeNode:ctor()
	self._target = nil
	self._showPopup = false
end

function CommonGroupsActiveTimeNode:_init()
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._imageClockStatic = ccui.Helper:seekNodeByName(self._target, "ImageClockStatic")
	self._textTimeTitle = ccui.Helper:seekNodeByName(self._target, "TextTimeTitle")
	self._textLeftTime = ccui.Helper:seekNodeByName(self._target, "TextLeftTime")
	self._imageTouch = ccui.Helper:seekNodeByName(self._target, "ImageTouch")
	self._imageTouch:addClickEventListenerEx(handler(self, self._onClick))
	self._imagePopup = ccui.Helper:seekNodeByName(self._target, "ImagePopup")
	self._text1 = ccui.Helper:seekNodeByName(self._target, "Text1")
	self._text2 = ccui.Helper:seekNodeByName(self._target, "Text2")
	self._textTime1 = ccui.Helper:seekNodeByName(self._target, "TextTime1")
	self._textTime2 = ccui.Helper:seekNodeByName(self._target, "TextTime2")
	self._nodeTimeEffect = ccui.Helper:seekNodeByName(self._target, "NodeTimeEffect")

	self._panelAdd = ccui.Helper:seekNodeByName(self._target, "Panel_Add")
	self._panelAdd:addClickEventListener(handler(self, self._onAddTouch))
	self._onAddTouchCallback = nil

	self._text1:setString(Lang.get("groups_active_time_title"))
	self._text2:setString(Lang.get("groups_assist_time_title"))

	self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
	self._panelTouch:setSwallowTouches(false)
	self._panelTouch:addClickEventListener(handler(self, self._onTouch)) --避免0.5秒间隔
end

function CommonGroupsActiveTimeNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonGroupsActiveTimeNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonGroupsActiveTimeNode:_adjustTouchArea()
	local nodePos = self._target:convertToWorldSpaceAR(cc.p(0,0))
	local size = G_ResolutionManager:getDesignCCSize()
	local posx = size.width/2 - nodePos.x
	local posy = size.height/2 - nodePos.y
	self._panelTouch:setPosition(cc.p(posx, posy))
end

function CommonGroupsActiveTimeNode:updateUIOfStatic()
	self:_adjustTouchArea()

	self._imageClockStatic:loadTexture(Path.getQinTomb("img_qintomb_time01"))

	local leftTime = G_UserData:getBase():getGrave_left_sec()
	local assistLeftTime = G_UserData:getBase():getGrave_assist_sec()
	if leftTime > 0 then
		self._textTimeTitle:setString(Lang.get("groups_active_time_title"))
		local leftTimeStr = G_ServerTime:_secondToString(leftTime)
		self._textLeftTime:setString(leftTimeStr)
	else
		self._textTimeTitle:setString(Lang.get("groups_assist_time_title"))
		local leftTimeStr = G_ServerTime:_secondToString(assistLeftTime)
		self._textLeftTime:setString(leftTimeStr)
	end

	self._textTime1:setString(G_ServerTime:_secondToString(leftTime))
	self._textTime2:setString(G_ServerTime:_secondToString(assistLeftTime))

	self._imagePopup:setVisible(self._showPopup)
end

function CommonGroupsActiveTimeNode:_onClick()
	self._showPopup = not self._showPopup
	self._imagePopup:setVisible(self._showPopup)
end

function CommonGroupsActiveTimeNode:setAddTouchCallback (callback)
	self._onAddTouchCallback = callback
end

function CommonGroupsActiveTimeNode:_onAddTouch()
	if self._onAddTouchCallback then
		self:_onAddTouchCallback()
	end
end

function CommonGroupsActiveTimeNode:_onTouch()
	if self._showPopup then
		self._showPopup = false
		self._imagePopup:setVisible(self._showPopup)
	end
end

--更新秦皇陵
function CommonGroupsActiveTimeNode:updateQinTomb()
	local leftTime = G_UserData:getBase():getGrave_left_sec()
	local assistLeftTime = G_UserData:getBase():getGrave_assist_sec()

	self:updateUIOfStatic()
	if leftTime > 0 then
		self:_updateGraveLeftSec()
	elseif assistLeftTime > 0 then
		self:_updateGraveAssistSec()
	end
	
	self._panelAdd:setVisible(true)
end


function CommonGroupsActiveTimeNode:_updateGraveAssistSec( ... )
	local leftSec = G_UserData:getBase():getGrave_left_sec()
	local beginTime =  G_UserData:getBase():getGrave_begin_time()
	local assistLeftTime = G_UserData:getBase():getGrave_assist_sec()
	local assistBeginTime = G_UserData:getBase():getGrave_assist_begin_time()
	self._textTime2:stopAllActions()
	self._textTime1:stopAllActions()
	local function initUI()
		self._textTimeTitle:setString(Lang.get("groups_assist_time_title"))
		self._nodeTimeEffect:removeAllChildren()
		self._imageClockStatic:loadTexture(Path.getQinTomb("img_qintomb_time03"))
		G_EffectGfxMgr:createPlayGfx(self._nodeTimeEffect, "effect_xianqinhuangling_biaolan", nil ,true)

	end
	--协助时间处理
	if leftSec <=0 and assistLeftTime >0 then
		initUI()
		self:_playAssistLeftSec(self._textLeftTime)
		self:_playAssistLeftSec(self._textTime2)
		return true
	end
	return false
end



function CommonGroupsActiveTimeNode:_updateGraveLeftSec( ... )
	-- body
	self:_adjustTouchArea()

	local leftSec = G_UserData:getBase():getGrave_left_sec()
	local beginTime =  G_UserData:getBase():getGrave_begin_time()
	local assistLeftTime = G_UserData:getBase():getGrave_assist_sec()
	local assistBeginTime = G_UserData:getBase():getGrave_assist_begin_time()
	self._textTime2:stopAllActions()
	self._textTime1:stopAllActions()
	--协助时间处理
	local function initUI()
		self._textTimeTitle:setString(Lang.get("groups_active_time_title"))
		self._nodeTimeEffect:removeAllChildren()
		self._imageClockStatic:loadTexture(Path.getQinTomb("img_qintomb_time02"))
		G_EffectGfxMgr:createPlayGfx(self._nodeTimeEffect, "effect_xianqinhuangling_biao", nil ,true)
	end

	if beginTime > 0 then 
		initUI()
		self:_playGraveLeftSec(self._textLeftTime)
		self:_playGraveLeftSec(self._textTime1)
	end

end


--播放剩余倒计时
function CommonGroupsActiveTimeNode:_playGraveLeftSec(timeNode)

	local leftSec = G_UserData:getBase():getGrave_left_sec()
	local beginTime =  G_UserData:getBase():getGrave_begin_time()
	if beginTime == 0 then --暂停状态
		local endTime = leftSec + G_ServerTime:getTime()
		local leftTimeStr =  G_ServerTime:getLeftSecondsString(endTime, "00:00:00")
		timeNode:stopAllActions()
		timeNode:setString(leftTimeStr)
		return 
	end

	--timeNode:setString("00:00:00")
	local UIActionHelper = require("app.utils.UIActionHelper")
	local function timeUpdate()
		local endTime = leftSec + beginTime
		local leftTimeStr =  G_ServerTime:getLeftSecondsString(endTime, "00:00:00")
		local curTime = G_ServerTime:getTime()
		if  curTime > endTime then
			timeNode:stopAllActions()
			G_SignalManager:dispatch(SignalConst.EVENT_GRAVE_TIME_FINISH)
		else
			timeNode:setString(leftTimeStr)
		end
	end
	local action = UIActionHelper.createUpdateAction(function()
		timeUpdate()
	end, 0.5)

	timeNode:stopAllActions()
	timeNode:runAction(action)
end

--播放协助倒计时
function CommonGroupsActiveTimeNode:_playAssistLeftSec(timeNode)


	local leftSec = G_UserData:getBase():getGrave_assist_sec()
	local beginTime = G_UserData:getBase():getGrave_assist_begin_time()

	if beginTime == 0 then --暂停状态
		local endTime = leftSec + G_ServerTime:getTime()
		local leftTimeStr =  G_ServerTime:getLeftSecondsString(endTime, "00:00:00")
		timeNode:stopAllActions()
		timeNode:setString(leftTimeStr)
		return 
	end

	timeNode:setString("00:00:00")
	local UIActionHelper = require("app.utils.UIActionHelper")
	local function timeUpdate()
		local endTime = leftSec + beginTime
		local leftTimeStr =  G_ServerTime:getLeftSecondsString(endTime, "00:00:00")
		local curTime = G_ServerTime:getTime()
		if  curTime > endTime then
			timeNode:stopAllActions()
			G_SignalManager:dispatch(SignalConst.EVENT_GRAVE_TIME_FINISH)
		else
			timeNode:setString(leftTimeStr)
		end
	end
	local action = UIActionHelper.createUpdateAction(function()
		timeUpdate()
	end, 0.5)
	timeNode:runAction(action)
end
return CommonGroupsActiveTimeNode