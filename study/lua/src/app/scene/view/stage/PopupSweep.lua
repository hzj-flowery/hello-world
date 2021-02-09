local PopupBase = require("app.ui.PopupBase")
local PopupSweep = class("PopupSweep", PopupBase)

local PopupSweepNode = require("app.scene.view.stage.PopupSweepNode")
local Scheduler = require("cocos.framework.scheduler")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

PopupSweep.SWEEP_TIME_DELAY = 0.5			--每条扫荡出现的间隔

function PopupSweep:ctor(callback)
    self._sweepBase = nil                           --扫荡基础模版
    self._btnDone = nil                             --完成按钮
    self._btnReset = nil                            --重制按钮

    self._count = 0
	-- self._scheduler = nil
	self._results = nil
    
    self._callback = callback                       --回掉

	self._isSweepFinish = false						--扫荡是否完成
	self._showItems = {}

	self._imageItem1 = nil
	self._imageItem2 = nil
	self._nodeItem1 = nil
	self._nodeItem2 = nil


	local resource = {
		file = Path.getCSB("PopupSweep", "stage"),
		binding = {
			_btnDone = {
				events = {{event = "touch", method = "_onCloseClick"}}
			},
			_btnReset = {
				events = {{event = "touch", method = "_onBtnReset"}}
			},
		}
	}
	PopupSweep.super.ctor(self, resource)
end

function PopupSweep:onCreate()
	self._btnDone:setString(Lang.get("common_btn_sure"))
	self._btnReset:setString(Lang.get("stage_fight_ten",{count = 10}))
	self._btnDone:setVisible(false)
	self._btnReset:setVisible(false)
	self._sweepBase:setCloseFunc(handler(self, self._onCloseClick))
	self._sweepBase:setTitle(Lang.get("sweep_title"))
	self._isClickOtherClose = false
	self._sweepBase:setCloseVisible(false)
end

function PopupSweep:onEnter()
    -- self._scheduler = Scheduler.scheduleGlobal(handler(self, self._update), PopupSweep.SWEEP_TIME_DELAY)
end

function PopupSweep:onExit()
	-- Scheduler.unscheduleGlobal(self._scheduler)
	-- self._scheduler = nil
end

--点击关闭
function PopupSweep:_onCloseClick()
	if self._isSweepFinish then
    	self:closeWithAction()
	end
end

--点击重制
function PopupSweep:_onBtnReset()
	local isBreak
	if self._callback then
		isBreak = self._callback()
	end
	if not isBreak then
		self:close()
	end
end

--开始播放
function PopupSweep:start()
	self._count = 0
	self:_checkNextItem()
end

--更新
-- function PopupSweep:_update(f)
-- 	self._count = self._count + 1
-- 	if self._count == #self._results + 1 then
-- 		self:_addTotal()
-- 		self._btnDone:setVisible(true)
-- 		self._btnReset:setVisible(true)
-- 		local UserCheck = require("app.utils.logic.UserCheck")
-- 		local levelUp, upValue = UserCheck.isLevelUp()
-- 		G_SignalManager:dispatch(SignalConst.EVENT_SWEEP_FINISH)
-- 		G_SignalManager:dispatch(SignalConst.EVENT_TOPBAR_START)
-- 		self._isSweepFinish = true
-- 		self._isClickOtherClose = true
-- 	elseif self._count <= #self._results then
-- 		self:_addItem(self._count)
-- 	end
-- end

--添加一条扫荡
function PopupSweep:_addItem()	
	local result = self._results[self._count]
	if result then
		local cell = PopupSweepNode.new(result, self._count, handler(self, self._checkNextItem))
		self._sweepBase:pushItem(cell)
		self:_checkFragment(result)
		cell:playEnterAction()
	end
end

--添加总共获得的面板
function PopupSweep:_addTotal()
	local totalResults = self:_getTotalResult()
	local cell = PopupSweepNode.new(totalResults, 0, handler(self, self._checkNextItem))
	self._sweepBase:pushItem(cell)
	cell:playEnterAction()
end

--检查是否扫荡完成
function PopupSweep:_checkNextItem()
	self._count = self._count + 1 
	if self._count > #self._results + 1 then
		G_SignalManager:dispatch(SignalConst.EVENT_TOPBAR_START)
		self._btnDone:setVisible(true)
		self._btnReset:setVisible(true)
		local UserCheck = require("app.utils.logic.UserCheck")
		local levelUp, upValue = UserCheck.isLevelUp()
		G_SignalManager:dispatch(SignalConst.EVENT_SWEEP_FINISH)
		self._isSweepFinish = true
		self._isClickOtherClose = true
		self._sweepBase:setCloseVisible(true)
	elseif self._count == #self._results + 1 then
		self:_addTotal()
	elseif self._count <= #self._results then
		self:_addItem()
	end
end

--清空总奖励
function PopupSweep:_clearTotalReward()
	self._totalReward = {}
	self._totalMoney = 0
	self._totalExp = 0
end

