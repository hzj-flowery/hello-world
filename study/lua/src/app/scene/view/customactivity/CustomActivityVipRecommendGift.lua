-- Author: liangxu
-- Date:2019-3-27
-- Describle：vip推送礼包
local ViewBase = require("app.ui.ViewBase")
local CustomActivityVipRecommendGift = class("CustomActivityVipRecommendGift", ViewBase)
local CustomActivityVipRecommendGiftNode = require("app.scene.view.customactivity.CustomActivityVipRecommendGiftNode")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")

function CustomActivityVipRecommendGift:ctor(parentView)
	self._parentView = parentView

	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CustomActivityVipRecommendGift", "customactivity"),
		binding = {
			
		},
	}
	CustomActivityVipRecommendGift.super.ctor(self, resource)
end

function CustomActivityVipRecommendGift:onCreate()
	self:_initData()
	self:_initView()
end

function CustomActivityVipRecommendGift:_initData()
	self._countDownHandler = nil --倒计时计时器
end

function CustomActivityVipRecommendGift:_initView()
	for i = 1, 4 do
		self["_gift"..i] = CustomActivityVipRecommendGiftNode.new(self["_nodeGift"..i])
	end
end

function CustomActivityVipRecommendGift:onEnter()
	self._signalGetVipRecommendGiftSuccess = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_GET_VIP_RECOMMEND_GIFT_SUCCESS, handler(self, self._getVipRecommendGiftSuccess))
	self._signalBuyVipRecommendGiftSuccess = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_BUY_VIP_RECOMMEND_GIFT_SUCCESS, handler(self, self._buyVipRecommendGiftSuccess))
	self:_startCountDown()
end

function CustomActivityVipRecommendGift:onExit()
	self:_stopCountDown()

	self._signalGetVipRecommendGiftSuccess:remove()
	self._signalGetVipRecommendGiftSuccess = nil
	self._signalBuyVipRecommendGiftSuccess:remove()
	self._signalBuyVipRecommendGiftSuccess = nil
end

function CustomActivityVipRecommendGift:_startCountDown()
	self:_stopCountDown()
	self._countDownHandler = SchedulerHelper.newSchedule(handler(self, self._onCountDown), 1)
	self:_onCountDown()
end

function CustomActivityVipRecommendGift:_stopCountDown()
	if self._countDownHandler then
		SchedulerHelper.cancelSchedule(self._countDownHandler)
		self._countDownHandler = nil
	end
end

function CustomActivityVipRecommendGift:_onCountDown()
	local actUnitData = G_UserData:getCustomActivity():getVipRecommendGiftActivity()
	if actUnitData and actUnitData:isActInRunTime() then
		local timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getEnd_time())
		self._textTime:setString(timeStr)
	else
		self._textTime:setString(Lang.get("customactivity_vip_recommend_gift_act_end"))
		self:_stopCountDown()
	end
end

function CustomActivityVipRecommendGift:refreshView()
	self:_updateGifts()
end

function CustomActivityVipRecommendGift:_updateGifts()
	local gifts = G_UserData:getCustomActivity():getVipRecommendGiftList()
	local showCount = 0 --显示的个数
	for i = 1, 4 do
		local gift = gifts[i]
		if gift then
			self["_nodeGift"..i]:setVisible(true)
			self["_gift"..i]:updateUI(gift)
			showCount = showCount + 1
		else
			self["_nodeGift"..i]:setVisible(false)
		end
	end
	self:_layoutGift(showCount)
end

function CustomActivityVipRecommendGift:_layoutGift(showCount)
	local scale = 1.0
	if showCount == 4 then
		scale = 0.9
	end
	local tbPosX = {
		[2] = {-169, 158},
		[3] = {-255, 0, 255},
		[4] = {-308, -103, 103, 308},
	}
	local posX = tbPosX[showCount]
	for i = 1, showCount do
		self["_nodeGift"..i]:setPositionX(posX[i])
		self["_gift"..i]:setScale(scale)
	end
end

function CustomActivityVipRecommendGift:_buyVipRecommendGiftSuccess(eventName, awards)
	self:_updateGifts()
	G_Prompt:showAwards(awards)
end

function CustomActivityVipRecommendGift:_getVipRecommendGiftSuccess()
	self:_updateGifts()
end

return CustomActivityVipRecommendGift