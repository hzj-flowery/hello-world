local PopupBase = require("app.ui.PopupBase")
local PopupDailyChoose = class("PopupDailyChoose", PopupBase)

local DailyDungeon = require("app.config.daily_dungeon")
local PopupDailyChooseCell = require("app.scene.view.dailyChallenge.PopupDailyChooseCell")

function PopupDailyChoose:ctor(data)
	self._type = data.id		--打副本类型
	self._name = data.name 		--副本名字
	self._data = G_UserData:getDailyDungeonData()	--数据层
	self._data:setNowType(self._type)
	self._maxId = self._data:getMaxIdByType(self._type)		--这个类型打到最远的副本
	self._firstEnterId = self._data:getFirstEnter(type)		--这个类型副本第一次进入
	self._idList = self:_getStageIds()		--本类型的副本列表
	self._cellList	= {}					--节点的数组
	-- self._listChoose = nil					--选择listview
	-- self._textLeftCount = nil				--今日剩余xxx

	--ui
	self._panelBase = nil		--底板
	self._textCount = nil		--剩余次数
	self._listChoose = nil		--选择list

	--监听
	self._singalFirstrEnterDaily = nil		--初次进入监听
	self._singalExecute = nil				--攻打副本

	local resource = {
		file = Path.getCSB("PopupDailyChoose", "dailyChallenge"),
		binding = {
		}
	}
	self:setName("PopupDailyChoose")
	PopupDailyChoose.super.ctor(self, resource)
end

function PopupDailyChoose:onCreate()
	self._panelBase:addCloseEventListener(handler(self, self._onCloseClick))
	self._panelBase:setTitle(self._name)
	local remainCount = self._data:getRemainCount(self._type)
	self._textCount:setString(remainCount)
end

function PopupDailyChoose:onEnter()
    self._singalFirstrEnterDaily = G_SignalManager:add(SignalConst.EVENT_DAILY_DUNGEON_FIRSTENTER , handler(self, self._onEventFirstEnter))
	self._singalExecute = G_SignalManager:add(SignalConst.EVENT_DAILY_DUNGEON_EXECUTE , handler(self, self._onEventExecute))
	self._signalCommonZeroNotice = G_SignalManager:add(SignalConst.EVENT_COMMON_ZERO_NOTICE, handler(self, self._onEventCommonZeroNotice))
	self._signalDailyDungeonEnter = G_SignalManager:add(SignalConst.EVENT_DAILY_DUNGEON_ENTER, handler(self,self._onEventDailyDungeonEnter))

	self:_refreshCount()
	self:_refreshChooseList()
	self:_checkFirstEnter()

	
    --抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname) 	
end

function PopupDailyChoose:onExit()
	self._singalFirstrEnterDaily:remove()
	self._singalFirstrEnterDaily = nil
	self._singalExecute:remove()
	self._singalExecute = nil
	self._signalCommonZeroNotice:remove()
	self._signalCommonZeroNotice = nil
    self._signalDailyDungeonEnter:remove()
    self._signalDailyDungeonEnter  = nil
end

--刷新次数
function PopupDailyChoose:_refreshCount()
	local remainCount = self._data:getRemainCount(self._type)
	self._textCount:setString(remainCount)
end

--检查第一次进入
function PopupDailyChoose:_checkFirstEnter()
	self._maxId = self._data:getMaxIdByType(self._type)		--开放的最大关卡
	local nextId = self:_getNextId(self._maxId)
	if not nextId then
		return
	end
	-- --是否需要发送第一次进入
	local myLevel = G_UserData:getBase():getLevel()
	if myLevel >= DailyDungeon.get(nextId).level and self._data:getFirstEnter(self._type) < nextId then
		self._data:c2sFirstEnterDailyDungeon(nextId)
	end
end

--刷新listview
function PopupDailyChoose:_refreshChooseList()
	local openIdx = 0
	for idx, val in pairs(self._idList) do
		if not self._cellList[idx] then
			local info = DailyDungeon.get(val)
			local cell = PopupDailyChooseCell.new(idx)
			cell:refreshData(info)
			self._listChoose:pushBackCustomItem(cell)
			self._cellList[idx] = cell
		else
			self._cellList[idx]:refreshData()
		end
		if self._cellList[idx]:isOpen() then
			openIdx = idx - 1

		end
	end
	if #self._cellList - openIdx < 4 then
		self._listChoose:jumpToRight()
	elseif openIdx < 2 then
		self._listChoose:jumpToLeft()
	else
		self._listChoose:jumpToItem(openIdx, cc.p(0.5, 0), cc.p(0.5, 0))
	end 
end

--关闭按钮
function PopupDailyChoose:_onCloseClick()
    self:closeWithAction()
end

--获取指定类型的顺序副本
function PopupDailyChoose:_getStageIds()
	local ids = {}
	local DailyDungeonCount = DailyDungeon.length()
	for i = 1, DailyDungeonCount do
		local info = DailyDungeon.indexOf(i)
		if info.type == self._type then
			table.insert(ids, info.id)
		end
	end
    table.sort(ids, function(a, b) return a < b end)
	return ids
end

--根据id获得下一关id
function PopupDailyChoose:_getNextId(id)
	for _, val in pairs(self._idList) do
		local info = DailyDungeon.get(val)
		if info.pre_id == id then
			return info.id
		end
	end
end

--第一次进入消息监听
function PopupDailyChoose:_onEventFirstEnter(eventName, enterId)
	-- G_Prompt:showTip("第"..tostring(enterId).."已经开启")	--之后换特效	
	for i, v in pairs(self._cellList) do
		if v:getDungeonId() == enterId then
			v:playOpenEft()
			break
		end
 	end
end

--攻打消息
function PopupDailyChoose:_onEventExecute(eventName, message)
	local fightId = message.id
	local opType = message.op_type
	local configData = DailyDungeon.get(fightId)

	local DailyDungeonConst = require("app.const.DailyDungeonConst")
	if opType == DailyDungeonConst.OP_TYPE_SWEEP then
		self:_refreshCount()
		self:_refreshChooseList()

		local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		PopupGetRewards:showRewards(message.awards)
		return 
	end

    local ReportParser = require("app.fight.report.ReportParser")
    local reportData = ReportParser.parse(message.battle_report )
    local BattleDataHelper = require("app.utils.BattleDataHelper")
    local battleData = BattleDataHelper.parseChallengeDailyData(message, configData)
    
    G_SceneManager:showScene("fight", reportData, battleData)	
end

function PopupDailyChoose:_onEventCommonZeroNotice(event,hour)
    G_UserData:getDailyDungeonData():pullData()
end

function PopupDailyChoose:_onEventDailyDungeonEnter(event)
    self:_refreshCount()
	self:_refreshChooseList()

end


return PopupDailyChoose