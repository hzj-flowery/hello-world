-- 暴动援助界面
local PopupBase = require("app.ui.PopupBase")
local PopupTerritoryRiotHelp = class("PopupTerritoryRiotHelp", PopupBase)
local Path = require("app.utils.Path")
local PopupTerritoryRiotHelpCell = require("app.scene.view.territory.PopupTerritoryRiotHelpCell")
local TerritoryConst = require("app.const.TerritoryConst")
local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")
local UIHelper = require("yoka.utils.UIHelper")


function PopupTerritoryRiotHelp:ctor()
	--
	self._title = Lang.get("lang_territory_riot_help_title")
    self._listViewItem = nil
	self._textTitle =nil
    self._btnClose = nil
	self._labelMaxRank = nil --历史最高排名
	--
	self._riotInfos = {}
	self._repressCount =  G_UserData:getTerritory():getRepressCount()
	self._riotInfos = G_UserData:getTerritory():getFriendsRiotInfo()


	local resource = {
		file = Path.getCSB("PopupTerritoryRiotHelp", "territory"),
		binding = {

		}
	}
	PopupTerritoryRiotHelp.super.ctor(self, resource, true)
end

--
function PopupTerritoryRiotHelp:onCreate()
    self._commonNodeBk:setTitle(self._title)
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._imageNoTimes:setVisible(false)

end

function PopupTerritoryRiotHelp:_updateListView()
	local listView = self._listViewItem
	listView:clearAll()
	listView:setTemplate(PopupTerritoryRiotHelpCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))
	listView:resize(#self._riotInfos)
	if #self._riotInfos == 0 then
		self._imageNoTimes:setVisible(true)
	else
		self._imageNoTimes:setVisible(false)
	end
	self:_updateRepressRiotNum()

end


--[[

	message C2S_TerritoryHelpRepressRiot {
	optional uint64 friend_id = 1;
	optional string friend_uuid = 2;
	optional uint64 friend_sid = 3;
	optional uint32 territory_id = 4;
	optional uint32 event_id = 5;
}

message S2C_TerritoryHelpRepressRiot {
	optional uint32 ret = 1;
	optional uint64 friend_id = 2;
	optional uint32 territory_id = 3;
	optional uint32 event_id = 4;
	repeated Award awards = 5;
}


]]
function PopupTerritoryRiotHelp:_onItemTouch(index, riotEvent)

	assert(riotEvent, "PopupTerritoryRiotHelp:_onItemTouch, riotEvent is null")

	dump(riotEvent)

	local eventId  = riotEvent.event.info_id
	local eventCfg = TerritoryHelper.getRiotInfo(eventId)

	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	if LogicCheckHelper.enoughValue(eventCfg.consume_type,eventCfg.consume_value,eventCfg.consume_size) == false then
		return
	end

	local helpNumber = tonumber(TerritoryHelper.getTerritoryParameter("help_number"))
	local lessNumber = helpNumber - self._repressCount
	if lessNumber <= 0 then
		G_Prompt:showTip(Lang.get("lang_territory_error1"))
		return
	end


	local messageTable = {
		territory_id = riotEvent.territory_id,
		event_id = riotEvent.event.id,
		friend_id = riotEvent.user_id,
		friend_uuid = riotEvent.uuid,
		friend_sid = riotEvent.sid,
	}

	G_UserData:getTerritory():c2sTerritoryHelpRepressRiot(messageTable)


	
	--重新拉去军团驻地信息
	--G_NetworkManager:send(MessageIDConst.ID_C2S_GetTerritory, {})

end


function PopupTerritoryRiotHelp:_startRefreshHandler()
	self:_endRefreshHandler()

	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return 
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),3)
end

function PopupTerritoryRiotHelp:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end


function PopupTerritoryRiotHelp:_onRefreshTick()
	--领地数据更新太快了
	--G_UserData:getTerritory():c2sGetTerritoryForHelp()
