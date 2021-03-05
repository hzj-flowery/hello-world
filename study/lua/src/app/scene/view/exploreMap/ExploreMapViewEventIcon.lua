
-- Author: nieming
-- Date:2017-10-20 14:24:31
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local ExploreMapViewEventIcon = class("ExploreMapViewEventIcon", ViewBase)
local ExploreDiscover = require("app.config.explore_discover")
local UIHelper = require("yoka.utils.UIHelper")

function ExploreMapViewEventIcon:ctor(eventType, onClickCallback)
	--csb bind var name
	self._tipsNum = nil  --Text
	self._textImage = nil  --Text
	self._leftTimeLabel = nil
	self._iconImage = nil
	self._type = eventType
	self._onClickCallback = onClickCallback

	local resource = {
		file = Path.getCSB("ExploreMapViewEventIcon", "exploreMap"),
	}
	self:setName("ExploreMapViewEventIcon"..eventType)
	ExploreMapViewEventIcon.super.ctor(self, resource)
end
-- Describle：
function ExploreMapViewEventIcon:onCreate()
	self:setCascadeOpacityEnabled(true)
	-- self._btn:addClickEventListenerEx(handler(self, self._onClickBtn))

    local discoverData = ExploreDiscover.get(self._type)

    local textImg   = Path.getExploreTextImage("txt_"..discoverData.res_id2)
    local iconImg   = Path.getExploreIconImage(discoverData.res_id2.."_icon")

	self._textImage:loadTexture(textImg)
	self._iconImage:loadTexture(iconImg)
	self._iconImage:ignoreContentAdaptWithSize(true)
	self._tipsNum:setString("0")
	if discoverData.time and discoverData.time > 0 then

		self._leftTimeLabel:setVisible(true)
		self._leftTimeLabel:setString("")
	else
		self._leftTimeLabel:setVisible(false)
	end

	-- 触摸事件监听
	-- local listener = cc.EventListenerTouchOneByOne:create()
	-- listener:setSwallowTouches(false)
	--
	-- listener:registerScriptHandler(handler(self, self._onTouchBeganEvent), cc.Handler.EVENT_TOUCH_BEGAN)
	-- listener:registerScriptHandler(handler(self, self._onTouchMoveEvent), cc.Handler.EVENT_TOUCH_MOVED)
	-- listener:registerScriptHandler(handler(self, self._onTouchEndEvent), cc.Handler.EVENT_TOUCH_ENDED)
	-- cc.Director:getInstance():getEventDispatcher():addEventListenerWithSceneGraphPriority(listener, self._iconImage)
	self._iconImage:setTouchEnabled(true)
	self._iconImage:addClickEventListenerEx(handler(self, self._onTouchCallBack), nil, 0)
	self._iconImage:setSwallowTouches(false)
end
--触发奇遇动画
function ExploreMapViewEventIcon:runAppearAction(callback)
	self:setScale(0.2)
	local scaleToAction1 = cc.ScaleTo:create(0.2, 1.1)
	local scaleToAction2 = cc.ScaleTo:create(0.15, 1)
	local callFuncAction1 = cc.CallFunc:create(function()
		local EffectGfxNode = require("app.effect.EffectGfxNode")
		local function effectFunction(effect)
			if string.find(effect, "effect_") then
				local subEffect = EffectGfxNode.new(effect)
				subEffect:play()
				return subEffect
			end
		end
		local effect = G_EffectGfxMgr:createPlayMovingGfx( self, "moving_youli_baozha", effectFunction, nil , true)
	end)
	local callFuncAction2 = cc.CallFunc:create(function()
		self:setOpacity(255)
		self:setScale(1)
		self:setVisible(true)
		self:runCountChangeAction()
		if callback then
			callback()
		end
	end)
	local seqAction = cc.Sequence:create(scaleToAction1, callFuncAction1, scaleToAction2, callFuncAction2)
	self:runAction(seqAction)
end

-- 打开界面动画
function ExploreMapViewEventIcon:runOnEnterAction(callback)
	self:setOpacity(0)
	local fadeInAction = cc.FadeIn:create(0.3)
	local curPos = cc.p(self:getPositionX(), self:getPositionY())
	self:setPosition(cc.p(curPos.x + 100, curPos.y + 60))
	local jumpTo = cc.JumpTo:create(0.3, curPos, 60, 1)
	self:setScale(0.1)
	local scaleAction1 = cc.ScaleTo:create(0.4, 0.4)
	local appearAction = cc.Spawn:create(jumpTo, scaleAction1,fadeInAction)

	local scaleAction2 = cc.ScaleTo:create(0.4, 1)

	local callFuncAction = cc.CallFunc:create(function()
		self:setOpacity(255)
		self:setScale(1)
		self:setVisible(true)
		self:runCountChangeAction()
		if callback then
			callback()
		end
	end)
	local seqAction = cc.Sequence:create(appearAction, scaleAction2, callFuncAction)
	self:runAction(seqAction)
