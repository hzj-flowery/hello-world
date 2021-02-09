--
-- Author: Liangxu
-- Date: 2017-10-10 14:05:17
-- 通用材料Icon，用于武将升级、装备精炼、宝物升级、武将觉醒
local CommonMaterialIcon = class("CommonMaterialIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")

--档位，计时器间隔
local SHIFT_SPEED = {
	[1] = {0.55, 1}, --1档位，0.55秒执行一次，循环次数达到1次后，上升到2档位
	[2] = {0.45, 2},
	[3] = {0.35, 3},
	[4] = {0.25, 4}
}
if CONFIG_LIMIT_BOOST then
	SHIFT_SPEED = {
		[1] = {0, 1},
		[2] = {0, 2},
		[3] = {0, 3},
		[4] = {0, 4}
	}
end

local EXPORTED_METHODS = {
	"updateUI",
	"updateCount",
	"getIsEmpty",
	"setCount",
	"getCount",
	"getItemId",
	"getItemValue",
	"setStartCallback",
	"setStopCallback",
	"setName",
	"setCostCountEveryTime",
	"setIsShift",
	"setType",
	"getType",
	"setNameColor",
	"showNameBg"
}

function CommonMaterialIcon:ctor()
	self._target = nil
	self._onClick = nil
	self._onStepClick = nil --点住不放时每步的回调
	self._onStartCallback = nil --开始点住的回调
	self._onStopCallback = nil --放开点住的回调
	self._itemId = 0
	self._itemValue = 0
	self._count = 0 --拥有数量
	self._isEmpty = true --是否空
	self._addSprite = nil --“+”号
	self._scheduleHandler = nil --计时器
	self._costCount = 0 --消耗数量
	self._costCountEveryTime = 1 --每次点击消耗数量，默认为1
	self._curShift = 1 --默认档位
	self._loopCount = 0 --循环次数
	self._isShift = false --是否换挡
	self._isDidClick = false -- 已经做了点击事件了
	self._type = TypeConvertHelper.TYPE_ITEM
end

function CommonMaterialIcon:_init()
	self._fileNodeIcon = ccui.Helper:seekNodeByName(self._target, "FileNodeIcon")
	cc.bind(self._fileNodeIcon, "CommonItemIcon")
	self._nameBg = ccui.Helper:seekNodeByName(self._target, "ImageNameBg")
	self._textValue = ccui.Helper:seekNodeByName(self._target, "TextValue")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:setTouchEnabled(true)
	self._panelTouch:addTouchEventListener(handler(self, self._onClickIcon))
end

function CommonMaterialIcon:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonMaterialIcon:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonMaterialIcon:setType(type)
	cc.unbind(self._fileNodeIcon, TypeConvertHelper.CLASS_NAME[self._type])
	self._type = type or TypeConvertHelper.TYPE_ITEM
	cc.bind(self._fileNodeIcon, TypeConvertHelper.CLASS_NAME[self._type])
end

function CommonMaterialIcon:getType()
	return self._type
end

function CommonMaterialIcon:showNameBg(isShow)
	if self._nameBg then
		self._nameBg:setVisible(isShow)
	end
end

function CommonMaterialIcon:updateUI(itemId, onClick, onStepClick)
	self._itemId = itemId
	self._onClick = onClick --点击结束时的回调
	self._onStepClick = onStepClick --点住不放时每步的回调

	self._fileNodeIcon:updateUI(itemId)
	self._fileNodeIcon:showCount(true)

	if self._type == TypeConvertHelper.TYPE_ITEM then
		local param = TypeConvertHelper.convert(self._type, itemId)
		self._itemValue = param.cfg.item_value
		self._textValue:setString(Lang.get("material_exp_des", {value = self._itemValue}))
		self._textValue:setColor(param.icon_color)
	elseif self._type == TypeConvertHelper.TYPE_HERO then
		local param = TypeConvertHelper.convert(self._type, itemId)
		self._textValue:setColor(param.icon_color)
		if param.cfg.color==7 then
			self._textValue:enableOutline(param.icon_color_outline, 2)
		end
	end
	-- self._textValue:enableOutline(param.icon_color_outline, 2)
end

function CommonMaterialIcon:setName(name)
	self._textValue:setString(name)
end

function CommonMaterialIcon:setNameColor(color)
	self._textValue:setColor(color)
end

function CommonMaterialIcon:setCostCountEveryTime(count)
	self._costCountEveryTime = count
end

function CommonMaterialIcon:setIsShift(bool)
	self._isShift = bool
