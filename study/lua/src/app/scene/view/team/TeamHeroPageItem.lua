local TeamHeroPageItem=class("TeamHeroPageItem",function()
	return ccui.Layout:create()
end)
local CSHelper = require("yoka.utils.CSHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function TeamHeroPageItem:ctor(width, height, onClick, index)
	self._onClick = onClick
	self._index = index
	self._avatar = nil
	self._scheduleHandler = nil
	self._actionName = "" --播放动作

	self:setContentSize(width, height)
	self:setSwallowTouches(false)
end

function TeamHeroPageItem:updateUI(type, value, isEquipAvatar, limitLevel, limitRedLevel)
	if self._avatar == nil then
		self._avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
		self._avatar:setTouchEnabled(true)
		self._avatar:setCallBack(handler(self, self._onClickAvatar))
		local size = self:getContentSize()
		self._avatar:setPosition(cc.p(size.width / 2, size.height / 2 - 100))
		self:addChild(self._avatar)
	end
	
	if type == TypeConvertHelper.TYPE_HERO or type == TypeConvertHelper.TYPE_PET then
		local param = TypeConvertHelper.convert(type, value)
		self._actionName = param.res_cfg.show_action
	end
	
	if type == TypeConvertHelper.TYPE_HERO then
		self._avatar:setScale(1.4)
		self._avatar:setShadowScale(1.0)
	else
		self._avatar:setScale(1.0)
		self._avatar:setShadowScale(2.7) --神兽影子放大
	end
	self._avatar:setConvertType(type)
	self._avatar:updateUI(value, nil, nil, limitLevel, nil, nil, limitRedLevel)
	self._avatar:showAvatarEffect(isEquipAvatar, 1.4)
end

function TeamHeroPageItem:_onClickAvatar()
	if self._onClick then
		self._onClick(self._index)
	end
end

function TeamHeroPageItem:getAvatar()
	return self._avatar
end

function TeamHeroPageItem:playSkillAnimationOnce()
	if self._actionName == "" then
		return
	end
	if self._avatar == nil then
		return
	end
	self._avatar:playAnimationOnce(self._actionName)
	self:stopScheduler()
	if self._actionName ~= "idle" then --不是idle动作，再做循环
		self._scheduleHandler = SchedulerHelper.newSchedule(function()
	        self._avatar:playAnimationOnce(self._actionName)
	    end, 30) --隔30秒播一次
	end
end

function TeamHeroPageItem:setIdleAnimation()
	if self._avatar == nil then
		return
	end
	self._avatar:setAction("idle", true)
	self:stopScheduler()
end

function TeamHeroPageItem:stopScheduler()
	if self._scheduleHandler then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
		self._scheduleHandler = nil
	end
end

function TeamHeroPageItem:setAvatarScale(scale)
	self._avatar:setScale(scale)
end

return TeamHeroPageItem