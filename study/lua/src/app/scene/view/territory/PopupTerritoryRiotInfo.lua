local PopupBase = require("app.ui.PopupBase")
local PopupTerritoryRiotInfo = class("PopupTerritoryRiotInfo", PopupBase)
local Path = require("app.utils.Path")
local PopupTerritoryRiotInfoCell = require("app.scene.view.territory.PopupTerritoryRiotInfoCell")
local TerritoryConst = require("app.const.TerritoryConst")
local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")

local UIHelper = require("yoka.utils.UIHelper")
function PopupTerritoryRiotInfo:ctor()
	--
	self._title = Lang.get("lang_territory_riot_title")
    self._listViewItem = nil
	self._textTitle =nil
	self._textTitleDesc = nil
    self._btnClose = nil
	self._labelMaxRank = nil --历史最高排名
	--

	self._riotInfos = {}
	local resource = {
		file = Path.getCSB("PopupTerritoryRiotInfo", "territory"),
		binding = {

		}
	}
	PopupTerritoryRiotInfo.super.ctor(self, resource, true)
end

--
function PopupTerritoryRiotInfo:onCreate()
    self._commonNodeBk:setTitle(self._title)
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._imageNoTimes:setVisible(false)

	self._textTitleDesc:setString(TerritoryHelper.getTerritoryParameter("time_display"))
	self:_updateListView()
end

function PopupTerritoryRiotInfo:_updateListView()

	--local lineCount = #self._awardList
	local listView = self._listViewItem
	listView:clearAll()
	listView:setTemplate(PopupTerritoryRiotInfoCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))


	self._riotInfos = G_UserData:getTerritory():getAllRiotEvents()
	--dump(self._riotInfos)
	if #self._riotInfos == 0 then
		self._imageNoTimes:setVisible(true)
	else
		self._imageNoTimes:setVisible(false)
	end
	listView:resize(#self._riotInfos)

	self:_updateRiotProcess()
end

function PopupTerritoryRiotInfo:_onItemTouch(index, stateIndex, riotEvent)
	assert(stateIndex, "PopupTerritoryRiotInfo:_onItemTouch, awardId is null")
	if stateIndex and stateIndex > 0 and riotEvent then
		if stateIndex == TerritoryConst.RIOT_HELP then
			local territoryId = riotEvent.territory_id

			local isInGuild = G_UserData:getGuild():isInGuild()
			if isInGuild == false then
				G_Prompt:showTip(Lang.get("auction_no_guild"))
				return
			end

			G_UserData:getTerritory():c2sTerritoryForHelp(territoryId, riotEvent.id)
		end

		if stateIndex == TerritoryConst.RIOT_TAKE then
			local territoryId = riotEvent.territory_id

			G_UserData:getTerritory():c2sGetTerritoryRiotAward(territoryId, riotEvent.id)
		end

	--	G_NetworkManager:send(MessageIDConst.ID_C2S_GetArenaRankReward, {reward_id = awardId})
	end
end



function PopupTerritoryRiotInfo:_onItemUpdate(item, index)
	if self._riotInfos[ index + 1 ]  then
		item:updateUI(index, self._riotInfos[ index + 1 ] )
	end
end

function PopupTerritoryRiotInfo:_onItemSelected(item, index)

end

function PopupTerritoryRiotInfo:onEnter()
    self._getRiotHelper =  G_SignalManager:add(SignalConst.EVENT_TERRITORY_FORHELP, handler(self,self._onGetRiotHelper))
	self._getRiotAward =  G_SignalManager:add(SignalConst.EVENT_TERRITORY_GET_RIOT_AWARD, handler(self,self._onGetRiotAward))
end

function PopupTerritoryRiotInfo:onExit()
	self._getRiotHelper:remove()
	self._getRiotHelper = nil
	self._getRiotAward:remove()
	self._getRiotAward = nil
end

--
function PopupTerritoryRiotInfo:onBtnCancel()
	self:close()
end

function PopupTerritoryRiotInfo:_updateRiotProcess()
	self._nodeProcess:removeAllChildren()
    if #self._riotInfos <= 0 then
        self._image_2:setPositionX(200)
        self._textTitleDesc:setPositionX(220)
		return
	end

	local totalCount = #self._riotInfos
	local finishState = 0
	for i, event in ipairs(self._riotInfos) do
		local state = TerritoryHelper.getRiotEventState(event)
		if state  == TerritoryConst.RIOT_TAKEN then
			finishState = finishState + 1
		end
	end

	local richTextColor1 = Colors.BRIGHT_BG_RED
	if finishState >= totalCount then
		richTextColor1 = Colors.BRIGHT_BG_GREEN
	else
		richTextColor1 = Colors.BRIGHT_BG_RED
	end

	local richTextColor2 = Colors.BRIGHT_BG_ONE
	if finishState >= totalCount then
		richTextColor2 = Colors.BRIGHT_BG_GREEN
	end


	local richText = Lang.get("lang_territory_riot_process", {
		num = finishState,
		color1 =  Colors.colorToNumber(richTextColor1),
		color2 =  Colors.colorToNumber(richTextColor2),
		max = totalCount,
	})
	local richWidget = ccui.RichText:create()
	richWidget:setRichTextWithJson(richText)
	richWidget:setAnchorPoint(cc.p(0,0.5))
	self._nodeProcess:addChild(richWidget)

	self._nodeProcess:setVisible(true)
end


function PopupTerritoryRiotInfo:_onGetRiotHelper(id, message)
	if message.ret ~= 1 then
		return
	end

	self:_updateListView()
end

function PopupTerritoryRiotInfo:_onGetRiotAward(id, message)
	if message.ret ~= 1 then
		return
	end

	self:_updateListView()
end

return PopupTerritoryRiotInfo
