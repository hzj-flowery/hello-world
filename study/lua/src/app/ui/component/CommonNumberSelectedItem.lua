-- Author: zhanglinsen
-- Date:2018-10-12 17:05:02
-- Describle：
local CommonNumberSelectedItem = class("CommonNumberSelectedItem")

--显示状态
local State = {
    normal = {alpha=1.0,fontSize=30},        -- 正常 normal
    state1 = {alpha=0.8,fontSize=26},        -- 缩放状态 1
    state2 = {alpha=0.7,fontSize=24},        -- 缩放状态 2
    state3 = {alpha=0.6,fontSize=22},        -- 缩放状态 3
    state4 = {alpha=0.5,fontSize=20},        -- 缩放状态 4
}

local EXPORTED_METHODS = {
    "updateUI",
	"setTemplate",
	"getSelectData",
}

function CommonNumberSelectedItem:ctor()
	self._target = nil
	self._templateCell = require("app.scene.view.groups.GroupsNumberSelectedCell") --默认cell
	self._cellSize = cc.size(0, 0)
	self._listViewSize = cc.size(0, 0)
	self._listInnerSize = cc.size(0, 0)
	self._placeholderCount = 0 --占位格数量(顶端、底端数量一样，需要补充空位置)
	self._curIndex = 0
	self._listDatas = {}
	self._lastPosy = 0 --记录ScrollView上一帧所处位置
	self._isMoving = false
end

function CommonNumberSelectedItem:_init()
	self._listView = ccui.Helper:seekNodeByName(self._target, "ListView")
	cc.bind(self._listView, "ScrollView")
	
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected), handler(self, self._onScrollEvent))
end

function CommonNumberSelectedItem:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonNumberSelectedItem:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonNumberSelectedItem:setTemplate(template)
	self._templateCell = template
end

function CommonNumberSelectedItem:updateUI(datas, curValue)
	self:_initData(datas)

	self._listView:clearAll()
	self._listView:resize(#self._listDatas)
	self._listView:addTouchEventListener(handler(self, self._onTouchEvent)) --risize之后设置，重载基类中的方法
	--resize后再计算innerSize
	self._listInnerSize = self._listView:getInnerContainer():getContentSize()

	for i, value in ipairs(self._listDatas) do
		if value == curValue then
			self._curIndex = i
		end
	end

	self:_fixLocation()
end

function CommonNumberSelectedItem:_initData(datas)
	self._listView:setTemplate(self._templateCell)
	self._cellSize = self._templateCell.new():getContentSize()
	self._listViewSize = self._listView:getContentSize()

	self._placeholderCount = math.ceil((self._listViewSize.height - self._cellSize.height) / 2 / self._cellSize.height)
	self._listDatas = {}
	for i = 1, self._placeholderCount do
		table.insert(self._listDatas, "")
	end
	for k, value in ipairs(datas) do
		table.insert(self._listDatas, value)
	end
	for i = 1, self._placeholderCount do
		table.insert(self._listDatas, "")
	end
end

function CommonNumberSelectedItem:_onItemUpdate(item, index)
	local itemData = self._listDatas[index+1]
	if itemData then
		item:updateUI(itemData)
	end
end

function CommonNumberSelectedItem:_onItemSelected(item, index)

end

function CommonNumberSelectedItem:_onScrollEvent(sender, eventType)
	self._isMoving = false
	if eventType == ccui.ScrollviewEventType.autoscrollEnded then
		self:_fixLocation()
	elseif eventType == ccui.ScrollviewEventType.containerMoved then
		self._isMoving = true
		self:_onCheckCurIndex()
		local isSlow = self:_checkIsMoveSlow()
		if isSlow then
			self:_fixLocation()
		end
	end
end

function CommonNumberSelectedItem:_onTouchEvent(sender, state)
	if state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		if self._isMoving == false then
			self:_fixLocation()
		end
	end
end

--定位
function CommonNumberSelectedItem:_fixLocation()
	local minIndex = 1 + self._placeholderCount --定位时允许的最小索引
	local maxIndex = #self._listDatas - self._placeholderCount --定位时允许的最大索引
	if self._curIndex < minIndex then
		self._curIndex = minIndex
	end
	if self._curIndex > maxIndex then
		self._curIndex = maxIndex
	end
	
	local offset = self._listViewSize.height/2 - self._cellSize.height/2
	self._listView:setLocation(self._curIndex, offset)
	self:_updateItemState()
	self._isMoving = false
end

--更新item缩放透明度等状态
--index是中间那格的索引
function CommonNumberSelectedItem:_updateItemState()
	local index = self._curIndex
	local region = self._placeholderCount + 1 --区间比空位个数多1
	local startIndex = math.max(index-region, 1)
	local endIndex = math.min(index+region, #self._listDatas)
	for i = startIndex, endIndex do
		local tag = i - 1
		local item = self._listView:getItemByTag(tag)
		local state = State.normal
		local absValue = math.abs(i-index)
		if absValue > 0 then
			state = State["state"..absValue] or State.state4
		end
		if item then
			item:updateState(state)
		end
	end
end

function CommonNumberSelectedItem:_onCheckCurIndex()
	local index = self:_findCurIndex() 
	if index ~= self._curIndex then
		self._curIndex = index
		self:_updateItemState()
	end
end

function CommonNumberSelectedItem:_findCurIndex()
	local innerHeight = self._listInnerSize.height
	local posy = self._listView:getInnerContainer():getPositionY()
	local tarHeight = innerHeight + posy - self._listViewSize.height/2
	local tarIndex = math.ceil(tarHeight/self._cellSize.height)
	return math.max(tarIndex, 1)
end

function CommonNumberSelectedItem:getSelectData()
	return self._listDatas[self._curIndex]
end

--检测是否移动缓慢，如果定义为缓慢，则停止并确定位置
function CommonNumberSelectedItem:_checkIsMoveSlow()
	local minDis = 1 --每帧移动距离小于此值，则定义为移动缓慢

	local curPosy = self._listView:getInnerContainer():getPositionY()
	local diffDis = math.abs(curPosy - self._lastPosy)
	self._lastPosy = curPosy
	if diffDis < minDis then
		return true
	else
		return false
	end
end

return CommonNumberSelectedItem