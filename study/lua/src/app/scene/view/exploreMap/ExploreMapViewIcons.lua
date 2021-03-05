local ViewBase = require("app.ui.ViewBase")
local ExploreMapViewIcons = class("ExploreMapViewIcons", ViewBase)
local ExploreConst = require("app.const.ExploreConst")
local ExploreMapViewEventIcon = require("app.scene.view.exploreMap.ExploreMapViewEventIcon")
local ExploreDiscover = require("app.config.explore_discover")
local scheduler = require("cocos.framework.scheduler")

ExploreMapViewIcons.EVENT_ICONS_START_GAP = 60
ExploreMapViewIcons.EVENT_ICONS_GAP_Y = 120
ExploreMapViewIcons.EVENT_ICONS_END_GAP = 60

ExploreMapViewIcons.LAYOUT_TYPE_COUNT = 0      --count 发生变化
ExploreMapViewIcons.LAYOUT_TYPE_APPEAR = 1     --事件icon出现 发生变化
ExploreMapViewIcons.LAYOUT_TYPE_DISAPPEAR = 2  --事件icon消失 发生变化

ExploreMapViewIcons.ICONS_POS_OFFSETX = -10


function ExploreMapViewIcons:ctor(parentView, scrollView)
	--csb bind var name
    self._iconsData = {}
    self._doLayoutType = nil
    self._parentView = parentView
	self._scrollView = scrollView
	--
	self._scrollView:addChild(self)
	self._scrollViewSize = self._scrollView:getContentSize()

	ExploreMapViewIcons.super.ctor(self)
end

function ExploreMapViewIcons:onEnter()
    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._onTimer), 0.5)
end

function ExploreMapViewIcons:onExit()
    scheduler.unscheduleGlobal(self._countDownScheduler)
    self._countDownScheduler = nil
end


function ExploreMapViewIcons:initDataAndUI()
    local iconsData = {
        {eventType = ExploreConst.EVENT_TYPE_ANSWER, count = 0, posIndex = 0, node = nil, time = 0, isHaveTime = true }, -- 水镜学堂
        {eventType = ExploreConst.EVENT_TYPE_HALP_PRICE, count = 0, posIndex = 0, node = nil, time = 0, isHaveTime = true}, -- 半价物资
        {eventType = ExploreConst.EVENT_TYPE_REBEL, count = 0, posIndex = 0, node = nil, time = 0, isHaveTime = true}, -- 洛阳之乱
        {eventType = ExploreConst.EVENT_TYPE_HERO, count = 0, posIndex = 0, node = nil, time = 0, isHaveTime = true}, -- 慕名而来
        {eventType = ExploreConst.EVENT_TYPE_REBEL_BOSS, count = 0, posIndex = 0, node = nil, time = 0, isHaveTime = true} -- 董卓战乱
    }

    local tempPosIndex = 0
	self._scrollView:stopAutoScroll()
	self._scrollView:setTouchEnabled(true)
	-- self._scrollView:setInnerContainerPosition(cc.p(0, 0))
	self:stopAllActions()
    self:removeAllChildren()
    for k, v in ipairs(iconsData) do
        v.node = ExploreMapViewEventIcon.new(v.eventType, handler(self, self._openEventPanel))
        self:addChild(v.node)
        v.count = G_UserData:getExplore():getUnFinishEventCountByType(v.eventType)
        if v.count ~= 0 then
            v.posIndex = tempPosIndex
            v.node:setPosition(self:_getPosByIndex(tempPosIndex))
            v.node:setCount(v.count)
            if v.isHaveTime then
                local endTime = self:_getEventMinTimeByType(v.eventType)
                if endTime then
                    v.time = endTime
                    v.node:updateLeftTime(G_ServerTime:getLeftSecondsString(v.time, "00:00:00"))
                end
            end
            v.node:setVisible(true)
            tempPosIndex = tempPosIndex + 1
        else
            v.node:setVisible(false)
        end
    end
    self._iconsData = iconsData
	self:_updateScrollViewPos()
end

--获取当前可见事件icon 数目
function ExploreMapViewIcons:getCurVisibelIconsNum()
    local num = 0
    for k, v in ipairs(self._iconsData) do
        if v.count ~= 0 then
            num = num + 1
        end
    end
    return num
end

function ExploreMapViewIcons:runFirstOnEnterAction(callback)
    local index = 0
    local totalCount = #self._iconsData
    local function actionCallBack()
        index = index + 1
        if index == totalCount then
            if callback then
                callback()
            end
        end
    end
    for k, v in ipairs(self._iconsData) do
        if v.count ~= 0 then
            v.node:runOnEnterAction(actionCallBack)
        else
            actionCallBack()
        end
    end
end


