
-- Author: nieming
-- Date:2018-01-19 20:38:06
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local DailyActivityHintCell = class("DailyActivityHintCell", ListViewCellBase)
local RedPointHelper = require("app.data.RedPointHelper")

function DailyActivityHintCell:ctor(index, callback)

	--csb bind var name
	self._bgBtn = nil  --Button
	self._icon = nil  --ImageView
	self._openTime1 = nil  --Text
	self._openTime2 = nil  --Text
	self._title = nil  --Text
	self._isHighlight = false
	self._clickCallback = callback
	self._cellIndex = index
	local resource = {
		file = Path.getCSB("DailyActivityHintCell", "achievement"),

	}
	DailyActivityHintCell.super.ctor(self, resource)
end

function DailyActivityHintCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	-- self._bgBtn:setSwallowTouches(false)
	self._bgImage:ignoreContentAdaptWithSize(true)
	self._icon:ignoreContentAdaptWithSize(true)
	-- self:updateUI()

	-- 触摸事件监听
	local listener = cc.EventListenerTouchOneByOne:create()
	listener:setSwallowTouches(false)

	listener:registerScriptHandler(handler(self, self._onTouchBeganEvent), cc.Handler.EVENT_TOUCH_BEGAN)
	listener:registerScriptHandler(handler(self, self._onTouchMoveEvent), cc.Handler.EVENT_TOUCH_MOVED)
	listener:registerScriptHandler(handler(self, self._onTouchEndEvent), cc.Handler.EVENT_TOUCH_ENDED)
	cc.Director:getInstance():getEventDispatcher():addEventListenerWithSceneGraphPriority(listener, self._bgImage)
end

function DailyActivityHintCell:updateUI(data, curSelectCellIndex)
	-- body
	self._data = data
	local date = G_ServerTime:getDateObject()
	local date = G_ServerTime:getDateObject()
	local curTodayTime = date.hour * 3600 + date.min * 60 + date.sec

	-- Red-point
	self:_showRedPoint(self._data.function_id)
	
	if self._data.isTodayOpen then
		if self._data.isTodayEnd then
			if self._data.isTomorrowOpen then
				self._openTime1:setColor(Colors.BRIGHT_BG_ONE)
				self._openTime1:setString(Lang.get("lang_time_limit_activity_today_end"))
				self._openTime2:setVisible(false)
			else
				self._openTime1:setColor(Colors.BRIGHT_BG_ONE)
				self._openTime1:setString(self._data.start_des)
				self._openTime2:setVisible(true)
				self._openTime2:setString(Lang.get("lang_time_limit_activity_open_text"))
			end
		else
			self._openTime1:setColor(Colors.BRIGHT_BG_GREEN)
			self._openTime2:setVisible(false)
			if self._data.isOpenIng then
				self._openTime1:setString(Lang.get("lang_time_limit_activity_ing"))
			else
				local hour = math.floor(self._data.startTime/3600)
				local min =  math.floor((self._data.startTime%3600)/60)

				self._openTime1:setString(Lang.get("lang_time_limit_activity_open_time",
					{time = string.format("%02d:%02d", hour, min)}))
			end
		end
	else
		if self._data.openServerTimeOpen > 0 then
			local openServerNum = G_UserData:getBase():getOpenServerDayNum()
			local leftDay = self._data.openServerTimeOpen - openServerNum
			if leftDay > 0 then
				self._openTime1:setColor(Colors.BRIGHT_BG_ONE)
				self._openTime1:setString(Lang.get("lang_time_limit_activity_open_server_time", {num = leftDay}))
				self._openTime2:setVisible(false)
			else
				self._openTime1:setColor(Colors.BRIGHT_BG_ONE)
				self._openTime1:setString(self._data.start_des)
				self._openTime2:setVisible(true)
				self._openTime2:setString(Lang.get("lang_time_limit_activity_open_text"))
			end
		else
			self._openTime1:setColor(Colors.BRIGHT_BG_ONE)
			self._openTime1:setString(self._data.start_des)
			self._openTime2:setVisible(true)
			self._openTime2:setString(Lang.get("lang_time_limit_activity_open_text"))
		end
	end

	local FunctionLevelConfig = require("app.config.function_level")
	local functionConfig = FunctionLevelConfig.get(self._data.function_id)
	assert(functionConfig ~= nil, "functionConfig can not find")

	self._title:setString(self._data.title)
	local iconPath
	if self._data.icon and self._data.icon ~="" then
		iconPath = Path.getLimitActivityIcon(self._data.icon)
	else
		iconPath = Path.getCommonIcon("main",functionConfig.icon)
	end
	self._icon:loadTexture(iconPath)
	self:setHighlight(self._cellIndex == curSelectCellIndex)
