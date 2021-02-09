--竞技场扫荡界面
local PopupBase = require("app.ui.PopupBase")
local PopupArenaSweep = class("PopupArenaSweep", PopupBase)

local PopupArenaSweepCell = require("app.scene.view.arena.PopupArenaSweepCell")

function PopupArenaSweep:ctor(rewards, isWin)
	--[[
		rewards = {
			resRewards,
			itemRewards,
		}
	]]
    self._sweepBG = nil     --背景节点
    self._btnFinish = nil   --完成按钮
    self._sweepTimeDelay = 0.5    --扫荡间隔时间
	self._sweepCurrTime = 0

    self._count = 0         --个数

    self._isWin = isWin --是否胜利
    self._rewards = rewards
	local resource = {
		file = Path.getCSB("PopupArenaSweep", "arena"),
		binding = {
			_btnFinish = {
				events = {{event = "touch", method = "_onCloseClick"}}
			},
		}
	}
	PopupArenaSweep.super.ctor(self, resource)
end

function PopupArenaSweep:onCreate()
    self._btnFinish:setString(Lang.get("arena_sweep_finish"))
    self._btnFinish:setVisible(false)
    self._sweepBG:setCloseFunc(handler(self, self._onCloseClick))
	self._sweepBG:setTitle(Lang.get("arena_sweep_title"))
end

function PopupArenaSweep:onEnter()
   -- self:scheduleUpdate()
	self:scheduleUpdateWithPriorityLua(handler(self, self._update), 0)

end

function PopupArenaSweep:onExit()
 	self:unscheduleUpdate()
end

function PopupArenaSweep:_onCloseClick()
    self:close()
end

function PopupArenaSweep:_update(dt)
	if self._sweepCurrTime > self._sweepTimeDelay then
		self:_updateCell()
		self._sweepCurrTime = 0
	end
	self._sweepCurrTime = self._sweepCurrTime + dt
end


function PopupArenaSweep:_updateCell()
	self._count = self._count + 1
	if self._count > #self._rewards then
		self._btnFinish:setVisible(true)
	else
		self:_addItem(self._count)
	end
end

function PopupArenaSweep:_addItem(idx)
	local reward = self._rewards[idx]

	local title = Lang.get("arena_sweep_title1", {count = idx})
	local cell = PopupArenaSweepCell.new()
	cell:updateUI(title, reward.rewards, reward.turnRewards, reward.result, reward.addRewards)
	self._sweepBG:pushItem(cell)
	self._sweepBG:scrollToBottom()
	--扫荡界面，一定概率弹出角色升级
	local UserCheck = require("app.utils.logic.UserCheck")
	local levelUp, upValue = UserCheck.isLevelUp()
end

return PopupArenaSweep