function ExploreMapViewIcons:updateEventIconsDataByType(eventType)
    local tempPosIndex = 0
    local newCount = G_UserData:getExplore():getUnFinishEventCountByType(eventType)
    for k, v in ipairs(self._iconsData) do
        if v.eventType == eventType then
            if v.count == 0 and newCount > 0 then
                self._doLayoutType = ExploreMapViewIcons.LAYOUT_TYPE_APPEAR
            elseif v.count > 0 and newCount == 0 then
                self._doLayoutType = ExploreMapViewIcons.LAYOUT_TYPE_DISAPPEAR
            elseif v.count ~= newCount then
                self._doLayoutType = ExploreMapViewIcons.LAYOUT_TYPE_COUNT
            else
                self._doLayoutType = nil
            end
            v.count = newCount
            if v.isHaveTime then
                v.time = self:_getEventMinTimeByType(eventType)
            end
        end
        if v.count ~= 0 then
            v.posIndex = tempPosIndex
            tempPosIndex = tempPosIndex + 1
        end
    end
end

function ExploreMapViewIcons:_getIconDataByType(eventType)
    for k, v in ipairs(self._iconsData) do
        if v.eventType == eventType then
            return v
        end
    end
    assert(false, "_getIconDataByType return nil "..eventType)
end


function ExploreMapViewIcons:_getPosByIndex(posIndex)
	return cc.p(0,
		-1 * (ExploreMapViewIcons.EVENT_ICONS_START_GAP + posIndex * ExploreMapViewIcons.EVENT_ICONS_GAP_Y))
end

function ExploreMapViewIcons:_getScollViewHeight()
	local num = self:getCurVisibelIconsNum()
	local totalHeight = ExploreMapViewIcons.EVENT_ICONS_START_GAP + ExploreMapViewIcons.EVENT_ICONS_END_GAP +
						ExploreMapViewIcons.EVENT_ICONS_GAP_Y * (num - 1)
	if totalHeight < self._scrollViewSize.height then
		return self._scrollViewSize.height
	end
	return totalHeight
end

function ExploreMapViewIcons:_updateScrollViewPos()
	local height = self:_getScollViewHeight()
	self:_updateSelfPostion(height)
	self._scrollView:setInnerContainerSize(cc.size(self._scrollViewSize.width, height))
end

function ExploreMapViewIcons:_updateSelfPostion(height)
	self:setPosition(cc.p(self._scrollViewSize.width/2 + ExploreMapViewIcons.ICONS_POS_OFFSETX, height))
end
-- 保证 icon 在可见区域
function ExploreMapViewIcons:checkIconInVisibleViewPort(eventType, callback)

	local tempPosIndex = 0
	local findIndex = nil
	for k, v in ipairs(self._iconsData) do
		if v.eventType == eventType then
			findIndex = tempPosIndex
			break
		end
        if v.count ~= 0 then
            tempPosIndex = tempPosIndex + 1
        end
    end
	-- 没找到
	if not findIndex then
		callback()
		return
	end
	-- 高度
	local innerHeight = self:_getScollViewHeight()
	-- 屏蔽触摸滑动
	self._scrollView:stopAutoScroll()
	self._scrollView:setTouchEnabled(false)
	-- 找到了  判断 是否在scroll view 可见区域
	--移动到可见视口
	local function moveToVisibleViewPort(innerPos, targetPos, endCallBack)
		if innerHeight <= self._scrollViewSize.height then
			endCallBack()
			return
		end
		-- 不需要检查
		local topPos = targetPos.y + ExploreMapViewIcons.EVENT_ICONS_GAP_Y/2
		local bottomPos = targetPos.y - ExploreMapViewIcons.EVENT_ICONS_GAP_Y/2
		local topLimit = -1 * (innerHeight  +  innerPos.y - self._scrollViewSize.height)
		local bottomLimit = -1 * (innerHeight  +  innerPos.y)
		--在可见视口
		if topPos < topLimit and bottomPos > bottomLimit then
			-- 在可见区域
			endCallBack()
			return
		else
			--靠上
			local targetScrollPosY = 0
			if topPos > topLimit then
				targetScrollPosY = topPos + innerHeight - self._scrollViewSize.height
			else
				targetScrollPosY =  bottomPos + innerHeight
			end
			targetScrollPosY = -1 * targetScrollPosY
			if targetScrollPosY > 0 then
				targetScrollPosY = 0
			elseif targetScrollPosY < self._scrollViewSize.height - innerHeight then
				targetScrollPosY = self._scrollViewSize.height - innerHeight
			end
			local time = math.abs((targetScrollPosY - innerPos.y) / 800.0)
			if time > 1 then
				time = 1
			end
			-- targetScrollPosY
			local percent = math.abs(100 * (1 - (-1 *targetScrollPosY)/(innerHeight - self._scrollViewSize.height)))
			self._scrollView:scrollToPercentVertical(percent, time, false)
			local delayAction = cc.DelayTime:create(time)
			local callFunc = cc.CallFunc:create(function()
				endCallBack()
			end)
			local seqAction = cc.Sequence:create(delayAction, callFunc)
			self:stopAllActions()
			self:runAction(seqAction)
		end
	end

	local oldInnerPos = self._scrollView:getInnerContainerPosition()
	local oldInnerSize = self._scrollView:getInnerContainerSize()
	local targetPos = self:_getPosByIndex(findIndex)
	if self._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_COUNT then
		--数目发生变化  scroll view 高度不变 滚动到指定位置就可以
		moveToVisibleViewPort(oldInnerPos, targetPos, callback)
    elseif self._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_APPEAR then
		-- 数目发生变化  scroll view 高都发生变化
		self:_updateSelfPostion(innerHeight)
		self._scrollView:setInnerContainerSize(cc.size(self._scrollViewSize.width, innerHeight))
		local posy = oldInnerPos.y - (innerHeight - oldInnerSize.height)
		local newInnerPos = cc.p(oldInnerPos.x, posy)
		self._scrollView:setInnerContainerPosition(newInnerPos)
		moveToVisibleViewPort(newInnerPos, targetPos, callback)
    elseif self._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_DISAPPEAR then
		self:_updateSelfPostion(innerHeight)
		self._scrollView:setInnerContainerSize(cc.size(self._scrollViewSize.width, innerHeight))
		local posy = oldInnerPos.y - (innerHeight - oldInnerSize.height)
		if posy > 0 then
			posy = 0
		end
		self._scrollView:setInnerContainerPosition(cc.p(oldInnerPos.x, posy))
		callback()
	else
		moveToVisibleViewPort(oldInnerPos, targetPos, callback)
    end

