--
-- Author: Liangxu
-- Date: 2019-4-30
-- 蛋糕材料Icon

local CakeMaterialNode = class("CakeMaterialNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local CakeActivityConst = require("app.const.CakeActivityConst")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")

--档位，计时器间隔
local SHIFT_SPEED = {
	[1] = {0.4, 5, 1}, --1档位，0.5秒执行一次，循环次数达到1次后，上升到2档位，第3参数是一次消耗x个
	[2] = {0.34, 3, 5},
	[3] = {0.27, 3, 10},
	[4] = {0.2, 4, 50}
}

local COLORINFO = {
	[1] = {bgRes = "img_anniversary_frame_03", countRes = "img_anniversary_frame_03b"},
	[2] = {bgRes = "img_anniversary_frame_04", countRes = "img_anniversary_frame_04b"},
	[3] = {bgRes = "img_anniversary_frame_05", countRes = "img_anniversary_frame_05b"},
}

function CakeMaterialNode:ctor(target, type, onClick, onStepClick)
	self._target = target
	self._itemId = CakeActivityDataHelper.getMaterialItemId(type)
	self._onClick = onClick
	self._onStepClick = onStepClick
	self._onStartCallback = nil --开始点住的回调
	self._onStopCallback = nil --放开点住的回调
	self._itemValue = CakeActivityDataHelper.getMaterialValue(type)
	self._count = 0 --拥有数量
	self._isEmpty = true --是否空
	self._addSprite = nil --“+”号
	self._scheduleHandler = nil --计时器
	self._costCount = 0 --消耗数量
	self._costCountEveryTime = 1 --每次点击消耗数量，默认为1
	self._curShift = 1 --默认档位
	self._loopCount = 0 --循环次数
	self._isShift = true --是否换挡
	self._isDidClick = false -- 已经做了点击事件了

	self:_initUI()
	self:_initColorAndIcon(type)
end

function CakeMaterialNode:_initUI()
	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._imageIcon = ccui.Helper:seekNodeByName(self._target, "ImageIcon")
	self._imageIcon:ignoreContentAdaptWithSize(true)
	self._imageIcon:addTouchEventListener(handler(self, self._onClickIcon))
	self._imageDark = ccui.Helper:seekNodeByName(self._target, "ImageDark")
	self._imageAdd = ccui.Helper:seekNodeByName(self._target, "ImageAdd")
	self._imageCount = ccui.Helper:seekNodeByName(self._target, "ImageCount")
	self._textCount = ccui.Helper:seekNodeByName(self._target, "TextCount")
end

function CakeMaterialNode:_initColorAndIcon(type)
	local info = COLORINFO[type]
	self._imageBg:loadTexture(Path.getAnniversaryImg(info.bgRes))
	self._imageCount:loadTexture(Path.getAnniversaryImg(info.countRes))
	local icon = CakeActivityDataHelper.getMaterialIconWithId(self._itemId)
	self._imageIcon:loadTexture(icon)
end

function CakeMaterialNode:updateCount()
	self._count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, self._itemId)
	self:setCount(self._count)
	return self._count
end

function CakeMaterialNode:setCount(count)
	self._textCount:setString(count)
	self._isEmpty = count <= 0
	self._imageDark:setVisible(count == 0)
	self._imageAdd:setVisible(count == 0)
end

function CakeMaterialNode:setStartCallback(callback)
	self._onStartCallback = callback
end

function CakeMaterialNode:setStopCallback(callback)
	self._onStopCallback = callback
end

function CakeMaterialNode:_onClickIcon(sender, state)
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
				if self._itemId == CakeActivityDataHelper.getMaterialItemId(CakeActivityConst.MATERIAL_TYPE_1) then
					local popup = require("app.scene.view.cakeActivity.PopupCakeGet").new(CakeActivityConst.MATERIAL_TYPE_1)
					popup:openWithAction()
				elseif self._itemId == CakeActivityDataHelper.getMaterialItemId(CakeActivityConst.MATERIAL_TYPE_2) then
					local popup = require("app.scene.view.cakeActivity.PopupCakeGet").new(CakeActivityConst.MATERIAL_TYPE_2)
					popup:openWithAction()
				elseif self._itemId == CakeActivityDataHelper.getMaterialItemId(CakeActivityConst.MATERIAL_TYPE_3) then
					local name = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, self._itemId).name
					G_Prompt:showTip(Lang.get("cake_activity_fruit_get_tip", {name = name}))
				end
			else
				self:_doClick()
			end
		end
	end
end

function CakeMaterialNode:_doClick()
	if self._onStepClick then
		self._onStepClick(self._itemId, self._itemValue, self._costCountEveryTime)
	end
end

--开始计时器
function CakeMaterialNode:_startSchedule()
	if self._onStartCallback then
		self._onStartCallback(self._itemId, self._count)
	end

	if self._scheduleHandler then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
		self._scheduleHandler = nil
	end

	self._loopCount = 0
	self._curShift = 1
	self._costCountEveryTime = 1
	self._scheduleHandler =
		SchedulerHelper.newSchedule(
		function()
			self:_stepSchedule()
		end,
		SHIFT_SPEED[1][1]
	)
end

--停止计时器
function CakeMaterialNode:_stopSchedule()
	if self._onStopCallback then
		self._onStopCallback()
	end
	if self._scheduleHandler then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
	end
	self._scheduleHandler = nil
end

function CakeMaterialNode:_stepSchedule()
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
function CakeMaterialNode:_checkShift()
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
function CakeMaterialNode:_shiftSchedule()
	if self._scheduleHandler then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
		self._scheduleHandler = nil
	end
	self._loopCount = 0

	self._costCountEveryTime = SHIFT_SPEED[self._curShift][3]
	self._scheduleHandler =
		SchedulerHelper.newSchedule(
		function()
			self:_stepSchedule()
		end,
		SHIFT_SPEED[self._curShift][1]
	)
end

return CakeMaterialNode