--暴动援助Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupTerritoryRiotHelpCell = class("PopupTerritoryRiotHelpCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")
local TerritoryConst = require("app.const.TerritoryConst")
function PopupTerritoryRiotHelpCell:ctor()
	self._btnGetAward 		= nil     --领取
	self._imageGetAward 	= nil 	  --已经领取
	self._fileNodeCost 		= nil  	  --消耗名称
	self._commonIconPlayer	= nil
	self._textPlayerName	= nil	  --
	-----------------------

	self._intervalTime = 1.1
	local resource = {
		file = Path.getCSB("PopupTerritoryRiotHelpCell", "territory"),
	}
	PopupTerritoryRiotHelpCell.super.ctor(self, resource)
end

function PopupTerritoryRiotHelpCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._commonButton:addClickEventListenerEx(handler(self,self._onButtonClick))
end


--
--[[
	message TerritoryRiotInfo {
	 optional uint32 territory_id = 1;
	 optional TerritoryEvent event = 2;
}
message FriendTerritoryRiotInfo {
	optional uint64 user_id = 1;
	optional string uuid = 2;
	optional uint64 sid = 3;
	repeated TerritoryRiotInfo riots = 4;
}
]]

function PopupTerritoryRiotHelpCell:updateUI(index,cellValue)
	self._riotInfo = cellValue
	self:_updateCell()
end


function PopupTerritoryRiotHelpCell:_updateCell()
	local territoryId = self._riotInfo.territory_id
	local eventId 	  = self._riotInfo.event.info_id

	local territroyName = G_UserData:getTerritory():getTerritoryName(territoryId)
	local eventCfg = TerritoryHelper.getRiotInfo(eventId)
	local eventName =  eventCfg.riot_name


	self._textRiotName:setString(eventName)

	self._textRiotName:setColor(Colors.getColor(eventCfg.riot_color))
	TerritoryHelper.setTextBgByColor(self._textBg, eventCfg.riot_color)
	-- self._textRiotName:enableOutline(Colors.getColorOutline(eventCfg.riot_color), 2)

	self._commonButton:setString(Lang.get("lang_territory_riot_repress"))


	local typeItem = TypeConvertHelper.convert(tonumber(eventCfg.consume_type),
												tonumber(eventCfg.consume_value),
												tonumber(eventCfg.consume_size))

	self._fileNodeCost:updateUI(eventCfg.consume_type, eventCfg.consume_value, eventCfg.consume_size)
	self._fileNodeCost:showResName(true, Lang.get("lang_territory_patrol_cost"))


	self._fileNodeReward:setTextColorToATypeColor()
	self._fileNodeReward:updateUI(eventCfg.riot_reward_type, eventCfg.riot_reward_value, eventCfg.riot_reward_size)
	self._fileNodeReward:showResName(true, Lang.get("lang_territory_help_reward"))

	
	self._commonIconPlayer:updateIcon(self._riotInfo.playeInfo)
	
	self._commonHeadFrame:updateUI(self._riotInfo.head_frame_id,self._commonIconPlayer:getScale())
	self._commonHeadFrame:setLevel(self._riotInfo.level)
	-- self._commonIconPlayer:setLevel(self._riotInfo.level)

	self._textPlayerName:setString(self._riotInfo.name)
	self._textPlayerName:setColor(Colors.getOfficialColor(self._riotInfo.office_level))
	require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textPlayerName, self._riotInfo.office_level)
	local contentText = TerritoryHelper.getTerritoryHelpBubble()
	self._textHelpDesc:setString(contentText)

	local panelHelpChat = self:getSubNodeByName("Panel_help_chat")
	local contentSize = panelHelpChat:getContentSize()
	contentSize.width =  self._textHelpDesc:getContentSize().width + 30
	panelHelpChat:setContentSize(contentSize)

	local officialInfo = G_UserData:getBase():getOfficialInfo(self._riotInfo.office_level)

	self:updateImageView("Image_official_title", {texture = Path.getTextHero(officialInfo.picture)})
end

function PopupTerritoryRiotHelpCell:_onButtonClick(sender)


	self:dispatchCustomCallback(  self._riotInfo )
end


return PopupTerritoryRiotHelpCell
