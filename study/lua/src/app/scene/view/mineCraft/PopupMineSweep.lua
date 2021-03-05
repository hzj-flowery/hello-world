local PopupBase = require("app.ui.PopupBase")
local PopupMineSweep = class("PopupMineSweep", PopupBase)

local SchedulerHelper = require ("app.utils.SchedulerHelper")
local PopupMineSweepCell = require("app.scene.view.mineCraft.PopupMineSweepCell")
local PopupMineSweepTotalCell = require("app.scene.view.mineCraft.PopupMineSweepTotalCell")

PopupMineSweep.SWEEP_TIME = 0.5

function PopupMineSweep:ctor(reportList)
    self._reportList = reportList
    self._count = 0
	self._scheduleHandler = nil

    local resource = {
		file = Path.getCSB("PopupMineSweep", "mineCraft"),
		binding = {
			_btnFinish = {
				events = {{event = "touch", method = "_onFinishClick"}}
			},
		}
	}
	PopupMineSweep.super.ctor(self, resource)
end

function PopupMineSweep:onCreate()
    self._btnFinish:setString(Lang.get("mine_sweep_finish"))
    self._btnFinish:setVisible(false)
	self._sweepBG:setCloseFunc(handler(self, self._onFinishClick))
	self._sweepBG:setTitle(Lang.get("mine_sweep_title"))
end

function PopupMineSweep:onEnter()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._update), PopupMineSweep.SWEEP_TIME)    
end

function PopupMineSweep:onExit()
    if self._scheduleHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
		self._scheduleHandler = nil
	end
end

function PopupMineSweep:_update(f)
	self._count = self._count + 1
	if self._count > #self._reportList then
        self._btnFinish:setVisible(true)
		self._isSweepFinish = true
		self._isClickOtherClose = true
		self._sweepBG:setCloseVisible(true)
		self:_addTotalItem()
		if self._scheduleHandler ~= nil then
			SchedulerHelper.cancelSchedule(self._scheduleHandler)
			self._scheduleHandler = nil
		end
		local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
		local HomelandConst = require("app.const.HomelandConst")
		HomelandHelp.delayShowBuffNoticeTip(HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_20) --神树祈福buff
	else
		self:_addItem()
	end        
end

function PopupMineSweep:_addItem()
    local data = self._reportList[self._count]
    local cell = PopupMineSweepCell.new(data)
	self._sweepBG:pushItem(cell)
	self._sweepBG:scrollToBottom()    
end

function PopupMineSweep:_addTotalItem()
	local data = self._reportList[#self._reportList]		--信息就那最后一个
	local cell = PopupMineSweepTotalCell.new(data)

	local totalSelfRed = 0
	local totalTarRed = 0
	local totalSelfInfame = 0
	local totalTarInfame = 0
	local myWin = 0
	local TarWin = 0
	for _, reportData in pairs(self._reportList) do 
		local star = reportData:getWin_type()
		if star <= 0 then 
			TarWin = TarWin + 1
		else 
			myWin = myWin + 1
		end

		totalSelfRed = totalSelfRed + reportData:getSelf_dec_army()
		totalTarRed = totalTarRed + reportData:getTar_dec_army()
		totalSelfInfame = totalSelfInfame + reportData:getSelf_infamy_add()
		totalTarInfame = totalTarInfame + reportData:getTar_infamy_add()
	end

	cell:updateTotal(myWin, TarWin, data:isSelf_is_die(), data:isTar_is_die(), data:getSelf_army(), data:getTar_army(), totalSelfRed, totalTarRed, totalSelfInfame, totalTarInfame)
	self._sweepBG:pushItem(cell)
	self._sweepBG:scrollToBottom()    
end

function PopupMineSweep:_onFinishClick()
    self:closeWithAction()
end

return PopupMineSweep