--开始扫荡显示, 输入需要显示掉落的物品
function PopupSweep:updateReward(results, awardList)
	self._isSweepFinish = false
	self._isClickOtherClose = false
	self._sweepBase:setCloseVisible(false)
	self:_clearTotalReward()
	self._btnDone:setVisible(false)
	self._btnReset:setVisible(false)
	self._sweepBase:clearDropList()
	self._count = 0
	self._results = results
	self:_setShowItems(awardList)
end

--扫荡物品数量
function PopupSweep:_getSweepCount(type, value)
	local count = 0
	for i, v in pairs(self._results) do
		for _, item in pairs(v.rewards) do
			if item.type == type  and item.value == value then
				count = count + item.size
			end
		end
	end
	return count
end

--处理需要显示的物品
function PopupSweep:_setShowItems(awardList)
	self._showItems = {}
	for i = 1, 2 do
		self["_imageItem"..i]:setVisible(false)
	end
	local count = 1
	for i, v in pairs(awardList) do
		if v.type == TypeConvertHelper.TYPE_FRAGMENT then
			if count > 2 then
				return
			end
			self["_imageItem"..count]:setVisible(true)
			local param = TypeConvertHelper.convert(v.type, v.value)
			local hasNum = UserDataHelper.getNumByTypeAndValue(v.type, v.value)
			local sweepNum = self:_getSweepCount(v.type, v.value)
			local needNum = param.cfg.fragment_num
			local itemColor = param.cfg.color
			local item = 
			{
				name = param.name,
				type = v.type,
				value = v.value,
				countNow = hasNum - sweepNum,
				needCount = needNum,
				color = itemColor,
			}
			self._showItems[count] = item
			-- self["_textFragment"..count]:setString(param.name.."："..item.countNow.."/"..needNum)
			-- self["_textCount"..count]:setString(item.countNow.."/"..needNum)
			
			-- self["_nodeItem"..count]:removeAllChildren()
			-- local countTotal = item.countNow.."/"..item.needCount
			-- local showColor = Colors.getColor(item.color)
			-- local label = ccui.RichText:createWithContent(Lang.get("sweep_item", {itemName = item.name, itemColor = Colors.colorToNumber(fontBaseColor), count = countTotal}))
			-- label:setAnchorPoint(cc.p(0.5, 0.5))
			-- self["_nodeItem"..count]:addChild(label)
			self:_updateRichText(count, item)
			count = count + 1
		end
	end
end

function PopupSweep:_updateRichText(idx, item)
	self["_nodeItem"..idx]:removeAllChildren()
	local countTotal = item.countNow.."/"..item.needCount
	local showColor = Colors.getColor(item.color)
	local label = ccui.RichText:createWithContent(Lang.get("sweep_item", {itemName = item.name, itemColor = Colors.colorToNumber(showColor), count = countTotal}))
	label:setAnchorPoint(cc.p(0.5, 0.5))
	self["_nodeItem"..idx]:addChild(label)
	local action1 = cc.ScaleTo:create(0.2, 1.2)
	local action2 = cc.ScaleTo:create(0.1, 1)
	local action = cc.Sequence:create(action1, action2)
	self["_nodeItem"..idx]:runAction(action)
end

--处理每条扫荡物品是否有碎片
function PopupSweep:_checkFragment(items)
	-- local discoverLabel = ccui.RichText:createWithContent(Lang.get("siege_discover", {name = disCoverName, fontColor = Color.colorToNumber(fontBaseColor), outColor = Color.colorToNumber(outLineColor)}))
    -- discoverLabel:setAnchorPoint(cc.p(0.5, 0.5))
    -- self._nodeDiscover:removeAllChildren()
    -- self._nodeDiscover:addChild(discoverLabel)
	local function updateFragment(item)
		for i = 1, 2 do
			if item.value == self._showItems[i].value then
				self._showItems[i].countNow = self._showItems[i].countNow + item.size
				local item = self._showItems[i]
				self:_updateRichText(i, item)

				break
			end
		end
	end
	for i, v in pairs(items.rewards) do
		if v.type == TypeConvertHelper.TYPE_FRAGMENT then
			updateFragment(v)
		end
	end
end

--获得总奖励
function PopupSweep:_getTotalResult()
	local totalResults = 
	{
		money = 0,
		exp = 0,
		rewards = {},
	}
	for _, v in pairs(self._results) do
		totalResults.exp = totalResults.exp + v.exp
		totalResults.money = totalResults.money + v.money
		if v.addRewards then
			for _, add in pairs(v.addRewards) do
				totalResults.money = totalResults.money + add.reward.size
			end
		end
		for _, reward in pairs(v.rewards) do
			self:_addTotalReward(totalResults.rewards, reward)
		end
	end
	return totalResults
end

--总共获得奖励
function PopupSweep:_addTotalReward(total, reward)
	local isInTotal = false
	for _, v in pairs(total) do
		if reward.type == v.type and reward.value == v.value then
			v.size = v.size + reward.size
			isInTotal = true
		end
	end
	if not isInTotal then
		table.insert(total, reward)
	end
end

--设置右边按钮文字
function PopupSweep:setBtnResetString(s)
	self._btnReset:setString(s)
end

--设置回调
function PopupSweep:setCallback(callback)
	self._callback = callback
end

return PopupSweep