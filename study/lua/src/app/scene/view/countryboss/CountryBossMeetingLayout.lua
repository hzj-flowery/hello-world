
-- Author: nieming
-- Date:2018-05-09 10:39:38
-- Describle：
local ViewBase = require("app.ui.ViewBase")
local CountryBossMeetingLayout = class("CountryBossMeetingLayout", ViewBase)
local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
local CountryBossConst = require("app.const.CountryBossConst")


function CountryBossMeetingLayout:ctor(callback)

	--csb bind var name
	self._listView = nil  --ListView
	self._popBg = nil  --CommonNormalSmallPop
	self._closeCallback = callback
	local resource = {
		size = G_ResolutionManager:getDesignSize(),
		file = Path.getCSB("CountryBossMeetingLayout", "countryboss"),

	}

	CountryBossMeetingLayout.super.ctor(self, resource)
end

-- Describle：
function CountryBossMeetingLayout:onCreate()
	self:setName("CountryBossMeetingLayout")
	self._popBg:setTitle(Lang.get("country_boss_meeting_title"))
	self._popBg:setCloseVisible(false)
	-- self._popBg:addCloseEventListener(handler(self, self.close))
	self:_initListView()
	self:_initWidget()
	self:_initData()
	self:updateUI()
end

function CountryBossMeetingLayout:close()
	if self._closeCallback then
		self._closeCallback()
	end
	self:removeFromParent()
end

-- Describle：
function CountryBossMeetingLayout:onEnter()

	self._signalRefresh = G_SignalManager:add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_VOTE_SUCCESS, handler(self, self._onEventRefresh))
	self._signalVote = G_SignalManager:add(SignalConst.EVENT_COUNTRY_BOSS_VOTE_SUCCESS, handler(self, self._onEventRefresh))
	self._signalEnter = G_SignalManager:add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, handler(self, self._onEventEnter))
end

-- Describle：
function CountryBossMeetingLayout:onExit()
	self._signalRefresh:remove()
	self._signalRefresh = nil

	self._signalVote:remove()
	self._signalVote = nil

	self._signalEnter:remove()
	self._signalEnter = nil
end


function CountryBossMeetingLayout:_initData()
	local configList = CountryBossHelper.getBossConfigListByType(2)
	local datas = {}
	for k, v in ipairs(configList) do
		local singleData = {}
		singleData.hero_id = v.hero_id
		singleData.id = v.id
		singleData.vote = 0
		singleData.name = v.name
		singleData.config = v
		singleData.isUnLock, singleData.lockStr = CountryBossHelper.getLockString(v)
		table.insert(datas, singleData)
	end
	self._datas = datas

end

function CountryBossMeetingLayout:_onEventRefresh()
	--保护一下 当 onexit 和 网络事件 同一帧触发 可能会导致报错
	if self.updateUI then
		self:updateUI()
	end
end

function CountryBossMeetingLayout:_onStageChangeCallback(curStage)
	self:updateUI()
end

function CountryBossMeetingLayout:_initWidget()
	self._commonCountDown:enableEndLable(Lang.get("country_boss_countdown_vote_end"))
	self._commonCountDown:setCountdownLableParam({color = Colors.BRIGHT_BG_TWO})
	self._commonCountDown:setEndLabelParam({color = Colors.BRIGHT_BG_TWO})
	self._commonCountDown:setCountdownTimeParam({color = Colors.BRIGHT_BG_RED})

	local StageWidget = require("app.scene.view.countryboss.StageWidget")
	self._stageWidget = StageWidget.new(self, handler(self, self._onStageChangeCallback))
end

function CountryBossMeetingLayout:updateUI()
	for k ,v in pairs(self._datas) do
		v.vote = G_UserData:getCountryBoss():getVoteById(v.id)
		v.isUnLock, v.lockStr = CountryBossHelper.getLockString(v.config)
	end
	self._listView:resize(#self._datas)

	local curStage = self._stageWidget:updateStage()

	if curStage == CountryBossConst.STAGE2 then
		local _, endTime = CountryBossHelper.getTimeByStage(CountryBossConst.STAGE2)
		self._commonCountDown:startCountDown(Lang.get("country_boss_meeting_countdown_label"), endTime, nil, function(t)
			local curTime = G_ServerTime:getTime()
			local dt = t - curTime
			if dt < 0 then
				dt = 0
			end
			return Lang.get("country_boss_meeting_countdown", {num = dt})
		end)
	else
		self._commonCountDown:setEndLabelString(Lang.get("country_boss_countdown_vote_end"))
	end
end


function CountryBossMeetingLayout:_initListView()
	-- body
	local CountryBossMeetingCell = require("app.scene.view.countryboss.CountryBossMeetingCell")
	self._listView:setTemplate(CountryBossMeetingCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))
	-- self._listView:resize()
end

-- Describle：
function CountryBossMeetingLayout:_onListViewItemUpdate(item, index)

	item:updateUI(self._datas[index + 1])
end

-- Describle：
function CountryBossMeetingLayout:_onListViewItemSelected(item, index)

end

-- Describle：
function CountryBossMeetingLayout:_onListViewItemTouch(index, params)

end

function CountryBossMeetingLayout:_onEventEnter()
	self:updateUI()
end


return CountryBossMeetingLayout
