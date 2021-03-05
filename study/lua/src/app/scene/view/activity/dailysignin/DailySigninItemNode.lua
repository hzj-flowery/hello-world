-- Author: conley
local ViewBase = require("app.ui.ViewBase")
local ActivityConst = require("app.const.ActivityConst")
local ActivityDailySigninConst = require("app.const.ActivityDailySigninConst")
local DailySigninItemNode = class("DailySigninItemNode", ViewBase)

function DailySigninItemNode:ctor()
	self._imageNormalBg  = nil --正常背景
	self._imageLightBg  = nil --亮背景
	self._commonIconTemplate = nil-- 道具Item
	self._imageShade  = nil --遮罩
	self._imageTick = nil--钩图片
	self._imageVipFlag = nil--VIP背景
	self._textVip = nil--VIP
	self._textResignin = nil--重签
	self._callback = nil
	self._globalOrder = 0
	local resource = {
		file = Path.getCSB("DailySigninItemNode", "activity/dailysignin"),
		binding = {
			_imageNormalBg = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
			}
		},
	}
	DailySigninItemNode.super.ctor(self, resource)
end

function DailySigninItemNode:onCreate()
	--self._imageNormalBg:addTouchEventListenerEx(handler(self, self._onTouchCallBack))
	--self._imageNormalBg:addClickEventListenerEx(handler(self, self._onTouchCallBack), true, nil, 0)
	self._imageNormalBg:setSwallowTouches(false)

	--self._imageLightBg:addTouchEventListenerEx(handler(self, self._onTouchCallBack))
	--self._imageLightBg:setSwallowTouches(false)
end

function DailySigninItemNode:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if state == ccui.TouchEventType.ended or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(self)
			end
		end
	end

end

function DailySigninItemNode:updateInfo(dailySigninUnitData)
	self:setLightEffectGlobalZorder(0)
	local cfg = dailySigninUnitData:getConfig()
	if cfg.vip >= ActivityDailySigninConst.REWARD_DOUBLE_VIP_MAX then
		self._textVip:setVisible(false)
		self._imageVipFlag:setVisible(false)
	else
	   	self._textVip:setVisible(true)
		self._imageVipFlag:setVisible(true)	
		self._textVip:setString(Lang.get("lang_activity_dailysign_item_vip",{vip =cfg.vip }))
	end


	self._commonIconTemplate:unInitUI()
	self._commonIconTemplate:initUI( cfg.type, cfg.value, cfg.size)
	self._commonIconTemplate:setTouchEnabled(true)
	self._commonIconTemplate:removeLightEffect()

	local state = dailySigninUnitData:getState()
	self._textResignin:setVisible(false)
	if state == ActivityConst.CHECKIN_STATE_WRONG_TIME then--不可领取
		self._imageShade:setVisible(false)
		self._imageTick:setVisible(false)
		self._imageLightBg:setVisible(false)  
	elseif state == ActivityConst.CHECKIN_STATE_RIGHT_TIME then--可领取
		self._imageShade:setVisible(false)
		self._imageTick:setVisible(false)
		self._imageLightBg:setVisible(true)  
		self._commonIconTemplate:setTouchEnabled(false)

		self._commonIconTemplate:showLightEffect(1,"effect_icon_liuguang")
	elseif state == ActivityConst.CHECKIN_STATE_PASS_TIME or state == ActivityConst.CHECKIN_STATE_PASS_ALL_TIME then--已领取
		self._imageShade:setVisible(true)
		self._imageTick:setVisible(true)
		self._imageLightBg:setVisible(false)  
	elseif state == ActivityConst.CHECKIN_STATE_OVER_TIME then--补签
		self._imageShade:setVisible(false)
		self._imageTick:setVisible(false)
		self._imageLightBg:setVisible(false) 
		self._textResignin:setVisible(true) 
		self._commonIconTemplate:setTouchEnabled(false)
	end
end

function DailySigninItemNode:setLightEffectGlobalZorder(order)
	if self._globalOrder == order then
		return 
	end
	self._globalOrder = order 
	--self._imageLightBg:setGlobalZOrder(order) 
end

function DailySigninItemNode:setCallBack(callback)
	if callback then
		self._callback = callback
	end
end


return DailySigninItemNode