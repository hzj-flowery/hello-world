-- hedl
-- 2017.5.27 
-- 通用翻牌功能

local CommonCardFlip = class("CommonCardFlip")

local EXPORTED_METHODS = {
    "updateUI",
	"reset",
	"setCardFlipEnabled",
	"breathGlow",
	"setCallBack",
	"getItemParams",
	"setCardId",
	"getCardId",
	"doFlip"
}

function CommonCardFlip:ctor()
	self._enabledCardTouch = true
	self._glowImage = nil
	self._frontImage = nil
	self._backImage = nil
	self._iconAward = nil --奖励模板
	self._nodeCon = nil
	self._isFliped = false
	self._cardId = 0

	self._breathing = false
	self._breathDelay = nil
end


function CommonCardFlip:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonCardFlip:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end


function CommonCardFlip:_init( ... )

	self._glowImage = ccui.Helper:seekNodeByName(self._target,"Image_glow")
	self._frontImage= ccui.Helper:seekNodeByName(self._target,"Image_front")
	self._backImage = ccui.Helper:seekNodeByName(self._target,"Image_back")
	self._backImage:setVisible(false)

	--绑定奖励Icon
	self._iconAward = ccui.Helper:seekNodeByName(self._target,"CommonIcon")
	cc.bind(self._iconAward, "CommonIconTemplate")

	self._nodeCon = ccui.Helper:seekNodeByName(self._target,"Node_con")

	self._glowImage:setVisible(false)
	local panelTouchFlip = ccui.Helper:seekNodeByName(self._target,"Panel_touch_flip")
	panelTouchFlip:addTouchEventListenerEx(handler(self,self._onCardTouchFunc))

	self:setCardFlipEnabled(true)

	if self._breathing then
		self:breathGlow(true,self._breathDelay)
		self._breathing = false
	end
end

function CommonCardFlip:setCallBack( onCardClick, onFlipFinish)
	self._onCardClick = onCardClick
	self._onFlipFinish = onFlipFinish
end

function CommonCardFlip:setCardId(id)
	self._cardId = id
end

function CommonCardFlip:getCardId()
	return self._cardId
end

function CommonCardFlip:updateUI( awardData)



	self._iconAward:unInitUI()
	self._iconAward:initUI(awardData.type, awardData.value, awardData.size)
end


function CommonCardFlip:getItemParams()
	return self._iconAward:getItemParams()
end
function CommonCardFlip:setCardFlipEnabled(bool)
	self._enabledCardTouch = bool
	self._target:getSubNodeByName("Panel_touch_flip"):setTouchEnabled(bool)
end

function CommonCardFlip:breathGlow( bool,delay )
	if self._frontImage == nil then
		self._breathing = bool
		self._breathDelay = delay
		return
	end
	self._frontImage:stopAllActions()
	self._frontImage:setScale(1)

	if bool then
		delay = delay or 1
		local seq = cc.Sequence:create(cc.DelayTime:create(delay),cc.CallFunc:create(function ()
			local scaleB = cc.EaseBackOut:create(cc.ScaleTo:create(0.1, 1.1))
			local scaleS = cc.ScaleTo:create(0.1, 1)
			local delay = cc.DelayTime:create(2)
			local repeatf = cc.RepeatForever:create(cc.Sequence:create(scaleB,scaleS,delay))
			self._frontImage:runAction(repeatf)
		end))
		self._frontImage:runAction(seq)
	end
end

function CommonCardFlip:reset()
	self._glowImage:setVisible(false)
	self._nodeCon:setScaleX(1)
	self._frontImage:setVisible(true)
	self._backImage:setVisible(false)
	self._isFliped = false
end


--触碰卡牌，执行反转效果
function CommonCardFlip:_onCardTouchFunc(sender,event)
	if(self._enabledCardTouch ~= true)then return end

	if(event == ccui.TouchEventType.began)then
		self._nodeCon:setScale(1.05)
	elseif(event == ccui.TouchEventType.ended)then
		self._nodeCon:setScale(1)
		local bool = not self._isFliped
		self:doFlip(bool)
		self._glowImage:setVisible(bool)
		if(self._onCardClick ~= nil)then
			self._onCardClick(self,self._isFliped)
		end
	elseif(event == ccui.TouchEventType.canceled)then
		self._nodeCon:setScale(1)
	end
end

function CommonCardFlip:doFlip(bool)
	if(self._isFliped == bool)then return end
	self._isFliped = bool
	
	local target_frontImage = 0
	local target_backImage = 0
	if(self._isFliped == true)then
		target_frontImage = 0
		target_backImage = 1
	else
		target_frontImage = 1
		target_backImage = 0
	end

	local action1 = cc.ScaleTo:create(0.3,target_frontImage,1)
	local action2 = cc.ScaleTo:create(0.3,target_backImage,1)
	local seq = cc.Sequence:create(action1,cc.CallFunc:create(function()
		self._frontImage:setVisible(not self._isFliped)
		self._backImage:setVisible(self._isFliped)
		if(self._onFlipFinish ~= nil)then
			local id = self:getCardId()
			self._onFlipFinish(id,self._isFliped,self)
		end
	end),action2)
	self._target:runAction(cc.EaseExponentialInOut:create(seq))
end

return CommonCardFlip