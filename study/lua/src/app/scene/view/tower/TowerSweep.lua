local PopupBase = require("app.ui.PopupBase")
local TowerSweep = class("TowerSweep", PopupBase)

local TowerSweepNode = require("app.scene.view.tower.TowerSweepNode")
local TowerSweepBoxNode = require("app.scene.view.tower.TowerSweepBoxNode")
local Scheduler = require("cocos.framework.scheduler")

function TowerSweep:ctor(nextLayer, results, callback)
    self._sweepBG = nil     --背景节点
    self._btnFinish = nil   --完成按钮
    self._scheduler = nil   --update
    self._sweepTimeDelay = 0.25    --扫荡间隔时间
    self._count = 0         --个数
    self._layer = nextLayer         --层数
    self._callBack = callback
	self._isSweepFinish = false		--扫荡完成

    self._results = results
	local resource = {
		file = Path.getCSB("TowerSweep", "tower"),
		binding = {
			_btnFinish = {
				events = {{event = "touch", method = "_onCloseClick"}}
			},
		}
	}
	TowerSweep.super.ctor(self, resource)
end

function TowerSweep:onCreate()
    self._btnFinish:setString(Lang.get("challenge_tower_sweep_finish"))
    self._btnFinish:setVisible(false)
    self._sweepBG:setCloseFunc(handler(self, self._onCloseClick))
	self._sweepBG:setTitle(Lang.get("sweep_title"))
	self._isClickOtherClose = false
	self._sweepBG:setCloseVisible(false)
end

function TowerSweep:onEnter()
	if self._scheduler ~= nil then
		Scheduler.unscheduleGlobal(self._scheduler)
		self._scheduler = nil
	end
    self._scheduler = Scheduler.scheduleGlobal(handler(self, self._update), self._sweepTimeDelay)
end

function TowerSweep:onExit()
	if self._scheduler then
		Scheduler.unscheduleGlobal(self._scheduler)
		self._scheduler = nil
	end
end

function TowerSweep:closeWithAction()
	if self._isSweepFinish then
		TowerSweep.super.closeWithAction(self)
		self._callBack()
	end
end

function TowerSweep:_onCloseClick()
	self:closeWithAction()
end

function TowerSweep:_update(dt)
	self._count = self._count + 1
	if self._count > #self._results then
        self._btnFinish:setVisible(true)
		self._isSweepFinish = true
		self._isClickOtherClose = true
		self._sweepBG:setCloseVisible(true)
	else
		self:_addItem(self._count)
	end    
end

function TowerSweep:_addItem(idx)	
	local result = self._results[idx]
    local title = ""
	local cell = nil
    if result.from == "box" then
        title = Lang.get("challenge_tower_sweep_title2")
	--	dump(result.rewards)
		cell = TowerSweepBoxNode.new(result.rewards,title)
    elseif result.from == "tower" then
        title = Lang.get("challenge_tower_sweep_title1", {count = self._layer})
        self._layer = self._layer + 1
		cell = TowerSweepNode.new(result.rewards, result.addRewards, title)
    end
	self._sweepBG:pushItem(cell)
	self._sweepBG:scrollToBottom()
end

return TowerSweep