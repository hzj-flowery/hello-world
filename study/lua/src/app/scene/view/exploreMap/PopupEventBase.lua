local PopupBase = require("app.ui.PopupBase")
local PopupEventBase = class("PopupEventBase", PopupBase)

local BattleDataHelper = require("app.utils.BattleDataHelper")
local ExploreConst = require("app.const.ExploreConst")

PopupEventBase.TYPE_PANEL_TABLE =
{
	[ExploreConst.EVENT_TYPE_ANSWER] = "EventAnswerNode",		--答题
	[ExploreConst.EVENT_TYPE_HERO] = "EventHeroNode",			--慕名而来
	[ExploreConst.EVENT_TYPE_HALP_PRICE] = "EventHalfPriceNode",	--半价物资
	[ExploreConst.EVENT_TYPE_REBEL] = "EventRebelNode",		--洛阳之乱
	[ExploreConst.EVENT_TYPE_REBEL_BOSS] = "EventRebelBossNode",	--董卓之乱
	[ExploreConst.EVENT_TYPE_BOX] = "EventBoxNode",			--开宝箱
}

function PopupEventBase:ctor(callback, eventType)
	self._icons = {}		--左侧事件列表
	self._eventList = {}		--未处理事件列表
	self._openIndex = 1		--打开的顺序
	self._eventNode = nil
	self._callback = callback
	self._eventType = eventType

	--ui
	self._nodeBG = nil		--通用节点
	self._nodeEventPanel = nil	--事件节点

	--signal
	self._signalDoEvent = nil

	local resource = {
		file = Path.getCSB("PopupEventBase", "exploreMap"),
		binding = {
		}
	}
	self:setName("PopupEventBase")
	PopupEventBase.super.ctor(self, resource)
end

function PopupEventBase:onCreate()
	local events = G_UserData:getExplore():getUnFinishEvents()
	for i, v in pairs(events) do
		if self._eventType then
			if self._eventType == v:getEvent_type() then
				table.insert(self._eventList, v)
			end
		else
			table.insert(self._eventList, v)
		end
	end
	table.sort(self._eventList, function(a, b)
		return a:getEndTime() > b:getEndTime()
	end)

	self._nodeBG:setTitle(Lang.get("explore_event_title"))
	self._nodeBG:addCloseEventListener(function() self:closeWithAction() end)

	local count = 1
    for i, v in pairs(self._eventList) do
		local eventCell = require("app.scene.view.exploreMap.ExploreEventCell").new(v, count, handler(self, self._onPanelClick))
		self._listEventIcon:pushBackCustomItem(eventCell)
		table.insert(self._icons, eventCell)
		count = count + 1
    end
end

function PopupEventBase:onEnter()
	if self._openIndex == 1 then
		self:_openFirstEvent()
	end

	self._signalDoEvent = G_SignalManager:add(SignalConst.EVENT_EXPLORE_DO_EVENT, handler(self, self._onEventDoEvent))
end

function PopupEventBase:onClose()
	if self._callback then
		self._callback(self._eventType)
	end


end

function PopupEventBase:onExit()
	self._signalDoEvent:remove()
	self._signalDoEvent = nil
end

--事件面板
function PopupEventBase:_openEventNode(eventData)
	local eventType = eventData:getEvent_type()
	if self._eventNode then
		self._eventNode:removeFromParent()
		self._eventNode = nil
	end
	self._eventNode = require("app.scene.view.exploreMap."..PopupEventBase.TYPE_PANEL_TABLE[eventType]).new(eventData)
	self._nodeEventPanel:addChild(self._eventNode)
end

--点击事件
function PopupEventBase:_onPanelClick(pos)
	for i, v in pairs(self._icons) do
		v:setChoose(false)
	end
	self._icons[pos]:setChoose(true)
	self._openIndex = pos
	local eventData = self._eventList[pos]
	self:_openEventNode(eventData)
end

--收到处理event消息
function PopupEventBase:_onEventDoEvent(eventName, message)
	local eventData = G_UserData:getExplore():getEventById(message.id)
	local eventType = eventData:getEvent_type()
	if eventType == ExploreConst.EVENT_TYPE_REBEL then
		if rawget(message, "battle_report") then
			local ReportParser = require("app.fight.report.ReportParser")
			local reportData = ReportParser.parse( message.battle_report )
			local BattleDataHelper = require("app.utils.BattleDataHelper")
			local battleData = BattleDataHelper.parseExploreRebelBattleData(message, self._eventNode:getBackground())
			G_SceneManager:showScene("fight", reportData, battleData)
			if reportData:isWin() then
				self._eventNode:doEvent()
			end
		end
	elseif eventType == ExploreConst.EVENT_TYPE_REBEL_BOSS then
		if rawget(message, "battle_report") then
			local ReportParser = require("app.fight.report.ReportParser")
			local reportData = ReportParser.parse( message.battle_report )
			local BattleDataHelper = require("app.utils.BattleDataHelper")
			local battleData = BattleDataHelper.parseExploreBossBattleData(message, self._eventNode:getBackground())
			G_SceneManager:showScene("fight", reportData, battleData)
			if reportData:isWin() then
				self._eventNode:doEvent()
			end
		end
	elseif eventType == ExploreConst.EVENT_TYPE_ANSWER then
		self._eventNode:doEvent(message)
	else
		local awards = rawget(message, "awards")
		if awards then
			G_Prompt:showAwards(awards)
			-- local PopupGetRewards = require("app.ui.PopupGetRewards").new()
			-- PopupGetRewards:showRewards(rewards)

			self._eventNode:doEvent()
		end
	end
end

--打开最上面的一个事件
function PopupEventBase:_openFirstEvent()
	for i, v in pairs(self._icons) do
		v:setChoose(false)
	end
	if self._icons[1] then
		self._icons[1]:setChoose(true)
		self:_openEventNode(self._eventList[1])
	end
end

return PopupEventBase