end


--获取icon 的世界坐标
function ExploreMapViewIcons:getIconWorldPosByType(eventType)
    local iconData = self:_getIconDataByType(eventType)
    local targetPos = self:_getPosByIndex(iconData.posIndex)
    return self:convertToWorldSpace(targetPos)
end


function ExploreMapViewIcons:doLayout(eventType, callback)
    if not self._doLayoutType then
		self._scrollView:setTouchEnabled(true)
        if callback then
            callback()
        end
        return
    end
    --action 回调
    local index = 0
    local totalCount = #self._iconsData
    local function actionCallBack()
        index = index + 1
        if index == totalCount then
			self._scrollView:setTouchEnabled(true)
            if callback then
                callback()
            end
        end
    end

    if self._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_COUNT then
        local iconData = self:_getIconDataByType(eventType)
        iconData.node:runCountChangeAction(iconData.count)
		self._scrollView:setTouchEnabled(true)
        if callback then
            callback()
        end

    elseif self._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_APPEAR then
        for k, v in ipairs(self._iconsData) do
            local targetPos = self:_getPosByIndex(v.posIndex)
            if v.eventType == eventType then
                v.node:setCount(v.count)
                v.node:setPosition(targetPos)
                v.node:runAppearAction(actionCallBack)
            else
                v.node:runMoveAction(targetPos, actionCallBack)
            end
        end

    elseif self._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_DISAPPEAR then
		local iconData = self:_getIconDataByType(eventType)
        iconData.node:runDisAppearAction(function()
            for k, v in ipairs(self._iconsData) do
                local targetPos = self:_getPosByIndex(v.posIndex)
                v.node:runMoveAction(targetPos, actionCallBack)
            end
        end)
    end

    self._doLayoutType = nil
end

--count 可能发生变化
function ExploreMapViewIcons:_onEventIconsChange(eventType)
    self._parentView:pushAction(function()
        self:updateEventIconsDataByType(eventType)
		self:checkIconInVisibleViewPort(eventType, function()
			self:doLayout(eventType, function()
				self._parentView:nextAction()
			end)
		end)
    end)
end
--打开事件界面
function ExploreMapViewIcons:_openEventPanel(eventType)
	local count = G_UserData:getExplore():getUnFinishEventCountByType(eventType)
	if count == 0 then
		logWarn("============explore event count == 0 eventType = "..eventType)
		return
	end
    local popupEventBase = require("app.scene.view.exploreMap.PopupEventBase").new(handler(self, self._onEventIconsChange), eventType)
    popupEventBase:openWithAction()
end

-- --获取半价 或 慕名而来最小的剩余时间
function ExploreMapViewIcons:_getEventMinTimeByType(type)
    local events = G_UserData:getExplore():getUnFinishEvents()
    local minTime = nil
    for i, v in pairs(events) do
        if type == v:getEvent_type() then
            local endTime = v:getEndTime()
            if endTime ~= 0 then
                if not minTime then
                    minTime = endTime
                elseif endTime < minTime then
                    minTime = endTime
                end
            else
                return minTime
            end
        end
    end
    return minTime
end
-- 倒计时
function ExploreMapViewIcons:_onTimer()
    local currTime = G_ServerTime:getTime()
    for _, v in pairs(self._iconsData) do
        if v.count > 0 and v.time then
            if currTime <= v.time then
                v.node:updateLeftTime(G_ServerTime:getLeftSecondsString(v.time, "00:00:00"))
            else
                self:_onEventIconsChange(v.eventType)
            end
        end
    end

end

return ExploreMapViewIcons