end


function PopupTerritoryRiotHelp:_onItemUpdate(item, index)
	if self._riotInfos[ index + 1 ]  then
		item:updateUI(index, self._riotInfos[ index + 1 ] )
	end
end

function PopupTerritoryRiotHelp:_onItemSelected(item, index)

end


--
function PopupTerritoryRiotHelp:onEnter()
	self._signalTerritoryForHelp =  G_SignalManager:add(SignalConst.EVENT_TERRITORY_GET_FORHELP, 		handler(self,self._onEventTerritoryForHelp))
	self._signalTerritoryRiot    =  G_SignalManager:add(SignalConst.EVENT_TERRITORY_HELP_REPRESS_RIOT,  handler(self,self._onEventTerritoryRepressRiot))

	--G_UserData:getTerritory():c2sGetTerritoryForHelp()

	self:_startRefreshHandler()

	self:_onUpdateHelpInfo()
	self:_updateListView()
end

function PopupTerritoryRiotHelp:onExit()

	
	self:_endRefreshHandler()

	self._signalTerritoryForHelp:remove()
	self._signalTerritoryForHelp = nil

	self._signalTerritoryRiot:remove()
	self._signalTerritoryRiot = nil

end

--
function PopupTerritoryRiotHelp:onBtnCancel()
	self:close()
end

function PopupTerritoryRiotHelp:_onEventTerritoryUpdate(id, message)
	if message.ret ~= 1 then
		return
	end

	self:_updateListView()
end

function PopupTerritoryRiotHelp:_updateRepressRiotNum()
	local helpNumber = tonumber(TerritoryHelper.getTerritoryParameter("help_number"))
	local lessNumber = helpNumber - self._repressCount

	self._nodeProcess:removeAllChildren()

	local richTextColor1 = Colors.BRIGHT_BG_ONE
	local richTextColor2 = Colors.BRIGHT_BG_ONE


	local richText = Lang.get("lang_territory_riot_repress_count", {
		num = lessNumber,
		color1 =  Colors.colorToNumber(richTextColor1),
		color2 =  Colors.colorToNumber(richTextColor2),
		max = helpNumber,
	})

	--dump(richText)
	local richWidget = ccui.RichText:create()
	richWidget:setRichTextWithJson(richText)
	richWidget:setAnchorPoint(cc.p(0,0.5))
	self._nodeProcess:addChild(richWidget)
	self._nodeProcess:setVisible(true)
end

function PopupTerritoryRiotHelp:_onEventTerritoryRepressRiot(id, message)
	if message.ret ~= 1 then
		return
	end

	--G_UserData:getTerritory():c2sGetTerritoryForHelp()

	local battleReport = rawget( message, "battle_report")
	if battleReport then
		local ReportParser = require("app.fight.report.ReportParser")
		local reportData = ReportParser.parse(battleReport)
		local battleData = require("app.utils.BattleDataHelper").parseTerritoryBattleData(message, 1)
		G_SceneManager:showScene("fight", reportData, battleData)
	end

end

--[[
	required uint32 id = 1;      //自增ID
	required uint32 time = 2;    //发生时间
	required uint32 info_id = 3; //事件ID
	required uint32 event_type = 4; //事件类型
	optional bool is_repress = 5;   //是否已经镇压
	optional bool for_help = 6;   //是否已求助
	optional string fname = 7;   //镇压好友名字
	repeated Award awards = 8;   //事件奖励
]]

function PopupTerritoryRiotHelp:_onUpdateHelpInfo()
	self._repressCount =  G_UserData:getTerritory():getRepressCount()
	self._riotInfos = G_UserData:getTerritory():getFriendsRiotInfo()
end

function PopupTerritoryRiotHelp:_onEventTerritoryForHelp(id, message)
	self:_onUpdateHelpInfo()
	self:_updateListView()
end

return PopupTerritoryRiotHelp