end

function DailyActivityHintCell:setHighlight(trueOrFalse)
	if trueOrFalse then
		self._bgImage:loadTexture(Path.getTask("img_task02c"))
		self._bgImage:setPositionY(378)
	else
		self._bgImage:loadTexture(Path.getTask("img_task02b"))
		self._bgImage:setPositionY(414)
	end
end

function DailyActivityHintCell:playActionOut(time, callback)
	self._bgImage:stopAllActions()
	self._bgImage:loadTexture(Path.getTask("img_task02b"))
	self._bgImage:setPositionY(378)
	local moveAction = cc.MoveTo:create(time, cc.p(self._bgImage:getPositionX(), 414))
	-- local moveAction = cc.EaseBackIn:create(moveTo)
	local callAction = cc.CallFunc:create(function()
		-- self._bgImage:setPositionY(374)
		self._bgImage:loadTexture(Path.getTask("img_task02b"))
		if callback then
			callback()
		end
	end)
	local seqAction = cc.Sequence:create(moveAction, callAction)
	self._bgImage:runAction(seqAction)
end

function DailyActivityHintCell:playActionIn(time, callback)
	self._bgImage:stopAllActions()
	self._bgImage:loadTexture(Path.getTask("img_task02c"))
	self._bgImage:setPositionY(414)
	local moveAction = cc.MoveTo:create(time, cc.p(self._bgImage:getPositionX(), 378))
	-- local moveAction = cc.EaseBackIn:create(moveTo)
	local callAction = cc.CallFunc:create(function()
		self._bgImage:loadTexture(Path.getTask("img_task02c"))
		if callback then
			callback()
		end
	end)

	local seqAction = cc.Sequence:create(moveAction, callAction)
	self._bgImage:runAction(seqAction)
end

function DailyActivityHintCell:_onTouchBeganEvent(touch,event)
	local touchPoint = touch:getLocation()
	local locationInNode = self._bgImage:convertToNodeSpace(touchPoint)
	local s = self._bgImage:getContentSize()
	local rect = cc.rect(0, 0, s.width, s.height)
	if cc.rectContainsPoint(rect, locationInNode) then
		self._beganClickPoint = touchPoint
		self._isClick = true
		return true
	end
end


function DailyActivityHintCell:_onTouchMoveEvent(touch,event)
	local newPoint = touch:getLocation()
	if self._beganClickPoint and self._isClick then
		if math.abs(self._beganClickPoint.x - newPoint.x) > 15 or math.abs(self._beganClickPoint.y - newPoint.y) > 15 then
			self._isClick = false
		end
	end
end

-- Describle：
function DailyActivityHintCell:_onTouchEndEvent(touch,event)
	-- body
	if self._isClick and self._clickCallback then
		self._clickCallback(self._cellIndex)
	end
	self._beganClickPoint = nil
	self._isClick = false

end

function DailyActivityHintCell:_showRedPoint(funcId)
	local redImg = self._resourceNode:getChildByName("redPoint")
	if not redImg then
		local UIHelper  = require("yoka.utils.UIHelper")
		redImg = UIHelper.createImage({texture = Path.getUICommon("img_redpoint") })
		redImg:setName("redPoint")
		redImg:setPosition(30, self._resourceNode:getContentSize().height - 30)
		self._resourceNode:addChild(redImg)
	end

	-- enum Func
	if funcId == FunctionConst.FUNC_CAMP_RACE then
		local showCmpRaceRedPoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAMP_RACE)
		redImg:setVisible(showCmpRaceRedPoint)
	else
		redImg:setVisible(false)
	end
end

return DailyActivityHintCell