end

--消失动画
function ExploreMapViewEventIcon:runDisAppearAction(callback)
	self:setScale(1)
	local scaleAction1 = cc.ScaleTo:create(0.2, 0.4)
	self:setOpacity(255)
	local fadeOutAction = cc.FadeOut:create(0.3)
	local curPos = cc.p(self:getPositionX(), self:getPositionY())
	local jumpTo = cc.JumpTo:create(0.3, cc.p(curPos.x + 100, curPos.y + 50), 60, 1)
	local scaleAction2 = cc.ScaleTo:create(0.4, 0.1)
	local disAppearAction = cc.Spawn:create(jumpTo, scaleAction2,fadeOutAction)

	local callFuncAction = cc.CallFunc:create(function()
		self:setOpacity(255)
		self:setScale(1)
		self:setVisible(false)
		if callback then
			callback()
		end
	end)
	local seqAction = cc.Sequence:create(scaleAction1, disAppearAction, callFuncAction)
	self:runAction(seqAction)
end

-- 移动
function ExploreMapViewEventIcon:runMoveAction(targetPos, callback)

	local curPos = cc.p(self:getPositionX(), self:getPositionY())
	if targetPos.x == curPos.x and targetPos.y == curPos.y then
		if callback then
			callback()
		end
		return
	end
	local offset = -20
	if targetPos.y - curPos.y > 0 then
		offset = 20
	end

	local moveToAction1 = cc.MoveTo:create(0.2, cc.p(targetPos.x, targetPos.y + offset))
	local moveToAction2 = cc.MoveTo:create(0.15, targetPos)
	local callFuncAction = cc.CallFunc:create(function()
		if callback then
			callback()
		end
	end)
	local seqAction = cc.Sequence:create(moveToAction1, moveToAction2, callFuncAction)
	self:runAction(seqAction)
end


function ExploreMapViewEventIcon:updateLeftTime(timeStr)
	self._leftTimeLabel:setString(timeStr or "")
end

-- Describle：
function ExploreMapViewEventIcon:onEnter()

end

-- Describle：
function ExploreMapViewEventIcon:onExit()

end

function ExploreMapViewEventIcon:setCount(count)
	self._tipsNum:setString(""..count)
end

function ExploreMapViewEventIcon:runCountChangeAction(count)
	self._tipsNum:stopAllActions()
	local action1 = cc.ScaleTo:create(0.2, 1.5)
	local action2 = cc.ScaleTo:create(0.2, 1)
	-- local action3 = cc.Blink:create(0.2, 1)
	local seqAction
	if count then
		local callFuncAction = cc.CallFunc:create(function()
			self._tipsNum:setString(""..count)
		end)
		seqAction = cc.Sequence:create(action1, callFuncAction, action2)
	else
		seqAction = cc.Sequence:create(action1, action2)
	end
	self._tipsNum:runAction(seqAction)
end

function ExploreMapViewEventIcon:_onClickBtn()
	if self._onClickCallback then
		self._onClickCallback(self._type)
	end
end

function ExploreMapViewEventIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	-- logError("=============sdsd")
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
            self:_onClickBtn()
		end
	end
end



-- function ExploreMapViewEventIcon:_onTouchBeganEvent(touch,event)
-- 	if not self:isVisible() then
-- 		return
-- 	end
-- 	local touchPoint = touch:getLocation()
-- 	local locationInNode = self._iconImage:convertToNodeSpace(touchPoint)
-- 	local s = self._iconImage:getContentSize()
-- 	local rect = cc.rect(0, 0, s.width, s.height)
-- 	if cc.rectContainsPoint(rect, locationInNode) then
-- 		self._beganClickPoint = touchPoint
-- 		self._isClick = true
-- 		return true
-- 	end
-- end
--
-- function ExploreMapViewEventIcon:_onTouchMoveEvent(touch,event)
-- 	local newPoint = touch:getLocation()
-- 	if self._beganClickPoint and self._isClick then
-- 		if math.abs(self._beganClickPoint.x - newPoint.x) > 15 or math.abs(self._beganClickPoint.y - newPoint.y) > 15 then
-- 			self._isClick = false
-- 		end
-- 	end
-- end
-- -- Describle：
-- function ExploreMapViewEventIcon:_onTouchEndEvent(touch,event)
-- 	-- body
-- 	if self._isClick then
-- 		self:_onClickBtn()
-- 	end
-- 	self._beganClickPoint = nil
-- 	self._isClick = false
--
-- end

return ExploreMapViewEventIcon