end

function CommonMaterialIcon:updateCount(count)
	if count then
		self._count = count
	else
		self._count = UserDataHelper.getNumByTypeAndValue(self._type, self._itemId)
	end
	self:setCount(self._count)
end

function CommonMaterialIcon:setStartCallback(callback)
	self._onStartCallback = callback
end

function CommonMaterialIcon:setStopCallback(callback)
	self._onStopCallback = callback
end

function CommonMaterialIcon:_onClickIcon(sender, state)
	if state == ccui.TouchEventType.began then
		self._costCount = 0
		self._isDidClick = false
		if not self._isEmpty then
			self:_startSchedule()
		end
		return true
	elseif state == ccui.TouchEventType.moved then
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		self:_stopSchedule()
		if self._isDidClick == false then
			if self._isEmpty and self._costCount == 0 then
				local itemParam = self._fileNodeIcon:getItemParams()
				local PopupItemGuider = require("app.ui.PopupItemGuider").new()
				PopupItemGuider:updateUI(itemParam.item_type, itemParam.cfg.id)
				PopupItemGuider:openWithAction()
			else
				self:_doClick()
			end
		end
	end
end

function CommonMaterialIcon:getIsEmpty()
	return self._isEmpty
end

function CommonMaterialIcon:setCount(count)
	self._fileNodeIcon:setCount(count)
	self._fileNodeIcon:showCount(count > 0)

	self._isEmpty = count <= 0
	self._fileNodeIcon:setIconMask(self._isEmpty)
	if self._isEmpty then
		if self._addSprite == nil then
			self._addSprite = cc.Sprite:create(Path.getUICommon("img_com_btn_add01"))
			self._fileNodeIcon:addChild(self._addSprite)
			local UIActionHelper = require("app.utils.UIActionHelper")
			UIActionHelper.playBlinkEffect(self._addSprite)
		end
	else
		if self._addSprite then
			self._addSprite:removeFromParent()
			self._addSprite = nil
		end
	end
end

function CommonMaterialIcon:getCount()
	return self._count
end

function CommonMaterialIcon:getItemId()
	return self._itemId
end

function CommonMaterialIcon:getItemValue()
	return self._itemValue
end

function CommonMaterialIcon:_doClick()
	if self._onClick then
		local count = self._costCount == 0 and self._costCountEveryTime or self._costCount
		local item = {id = self._itemId, num = math.min(count, self._count)}
		local materials = {item}
		self._onClick(materials)
	end
end

--开始计时器
function CommonMaterialIcon:_startSchedule()
	if self._onStartCallback then
		self._onStartCallback(self._itemId, self._count)
	end

	if self._scheduleHandler then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
		self._scheduleHandler = nil
	end

	self._loopCount = 0
	self._curShift = 1
	self._scheduleHandler =
		SchedulerHelper.newSchedule(
		function()
			self:_stepSchedule()
		end,
		SHIFT_SPEED[1][1]
	)
end

--停止计时器
function CommonMaterialIcon:_stopSchedule()
	if self._onStopCallback then
		self._onStopCallback()
	end
	if self._scheduleHandler then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
	end
	self._scheduleHandler = nil
end

function CommonMaterialIcon:_stepSchedule()
	if self._onStepClick then
		local continue, realCostCount, isDo = self._onStepClick(self._itemId, self._itemValue, self._costCountEveryTime)
		if continue then
			local costCountEveryTime = self._costCountEveryTime
			if realCostCount then
				costCountEveryTime = realCostCount
			end
			self._costCount = self._costCount + costCountEveryTime
			if self._isShift then
				self:_checkShift()
			end
		else
			self:_stopSchedule()
			if isDo then
				self:_doClick()
				self._isDidClick = true
			end
		end
	end
end

--检测是否换挡
function CommonMaterialIcon:_checkShift()
	if self._curShift >= 4 then --已经到最高档了
		return
	end
	self._loopCount = self._loopCount + 1
	local needCount = SHIFT_SPEED[self._curShift][2]
	if self._loopCount >= needCount then
		self._curShift = self._curShift + 1
		self:_shiftSchedule()
	end
end

--变速
function CommonMaterialIcon:_shiftSchedule()
	if self._scheduleHandler then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
		self._scheduleHandler = nil
	end
	self._loopCount = 0

	self._scheduleHandler =
		SchedulerHelper.newSchedule(
		function()
			self:_stepSchedule()
		end,
		SHIFT_SPEED[self._curShift][1]
	)
end

return CommonMaterialIcon
